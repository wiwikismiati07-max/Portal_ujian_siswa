import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getMatchingData, getMatchingColor } from '../../utils/matchingHelper';
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
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  Lock,
  ZoomIn,
  ZoomOut,
  X,
  Eye,
  Volume2,
  Calendar,
  FileText,
  LayoutGrid,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Exam, Question, User, ExamSubmission, ViolationLog } from '../../types';
import { gradeSubmission } from '../../utils/examGrader';
import { saveSingleSubmission } from '../../utils/storage';

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
  const [startedAt] = useState<string>(() => new Date().toISOString());

  // Layout & Palette visibility
  const [showPalette, setShowPalette] = useState(true);

  // CBT Safe Exam Lockdown state (Automatic lock on mount)
  const [isLockdownStarted, setIsLockdownStarted] = useState(true);
  const [violationCount, setViolationCount] = useState(0);
  const [violationLogs, setViolationLogs] = useState<ViolationLog[]>([]);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [violationReason, setViolationReason] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showReturnPrompt, setShowReturnPrompt] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<ExamSubmission | null>(null);

  // In-exam Image Lightbox (safely view images without opening new tabs)
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);
  const [imageScale, setImageScale] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const mountTimeRef = useRef<number>(Date.now());
  const lastViolationTimeRef = useRef<number>(0);
  const violationCountRef = useRef<number>(0);
  const violationLogsRef = useRef<ViolationLog[]>([]);
  const audioCtxRef = useRef<any>(null);
  const currentQ = questions[currentIndex];

  // Keep refs in sync
  useEffect(() => {
    violationCountRef.current = violationCount;
  }, [violationCount]);

  useEffect(() => {
    violationLogsRef.current = violationLogs;
  }, [violationLogs]);

  // Initialize and unlock audio context on mobile & desktop user interaction
  const initOrResumeAudio = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
    } catch {}
  }, []);

  // Synthesize warning siren beep via Web Audio API
  const playWarningBeep = useCallback(() => {
    try {
      initOrResumeAudio();
      const ctx = audioCtxRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1150, ctx.currentTime + 0.15);
      osc.frequency.exponentialRampToValueAtTime(380, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {}
  }, [initOrResumeAudio]);

  const enterFullscreen = useCallback(() => {
    initOrResumeAudio();
    try {
      const docEl = document.documentElement as any;
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen().catch(() => {});
      } else if (docEl.mozRequestFullScreen) {
        docEl.mozRequestFullScreen().catch(() => {});
      } else if (docEl.msRequestFullscreen) {
        docEl.msRequestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } catch {
      setIsFullscreen(true);
    }

    try {
      window.focus();
    } catch {}

    try {
      if (screen.orientation && (screen.orientation as any).lock) {
        (screen.orientation as any).lock('portrait').catch(() => {});
      }
    } catch {}

    try {
      if ('wakeLock' in navigator && (navigator as any).wakeLock) {
        (navigator as any).wakeLock.request('screen').catch(() => {});
      }
    } catch {}
  }, [initOrResumeAudio]);

  // Auto-request fullscreen & screen lock immediately on mount
  useEffect(() => {
    enterFullscreen();
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

  // Mobile & Desktop Anti-cheat event listeners (Strict Lockdown mode)
  useEffect(() => {
    if (!isLockdownStarted || submittedResult) return;

    // Trap Mobile Hardware Back Button & Back Swipe Gestures
    try {
      window.history.pushState({ cbt: 'lockdown' }, '', window.location.href);
    } catch {}

    const handlePopState = () => {
      try {
        window.history.pushState({ cbt: 'lockdown' }, '', window.location.href);
      } catch {}
      setShowReturnPrompt(true);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setShowReturnPrompt(true);
      } else {
        // Re-request wakeLock and fullscreen when returning
        enterFullscreen();
      }
    };

    const handleWindowBlur = () => {
      // Tampilkan notifikasi ramah kembali menyelesaikan soal tanpa menambah penalti pelanggaran
      setShowReturnPrompt(true);
    };

    const handlePageHide = () => {
      setShowReturnPrompt(true);
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
        setShowReturnPrompt(true);
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
      triggerViolation('Klik kanan / menu konteks dinonaktifkan untuk menjaga keamanan dan kerahasiaan lembar soal.');
    };

    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerViolation('Operasi Salin (Copy) & Tempel (Paste) diblokir selama ujian.');
    };

    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target && target.tagName === 'TEXTAREA') {
        return;
      }
      e.preventDefault();
    };

    const handleTouchStart = (e: TouchEvent) => {
      initOrResumeAudio();
      // Prevent multi-touch pinch / 3-finger OS gestures
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Ujian sedang berlangsung! Jangan keluar atau menutup aplikasi sebelum lembar jawaban dikumpulkan.';
      return e.returnValue;
    };

    window.addEventListener('popstate', handlePopState);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('pagehide', handlePageHide);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('cut', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    document.addEventListener('selectstart', handleSelectStart);
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('cut', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('selectstart', handleSelectStart);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isLockdownStarted, submittedResult, initOrResumeAudio]);

  const triggerViolation = (reason: string) => {
    const now = Date.now();
    // Masa tenggang 7 detik awal saat lembar ujian baru dimuat agar dialog browser tidak menghitung pelanggaran
    if (now - mountTimeRef.current < 7000) {
      return;
    }
    if (now - lastViolationTimeRef.current < 1500) return;
    lastViolationTimeRef.current = now;

    playWarningBeep();
    setViolationReason(reason);
    setShowViolationModal(true);

    violationCountRef.current += 1;
    const currentCount = violationCountRef.current;
    const nowIso = new Date().toISOString();
    const formattedTime = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const newLog: ViolationLog = {
      id: `viol_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: nowIso,
      formattedTime,
      reason,
      violationNumber: currentCount
    };

    violationLogsRef.current = [...violationLogsRef.current, newLog];
    setViolationLogs(violationLogsRef.current);
    setViolationCount(currentCount);

    // Auto-submit immediately if violation reaches 3 (strict limit)
    if (currentCount >= 3) {
      // Calculate and save immediately so no data is lost if browser closes
      const finalResult = gradeSubmission(
        exam,
        questions,
        student,
        answers,
        currentCount,
        startedAt,
        violationLogsRef.current
      );
      saveSingleSubmission(finalResult);
      
      setTimeout(() => {
        if (!submittedResult) {
          setShowViolationModal(false);
          setShowFinishConfirm(false);
          setSubmittedResult(finalResult);
          onFinishExam(finalResult);
        }
      }, 1200);
    }
  };

  const handleForceSubmit = (msg?: string) => {
    if (submittedResult) return;
    setShowViolationModal(false);
    setShowFinishConfirm(false);

    const result = gradeSubmission(
      exam,
      questions,
      student,
      answers,
      violationCountRef.current,
      startedAt,
      violationLogsRef.current
    );

    saveSingleSubmission(result);
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
    if (q.type === 'true_false') {
      if (typeof ans === 'boolean') return true;
      return typeof ans === 'object' && Object.keys(ans).length === (q.trueFalseItems?.length || 1);
    }
    if (q.type === 'matching') {
      const mData = getMatchingData(q);
      return typeof ans === 'object' && Object.keys(ans).length === mData.premises.length;
    }
    if (q.type === 'case_study') return typeof ans === 'number';
    return false;
  };

  const answeredCount = questions.filter(isQuestionAnswered).length;
  const unansweredCount = questions.length - answeredCount;

  // POST-EXAM RESULT SCREEN (Displayed ONLY after exam is submitted)
  if (submittedResult) {
    const startObj = new Date(submittedResult.startedAt);
    const submitObj = new Date(submittedResult.submittedAt);
    const diffMs = Math.max(0, submitObj.getTime() - startObj.getTime());
    const durationMins = Math.floor(diffMs / 60000);
    const durationSecs = Math.floor((diffMs % 60000) / 1000);

    const logs = submittedResult.violationLogs || [];
    const isClean = submittedResult.violationCount === 0;

    return (
      <div className="fixed inset-0 z-[99999] w-screen h-screen overflow-y-auto bg-slate-900 py-8 px-4 sm:px-6 flex flex-col items-center justify-center animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-center p-6 sm:p-8 max-w-3xl w-full my-auto">
          
          <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
            <Award className="w-8 h-8" />
          </div>

          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200 mb-2">
            <CheckCircle className="w-3.5 h-3.5" /> Ujian Selesai & Disimpan
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Lembar Jawaban Berhasil Dikumpulkan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
            Terima kasih telah mengerjakan ujian. Rekam jejak pengerjaan dan integritas telah tercatat di sistem pengawas.
          </p>

          {/* Score Card */}
          <div className="my-6 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">Skor Diperoleh</span>
              <span className="text-2xl font-extrabold text-indigo-600">
                {submittedResult.earnedScore} <span className="text-xs font-medium text-slate-400">/ {submittedResult.totalScore}</span>
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">Persentase Nilai</span>
              <span className={`text-2xl font-extrabold ${submittedResult.percentage >= (exam.passingScore || 75) ? 'text-emerald-600' : 'text-amber-600'}`}>
                {submittedResult.percentage}%
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">Status Kelulusan</span>
              <span className={`inline-block mt-0.5 px-3 py-1 rounded-xl text-xs font-bold ${
                submittedResult.passed
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {submittedResult.passed ? 'TUNTAS (LULUS)' : 'REMEDIAL'}
              </span>
            </div>
          </div>

          {/* Session Timing & Track Record Details */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs text-slate-600 max-w-xl mx-auto mb-4 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Sesi & Waktu Pengerjaan:
              </span>
              <span className="text-slate-500 font-mono text-[11px]">
                {startObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
              <div>
                <span className="text-slate-400 block">Waktu Masuk / Login:</span>
                <span className="font-bold text-slate-800 font-mono">
                  {startObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Waktu Selesai (Submit):</span>
                <span className="font-bold text-slate-800 font-mono">
                  {submitObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-slate-400 block">Durasi Pengerjaan:</span>
                <span className="font-bold text-indigo-700 font-mono">
                  {durationMins} m {durationSecs} d
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Integrity Audit Trail */}
          <div className={`p-4 rounded-2xl border text-left text-xs max-w-xl mx-auto mb-6 ${
            isClean
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : submittedResult.violationCount >= 3
              ? 'bg-rose-50 border-rose-300 text-rose-950'
              : 'bg-amber-50/70 border-amber-300 text-amber-950'
          }`}>
            <div className="flex items-start gap-2.5">
              {isClean ? (
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : submittedResult.violationCount >= 3 ? (
                <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs">
                    {isClean
                      ? 'Rekam Jejak Integritas: Sangat Disiplin & Tertib'
                      : `Rekam Jejak Pelanggaran: ${submittedResult.violationCount} Kali Terdeteksi`}
                  </h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isClean
                      ? 'bg-emerald-200/80 text-emerald-900'
                      : 'bg-rose-200 text-rose-900'
                  }`}>
                    {isClean ? '0 Pelanggaran' : `${submittedResult.violationCount}x Pelanggaran`}
                  </span>
                </div>

                {isClean ? (
                  <p className="text-[11px] mt-1 opacity-90 leading-relaxed">
                    Siswa menyelesaikan seluruh soal dalam mode layar penuh terkunci tanpa beralih jendela/tab.
                  </p>
                ) : (
                  <div className="mt-2.5 space-y-1.5">
                    <p className="text-[11px] font-medium opacity-90">
                      Rincian catatan pelanggaran yang terekam pada lembar jawaban:
                    </p>
                    <div className="bg-white/80 rounded-xl p-2.5 border border-amber-200/80 space-y-1.5">
                      {logs.length > 0 ? (
                        logs.map((v, i) => (
                          <div key={v.id || i} className="flex items-start gap-2 text-[11px] text-slate-800">
                            <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded font-mono font-bold text-[10px] shrink-0">
                              #{v.violationNumber || i + 1}
                            </span>
                            <span className="font-mono text-slate-500 text-[10px] shrink-0">
                              [{v.formattedTime || (v.timestamp ? new Date(v.timestamp).toLocaleTimeString('id-ID') : '-')}]
                            </span>
                            <span className="flex-1 font-medium">{v.reason}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-[11px] text-slate-700">
                          Terdeteksi {submittedResult.violationCount} kali meminimalkan layar atau berpindah aplikasi.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
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
      className="cbt-lockdown-container fixed inset-0 z-[99990] w-screen h-screen overflow-y-auto bg-slate-100 flex flex-col select-none relative"
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
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Maximize2 className="w-4 h-4" />
              <span>KUNCI LAYAR & MULAI KERJAKAN SOAL</span>
            </button>
          </div>
        </div>
      )}

      {/* HEADER BAR */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Exam Title & Subject */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="truncate">
              <h1 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                {exam.title}
              </h1>
              <span className="text-[11px] text-slate-500 font-medium block truncate">
                {exam.subjectName} • {student.name} ({student.classGroup || 'Umum'})
              </span>
            </div>
          </div>

          {/* Center Timer Display */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-xl shadow-xs shrink-0">
            <Clock className={`w-4 h-4 ${timeLeftSeconds < 300 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`} />
            <span className={`font-mono text-xs sm:text-sm font-extrabold ${timeLeftSeconds < 300 ? 'text-rose-300' : 'text-white'}`}>
              {formatTime(timeLeftSeconds)}
            </span>
          </div>

          {/* Right Status (Lockdown Active / Violation Counter / Palette Toggle) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowPalette(!showPalette)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              title={showPalette ? 'Sembunyikan panel nomor soal agar lembar soal lebih luas & fokus' : 'Tampilkan daftar nomor soal'}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-indigo-600" />
              <span>{showPalette ? 'Fokus Lembar Soal' : 'Daftar Nomor'}</span>
            </button>

            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold">
              <Shield className="w-3.5 h-3.5" />
              <span>Lockdown Aktif</span>
            </div>

            {violationCount > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-extrabold animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Pelanggaran: {violationCount}/3</span>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: QUESTION CONTENT (8 cols when palette open, 12 cols when focused) */}
        <div className={`${showPalette ? 'lg:col-span-8' : 'lg:col-span-12 max-w-4xl mx-auto w-full'} flex flex-col gap-4 transition-all duration-200`}>
          
          {/* Question Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs flex-1 flex flex-col">
            
            {/* Question Card Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-extrabold rounded-lg">
                  Soal #{currentIndex + 1}
                </span>
                <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                  {currentQ.type === 'single_choice' && 'Pilihan Ganda (1 Jawaban)'}
                  {currentQ.type === 'multiple_choice' && 'Pilihan Majemuk (Banyak Jawaban)'}
                  {currentQ.type === 'true_false' && 'Benar / Salah'}
                  {currentQ.type === 'matching' && 'Menjodohkan (Matching)'}
                  {currentQ.type === 'case_study' && 'Studi Kasus / Uraian'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">
                  Bobot: {currentQ.points} Poin
                </span>
                <button
                  type="button"
                  onClick={toggleFlagCurrent}
                  className={`p-1.5 rounded-lg border text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                    flagged[currentQ.id]
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                  title="Tandai ragu-ragu"
                >
                  <Flag className={`w-3.5 h-3.5 ${flagged[currentQ.id] ? 'fill-amber-600' : ''}`} />
                  <span className="hidden sm:inline">Ragu-ragu</span>
                </button>
              </div>
            </div>

            {/* Stimulus / Case Context if present */}
            {currentQ.caseContext && (
              <div className="mb-4 p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                <span className="font-bold text-indigo-700 block mb-1">Stimulus / Teks Bacaan:</span>
                {currentQ.caseContext}
              </div>
            )}

            {/* Question Instructions if present */}
            {currentQ.instructions && (
              <div className="mb-4 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs sm:text-sm text-amber-950 leading-relaxed">
                <span className="font-bold text-amber-800 block mb-0.5">Petunjuk / Instruksi Soal:</span>
                <span className="whitespace-pre-line">{currentQ.instructions}</span>
              </div>
            )}

            {/* Question Prompt */}
            <div className="text-sm sm:text-base text-slate-900 leading-relaxed font-medium mb-5">
              {currentQ.prompt}
            </div>

            {/* Question Image if present */}
            {currentQ.imageUrl && (
              <div className="mb-5 relative group max-w-lg">
                <img
                  src={currentQ.imageUrl}
                  alt="Ilustrasi Soal"
                  className="rounded-xl border border-slate-200 max-h-60 w-auto object-contain cursor-pointer hover:opacity-95 transition-opacity"
                  onClick={() => {
                    setZoomedImageUrl(currentQ.imageUrl || null);
                    setImageScale(1);
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setZoomedImageUrl(currentQ.imageUrl || null);
                    setImageScale(1);
                  }}
                  className="absolute bottom-2 right-2 px-2.5 py-1 bg-slate-900/80 text-white text-[10px] font-bold rounded-lg backdrop-blur-xs flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity"
                >
                  <ZoomIn className="w-3 h-3" /> Perbesar Gambar
                </button>
              </div>
            )}

            {/* QUESTION TYPES INPUTS */}
            
            {/* TYPE 1: PILIHAN GANDA TUNGGAL (Single Choice) */}
            {currentQ.type === 'single_choice' && currentQ.options && (
              <div className="space-y-2.5">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = answers[currentQ.id] === optIdx;
                  const letter = String.fromCharCode(65 + optIdx);

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => setAnswerForCurrent(optIdx)}
                      className={`w-full p-3.5 sm:p-4 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500 text-indigo-950 font-semibold shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {letter}
                      </span>
                      <span className="text-xs sm:text-sm leading-relaxed flex-1">
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* TYPE 2: PILIHAN GANDA KOMPLEKS (Multiple Choice - Checkbox) */}
            {currentQ.type === 'multiple_choice' && currentQ.options && (
              <div className="space-y-2.5">
                <div className="text-xs text-slate-500 mb-2">
                  (Pilih semua jawaban yang benar):
                </div>
                {currentQ.options.map((opt, optIdx) => {
                  const currentSelected: number[] = Array.isArray(answers[currentQ.id]) ? answers[currentQ.id] : [];
                  const isSelected = currentSelected.includes(optIdx);
                  const letter = String.fromCharCode(65 + optIdx);

                  const handleToggle = () => {
                    if (isSelected) {
                      setAnswerForCurrent(currentSelected.filter(i => i !== optIdx));
                    } else {
                      setAnswerForCurrent([...currentSelected, optIdx]);
                    }
                  };

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={handleToggle}
                      className={`w-full p-3.5 sm:p-4 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500 text-indigo-950 font-semibold shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'bg-white border-slate-300'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span className="text-xs font-bold text-slate-400 mt-0.5">
                        {letter}.
                      </span>
                      <span className="text-xs sm:text-sm leading-relaxed flex-1">
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* TYPE 3: SOAL BENAR / SALAH */}
            {currentQ.type === 'true_false' && currentQ.trueFalseItems && (
              currentQ.trueFalseItems.length === 1 ? (
                <div className="space-y-4">
                  <div className="text-xs text-slate-500 mb-2 font-medium">
                    Tentukan apakah pernyataan/soal di atas bernilai <span className="font-bold text-emerald-700">BENAR</span> atau <span className="font-bold text-rose-700">SALAH</span>:
                  </div>
                  {(() => {
                    const item = currentQ.trueFalseItems[0];
                    const currentTfAnswers = answers[currentQ.id];
                    const selectedValue = typeof currentTfAnswers === 'object' && currentTfAnswers !== null
                      ? currentTfAnswers[item.id]
                      : (typeof currentTfAnswers === 'boolean' ? currentTfAnswers : undefined);

                    const handleChoose = (val: boolean) => {
                      setAnswerForCurrent({
                        [item.id]: val
                      });
                    };

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => handleChoose(true)}
                          className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                            selectedValue === true
                              ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 font-bold shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-8 h-8 rounded-xl text-sm font-bold flex items-center justify-center shrink-0 ${
                              selectedValue === true
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              ✓
                            </span>
                            <div>
                              <span className="text-sm font-bold block">BENAR</span>
                              <span className="text-[11px] text-slate-500 font-normal">Pernyataan bernilai benar</span>
                            </div>
                          </div>
                          {selectedValue === true && (
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                              Terpilih
                            </span>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleChoose(false)}
                          className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                            selectedValue === false
                              ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-500/20 text-rose-950 font-bold shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-8 h-8 rounded-xl text-sm font-bold flex items-center justify-center shrink-0 ${
                              selectedValue === false
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              ✕
                            </span>
                            <div>
                              <span className="text-sm font-bold block">SALAH</span>
                              <span className="text-[11px] text-slate-500 font-normal">Pernyataan bernilai salah</span>
                            </div>
                          </div>
                          {selectedValue === false && (
                            <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-lg">
                              Terpilih
                            </span>
                          )}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              ) : (
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
              )
            )}

            {/* TYPE 4: SOAL MENJODOHKAN (Matching) */}
            {currentQ.type === 'matching' && (() => {
              const matchingData = getMatchingData(currentQ);
              const currentMatchAnswers: Record<string, string> = answers[currentQ.id] || {};
              const answeredCount = matchingData.premises.filter(p => !!currentMatchAnswers[p.id]).length;
              const totalCount = matchingData.premises.length;

              return (
                <div className="space-y-5">
                  {/* Petunjuk Pengerjaan & Status */}
                  <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-indigo-950">
                    <div>
                      <div className="font-bold text-sm text-indigo-900 mb-0.5">Petunjuk Pengerjaan Soal Menjodohkan:</div>
                      <p className="text-indigo-800 leading-relaxed">
                        Jodohkan setiap butir pertanyaan pada <strong>Kolom A</strong> dengan pilihan jawaban yang sesuai pada <strong>Kolom B</strong>. Pasangan yang Anda pilih akan otomatis ditandai dengan <strong>warna yang sama</strong>.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-3 py-1.5 rounded-xl font-bold text-xs shadow-2xs ${
                        answeredCount === totalCount
                          ? 'bg-emerald-600 text-white'
                          : 'bg-indigo-600 text-white'
                      }`}>
                        {answeredCount} / {totalCount} Terpasang
                      </span>
                    </div>
                  </div>

                  {/* Tata Letak 2 Kolom: Kolom A (Pertanyaan) & Kolom B (Pilihan Jawaban) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* SISI KIRI: KOLOM A (Daftar Pertanyaan) */}
                    <div className="lg:col-span-7 space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Kolom A: Daftar Butir Soal ({matchingData.premises.length})
                        </span>
                      </div>

                      <div className="space-y-3">
                        {matchingData.premises.map((premise, pIdx) => {
                          const selectedOptId = currentMatchAnswers[premise.id] || '';
                          const matchedOpt = matchingData.options.find(o => o.id === selectedOptId);
                          const pairColor = getMatchingColor(pIdx);
                          const isMatched = !!selectedOptId;

                          return (
                            <div
                              key={premise.id}
                              className={`p-4 rounded-2xl border-2 transition-all shadow-xs ${
                                isMatched
                                  ? `${pairColor.border} ${pairColor.bgLight}`
                                  : 'bg-white border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="space-y-3">
                                {/* Header Pertanyaan */}
                                <div className="flex items-start gap-3">
                                  <span className={`w-7 h-7 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${
                                    isMatched
                                      ? `${pairColor.badgeBg} ${pairColor.badgeText}`
                                      : 'bg-slate-200 text-slate-700'
                                  }`}>
                                    {pIdx + 1}
                                  </span>

                                  <div className="flex-1 space-y-2">
                                    <div className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed">
                                      {premise.text || `(Pertanyaan #${pIdx + 1})`}
                                    </div>

                                    {/* Gambar pada Butir Soal jika ada */}
                                    {premise.imageUrl && (
                                      <div className="pt-1">
                                        <img
                                          src={premise.imageUrl}
                                          alt={`Soal ${pIdx + 1}`}
                                          className="max-h-36 w-auto object-contain rounded-xl border border-slate-200 bg-white shadow-2xs"
                                          referrerPolicy="no-referrer"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Bagian Pemilihan Kunci Pasangan */}
                                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                  <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                                    <span>Pasangan Jawaban:</span>
                                    {matchedOpt && (
                                      <span className={`px-2 py-0.5 rounded-lg ${pairColor.badgeBg} ${pairColor.badgeText} text-xs font-extrabold shadow-2xs`}>
                                        Opsi {matchedOpt.label}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
                                    <select
                                      value={selectedOptId}
                                      onChange={(e) => {
                                        setAnswerForCurrent({
                                          ...currentMatchAnswers,
                                          [premise.id]: e.target.value
                                        });
                                      }}
                                      className={`w-full text-xs p-2 rounded-xl outline-none font-semibold transition-all border ${
                                        isMatched
                                          ? 'bg-white border-indigo-400 text-indigo-950 font-bold'
                                          : 'bg-slate-50 border-slate-300 text-slate-700 focus:bg-white focus:border-indigo-500'
                                      }`}
                                    >
                                      <option value="">-- Pilih Jawaban (Kolom B) --</option>
                                      {matchingData.options.map(opt => (
                                        <option key={opt.id} value={opt.id}>
                                          Pilihan {opt.label}: {opt.text ? (opt.text.length > 25 ? opt.text.substring(0, 25) + '...' : opt.text) : '(Gambar)'}
                                        </option>
                                      ))}
                                    </select>

                                    {isMatched && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const next = { ...currentMatchAnswers };
                                          delete next[premise.id];
                                          setAnswerForCurrent(next);
                                        }}
                                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer bg-white border border-slate-200"
                                        title="Lepas Pasangan"
                                      >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* SISI KANAN: KOLOM B (Daftar Pilihan Jawaban) */}
                    <div className="lg:col-span-5 space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Kolom B: Pilihan Jawaban ({matchingData.options.length})
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {matchingData.options.map((opt) => {
                          // Check which premise selected this option
                          const selectedPremiseIdx = matchingData.premises.findIndex(
                            p => currentMatchAnswers[p.id] === opt.id
                          );
                          const isAssigned = selectedPremiseIdx >= 0;
                          const pairColor = isAssigned ? getMatchingColor(selectedPremiseIdx) : null;

                          return (
                            <div
                              key={opt.id}
                              className={`p-3.5 rounded-2xl border-2 transition-all shadow-xs ${
                                pairColor
                                  ? `${pairColor.border} ${pairColor.bgLight}`
                                  : 'bg-white border-slate-200'
                              }`}
                            >
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2.5">
                                    <span className={`w-7 h-7 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs ${
                                      pairColor
                                        ? `${pairColor.badgeBg} ${pairColor.badgeText}`
                                        : 'bg-slate-200 text-slate-700'
                                    }`}>
                                      {opt.label}
                                    </span>
                                    <span className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                                      {opt.text || '(Pilihan Gambar)'}
                                    </span>
                                  </div>

                                  {isAssigned && pairColor && (
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${pairColor.badgeBg} ${pairColor.badgeText} shadow-2xs shrink-0`}>
                                      Dipilih Soal #{selectedPremiseIdx + 1}
                                    </span>
                                  )}
                                </div>

                                {opt.imageUrl && (
                                  <div className="pl-9 pt-1">
                                    <img
                                      src={opt.imageUrl}
                                      alt={`Pilihan ${opt.label}`}
                                      className="max-h-28 w-auto object-contain rounded-xl border border-slate-200 bg-white shadow-2xs"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* TYPE 5: STUDI KASUS (Case Study with stimulus & options) */}
            {currentQ.type === 'case_study' && (
              <div className="space-y-4">
                {currentQ.caseContext && (
                  <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl text-xs sm:text-sm text-indigo-950 leading-relaxed whitespace-pre-wrap">
                    <div className="font-bold text-xs text-indigo-900 uppercase mb-1 tracking-wider">Wacana / Skenario Studi Kasus:</div>
                    {currentQ.caseContext}
                  </div>
                )}
                {currentQ.options && (
                  <div className="space-y-2.5">
                    <div className="text-xs text-slate-500 mb-2 font-medium">
                      Pilihlah satu jawaban yang paling tepat berdasarkan studi kasus di atas:
                    </div>
                    {currentQ.options.map((opt, optIdx) => {
                      const isSelected = answers[currentQ.id] === optIdx;
                      const letter = String.fromCharCode(65 + optIdx);

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => setAnswerForCurrent(optIdx)}
                          className={`w-full p-3.5 sm:p-4 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500 text-indigo-950 font-semibold shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                          }`}
                        >
                          <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {letter}
                          </span>
                          <span className="text-xs sm:text-sm leading-relaxed flex-1">
                            {opt}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* QUESTION CARD BOTTOM NAVIGATION */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIndex(i => Math.min(questions.length - 1, i + 1))}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <span>Berikutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowFinishConfirm(true)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <span>Selesai & Kumpulkan</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: QUESTION NAVIGATION MATRIX (4 cols) */}
        {showPalette && (
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Nomor Soal ({questions.length})
                </h3>
                <span className="text-[11px] font-bold text-emerald-600">
                  Terjawab: {answeredCount} / {questions.length}
                </span>
              </div>

              {/* Matrix of Question Numbers */}
              <div className="max-h-72 overflow-y-auto pr-1">
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, idx) => {
                    const isCurrent = idx === currentIndex;
                    const isAns = isQuestionAnswered(q);
                    const isFlag = flagged[q.id];

                    let btnBg = 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100';
                    if (isFlag) {
                      btnBg = 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
                    } else if (isAns) {
                      btnBg = 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs';
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
        )}

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

      {/* SILAKAN KEMBALI MENYELESAIKAN SOAL MODAL (Muncul saat membuka aplikasi lain/notifikasi tanpa memberikan sanksi pelanggaran) */}
      {showReturnPrompt && !submittedResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => {
            setShowReturnPrompt(false);
            enterFullscreen();
          }}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-indigo-100 text-center relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-4 shadow-xs">
              <BookOpen className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Layar Ujian Terkunci di Depan</span>
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mb-2">
              Silakan Kembali Menyelesaikan Soal
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed font-medium">
              Layar ujian dijeda sementara karena Anda membuka aplikasi lain atau notifikasi muncul. Klik tombol di bawah untuk langsung memposisikan layar kembali di depan dan melanjutkan ujian.
            </p>

            <button
              type="button"
              onClick={() => {
                setShowReturnPrompt(false);
                enterFullscreen();
              }}
              className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Kembali Menyelesaikan Soal</span>
            </button>
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
              <p>Pelanggaran ini tercatat di pengawas beserta jam dan waktu kejadian. Jika mencapai <span className="font-bold text-rose-700">3 kali pelanggaran</span>, ujian otomatis dihentikan dan dikumpulkan paksa ke server pengawas.</p>
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