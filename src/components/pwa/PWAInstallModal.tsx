import React, { useState } from 'react';
import { Download, Smartphone, Laptop, Apple, X, CheckCircle2, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '@/src/hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'laptop' | 'android' | 'ios'>('laptop');

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-700 to-blue-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1 shadow-xs flex items-center justify-center shrink-0">
              <img
                src="/logo-smpn7.png"
                alt="Logo SMPN 7 Pasuruan"
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Instal Portal Ujian SPANJU</h3>
              <p className="text-xs text-indigo-100">Bisa dibuka langsung dari Layar Laptop & HP</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-indigo-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Quick Install Action if browser supports one-click */}
          {isInstallable && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="text-xs text-emerald-900">
                  <p className="font-bold">Browser Anda mendukung instalasi langsung 1-Klik!</p>
                  <p className="text-emerald-700">Aplikasi akan dipasang dengan logo SMPN 7 Pasuruan.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleNativeInstall}
                className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Pasang Sekarang</span>
              </button>
            </div>
          )}

          {/* Guide Tabs for Laptop / Android / iOS */}
          <div>
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('laptop')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'laptop'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Laptop className="w-4 h-4" />
                <span>Laptop / PC</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('android')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'android'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>HP Android</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ios')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'ios'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Apple className="w-4 h-4" />
                <span>iPhone / iPad</span>
              </button>
            </div>

            <div className="pt-4 text-xs text-slate-700 space-y-3">
              {activeTab === 'laptop' && (
                <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p className="font-semibold text-slate-800">Langkah Memasang di Laptop / Komputer (Chrome & Edge):</p>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600 leading-relaxed">
                    <li>Buka halaman web ini di browser <strong>Google Chrome</strong> atau <strong>Microsoft Edge</strong>.</li>
                    <li>
                      Perhatikan bilah alamat URL di kanan atas, klik ikon <strong>Instal / Pasang Aplikasi</strong> (<Download className="w-3 h-3 inline text-indigo-600" />).
                    </li>
                    <li>
                      Atau klik titik tiga (<strong>⋮</strong>) di pojok kanan atas browser &gt; pilih <strong>"Simpan dan bagikan"</strong> &gt; pilih <strong>"Instal PORTAL UJIAN SISWA SPANJU"</strong>.
                    </li>
                    <li>Ikon aplikasi dengan logo SMPN 7 akan muncul di Desktop dan Menu Start laptop Anda.</li>
                  </ol>
                </div>
              )}

              {activeTab === 'android' && (
                <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p className="font-semibold text-slate-800">Langkah Memasang di HP Android (Google Chrome):</p>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600 leading-relaxed">
                    <li>Buka link aplikasi di browser <strong>Google Chrome</strong> pada HP Android Anda.</li>
                    <li>Ketuk ikon <strong>Titik Tiga (⋮)</strong> di pojok kanan atas browser Chrome.</li>
                    <li>Pilih menu <strong>"Tambahkan ke Layar Utama"</strong> atau <strong>"Instal Aplikasi"</strong>.</li>
                    <li>Konfirmasi dengan memilih <strong>"Instal"</strong>.</li>
                    <li>Aplikasi SPANJU CBT dengan icon logo SMPN 7 akan terpasang di layar utama HP Anda dan dapat dibuka selayaknya aplikasi Play Store.</li>
                  </ol>
                </div>
              )}

              {activeTab === 'ios' && (
                <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p className="font-semibold text-slate-800">Langkah Memasang di iPhone / iPad (Safari):</p>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600 leading-relaxed">
                    <li>Buka halaman web ini menggunakan browser bawaan <strong>Safari</strong>.</li>
                    <li>
                      Ketuk tombol <strong>Bagikan / Share</strong> (<Share2 className="w-3.5 h-3.5 inline text-blue-600" />) di baris bawah Safari.
                    </li>
                    <li>
                      Gulir ke bawah dan ketuk menu <strong>"Tambah ke Layar Utama" (Add to Home Screen)</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-blue-600" />).
                    </li>
                    <li>Ketuk <strong>"Tambah" (Add)</strong> di pojok kanan atas.</li>
                    <li>Logo SMPN 7 akan langsung terpajang di HomeScreen iPhone Anda sebagai aplikasi mandiri full screen.</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Icon Resmi: SMP Negeri 7 Pasuruan (SPANJU)</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-200 text-slate-700 font-semibold rounded-lg border border-slate-300 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
