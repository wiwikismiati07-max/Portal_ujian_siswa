import React, { useState, useEffect } from 'react';
import { User, Exam, Question, Subject, ExamSubmission } from '../../types';
import {
  getAllExams,
  getAllQuestions,
  getAllSubjects,
  getAllSubmissions,
  saveExams,
  saveQuestions,
  saveSubjects,
  saveUsers,
  getAllUsers,
  addExam,
  deleteExam,
  clearAllExamsDirect,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  overwriteUsersByRoleDirect,
  importUsersWithModeDirect,
  overwriteSubjectsDirect
} from '../../utils/storage';
import { BankSoalReport } from './BankSoalReport';
import { ClassScoreRecap } from './ClassScoreRecap';
import { ExcelManager } from './ExcelManager';
import { QuestionCreatorModal } from './QuestionCreatorModal';
import { ConfirmModal } from '../ConfirmModal';
import { TargetClassMultiSelect, ALL_ROMPEL_CLASSES } from './TargetClassMultiSelect';
import {
  FileText,
  BarChart3,
  Plus,
  FileSpreadsheet,
  Clock,
  Layers,
  GraduationCap,
  Users,
  CheckCircle2,
  Calendar,
  Sparkles,
  BookOpen,
  Trash2,
  AlertTriangle,
  X
} from 'lucide-react';

