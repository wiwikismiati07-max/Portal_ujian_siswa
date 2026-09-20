import React, { useState, useEffect } from 'react';
import { User, Exam, Question, ExamSubmission } from './types';
import {
  initializeStorage,
  getCurrentUser,
  setCurrentUser,
  getQuestionsByExamId
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

export default function App() {
  const [currentUser, setLoggedInUser] = useState<User | null>(null);
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseStatus>(getSupabaseStatus().status);

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
    // If student is currently taking an exam, confirm before quitting
    if (activeExam) {
      if (!window.confirm('Peringatan: Ujian sedang berlangsung. Apakah Anda yakin ingin membatalkan dan keluar?')) {
        return;
      }
    }
    setLoggedInUser(null);
    setCurrentUser(null);
    setActiveExam(null);
  };

  const handleStartExam = (exam: Exam) => {
    const questions = getQuestionsByExamId(exam.id);
    if (questions.length === 0) {
      alert('Paket ujian ini belum memiliki butir soal. Silakan hubungi guru pengampu.');
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

  const handleUserUpdated = (updatedUser: User) => {
    setLoggedInUser(updatedUser);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Supabase Realtime Setup Notification Banner */}
      {!activeExam && (
        <SupabaseSyncBanner
          status={supabaseStatus}
          onOpenModal={() => setIsSupabaseModalOpen(true)}
        />
      )}

      {/* Universal Top Navbar */}
      <Navbar
        user={currentUser}
        onLogout={handleLogout}
        onOpenChangePassword={() => setIsChangePasswordOpen(true)}
        isExamLockActive={!!activeExam}
        supabaseStatus={supabaseStatus}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
      />

      {/* Main Content Area based on Authentication and Role */}
      <main className="flex-1 flex flex-col">
        {!currentUser ? (
          <LoginView onLoginSuccess={handleLoginSuccess} />
        ) : currentUser.role === 'siswa' ? (
          activeExam ? (
            <ExamWorksheet
              student={currentUser}
              exam={activeExam}
              questions={activeQuestions}
              onFinishExam={handleFinishExam}
              onExitToDashboard={handleExitExamWorksheet}
            />
          ) : (
            <StudentDashboard
              student={currentUser}
              onStartExam={handleStartExam}
            />
          )
        ) : currentUser.role === 'guru' ? (
          <TeacherDashboard teacher={currentUser} />
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

      {/* Footer (No print) */}
      {!activeExam && (
        <footer className="py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-400 no-print">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">PORTAL UJIAN SISWA</span>
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
  );
}
