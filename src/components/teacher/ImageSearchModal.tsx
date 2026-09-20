import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Search,
  ExternalLink,
  Link,
  Upload,
  Image as ImageIcon,
  Check,
  Sparkles,
  Trash2,
  AlertCircle,
  HelpCircle,
  FolderOpen
} from 'lucide-react';

interface ImageSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
  initialUrl?: string;
  targetTitle: string; // e.g., "Butir Soal", "Opsi A", "Opsi B"
}

interface CuratedImageItem {
  id: string;
  title: string;
  category: string;
  url: string;
  source: string;
}

const CURATED_LIBRARY: CuratedImageItem[] = [
  // Biologi & Alam
  {
    id: 'bio_1',
    title: 'Struktur Sel Tumbuhan & Dinding Sel',
    category: 'Biologi',
    url: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=800&q=80',
    source: 'Ilustrasi Botani'
  },
  {
    id: 'bio_2',
    title: 'Daun Hijau & Proses Fotosintesis',
    category: 'Biologi',
    url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80',
    source: 'Fotosintesis Klorofil'
  },
  {
    id: 'bio_3',
    title: 'Mikroskop Laboratorium & Mikroorganisme',
    category: 'Biologi',
    url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80',
    source: 'Mikrobiologi'
  },
  {
    id: 'bio_4',
    title: 'Struktur DNA & Genetika Manusia',
    category: 'Biologi',
    url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80',
    source: 'Genetika'
  },

  // Fisika & Kimia
  {
    id: 'phy_1',
    title: 'Laboratorium Kimia & Tabung Reaksi',
    category: 'Fisika & Kimia',
    url: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=800&q=80',
    source: 'Kimia Larutan'
  },
  {
    id: 'phy_2',
    title: 'Sistem Rangkaian Listrik & Sirkuit Elektronika',
    category: 'Fisika & Kimia',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    source: 'Elektronika'
  },
  {
    id: 'phy_3',
    title: 'Optika & Spektrum Cahaya Prisma',
    category: 'Fisika & Kimia',
    url: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=800&q=80',
    source: 'Fisika Optik'
  },
  {
    id: 'phy_4',
    title: 'Tata Surya & Planet Alam Semesta',
    category: 'Fisika & Kimia',
    url: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80',
    source: 'Astronomi'
  },

  // Matematika & Geometri
  {
    id: 'math_1',
    title: 'Papan Tulis Rumus Matematika & Aljabar',
    category: 'Matematika',
    url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
    source: 'Matematika'
  },
  {
    id: 'math_2',
    title: 'Geometri Sudut & Penggaris Busur',
    category: 'Matematika',
    url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
    source: 'Geometri Ruang'
  },

  // Geografi & Sejarah
  {
    id: 'geo_1',
    title: 'Peta Bola Dunia / Globe Navigasi',
    category: 'Geografi',
    url: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=800&q=80',
    source: 'Geografi'
  },
  {
    id: 'geo_2',
    title: 'Candi Bersejarah & Arkeologi Kuno',
    category: 'Geografi',
    url: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=800&q=80',
    source: 'Sejarah & Budaya'
  },

  // Bahasa Arab & PAI
  {
    id: 'isl_1',
    title: 'Al-Quranul Karim & Teks Mushaf Arab',
    category: 'Bahasa Arab & Agama',
    url: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=800&q=80',
    source: 'Mushaf Al-Quran'
  },
  {
    id: 'isl_2',
    title: 'Masjid Nabawi & Arsitektur Islam',
    category: 'Bahasa Arab & Agama',
    url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=800&q=80',
    source: 'Masjid Nabawi'
  },
  {
    id: 'isl_3',
    title: 'Ka\'bah Makkah Al-Mukarramah',
    category: 'Bahasa Arab & Agama',
    url: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=800&q=80',
    source: 'Makkah Al-Mukarramah'
  },

  // TIK & Komputer
  {
    id: 'tik_1',
    title: 'Komponen Prosesor Komputer (CPU / Chipset)',
    category: 'Informatika',
    url: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=800&q=80',
    source: 'Hardware Komputer'
  },
  {
    id: 'tik_2',
    title: 'Koding Pemrograman & Algoritma Software',
    category: 'Informatika',
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    source: 'Pemrograman Komputer'
  }
];

