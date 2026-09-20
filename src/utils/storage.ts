import { User, Subject, Exam, Question, ExamSubmission, ViolationLog, AppLink } from '../types';
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
  deleteQuestionFromSupabase,
  syncSubmissionToSupabase,
  clearAllExamsInSupabase,
  notifyDataUpdated
} from './supabaseSync';

export const INITIAL_APP_LINKS: AppLink[] = [
  {
    id: 'link_portal_utama',
    title: 'Portal Utama SPANJU CBT',
    url: 'internal:portal',
    category: 'Aplikasi Utama',
    iconName: 'GraduationCap',
    color: 'indigo',
    description: 'Halaman Utama Portal SPANJU CBT & Akses Multi-Role',
    isInternal: true,
    badge: 'Utama'
  },
  {
    id: 'link_siswa_jadwal',
    title: 'Fitur Siswa: Mata Pelajaran & Jadwal Ujian',
    url: 'internal:siswa_jadwal',
    category: 'Fitur Siswa',
    iconName: 'School',
    color: 'emerald',
    description: 'Daftar Mata Pelajaran, Jadwal Ujian Aktif & Pengerjaan Soal AKM',
    isInternal: true,
    badge: 'Siswa'
  },
  {
    id: 'link_guru_bank_soal',
    title: 'Fitur Guru: Bank Soal & Kunci Jawaban',
    url: 'internal:guru_bank_soal',
    category: 'Fitur Guru',
    iconName: 'BookOpen',
    color: 'amber',
    description: 'Input Data Soal AKM, Kunci Jawaban, Bobot & Manajemen Ujian',
    isInternal: true,
    badge: 'Bank Soal'
  },
  {
    id: 'link_guru_rekap_nilai',
    title: 'Fitur Guru: Rekapitulasi Hasil Nilai Ujian',
    url: 'internal:guru_rekap_nilai',
    category: 'Fitur Guru',
    iconName: 'FileSpreadsheet',
    color: 'rose',
    description: 'Rekap Nilai Siswa, Filter Per Kelas, Ekspor Excel & Cetak Hasil',
    isInternal: true,
    badge: 'Nilai'
  },
  {
    id: 'link_admin_system',
    title: 'Fitur Admin: Kelola Akun & Jadwal',
    url: 'internal:admin_management',
    category: 'Fitur Admin',
    iconName: 'ShieldCheck',
    color: 'blue',
    description: 'Manajemen Akun Siswa, Guru, Mata Pelajaran & Pengaturan CBT',
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
  APP_LINKS: 'cbt_app_links_v4'
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

export const deleteUser = async (userId: string): Promise<void> => {
  const users = getAllUsers().filter(u => u.id !== userId);
  saveUsers(users, false);
  await deleteUserFromSupabase(userId);
  notifyDataUpdated();
};

import {
  cleanAndDeduplicateUsers,
  mergeImportedUsers,
  DeduplicationResult
} from './userDeduplication';

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
    return memoryExamsCache;
  }
  const stored = getStored<Exam[]>(STORAGE_KEYS.EXAMS, []);
  memoryExamsCache = stored;
  return stored;
};

export const saveExams = (exams: Exam[], syncToDb = true): void => {
  memoryExamsCache = exams;
  setStored(STORAGE_KEYS.EXAMS, exams);
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
  await deleteExamFromSupabase(examId);
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
    return memoryQuestionsCache;
  }
  const stored = getStored<Question[]>(STORAGE_KEYS.QUESTIONS, []);
  memoryQuestionsCache = stored;
  return stored;
};

export const saveQuestions = (questions: Question[], syncToDb = true): void => {
  memoryQuestionsCache = questions;
  setStored(STORAGE_KEYS.QUESTIONS, questions);
  notifyDataUpdated();
};

export const getQuestionsByExamId = (examId: string): Question[] => {
  return getAllQuestions().filter(q => q.examId === examId);
};

export const addQuestion = async (question: Question): Promise<void> => {
  const questions = getAllQuestions();
  questions.push(question);
  memoryQuestionsCache = questions;
  setStored(STORAGE_KEYS.QUESTIONS, questions);
  await syncQuestionToSupabase(question);
  notifyDataUpdated();
};

export const updateQuestion = async (updated: Question): Promise<void> => {
  const questions = getAllQuestions().map(q => (q.id === updated.id ? updated : q));
  memoryQuestionsCache = questions;
  setStored(STORAGE_KEYS.QUESTIONS, questions);
  await syncQuestionToSupabase(updated);
  notifyDataUpdated();
};

export const deleteQuestion = async (questionId: string): Promise<void> => {
  const questions = getAllQuestions().filter(q => q.id !== questionId);
  memoryQuestionsCache = questions;
  setStored(STORAGE_KEYS.QUESTIONS, questions);
  await deleteQuestionFromSupabase(questionId);
  notifyDataUpdated();
};

// --- SUBMISSIONS & REKAP ---
export const getAllSubmissions = (): ExamSubmission[] => {
  if (memorySubmissionsCache !== null) {
    return memorySubmissionsCache;
  }
  const stored = getStored<ExamSubmission[]>(STORAGE_KEYS.SUBMISSIONS, []);
  memorySubmissionsCache = stored;
  return stored;
};

export const saveSubmissions = (submissions: ExamSubmission[], syncToDb = true): void => {
  memorySubmissionsCache = submissions;
  setStored(STORAGE_KEYS.SUBMISSIONS, submissions);
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
      case 'single_choice': {
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
        if (items.length > 0 && answer && typeof answer === 'object') {
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
        const pairs = q.matchingPairs || [];
        if (pairs.length > 0 && answer && typeof answer === 'object') {
          let matchedCount = 0;
          pairs.forEach(p => {
            if (answer[p.id] === p.right) {
              matchedCount++;
            }
          });
          const ratio = matchedCount / pairs.length;
          qEarned = Math.round(ratio * q.points);
          evaluatedAnswers[q.id] = {
            earned: qEarned,
            max: q.points,
            isCorrect: matchedCount === pairs.length,
            feedback: `${matchedCount} dari ${pairs.length} pasangan cocok`
          };
        }
        break;
      }

      case 'case_study': {
        const text = typeof answer === 'string' ? answer.trim() : '';
        if (text.length === 0) {
          qEarned = 0;
          evaluatedAnswers[q.id] = {
            earned: 0,
            max: q.points,
            isCorrect: false,
            feedback: 'Tidak ada jawaban'
          };
        } else {
          const lowerText = text.toLowerCase();
          const keywords = q.caseKeywords || [];
          let hits = 0;
          keywords.forEach(kw => {
            if (lowerText.includes(kw.toLowerCase())) {
              hits++;
            }
          });

          const wordCount = text.split(/\s+/).length;
          let scoreRatio = 0.5;
          if (wordCount >= 20) scoreRatio += 0.2;
          if (wordCount >= 40) scoreRatio += 0.1;
          if (keywords.length > 0) {
            scoreRatio += Math.min(0.3, (hits / Math.min(3, keywords.length)) * 0.3);
          } else {
            scoreRatio = Math.min(1.0, scoreRatio + 0.2);
          }
          scoreRatio = Math.min(1.0, Math.max(0.2, scoreRatio));
          qEarned = Math.round(scoreRatio * q.points);

          evaluatedAnswers[q.id] = {
            earned: qEarned,
            max: q.points,
            isCorrect: qEarned >= q.points * 0.7,
            feedback: `Evaluasi analisis otomatis: terdeteksi ${hits} kata kunci relevan (${wordCount} kata)`
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
  memoryAppLinksCache = stored;
  return stored;
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
