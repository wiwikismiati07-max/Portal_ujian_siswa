import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  UploadCloud,
  X,
  Layers,
  Code,
  ShieldCheck,
  Users,
  FileSpreadsheet
} from 'lucide-react';
import {
  getSupabaseStatus,
  initSupabaseSync,
  uploadAllLocalToSupabase,
  pullFromSupabase,
  syncAllLocalQuestionsToSupabase,
  syncScoreRecapToSupabase,
  SupabaseStatus
} from '../utils/supabaseSync';
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SETUP_SQL,
  SUPABASE_QUESTIONS_TABLE_SQL,
  SUPABASE_REKAP_NILAI_SQL,
  SUPABASE_REKAP_NILAI_TABLE_SQL
} from '../utils/supabaseClient';
import {
  getAllUsers,
  getAllExams,
  getAllQuestions,
  getAllSubmissions
} from '../utils/storage';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<SupabaseStatus>(getSupabaseStatus().status);
  const [statusMsg, setStatusMsg] = useState<string>(getSupabaseStatus().message);
  const [activeTab, setActiveTab] = useState<'status' | 'sql'>('status');
  const [sqlMode, setSqlMode] = useState<'rekap_table' | 'questions' | 'rekap_views' | 'all'>('rekap_table');
  const [isSyncingQuestions, setIsSyncingQuestions] = useState(false);
  const [isSyncingRecap, setIsSyncingRecap] = useState(false);

  // Stats
  const [counts, setCounts] = useState({
    users: 0,
    exams: 0,
    questions: 0,
    submissions: 0
  });

  const updateCounts = () => {
    setCounts({
      users: getAllUsers().length,
      exams: getAllExams().length,
      questions: getAllQuestions().length,
      submissions: getAllSubmissions().length
    });
  };

  useEffect(() => {
    if (isOpen) {
      const s = getSupabaseStatus();
      setStatus(s.status);
      setStatusMsg(s.message);
      updateCounts();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentSql =
    sqlMode === 'rekap_table'
      ? SUPABASE_REKAP_NILAI_TABLE_SQL
      : sqlMode === 'questions'
      ? SUPABASE_QUESTIONS_TABLE_SQL
      : sqlMode === 'rekap_views'
      ? SUPABASE_REKAP_NILAI_SQL
      : SUPABASE_SETUP_SQL;

  const handleCopySql = () => {
    navigator.clipboard.writeText(currentSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSyncQuestionsOnly = async () => {
    setIsSyncingQuestions(true);
    setUploadMessage(null);
    try {
      const res = await syncAllLocalQuestionsToSupabase();
      if (res.success) {
        setUploadMessage(`Berhasil menyinkronkan ${res.count} butir soal ke tabel cbt_questions di Supabase!`);
      } else {
        setUploadMessage(`Gagal menyinkronkan soal: ${res.error || 'Pastikan tabel cbt_questions sudah dibuat di Supabase.'}`);
      }
      updateCounts();
    } finally {
      setIsSyncingQuestions(false);
    }
  };

  const handleSyncRecapOnly = async () => {
    setIsSyncingRecap(true);
    setUploadMessage(null);
    try {
      const res = await syncScoreRecapToSupabase();
      if (res.success) {
        setUploadMessage(`Berhasil menyinkronkan ${res.count} baris rekap nilai siswa semua mapel ke tabel cbt_rekap_nilai_siswa di Supabase!`);
      } else {
        setUploadMessage(`Gagal menyinkronkan rekap: ${res.error || 'Pastikan tabel cbt_rekap_nilai_siswa sudah dibuat di Supabase.'}`);
      }
      updateCounts();
    } finally {
      setIsSyncingRecap(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setUploadMessage(null);
    try {
      await initSupabaseSync();
      await pullFromSupabase();
      const s = getSupabaseStatus();
      setStatus(s.status);
      setStatusMsg(s.message);
      updateCounts();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleUploadAll = async () => {
    setIsUploading(true);
    setUploadMessage(null);
    try {
      const res = await uploadAllLocalToSupabase();
      setUploadMessage(res.message);
      const s = getSupabaseStatus();
      setStatus(s.status);
      setStatusMsg(s.message);
      updateCounts();
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Sinkronisasi Cloud Supabase</h3>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-400/30">
                  Multi-User Realtime
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Penyimpanan terpusat untuk data ujian, soal, dan submisi siswa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 bg-slate-50 border-b border-slate-200 flex items-center gap-4">
          <button
            onClick={() => setActiveTab('status')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'status'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            Status & Konfigurasi
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code className="w-4 h-4" />
            Skrip SQL Skema
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'status' ? (
            <>
              {/* Connection Status Banner */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                  status === 'connected'
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    : status === 'needs_table_setup'
                    ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                {status === 'connected' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 text-sm">
                  <div className="font-bold flex items-center justify-between">
                    <span>
                      {status === 'connected'
                        ? 'Supabase Terhubung & Sinkronisasi Aktif'
                        : status === 'needs_table_setup'
                        ? 'Memerlukan Pembuatan Tabel SQL di Supabase'
                        : 'Menghubungkan ke Supabase...'}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        status === 'connected'
                          ? 'bg-emerald-200 text-emerald-800'
                          : 'bg-amber-200 text-amber-900'
                      }`}
                    >
                      {status === 'connected' ? 'LIVE SYNC' : 'SETUP REQUIRED'}
                    </span>
                  </div>
                  <p className="text-xs mt-1 leading-relaxed opacity-90">{statusMsg}</p>

                  {status === 'needs_table_setup' && (
                    <div className="mt-3 p-3 bg-white/80 rounded-lg border border-amber-200 space-y-2">
                      <p className="text-xs font-semibold text-amber-900">
                        ⚡ Cara Cepat Mengaktifkan Supabase (Hanya 10 Detik):
                      </p>
                      <ol className="text-xs text-amber-800 space-y-1 list-decimal list-inside">
                        <li>
                          Buka{' '}
                          <a
                            href="https://supabase.com/dashboard/project/omuhzeuzxfincumsnjrd/sql"
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold underline text-indigo-700 hover:text-indigo-900 inline-flex items-center gap-1"
                          >
                            Supabase SQL Editor <ExternalLink className="w-3 h-3" />
                          </a>
                        </li>
                        <li>
                          Klik tombol <strong>"Salin Skrip SQL"</strong> di bawah lalu paste dan klik{' '}
                          <strong>Run</strong> di dashboard Supabase.
                        </li>
                        <li>
                          Klik tombol <strong>"Tes & Muat Ulang"</strong> di modal ini.
                        </li>
                      </ol>
                    </div>
                  )}
                </div>
              </div>

              {/* Server Credentials */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="font-semibold text-slate-500">Project URL:</span>
                  <span className="font-mono bg-white px-2 py-1 rounded border border-slate-200 text-slate-700 break-all select-all">
                    {SUPABASE_URL}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="font-semibold text-slate-500">Public / Anon Key:</span>
                  <span className="font-mono bg-white px-2 py-1 rounded border border-slate-200 text-slate-700 break-all select-all">
                    {SUPABASE_ANON_KEY.substring(0, 16)}...{SUPABASE_ANON_KEY.substring(SUPABASE_ANON_KEY.length - 8)}
                  </span>
                </div>
              </div>

              {/* Data Synchronized Overview */}
              <div>
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2.5">
                  Statistik Data Sistem
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs text-center">
                    <Users className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                    <div className="text-lg font-extrabold text-slate-900">{counts.users}</div>
                    <div className="text-[11px] text-slate-500">Pengguna</div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs text-center">
                    <Layers className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                    <div className="text-lg font-extrabold text-slate-900">{counts.exams}</div>
                    <div className="text-[11px] text-slate-500">Paket Ujian</div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs text-center">
                    <FileSpreadsheet className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                    <div className="text-lg font-extrabold text-slate-900">{counts.questions}</div>
                    <div className="text-[11px] text-slate-500">Butir Soal</div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs text-center">
                    <ShieldCheck className="w-4 h-4 text-rose-600 mx-auto mb-1" />
                    <div className="text-lg font-extrabold text-slate-900">{counts.submissions}</div>
                    <div className="text-[11px] text-slate-500">Hasil Ujian</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSyncRecapOnly}
                      disabled={isSyncingRecap || isUploading}
                      className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
                      title="Sinkronkan data rekap nilai siswa semua mapel langsung ke tabel cbt_rekap_nilai_siswa di Supabase"
                    >
                      <UploadCloud className="w-4 h-4 text-emerald-600" />
                      <span>{isSyncingRecap ? 'Mengunggah Rekap...' : 'Sinkronkan Tabel Rekap Nilai ke Supabase'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSyncQuestionsOnly}
                      disabled={isSyncingQuestions || isUploading}
                      className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
                      title="Unggah butir soal lokal langsung ke tabel cbt_questions di Supabase"
                    >
                      <UploadCloud className="w-4 h-4 text-indigo-600" />
                      <span>{isSyncingQuestions ? 'Mengunggah Soal...' : 'Sinkronkan Butir Soal'}</span>
                    </button>
                  </div>

                  <div className="text-[11px] text-slate-500">
                    Pastikan tabel <code>cbt_rekap_nilai_siswa</code> sudah dibuat di SQL Editor.
                  </div>
                </div>
              </div>

              {uploadMessage && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl text-xs font-medium">
                  {uploadMessage}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              {/* Tab Selector: Rekap Table vs Questions vs Views vs Full Schema */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-200 pb-3 gap-2">
                <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setSqlMode('rekap_table')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      sqlMode === 'rekap_table'
                        ? 'bg-white text-emerald-700 shadow-2xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📋 Tabel Rekap Nilai Siswa (Semua Mapel)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSqlMode('rekap_views')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      sqlMode === 'rekap_views'
                        ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📊 View Analisis & Ketuntasan
                  </button>
                  <button
                    type="button"
                    onClick={() => setSqlMode('questions')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      sqlMode === 'questions'
                        ? 'bg-white text-indigo-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📝 Tabel Bank Soal
                  </button>
                  <button
                    type="button"
                    onClick={() => setSqlMode('all')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      sqlMode === 'all'
                        ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🛠️ Semua Tabel (DDL Lengkap)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied
                    ? 'Tersalin!'
                    : sqlMode === 'rekap_table'
                    ? 'Salin SQL Tabel Rekap Nilai'
                    : sqlMode === 'rekap_views'
                    ? 'Salin SQL View Analisis'
                    : sqlMode === 'questions'
                    ? 'Salin SQL Bank Soal'
                    : 'Salin Semua SQL'}
                </button>
              </div>

              <div className="text-xs text-slate-600 bg-amber-50 p-3 rounded-xl border border-amber-200">
                <strong className="text-amber-900 font-semibold block mb-0.5">
                  {sqlMode === 'rekap_table'
                    ? '📌 Petunjuk Tabel Rekap Nilai Siswa Semua Mata Pelajaran:'
                    : sqlMode === 'rekap_views'
                    ? '📌 Petunjuk SQL Rekap Nilai & Analisis Siswa:'
                    : sqlMode === 'questions'
                    ? '📌 Petunjuk Tabel Bank Soal:'
                    : '📌 Petunjuk Database Lengkap:'}
                </strong>
                {sqlMode === 'rekap_table' ? (
                  <span>
                    Skrip ini membuat tabel fisik <code>cbt_rekap_nilai_siswa</code> lengkap (NISN, kelas, mapel, nilai, KKM, predikat A/B/C/D, catatan integritas), <strong>trigger otomatis</strong> yang menyinkronkan hasil ujian setiap saat ke tabel rekap, migrasi data yang sudah ada, serta <strong>buku rapor ledger semua mata pelajaran (<code>v_rekap_ledger_semua_mapel</code>)</strong>.
                  </span>
                ) : sqlMode === 'rekap_views' ? (
                  <span>
                    Skrip ini membuat View di PostgreSQL/Supabase: <code>v_rekap_nilai_lengkap</code> (rekap nilai per kelas & mapel), <code>v_rekap_statistik_kelas</code> (analisis ketuntasan & rata-rata), <code>v_siswa_remedial</code> (daftar siswa remedial), dan <code>v_siswa_belum_ujian</code> (monitoring siswa belum submit berdasarkan master data).
                  </span>
                ) : sqlMode === 'questions' ? (
                  <span>
                    Skrip ini membuat tabel <code>cbt_questions</code>, menambahkan kolom migrasi (pilihan ganda, PG kompleks, benar/salah, menjodohkan, studi kasus), indeks <code>exam_id</code>, dan hak akses RLS publik.
                  </span>
                ) : (
                  <span>
                    Skrip lengkap mencakup 6 tabel: <code>cbt_users</code>, <code>cbt_subjects</code>, <code>cbt_exams</code>, <code>cbt_questions</code>, <code>cbt_submissions</code>, dan <code>cbt_rekap_nilai_siswa</code> beserta sinkronisasi Realtime.
                  </span>
                )}
              </div>

              <pre className="p-4 bg-slate-950 text-slate-200 text-xs font-mono rounded-xl overflow-x-auto max-h-[340px] leading-relaxed select-all">
                {currentSql}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySql}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Skrip SQL Tersalin' : 'Salin Skrip SQL'}
            </button>

            <a
              href="https://supabase.com/dashboard/project/omuhzeuzxfincumsnjrd/sql"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              Buka SQL Editor
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUploadAll}
              disabled={isUploading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              <UploadCloud className={`w-4 h-4 ${isUploading ? '' : ''}`} />
              {isUploading ? 'Mengunggah...' : 'Upload Data Lokal ke Cloud'}
            </button>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Memeriksa...' : 'Tes & Muat Ulang'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
