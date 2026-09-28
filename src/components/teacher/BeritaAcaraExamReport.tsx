import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  FileText,
  Printer,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  PenTool,
  Plus,
  Trash2,
  Download,
  Share2,
  Copy,
  Info,
  Settings,
  X,
  Check,
  Database,
  Cloud,
  CloudCheck,
  RefreshCw,
  Code2,
  ExternalLink,
  Sparkles,
  UserX
} from 'lucide-react';
import { Exam, ExamSubmission, User, AbsentStudent, BeritaAcaraExam } from '../../types';
import {
  getAllExams,
  getAllSubmissions,
  getAllUsers,
  saveBeritaAcara,
  getAllBeritaAcara,
  deleteBeritaAcara
} from '../../utils/storage';
import {
  saveBeritaAcaraToSupabase,
  fetchBeritaAcaraListFromSupabase,
  fetchSingleBeritaAcaraFromSupabase
} from '../../utils/supabaseSync';
import { SUPABASE_BERITA_ACARA_TABLE_SQL } from '../../utils/supabaseClient';
import { OfficialLetterhead } from '../common/OfficialLetterhead';
import { OfficialReportSignature } from '../common/OfficialReportSignature';
import { PrintPreviewModal } from '../common/PrintPreviewModal';

interface BeritaAcaraExamReportProps {
  teacher: User;
  preselectedExamId?: string;
}

