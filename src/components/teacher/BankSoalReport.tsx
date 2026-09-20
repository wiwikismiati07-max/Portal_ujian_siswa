import React, { useState } from 'react';
import { Exam, Question, Subject, User } from '../../types';
import {
  Printer,
  Plus,
  Edit2,
  Trash2,
  Filter,
  FileText,
  CheckCircle2,
  CheckSquare,
  ListChecks,
  GitCommit,
  BookOpen,
  Award
} from 'lucide-react';

interface BankSoalReportProps {
  teacher: User;
  exams: Exam[];
  questions: Question[];
  subjects: Subject[];
  onAddQuestion: (exam: Exam) => void;
  onEditQuestion: (exam: Exam, question: Question) => void;
  onDeleteQuestion: (questionId: string) => void;
}

export const BankSoalReport: React.FC<BankSoalReportProps> = ({
  teacher,
  exams,
  questions,
  subjects,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion
}) => {
  const [selectedExamId, setSelectedExamId] = useState<string>(
    exams.length > 0 ? exams[0].id : ''
  );

  const currentExam = exams.find(e => e.id === selectedExamId) || exams[0];
  const examQuestions = questions.filter(q => q.examId === currentExam?.id);

  // Statistics of question types
  const typeCounts = {
    single_choice: examQuestions.filter(q => q.type === 'single_choice').length,
    multiple_choice: examQuestions.filter(q => q.type === 'multiple_choice').length,
    true_false: examQuestions.filter(q => q.type === 'true_false').length,
    matching: examQuestions.filter(q => q.type === 'matching').length,
    case_study: examQuestions.filter(q => q.type === 'case_study').length
  };

  const totalPoints = examQuestions.reduce((sum, q) => sum + q.points, 0);

  const handlePrint = () => {
    window.print();
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
              Input Bank Soal Guru Mata Pelajaran
            </h3>
            <p className="text-xs text-slate-500">
              Pilih paket ujian untuk membuat/mengelola butir soal, melihat kisi-kisi, dan cetak naskah soal
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
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

          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Laporan / Naskah</span>
          </button>
        </div>
      </div>

      {/* PRINT HEADER KOP SURAT (Shown only on Print) */}
      <div className="print-only mb-6 border-b-2 border-black pb-4 text-center">
        <h2 className="text-xl font-bold uppercase tracking-wider">
          PORTAL UJIAN SISWA • ASESMEN SUMATIF SATUAN PENDIDIKAN
        </h2>
        <p className="text-sm font-medium">
          DOKUMEN KISI-KISI & NASKAH BANK SOAL GURU MATA PELAJARAN
        </p>
        <div className="text-xs mt-3 flex justify-between border-t border-black pt-2">
          <span>Mata Pelajaran: <strong>{currentExam?.subjectName}</strong></span>
          <span>Guru Pengampu: <strong>{currentExam?.teacherName || teacher.name}</strong></span>
          <span>Target Kelas: <strong>{currentExam?.targetClasses?.join(', ')}</strong></span>
          <span>Durasi: <strong>{currentExam?.durationMinutes} Menit</strong></span>
        </div>
      </div>

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

      {/* Question Cards List */}
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
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs relative"
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
                )}

                {q.type === 'matching' && q.matchingPairs && (
                  <div className="space-y-1.5 text-xs">
                    {q.matchingPairs.map((pair, mIdx) => (
                      <div key={pair.id} className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-2">
                        <span className="font-medium text-slate-800">{mIdx + 1}. {pair.left}</span>
                        <span className="text-slate-400 font-bold">➔</span>
                        <span className="font-semibold text-indigo-700 bg-white px-2 py-1 rounded border border-slate-200">
                          {pair.right}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {q.type === 'case_study' && (
                  <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-950 space-y-1">
                    <div>
                      <strong>Kata Kunci Penilaian:</strong> {(q.caseKeywords || []).join(', ') || '-'}
                    </div>
                    {q.rubricNotes && (
                      <div>
                        <strong>Rubrik Guru:</strong> {q.rubricNotes}
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

    </div>
  );
};
