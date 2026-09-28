import React, { useState } from 'react';
import {
  BookOpen,
  X,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  UserCheck,
  ShieldCheck,
  Lock,
  Layers,
  Sparkles,
  CheckCircle2,
  FileText,
  Copy,
  Printer,
  RotateCcw,
  Plus,
  HelpCircle,
  PhoneCall,
  Search,
  ExternalLink,
  Info,
  Maximize2
} from 'lucide-react';

interface ManualBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHotline?: () => void;
}

interface Chapter {
  id: string;
  category: 'semua' | 'siswa' | 'guru' | 'admin';
  stepBadge?: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  steps: {
    number: string;
    title: string;
    description: string;
  }[];
  tips?: string[];
}

export const ManualBookModal: React.FC<ManualBookModalProps> = ({
  isOpen,
  onClose,
  onOpenHotline
}) => {
  const [viewMode, setViewMode] = useState<'flipbook' | 'panduan_teks'>('flipbook');
  const [selectedCategory, setSelectedCategory] = useState<'semua' | 'siswa' | 'guru' | 'admin'>('semua');
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const flipHtmlUrl = 'https://online.fliphtml5.com/vmbokc/1-AHl3/';

  const chapters: Chapter[] = [
    {
      id: 'pengenalan',
      category: 'semua',
      stepBadge: 'PENGANTAR',
      title: 'Tutorial Portal Ujian Siswa SPANJU',
      subtitle: 'Platform asesmen berbasis komputer terintegrasi dengan teknologi lockdown anti-curang dan standar Kurikulum Merdeka / AKM.',
      icon: Sparkles,
      iconBg: 'bg-indigo-600 text-white',
      steps: [
        {
          number: '1',
          title: 'Penggunaan Mudah & Responsif',
          description: 'Aplikasi dapat diakses melalui laptop, tablet, maupun smartphone dengan antarmuka yang bersih dan mudah digunakan.'
        },
        {
          number: '2',
          title: '5 Variasi Soal Asesmen Terintegrasi',
          description: 'Mendukung Pilihan Ganda Tunggal, Pilihan Ganda Kompleks, Benar/Salah, Menjodohkan (Matching), dan Studi Kasus/Uraian.'
        },
        {
          number: '3',
          title: 'Teknologi Lockdown Mode Interaktif',
          description: 'Mengunci layar ujian ke mode fullscreen dan otomatis mencatat setiap percobaan beralih tab atau memperkecil browser.'
        },
        {
          number: '4',
          title: 'Rekap Nilai & Sinkronisasi Cloud Real-Time',
          description: 'Nilai ujian otomatis dihitung seketika dan tersinkronisasi langsung ke database Supabase Cloud sekolah.'
        }
      ],
      tips: [
        'Pastikan koneksi internet stabil sebelum siswa menekan tombol "Mulai Kerjakan Ujian".',
        'Gunakan browser Google Chrome atau Safari versi terbaru untuk pengalaman optimal.'
      ]
    },
    {
      id: 'login-3-peran',
      category: 'semua',
      stepBadge: 'OTENTIKASI',
      title: '3 Fitur Login Berdasarkan Peran',
      subtitle: 'Satu pintu gerbang login terpadu dengan hak akses sesuai peran di lingkungan SMPN 7 Pasuruan.',
      icon: ShieldCheck,
      iconBg: 'bg-blue-600 text-white',
      steps: [
        {
          number: '1',
          title: 'Login Siswa (Peserta Ujian)',
          description: 'Siswa masuk menggunakan Username, NIS, atau Nama Lengkap serta password untuk mengakses jadwal ujian dan mengerjakan paket soal.'
        },
        {
          number: '2',
          title: 'Login Guru (Pengampu Mata Pelajaran)',
          description: 'Guru pengampu masuk untuk mengelola bank soal, membuat paket ujian, melihat kisi-kisi, dan memantau rekapitulasi nilai kelas.'
        },
        {
          number: '3',
          title: 'Login Operator / Administrator',
          description: 'Administrator bertugas mengelola master akun siswa & guru, backup data, serta konfigurasi server database CBT.'
        }
      ],
      tips: [
        'Lupa password? Hubungi operator atau klik tombol Hotline SMPN 7 di bawah formulir login.'
      ]
    },
    {
      id: 'fitur-siswa',
      category: 'siswa',
      stepBadge: 'PANDUAN SISWA',
      title: 'Siswa: Siap Mengerjakan Soal Ujian',
      subtitle: 'Alur pengerjaan ujian berbasis CBT bagi siswa dari persiapan login hingga submit jawaban.',
      icon: GraduationCap,
      iconBg: 'bg-indigo-600 text-white',
      steps: [
        {
          number: '1',
          title: 'Masuk dengan Akun Siswa',
          description: 'Pilih peran Siswa, ketik Username / NIS (contoh: 20241001) dan password, lalu klik "Masuk ke Portal".'
        },
        {
          number: '2',
          title: 'Pilih Mata Pelajaran Terjadwal',
          description: 'Di dashboard siswa, klik kartu mata pelajaran yang berstatus "Tersedia". Mata pelajaran yang sudah tuntas akan disembunyikan otomatis.'
        },
        {
          number: '3',
          title: 'Konfirmasi & Masuk Mode Lockdown',
          description: 'Baca rincian jadwal, durasi, dan KKM. Klik "Mulai Kerjakan Ujian". Jendela ujian akan otomatis terkunci ke layar penuh.'
        },
        {
          number: '4',
          title: 'Menjawab Soal & Periksa Ragu-ragu',
          description: 'Jawab setiap butir soal sesuai tipenya. Manfaatkan tanda "Ragu-ragu" dan panel nomor soal untuk memeriksa kembali jawaban.'
        },
        {
          number: '5',
          title: 'Kumpulkan Ujian & Lihat Nilai',
          description: 'Setelah seluruh soal terisi, klik "Selesai & Kumpulkan Ujian". Hasil skor perolehan, persentase nilai, dan audit ketertiban langsung tampil.'
        }
      ],
      tips: [
        '⚠️ JANGAN membuka tab baru, kalkulator eksternal, atau meminimalkan jendela karena akan tercatat sebagai pelanggaran ujian.'
      ]
    },
    {
      id: 'fitur-guru',
      category: 'guru',
      stepBadge: 'PANDUAN GURU',
      title: 'Guru: Bank Soal, Paket Ujian & Rekap Nilai',
      subtitle: 'Panduan lengkap bagi guru dalam mengelola instrumen asesmen dan laporan kedinasan.',
      icon: UserCheck,
      iconBg: 'bg-emerald-600 text-white',
      steps: [
        {
          number: '1',
          title: 'Input Bank Soal & Matriks Kisi-kisi',
          description: 'Gunakan tab Bank Soal untuk menambahkan butir soal AKM dengan 5 variasi tipe soal beserta kunci jawaban & bobot nilai.'
        },
        {
          number: '2',
          title: 'Kelola Paket Ujian & Jadwal Rilis',
          description: 'Buat paket ujian, tentukan durasi pengerjaan, KKM, dan status rilis ujian untuk kelas target.'
        },
        {
          number: '3',
          title: 'Rekapitulasi Nilai & Cetak Rapor',
          description: 'Pantau rekapitulasi nilai siswa secara real-time, analisis ketuntasan KKM, dan cetak lembar rekap resmi.'
        },
        {
          number: '4',
          title: 'Berita Acara Kegiatan Ujian Siswa',
          description: 'Buat dan simpan Berita Acara Pelaksanaan Ujian langsung ke database Supabase dengan tanda tangan digital.'
        }
      ],
      tips: [
        'Gunakan tombol "Sinkronisasi Cloud Supabase" untuk memastikan seluruh soal dan nilai aman tersimpan di cloud.'
      ]
    },
    {
      id: 'fitur-admin',
      category: 'admin',
      stepBadge: 'PANDUAN ADMIN',
      title: 'Operator & Admin: Manajemen Sistem',
      subtitle: 'Pengelolaan basis data pengguna, keamanan, dan pemeliharaan server CBT.',
      icon: ShieldCheck,
      iconBg: 'bg-rose-600 text-white',
      steps: [
        {
          number: '1',
          title: 'Manajemen Akun Pengguna',
          description: 'Tambah, edit, atau reset akun siswa dan guru secara massal maupun individual.'
        },
        {
          number: '2',
          title: 'Backup & Restore Database',
          description: 'Lakukan ekspor dan impor cadangan data JSON serta pemantauan konektivitas Supabase.'
        }
      ],
      tips: [
        'Pastikan RLS dan policy Supabase aktif dengan menjalankan skrip SQL yang disediakan di panel admin.'
      ]
    }
  ];

  const filteredChapters = chapters.filter(ch => {
    const matchCat = selectedCategory === 'semua' || ch.category === selectedCategory;
    const matchQuery =
      !searchQuery ||
      ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.steps.some(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchQuery;
  });

  const currentChapter = filteredChapters[activeChapterIndex] || filteredChapters[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col h-[90vh] sm:h-[88vh]">
        
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-950 text-white gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-indigo-600/50 text-indigo-200 tracking-wider">
                  FlipHTML5 Digital Book
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-600/50 text-emerald-200 tracking-wider">
                  Official SPANJU
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white mt-0.5">
                Manual Book &amp; Panduan Resmi Portal Ujian
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle Switch */}
            <div className="flex bg-white/10 p-1 rounded-xl border border-white/15">
              <button
                type="button"
                onClick={() => setViewMode('flipbook')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'flipbook'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Buku FlipHTML5</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('panduan_teks')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'panduan_teks'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                <span>Ringkasan Teks</span>
              </button>
            </div>

            {/* Buka di Tab Baru */}
            <a
              href={flipHtmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-white/20 shadow-xs"
              title="Buka Buku di Tab Baru"
            >
              <ExternalLink className="w-4 h-4 text-indigo-300" />
              <span className="hidden sm:inline">Buka Fullscreen</span>
            </a>

            {/* Tombol Tutup */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 relative">
          {viewMode === 'flipbook' ? (
            /* ========================================================= */
            /* FLIPHTML5 EMBEDDED IFRAME VIEWER                          */
            /* ========================================================= */
            <div className="flex-1 w-full h-full relative bg-slate-900 flex flex-col">
              <iframe
                src={flipHtmlUrl}
                title="Manual Book FlipHTML5 SPANJU"
                className="w-full flex-1 border-0 bg-white"
                allowFullScreen
                loading="lazy"
              />
              <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl border border-slate-700 text-[11px] flex items-center gap-2 shadow-lg pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Terhubung ke FlipHTML5 Digital Library (SPANJU)</span>
              </div>
            </div>
          ) : (
            /* ========================================================= */
            /* PANDUAN TEKS INTERAKTIF (CHAPTERS & STEPS)                */
            /* ========================================================= */
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* Left Sidebar Chapter Selector */}
              <div className="w-full md:w-80 bg-slate-100/90 border-r border-slate-200/80 p-4 overflow-y-auto shrink-0 flex flex-col gap-3">
                
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari panduan..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0">
                  {[
                    { id: 'semua', label: 'Semua' },
                    { id: 'siswa', label: 'Siswa' },
                    { id: 'guru', label: 'Guru' },
                    { id: 'admin', label: 'Admin' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.id as any);
                        setActiveChapterIndex(0);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                        selectedCategory === cat.id
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 pt-1">
                  Daftar Bab Panduan ({filteredChapters.length})
                </div>

                {filteredChapters.map((chapter, idx) => {
                  const IconComp = chapter.icon;
                  const isSelected = idx === activeChapterIndex;

                  return (
                    <button
                      key={chapter.id}
                      type="button"
                      onClick={() => setActiveChapterIndex(idx)}
                      className={`w-full text-left p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                        isSelected
                          ? 'bg-white border-indigo-300 shadow-sm text-indigo-950 ring-1 ring-indigo-200'
                          : 'border-transparent hover:bg-white/80 hover:border-slate-200 text-slate-600'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${chapter.iconBg}`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          {chapter.stepBadge && (
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md ${
                              isSelected ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {chapter.stepBadge}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-extrabold truncate mt-0.5 leading-snug">
                          {chapter.title}
                        </h4>
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-indigo-600 translate-x-0.5' : 'text-slate-300'}`} />
                    </button>
                  );
                })}
              </div>

              {/* Right Main Content Panel */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-white">
                {currentChapter ? (
                  <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-150">
                    
                    {/* Chapter Banner */}
                    <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-50/70 via-slate-50 to-white border border-indigo-100/90 relative overflow-hidden">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md shrink-0 ${currentChapter.iconBg}`}>
                          {React.createElement(currentChapter.icon, { className: 'w-6 h-6' })}
                        </div>
                        <div>
                          {currentChapter.stepBadge && (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white mb-1.5 shadow-2xs">
                              {currentChapter.stepBadge}
                            </span>
                          )}
                          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
                            {currentChapter.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {currentChapter.subtitle}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Steps Checklist */}
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Petunjuk Tahapan Pelaksanaan:</span>
                      </h4>

                      <div className="space-y-3">
                        {currentChapter.steps.map((st) => (
                          <div
                            key={st.number}
                            className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/40 hover:bg-slate-50 transition-colors flex items-start gap-3.5"
                          >
                            <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                              {st.number}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h5 className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                                {st.title}
                              </h5>
                              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                {st.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tips / Notes if any */}
                    {currentChapter.tips && currentChapter.tips.length > 0 && (
                      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-1.5">
                        <span className="font-extrabold text-amber-900 flex items-center gap-1.5 text-xs">
                          💡 Catatan Penting &amp; Tips Praktis:
                        </span>
                        <ul className="list-disc pl-4 space-y-1 text-slate-700">
                          {currentChapter.tips.map((t, idx) => (
                            <li key={idx} className="leading-relaxed">
                              {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Bottom Navigation (Prev / Next Chapter) */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        disabled={activeChapterIndex === 0}
                        onClick={() => setActiveChapterIndex(prev => Math.max(0, prev - 1))}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Bab Sebelumnya</span>
                      </button>

                      <span className="text-xs text-slate-400 font-semibold">
                        Bab {activeChapterIndex + 1} dari {filteredChapters.length}
                      </span>

                      <button
                        type="button"
                        disabled={activeChapterIndex >= filteredChapters.length - 1}
                        onClick={() => setActiveChapterIndex(prev => Math.min(filteredChapters.length - 1, prev + 1))}
                        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <span>Langkah Selanjutnya</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <HelpCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-bold">Tidak ada topik panduan yang cocok dengan pencarian.</p>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* Modal Bottom Hotline Footer */}
        <div className="p-3 sm:px-6 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <span className="font-bold text-slate-700">Hotline SMPN 7 Pasuruan:</span>
            <span>(0343) 426845</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold font-mono">085168700953</span>
            <span>•</span>
            <span>smp7pas@yahoo.co.id</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={flipHtmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Buka FlipHTML5 di Browser</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            {onOpenHotline && (
              <button
                type="button"
                onClick={onOpenHotline}
                className="text-xs font-bold text-purple-700 hover:text-purple-900 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>Hubungi Hotline</span>
                <PhoneCall className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
