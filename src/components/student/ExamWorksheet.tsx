import React, { useState, useEffect, useRef } from 'react';
import { User, Exam, Question, ExamSubmission } from '../../types';
import { gradeSubmission } from '../../utils/storage';
import confetti from 'canvas-confetti';
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  Lock,
  Maximize2,
  FileText,
  RotateCcw,
  CheckSquare,
  Check,
  Flag,
  Award,
  BookOpen
} from 'lucide-react';

interface ExamWorksheetProps {
  student: User;
  exam: Exam;
  questions: Question[];
  onFinishExam: (submission: ExamSubmission) => void;
  onExitToDashboard: () => void;
}

export const ExamWorksheet: React.FC<ExamWorksheetProps> = ({
  student,
  exam,
  questions,
  onFinishExam,
  onExitToDashboard
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(exam.durationMinutes * 60);
  const [startedAt] = useState<string>(new Date().toISOString());

  // Anti-cheat / Lockdown state
  const [violationCount, setViolationCount] = useState(0);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [violationReason, setViolationReason] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<ExamSubmission | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const currentQ = questions[currentIndex];

  // Request fullscreen on start
  const enterFullscreen = () => {
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } catch {
      // Ignored if blocked by iframe sandbox
    }
  };

  // Timer countdown
  useEffect(() => {
    if (submittedResult) return;

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
  }, [submittedResult]);

  // Anti-cheat event listeners (Lockdown mode)
  useEffect(() => {
    if (submittedResult) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation('Anda terdeteksi berpindah tab browser atau meminimalkan jendela ujian.');
      }
    };

    const handleWindowBlur = () => {
      triggerViolation('Fokus layar ujian hilang! Dilarang membuka aplikasi lain, kalkulator, atau jendela lain.');
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        // Soft prompt to return to fullscreen
      } else {
        setIsFullscreen(true);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent common navigation shortcuts
      if (
        (e.ctrlKey && ['t', 'n', 'w', 'j', 'u', 'r'].includes(e.key.toLowerCase())) ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['i', 'c', 'j'].includes(e.key.toLowerCase())) ||
        e.key === 'Escape'
      ) {
        e.preventDefault();
        triggerViolation('Penggunaan tombol pintasan sistem dilarang selama ujian terkunci.');
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault(); // Disable inspect / right-click
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [submittedResult]);

  const triggerViolation = (reason: string) => {
    setViolationCount(prev => {
      const updated = prev + 1;
      setViolationReason(reason);
      setShowViolationModal(true);

      // Auto-submit if violation exceeds 5
      if (updated >= 5) {
        setTimeout(() => {
          handleForceSubmit('Batas toleransi pelanggaran lockdown terlampaui (5 kali). Ujian otomatis dikumpulkan.');
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

  // Render Post-Exam Result Screen
  if (submittedResult) {
    return (
      <div className="min-h-[calc(100vh-4.5rem)] py-8 px-4 sm:px-6 max-w-3xl mx-auto flex flex-col justify-center">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden text-center p-6 sm:p-10">
          
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
            Terima kasih telah mengerjakan ujian dengan tertib. Berikut hasil penilaian otomatis lembar kerja Anda:
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
              <span className={`text-3xl font-extrabold ${submittedResult.passed ? 'text-emerald-600' : 'text-amber-600'}`}>
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
                {submittedResult.violationCount === 0 ? '0 (Bersih / Disiplin)' : `${submittedResult.violationCount} kali tercatat`}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onExitToDashboard}
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
      className="min-h-screen bg-slate-100 flex flex-col select-none relative"
    >
      {/* Lockdown Status Banner */}
      <div className="bg-slate-900 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 shadow-md z-30">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="font-bold flex items-center gap-1.5 text-amber-300">
            <Lock className="w-3.5 h-3.5" />
            LOCKDOWN MODE AKTIF
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
              {violationCount} / 5
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
              className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Maximize2 className="w-3 h-3" /> Fullscreen
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

            {/* Prompt with Arabic & Image Support */}
            {currentQ.imageUrl && (
              <div className="mb-6 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-3 max-w-xl mx-auto shadow-2xs">
                <img
                  src={currentQ.imageUrl}
                  alt="Gambar Butir Soal"
                  className="max-h-72 w-auto object-contain rounded-xl hover:scale-102 transition-transform duration-200 cursor-pointer"
                  onClick={() => {
                    if (currentQ.imageUrl) window.open(currentQ.imageUrl, '_blank');
                  }}
                  title="Klik untuk melihat ukuran penuh"
                />
                <span className="text-[11px] text-slate-400 mt-2 italic">
                  * Klik gambar untuk memperbesar pada tab baru
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
                        <div className="sm:ml-4 shrink-0 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-1.5 self-center sm:self-start">
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
                        <div className="sm:ml-4 shrink-0 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-1.5 self-center sm:self-start">
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

                    // Get unique right options from the question
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

            <span className="inline-block px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-extrabold tracking-wider uppercase mb-2">
              Peringatan Integritas Ujian #{violationCount}
            </span>

            <h3 className="text-xl font-extrabold text-slate-900">
              Aktivitas Tidak Diizinkan Terdeteksi!
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 my-3 leading-relaxed">
              {violationReason}
            </p>

            <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-900 font-medium text-left mb-6">
              ⚠️ Lembar kerja dilockdown untuk mencegah penggunaan browser lain, kalkulator, atau aplikasi eksternal. Pelanggaran ini telah dicatat ke dalam log pengawas guru. Ujian akan otomatis dibatalkan/dikumpulkan paksa jika mencapai 5 pelanggaran.
            </div>

            <button
              type="button"
              onClick={() => setShowViolationModal(false)}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
            >
              Saya Mengerti & Kembali ke Lembar Ujian
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
