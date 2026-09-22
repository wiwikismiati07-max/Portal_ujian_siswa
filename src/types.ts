export type UserRole = 'admin' | 'guru' | 'siswa';

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: UserRole;
  nipOrNis?: string;
  classGroup?: string; // for students (e.g. "X-IPA-1", "X-IPA-2", "XI-IPA-1")
  subjectName?: string; // for teachers (e.g. "Informatika", "IPA Terpadu")
  avatar?: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  teacherName: string;
  passingGrade: number; // KKM (e.g. 75)
}

export type QuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'true_false'
  | 'matching'
  | 'case_study';

export interface TrueFalseStatement {
  id: string;
  statement: string;
  isCorrect: boolean; // true = Benar, false = Salah
}

export interface MatchingPair {
  id: string;
  left: string; // Premise / Soal kiri
  right: string; // Match / Pasangan kanan
}

export interface MatchingPremise {
  id: string;
  text: string; // Kolom A: Pertanyaan / Pernyataan
  imageUrl?: string; // Gambar Kolom A (opsional)
  correctOptionId: string; // ID of the correct option in Kolom B
}

export interface MatchingOption {
  id: string;
  label: string; // "A", "B", "C", "D", "E", "F"...
  text: string; // Kolom B: Teks Pilihan Jawaban
  imageUrl?: string; // Gambar Kolom B (opsional)
}

export interface MatchingData {
  premises: MatchingPremise[]; // Kolom A
  options: MatchingOption[]; // Kolom B (termasuk pengecoh)
}

export interface Question {
  id: string;
  examId: string;
  type: QuestionType;
  prompt: string;
  instructions?: string; // Petunjuk pengerjaan khusus butir soal (opsional)
  points: number; // e.g. 20
  options?: string[]; // For single_choice & multiple_choice (e.g. ["A...", "B..."])
  correctSingle?: number; // index 0..4 for single choice
  correctMulti?: number[]; // array of indices for multiple choice
  trueFalseItems?: TrueFalseStatement[]; // for true_false
  matchingPairs?: MatchingPair[]; // legacy matching
  matchingData?: MatchingData; // for matching (Kolom A & Kolom B + distractors)
  caseContext?: string; // Scenario / Reading text / stimulus for case study
  caseKeywords?: string[]; // keywords or reference answer for grading case study
  rubricNotes?: string; // panduan penilaian untuk guru
  explanation?: string; // pembahasan soal untuk guru/laporan
  imageUrl?: string;
  optionImages?: (string | undefined)[]; // optional images for each option index
}

export interface Exam {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  targetClasses: string[]; // e.g. ["X-IPA-1", "X-IPA-2"]
  durationMinutes: number;
  totalScore: number;
  passingScore: number;
  status: 'active' | 'draft' | 'closed';
  instructions?: string;
  createdAt: string;
  uploadDate?: string; // Tanggal & Waktu Upload / Rilis Ujian
}

export interface ViolationLog {
  id: string;
  timestamp: string; // ISO string
  formattedTime: string; // e.g. "08:15:32"
  reason: string; // e.g. "Beralih tab browser / meminimalkan layar"
  violationNumber: number; // e.g. 1, 2, 3
}

export interface AppLink {
  id: string;
  title: string;
  url: string;
  category?: string;
  iconName?: string;
  color?: 'indigo' | 'emerald' | 'amber' | 'blue' | 'rose' | 'purple' | 'cyan' | 'teal';
  description?: string;
  isInternal?: boolean;
  badge?: string;
}

export interface ExamSubmission {
  id: string;
  examId: string;
  examTitle: string;
  subjectName: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  studentNipOrNis?: string;
  answers: Record<string, any>; // questionId -> student answer
  earnedScore: number;
  totalScore: number;
  percentage: number;
  passed: boolean;
  violationCount: number;
  violationLogs?: ViolationLog[];
  startedAt: string;
  submittedAt: string;
  evaluatedAnswers?: Record<
    string,
    {
      earned: number;
      max: number;
      isCorrect: boolean;
      feedback?: string;
    }
  >;
}
