import React, { useState } from 'react';
import { Exam, ExamSubmission, Subject, User } from '../../types';
import { exportExamResultsToExcel } from '../../utils/excelHelper';
import {
  Download,
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
  FileSpreadsheet
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
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [inspectionSubmission, setInspectionSubmission] = useState<ExamSubmission | null>(null);

  // Extract unique classes from submissions & exams
  const availableClasses = Array.from(
    new Set([
      'X-IPA-1',
      'X-IPA-2',
      'XI-IPA-1',
      ...submissions.map(s => s.studentClass).filter(Boolean)
    ])
  ).sort();

  // Filter submissions
  const filteredSubmissions = submissions.filter(sub => {
    if (selectedExamId !== 'all' && sub.examId !== selectedExamId) return false;
    if (selectedClass !== 'all' && sub.studentClass !== selectedClass) return false;
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      return (
        sub.studentName.toLowerCase().includes(q) ||
        sub.studentClass.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate statistics
  const totalStudents = filteredSubmissions.length;
  const scores = filteredSubmissions.map(s => s.percentage);
  const avgScore = totalStudents > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / totalStudents) : 0;
  const maxScore = totalStudents > 0 ? Math.max(...scores) : 0;
  const minScore = totalStudents > 0 ? Math.min(...scores) : 0;
  const passedCount = filteredSubmissions.filter(s => s.passed).length;
  const passedPercentage = totalStudents > 0 ? Math.round((passedCount / totalStudents) * 100) : 0;

  const currentExam = exams.find(e => e.id === selectedExamId);

  const handleExportExcel = () => {
    const title = currentExam ? `${currentExam.subjectName}_${currentExam.title}` : 'Semua_Ujian';
    exportExamResultsToExcel(filteredSubmissions, title, selectedClass !== 'all' ? selectedClass : undefined);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Filter and Actions Bar (Hidden on print) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
        
        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Ujian:
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
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
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
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

          {/* Search box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Cari nama siswa..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 w-44"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Export and Print Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Rekap</span>
          </button>
        </div>

      </div>

      {/* PRINT HEADER KOP SURAT (Shown only on Print) */}
      <div className="print-only mb-6 border-b-2 border-black pb-4 text-center">
        <h2 className="text-xl font-bold uppercase tracking-wider">
          PORTAL UJIAN SISWA SPANJU • REKAPITULASI HASIL ASESMEN SUMATIF
        </h2>
        <p className="text-sm font-medium">
          LAPORAN NILAI PESERTA DIDIK PER KELAS & MATA PELAJARAN
        </p>
        <div className="text-xs mt-3 flex justify-between border-t border-black pt-2">
          <span>Mata Pelajaran: <strong>{currentExam ? currentExam.subjectName : 'Semua Mapel'}</strong></span>
          <span>Filter Kelas: <strong>{selectedClass === 'all' ? 'Semua Kelas' : selectedClass}</strong></span>
          <span>Jumlah Peserta: <strong>{totalStudents} Siswa</strong></span>
          <span>Rata-Rata Nilai: <strong>{avgScore}</strong></span>
        </div>
      </div>

      {/* Statistical Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase">Peserta</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900">{totalStudents}</span>
          <span className="text-[11px] text-slate-500 block mt-0.5">Siswa Mengumpulkan</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase">Rata-Rata</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-extrabold text-indigo-600">{avgScore}</span>
          <span className="text-[11px] text-slate-500 block mt-0.5">Skala 100 Poin</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase">Tertinggi</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-extrabold text-emerald-600">{maxScore}</span>
          <span className="text-[11px] text-slate-500 block mt-0.5">Nilai Maksimal</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase">Terendah</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-2xl font-extrabold text-rose-600">{minScore}</span>
          <span className="text-[11px] text-slate-500 block mt-0.5">Perlu Pembinaan</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase">Kelulusan</span>
            <CheckCircle className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900">{passedPercentage}%</span>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            {passedCount} dari {totalStudents} Tuntas
          </span>
        </div>
      </div>

      {/* Main Results Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-center w-12">No</th>
                <th className="px-4 py-3">Nama Lengkap Siswa</th>
                <th className="px-4 py-3">Kelas</th>
                <th className="px-4 py-3">Mata Pelajaran</th>
                <th className="px-4 py-3 text-center">Nilai Angka</th>
                <th className="px-4 py-3 text-center">Persentase</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Pelanggaran Lockdown</th>
                <th className="px-4 py-3">Waktu Submit</th>
                <th className="px-4 py-3 text-center no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-slate-400">
                    Tidak ditemukan data hasil ujian yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub, idx) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 text-center font-bold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      {sub.studentName}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-700">
                      <span className="px-2 py-0.5 bg-slate-100 rounded-md border border-slate-200">
                        {sub.studentClass}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 truncate max-w-[160px]">
                      {sub.subjectName}
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-slate-900">
                      {sub.earnedScore} <span className="text-slate-400 font-normal">/ {sub.totalScore}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`font-extrabold text-sm ${sub.passed ? 'text-indigo-700' : 'text-rose-600'}`}>
                        {sub.percentage}%
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        sub.passed
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {sub.passed ? 'TUNTAS' : 'REMEDIAL'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        sub.violationCount > 0
                          ? 'bg-rose-100 text-rose-800 font-bold'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {sub.violationCount === 0 ? '0 (Aman)' : `${sub.violationCount}x Pindah Tab`}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 text-[11px]">
                      {new Date(sub.submittedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3.5 text-center no-print">
                      <button
                        type="button"
                        onClick={() => setInspectionSubmission(sub)}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detail</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECTION DETAIL MODAL */}
      {inspectionSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Rincian Jawaban Siswa
                </h3>
                <p className="text-xs text-slate-500">
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

            <div className="py-4 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-slate-400 block">Total Nilai</span>
                  <span className="text-lg font-bold text-indigo-700">
                    {inspectionSubmission.earnedScore} / {inspectionSubmission.totalScore}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Persentase</span>
                  <span className="text-lg font-bold text-slate-800">{inspectionSubmission.percentage}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Pelanggaran Layar</span>
                  <span className="text-lg font-bold text-rose-600">{inspectionSubmission.violationCount} Kali</span>
                </div>
              </div>

              <h4 className="font-bold text-slate-800 pt-2">Evaluasi Per Butir Pertanyaan:</h4>

              {inspectionSubmission.evaluatedAnswers &&
                Object.entries(inspectionSubmission.evaluatedAnswers).map(([qId, evalData], idx) => (
                  <div key={qId} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">Butir Pertanyaan #{idx + 1}</span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                        evalData.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        Skor: {evalData.earned} / {evalData.max}
                      </span>
                    </div>
                    {evalData.feedback && (
                      <p className="text-slate-500 text-[11px] italic">
                        Ulasan: {evalData.feedback}
                      </p>
                    )}
                  </div>
                ))}
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectionSubmission(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
