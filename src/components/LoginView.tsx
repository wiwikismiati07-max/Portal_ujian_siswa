import React, { useState, useEffect, useRef } from 'react';
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
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Layers,
  CheckCircle2
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

  // Carousel Slider State
  const [activeSlide, setActiveSlide] = useState(0);
  const usernameInputRef = useRef<HTMLInputElement>(null);

  const slides = [
    {
      badge: 'Sistem CBT Terpadu SPANJU',
      title: 'PORTAL UJIAN SISWA',
      subtitle: 'Platform asesmen berbasis komputer dengan teknologi lockdown anti-curang, dukungan 5 tipe soal AKM/Kurikulum Merdeka, dan sinkronisasi nilai otomatis.',
      icon: Sparkles,
      iconColor: 'text-amber-300',
      highlights: [
        { label: 'Lockdown Mode Interaktif', desc: 'Deteksi pindah tab & layar penuh', icon: Lock, bg: 'bg-emerald-500/20 text-emerald-300' },
        { label: '5 Model Soal Beragam', desc: 'PG, Kompleks, B/S, Jodohkan, Kasus', icon: Sparkles, bg: 'bg-amber-500/20 text-amber-300' },
        { label: 'Fleksibilitas Login Akun', desc: 'Bisa pakai Username, NIS, atau Nama', icon: UserCheck, bg: 'bg-blue-500/20 text-blue-300' }
      ]
    },
    {
      badge: 'Proteksi Integritas & Anti-Curang',
      title: 'TEKNOLOGI LOCKDOWN MODE',
      subtitle: 'Memastikan seluruh pengerjaan ujian siswa berlangsung tertib dan jujur dengan pengawasan otomatis yang mencatat setiap pelanggaran.',
      icon: Lock,
      iconColor: 'text-emerald-300',
      highlights: [
        { label: 'Kunci Layar Penuh Otomatis', desc: 'Siswa tidak dapat membuka tab lain', icon: ShieldCheck, bg: 'bg-indigo-500/20 text-indigo-300' },
        { label: 'Deteksi Beralih Jendela', desc: 'Mencatat frekuensi percobaan kecurangan', icon: AlertCircle, bg: 'bg-rose-500/20 text-rose-300' },
        { label: 'Pengumpulan Otomatis', desc: 'Jika terdeteksi pelanggaran batas maksimal', icon: CheckCircle2, bg: 'bg-teal-500/20 text-teal-300' }
      ]
    },
    {
      badge: 'Standar Kurikulum Merdeka & AKM',
      title: '5 VARIASI SOAL ASESMEN',
      subtitle: 'Mendukung ragam metode penilaian komprehensif mulai dari pemahaman konsep sederhana hingga analisis studi kasus mendalam.',
      icon: BookOpen,
      iconColor: 'text-indigo-300',
      highlights: [
        { label: 'Pilihan Ganda & Kompleks', desc: 'Pilih satu atau beberapa jawaban benar', icon: Layers, bg: 'bg-amber-500/20 text-amber-300' },
        { label: 'Benar / Salah & Menjodohkan', desc: 'Uji ketelitian dan analisis hubungan', icon: CheckCircle2, bg: 'bg-emerald-500/20 text-emerald-300' },
        { label: 'Studi Kasus & Jawaban Singkat', desc: 'Penilaian penalaran & literasi membaca', icon: Sparkles, bg: 'bg-purple-500/20 text-purple-300' }
      ]
    },
    {
      badge: 'Akses Mudah & Sinkronisasi Cloud',
      title: 'REKAP NILAI & AUDIT REAL-TIME',
      subtitle: 'Kemudahan guru dalam memantau progress pengerjaan, cetak rekapitulasi nilai kelas, serta ekspor data ke Excel & Supabase Cloud.',
      icon: Layers,
      iconColor: 'text-cyan-300',
      highlights: [
        { label: 'Multi-Login Siswa & Guru', desc: 'Satu portal terpadu untuk semua peran', icon: GraduationCap, bg: 'bg-blue-500/20 text-blue-300' },
        { label: 'Penyimpanan Supabase Cloud', desc: 'Data aman & tersinkronisasi cepat', icon: ShieldCheck, bg: 'bg-emerald-500/20 text-emerald-300' },
        { label: 'Cetak Rekap & Kisi-Kisi', desc: 'Siap cetak laporan resmi asesmen', icon: BookOpen, bg: 'bg-indigo-500/20 text-indigo-300' }
      ]
    }
  ];

  // Auto-play interval for slides (timbul tenggelam / smooth transition)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrevSlide = () => {
    setActiveSlide(prev => (prev - 1 + slides.length) % slides.length);
  };

  const handleNextSlide = () => {
    setActiveSlide(prev => (prev + 1) % slides.length);
  };

  const focusLoginForm = (targetRole?: UserRole) => {
    if (targetRole) {
      setRoleTab(targetRole);
    }
    if (usernameInputRef.current) {
      usernameInputRef.current.focus();
    }
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
    <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center p-3 sm:p-6 lg:p-10">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
        
        {/* Left Branding & Highlights Carousel (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-950 p-6 sm:p-8 lg:p-10 text-white flex flex-col justify-between relative overflow-hidden select-none">
          {/* Subtle ambient lighting */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>

          {/* Carousel Header & Slide Content */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-indigo-200 border border-white/15 shadow-2xs">
                {React.createElement(slides[activeSlide].icon, { className: `w-3.5 h-3.5 ${slides[activeSlide].iconColor}` })}
                <span>{slides[activeSlide].badge}</span>
              </div>

              {/* Prev / Next Arrows for manual sliding */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevSlide}
                  className="p-1.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-lg transition-all cursor-pointer backdrop-blur-xs border border-white/10"
                  title="Geser Kiri (Sebelumnya)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextSlide}
                  className="p-1.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-lg transition-all cursor-pointer backdrop-blur-xs border border-white/10"
                  title="Geser Kanan (Berikutnya)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-2xl shadow-lg border border-white/30">
                <img
                  src="https://iili.io/KDFk4fI.png"
                  alt="Logo"
                  className="h-9 sm:h-11 w-auto object-contain"
                />
              </div>
            </div>

            {/* Dynamic Animated Active Slide View */}
            <div key={activeSlide} className="animate-in fade-in slide-in-from-right duration-300">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white mb-2 leading-snug">
                {slides[activeSlide].title}
              </h1>
              <p className="text-xs sm:text-sm text-indigo-100/85 leading-relaxed min-h-[50px]">
                {slides[activeSlide].subtitle}
              </p>

              {/* Slide Highlights */}
              <div className="my-5 space-y-2.5">
                {slides[activeSlide].highlights.map((hl, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 text-xs text-indigo-100 font-medium bg-white/5 backdrop-blur-xs p-3 rounded-2xl border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <div className={`p-1.5 rounded-xl shrink-0 ${hl.bg}`}>
                      <hl.icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-bold block text-white">{hl.label}</span>
                      <span className="text-[11px] text-indigo-200/70 truncate block">{hl.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Button: Masuk Login */}
              <button
                type="button"
                onClick={() => focusLoginForm()}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:from-amber-500 active:to-amber-600 text-slate-950 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer group"
              >
                <span>Masuk Login Sekarang</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Carousel Footer Dots & Version */}
          <div className="pt-4 mt-6 border-t border-white/10 flex items-center justify-between relative z-10 text-[11px] text-indigo-200/70">
            {/* Slide Navigation Dots */}
            <div className="flex items-center gap-1.5">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveSlide(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    activeSlide === idx ? 'w-6 bg-amber-400' : 'w-2 bg-white/30 hover:bg-white/60'
                  }`}
                  title={`Ke Slide ${idx + 1}`}
                />
              ))}
            </div>

            <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-[10px]">CBT Pro v2.4</span>
          </div>
        </div>

        {/* Right Form & Quick Access (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-slate-50/50">
          <div className="max-w-md mx-auto w-full">
            
            <div className="mb-6 text-left">
              <span className="inline-block text-xs font-extrabold text-indigo-600 uppercase tracking-wider mb-1">
                Portal Autentikasi
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Selamat Datang di Portal
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Silakan pilih peran dan masukkan kredensial akun Anda untuk masuk.
              </p>
            </div>

            {/* Role Switcher Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-200/70 rounded-2xl mb-6 shadow-inner">
              <button
                type="button"
                onClick={() => handleRoleTabChange('siswa')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  roleTab === 'siswa'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Siswa</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleTabChange('guru')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  roleTab === 'guru'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Guru</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleTabChange('admin')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  roleTab === 'admin'
                    ? 'bg-white text-rose-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin</span>
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 mb-5 text-xs font-semibold text-rose-900 bg-rose-50 border border-rose-200 rounded-2xl animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Username / NIS / Nama
                </label>
                <div className="relative">
                  <input
                    ref={usernameInputRef}
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
                    className="w-full pl-10 pr-3.5 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs transition-all outline-none disabled:opacity-60 font-medium"
                  />
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
                {roleTab === 'siswa' && (
                  <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1 font-medium">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>Bisa masuk memakai Username, NIS, atau Nama lengkap siswa</span>
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? 'Sembunyikan' : 'Lihat'}</span>
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
                    className="w-full pl-10 pr-3.5 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs transition-all outline-none disabled:opacity-60 font-medium"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 py-3.5 px-4 flex items-center justify-center gap-2 text-sm font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-600/25 transition-all cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi Akun...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
};

