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

export const setStatus = (newStatus: SupabaseStatus, msg: string) => {
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
  matching_data: q.matchingData || null,
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
  matchingData: row.matching_data || undefined,
  caseContext: row.case_context || undefined,
  caseKeywords: Array.isArray(row.case_keywords) ? row.case_keywords : undefined,
  rubricNotes: row.rubric_notes || undefined,
  explanation: row.explanation || undefined,
  imageUrl: row.image_url || undefined
});

export const mapSubmissionToDb = (s: ExamSubmission, fallbackMode = false) => {
  const metaObj = {
    violationCount: s.violationCount || 0,
    violationLogs: s.violationLogs || [],
    studentNipOrNis: s.studentNipOrNis || null,
    evaluatedAnswers: s.evaluatedAnswers || null,
    startedAt: s.startedAt,
    submittedAt: s.submittedAt
  };

  const safeAnswers = {
    ...(s.answers || {}),
    _meta: metaObj
  };

  if (fallbackMode) {
    return {
      id: s.id,
      exam_id: s.examId,
      exam_title: s.examTitle,
      subject_name: s.subjectName,
      student_id: s.studentId,
      student_name: s.studentName,
      student_class: s.studentClass,
      answers: safeAnswers,
      earned_score: typeof s.earnedScore === 'number' ? s.earnedScore : 0,
      total_score: typeof s.totalScore === 'number' ? s.totalScore : 100,
      percentage: typeof s.percentage === 'number' ? s.percentage : 0,
      passed: !!s.passed,
      started_at: s.startedAt || new Date().toISOString(),
      submitted_at: s.submittedAt || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  return {
    id: s.id,
    exam_id: s.examId,
    exam_title: s.examTitle,
    subject_name: s.subjectName,
    student_id: s.studentId,
    student_name: s.studentName,
    student_class: s.studentClass,
    student_nip_or_nis: s.studentNipOrNis || null,
    answers: safeAnswers,
    earned_score: typeof s.earnedScore === 'number' ? s.earnedScore : 0,
    total_score: typeof s.totalScore === 'number' ? s.totalScore : 100,
    percentage: typeof s.percentage === 'number' ? s.percentage : 0,
    passed: !!s.passed,
    violation_count: s.violationCount || 0,
    violation_logs: s.violationLogs || [],
    started_at: s.startedAt || new Date().toISOString(),
    submitted_at: s.submittedAt || new Date().toISOString(),
    evaluated_answers: s.evaluatedAnswers || null,
    updated_at: new Date().toISOString()
  };
};

export const mapSubmissionFromDb = (row: any): ExamSubmission => {
  const rawAnswers = row.answers || {};
  const meta = rawAnswers._meta || {};

  // Clean user answers from internal meta
  const cleanAnswers = { ...rawAnswers };
  delete cleanAnswers._meta;
  delete cleanAnswers.__violationLogs;
  delete cleanAnswers.__violationCount;
  delete cleanAnswers.__evaluatedAnswers;

  const violationLogs = Array.isArray(row.violation_logs) && row.violation_logs.length > 0
    ? row.violation_logs
    : (Array.isArray(meta.violationLogs) ? meta.violationLogs : []);

  const violationCount = row.violation_count !== undefined && row.violation_count !== null
    ? (typeof row.violation_count === 'number' ? row.violation_count : Number(row.violation_count) || 0)
    : (meta.violationCount !== undefined ? Number(meta.violationCount) || 0 : violationLogs.length);

  const studentNipOrNis = row.student_nip_or_nis || row.nip_or_nis || meta.studentNipOrNis || undefined;
  const evaluatedAnswers = row.evaluated_answers || meta.evaluatedAnswers || undefined;

  return {
    id: row.id,
    examId: row.exam_id,
    examTitle: row.exam_title,
    subjectName: row.subject_name,
    studentId: row.student_id,
    studentName: row.student_name,
    studentClass: row.student_class,
    studentNipOrNis,
    answers: cleanAnswers,
    earnedScore: typeof row.earned_score === 'number' ? row.earned_score : (Number(row.earned_score) || 0),
    totalScore: typeof row.total_score === 'number' ? row.total_score : (Number(row.total_score) || 100),
    percentage: typeof row.percentage === 'number' ? row.percentage : (Number(row.percentage) || 0),
    passed: !!row.passed,
    violationCount,
    violationLogs,
    startedAt: row.started_at || meta.startedAt,
    submittedAt: row.submitted_at || meta.submittedAt,
    evaluatedAnswers
  };
};

// ==========================================
// CHUNKING HELPER FOR BULK OPERATIONS
// ==========================================
export const upsertInChunks = async (
  tableName: string,
  rows: any[],
  chunkSize = 50,
  onProgress?: (processed: number, total: number) => void
): Promise<{ success: boolean; error?: string }> => {
  if (!rows || rows.length === 0) return { success: true };

  try {
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      const { error } = await supabase.from(tableName).upsert(chunk);
      if (error) {
        console.warn(`Error upserting chunk ${i / chunkSize + 1} to ${tableName}:`, error.message);
        
        // If submissions table had missing columns in Supabase, retry this chunk in fallback mode
        if (tableName === 'cbt_submissions') {
          const fallbackChunk = chunk.map((r: any) => {
            const { violation_logs, violation_count, student_nip_or_nis, evaluated_answers, ...rest } = r;
            return rest;
          });
          const { error: fbErr } = await supabase.from(tableName).upsert(fallbackChunk);
          if (fbErr) {
            console.error('Fallback chunk upsert also failed:', fbErr.message);
            return { success: false, error: fbErr.message };
          }
        } else if (tableName === 'cbt_questions') {
          const fallbackChunk = chunk.map((r: any) => {
            const { matching_data, option_images, ...rest } = r;
            return rest;
          });
          const { error: fbErr } = await supabase.from(tableName).upsert(fallbackChunk);
          if (fbErr) {
            console.error('Fallback cbt_questions chunk upsert failed:', fbErr.message);
            return { success: false, error: fbErr.message };
          }
        } else {
          return { success: false, error: error.message };
        }
      }
      if (onProgress) {
        onProgress(Math.min(i + chunkSize, rows.length), rows.length);
      }
    }
    return { success: true };
  } catch (err: any) {
    console.error(`Exception during chunked upsert to ${tableName}:`, err);
    return { success: false, error: err.message || 'Gagal menyimpan data ke Supabase' };
  }
};

// ==========================================
// CORE INITIALIZATION & SYNC LOGIC
// ==========================================

export const initSupabaseSync = async (): Promise<boolean> => {
  try {
    setStatus('connecting', 'Memeriksa koneksi database Supabase...');

    // Test if cbt_exams table exists
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
    // 1. Users (fetch with pagination to handle 1000+ records)
    const { data: dbUsers, error: usersError } = await supabase
      .from('cbt_users')
      .select('*')
      .order('name', { ascending: true })
      .limit(2000);

    if (!usersError && dbUsers && dbUsers.length > 0) {
      const rawUsers = dbUsers.map(mapUserFromDb);
      const { cleanAndDeduplicateUsers } = await import('./userDeduplication');
      const { cleanedUsers, removedUserIds } = cleanAndDeduplicateUsers(rawUsers);

      saveUsers(cleanedUsers, false); // false = don't re-upload back to Supabase
      
      // Clean up duplicates and legacy demo user Budi Santoso in Supabase database in background
      supabase
        .from('cbt_users')
        .delete()
        .or('id.eq.user_guru_1,username.eq.budi_guru,nip_or_nis.eq.198305142008011012')
        .then(() => {});

      if (removedUserIds.length > 0) {
        supabase.from('cbt_users').delete().in('id', removedUserIds).then(() => {});
      }

      const current = getCurrentUser();
      if (current) {
        const matching = cleanedUsers.find(u => u.id === current.id);
        if (matching) setCurrentUser(matching);
      }
    } else if (!usersError && (!dbUsers || dbUsers.length === 0)) {
      // Seed initial users if empty
      const localUsers = getAllUsers();
      const usersToSeed = localUsers.length > 0 ? localUsers : INITIAL_USERS;
      await upsertInChunks('cbt_users', usersToSeed.map(mapUserToDb));
    }

    // 2. Subjects
    const { data: dbSubjects, error: subjError } = await supabase
      .from('cbt_subjects')
      .select('*')
      .limit(500);
    if (!subjError && dbSubjects && dbSubjects.length > 0) {
      saveSubjects(dbSubjects.map(mapSubjectFromDb), false);
    } else if (!subjError && (!dbSubjects || dbSubjects.length === 0)) {
      const localSubj = getAllSubjects();
      const subjToSeed = localSubj.length > 0 ? localSubj : INITIAL_SUBJECTS;
      await upsertInChunks('cbt_subjects', subjToSeed.map(mapSubjectToDb));
    }

    // 3. Exams
    const { data: dbExams, error: examsError } = await supabase
      .from('cbt_exams')
      .select('*')
      .limit(500);
    if (!examsError && dbExams) {
      // Filter out any stale mock exams from DB
      const cleanExams = dbExams
        .map(mapExamFromDb)
        .filter(
          e =>
            !e.id.startsWith('exam_inf_pts') &&
            !e.id.startsWith('exam_ipa_pts') &&
            !e.id.startsWith('exam_arb_pts')
        );

      // Clean mock exams from DB in the background
      const mockIds = dbExams
        .map(mapExamFromDb)
        .filter(
          e =>
            e.id.startsWith('exam_inf_pts') ||
            e.id.startsWith('exam_ipa_pts') ||
            e.id.startsWith('exam_arb_pts')
        )
        .map(e => e.id);

      if (mockIds.length > 0) {
        supabase.from('cbt_submissions').delete().in('exam_id', mockIds).then(() => {});
        supabase.from('cbt_questions').delete().in('exam_id', mockIds).then(() => {});
        supabase.from('cbt_exams').delete().in('id', mockIds).then(() => {});
      }

      saveExams(cleanExams, false);
    }

    // 4. Questions
    const { data: dbQuestions, error: qError } = await supabase
      .from('cbt_questions')
      .select('*')
      .limit(2000);
    if (!qError && dbQuestions) {
      const cleanQuestions = dbQuestions
        .map(mapQuestionFromDb)
        .filter(
          q =>
            !q.examId.startsWith('exam_inf_pts') &&
            !q.examId.startsWith('exam_ipa_pts') &&
            !q.examId.startsWith('exam_arb_pts')
        );

      const localQuestions = getAllQuestions().filter(
        q =>
          !q.examId.startsWith('exam_inf_pts') &&
          !q.examId.startsWith('exam_ipa_pts') &&
          !q.examId.startsWith('exam_arb_pts')
      );

      if (cleanQuestions.length === 0 && localQuestions.length > 0) {
        // Jangan timpa lokal dengan kosong! Pertahankan lokal dan upload ke Supabase
        saveQuestions(localQuestions, false);
        upsertInChunks('cbt_questions', localQuestions.map(mapQuestionToDb)).catch(err => {
          console.warn('Seeding local questions to Supabase in background:', err);
        });
      } else if (cleanQuestions.length > 0) {
        // Gabungkan butir soal lokal yang belum sempat tersinkron ke Supabase
        const dbIdSet = new Set(cleanQuestions.map(q => q.id));
        const unsyncedLocals = localQuestions.filter(lq => !dbIdSet.has(lq.id));
        if (unsyncedLocals.length > 0) {
          const merged = [...cleanQuestions, ...unsyncedLocals];
          saveQuestions(merged, false);
          upsertInChunks('cbt_questions', unsyncedLocals.map(mapQuestionToDb)).catch(() => {});
        } else {
          saveQuestions(cleanQuestions, false);
        }
      } else {
        saveQuestions([], false);
      }
    }

    // 5. Submissions
    const { data: dbSubmissions, error: subError } = await supabase
      .from('cbt_submissions')
      .select('*')
      .limit(2000);
    if (!subError && dbSubmissions) {
      saveSubmissions(dbSubmissions.map(mapSubmissionFromDb), false);
    }

    notifyDataUpdated();
  } catch (err) {
    console.error('Error during pullFromSupabase:', err);
  }
};

// Clear all exams, questions, and submissions from Supabase
export const clearAllExamsInSupabase = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    // 1. Fetch current IDs first to guarantee clean deletion
    const { data: existingExams } = await supabase.from('cbt_exams').select('id');
    const examIds = existingExams?.map(e => e.id) || [];

    // 2. Delete submissions first
    if (examIds.length > 0) {
      await supabase.from('cbt_submissions').delete().in('exam_id', examIds);
    }
    await supabase.from('cbt_submissions').delete().gte('id', '');

    // 3. Delete questions second
    if (examIds.length > 0) {
      await supabase.from('cbt_questions').delete().in('exam_id', examIds);
    }
    await supabase.from('cbt_questions').delete().gte('id', '');

    // 4. Delete exams third
    if (examIds.length > 0) {
      await supabase.from('cbt_exams').delete().in('id', examIds);
    }
    await supabase.from('cbt_exams').delete().gte('id', '');

    broadcastCbtEvent('exams_cleared', {});
    return { success: true };
  } catch (err: any) {
    console.error('Error clearing exams from Supabase:', err);
    return { success: false, error: err?.message || 'Gagal mengosongkan paket ujian di Supabase' };
  }
};

