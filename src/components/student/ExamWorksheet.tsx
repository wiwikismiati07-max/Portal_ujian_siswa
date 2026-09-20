import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Clock,
  AlertTriangle,
  Send,
  Flag,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Award,
  CheckCircle,
  BookOpen,
  CheckSquare,
  Check,
  RotateCcw,
  Shield,
  Lock,
  ZoomIn,
  ZoomOut,
  X,
  Eye,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Exam, Question, User, ExamSubmission } from '../../types';
import { gradeSubmission } from '../../utils/examGrader';

interface ExamWorksheetProps {
  exam: Exam;
  questions: Question[];
  student: User;
  onFinishExam: (submission: ExamSubmission) => void;
  onExitToDashboard: () => void;
}

export const ExamWorksheet: React.FC<ExamWorksheetProps> = ({
  exam,
  questions,
  student,
  onFinishExam,
  onExitToDashboard
}) => {
  // Navigation & Answers state
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(exam.durationMinutes * 60);
  const [startedAt] = useState<string>(new Date().toISOString());

  // CBT Safe Exam Lockdown state (Automatic lock on mount)
  const [isLockdownStarted, setIsLockdownStarted] = useState(true);
  const [violationCount, setViolationCount] = useState(0);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [violationReason, setViolationReason] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<ExamSubmission | null>(null);

  // In-exam Image Lightbox (safely view images without opening new tabs)
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);
  const [imageScale, setImageScale] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const lastViolationTimeRef = useRef<number>(0);
  const currentQ = questions[currentIndex];

  // Synthesize warning beep via Web Audio API
  const playWarningBeep = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.28);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  }, []);

  const enterFullscreen = useCallback(() => {
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else if ((document.documentElement as any).webkitRequestFullscreen) {
        (document.documentElement as any).webkitRequestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } catch {
      setIsFullscreen(true);
    }
  }, []);

  // Auto-request fullscreen & screen lock immediately on mount
  useEffect(() => {
    enterFullscreen();
    try {
      if ('wakeLock' in navigator && (navigator as any).wakeLock) {
        (navigator as any).wakeLock.request('screen').catch(() => {});
      }
    } catch {}
  }, [enterFullscreen]);

  // Timer countdown
  useEffect(() => {
    if (!isLockdownStarted || submittedResult) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleForceSubmit('Waktu Ujian Telah Habis! Sistem otomatis mengumpulkan lembar jawaban Anda.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLockdownStarted, submittedResult]);

  // Anti-cheat event listeners (Lockdown mode)
  useEffect(() => {
    if (!isLockdownStarted || submittedResult) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation('Anda terdeteksi beralih tab browser, meminimalkan layar, atau membuka aplikasi lain.');
      }
    };

    const handleWindowBlur = () => {
      triggerViolation('Fokus layar ujian terputus! Dilarang membuka aplikasi lain, kalkulator, catatan, atau jendela sekunder.');
    };

    const handleFullscreenChange = () => {
      const fs = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(fs);
      if (!fs && !submittedResult) {
        triggerViolation('Layar ujian keluar dari mode Layar Penuh (Fullscreen). Layar wajib dikunci kembali untuk melanjutkan.');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      // Block all navigation shortcuts, function keys, devtools, new tab, window switch, copy/paste
      if (
        e.altKey ||
        e.metaKey ||
        e.key === 'Tab' ||
        e.key.startsWith('F') ||
        e.key === 'Escape' ||
        e.key === 'PrintScreen' ||
        (e.ctrlKey && ['t', 'n', 'w', 'j', 'u', 'r', 'h', 'p', 's', 'c', 'v', 'x', 'a', 'f', 'b', 'd', 'e', 'k', 'o', 'l', 'q'].includes(key))
      ) {
        e.preventDefault();
        e.stopPropagation();
        triggerViolation(`Penggunaan tombol atau pintasan '${e.key}' diblokir selama ujian terkunci.`);
        return false;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerViolation('Klik kanan dinonaktifkan untuk menjaga keamanan dan kerahasiaan lembar soal.');
    };

    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerViolation('Operasi Salin (Copy) & Tempel (Paste) diblokir selama ujian.');
    };

    const handleSelectStart = (e: Event) => {
      e.preventDefault();
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Ujian sedang berlangsung! Jangan keluar sebelum mengumpulkan lembar jawaban.';
      return e.returnValue;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('cut', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    document.addEventListener('selectstart', handleSelectStart);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('cut', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('selectstart', handleSelectStart);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isLockdownStarted, submittedResult]);

  const triggerViolation = (reason: string) => {
    const now = Date.now();
    if (now - lastViolationTimeRef.current < 1200) return;
    lastViolationTimeRef.current = now;

    playWarningBeep();
    setViolationReason(reason);
    setShowViolationModal(true);

    setViolationCount(prev => {
      const updated = prev + 1;
      // Auto-submit if violation reaches 3 (strict limit)
      if (updated >= 3) {
        setTimeout(() => {
          handleForceSubmit('Batas toleransi pelanggaran lockdown terlampaui (3 kali beralih jendela/aplikasi). Ujian otomatis dihentikan dan dikumpulkan ke pengawas.');
        }, 1200);
      }
      return updated;
    });
  };

  const handleForceSubmit = (msg?: string) => {
    if (submittedResult) return;
    setShowViolationModal(false);
    setShowFinishConfirm(false);
    const result = gradeSubmission(exam, questions, student, answers, violationCount, startedAt);
    setSubmittedResult(result);
    onFinishExam(result);
  };

  const handleManualSubmit = () => {
    handleForceSubmit();
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {}
  };

  const handleExitToHome = () => {
    try {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen().catch(() => {});
      }
    } catch {}
    onExitToDashboard();
  };

  // Answer handler
  const setAnswerForCurrent = (value: any) => {
    if (!currentQ) return;
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: value
    }));
  };

  // Toggle flag (ragu-ragu)
  const toggleFlagCurrent = () => {
    if (!currentQ) return;
    setFlagged(prev => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id]
    }));
  };

  // Format time
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Helper check if answered
  const isQuestionAnswered = (q: Question) => {
    const ans = answers[q.id];
    if (ans === undefined || ans === null) return false;
    if (q.type === 'single_choice') return typeof ans === 'number';
    if (q.type === 'multiple_choice') return Array.isArray(ans) && ans.length > 0;
    if (q.type === 'true_false') return typeof ans === 'object' && Object.keys(ans).length === (q.trueFalseItems?.length || 0);
    if (q.type === 'matching') return typeof ans === 'object' && Object.keys(ans).length === (q.matchingPairs?.length || 0);
    if (q.type === 'case_study') return typeof ans === 'string' && ans.trim().length > 0;
    return false;
  };

  const answeredCount = questions.filter(isQuestionAnswered).length;
  const unansweredCount = questions.length - answeredCount;

  // POST-EXAM RESULT SCREEN (Displayed ONLY after exam is submitted)
  if (submittedResult) {
    return (
      <div className="fixed inset-0 z-[99999] w-screen h-screen overflow-y-auto bg-slate-900 py-8 px-4 sm:px-6 flex flex-col items-center justify-center animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-center p-6 sm:p-10 max-w-3xl w-full">
          
          <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-5">
            <Award className="w-10 h-10" />
          </div>

          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200 mb-2">
            <CheckCircle className="w-3.5 h-3.5" /> Ujian Selesai & Disimpan
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Lembar Jawaban Berhasil Dikumpulkan
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
            Terima kasih telah mengerjakan ujian dengan tertib dan jujur. Kunci layar kini telah dibuka kembali.
          </p>

          {/* Score Card */}
          <div className="my-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 block mb-1">Skor Diperoleh</span>
              <span className="text-3xl font-extrabold text-indigo-600">
                {submittedResult.earnedScore} <span className="text-sm font-medium text-slate-400">/ {submittedResult.totalScore}</span>
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 block mb-1">Persentase Nilai</span>
              <span className={`text-3xl font-extrabold ${submittedResult.percentage >= (exam.passingScore || 75) ? 'text-emerald-600' : 'text-amber-600'}`}>
                {submittedResult.percentage}%
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 block mb-1">Keterangan</span>
              <span className={`inline-block mt-1 px-3 py-1 rounded-xl text-xs font-bold ${
                submittedResult.passed
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {submittedResult.passed ? 'TUNTAS (LULUS)' : 'REMEDIAL'}
              </span>
            </div>
          </div>

          {/* Integrity Note */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs text-slate-600 max-w-xl mx-auto mb-8 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Nama Siswa:</span>
              <span className="font-medium">{student.name} ({student.classGroup})</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Mata Pelajaran:</span>
              <span className="font-medium">{exam.subjectName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Catatan Pelanggaran Layar:</span>
              <span className={`font-bold ${submittedResult.violationCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {submittedResult.violationCount === 0 ? '0 (Sempurna / Disiplin)' : `${submittedResult.violationCount} kali tercatat`}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExitToHome}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Kembali ke Beranda Siswa</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[99990] w-screen h-screen overflow-y-auto bg-slate-100 flex flex-col select-none relative"
    >
      {/* MANDATORY FULLSCREEN LOCK ENFORCEMENT OVERLAY */}
      {!isFullscreen && !submittedResult && (
        <div className="fixed inset-0 z-[999999] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-6 text-center text-white animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-4 animate-pulse">
              <Lock className="w-8 h-8" />
            </div>

            <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2">
              Sistem CBT Terkunci Otomatis
            </span>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
              Layar Penuh Wajib Diaktifkan
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
              Untuk mencegah pembukaan aplikasi lain (browser, catatan, kalkulator, atau split-screen), lembar soal berada di layar terdepan dan hanya dapat dikerjakan dalam mode <strong className="text-white">Layar Penuh Terkunci</strong>.
            </p>

            <button
              type="button"
              onClick={enterFullscreen}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Maximize2 className="w-5 h-5" />
              <span>KUNCI LAYAR CBT & KERJAKAN SOAL SEKARANG</span>
            </button>
          </div>
        </div>
      )}

      {/* Lockdown Status Banner */}
      <div className="bg-slate-900 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 shadow-md z-30 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="font-bold flex items-center gap-1.5 text-amber-300">
            <Lock className="w-3.5 h-3.5" />
            LOCKDOWN AKTIF
          </span>
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="hidden sm:inline text-slate-300 font-medium truncate max-w-md">
            {exam.title}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-slate-300">
            <span className="text-slate-400">Pelanggaran:</span>
            <span className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
              violationCount > 0 ? 'bg-rose-500/30 text-rose-300' : 'bg-slate-800 text-slate-300'
            }`}>
              {violationCount} / 3
            </span>
          </div>

          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono font-bold text-sm ${
            timeLeftSeconds < 300 ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-800 text-amber-300'
          }`}>
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeLeftSeconds)}</span>
          </div>

          {!isFullscreen && (
            <button
              type="button"
              onClick={enterFullscreen}
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Maximize2 className="w-3 h-3" /> Kunci Fullscreen
            </button>
          )}
        </div>
      </div>

      {/* Main Examination Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left / Center: Active Question Sheet (8 cols) */}
        <div className="lg:col-span-8 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Question Header */}
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-indigo-600 text-white font-bold text-sm rounded-lg shadow-xs">
                Soal Nomor {currentIndex + 1}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-200/80 text-slate-700 uppercase tracking-wide">
                {currentQ.type.replace('_', ' ')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">
                Bobot: <span className="text-indigo-600">{currentQ.points} Poin</span>
              </span>
              <button
                type="button"
                onClick={toggleFlagCurrent}
                className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  flagged[currentQ.id]
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ragu-ragu</span>
              </button>
            </div>
          </div>

          {/* Question Body with specific question-type layouts */}
          <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
            
            {/* Case study stimulus banner if applicable */}
            {currentQ.caseContext && (
              <div className="mb-6 p-4 bg-amber-50/80 rounded-2xl border border-amber-200">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wide mb-2">
                  <BookOpen className="w-4 h-4 text-amber-700" />
                  Wacana / Skenario Studi Kasus
                </div>
                <p className="text-xs sm:text-sm text-amber-950 font-serif leading-relaxed whitespace-pre-line">
                  {currentQ.caseContext}
                </p>
              </div>
            )}

            {/* Prompt Image with Safe In-App Lightbox */}
            {currentQ.imageUrl && (
              <div className="mb-6 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-3 max-w-xl mx-auto shadow-2xs">
                <div className="relative group cursor-pointer" onClick={() => { setZoomedImageUrl(currentQ.imageUrl || null); setImageScale(1); }}>
                  <img
                    src={currentQ.imageUrl}
                    alt="Gambar Butir Soal"
                    className="max-h-72 w-auto object-contain rounded-xl transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white text-xs font-bold gap-1.5">
                    <Eye className="w-4 h-4" /> Perbesar Gambar
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 mt-2 italic">
                  * Klik gambar untuk memperbesar secara aman di dalam lembar ujian
                </span>
              </div>
            )}

            <div
              className={`text-base sm:text-lg font-semibold text-slate-900 leading-relaxed mb-6 ${
                /[\u0600-\u06FF]/.test(currentQ.prompt) ? 'font-arabic text-xl leading-loose' : ''
              }`}
              dir={/[\u0600-\u06FF]/.test(currentQ.prompt) ? 'rtl' : 'ltr'}
            >
              {currentQ.prompt}
            </div>

            {/* TYPE 1: PILIHAN GANDA TUNGGAL */}
            {currentQ.type === 'single_choice' && currentQ.options && (
              <div className="space-y-3">
                {currentQ.options.map((option, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isSelected = answers[currentQ.id] === idx;
                  const optImg = currentQ.optionImages?.[idx];
                  const isOptArabic = /[\u0600-\u06FF]/.test(option);

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAnswerForCurrent(idx)}
                      className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50/80 border-indigo-600 text-indigo-950 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50/80 text-slate-800'
                      }`}
                    >
                      <div className="flex items-start gap-3.5 flex-1">
                        <span
                          className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs transition-colors ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {letter}
                        </span>
                        <span className={`leading-relaxed mt-0.5 ${isOptArabic ? 'font-arabic text-base' : ''}`} dir={isOptArabic ? 'rtl' : 'ltr'}>
                          {option}
                        </span>
                      </div>

                      {optImg && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setZoomedImageUrl(optImg);
                            setImageScale(1);
                          }}
                          className="sm:ml-4 shrink-0 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-1.5 self-center sm:self-start group relative"
                        >
                          <img
                            src={optImg}
                            alt={`Opsi ${letter}`}
                            className="h-20 sm:h-24 w-auto max-w-[180px] object-contain rounded-lg"
                          />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* TYPE 2: PILIHAN GANDA KOMPLEKS (Multi-select) */}
            {currentQ.type === 'multiple_choice' && currentQ.options && (
              <div className="space-y-3">
                <div className="text-xs text-indigo-700 font-semibold bg-indigo-50/80 p-2.5 rounded-lg border border-indigo-100 mb-3 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4" />
                  <span>Pilihan Ganda Kompleks: Anda dapat mencentang lebih dari satu pilihan yang benar.</span>
                </div>
                {currentQ.options.map((option, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const selectedArr: number[] = Array.isArray(answers[currentQ.id]) ? answers[currentQ.id] : [];
                  const isSelected = selectedArr.includes(idx);
                  const optImg = currentQ.optionImages?.[idx];
                  const isOptArabic = /[\u0600-\u06FF]/.test(option);

                  const toggleMulti = () => {
                    let nextArr: number[];
                    if (isSelected) {
                      nextArr = selectedArr.filter(i => i !== idx);
                    } else {
                      nextArr = [...selectedArr, idx].sort();
                    }
                    setAnswerForCurrent(nextArr);
                  };

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={toggleMulti}
                      className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50/80 border-indigo-600 text-indigo-950 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50/80 text-slate-800'
                      }`}
                    >
                      <div className="flex items-start gap-3.5 flex-1">
                        <span
                          className={`w-6 h-6 rounded-md shrink-0 flex items-center justify-center transition-colors mt-0.5 ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'border-2 border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-4 h-4" />}
                        </span>
                        <div className="flex-1">
                          <span className="font-bold text-xs text-slate-400 mr-2">[{letter}]</span>
                          <span className={`leading-relaxed ${isOptArabic ? 'font-arabic text-base' : ''}`} dir={isOptArabic ? 'rtl' : 'ltr'}>
                            {option}
                          </span>
                        </div>
                      </div>

                      {optImg && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setZoomedImageUrl(optImg);
                            setImageScale(1);
                          }}
                          className="sm:ml-4 shrink-0 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-1.5 self-center sm:self-start"
                        >
                          <img
                            src={optImg}
                            alt={`Opsi ${letter}`}
                            className="h-20 sm:h-24 w-auto max-w-[180px] object-contain rounded-lg"
                          />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* TYPE 3: SOAL BENAR / SALAH (Matrix Pernyataan) */}
            {currentQ.type === 'true_false' && currentQ.trueFalseItems && (
              <div className="space-y-4">
                <div className="text-xs text-slate-500 mb-2">
                  Pilihlah opsi <span className="font-bold text-emerald-700">BENAR</span> atau <span className="font-bold text-rose-700">SALAH</span> untuk setiap baris pernyataan di bawah ini:
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200 bg-white">
                  {currentQ.trueFalseItems.map((item, idx) => {
                    const currentTfAnswers = answers[currentQ.id] || {};
                    const selectedValue = currentTfAnswers[item.id];

                    const handleChoose = (val: boolean) => {
                      setAnswerForCurrent({
                        ...currentTfAnswers,
                        [item.id]: val
                      });
                    };

                    return (
                      <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-2.5 flex-1 text-xs sm:text-sm text-slate-800">
                          <span className="font-bold text-slate-400 shrink-0 mt-0.5">{idx + 1}.</span>
                          <span className="leading-relaxed">{item.statement}</span>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <button
                            type="button"
                            onClick={() => handleChoose(true)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              selectedValue === true
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            Benar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChoose(false)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              selectedValue === false
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                            }`}
                          >
                            Salah
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TYPE 4: SOAL MENJODOHKAN (Matching) */}
            {currentQ.type === 'matching' && currentQ.matchingPairs && (
              <div className="space-y-4">
                <div className="text-xs text-slate-500 mb-2">
                  Pilih pasangan yang tepat dari pilihan pada Kolom Kanan untuk setiap butir di Kolom Kiri:
                </div>
                <div className="space-y-3">
                  {currentQ.matchingPairs.map((pair, idx) => {
                    const currentMatchAnswers = answers[currentQ.id] || {};
                    const selectedRight = currentMatchAnswers[pair.id] || '';
                    const rightOptions = currentQ.matchingPairs?.map(p => p.right) || [];

                    return (
                      <div key={pair.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                        <div className="md:col-span-5 text-xs sm:text-sm font-semibold text-slate-800 flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span>{pair.left}</span>
                        </div>

                        <div className="md:col-span-2 flex justify-center text-slate-400">
                          <span className="text-xs font-bold uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-slate-200">
                            Dijodohkan ke:
                          </span>
                        </div>

                        <div className="md:col-span-5">
                          <select
                            value={selectedRight}
                            onChange={(e) => {
                              setAnswerForCurrent({
                                ...currentMatchAnswers,
                                [pair.id]: e.target.value
                              });
                            }}
                            className="w-full text-xs sm:text-sm p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium"
                          >
                            <option value="">-- Pilih Pasangan Jawaban --</option>
                            {rightOptions.map((opt, oIdx) => (
                              <option key={oIdx} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TYPE 5: STUDI KASUS (Analysis / Essay with live words count) */}
            {currentQ.type === 'case_study' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Tuliskan uraian analisis Anda secara terperinci:</span>
                  <span className="font-mono">
                    {typeof answers[currentQ.id] === 'string' ? answers[currentQ.id].trim().split(/\s+/).filter(Boolean).length : 0} Kata
                  </span>
                </div>
                <textarea
                  rows={6}
                  value={answers[currentQ.id] || ''}
                  onChange={(e) => setAnswerForCurrent(e.target.value)}
                  placeholder="Ketikkan argumen, analisis situasi, dan langkah solusi Anda di sini..."
                  className="w-full p-4 text-sm bg-white border border-slate-300 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none leading-relaxed"
                />
              </div>
            )}

          </div>

          {/* Bottom Question Controls */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(prev => prev - 1)}
              className="px-4 py-2 bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex(prev => prev + 1)}
                className="px-5 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowFinishConfirm(true)}
                className="px-5 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Selesai & Kumpulkan Ujian</span>
              </button>
            )}
          </div>

        </div>

        {/* Right: Question Navigation Matrix & Student Info (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Student & Exam Info Card */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center font-bold text-sm">
                {student.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {student.name}
                </h4>
                <p className="text-xs text-slate-500">
                  NIS: {student.nipOrNis || '-'} • Kelas {student.classGroup}
                </p>
              </div>
            </div>

            <div className="mt-3 text-xs space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span>Total Soal:</span>
                <span className="font-bold text-slate-900">{questions.length} Butir</span>
              </div>
              <div className="flex justify-between">
                <span>Sudah Dijawab:</span>
                <span className="font-bold text-emerald-600">{answeredCount} Soal</span>
              </div>
              <div className="flex justify-between">
                <span>Belum Dijawab:</span>
                <span className="font-bold text-rose-600">{unansweredCount} Soal</span>
              </div>
            </div>
          </div>

          {/* Navigation Matrix */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Nomor Soal
                </span>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="flex items-center gap-1 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span> Dijawab
                  </span>
                  <span className="flex items-center gap-1 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Ragu
                  </span>
                  <span className="flex items-center gap-1 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span> Kosong
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2.5">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentIndex;
                  const isAnswered = isQuestionAnswered(q);
                  const isFlagged = flagged[q.id];

                  let btnBg = 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200';
                  if (isFlagged) {
                    btnBg = 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
                  } else if (isAnswered) {
                    btnBg = 'bg-indigo-600 text-white border-indigo-700 font-bold';
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-10 rounded-xl text-xs font-bold border transition-all flex items-center justify-center cursor-pointer ${btnBg} ${
                        isCurrent ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Finish Button on Matrix */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowFinishConfirm(true)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kumpulkan Lembar Ujian</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* IN-APP LIGHTBOX IMAGE VIEWER (Keeps student safely on the exam sheet) */}
      {zoomedImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col items-center p-4">
            
            {/* Lightbox Controls Header */}
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800 text-white text-xs">
              <span className="font-semibold flex items-center gap-1.5 text-slate-300">
                <Eye className="w-4 h-4 text-indigo-400" /> Penampil Gambar Soal
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setImageScale(s => Math.max(0.5, s - 0.25))}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                  title="Perkecil"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="font-mono text-[11px] text-slate-400 px-1">{Math.round(imageScale * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setImageScale(s => Math.min(2.5, s + 0.25))}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                  title="Perbesar"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => { setZoomedImageUrl(null); setImageScale(1); }}
                  className="p-1.5 bg-rose-600/80 hover:bg-rose-600 rounded-lg text-white ml-2 transition-colors"
                  title="Tutup"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Image Canvas */}
            <div className="w-full max-h-[70vh] overflow-auto flex items-center justify-center p-4">
              <img
                src={zoomedImageUrl}
                alt="Zoomed Detail"
                style={{ transform: `scale(${imageScale})` }}
                className="max-h-[60vh] w-auto object-contain transition-transform duration-150 rounded-lg"
              />
            </div>

            <p className="text-[11px] text-slate-400 mt-2">
              Gunakan tombol pembesar untuk melihat detail gambar tanpa harus membuka tab baru.
            </p>
          </div>
        </div>
      )}

      {/* CONFIRM FINISH MODAL */}
      {showFinishConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-extrabold text-slate-900">
              Konfirmasi Pengumpulan Ujian
            </h3>

            <div className="my-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-left space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Soal Terjawab:</span>
                <span className="font-bold text-emerald-600">{answeredCount} dari {questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Soal Belum Terjawab:</span>
                <span className={`font-bold ${unansweredCount > 0 ? 'text-rose-600 font-extrabold' : 'text-slate-700'}`}>
                  {unansweredCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Waktu Tersisa:</span>
                <span className="font-mono font-bold text-slate-900">{formatTime(timeLeftSeconds)}</span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <p className="text-xs text-rose-600 font-medium mb-4">
                Peringatan: Masih ada {unansweredCount} soal yang belum Anda jawab. Apakah Anda yakin tetap ingin mengumpulkan lembar kerja ini sekarang?
              </p>
            )}

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowFinishConfirm(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Lanjutkan Mengerjakan
              </button>
              <button
                type="button"
                onClick={handleManualSubmit}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                Ya, Kumpulkan Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ANTI-CHEAT VIOLATION WARNING MODAL */}
      {showViolationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-950/80 backdrop-blur-sm animate-in zoom-in-95 duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border-2 border-rose-500 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 animate-bounce">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="flex items-center justify-center gap-1.5 mb-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-extrabold tracking-wider uppercase">
                <Volume2 className="w-3.5 h-3.5" /> Peringatan Integritas Ujian #{violationCount} / 3
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-slate-900">
              Aktivitas Tidak Diizinkan Terdeteksi!
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 my-3 leading-relaxed font-medium">
              {violationReason}
            </p>

            <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-900 font-medium text-left mb-6 space-y-1">
              <p>⚠️ Lembar kerja dilockdown untuk memastikan pengerjaan mandiri tanpa membuka aplikasi lain (browser, kalkulator, catatan, atau split-screen).</p>
              <p>Pelanggaran ini tercatat di pengawas. Jika mencapai <span className="font-bold text-rose-700">3 kali pelanggaran</span>, ujian otomatis dihentikan dan dikumpulkan paksa ke server pengawas.</p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowViolationModal(false);
                enterFullscreen();
              }}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />
              <span>Saya Mengerti & Kunci Kembali Lembar Ujian</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
