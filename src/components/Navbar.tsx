import React from 'react';
import { User } from '../types';
import { LogOut, KeyRound, Shield, GraduationCap, UserCheck, BookOpen, Database } from 'lucide-react';
import { SupabaseStatus } from '../utils/supabaseSync';

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
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: Shield,
        };
      case 'guru':
        return {
          label: 'Guru Pengampu',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: UserCheck,
        };
      case 'siswa':
      default:
        return {
          label: 'Siswa Peserta',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: GraduationCap,
        };
    }
  };

  const badge = user ? getRoleBadge(user.role) : null;
  const BadgeIcon = badge ? badge.icon : null;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand & Logo */}
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center p-1 bg-white rounded-xl border border-slate-200 shadow-xs">
              <img
                src="https://iili.io/KDFk4fI.png"
                alt="Logo Portal Ujian Siswa"
                className="h-10 w-auto object-contain max-w-[140px]"
                loading="eager"
                onError={(e) => {
                  // Fallback icon container if image link fails or is offline
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const fallback = target.parentElement?.querySelector('.logo-fallback');
                  if (fallback) fallback.classList.remove('hidden');
                }}
              />
              <div className="logo-fallback hidden flex items-center justify-center w-10 h-10 bg-indigo-600 rounded-lg text-white font-bold text-lg">
                PU
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
                  PORTAL UJIAN SISWA
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 text-[11px] font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
                  CBT Pro v2.4
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Media Pembelajaran & Sistem Asesmen Berbasis Komputer
              </p>
            </div>
          </div>

          {/* User Status & Actions */}
          <div className="flex items-center gap-2">
            {/* Supabase Realtime Status Pill Button */}
            {onOpenSupabaseModal && !isExamLockActive && (
              <button
                type="button"
                onClick={onOpenSupabaseModal}
                title="Status Sinkronisasi Cloud Supabase"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
                  supabaseStatus === 'connected'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    : supabaseStatus === 'needs_table_setup'
                    ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 animate-pulse'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                <Database className={`w-3.5 h-3.5 ${
                  supabaseStatus === 'connected'
                    ? 'text-emerald-600'
                    : supabaseStatus === 'needs_table_setup'
                    ? 'text-amber-600'
                    : 'text-slate-500'
                }`} />
                <span className="hidden sm:inline">Supabase</span>
                <span className={`w-2 h-2 rounded-full ${
                  supabaseStatus === 'connected'
                    ? 'bg-emerald-500 ring-2 ring-emerald-300'
                    : supabaseStatus === 'needs_table_setup'
                    ? 'bg-amber-500 ring-2 ring-amber-300'
                    : 'bg-slate-400'
                }`} />
              </button>
            )}

            {user && !isExamLockActive ? (
              <div className="flex items-center gap-3">
                {/* Role badge */}
                {badge && BadgeIcon && (
                  <div
                    className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}
                  >
                    <BadgeIcon className="w-3.5 h-3.5" />
                    <span>{badge.label}</span>
                  </div>
                )}

                {/* User Profile info */}
                <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
                  <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-300 overflow-hidden flex items-center justify-center text-slate-700 font-bold text-sm shadow-xs">
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
                    <span className="text-sm font-bold text-slate-800 leading-tight truncate max-w-[180px]">
                      {user.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      @{user.username}{' '}
                      {user.classGroup ? `• ${user.classGroup}` : ''}
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1.5 ml-1">
                  <button
                    type="button"
                    onClick={onOpenChangePassword}
                    title="Ubah Username & Password"
                    className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100 cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onLogout}
                    title="Keluar dari Akun"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Keluar</span>
                  </button>
                </div>
              </div>
            ) : isExamLockActive ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-lg text-xs font-bold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                MODE UJIAN TERKUNCI (LOCKDOWN)
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};
