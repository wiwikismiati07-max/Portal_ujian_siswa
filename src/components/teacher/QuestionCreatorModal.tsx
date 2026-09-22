import React, { useState, useRef } from 'react';
import { Question, QuestionType, Exam, TrueFalseStatement, MatchingPremise, MatchingOption } from '../../types';
import { getMatchingData, MATCHING_COLORS, getMatchingColor } from '../../utils/matchingHelper';
import {
  X,
  Plus,
  Trash2,
  HelpCircle,
  CheckCircle2,
  BookOpen,
  CheckSquare,
  ListChecks,
  GitCommit,
  Sparkles,
  Image as ImageIcon,
  Keyboard,
  AlignRight,
  ExternalLink,
  Layers,
  Shuffle,
  Eye
} from 'lucide-react';
import { ImageSearchModal } from './ImageSearchModal';
import { ArabicVirtualKeyboard } from './ArabicVirtualKeyboard';

interface QuestionCreatorModalProps {
  exam: Exam;
  isOpen: boolean;
  onClose: () => void;
  onSaveQuestion: (question: Question) => void;
  initialQuestion?: Question | null;
  allExams?: Exam[];
  onSelectExam?: (exam: Exam) => void;
  onOpenBankSoal?: (examId: string) => void;
}

export const QuestionCreatorModal: React.FC<QuestionCreatorModalProps> = ({
  exam,
  isOpen,
  onClose,
  onSaveQuestion,
  initialQuestion,
  allExams,
  onSelectExam,
  onOpenBankSoal
}) => {
  const [currentExam, setCurrentExam] = useState<Exam>(exam);
  const [recentSuccessMsg, setRecentSuccessMsg] = useState<string | null>(null);

  React.useEffect(() => {
    setCurrentExam(exam);
  }, [exam]);
  const [type, setType] = useState<QuestionType>(initialQuestion?.type || 'single_choice');
  const [instructions, setInstructions] = useState(initialQuestion?.instructions || '');
  const [prompt, setPrompt] = useState(initialQuestion?.prompt || '');
  const [points, setPoints] = useState<number>(initialQuestion?.points || 20);
  const [explanation, setExplanation] = useState(initialQuestion?.explanation || '');
  const [imageUrl, setImageUrl] = useState<string>(initialQuestion?.imageUrl || '');

  // For Single & Multiple Choice
  const [options, setOptions] = useState<string[]>(
    initialQuestion?.options || ['Opsi A', 'Opsi B', 'Opsi C', 'Opsi D']
  );
  const [optionImages, setOptionImages] = useState<(string | undefined)[]>(
    initialQuestion?.optionImages || []
  );
  const [correctSingle, setCorrectSingle] = useState<number>(initialQuestion?.correctSingle ?? 0);
  const [correctMulti, setCorrectMulti] = useState<number[]>(initialQuestion?.correctMulti || [0]);

  // For True / False
  const [isTfCorrect, setIsTfCorrect] = useState<boolean>(
    initialQuestion?.trueFalseItems?.[0]?.isCorrect ?? true
  );

  // For Matching (Kolom A & Kolom B + Gambar & Pasangan Kunci)
  const initialMatching = initialQuestion ? getMatchingData(initialQuestion) : {
    premises: [
      { id: 'prem_1', text: '', imageUrl: undefined, correctOptionId: 'opt_1' },
      { id: 'prem_2', text: '', imageUrl: undefined, correctOptionId: 'opt_2' },
      { id: 'prem_3', text: '', imageUrl: undefined, correctOptionId: 'opt_3' },
      { id: 'prem_4', text: '', imageUrl: undefined, correctOptionId: 'opt_4' }
    ],
    options: [
      { id: 'opt_1', label: 'A', text: '', imageUrl: undefined },
      { id: 'opt_2', label: 'B', text: '', imageUrl: undefined },
      { id: 'opt_3', label: 'C', text: '', imageUrl: undefined },
      { id: 'opt_4', label: 'D', text: '', imageUrl: undefined }
    ]
  };
  const [matchingPremises, setMatchingPremises] = useState<MatchingPremise[]>(initialMatching.premises);
  const [matchingOptions, setMatchingOptions] = useState<MatchingOption[]>(initialMatching.options);

  // For Case Study
  const [caseContext, setCaseContext] = useState(initialQuestion?.caseContext || '');
  const [caseKeywordsStr, setCaseKeywordsStr] = useState(
    (initialQuestion?.caseKeywords || []).join(', ')
  );
  const [rubricNotes, setRubricNotes] = useState(initialQuestion?.rubricNotes || '');

  // Image Modal State
  const [imageModalOpen, setImageModalOpen] = useState<boolean>(false);
  const [imageModalTarget, setImageModalTarget] = useState<{
    type: 'prompt' | 'option' | 'matching_premise' | 'matching_option';
    optionIndex?: number;
    premiseIndex?: number;
    matchingOptionIndex?: number;
    title: string;
    currentUrl?: string;
  }>({
    type: 'prompt',
    title: 'Butir Soal',
    currentUrl: ''
  });

  // Arabic Keyboard State
  const [showArabicKeyboard, setShowArabicKeyboard] = useState<boolean>(false);
  const [isRtlMode, setIsRtlMode] = useState<boolean>(false);
  const [activeFieldName, setActiveFieldName] = useState<string>('Pertanyaan Soal');
  const focusedElementRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  if (!isOpen) return null;

  // Insert Arabic character into currently focused input/textarea
  const handleInsertArabicChar = (char: string) => {
    if (focusedElementRef.current) {
      const el = focusedElementRef.current;
      const start = el.selectionStart ?? el.value.length;
      const end = el.selectionEnd ?? el.value.length;
      const val = el.value;
      const newVal = val.substring(0, start) + char + val.substring(end);

      const proto = el instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
      const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
      nativeSetter?.call(el, newVal);
      el.dispatchEvent(new Event('input', { bubbles: true }));

      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start + char.length, start + char.length);
      }, 0);
    } else {
      // Default to appending to prompt
      setPrompt(prev => prev + char);
    }
  };

  const handleArabicBackspace = () => {
    if (focusedElementRef.current) {
      const el = focusedElementRef.current;
      const start = el.selectionStart ?? el.value.length;
      const end = el.selectionEnd ?? el.value.length;
      const val = el.value;

      let newVal = val;
      let newCursor = start;

      if (start === end && start > 0) {
        newVal = val.substring(0, start - 1) + val.substring(end);
        newCursor = start - 1;
      } else if (start !== end) {
        newVal = val.substring(0, start) + val.substring(end);
        newCursor = start;
      }

      const proto = el instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
      const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
      nativeSetter?.call(el, newVal);
      el.dispatchEvent(new Event('input', { bubbles: true }));

      setTimeout(() => {
        el.focus();
        el.setSelectionRange(newCursor, newCursor);
      }, 0);
    } else {
      setPrompt(prev => prev.slice(0, -1));
    }
  };

  const handleArabicClear = () => {
    if (focusedElementRef.current) {
      const el = focusedElementRef.current;
      const proto = el instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
      const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
      nativeSetter?.call(el, '');
      el.dispatchEvent(new Event('input', { bubbles: true }));

      setTimeout(() => {
        el.focus();
      }, 0);
    } else {
      setPrompt('');
    }
  };

  // Image search handlers
  const handleOpenImageModalForPrompt = () => {
    setImageModalTarget({
      type: 'prompt',
      title: 'Butir Soal',
      currentUrl: imageUrl
    });
    setImageModalOpen(true);
  };

  const handleOpenImageModalForOption = (index: number) => {
    setImageModalTarget({
      type: 'option',
      optionIndex: index,
      title: `Pilihan Jawaban ${String.fromCharCode(65 + index)}`,
      currentUrl: optionImages[index] || ''
    });
    setImageModalOpen(true);
  };

  const handleOpenImageModalForPremise = (index: number) => {
    setImageModalTarget({
      type: 'matching_premise',
      premiseIndex: index,
      title: `Gambar Kolom Kiri Soal #${index + 1}`,
      currentUrl: matchingPremises[index]?.imageUrl || ''
    });
    setImageModalOpen(true);
  };

  const handleOpenImageModalForMatchingOption = (index: number) => {
    const label = String.fromCharCode(65 + index);
    setImageModalTarget({
      type: 'matching_option',
      matchingOptionIndex: index,
      title: `Gambar Pilihan Jawaban ${label}`,
      currentUrl: matchingOptions[index]?.imageUrl || ''
    });
    setImageModalOpen(true);
  };

  const handleSaveSelectedImage = (selectedImgUrl: string) => {
    if (imageModalTarget.type === 'prompt') {
      setImageUrl(selectedImgUrl);
    } else if (imageModalTarget.type === 'option' && imageModalTarget.optionIndex !== undefined) {
      const next = [...optionImages];
      next[imageModalTarget.optionIndex] = selectedImgUrl || undefined;
      setOptionImages(next);
    } else if (imageModalTarget.type === 'matching_premise' && imageModalTarget.premiseIndex !== undefined) {
      const next = [...matchingPremises];
      next[imageModalTarget.premiseIndex].imageUrl = selectedImgUrl || undefined;
      setMatchingPremises(next);
    } else if (imageModalTarget.type === 'matching_option' && imageModalTarget.matchingOptionIndex !== undefined) {
      const next = [...matchingOptions];
      next[imageModalTarget.matchingOptionIndex].imageUrl = selectedImgUrl || undefined;
      setMatchingOptions(next);
    }
  };

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, `Opsi ${String.fromCharCode(65 + options.length)}`]);
      setOptionImages([...optionImages, undefined]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const next = options.filter((_, i) => i !== index);
      setOptions(next);
      const nextImages = optionImages.filter((_, i) => i !== index);
      setOptionImages(nextImages);
      if (correctSingle === index) setCorrectSingle(0);
      setCorrectMulti(correctMulti.filter(i => i !== index));
    }
  };

  const handleAddPremise = () => {
    const newIdx = matchingPremises.length;
    const targetOptId = matchingOptions[newIdx]?.id || matchingOptions[0]?.id || `opt_${Date.now()}`;
    setMatchingPremises([
      ...matchingPremises,
      { id: `prem_${Date.now()}_${newIdx + 1}`, text: '', imageUrl: undefined, correctOptionId: targetOptId }
    ]);
  };

  const handleAddMatchingPair = () => {
    const nextIdx = matchingPremises.length;
    const newOptId = `opt_${Date.now()}_${nextIdx + 1}`;
    const newPremId = `prem_${Date.now()}_${nextIdx + 1}`;
    
    setMatchingOptions([
      ...matchingOptions,
      { id: newOptId, label: String.fromCharCode(65 + matchingOptions.length), text: '', imageUrl: undefined }
    ]);
    setMatchingPremises([
      ...matchingPremises,
      { id: newPremId, text: '', imageUrl: undefined, correctOptionId: newOptId }
    ]);
  };

  const handleRemovePremise = (index: number) => {
    if (matchingPremises.length > 1) {
      setMatchingPremises(matchingPremises.filter((_, i) => i !== index));
    }
  };

  const handleAddMatchingOption = () => {
    const nextIdx = matchingOptions.length;
    setMatchingOptions([
      ...matchingOptions,
      { id: `opt_${Date.now()}`, label: String.fromCharCode(65 + nextIdx), text: '', imageUrl: undefined }
    ]);
  };

  const handleRemoveMatchingOption = (index: number) => {
    if (matchingOptions.length > 2) {
      const removedOptId = matchingOptions[index]?.id;
      const nextOpts = matchingOptions.filter((_, i) => i !== index);
      setMatchingOptions(nextOpts);
      // Remap any premise that had this removed option as key
      setMatchingPremises(matchingPremises.map(p => {
        if (p.correctOptionId === removedOptId) {
          return { ...p, correctOptionId: nextOpts[0]?.id || '' };
        }
        return p;
      }));
    }
  };

  const saveAndProcess = (actionType: 'close' | 'add_more' | 'open_bank') => {
    if (!prompt.trim()) return;

    const newQ: Question = {
      id: initialQuestion?.id || `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      examId: currentExam.id,
      type,
      prompt: prompt.trim(),
      instructions: instructions.trim() || undefined,
      points: Number(points) || 10,
      imageUrl: imageUrl.trim() || undefined,
      explanation: explanation.trim() || undefined
    };

    if (type === 'single_choice') {
      newQ.options = options.map(o => o.trim());
      newQ.correctSingle = correctSingle;
      if (optionImages.some(img => img && img.trim())) {
        newQ.optionImages = optionImages.map(img => img?.trim() || undefined);
      }
    } else if (type === 'multiple_choice') {
      newQ.options = options.map(o => o.trim());
      newQ.correctMulti = correctMulti;
      if (optionImages.some(img => img && img.trim())) {
        newQ.optionImages = optionImages.map(img => img?.trim() || undefined);
      }
    } else if (type === 'true_false') {
      newQ.trueFalseItems = [
        {
          id: 'tf_1',
          statement: prompt.trim() || 'Pernyataan',
          isCorrect: isTfCorrect
        }
      ];
    } else if (type === 'matching') {
      newQ.matchingData = {
        premises: matchingPremises.map(p => ({
          ...p,
          text: p.text.trim(),
          imageUrl: p.imageUrl?.trim() || undefined
        })),
        options: matchingOptions.map((o, idx) => ({
          ...o,
          label: String.fromCharCode(65 + idx),
          text: o.text.trim(),
          imageUrl: o.imageUrl?.trim() || undefined
        }))
      };
    } else if (type === 'case_study') {
      newQ.caseContext = caseContext.trim();
      newQ.options = options.map(o => o.trim());
      newQ.correctSingle = correctSingle;
      if (optionImages.some(img => img && img.trim())) {
        newQ.optionImages = optionImages.map(img => img?.trim() || undefined);
      }
    }

    onSaveQuestion(newQ);

    if (actionType === 'add_more') {
      setPrompt('');
      setInstructions('');
      setImageUrl('');
      setExplanation('');
      setOptions(['', '', '', '']);
      setOptionImages([]);
      setCorrectSingle(0);
      setCorrectMulti([0]);
      setIsTfCorrect(true);
      setCaseContext('');
      setMatchingPremises([
        { id: `prem_${Date.now()}_1`, text: '', correctOptionId: 'opt_1' },
        { id: `prem_${Date.now()}_2`, text: '', correctOptionId: 'opt_2' },
        { id: `prem_${Date.now()}_3`, text: '', correctOptionId: 'opt_3' }
      ]);
      setRecentSuccessMsg(`Soal berhasil disimpan ke dalam paket "${currentExam.title}". Silakan lanjutkan menulis butir soal berikutnya.`);
    } else if (actionType === 'open_bank') {
      onOpenBankSoal?.(currentExam.id);
      onClose();
    } else {
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveAndProcess('close');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 flex items-start sm:items-center justify-center min-h-screen">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] my-auto shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {initialQuestion ? 'Edit Butir Soal Ujian' : 'Tambah Butir Soal Baru'}
            </h3>
            <p className="text-xs text-slate-500">
              Paket Ujian: <strong className="text-slate-700">{currentExam.title}</strong> ({currentExam.subjectName})
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowArabicKeyboard(!showArabicKeyboard)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                showArabicKeyboard
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
              }`}
              title="Aktifkan papan ketik Bahasa Arab virtual"
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span className="font-arabic font-bold text-sm">لوحة عربية</span>
              <span className="hidden sm:inline text-[11px] font-medium">(Keyboard Arab)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Target Exam Package Banner */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    Paket Ujian Tujuan
                  </span>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-200">
                    Menambahkan ke paket yang sama
                  </span>
                </div>
                <div className="pt-1">
                  {allExams && allExams.length > 1 ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-600">Pilih Paket:</span>
                      <select
                        value={currentExam.id}
                        onChange={(e) => {
                          const found = allExams.find(ex => ex.id === e.target.value);
                          if (found) {
                            setCurrentExam(found);
                            onSelectExam?.(found);
                          }
                        }}
                        className="text-xs sm:text-sm font-extrabold text-indigo-950 bg-white border border-indigo-300 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs cursor-pointer"
                      >
                        {allExams.map(ex => (
                          <option key={ex.id} value={ex.id}>
                            {ex.title} — {ex.subjectName} ({ex.targetClasses.join(', ')})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <h4 className="text-sm font-extrabold text-indigo-950">
                      {currentExam.title} ({currentExam.subjectName})
                    </h4>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Butir soal yang Anda buat akan langsung ditambahkan ke dalam paket <strong>"{currentExam.title}"</strong> tanpa membuat paket ujian baru.
                </p>
              </div>
            </div>
          </div>

          {/* Recent Success Alert */}
          {recentSuccessMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{recentSuccessMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setRecentSuccessMsg(null)}
                className="text-emerald-700 hover:text-emerald-900 font-bold text-[11px] underline cursor-pointer ml-3 shrink-0"
              >
                Tutup
              </button>
            </div>
          )}
          
          {/* Question Type Selection (5 types) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Bentuk / Tipe Soal (Pilih Salah Satu):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                type="button"
                onClick={() => setType('single_choice')}
                className={`p-3 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center gap-1.5 cursor-pointer ${
                  type === 'single_choice'
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700 ring-2 ring-indigo-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>PG Tunggal</span>
              </button>

              <button
                type="button"
                onClick={() => setType('multiple_choice')}
                className={`p-3 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center gap-1.5 cursor-pointer ${
                  type === 'multiple_choice'
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700 ring-2 ring-indigo-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>PG Kompleks</span>
              </button>

              <button
                type="button"
                onClick={() => setType('true_false')}
                className={`p-3 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center gap-1.5 cursor-pointer ${
                  type === 'true_false'
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700 ring-2 ring-indigo-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ListChecks className="w-4 h-4" />
                <span>Benar / Salah</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('matching');
                  if (!prompt || prompt.trim() === '') {
                    setPrompt('Petunjuk: Jodohkan pernyataan pada Kolom A dengan pilihan jawaban yang tepat pada Kolom B.');
                  }
                }}
                className={`p-3 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center gap-1.5 cursor-pointer ${
                  type === 'matching'
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700 ring-2 ring-indigo-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <GitCommit className="w-4 h-4" />
                <span>Menjodohkan</span>
              </button>

              <button
                type="button"
                onClick={() => setType('case_study')}
                className={`p-3 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center gap-1.5 cursor-pointer col-span-2 sm:col-span-1 ${
                  type === 'case_study'
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700 ring-2 ring-indigo-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Studi Kasus</span>
              </button>
            </div>
          </div>

          {/* Points / Bobot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bobot Nilai / Poin Soal <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                required
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              />
            </div>
            <div className="text-xs text-slate-500 flex items-center pt-5">
              Nilai otomatis dihitung pada rekapitulasi saat siswa mengumpulkan ujian.
            </div>
          </div>

          {/* Case Context if Case Study */}
          {type === 'case_study' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Wacana / Skenario Studi Kasus <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsRtlMode(!isRtlMode)}
                  className={`text-[11px] font-bold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                    isRtlMode ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-slate-50 text-slate-500 border-slate-200'
                  }`}
                >
                  <AlignRight className="w-3 h-3 inline mr-1" />
                  Mode Arab (RTL)
                </button>
              </div>
              <textarea
                rows={4}
                value={caseContext}
                onChange={(e) => setCaseContext(e.target.value)}
                onFocus={(e) => {
                  focusedElementRef.current = e.target;
                  setActiveFieldName('Wacana Studi Kasus');
                }}
                dir={isRtlMode ? 'rtl' : 'ltr'}
                placeholder="Tuliskan stimulus, teks bacaan, atau narasi situasi masalah yang akan dianalisis oleh siswa..."
                required
                className={`w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none ${
                  isRtlMode ? 'font-arabic text-base' : ''
                }`}
              />
            </div>
          )}

          {/* Instruksi Soal (Petunjuk Pengerjaan) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                Instruksi Soal <span className="text-slate-400 font-normal text-[11px]">(Petunjuk Pengerjaan / Opsional)</span>
              </label>
            </div>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              onFocus={(e) => {
                focusedElementRef.current = e.target;
                setActiveFieldName('Instruksi Soal');
              }}
              dir={isRtlMode ? 'rtl' : 'ltr'}
              placeholder="Contoh: Bacalah setiap pernyataan berikut dengan teliti. Berilah tanda B jika benar dan S jika salah..."
              className={`w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none leading-relaxed ${
                isRtlMode ? 'font-arabic text-base' : ''
              }`}
            />
          </div>

          {/* Pertanyaan Soal + Image Inserter + Arabic Keyboard Toolbar */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-xs font-semibold text-slate-700">
                Pertanyaan Soal <span className="text-rose-500">*</span>
              </label>

              {/* Action Toolbar */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleOpenImageModalForPrompt}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
                    imageUrl
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-300 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                  title="Sisipkan gambar pada butir soal dari pencarian Google, URL, atau unggahan"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{imageUrl ? 'Gambar Terpasang' : 'Sisipkan Gambar Soal'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsRtlMode(!isRtlMode)}
                  className={`px-2 py-1 text-xs font-bold rounded-lg border flex items-center gap-1 transition-all cursor-pointer ${
                    isRtlMode
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                  title="Arah tulisan Kanan-ke-Kiri (Bahasa Arab)"
                >
                  <AlignRight className="w-3.5 h-3.5" />
                  <span>RTL</span>
                </button>
              </div>
            </div>

            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onFocus={(e) => {
                focusedElementRef.current = e.target;
                setActiveFieldName('Pertanyaan Soal');
              }}
              dir={isRtlMode ? 'rtl' : 'ltr'}
              placeholder="Ketikkan teks pertanyaan atau butir soal yang diujikan..."
              required
              className={`w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none leading-relaxed ${
                isRtlMode ? 'font-arabic text-base' : ''
              }`}
            />

            {/* Question Image Preview Banner (if attached) */}
            {imageUrl && (
              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-14 h-14 rounded-xl bg-white border border-indigo-200 overflow-hidden shrink-0 flex items-center justify-center shadow-2xs">
                    <img
                      src={imageUrl}
                      alt="Gambar Butir Soal"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-indigo-950 flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                      Gambar Terpasang pada Butir Soal
                    </p>
                    <p className="text-[11px] text-indigo-700 truncate max-w-xs sm:max-w-md">
                      {imageUrl}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleOpenImageModalForPrompt}
                    className="px-2.5 py-1 text-xs font-bold text-indigo-700 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer"
                  >
                    Ganti
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                    title="Hapus Gambar Soal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* TYPE-SPECIFIC EDITOR */}

          {/* 1. Single Choice & Case Study Options */}
          {(type === 'single_choice' || type === 'case_study') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Pilihan Jawaban (Pilih radio untuk menandai Kunci Jawaban):
                </label>
                {options.length < 6 && (
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="text-xs text-indigo-600 font-bold hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Pilihan
                  </button>
                )}
              </div>

              {options.map((opt, idx) => {
                const optImg = optionImages[idx];
                const letter = String.fromCharCode(65 + idx);

                return (
                  <div key={idx} className="p-2.5 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correct_single_choice"
                        checked={correctSingle === idx}
                        onChange={() => setCorrectSingle(idx)}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        title="Tandai sebagai kunci jawaban benar"
                      />
                      <span className="w-6 text-xs font-bold text-slate-500 text-center">
                        {letter}.
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const next = [...options];
                          next[idx] = e.target.value;
                          setOptions(next);
                        }}
                        onFocus={(e) => {
                          focusedElementRef.current = e.target;
                          setActiveFieldName(`Opsi ${letter}`);
                        }}
                        dir={isRtlMode ? 'rtl' : 'ltr'}
                        required
                        className={`flex-1 px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none ${
                          isRtlMode ? 'font-arabic text-base' : ''
                        }`}
                      />

                      {/* Image Button for Option */}
                      <button
                        type="button"
                        onClick={() => handleOpenImageModalForOption(idx)}
                        className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          optImg
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                        }`}
                        title={`Sisipkan Gambar pada Opsi ${letter}`}
                      >
                        <ImageIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">{optImg ? 'Gambar Ada' : 'Gambar'}</span>
                      </button>

                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx)}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                          title="Hapus opsi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Mini Option Image Preview if attached */}
                    {optImg && (
                      <div className="ml-8 flex items-center gap-2 p-1.5 bg-white border border-indigo-200 rounded-xl">
                        <img
                          src={optImg}
                          alt={`Gambar Opsi ${letter}`}
                          className="w-10 h-10 object-contain rounded-lg border border-slate-100"
                        />
                        <div className="flex-1 text-[11px] truncate text-slate-600">
                          <span className="font-bold text-indigo-900 mr-1">[Gambar Opsi {letter}]</span>
                          <span className="text-slate-400">{optImg}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenImageModalForOption(idx)}
                          className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold px-2 py-0.5 rounded cursor-pointer"
                        >
                          Ganti
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const next = [...optionImages];
                            next[idx] = undefined;
                            setOptionImages(next);
                          }}
                          className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                          title="Hapus Gambar Opsi"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 2. Multiple Choice Options */}
          {type === 'multiple_choice' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Pilihan Jawaban (Centang semua opsi yang menjadi Kunci Jawaban):
                </label>
                {options.length < 6 && (
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="text-xs text-indigo-600 font-bold hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Opsi
                  </button>
                )}
              </div>

              {options.map((opt, idx) => {
                const optImg = optionImages[idx];
                const letter = String.fromCharCode(65 + idx);
                const isChecked = correctMulti.includes(idx);
                const toggle = () => {
                  if (isChecked) {
                    setCorrectMulti(correctMulti.filter(i => i !== idx));
                  } else {
                    setCorrectMulti([...correctMulti, idx].sort());
                  }
                };

                return (
                  <div key={idx} className="p-2.5 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={toggle}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className="w-6 text-xs font-bold text-slate-500 text-center">
                        [{letter}]
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const next = [...options];
                          next[idx] = e.target.value;
                          setOptions(next);
                        }}
                        onFocus={(e) => {
                          focusedElementRef.current = e.target;
                          setActiveFieldName(`Opsi ${letter}`);
                        }}
                        dir={isRtlMode ? 'rtl' : 'ltr'}
                        required
                        className={`flex-1 px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none ${
                          isRtlMode ? 'font-arabic text-base' : ''
                        }`}
                      />

                      {/* Image Button for Option */}
                      <button
                        type="button"
                        onClick={() => handleOpenImageModalForOption(idx)}
                        className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          optImg
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                        }`}
                        title={`Sisipkan Gambar pada Opsi ${letter}`}
                      >
                        <ImageIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">{optImg ? 'Gambar Ada' : 'Gambar'}</span>
                      </button>

                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx)}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Mini Option Image Preview if attached */}
                    {optImg && (
                      <div className="ml-8 flex items-center gap-2 p-1.5 bg-white border border-indigo-200 rounded-xl">
                        <img
                          src={optImg}
                          alt={`Gambar Opsi ${letter}`}
                          className="w-10 h-10 object-contain rounded-lg border border-slate-100"
                        />
                        <div className="flex-1 text-[11px] truncate text-slate-600">
                          <span className="font-bold text-indigo-900 mr-1">[Gambar Opsi ${letter}]</span>
                          <span className="text-slate-400">{optImg}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenImageModalForOption(idx)}
                          className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold px-2 py-0.5 rounded cursor-pointer"
                        >
                          Ganti
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const next = [...optionImages];
                            next[idx] = undefined;
                            setOptionImages(next);
                          }}
                          className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                          title="Hapus Gambar Opsi"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 3. True / False (Pilihan & Kunci Jawaban Langsung: Benar / Salah) */}
          {type === 'true_false' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pilihan & Kunci Jawaban (Benar / Salah):
              </label>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <p className="text-xs text-slate-500 font-medium">
                  Soal atau pernyataan ditulis pada kolom <strong>"Pertanyaan Soal"</strong> di atas (dan gunakan kolom "Instruksi Soal" untuk petunjuk pengerjaan jika diperlukan). Tentukan kunci jawaban yang benar di bawah ini:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Kolom Pilihan & Kunci: BENAR */}
                  <div
                    onClick={() => setIsTfCorrect(true)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      isTfCorrect
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                        isTfCorrect
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        ✓
                      </div>
                      <div>
                        <div className="font-bold text-sm">BENAR</div>
                        <div className="text-[11px] text-slate-500">Pernyataan bernilai Benar</div>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                      isTfCorrect
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}>
                      {isTfCorrect ? 'Kunci: Benar' : 'Pilih Kunci'}
                    </span>
                  </div>

                  {/* Kolom Pilihan & Kunci: SALAH */}
                  <div
                    onClick={() => setIsTfCorrect(false)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      !isTfCorrect
                        ? 'bg-rose-50 border-rose-500 text-rose-950 ring-2 ring-rose-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                        !isTfCorrect
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        ✕
                      </div>
                      <div>
                        <div className="font-bold text-sm">SALAH</div>
                        <div className="text-[11px] text-slate-500">Pernyataan bernilai Salah</div>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                      !isTfCorrect
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}>
                      {!isTfCorrect ? 'Kunci: Salah' : 'Pilih Kunci'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. Matching Data (Format 2 Kolom: Soal & Jawaban + Gambar + Penanda Warna) */}
          {type === 'matching' && (
            <div className="space-y-6">
              {/* Header & Petunjuk */}
              <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-2xl text-xs text-indigo-950 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="font-bold text-sm text-indigo-900 flex items-center gap-2">
                    <GitCommit className="w-4 h-4 text-indigo-600" />
                    <span>Susun Butir Soal Menjodohkan (Teks / Gambar + Pasangan Kunci)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddMatchingPair}
                      className="text-xs bg-indigo-600 text-white font-bold hover:bg-indigo-700 flex items-center gap-1.5 px-3 py-1.5 rounded-xl shadow-xs cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah Pasangan Soal
                    </button>
                    <button
                      type="button"
                      onClick={handleAddMatchingOption}
                      className="text-xs bg-white text-slate-700 font-bold hover:bg-slate-50 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah Pilihan Ekstra
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-indigo-700 leading-relaxed">
                  Setiap butir pertanyaan di sebelah kiri dapat berupa <strong>Teks dan/atau Gambar</strong> dan dipasangkan dengan pilihan jawaban di sebelah kanan (berupa <strong>Teks dan/atau Gambar</strong>). Pasangan yang benar ditandai dengan <strong>warna yang sama</strong>. Saat ujian siswa, pilihan jawaban di sebelah kanan akan diacak secara otomatis.
                </p>
              </div>

              {/* Daftar Butir Pertanyaan (Kolom Kiri) & Pilihan Kunci Jawaban (Kolom Kanan) */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 px-1 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <div className="md:col-span-6 flex items-center gap-2">
                    <span>Kolom Kiri: Pertanyaan / Pernyataan (1, 2, 3...)</span>
                  </div>
                  <div className="md:col-span-6 flex items-center gap-2">
                    <span>Kolom Kanan: Pilihan Jawaban & Kunci Pasangan</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {matchingPremises.map((premise, pIdx) => {
                    const pairColor = getMatchingColor(pIdx);
                    const matchedOptIdx = matchingOptions.findIndex(o => o.id === premise.correctOptionId);
                    const matchedOpt = matchedOptIdx >= 0 ? matchingOptions[matchedOptIdx] : null;

                    return (
                      <div
                        key={premise.id}
                        className={`p-3.5 bg-white rounded-2xl border-2 transition-all shadow-xs ${pairColor.border} ${pairColor.bgLight}`}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                          {/* SISI KIRI (PERTANYAAN / PREMISE) */}
                          <div className="md:col-span-6 space-y-2">
                            <div className="flex items-start gap-2">
                              <span className={`w-7 h-7 rounded-xl ${pairColor.badgeBg} ${pairColor.badgeText} text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs mt-1`}>
                                {pIdx + 1}
                              </span>
                              <div className="flex-1 space-y-1.5">
                                <input
                                  type="text"
                                  value={premise.text}
                                  onChange={(e) => {
                                    const next = [...matchingPremises];
                                    next[pIdx].text = e.target.value;
                                    setMatchingPremises(next);
                                  }}
                                  placeholder={`Tulis teks pertanyaan nomor ${pIdx + 1}...`}
                                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />

                                {/* Gambar Sisi Kiri (Opsional) */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenImageModalForPremise(pIdx)}
                                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border flex items-center gap-1.5 cursor-pointer transition-colors ${
                                      premise.imageUrl
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                  >
                                    <ImageIcon className="w-3.5 h-3.5" />
                                    {premise.imageUrl ? 'Ubah Gambar Kiri' : '+ Tambah Gambar'}
                                  </button>

                                  {premise.imageUrl && (
                                    <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-slate-200">
                                      <img
                                        src={premise.imageUrl}
                                        alt={`Gambar ${pIdx + 1}`}
                                        className="w-8 h-8 object-cover rounded-md border border-slate-200"
                                        referrerPolicy="no-referrer"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const next = [...matchingPremises];
                                          next[pIdx].imageUrl = undefined;
                                          setMatchingPremises(next);
                                        }}
                                        className="text-rose-500 hover:text-rose-700 p-0.5"
                                        title="Hapus gambar"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* SISI KANAN (KUNCI JAWABAN PASANGAN) */}
                          <div className="md:col-span-6 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-bold text-slate-600">
                                Pasangkan ke Kunci Jawaban:
                              </span>
                              {matchingPremises.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemovePremise(pIdx)}
                                  className="text-slate-400 hover:text-rose-600 p-1 rounded-lg cursor-pointer"
                                  title="Hapus butir pertanyaan ini"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <select
                                value={premise.correctOptionId}
                                onChange={(e) => {
                                  const next = [...matchingPremises];
                                  next[pIdx].correctOptionId = e.target.value;
                                  setMatchingPremises(next);
                                }}
                                className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl outline-none font-bold text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                              >
                                {matchingOptions.map((opt, oIdx) => (
                                  <option key={opt.id} value={opt.id}>
                                    Pilihan {opt.label}: {opt.text || (opt.imageUrl ? '[Gambar]' : `(Opsi ${opt.label})`)}
                                  </option>
                                ))}
                              </select>

                              {matchedOpt && (
                                <span className={`px-2.5 py-1.5 rounded-xl ${pairColor.badgeBg} ${pairColor.badgeText} text-xs font-bold shrink-0 shadow-2xs flex items-center gap-1`}>
                                  <span>{matchedOpt.label}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Kelola Daftar Lengkap Pilihan Jawaban (Kolom B) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Daftar Pilihan Jawaban (Kolom B / Label Huruf)
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Kelola teks dan gambar untuk setiap pilihan jawaban (minimal sejumlah pertanyaan, atau boleh lebih):
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMatchingOption}
                    className="text-xs text-indigo-600 font-bold hover:text-indigo-700 flex items-center gap-1 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs hover:bg-indigo-50"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Pilihan
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {matchingOptions.map((opt, oIdx) => {
                    const label = String.fromCharCode(65 + oIdx);
                    // Check if this option is assigned to any premise
                    const matchedPremiseIdx = matchingPremises.findIndex(p => p.correctOptionId === opt.id);
                    const pairColor = matchedPremiseIdx >= 0 ? getMatchingColor(matchedPremiseIdx) : null;

                    return (
                      <div
                        key={opt.id}
                        className={`p-3 bg-white rounded-xl border transition-all space-y-2 shadow-2xs ${
                          pairColor ? `${pairColor.border} border-2 ${pairColor.bgLight}` : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-6 h-6 rounded-lg ${
                              pairColor ? `${pairColor.badgeBg} ${pairColor.badgeText}` : 'bg-slate-200 text-slate-700'
                            } font-bold text-xs flex items-center justify-center shrink-0`}>
                              {label}
                            </span>
                            {pairColor && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                Kunci Soal #{matchedPremiseIdx + 1}
                              </span>
                            )}
                          </div>

                          {matchingOptions.length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMatchingOption(oIdx)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded-lg cursor-pointer"
                              title="Hapus opsi ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => {
                            const next = [...matchingOptions];
                            next[oIdx].text = e.target.value;
                            setMatchingOptions(next);
                          }}
                          placeholder={`Teks pilihan jawaban ${label}...`}
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium focus:bg-white focus:border-indigo-500"
                        />

                        {/* Gambar Pilihan Jawaban */}
                        <div className="flex items-center gap-2 flex-wrap pt-0.5">
                          <button
                            type="button"
                            onClick={() => handleOpenImageModalForMatchingOption(oIdx)}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border flex items-center gap-1.5 cursor-pointer transition-colors ${
                              opt.imageUrl
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            {opt.imageUrl ? 'Ubah Gambar' : '+ Tambah Gambar'}
                          </button>

                          {opt.imageUrl && (
                            <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-slate-200">
                              <img
                                src={opt.imageUrl}
                                alt={`Gambar ${label}`}
                                className="w-7 h-7 object-cover rounded-md border border-slate-200"
                                referrerPolicy="no-referrer"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const next = [...matchingOptions];
                                  next[oIdx].imageUrl = undefined;
                                  setMatchingOptions(next);
                                }}
                                className="text-rose-500 hover:text-rose-700 p-0.5"
                                title="Hapus gambar"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PRATINJAU LANGSUNG: KISI-KISI SOAL & KUNCI JAWABAN (SESUAI CONTOH GAMBAR) */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-4 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2 font-bold text-xs text-indigo-400 uppercase tracking-wider">
                    <Eye className="w-4 h-4" />
                    <span>Pratinjau Lembar Soal & Pasangan Warna Kunci Jawaban</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {matchingPremises.length} Soal &bull; {matchingOptions.length} Pilihan
                  </span>
                </div>

                {/* Tampilan Pasangan Berwarna Sesuai Kunci */}
                <div className="space-y-2.5">
                  <div className="text-[11px] font-bold text-slate-300">
                    Simulasi Kunci Pasangan (Warna yang Sama):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {matchingPremises.map((p, idx) => {
                      const color = getMatchingColor(idx);
                      const opt = matchingOptions.find(o => o.id === p.correctOptionId);
                      return (
                        <div
                          key={p.id}
                          className={`p-2.5 rounded-xl border ${color.border} ${color.bgLight} ${color.text} flex items-center justify-between gap-2 shadow-2xs`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`w-5 h-5 rounded-md ${color.badgeBg} ${color.badgeText} text-[11px] font-bold flex items-center justify-center shrink-0`}>
                              {idx + 1}
                            </span>
                            {p.imageUrl && (
                              <img src={p.imageUrl} alt="P" className="w-6 h-6 object-cover rounded border border-slate-300 shrink-0" referrerPolicy="no-referrer" />
                            )}
                            <span className="truncate font-semibold text-xs">{p.text || `(Pernyataan ${idx + 1})`}</span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-xs font-bold opacity-60">&harr;</span>
                            <span className={`w-5 h-5 rounded-md ${color.badgeBg} ${color.badgeText} text-[11px] font-bold flex items-center justify-center`}>
                              {opt?.label || '?'}
                            </span>
                            {opt?.imageUrl && (
                              <img src={opt.imageUrl} alt="O" className="w-6 h-6 object-cover rounded border border-slate-300 shrink-0" referrerPolicy="no-referrer" />
                            )}
                            <span className="truncate font-semibold text-xs max-w-[90px]">{opt?.text || ''}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 flex-wrap">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>

            <div className="flex items-center gap-2 flex-wrap">
              {!initialQuestion && (
                <>
                  <button
                    type="button"
                    onClick={() => saveAndProcess('add_more')}
                    className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    title="Simpan soal ini dan langsung tambah butir soal berikutnya pada paket yang sama"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Simpan & Tambah Soal Lagi</span>
                  </button>
                  {onOpenBankSoal && (
                    <button
                      type="button"
                      onClick={() => saveAndProcess('open_bank')}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                      title="Simpan soal dan langsung buka daftar butir soal paket ini di Bank Soal"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Simpan & Buka Bank Soal</span>
                    </button>
                  )}
                </>
              )}

              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{initialQuestion ? 'Simpan Perubahan Soal' : 'Simpan & Selesai'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>

      {/* Image Search & Insertion Modal */}
      <ImageSearchModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        onSelectImage={handleSaveSelectedImage}
        initialUrl={imageModalTarget.currentUrl}
        targetTitle={imageModalTarget.title}
      />

      {/* Arabic Virtual Keyboard */}
      <ArabicVirtualKeyboard
        isOpen={showArabicKeyboard}
        onClose={() => setShowArabicKeyboard(false)}
        onInsertChar={handleInsertArabicChar}
        onBackspace={handleArabicBackspace}
        onClear={handleArabicClear}
        targetFieldName={activeFieldName}
        isRtlMode={isRtlMode}
        onToggleRtl={() => setIsRtlMode(!isRtlMode)}
      />

    </div>
  );
};
