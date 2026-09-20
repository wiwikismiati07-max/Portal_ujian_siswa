import React, { useState, useMemo } from 'react';
import { Exam, ExamSubmission, Subject, User } from '../../types';
import { exportExamResultsToExcel } from '../../utils/excelHelper';
import { DEFAULT_CLASSES } from '../../utils/classHelper';
import { getAllUsers } from '../../utils/storage';
import {
  Printer,
  Search,
  Filter,
  Users,
  Award,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Eye,
  X,
  FileSpreadsheet,
  ShieldCheck,
  ShieldAlert,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Calendar,
  Sparkles,
  UserX,
  SlidersHorizontal
} from 'lucide-react';

interface ClassScoreRecapProps {
  submissions: ExamSubmission[];
  exams: Exam[];
  subjects: Subject[];
}

export const ClassScoreRecap: React.FC<ClassScoreRecapProps> = ({
  submissions,
  exams,
  subjects
}) => {
  const [selectedExamId, setSelectedExamId] = useState<string>(
    exams.length > 0 ? exams[0].id : 'all'
  );
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [integrityFilter, setIntegrityFilter] = useState<'all' | 'clean' | 'violated' | 'critical'>('all');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'zero' | 'remedial' | 'passed'>('all');
  const [showAllClassRoster, setShowAllClassRoster] = useState<boolean>(true);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [inspectionSubmission, setInspectionSubmission] = useState<ExamSubmission | null>(null);

  const allUsers = useMemo(() => getAllUsers(), []);
  const allStudents = useMemo(() => allUsers.filter(u => u.role === 'siswa'), [allUsers]);

  // Extract unique classes from submissions & exams & default classes (7A-9H)
  const availableClasses = useMemo(() => {
    return Array.from(
      new Set([
        ...DEFAULT_CLASSES,
        ...exams.flatMap(e => e.targetClasses || []),
        ...submissions.map(s => s.studentClass).filter(Boolean),
        ...allStudents.map(s => s.classGroup).filter(Boolean)
      ])
    ).filter(Boolean).sort();
  }, [exams, submissions, allStudents]);

  const currentExam = useMemo(() => exams.find(e => e.id === selectedExamId), [exams, selectedExamId]);

  // Base filtered by Exam & Class (with optional full class roster inclusion)
  const baseSubmissions = useMemo(() => {
    const rawFiltered = submissions.filter(sub => {
      if (selectedExamId !== 'all' && sub.examId !== selectedExamId) return false;
      if (selectedClass !== 'all' && sub.studentClass !== selectedClass) return false;
      return true;
    });

    if (!showAllClassRoster || selectedClass === 'all') {
      return rawFiltered;
    }

    // Merge registered students in the selected class who have not submitted
    const targetStudents = allStudents.filter(s => s.classGroup === selectedClass);
    const existingStudentIds = new Set(rawFiltered.map(s => s.studentId));

    const missingRows: ExamSubmission[] = [];
    targetStudents.forEach(stu => {
      if (!existingStudentIds.has(stu.id)) {
        missingRows.push({
          id: `unsub_${stu.id}_${selectedExamId}`,
          examId: selectedExamId !== 'all' ? selectedExamId : 'unassigned',
          examTitle: currentExam ? currentExam.title : 'Belum Mengikuti',
          subjectName: currentExam ? currentExam.subjectName : 'Semua Mapel',
          studentId: stu.id,
          studentName: stu.name,
          studentClass: stu.classGroup || selectedClass,
          studentNipOrNis: stu.nipOrNis || undefined,
          answers: {},
          earnedScore: 0,
          totalScore: currentExam ? currentExam.totalScore : 100,
          percentage: 0,
          passed: false,
          violationCount: 0,
          violationLogs: [],
          startedAt: '',
          submittedAt: '',
          evaluatedAnswers: undefined
        });
      }
    });

    return [...rawFiltered, ...missingRows];
  }, [submissions, selectedExamId, selectedClass, showAllClassRoster, allStudents, currentExam]);

  // Filter submissions by Integrity, Score Filter, and Search keyword
  const filteredSubmissions = useMemo(() => {
    return baseSubmissions.filter(sub => {
      // Integrity filter
      const violations = sub.violationCount || 0;
      if (integrityFilter === 'clean' && violations > 0) return false;
      if (integrityFilter === 'violated' && violations === 0) return false;
      if (integrityFilter === 'critical' && violations < 3) return false;

      // Score Filter (including 0 scores explicitly)
      const passing = currentExam ? currentExam.passingScore : 75;
      if (scoreFilter === 'zero' && sub.percentage !== 0 && sub.earnedScore !== 0) return false;
      if (scoreFilter === 'remedial' && sub.percentage >= passing) return false;
      if (scoreFilter === 'passed' && sub.percentage < passing) return false;

      // Search keyword
      if (searchKeyword.trim()) {
        const q = searchKeyword.toLowerCase();
        return (
          sub.studentName.toLowerCase().includes(q) ||
          sub.studentClass.toLowerCase().includes(q) ||
          (sub.studentNipOrNis && sub.studentNipOrNis.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [baseSubmissions, integrityFilter, scoreFilter, searchKeyword, currentExam]);

  // Calculate statistics from base submissions
  const totalBaseStudents = baseSubmissions.length;
  const zeroScoreStudentsCount = baseSubmissions.filter(s => s.percentage === 0 || s.earnedScore === 0).length;
  const cleanStudentsCount = baseSubmissions.filter(s => (s.violationCount || 0) === 0 && !!s.submittedAt).length;
  const violatedStudentsCount = baseSubmissions.filter(s => (s.violationCount || 0) > 0).length;
  const criticalStudentsCount = baseSubmissions.filter(s => (s.violationCount || 0) >= 3).length;

  const cleanPercentage = totalBaseStudents > 0 ? Math.round((cleanStudentsCount / totalBaseStudents) * 100) : 0;
  const violatedPercentage = totalBaseStudents > 0 ? Math.round((violatedStudentsCount / totalBaseStudents) * 100) : 0;
  const zeroPercentage = totalBaseStudents > 0 ? Math.round((zeroScoreStudentsCount / totalBaseStudents) * 100) : 0;

  const scores = baseSubmissions.map(s => s.percentage);
  const avgScore = totalBaseStudents > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / totalBaseStudents) : 0;
  const maxScore = totalBaseStudents > 0 ? Math.max(...scores) : 0;
  const minScore = totalBaseStudents > 0 ? Math.min(...scores) : 0;
  const passedCount = baseSubmissions.filter(s => s.passed).length;
  const passedPercentage = totalBaseStudents > 0 ? Math.round((passedCount / totalBaseStudents) * 100) : 0;

  const handleExportExcel = () => {
    const title = currentExam ? `${currentExam.subjectName}_${currentExam.title}` : 'Semua_Ujian';
    exportExamResultsToExcel(filteredSubmissions, title, selectedClass !== 'all' ? selectedClass : undefined);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Segmented Filter Tabs */}
      <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Semua */}
          <button
            type="button"
            onClick={() => { setIntegrityFilter('all'); setScoreFilter('all'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              integrityFilter === 'all' && scoreFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/70'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Semua Siswa</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
              integrityFilter === 'all' && scoreFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {totalBaseStudents}
            </span>
          </button>

          {/* Nilai 0 Filter Button */}
          <button
            type="button"
            onClick={() => { setScoreFilter(scoreFilter === 'zero' ? 'all' : 'zero'); setIntegrityFilter('all'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              scoreFilter === 'zero'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100/80 border border-rose-200/70'
            }`}
          >
            <UserX className="w-3.5 h-3.5" />
            <span>Nilai 0 / Belum Submit</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
              scoreFilter === 'zero' ? 'bg-white/20 text-white' : 'bg-rose-200/80 text-rose-900'
            }`}>
              {zeroScoreStudentsCount}
            </span>
          </button>

          {/* Tertib */}
          <button
            type="button"
            onClick={() => { setIntegrityFilter(integrityFilter === 'clean' ? 'all' : 'clean'); setScoreFilter('all'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              integrityFilter === 'clean'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100/80 border border-emerald-200/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Tertib (0x)</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
              integrityFilter === 'clean' ? 'bg-white/20 text-white' : 'bg-emerald-200/80 text-emerald-900'
            }`}>
              {cleanStudentsCount}
            </span>
          </button>

          {/* Melanggar */}
          <button
            type="button"
            onClick={() => { setIntegrityFilter(integrityFilter === 'violated' ? 'all' : 'violated'); setScoreFilter('all'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              integrityFilter === 'violated'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100/80 border border-amber-200/60'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Melanggar Layar</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
              integrityFilter === 'violated' ? 'bg-white/20 text-white' : 'bg-amber-200/80 text-amber-950'
            }`}>
              {violatedStudentsCount}
            </span>
          </button>

          {criticalStudentsCount > 0 && (
            <button
              type="button"
              onClick={() => { setIntegrityFilter(integrityFilter === 'critical' ? 'all' : 'critical'); setScoreFilter('all'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                integrityFilter === 'critical'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100/80 border border-rose-200/60'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Kritis (≥3x)</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                integrityFilter === 'critical' ? 'bg-white/20 text-white' : 'bg-rose-200/80 text-rose-900'
              }`}>
                {criticalStudentsCount}
              </span>
            </button>
          )}
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportExcel}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            title="Unduh format spreadsheet .xlsx"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Ekspor Excel</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            title="Cetak format cetak resmi / PDF"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Cetak Rekap</span>
          </button>
        </div>
      </div>

      {/* Top Filter Bar (Exam, Class, Score, Search) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        
        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide shrink-0">
              Paket Ujian:
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 max-w-xs"
            >
              <option value="all">-- Semua Paket Ujian --</option>
              {exams.map(e => (
                <option key={e.id} value={e.id}>
                  {e.subjectName} — {e.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide shrink-0">
              Kelas:
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">Semua Kelas</option>
              {availableClasses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide shrink-0">
              Nilai:
            </label>
            <select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value as any)}
              className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">Semua Nilai</option>
              <option value="zero">🔴 Nilai 0 / Belum Selesai</option>
              <option value="remedial">⚠️ Nilai Remedial (&lt; KKM)</option>
              <option value="passed">✅ Nilai Tuntas (&ge; KKM)</option>
            </select>
          </div>

          {selectedClass !== 'all' && (
            <label className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showAllClassRoster}
                onChange={(e) => setShowAllClassRoster(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span className="font-semibold">Sertakan Siswa Belum Ujian (Nilai 0)</span>
            </label>
          )}
        </div>

        {/* Search box */}
        <div className="relative">
          <input
            type="text"
            placeholder="Cari nama atau NIS siswa..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 w-full sm:w-56"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          {searchKeyword && (
            <button
              type="button"
              onClick={() => setSearchKeyword('')}
              className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

      {/* PRINT HEADER KOP SURAT (Shown only on Print) */}
      <div className="print-only mb-6 border-b-2 border-black pb-4 text-center">
        <h2 className="text-xl font-bold uppercase tracking-wider">
          PORTAL UJIAN SISWA SPANJU • REKAPITULASI HASIL ASESMEN SUMATIF
        </h2>
        <p className="text-sm font-medium">
          LAPORAN NILAI & AUDIT INTEGRITAS PESERTA DIDIK PER KELAS
        </p>
        <div className="text-xs mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 border-t border-black pt-2 text-left">
          <span>Mata Pelajaran: <strong>{currentExam ? currentExam.subjectName : 'Semua Mapel'}</strong></span>
          <span>Filter Kelas: <strong>{selectedClass === 'all' ? 'Semua Kelas' : selectedClass}</strong></span>
          <span>Jumlah Peserta: <strong>{totalBaseStudents} Siswa</strong></span>
          <span>Siswa Nilai 0: <strong>{zeroScoreStudentsCount} ({zeroPercentage}%)</strong></span>
          <span>Siswa Tertib: <strong>{cleanStudentsCount} ({cleanPercentage}%)</strong></span>
          <span>Siswa Melanggar: <strong>{violatedStudentsCount} ({violatedPercentage}%)</strong></span>
          <span>Rata-Rata Nilai: <strong>{avgScore}</strong></span>
          <span>Kelulusan / Tuntas: <strong>{passedPercentage}%</strong></span>
        </div>
      </div>

      {/* Statistical Summary Cards with Integrity & Zero Score Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        
        {/* Total Peserta */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wide">Total Siswa</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{totalBaseStudents}</span>
            <span className="text-[11px] font-semibold text-slate-500">Siswa</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5">Daftar kelas & ujian</span>
        </div>

        {/* Siswa Nilai 0 */}
        <div className={`p-4 rounded-2xl border shadow-xs transition-colors ${
          zeroScoreStudentsCount > 0 ? 'bg-rose-50/40 border-rose-200' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-rose-700 mb-1">
            <span className="text-xs font-bold uppercase tracking-wide">Siswa Nilai 0</span>
            <UserX className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-extrabold ${zeroScoreStudentsCount > 0 ? 'text-rose-700' : 'text-slate-400'}`}>
              {zeroScoreStudentsCount}
            </span>
            <span className={`text-[11px] font-bold px-1.5 py-0.2 rounded ${
              zeroScoreStudentsCount > 0 ? 'bg-rose-100 text-rose-900' : 'bg-slate-100 text-slate-500'
            }`}>
              {zeroPercentage}%
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5">Skor 0 atau belum submit</span>
        </div>

        {/* Siswa Tertib / Disiplin */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-100 bg-emerald-50/20 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-xs font-bold uppercase tracking-wide">Tertib & Bersih</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-700">{cleanStudentsCount}</span>
            <span className="text-[11px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
              {cleanPercentage}%
            </span>
          </div>
          <span className="text-[11px] text-emerald-700/80 block mt-0.5">0 kali pelanggaran</span>
        </div>

        {/* Siswa Melanggar */}
        <div className={`p-4 rounded-2xl border shadow-xs transition-colors ${
          violatedStudentsCount > 0
            ? 'bg-amber-50/40 border-amber-200'
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-xs font-bold uppercase tracking-wide">Melanggar</span>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-extrabold ${violatedStudentsCount > 0 ? 'text-amber-800' : 'text-slate-400'}`}>
              {violatedStudentsCount}
            </span>
            <span className={`text-[11px] font-bold px-1.5 py-0.2 rounded ${
              violatedStudentsCount > 0 ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-500'
            }`}>
              {violatedPercentage}%
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            {criticalStudentsCount > 0 ? `${criticalStudentsCount}x Kritis (≥3)` : 'Pernah beralih layar'}
          </span>
        </div>

        {/* Rata-Rata Nilai */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wide">Rata-Rata</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-indigo-600">{avgScore}</span>
            <span className="text-[11px] text-slate-500">Skala 100</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            Maks: {maxScore} | Min: {minScore}
          </span>
        </div>

        {/* Tingkat Kelulusan */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wide">Ketuntasan</span>
            <CheckCircle className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{passedPercentage}%</span>
            <span className="text-[11px] font-semibold text-slate-500">
              ({passedCount}/{totalBaseStudents})
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            {passedCount} Siswa Lulus KKM
          </span>
        </div>

      </div>

      {/* Main Results Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Table Header / Subtitle */}
        <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">
              Daftar Rekap Nilai Peserta Didik
            </span>
            <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded-md text-[11px] font-bold">
              Menampilkan {filteredSubmissions.length} Data
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            {scoreFilter !== 'all' && (
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                scoreFilter === 'zero' ? 'bg-rose-100 text-rose-800' :
                scoreFilter === 'remedial' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {scoreFilter === 'zero' && '🔴 Filter: Nilai 0'}
                {scoreFilter === 'remedial' && '⚠️ Filter: Remedial'}
                {scoreFilter === 'passed' && '✅ Filter: Tuntas'}
              </span>
            )}
            {integrityFilter !== 'all' && (
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                integrityFilter === 'clean'
                  ? 'bg-emerald-100 text-emerald-800'
                  : integrityFilter === 'violated'
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {integrityFilter === 'clean' && '✅ Tertib (0 Pelanggaran)'}
                {integrityFilter === 'violated' && '⚠️ Melakukan Pelanggaran (≥1x)'}
                {integrityFilter === 'critical' && '🚨 Pelanggaran Kritis (≥3x)'}
              </span>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-center w-12">No</th>
                <th className="px-4 py-3">Nama Lengkap Siswa</th>
                <th className="px-4 py-3 text-center">Kelas</th>
                <th className="px-4 py-3">Mata Pelajaran & Paket</th>
                <th className="px-4 py-3 text-center">Nilai Angka</th>
                <th className="px-4 py-3 text-center">Persentase</th>
                <th className="px-4 py-3 text-center">Status Kelulusan</th>
                <th className="px-4 py-3 text-center">Status Integritas / Pelanggaran</th>
                <th className="px-4 py-3">Waktu Selesai</th>
                <th className="px-4 py-3 text-center no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Users className="w-8 h-8 mx-auto text-slate-300" />
                      <p className="font-semibold text-slate-600">Tidak ada data yang sesuai filter</p>
                      <p className="text-[11px] text-slate-400">
                        Coba ubah filter paket ujian, kelas, atau pilih status integritas &quot;Semua Peserta&quot;.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub, idx) => {
                  const violations = sub.violationCount || 0;
                  const isClean = violations === 0;
                  const isCritical = violations >= 3;
                  const isZero = sub.percentage === 0 || sub.earnedScore === 0;
                  const isNotSubmitted = !sub.submittedAt;

                  return (
                    <tr
                      key={sub.id}
                      className={`transition-colors ${
                        isNotSubmitted
                          ? 'bg-slate-50/60 hover:bg-slate-100/70'
                          : isCritical
                          ? 'bg-rose-50/40 hover:bg-rose-50/70'
                          : !isClean
                          ? 'bg-amber-50/20 hover:bg-amber-50/50'
                          : isZero
                          ? 'bg-rose-50/20 hover:bg-rose-50/40'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="px-4 py-3.5 text-center font-bold text-slate-400">
                        {idx + 1}
                      </td>

                      {/* Student Name */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{sub.studentName}</span>
                          {isNotSubmitted ? (
                            <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded text-[10px] font-bold">
                              Belum Submit
                            </span>
                          ) : isClean ? (
                            <span title="Tertib (0 Pelanggaran)">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            </span>
                          ) : (
                            <span title={`Melanggar ${violations}x`}>
                              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            </span>
                          )}
                        </div>
                        {sub.studentNipOrNis && (
                          <span className="text-[10px] text-slate-400 font-mono block">
                            NIS: {sub.studentNipOrNis}
                          </span>
                        )}
                      </td>

                      {/* Class */}
                      <td className="px-4 py-3.5 text-center font-semibold text-slate-700">
                        <span className="px-2 py-0.5 bg-slate-100 rounded-md border border-slate-200">
                          {sub.studentClass}
                        </span>
                      </td>

                      {/* Subject & Exam */}
                      <td className="px-4 py-3.5 text-slate-600 max-w-[180px]">
                        <span className="font-bold text-slate-800 block truncate">
                          {sub.subjectName}
                        </span>
                        <span className="text-[11px] text-slate-500 truncate block">
                          {sub.examTitle}
                        </span>
                      </td>

                      {/* Score earned / total */}
                      <td className="px-4 py-3.5 text-center font-bold text-slate-900">
                        <span className={isZero ? 'text-rose-600 font-extrabold' : ''}>
                          {sub.earnedScore}
                        </span>{' '}
                        <span className="text-slate-400 font-normal">/ {sub.totalScore}</span>
                      </td>

                      {/* Percentage */}
                      <td className="px-4 py-3.5 text-center">
                        {isZero ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-extrabold text-[11px] border border-rose-300">
                            0% (NILAI 0)
                          </span>
                        ) : (
                          <span className={`font-extrabold text-sm ${sub.passed ? 'text-indigo-700' : 'text-rose-600'}`}>
                            {sub.percentage}%
                          </span>
                        )}
                      </td>

                      {/* Pass / Remedial status */}
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isNotSubmitted
                            ? 'bg-slate-100 text-slate-700 border border-slate-300 font-semibold'
                            : sub.passed
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isZero
                            ? 'bg-rose-100 text-rose-800 border border-rose-300 font-extrabold'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {isNotSubmitted
                            ? 'BELUM MENGERJAKAN'
                            : sub.passed
                            ? 'TUNTAS'
                            : isZero
                            ? 'NILAI 0 / REMEDIAL'
                            : 'REMEDIAL'}
                        </span>
                      </td>

                      {/* Integrity / Violation status */}
                      <td className="px-4 py-3.5 text-center">
                        {isNotSubmitted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-[11px] font-medium">
                            <span>-</span>
                          </span>
                        ) : isClean ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Tertib (0x)</span>
                          </span>
                        ) : isCritical ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-lg text-[11px] font-black animate-pulse">
                            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                            <span>{violations}x Kritis (Auto-Submit)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-bold">
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                            <span>{violations}x Pindah Layar</span>
                          </span>
                        )}
                      </td>

                      {/* Submitted time */}
                      <td className="px-4 py-3.5 text-slate-500 text-[11px]">
                        {sub.submittedAt ? (
                          (() => {
                            const subDate = new Date(sub.submittedAt);
                            const isValid = !isNaN(subDate.getTime());
                            return (
                              <>
                                <span className="block font-semibold text-slate-700">
                                  {isValid ? subDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {isValid ? subDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}
                                </span>
                              </>
                            );
                          })()
                        ) : (
                          <span className="text-slate-400 italic">Belum submit</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-center no-print">
                        <button
                          type="button"
                          onClick={() => setInspectionSubmission(sub)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-700 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECTION DETAIL MODAL */}
      {inspectionSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 max-h-[88vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Rincian Audit Lembar Jawaban Siswa
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {inspectionSubmission.studentName} ({inspectionSubmission.studentClass}) — {inspectionSubmission.examTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectionSubmission(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-4 overflow-y-auto space-y-4 flex-1 text-xs">
              
              {/* Score & Integrity Stats Banner */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-3 gap-3 text-center">
                <div>
                  <span className="text-slate-400 block text-[11px]">Total Skor</span>
                  <span className="text-xl font-extrabold text-indigo-700">
                    {inspectionSubmission.earnedScore} / {inspectionSubmission.totalScore}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Poin Soal</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Persentase Nilai</span>
                  <span className={`text-xl font-extrabold ${
                    inspectionSubmission.passed ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {inspectionSubmission.percentage}%
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {inspectionSubmission.passed ? 'Status: TUNTAS' : 'Status: REMEDIAL'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Catatan Integritas</span>
                  <span className={`text-xl font-extrabold ${
                    (inspectionSubmission.violationCount || 0) > 0 ? 'text-rose-600' : 'text-emerald-600'
                  }`}>
                    {inspectionSubmission.violationCount || 0} Kali
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {(inspectionSubmission.violationCount || 0) === 0 ? 'Tertib (0x Pelanggaran)' : 'Pindah Layar / Tab'}
                  </span>
                </div>
              </div>

              {/* Session Timing Card */}
              {(() => {
                const startObj = inspectionSubmission.startedAt ? new Date(inspectionSubmission.startedAt) : null;
                const submitObj = inspectionSubmission.submittedAt ? new Date(inspectionSubmission.submittedAt) : null;
                let durationText = '-';
                if (startObj && submitObj && !isNaN(startObj.getTime()) && !isNaN(submitObj.getTime())) {
                  const diffMs = Math.max(0, submitObj.getTime() - startObj.getTime());
                  const mins = Math.floor(diffMs / 60000);
                  const secs = Math.floor((diffMs % 60000) / 1000);
                  durationText = `${mins} menit ${secs} detik`;
                }

                return (
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-slate-700 space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 font-semibold text-[11px]">
                      <span className="flex items-center gap-1.5 text-indigo-700">
                        <Calendar className="w-3.5 h-3.5" /> Rekam Waktu Sesi Ujian
                      </span>
                      <span className="font-mono text-slate-500">
                        {startObj && !isNaN(startObj.getTime())
                          ? startObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '-'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-400 block">Waktu Masuk (Login):</span>
                        <span className="font-mono font-bold text-slate-800">
                          {startObj && !isNaN(startObj.getTime())
                            ? startObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                            : '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Waktu Selesai (Submit):</span>
                        <span className="font-mono font-bold text-slate-800">
                          {submitObj && !isNaN(submitObj.getTime())
                            ? submitObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                            : '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Durasi Pengerjaan:</span>
                        <span className="font-mono font-bold text-indigo-700">
                          {durationText}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Integrity Audit Log Card */}
              {(() => {
                const logs = inspectionSubmission.violationLogs || [];
                const violations = inspectionSubmission.violationCount || 0;
                const isClean = violations === 0;

                return (
                  <div className={`p-4 rounded-2xl border text-xs ${
                    isClean
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                      : violations >= 3
                      ? 'bg-rose-50 border-rose-300 text-rose-950'
                      : 'bg-amber-50/70 border-amber-200 text-amber-950'
                  }`}>
                    <div className="flex items-start gap-2.5">
                      {isClean ? (
                        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : violations >= 3 ? (
                        <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      ) : (
                        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-xs">
                            {isClean
                              ? 'Integritas Ujian: Sangat Tertib & Terverifikasi'
                              : `Audit Keamanan: Terdeteksi ${violations} Kali Pelanggaran Layar`}
                          </h5>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            isClean
                              ? 'bg-emerald-200 text-emerald-900'
                              : 'bg-rose-200 text-rose-900'
                          }`}>
                            {isClean ? '0 Pelanggaran' : `${violations}x Pelanggaran`}
                          </span>
                        </div>

                        {isClean ? (
                          <p className="text-[11px] mt-1 opacity-90 leading-relaxed">
                            Siswa menyelesaikan ujian dalam mode layar penuh (Full Screen Lockdown) tanpa pernah meminimalkan browser atau beralih ke aplikasi lain.
                          </p>
                        ) : (
                          <div className="mt-2.5 space-y-2">
                            <p className="text-[11px] font-medium opacity-90">
                              {violations >= 3
                                ? 'PERINGATAN KRITIS: Siswa telah mencapai batas maksimal 3 kali toleransi pelanggaran sehingga ujian otomatis dikumpulkan paksa.'
                                : 'Siswa terdeteksi sempat meminimalkan layar, beralih tab, atau membuka aplikasi lain saat ujian:'}
                            </p>
                            
                            {/* Detailed Violation Log Trail */}
                            <div className="bg-white/90 rounded-xl p-2.5 border border-amber-300/60 space-y-1.5 shadow-2xs">
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
                                  Tercatat {violations} kali peristiwa penguncian layar dipicu oleh siswa.
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Per Question Answers Breakdown */}
              <h4 className="font-bold text-slate-800 pt-2 flex items-center justify-between">
                <span>Rincian Penilaian Tiap Butir Soal:</span>
              </h4>

              {inspectionSubmission.evaluatedAnswers &&
                Object.entries(inspectionSubmission.evaluatedAnswers).map(([qId, evalData], idx) => (
                  <div key={qId} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">Butir Pertanyaan #{idx + 1}</span>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        evalData.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        Skor: {evalData.earned} / {evalData.max}
                      </span>
                    </div>
                    {evalData.feedback && (
                      <p className="text-slate-600 text-[11px] bg-white p-2 rounded-lg border border-slate-100">
                        <strong>Ulasan:</strong> {evalData.feedback}
                      </p>
                    )}
                  </div>
                ))}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectionSubmission(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
