import React, { useState, useEffect } from 'react';
import { Exam, Question, Subject, User } from '../../types';
import { getMatchingData, getMatchingColor } from '../../utils/matchingHelper';
import {
  Printer,
  Plus,
  Edit,
  Edit2,
  Trash2,
  Filter,
  FileText,
  CheckCircle2,
  CheckSquare,
  ListChecks,
  GitCommit,
  BookOpen,
  Award,
  Layers,
  Table,
  Database,
  Image as ImageIcon
} from 'lucide-react';
import { OfficialLetterhead } from '../common/OfficialLetterhead';
import { OfficialReportSignature } from '../common/OfficialReportSignature';
import { PrintPreviewModal } from '../common/PrintPreviewModal';
import { SupabaseModal } from '../SupabaseModal';

interface BankSoalReportProps {
  teacher: User;
  exams: Exam[];
  questions: Question[];
  subjects: Subject[];
  onAddQuestion: (exam: Exam) => void;
  onEditQuestion: (exam: Exam, question: Question) => void;
  onDeleteQuestion: (questionId: string) => void;
  onEditExam?: (exam: Exam) => void;
  preselectedExamId?: string;
  onSelectExam?: (examId: string) => void;
}

export const BankSoalReport: React.FC<BankSoalReportProps> = ({
  teacher,
  exams,
  questions,
  subjects,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
  onEditExam,
  preselectedExamId,
  onSelectExam
}) => {
  const [selectedExamId, setSelectedExamId] = useState<string>(() => {
    if (preselectedExamId && exams.some(e => e.id === preselectedExamId)) {
      return preselectedExamId;
    }
    return exams.length > 0 ? exams[0].id : '';
  });

  // Sync state if preselectedExamId prop updates from outside (e.g. clicking Kelola Soal on a card)
  useEffect(() => {
    if (preselectedExamId && exams.some(e => e.id === preselectedExamId)) {
      setSelectedExamId(preselectedExamId);
    } else if (exams.length > 0 && !exams.some(e => e.id === selectedExamId)) {
      setSelectedExamId(exams[0].id);
    }
  }, [preselectedExamId, exams]);

  const [viewMode, setViewMode] = useState<'bank_soal' | 'kisi_kisi'>('bank_soal');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [printDocMode, setPrintDocMode] = useState<'bank_soal' | 'kisi_kisi'>('bank_soal');
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);

  const currentExam = exams.find(e => e.id === selectedExamId) || exams[0];
  const examQuestions = currentExam ? questions.filter(q => q.examId === currentExam.id) : [];

  if (exams.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <BookOpen className="w-7 h-7" />
        </div>
        <h4 className="text-base font-bold text-slate-800 mb-1">
          Belum Ada Paket Ujian yang Tersedia
        </h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Silakan buka tab <strong>"Kelola Paket Ujian"</strong> terlebih dahulu untuk membuat paket ujian baru sebelum menyusun bank butir soal.
        </p>
      </div>
    );
  }

  // Statistics of question types
  const typeCounts = {
    single_choice: examQuestions.filter(q => q.type === 'single_choice').length,
    multiple_choice: examQuestions.filter(q => q.type === 'multiple_choice').length,
    true_false: examQuestions.filter(q => q.type === 'true_false').length,
    matching: examQuestions.filter(q => q.type === 'matching').length,
    case_study: examQuestions.filter(q => q.type === 'case_study').length
  };

  const totalPoints = examQuestions.reduce((sum, q) => sum + q.points, 0);

  const handlePrint = (mode: 'bank_soal' | 'kisi_kisi') => {
    setViewMode(mode);
    setPrintDocMode(mode);
    setIsPrintModalOpen(true);
    // Also try direct print in case the browser supports it without iframe suppression
    setTimeout(() => {
      try {
        window.print();
      } catch (err) {
        console.warn('Direct print blocked by browser sandbox, modal preview is active:', err);
      }
    }, 200);
  };

  const formatQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'single_choice':
        return 'Pilihan Ganda (PG)';
      case 'multiple_choice':
        return 'PG Kompleks';
      case 'true_false':
        return 'Benar / Salah';
      case 'matching':
        return 'Menjodohkan';
      case 'case_study':
        return 'Studi Kasus / Uraian';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Filter and Actions Bar (Hidden on print) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Kisi-Kisi & Bank Soal Asesmen
            </h3>
            <p className="text-xs text-slate-500">
              Pilih paket ujian untuk mengelola butir soal, meninjau tabel kisi-kisi, dan mencetak dokumen resmi
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedExamId}
            onChange={(e) => {
              setSelectedExamId(e.target.value);
              onSelectExam?.(e.target.value);
            }}
            className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {exams.map(ex => (
              <option key={ex.id} value={ex.id}>
                {ex.subjectName} — {ex.title}
              </option>
            ))}
          </select>

          {currentExam && (
            <button
              type="button"
              onClick={() => onAddQuestion(currentExam)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Soal</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 flex-wrap">
            {onEditExam && currentExam && (
              <button
                type="button"
                onClick={() => onEditExam(currentExam)}
                className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Edit detail nama paket, durasi, KKM, jadwal rilis & kelas"
              >
                <Edit className="w-3.5 h-3.5 text-amber-600" />
                <span>Edit Paket Ujian</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => handlePrint('kisi_kisi')}
              className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              title="Cetak format tabel Kisi-Kisi Penulisan Soal resmi"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Kisi-Kisi</span>
            </button>
            <button
              type="button"
              onClick={() => handlePrint('bank_soal')}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              title="Cetak Naskah Bank Soal lengkap dengan kunci"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Bank Soal</span>
            </button>
            <button
              type="button"
              onClick={() => setIsSupabaseModalOpen(true)}
              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Buka & Salin Skrip SQL Supabase tabel cbt_questions agar butir soal tersimpan aman di Cloud"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>SQL Supabase</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mode View Switcher Bar (Hidden on print) */}
      <div className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs no-print">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('bank_soal')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              viewMode === 'bank_soal'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span>Naskah Butir Soal</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
              viewMode === 'bank_soal' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'
            }`}>
              {examQuestions.length} Butir
            </span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('kisi_kisi')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              viewMode === 'kisi_kisi'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Table className="w-4 h-4 text-emerald-500" />
            <span>Tabel Matriks Kisi-Kisi Soal</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
              viewMode === 'kisi_kisi' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'
            }`}>
              Resmi
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-500 hidden md:block font-medium">
          Mata Pelajaran: <strong className="text-slate-800">{currentExam?.subjectName}</strong> • Target: <strong className="text-slate-800">{currentExam?.targetClasses?.join(', ')}</strong>
        </div>
      </div>

      {/* PRINT HEADER KOP SURAT RESMI (Shown only on Print) */}
      <OfficialLetterhead
        mataPelajaran={currentExam?.subjectName || 'Pendidikan Agama Islam & Budi Pekerti'}
        kelas={currentExam?.targetClasses?.join(', ') || 'VIII (Delapan)'}
        waktu={`${currentExam?.durationMinutes || 90} Menit`}
        judulDokumen={
          viewMode === 'kisi_kisi'
            ? 'KISI-KISI PENULISAN SOAL ASESMEN SUMATIF'
            : 'DOKUMEN NASKAH BANK SOAL ASESMEN SUMATIF'
        }
        subJudulDokumen={`UPT SMP NEGERI 7 PASURUAN • ${currentExam?.title?.toUpperCase() || 'ASESMEN SUMATIF SATUAN PENDIDIKAN'}`}
      />

      {/* Summary Chips (No Print) */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 no-print">
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-400 font-semibold block">Total Soal</span>
          <span className="text-lg font-extrabold text-slate-900">{examQuestions.length} Butir</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-400 font-semibold block">Total Bobot</span>
          <span className="text-lg font-extrabold text-indigo-600">{totalPoints} Poin</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-400 font-semibold block">PG Tunggal</span>
          <span className="text-lg font-bold text-slate-800">{typeCounts.single_choice}</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-400 font-semibold block">PG Kompleks</span>
          <span className="text-lg font-bold text-slate-800">{typeCounts.multiple_choice}</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-400 font-semibold block">Benar / Salah</span>
          <span className="text-lg font-bold text-slate-800">{typeCounts.true_false}</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-400 font-semibold block">Jodohkan / Kasus</span>
          <span className="text-lg font-bold text-slate-800">{typeCounts.matching + typeCounts.case_study}</span>
        </div>
      </div>

      {/* CONTENT AREA: KISI-KISI TABLE VIEW OR QUESTION CARDS LIST */}
      {viewMode === 'kisi_kisi' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
            <div className="flex items-center gap-2">
              <Table className="w-5 h-5 text-indigo-600" />
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  Tabel Matriks Kisi-Kisi Penulisan Soal Asesmen
                </h4>
                <p className="text-xs text-slate-500">
                  Format resmi pemetaan kompetensi, indikator, dan bentuk soal asesmen sumatif
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handlePrint('kisi_kisi')}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Tabel Kisi-Kisi</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 border-b-2 border-black text-black font-serif font-bold text-center">
                <tr>
                  <th className="p-2 border border-black w-[4%] text-center">No</th>
                  <th className="p-2 border border-black w-[20%] text-left">Capaian Pembelajaran / Elemen</th>
                  <th className="p-2 border border-black w-[16%] text-left">Materi Pokok</th>
                  <th className="p-2 border border-black w-[24%] text-left">Indikator Soal & Stimulus</th>
                  <th className="p-2 border border-black w-[13%] text-center">Bentuk Soal</th>
                  <th className="p-2 border border-black w-[6%] text-center">No. Soal</th>
                  <th className="p-2 border border-black w-[6%] text-center">Bobot</th>
                  <th className="p-2 border border-black w-[11%] text-center">Kunci / Kriteria Jawaban</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/30 text-black font-serif">
                {examQuestions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500 border border-black">
                      Belum ada butir soal yang diinputkan untuk paket ujian ini.
                    </td>
                  </tr>
                ) : (
                  examQuestions.map((q, idx) => {
                    let keyText = '-';
                    if (q.type === 'single_choice' && q.options && q.correctSingle !== undefined) {
                      keyText = `${String.fromCharCode(65 + q.correctSingle)}. ${q.options[q.correctSingle]?.slice(0, 30)}...`;
                    } else if (q.type === 'multiple_choice' && q.correctMulti) {
                      keyText = q.correctMulti.map(i => String.fromCharCode(65 + i)).join(', ');
                    } else if (q.type === 'true_false' && q.trueFalseItems) {
                      keyText = q.trueFalseItems.map((tf, i) => `${i + 1}:${tf.isCorrect ? 'B' : 'S'}`).join(', ');
                    } else if (q.type === 'matching' && q.matchingPairs) {
                      keyText = `${q.matchingPairs.length} Pasangan Valid`;
                    } else if (q.type === 'case_study') {
                      keyText = (q.caseKeywords || []).slice(0, 3).join(', ') || 'Rubrik Terlampir';
                    }

                    return (
                      <tr key={q.id} className="hover:bg-slate-50">
                        <td className="p-2 border border-black text-center font-bold">{idx + 1}</td>
                        <td className="p-2 border border-black">
                          Memahami dan menganalisis capaian materi {currentExam?.subjectName}
                        </td>
                        <td className="p-2 border border-black font-semibold">
                          {currentExam?.title || currentExam?.subjectName}
                        </td>
                        <td className="p-2 border border-black">
                          {q.caseContext && (
                            <span className="font-semibold text-slate-700 block mb-0.5">
                              [Wacana Kasus]: {q.caseContext.slice(0, 45)}...
                            </span>
                          )}
                          <span>Disajikan stimulus, peserta didik mampu menjawab: "{q.prompt.slice(0, 80)}..."</span>
                        </td>
                        <td className="p-2 border border-black text-center font-medium">
                          {formatQuestionTypeLabel(q.type)}
                        </td>
                        <td className="p-2 border border-black text-center font-bold">{idx + 1}</td>
                        <td className="p-2 border border-black text-center font-bold">{q.points}</td>
                        <td className="p-2 border border-black text-center text-[11px] font-mono">{keyText}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Question Cards List */
        <div className="space-y-4">
          {examQuestions.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <FileText className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <h4 className="text-sm font-bold text-slate-700">Belum Ada Soal pada Paket Ini</h4>
              <p className="text-xs text-slate-400 mt-1">
                Klik tombol "Tambah Soal" untuk mulai membuat butir pertanyaan baru.
              </p>
            </div>
          ) : (
            examQuestions.map((q, idx) => {
              return (
                <div
                  key={q.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs relative break-inside-avoid"
                >
                  {/* Header item */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                        {q.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        Bobot: <strong>{q.points} Poin</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 no-print">
                      <button
                        type="button"
                        onClick={() => currentExam && onEditQuestion(currentExam, q)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit Soal"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteQuestion(q.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Soal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Stimulus if Case Study */}
                  {q.caseContext && (
                    <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 font-serif mb-4 leading-relaxed whitespace-pre-line">
                      <strong>[WACANA STUDI KASUS]:</strong>
                      <br />
                      {q.caseContext}
                    </div>
                  )}

                  {/* Prompt with Image and Arabic formatting */}
                  {q.imageUrl && (
                    <div className="mb-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-2 max-w-sm">
                      <img
                        src={q.imageUrl}
                        alt={`Gambar Soal #${idx + 1}`}
                        className="max-h-48 w-auto object-contain rounded-lg"
                      />
                    </div>
                  )}

                  <p
                    className={`text-sm font-semibold text-slate-900 leading-relaxed mb-4 ${
                      /[\u0600-\u06FF]/.test(q.prompt) ? 'font-arabic text-base leading-loose' : ''
                    }`}
                    dir={/[\u0600-\u06FF]/.test(q.prompt) ? 'rtl' : 'ltr'}
                  >
                    {q.prompt}
                  </p>

                  {/* Answer presentation */}
                  {q.type === 'single_choice' && q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, oIdx) => {
                        const isCorrect = q.correctSingle === oIdx;
                        const optImg = q.optionImages?.[oIdx];

                        return (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-lg border flex flex-col gap-1.5 ${
                              isCorrect
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className="font-bold shrink-0">{String.fromCharCode(65 + oIdx)}.</span>
                              <span className="flex-1" dir={/[\u0600-\u06FF]/.test(opt) ? 'rtl' : 'ltr'}>
                                {opt}
                              </span>
                              {isCorrect && (
                                <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold shrink-0">
                                  Kunci
                                </span>
                              )}
                            </div>
                            {optImg && (
                              <div className="ml-5 p-1 bg-white border border-slate-200 rounded max-w-[120px]">
                                <img src={optImg} alt={`Opsi ${String.fromCharCode(65 + oIdx)}`} className="h-14 object-contain rounded" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {q.type === 'multiple_choice' && q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, oIdx) => {
                        const isCorrect = q.correctMulti?.includes(oIdx);
                        const optImg = q.optionImages?.[oIdx];

                        return (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-lg border flex flex-col gap-1.5 ${
                              isCorrect
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className="font-bold shrink-0">[{String.fromCharCode(65 + oIdx)}]</span>
                              <span className="flex-1" dir={/[\u0600-\u06FF]/.test(opt) ? 'rtl' : 'ltr'}>
                                {opt}
                              </span>
                              {isCorrect && (
                                <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold shrink-0">
                                  Kunci Benar
                                </span>
                              )}
                            </div>
                            {optImg && (
                              <div className="ml-5 p-1 bg-white border border-slate-200 rounded max-w-[120px]">
                                <img src={optImg} alt={`Opsi ${String.fromCharCode(65 + oIdx)}`} className="h-14 object-contain rounded" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {q.type === 'true_false' && q.trueFalseItems && (
                    q.trueFalseItems.length === 1 ? (
                      <div className="flex items-center gap-3 text-xs">
                        <span className="font-semibold text-slate-700">Kunci Jawaban:</span>
                        <span className={`px-3 py-1 rounded-lg font-bold text-xs ${
                          q.trueFalseItems[0].isCorrect
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}>
                          {q.trueFalseItems[0].isCorrect ? 'BENAR' : 'SALAH'}
                        </span>
                      </div>
                    ) : (
                      <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200 text-xs">
                        {q.trueFalseItems.map((item, tfIdx) => (
                          <div key={item.id} className="p-2.5 bg-slate-50 flex items-center justify-between gap-3">
                            <span>{tfIdx + 1}. {item.statement}</span>
                            <span className={`px-2 py-0.5 rounded font-bold text-[11px] shrink-0 ${
                              item.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              Kunci: {item.isCorrect ? 'BENAR' : 'SALAH'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )
                  )}

                  {q.type === 'matching' && (() => {
                    const mData = getMatchingData(q);
                    return (
                      <div className="space-y-4 text-xs">
                        {/* Kolom B Options */}
                        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                          <div className="font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                            <span>Kolom B (Pilihan Jawaban):</span>
                            <span className="text-[11px] text-slate-500 font-normal">{mData.options.length} Opsi</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {mData.options.map((opt, oIdx) => {
                              const matchedPremiseIdx = mData.premises.findIndex(p => p.correctOptionId === opt.id);
                              const pairColor = matchedPremiseIdx >= 0 ? getMatchingColor(matchedPremiseIdx) : null;

                              return (
                                <div
                                  key={opt.id}
                                  className={`p-2.5 bg-white rounded-xl border flex flex-col gap-1.5 shadow-2xs ${
                                    pairColor ? `${pairColor.border} border-2 ${pairColor.bgLight}` : 'border-slate-200'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className={`w-6 h-6 rounded-lg ${
                                        pairColor ? `${pairColor.badgeBg} ${pairColor.badgeText}` : 'bg-slate-200 text-slate-800'
                                      } font-bold text-xs flex items-center justify-center shrink-0`}>
                                        {opt.label}
                                      </span>
                                      <span className="font-medium text-slate-800">{opt.text || '(Opsi Gambar)'}</span>
                                    </div>
                                    {pairColor && (
                                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/80 text-slate-600 border border-slate-200">
                                        Kunci Soal #{matchedPremiseIdx + 1}
                                      </span>
                                    )}
                                  </div>
                                  {opt.imageUrl && (
                                    <div className="pl-8">
                                      <img
                                        src={opt.imageUrl}
                                        alt={`Opsi ${opt.label}`}
                                        className="h-16 w-auto max-w-full object-contain rounded-lg border border-slate-200 bg-white"
                                        referrerPolicy="no-referrer"
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Kolom A Premises & Answer Keys */}
                        <div className="space-y-2">
                          <div className="font-bold text-slate-700 uppercase tracking-wider">
                            Kolom A (Pertanyaan & Pasangan Kunci Jawaban):
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {mData.premises.map((premise, mIdx) => {
                              const pairColor = getMatchingColor(mIdx);
                              const correctOpt = mData.options.find(o => o.id === premise.correctOptionId);

                              return (
                                <div
                                  key={premise.id}
                                  className={`p-3 rounded-xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${pairColor.border} ${pairColor.bgLight}`}
                                >
                                  <div className="flex items-start gap-2.5">
                                    <span className={`w-6 h-6 rounded-lg ${pairColor.badgeBg} ${pairColor.badgeText} text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs`}>
                                      {mIdx + 1}
                                    </span>
                                    <div className="space-y-1">
                                      <span className="font-semibold text-slate-900 block">{premise.text || `(Pernyataan #${mIdx + 1})`}</span>
                                      {premise.imageUrl && (
                                        <img
                                          src={premise.imageUrl}
                                          alt={`Soal ${mIdx + 1}`}
                                          className="h-16 w-auto max-w-full object-contain rounded-lg border border-slate-200 bg-white"
                                          referrerPolicy="no-referrer"
                                        />
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                    <span className="text-xs text-slate-500 font-bold">&harr;</span>
                                    <span className={`px-2.5 py-1 rounded-lg ${pairColor.badgeBg} ${pairColor.badgeText} font-bold text-xs flex items-center gap-1.5 shadow-2xs`}>
                                      <span>Kunci: Opsi {correctOpt?.label || '?'}</span>
                                      {correctOpt?.text && <span className="font-normal opacity-90">({correctOpt.text})</span>}
                                    </span>
                                    {correctOpt?.imageUrl && (
                                      <img
                                        src={correctOpt.imageUrl}
                                        alt={`Kunci ${correctOpt.label}`}
                                        className="w-7 h-7 object-cover rounded border border-slate-300 bg-white"
                                        referrerPolicy="no-referrer"
                                      />
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {q.type === 'case_study' && (
                    <div className="space-y-3">
                      {q.caseContext && (
                        <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-200 text-xs text-indigo-950 leading-relaxed whitespace-pre-wrap">
                          <strong className="block text-indigo-900 mb-1 uppercase tracking-wide text-[11px]">Wacana / Skenario Studi Kasus:</strong>
                          {q.caseContext}
                        </div>
                      )}
                      {q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {q.options.map((opt, oIdx) => {
                            const isCorrect = q.correctSingle === oIdx;
                            const optImg = q.optionImages?.[oIdx];

                            return (
                              <div
                                key={oIdx}
                                className={`p-2.5 rounded-lg border flex flex-col gap-1.5 ${
                                  isCorrect
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                                    : 'bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  <span className="font-bold shrink-0">{String.fromCharCode(65 + oIdx)}.</span>
                                  <span className="flex-1">{opt}</span>
                                  {isCorrect && (
                                    <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold shrink-0">
                                      Kunci
                                    </span>
                                  )}
                                </div>
                                {optImg && (
                                  <div className="ml-5 p-1 bg-white border border-slate-200 rounded max-w-[120px]">
                                    <img src={optImg} alt={`Opsi ${String.fromCharCode(65 + oIdx)}`} className="h-14 object-contain rounded" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Explanation */}
                  {q.explanation && (
                    <div className="mt-3 pt-2 text-xs text-slate-500 border-t border-slate-100">
                      <span className="font-bold text-slate-700">Pembahasan: </span>
                      {q.explanation}
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>
      )}

      {/* PRINT-ONLY SIGNATURE BLOCK AT DOCUMENT END */}
      <div className="print-only">
        <OfficialReportSignature
          teacherName={currentExam?.teacherName || teacher.name}
          teacherNip={teacher.nipOrNis || '19831116 200904 2 003'}
        />
      </div>

      {/* INTERACTIVE OFFICIAL PRINT PREVIEW MODAL */}
      <PrintPreviewModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        defaultOrientation={printDocMode === 'kisi_kisi' ? 'landscape' : 'portrait'}
        title={
          printDocMode === 'kisi_kisi'
            ? 'Pratinjau Cetak: Matriks Kisi-Kisi Penulisan Soal'
            : 'Pratinjau Cetak: Dokumen Naskah Bank Soal'
        }
        subTitle={`UPT SMP Negeri 7 Pasuruan • ${currentExam?.subjectName} (${currentExam?.title})`}
      >
        <OfficialLetterhead
          mataPelajaran={currentExam?.subjectName || 'Pendidikan Agama Islam & Budi Pekerti'}
          kelas={currentExam?.targetClasses?.join(', ') || 'VIII (Delapan)'}
          waktu={`${currentExam?.durationMinutes || 90} Menit`}
          judulDokumen={
            printDocMode === 'kisi_kisi'
              ? 'KISI-KISI PENULISAN SOAL ASESMEN SUMATIF'
              : 'DOKUMEN NASKAH BANK SOAL ASESMEN SUMATIF'
          }
          subJudulDokumen={`UPT SMP NEGERI 7 PASURUAN • ${currentExam?.title?.toUpperCase() || 'ASESMEN SUMATIF SATUAN PENDIDIKAN'}`}
          isPrintOnly={false}
        />

        <div className="my-6">
          {printDocMode === 'kisi_kisi' ? (
            <div className="w-full overflow-hidden">
              <table className="w-full text-left text-xs border-collapse border border-black table-fixed">
                <thead className="bg-slate-100 border-b-2 border-black text-black font-serif font-bold text-center">
                  <tr>
                    <th className="p-1.5 border border-black w-[4%] text-center">No</th>
                    <th className="p-1.5 border border-black w-[20%] text-left">Capaian Pembelajaran / Elemen</th>
                    <th className="p-1.5 border border-black w-[16%] text-left">Materi Pokok</th>
                    <th className="p-1.5 border border-black w-[24%] text-left">Indikator Soal & Stimulus</th>
                    <th className="p-1.5 border border-black w-[13%] text-center">Bentuk Soal</th>
                    <th className="p-1.5 border border-black w-[6%] text-center">No. Soal</th>
                    <th className="p-1.5 border border-black w-[6%] text-center">Bobot</th>
                    <th className="p-1.5 border border-black w-[11%] text-center">Kunci / Kriteria</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/30 text-black font-serif">
                  {examQuestions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-slate-500 border border-black">
                        Belum ada butir soal yang diinputkan untuk paket ujian ini.
                      </td>
                    </tr>
                  ) : (
                    examQuestions.map((q, idx) => {
                      let keyText = '-';
                      if (q.type === 'single_choice' && q.options && q.correctSingle !== undefined) {
                        keyText = `${String.fromCharCode(65 + q.correctSingle)}. ${q.options[q.correctSingle]?.slice(0, 20)}...`;
                      } else if (q.type === 'multiple_choice' && q.correctMulti) {
                        keyText = q.correctMulti.map(i => String.fromCharCode(65 + i)).join(', ');
                      } else if (q.type === 'true_false' && q.trueFalseItems) {
                        keyText = q.trueFalseItems.map((tf, i) => `${i + 1}:${tf.isCorrect ? 'B' : 'S'}`).join(', ');
                      } else if (q.type === 'matching' && q.matchingPairs) {
                        keyText = `${q.matchingPairs.length} Pasangan`;
                      } else if (q.type === 'case_study') {
                        keyText = (q.caseKeywords || []).slice(0, 2).join(', ') || 'Rubrik';
                      }

                      return (
                        <tr key={q.id} className="text-[11px] leading-snug">
                          <td className="p-1.5 border border-black text-center font-bold align-top">{idx + 1}</td>
                          <td className="p-1.5 border border-black break-words align-top">
                            Memahami dan menganalisis materi {currentExam?.subjectName}
                          </td>
                          <td className="p-1.5 border border-black font-semibold break-words align-top">
                            {currentExam?.title || currentExam?.subjectName}
                          </td>
                          <td className="p-1.5 border border-black break-words align-top">
                            {q.caseContext && (
                              <span className="font-semibold text-slate-800 block mb-0.5">
                                [Wacana]: {q.caseContext.slice(0, 35)}...
                              </span>
                            )}
                            <span>Disajikan stimulus, siswa mampu menjawab: "{q.prompt.slice(0, 60)}..."</span>
                          </td>
                          <td className="p-1.5 border border-black text-center font-medium break-words align-top">
                            {formatQuestionTypeLabel(q.type)}
                          </td>
                          <td className="p-1.5 border border-black text-center font-bold align-top">{idx + 1}</td>
                          <td className="p-1.5 border border-black text-center font-bold align-top">{q.points}</td>
                          <td className="p-1.5 border border-black text-center text-[10px] font-mono break-words align-top">{keyText}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-6">
              {examQuestions.length === 0 ? (
                <p className="text-center text-slate-500 py-8">Belum ada butir soal.</p>
              ) : (
                examQuestions.map((q, idx) => (
                  <div key={q.id} className="pb-4 border-b border-black/20 break-inside-avoid">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-black">{idx + 1}.</span>
                        <span className="text-[11px] font-bold uppercase px-1.5 py-0.5 bg-slate-100 rounded border border-slate-300">
                          {q.type.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-black">
                        Bobot: {q.points} Poin
                      </span>
                    </div>

                    {q.caseContext && (
                      <div className="p-2.5 bg-slate-50 border border-slate-300 rounded text-xs mb-3 italic">
                        <strong>[Wacana Kasus]:</strong> {q.caseContext}
                      </div>
                    )}

                    {q.imageUrl && (
                      <div className="mb-3 max-w-xs">
                        <img src={q.imageUrl} alt={`Soal ${idx + 1}`} className="max-h-40 w-auto object-contain border border-slate-300 rounded" />
                      </div>
                    )}

                    <p className={`text-sm text-black mb-3 ${/[\u0600-\u06FF]/.test(q.prompt) ? 'font-arabic text-base' : ''}`} dir={/[\u0600-\u06FF]/.test(q.prompt) ? 'rtl' : 'ltr'}>
                      {q.prompt}
                    </p>

                    {/* Options */}
                    {q.type === 'single_choice' && q.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {q.options.map((opt, oIdx) => {
                          const isCorrect = q.correctSingle === oIdx;
                          return (
                            <div key={oIdx} className={`p-2 rounded border flex items-center gap-2 ${isCorrect ? 'border-black font-bold bg-slate-100' : 'border-slate-300'}`}>
                              <span className="w-5 h-5 rounded-full border border-black flex items-center justify-center font-bold text-[11px]">
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span>{opt}</span>
                              {isCorrect && <span className="ml-auto text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-1 rounded">Kunci</span>}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {q.type === 'multiple_choice' && q.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {q.options.map((opt, oIdx) => {
                          const isCorrect = q.correctMulti?.includes(oIdx);
                          return (
                            <div key={oIdx} className={`p-2 rounded border flex items-center gap-2 ${isCorrect ? 'border-black font-bold bg-slate-100' : 'border-slate-300'}`}>
                              <span className="w-5 h-5 rounded border border-black flex items-center justify-center font-bold text-[11px]">
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span>{opt}</span>
                              {isCorrect && <span className="ml-auto text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-1 rounded">Kunci</span>}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {q.type === 'true_false' && q.trueFalseItems && (
                      q.trueFalseItems.length === 1 ? (
                        <div className="p-2 border border-slate-300 rounded flex items-center justify-between text-xs">
                          <span>Pilihan Kunci Jawaban:</span>
                          <span className="font-bold underline">{q.trueFalseItems[0].isCorrect ? 'BENAR' : 'SALAH'}</span>
                        </div>
                      ) : (
                        <div className="space-y-1 text-xs">
                          {q.trueFalseItems.map((item, tIdx) => (
                            <div key={tIdx} className="p-2 border border-slate-300 rounded flex items-center justify-between">
                              <span>{tIdx + 1}. {item.statement}</span>
                              <span className="font-bold underline">{item.isCorrect ? 'BENAR' : 'SALAH'}</span>
                            </div>
                          ))}
                        </div>
                      )
                    )}

                    {q.type === 'matching' && (() => {
                      const mData = getMatchingData(q);
                      return (
                        <div className="space-y-3 text-xs">
                          <div className="font-bold uppercase tracking-wider">Kolom B (Pilihan Jawaban):</div>
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            {mData.options.map(opt => (
                              <div key={opt.id} className="p-1.5 border border-slate-300 rounded flex flex-col gap-1 text-[11px]">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold border border-black px-1.5 py-0.5 rounded text-[10px]">{opt.label}</span>
                                  <span>{opt.text}</span>
                                </div>
                                {opt.imageUrl && (
                                  <img src={opt.imageUrl} alt={`Opsi ${opt.label}`} className="h-12 w-auto object-contain rounded border border-slate-200" />
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="font-bold uppercase tracking-wider">Kolom A & Kunci Jawaban:</div>
                          <div className="space-y-1.5">
                            {mData.premises.map((premise, pIdx) => {
                              const correctOpt = mData.options.find(o => o.id === premise.correctOptionId);
                              return (
                                <div key={premise.id} className="p-2 border border-slate-300 rounded flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold">{pIdx + 1}.</span>
                                    <span>{premise.text}</span>
                                    {premise.imageUrl && (
                                      <img src={premise.imageUrl} alt={`Soal ${pIdx + 1}`} className="h-10 w-auto object-contain rounded border border-slate-200" />
                                    )}
                                  </div>
                                  <span className="font-bold border border-black px-1.5 py-0.5 rounded text-[11px] shrink-0">
                                    Kunci: Opsi {correctOpt?.label} {correctOpt?.text ? `(${correctOpt.text})` : ''}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                    {q.type === 'case_study' && (
                      <div className="space-y-2 text-xs">
                        {q.caseContext && (
                          <div className="p-2 bg-slate-100 border border-slate-300 rounded mb-2 whitespace-pre-wrap">
                            <strong>Wacana / Skenario:</strong> {q.caseContext}
                          </div>
                        )}
                        {q.options && (
                          <div className="space-y-1">
                            {q.options.map((opt, oIdx) => {
                              const isCorrect = q.correctSingle === oIdx;
                              return (
                                <div key={oIdx} className={`p-1.5 border border-slate-300 rounded flex items-center justify-between ${isCorrect ? 'bg-emerald-50 font-bold' : ''}`}>
                                  <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                                  {isCorrect && <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded">Kunci</span>}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {q.explanation && (
                      <div className="mt-2 text-xs text-slate-600 italic">
                        <strong>Pembahasan:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <OfficialReportSignature
          teacherName={currentExam?.teacherName || teacher.name}
          teacherNip={teacher.nipOrNis || '19831116 200904 2 003'}
        />
      </PrintPreviewModal>

      {/* Supabase SQL & Sync Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

    </div>
  );
};
