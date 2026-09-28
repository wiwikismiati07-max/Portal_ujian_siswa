import { User, Subject, Exam, Question, ExamSubmission } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user_admin_1',
    username: 'admin',
    password: 'admin123',
    name: 'Drs. H. Mulyono, M.M. (Administrator)',
    role: 'admin',
    nipOrNis: '197508122000031001',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_guru_2',
    username: 'siti_guru',
    password: 'guru123',
    name: 'Siti Rahmawati, S.Pd., M.Si.',
    role: 'guru',
    nipOrNis: '198607212010012015',
    subjectName: 'Ilmu Pengetahuan Alam (IPA)',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'subj_inf',
    code: 'INF-10',
    name: 'Informatika & Literasi Digital',
    teacherName: 'Aris Fitrianto, M.Pd.',
    passingGrade: 75
  },
  {
    id: 'subj_ipa',
    code: 'IPA-10',
    name: 'Ilmu Pengetahuan Alam (IPA)',
    teacherName: 'Siti Rahmawati, S.Pd., M.Si.',
    passingGrade: 75
  },
  {
    id: 'subj_mat',
    code: 'MAT-10',
    name: 'Matematika Umum',
    teacherName: 'Dra. Endang Sulastri',
    passingGrade: 72
  },
  {
    id: 'subj_ind',
    code: 'IND-10',
    name: 'Bahasa Indonesia',
    teacherName: 'Agus Pramono, M.Hum.',
    passingGrade: 75
  },
  {
    id: 'subj_arb',
    code: 'ARB-10',
    name: 'Bahasa Arab & Studi Keagamaan (اللغة العربية)',
    teacherName: 'Ust. Ahmad Fauzi, Lc., M.Pd.I.',
    passingGrade: 75
  }
];

export const INITIAL_EXAMS: Exam[] = [];

export const INITIAL_QUESTIONS: Question[] = [];

export const INITIAL_SUBMISSIONS: ExamSubmission[] = [];

