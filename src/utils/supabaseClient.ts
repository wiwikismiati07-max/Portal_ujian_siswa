import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration from environment or defaults specified by user
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://omuhzeuzxfincumsnjrd.supabase.co';
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_dcCL8dglfnTvju6ejPjcOA__IAS7Dip';

// Export the initialized Supabase client
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Complete SQL setup script for Supabase SQL Editor
export const SUPABASE_SETUP_SQL = `-- CBT System Schema for Supabase
-- Jalankan skrip ini di Supabase SQL Editor (Dashboard > SQL Editor):
-- https://supabase.com/dashboard/project/omuhzeuzxfincumsnjrd/sql

-- 1. Tabel Pengguna (Admin, Guru, Siswa)
CREATE TABLE IF NOT EXISTS public.cbt_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  nip_or_nis TEXT,
  class_group TEXT,
  subject_name TEXT,
  avatar TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Mata Pelajaran
CREATE TABLE IF NOT EXISTS public.cbt_subjects (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  passing_grade NUMERIC DEFAULT 75,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Paket Ujian
CREATE TABLE IF NOT EXISTS public.cbt_exams (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subject_id TEXT,
  subject_name TEXT,
  teacher_id TEXT,
  teacher_name TEXT,
  target_classes JSONB DEFAULT '[]'::jsonb,
  duration_minutes INTEGER DEFAULT 60,
  total_score NUMERIC DEFAULT 100,
  passing_score NUMERIC DEFAULT 75,
  status TEXT DEFAULT 'active',
  instructions TEXT,
  created_at TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Butir Soal
CREATE TABLE IF NOT EXISTS public.cbt_questions (
  id TEXT PRIMARY KEY,
  exam_id TEXT NOT NULL,
  type TEXT NOT NULL,
  prompt TEXT NOT NULL,
  points NUMERIC DEFAULT 10,
  options JSONB,
  option_images JSONB,
  correct_single INTEGER,
  correct_multi JSONB,
  true_false_items JSONB,
  matching_pairs JSONB,
  case_context TEXT,
  case_keywords JSONB,
  rubric_notes TEXT,
  explanation TEXT,
  image_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabel Submisi / Hasil Ujian Siswa
CREATE TABLE IF NOT EXISTS public.cbt_submissions (
  id TEXT PRIMARY KEY,
  exam_id TEXT NOT NULL,
  exam_title TEXT,
  subject_name TEXT,
  student_id TEXT NOT NULL,
  student_name TEXT,
  student_class TEXT,
  answers JSONB DEFAULT '{}'::jsonb,
  earned_score NUMERIC DEFAULT 0,
  total_score NUMERIC DEFAULT 100,
  percentage NUMERIC DEFAULT 0,
  passed BOOLEAN DEFAULT FALSE,
  violation_count INTEGER DEFAULT 0,
  started_at TEXT,
  submitted_at TEXT,
  evaluated_answers JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabel Universal Storage (Sync Cepat & Redundansi)
CREATE TABLE IF NOT EXISTS public.cbt_sync_store (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aktifkan Row Level Security (RLS) & Berikan Akses Read/Write Publik
ALTER TABLE public.cbt_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbt_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbt_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbt_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbt_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbt_sync_store ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  -- Hapus policy lama jika ada
  DROP POLICY IF EXISTS "cbt_users_all" ON public.cbt_users;
  DROP POLICY IF EXISTS "cbt_subjects_all" ON public.cbt_subjects;
  DROP POLICY IF EXISTS "cbt_exams_all" ON public.cbt_exams;
  DROP POLICY IF EXISTS "cbt_questions_all" ON public.cbt_questions;
  DROP POLICY IF EXISTS "cbt_submissions_all" ON public.cbt_submissions;
  DROP POLICY IF EXISTS "cbt_sync_store_all" ON public.cbt_sync_store;

  -- Buat policy baru yang mengizinkan semua transaksi CBT
  CREATE POLICY "cbt_users_all" ON public.cbt_users FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "cbt_subjects_all" ON public.cbt_subjects FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "cbt_exams_all" ON public.cbt_exams FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "cbt_questions_all" ON public.cbt_questions FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "cbt_submissions_all" ON public.cbt_submissions FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "cbt_sync_store_all" ON public.cbt_sync_store FOR ALL USING (true) WITH CHECK (true);
END $$;

-- Aktifkan Supabase Realtime agar multi-user tersinkronisasi otomatis
ALTER PUBLICATION supabase_realtime ADD TABLE public.cbt_users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cbt_subjects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cbt_exams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cbt_questions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cbt_submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cbt_sync_store;
`;