export const ImageSearchModal: React.FC<ImageSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  initialUrl = '',
  targetTitle
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'url' | 'upload'>('search');
  const [selectedUrl, setSelectedUrl] = useState<string>(initialUrl);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [imageLoadError, setImageLoadError] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedUrl(initialUrl);
      setImageLoadError(false);
      setSearchQuery('');
    }
  }, [isOpen, initialUrl]);

  const categories = ['Semua', 'Biologi', 'Fisika & Kimia', 'Matematika', 'Geografi', 'Bahasa Arab & Agama', 'Informatika'];

  // Filter curated images
  const filteredImages = useMemo(() => {
    return CURATED_LIBRARY.filter(item => {
      const matchCat = selectedCategory === 'Semua' || item.category === selectedCategory;
      const matchQuery = !searchQuery.trim() || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  if (!isOpen) return null;

  // Handle direct Google Images search in new tab
  const handleOpenGoogleImages = () => {
    const q = searchQuery.trim() || targetTitle;
    const url = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(q)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Handle local file upload (converts to base64 Data URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Format berkas harus berupa gambar (JPG, PNG, WebP, GIF, SVG).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran gambar maksimal 5MB.');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedUrl(reader.result as string);
      setImageLoadError(false);
      setIsUploading(false);
    };
    reader.onerror = () => {
      alert('Gagal memproses gambar.');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleApply = () => {
    if (!selectedUrl.trim()) {
      onSelectImage('');
    } else {
      onSelectImage(selectedUrl.trim());
    }
    onClose();
  };

  const handleRemove = () => {
    setSelectedUrl('');
    onSelectImage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[92vh] shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Sisipkan Gambar: <span className="text-indigo-600">{targetTitle}</span>
              </h3>
              <p className="text-xs text-slate-500">
                Pilih dari pencarian web, salin dari Google Gambar, atau unggah dari perangkat
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-white px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'search'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Pencarian Web & Google</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'url'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>Tempel URL Gambar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'upload'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Unggah dari Komputer / HP</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: PENCARIAN GOOGLE & KOLEKSI EDUKASI */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              
              {/* Google Images Quick Action Banner */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-900 mb-1">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Cari Langsung di Google Images</span>
                  </div>
                  <p className="text-xs text-blue-800 leading-relaxed">
                    Buka tab Google Gambar ➔ Klik kanan gambar ➔ Pilih <strong>"Salin Alamat Gambar" (Copy Image Address)</strong> ➔ Tempelkan pada tab URL.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenGoogleImages}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors shadow-xs cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Buka Google Gambar</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* Search Bar for internal educational collection */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ketik topik materi (contoh: sel, fotosintesis, DNA, peta, optik, arab, komputer)..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Grid of Images */}
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Koleksi Gambar Materi Pendidikan ({filteredImages.length})</span>
                  <span className="text-[11px] text-indigo-600 font-normal">Klik salah satu untuk memilih</span>
                </div>

                {filteredImages.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                    Tidak menemukan gambar yang cocok dengan kata kunci "{searchQuery}".
                    <br />
                    Gunakan tombol <strong>Buka Google Gambar</strong> di atas untuk mencari jutaan gambar lainnya di Google.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {filteredImages.map((img) => {
                      const isChosen = selectedUrl === img.url;
                      return (
                        <div
                          key={img.id}
                          onClick={() => {
                            setSelectedUrl(img.url);
                            setImageLoadError(false);
                          }}
                          className={`group relative rounded-2xl overflow-hidden border transition-all cursor-pointer ${
                            isChosen
                              ? 'border-indigo-600 ring-3 ring-indigo-500/30 shadow-md'
                              : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                          }`}
                        >
                          <div className="aspect-video bg-slate-100 overflow-hidden relative">
                            <img
                              src={img.url}
                              alt={img.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              loading="lazy"
                            />
                            {isChosen && (
                              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            )}
                            <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-black/60 text-white text-[10px] rounded-md font-medium backdrop-blur-xs">
                              {img.category}
                            </span>
                          </div>
                          <div className="p-2.5 bg-white">
                            <p className="text-xs font-bold text-slate-900 line-clamp-1">
                              {img.title}
                            </p>
                            <p className="text-[11px] text-slate-400 line-clamp-1">
                              {img.source}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: TEMPEL URL GAMBAR LANGSUNG */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Masukkan Alamat / URL Gambar:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={selectedUrl}
                    onChange={(e) => {
                      setSelectedUrl(e.target.value);
                      setImageLoadError(false);
                    }}
                    placeholder="Contoh: https://iili.io/... atau URL hasil copy image address dari Google"
                    className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                  {selectedUrl && (
                    <button
                      type="button"
                      onClick={() => setSelectedUrl('')}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Bersihkan
                    </button>
                  )}
                </div>
              </div>

              {/* Tips for Google Images */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 space-y-2">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-indigo-600" />
                  <span>Petunjuk Menyalin Gambar dari Google Images:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1 leading-relaxed">
                  <li>Cari gambar materi yang Anda inginkan di Google (misal: <em>"diagram jantung manusia"</em>).</li>
                  <li>Klik gambar tersebut untuk memperbesarnya di Google.</li>
                  <li>Klik kanan pada gambar ➔ Pilih opsi <strong>"Salin Alamat Gambar" (Copy Image Address)</strong>.</li>
                  <li>Kembali ke kolom URL di atas, tekan <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-[10px] font-mono">Ctrl + V</kbd> untuk menempelkan.</li>
                </ol>
                <button
                  type="button"
                  onClick={handleOpenGoogleImages}
                  className="mt-2 text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Buka Google Images Sekarang</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: UNGGAH DARI KOMPUTER / HP */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Pilih Berkas Gambar dari Komputer / Handphone:
              </label>

              <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/40 rounded-2xl p-8 text-center transition-colors">
                <input
                  type="file"
                  id="image_file_input"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="image_file_input"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-3"
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-indigo-600 hover:underline">
                      Klik untuk memilih berkas gambar
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      Mendukung format PNG, JPG, JPEG, WebP, SVG (Maks. 5 MB)
                    </p>
                  </div>
                </label>
              </div>

              {isUploading && (
                <div className="text-center text-xs text-indigo-600 font-semibold animate-pulse">
                  Sedang memproses gambar...
                </div>
              )}
            </div>
          )}

          {/* PREVIEW BOX (Always visible if selectedUrl is present) */}
          {selectedUrl && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-indigo-600" />
                  Pratinjau Gambar yang Dipilih:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedUrl('')}
                  className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus Pilihan
                </button>
              </div>

              <div className="relative max-h-56 bg-slate-200/60 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200">
                {imageLoadError ? (
                  <div className="p-6 text-center text-rose-600 text-xs flex flex-col items-center gap-2">
                    <AlertCircle className="w-6 h-6" />
                    <span>Gambar gagal dimuat. Pastikan alamat URL gambar valid dan dapat diakses publik.</span>
                  </div>
                ) : (
                  <img
                    src={selectedUrl}
                    alt="Pratinjau Gambar"
                    className="max-h-56 w-auto object-contain rounded-lg"
                    onError={() => setImageLoadError(true)}
                  />
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div>
            {initialUrl && (
              <button
                type="button"
                onClick={handleRemove}
                className="text-xs text-rose-600 font-bold hover:text-rose-700 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Gambar dari {targetTitle}
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Terapkan Gambar</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
