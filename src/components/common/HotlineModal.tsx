import React from 'react';
import {
  Phone,
  PhoneCall,
  Mail,
  Globe,
  MapPin,
  X,
  MessageCircle,
  Clock,
  ShieldCheck,
  ExternalLink,
  School
} from 'lucide-react';

interface HotlineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HotlineModal: React.FC<HotlineModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
            <PhoneCall className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              Layanan Bantuan Resmi
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Hotline & Kontak SMPN 7
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              UPT SMP Negeri 7 Pasuruan (SPANJU)
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 leading-relaxed mb-5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
          Butuh bantuan terkait login akun siswa/guru, kendala token ujian, atau reset sesi ujian? Tim helpdesk dan pengawas CBT SMPN 7 Pasuruan siap membantu Anda.
        </p>

        {/* Contact Channels Grid */}
        <div className="space-y-2.5 mb-6">
          {/* Telepon Kantor */}
          <div className="p-3.5 bg-slate-50 hover:bg-emerald-50/50 rounded-2xl border border-slate-200 transition-colors flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-2xs shrink-0">
                <Phone className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 block">Telepon Kantor</span>
                <span className="text-sm font-extrabold text-slate-800">(0343) 426845</span>
              </div>
            </div>
            <a
              href="tel:0343426845"
              className="px-3 py-1.5 bg-white hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 shrink-0"
            >
              <span>Hubungi</span>
            </a>
          </div>

          {/* Hotline WhatsApp / HP */}
          <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200 transition-colors flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-emerald-800">Hotline & WhatsApp</span>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-emerald-200 text-emerald-900 rounded-full">
                    Fast Response
                  </span>
                </div>
                <span className="text-sm font-extrabold text-emerald-950 font-mono">085168700953</span>
              </div>
            </div>
            <a
              href="https://wa.me/6285168700953?text=Halo%20Admin%20Hotline%20CBT%20SMPN%207%20Pasuruan,%20saya%20butuh%20bantuan%20terkait%20Portal%20Ujian%20Siswa..."
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Chat WA</span>
            </a>
          </div>

          {/* Pos-el / Email */}
          <div className="p-3.5 bg-slate-50 hover:bg-blue-50/50 rounded-2xl border border-slate-200 transition-colors flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-2xs shrink-0">
                <Mail className="w-4 h-4 text-blue-600" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-400 block">Pos-el (Email)</span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-800 truncate block">smp7pas@yahoo.co.id</span>
              </div>
            </div>
            <a
              href="mailto:smp7pas@yahoo.co.id?subject=Bantuan%20Portal%20Ujian%20Siswa%20SMPN%207"
              className="px-3 py-1.5 bg-white hover:bg-blue-600 hover:text-white text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 shrink-0"
            >
              <span>Kirim Email</span>
            </a>
          </div>

          {/* Laman / Website */}
          <div className="p-3.5 bg-slate-50 hover:bg-indigo-50/50 rounded-2xl border border-slate-200 transition-colors flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-2xs shrink-0">
                <Globe className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-400 block">Laman Resmi Sekolah</span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-800 truncate block">www.smpn7pasuruan.sch.id</span>
              </div>
            </div>
            <a
              href="https://www.smpn7pasuruan.sch.id"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-white hover:bg-indigo-600 hover:text-white text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1 shrink-0"
            >
              <span>Buka</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Footer info & Address */}
        <div className="pt-4 border-t border-slate-100 flex items-start gap-2.5 text-slate-500 text-[11px]">
          <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="leading-tight">
            <strong>Alamat:</strong> Jl. Simpang Slamet Riyadi No. 2, Kota Pasuruan, Jawa Timur 67139
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
        >
          Tutup Layanan Bantuan
        </button>
      </div>
    </div>
  );
};
