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
import { QuestionCreatorModal } from './QuestionCreatorModal';
import { ConfirmModal } from '../ConfirmModal';
import { TargetClassMultiSelect, ALL_ROMPEL_CLASSES } from './TargetClassMultiSelect';
import {
  FileText,
  BarChart3,
  Plus,
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
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowRight,
  Filter
} from 'lucide-react';

interface TeacherDashboardProps {
  teacher: User;
  initialTab?: 'rekap' | 'bank_soal' | 'paket_ujian';
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ teacher, initialTab = 'paket_ujian' }) => {
  const [activeTab, setActiveTab] = useState<'rekap' | 'bank_soal' | 'paket_ujian'>(initialTab);
  const [selectedSubjectName, setSelectedSubjectName] = useState<string | null>(null);
  const [searchSubjectQuery, setSearchSubjectQuery] = useState('');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [exams, setExams] = useState<Exam[]>(getAllExams());
  const [questions, setQuestions] = useState<Question[]>(getAllQuestions());
  const [subjects, setSubjects] = useState<Subject[]>(getAllSubjects());
  const [submissions, setSubmissions] = useState<ExamSubmission[]>(getAllSubmissions());
  
  // Multi-User Teacher Accounts
  const [allTeachers, setAllTeachers] = useState<User[]>(() => {
    const list = getAllUsers().filter(u => u.role === 'guru');
    return list.length > 0 ? list : [teacher];
  });
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(teacher.id);
  const activeTeacher = allTeachers.find(t => t.id === selectedTeacherId) || teacher;

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
  const [newExamUploadDate, setNewExamUploadDate] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );

  // Collect all unique available subject names
  const allSubjectNamesSet = new Set<string>();
  subjects.forEach(s => allSubjectNamesSet.add(s.name));
  exams.forEach(e => {
    if (e.subjectName) allSubjectNamesSet.add(e.subjectName);
  });
  const allSubjectNamesList = Array.from(allSubjectNamesSet);

  // Filter dataset for current selected subject (if any)
  const displayExams = selectedSubjectName
    ? exams.filter(e => e.subjectName === selectedSubjectName)
    : exams;

  const displayQuestions = selectedSubjectName
    ? questions.filter(q => {
        const ex = exams.find(e => e.id === q.examId);
        return ex?.subjectName === selectedSubjectName;
      })
    : questions;

  const displaySubmissions = selectedSubjectName
    ? submissions.filter(s => s.subjectName === selectedSubjectName)
    : submissions;

  const displaySubjects = selectedSubjectName
    ? subjects.filter(s => s.name === selectedSubjectName)
    : subjects;

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
    const uploadIso = newExamUploadDate ? new Date(newExamUploadDate).toISOString() : new Date().toISOString();

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
      createdAt: new Date().toISOString().split('T')[0],
      uploadDate: uploadIso
    };

    addExam(newExam);
    setExams(getAllExams());
    setIsCreateExamOpen(false);
    setNewExamTitle('');
    setNewExamClasses(['7A', '7B']);
    showNotification('success', `Paket ujian "${newExam.title}" berhasil dibuat dengan tanggal upload ${new Date(uploadIso).toLocaleString('id-ID')}!`);
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

  // Color themes for subject cards
  const getSubjectTheme = (index: number) => {
    const themes = [
      { bg: 'from-emerald-600 to-teal-800', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
      { bg: 'from-indigo-600 to-indigo-800', badge: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
      { bg: 'from-amber-500 to-orange-700', badge: 'bg-amber-50 text-amber-700 border-amber-100' },
      { bg: 'from-purple-600 to-pink-800', badge: 'bg-purple-50 text-purple-700 border-purple-100' },
      { bg: 'from-blue-600 to-cyan-800', badge: 'bg-blue-50 text-blue-700 border-blue-100' },
      { bg: 'from-rose-600 to-red-800', badge: 'bg-rose-50 text-rose-700 border-rose-100' }
    ];
    return themes[index % themes.length];
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8 overflow-x-hidden">
      
      {/* Global In-App Notification Toast */}
      {notification && (
        <div className="fixed top-16 sm:top-20 right-3 sm:right-8 left-3 sm:left-auto z-50 animate-in fade-in slide-in-from-top duration-200">
          <div
            className={`flex items-center gap-3 px-4 sm:px-5 py-3 rounded-2xl shadow-xl border text-xs sm:text-sm font-semibold max-w-md mx-auto sm:mx-0 ${
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
      <div className="bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-950 rounded-3xl p-4 sm:p-8 lg:p-10 text-white shadow-xl shadow-teal-950/20 no-print relative overflow-hidden border border-teal-800/30">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-3 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-teal-200 border border-white/15 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Dashboard Guru Pengampu</span>
              </div>

              {/* Multi User Teacher Account Selector */}
              {allTeachers.length > 1 && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 backdrop-blur-md rounded-full text-xs font-bold text-emerald-200 border border-emerald-400/30 max-w-full min-w-0">
                  <Users className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  <span className="shrink-0">Switch:</span>
                  <select
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    className="bg-transparent text-white font-extrabold text-xs outline-none cursor-pointer border-b border-dashed border-emerald-300/60 truncate max-w-[130px] sm:max-w-[180px]"
                  >
                    {allTeachers.map((t) => (
                      <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                        {t.name} ({t.subjectName || 'Guru'})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white break-words">
              Selamat Datang, {activeTeacher.name}
            </h1>

            {/* Teacher Specs Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-teal-100 font-medium min-w-0">
              <span className="px-2.5 py-1 bg-white/10 backdrop-blur-xs rounded-xl border border-white/15 flex items-center gap-1.5 font-semibold min-w-0 max-w-full">
                <Users className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                <span className="truncate">Pengampu: <strong className="text-white font-extrabold">{activeTeacher.name}</strong></span>
              </span>
              <span className="px-2.5 py-1 bg-white/10 backdrop-blur-xs rounded-xl border border-white/15 flex items-center gap-1.5 font-semibold min-w-0 max-w-full">
                <BookOpen className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="truncate">Mapel Aktif: <strong className="text-amber-200 font-extrabold">{selectedSubjectName || 'Semua Mapel'}</strong></span>
              </span>
              <span className="px-2.5 py-1 bg-white/10 backdrop-blur-xs rounded-xl border border-white/15 flex items-center gap-1.5 font-semibold min-w-0 max-w-full">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span className="truncate">Rombel: <strong className="text-emerald-200 font-extrabold">{activeTeacher.classGroup || '7A - 9H'}</strong></span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 sm:gap-3 w-full lg:w-auto shrink-0">
            <div className="bg-white/10 backdrop-blur-md px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl border border-white/15 text-center min-w-0 shadow-2xs">
              <span className="text-[10px] sm:text-[11px] text-teal-200 font-bold block">Paket Ujian</span>
              <span className="text-lg sm:text-xl font-black text-white">{displayExams.length}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl border border-white/15 text-center min-w-0 shadow-2xs">
              <span className="text-[10px] sm:text-[11px] text-teal-200 font-bold block">Bank Soal</span>
              <span className="text-lg sm:text-xl font-black text-amber-300">{displayQuestions.length}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsCreateExamOpen(true)}
              className="col-span-2 sm:col-span-1 px-4 sm:px-5 py-3 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
              <span>Buat Paket Ujian Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* STEP 1: IF NO SUBJECT IS SELECTED, SHOW ALL AVAILABLE SUBJECTS (SEMUA MATA PELAJARAN) */}
      {!selectedSubjectName ? (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-emerald-600" />
                <span>Pilih Mata Pelajaran Pengampu</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Silakan pilih mata pelajaran untuk mengelola Kelola Paket Ujian, Bank Soal & Kisi-kisi, dan Rekap Nilai
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchSubjectQuery}
                onChange={e => setSearchSubjectQuery(e.target.value)}
                placeholder="Cari mata pelajaran..."
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {allSubjectNamesList
              .filter(name => !searchSubjectQuery || name.toLowerCase().includes(searchSubjectQuery.toLowerCase()))
              .map((subjectName, idx) => {
                const subjectObj = subjects.find(s => s.name === subjectName);
                const subjExams = exams.filter(e => e.subjectName === subjectName);
                const subjQuestCount = questions.filter(q => {
                  const ex = exams.find(e => e.id === q.examId);
                  return ex?.subjectName === subjectName;
                }).length;
                const theme = getSubjectTheme(idx);

                return (
                  <div
                    key={subjectName}
                    onClick={() => {
                      setSelectedSubjectName(subjectName);
                      setActiveTab('paket_ujian');
                    }}
                    className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all duration-200 p-6 flex flex-col justify-between cursor-pointer group card-hover-effect relative overflow-hidden"
                  >
                    <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${theme.bg}`}></div>

                    <div className="space-y-4 pt-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${theme.bg} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform shrink-0`}>
                          <GraduationCap className="w-6 h-6" />
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${theme.badge}`}>
                          {subjExams.length} Paket Ujian
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          {subjectObj?.code || `MAPEL-${idx + 1}`}
                        </span>
                        <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors tracking-tight leading-snug mt-0.5">
                          {subjectName}
                        </h3>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 font-medium">
                          <span>Bank Soal: <strong className="text-slate-800">{subjQuestCount} Butir</strong></span>
                          <span>•</span>
                          <span>KKM: <strong className="text-emerald-700">{subjectObj?.passingGrade || 75} Poin</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-700 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        <span>Kelola Mata Pelajaran</span>
                        <ArrowRight className="w-4 h-4" />
                      </span>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ) : (
        /* STEP 2: IF SUBJECT IS SELECTED, SHOW SUBJECT WORKSPACE WITH 3 TABS */
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Selected Subject Header */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedSubjectName(null)}
                className="p-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Kembali ke Semua Mapel</span>
              </button>
              <div>
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
                  Workspace Mata Pelajaran
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  {selectedSubjectName}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedSubjectName(null)}
              className="text-xs text-slate-500 hover:text-slate-800 font-bold underline cursor-pointer"
            >
              Ganti Mata Pelajaran Lain
            </button>
          </div>

          {/* Navigation Tabs for Selected Subject (No Print) */}
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/80 rounded-2xl w-full no-print overflow-x-auto shadow-inner scrollbar-thin">
            <button
              type="button"
              onClick={() => setActiveTab('paket_ujian')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'paket_ujian'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Kelola Paket Ujian ({displayExams.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('bank_soal')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'bank_soal'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>Kisi-kisi & Bank Soal</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('rekap')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'rekap'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>Rekap & Analisa Nilai</span>
            </button>
          </div>

          {/* TAB 1: KELOLA PAKET UJIAN */}
          {activeTab === 'paket_ujian' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Daftar Paket Ujian Terjadwal ({selectedSubjectName})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Atur durasi, target kelas, dan tambahkan butir soal ke masing-masing paket ujian.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {displayExams.length > 0 && (
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

              {displayExams.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <Layers className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-slate-800 mb-1">
                    Belum Ada Paket Ujian untuk {selectedSubjectName}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
                    Buat paket ujian baru untuk mata pelajaran {selectedSubjectName} dan tentukan tanggal upload rilis agar dapat dikerjakan oleh siswa.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsCreateExamOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/10 cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Buat Paket Ujian Sekarang</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {displayExams.map(ex => {
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

                          {/* Tanggal Upload Rilis Badge */}
                          <div className="bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-100 text-xs text-indigo-950 flex items-center gap-2 font-medium mb-2">
                            <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                            <span>
                              <strong>Tanggal Upload Rilis:</strong>{' '}
                              <span className="text-indigo-800 font-bold">
                                {ex.uploadDate
                                  ? new Date(ex.uploadDate).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) + ' WIB'
                                  : 'Langsung Aktif'}
                              </span>
                            </span>
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
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          >
                            Kelola Soal
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: KISI-KISI & BANK SOAL */}
          {activeTab === 'bank_soal' && (
            <BankSoalReport
              teacher={teacher}
              exams={displayExams}
              questions={displayQuestions}
              subjects={displaySubjects}
              onAddQuestion={handleOpenAddQuestion}
              onEditQuestion={handleOpenEditQuestion}
              onDeleteQuestion={handleDeleteQuestion}
            />
          )}

          {/* TAB 3: REKAPITULASI NILAI */}
          {activeTab === 'rekap' && (
            <ClassScoreRecap
              submissions={displaySubmissions}
              exams={displayExams}
              subjects={displaySubjects}
            />
          )}

        </div>
      )}

      {/* CREATE NEW EXAM MODAL */}
      {isCreateExamOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 p-3 sm:p-6 flex items-start sm:items-center justify-center min-h-screen">
          <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-xl w-full shadow-2xl border border-slate-100 my-auto max-h-[88vh] flex flex-col overflow-hidden my-4 sm:my-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Buat Paket Ujian Baru
                  </h3>
                  <p className="text-xs text-slate-500">
                    Atur judul, jadwal rilis tanggal upload, durasi, dan target rombel siswa.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateExamOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExamSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-4 text-xs pr-1.5 scrollbar-thin">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Judul Paket Ujian <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Misal: PTS Genap Informatika Kelas X"
                    value={newExamTitle}
                    onChange={e => setNewExamTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Mata Pelajaran
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

                  {/* Tanggal & Waktu Upload Rilis */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Tanggal & Waktu Upload Rilis</span>
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={newExamUploadDate}
                      onChange={e => setNewExamUploadDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium text-slate-800"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      🔒 Siswa tidak dapat melihat paket ujian ini sebelum tanggal/waktu ini tiba.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t border-slate-100 shrink-0">
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
