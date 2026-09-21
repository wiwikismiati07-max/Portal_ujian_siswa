import React, { useState, useRef } from 'react';
import { Question, QuestionType, Exam, TrueFalseStatement, MatchingPremise, MatchingOption } from '../../types';
import { getMatchingData } from '../../utils/matchingHelper';
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
  ExternalLink
} from 'lucide-react';
import { ImageSearchModal } from './ImageSearchModal';
import { ArabicVirtualKeyboard } from './ArabicVirtualKeyboard';

interface QuestionCreatorModalProps {
  exam: Exam;
  isOpen: boolean;
  onClose: () => void;
  onSaveQuestion: (question: Question) => void;
  initialQuestion?: Question | null;
}

export const QuestionCreatorModal: React.FC<QuestionCreatorModalProps> = ({
  exam,
  isOpen,
  onClose,
  onSaveQuestion,
  initialQuestion
}) => {
  const [type, setType] = useState<QuestionType>(initialQuestion?.type || 'single_choice');
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
  const [trueFalseItems, setTrueFalseItems] = useState<TrueFalseStatement[]>(
    initialQuestion?.trueFalseItems || [
      { id: 'tf_1', statement: 'Pernyataan butir pertama', isCorrect: true },
      { id: 'tf_2', statement: 'Pernyataan butir kedua', isCorrect: false }
    ]
  );

  // For Matching (Kolom A & Kolom B + Pengecoh)
  const initialMatching = initialQuestion ? getMatchingData(initialQuestion) : {
    premises: [
      { id: 'prem_1', text: 'Pertanyaan / Pernyataan 1', correctOptionId: 'opt_1' },
      { id: 'prem_2', text: 'Pertanyaan / Pernyataan 2', correctOptionId: 'opt_2' },
      { id: 'prem_3', text: 'Pertanyaan / Pernyataan 3', correctOptionId: 'opt_3' }
    ],
    options: [
      { id: 'opt_1', label: 'A', text: 'Pilihan 1' },
      { id: 'opt_2', label: 'B', text: 'Pilihan 2' },
      { id: 'opt_3', label: 'C', text: 'Pilihan 3' },
      { id: 'opt_4', label: 'D', text: 'Pilihan Pengecoh 1' },
      { id: 'opt_5', label: 'E', text: 'Pilihan Pengecoh 2' }
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
    type: 'prompt' | 'option';
    optionIndex?: number;
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

  const handleSaveSelectedImage = (selectedImgUrl: string) => {
    if (imageModalTarget.type === 'prompt') {
      setImageUrl(selectedImgUrl);
    } else if (imageModalTarget.type === 'option' && imageModalTarget.optionIndex !== undefined) {
      const next = [...optionImages];
      next[imageModalTarget.optionIndex] = selectedImgUrl || undefined;
      setOptionImages(next);
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

  const handleAddTfItem = () => {
    setTrueFalseItems([
      ...trueFalseItems,
      { id: `tf_${Date.now()}`, statement: 'Pernyataan baru...', isCorrect: true }
    ]);
  };

  const handleRemoveTfItem = (index: number) => {
    if (trueFalseItems.length > 1) {
      setTrueFalseItems(trueFalseItems.filter((_, i) => i !== index));
    }
  };

  const handleAddPremise = () => {
    setMatchingPremises([
      ...matchingPremises,
      { id: `prem_${Date.now()}`, text: '', correctOptionId: matchingOptions[0]?.id || '' }
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
      { id: `opt_${Date.now()}`, label: String.fromCharCode(65 + nextIdx), text: '' }
    ]);
  };

  const handleRemoveMatchingOption = (index: number) => {
    if (matchingOptions.length > 2) {
      setMatchingOptions(matchingOptions.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const newQ: Question = {
      id: initialQuestion?.id || `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      examId: exam.id,
      type,
      prompt: prompt.trim(),
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
      newQ.trueFalseItems = trueFalseItems;
    } else if (type === 'matching') {
      newQ.matchingData = {
        premises: matchingPremises.map(p => ({ ...p, text: p.text.trim() })),
        options: matchingOptions.map((o, idx) => ({
          ...o,
          label: String.fromCharCode(65 + idx),
          text: o.text.trim()
        }))
      };
    } else if (type === 'case_study') {
      newQ.caseContext = caseContext.trim();
      newQ.caseKeywords = caseKeywordsStr
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      newQ.rubricNotes = rubricNotes.trim();
    }

    onSaveQuestion(newQ);
    onClose();
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
              Paket Ujian: {exam.title} ({exam.subjectName})
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
                onClick={() => setType('matching')}
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

          {/* Prompt + Image Inserter + Arabic Keyboard Toolbar */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-xs font-semibold text-slate-700">
                Pertanyaan / Instruksi Soal <span className="text-rose-500">*</span>
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
              placeholder="Ketikkan teks pertanyaan soal..."
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

          {/* 1. Single Choice Options */}
          {type === 'single_choice' && (
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

          {/* 3. True / False statements */}
          {type === 'true_false' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Daftar Pernyataan & Kunci Nilai:
                </label>
                <button
                  type="button"
                  onClick={handleAddTfItem}
                  className="text-xs text-indigo-600 font-bold hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Pernyataan
                </button>
              </div>

              {trueFalseItems.map((item, idx) => (
                <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
                  <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                  <input
                    type="text"
                    value={item.statement}
                    onChange={(e) => {
                      const next = [...trueFalseItems];
                      next[idx].statement = e.target.value;
                      setTrueFalseItems(next);
                    }}
                    placeholder="Ketik pernyataan..."
                    required
                    className="flex-1 px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg outline-none"
                  />
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const next = [...trueFalseItems];
                        next[idx].isCorrect = true;
                        setTrueFalseItems(next);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                        item.isCorrect
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      Kunci: Benar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const next = [...trueFalseItems];
                        next[idx].isCorrect = false;
                        setTrueFalseItems(next);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                        !item.isCorrect
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      Kunci: Salah
                    </button>
                    {trueFalseItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTfItem(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 4. Matching Data (Kolom A & Kolom B + Pengecoh) */}
          {type === 'matching' && (
            <div className="space-y-6">
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900">
                <strong>Model Menjodohkan Tarik Garis:</strong> Buat Kolom A (Pertanyaan/Pernyataan) beserta kunci jawaban yang mengarah ke opsi di Kolom B. Buat Kolom B berisi pilihan jawaban dan minimal 2 jawaban pengecoh agar siswa tidak bisa asal menebak di nomor terakhir.
              </div>

              {/* Kolom A: Pertanyaan */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Kolom A: Daftar Pertanyaan & Kunci Jawaban
                  </label>
                  <button
                    type="button"
                    onClick={handleAddPremise}
                    className="text-xs text-indigo-600 font-bold hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Pertanyaan (Kolom A)
                  </button>
                </div>

                {matchingPremises.map((premise, idx) => (
                  <div key={premise.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-7">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={premise.text}
                          onChange={(e) => {
                            const next = [...matchingPremises];
                            next[idx].text = e.target.value;
                            setMatchingPremises(next);
                          }}
                          placeholder={`Pertanyaan / Pernyataan ${idx + 1}...`}
                          required
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none font-medium"
                        />
                      </div>
                    </div>
                    
                    <div className="sm:col-span-4">
                      <select
                        value={premise.correctOptionId}
                        onChange={(e) => {
                          const next = [...matchingPremises];
                          next[idx].correctOptionId = e.target.value;
                          setMatchingPremises(next);
                        }}
                        required
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none font-semibold text-indigo-900"
                      >
                        <option value="">-- Pilih Kunci (Kolom B) --</option>
                        {matchingOptions.map(opt => (
                          <option key={opt.id} value={opt.id}>
                            Opsi {opt.label}: {opt.text.substring(0, 25) || `Pilihan ${opt.label}`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-1 flex justify-end">
                      {matchingPremises.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePremise(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Kolom B: Pilihan Jawaban & Pengecoh */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Kolom B: Pilihan Jawaban & Pengecoh (Lebih banyak dari Kolom A)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddMatchingOption}
                    className="text-xs text-indigo-600 font-bold hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Pilihan / Pengecoh
                  </button>
                </div>

                {matchingOptions.map((opt, idx) => {
                  const label = String.fromCharCode(65 + idx);
                  return (
                    <div key={opt.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center justify-center shrink-0">
                        {label}
                      </span>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => {
                          const next = [...matchingOptions];
                          next[idx].text = e.target.value;
                          setMatchingOptions(next);
                        }}
                        placeholder={`Teks pilihan ${label} (bisa sebagai kunci atau pengecoh)...`}
                        required
                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none font-medium"
                      />
                      {matchingOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMatchingOption(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. Case Study Criteria */}
          {type === 'case_study' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kata Kunci Penting untuk Penilaian Otomatis (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={caseKeywordsStr}
                  onChange={(e) => setCaseKeywordsStr(e.target.value)}
                  placeholder="Contoh: ransomware, backup, isolasi, phishing, firewall"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Sistem otomatis memberikan poin berdasarkan kesesuaian kata kunci dan kedalaman uraian siswa.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rubrik / Catatan Kunci Jawaban Guru
                </label>
                <textarea
                  rows={2}
                  value={rubricNotes}
                  onChange={(e) => setRubricNotes(e.target.value)}
                  placeholder="Panduan aspek penilaian..."
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none"
                />
              </div>
            </div>
          )}

          {/* Explanation / Pembahasan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Penjelasan / Pembahasan Soal (Opsional)
            </label>
            <textarea
              rows={2}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Tuliskan pembahasan atau alasan mengapa kunci jawaban tersebut benar..."
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Simpan Butir Soal
            </button>
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
