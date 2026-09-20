import React, { useState } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { usePWAInstall } from '@/src/hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'navbar' | 'prominent' | 'compact';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'navbar',
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  // If already installed in standalone mode, don't clutter the UI
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const installed = await install();
      if (!installed) {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      {variant === 'navbar' && (
        <button
          id="btn-pwa-install-nav"
          type="button"
          onClick={handleClick}
          title="Instal Portal Ujian SPANJU ke Laptop atau HP"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-xs hover:shadow transition-all cursor-pointer ${className}`}
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Instal Aplikasi</span>
          <span className="sm:hidden">Instal</span>
        </button>
      )}

      {variant === 'prominent' && (
        <button
          id="btn-pwa-install-prominent"
          type="button"
          onClick={handleClick}
          className={`w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-indigo-900/40 via-blue-900/40 to-indigo-950/50 hover:from-indigo-900/60 hover:to-blue-900/60 border border-white/15 rounded-xl text-left transition-all cursor-pointer group ${className}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 group-hover:scale-105 transition-transform">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Instal di Laptop / HP</span>
                <span className="px-1.5 py-0.5 text-[10px] bg-emerald-500/30 text-emerald-300 rounded font-semibold">PWA</span>
              </p>
              <p className="text-[11px] text-indigo-200/80">Akses cepat dengan logo SMPN 7 tanpa perlu buka link lagi</p>
            </div>
          </div>
          <div className="p-1.5 bg-white/10 group-hover:bg-white/20 rounded-lg text-white transition-colors">
            <Download className="w-4 h-4" />
          </div>
        </button>
      )}

      {variant === 'compact' && (
        <button
          id="btn-pwa-install-compact"
          type="button"
          onClick={handleClick}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-100 cursor-pointer ${className}`}
        >
          <Download className="w-3 h-3" />
          <span>Pasang</span>
        </button>
      )}

      <PWAInstallModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};
