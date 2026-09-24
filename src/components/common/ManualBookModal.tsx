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
  Info
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
  const [selectedCategory, setSelectedCategory] = useState<'semua' | 'siswa' | 'guru' | 'admin'>('semua');
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

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
      id: 'guru-langkah-1',
      category: 'guru',
      stepBadge: 'LANGKAH 1',
      title: 'Guru: Membuat Paket Soal Ujian Baru',
      subtitle: 'Langkah awal mempersiapkan ujian asesmen (UTS, SAS, UH, Tugas/LKPD).',
      icon: Plus,
      iconBg: 'bg-emerald-600 text-white',
      steps: [
        {
          number: '1',
          title: 'Buka Tab "Kelola Paket Ujian"',
          description: 'Pada dashboard guru, klik tab navigasi utama "Kelola Paket Ujian" di bagian atas.'
        },
        {
          number: '2',
          title: 'Klik Tombol "+ Buat Ujian Baru"',
          description: 'Klik tombol hijau "+ Buat Ujian Baru" yang terletak di sebelah kanan atas daftar paket ujian.'
        }
      ]
    },
    {
      id: 'guru-langkah-2',
      category: 'guru',
      stepBadge: 'LANGKAH 2',
      title: 'Guru: Mengisi Formulir Rincian Paket Soal',
      subtitle: 'Menentukan judul ujian, alokasi waktu, KKM, serta rombel sasaran.',
      icon: FileText,
      iconBg: 'bg-emerald-600 text-white',
      steps: [
        {
          number: '1',
          title: 'Judul Paket Ujian',
          description: 'Ketik nama ujian resmi, contoh: "STS GANJIL INFORMATIKA KELAS 8" atau "PTS GENAP MATEMATIKA".'
        },
        {
          number: '2',
          title: 'Mata Pelajaran & Waktu Upload Rilis',
          description: 'Pilih mata pelajaran yang Anda ampu dan atur tanggal serta jam rilis paket ujian.'
        },
        {
          number: '3',
          title: 'Durasi Pengerjaan & KKM',
          description: 'Tentukan durasi pengerjaan dalam menit (misal: 45 atau 90 menit) serta standar KKM (misal: 75 poin).'
        },
        {
          number: '4',
          title: 'Target Kelas & Rombel Siswa',
          description: 'Pilih rombel yang ditugaskan (contoh: Kelas 8 rombel 8A s.d 8H). Gunakan tombol "Semua Rombel" untuk memilih cepat.'
        },
        {
          number: '5',
          title: 'Simpan Formulir',
          description: 'Klik tombol hijau "+ Simpan & Buat Soal" untuk melanjutkan ke tahap pengisian butir soal.'
        }
      ]
    },
    {
      id: 'guru-langkah-3',
      category: 'guru',
      stepBadge: 'LANGKAH 3',
      title: 'Guru: Membuka Kisi-kisi & Bank Soal Asesmen',
      subtitle: 'Memverifikasi paket aktif dan mulai menyusun butir soal.',
      icon: Layers,
      iconBg: 'bg-emerald-600 text-white',
      steps: [
        {
          number: '1',
          title: 'Koreksi Judul & Mata Pelajaran',
          description: 'Di panel Kisi-kisi & Bank Soal, pastikan judul paket soal dan mapel yang dipilih sudah sesuai dengan target.'
        },
        {
          number: '2',
          title: 'Klik Tombol "+ Tambah Soal"',
          description: 'Klik tombol "+ Tambah Soal" di sudut kanan atas untuk membuka jendela pembuatan butir soal baru.'
        }
      ]
    },
    {
      id: 'guru-langkah-4',
      category: 'guru',
      stepBadge: 'LANGKAH 4',
      title: 'Guru: Menulis Butir Soal (5 Variasi Bentuk Soal)',
      subtitle: 'Membuat soal interaktif sesuai standar Asesmen Kompetensi Minimum (AKM).',
      icon: BookOpen,
      iconBg: 'bg-emerald-600 text-white',
      steps: [
        {
          number: '1',
          title: 'Pilih Bentuk / Tipe Soal',
          description: 'Pilih salah satu: PG Tunggal (1 jawaban benar), PG Kompleks (banyak jawaban benar), Benar/Salah, Menjodohkan (Matching), atau Studi Kasus / Uraian.'
        },
        {
          number: '2',
          title: 'Isi Narasi Soal, Stimulus & Gambar',
          description: 'Ketik narasi pertanyaan. Anda dapat menyisipkan stimulus bacaan, gambar diagram/ilustrasi, dan bobot poin (misal: 20 poin).'
        },
        {
          number: '3',
          title: 'Tentukan Kunci Jawaban',
          description: 'Tandai opsi jawaban yang benar. Untuk soal menjodohkan, pasangkan Kolom Pernyataan A dengan Opsi Jawaban B.'
        },
        {
          number: '4',
          title: 'Simpan Butir Soal',
          description: 'Klik "Simpan & Tambah Soal Lagi" untuk melanjutkan soal berikutnya, atau klik "Simpan & Selesai" jika seluruh butir soal telah lengkap.'
        }
      ],
      tips: [
        'Disediakan tombol fitur Arab (Keyboard Virtual) untuk penulisan soal Pendidikan Agama Islam atau Bahasa Arab.'
      ]
    },
    {
      id: 'guru-langkah-5',
      category: 'guru',
      stepBadge: 'LANGKAH 5',
      title: 'Guru: Salin Soal dari Pengampu Lain / Tim Soal',
      subtitle: 'Fitur kolaborasi cerdas antar guru serumpun untuk menyalin naskah soal rekan ke akun sendiri.',
      icon: Copy,
      iconBg: 'bg-amber-600 text-white',
      steps: [
        {
          number: '1',
          title: 'Klik "Salin dari Pengampu Lain"',
          description: 'Di bilah atas bank soal, klik tombol "Salin dari Pengampu Lain".'
        },
        {
          number: '2',
          title: 'Filter Guru & Mata Pelajaran',
          description: 'Pilih guru pembuat soal dan mata pelajaran yang ingin disalin dari daftar rekan pengampu SPANJU.'
        },
        {
          number: '3',
          title: 'Pratinjau & Salin Paket',
          description: 'Periksa butir soal melalui tombol Pratinjau. Jika sudah sesuai, klik "Pilih & Salin Paket Ini".'
        },
        {
          number: '4',
          title: 'Sesuaikan Target Kelas Anda',
          description: 'Sesuaikan target rombel kelas Anda, lalu klik "Konfirmasi & Salin ke Akun Saya Sekarang". Seluruh butir soal langsung terduplikasi ke akun Anda.'
        }
      ]
    },
    {
      id: 'guru-langkah-6',
      category: 'guru',
      stepBadge: 'LANGKAH 6',
      title: 'Guru: Rekap, Analisis Nilai & Riset Ujian Siswa',
      subtitle: 'Memantau hasil perolehan nilai siswa secara langsung dan mereset siswa remedial.',
      icon: RotateCcw,
      iconBg: 'bg-emerald-600 text-white',
      steps: [
        {
          number: '1',
          title: 'Buka Tab "Rekap & Analisis Nilai"',
          description: 'Klik tab "Rekap & Analisis Nilai Ujian" untuk melihat tabel daftar seluruh siswa yang sudah mengumpulkan ujian.'
        },
        {
          number: '2',
          title: 'Analisis Ketuntasan & Pelanggaran',
          description: 'Sistem otomatis mengkategorikan siswa yang TUNTAS vs REMEDIAL serta mencatat frekuensi pelanggaran lockdown.'
        },
        {
          number: '3',
          title: 'Fitur Riset Ulang Ujian (Reset Sesi)',
          description: 'Bila siswa mengalami kendala perangkat atau perlu melakukan remedial, guru dapat mengklik tombol "Riset Ulang Ujian" pada baris nama siswa agar siswa dapat login dan mengerjakan kembali hingga tuntas.'
        }
      ]
    },
    {
      id: 'guru-langkah-7',
      category: 'guru',
      stepBadge: 'LANGKAH 7',
      title: 'Guru: Cetak Berita Acara & Nilai Resmi (PDF)',
      subtitle: 'Mencetak dokumen resmi administrasi ujian dengan kop surat resmi SMPN 7 Pasuruan.',
      icon: Printer,
      iconBg: 'bg-indigo-600 text-white',
      steps: [
        {
          number: '1',
          title: 'Cetak Berita Acara Asesmen',
          description: 'Klik tombol "Cetak Berita Acara" untuk menghasilkan dokumen berita acara pelaksanaan ujian yang mencakup daftar hadir, durasi pengerjaan, dan catatan kejadian khusus.'
        },
        {
          number: '2',
          title: 'Cetak Laporan Ketuntasan Belajar',
          description: 'Cetak rekapitulasi nilai kelas lengkap dengan tabel frekuensi interval nilai, persentase ketuntasan klasikal, dan tanda tangan resmi kepala sekolah & pengampu.'
        },
        {
          number: '3',
          title: 'Simpan PDF atau Print Kertas',
          description: 'Gunakan dialog cetak browser (Ctrl + P) dan pilih "Simpan sebagai PDF" atau kirim langsung ke printer sekolah.'
        }
      ]
    }
  ];

  const filteredChapters = chapters.filter(c => {
    const matchCategory = selectedCategory === 'semua' || c.category === selectedCategory || c.category === 'semua';
    if (!searchQuery.trim()) return matchCategory;
    const query = searchQuery.toLowerCase();
    const matchText =
      c.title.toLowerCase().includes(query) ||
      c.subtitle.toLowerCase().includes(query) ||
      c.steps.some(s => s.title.toLowerCase().includes(query) || s.description.toLowerCase().includes(query));
    return matchCategory && matchText;
  });

  const currentChapter = filteredChapters[activeChapterIndex] || filteredChapters[0] || chapters[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-4xl w-full h-[90vh] max-h-[820px] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  Buku Panduan & Tutorial Manual
                </h2>
                <span className="hidden xs:inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-700">
                  SPANJU v2.4
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Pedoman Lengkap Penggunaan Portal Ujian Siswa SMPN 7 Pasuruan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenHotline && (
              <button
                type="button"
                onClick={onOpenHotline}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                <span>Hotline Bantuan</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
              title="Tutup Manual Book"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="p-3 sm:px-6 sm:py-3 border-b border-slate-200/80 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('semua');
                setActiveChapterIndex(0);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === 'semua'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Topik ({chapters.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('siswa');
                setActiveChapterIndex(0);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                selectedCategory === 'siswa'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Panduan Siswa</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('guru');
                setActiveChapterIndex(0);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                selectedCategory === 'guru'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Panduan Guru (7 Langkah)</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[200px] sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari topik panduan..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none transition-all"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-[10px] text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Content Area with Split Layout: Sidebar list + Detail Card */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          
          {/* Left Navigation List (Table of Contents) */}
          <div className="w-full md:w-72 lg:w-80 border-b md:border-b-0 md:border-r border-slate-200/80 bg-slate-50/50 p-3 overflow-y-auto space-y-1.5 shrink-0 max-h-48 md:max-h-none">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 block mb-1">
              Daftar Bab & Langkah ({filteredChapters.length})
            </span>

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
                      💡 Catatan Penting & Tips Praktis:
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

          {onOpenHotline && (
            <button
              type="button"
              onClick={onOpenHotline}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Hubungi Hotline & Bantuan</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
