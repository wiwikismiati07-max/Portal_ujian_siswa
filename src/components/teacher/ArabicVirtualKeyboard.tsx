import React, { useState } from 'react';
import {
  Keyboard,
  X,
  Delete,
  CornerDownLeft,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlignRight,
  Minimize2,
  Maximize2,
  BookOpen
} from 'lucide-react';
import { QuranVerseSelector } from './QuranVerseSelector';

interface ArabicVirtualKeyboardProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertChar: (char: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  targetFieldName?: string;
  isRtlMode?: boolean;
  onToggleRtl?: () => void;
}

export const ArabicVirtualKeyboard: React.FC<ArabicVirtualKeyboardProps> = ({
  isOpen,
  onClose,
  onInsertChar,
  onBackspace,
  onClear,
  targetFieldName = 'Kolom Aktif',
  isRtlMode = true,
  onToggleRtl
}) => {
  const [activeCategory, setActiveCategory] = useState<'letters' | 'harakat' | 'phrases' | 'quran'>('letters');
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  if (!isOpen) return null;

  // Harakat (Tasykil & Diacritics)
  const harakatList = [
    { label: 'فَتْحَة (Fathah)', char: '\u064E' },
    { label: 'تَنْوِين فَتْح (Tanwin Fathah)', char: '\u064B' },
    { label: 'ضَمَّة (Dammah)', char: '\u064F' },
    { label: 'تَنْوِين ضَمّ (Tanwin Dammah)', char: '\u064C' },
    { label: 'كَسْرَة (Kasrah)', char: '\u0650' },
    { label: 'تَنْوِين كَسْر (Tanwin Kasrah)', char: '\u064D' },
    { label: 'سُكُون (Sukun)', char: '\u0652' },
    { label: 'شَدَّة (Shaddah)', char: '\u0651' },
    { label: 'مَدَّة (Maddah)', char: '\u0653' },
    { label: 'أَلِف خَنْجَرِيَّة (Dagger Alif)', char: '\u0670' },
    { label: 'هَمْزَة وَصْل (Alif Waslah)', char: 'ٱ' },
    { label: 'تَطْوِيل (Tatweel)', char: 'ـ' }
  ];

  // Arabic Numerals and Punctuation
  const numeralsAndPunctuation = [
    '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '٠',
    '؟', '،', '؛', '«', '»', '—', '(', ')'
  ];

  // Alphabet Rows
  const row1 = ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د', 'ذ'];
  const row2 = ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط', 'ظ'];
  const row3 = ['ئ', 'ء', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ز', 'إ', 'أ', 'آ'];

  // Common Islamic & Educational Arabic Phrases
  const commonPhrases = [
    { title: 'Basmalah', text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
    { title: 'Salam Lengkap', text: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ' },
    { title: 'Hamdalah', text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ' },
    { title: 'Tasbih', text: 'سُبْحَانَ اللَّهِ' },
    { title: 'Takbir', text: 'اللَّهُ أَكْبَرُ' },
    { title: 'Tahlil', text: 'لَا إِلَٰهَ إِلَّا اللَّهُ' },
    { title: 'Shalawat', text: 'صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ' },
    { title: 'Taradhdhi', text: 'رَضِيَ اللَّهُ عَنْهُ' },
    { title: 'Insya Allah', text: 'إِنْ شَاءَ اللَّهُ' },
    { title: 'Masya Allah', text: 'مَا شَاءَ اللَّهُ تَبَارَكَ اللَّهُ' },
    { title: 'Istighfar', text: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ' },
    { title: 'Hauqalah', text: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ' }
  ];

  return (
    <div className={`fixed bottom-3 right-3 left-3 sm:left-auto sm:right-6 ${activeCategory === 'quran' ? 'sm:w-[740px] md:w-[820px] max-w-[96vw]' : 'sm:w-[680px]'} z-50 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-300 overflow-hidden animate-in slide-in-from-bottom-5 duration-200`}>
      
      {/* Keyboard Header / Toolbar */}
      <div className="px-4 py-2.5 bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/30 flex items-center justify-center text-emerald-300">
            <Keyboard className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-xs sm:text-sm font-arabic tracking-wide">
              لوحة المفاتيح العربية (Keyboard Arab)
            </span>
            <span className="text-[11px] text-emerald-200 block sm:inline sm:ml-2">
              • Mengetik pada: <strong className="text-white">{targetFieldName}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onToggleRtl && (
            <button
              type="button"
              onClick={onToggleRtl}
              title="Ubah Arah Teks Kanan-ke-Kiri (RTL)"
              className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                isRtlMode ? 'bg-emerald-500 text-white' : 'bg-white/15 text-slate-300 hover:bg-white/25'
              }`}
            >
              <AlignRight className="w-3.5 h-3.5" />
              <span>RTL</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 text-slate-300 hover:text-white rounded-md hover:bg-white/10 transition-colors cursor-pointer"
            title={isMinimized ? 'Perbesar Keyboard' : 'Kecilkan Keyboard'}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-300 hover:text-white rounded-md hover:bg-white/10 transition-colors cursor-pointer"
            title="Tutup Keyboard"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="p-3 bg-slate-50 space-y-2.5">
          
          {/* Category Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setActiveCategory('letters')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === 'letters'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Huruf & Angka
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('harakat')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === 'harakat'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Harakat / Tasykil (ـَ ـِ ـُ ـْ)
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('phrases')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === 'phrases'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Sparkles className="w-3 h-3 inline mr-1" />
                Frasa Kalimat Siap Pakai
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('quran')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeCategory === 'quran'
                    ? 'bg-emerald-700 text-white shadow-xs ring-2 ring-emerald-500/30'
                    : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-300'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                <span>Al-Qur'an 30 Juz</span>
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onBackspace}
                className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-700 border border-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                title="Hapus Satu Karakter Terakhir (Backspace)"
              >
                <Delete className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>
              <button
                type="button"
                onClick={onClear}
                className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                title="Kosongkan Teks Kolom"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Quick Harakat Floating Bar (Available on letter/harakat/phrase tabs) */}
          {activeCategory !== 'quran' && (
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide shrink-0 mr-1">
                Harakat Cepat:
              </span>
              {harakatList.slice(0, 8).map((h, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onInsertChar(h.char)}
                  title={h.label}
                  className="h-7 min-w-[28px] px-1.5 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-md text-emerald-800 font-arabic text-base font-bold flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                >
                  {`ـ${h.char}`}
                </button>
              ))}
            </div>
          )}

          {/* TAB 1: HURUF & ANGKA */}
          {activeCategory === 'letters' && (
            <div className="space-y-1.5" dir="rtl">
              {/* Numbers Row */}
              <div className="flex flex-wrap gap-1 justify-center">
                {numeralsAndPunctuation.map((n, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onInsertChar(n)}
                    className="h-8 min-w-[28px] px-2 bg-white hover:bg-indigo-50 hover:border-indigo-300 border border-slate-200 rounded-lg text-slate-800 font-arabic text-sm font-bold flex items-center justify-center transition-all shadow-2xs active:scale-95 cursor-pointer"
                  >
                    {n}
                  </button>
                ))}
              </div>

              {/* Row 1 */}
              <div className="flex flex-wrap gap-1 justify-center">
                {row1.map((char, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onInsertChar(char)}
                    className="h-9 min-w-[34px] px-2 bg-white hover:bg-emerald-50 hover:border-emerald-400 border border-slate-200 rounded-lg text-slate-900 font-arabic text-lg font-bold flex items-center justify-center transition-all shadow-2xs active:scale-95 cursor-pointer"
                  >
                    {char}
                  </button>
                ))}
              </div>

              {/* Row 2 */}
              <div className="flex flex-wrap gap-1 justify-center">
                {row2.map((char, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onInsertChar(char)}
                    className="h-9 min-w-[36px] px-2 bg-white hover:bg-emerald-50 hover:border-emerald-400 border border-slate-200 rounded-lg text-slate-900 font-arabic text-lg font-bold flex items-center justify-center transition-all shadow-2xs active:scale-95 cursor-pointer"
                  >
                    {char}
                  </button>
                ))}
              </div>

              {/* Row 3 */}
              <div className="flex flex-wrap gap-1 justify-center">
                {row3.map((char, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onInsertChar(char)}
                    className="h-9 min-w-[36px] px-2 bg-white hover:bg-emerald-50 hover:border-emerald-400 border border-slate-200 rounded-lg text-slate-900 font-arabic text-lg font-bold flex items-center justify-center transition-all shadow-2xs active:scale-95 cursor-pointer"
                  >
                    {char}
                  </button>
                ))}
              </div>

              {/* Bottom Row: Space & Enter */}
              <div className="flex items-center justify-center gap-2 pt-1" dir="ltr">
                <button
                  type="button"
                  onClick={() => onInsertChar(' ')}
                  className="flex-1 max-w-[280px] h-8 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 shadow-2xs transition-colors cursor-pointer"
                >
                  مسافة (Spasi)
                </button>
                <button
                  type="button"
                  onClick={() => onInsertChar('\n')}
                  className="px-4 h-8 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <CornerDownLeft className="w-3.5 h-3.5" />
                  <span>Enter</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: HARAKAT LENGKAP */}
          {activeCategory === 'harakat' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {harakatList.map((h, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onInsertChar(h.char)}
                  className="p-2.5 bg-white hover:bg-emerald-50 hover:border-emerald-400 border border-slate-200 rounded-xl text-left flex items-center justify-between transition-all shadow-2xs active:scale-98 cursor-pointer"
                >
                  <span className="text-xs font-semibold text-slate-700">{h.label}</span>
                  <span className="text-2xl font-bold font-arabic text-emerald-700">
                    {`ـ${h.char}`}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* TAB 3: COMMON PHRASES */}
          {activeCategory === 'phrases' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {commonPhrases.map((phrase, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onInsertChar(phrase.text + ' ')}
                  className="p-2.5 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-xl text-right transition-all shadow-2xs active:scale-98 cursor-pointer"
                >
                  <span className="text-[10px] font-bold text-slate-400 block text-left">
                    {phrase.title}
                  </span>
                  <span className="text-base font-arabic font-bold text-slate-900 leading-relaxed block mt-0.5" dir="rtl">
                    {phrase.text}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* TAB 4: AL-QUR'AN 30 JUZ */}
          {activeCategory === 'quran' && (
            <QuranVerseSelector onInsertText={onInsertChar} />
          )}

        </div>
      )}

    </div>
  );
};
