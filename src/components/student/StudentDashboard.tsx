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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-800 via-indigo-700 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-900/10 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-block px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold text-indigo-100 mb-3 border border-white/15">
              Ruang Belajar & Ujian Siswa
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Halo, {student.name}!
            </h1>
            <p className="text-indigo-100/90 text-xs sm:text-sm mt-1 max-w-xl">
              NIS: <span className="font-mono font-semibold">{student.nipOrNis || '-'}</span> • Kelas:{' '}
              <span className="font-semibold">{studentClass}</span>. Kerjakan ujian dengan teliti, jujur, dan pastikan mematuhi aturan lockdown.
            </p>
          </div>

          {/* Quick Stats Pills */}
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center min-w-[110px]">
              <span className="text-xs text-indigo-200 font-medium block">Ujian Selesai</span>
              <span className="text-2xl font-extrabold text-white">{completedCount}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center min-w-[110px]">
              <span className="text-xs text-indigo-200 font-medium block">Rata-rata Nilai</span>
              <span className="text-2xl font-extrabold text-amber-300">{avgScore}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rules & Lockdown Advisory Box */}
      <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 flex items-start gap-4">
        <div className="p-2 bg-amber-100 text-amber-800 rounded-xl shrink-0 mt-0.5">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="text-xs sm:text-sm text-amber-900">
          <h4 className="font-bold text-amber-950 mb-1">
            Panduan & Ketentuan Lockdown Ujian:
          </h4>
          <p className="leading-relaxed text-xs text-amber-900/90">
            Saat Anda menekan tombol <strong>Mulai Ujian</strong>, layar akan otomatis masuk ke <em>Lockdown Mode</em> (Layar Penuh). Dilarang membuka browser lain, aplikasi kalkulator, atau beralih tab. Setiap percobaan pergantian jendela akan dicatat dalam rekapitulasi pengawas dan dapat menyebabkan lembar kerja dikumpulkan otomatis.
          </p>
        </div>
      </div>

      {/* Available Exams Section */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Daftar Ujian Aktif Anda
            </h2>
            <p className="text-xs text-slate-500">
              Ujian yang dijadwalkan untuk kelas {studentClass}
            </p>
          </div>
        </div>

        {availableExams.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-700">Belum Ada Ujian Aktif</h3>
            <p className="text-xs text-slate-400 mt-1">
              Saat ini guru belum menjadwalkan ujian baru untuk kelas Anda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {availableExams.map(exam => {
              const questions = getQuestionsByExamId(exam.id);
              const isCompleted = myCompletedExamIds.has(exam.id);
              const submission = mySubmissions.find(s => s.examId === exam.id);

              return (
                <div
                  key={exam.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 sm:p-6 flex flex-col justify-between"
                >
                  <div>
                    {/* Header Tags */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-lg border border-indigo-100">
                        {exam.subjectName}
                      </span>
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Sudah Dikerjakan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold border border-amber-200">
                          <Clock className="w-3.5 h-3.5" /> Siap Dikerjakan
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mb-2">
                      {exam.title}
                    </h3>

                    <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                      {exam.instructions || 'Bacalah setiap butir soal dengan teliti dan pilih jawaban yang paling tepat.'}
                    </p>

                    {/* Metadata specs */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-xs text-slate-600 mb-4">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Durasi</span>
                        <span className="font-semibold text-slate-800">{exam.durationMinutes} Menit</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Jumlah Soal</span>
                        <span className="font-semibold text-slate-800">{questions.length} Butir</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Pengampu</span>
                        <span className="font-semibold text-slate-800 truncate block">{exam.teacherName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action or Score display */}
                  {isCompleted && submission ? (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-500 block">Nilai Anda:</span>
                        <span className="text-lg font-extrabold text-indigo-700">
                          {submission.earnedScore} / {submission.totalScore} ({submission.percentage}%)
                        </span>
                      </div>
                      <span className={`px-3 py-1 rounded-lg font-bold ${
                        submission.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {submission.passed ? 'TUNTAS' : 'REMEDIAL'}
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedExamForModal(exam)}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Mulai Kerjakan Ujian</span>
                    </button>
                  )}
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
