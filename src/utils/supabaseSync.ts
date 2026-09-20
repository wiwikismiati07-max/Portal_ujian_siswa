import { supabase, SUPABASE_SETUP_SQL } from './supabaseClient';
import { User, Subject, Exam, Question, ExamSubmission } from '../types';
import {
  getAllUsers,
  saveUsers,
  getAllSubjects,
  saveSubjects,
  getAllExams,
  saveExams,
  getAllQuestions,
  saveQuestions,
  getAllSubmissions,
  saveSubmissions,
  getCurrentUser,
  setCurrentUser
} from './storage';
import {
  INITIAL_USERS,
  INITIAL_SUBJECTS,
  INITIAL_EXAMS,
  INITIAL_QUESTIONS,
  INITIAL_SUBMISSIONS
} from '../data/initialData';

export type SupabaseStatus = 'connecting' | 'connected' | 'needs_table_setup' | 'offline_fallback';

let currentStatus: SupabaseStatus = 'connecting';
let statusListeners: ((status: SupabaseStatus, message?: string) => void)[] = [];
let statusMessage = 'Menghubungkan ke Supabase...';
let realtimeChannel: any = null;

export const getSupabaseStatus = () => ({ status: currentStatus, message: statusMessage });

export const onSupabaseStatusChange = (cb: (status: SupabaseStatus, message?: string) => void) => {
  statusListeners.push(cb);
  cb(currentStatus, statusMessage);
  return () => {
    statusListeners = statusListeners.filter(l => l !== cb);
  };
};

const setStatus = (newStatus: SupabaseStatus, msg: string) => {
  currentStatus = newStatus;
  statusMessage = msg;
  statusListeners.forEach(cb => cb(newStatus, msg));
};

// Dispatch window event so any React component re-renders on external data change
export const notifyDataUpdated = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cbt_storage_update'));
  }
};

// ==========================================
// MAPPERS: TypeScript CamelCase <-> Postgres
// ==========================================
export const mapUserToDb = (u: User) => ({
  id: u.id,
  username: u.username,
  password: u.password,
  name: u.name,
  role: u.role,
  nip_or_nis: u.nipOrNis || null,
  class_group: u.classGroup || null,
  subject_name: u.subjectName || null,
  avatar: u.avatar || null,
  updated_at: new Date().toISOString()
});

export const mapUserFromDb = (row: any): User => ({
  id: row.id,
  username: row.username,
  password: row.password,
  name: row.name,
  role: row.role,
  nipOrNis: row.nip_or_nis || undefined,
  classGroup: row.class_group || undefined,
  subjectName: row.subject_name || undefined,
  avatar: row.avatar || undefined
});

export const mapSubjectToDb = (s: Subject) => ({
  id: s.id,
  code: s.code,
  name: s.name,
  teacher_name: s.teacherName,
  passing_grade: s.passingGrade,
  updated_at: new Date().toISOString()
});

export const mapSubjectFromDb = (row: any): Subject => ({
  id: row.id,
  code: row.code,
  name: row.name,
  teacherName: row.teacher_name,
  passingGrade: Number(row.passing_grade) || 75
});

export const mapExamToDb = (e: Exam) => ({
  id: e.id,
  title: e.title,
  subject_id: e.subjectId,
  subject_name: e.subjectName,
  teacher_id: e.teacherId,
  teacher_name: e.teacherName,
  target_classes: e.targetClasses || [],
  duration_minutes: e.durationMinutes,
  total_score: e.totalScore,
  passing_score: e.passingScore,
  status: e.status,
  instructions: e.instructions || null,
  created_at: e.createdAt,
  updated_at: new Date().toISOString()
});

export const mapExamFromDb = (row: any): Exam => ({
  id: row.id,
  title: row.title,
  subjectId: row.subject_id,
  subjectName: row.subject_name,
  teacherId: row.teacher_id,
  teacherName: row.teacher_name,
  targetClasses: Array.isArray(row.target_classes) ? row.target_classes : [],
  durationMinutes: Number(row.duration_minutes) || 60,
  totalScore: Number(row.total_score) || 100,
  passingScore: Number(row.passing_score) || 75,
  status: row.status || 'active',
  instructions: row.instructions || undefined,
  createdAt: row.created_at || new Date().toISOString()
});