// Real-time listener across all tabs & users
export const setupRealtimeSubscription = () => {
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
  }

  realtimeChannel = supabase
    .channel('cbt-multiuser-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'cbt_submissions' },
      payload => {
        const subs = getAllSubmissions();
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const item = mapSubmissionFromDb(payload.new);
          const next = [item, ...subs.filter(s => s.id !== item.id)];
          saveSubmissions(next, false);
        } else if (payload.eventType === 'DELETE') {
          saveSubmissions(subs.filter(s => s.id !== payload.old?.id), false);
        }
        notifyDataUpdated();
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'cbt_exams' },
      payload => {
        const exams = getAllExams();
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const item = mapExamFromDb(payload.new);
          const next = [item, ...exams.filter(e => e.id !== item.id)];
          saveExams(next, false);
        } else if (payload.eventType === 'DELETE') {
          saveExams(exams.filter(e => e.id !== payload.old?.id), false);
        }
        notifyDataUpdated();
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'cbt_questions' },
      payload => {
        const questions = getAllQuestions();
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const item = mapQuestionFromDb(payload.new);
          const next = [item, ...questions.filter(q => q.id !== item.id)];
          saveQuestions(next, false);
        } else if (payload.eventType === 'DELETE') {
          saveQuestions(questions.filter(q => q.id !== payload.old?.id), false);
        }
        notifyDataUpdated();
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'cbt_users' },
      payload => {
        const users = getAllUsers();
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const item = mapUserFromDb(payload.new);
          const next = [item, ...users.filter(u => u.id !== item.id)];
          saveUsers(next, false);
          const current = getCurrentUser();
          if (current && current.id === item.id) {
            setCurrentUser(item);
          }
        } else if (payload.eventType === 'DELETE') {
          saveUsers(users.filter(u => u.id !== payload.old?.id), false);
        }
        notifyDataUpdated();
      }
    )
    .on('broadcast', { event: 'cbt_event' }, payload => {
      const action = payload?.payload?.action;
      if (action === 'exams_cleared') {
        saveExams([], false);
        saveQuestions([], false);
        saveSubmissions([], false);
        notifyDataUpdated();
      } else if (action === 'exam_deleted') {
        const deletedId = payload?.payload?.data?.examId;
        if (deletedId) {
          const exams = getAllExams().filter(e => e.id !== deletedId);
          const questions = getAllQuestions().filter(q => q.examId !== deletedId);
          const submissions = getAllSubmissions().filter(s => s.examId !== deletedId);
          saveExams(exams, false);
          saveQuestions(questions, false);
          saveSubmissions(submissions, false);
          notifyDataUpdated();
        }
      } else if (action) {
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
// EXPLICIT TRANSACTION DIRECT SYNC HELPERS
// ==========================================

export const syncSubmissionToSupabase = async (submission: ExamSubmission): Promise<boolean> => {
  try {
    const dbRow = mapSubmissionToDb(submission, false);
    const { error } = await supabase.from('cbt_submissions').upsert(dbRow as any);
    if (error) {
      console.warn('Supabase submission full upsert failed, retrying with fallback compatibility payload:', error.message);
      // Fallback in case columns like violation_logs or evaluated_answers are not yet in user's Supabase
      const fallbackRow = mapSubmissionToDb(submission, true);
      const { error: fbErr } = await supabase.from('cbt_submissions').upsert(fallbackRow as any);
      if (fbErr) {
        console.error('Supabase submission fallback upsert also failed:', fbErr.message);
        return false;
      }
    }
    broadcastCbtEvent('new_submission', { examId: submission.examId, studentId: submission.studentId });
    return true;
  } catch (err) {
    console.warn('Network error syncing submission:', err);
    return false;
  }
};

export const syncExamToSupabase = async (exam: Exam): Promise<boolean> => {
  try {
    const dbRow = mapExamToDb(exam);
    const { error } = await supabase.from('cbt_exams').upsert(dbRow);
    if (error) {
      console.warn('Supabase exam sync error:', error.message);
      return false;
    }
    broadcastCbtEvent('exam_updated', { examId: exam.id });
    return true;
  } catch (err) {
    console.warn('Network error syncing exam:', err);
    return false;
  }
};

export const deleteExamFromSupabase = async (examId: string): Promise<boolean> => {
  try {
    // 1. Delete dependent submissions first
    const { error: subErr } = await supabase.from('cbt_submissions').delete().eq('exam_id', examId);
    if (subErr) console.warn('Supabase sub delete error:', subErr.message);

    // 2. Delete dependent questions second
    const { error: qErr } = await supabase.from('cbt_questions').delete().eq('exam_id', examId);
    if (qErr) console.warn('Supabase questions delete error:', qErr.message);

    // 3. Delete the exam record itself
    const { error: exErr } = await supabase.from('cbt_exams').delete().eq('id', examId);
    if (exErr) {
      console.warn('Supabase exam delete error:', exErr.message);
      return false;
    }

    broadcastCbtEvent('exam_deleted', { examId });
    return true;
  } catch (err) {
    console.warn('Network error deleting exam:', err);
    return false;
  }
};

export const syncQuestionToSupabase = async (question: Question): Promise<{ success: boolean; error?: string }> => {
  try {
    const dbRow = mapQuestionToDb(question);
    const { error } = await supabase.from('cbt_questions').upsert(dbRow);
    if (error) {
      console.warn('Supabase question sync error:', error.message);
      
      // Fallback: Jika tabel cbt_questions di Supabase belum memiliki kolom matching_data atau option_images
      if (
        error.message?.includes('matching_data') ||
        error.message?.includes('option_images') ||
        error.message?.includes('column') ||
        error.code === 'PGRST204'
      ) {
        const fallbackRow = { ...dbRow };
        delete (fallbackRow as any).matching_data;
        delete (fallbackRow as any).option_images;
        const { error: fbErr } = await supabase.from('cbt_questions').upsert(fallbackRow);
        if (!fbErr) {
          broadcastCbtEvent('question_updated', { questionId: question.id });
          return { success: true };
        }
      }
      return { success: false, error: error.message };
    }
    broadcastCbtEvent('question_updated', { questionId: question.id });
    return { success: true };
  } catch (err: any) {
    console.warn('Network error syncing question:', err);
    return { success: false, error: err?.message || 'Network error' };
  }
};

export const syncAllLocalQuestionsToSupabase = async (): Promise<{ success: boolean; count: number; error?: string }> => {
  try {
    const localQuestions = getAllQuestions().filter(
      q => !q.examId.startsWith('exam_inf_pts') && !q.examId.startsWith('exam_ipa_pts') && !q.examId.startsWith('exam_arb_pts')
    );
    if (localQuestions.length === 0) {
      return { success: true, count: 0 };
    }
    const dbRows = localQuestions.map(mapQuestionToDb);
    const res = await upsertInChunks('cbt_questions', dbRows);
    if (res.success) {
      return { success: true, count: localQuestions.length };
    } else {
      return { success: false, count: 0, error: res.error };
    }
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message };
  }
};

export const deleteQuestionFromSupabase = async (questionId: string): Promise<boolean> => {
  try {
    await supabase.from('cbt_questions').delete().eq('id', questionId);
    broadcastCbtEvent('question_deleted', { questionId });
    return true;
  } catch (err) {
    console.warn('Network error deleting question:', err);
    return false;
  }
};

export const syncUserToSupabase = async (user: User): Promise<boolean> => {
  try {
    const dbRow = mapUserToDb(user);
    const { error } = await supabase.from('cbt_users').upsert(dbRow);
    if (error) {
      console.warn('Supabase user sync error:', error.message);
      return false;
    }
    broadcastCbtEvent('user_updated', { userId: user.id });
    return true;
  } catch (err) {
    console.warn('Network error syncing user:', err);
    return false;
  }
};

export const deleteUserFromSupabase = async (userId: string): Promise<boolean> => {
  try {
    await supabase.from('cbt_users').delete().eq('id', userId);
    broadcastCbtEvent('user_deleted', { userId });
    return true;
  } catch (err) {
    console.warn('Network error deleting user:', err);
    return false;
  }
};

export const syncUsersBatchToSupabase = async (
  users: User[],
  onProgress?: (processed: number, total: number) => void
): Promise<{ success: boolean; error?: string }> => {
  try {
    const rows = users.map(mapUserToDb);
    const res = await upsertInChunks('cbt_users', rows, 50, onProgress);
    if (res.success) {
      broadcastCbtEvent('users_batch_updated', { count: users.length });
    }
    return res;
  } catch (err: any) {
    return { success: false, error: err?.message || 'Gagal menyimpan batch pengguna' };
  }
};

export const syncSubjectToSupabase = async (subject: Subject): Promise<boolean> => {
  try {
    const dbRow = mapSubjectToDb(subject);
    const { error } = await supabase.from('cbt_subjects').upsert(dbRow);
    if (error) {
      console.warn('Supabase subject sync error:', error.message);
      return false;
    }
    broadcastCbtEvent('subject_updated', { subjectId: subject.id });
    return true;
  } catch (err) {
    console.warn('Network error syncing subject:', err);
    return false;
  }
};

export const deleteSubjectFromSupabase = async (subjectId: string): Promise<boolean> => {
  try {
    await supabase.from('cbt_subjects').delete().eq('id', subjectId);
    broadcastCbtEvent('subject_deleted', { subjectId });
    return true;
  } catch (err) {
    console.warn('Network error deleting subject:', err);
    return false;
  }
};

export const syncSubjectsBatchToSupabase = async (
  subjects: Subject[],
  onProgress?: (processed: number, total: number) => void
): Promise<{ success: boolean; error?: string }> => {
  try {
    const rows = subjects.map(mapSubjectToDb);
    const res = await upsertInChunks('cbt_subjects', rows, 50, onProgress);
    if (res.success) {
      broadcastCbtEvent('subjects_batch_updated', { count: subjects.length });
    }
    return res;
  } catch (err: any) {
    return { success: false, error: err?.message || 'Gagal menyimpan batch mata pelajaran' };
  }
};

// Overwrite all users with a specific role in Supabase and sync new ones
export const overwriteUsersByRoleInSupabase = async (
  role: 'siswa' | 'guru',
  newUsersWithRole: User[],
  onProgress?: (processed: number, total: number) => void
): Promise<{ success: boolean; count: number; error?: string }> => {
  try {
    // 1. Delete existing users with this role in Supabase
    const { error: delError } = await supabase.from('cbt_users').delete().eq('role', role);
    if (delError) {
      console.warn(`Supabase delete warning for role ${role}:`, delError.message);
    }

    // 2. Insert new users in safe batches of 50
    if (newUsersWithRole.length > 0) {
      const rows = newUsersWithRole.map(mapUserToDb);
      const res = await upsertInChunks('cbt_users', rows, 50, onProgress);
      if (!res.success) {
        return { success: false, count: 0, error: res.error };
      }
    }

    broadcastCbtEvent('users_overwritten', { role, count: newUsersWithRole.length });
    return { success: true, count: newUsersWithRole.length };
  } catch (err: any) {
    console.error(`Error overwriting ${role} in Supabase:`, err);
    return { success: false, count: 0, error: err?.message || 'Gagal menindih data pengguna di Supabase' };
  }
};

// Overwrite all subjects in Supabase and sync new ones
export const overwriteSubjectsInSupabase = async (
  newSubjects: Subject[],
  onProgress?: (processed: number, total: number) => void
): Promise<{ success: boolean; count: number; error?: string }> => {
  try {
    await supabase.from('cbt_subjects').delete().neq('id', '___non_existent___');
    if (newSubjects.length > 0) {
      const rows = newSubjects.map(mapSubjectToDb);
      const res = await upsertInChunks('cbt_subjects', rows, 50, onProgress);
      if (!res.success) {
        return { success: false, count: 0, error: res.error };
      }
    }
    broadcastCbtEvent('subjects_overwritten', { count: newSubjects.length });
    return { success: true, count: newSubjects.length };
  } catch (err: any) {
    console.error('Error overwriting subjects in Supabase:', err);
    return { success: false, count: 0, error: err?.message || 'Gagal menindih mata pelajaran di Supabase' };
  }
};

// Force full sync from local to Supabase
export const uploadAllLocalToSupabase = async (
  onProgress?: (msg: string) => void
): Promise<{ success: boolean; message: string }> => {
  try {
    setStatus('connecting', 'Mengunggah seluruh data ke database Supabase...');

    const users = getAllUsers();
    const subjects = getAllSubjects();
    const exams = getAllExams();
    const questions = getAllQuestions();
    const submissions = getAllSubmissions();

    if (onProgress) onProgress(`Menyimpan ${users.length} data pengguna...`);
    if (users.length > 0) await upsertInChunks('cbt_users', users.map(mapUserToDb));

    if (onProgress) onProgress(`Menyimpan ${subjects.length} data mata pelajaran...`);
    if (subjects.length > 0) await upsertInChunks('cbt_subjects', subjects.map(mapSubjectToDb));

    if (onProgress) onProgress(`Menyimpan ${exams.length} paket ujian...`);
    if (exams.length > 0) await upsertInChunks('cbt_exams', exams.map(mapExamToDb));

    if (onProgress) onProgress(`Menyimpan ${questions.length} butir soal...`);
    if (questions.length > 0) await upsertInChunks('cbt_questions', questions.map(mapQuestionToDb));

    if (onProgress) onProgress(`Menyimpan ${submissions.length} hasil ujian siswa...`);
    if (submissions.length > 0) await upsertInChunks('cbt_submissions', submissions.map(s => mapSubmissionToDb(s)));

    setStatus('connected', 'Semua data berhasil disimpan & disinkronkan ke Supabase!');
    broadcastCbtEvent('full_sync_completed');
    return { success: true, message: 'Semua data berhasil tersimpan di Supabase!' };
  } catch (err: any) {
    console.error('Error uploading to Supabase:', err);
    return { success: false, message: err.message || 'Gagal mengunggah data ke Supabase' };
  }
};
