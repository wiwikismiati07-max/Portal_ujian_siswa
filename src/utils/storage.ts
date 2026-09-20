import { User, Subject, Exam, Question, ExamSubmission } from '../types';
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
  syncSubjectToSupabase,
  syncSubjectsBatchToSupabase,
  overwriteUsersByRoleInSupabase,
  overwriteSubjectsInSupabase,
  syncExamToSupabase,
  deleteExamFromSupabase,
  syncQuestionToSupabase,
  deleteQuestionFromSupabase,
  syncSubmissionToSupabase,
  notifyDataUpdated
} from './supabaseSync';

const STORAGE_KEYS = {
  USERS: 'cbt_users_v2',
  CURRENT_USER: 'cbt_current_user_v2',
  SUBJECTS: 'cbt_subjects_v2',
  EXAMS: 'cbt_exams_v2',
  QUESTIONS: 'cbt_questions_v2',
  SUBMISSIONS: 'cbt_submissions_v2'
};

// Safe storage access helper
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
    console.error(`Error writing ${key} to storage:`, err);
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
  if (!localStorage.getItem(STORAGE_KEYS.EXAMS)) {
    setStored(STORAGE_KEYS.EXAMS, INITIAL_EXAMS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.QUESTIONS)) {
    setStored(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUBMISSIONS)) {
    setStored(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
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
  return getStored<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
};

export const saveUsers = (users: User[]): void => {
  setStored(STORAGE_KEYS.USERS, users);
  syncUsersBatchToSupabase(users).catch(() => {});
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

  const user = users[existingIdx];
  user.username = newUsername.trim();
  if (newPassword && newPassword.trim().length > 0) {
    user.password = newPassword.trim();
  }
  if (newName && newName.trim().length > 0) {
    user.name = newName.trim();
  }

  users[existingIdx] = user;
  setStored(STORAGE_KEYS.USERS, users);
  syncUserToSupabase(user).catch(() => {});
  notifyDataUpdated();

  // If current logged in user is the one updated, update session too
  const current = getCurrentUser();
  if (current && current.id === userId) {
    setCurrentUser(user);
  }

  return { success: true, message: 'Kredensial berhasil diperbarui!', updatedUser: user };
};

// --- SUBJECTS ---
export const getAllSubjects = (): Subject[] => {
  return getStored<Subject[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
};

export const saveSubjects = (subjects: Subject[]): void => {
  setStored(STORAGE_KEYS.SUBJECTS, subjects);
  syncSubjectsBatchToSupabase(subjects).catch(() => {});
  notifyDataUpdated();
};

export const addSubject = (subject: Subject): void => {
  const subjects = getAllSubjects();
  subjects.push(subject);
  saveSubjects(subjects);
};

// Overwrite all users of a specific role (e.g. replace all students or all teachers upon import)
export const overwriteUsersByRole = (
  role: 'siswa' | 'guru',
  newUsers: User[]
): void => {
  const allUsers = getAllUsers();
  // Keep users of other roles (e.g. keep admin and teachers when replacing students)
  const keptUsers = allUsers.filter(u => u.role !== role);
  const updatedAll = [...keptUsers, ...newUsers];

  setStored(STORAGE_KEYS.USERS, updatedAll);
  overwriteUsersByRoleInSupabase(role, newUsers).catch(() => {});
  notifyDataUpdated();

  // If current logged in user was in this role and is replaced, refresh session if still present
  const current = getCurrentUser();
  if (current && current.role === role) {
    const matched = newUsers.find(u => u.username.toLowerCase() === current.username.toLowerCase() || u.id === current.id);
    if (matched) {
      setCurrentUser(matched);
    }
  }
};

// Overwrite all subjects completely upon import
export const overwriteAllSubjects = (newSubjects: Subject[]): void => {
  setStored(STORAGE_KEYS.SUBJECTS, newSubjects);
  overwriteSubjectsInSupabase(newSubjects).catch(() => {});
  notifyDataUpdated();
};

// --- EXAMS ---
export const getAllExams = (): Exam[] => {
  return getStored<Exam[]>(STORAGE_KEYS.EXAMS, INITIAL_EXAMS);
};

export const saveExams = (exams: Exam[]): void => {
  setStored(STORAGE_KEYS.EXAMS, exams);
  notifyDataUpdated();
};

export const addExam = (exam: Exam): void => {
  const exams = getAllExams();
  exams.unshift(exam);
  setStored(STORAGE_KEYS.EXAMS, exams);
  syncExamToSupabase(exam).catch(() => {});
  notifyDataUpdated();
};

export const updateExam = (updated: Exam): void => {
  const exams = getAllExams().map(e => (e.id === updated.id ? updated : e));
  setStored(STORAGE_KEYS.EXAMS, exams);
  syncExamToSupabase(updated).catch(() => {});
  notifyDataUpdated();
};

export const deleteExam = (examId: string): void => {
  const exams = getAllExams().filter(e => e.id !== examId);
  setStored(STORAGE_KEYS.EXAMS, exams);
  // Also delete its questions
  const questions = getAllQuestions().filter(q => q.examId !== examId);
  setStored(STORAGE_KEYS.QUESTIONS, questions);
  deleteExamFromSupabase(examId).catch(() => {});
  notifyDataUpdated();
};

// --- QUESTIONS ---
export const getAllQuestions = (): Question[] => {
  return getStored<Question[]>(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
};

export const saveQuestions = (questions: Question[]): void => {
  setStored(STORAGE_KEYS.QUESTIONS, questions);
  notifyDataUpdated();
};

export const getQuestionsByExamId = (examId: string): Question[] => {
  return getAllQuestions().filter(q => q.examId === examId);
};

export const addQuestion = (question: Question): void => {
  const questions = getAllQuestions();
  questions.push(question);
  setStored(STORAGE_KEYS.QUESTIONS, questions);
  syncQuestionToSupabase(question).catch(() => {});
  notifyDataUpdated();
};

export const updateQuestion = (updated: Question): void => {
  const questions = getAllQuestions().map(q => (q.id === updated.id ? updated : q));
  setStored(STORAGE_KEYS.QUESTIONS, questions);
  syncQuestionToSupabase(updated).catch(() => {});
  notifyDataUpdated();
};

export const deleteQuestion = (questionId: string): void => {
  const questions = getAllQuestions().filter(q => q.id !== questionId);
  setStored(STORAGE_KEYS.QUESTIONS, questions);
  deleteQuestionFromSupabase(questionId).catch(() => {});
  notifyDataUpdated();
};

// --- SUBMISSIONS & REKAP ---
export const getAllSubmissions = (): ExamSubmission[] => {
  return getStored<ExamSubmission[]>(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
};

export const saveSubmissions = (submissions: ExamSubmission[]): void => {
  setStored(STORAGE_KEYS.SUBMISSIONS, submissions);
  notifyDataUpdated();
};

// Calculate automated grading for student submission
export const gradeSubmission = (
  exam: Exam,
  questions: Question[],
  student: User,
  studentAnswers: Record<string, any>,
  violationCount: number,
  startedAt: string
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
          // Calculate overlap
          const truePositives = studentList.filter(idx => correctList.includes(idx)).length;
          const falsePositives = studentList.filter(idx => !correctList.includes(idx)).length;
          // Fractional credit
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
        // Automatic keyword & depth analysis
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

          // Score based on word length + keyword relevance
          const wordCount = text.split(/\s+/).length;
          let scoreRatio = 0.5; // baseline attempt
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
    answers: studentAnswers,
    earnedScore,
    totalScore: totalPossible,
    percentage,
    passed,
    violationCount,
    startedAt,
    submittedAt: new Date().toISOString(),
    evaluatedAnswers
  };

  const allSubmissions = getAllSubmissions();
  // Replace if student re-took or add new
  const updated = [submission, ...allSubmissions.filter(s => !(s.examId === exam.id && s.studentId === student.id))];
  saveSubmissions(updated);
  syncSubmissionToSupabase(submission).catch(() => {});

  return submission;
};

// Reset system data to default initial state
export const resetToInitialData = (): void => {
  setStored(STORAGE_KEYS.USERS, INITIAL_USERS);
  setStored(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
  setStored(STORAGE_KEYS.EXAMS, INITIAL_EXAMS);
  setStored(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
  setStored(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
};