export const mapQuestionToDb = (q: Question) => ({
  id: q.id,
  exam_id: q.examId,
  type: q.type,
  prompt: q.prompt,
  points: q.points,
  options: q.options || null,
  option_images: q.optionImages || null,
  correct_single: q.correctSingle ?? null,
  correct_multi: q.correctMulti || null,
  true_false_items: q.trueFalseItems || null,
  matching_pairs: q.matchingPairs || null,
  case_context: q.caseContext || null,
  case_keywords: q.caseKeywords || null,
  rubric_notes: q.rubricNotes || null,
  explanation: q.explanation || null,
  image_url: q.imageUrl || null,
  updated_at: new Date().toISOString()
});

export const mapQuestionFromDb = (row: any): Question => ({
  id: row.id,
  examId: row.exam_id,
  type: row.type,
  prompt: row.prompt,
  points: Number(row.points) || 10,
  options: Array.isArray(row.options) ? row.options : undefined,
  optionImages: Array.isArray(row.option_images) ? row.option_images : undefined,
  correctSingle: row.correct_single !== null ? Number(row.correct_single) : undefined,
  correctMulti: Array.isArray(row.correct_multi) ? row.correct_multi : undefined,
  trueFalseItems: Array.isArray(row.true_false_items) ? row.true_false_items : undefined,
  matchingPairs: Array.isArray(row.matching_pairs) ? row.matching_pairs : undefined,
  caseContext: row.case_context || undefined,
  caseKeywords: Array.isArray(row.case_keywords) ? row.case_keywords : undefined,
  rubricNotes: row.rubric_notes || undefined,
  explanation: row.explanation || undefined,
  imageUrl: row.image_url || undefined
});

export const mapSubmissionToDb = (s: ExamSubmission) => ({
  id: s.id,
  exam_id: s.examId,
  exam_title: s.examTitle,
  subject_name: s.subjectName,
  student_id: s.studentId,
  student_name: s.studentName,
  student_class: s.studentClass,
  answers: s.answers || {},
  earned_score: s.earnedScore,
  total_score: s.totalScore,
  percentage: s.percentage,
  passed: s.passed,
  violation_count: s.violationCount,
  started_at: s.startedAt,
  submitted_at: s.submittedAt,
  evaluated_answers: s.evaluatedAnswers || null,
  updated_at: new Date().toISOString()
});

export const mapSubmissionFromDb = (row: any): ExamSubmission => ({
  id: row.id,
  examId: row.exam_id,
  examTitle: row.exam_title,
  subjectName: row.subject_name,
  studentId: row.student_id,
  studentName: row.student_name,
  studentClass: row.student_class,
  answers: row.answers || {},
  earnedScore: Number(row.earned_score) || 0,
  totalScore: Number(row.total_score) || 100,
  percentage: Number(row.percentage) || 0,
  passed: !!row.passed,
  violationCount: Number(row.violation_count) || 0,
  startedAt: row.started_at,
  submittedAt: row.submitted_at,
  evaluatedAnswers: row.evaluated_answers || undefined
});

// ==========================================
// CORE INITIALIZATION & SYNC LOGIC
// ==========================================

export const initSupabaseSync = async (): Promise<boolean> => {
  try {
    setStatus('connecting', 'Memeriksa koneksi database Supabase...');

    // Test if cbt_exams or cbt_sync_store table is accessible
    const testResult = await supabase.from('cbt_exams').select('id').limit(1);

    if (testResult.error) {
      if (
        testResult.error.message?.includes('schema cache') ||
        testResult.error.message?.includes('relation') ||
        testResult.error.code === 'PGRST204' ||
        testResult.error.code === '42P01'
      ) {
        // Table not created yet
        setStatus(
          'needs_table_setup',
          'Tabel Supabase belum dibuat. Silakan salin & jalankan skrip SQL di Supabase SQL Editor.'
        );
        return false;
      } else {
        console.warn('Supabase test warning:', testResult.error);
        setStatus('offline_fallback', `Koneksi Supabase: ${testResult.error.message}`);
        return false;
      }
    }

    // Tables exist! Let's pull cloud data and seed if empty
    setStatus('connected', 'Terhubung ke Supabase (Sinkronisasi Multiuser Aktif)');
    await pullFromSupabase();
    setupRealtimeSubscription();
    return true;
  } catch (err: any) {
    console.error('Supabase init error:', err);
    setStatus('offline_fallback', 'Menggunakan penyimpanan lokal (Offline fallback)');
    return false;
  }
};

