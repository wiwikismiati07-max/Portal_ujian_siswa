import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { getAllUsers, saveUsers } from '../utils/storage';
import { supabase } from '../utils/supabaseClient';
import { mapUserFromDb } from '../utils/supabaseSync';
import {
  ShieldCheck,
  GraduationCap,
  UserCheck,
  KeyRound,
  User as UserIcon,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Lock,
  Loader2,
  HelpCircle
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [roleTab, setRoleTab] = useState<UserRole>('siswa');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Quick preset helper for instant demo testing
  const selectQuickAccount = (u: string, p: string, role: UserRole) => {
    setUsername(u);
    setPassword(p);
    setRoleTab(role);
    setError(null);
  };

  const handleRoleTabChange = (role: UserRole) => {
    setRoleTab(role);
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const rawInput = username.trim();
    const cleanUser = rawInput.replace(/^@/, '').toLowerCase().trim();
    const inputPass = password.trim();

    if (!cleanUser) {
      setError('Silakan masukkan Username, NIS, atau Nama Anda.');
      return;
    }

    if (!inputPass) {
      setError('Silakan masukkan Password Anda.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Check in local storage dataset first
      let allUsers = getAllUsers();
      
      const checkMatch = (u: User) => {
        const uUsername = u.username.toLowerCase().replace(/^@/, '').trim();
        const uNis = (u.nipOrNis || '').toLowerCase().trim();
        const uName = u.name.toLowerCase().trim();
        
        const identMatch =
          uUsername === cleanUser ||
          uNis === cleanUser ||
          uName === cleanUser ||
          u.username.toLowerCase() === rawInput.toLowerCase();

        if (!identMatch) return false;

        // Compare password: exact match or case-insensitive match
        const exactPassMatch = u.password.trim() === inputPass;
        const caseInsensitivePassMatch =
          u.password.trim().toLowerCase() === inputPass.toLowerCase();

        return exactPassMatch || caseInsensitivePassMatch;
      };

      let found = allUsers.find(checkMatch);

      // 2. If not found in local cache, query Supabase cloud directly
      if (!found) {
        try {
          const { data: dbUsers, error: dbErr } = await supabase
            .from('cbt_users')
            .select('*')
            .limit(2000);

          if (!dbErr && dbUsers && dbUsers.length > 0) {
            const mappedUsers = dbUsers.map(mapUserFromDb);
            saveUsers(mappedUsers, false);
            allUsers = mappedUsers;
            found = mappedUsers.find(checkMatch);
          }
        } catch (cloudErr) {
          console.warn('Cloud login fetch fallback notice:', cloudErr);
        }
      }

      if (!found) {
        // Detailed helpful diagnostics
        const existsWithWrongPass = allUsers.find(u => {
          const uUsername = u.username.toLowerCase().replace(/^@/, '').trim();
          const uNis = (u.nipOrNis || '').toLowerCase().trim();
          const uName = u.name.toLowerCase().trim();
          return (
            uUsername === cleanUser ||
            uNis === cleanUser ||
            uName === cleanUser ||
            u.username.toLowerCase() === rawInput.toLowerCase()
          );
        });

        if (existsWithWrongPass) {
          setError(
            `Password untuk akun "${existsWithWrongPass.name}" tidak sesuai. Periksa huruf besar/kecil atau hubungi Admin/Guru.`
          );
        } else {
          setError(
            'Akun tidak ditemukan. Pastikan Username (contoh: abdul_hayyi), NIS (contoh: 9029), atau Nama sudah terdaftar di sistem.'
          );
        }
        setIsLoading(false);
        return;
      }

      // Auto sync role tab if it differs
      if (found.role !== roleTab) {
        setRoleTab(found.role);
      }

      setIsLoading(false);
      onLoginSuccess(found);
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Terjadi kendala saat memverifikasi akun. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
        
        {/* Left Branding & Highlights (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-indigo-200 border border-white/10 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Sistem CBT Interaktif Terpadu
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white rounded-2xl shadow-md border border-white/20">
                <img
                  src="https://iili.io/KDFk4fI.png"
                  alt="Logo"
                  className="h-12 w-auto object-contain"
                />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3">
              PORTAL UJIAN SISWA SPANJU
            </h1>
            <p className="text-sm text-indigo-100/80 leading-relaxed">
              Platform asesmen berbasis komputer dengan teknologi lockdown anti-curang, berbagai tipe soal AKM & Kurikulum Merdeka, serta rekapitulasi nilai otomatis.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="my-8 space-y-3">
            <div className="flex items-center gap-3 text-xs text-indigo-100 font-medium bg-white/5 p-2.5 rounded-xl border border-white/10">
              <div className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg">
                <Lock className="w-4 h-4" />
              </div>
              <span>Lockdown Mode & Deteksi Pindah Tab Anti-Curang</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-indigo-100 font-medium bg-white/5 p-2.5 rounded-xl border border-white/10">
              <div className="p-1.5 bg-amber-500/20 text-amber-300 rounded-lg">
                <Sparkles className="w-4 h-4" />
              </div>
              <span>5 Tipe Soal: PG Tunggal, Kompleks, B/S, Jodohkan, Studi Kasus</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-indigo-100 font-medium bg-white/5 p-2.5 rounded-xl border border-white/10">
              <div className="p-1.5 bg-blue-500/20 text-blue-300 rounded-lg">
                <UserCheck className="w-4 h-4" />
              </div>
              <span>Dukungan Login via Username, NIS, atau Nama</span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 text-xs text-indigo-200/70 flex items-center justify-between">
            <span>© 2026 Portal Ujian Siswa</span>
            <span className="font-mono">v2.4 Production</span>
          </div>
        </div>

        {/* Right Form & Quick Access (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            
            <div className="mb-6 text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Selamat Datang di Portal
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Masukkan akun untuk melanjutkan ujian atau manajemen portal CBT.
              </p>
            </div>

            {/* Role Switcher Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => handleRoleTabChange('siswa')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  roleTab === 'siswa'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Siswa</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleTabChange('guru')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  roleTab === 'guru'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Guru</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleTabChange('admin')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  roleTab === 'admin'
                    ? 'bg-white text-rose-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin</span>
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 mb-5 text-xs font-medium text-rose-800 bg-rose-50 border border-rose-200 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Username / NIS
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={
                      roleTab === 'siswa'
                        ? 'Contoh: abdul_hayyi atau NIS 9029'
                        : 'Masukkan username atau NIP'
                    }
                    required
                    disabled={isLoading}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none disabled:opacity-60"
                  />
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
                {roleTab === 'siswa' && (
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <HelpCircle className="w-3 h-3" />
                    <span>Bisa masuk memakai Username, NIS (contoh: 9029), atau Nama</span>
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {showPassword ? 'Sembunyikan' : 'Lihat'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    required
                    disabled={isLoading}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none disabled:opacity-60"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 flex items-center justify-center gap-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi Akun...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials for Instant Review */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                Akses Cepat Akun Demo (1-Klik):
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => selectQuickAccount('ahmad_siswa', 'siswa123', 'siswa')}
                  className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
                >
                  Siswa (Ahmad - X-IPA-1)
                </button>
                <button
                  type="button"
                  onClick={() => selectQuickAccount('andika_mardiatul_masruroh', 'ANDIK', 'guru')}
                  className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                >
                  Guru (Andika, S.Pd.I)
                </button>
                <button
                  type="button"
                  onClick={() => selectQuickAccount('admin', 'admin123', 'admin')}
                  className="px-2.5 py-1 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                >
                  Administrator
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                *Siswa dapat masuk menggunakan username (contoh: <code>abdul_hayyi</code>), NIS (contoh: <code>9029</code>), atau nama lengkap.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