export const BeritaAcaraExamReport: React.FC<BeritaAcaraExamReportProps> = ({
  teacher,
  preselectedExamId
}) => {
  const exams = useMemo(() => getAllExams(), []);
  const allSubmissions = useMemo(() => getAllSubmissions(), []);
  const allUsers = useMemo(() => getAllUsers(), []);

  // Filter exams for this teacher or all available
  const availableExams = useMemo(() => {
    if (exams.length === 0) return [];
    const teacherExams = exams.filter(e => e.teacherId === teacher.id || e.teacherName === teacher.name);
    return teacherExams.length > 0 ? teacherExams : exams;
  }, [exams, teacher]);

  const [selectedExamId, setSelectedExamId] = useState<string>(() => {
    if (preselectedExamId && exams.some(e => e.id === preselectedExamId)) {
      return preselectedExamId;
    }
    return availableExams[0]?.id || exams[0]?.id || '';
  });

  const currentExam = useMemo(() => {
    return exams.find(e => e.id === selectedExamId) || availableExams[0] || exams[0] || null;
  }, [exams, availableExams, selectedExamId]);

  // Submissions for this exam
  const examSubmissions = useMemo(() => {
    if (!currentExam) return [];
    return allSubmissions.filter(s => s.examId === currentExam.id);
  }, [allSubmissions, currentExam]);

  // Registered students in target classes
  const targetClassStudents = useMemo(() => {
    if (!currentExam || !currentExam.targetClasses || currentExam.targetClasses.length === 0) {
      return allUsers.filter(u => u.role === 'siswa');
    }
    return allUsers.filter(u => u.role === 'siswa' && u.classGroup && currentExam.targetClasses.includes(u.classGroup));
  }, [allUsers, currentExam]);

  // Real computed counts strictly based on master data & actual submissions
  const totalRegistered = useMemo(() => {
    if (targetClassStudents.length > 0) return targetClassStudents.length;
    return examSubmissions.length;
  }, [targetClassStudents.length, examSubmissions.length]);

  const totalAttended = useMemo(() => {
    return examSubmissions.length;
  }, [examSubmissions.length]);

  // Default formatted date string
  const todayDateStr = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }, []);

  const todayIsoStr = useMemo(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }, []);

  // Modal States
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Form States for Berita Acara
  const [eventDateIso, setEventDateIso] = useState<string>(todayIsoStr);
  const [eventDate, setEventDate] = useState<string>(todayDateStr);
  const [sessionTime, setSessionTime] = useState<string>('07.30 - 09.30 WIB');
  const [sessionName, setSessionName] = useState<string>('Sesi 1 (Pagi)');
  const [roomLocation, setRoomLocation] = useState<string>('Laboratorium Komputer CBT 1');
  const [proctorName, setProctorName] = useState<string>(teacher.name || 'WIWIK ISMIATI, S.Pd');
  const [proctorNip, setProctorNip] = useState<string>(teacher.nipOrNis || '19831116 200904 2 003');
  const [headmasterName, setHeadmasterName] = useState<string>('NUR FADILAH, S.Pd,.MPd');
  const [headmasterNip, setHeadmasterNip] = useState<string>('19860410 201001 2 030');

  // Counts
  const [customRegisteredCount, setCustomRegisteredCount] = useState<number>(totalRegistered);
  const [customPresentCount, setCustomPresentCount] = useState<number>(totalAttended);
  const [absentList, setAbsentList] = useState<AbsentStudent[]>([]);

  const [newAbsentName, setNewAbsentName] = useState('');
  const [newAbsentClass, setNewAbsentClass] = useState(currentExam?.targetClasses?.[0] || '8A');
  const [newAbsentReason, setNewAbsentReason] = useState<'Sakit' | 'Izin' | 'Tanpa Keterangan'>('Sakit');
  const [newAbsentNotes, setNewAbsentNotes] = useState('');

  // Incidents and Notes
  const integrityViolations = useMemo(() => {
    return examSubmissions.filter(s => s.violationCount && s.violationCount > 0);
  }, [examSubmissions]);

  const defaultConditionNotes = useMemo(() => {
    if (integrityViolations.length > 0) {
      return `Pelaksanaan asesmen berlangsung tertib. Terdeteksi ${integrityViolations.length} peserta sempat beralih jendela/tab browser dan telah diberikan teguran oleh pengawas ruang sesuai SOP.`;
    }
    return 'Pelaksanaan kegiatan asesmen/ujian berlangsung dengan tertib, tenang, aman, dan lancar tanpa kendala teknis jaringan maupun perangkat.';
  }, [integrityViolations]);

  const [conditionNotes, setConditionNotes] = useState<string>(defaultConditionNotes);
  const [technicalIssues, setTechnicalIssues] = useState<string>('Jaringan internet, server lokal, dan suplai listrik PLN normal dan stabil.');
  const [proctorAction, setProctorAction] = useState<string>('Pengawasan dilakukan secara ketat melalui monitor pengawas dan pendampingan ruang ujian.');

  // Supabase sync states
  const [isSavingToSupabase, setIsSavingToSupabase] = useState(false);
  const [supabaseSaveSuccess, setSupabaseSaveSuccess] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [copiedSqlNotification, setCopiedSqlNotification] = useState(false);

  // Synchronize counts whenever exam changes
  useEffect(() => {
    setCustomRegisteredCount(totalRegistered);
    setCustomPresentCount(totalAttended);
  }, [currentExam?.id, totalRegistered, totalAttended]);

  // Auto-load Berita Acara for this exam if already saved in Supabase or local storage
  const loadSavedBeritaAcara = useCallback(async () => {
    if (!currentExam) return;
    const allLocal = getAllBeritaAcara();
    const existingLocal = allLocal.find(b => b.examId === currentExam.id);

    if (existingLocal) {
      setEventDateIso(existingLocal.eventDateIso || todayIsoStr);
      setEventDate(existingLocal.eventDate || todayDateStr);
      setSessionTime(existingLocal.sessionTime || '07.30 - 09.30 WIB');
      setSessionName(existingLocal.sessionName || 'Sesi 1 (Pagi)');
      setRoomLocation(existingLocal.roomLocation || 'Laboratorium Komputer CBT 1');
      setProctorName(existingLocal.proctorName || teacher.name || 'WIWIK ISMIATI, S.Pd');
      setProctorNip(existingLocal.proctorNip || teacher.nipOrNis || '19831116 200904 2 003');
      setHeadmasterName(existingLocal.headmasterName || 'NUR FADILAH, S.Pd,.MPd');
      setHeadmasterNip(existingLocal.headmasterNip || '19860410 201001 2 030');
      setCustomRegisteredCount(existingLocal.totalRegistered ?? totalRegistered);
      setCustomPresentCount(existingLocal.totalPresent ?? totalAttended);
      setAbsentList(existingLocal.absentStudents || []);
      setConditionNotes(existingLocal.conditionNotes || defaultConditionNotes);
      setTechnicalIssues(existingLocal.technicalIssues || 'Jaringan internet, server lokal, dan suplai listrik PLN normal dan stabil.');
      setProctorAction(existingLocal.proctorAction || 'Pengawasan dilakukan secara ketat melalui monitor pengawas dan pendampingan ruang ujian.');
      setLastSavedAt(existingLocal.updatedAt || null);
    }

    // Try fetching from remote Supabase
    try {
      const remoteList = await fetchBeritaAcaraListFromSupabase(currentExam.id);
      if (remoteList && remoteList.length > 0) {
        const remote = remoteList[0];
        setEventDateIso(remote.eventDateIso || todayIsoStr);
        setEventDate(remote.eventDate || todayDateStr);
        setSessionTime(remote.sessionTime || '07.30 - 09.30 WIB');
        setSessionName(remote.sessionName || 'Sesi 1 (Pagi)');
        setRoomLocation(remote.roomLocation || 'Laboratorium Komputer CBT 1');
        setProctorName(remote.proctorName || teacher.name || 'WIWIK ISMIATI, S.Pd');
        setProctorNip(remote.proctorNip || teacher.nipOrNis || '19831116 200904 2 003');
        setHeadmasterName(remote.headmasterName || 'NUR FADILAH, S.Pd,.MPd');
        setHeadmasterNip(remote.headmasterNip || '19860410 201001 2 030');
        setCustomRegisteredCount(remote.totalRegistered ?? totalRegistered);
        setCustomPresentCount(remote.totalPresent ?? totalAttended);
        setAbsentList(remote.absentStudents || []);
        setConditionNotes(remote.conditionNotes || defaultConditionNotes);
        setTechnicalIssues(remote.technicalIssues || 'Jaringan internet, server lokal, dan suplai listrik PLN normal dan stabil.');
        setProctorAction(remote.proctorAction || 'Pengawasan dilakukan secara ketat melalui monitor pengawas dan pendampingan ruang ujian.');
        setLastSavedAt(remote.updatedAt || null);
      }
    } catch {
      // Non-blocking
    }
  }, [currentExam, todayIsoStr, todayDateStr, teacher, totalRegistered, totalAttended, defaultConditionNotes]);

  useEffect(() => {
    loadSavedBeritaAcara();
  }, [loadSavedBeritaAcara]);

  // Handle calendar date change -> formats to Indonesian date string e.g. "Senin, 28 September 2026"
  const handleDateChange = (isoVal: string) => {
    setEventDateIso(isoVal);
    if (!isoVal) return;
    try {
      const parts = isoVal.split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      const formatted = d.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      setEventDate(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  // Auto-detect absent students (students in roster who did not submit exam)
  const handleAutoDetectAbsent = () => {
    if (!currentExam) return;
    const submittedStudentIds = new Set(examSubmissions.map(s => s.studentId).filter(Boolean));
    const submittedStudentNames = new Set(examSubmissions.map(s => s.studentName.trim().toUpperCase()));

    const missingStudents = targetClassStudents.filter(s => {
      return !submittedStudentIds.has(s.id) && !submittedStudentNames.has(s.name.trim().toUpperCase());
    });

    if (missingStudents.length === 0) {
      alert('Semua siswa yang terdaftar telah mengikuti ujian (0 siswa absen).');
      return;
    }

    const newAbsentItems: AbsentStudent[] = missingStudents.map(st => ({
      id: `absent_${st.id}_${Date.now()}`,
      name: st.name,
      classGroup: st.classGroup || currentExam.targetClasses?.[0] || '8A',
      reason: 'Tanpa Keterangan',
      notes: 'Belum mengikuti ujian pada jadwal yang ditentukan'
    }));

    setAbsentList(newAbsentItems);
    setCustomPresentCount(Math.max(0, customRegisteredCount - newAbsentItems.length));
  };

  const handleAddAbsent = () => {
    if (!newAbsentName.trim()) return;
    const found = targetClassStudents.find(
      s => s.name.toLowerCase() === newAbsentName.trim().toLowerCase()
    );
    const item: AbsentStudent = {
      id: `absent_${Date.now()}`,
      name: found ? found.name : newAbsentName.trim(),
      classGroup: found?.classGroup || newAbsentClass,
      reason: newAbsentReason,
      notes: newAbsentNotes.trim() || '-'
    };
    setAbsentList(prev => [...prev, item]);
    setNewAbsentName('');
    setNewAbsentNotes('');
  };

  const handleRemoveAbsent = (id: string) => {
    setAbsentList(prev => prev.filter(a => a.id !== id));
  };

  // 1-Click Save to Supabase
  const handleSaveToSupabase = async () => {
    if (!currentExam) return;
    setIsSavingToSupabase(true);
    setSupabaseSaveSuccess(false);

    const beritaAcaraId = `ba_${currentExam.id}_${sessionName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
    const calculatedPercentage =
      customRegisteredCount > 0 ? Number(((customPresentCount / customRegisteredCount) * 100).toFixed(2)) : 100;

    const dataToSave: BeritaAcaraExam = {
      id: beritaAcaraId,
      examId: currentExam.id,
      examTitle: currentExam.title,
      subjectName: currentExam.subjectName,
      targetClasses: currentExam.targetClasses || [],
      academicYear: '2025/2026',
      semester: 'Ganjil',
      eventDateIso,
      eventDate,
      sessionTime,
      sessionName,
      roomLocation,
      proctorName,
      proctorNip,
      headmasterName,
      headmasterNip,
      totalRegistered: customRegisteredCount,
      totalPresent: customPresentCount,
      totalAbsent: absentList.length,
      attendancePercentage: calculatedPercentage,
      absentStudents: absentList,
      conditionNotes,
      technicalIssues,
      proctorAction,
      status: 'final',
      createdBy: teacher.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const res = await saveBeritaAcara(dataToSave, true);
      if (res.success) {
        setSupabaseSaveSuccess(true);
        setLastSavedAt(new Date().toISOString());
        setTimeout(() => setSupabaseSaveSuccess(false), 3500);
      }
    } catch (err) {
      console.error('Error saving Berita Acara to Supabase:', err);
    } finally {
      setIsSavingToSupabase(false);
    }
  };

  const handleCopySummary = () => {
    const summary = `BERITA ACARA KEGIATAN UJIAN\nUPT SMP NEGERI 7 PASURUAN\nMata Pelajaran: ${currentExam?.subjectName || '-'}\nPaket Ujian: ${currentExam?.title || '-'}\nHari/Tanggal: ${eventDate}\nWaktu/Sesi: ${sessionTime} (${sessionName})\nRuang: ${roomLocation}\nJumlah Peserta Terdaftar: ${customRegisteredCount}\nJumlah Hadir: ${customPresentCount}\nJumlah Tidak Hadir: ${absentList.length}\nPengawas: ${proctorName}\nStatus: ${conditionNotes}`;
    navigator.clipboard.writeText(summary);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_BERITA_ACARA_TABLE_SQL);
    setCopiedSqlNotification(true);
    setTimeout(() => setCopiedSqlNotification(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Control Bar */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-lg border border-purple-800/40 flex flex-col lg:flex-row lg:items-center justify-between gap-5 no-print">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-500/30 text-purple-200 border border-purple-400/30 tracking-wider">
              Dokumen Kedinasan CBT
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 tracking-wider">
              Format Resmi A4
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 tracking-wider flex items-center gap-1">
              <Database className="w-3 h-3 text-indigo-300" /> Database Supabase Cloud
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-purple-300" />
            <span>Berita Acara Kegiatan Ujian Siswa</span>
          </h2>
          <p className="text-xs sm:text-sm text-purple-200/90 mt-1 max-w-2xl leading-relaxed">
            Pencatatan resmi jalannya asesmen, kehadiran peserta didik, catatan insiden integritas, dan pengesahan bertanda tangan digital tersimpan otomatis di database Supabase Cloud.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Tombol Simpan ke Database Supabase */}
          <button
            type="button"
            onClick={handleSaveToSupabase}
            disabled={isSavingToSupabase}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95 ${
              supabaseSaveSuccess
                ? 'bg-emerald-600 text-white shadow-emerald-500/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isSavingToSupabase ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Menyimpan ke Supabase...</span>
              </>
            ) : supabaseSaveSuccess ? (
              <>
                <CloudCheck className="w-4 h-4" />
                <span>Tersimpan di Supabase!</span>
              </>
            ) : (
              <>
                <Database className="w-4 h-4" />
                <span>Simpan ke Database Supabase</span>
              </>
            )}
          </button>

          {/* Tombol Coding SQL Database Supabase */}
          <button
            type="button"
            onClick={() => setIsSqlModalOpen(true)}
            className="px-3.5 py-2.5 bg-purple-600/80 hover:bg-purple-600 text-white rounded-xl text-xs font-extrabold border border-purple-400/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Code2 className="w-4 h-4 text-purple-200" />
            <span>Coding SQL Supabase</span>
          </button>

          <button
            type="button"
            onClick={() => setIsConfigModalOpen(true)}
            className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Settings className="w-4 h-4" />
            <span>⚙️ Atur Pelaksanaan</span>
          </button>

          <button
            type="button"
            onClick={handleCopySummary}
            className="px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/15 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Copy className="w-4 h-4 text-purple-300" />
            <span>{copiedNotification ? 'Disalin!' : 'Salin Teks'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="px-4 py-2.5 bg-white text-purple-950 hover:bg-purple-50 active:scale-95 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Printer className="w-4 h-4 text-purple-700" />
            <span>Cetak Berita Acara</span>
          </button>
        </div>
      </div>

      {/* Info Status Sinkronisasi Supabase */}
      <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs no-print">
        <div className="flex items-center gap-2.5 text-purple-900">
          <div className="w-8 h-8 rounded-xl bg-purple-200 text-purple-800 flex items-center justify-center shrink-0">
            <Cloud className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-900">
              Penyimpanan Database Cloud: <span className="text-purple-700 font-extrabold">cbt_berita_acara</span>
            </p>
            <p className="text-[11px] text-slate-500">
              {lastSavedAt
                ? `Terakhir disinkronkan ke Supabase: ${new Date(lastSavedAt).toLocaleString('id-ID')}`
                : 'Data siap disimpan dan disinkronkan langsung ke cloud database.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleAutoDetectAbsent}
            className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <UserX className="w-3.5 h-3.5 text-purple-700" />
            <span>Auto-Deteksi Siswa Belum Ujian</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAMPILAN LEMBAR DOKUMEN BERITA ACARA RESMI (FORMAT A4) */}
      {/* ========================================================= */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xl max-w-4xl mx-auto font-serif text-slate-900 leading-relaxed print:p-0 print:border-none print:shadow-none">
        
        {/* Kop Surat Resmi SMPN 7 Pasuruan */}
        <OfficialLetterhead
          judulDokumen="BERITA ACARA PELAKSANAAN KEGIATAN ASESMEN / UJIAN SISWA"
          subJudulDokumen="TAHUN AJARAN 2025/2026 - SEMESTER GANJIL"
          isPrintOnly={false}
          showExamMetadata={false}
        />

        {/* Paragraf Pembuka */}
        <p className="text-xs sm:text-sm text-justify my-3 indent-6">
          Pada hari ini <strong className="font-bold">{eventDate}</strong>, telah dilaksanakan Kegiatan Asesmen Sumatif / Ujian Berbasis Komputer dan Smartphone (CBT) di lingkungan UPT SMP Negeri 7 Pasuruan dengan rincian pelaksanaan sebagai berikut:
        </p>

        {/* Tabel Informasi Kegiatan Ujian */}
        <div className="my-3">
          <table className="w-full text-xs sm:text-sm border-collapse border border-black">
            <tbody>
              <tr>
                <td className="p-2 border border-black font-bold w-[30%] bg-slate-50">1. Mata Pelajaran</td>
                <td className="p-2 border border-black w-[70%] font-bold text-slate-900">
                  {currentExam?.subjectName || 'SEMUA MATA PELAJARAN'}
                </td>
              </tr>
              <tr>
                <td className="p-2 border border-black font-bold bg-slate-50">2. Paket Soal / Ujian</td>
                <td className="p-2 border border-black font-semibold">
                  {currentExam?.title || 'Ujian Sumatif CBT'}
                </td>
              </tr>
              <tr>
                <td className="p-2 border border-black font-bold bg-slate-50">3. Rombongan Belajar (Kelas)</td>
                <td className="p-2 border border-black font-semibold">
                  {currentExam?.targetClasses?.join(', ') || 'Semua Rombel Terdaftar'}
                </td>
              </tr>
              <tr>
                <td className="p-2 border border-black font-bold bg-slate-50">4. Hari, Tanggal Pelaksanaan</td>
                <td className="p-2 border border-black">{eventDate}</td>
              </tr>
              <tr>
                <td className="p-2 border border-black font-bold bg-slate-50">5. Alokasi Waktu / Sesi</td>
                <td className="p-2 border border-black">{sessionTime} &bull; {sessionName} (Durasi: {currentExam?.durationMinutes || 90} Menit)</td>
              </tr>
              <tr>
                <td className="p-2 border border-black font-bold bg-slate-50">6. Ruang / Tempat</td>
                <td className="p-2 border border-black font-semibold">{roomLocation}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tabel Rekapitulasi Kehadiran */}
        <div className="my-4">
          <h5 className="font-bold text-xs sm:text-sm mb-1.5 uppercase">
            A. Rekapitulasi Kehadiran Peserta Didik
          </h5>
          <table className="w-full text-xs sm:text-sm border-collapse border border-black text-center table-fixed">
            <thead className="bg-slate-100 font-bold">
              <tr>
                <th className="p-2 border border-black w-[25%]">Peserta Terdaftar</th>
                <th className="p-2 border border-black w-[25%]">Peserta Hadir</th>
                <th className="p-2 border border-black w-[25%]">Peserta Tidak Hadir</th>
                <th className="p-2 border border-black w-[25%]">Persentase Kehadiran</th>
              </tr>
            </thead>
            <tbody>
              <tr className="font-bold">
                <td className="p-2 border border-black">{customRegisteredCount} Orang</td>
                <td className="p-2 border border-black text-emerald-900">{customPresentCount} Orang</td>
                <td className="p-2 border border-black text-rose-900">{absentList.length} Orang</td>
                <td className="p-2 border border-black">
                  {customRegisteredCount > 0 ? ((customPresentCount / customRegisteredCount) * 100).toFixed(1) : 100}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Daftar Siswa Tidak Hadir */}
        {absentList.length > 0 && (
          <div className="my-3">
            <h6 className="font-bold text-xs mb-1">
              Rincian Peserta Didik Yang Tidak Hadir:
            </h6>
            <table className="w-full text-xs border-collapse border border-black table-fixed">
              <thead className="bg-slate-100 font-bold text-center">
                <tr>
                  <th className="p-1.5 border border-black w-[8%]">No</th>
                  <th className="p-1.5 border border-black w-[40%] text-left">Nama Siswa</th>
                  <th className="p-1.5 border border-black w-[15%]">Kelas</th>
                  <th className="p-1.5 border border-black w-[17%]">Alasan</th>
                  <th className="p-1.5 border border-black w-[20%] text-left">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {absentList.map((st, i) => (
                  <tr key={st.id}>
                    <td className="p-1.5 border border-black text-center">{i + 1}</td>
                    <td className="p-1.5 border border-black font-semibold">{st.name}</td>
                    <td className="p-1.5 border border-black text-center">{st.classGroup}</td>
                    <td className="p-1.5 border border-black text-center">{st.reason}</td>
                    <td className="p-1.5 border border-black">{st.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Catatan Pelaksanaan & Kejadian Khusus */}
        <div className="my-4 text-xs sm:text-sm">
          <h5 className="font-bold mb-1.5 uppercase">
            B. Catatan Jalannya Kegiatan Asesmen / Kejadian Khusus
          </h5>
          <div className="border border-black p-3 bg-slate-50/60 space-y-1.5 leading-relaxed">
            <p>
              1. <strong>Ketertiban &amp; Jalannya Ujian:</strong> {conditionNotes}
            </p>
            <p>
              2. <strong>Sarana &amp; Prasarana:</strong> {technicalIssues}
            </p>
            <p>
              3. <strong>Tindakan Pengawas / Proktor:</strong> {proctorAction}
            </p>
          </div>
        </div>

        {/* Penutup */}
        <p className="text-xs sm:text-sm text-justify mt-3">
          Demikian Berita Acara Pelaksanaan Kegiatan Asesmen ini dibuat dengan sebenar-benarnya sesuai dengan kondisi nyata di lapangan untuk dapat dipergunakan sebagaimana mestinya.
        </p>

        {/* Official Report Signature (Mengetahui Kepala UPT & Guru Pengawas) */}
        <OfficialReportSignature
          teacherName={proctorName}
          teacherNip={proctorNip}
          headmasterName={headmasterName}
          headmasterNip={headmasterNip}
          location="Pasuruan"
          dateStr={eventDate}
        />

      </div>

      {/* ========================================================= */}
      {/* POPUP MODAL 1: ATUR DATA PELAKSANAAN UJIAN               */}
      {/* ========================================================= */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 no-print">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-900 to-indigo-900 text-white">
              <div className="flex items-center gap-2.5">
                <Settings className="w-5 h-5 text-purple-300" />
                <div>
                  <h3 className="text-base font-bold">Konfigurasi Data Pelaksanaan Ujian</h3>
                  <p className="text-xs text-purple-200">Ubah paket, sesi, waktu, tanggal, pengawas & daftar ketidakhadiran</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsConfigModalOpen(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-6 space-y-5 overflow-y-auto">
              
              {/* 1. Pilih Paket Ujian */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  1. Pilih Paket Ujian yang Dilaporkan:
                </label>
                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-3 text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  {exams.map(ex => (
                    <option key={ex.id} value={ex.id}>
                      {ex.title} — {ex.subjectName} ({ex.targetClasses?.join(', ') || 'Semua Kelas'})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Sesi Ujian (Sesi 1, 2, 3, 4) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  2. Sesi Ujian:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Sesi 1 (Pagi)', 'Sesi 2 (Siang)', 'Sesi 3 (Sore)', 'Sesi 4 (Cadangan)'].map((sName) => (
                    <button
                      key={sName}
                      type="button"
                      onClick={() => setSessionName(sName)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-extrabold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        sessionName === sName
                          ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {sessionName === sName && <Check className="w-3.5 h-3.5" />}
                      <span>{sName}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Waktu Pelaksanaan */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  3. Waktu Pelaksanaan (Jam &amp; Durasi):
                </label>
                <input
                  type="text"
                  value={sessionTime}
                  onChange={(e) => setSessionTime(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-semibold"
                  placeholder="Contoh: 07.30 - 09.30 WIB"
                />
              </div>

              {/* 4. Hari & Tanggal Pelaksanaan */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  4. Hari &amp; Tanggal Pelaksanaan (Pilih Kalender):
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="date"
                    value={eventDateIso}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                  <div className="flex-1 p-2.5 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs text-indigo-900 font-semibold truncate">
                    Format: {eventDate}
                  </div>
                </div>
              </div>

              {/* 5. Nama Pengawas & NIP Pengawas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    5. Nama Pengawas / Guru Pengampu:
                  </label>
                  <input
                    type="text"
                    value={proctorName}
                    onChange={(e) => setProctorName(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    NIP Pengawas:
                  </label>
                  <input
                    type="text"
                    value={proctorNip}
                    onChange={(e) => setProctorNip(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* 6. Ruangan */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  6. Ruang Ujian / Laboratorium:
                </label>
                <input
                  type="text"
                  value={roomLocation}
                  onChange={(e) => setRoomLocation(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* 7. Input Tambah Siswa Tidak Hadir */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    7. Daftar Peserta Didik Tidak Hadir:
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoDetectAbsent}
                    className="text-[11px] text-purple-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <UserX className="w-3 h-3" /> Auto-Isi Siswa Belum Ujian
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={newAbsentName}
                    onChange={(e) => setNewAbsentName(e.target.value)}
                    placeholder="Nama Siswa..."
                    className="sm:col-span-2 text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                  />
                  <select
                    value={newAbsentReason}
                    onChange={(e: any) => setNewAbsentReason(e.target.value)}
                    className="text-xs bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-slate-800"
                  >
                    <option value="Sakit">Sakit</option>
                    <option value="Izin">Izin</option>
                    <option value="Tanpa Keterangan">Tanpa Keterangan</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddAbsent}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah
                  </button>
                </div>

                {absentList.length > 0 && (
                  <div className="space-y-1.5 mt-2">
                    {absentList.map(a => (
                      <div key={a.id} className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200 text-xs">
                        <div>
                          <span className="font-bold text-slate-800">{a.name}</span>
                          <span className="text-slate-500 ml-2">({a.classGroup})</span>
                          <span className="ml-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            {a.reason}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAbsent(a.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Footer Modal */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setIsConfigModalOpen(false);
                  handleSaveToSupabase();
                }}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Simpan &amp; Terapkan ke Supabase</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* POPUP MODAL 2: CODING SQL DATABASE SUPABASE              */}
      {/* ========================================================= */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 no-print">
          <div className="bg-slate-900 text-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Coding SQL Database Supabase</h3>
                  <p className="text-xs text-slate-400">Skrip DDL &amp; RLS Tabel Berita Acara Kegiatan Ujian (cbt_berita_acara)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSqlModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-6 space-y-4 overflow-y-auto text-xs">
              <div className="bg-indigo-950/60 border border-indigo-500/30 rounded-2xl p-4 text-indigo-200 flex items-start gap-3">
                <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-white text-sm">Petunjuk Penggunaan SQL di Supabase:</p>
                  <p className="text-xs text-indigo-200/90 leading-relaxed">
                    1. Buka dashboard proyek Supabase Anda di menu <strong>SQL Editor</strong>.
                  </p>
                  <p className="text-xs text-indigo-200/90 leading-relaxed">
                    2. Klik tombol <strong>"Salin Seluruh Skrip SQL"</strong> di bawah, lalu tempel (paste) dan klik <strong>Run</strong>.
                  </p>
                  <p className="text-xs text-indigo-200/90 leading-relaxed">
                    3. Skrip ini sudah mencakup pembuatan tabel, pengindeksan, Row Level Security (RLS) akses publik, dan publikasi Realtime.
                  </p>
                </div>
              </div>

              <div className="relative">
                <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-purple-300 font-mono text-[11px] overflow-x-auto max-h-80 leading-relaxed select-all">
                  {SUPABASE_BERITA_ACARA_TABLE_SQL}
                </pre>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-800 border-t border-slate-700">
              <span className="text-[11px] text-slate-400">
                Tabel Target: <code className="text-purple-300 font-mono">public.cbt_berita_acara</code>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copiedSqlNotification ? 'Skrip SQL Berhasil Disalin!' : 'Salin Seluruh Skrip SQL'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PRINT PREVIEW MODAL INTEGRATION                           */}
      {/* ========================================================= */}
      <PrintPreviewModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        defaultOrientation="portrait"
        title={`Berita Acara Pelaksanaan Ujian - ${currentExam?.subjectName || 'CBT'}`}
      >
        <div className="font-serif text-black leading-relaxed">
          <OfficialLetterhead
            judulDokumen="BERITA ACARA PELAKSANAAN KEGIATAN ASESMEN / UJIAN SISWA"
            subJudulDokumen="TAHUN AJARAN 2025/2026 - SEMESTER GANJIL"
          />

          <p className="text-xs sm:text-sm text-justify my-2 indent-6">
            Pada hari ini <strong>{eventDate}</strong>, telah dilaksanakan Kegiatan Asesmen Sumatif / Ujian Berbasis Komputer dan Smartphone (CBT) di lingkungan UPT SMP Negeri 7 Pasuruan dengan rincian sebagai berikut:
          </p>

          <table className="w-full text-xs sm:text-sm border-collapse border border-black my-2">
            <tbody>
              <tr>
                <td className="p-2 border border-black font-bold w-[30%] bg-slate-50">Mata Pelajaran</td>
                <td className="p-2 border border-black w-[70%] font-semibold">{currentExam?.subjectName || '-'}</td>
              </tr>
              <tr>
                <td className="p-2 border border-black font-bold bg-slate-50">Judul / Paket Ujian</td>
                <td className="p-2 border border-black">{currentExam?.title || '-'}</td>
              </tr>
              <tr>
                <td className="p-2 border border-black font-bold bg-slate-50">Tingkat / Rombel</td>
                <td className="p-2 border border-black font-semibold">
                  {currentExam?.targetClasses?.join(', ') || 'Semua Rombel Terdaftar'}
                </td>
              </tr>
              <tr>
                <td className="p-2 border border-black font-bold bg-slate-50">Hari, Tanggal</td>
                <td className="p-2 border border-black">{eventDate}</td>
              </tr>
              <tr>
                <td className="p-2 border border-black font-bold bg-slate-50">Waktu &amp; Sesi</td>
                <td className="p-2 border border-black">{sessionTime} &bull; {sessionName}</td>
              </tr>
              <tr>
                <td className="p-2 border border-black font-bold bg-slate-50">Ruang Pelaksanaan</td>
                <td className="p-2 border border-black font-semibold">{roomLocation}</td>
              </tr>
            </tbody>
          </table>

          <h5 className="font-bold text-xs sm:text-sm mb-1.5 uppercase mt-3">
            A. Rekapitulasi Kehadiran Peserta Didik
          </h5>
          <table className="w-full text-xs sm:text-sm border-collapse border border-black text-center table-fixed mb-3">
            <thead className="bg-slate-100 font-bold">
              <tr>
                <th className="p-1.5 border border-black w-[25%]">Peserta Terdaftar</th>
                <th className="p-1.5 border border-black w-[25%]">Peserta Hadir</th>
                <th className="p-1.5 border border-black w-[25%]">Peserta Tidak Hadir</th>
                <th className="p-1.5 border border-black w-[25%]">Persentase Kehadiran</th>
              </tr>
            </thead>
            <tbody>
              <tr className="font-bold">
                <td className="p-1.5 border border-black">{customRegisteredCount} Siswa</td>
                <td className="p-1.5 border border-black">{customPresentCount} Siswa</td>
                <td className="p-1.5 border border-black">{absentList.length} Siswa</td>
                <td className="p-1.5 border border-black">
                  {customRegisteredCount > 0 ? ((customPresentCount / customRegisteredCount) * 100).toFixed(1) : 100}%
                </td>
              </tr>
            </tbody>
          </table>

          {absentList.length > 0 && (
            <div className="my-2">
              <h6 className="font-bold text-xs mb-1">
                Rincian Peserta Didik Yang Tidak Hadir:
              </h6>
              <table className="w-full text-xs border-collapse border border-black table-fixed">
                <thead className="bg-slate-100 font-bold text-center">
                  <tr>
                    <th className="p-1 border border-black w-[8%]">No</th>
                    <th className="p-1 border border-black w-[40%] text-left">Nama Siswa</th>
                    <th className="p-1 border border-black w-[15%]">Kelas</th>
                    <th className="p-1 border border-black w-[17%]">Alasan</th>
                    <th className="p-1 border border-black w-[20%] text-left">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {absentList.map((st, i) => (
                    <tr key={st.id}>
                      <td className="p-1 border border-black text-center">{i + 1}</td>
                      <td className="p-1 border border-black font-semibold">{st.name}</td>
                      <td className="p-1 border border-black text-center">{st.classGroup}</td>
                      <td className="p-1 border border-black text-center">{st.reason}</td>
                      <td className="p-1 border border-black">{st.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <h5 className="font-bold text-xs sm:text-sm mb-1 uppercase mt-3">
            B. Catatan Jalannya Kegiatan Asesmen / Kejadian Khusus
          </h5>
          <div className="border border-black p-2.5 text-xs space-y-1 bg-slate-50/50 leading-relaxed mb-3">
            <p>1. <strong>Ketertiban Siswa:</strong> {conditionNotes}</p>
            <p>2. <strong>Sarana &amp; Jaringan:</strong> {technicalIssues}</p>
            <p>3. <strong>Tindakan Proktor/Pengawas:</strong> {proctorAction}</p>
          </div>

          <p className="text-xs text-justify">
            Demikian Berita Acara Pelaksanaan Kegiatan Asesmen ini dibuat dengan sebenar-benarnya sesuai dengan kondisi nyata di lapangan untuk dapat dipergunakan sebagaimana mestinya.
          </p>

          <OfficialReportSignature
            teacherName={proctorName}
            teacherNip={proctorNip}
            headmasterName={headmasterName}
            headmasterNip={headmasterNip}
            location="Pasuruan"
            dateStr={eventDate}
          />
        </div>
      </PrintPreviewModal>

    </div>
  );
};
