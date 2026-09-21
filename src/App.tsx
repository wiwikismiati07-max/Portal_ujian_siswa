import React, { useState, useEffect } from 'react';
import { User, Exam, Question, ExamSubmission } from './types';
import {
  initializeStorage,
  getCurrentUser,
  setCurrentUser,
  getQuestionsByExamId,
  getAllUsers
} from './utils/storage';
import {
  initSupabaseSync,
  onSupabaseStatusChange,
  getSupabaseStatus,
  SupabaseStatus
} from './utils/supabaseSync';
import { Navbar } from './components/Navbar';
import { LoginView } from './components/LoginView';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { StudentDashboard } from './components/student/StudentDashboard';
import { ExamWorksheet } from './components/student/ExamWorksheet';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SupabaseModal } from './components/SupabaseModal';
import { SupabaseSyncBanner } from './components/SupabaseSyncBanner';
import { ConfirmModal } from './components/ConfirmModal';
import { Dashboard3DLauncher } from './components/Dashboard3DLauncher';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [currentUser, setLoggedInUser] = useState<User | null>(null);
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseStatus>(getSupabaseStatus().status);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [appAlert, setAppAlert] = useState<string | null>(null);

  // Initialize dataset & Supabase sync on mount
  useEffect(() => {
    initializeStorage();
    const stored = getCurrentUser();
    if (stored) {
      setLoggedInUser(stored);
    }

    // Subscribe to Supabase connection status
    const unsubscribeStatus = onSupabaseStatusChange(status => {
      setSupabaseStatus(status);
    });

    // Initialize cloud sync asynchronously
    initSupabaseSync();

    // Listen to local & realtime cross-user storage updates
    const handleStorageUpdate = () => {
      const u = getCurrentUser();
      if (u) {
        setLoggedInUser(prev => (prev?.id === u.id ? { ...u } : prev));
      }
    };
    window.addEventListener('cbt_storage_update', handleStorageUpdate);

    return () => {
      unsubscribeStatus();
      window.removeEventListener('cbt_storage_update', handleStorageUpdate);
    };
  }, []);

  const handleLoginSuccess = (user: User) => {
    setLoggedInUser(user);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    if (activeExam) {
      setIsLogoutConfirmOpen(true);
      return;
    }
    executeLogout();
  };

  const executeLogout = () => {
    setLoggedInUser(null);
    setCurrentUser(null);
    setActiveExam(null);
    setIsLogoutConfirmOpen(false);
  };

  const handleStartExam = (exam: Exam) => {
    const questions = getQuestionsByExamId(exam.id);
    if (questions.length === 0) {
      setAppAlert('Paket ujian ini belum memiliki butir soal. Silakan hubungi guru pengampu.');
      setTimeout(() => setAppAlert(null), 5000);
      return;
    }
    setActiveQuestions(questions);
    setActiveExam(exam);
  };

  const handleFinishExam = (submission: ExamSubmission) => {
    // The worksheet will show summary results first; when student clicks exit, it resets activeExam
  };

  const handleExitExamWorksheet = () => {
    setActiveExam(null);
    setActiveQuestions([]);
  };

  const [teacherInitialTab, setTeacherInitialTab] = useState<'bank_soal' | 'rekap' | 'paket_ujian' | 'berita_acara'>('bank_soal');

  const handleSelectInternalRoute = (route: string) => {
    const allUsers = getAllUsers();
    if (route === 'internal:siswa_jadwal') {
      if (currentUser?.role === 'siswa') {
        setActiveExam(null);
      } else {
        const studentUser = allUsers.find(u => u.role === 'siswa') || {
          id: 'user_siswa_1',
          username: 'ahmad_siswa',
          password: 'siswa123',
          name: 'Ahmad Fauzi Ramadhan',
          role: 'siswa',
          nipOrNis: '20241001',
          classGroup: 'X-IPA-1'
        };
        setLoggedInUser(studentUser as User);
        setCurrentUser(studentUser as User);
        setActiveExam(null);
      }
    } else if (route === 'internal:guru_kelola_paket') {
      setTeacherInitialTab('paket_ujian');
      if (currentUser?.role !== 'guru') {
        const teacherUser = allUsers.find(u => u.role === 'guru') || {
          id: 'user_guru_2',
          username: 'siti_guru',
          password: 'guru123',
          name: 'Siti Rahmawati, S.Pd., M.Si.',
          role: 'guru',
          subjectName: 'Ilmu Pengetahuan Alam (IPA)'
        };
        setLoggedInUser(teacherUser as User);
        setCurrentUser(teacherUser as User);
      }
      setActiveExam(null);
    } else if (route === 'internal:guru_bank_soal' || route === 'internal:portal' || route === 'internal:input_data') {
      setTeacherInitialTab('bank_soal');
      if (currentUser?.role !== 'guru') {
        const teacherUser = allUsers.find(u => u.role === 'guru') || {
          id: 'user_guru_2',
          username: 'siti_guru',
          password: 'guru123',
          name: 'Siti Rahmawati, S.Pd., M.Si.',
          role: 'guru',
          subjectName: 'Ilmu Pengetahuan Alam (IPA)'
        };
        setLoggedInUser(teacherUser as User);
        setCurrentUser(teacherUser as User);
      }
      setActiveExam(null);
    } else if (route === 'internal:guru_rekap_nilai') {
      setTeacherInitialTab('rekap');
      if (currentUser?.role !== 'guru') {
        const teacherUser = allUsers.find(u => u.role === 'guru') || {
          id: 'user_guru_2',
          username: 'siti_guru',
          password: 'guru123',
          name: 'Siti Rahmawati, S.Pd., M.Si.',
          role: 'guru',
          subjectName: 'Ilmu Pengetahuan Alam (IPA)'
        };
        setLoggedInUser(teacherUser as User);
        setCurrentUser(teacherUser as User);
      }
      setActiveExam(null);
    } else if (route === 'internal:guru_berita_acara') {
      setTeacherInitialTab('berita_acara');
      if (currentUser?.role !== 'guru') {
        const teacherUser = allUsers.find(u => u.role === 'guru') || {
          id: 'user_guru_2',
          username: 'siti_guru',
          password: 'guru123',
          name: 'Siti Rahmawati, S.Pd., M.Si.',
          role: 'guru',
          subjectName: 'Ilmu Pengetahuan Alam (IPA)'
        };
        setLoggedInUser(teacherUser as User);
        setCurrentUser(teacherUser as User);
      }
      setActiveExam(null);
    } else if (route === 'internal:admin_management') {
      if (currentUser?.role !== 'admin') {
        const adminUser = allUsers.find(u => u.role === 'admin') || {
          id: 'user_admin_1',
          username: 'admin',
          password: 'admin123',
          name: 'Administrator CBT',
          role: 'admin'
        };
        setLoggedInUser(adminUser as User);
        setCurrentUser(adminUser as User);
      }
      setActiveExam(null);
    }
  };

  const handleUserUpdated = (updatedUser: User) => {
    setLoggedInUser(updatedUser);
  };

  // 1. PRIORITAS UTAMA: LEMBAR UJIAN SISWA AKTIF (EXAM WORKSHEET)
  // Langsung render 100% Layar Penuh Fokus tanpa sidebar, tanpa header launcher, tanpa gangguan
  if (activeExam && currentUser) {
    return (
      <div className="min-h-screen w-full bg-slate-100 text-slate-800 flex flex-col selection:bg-indigo-500 selection:text-white">
        <ExamWorksheet
          student={currentUser}
          exam={activeExam}
          questions={activeQuestions}
          onFinishExam={handleFinishExam}
          onExitToDashboard={handleExitExamWorksheet}
        />
      </div>
    );
  }

  // 2. DASHBOARD & PORTAL APLIKASI CBT DENGAN FILTER ROLE OTOMATIS
  // - Guru: Hanya Menu Guru & Menu Utama
  // - Siswa: Hanya Menu Siswa
  // - Admin: Tampilkan Semua Menu
  return (
    <Dashboard3DLauncher
      currentUser={currentUser}
      onSelectInternalRoute={handleSelectInternalRoute}
      isExamActive={false}
    >
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-indigo-500 selection:text-white">
        {/* Supabase Realtime Setup Notification Banner */}
        {!activeExam && (
          <SupabaseSyncBanner
            status={supabaseStatus}
            onOpenModal={() => setIsSupabaseModalOpen(true)}
          />
        )}

        {/* Universal Top Navbar (Hidden completely during active exam to lock screen) */}
        {!activeExam && (
          <Navbar
            user={currentUser}
            onLogout={handleLogout}
            onOpenChangePassword={() => setIsChangePasswordOpen(true)}
            isExamLockActive={false}
            supabaseStatus={supabaseStatus}
            onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          />
        )}

        {/* Main Content Area based on Authentication and Role */}
        <main className="flex-1 flex flex-col">
          {!currentUser ? (
            <LoginView onLoginSuccess={handleLoginSuccess} />
          ) : currentUser.role === 'siswa' ? (
            <StudentDashboard
              student={currentUser}
              onStartExam={handleStartExam}
            />
          ) : currentUser.role === 'guru' ? (
            <TeacherDashboard teacher={currentUser} initialTab={teacherInitialTab} />
          ) : (
            <AdminDashboard admin={currentUser} />
          )}
        </main>

        {/* Change Password / Username Modal */}
        {currentUser && (
          <ChangePasswordModal
            user={currentUser}
            isOpen={isChangePasswordOpen}
            onClose={() => setIsChangePasswordOpen(false)}
            onUpdated={handleUserUpdated}
          />
        )}

        {/* Supabase Cloud Connection & SQL Setup Modal */}
        <SupabaseModal
          isOpen={isSupabaseModalOpen}
          onClose={() => setIsSupabaseModalOpen(false)}
        />

        {/* Logout Confirmation Modal while Exam is active */}
        <ConfirmModal
          isOpen={isLogoutConfirmOpen}
          title="Batalkan & Keluar Ujian?"
          message="Peringatan: Sesi ujian sedang berlangsung. Jika Anda keluar sekarang, jawaban yang belum disimpan akan hilang dan Anda harus login kembali."
          confirmLabel="Ya, Keluar Ujian"
          isDanger={true}
          onConfirm={executeLogout}
          onCancel={() => setIsLogoutConfirmOpen(false)}
        />

        {/* Floating Notice Banner */}
        {appAlert && (
          <div className="fixed top-20 right-4 sm:right-8 z-50 animate-in fade-in slide-in-from-top duration-200">
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-amber-900 text-white border border-amber-700 shadow-xl shadow-amber-950/20 text-xs sm:text-sm font-semibold max-w-md">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <span className="flex-1">{appAlert}</span>
              <button
                type="button"
                onClick={() => setAppAlert(null)}
                className="p-1 text-white/70 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Footer (No print) */}
        {!activeExam && (
          <footer className="py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-400 no-print">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">PORTAL UJIAN SISWA SPANJU</span>
                <span>•</span>
                <span>Sistem Computer-Based Test (CBT) Terintegrasi</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Mendukung Soal AKM, Kurikulum Merdeka, & Pilihan Ganda Kompleks
              </div>
            </div>
          </footer>
        )}
      </div>
    </Dashboard3DLauncher>
  );
}