// Pull all data from Supabase into local storage
export const pullFromSupabase = async (): Promise<void> => {
  try {
    // 1. Users
    const { data: dbUsers } = await supabase.from('cbt_users').select('*');
    if (dbUsers && dbUsers.length > 0) {
      const users = dbUsers.map(mapUserFromDb);
      saveUsers(users);
      // If current logged in user exists, update their data
      const current = getCurrentUser();
      if (current) {
        const matching = users.find(u => u.id === current.id);
        if (matching) setCurrentUser(matching);
      }
    } else {
      // Seed users if empty
      const localUsers = getAllUsers();
      const usersToSeed = localUsers.length > 0 ? localUsers : INITIAL_USERS;
      await supabase.from('cbt_users').upsert(usersToSeed.map(mapUserToDb));
    }

    // 2. Subjects
    const { data: dbSubjects } = await supabase.from('cbt_subjects').select('*');
    if (dbSubjects && dbSubjects.length > 0) {
      saveSubjects(dbSubjects.map(mapSubjectFromDb));
    } else {
      const localSubj = getAllSubjects();
      const subjToSeed = localSubj.length > 0 ? localSubj : INITIAL_SUBJECTS;
      await supabase.from('cbt_subjects').upsert(subjToSeed.map(mapSubjectToDb));
    }

    // 3. Exams
    const { data: dbExams } = await supabase.from('cbt_exams').select('*');
    if (dbExams && dbExams.length > 0) {
      saveExams(dbExams.map(mapExamFromDb));
    } else {
      const localExams = getAllExams();
      const examsToSeed = localExams.length > 0 ? localExams : INITIAL_EXAMS;
      await supabase.from('cbt_exams').upsert(examsToSeed.map(mapExamToDb));
    }

    // 4. Questions
    const { data: dbQuestions } = await supabase.from('cbt_questions').select('*');
    if (dbQuestions && dbQuestions.length > 0) {
      saveQuestions(dbQuestions.map(mapQuestionFromDb));
    } else {
      const localQ = getAllQuestions();
      const qToSeed = localQ.length > 0 ? localQ : INITIAL_QUESTIONS;
      await supabase.from('cbt_questions').upsert(qToSeed.map(mapQuestionToDb));
    }

    // 5. Submissions
    const { data: dbSubmissions } = await supabase.from('cbt_submissions').select('*');
    if (dbSubmissions && dbSubmissions.length > 0) {
      saveSubmissions(dbSubmissions.map(mapSubmissionFromDb));
    } else {
      const localSub = getAllSubmissions();
      if (localSub.length > 0) {
        await supabase.from('cbt_submissions').upsert(localSub.map(mapSubmissionToDb));
      }
    }

    notifyDataUpdated();
  } catch (err) {
    console.error('Error during pullFromSupabase:', err);
  }
};

