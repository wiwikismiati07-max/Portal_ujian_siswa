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
  upload_date TEXT,
  is_upload_date_locked BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration columns for cbt_exams if already created earlier
ALTER TABLE public.cbt_exams ADD COLUMN IF NOT EXISTS upload_date TEXT;
ALTER TABLE public.cbt_exams ADD COLUMN IF NOT EXISTS is_upload_date_locked BOOLEAN DEFAULT true;

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
  matching_data JSONB,
  case_context TEXT,
  case_keywords JSONB,
  rubric_notes TEXT,
  explanation TEXT,
  image_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migrasi aman kolom untuk cbt_questions jika tabel sudah ada sebelumnya
ALTER TABLE IF EXISTS public.cbt_questions ADD COLUMN IF NOT EXISTS matching_data JSONB;
ALTER TABLE IF EXISTS public.cbt_questions ADD COLUMN IF NOT EXISTS option_images JSONB;
ALTER TABLE IF EXISTS public.cbt_questions ADD COLUMN IF NOT EXISTS true_false_items JSONB;
ALTER TABLE IF EXISTS public.cbt_questions ADD COLUMN IF NOT EXISTS matching_pairs JSONB;
ALTER TABLE IF EXISTS public.cbt_questions ADD COLUMN IF NOT EXISTS case_context TEXT;
ALTER TABLE IF EXISTS public.cbt_questions ADD COLUMN IF NOT EXISTS case_keywords JSONB;
ALTER TABLE IF EXISTS public.cbt_questions ADD COLUMN IF NOT EXISTS rubric_notes TEXT;
ALTER TABLE IF EXISTS public.cbt_questions ADD COLUMN IF NOT EXISTS explanation TEXT;
ALTER TABLE IF EXISTS public.cbt_questions ADD COLUMN IF NOT EXISTS image_url TEXT;

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

-- Migrasi aman untuk tabel yang sudah ada sebelumnya
ALTER TABLE IF EXISTS public.cbt_submissions ADD COLUMN IF NOT EXISTS violation_count INTEGER DEFAULT 0;
ALTER TABLE IF EXISTS public.cbt_submissions ADD COLUMN IF NOT EXISTS violation_logs JSONB DEFAULT '[]'::jsonb;
ALTER TABLE IF EXISTS public.cbt_submissions ADD COLUMN IF NOT EXISTS student_nip_or_nis TEXT;
ALTER TABLE IF EXISTS public.cbt_submissions ADD COLUMN IF NOT EXISTS evaluated_answers JSONB;

CREATE INDEX IF NOT EXISTS idx_cbt_submissions_exam_student ON public.cbt_submissions(exam_id, student_id);

