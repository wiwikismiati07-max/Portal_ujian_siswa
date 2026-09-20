import React, { useState, useEffect, useMemo } from 'react';
import {
  QURAN_SURAHS,
  QURAN_JUZ_LIST,
  getSurahByNumber,
  fetchSurahVerses,
  AyahItem,
  QuranSurah
} from '../../data/quranMetadata';
import {
  Search,
  BookOpen,
  Layers,
  Sparkles,
  Loader2,
  Check,
  PlusCircle,
  Hash,
  FileText,
  ChevronRight,
  Filter,
  X
} from 'lucide-react';

interface QuranVerseSelectorProps {
  onInsertText: (text: string) => void;
  onClose?: () => void;
}

// Helper to convert number to Arabic numeral: 1 -> ١, 255 -> ٢٥٥
const toArabicNumber = (num: number): string => {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num
    .toString()
    .split('')
    .map(d => arabicDigits[parseInt(d, 10)] || d)
    .join('');
};

export const QuranVerseSelector: React.FC<QuranVerseSelectorProps> = ({ onInsertText, onClose }) => {
  // Navigation & Selection state
  const [selectedJuz, setSelectedJuz] = useState<number | 'all'>('all');
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [fontSize, setFontSize] = useState<'md' | 'lg' | 'xl'>('lg');
  
  // Verses loading state
  const [verses, setVerses] = useState<AyahItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastInsertedIndex, setLastInsertedIndex] = useState<number | null>(null);

  // Quick Surahs for rapid navigation
  const quickSurahs = [
    { num: 1, label: 'Al-Fatihah' },
    { num: 2, label: 'Al-Baqarah' },
    { num: 18, label: 'Al-Kahfi' },
    { num: 36, label: 'Yasin' },
    { num: 55, label: 'Ar-Rahman' },
    { num: 56, label: 'Al-Waqi\'ah' },
    { num: 67, label: 'Al-Mulk' },
    { num: 112, label: 'Al-Ikhlas' },
    { num: 114, label: 'An-Nas' }
  ];

  // Filter surahs based on selected Juz and Search Query
  const filteredSurahs = useMemo(() => {
    return QURAN_SURAHS.filter(s => {
      // Filter by Juz if specific juz selected
      if (selectedJuz !== 'all') {
        const juzDef = QURAN_JUZ_LIST.find(j => j.juz === selectedJuz);
        if (juzDef && !juzDef.surahs.includes(s.number)) {
          return false;
        }
      }
      // Filter by Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchNumber = s.number.toString() === q;
        const matchName = s.nameLatin.toLowerCase().includes(q) || s.englishName.toLowerCase().includes(q);
        const matchArabic = s.nameArabic.includes(q);
        return matchNumber || matchName || matchArabic;
      }
      return true;
    });
  }, [selectedJuz, searchQuery]);

  // Load verses whenever selectedSurahNumber changes
  useEffect(() => {
    let isMounted = true;
    const loadVerses = async () => {
      setIsLoading(true);
      try {
        const data = await fetchSurahVerses(selectedSurahNumber);
        if (isMounted) {
          setVerses(data);
        }
      } catch (err) {
        console.error('Failed to load verses:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadVerses();
    return () => {
      isMounted = false;
    };
  }, [selectedSurahNumber]);

  const currentSurah = useMemo(() => {
    return getSurahByNumber(selectedSurahNumber) || QURAN_SURAHS[0];
  }, [selectedSurahNumber]);

  // Handle single verse insertion
  const handleInsertVerse = (
    ayah: AyahItem,
    mode: 'plain' | 'with_number' | 'with_citation',
    index: number
  ) => {
    let output = '';
    const cleanText = ayah.text.trim();

    if (mode === 'plain') {
      output = `${cleanText} `;
    } else if (mode === 'with_number') {
      output = `${cleanText} ﴿${toArabicNumber(ayah.numberInSurah)}﴾ `;
    } else if (mode === 'with_citation') {
      output = `${cleanText} ﴿${toArabicNumber(ayah.numberInSurah)}﴾ (QS. ${currentSurah.nameLatin}: ${ayah.numberInSurah}) `;
    }

    onInsertText(output);
    setLastInsertedIndex(index);
    setTimeout(() => setLastInsertedIndex(null), 1200);
  };

  // Handle entire surah insertion
  const handleInsertEntireSurah = () => {
    if (verses.length === 0) return;
    const fullText = verses
      .map(v => `${v.text.trim()} ﴿${toArabicNumber(v.numberInSurah)}﴾`)
      .join(' ');
    
    onInsertText(`${fullText} (QS. ${currentSurah.nameLatin}: 1-${currentSurah.totalAyahs}) `);
  };

  // Handle Basmalah insertion
  const handleInsertBasmalah = () => {
    onInsertText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ');
  };

  // Font size class mapping
  const arabicFontClass = {
    md: 'text-base sm:text-lg leading-loose',
    lg: 'text-lg sm:text-xl leading-loose',
    xl: 'text-xl sm:text-2xl leading-loose'
  }[fontSize];

  return (
    <div className="space-y-3">
      {/* Top Filter Bar: Juz, Surah Selector & Search */}
      <div className="bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200/80 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Juz Selector (Juz 1 to 30) */}
          <div className="flex items-center gap-1.5 min-w-[140px]">
            <Layers className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <select
              value={selectedJuz}
              onChange={(e) => {
                const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                setSelectedJuz(val);
                // If current surah not in that juz, pick the first surah in that juz
                if (val !== 'all') {
                  const jDef = QURAN_JUZ_LIST.find(j => j.juz === val);
                  if (jDef && jDef.surahs.length > 0 && !jDef.surahs.includes(selectedSurahNumber)) {
                    setSelectedSurahNumber(jDef.surahs[0]);
                  }
                }
              }}
              className="w-full text-xs font-bold bg-white border border-emerald-300 rounded-lg px-2 py-1.5 text-emerald-950 focus:ring-2 focus:ring-emerald-500/20 outline-none cursor-pointer"
            >
              <option value="all">Semua Juz (1-30)</option>
              {QURAN_JUZ_LIST.map(j => (
                <option key={j.juz} value={j.juz}>
                  {j.name} ({j.start.split(' ')[0]} - {j.end.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>

          {/* Surah Selector (1-114) */}
          <div className="flex-1 min-w-[180px]">
            <select
              value={selectedSurahNumber}
              onChange={(e) => setSelectedSurahNumber(Number(e.target.value))}
              className="w-full text-xs font-bold bg-white border border-emerald-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:ring-2 focus:ring-emerald-500/20 outline-none cursor-pointer"
            >
              {filteredSurahs.map(s => (
                <option key={s.number} value={s.number}>
                  {s.number}. {s.nameLatin} ({s.nameArabic}) — {s.totalAyahs} Ayat
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-44">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Surah / Juz..."
              className="w-full pl-8 pr-2 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 placeholder:text-slate-400"
            />
          </div>

        </div>

        {/* Quick Surah Shortcuts & Font Sizing */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-emerald-200/60 flex-wrap">
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider shrink-0 mr-1">
              Cepat:
            </span>
            {quickSurahs.map(q => (
              <button
                key={q.num}
                type="button"
                onClick={() => {
                  setSelectedSurahNumber(q.num);
                  setSelectedJuz('all');
                  setSearchQuery('');
                }}
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                  selectedSurahNumber === q.num
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'bg-white text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Font size control */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[10px] text-slate-500 font-semibold">Font Arab:</span>
            {(['md', 'lg', 'xl'] as const).map(sz => (
              <button
                key={sz}
                type="button"
                onClick={() => setFontSize(sz)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                  fontSize === sz
                    ? 'bg-emerald-800 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {sz.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Surah Header Card & Bulk Actions */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {currentSurah.number}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm text-slate-900">
                Surah {currentSurah.nameLatin}
              </h4>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                {currentSurah.revelation}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                • {currentSurah.totalAyahs} Ayat
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Juz {currentSurah.juzList.join(', ')}
            </p>
          </div>
        </div>

        {/* Right Arabic Title & Quick Inserts */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="font-arabic text-xl font-bold text-emerald-900 hidden sm:inline" dir="rtl">
            {currentSurah.nameArabic}
          </span>
          <button
            type="button"
            onClick={handleInsertBasmalah}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
            title="Sisipkan Basmalah"
          >
            + Basmalah
          </button>
          <button
            type="button"
            onClick={handleInsertEntireSurah}
            disabled={isLoading || verses.length === 0}
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            title="Sisipkan Seluruh Ayat dalam Surah ini"
          >
            <PlusCircle className="w-3 h-3" />
            <span>Semua Ayat</span>
          </button>
        </div>
      </div>

      {/* Verses List Area */}
      <div className="max-h-[210px] sm:max-h-[250px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
        {isLoading ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
            <p className="text-xs font-semibold">Memuat ayat Al-Qur'an 30 Juz...</p>
          </div>
        ) : verses.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Tidak dapat memuat ayat. Silakan periksa koneksi internet atau pilih surah lain.
          </div>
        ) : (
          verses.map((ayah, idx) => {
            const isInserted = lastInsertedIndex === idx;
            return (
              <div
                key={ayah.numberInSurah}
                className={`p-3 rounded-xl border transition-all duration-150 ${
                  isInserted
                    ? 'bg-emerald-50 border-emerald-400 shadow-xs'
                    : 'bg-white hover:bg-slate-50/80 border-slate-200'
                }`}
              >
                {/* Verse Text (Arabic RTL) */}
                <div
                  dir="rtl"
                  className={`font-arabic font-bold text-slate-900 text-right ${arabicFontClass} selection:bg-emerald-200`}
                >
                  {ayah.text}{' '}
                  <span className="text-emerald-700 font-sans font-bold text-sm select-none">
                    ﴿{toArabicNumber(ayah.numberInSurah)}﴾
                  </span>
                </div>

                {/* Verse Actions Toolbar */}
                <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 flex-wrap gap-1.5" dir="ltr">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold">
                      Ayat {ayah.numberInSurah}
                    </span>
                    {ayah.numberInSurah === 255 && currentSurah.number === 2 && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-extrabold">
                        ⭐ Ayat Kursi
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleInsertVerse(ayah, 'plain', idx)}
                      className="px-2 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-700 rounded-md text-[11px] font-semibold transition-colors cursor-pointer"
                      title="Sisipkan teks Arab saja"
                    >
                      {isInserted ? <Check className="w-3 h-3 inline text-emerald-600 mr-1" /> : null}
                      Teks Saja
                    </button>

                    <button
                      type="button"
                      onClick={() => handleInsertVerse(ayah, 'with_number', idx)}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-md text-[11px] font-bold transition-colors cursor-pointer"
                      title={`Sisipkan teks dengan nomor ayat ﴿${toArabicNumber(ayah.numberInSurah)}﴾`}
                    >
                      + No. Ayat ﴿{toArabicNumber(ayah.numberInSurah)}﴾
                    </button>

                    <button
                      type="button"
                      onClick={() => handleInsertVerse(ayah, 'with_citation', idx)}
                      className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-[11px] font-bold transition-colors cursor-pointer shadow-2xs"
                      title={`Sisipkan teks lengkap dengan rujukan (QS. ${currentSurah.nameLatin}: ${ayah.numberInSurah})`}
                    >
                      + Rujukan QS
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer bar with Close & Status */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-xs">
        <span className="text-[11px] text-slate-500 font-medium">
          Menampilkan {verses.length} ayat dari QS. {currentSurah.nameLatin}
        </span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Tutup Keyboard</span>
          </button>
        )}
      </div>
    </div>
  );
};
