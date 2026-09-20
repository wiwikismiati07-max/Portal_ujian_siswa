import React, { useState, useEffect } from 'react';
import { User, Exam, ExamSubmission } from '../../types';
import { getAllExams, getAllSubmissions, getQuestionsByExamId } from '../../utils/storage';
import { isStudentEligibleForExam } from '../../utils/classHelper';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Award,
  ShieldAlert,
  ShieldCheck,
  Calendar,
  Layers,
  FileCheck,
  ChevronRight
} from 'lucide-react';

interface StudentDashboardProps {
  student: User;
  onStartExam: (exam: Exam) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ student, onStartExam }) => {
  const [exams, setExams] = useState<Exam[]>(getAllExams());
  const [submissions, setSubmissions] = useState<ExamSubmission[]>(getAllSubmissions());
  const [selectedExamForModal, setSelectedExamForModal] = useState<Exam | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setExams(getAllExams());
      setSubmissions(getAllSubmissions());
    };
    window.addEventListener('cbt_storage_update', handleUpdate);
    return () => window.removeEventListener('cbt_storage_update', handleUpdate);
  }, []);

  // Filter exams that are active and targeted to this student's class
  const studentClass = student.classGroup || '';
  const availableExams = exams.filter(e => {
    if (e.status !== 'active') return false;
    return isStudentEligibleForExam(e.targetClasses, studentClass);
  });

  // Check submissions by this student
  const mySubmissions = submissions.filter(s => s.studentId === student.id);
  const myCompletedExamIds = new Set(mySubmissions.map(s => s.examId));

  // Compute stats
  const completedCount = mySubmissions.length;
  const avgScore =
    completedCount > 0
      ? Math.round(mySubmissions.reduce((acc, curr) => acc + curr.percentage, 0) / completedCount)
      : 0;

  const handleStartExamWithLockdown = (exam: Exam) => {
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else if ((document.documentElement as any).webkitRequestFullscreen) {
        (document.documentElement as any).webkitRequestFullscreen().catch(() => {});
      }
    } catch {}
    onStartExam(exam);
  };

  // Greeting based on current time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) return 'Selamat Pagi';
    if (hour >= 11 && hour < 15) return 'Selamat Siang';
    if (hour >= 15 && hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 lg:p-10 text-white shadow-xl shadow-indigo-950/20 relative overflow-hidden border border-indigo-700/30">
        {/* Subtle ambient lighting */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-indigo-200 border border-white/15 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Ruang Belajar & Ujian Siswa</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              {getGreeting()}, {student.name}!
            </h1>
            
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs sm:text-sm text-indigo-100/90 font-medium">
              <span className="px-2.5 py-1 bg-white/10 rounded-lg border border-white/10 font-mono">
                NIS: {student.nipOrNis || '-'}
              </span>
              <span className="px-2.5 py-1 bg-white/10 rounded-lg border border-white/10">
                Kelas: <strong className="text-white font-bold">{studentClass}</strong>
              </span>
              <span className="text-indigo-200/80 hidden sm:inline">
                • Sistem Asesmen Berbasis Komputer SPANJU
              </span>
            </div>
          </div>

          {/* Quick Stats Bento Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center min-w-[120px] shadow-2xs">
              <span className="text-xs text-indigo-200 font-bold block mb-1">Ujian Selesai</span>
              <div className="flex items-center justify-center gap-1.5">
                <FileCheck className="w-5 h-5 text-emerald-300" />
                <span className="text-2xl font-extrabold text-white">{completedCount}</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center min-w-[120px] shadow-2xs">
              <span className="text-xs text-indigo-200 font-bold block mb-1">Rata-rata Nilai</span>
              <div className="flex items-center justify-center gap-1.5">
                <Award className="w-5 h-5 text-amber-300" />
                <span className="text-2xl font-extrabold text-amber-300">{avgScore}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rules & Lockdown Advisory Box */}
      <div className="bg-amber-50/90 backdrop-blur-xs rounded-2xl p-4 sm:p-5 border border-amber-200/90 shadow-2xs flex items-start gap-3.5">
        <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl shrink-0 mt-0.5 shadow-2xs">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="text-xs sm:text-sm text-amber-950 space-y-1">
          <h4 className="font-extrabold text-amber-950 flex items-center gap-2">
            <span>Prosedur & Aturan Mode Ujian Terkunci (Lockdown)</span>
          </h4>
          <p className="leading-relaxed text-xs text-amber-900/90">
            Saat tombol <strong>Mulai Ujian</strong> ditekan, layar akan otomatis masuk ke <em>Mode Layar Penuh</em>. Siswa dilarang membuka tab browser lain, aplikasi kalkulator, atau beralih jendela. Segala bentuk pelanggaran tercatat otomatis oleh pengawas sistem.
          </p>
        </div>
      </div>

      {/* Available Exams Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>Daftar Paket Ujian Aktif</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Ujian yang terdaftar khusus untuk rombongan belajar kelas <strong className="text-slate-800">{studentClass}</strong>
            </p>
          </div>
        </div>

        {availableExams.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-base font-extrabold text-slate-700">Belum Ada Ujian Aktif</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Saat ini guru pengampu belum menjadwalkan paket ujian baru untuk kelas Anda. Silakan periksa kembali nanti.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {availableExams.map(exam => {
              const questions = getQuestionsByExamId(exam.id);
              const isCompleted = myCompletedExamIds.has(exam.id);
              const submission = mySubmissions.find(s => s.examId === exam.id);

              return (
                <div
                  key={exam.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 p-5 sm:p-6 flex flex-col justify-between card-hover-effect"
                >
                  <div className="space-y-3">
                    {/* Header Tags */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-extrabold text-xs rounded-xl border border-indigo-100/80 truncate max-w-[180px]">
                        {exam.subjectName}
                      </span>
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-extrabold border border-emerald-200 shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Selesai</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-xl text-xs font-extrabold border border-amber-200 shrink-0">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Tersedia</span>
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-snug">
                        {exam.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {exam.instructions || 'Bacalah setiap butir soal dengan cermat dan teliti sebelum menjawab.'}
                      </p>
                    </div>

                    {/* Metadata specs */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-xs text-slate-600">
                      <div className="bg-slate-50/70 p-2 rounded-xl text-center">
                        <span className="text-slate-400 block text-[10px] font-bold">Durasi</span>
                        <span className="font-extrabold text-slate-800 text-xs">{exam.durationMinutes} Menit</span>
                      </div>
                      <div className="bg-slate-50/70 p-2 rounded-xl text-center">
                        <span className="text-slate-400 block text-[10px] font-bold">Soal</span>
                        <span className="font-extrabold text-slate-800 text-xs">{questions.length} Butir</span>
                      </div>
                      <div className="bg-slate-50/70 p-2 rounded-xl text-center">
                        <span className="text-slate-400 block text-[10px] font-bold">KKM</span>
                        <span className="font-extrabold text-indigo-700 text-xs">{exam.passingScore}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action or Score display */}
                  <div className="pt-4">
                    {isCompleted && submission ? (
                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-slate-400 block text-[11px] font-bold">Hasil Perolehan Nilai:</span>
                            <span className="text-lg font-black text-indigo-700">
                              {submission.earnedScore} <span className="text-slate-400 font-medium text-xs">/ {submission.totalScore}</span> ({submission.percentage}%)
                            </span>
                          </div>
                          <span className={`px-3 py-1 rounded-xl font-extrabold text-xs border ${
                            submission.passed
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {submission.passed ? 'TUNTAS' : 'REMEDIAL'}
                          </span>
                        </div>
                        
                        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">Status Kejujuran:</span>
                          {(submission.violationCount || 0) === 0 ? (
                            <span className="inline-flex items-center gap-1 font-extrabold text-emerald-700">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Tertib (0x)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-extrabold text-amber-700">
                              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                              <span>{submission.violationCount}x Pelanggaran</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedExamForModal(exam)}
                        className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>Mulai Kerjakan Ujian</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Exam Pre-flight Confirmation Modal */}
      {selectedExamForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
              <FileCheck className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 mb-1">
              Konfirmasi Memulai Ujian
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {selectedExamForModal.title}
            </p>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2 mb-5">
              <div className="flex justify-between">
                <span className="text-slate-500">Mata Pelajaran:</span>
                <span className="font-semibold text-slate-800">{selectedExamForModal.subjectName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Durasi Waktu:</span>
                <span className="font-semibold text-slate-800">{selectedExamForModal.durationMinutes} Menit</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Passing Grade (KKM):</span>
                <span className="font-semibold text-indigo-700">{selectedExamForModal.passingScore} Poin</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Siswa Peserta:</span>
                <span className="font-semibold text-slate-800">{student.name} ({studentClass})</span>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 font-medium mb-6">
              ⚠️ Peringatan: Saat dimulai, jendela akan terkunci penuh. Anda tidak dapat membuka tab atau kalkulator lain sebelum selesai mengumpulkan.
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedExamForModal(null)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const examToStart = selectedExamForModal;
                  setSelectedExamForModal(null);
                  if (examToStart) {
                    handleStartExamWithLockdown(examToStart);
                  }
                }}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                <span>Kunci Layar & Mulai Ujian</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
