import { User, Subject, Exam, Question, ExamSubmission, ViolationLog, AppLink } from '../types';
import { getMatchingData } from './matchingHelper';
import {
  INITIAL_USERS,
  INITIAL_SUBJECTS,
  INITIAL_EXAMS,
  INITIAL_QUESTIONS,
  INITIAL_SUBMISSIONS
} from '../data/initialData';
import {
  syncUserToSupabase,
  syncUsersBatchToSupabase,
  deleteUserFromSupabase,
  syncSubjectToSupabase,
  syncSubjectsBatchToSupabase,
  deleteSubjectFromSupabase,
  overwriteUsersByRoleInSupabase,
  overwriteSubjectsInSupabase,
  syncExamToSupabase,
  deleteExamFromSupabase,
  syncQuestionToSupabase,
  syncQuestionsBatchToSupabase,
  deleteQuestionFromSupabase,
  syncSubmissionToSupabase,
  deleteSubmissionFromSupabase,
  clearAllExamsInSupabase,
  notifyDataUpdated
} from './supabaseSync';
import {
  isExamDeleted,
  isQuestionDeleted,
  isSubmissionDeleted,
  markExamDeleted,
  markQuestionDeleted,
  markSubmissionDeleted
} from './tombstones';

export const INITIAL_APP_LINKS: AppLink[] = [
  {
    id: 'link_portal_utama',
    title: 'Portal CBT: Lembar Input Data Soal',
    url: 'internal:guru_bank_soal',
    category: 'Aplikasi Utama',
    iconName: 'GraduationCap',
    color: 'indigo',
    description: 'Klik 1 kali langsung menuju lembar input data kisi-kisi, bank soal, dan paket ujian',
    isInternal: true,
    badge: 'Input Data'
  },
  {
    id: 'link_guru_kelola_paket',
    title: 'Kelola Paket Ujian & Edit Data',
    url: 'internal:guru_kelola_paket',
    category: 'Fitur Guru',
    iconName: 'Layers',
    color: 'emerald',
    description: 'Lembar input kelola paket ujian, edit judul, jadwal upload rilis & durasi',
    isInternal: true,
    badge: 'Kelola Paket'
  },
  {
    id: 'link_guru_bank_soal',
    title: 'Lembar Input Bank Soal & Kunci Jawaban',
    url: 'internal:guru_bank_soal',
    category: 'Fitur Guru',
    iconName: 'BookOpen',
    color: 'amber',
    description: 'Input Data Soal AKM, Kunci Jawaban, Bobot & Matriks Kisi-Kisi Resmi',
    isInternal: true,
    badge: 'Bank Soal'
  },
  {
    id: 'link_guru_rekap_nilai',
    title: 'Rekapitulasi & Analisis Nilai Ujian',
    url: 'internal:guru_rekap_nilai',
    category: 'Fitur Guru',
    iconName: 'FileSpreadsheet',
    color: 'rose',
    description: 'Rekap Nilai Siswa, Analisis Ketuntasan KKM, Remedial, Pengayaan & Cetak Nilai',
    isInternal: true,
    badge: 'Rekap Nilai'
  },
  {
    id: 'link_guru_berita_acara',
    title: 'Berita Acara Kegiatan Ujian Siswa',
    url: 'internal:guru_berita_acara',
    category: 'Fitur Guru',
    iconName: 'FileText',
    color: 'purple',
    description: 'Berita Acara Resmi Asesmen CBT, Rekap Kehadiran, Catatan Insiden & TTD Digital',
    isInternal: true,
    badge: 'Berita Acara'
  },
  {
    id: 'link_siswa_jadwal',
    title: 'Ruang Ujian Siswa: Jadwal & Kerjakan Soal',
    url: 'internal:siswa_jadwal',
    category: 'Fitur Siswa',
    iconName: 'School',
    color: 'teal',
    description: 'Daftar Mata Pelajaran, Jadwal Ujian Aktif & Pengerjaan Soal AKM Siswa',
    isInternal: true,
    badge: 'Siswa'
  },
  {
    id: 'link_admin_system',
    title: 'Manajemen Akun & Pengaturan Sistem',
    url: 'internal:admin_management',
    category: 'Fitur Admin',
    iconName: 'ShieldCheck',
    color: 'blue',
    description: 'Manajemen Akun Siswa, Guru, Sinkronisasi Supabase & Konfigurasi CBT',
    isInternal: true,
    badge: 'Admin'
  }
];

const STORAGE_KEYS = {
  USERS: 'cbt_users_v2',
  CURRENT_USER: 'cbt_current_user_v2',
  SUBJECTS: 'cbt_subjects_v2',
  EXAMS: 'cbt_exams_v2',
  QUESTIONS: 'cbt_questions_v2',
  SUBMISSIONS: 'cbt_submissions_v2',
  APP_LINKS: 'cbt_app_links_v5'
};