interface TeacherDashboardProps {
  teacher: User;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ teacher }) => {
  const [activeTab, setActiveTab] = useState<'rekap' | 'bank_soal' | 'paket_ujian' | 'excel'>('rekap');
  const [exams, setExams] = useState<Exam[]>(getAllExams());
  const [questions, setQuestions] = useState<Question[]>(getAllQuestions());
  const [subjects, setSubjects] = useState<Subject[]>(getAllSubjects());
  const [submissions, setSubmissions] = useState<ExamSubmission[]>(getAllSubmissions());

  // Confirm Modal state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    isDanger?: boolean;
    isLoading?: boolean;
    onConfirm: () => Promise<void> | void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Ya, Lanjutkan',
    isDanger: true,
    isLoading: false,
    onConfirm: () => {}
  });

  // Notification Toast state
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(prev => (prev?.message === message ? null : prev));
    }, 5000);
  };

  useEffect(() => {
    const handleUpdate = () => {
      setExams(getAllExams());
      setQuestions(getAllQuestions());
      setSubjects(getAllSubjects());
      setSubmissions(getAllSubmissions());
    };
    window.addEventListener('cbt_storage_update', handleUpdate);
    return () => window.removeEventListener('cbt_storage_update', handleUpdate);
  }, []);

  // Modal states
  const [isCreateExamOpen, setIsCreateExamOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [targetExamForQuestion, setTargetExamForQuestion] = useState<Exam | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // New Exam Form State
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamSubjectId, setNewExamSubjectId] = useState(subjects[0]?.id || '');
  const [newExamDuration, setNewExamDuration] = useState(45);
  const [newExamPassingScore, setNewExamPassingScore] = useState(75);
  const [newExamClasses, setNewExamClasses] = useState<string[]>(['7A', '7B']);
  const [newExamInstructions, setNewExamInstructions] = useState('Kerjakan soal dengan cermat dan jujur.');

  // Handle Question add/edit
  const handleOpenAddQuestion = (exam: Exam) => {
    setTargetExamForQuestion(exam);
    setEditingQuestion(null);
    setIsQuestionModalOpen(true);
  };

  const handleOpenEditQuestion = (exam: Exam, question: Question) => {
    setTargetExamForQuestion(exam);
    setEditingQuestion(question);
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = (q: Question) => {
    if (editingQuestion) {
      updateQuestion(q);
    } else {
      addQuestion(q);
    }
    setQuestions(getAllQuestions());
  };

  const handleDeleteQuestion = (qId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Butir Soal?',
      message: 'Apakah Anda yakin ingin menghapus butir pertanyaan ini dari bank soal?',
      confirmLabel: 'Hapus Soal',
      isDanger: true,
      isLoading: false,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isLoading: true }));
        await deleteQuestion(qId);
        setQuestions(getAllQuestions());
        setConfirmDialog(prev => ({ ...prev, isOpen: false, isLoading: false }));
        showNotification('success', 'Butir soal berhasil dihapus.');
      }
    });
  };

  // Handle Create New Exam
  const handleCreateExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamTitle.trim()) return;

    const chosenSubject = subjects.find(s => s.id === newExamSubjectId) || subjects[0];
    const finalClasses = newExamClasses.length > 0 ? newExamClasses : ALL_ROMPEL_CLASSES;
    const newExam: Exam = {
      id: `exam_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: newExamTitle.trim(),
      subjectId: chosenSubject.id,
      subjectName: chosenSubject.name,
      teacherId: teacher.id,
      teacherName: teacher.name,
      targetClasses: finalClasses,
      durationMinutes: Number(newExamDuration) || 45,
      totalScore: 100,
      passingScore: Number(newExamPassingScore) || 75,
      status: 'active',
      instructions: newExamInstructions.trim(),
      createdAt: new Date().toISOString().split('T')[0]
    };

    addExam(newExam);
    setExams(getAllExams());
    setIsCreateExamOpen(false);
    setNewExamTitle('');
    setNewExamClasses(['7A', '7B']);
    showNotification('success', `Paket ujian "${newExam.title}" berhasil dibuat!`);
  };

  const handleDeleteExam = (examId: string, title: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Paket Ujian?',
      message: `Apakah Anda yakin ingin menghapus paket ujian "${title}" beserta seluruh butir soalnya? Tindakan ini akan menghapus data di penyimpanan lokal dan Supabase.`,
      confirmLabel: 'Ya, Hapus Paket',
      isDanger: true,
      isLoading: false,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isLoading: true }));
        try {
          await deleteExam(examId);
          setExams(getAllExams());
          setQuestions(getAllQuestions());
          setConfirmDialog(prev => ({ ...prev, isOpen: false, isLoading: false }));
          showNotification('success', `Paket ujian "${title}" berhasil dihapus.`);
        } catch (err: any) {
          setConfirmDialog(prev => ({ ...prev, isOpen: false, isLoading: false }));
          showNotification('error', `Gagal menghapus paket ujian: ${err?.message || 'Error'}`);
        }
      }
    });
  };

  const handleClearAllExams = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Kosongkan Semua Paket Ujian?',
      message: 'PERINGATAN: Tindakan ini akan MENGOSONGKAN SELURUH DAFTAR PAKET UJIAN, bank butir soal, dan rekapan nilai siswa di penyimpanan lokal serta database Supabase.',
      confirmLabel: 'Ya, Kosongkan Semua',
      isDanger: true,
      isLoading: false,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isLoading: true }));
        try {
          const res = await clearAllExamsDirect();
          setExams([]);
          setQuestions([]);
          setSubmissions([]);
          setConfirmDialog(prev => ({ ...prev, isOpen: false, isLoading: false }));
          if (res.success) {
            showNotification('success', 'Seluruh paket ujian, butir soal, dan rekap nilai berhasil dikosongkan!');
          } else {
            showNotification('success', 'Daftar paket ujian telah dikosongkan secara lokal.');
          }
        } catch (err: any) {
          setConfirmDialog(prev => ({ ...prev, isOpen: false, isLoading: false }));
          showNotification('error', `Gagal mengosongkan paket ujian: ${err?.message || 'Error'}`);
        }
      }
    });
  };

  // Handle Excel Imports
  const handleImportStudents = async (
    newStudents: User[],
    mode: 'merge_upsert' | 'replace_role',
    onProgress?: (processed: number, total: number) => void
  ) => {
    const res = await importUsersWithModeDirect('siswa', newStudents, mode, onProgress);
    if (res.success) {
      showNotification(
        'success',
        `Berhasil! Data siswa ${
          mode === 'merge_upsert' ? 'telah ditindih & diperbarui (anti-duplikat)' : 'telah diganti bersih'
        } (${res.count} data) dan tersimpan di Supabase.`
      );
    } else {
      showNotification('success', `Data siswa diperbarui secara lokal. Catatan Supabase: ${res.error}`);
    }
  };

  const handleImportTeachers = async (
    newTeachers: User[],
    mode: 'merge_upsert' | 'replace_role',
    onProgress?: (processed: number, total: number) => void
  ) => {
    // Retain current logged-in teacher if not present in the new list to avoid sudden session ejection
    const hasCurrentTeacher = newTeachers.some(
      t => t.id === teacher.id || t.username.toLowerCase() === teacher.username.toLowerCase()
    );
    const finalTeachers = hasCurrentTeacher ? newTeachers : [teacher, ...newTeachers];

    const res = await importUsersWithModeDirect('guru', finalTeachers, mode, onProgress);
    if (res.success) {
      showNotification(
        'success',
        `Berhasil! Data guru ${
          mode === 'merge_upsert' ? 'telah ditindih & diperbarui (anti-duplikat)' : 'telah diganti bersih'
        } (${res.count} data) dan tersimpan di Supabase.`
      );
    } else {
      showNotification('success', `Data guru diperbarui secara lokal. Catatan Supabase: ${res.error}`);
    }
  };

  const handleImportSubjects = async (
    newSubjects: Subject[],
    onProgress?: (processed: number, total: number) => void
  ) => {
    const res = await overwriteSubjectsDirect(newSubjects, onProgress);
    setSubjects(newSubjects);
    if (res.success) {
      showNotification('success', `Berhasil! Seluruh data mata pelajaran lama telah ditindih dengan ${newSubjects.length} mata pelajaran baru dan tersimpan di Supabase.`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Global In-App Notification Toast */}
      {notification && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 animate-in fade-in slide-in-from-top duration-200">
          <div
            className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border text-xs sm:text-sm font-semibold max-w-md ${
              notification.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700 shadow-emerald-950/20'
                : 'bg-rose-900 text-white border-rose-700 shadow-rose-950/20'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span className="flex-1">{notification.message}</span>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="p-1 text-white/70 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Teacher Welcome & Overview Card (No Print) */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-950/10 no-print flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-block px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold text-emerald-200 mb-3 border border-white/15">
            Dashboard Guru Pengampu Mata Pelajaran
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Selamat Datang, {teacher.name}
          </h1>
          <p className="text-emerald-100/90 text-xs sm:text-sm mt-1 max-w-xl">
            Akses bank butir soal, buat paket ujian asesmen baru, pantau hasil ujian siswa, dan cetak lembar rekapitulasi nilai secara terstruktur.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCreateExamOpen(true)}
            className="px-4 py-2.5 bg-white text-emerald-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md hover:bg-emerald-50 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-700" />
            <span>Buat Paket Ujian</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs (No Print) */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-2xl w-full sm:w-fit no-print overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('rekap')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'rekap'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-indigo-600" />
          <span>Rekap & Analisis Nilai</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bank_soal')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'bank_soal'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4 text-amber-600" />
          <span>Bank Soal & Kisi-kisi</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('paket_ujian')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'paket_ujian'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 text-emerald-600" />
          <span>Kelola Paket Ujian ({exams.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('excel')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'excel'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-teal-600" />
          <span>Impor Data Excel</span>
        </button>
      </div>

      {/* TAB 1: REKAPITULASI NILAI */}
      {activeTab === 'rekap' && (
        <ClassScoreRecap
          submissions={submissions}
          exams={exams}
          subjects={subjects}
        />
      )}

      {/* TAB 2: BANK SOAL */}
      {activeTab === 'bank_soal' && (
        <BankSoalReport
          teacher={teacher}
          exams={exams}
          questions={questions}
          subjects={subjects}
          onAddQuestion={handleOpenAddQuestion}
          onEditQuestion={handleOpenEditQuestion}
          onDeleteQuestion={handleDeleteQuestion}
        />
      )}

      {/* TAB 3: KELOLA PAKET UJIAN */}
      {activeTab === 'paket_ujian' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Daftar Paket Ujian Terjadwal
              </h3>
              <p className="text-xs text-slate-500">
                Atur durasi, target kelas, dan tambahkan butir soal ke masing-masing paket ujian.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {exams.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllExams}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Hapus semua paket ujian untuk memulai dari awal"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Kosongkan Semua Paket</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsCreateExamOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Paket Ujian Baru</span>
              </button>
            </div>
          </div>

          {exams.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Layers className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-800 mb-1">
                Daftar Paket Ujian Saat Ini Kosong
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
                Data simulasi paket ujian telah dikosongkan. Anda dapat mulai membuat paket ujian riil baru sesuai jadwal dan mata pelajaran yang diampu.
              </p>
              <button
                type="button"
                onClick={() => setIsCreateExamOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/10 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Paket Ujian Pertama Sekarang</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {exams.map(ex => {
                const qCount = questions.filter(q => q.examId === ex.id).length;
                return (
                  <div key={ex.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-lg border border-emerald-200">
                          {ex.subjectName}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-medium">
                            {ex.createdAt}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteExam(ex.id, ex.title)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus paket ujian ini"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 mb-2">
                        {ex.title}
                      </h4>

                      <div className="text-xs text-slate-500 space-y-1 py-3 border-y border-slate-100 my-3">
                        <div>Target Kelas: <strong className="text-slate-800">{ex.targetClasses.join(', ')}</strong></div>
                        <div>Durasi: <strong className="text-slate-800">{ex.durationMinutes} Menit</strong> • KKM: <strong className="text-indigo-600">{ex.passingScore}</strong></div>
                        <div>Jumlah Butir Soal: <strong className="text-emerald-700">{qCount} Butir</strong></div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => handleOpenAddQuestion(ex)}
                        className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Butir Soal</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('bank_soal');
                        }}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Lihat Soal
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: IMPOR EXCEL */}
      {activeTab === 'excel' && (
        <ExcelManager
          onImportStudents={handleImportStudents}
          onImportTeachers={handleImportTeachers}
          onImportSubjects={handleImportSubjects}
        />
      )}

      {/* CREATE EXAM MODAL */}
      {isCreateExamOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 my-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Buat Paket Ujian Baru
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Isi data pokok asesmen sebelum memasukkan butir pertanyaan.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateExamSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Judul Asesmen / Paket Ujian <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newExamTitle}
                  onChange={e => setNewExamTitle(e.target.value)}
                  placeholder="Misal: Penilaian Tengah Semester Gasal (PTS)"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block font-bold text-slate-700 mb-1">
                    Mata Pelajaran <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newExamSubjectId}
                    onChange={e => setNewExamSubjectId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white font-medium text-slate-800"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Durasi Waktu (Menit)
                  </label>
                  <input
                    type="number"
                    value={newExamDuration}
                    onChange={e => setNewExamDuration(Number(e.target.value))}
                    min={5}
                    max={240}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    KKM / Nilai Ketuntasan
                  </label>
                  <input
                    type="number"
                    value={newExamPassingScore}
                    onChange={e => setNewExamPassingScore(Number(e.target.value))}
                    min={10}
                    max={100}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium"
                  />
                </div>
              </div>

              {/* TARGET KELAS MULTI-SELECT */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5 flex flex-wrap items-center justify-between gap-1">
                  <span className="flex items-center gap-1.5 text-xs">
                    <span>Target Kelas / Rombel Peserta Ujian</span>
                    <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[11px] font-normal text-slate-500">
                    Bisa dipilih multi: Tingkat (7, 8, 9) & Rombel (7A-7H, 8A-8H, 9A-9H)
                  </span>
                </label>
                <TargetClassMultiSelect
                  selectedClasses={newExamClasses}
                  onChange={setNewExamClasses}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Petunjuk & Instruksi Pengerjaan
                </label>
                <textarea
                  rows={2}
                  value={newExamInstructions}
                  onChange={e => setNewExamInstructions(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateExamOpen(false)}
                  className="px-4 py-2.5 text-slate-600 hover:text-slate-900 font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Simpan & Buat Soal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUESTION CREATOR / EDITOR MODAL */}
      {isQuestionModalOpen && targetExamForQuestion && (
        <QuestionCreatorModal
          exam={targetExamForQuestion}
          initialQuestion={editingQuestion}
          isOpen={isQuestionModalOpen}
          onClose={() => {
            setIsQuestionModalOpen(false);
            setEditingQuestion(null);
          }}
          onSaveQuestion={handleSaveQuestion}
        />
      )}

      {/* IN-APP CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        isDanger={confirmDialog.isDanger}
        isLoading={confirmDialog.isLoading}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />

    </div>
  );
};
