import React from 'react';
import { Database, AlertCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { SupabaseStatus } from '../utils/supabaseSync';

interface SupabaseSyncBannerProps {
  status: SupabaseStatus;
  onOpenModal: () => void;
}

export const SupabaseSyncBanner: React.FC<SupabaseSyncBannerProps> = ({
  status,
  onOpenModal
}) => {
  if (status !== 'needs_table_setup') {
    return null;
  }

  return (
    <aside aria-label="Pemberitahuan Sinkronisasi Cloud Supabase" className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white px-4 py-2 text-xs shadow-xs no-print transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="p-1 bg-white/20 rounded-md">
            <Database className="w-3.5 h-3.5" />
          </span>
          <span className="font-semibold">
            Sinkronisasi Multi-User Supabase Siap Diaktifkan:
          </span>
          <span className="opacity-95 hidden md:inline">
            Jalankan skrip SQL di Supabase SQL Editor agar seluruh transaksi guru dan siswa tersimpan di cloud.
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenModal}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-amber-900 font-bold rounded-lg hover:bg-amber-50 transition-colors shadow-2xs text-[11px] cursor-pointer"
        >
          <span>Buka Panduan & Salin SQL</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </aside>
  );
};
