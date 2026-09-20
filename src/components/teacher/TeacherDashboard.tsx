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
  addQuestion,
  updateQuestion,
  deleteQuestion,
  overwriteUsersByRole,
  overwriteAllSubjects
} from '../../utils/storage';
import { BankSoalReport } from './BankSoalReport';
import { ClassScoreRecap } from './ClassScoreRecap';
import { ExcelManager } from './ExcelManager';
import { QuestionCreatorModal } from './QuestionCreatorModal';
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
  BookOpen
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
  const [newExamClasses, setNewExamClasses] = useState('X-IPA-1, X-IPA-2');
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
    if (window.confirm('Apakah Anda yakin ingin menghapus butir soal ini?')) {
      deleteQuestion(qId);
      setQuestions(getAllQuestions());
    }
  };

  // Handle Create New Exam
  const handleCreateExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamTitle.trim()) return;

    const chosenSubject = subjects.find(s => s.id === newExamSubjectId) || subjects[0];
    const newExam: Exam = {
      id: `exam_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: newExamTitle.trim(),
      subjectId: chosenSubject.id,
      subjectName: chosenSubject.name,
      teacherId: teacher.id,
      teacherName: teacher.name,
      targetClasses: newExamClasses
        .split(',')
        .map(c => c.trim())
        .filter(Boolean),
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
  };

  // Handle Excel Imports - Mengganti/menindih data lama dengan data baru dari file Excel
  const handleImportStudents = (newStudents: User[]) => {
    overwriteUsersByRole('siswa', newStudents);
    alert(`Berhasil memperbarui data! Seluruh data siswa lama telah ditindih dengan ${newStudents.length} data siswa baru dari Excel.`);
  };

  const handleImportTeachers = (newTeachers: User[]) => {
    // Retain current logged-in teacher if not present in the new list to avoid sudden session ejection
    const hasCurrentTeacher = newTeachers.some(
      t => t.id === teacher.id || t.username.toLowerCase() === teacher.username.toLowerCase()
    );
    const finalTeachers = hasCurrentTeacher ? newTeachers : [teacher, ...newTeachers];

    overwriteUsersByRole('guru', finalTeachers);
    alert(`Berhasil memperbarui data! Seluruh data guru telah ditindih dengan ${newTeachers.length} data guru baru dari Excel.`);
  };

  const handleImportSubjects = (newSubjects: Subject[]) => {
    overwriteAllSubjects(newSubjects);
    setSubjects(newSubjects);
    alert(`Berhasil memperbarui data! Seluruh data mata pelajaran lama telah ditindih dengan ${newSubjects.length} mata pelajaran baru dari Excel.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
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
            NIP: <span className="font-mono">{teacher.nipOrNis || '-'}</span> • Pengampu:{' '}
            <span className="font-semibold">{teacher.subjectName || 'Informatika & Sains'}</span>. Kelola bank soal, pantau rekapitulasi ujian siswa, dan impor data secara praktis.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center min-w-[110px]">
            <span className="text-xs text-emerald-200 font-medium block">Total Soal</span>
            <span className="text-2xl font-extrabold text-white">{questions.length} Butir</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center min-w-[110px]">
            <span className="text-xs text-emerald-200 font-medium block">Hasil Ujian</span>
            <span className="text-2xl font-extrabold text-amber-300">{submissions.length} Lembar</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (No Print) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 no-print">
        <button
          type="button"
          onClick={() => setActiveTab('rekap')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'rekap'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Rekap Hasil Ujian Siswa</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bank_soal')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'bank_soal'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Input Bank Soal</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('paket_ujian')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'paket_ujian'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Kelola Paket Ujian</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('excel')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'excel'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Impor Excel (.xlsx)</span>
        </button>
      </div>

      {/* TAB 1: REKAP HASIL UJIAN SISWA */}
      {activeTab === 'rekap' && (
        <ClassScoreRecap
          submissions={submissions}
          exams={exams}
          subjects={subjects}
        />
      )}

      {/* TAB 2: LAPORAN BANK SOAL */}
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
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Daftar Paket Ujian Terjadwal
              </h3>
              <p className="text-xs text-slate-500">
                Atur durasi, target kelas, dan tambahkan butir soal ke masing-masing paket.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreateExamOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Paket Ujian Baru</span>
            </button>
          </div>

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
                      <span className="text-xs text-slate-500 font-medium">
                        Dibuat: {ex.createdAt}
                      </span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Buat Paket Ujian Baru
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Isi data pokok asesmen sebelum memasukkan butir pertanyaan.
            </p>

            <form onSubmit={handleCreateExamSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Judul Ujian <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newExamTitle}
                  onChange={(e) => setNewExamTitle(e.target.value)}
                  placeholder="Contoh: Asesmen Tengah Semester Informatika X"
                  required
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mata Pelajaran
                  </label>
                  <select
                    value={newExamSubjectId}
                    onChange={(e) => setNewExamSubjectId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Durasi (Menit)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={newExamDuration}
                    onChange={(e) => setNewExamDuration(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Kelas (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={newExamClasses}
                  onChange={(e) => setNewExamClasses(e.target.value)}
                  placeholder="Contoh: X-IPA-1, X-IPA-2, XI-IPA-1"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Petunjuk & Instruksi Pengerjaan
                </label>
                <textarea
                  rows={2}
                  value={newExamInstructions}
                  onChange={(e) => setNewExamInstructions(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateExamOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Simpan & Buat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUESTION CREATOR MODAL */}
      {targetExamForQuestion && (
        <QuestionCreatorModal
          exam={targetExamForQuestion}
          isOpen={isQuestionModalOpen}
          onClose={() => setIsQuestionModalOpen(false)}
          onSaveQuestion={handleSaveQuestion}
          initialQuestion={editingQuestion}
        />
      )}

    </div>
  );
};
