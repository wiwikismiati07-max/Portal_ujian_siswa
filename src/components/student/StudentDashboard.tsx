import React, { useState, useEffect } from 'react';
import { User, Exam, ExamSubmission, Subject } from '../../types';
import { getAllExams, getAllSubmissions, getQuestionsByExamId, getAllSubjects } from '../../utils/storage';
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
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Search,
  GraduationCap,
  ArrowRight,
  UserCheck
} from 'lucide-react';

interface StudentDashboardProps {
  student: User;
  onStartExam: (exam: Exam) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ student, onStartExam }) => {
  const [exams, setExams] = useState<Exam[]>(getAllExams());
  const [submissions, setSubmissions] = useState<ExamSubmission[]>(getAllSubmissions());
  const [subjects, setSubjects] = useState<Subject[]>(getAllSubjects());
  const [selectedSubjectName, setSelectedSubjectName] = useState<string | null>(null);
  const [selectedExamForModal, setSelectedExamForModal] = useState<Exam | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

  useEffect(() => {
    const handleUpdate = () => {
      setExams(getAllExams());
      setSubmissions(getAllSubmissions());
      setSubjects(getAllSubjects());
    };
    window.addEventListener('cbt_storage_update', handleUpdate);
    return () => window.removeEventListener('cbt_storage_update', handleUpdate);
  }, []);

  // Filter exams that are active, targeted to this student's class, and whose uploadDate has arrived
  const studentClass = student.classGroup || '';
  const availableExams = exams.filter(e => {
    if (e.status !== 'active') return false;

    // Check upload date / schedule release date
    if (e.uploadDate) {
      const uploadTime = new Date(e.uploadDate).getTime();
      if (!isNaN(uploadTime) && Date.now() < uploadTime) {
        return false; // Hide exam from students until upload date/time is reached
      }
    }

    return isStudentEligibleForExam(e.targetClasses, studentClass);
  });

  // Check submissions by this student
  const mySubmissions = submissions.filter(
    s => s.studentId === student.id && s.submittedAt && !s.id.startsWith('unsub_') && !s.id.startsWith('unsubmitted_')
  );
  const myCompletedExamIds = new Set(mySubmissions.map(s => s.examId));

  // Split available exams into pending (Belum Dikerjakan) and completed (Sudah Selesai)
  const pendingExams = availableExams.filter(e => !myCompletedExamIds.has(e.id));
  const completedExams = availableExams.filter(e => myCompletedExamIds.has(e.id));

  // Only subjects that have exams for this student
  // Pending subjects: only subjects that currently have exams that need to be taken
  const pendingSubjectNames = Array.from(
    new Set(pendingExams.map(e => e.subjectName).filter(Boolean))
  );
  // Completed subjects: subjects where student has finished at least 1 exam
  const completedSubjectNames = Array.from(
    new Set(completedExams.map(e => e.subjectName).filter(Boolean))
  );

  const currentSubjectNamesList = activeTab === 'pending' ? pendingSubjectNames : completedSubjectNames;

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

  // Filtered exams based on current active tab (pending vs completed), selected subject, or search query
  const currentExamPool = activeTab === 'pending' ? pendingExams : completedExams;
  const displayedExams = currentExamPool.filter(e => {
    if (selectedSubjectName && e.subjectName !== selectedSubjectName) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        e.subjectName.toLowerCase().includes(q) ||
        (e.instructions || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Assign distinct gradient color themes to subject cards
  const getSubjectTheme = (index: number) => {
    const themes = [
      { bg: 'from-indigo-600 to-indigo-800', border: 'border-indigo-200', text: 'text-indigo-700', badge: 'bg-indigo-50 text-indigo-700' },
      { bg: 'from-emerald-600 to-teal-800', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-50 text-emerald-700' },
      { bg: 'from-amber-500 to-orange-700', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-50 text-amber-700' },
      { bg: 'from-purple-600 to-pink-800', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-50 text-purple-700' },
      { bg: 'from-blue-600 to-cyan-800', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-50 text-blue-700' },
      { bg: 'from-rose-600 to-red-800', border: 'border-rose-200', text: 'text-rose-700', badge: 'bg-rose-50 text-rose-700' }
    ];
    return themes[index % themes.length];
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      
      {/* Welcome Banner - Soft Light Palette */}
      <div className="bg-gradient-to-br from-indigo-50/90 via-sky-50/60 to-white rounded-3xl p-6 sm:p-8 lg:p-10 text-slate-800 shadow-sm relative overflow-hidden border border-indigo-200/80">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full text-xs font-bold text-indigo-700 border border-indigo-200 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Ruang Belajar & Ujian Siswa SPANJU</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
              {getGreeting()}, {student.name}!
            </h1>
            
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs sm:text-sm text-slate-600 font-medium">
              <span className="px-2.5 py-1 bg-white rounded-lg border border-slate-200 font-mono shadow-2xs text-slate-700">
                NIS: {student.nipOrNis || '-'}
              </span>
              <span className="px-2.5 py-1 bg-white rounded-lg border border-slate-200 shadow-2xs text-slate-700">
                Kelas: <strong className="text-indigo-700 font-bold">{studentClass}</strong>
              </span>
              <span className="text-slate-500 hidden sm:inline">
                • Sistem Asesmen Berbasis Komputer
              </span>
            </div>
          </div>

          {/* Quick Stats Bento Cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 shrink-0">
            <div
              onClick={() => { setActiveTab('pending'); setSelectedSubjectName(null); }}
              className={`p-3.5 sm:p-4 rounded-2xl border text-center min-w-[100px] sm:min-w-[110px] shadow-xs cursor-pointer transition-all ${
                activeTab === 'pending'
                  ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20'
                  : 'bg-white border-indigo-100 hover:bg-slate-50'
              }`}
            >
              <span className="text-[11px] text-slate-500 font-bold block mb-1">Ujian Tersedia</span>
              <div className="flex items-center justify-center gap-1.5">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                <span className="text-xl sm:text-2xl font-extrabold text-indigo-700">{pendingExams.length}</span>
              </div>
            </div>

            <div
              onClick={() => { setActiveTab('completed'); setSelectedSubjectName(null); }}
              className={`p-3.5 sm:p-4 rounded-2xl border text-center min-w-[100px] sm:min-w-[110px] shadow-xs cursor-pointer transition-all ${
                activeTab === 'completed'
                  ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
                  : 'bg-white border-indigo-100 hover:bg-slate-50'
              }`}
            >
              <span className="text-[11px] text-slate-500 font-bold block mb-1">Ujian Selesai</span>
              <div className="flex items-center justify-center gap-1.5">
                <FileCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900">{completedCount}</span>
              </div>
            </div>

            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-indigo-100 text-center min-w-[100px] sm:min-w-[110px] shadow-xs">
              <span className="text-[11px] text-slate-500 font-bold block mb-1">Rata-rata Nilai</span>
              <div className="flex items-center justify-center gap-1.5">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                <span className="text-xl sm:text-2xl font-extrabold text-amber-600">{avgScore}%</span>
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

      {/* MAIN NAVIGATION CONTENT */}
      {!selectedSubjectName ? (
        /* STEP 1: DISPLAY ONLY SUBJECTS WITH EXAMS FOR THIS STUDENT */
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-indigo-600" />
                <span>
                  {activeTab === 'pending'
                    ? `Mata Pelajaran Ujian Tersedia (${pendingSubjectNames.length} Mapel)`
                    : `Riwayat Ujian Selesai (${completedSubjectNames.length} Mapel)`}
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {activeTab === 'pending'
                  ? `Hanya menampilkan mata pelajaran yang memiliki paket ujian aktif untuk kelas ${studentClass} yang belum dikerjakan.`
                  : `Daftar mata pelajaran dan hasil penilaian ujian yang telah Anda selesaikan.`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Tab Navigation Pill */}
              <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('pending')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'pending'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Ujian Tersedia ({pendingExams.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('completed')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'completed'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Ujian Selesai ({completedExams.length})</span>
                </button>
              </div>

              {/* Quick Search */}
              <div className="relative w-full sm:w-56">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Cari mata pelajaran..."
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          {/* Subjects Grid or Empty States */}
          {currentSubjectNamesList.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xs text-center">
              {activeTab === 'pending' ? (
                <>
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3.5 text-emerald-600 border border-emerald-100">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Tidak Ada Ujian yang Perlu Dikerjakan
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                    {completedExams.length > 0
                      ? `Seluruh paket ujian yang dijadwalkan untuk kelas ${studentClass} telah selesai Anda kerjakan. Mata pelajaran yang sudah selesai disembunyikan agar tampilan tetap rapi.`
                      : `Saat ini belum ada paket soal ujian aktif yang dijadwalkan untuk kelas ${studentClass}.`}
                  </p>
                  {completedExams.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('completed')}
                      className="mt-5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer inline-flex items-center gap-2"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>Lihat Riwayat & Nilai Ujian Selesai ({completedExams.length})</span>
                    </button>
                  )}
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3.5 text-slate-400 border border-slate-200">
                    <FileCheck className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-800">
                    Belum Ada Riwayat Ujian Selesai
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    Anda belum menyelesaikan paket ujian apapun. Silakan buka tab &quot;Ujian Tersedia&quot; untuk memulai ujian Anda.
                  </p>
                  {pendingExams.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('pending')}
                      className="mt-5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer inline-flex items-center gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Buka Ujian Tersedia ({pendingExams.length})</span>
                    </button>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {currentSubjectNamesList
                .filter(name => !searchQuery || name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((subjectName, idx) => {
                  const subjectObj = subjects.find(s => s.name === subjectName);
                  const examCountForThis = (activeTab === 'pending' ? pendingExams : completedExams).filter(
                    e => e.subjectName === subjectName
                  ).length;
                  const theme = getSubjectTheme(idx);

                  // Extract actual teacher(s) who created/assigned exams for this subject in the student's class
                  const examsForThisSubject = availableExams.filter(
                    e => e.subjectName.trim().toLowerCase() === subjectName.trim().toLowerCase() ||
                         (subjectObj && e.subjectId === subjectObj.id)
                  );
                  const examTeachers = Array.from(
                    new Set(examsForThisSubject.map(e => e.teacherName?.trim()).filter(Boolean))
                  ) as string[];
                  const displayTeacherName = examTeachers.length > 0
                    ? examTeachers.join(', ')
                    : (subjectObj?.teacherName || '');

                  return (
                    <div
                      key={subjectName}
                      onClick={() => setSelectedSubjectName(subjectName)}
                      className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-indigo-300 transition-all duration-200 p-6 flex flex-col justify-between cursor-pointer group card-hover-effect relative overflow-hidden"
                    >
                      {/* Top Accent Gradient Bar */}
                      <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${theme.bg}`}></div>

                      <div className="space-y-4 pt-1">
                        <div className="flex items-center justify-between gap-3">
                          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${theme.bg} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform shrink-0`}>
                            <GraduationCap className="w-6 h-6" />
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                            activeTab === 'pending'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}>
                            {activeTab === 'pending'
                              ? `⚡ ${examCountForThis} Paket Tersedia`
                              : `✅ ${examCountForThis} Paket Selesai`}
                          </span>
                        </div>

                        <div>
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            {subjectObj?.code || `MAPEL-${idx + 1}`}
                          </span>
                          <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight leading-snug mt-0.5">
                            {subjectName}
                          </h3>
                          {displayTeacherName && (
                            <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1">
                              <span>Pengampu:</span>
                              <strong className="text-slate-700 font-bold">{displayTeacherName}</strong>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="font-bold text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          <span>{activeTab === 'pending' ? 'Kerjakan Paket Soal' : 'Lihat Hasil Nilai'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </span>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      ) : (
        /* STEP 2: DISPLAY ACTIVE OR COMPLETED EXAM PACKAGES FOR THE SELECTED SUBJECT */
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedSubjectName(null)}
                className="p-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Kembali ke Daftar Mapel</span>
              </button>
              <div>
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
                  {activeTab === 'pending' ? 'Paket Ujian Belum Dikerjakan' : 'Riwayat Hasil Ujian Selesai'}
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  Mata Pelajaran: {selectedSubjectName}
                </h2>
              </div>
            </div>

            {/* Quick Toggle Inside Subject View */}
            <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'pending'
                    ? 'bg-white text-indigo-700 shadow-xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Belum Dikerjakan ({pendingExams.filter(e => e.subjectName === selectedSubjectName).length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('completed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'completed'
                    ? 'bg-white text-emerald-700 shadow-xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Selesai ({completedExams.filter(e => e.subjectName === selectedSubjectName).length})</span>
              </button>
            </div>
          </div>

          {displayedExams.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-base font-extrabold text-slate-700">
                {activeTab === 'pending' ? 'Tidak Ada Paket Soal yang Perlu Dikerjakan' : 'Belum Ada Ujian yang Selesai'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {activeTab === 'pending'
                  ? `Seluruh paket ujian pada mata pelajaran ${selectedSubjectName} telah Anda selesaikan! Hasil ujian dapat dilihat pada tab Selesai.`
                  : `Anda belum menyelesaikan paket soal untuk mata pelajaran ${selectedSubjectName}.`}
              </p>
              <button
                type="button"
                onClick={() => setSelectedSubjectName(null)}
                className="mt-4 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Kembali ke Daftar Mata Pelajaran
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayedExams.map(exam => {
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

                      {/* Detailed Schedule Info */}
                      <div className="bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100/80 space-y-1.5 text-xs">
                        <div className="flex items-center gap-2 text-indigo-950 font-semibold">
                          <UserCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="text-[11px]">
                            <strong>Guru Pengampu:</strong> {exam.teacherName || 'Guru Pengampu'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-indigo-950 font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="text-[11px]">
                            <strong>Hari & Tanggal:</strong> {exam.createdAt ? new Date(exam.createdAt).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Senin, 22 September 2026'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-indigo-950 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="text-[11px]">
                            <strong>Waktu Ujian:</strong> 08:00 - 09:30 WIB ({exam.durationMinutes} Menit)
                          </span>
                        </div>
                      </div>

                      {/* Metadata specs */}
                      <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-xs text-slate-600">
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
      )}

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
                <span className="text-slate-500">Guru Pengampu / Pembuat Soal:</span>
                <span className="font-bold text-indigo-700">{selectedExamForModal.teacherName || '-'}</span>
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
