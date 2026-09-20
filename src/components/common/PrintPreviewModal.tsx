import React, { useRef, useState, useEffect } from 'react';
import { Printer, ExternalLink, X, AlertCircle, FileCheck } from 'lucide-react';
import { printInStandaloneWindow } from '../../utils/printHelper';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subTitle?: string;
  defaultOrientation?: 'portrait' | 'landscape';
  children: React.ReactNode;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  subTitle = 'UPT SMP Negeri 7 Pasuruan • Dokumen Resmi Asesmen',
  defaultOrientation = 'portrait',
  children
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [printStatus, setPrintStatus] = useState<string | null>(null);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(defaultOrientation);

  // Sync orientation with defaultOrientation when opened or changed
  useEffect(() => {
    if (isOpen) {
      setOrientation(defaultOrientation);
    }
  }, [isOpen, defaultOrientation]);

  // Dynamically apply @page orientation to current window for browser print
  useEffect(() => {
    if (!isOpen) return;

    const styleId = 'applet-dynamic-print-page';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    styleEl.innerHTML = `
      @page {
        size: A4 ${orientation};
        margin: ${orientation === 'landscape' ? '8mm 10mm 10mm 10mm' : '10mm 12mm 12mm 12mm'};
      }
    `;

    document.body.classList.remove('print-mode-portrait', 'print-mode-landscape');
    document.body.classList.add(orientation === 'landscape' ? 'print-mode-landscape' : 'print-mode-portrait');

    return () => {
      document.body.classList.remove('print-mode-portrait', 'print-mode-landscape');
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, [isOpen, orientation]);

  if (!isOpen) return null;

  const handlePrintCurrent = () => {
    try {
      setPrintStatus('Memanggil dialog pencetakan browser...');
      window.print();
    } catch (err) {
      console.warn('Direct print error, attempting new window:', err);
      handleOpenInNewTab();
    }
  };

  const handleOpenInNewTab = () => {
    if (contentRef.current) {
      const htmlContent = contentRef.current.innerHTML;
      printInStandaloneWindow(title, htmlContent, orientation);
      setPrintStatus(`Dokumen (${orientation === 'landscape' ? 'Landscape/Mendatar' : 'Portrait/Tegak'}) telah dibuka di tab baru untuk pencetakan!`);
    } else {
      window.print();
    }
  };

  const containerMaxWidth = orientation === 'landscape' ? 'max-w-6xl' : 'max-w-4xl';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-start p-2 sm:p-4 lg:p-6 animate-in fade-in duration-200">
      
      {/* Top Floating Control Bar (No Print) */}
      <div className={`w-full ${containerMaxWidth} bg-white rounded-2xl border border-slate-200 shadow-xl p-3 sm:p-4 mb-4 flex flex-col md:flex-row items-center justify-between gap-3 sticky top-2 z-50 no-print`}>
        <div className="flex items-center gap-3 min-w-0 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <Printer className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                {title}
              </h3>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold shrink-0">
                A4 {orientation === 'landscape' ? 'Landscape (Mendatar)' : 'Portrait (Tegak)'}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate">
              {subTitle}
            </p>
          </div>
        </div>

        {/* Orientation Toggle + Action Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end flex-wrap">
          
          {/* Orientation Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold shrink-0">
            <button
              type="button"
              onClick={() => setOrientation('portrait')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                orientation === 'portrait'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Pilih orientasi A4 Tegak (Portrait)"
            >
              <span>📄 Portrait (Tegak)</span>
            </button>
            <button
              type="button"
              onClick={() => setOrientation('landscape')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                orientation === 'landscape'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Pilih orientasi A4 Mendatar (Landscape) - Cocok agar tabel matriks soal / rekap lebar tidak terpotong"
            >
              <span>📃 Landscape (Mendatar)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintCurrent}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
              title="Panggil dialog printer browser langsung"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang</span>
            </button>

            <button
              type="button"
              onClick={handleOpenInNewTab}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
              title="Buka di tab baru (bebas pembatasan sandbox iframe browser & auto-print)"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Tab Baru (PDF)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer shrink-0"
              title="Tutup Pratinjau"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Helpful Hint Notice */}
      <div className={`w-full ${containerMaxWidth} bg-amber-50 border border-amber-200/80 rounded-xl p-3 mb-4 text-xs text-amber-900 flex items-start gap-2.5 no-print shadow-2xs`}>
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1 leading-relaxed">
          <p>
            <strong>Petunjuk Cetak &amp; Tanda Tangan:</strong> Anda dapat membubuhkan <strong>tanda tangan digital langsung</strong> di layar sentuh (HP/tablet) maupun mouse/touchpad laptop pada kolom tanda tangan di bagian bawah dokumen sebelum mencetak. Pilih <strong>"Landscape (Mendatar)"</strong> untuk tabel lebar agar tidak terpotong, atau <strong>"Tab Baru (PDF)"</strong> untuk unduh dokumen PDF siap pakai.
          </p>
          {printStatus && (
            <div className="mt-1.5 font-semibold text-emerald-700 flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5" />
              <span>{printStatus}</span>
            </div>
          )}
        </div>
      </div>

      {/* Printable Sheet Viewport (Real A4 Container with adaptive orientation width) */}
      <div className={`w-full ${containerMaxWidth} bg-white shadow-2xl rounded-lg border border-slate-300 p-6 sm:p-8 lg:p-10 text-black my-2 font-serif min-h-[700px] overflow-hidden transition-all duration-300`}>
        <div ref={contentRef} id="official-printable-content" className="w-full">
          {children}
        </div>
      </div>

      {/* Bottom Close Button (No Print) */}
      <div className={`w-full ${containerMaxWidth} flex justify-center py-4 no-print`}>
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          Tutup Lembar Pratinjau
        </button>
      </div>

    </div>
  );
};