-- 6. TABEL UNIVERSAL SYNC & BACKUP
CREATE TABLE IF NOT EXISTS public.cbt_sync_store (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABEL REKAP NILAI SISWA SEMUA MATA PELAJARAN (SPANJU)
CREATE TABLE IF NOT EXISTS public.cbt_rekap_nilai_siswa (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  student_nip_or_nis TEXT,
  student_nisn TEXT,
  student_name TEXT NOT NULL,
  student_class TEXT NOT NULL,
  academic_year TEXT DEFAULT '2025/2026',
  semester TEXT DEFAULT 'Ganjil',
  subject_id TEXT,
  subject_name TEXT NOT NULL,
  exam_id TEXT NOT NULL,
  exam_title TEXT NOT NULL,
  earned_score NUMERIC DEFAULT 0,
  total_score NUMERIC DEFAULT 100,
  nilai_akhir NUMERIC DEFAULT 0,
  kkm NUMERIC DEFAULT 75,
  status_kelulusan TEXT DEFAULT 'BELUM MENGERJAKAN',
  predikat TEXT DEFAULT 'D',
  violation_count INTEGER DEFAULT 0,
  catatan_integritas TEXT DEFAULT 'Tertib (0 Pelanggaran)',
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE IF EXISTS public.cbt_rekap_nilai_siswa ADD COLUMN IF NOT EXISTS student_nip_or_nis TEXT;
ALTER TABLE IF EXISTS public.cbt_rekap_nilai_siswa ADD COLUMN IF NOT EXISTS student_nisn TEXT;

CREATE INDEX IF NOT EXISTS idx_cbt_rekap_student_id ON public.cbt_rekap_nilai_siswa(student_id);
CREATE INDEX IF NOT EXISTS idx_cbt_rekap_student_class ON public.cbt_rekap_nilai_siswa(student_class);
CREATE INDEX IF NOT EXISTS idx_cbt_rekap_subject_name ON public.cbt_rekap_nilai_siswa(subject_name);
CREATE INDEX IF NOT EXISTS idx_cbt_rekap_exam_id ON public.cbt_rekap_nilai_siswa(exam_id);

-- 8. TABEL BERITA ACARA KEGIATAN UJIAN SISWA
CREATE TABLE IF NOT EXISTS public.cbt_berita_acara (
  id TEXT PRIMARY KEY,
  exam_id TEXT NOT NULL,
  exam_title TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  target_classes JSONB DEFAULT '[]'::jsonb,
  academic_year TEXT DEFAULT '2025/2026',
  semester TEXT DEFAULT 'Ganjil',
  event_date_iso TEXT,
  event_date TEXT,
  session_time TEXT,
  session_name TEXT,
  room_location TEXT,
  proctor_name TEXT NOT NULL,
  proctor_nip TEXT,
  headmaster_name TEXT DEFAULT 'NUR FADILAH, S.Pd,.MPd',
  headmaster_nip TEXT DEFAULT '19860410 201001 2 030',
  total_registered INTEGER DEFAULT 0,
  total_present INTEGER DEFAULT 0,
  total_absent INTEGER DEFAULT 0,
  attendance_percentage NUMERIC(5,2) DEFAULT 100.00,
  absent_students JSONB DEFAULT '[]'::jsonb,
  condition_notes TEXT,
  technical_issues TEXT,
  proctor_action TEXT,
  signature_proctor TEXT,
  signature_headmaster TEXT,
  status TEXT DEFAULT 'final',
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cbt_berita_acara_exam_id ON public.cbt_berita_acara(exam_id);
CREATE INDEX IF NOT EXISTS idx_cbt_berita_acara_event_date ON public.cbt_berita_acara(event_date_iso);
CREATE INDEX IF NOT EXISTS idx_cbt_berita_acara_proctor ON public.cbt_berita_acara(proctor_name);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) & AKSES PUBLIK (ANON)
-- ====================================================================
ALTER TABLE public.cbt_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbt_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbt_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbt_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbt_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbt_sync_store ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbt_rekap_nilai_siswa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbt_berita_acara ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  -- Hapus policy lama jika ada
  DROP POLICY IF EXISTS "cbt_users_all" ON public.cbt_users;
  DROP POLICY IF EXISTS "cbt_subjects_all" ON public.cbt_subjects;
  DROP POLICY IF EXISTS "cbt_exams_all" ON public.cbt_exams;
  DROP POLICY IF EXISTS "cbt_questions_all" ON public.cbt_questions;
  DROP POLICY IF EXISTS "cbt_submissions_all" ON public.cbt_submissions;
  DROP POLICY IF EXISTS "cbt_sync_store_all" ON public.cbt_sync_store;
  DROP POLICY IF EXISTS "cbt_rekap_nilai_siswa_all" ON public.cbt_rekap_nilai_siswa;
  DROP POLICY IF EXISTS "cbt_berita_acara_all" ON public.cbt_berita_acara;

  -- Buat policy baru yang mengizinkan semua transaksi CBT
  CREATE POLICY "cbt_users_all" ON public.cbt_users FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "cbt_subjects_all" ON public.cbt_subjects FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "cbt_exams_all" ON public.cbt_exams FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "cbt_questions_all" ON public.cbt_questions FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "cbt_submissions_all" ON public.cbt_submissions FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "cbt_sync_store_all" ON public.cbt_sync_store FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "cbt_rekap_nilai_siswa_all" ON public.cbt_rekap_nilai_siswa FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "cbt_berita_acara_all" ON public.cbt_berita_acara FOR ALL USING (true) WITH CHECK (true);
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

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_class pc ON pr.prrelid = pc.oid
    JOIN pg_publication p ON pr.prpubid = p.oid
    WHERE p.pubname = 'supabase_realtime' AND pc.relname = 'cbt_rekap_nilai_siswa'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.cbt_rekap_nilai_siswa;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_class pc ON pr.prrelid = pc.oid
    JOIN pg_publication p ON pr.prpubid = p.oid
    WHERE p.pubname = 'supabase_realtime' AND pc.relname = 'cbt_berita_acara'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.cbt_berita_acara;
  END IF;
END $$;
`;

// Skrip SQL khusus untuk membuat dan mengaktifkan tabel Bank Soal (cbt_questions) di Supabase
export const SUPABASE_QUESTIONS_TABLE_SQL = `-- ====================================================================
-- SKRIP KHUSUS TABEL BANK SOAL: cbt_questions (PORTAL CBT SPANJU)
-- Salin seluruh teks ini dan jalankan di Supabase Dashboard -> SQL Editor
-- Link: https://supabase.com/dashboard/project/omuhzeuzxfincumsnjrd/sql
-- ====================================================================

-- 1. Buat Tabel cbt_questions jika belum ada
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
  matching_data JSONB,
  case_context TEXT,
  case_keywords JSONB,
  rubric_notes TEXT,
  explanation TEXT,
  image_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Pastikan semua kolom baru ditambahkan jika tabel sudah pernah dibuat sebelumnya
ALTER TABLE IF EXISTS public.cbt_questions ADD COLUMN IF NOT EXISTS matching_data JSONB;
ALTER TABLE IF EXISTS public.cbt_questions ADD COLUMN IF NOT EXISTS option_images JSONB;
ALTER TABLE IF EXISTS public.cbt_questions ADD COLUMN IF NOT EXISTS true_false_items JSONB;
ALTER TABLE IF EXISTS public.cbt_questions ADD COLUMN IF NOT EXISTS matching_pairs JSONB;
ALTER TABLE IF EXISTS public.cbt_questions ADD COLUMN IF NOT EXISTS case_context TEXT;
ALTER TABLE IF EXISTS public.cbt_questions ADD COLUMN IF NOT EXISTS case_keywords JSONB;
ALTER TABLE IF EXISTS public.cbt_questions ADD COLUMN IF NOT EXISTS rubric_notes TEXT;
ALTER TABLE IF EXISTS public.cbt_questions ADD COLUMN IF NOT EXISTS explanation TEXT;
ALTER TABLE IF EXISTS public.cbt_questions ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 3. Indeks pencarian cepat soal berdasarkan ID paket ujian
CREATE INDEX IF NOT EXISTS idx_cbt_questions_exam_id ON public.cbt_questions(exam_id);

-- 4. Aktifkan Row Level Security (RLS) & Kebijakan Akses Penuh untuk Aplikasi CBT
ALTER TABLE public.cbt_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cbt_questions_all" ON public.cbt_questions;
CREATE POLICY "cbt_questions_all" ON public.cbt_questions 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- 5. Tambahkan tabel cbt_questions ke publikasi Realtime Supabase
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_class pc ON pr.prrelid = pc.oid
    JOIN pg_publication p ON pr.prpubid = p.oid
    WHERE p.pubname = 'supabase_realtime' AND pc.relname = 'cbt_questions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.cbt_questions;
  END IF;
END $$;
`;

// SQL Rekapitulasi Nilai & Analisis Ketuntasan Siswa
export const SUPABASE_REKAP_NILAI_SQL = `-- ====================================================================
-- SKRIP SQL: REKAPITULASI HASIL NILAI & ANALISIS ASESMEN SISWA (SPANJU)
-- UPT SMP NEGERI 7 PASURUAN
-- Salin dan jalankan di Supabase Dashboard -> SQL Editor
-- Link: https://supabase.com/dashboard/project/omuhzeuzxfincumsnjrd/sql
-- ====================================================================

-- 0. PASTIKAN STRUKTUR TABEL CBT_SUBMISSIONS LENGKAP JIKA TABEL SUDAH PERNAH DIBUAT
ALTER TABLE IF EXISTS public.cbt_submissions ADD COLUMN IF NOT EXISTS student_nip_or_nis TEXT;
ALTER TABLE IF EXISTS public.cbt_submissions ADD COLUMN IF NOT EXISTS violation_count INTEGER DEFAULT 0;
ALTER TABLE IF EXISTS public.cbt_submissions ADD COLUMN IF NOT EXISTS violation_logs JSONB DEFAULT '[]'::jsonb;
ALTER TABLE IF EXISTS public.cbt_submissions ADD COLUMN IF NOT EXISTS evaluated_answers JSONB;

-- 1. VIEW REKAP NILAI LENGKAP PER KELAS & MAPEL
CREATE OR REPLACE VIEW public.v_rekap_nilai_lengkap AS
SELECT 
  ROW_NUMBER() OVER(PARTITION BY s.exam_id, s.student_class ORDER BY s.student_name ASC) AS no_absen,
  COALESCE(u.nip_or_nis, '-') AS nisn,
  s.student_name AS nama_lengkap_siswa,
  s.student_class AS kelas,
  s.subject_name AS mata_pelajaran,
  s.exam_title AS judul_ujian,
  s.earned_score AS skor_diperoleh,
  s.total_score AS skor_maksimal,
  s.percentage AS nilai_akhir,
  CASE 
    WHEN s.percentage >= 75 THEN 'TUNTAS' 
    ELSE 'REMEDIAL' 
  END AS status_kelulusan,
  s.violation_count AS jumlah_pelanggaran_integritas,
  CASE 
    WHEN s.violation_count = 0 THEN 'Tertib (0 Pelanggaran)'
    ELSE CONCAT(s.violation_count, 'x Pelanggaran')
  END AS catatan_integritas,
  s.started_at AS waktu_mulai,
  s.submitted_at AS waktu_submit,
  s.exam_id,
  s.student_id
FROM public.cbt_submissions s
LEFT JOIN public.cbt_users u ON s.student_id = u.id
WHERE s.submitted_at IS NOT NULL
ORDER BY s.student_class ASC, s.student_name ASC;

-- 2. VIEW ANALISIS & STATISTIK KETUNTASAN PER KELAS & UJIAN
CREATE OR REPLACE VIEW public.v_rekap_statistik_kelas AS
SELECT 
  s.exam_id,
  s.exam_title AS judul_ujian,
  s.subject_name AS mata_pelajaran,
  s.student_class AS kelas,
  COUNT(s.id) AS jumlah_peserta_mengerjakan,
  ROUND(AVG(s.percentage), 2) AS rata_rata_nilai,
  MAX(s.percentage) AS nilai_tertinggi,
  MIN(s.percentage) AS nilai_terendah,
  COUNT(CASE WHEN s.percentage >= 75 THEN 1 END) AS jumlah_tuntas,
  COUNT(CASE WHEN s.percentage < 75 THEN 1 END) AS jumlah_remedial,
  ROUND((COUNT(CASE WHEN s.percentage >= 75 THEN 1 END)::NUMERIC / NULLIF(COUNT(s.id), 0)) * 100, 2) AS persentase_ketuntasan_klasikal,
  CASE 
    WHEN ((COUNT(CASE WHEN s.percentage >= 75 THEN 1 END)::NUMERIC / NULLIF(COUNT(s.id), 0)) * 100) >= 85 
    THEN 'TUNTAS KLASIKAL' 
    ELSE 'BELUM TUNTAS KLASIKAL' 
  END AS status_klasikal
FROM public.cbt_submissions s
WHERE s.submitted_at IS NOT NULL
GROUP BY s.exam_id, s.exam_title, s.subject_name, s.student_class;

-- 3. VIEW DAFTAR SISWA REMEDIAL (Nilai < KKM 75)
CREATE OR REPLACE VIEW public.v_siswa_remedial AS
SELECT 
  COALESCE(u.nip_or_nis, '-') AS nisn,
  s.student_name AS nama_siswa,
  s.student_class AS kelas,
  s.subject_name AS mata_pelajaran,
  s.exam_title AS judul_ujian,
  s.percentage AS nilai,
  'Bimbingan Khusus & Tes Remedial' AS program_tindak_lanjut,
  s.submitted_at
FROM public.cbt_submissions s
LEFT JOIN public.cbt_users u ON s.student_id = u.id
WHERE s.submitted_at IS NOT NULL AND s.percentage < 75
ORDER BY s.student_class ASC, s.percentage ASC;

-- 4. VIEW MONITORING SISWA YANG BELUM UJIAN (Berdasarkan Master Data Siswa)
CREATE OR REPLACE VIEW public.v_siswa_belum_ujian AS
SELECT 
  u.id AS student_id,
  u.nip_or_nis AS nisn,
  u.name AS nama_siswa,
  u.class_group AS kelas,
  e.id AS exam_id,
  e.title AS judul_ujian,
  e.subject_name AS mata_pelajaran,
  'BELUM MENGERJAKAN' AS status_kehadiran
FROM public.cbt_users u
CROSS JOIN public.cbt_exams e
WHERE u.role = 'siswa'
  AND (
    e.target_classes IS NULL 
    OR e.target_classes = '[]'::jsonb 
    OR e.target_classes ? u.class_group
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.cbt_submissions sub 
    WHERE sub.exam_id = e.id AND sub.student_id = u.id AND sub.submitted_at IS NOT NULL
  )
ORDER BY u.class_group ASC, u.name ASC;
`;

// Skrip Khusus: TABEL REKAP NILAI SISWA SEMUA MATA PELAJARAN (SPANJU)
export const SUPABASE_REKAP_NILAI_TABLE_SQL = `-- ====================================================================
-- SKRIP TABEL REKAP NILAI SISWA SEMUA MATA PELAJARAN DI SUPABASE
-- UPT SMP NEGERI 7 PASURUAN (SPANJU)
-- Salin seluruh skrip ini dan jalankan di Supabase Dashboard -> SQL Editor
-- Link: https://supabase.com/dashboard/project/omuhzeuzxfincumsnjrd/sql
-- ====================================================================

-- 0. PASTIKAN STRUKTUR TABEL cbt_submissions SUDAH TERUPDATE
ALTER TABLE IF EXISTS public.cbt_submissions ADD COLUMN IF NOT EXISTS student_nip_or_nis TEXT;
ALTER TABLE IF EXISTS public.cbt_submissions ADD COLUMN IF NOT EXISTS violation_count INTEGER DEFAULT 0;
ALTER TABLE IF EXISTS public.cbt_submissions ADD COLUMN IF NOT EXISTS violation_logs JSONB DEFAULT '[]'::jsonb;
ALTER TABLE IF EXISTS public.cbt_submissions ADD COLUMN IF NOT EXISTS evaluated_answers JSONB;

-- 1. BUAT TABEL REKAP NILAI SISWA JIKA BELUM ADA
CREATE TABLE IF NOT EXISTS public.cbt_rekap_nilai_siswa (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  student_nip_or_nis TEXT,
  student_nisn TEXT,
  student_name TEXT NOT NULL,
  student_class TEXT NOT NULL,
  academic_year TEXT DEFAULT '2025/2026',
  semester TEXT DEFAULT 'Ganjil',
  subject_id TEXT,
  subject_name TEXT NOT NULL,
  exam_id TEXT NOT NULL,
  exam_title TEXT NOT NULL,
  earned_score NUMERIC DEFAULT 0,
  total_score NUMERIC DEFAULT 100,
  nilai_akhir NUMERIC DEFAULT 0,
  kkm NUMERIC DEFAULT 75,
  status_kelulusan TEXT DEFAULT 'BELUM MENGERJAKAN',
  predikat TEXT DEFAULT 'D',
  violation_count INTEGER DEFAULT 0,
  catatan_integritas TEXT DEFAULT 'Tertib (0 Pelanggaran)',
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MIGRASI AMAN KOLOM JIKA TABEL SUDAH ADA SEBELUMNYA
ALTER TABLE IF EXISTS public.cbt_rekap_nilai_siswa ADD COLUMN IF NOT EXISTS student_nip_or_nis TEXT;
ALTER TABLE IF EXISTS public.cbt_rekap_nilai_siswa ADD COLUMN IF NOT EXISTS student_nisn TEXT;
ALTER TABLE IF EXISTS public.cbt_rekap_nilai_siswa ADD COLUMN IF NOT EXISTS academic_year TEXT DEFAULT '2025/2026';
ALTER TABLE IF EXISTS public.cbt_rekap_nilai_siswa ADD COLUMN IF NOT EXISTS semester TEXT DEFAULT 'Ganjil';
ALTER TABLE IF EXISTS public.cbt_rekap_nilai_siswa ADD COLUMN IF NOT EXISTS subject_id TEXT;
ALTER TABLE IF EXISTS public.cbt_rekap_nilai_siswa ADD COLUMN IF NOT EXISTS kkm NUMERIC DEFAULT 75;
ALTER TABLE IF EXISTS public.cbt_rekap_nilai_siswa ADD COLUMN IF NOT EXISTS predikat TEXT DEFAULT 'D';
ALTER TABLE IF EXISTS public.cbt_rekap_nilai_siswa ADD COLUMN IF NOT EXISTS violation_count INTEGER DEFAULT 0;
ALTER TABLE IF EXISTS public.cbt_rekap_nilai_siswa ADD COLUMN IF NOT EXISTS catatan_integritas TEXT DEFAULT 'Tertib (0 Pelanggaran)';

-- 3. INDEKS PENCARIAN CEPAT
CREATE INDEX IF NOT EXISTS idx_cbt_rekap_student_id ON public.cbt_rekap_nilai_siswa(student_id);
CREATE INDEX IF NOT EXISTS idx_cbt_rekap_student_class ON public.cbt_rekap_nilai_siswa(student_class);
CREATE INDEX IF NOT EXISTS idx_cbt_rekap_subject_name ON public.cbt_rekap_nilai_siswa(subject_name);
CREATE INDEX IF NOT EXISTS idx_cbt_rekap_exam_id ON public.cbt_rekap_nilai_siswa(exam_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cbt_rekap_student_exam_uniq ON public.cbt_rekap_nilai_siswa(student_id, exam_id);

-- 4. ROW LEVEL SECURITY (RLS) & AKSES PENUH CBT
ALTER TABLE public.cbt_rekap_nilai_siswa ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cbt_rekap_nilai_siswa_all" ON public.cbt_rekap_nilai_siswa;
CREATE POLICY "cbt_rekap_nilai_siswa_all" ON public.cbt_rekap_nilai_siswa
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. REALTIME SUBSCRIPTION
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_class pc ON pr.prrelid = pc.oid
    JOIN pg_publication p ON pr.prpubid = p.oid
    WHERE p.pubname = 'supabase_realtime' AND pc.relname = 'cbt_rekap_nilai_siswa'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.cbt_rekap_nilai_siswa;
  END IF;
END $$;

-- 6. FUNGSI & TRIGGER OTOMATIS: SINKRONKAN HASIL UJIAN SISWA KE TABEL REKAP SECARA REALTIME
CREATE OR REPLACE FUNCTION public.fn_sync_submission_to_rekap_nilai()
RETURNS TRIGGER AS $$
DECLARE
  v_student_name TEXT;
  v_student_class TEXT;
  v_student_nisn TEXT;
  v_predikat TEXT;
  v_status TEXT;
  v_kkm NUMERIC := 75;
  v_pct NUMERIC := 0;
BEGIN
  -- Ambil data siswa dari cbt_users jika kolom kosong
  SELECT name, class_group, nip_or_nis 
  INTO v_student_name, v_student_class, v_student_nisn
  FROM public.cbt_users 
  WHERE id = NEW.student_id;

  v_student_name := COALESCE(NEW.student_name, v_student_name, 'Siswa CBT');
  v_student_class := COALESCE(NEW.student_class, v_student_class, '-');
  v_student_nisn := COALESCE(NEW.student_nip_or_nis, v_student_nisn, '-');
  v_pct := COALESCE(NEW.percentage, 0);

  -- Hitung Predikat & Status
  IF v_pct >= 90 THEN
    v_predikat := 'A (Sangat Baik)';
  ELSIF v_pct >= 80 THEN
    v_predikat := 'B (Baik)';
  ELSIF v_pct >= 75 THEN
    v_predikat := 'C (Cukup)';
  ELSE
    v_predikat := 'D (Perlu Bimbingan)';
  END IF;

  IF v_pct >= v_kkm THEN
    v_status := 'TUNTAS';
  ELSE
    v_status := 'REMEDIAL';
  END IF;

  -- Upsert ke tabel cbt_rekap_nilai_siswa
  INSERT INTO public.cbt_rekap_nilai_siswa (
    id,
    student_id,
    student_name,
    student_nip_or_nis,
    student_nisn,
    student_class,
    academic_year,
    semester,
    subject_name,
    exam_id,
    exam_title,
    earned_score,
    total_score,
    nilai_akhir,
    kkm,
    status_kelulusan,
    predikat,
    violation_count,
    catatan_integritas,
    submitted_at,
    updated_at
  )
  VALUES (
    CONCAT('rekap_', NEW.student_id, '_', NEW.exam_id),
    NEW.student_id,
    v_student_name,
    v_student_nisn,
    v_student_nisn,
    v_student_class,
    '2025/2026',
    'Ganjil',
    COALESCE(NEW.subject_name, 'Mata Pelajaran'),
    NEW.exam_id,
    COALESCE(NEW.exam_title, 'Ujian CBT'),
    COALESCE(NEW.earned_score, 0),
    COALESCE(NEW.total_score, 100),
    v_pct,
    v_kkm,
    v_status,
    v_predikat,
    COALESCE(NEW.violation_count, 0),
    CASE 
      WHEN COALESCE(NEW.violation_count, 0) = 0 THEN 'Tertib (0 Pelanggaran)'
      ELSE CONCAT(NEW.violation_count, 'x Pelanggaran Integritas')
    END,
    CASE 
      WHEN NEW.submitted_at IS NOT NULL AND NEW.submitted_at <> '' 
      THEN NEW.submitted_at::TIMESTAMPTZ 
      ELSE NOW() 
    END,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    student_name = EXCLUDED.student_name,
    student_nip_or_nis = EXCLUDED.student_nip_or_nis,
    student_nisn = EXCLUDED.student_nisn,
    student_class = EXCLUDED.student_class,
    subject_name = EXCLUDED.subject_name,
    exam_title = EXCLUDED.exam_title,
    earned_score = EXCLUDED.earned_score,
    total_score = EXCLUDED.total_score,
    nilai_akhir = EXCLUDED.nilai_akhir,
    status_kelulusan = EXCLUDED.status_kelulusan,
    predikat = EXCLUDED.predikat,
    violation_count = EXCLUDED.violation_count,
    catatan_integritas = EXCLUDED.catatan_integritas,
    submitted_at = EXCLUDED.submitted_at,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Pasang Trigger di cbt_submissions
DROP TRIGGER IF EXISTS trg_cbt_submissions_rekap_sync ON public.cbt_submissions;
CREATE TRIGGER trg_cbt_submissions_rekap_sync
AFTER INSERT OR UPDATE ON public.cbt_submissions
FOR EACH ROW
EXECUTE FUNCTION public.fn_sync_submission_to_rekap_nilai();

-- 7. MIGRASIKAN DATA HASIL UJIAN YANG SUDAH ADA KE TABEL REKAP
INSERT INTO public.cbt_rekap_nilai_siswa (
  id,
  student_id,
  student_name,
  student_nip_or_nis,
  student_nisn,
  student_class,
  academic_year,
  semester,
  subject_name,
  exam_id,
  exam_title,
  earned_score,
  total_score,
  nilai_akhir,
  kkm,
  status_kelulusan,
  predikat,
  violation_count,
  catatan_integritas,
  submitted_at,
  updated_at
)
SELECT DISTINCT ON (s.student_id, s.exam_id)
  CONCAT('rekap_', s.student_id, '_', s.exam_id) AS id,
  s.student_id,
  COALESCE(s.student_name, u.name, 'Siswa CBT') AS student_name,
  COALESCE(u.nip_or_nis, '-') AS student_nip_or_nis,
  COALESCE(u.nip_or_nis, '-') AS student_nisn,
  COALESCE(s.student_class, u.class_group, '-') AS student_class,
  '2025/2026' AS academic_year,
  'Ganjil' AS semester,
  COALESCE(s.subject_name, 'Mata Pelajaran') AS subject_name,
  s.exam_id,
  COALESCE(s.exam_title, 'Ujian CBT') AS exam_title,
  COALESCE(s.earned_score, 0) AS earned_score,
  COALESCE(s.total_score, 100) AS total_score,
  COALESCE(s.percentage, 0) AS nilai_akhir,
  75 AS kkm,
  CASE 
    WHEN COALESCE(s.percentage, 0) >= 75 THEN 'TUNTAS' 
    ELSE 'REMEDIAL' 
  END AS status_kelulusan,
  CASE 
    WHEN COALESCE(s.percentage, 0) >= 90 THEN 'A (Sangat Baik)'
    WHEN COALESCE(s.percentage, 0) >= 80 THEN 'B (Baik)'
    WHEN COALESCE(s.percentage, 0) >= 75 THEN 'C (Cukup)'
    ELSE 'D (Perlu Bimbingan)'
  END AS predikat,
  COALESCE(s.violation_count, 0) AS violation_count,
  CASE 
    WHEN COALESCE(s.violation_count, 0) = 0 THEN 'Tertib (0 Pelanggaran)'
    ELSE CONCAT(s.violation_count, 'x Pelanggaran Integritas')
  END AS catatan_integritas,
  CASE 
    WHEN s.submitted_at IS NOT NULL AND s.submitted_at <> '' 
    THEN s.submitted_at::TIMESTAMPTZ 
    ELSE NOW() 
  END AS submitted_at,
  NOW() AS updated_at
FROM public.cbt_submissions s
LEFT JOIN public.cbt_users u ON s.student_id = u.id
WHERE s.submitted_at IS NOT NULL
ORDER BY s.student_id, s.exam_id, s.percentage DESC, s.submitted_at DESC
ON CONFLICT (id) DO UPDATE SET
  student_name = EXCLUDED.student_name,
  student_nip_or_nis = EXCLUDED.student_nip_or_nis,
  student_nisn = EXCLUDED.student_nisn,
  student_class = EXCLUDED.student_class,
  subject_name = EXCLUDED.subject_name,
  exam_title = EXCLUDED.exam_title,
  earned_score = EXCLUDED.earned_score,
  total_score = EXCLUDED.total_score,
  nilai_akhir = EXCLUDED.nilai_akhir,
  status_kelulusan = EXCLUDED.status_kelulusan,
  predikat = EXCLUDED.predikat,
  violation_count = EXCLUDED.violation_count,
  catatan_integritas = EXCLUDED.catatan_integritas,
  submitted_at = EXCLUDED.submitted_at,
  updated_at = NOW();

-- 8. VIEW BUKU RAPOR / LEDGER MATRIKS NILAI SISWA SEMUA MATA PELAJARAN
CREATE OR REPLACE VIEW public.v_rekap_ledger_semua_mapel AS
SELECT 
  ROW_NUMBER() OVER(PARTITION BY u.class_group ORDER BY u.name ASC) AS no_absen,
  u.id AS student_id,
  u.nip_or_nis AS nisn,
  u.name AS nama_siswa,
  u.class_group AS kelas,
  '2025/2026' AS tahun_ajaran,
  'Ganjil' AS semester,
  -- Nilai Per Mata Pelajaran (Mengambil nilai tertinggi/terakhir siswa)
  MAX(CASE WHEN r.subject_name ILIKE '%Agama%' OR r.subject_name ILIKE '%PAI%' THEN r.nilai_akhir END) AS pai,
  MAX(CASE WHEN r.subject_name ILIKE '%Pancasila%' OR r.subject_name ILIKE '%PPKn%' THEN r.nilai_akhir END) AS ppkn,
  MAX(CASE WHEN r.subject_name ILIKE '%Indonesia%' THEN r.nilai_akhir END) AS b_indonesia,
  MAX(CASE WHEN r.subject_name ILIKE '%Matematika%' THEN r.nilai_akhir END) AS matematika,
  MAX(CASE WHEN r.subject_name ILIKE '%Alam%' OR r.subject_name ILIKE '%IPA%' THEN r.nilai_akhir END) AS ipa,
  MAX(CASE WHEN r.subject_name ILIKE '%Sosial%' OR r.subject_name ILIKE '%IPS%' THEN r.nilai_akhir END) AS ips,
  MAX(CASE WHEN r.subject_name ILIKE '%Inggris%' THEN r.nilai_akhir END) AS b_inggris,
  MAX(CASE WHEN r.subject_name ILIKE '%PJOK%' OR r.subject_name ILIKE '%Jasmani%' THEN r.nilai_akhir END) AS pjok,
  MAX(CASE WHEN r.subject_name ILIKE '%Seni%' THEN r.nilai_akhir END) AS seni_budaya,
  MAX(CASE WHEN r.subject_name ILIKE '%Informatika%' OR r.subject_name ILIKE '%Prakarya%' THEN r.nilai_akhir END) AS informatika,
  MAX(CASE WHEN r.subject_name ILIKE '%Jawa%' OR r.subject_name ILIKE '%Daerah%' OR r.subject_name ILIKE '%Arab%' THEN r.nilai_akhir END) AS mulok_b_daerah,
  -- Akumulasi & Analisis Ketuntasan
  ROUND(COALESCE(AVG(r.nilai_akhir), 0), 2) AS rata_rata_nilai,
  COALESCE(SUM(r.nilai_akhir), 0) AS total_nilai,
  COUNT(CASE WHEN r.status_kelulusan = 'TUNTAS' THEN 1 END) AS jumlah_mapel_tuntas,
  COUNT(CASE WHEN r.status_kelulusan = 'REMEDIAL' THEN 1 END) AS jumlah_mapel_remedial,
  DENSE_RANK() OVER(PARTITION BY u.class_group ORDER BY AVG(r.nilai_akhir) DESC NULLS LAST) AS ranking_kelas,
  CASE 
    WHEN COUNT(r.id) = 0 THEN 'BELUM MENGIKUTI UJIAN'
    WHEN COUNT(CASE WHEN r.status_kelulusan = 'REMEDIAL' THEN 1 END) > 0 THEN 'PERLU REMEDIAL'
    ELSE 'TUNTAS SELURUH MAPEL'
  END AS status_kelulusan_umum
FROM public.cbt_users u
LEFT JOIN public.cbt_rekap_nilai_siswa r ON u.id = r.student_id
WHERE u.role = 'siswa'
GROUP BY u.id, u.nip_or_nis, u.name, u.class_group
ORDER BY u.class_group ASC, u.name ASC;
`;

// ====================================================================
// SKRIP SQL KHUSUS: TABEL BERITA ACARA KEGIATAN UJIAN SISWA (cbt_berita_acara)
// ====================================================================
export const SUPABASE_BERITA_ACARA_TABLE_SQL = `-- ====================================================================
-- SKRIP STRUKTUR TABEL SUPABASE: BERITA ACARA KEGIATAN UJIAN SISWA
-- Jalankan skrip ini di Supabase Dashboard -> SQL Editor
-- Link: https://supabase.com/dashboard/project/omuhzeuzxfincumsnjrd/sql
-- ====================================================================

-- 1. Buat Tabel cbt_berita_acara jika belum ada
CREATE TABLE IF NOT EXISTS public.cbt_berita_acara (
  id TEXT PRIMARY KEY,
  exam_id TEXT NOT NULL,
  exam_title TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  target_classes JSONB DEFAULT '[]'::jsonb,
  academic_year TEXT DEFAULT '2025/2026',
  semester TEXT DEFAULT 'Ganjil',
  event_date_iso TEXT,
  event_date TEXT,
  session_time TEXT,
  session_name TEXT,
  room_location TEXT,
  proctor_name TEXT NOT NULL,
  proctor_nip TEXT,
  headmaster_name TEXT DEFAULT 'NUR FADILAH, S.Pd,.MPd',
  headmaster_nip TEXT DEFAULT '19860410 201001 2 030',
  total_registered INTEGER DEFAULT 0,
  total_present INTEGER DEFAULT 0,
  total_absent INTEGER DEFAULT 0,
  attendance_percentage NUMERIC(5,2) DEFAULT 100.00,
  absent_students JSONB DEFAULT '[]'::jsonb,
  condition_notes TEXT,
  technical_issues TEXT,
  proctor_action TEXT,
  signature_proctor TEXT,
  signature_headmaster TEXT,
  status TEXT DEFAULT 'final',
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tambahkan kolom jika tabel sudah pernah dibuat sebelumnya
ALTER TABLE IF EXISTS public.cbt_berita_acara ADD COLUMN IF NOT EXISTS target_classes JSONB DEFAULT '[]'::jsonb;
ALTER TABLE IF EXISTS public.cbt_berita_acara ADD COLUMN IF NOT EXISTS absent_students JSONB DEFAULT '[]'::jsonb;
ALTER TABLE IF EXISTS public.cbt_berita_acara ADD COLUMN IF NOT EXISTS signature_proctor TEXT;
ALTER TABLE IF EXISTS public.cbt_berita_acara ADD COLUMN IF NOT EXISTS signature_headmaster TEXT;

-- 3. Indeks Pencarian Cepat
CREATE INDEX IF NOT EXISTS idx_cbt_berita_acara_exam_id ON public.cbt_berita_acara(exam_id);
CREATE INDEX IF NOT EXISTS idx_cbt_berita_acara_event_date ON public.cbt_berita_acara(event_date_iso);
CREATE INDEX IF NOT EXISTS idx_cbt_berita_acara_proctor ON public.cbt_berita_acara(proctor_name);

-- 4. Aktifkan Row Level Security (RLS) & Kebijakan Akses Penuh
ALTER TABLE public.cbt_berita_acara ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  DROP POLICY IF EXISTS "cbt_berita_acara_all" ON public.cbt_berita_acara;
  CREATE POLICY "cbt_berita_acara_all" ON public.cbt_berita_acara FOR ALL USING (true) WITH CHECK (true);
END $$;

-- 5. Tambahkan ke Realtime Publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_class pc ON pr.prrelid = pc.oid
    JOIN pg_publication p ON pr.prpubid = p.oid
    WHERE p.pubname = 'supabase_realtime' AND pc.relname = 'cbt_berita_acara'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.cbt_berita_acara;
  END IF;
END $$;
`;


