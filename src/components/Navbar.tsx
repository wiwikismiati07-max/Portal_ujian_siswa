import React from 'react';
import { User } from '../types';
import { LogOut, KeyRound, Shield, GraduationCap, UserCheck, BookOpen, Database } from 'lucide-react';
import { SupabaseStatus } from '../utils/supabaseSync';
import { PWAInstallButton } from './pwa/PWAInstallButton';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onOpenChangePassword: () => void;
  activeRoleView?: string;
  isExamLockActive?: boolean;
  supabaseStatus?: SupabaseStatus;
  onOpenSupabaseModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  onOpenChangePassword,
  isExamLockActive = false,
  supabaseStatus = 'connected',
  onOpenSupabaseModal,
}) => {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          label: 'Administrator',
          bg: 'bg-rose-50/90 text-rose-700 border-rose-200/80 shadow-2xs',
          ring: 'ring-rose-400/30',
          icon: Shield,
        };
      case 'guru':
        return {
          label: 'Guru Pengampu',
          bg: 'bg-emerald-50/90 text-emerald-700 border-emerald-200/80 shadow-2xs',
          ring: 'ring-emerald-400/30',
          icon: UserCheck,
        };
      case 'siswa':
      default:
        return {
          label: 'Siswa Peserta',
          bg: 'bg-indigo-50/90 text-indigo-700 border-indigo-200/80 shadow-2xs',
          ring: 'ring-indigo-400/30',
          icon: GraduationCap,
        };
    }
  };

  const badge = user ? getRoleBadge(user.role) : null;
  const BadgeIcon = badge ? badge.icon : null;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all no-print overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-18 gap-1.5 sm:gap-3">
          
          {/* Brand & Logo */}
          <div className="flex items-center gap-2 sm:gap-3.5 min-w-0 flex-1 sm:flex-initial">
            <div className="relative shrink-0 flex items-center justify-center p-0.5 sm:p-1 bg-white rounded-xl border border-slate-200 shadow-xs">
              <img
                src="https://iili.io/KDFk4fI.png"
                alt="Logo Portal Ujian Siswa"
                className="h-7 sm:h-10 w-auto object-contain max-w-[80px] xs:max-w-[110px] sm:max-w-[140px]"
                loading="eager"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const fallback = target.parentElement?.querySelector('.logo-fallback');
                  if (fallback) fallback.classList.remove('hidden');
                }}
              />
              <div className="logo-fallback hidden flex items-center justify-center w-7 sm:w-10 h-7 sm:h-10 bg-indigo-600 rounded-lg text-white font-extrabold text-xs sm:text-base">
                PU
              </div>
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                <span className="text-xs xs:text-sm sm:text-lg lg:text-xl font-extrabold tracking-tight text-slate-900 truncate">
                  PORTAL UJIAN SISWA
                </span>
                <span className="inline-flex items-center px-1 sm:px-2 py-0.5 text-[9px] sm:text-[11px] font-extrabold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200 shrink-0">
                  SPANJU
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate hidden md:block">
                Media Pembelajaran & Sistem Asesmen Berbasis Komputer
              </p>
            </div>
          </div>

          {/* User Status & Actions */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            {/* PWA Install Button */}
            {!isExamLockActive && <PWAInstallButton variant="navbar" />}

            {/* Supabase Realtime Status Pill Button */}
            {onOpenSupabaseModal && !isExamLockActive && (
              <button
                type="button"
                onClick={onOpenSupabaseModal}
                title="Status Sinkronisasi Cloud Supabase"
                className={`inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-bold border transition-all cursor-pointer shadow-2xs ${
                  supabaseStatus === 'connected'
                    ? 'bg-emerald-50/90 text-emerald-800 border-emerald-200 hover:bg-emerald-100/90'
                    : supabaseStatus === 'needs_table_setup'
                    ? 'bg-amber-50/90 text-amber-900 border-amber-300 hover:bg-amber-100/90 animate-pulse'
                    : 'bg-slate-100/90 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                <Database className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${
                  supabaseStatus === 'connected'
                    ? 'text-emerald-600'
                    : supabaseStatus === 'needs_table_setup'
                    ? 'text-amber-600'
                    : 'text-slate-500'
                }`} />
                <span className="hidden md:inline">Cloud</span>
                <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${
                  supabaseStatus === 'connected'
                    ? 'bg-emerald-500 ring-2 ring-emerald-300'
                    : supabaseStatus === 'needs_table_setup'
                    ? 'bg-amber-500 ring-2 ring-amber-300'
                    : 'bg-slate-400'
                }`} />
              </button>
            )}

            {user && !isExamLockActive ? (
              <div className="flex items-center gap-1.5 sm:gap-3">
                {/* Role badge */}
                {badge && BadgeIcon && (
                  <div
                    className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${badge.bg}`}
                  >
                    <BadgeIcon className="w-3.5 h-3.5" />
                    <span>{badge.label}</span>
                  </div>
                )}

                {/* User Profile info */}
                <div className="flex items-center gap-2 pl-1 sm:pl-2.5 border-l border-slate-200">
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 border border-slate-200 ring-2 ${badge?.ring || 'ring-indigo-100'} overflow-hidden flex items-center justify-center text-slate-700 font-extrabold text-xs sm:text-sm shadow-2xs`}>
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs sm:text-sm font-extrabold text-slate-800 leading-tight truncate max-w-[160px]">
                      {user.name}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      @{user.username}{' '}
                      {user.classGroup ? `• ${user.classGroup}` : ''}
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={onOpenChangePassword}
                    title="Ubah Username & Password"
                    className="p-1.5 sm:p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/80 rounded-xl transition-all border border-transparent hover:border-indigo-100 cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onLogout}
                    title="Keluar dari Akun"
                    className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50/80 hover:bg-rose-100 border border-rose-200/80 rounded-xl transition-all cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Keluar</span>
                  </button>
                </div>
              </div>
            ) : isExamLockActive ? (
              <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs font-bold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0"></span>
                <span className="text-[11px] sm:text-xs">MODE LOCKDOWN AKTIF</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};