// Safe storage access helper with memory cache fallback if localStorage fails
let memoryUsersCache: User[] | null = null;
let memorySubjectsCache: Subject[] | null = null;
let memoryExamsCache: Exam[] | null = null;
let memoryQuestionsCache: Question[] | null = null;
let memorySubmissionsCache: ExamSubmission[] | null = null;

export const getStored = <T>(key: string, defaultValue: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return defaultValue;
  }
};

export const setStored = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Local storage quota or write error on ${key} (using memory cache):`, err);
  }
};

// Initialize default data if empty
export const initializeStorage = (): void => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    setStored(STORAGE_KEYS.USERS, INITIAL_USERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUBJECTS)) {
    setStored(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
  }
  
  // Clean mock exams if any or default to empty
  const storedExams = getStored<Exam[]>(STORAGE_KEYS.EXAMS, []);
  const hasMockExams = storedExams.some(e =>
    e.id.startsWith('exam_inf_pts') ||
    e.id.startsWith('exam_ipa_pts') ||
    e.id.startsWith('exam_arb_pts')
  );
  if (!localStorage.getItem(STORAGE_KEYS.EXAMS) || hasMockExams) {
    setStored(STORAGE_KEYS.EXAMS, []);
    setStored(STORAGE_KEYS.QUESTIONS, []);
    setStored(STORAGE_KEYS.SUBMISSIONS, []);
    memoryExamsCache = [];
    memoryQuestionsCache = [];
    memorySubmissionsCache = [];
  }
};

// --- AUTH ---
export const getCurrentUser = (): User | null => {
  return getStored<User | null>(STORAGE_KEYS.CURRENT_USER, null);
};

export const setCurrentUser = (user: User | null): void => {
  setStored(STORAGE_KEYS.CURRENT_USER, user);
};

export const getAllUsers = (): User[] => {
  if (memoryUsersCache !== null) {
    return memoryUsersCache;
  }
  const stored = getStored<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  const clean = stored.filter(
    u =>
      u.id !== 'user_guru_1' &&
      u.username !== 'budi_guru' &&
      u.nipOrNis !== '198305142008011012' &&
      !u.name?.toLowerCase().includes('budi santoso, s.kom')
  );
  if (clean.length !== stored.length) {
    setStored(STORAGE_KEYS.USERS, clean);
    deleteUserFromSupabase('user_guru_1').catch(() => {});
  }
  memoryUsersCache = clean;
  return clean;
};

export const saveUsers = (users: User[], syncToDb = true): void => {
  memoryUsersCache = users;
  setStored(STORAGE_KEYS.USERS, users);
  if (syncToDb) {
    syncUsersBatchToSupabase(users).catch(() => {});
  }
  notifyDataUpdated();
};

export const updateUserCredentials = (
  userId: string,
  newUsername: string,
  newPassword?: string,
  newName?: string
): { success: boolean; message: string; updatedUser?: User } => {
  const users = getAllUsers();
  const existingIdx = users.findIndex(u => u.id === userId);
  if (existingIdx === -1) {
    return { success: false, message: 'Pengguna tidak ditemukan' };
  }

  // Check username uniqueness if changed
  const usernameTaken = users.some(
    u => u.id !== userId && u.username.toLowerCase() === newUsername.toLowerCase()
  );
  if (usernameTaken) {
    return { success: false, message: 'Username sudah digunakan oleh akun lain' };
  }

  const user = { ...users[existingIdx] };
  user.username = newUsername.trim();
  if (newPassword && newPassword.trim().length > 0) {
    user.password = newPassword.trim();
  }
  if (newName && newName.trim().length > 0) {
    user.name = newName.trim();
  }

  users[existingIdx] = user;
  saveUsers(users, true);

  // If current logged in user is the one updated, update session too
  const current = getCurrentUser();
  if (current && current.id === userId) {
    setCurrentUser(user);
  }

  return { success: true, message: 'Kredensial berhasil diperbarui!', updatedUser: user };
};

import {
  cleanAndDeduplicateUsers,
  mergeImportedUsers,
  DeduplicationResult,
  isSameTeacher
} from './userDeduplication';

export const deleteUser = async (userId: string): Promise<void> => {
  const currentUsers = getAllUsers();
  const userToDelete = currentUsers.find(u => u.id === userId);
  const users = currentUsers.filter(u => u.id !== userId);
  saveUsers(users, false);
  await deleteUserFromSupabase(userId);

  // If deleted user was a teacher (guru), clean up their exams and associated questions
  if (userToDelete && userToDelete.role === 'guru') {
    const allExams = getAllExams();
    const isExDeleted = (e: Exam) =>
      e.teacherId === userId ||
      (userToDelete.name && isSameTeacher({ id: e.teacherId, name: e.teacherName }, userToDelete));
    const examsToDelete = allExams.filter(isExDeleted);
    if (examsToDelete.length > 0) {
      const remainingExams = allExams.filter(e => !isExDeleted(e));
      saveExams(remainingExams, false);
      const deletedExamIds = new Set(examsToDelete.map(e => e.id));
      const remainingQuestions = getAllQuestions().filter(q => !deletedExamIds.has(q.examId));
      saveQuestions(remainingQuestions, false);
      for (const ex of examsToDelete) {
        deleteExamFromSupabase(ex.id).catch(() => {});
      }
    }
  }

  notifyDataUpdated();
};

// Direct Deduplicate Users across all records
export const deduplicateUsersDirect = async (): Promise<{
  success: boolean;
  duplicateCount: number;
  cleanedCount: number;
}> => {
  const currentUsers = getAllUsers();
  const { cleanedUsers, removedUserIds, duplicateCount } = cleanAndDeduplicateUsers(currentUsers);

  if (duplicateCount > 0) {
    saveUsers(cleanedUsers, false);

    // Delete duplicates from Supabase in background
    for (const id of removedUserIds) {
      deleteUserFromSupabase(id).catch(() => {});
    }
  }

  return {
    success: true,
    duplicateCount,
    cleanedCount: cleanedUsers.length
  };
};

// Flexible Import with User-Selected Mode ('merge_upsert' or 'replace_role')
export const importUsersWithModeDirect = async (
  role: 'siswa' | 'guru',
  newUsers: User[],
  mode: 'merge_upsert' | 'replace_role' = 'merge_upsert',
  onProgress?: (processed: number, total: number) => void
): Promise<{ success: boolean; count: number; error?: string }> => {
  const allUsers = getAllUsers();

  if (mode === 'replace_role') {
    return overwriteUsersByRoleDirect(role, newUsers, onProgress);
  }

  // mode === 'merge_upsert' (Tindih / Perbarui Data yang Sama & Tambah Baru)
  const { mergedUsers, usersToSync, deletedUserIds } = mergeImportedUsers(
    allUsers,
    newUsers,
    role,
    'merge_upsert'
  );

  memoryUsersCache = mergedUsers;
  setStored(STORAGE_KEYS.USERS, mergedUsers);
  notifyDataUpdated();

  // Delete any extraneous duplicates from Supabase if found
  for (const delId of deletedUserIds) {
    deleteUserFromSupabase(delId).catch(() => {});
  }

  // Upsert updated and new users to Supabase in chunks
  const res = await syncUsersBatchToSupabase(usersToSync, onProgress);

  // Refresh current session if needed
  const current = getCurrentUser();
  if (current && current.role === role) {
    const matched = mergedUsers.find(
      u => u.username.toLowerCase() === current.username.toLowerCase() || u.id === current.id
    );
    if (matched) {
      setCurrentUser(matched);
    }
  }

  notifyDataUpdated();
  return { success: res.success, count: usersToSync.length, error: res.error };
};

// Direct Overwrite Users with real-time Supabase save
export const overwriteUsersByRoleDirect = async (
  role: 'siswa' | 'guru',
  newUsers: User[],
  onProgress?: (processed: number, total: number) => void
): Promise<{ success: boolean; count: number; error?: string }> => {
  const { cleanedUsers: deduplicatedNew } = cleanAndDeduplicateUsers(newUsers);
  const allUsers = getAllUsers();
  const keptUsers = allUsers.filter(u => u.role !== role);
  const updatedAll = [...keptUsers, ...deduplicatedNew];

  memoryUsersCache = updatedAll;
  setStored(STORAGE_KEYS.USERS, updatedAll);
  notifyDataUpdated();

  // Overwrite directly in Supabase in chunks
  const res = await overwriteUsersByRoleInSupabase(role, deduplicatedNew, onProgress);

  // Refresh current session if needed
  const current = getCurrentUser();
  if (current && current.role === role) {
    const matched = deduplicatedNew.find(
      u => u.username.toLowerCase() === current.username.toLowerCase() || u.id === current.id
    );
    if (matched) {
      setCurrentUser(matched);
    }
  }

  notifyDataUpdated();
  return res;
};

// Legacy alias
export const overwriteUsersByRole = (
  role: 'siswa' | 'guru',
  newUsers: User[]
): void => {
  overwriteUsersByRoleDirect(role, newUsers);
};

// --- SUBJECTS ---
export const getAllSubjects = (): Subject[] => {
  if (memorySubjectsCache !== null) {
    return memorySubjectsCache;
  }
  const stored = getStored<Subject[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
  memorySubjectsCache = stored;
  return stored;
};

export const saveSubjects = (subjects: Subject[], syncToDb = true): void => {
  memorySubjectsCache = subjects;
  setStored(STORAGE_KEYS.SUBJECTS, subjects);
  if (syncToDb) {
    syncSubjectsBatchToSupabase(subjects).catch(() => {});
  }
  notifyDataUpdated();
};

export const addSubject = async (subject: Subject): Promise<void> => {
  const subjects = getAllSubjects();
  subjects.push(subject);
  saveSubjects(subjects, true);
};

export const deleteSubject = async (subjectId: string): Promise<void> => {
  const subjects = getAllSubjects().filter(s => s.id !== subjectId);
  saveSubjects(subjects, false);
  await deleteSubjectFromSupabase(subjectId);
};

export const overwriteSubjectsDirect = async (
  newSubjects: Subject[],
  onProgress?: (processed: number, total: number) => void
): Promise<{ success: boolean; count: number; error?: string }> => {
  memorySubjectsCache = newSubjects;
  setStored(STORAGE_KEYS.SUBJECTS, newSubjects);
  notifyDataUpdated();

  const res = await overwriteSubjectsInSupabase(newSubjects, onProgress);
  notifyDataUpdated();
  return res;
};

export const overwriteAllSubjects = (newSubjects: Subject[]): void => {
  overwriteSubjectsDirect(newSubjects);
};

// --- EXAMS ---
export const getAllExams = (): Exam[] => {
  if (memoryExamsCache !== null) {
    return memoryExamsCache.filter(e => !isExamDeleted(e.id));
  }
  const stored = getStored<Exam[]>(STORAGE_KEYS.EXAMS, []);
  const clean = stored.filter(e => !isExamDeleted(e.id));
  if (clean.length !== stored.length) {
    setStored(STORAGE_KEYS.EXAMS, clean);
  }
  memoryExamsCache = clean;
  return clean;
};

export const saveExams = (exams: Exam[], syncToDb = true): void => {
  const clean = exams.filter(e => !isExamDeleted(e.id));
  memoryExamsCache = clean;
  setStored(STORAGE_KEYS.EXAMS, clean);
  notifyDataUpdated();
};

export const addExam = async (exam: Exam): Promise<void> => {
  const exams = getAllExams();
  exams.unshift(exam);
  memoryExamsCache = exams;
  setStored(STORAGE_KEYS.EXAMS, exams);
  await syncExamToSupabase(exam);
  notifyDataUpdated();
};

export const updateExam = async (updated: Exam): Promise<void> => {
  const exams = getAllExams().map(e => (e.id === updated.id ? updated : e));
  memoryExamsCache = exams;
  setStored(STORAGE_KEYS.EXAMS, exams);
  await syncExamToSupabase(updated);
  notifyDataUpdated();
};

export const deleteExam = async (examId: string): Promise<void> => {
  const allQs = getAllQuestions().filter(q => q.examId === examId);
  const allSubs = getAllSubmissions().filter(s => s.examId === examId);
  const qIds = allQs.map(q => q.id);
  const sIds = allSubs.map(s => s.id);

  // 1. Mark exam and its child items permanently deleted in tombstone registry (local & Supabase)
  await markExamDeleted(examId, qIds, sIds);

  // 2. Filter local storage and memory caches immediately
  const exams = getAllExams().filter(e => e.id !== examId);
  memoryExamsCache = exams;
  setStored(STORAGE_KEYS.EXAMS, exams);
  
  const questions = getAllQuestions().filter(q => q.examId !== examId);
  memoryQuestionsCache = questions;
  setStored(STORAGE_KEYS.QUESTIONS, questions);

  const submissions = getAllSubmissions().filter(s => s.examId !== examId);
  memorySubmissionsCache = submissions;
  setStored(STORAGE_KEYS.SUBMISSIONS, submissions);

  notifyDataUpdated();

  // 3. Delete from Supabase in background / cloud
  await deleteExamFromSupabase(examId);
};

export interface CopyExamOptions {
  newTitle?: string;
  targetClasses?: string[];
  targetTeacherId?: string;
  targetTeacherName?: string;
  targetSubjectId?: string;
  targetSubjectName?: string;
  durationMinutes?: number;
  passingScore?: number;
  uploadDate?: string;
  instructions?: string;
}

export const copyExamWithQuestionsDirect = async (
  sourceExamId: string,
  optionsOrTitle?: CopyExamOptions | string,
  legacyTargetClasses?: string[]
): Promise<{ success: boolean; newExam?: Exam; copiedQuestionsCount: number; error?: string }> => {
  try {
    const allExams = getAllExams();
    const sourceExam = allExams.find(e => e.id === sourceExamId && !isExamDeleted(e.id));
    if (!sourceExam) {
      return { success: false, copiedQuestionsCount: 0, error: 'Paket ujian sumber tidak ditemukan' };
    }

    // Parse options
    const opts: CopyExamOptions = typeof optionsOrTitle === 'string'
      ? { newTitle: optionsOrTitle, targetClasses: legacyTargetClasses }
      : (optionsOrTitle || {});

    // Generate unique ID for the new exam
    const newExamId = `exam_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const finalTitle = (opts.newTitle && opts.newTitle.trim().length > 0)
      ? opts.newTitle.trim()
      : `${sourceExam.title} (Salinan)`;

    const finalTargetClasses = opts.targetClasses && opts.targetClasses.length > 0
      ? opts.targetClasses
      : [...sourceExam.targetClasses];

    const newExam: Exam = {
      ...sourceExam,
      id: newExamId,
      title: finalTitle,
      teacherId: opts.targetTeacherId || sourceExam.teacherId,
      teacherName: opts.targetTeacherName || sourceExam.teacherName,
      subjectId: opts.targetSubjectId || sourceExam.subjectId,
      subjectName: opts.targetSubjectName || sourceExam.subjectName,
      targetClasses: finalTargetClasses,
      durationMinutes: opts.durationMinutes !== undefined ? opts.durationMinutes : sourceExam.durationMinutes,
      passingScore: opts.passingScore !== undefined ? opts.passingScore : sourceExam.passingScore,
      instructions: opts.instructions !== undefined ? opts.instructions : sourceExam.instructions,
      createdAt: new Date().toISOString().split('T')[0],
      uploadDate: opts.uploadDate || sourceExam.uploadDate || new Date().toISOString()
    };

    // Find and clone all questions belonging to sourceExamId (excluding any deleted ones)
    const allQuestions = getAllQuestions();
    const rawSourceQuestions = allQuestions.filter(
      q => q.examId === sourceExamId && !isQuestionDeleted(q.id, q.examId)
    );

    // Deduplicate source questions by unique ID and content to prevent duplication
    const seenIds = new Set<string>();
    const seenPrompts = new Set<string>();
    const sourceQuestions: Question[] = [];
    for (const q of rawSourceQuestions) {
      const promptKey = `${q.type}_${q.prompt.trim()}`;
      if (seenIds.has(q.id) || seenPrompts.has(promptKey)) {
        continue;
      }
      seenIds.add(q.id);
      seenPrompts.add(promptKey);
      sourceQuestions.push(q);
    }

    const copiedQuestions: Question[] = sourceQuestions.map((q, idx) => ({
      ...q,
      id: `q_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
      examId: newExamId,
      options: q.options ? [...q.options] : undefined,
      optionImages: q.optionImages ? [...q.optionImages] : undefined,
      correctMulti: q.correctMulti ? [...q.correctMulti] : undefined,
      trueFalseItems: q.trueFalseItems
        ? q.trueFalseItems.map(tf => ({ ...tf, id: `tf_${Math.random().toString(36).substring(2, 7)}` }))
        : undefined,
      matchingPairs: q.matchingPairs ? [...q.matchingPairs] : undefined,
      matchingData: q.matchingData ? JSON.parse(JSON.stringify(q.matchingData)) : undefined,
      caseKeywords: q.caseKeywords ? [...q.caseKeywords] : undefined
    }));

    // Save locally
    const updatedExams = [newExam, ...allExams.filter(e => !isExamDeleted(e.id))];
    memoryExamsCache = updatedExams;
    setStored(STORAGE_KEYS.EXAMS, updatedExams);

    const updatedQuestions = [
      ...allQuestions.filter(q => !isQuestionDeleted(q.id, q.examId) && !copiedQuestions.some(cq => cq.id === q.id)),
      ...copiedQuestions
    ];
    memoryQuestionsCache = updatedQuestions;
    setStored(STORAGE_KEYS.QUESTIONS, updatedQuestions);

    notifyDataUpdated();

    // Sync to Supabase in background
    syncExamToSupabase(newExam).catch(err => console.warn('Supabase copy exam sync error:', err));
    if (copiedQuestions.length > 0) {
      syncQuestionsBatchToSupabase(copiedQuestions).catch(err =>
        console.warn('Supabase copy questions sync error:', err)
      );
    }

    return {
      success: true,
      newExam,
      copiedQuestionsCount: copiedQuestions.length
    };
  } catch (err: any) {
    return {
      success: false,
      copiedQuestionsCount: 0,
      error: err?.message || 'Gagal menyalin paket ujian'
    };
  }
};

export const clearAllExamsDirect = async (): Promise<{ success: boolean; error?: string }> => {
  memoryExamsCache = [];
  memoryQuestionsCache = [];
  memorySubmissionsCache = [];
  setStored(STORAGE_KEYS.EXAMS, []);
  setStored(STORAGE_KEYS.QUESTIONS, []);
  setStored(STORAGE_KEYS.SUBMISSIONS, []);
  notifyDataUpdated();
  return await clearAllExamsInSupabase();
};


// --- QUESTIONS ---
export const getAllQuestions = (): Question[] => {
  if (memoryQuestionsCache !== null) {
    return memoryQuestionsCache.filter(q => !isQuestionDeleted(q.id, q.examId) && !isExamDeleted(q.examId));
  }
  const stored = getStored<Question[]>(STORAGE_KEYS.QUESTIONS, []);
  const clean = stored.filter(q => !isQuestionDeleted(q.id, q.examId) && !isExamDeleted(q.examId));
  if (clean.length !== stored.length) {
    setStored(STORAGE_KEYS.QUESTIONS, clean);
  }
  memoryQuestionsCache = clean;
  return clean;
};

export const saveQuestions = (questions: Question[], syncToDb = true): void => {
  const clean = questions.filter(q => !isQuestionDeleted(q.id, q.examId) && !isExamDeleted(q.examId));
  memoryQuestionsCache = clean;
  setStored(STORAGE_KEYS.QUESTIONS, clean);
  notifyDataUpdated();
};

export const getQuestionsByExamId = (examId: string): Question[] => {
  return getAllQuestions().filter(q => q.examId === examId);
};

export const addQuestion = async (question: Question): Promise<{ success: boolean; error?: string }> => {
  const questions = getAllQuestions();
  questions.push(question);
  memoryQuestionsCache = questions;
  setStored(STORAGE_KEYS.QUESTIONS, questions);
  notifyDataUpdated();
  return await syncQuestionToSupabase(question);
};

export const updateQuestion = async (updated: Question): Promise<{ success: boolean; error?: string }> => {
  const questions = getAllQuestions().map(q => (q.id === updated.id ? updated : q));
  memoryQuestionsCache = questions;
  setStored(STORAGE_KEYS.QUESTIONS, questions);
  notifyDataUpdated();
  return await syncQuestionToSupabase(updated);
};

export const deleteQuestion = async (questionId: string): Promise<void> => {
  // 1. Mark question permanently deleted in tombstone registry (local & Supabase)
  await markQuestionDeleted(questionId);

  // 2. Remove from local caches and storage
  const questions = getAllQuestions().filter(q => q.id !== questionId);
  memoryQuestionsCache = questions;
  setStored(STORAGE_KEYS.QUESTIONS, questions);

  notifyDataUpdated();

  // 3. Delete from Supabase
  await deleteQuestionFromSupabase(questionId);
};

// --- SUBMISSIONS & REKAP ---
export const getAllSubmissions = (): ExamSubmission[] => {
  if (memorySubmissionsCache !== null) {
    return memorySubmissionsCache.filter(s => !isSubmissionDeleted(s.id, s.examId) && !isExamDeleted(s.examId));
  }
  const stored = getStored<ExamSubmission[]>(STORAGE_KEYS.SUBMISSIONS, []);
  const clean = stored.filter(s => !isSubmissionDeleted(s.id, s.examId) && !isExamDeleted(s.examId));
  if (clean.length !== stored.length) {
    setStored(STORAGE_KEYS.SUBMISSIONS, clean);
  }
  memorySubmissionsCache = clean;
  return clean;
};

export const saveSubmissions = (submissions: ExamSubmission[], syncToDb = true): void => {
  const clean = submissions.filter(s => !isSubmissionDeleted(s.id, s.examId) && !isExamDeleted(s.examId));
  memorySubmissionsCache = clean;
  setStored(STORAGE_KEYS.SUBMISSIONS, clean);
  notifyDataUpdated();
};

export const saveSingleSubmission = (submission: ExamSubmission): void => {
  const current = getAllSubmissions();
  const existingIndex = current.findIndex(
    s => s.id === submission.id || (s.examId === submission.examId && s.studentId === submission.studentId)
  );
  let updated: ExamSubmission[];
  if (existingIndex >= 0) {
    updated = [...current];
    updated[existingIndex] = submission;
  } else {
    updated = [submission, ...current];
  }
  saveSubmissions(updated, true);
  syncSubmissionToSupabase(submission).catch(() => {});
};

export const resetStudentSubmission = async (
  submissionId: string
): Promise<{ success: boolean; message: string }> => {
  const allSubs = getAllSubmissions();
  const targetSub = allSubs.find(s => s.id === submissionId);
  if (!targetSub) {
    return { success: false, message: 'Data pengerjaan siswa tidak ditemukan' };
  }

  // Record tombstone so sync never revives reset submission
  await markSubmissionDeleted(submissionId);

  const nextSubs = allSubs.filter(s => s.id !== submissionId);
  saveSubmissions(nextSubs, false);
  await deleteSubmissionFromSupabase(submissionId);
  notifyDataUpdated();

  return {
    success: true,
    message: `Hasil remedial siswa "${targetSub.studentName}" berhasil direset. Siswa kini dapat mengerjakan ujian ulang.`
  };
};

export const resetMultipleStudentSubmissions = async (
  submissionIds: string[]
): Promise<{ success: boolean; count: number; message: string }> => {
  if (submissionIds.length === 0) {
    return { success: true, count: 0, message: 'Tidak ada data remedial yang dipilih.' };
  }
  
  for (const id of submissionIds) {
    await markSubmissionDeleted(id);
  }

  const idSet = new Set(submissionIds);
  const allSubs = getAllSubmissions();
  const nextSubs = allSubs.filter(s => !idSet.has(s.id));
  saveSubmissions(nextSubs, false);

  for (const id of submissionIds) {
    deleteSubmissionFromSupabase(id).catch(() => {});
  }
  notifyDataUpdated();

  return {
    success: true,
    count: submissionIds.length,
    message: `${submissionIds.length} data pengerjaan remedial berhasil direset.`
  };
};

// Calculate automated grading for student submission
export const gradeSubmission = (
  exam: Exam,
  questions: Question[],
  student: User,
  studentAnswers: Record<string, any>,
  violationCount: number,
  startedAt: string,
  violationLogs: ViolationLog[] = []
): ExamSubmission => {
  let earnedScore = 0;
  let totalPossible = 0;
  const evaluatedAnswers: Record<
    string,
    { earned: number; max: number; isCorrect: boolean; feedback?: string }
  > = {};

  questions.forEach(q => {
    totalPossible += q.points;
    const answer = studentAnswers[q.id];
    let qEarned = 0;

    switch (q.type) {
      case 'single_choice':
      case 'case_study': {
        const isCorrect = typeof answer === 'number' && answer === q.correctSingle;
        if (isCorrect) qEarned = q.points;
        evaluatedAnswers[q.id] = {
          earned: qEarned,
          max: q.points,
          isCorrect,
          feedback: isCorrect ? 'Jawaban Benar' : 'Jawaban Kurang Tepat'
        };
        break;
      }

      case 'multiple_choice': {
        const correctList = q.correctMulti || [];
        const studentList: number[] = Array.isArray(answer) ? answer : [];
        if (correctList.length > 0) {
          const truePositives = studentList.filter(idx => correctList.includes(idx)).length;
          const falsePositives = studentList.filter(idx => !correctList.includes(idx)).length;
          const ratio = Math.max(0, (truePositives - falsePositives) / correctList.length);
          qEarned = Math.round(ratio * q.points);
          const isCorrect = ratio >= 0.99;
          evaluatedAnswers[q.id] = {
            earned: qEarned,
            max: q.points,
            isCorrect,
            feedback: isCorrect
              ? 'Jawaban Sempurna'
              : `Terjawab ${truePositives} dari ${correctList.length} opsi yang benar`
          };
        }
        break;
      }

      case 'true_false': {
        const items = q.trueFalseItems || [];
        if (items.length === 1) {
          const item = items[0];
          const studentVal = typeof answer === 'object' && answer !== null ? answer[item.id] : answer;
          const isItemCorrect = typeof studentVal === 'boolean' && studentVal === item.isCorrect;
          qEarned = isItemCorrect ? q.points : 0;
          evaluatedAnswers[q.id] = {
            earned: qEarned,
            max: q.points,
            isCorrect: isItemCorrect,
            feedback: isItemCorrect ? 'Jawaban Benar' : 'Jawaban Salah'
          };
        } else if (items.length > 0 && answer && typeof answer === 'object') {
          let correctCount = 0;
          items.forEach(item => {
            if (answer[item.id] === item.isCorrect) {
              correctCount++;
            }
          });
          const ratio = correctCount / items.length;
          qEarned = Math.round(ratio * q.points);
          evaluatedAnswers[q.id] = {
            earned: qEarned,
            max: q.points,
            isCorrect: correctCount === items.length,
            feedback: `${correctCount} dari ${items.length} pernyataan tepat`
          };
        }
        break;
      }

      case 'matching': {
        const matchingData = getMatchingData(q);
        const matchAns = (answer && typeof answer === 'object') ? answer : {};
        let matchedCount = 0;
        matchingData.premises.forEach(premise => {
          if (matchAns[premise.id] === premise.correctOptionId) {
            matchedCount++;
          }
        });
        const totalPremises = matchingData.premises.length;
        if (totalPremises > 0) {
          const ratio = matchedCount / totalPremises;
          qEarned = Math.round(ratio * q.points);
          evaluatedAnswers[q.id] = {
            earned: qEarned,
            max: q.points,
            isCorrect: matchedCount === totalPremises,
            feedback: `${matchedCount} dari ${totalPremises} pasangan cocok`
          };
        }
        break;
      }


    }

    earnedScore += qEarned;
  });

  const percentage = totalPossible > 0 ? Math.round((earnedScore / totalPossible) * 100) : 0;
  const passed = percentage >= exam.passingScore;

  const submission: ExamSubmission = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    examId: exam.id,
    examTitle: exam.title,
    subjectName: exam.subjectName,
    studentId: student.id,
    studentName: student.name,
    studentClass: student.classGroup || 'Umum',
    studentNipOrNis: student.nipOrNis || undefined,
    answers: studentAnswers,
    earnedScore,
    totalScore: totalPossible,
    percentage,
    passed,
    violationCount,
    violationLogs: [...violationLogs],
    startedAt: startedAt || new Date().toISOString(),
    submittedAt: new Date().toISOString(),
    evaluatedAnswers
  };

  saveSingleSubmission(submission);
  return submission;
};

// Reset system data to default initial state
export const resetToInitialData = (): void => {
  memoryUsersCache = INITIAL_USERS;
  memorySubjectsCache = INITIAL_SUBJECTS;
  memoryExamsCache = INITIAL_EXAMS;
  memoryQuestionsCache = INITIAL_QUESTIONS;
  memorySubmissionsCache = INITIAL_SUBMISSIONS;

  setStored(STORAGE_KEYS.USERS, INITIAL_USERS);
  setStored(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
  setStored(STORAGE_KEYS.EXAMS, INITIAL_EXAMS);
  setStored(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
  setStored(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
  setStored(STORAGE_KEYS.APP_LINKS, INITIAL_APP_LINKS);
  notifyDataUpdated();
};

// ================= APP LINKS MANAGEMENT =================
let memoryAppLinksCache: AppLink[] | null = null;

export const getAllAppLinks = (): AppLink[] => {
  if (memoryAppLinksCache) return memoryAppLinksCache;
  const stored = getStored<AppLink[]>(STORAGE_KEYS.APP_LINKS, []);
  if (stored.length === 0) {
    setStored(STORAGE_KEYS.APP_LINKS, INITIAL_APP_LINKS);
    memoryAppLinksCache = INITIAL_APP_LINKS;
    return INITIAL_APP_LINKS;
  }

  // Ensure default core links like Berita Acara are present
  const hasBeritaAcara = stored.some(l => l.id === 'link_guru_berita_acara' || l.url === 'internal:guru_berita_acara');
  let finalLinks = stored;
  if (!hasBeritaAcara) {
    const beritaLink = INITIAL_APP_LINKS.find(l => l.id === 'link_guru_berita_acara');
    if (beritaLink) {
      const rekapIdx = stored.findIndex(l => l.id === 'link_guru_rekap_nilai');
      if (rekapIdx !== -1) {
        finalLinks = [...stored.slice(0, rekapIdx + 1), beritaLink, ...stored.slice(rekapIdx + 1)];
      } else {
        finalLinks = [...stored, beritaLink];
      }
      setStored(STORAGE_KEYS.APP_LINKS, finalLinks);
    }
  }

  memoryAppLinksCache = finalLinks;
  return finalLinks;
};

export const saveAllAppLinks = (links: AppLink[]): void => {
  memoryAppLinksCache = links;
  setStored(STORAGE_KEYS.APP_LINKS, links);
  window.dispatchEvent(new CustomEvent('cbt_app_links_update'));
};

export const addAppLink = (linkData: Omit<AppLink, 'id'>): AppLink => {
  const current = getAllAppLinks();
  const newLink: AppLink = {
    ...linkData,
    id: `link_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
  };
  const updated = [newLink, ...current];
  saveAllAppLinks(updated);
  return newLink;
};

export const updateAppLink = (updatedLink: AppLink): void => {
  const current = getAllAppLinks();
  const updated = current.map(l => l.id === updatedLink.id ? updatedLink : l);
  saveAllAppLinks(updated);
};

export const deleteAppLink = (id: string): void => {
  const current = getAllAppLinks();
  const updated = current.filter(l => l.id !== id);
  saveAllAppLinks(updated);
};

export const resetAppLinksToDefault = (): AppLink[] => {
  saveAllAppLinks(INITIAL_APP_LINKS);
  return INITIAL_APP_LINKS;
};

export const exportAppLinksJSON = (): void => {
  const links = getAllAppLinks();
  const jsonStr = JSON.stringify(links, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup_link_dashboard_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importAppLinksJSON = (jsonString: string): AppLink[] => {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      throw new Error('Format file backup tidak valid. Harus berupa array JSON.');
    }
    const validated: AppLink[] = parsed.map((item: any, idx: number) => ({
      id: item.id || `imported_link_${Date.now()}_${idx}`,
      title: item.title || 'Aplikasi Tanpa Judul',
      url: item.url || 'https://google.com',
      category: item.category || 'Umum',
      iconName: item.iconName || 'Globe',
      color: item.color || 'indigo',
      description: item.description || '',
      isInternal: item.isInternal ?? (item.url?.startsWith('internal:') || false),
      badge: item.badge
    }));
    saveAllAppLinks(validated);
    return validated;
  } catch (err: any) {
    console.error('Failed to import app links:', err);
    throw new Error(err.message || 'Gagal membaca file JSON backup.');
  }
};
