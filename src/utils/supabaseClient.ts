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
export const SUPABASE_SETUP_SQL = `-- ====================================================================
-- SKRIP STRUKTUR DATABASE LENGKAP: PORTAL UJIAN SISWA CBT (SPANJU)
-- Salin seluruh teks ini dan jalankan di Supabase Dashboard -> SQL Editor
-- Link: https://supabase.com/dashboard/project/omuhzeuzxfincumsnjrd/sql
-- ====================================================================

-- 1. TABEL PENGGUNA (Admin, Guru, Siswa)
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

-- Indeks untuk pencarian cepat
CREATE INDEX IF NOT EXISTS idx_cbt_users_role ON public.cbt_users(role);
CREATE INDEX IF NOT EXISTS idx_cbt_users_username ON public.cbt_users(username);
CREATE INDEX IF NOT EXISTS idx_cbt_users_class ON public.cbt_users(class_group);

-- 2. TABEL MATA PELAJARAN
CREATE TABLE IF NOT EXISTS public.cbt_subjects (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  passing_grade NUMERIC DEFAULT 75,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL PAKET UJIAN
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

CREATE INDEX IF NOT EXISTS idx_cbt_exams_status ON public.cbt_exams(status);

-- 4. TABEL BUTIR SOAL
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

CREATE INDEX IF NOT EXISTS idx_cbt_questions_exam_id ON public.cbt_questions(exam_id);

-- 5. TABEL HASIL & SUBMISI UJIAN SISWA
CREATE TABLE IF NOT EXISTS public.cbt_submissions (
  id TEXT PRIMARY KEY,
  exam_id TEXT NOT NULL,
  exam_title TEXT,
  subject_name TEXT,
  student_id TEXT NOT NULL,
  student_name TEXT,
  student_class TEXT,
  student_nip_or_nis TEXT,
  answers JSONB DEFAULT '{}'::jsonb,
  earned_score NUMERIC DEFAULT 0,
  total_score NUMERIC DEFAULT 100,
  percentage NUMERIC DEFAULT 0,
  passed BOOLEAN DEFAULT FALSE,
  violation_count INTEGER DEFAULT 0,
  violation_logs JSONB DEFAULT '[]'::jsonb,
  started_at TEXT,
  submitted_at TEXT,
  evaluated_answers JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cbt_submissions_exam_student ON public.cbt_submissions(exam_id, student_id);

-- 6. TABEL UNIVERSAL SYNC & BACKUP
CREATE TABLE IF NOT EXISTS public.cbt_sync_store (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) & AKSES PUBLIK (ANON)
-- ====================================================================
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

-- ====================================================================
-- REALTIME SUBSCRIPTIONS (Aman dieksekusi berulang kali)
-- ====================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_class pc ON pr.prrelid = pc.oid
    JOIN pg_publication p ON pr.prpubid = p.oid
    WHERE p.pubname = 'supabase_realtime' AND pc.relname = 'cbt_users'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.cbt_users;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_class pc ON pr.prrelid = pc.oid
    JOIN pg_publication p ON pr.prpubid = p.oid
    WHERE p.pubname = 'supabase_realtime' AND pc.relname = 'cbt_subjects'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.cbt_subjects;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_class pc ON pr.prrelid = pc.oid
    JOIN pg_publication p ON pr.prpubid = p.oid
    WHERE p.pubname = 'supabase_realtime' AND pc.relname = 'cbt_exams'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.cbt_exams;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_class pc ON pr.prrelid = pc.oid
    JOIN pg_publication p ON pr.prpubid = p.oid
    WHERE p.pubname = 'supabase_realtime' AND pc.relname = 'cbt_questions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.cbt_questions;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_class pc ON pr.prrelid = pc.oid
    JOIN pg_publication p ON pr.prpubid = p.oid
    WHERE p.pubname = 'supabase_realtime' AND pc.relname = 'cbt_submissions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.cbt_submissions;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_class pc ON pr.prrelid = pc.oid
    JOIN pg_publication p ON pr.prpubid = p.oid
    WHERE p.pubname = 'supabase_realtime' AND pc.relname = 'cbt_sync_store'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.cbt_sync_store;
  END IF;
END $$;
`;