// Real-time listener across all tabs & users
export const setupRealtimeSubscription = () => {
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
  }

  realtimeChannel = supabase
    .channel('cbt-multiuser-channel')
    // Listen to Submissions changes (Student submits exam -> Teacher sees immediately)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'cbt_submissions' },
      payload => {
        const subs = getAllSubmissions();
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const item = mapSubmissionFromDb(payload.new);
          const next = [item, ...subs.filter(s => s.id !== item.id)];
          saveSubmissions(next);
        } else if (payload.eventType === 'DELETE') {
          saveSubmissions(subs.filter(s => s.id !== payload.old?.id));
        }
        notifyDataUpdated();
      }
    )
    // Listen to Exams changes (Teacher adds/edits exam -> Students see immediately)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'cbt_exams' },
      payload => {
        const exams = getAllExams();
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const item = mapExamFromDb(payload.new);
          const next = [item, ...exams.filter(e => e.id !== item.id)];
          saveExams(next);
        } else if (payload.eventType === 'DELETE') {
          saveExams(exams.filter(e => e.id !== payload.old?.id));
        }
        notifyDataUpdated();
      }
    )
    // Listen to Questions changes
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'cbt_questions' },
      payload => {
        const questions = getAllQuestions();
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const item = mapQuestionFromDb(payload.new);
          const next = [item, ...questions.filter(q => q.id !== item.id)];
          saveQuestions(next);
        } else if (payload.eventType === 'DELETE') {
          saveQuestions(questions.filter(q => q.id !== payload.old?.id));
        }
        notifyDataUpdated();
      }
    )
    // Listen to Users changes (Password update, new student register)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'cbt_users' },
      payload => {
        const users = getAllUsers();
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const item = mapUserFromDb(payload.new);
          const next = [item, ...users.filter(u => u.id !== item.id)];
          saveUsers(next);
          const current = getCurrentUser();
          if (current && current.id === item.id) {
            setCurrentUser(item);
          }
        } else if (payload.eventType === 'DELETE') {
          saveUsers(users.filter(u => u.id !== payload.old?.id));
        }
        notifyDataUpdated();
      }
    )
    // Broadcast fallback for real-time notifications even if table realtime isn't enabled
    .on('broadcast', { event: 'cbt_event' }, payload => {
      if (payload?.payload?.action) {
        pullFromSupabase();
      }
    })
    .subscribe();
};

// Send real-time broadcast notification
export const broadcastCbtEvent = (action: string, data?: any) => {
  try {
    if (realtimeChannel) {
      realtimeChannel.send({
        type: 'broadcast',
        event: 'cbt_event',
        payload: { action, data, timestamp: Date.now() }
      });
    }
  } catch (e) {
    // Non-blocking
  }
};

// ==========================================
// EXPLICIT TRANSACTION SYNC HELPERS
// (Called immediately when any student/teacher performs a transaction)
// ==========================================

export const syncSubmissionToSupabase = async (submission: ExamSubmission): Promise<void> => {
  try {
    const dbRow = mapSubmissionToDb(submission);
    const { error } = await supabase.from('cbt_submissions').upsert(dbRow);
    if (error) {
      console.warn('Supabase submission sync error:', error.message);
    } else {
      broadcastCbtEvent('new_submission', { examId: submission.examId, studentId: submission.studentId });
    }
  } catch (err) {
    console.warn('Network error syncing submission:', err);
  }
};

export const syncExamToSupabase = async (exam: Exam): Promise<void> => {
  try {
    const dbRow = mapExamToDb(exam);
    const { error } = await supabase.from('cbt_exams').upsert(dbRow);
    if (error) {
      console.warn('Supabase exam sync error:', error.message);
    } else {
      broadcastCbtEvent('exam_updated', { examId: exam.id });
    }
  } catch (err) {
    console.warn('Network error syncing exam:', err);
  }
};

export const deleteExamFromSupabase = async (examId: string): Promise<void> => {
  try {
    await supabase.from('cbt_exams').delete().eq('id', examId);
    await supabase.from('cbt_questions').delete().eq('exam_id', examId);
    broadcastCbtEvent('exam_deleted', { examId });
  } catch (err) {
    console.warn('Network error deleting exam:', err);
  }
};

export const syncQuestionToSupabase = async (question: Question): Promise<void> => {
  try {
    const dbRow = mapQuestionToDb(question);
    const { error } = await supabase.from('cbt_questions').upsert(dbRow);
    if (error) {
      console.warn('Supabase question sync error:', error.message);
    } else {
      broadcastCbtEvent('question_updated', { questionId: question.id });
    }
  } catch (err) {
    console.warn('Network error syncing question:', err);
  }
};

export const deleteQuestionFromSupabase = async (questionId: string): Promise<void> => {
  try {
    await supabase.from('cbt_questions').delete().eq('id', questionId);
    broadcastCbtEvent('question_deleted', { questionId });
  } catch (err) {
    console.warn('Network error deleting question:', err);
  }
};

export const syncUserToSupabase = async (user: User): Promise<void> => {
  try {
    const dbRow = mapUserToDb(user);
    const { error } = await supabase.from('cbt_users').upsert(dbRow);
    if (error) {
      console.warn('Supabase user sync error:', error.message);
    } else {
      broadcastCbtEvent('user_updated', { userId: user.id });
    }
  } catch (err) {
    console.warn('Network error syncing user:', err);
  }
};

