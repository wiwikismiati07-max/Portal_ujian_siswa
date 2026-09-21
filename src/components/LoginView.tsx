import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole } from '../types';
import { getAllUsers, saveUsers } from '../utils/storage';
import { INITIAL_USERS } from '../data/initialData';
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
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
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

  // Direct 1-Click Login to Page 2 (Portal Dashboard)
  const handleDirectOneClickLogin = (targetRole?: UserRole) => {
    setError(null);
    setIsLoading(true);
    const roleToUse = targetRole || roleTab || 'siswa';

    const allUsers = getAllUsers();
    let targetUser: User | undefined = allUsers.find(u => u.role === roleToUse);

    if (!targetUser) {
      if (roleToUse === 'admin') {
        targetUser = INITIAL_USERS.find(u => u.role === 'admin') || INITIAL_USERS[0];
      } else if (roleToUse === 'guru') {
        targetUser = INITIAL_USERS.find(u => u.role === 'guru') || INITIAL_USERS[1];
      } else {
        targetUser = INITIAL_USERS.find(u => u.role === 'siswa') || INITIAL_USERS[2];
      }
    }

    const finalUser: User = targetUser || INITIAL_USERS[0];

    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(finalUser);
    }, 150);
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

    // 1-Click Fallback: If credentials are not entered, seamlessly log in to Halaman 2
    if (!cleanUser || !inputPass) {
      handleDirectOneClickLogin(roleTab);
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
    <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center p-3 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        
        {/* LATAR 1 / LAYER 1: Left Branding & Highlights Carousel (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-100/90 via-indigo-50 to-white p-6 sm:p-8 lg:p-9 text-slate-800 flex flex-col justify-between relative overflow-hidden select-none rounded-3xl shadow-lg border border-indigo-200/90 ring-1 ring-indigo-100">
          {/* Subtle ambient lighting */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-blue-200/40 rounded-full blur-3xl pointer-events-none"></div>

          {/* Carousel Header & Slide Content */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 backdrop-blur-md rounded-full text-xs font-bold text-indigo-900 border border-indigo-200 shadow-2xs">
                {React.createElement(slides[activeSlide].icon, { className: `w-3.5 h-3.5 ${slides[activeSlide].iconColor}` })}
                <span>{slides[activeSlide].badge}</span>
              </div>

              {/* Prev / Next Arrows for manual sliding */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevSlide}
                  className="p-1.5 bg-white/80 hover:bg-white text-slate-700 rounded-lg transition-all cursor-pointer backdrop-blur-xs border border-indigo-200 shadow-2xs"
                  title="Geser Kiri (Sebelumnya)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextSlide}
                  className="p-1.5 bg-white/80 hover:bg-white text-slate-700 rounded-lg transition-all cursor-pointer backdrop-blur-xs border border-indigo-200 shadow-2xs"
                  title="Geser Kanan (Berikutnya)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-2xl shadow-md border border-slate-200">
                <img
                  src="https://iili.io/KDFk4fI.png"
                  alt="Logo"
                  className="h-9 sm:h-11 w-auto object-contain"
                />
              </div>
            </div>

            {/* Dynamic Animated Active Slide View */}
            <div key={activeSlide} className="animate-in fade-in slide-in-from-right duration-300">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 mb-2 leading-snug">
                {slides[activeSlide].title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed min-h-[48px]">
                {slides[activeSlide].subtitle}
              </p>

              {/* Slide Highlights */}
              <div className="my-4 space-y-2.5">
                {slides[activeSlide].highlights.map((hl, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 text-xs text-slate-800 font-medium bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-indigo-100 hover:bg-white transition-all shadow-2xs"
                  >
                    <div className={`p-1.5 rounded-xl shrink-0 ${hl.bg}`}>
                      <hl.icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-bold block text-slate-900">{hl.label}</span>
                      <span className="text-[11px] text-slate-500 truncate block">{hl.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Carousel Footer Dots & Version */}
          <div className="pt-4 mt-5 border-t border-indigo-200/80 flex items-center justify-between relative z-10 text-[11px] text-slate-500">
            {/* Slide Navigation Dots */}
            <div className="flex items-center gap-1.5">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveSlide(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    activeSlide === idx ? 'w-6 bg-indigo-600' : 'w-2 bg-indigo-200 hover:bg-indigo-400'
                  }`}
                  title={`Ke Slide ${idx + 1}`}
                />
              ))}
            </div>

            <span className="font-mono bg-white/80 border border-indigo-200 px-2 py-0.5 rounded text-[10px] text-indigo-900 font-bold">CBT Pro v2.4</span>
          </div>
        </div>

        {/* LATAR 2 / LAYER 2: Right Form & Quick Access (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center bg-white rounded-3xl shadow-xl border border-slate-200/80">
          <div className="max-w-md mx-auto w-full">
            
            {!selectedRole ? (
              /* STEP 1: Smooth Role Selection Cards (Username & Password hidden upfront) */
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="text-left">
                  <span className="inline-block text-xs font-extrabold text-indigo-600 uppercase tracking-wider mb-1">
                    Portal Autentikasi SPANJU
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    Selamat Datang di Portal
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Silakan pilih peran akun Anda di bawah ini untuk menampilkan formulir login:
                  </p>
                </div>

                {/* 3 Interactive Role Cards */}
                <div className="space-y-3 pt-1">
                  {/* Siswa Card */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('siswa');
                      setRoleTab('siswa');
                      setError(null);
                      setTimeout(() => usernameInputRef.current?.focus(), 100);
                    }}
                    className="w-full text-left p-4 rounded-2xl border-2 border-indigo-100 hover:border-indigo-500 bg-gradient-to-r from-indigo-50/60 to-white hover:from-indigo-50 hover:to-indigo-100/50 shadow-sm hover:shadow-md transition-all group cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-md group-hover:scale-110 transition-transform shrink-0">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-700">
                            Siswa
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                            Peserta Ujian
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          Jadwal Ujian, Mata Pelajaran & Pengerjaan Soal AKM
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-indigo-400 group-hover:text-indigo-700 group-hover:translate-x-1 transition-all shrink-0" />
                  </button>

                  {/* Guru Card */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('guru');
                      setRoleTab('guru');
                      setError(null);
                      setTimeout(() => usernameInputRef.current?.focus(), 100);
                    }}
                    className="w-full text-left p-4 rounded-2xl border-2 border-emerald-100 hover:border-emerald-500 bg-gradient-to-r from-emerald-50/60 to-white hover:from-emerald-50 hover:to-emerald-100/50 shadow-sm hover:shadow-md transition-all group cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-md group-hover:scale-110 transition-transform shrink-0">
                        <UserCheck className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900 group-hover:text-emerald-700">
                            Guru
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                            Bank Soal & Nilai
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          Input Data Soal, Kunci Jawaban & Rekapitulasi Nilai
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-emerald-400 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all shrink-0" />
                  </button>

                  {/* Admin Card */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('admin');
                      setRoleTab('admin');
                      setError(null);
                      setTimeout(() => usernameInputRef.current?.focus(), 100);
                    }}
                    className="w-full text-left p-4 rounded-2xl border-2 border-rose-100 hover:border-rose-500 bg-gradient-to-r from-rose-50/60 to-white hover:from-rose-50 hover:to-rose-100/50 shadow-sm hover:shadow-md transition-all group cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="p-3 bg-rose-600 text-white rounded-xl shadow-md group-hover:scale-110 transition-transform shrink-0">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900 group-hover:text-rose-700">
                            Operator / Admin
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                            Kelola Sistem
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          Kelola Akun Siswa, Guru & Pengaturan Server CBT
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-rose-400 group-hover:text-rose-700 group-hover:translate-x-1 transition-all shrink-0" />
                  </button>
                </div>

                {/* Direct 1-Click Fast Access Option */}
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
                    Atau Masuk Langsung Tanpa Password (1-Klik Mode)
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleDirectOneClickLogin('siswa')}
                      className="py-2 px-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all text-center border border-indigo-200/60 cursor-pointer"
                    >
                      🚀 Demo Siswa
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDirectOneClickLogin('guru')}
                      className="py-2 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-all text-center border border-emerald-200/60 cursor-pointer"
                    >
                      🚀 Demo Guru
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDirectOneClickLogin('admin')}
                      className="py-2 px-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all text-center border border-rose-200/60 cursor-pointer"
                    >
                      🚀 Demo Admin
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* STEP 2: Smooth Login Form Screen (Revealed after role click) */
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-5">
                {/* Back to Role Selection Button */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole(null);
                    setError(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer group"
                >
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  <span>← Pilih Peran Lain</span>
                </button>

                <div className="text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full text-xs font-extrabold mb-2">
                    {roleTab === 'siswa' && <GraduationCap className="w-3.5 h-3.5" />}
                    {roleTab === 'guru' && <UserCheck className="w-3.5 h-3.5" />}
                    {roleTab === 'admin' && <ShieldCheck className="w-3.5 h-3.5" />}
                    <span>Sesi Login: {roleTab.toUpperCase()}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    Masukkan Kredensial
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Isi username / NIS dan password akun {roleTab} Anda.
                  </p>
                </div>

                {/* Role Switcher Tabs */}
                <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-200/70 rounded-2xl shadow-inner">
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
                  <div className="flex items-start gap-2.5 p-3.5 text-xs font-semibold text-rose-900 bg-rose-50 border border-rose-200 rounded-2xl animate-shake">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Login Form (Custom container with text-security to completely eliminate browser 'Simpan sandi' bubble) */}
                <div
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleLogin(e as any);
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Username / NIS / Nama
                    </label>
                    <div className="relative">
                      <input
                        ref={usernameInputRef}
                        type="text"
                        name="cbt_identity_field"
                        autoComplete="off"
                        data-lpignore="true"
                        data-1p-ignore="true"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder={
                          roleTab === 'siswa'
                            ? 'Contoh: abdul_hayyi atau NIS 9029'
                            : 'Masukkan username atau NIP'
                        }
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
                        type="text"
                        style={!showPassword ? { WebkitTextSecurity: 'disc' } as React.CSSProperties : undefined}
                        name="cbt_secret_field"
                        autoComplete="off"
                        data-lpignore="true"
                        data-1p-ignore="true"
                        autoCapitalize="off"
                        autoCorrect="off"
                        spellCheck={false}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Masukkan password"
                        disabled={isLoading}
                        className="w-full pl-10 pr-3.5 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs transition-all outline-none disabled:opacity-60 font-medium font-sans"
                      />
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogin}
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
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

