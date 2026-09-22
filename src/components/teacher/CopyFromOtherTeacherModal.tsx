import React, { useState, useMemo } from 'react';
import { Exam, Question, Subject, User } from '../../types';
import { copyExamWithQuestionsDirect, getAllUsers } from '../../utils/storage';
import { isSameTeacher } from '../../utils/userDeduplication';
import { TargetClassMultiSelect } from './TargetClassMultiSelect';
import {
  X,
  Copy,
  Users,
  Search,
  BookOpen,
  Filter,
  CheckCircle2,
  Calendar,
  Clock,
  Award,
  ChevronRight,
  ArrowLeft,
  Eye,
  FileQuestion,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface CopyFromOtherTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTeacher: User;
  allTeachers: User[];
  allExams: Exam[];
  allQuestions: Question[];
  allSubjects: Subject[];
  onSuccessCopy: (newExam: Exam, copiedCount: number) => void;
}

export const CopyFromOtherTeacherModal: React.FC<CopyFromOtherTeacherModalProps> = ({
  isOpen,
  onClose,
  activeTeacher,
  allTeachers,
  allExams,
  allQuestions,
  allSubjects,
  onSuccessCopy
}) => {
  // Step 1: browse/select source exam; Step 2: configure target exam details
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSourceTeacher, setSelectedSourceTeacher] = useState<string>('all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [onlyOtherTeachers, setOnlyOtherTeachers] = useState<boolean>(true);

  // Preview questions accordion/drawer state
  const [previewExamId, setPreviewExamId] = useState<string | null>(null);

  // Step 2 Form State
  const [newTitle, setNewTitle] = useState('');
  const [targetSubjectId, setTargetSubjectId] = useState('');
  const [targetClasses, setTargetClasses] = useState<string[]>(['7A', '7B']);
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [passingScore, setPassingScore] = useState(75);
  const [uploadDate, setUploadDate] = useState<string>(() => {
    return new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [instructions, setInstructions] = useState('Kerjakan soal dengan cermat dan jujur.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Real-time active teachers list - excludes any teacher accounts that have been deleted
  const activeGuruList = useMemo(() => {
    const liveUsers = getAllUsers().filter(u => u.role === 'guru');
    return liveUsers.length > 0 ? liveUsers : allTeachers;
  }, [allTeachers]);

  // Filter exams available for copying
  const availableExams = useMemo(() => {
    return allExams.filter(exam => {
      // 1. Exclude exams whose creator teacher has been deleted from user accounts
      const isCreatorActive = activeGuruList.some(g =>
        isSameTeacher(g, { id: exam.teacherId, name: exam.teacherName })
      );
      if (!isCreatorActive) return false;

      // 2. Filter out own exams if onlyOtherTeachers is checked
      if (onlyOtherTeachers) {
        const isOwn = isSameTeacher(activeTeacher, { id: exam.teacherId, name: exam.teacherName });
        if (isOwn) return false;
      }

      // 3. Filter by selected source teacher
      if (selectedSourceTeacher !== 'all') {
        const targetGuru = activeGuruList.find(g => g.id === selectedSourceTeacher);
        const matchesTeacher =
          exam.teacherId === selectedSourceTeacher ||
          (targetGuru && isSameTeacher(targetGuru, { id: exam.teacherId, name: exam.teacherName }));
        if (!matchesTeacher) return false;
      }

      // 4. Filter by subject
      if (selectedSubjectFilter !== 'all' && exam.subjectName !== selectedSubjectFilter) {
        return false;
      }

      // 5. Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = exam.title.toLowerCase().includes(q);
        const inSubject = exam.subjectName.toLowerCase().includes(q);
        const inTeacher = (exam.teacherName || '').toLowerCase().includes(q);
        if (!inTitle && !inSubject && !inTeacher) return false;
      }

      return true;
    });
  }, [allExams, activeGuruList, onlyOtherTeachers, activeTeacher, selectedSourceTeacher, selectedSubjectFilter, searchQuery]);

  // When an exam is selected to be copied, initialize Step 2 values
  const handleSelectExam = (exam: Exam) => {
    setSelectedExam(exam);
    setNewTitle(`${exam.title} (Salinan ${activeTeacher.name})`);
    
    // Choose subject: prioritize activeTeacher subject, or matching subject from exam
    const matchingSubject = allSubjects.find(s => s.name === exam.subjectName) ||
                            allSubjects.find(s => s.name === activeTeacher.subjectName) ||
                            allSubjects[0];
    if (matchingSubject) {
      setTargetSubjectId(matchingSubject.id);
    }

    setTargetClasses(exam.targetClasses && exam.targetClasses.length > 0 ? [...exam.targetClasses] : ['7A', '7B']);
    setDurationMinutes(exam.durationMinutes || 45);
    setPassingScore(exam.passingScore || 75);
    setInstructions(exam.instructions || 'Kerjakan soal dengan cermat dan jujur.');
    setUploadDate(new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16));
    setErrorMessage(null);
  };

  const handleBackToSelect = () => {
    setSelectedExam(null);
    setErrorMessage(null);
  };

  const handleConfirmCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam || !newTitle.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const chosenSubject = allSubjects.find(s => s.id === targetSubjectId) ||
                            allSubjects.find(s => s.name === selectedExam.subjectName) ||
                            allSubjects[0];

      const res = await copyExamWithQuestionsDirect(selectedExam.id, {
        newTitle: newTitle.trim(),
        targetClasses: targetClasses.length > 0 ? targetClasses : selectedExam.targetClasses,
        targetTeacherId: activeTeacher.id,
        targetTeacherName: activeTeacher.name,
        targetSubjectId: chosenSubject?.id || selectedExam.subjectId,
        targetSubjectName: chosenSubject?.name || selectedExam.subjectName,
        durationMinutes,
        passingScore,
        uploadDate: new Date(uploadDate).toISOString(),
        instructions
      });

      if (res.success && res.newExam) {
        onSuccessCopy(res.newExam, res.copiedQuestionsCount);
        onClose();
      } else {
        setErrorMessage(res.error || 'Gagal menyalin paket ujian.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Terjadi kesalahan sistem saat menyalin paket ujian.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl border border-slate-100 my-6 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Salin Paket Ujian dari Pengampu Lain
                </h3>
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[11px] font-bold rounded-md">
                  Multi-Guru CBT
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Pilih paket soal & kisi-kisi milik pengampu lain untuk digandakan ke akun Anda (
                <strong className="text-slate-800">{activeTeacher.name}</strong>)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2 font-medium">
              <span>⚠️ {errorMessage}</span>
            </div>
          )}

          {/* STEP 1: BROWSE AND SELECT SOURCE EXAM */}
          {!selectedExam && (
            <div className="space-y-4">
              {/* Filter and Search Bar */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Cari judul paket ujian, mapel, atau nama guru pembuat..."
                      className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  {/* Filter Guru Pengampu Asal */}
                  <select
                    value={selectedSourceTeacher}
                    onChange={e => setSelectedSourceTeacher(e.target.value)}
                    className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none font-medium focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="all">Semua Guru / Pengampu</option>
                    {activeGuruList
                      .filter(t => !onlyOtherTeachers || !isSameTeacher(t, activeTeacher))
                      .map(t => (
                        <option key={t.id} value={t.id}>
                          Guru: {t.name} {t.subjectName ? `(${t.subjectName})` : ''}
                        </option>
                      ))}
                  </select>

                  {/* Filter Mata Pelajaran */}
                  <select
                    value={selectedSubjectFilter}
                    onChange={e => setSelectedSubjectFilter(e.target.value)}
                    className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none font-medium focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="all">Semua Mata Pelajaran</option>
                    {allSubjects.map(s => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-200/60">
                  <label className="flex items-center gap-2 cursor-pointer select-none font-medium">
                    <input
                      type="checkbox"
                      checked={onlyOtherTeachers}
                      onChange={e => setOnlyOtherTeachers(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Hanya tampilkan paket dari pengampu lain (kecualikan paket saya sendiri)</span>
                  </label>
                  <span className="text-slate-500 font-medium">
                    Ditemukan: <strong className="text-indigo-700">{availableExams.length} Paket Ujian</strong>
                  </span>
                </div>
              </div>

              {/* List of Available Exams */}
              {availableExams.length === 0 ? (
                <div className="bg-slate-50/70 border border-dashed border-slate-200 rounded-2xl p-10 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1">
                    Tidak Ditemukan Paket Ujian yang Sesuai
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {onlyOtherTeachers
                      ? 'Belum ada paket ujian yang dibuat oleh pengampu lain, atau coba hilangkan centang "Hanya tampilkan paket dari pengampu lain" untuk melihat semua paket di sistem.'
                      : 'Coba ubah kata kunci pencarian atau filter guru/mapel di atas.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {availableExams.map(ex => {
                    const examQuestions = allQuestions.filter(q => q.examId === ex.id);
                    const qCount = examQuestions.length;
                    const isPreviewing = previewExamId === ex.id;

                    const typeCounts = {
                      single_choice: examQuestions.filter(q => q.type === 'single_choice').length,
                      multiple_choice: examQuestions.filter(q => q.type === 'multiple_choice').length,
                      true_false: examQuestions.filter(q => q.type === 'true_false').length,
                      matching: examQuestions.filter(q => q.type === 'matching').length,
                      case_study: examQuestions.filter(q => q.type === 'case_study').length
                    };

                    return (
                      <div
                        key={ex.id}
                        className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-4.5 transition-all shadow-xs hover:shadow-md flex flex-col justify-between"
                      >
                        <div>
                          {/* Subject & Teacher Badge */}
                          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 font-bold text-[11px] rounded-lg border border-emerald-200">
                              {ex.subjectName}
                            </span>
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-semibold text-[11px] rounded-lg border border-indigo-100 flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>Pengampu: {ex.teacherName || 'Guru Lain'}</span>
                            </span>
                          </div>

                          {/* Exam Title */}
                          <h4 className="text-sm font-bold text-slate-900 mb-2 leading-snug">
                            {ex.title}
                          </h4>

                          {/* Meta Details */}
                          <div className="text-[11px] text-slate-500 space-y-1 py-2.5 border-y border-slate-100 my-2">
                            <div>Target Kelas Asal: <strong className="text-slate-800">{ex.targetClasses.join(', ')}</strong></div>
                            <div>Durasi: <strong className="text-slate-800">{ex.durationMinutes} Menit</strong> • KKM: <strong className="text-indigo-700">{ex.passingScore}</strong></div>
                            <div className="flex items-center gap-1.5 pt-0.5">
                              <span>Total Butir Soal:</span>
                              <strong className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                {qCount} Butir Soal Lengkap
                              </strong>
                            </div>
                          </div>

                          {/* Question Type Composition Pills */}
                          {qCount > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3 text-[10px] text-slate-600 font-medium">
                              {typeCounts.single_choice > 0 && (
                                <span className="px-1.5 py-0.5 bg-slate-100 rounded">PG: {typeCounts.single_choice}</span>
                              )}
                              {typeCounts.multiple_choice > 0 && (
                                <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-800 rounded">Kompleks: {typeCounts.multiple_choice}</span>
                              )}
                              {typeCounts.true_false > 0 && (
                                <span className="px-1.5 py-0.5 bg-amber-50 text-amber-800 rounded">B/S: {typeCounts.true_false}</span>
                              )}
                              {typeCounts.matching > 0 && (
                                <span className="px-1.5 py-0.5 bg-purple-50 text-purple-800 rounded">Jodohkan: {typeCounts.matching}</span>
                              )}
                              {typeCounts.case_study > 0 && (
                                <span className="px-1.5 py-0.5 bg-blue-50 text-blue-800 rounded">Uraian: {typeCounts.case_study}</span>
                              )}
                            </div>
                          )}

                          {/* Quick Question Preview Accordion */}
                          {isPreviewing && (
                            <div className="mt-2 mb-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs max-h-48 overflow-y-auto">
                              <div className="font-bold text-slate-700 text-[11px] flex items-center justify-between pb-1 border-b border-slate-200">
                                <span>Pratinjau Butir Soal ({examQuestions.length}):</span>
                                <span className="text-[10px] text-slate-400">Seluruh isi akan disalin</span>
                              </div>
                              {examQuestions.length === 0 ? (
                                <p className="text-slate-400 italic">Belum ada butir soal pada paket ini.</p>
                              ) : (
                                examQuestions.map((q, idx) => (
                                  <div key={q.id} className="p-2 bg-white rounded-lg border border-slate-200/80 text-[11px]">
                                    <div className="font-bold text-slate-800 mb-0.5">
                                      Soal #{idx + 1} ({q.type}) • {q.points} Poin
                                    </div>
                                    {q.instructions && (
                                      <div className="text-[10px] text-amber-800 italic mb-0.5">
                                        Petunjuk: {q.instructions}
                                      </div>
                                    )}
                                    <div className="text-slate-700 line-clamp-2">
                                      {q.prompt}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setPreviewExamId(isPreviewing ? null : ex.id)}
                            className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1 font-medium"
                            title="Tinjau kisi-kisi dan butir soal sebelum menyalin"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{isPreviewing ? 'Tutup Kisi-Kisi' : 'Pratinjau Soal'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSelectExam(ex)}
                            className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Pilih & Salin Paket Ini</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: CONFIGURE COPIED EXAM FOR ACTIVE TEACHER */}
          {selectedExam && (
            <form onSubmit={handleConfirmCopy} className="space-y-4">
              
              {/* Back button & Source Exam banner */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBackToSelect}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali Pilih Paket Lain</span>
                </button>
                <span className="text-xs text-slate-500 font-medium">
                  Langkah 2: Konfigurasi Kepemilikan & Kelas
                </span>
              </div>

              {/* Source & Target Ownership Card */}
              <div className="p-4 bg-gradient-to-r from-indigo-50/90 to-purple-50/80 border border-indigo-100 rounded-2xl space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-indigo-100/70">
                  <span className="text-slate-600">Paket Asal (Sumber):</span>
                  <span className="font-bold text-slate-900">{selectedExam.title}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-indigo-100/70">
                  <span className="text-slate-600">Guru Pengampu Asal:</span>
                  <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-indigo-100">
                    👤 {selectedExam.teacherName || 'Pengampu Lain'} ({selectedExam.subjectName})
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-indigo-100/70">
                  <span className="text-slate-600">Guru Pengampu Baru (Pemilik Salinan):</span>
                  <span className="font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                    ✅ {activeTeacher.name} (Anda)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Butir Soal & Kisi-Kisi yang Digandakan:</span>
                  <span className="font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                    {allQuestions.filter(q => q.examId === selectedExam.id).length} Butir Soal Lengkap
                  </span>
                </div>
              </div>

              {/* Form Fields for New Cloned Exam */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Judul Baru */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Judul Paket Ujian Baru (Hasil Salinan) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    required
                    placeholder="Contoh: PENILAIAN SUMATIF GANJIL - KELAS 7"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium"
                  />
                </div>

                {/* Mata Pelajaran Baru */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Mata Pelajaran <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={targetSubjectId}
                    onChange={e => setTargetSubjectId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    {allSubjects.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tanggal Upload Rilis */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Jadwal Rilis Ujian
                  </label>
                  <input
                    type="datetime-local"
                    value={uploadDate}
                    onChange={e => setUploadDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                {/* Durasi & KKM */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Durasi Pengerjaan (Menit)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={240}
                    value={durationMinutes}
                    onChange={e => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    KKM / Nilai Ketuntasan
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={passingScore}
                    onChange={e => setPassingScore(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Target Kelas Multi-select */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5 flex flex-wrap items-center justify-between gap-1 text-xs">
                  <span>Target Kelas / Rombel Pengampu Anda</span>
                  <span className="text-[11px] font-normal text-slate-500">
                    Pilih rombel siswa yang diajar oleh Anda
                  </span>
                </label>
                <TargetClassMultiSelect
                  selectedClasses={targetClasses}
                  onChange={setTargetClasses}
                />
              </div>

              {/* Petunjuk Ujian */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Petunjuk & Instruksi Pengerjaan
                </label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Callout Notice */}
              <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-[11px] text-amber-950 leading-relaxed">
                💡 <strong>Kemandirian Data:</strong> Butir soal hasil salinan (Pilihan Ganda, PG Kompleks, Benar/Salah, Menjodohkan, Uraian, stimulus kasus, petunjuk pengerjaan, gambar, dan kunci jawaban) akan dibuatkan ID baru yang mandiri. Anda bebas mengedit, menghapus, atau menambah butir soal tanpa mempengaruhi paket asli milik pengampu sebelumnya.
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleBackToSelect}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal / Ganti Paket
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newTitle.trim()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-950/10 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? 'Sedang Menggandakan Paket & Butir Soal...'
                      : 'Konfirmasi & Salin ke Akun Saya Sekarang'}
                  </span>
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