export const syncUsersBatchToSupabase = async (users: User[]): Promise<void> => {
  try {
    const rows = users.map(mapUserToDb);
    const { error } = await supabase.from('cbt_users').upsert(rows);
    if (error) {
      console.warn('Supabase batch users sync error:', error.message);
    } else {
      broadcastCbtEvent('users_batch_updated', { count: users.length });
    }
  } catch (err) {
    console.warn('Network error syncing batch users:', err);
  }
};

export const syncSubjectToSupabase = async (subject: Subject): Promise<void> => {
  try {
    const dbRow = mapSubjectToDb(subject);
    const { error } = await supabase.from('cbt_subjects').upsert(dbRow);
    if (error) {
      console.warn('Supabase subject sync error:', error.message);
    } else {
      broadcastCbtEvent('subject_updated', { subjectId: subject.id });
    }
  } catch (err) {
    console.warn('Network error syncing subject:', err);
  }
};

export const syncSubjectsBatchToSupabase = async (subjects: Subject[]): Promise<void> => {
  try {
    const rows = subjects.map(mapSubjectToDb);
    const { error } = await supabase.from('cbt_subjects').upsert(rows);
    if (error) {
      console.warn('Supabase batch subjects sync error:', error.message);
    } else {
      broadcastCbtEvent('subjects_batch_updated', { count: subjects.length });
    }
  } catch (err) {
    console.warn('Network error syncing batch subjects:', err);
  }
};

// Overwrite all users with a specific role in Supabase and sync new ones
export const overwriteUsersByRoleInSupabase = async (
  role: 'siswa' | 'guru',
  newUsersWithRole: User[]
): Promise<void> => {
  try {
    // Delete existing users with this role in Supabase
    await supabase.from('cbt_users').delete().eq('role', role);
    // Insert new users
    if (newUsersWithRole.length > 0) {
      const rows = newUsersWithRole.map(mapUserToDb);
      await supabase.from('cbt_users').upsert(rows);
    }
    broadcastCbtEvent('users_overwritten', { role, count: newUsersWithRole.length });
  } catch (err) {
    console.warn(`Network error overwriting ${role} in Supabase:`, err);
  }
};

// Overwrite all subjects in Supabase and sync new ones
export const overwriteSubjectsInSupabase = async (newSubjects: Subject[]): Promise<void> => {
  try {
    // Delete existing subjects in Supabase
    await supabase.from('cbt_subjects').delete().neq('id', '___non_existent___');
    if (newSubjects.length > 0) {
      const rows = newSubjects.map(mapSubjectToDb);
      await supabase.from('cbt_subjects').upsert(rows);
    }
    broadcastCbtEvent('subjects_overwritten', { count: newSubjects.length });
  } catch (err) {
    console.warn('Network error overwriting subjects in Supabase:', err);
  }
};

// Force full sync from local to Supabase (e.g. user clicked "Upload All Local to Supabase")
export const uploadAllLocalToSupabase = async (): Promise<{ success: boolean; message: string }> => {
  try {
    setStatus('connecting', 'Mengunggah seluruh data lokal ke database Supabase...');

    const users = getAllUsers();
    const subjects = getAllSubjects();
    const exams = getAllExams();
    const questions = getAllQuestions();
    const submissions = getAllSubmissions();

    if (users.length > 0) await supabase.from('cbt_users').upsert(users.map(mapUserToDb));
    if (subjects.length > 0) await supabase.from('cbt_subjects').upsert(subjects.map(mapSubjectToDb));
    if (exams.length > 0) await supabase.from('cbt_exams').upsert(exams.map(mapExamToDb));
    if (questions.length > 0) await supabase.from('cbt_questions').upsert(questions.map(mapQuestionToDb));
    if (submissions.length > 0) await supabase.from('cbt_submissions').upsert(submissions.map(mapSubmissionToDb));

    setStatus('connected', 'Semua data lokal berhasil disinkronkan ke Supabase!');
    broadcastCbtEvent('full_sync_completed');
    return { success: true, message: 'Semua data berhasil disinkronkan ke Supabase!' };
  } catch (err: any) {
    console.error('Error uploading to Supabase:', err);
    return { success: false, message: err.message || 'Gagal mengunggah data ke Supabase' };
  }
};
