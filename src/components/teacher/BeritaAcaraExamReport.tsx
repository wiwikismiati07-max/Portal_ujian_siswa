import React, { useState, useMemo } from 'react';
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
  Check
} from 'lucide-react';
import { Exam, ExamSubmission, User } from '../../types';
import { getAllExams, getAllSubmissions, getAllUsers } from '../../utils/storage';
import { OfficialLetterhead } from '../common/OfficialLetterhead';
import { OfficialReportSignature } from '../common/OfficialReportSignature';
import { PrintPreviewModal } from '../common/PrintPreviewModal';

interface AbsentStudent {
  id: string;
  name: string;
  classGroup: string;
  reason: 'Sakit' | 'Izin' | 'Tanpa Keterangan';
  notes?: string;
}

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

  // Default computed counts
  const totalRegistered = Math.max(targetClassStudents.length, examSubmissions.length, 32);
  const totalAttended = examSubmissions.length > 0 ? examSubmissions.length : Math.max(totalRegistered - 1, 31);

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

  // Popup Modal State for Data Pelaksanaan Ujian
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Form States for Berita Acara
  const [eventDateIso, setEventDateIso] = useState<string>(todayIsoStr);
  const [eventDate, setEventDate] = useState<string>(todayDateStr);
  const [sessionTime, setSessionTime] = useState<string>('07.30 - 09.30 WIB');
  const [sessionName, setSessionName] = useState<string>('Sesi 1');
  const [roomLocation, setRoomLocation] = useState<string>('Laboratorium Komputer CBT 1');
  const [proctorName, setProctorName] = useState<string>(teacher.name || 'WIWIK ISMIATI, S.Pd');
  const [proctorNip, setProctorNip] = useState<string>(teacher.nipOrNis || '19831116 200904 2 003');

  // Handle calendar date change -> formats to Indonesian date string e.g. "Senin, 20 September 2026"
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

  // Manual adjustment of registered & present if needed
  const [customRegisteredCount, setCustomRegisteredCount] = useState<number>(totalRegistered);
  const [customPresentCount, setCustomPresentCount] = useState<number>(totalAttended);

  // Absent students list
  const [absentList, setAbsentList] = useState<AbsentStudent[]>([
    {
      id: 'absent_1',
      name: 'Budi Pratama Wijaya',
      classGroup: currentExam?.targetClasses?.[0] || 'VII-A',
      reason: 'Sakit',
      notes: 'Surat dokter terlampir'
    }
  ]);

  const [newAbsentName, setNewAbsentName] = useState('');
  const [newAbsentClass, setNewAbsentClass] = useState(currentExam?.targetClasses?.[0] || 'VII-A');
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

  // Print Preview Modal
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const handleAddAbsent = () => {
    if (!newAbsentName.trim()) return;
    const item: AbsentStudent = {
      id: `absent_${Date.now()}`,
      name: newAbsentName.trim(),
      classGroup: newAbsentClass,
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

  const handleCopySummary = () => {
    const summary = `BERITA ACARA KEGIATAN UJIAN\nUPT SMP NEGERI 7 PASURUAN\nMata Pelajaran: ${currentExam?.subjectName || '-'}\nPaket Ujian: ${currentExam?.title || '-'}\nHari/Tanggal: ${eventDate}\nWaktu/Sesi: ${sessionTime} (${sessionName})\nRuang: ${roomLocation}\nJumlah Peserta Terdaftar: ${customRegisteredCount}\nJumlah Hadir: ${customPresentCount}\nJumlah Tidak Hadir: ${absentList.length}\nPengawas: ${proctorName}\nStatus: ${conditionNotes}`;
    navigator.clipboard.writeText(summary);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Control Bar */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-lg border border-purple-800/40 flex flex-col lg:flex-row lg:items-center justify-between gap-5 no-print">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-500/30 text-purple-200 border border-purple-400/30 tracking-wider">
              Dokumen Kedinasan CBT
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 tracking-wider">
              Format Resmi A4
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-purple-300" />
            <span>Berita Acara Kegiatan Ujian Siswa</span>
          </h2>
          <p className="text-xs sm:text-sm text-purple-200/90 mt-1 max-w-2xl leading-relaxed">
            Formulir resmi pencatatan jalannya asesmen, kehadiran peserta, catatan insiden integritas, serta pengesahan bertanda tangan digital touchscreen/mouse untuk UPT SMP Negeri 7 Pasuruan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsConfigModalOpen(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Settings className="w-4 h-4" />
            <span>⚙️ Atur Data Pelaksanaan Ujian</span>
          </button>

          <button
            type="button"
            onClick={handleCopySummary}
            className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/15 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Copy className="w-4 h-4 text-purple-300" />
            <span>{copiedNotification ? 'Tersalin!' : 'Salin Ringkasan'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-900/30 hover:shadow-emerald-900/50"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF (A4)</span>
          </button>
        </div>
      </div>

      {/* Quick Status Card Summary & Absent Students Management (No Print) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
        
        {/* Left Col: Info Ringkas Konfigurasi Aktif */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Ringkasan Data Pelaksanaan</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsConfigModalOpen(true)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
            >
              Ubah Data
            </button>
          </div>

          <div className="space-y-2.5 text-xs text-slate-700">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Paket Ujian</span>
              <p className="font-bold text-slate-900 truncate">{currentExam?.title || '-'}</p>
              <p className="text-[11px] text-indigo-600">{currentExam?.subjectName || '-'}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Sesi / Waktu</span>
                <p className="font-bold text-slate-900">{sessionName}</p>
                <p className="text-[11px] text-slate-600">{sessionTime}</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Hari, Tanggal</span>
                <p className="font-bold text-slate-900 truncate">{eventDate}</p>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Pengawas Ruang</span>
              <p className="font-bold text-slate-900">{proctorName}</p>
              <p className="text-[11px] font-mono text-slate-500">NIP. {proctorNip}</p>
            </div>
          </div>

          <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 text-[11px] text-indigo-900 leading-relaxed">
            <span className="font-bold flex items-center gap-1 text-indigo-800 mb-0.5">
              <Info className="w-3.5 h-3.5" /> Tanda Tangan Digital Touchscreen
            </span>
            Pengawas dan Kepala Sekolah dapat langsung membubuhkan tanda tangan dengan sentuhan jari di layar HP maupun laptop pada lembar pratinjau di bawah.
          </div>
        </div>

        {/* Right 2 Cols: Kehadiran & Siswa Tidak Hadir */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                <span>Statistik Kehadiran Peserta Ujian</span>
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md border border-purple-200">
                Otomatis
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center mb-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Terdaftar</p>
                <input
                  type="number"
                  value={customRegisteredCount}
                  onChange={(e) => setCustomRegisteredCount(Number(e.target.value) || 0)}
                  className="text-lg font-extrabold text-slate-800 w-full text-center bg-transparent border-b border-dashed border-slate-300 focus:outline-hidden"
                />
                <p className="text-[10px] text-slate-400">siswa</p>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <p className="text-[10px] text-emerald-700 font-bold uppercase">Hadir</p>
                <input
                  type="number"
                  value={customPresentCount}
                  onChange={(e) => setCustomPresentCount(Number(e.target.value) || 0)}
                  className="text-lg font-extrabold text-emerald-700 w-full text-center bg-transparent border-b border-dashed border-emerald-300 focus:outline-hidden"
                />
                <p className="text-[10px] text-emerald-600">siswa</p>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                <p className="text-[10px] text-rose-700 font-bold uppercase">Absen</p>
                <p className="text-lg font-extrabold text-rose-700">
                  {absentList.length}
                </p>
                <p className="text-[10px] text-rose-600">siswa</p>
              </div>
            </div>

            {/* Daftar Siswa Tidak Hadir */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
                <span>Rincian Siswa Tidak Hadir ({absentList.length}):</span>
              </h4>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {absentList.length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-3 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    Nihil (Semua siswa hadir lengkap).
                  </p>
                ) : (
                  absentList.map((st, idx) => (
                    <div
                      key={st.id}
                      className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">
                          {idx + 1}. {st.name} <span className="font-normal text-slate-500">({st.classGroup})</span>
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Status: <strong className="text-rose-600">{st.reason}</strong> &bull; {st.notes}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAbsent(st.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer shrink-0"
                        title="Hapus dari daftar absen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Form Tambah Siswa Tidak Hadir */}
              <div className="mt-3 p-3 bg-slate-100/70 border border-slate-200 rounded-xl space-y-2">
                <p className="text-[11px] font-bold text-slate-700">Tambah Siswa Tidak Hadir:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Nama Lengkap Siswa"
                    value={newAbsentName}
                    onChange={(e) => setNewAbsentName(e.target.value)}
                    className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5"
                  />
                  <select
                    value={newAbsentReason}
                    onChange={(e) => setNewAbsentReason(e.target.value as any)}
                    className="text-xs bg-white border border-slate-300 rounded-lg px-2 py-1.5"
                  >
                    <option value="Sakit">Sakit</option>
                    <option value="Izin">Izin</option>
                    <option value="Tanpa Keterangan">Tanpa Keterangan</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Keterangan (opsional)"
                    value={newAbsentNotes}
                    onChange={(e) => setNewAbsentNotes(e.target.value)}
                    className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddAbsent}
                  disabled={!newAbsentName.trim()}
                  className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambahkan Siswa</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* DOCUMENT PREVIEW CARD (WYSIWYG Standar Format Cetak A4) */}
      <div className="bg-white rounded-2xl border border-slate-300 p-6 sm:p-10 shadow-md max-w-4xl mx-auto font-serif text-black leading-relaxed">
        
        {/* Kop Surat Resmi */}
        <OfficialLetterhead
          judulDokumen="BERITA ACARA PELAKSANAAN KEGIATAN ASESMEN / UJIAN SISWA"
        />

        {/* Paragraf Pembuka */}
        <div className="text-xs sm:text-sm text-justify space-y-2 mt-4">
          <p>
            Pada hari ini <strong>{eventDate}</strong>, bertempat di <strong>UPT SMP Negeri 7 Pasuruan</strong>, telah diselenggarakan kegiatan Asesmen Berbasis Komputer / Penilaian Sumatif Semester dengan rincian data sebagai berikut:
          </p>
        </div>

        {/* Tabel Identitas Pelaksanaan */}
        <div className="my-4">
          <table className="w-full text-xs sm:text-sm border-collapse border border-black table-fixed">
            <tbody>
              <tr>
                <td className="p-2 border border-black font-bold w-[30%] bg-slate-50">1. Mata Pelajaran</td>
                <td className="p-2 border border-black w-[70%] font-semibold">{currentExam?.subjectName || '-'}</td>
              </tr>
              <tr>
                <td className="p-2 border border-black font-bold bg-slate-50">2. Judul / Paket Ujian</td>
                <td className="p-2 border border-black">{currentExam?.title || '-'}</td>
              </tr>
              <tr>
                <td className="p-2 border border-black font-bold bg-slate-50">3. Tingkat / Rombel</td>
                <td className="p-2 border border-black font-semibold">
                  {currentExam?.targetClasses?.join(', ') || 'Semua Rombel Terdaftar'}
                </td>
              </tr>
              <tr>
                <td className="p-2 border border-black font-bold bg-slate-50">4. Hari, Tanggal</td>
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
          headmasterName="NUR FADILAH, S.Pd,.MPd"
          headmasterNip="19860410 201001 2 030"
          location="Pasuruan"
          dateStr={eventDate}
        />

      </div>

      {/* ================= POPUP MODAL: ATUR DATA PELAKSANAAN UJIAN ================= */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 no-print">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-900 to-indigo-900 text-white">
              <div className="flex items-center gap-2.5">
                <Settings className="w-5 h-5 text-purple-300" />
                <div>
                  <h3 className="text-base font-bold">Konfigurasi Data Pelaksanaan Ujian</h3>
                  <p className="text-xs text-purple-200">Ubah paket, sesi, waktu (jam analog), tanggal, dan pengawas ruang</p>
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

              {/* 3. Waktu Pelaksanaan (Jam) + Jam Analog */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
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
                  <p className="text-[10px] text-slate-500 mt-1">Durasi ujian: {currentExam?.durationMinutes || 90} menit.</p>
                </div>

                {/* Jam Analog Widget Preview */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full border-2 border-indigo-600 bg-white relative flex items-center justify-center shadow-inner shrink-0">
                    <div className="absolute w-0.5 h-5 bg-slate-800 top-3 left-[31px] origin-bottom rounded-full rotate-45"></div>
                    <div className="absolute w-0.5 h-6 bg-indigo-600 top-2 left-[31px] origin-bottom rounded-full rotate-90"></div>
                    <div className="w-2 h-2 rounded-full bg-rose-600 z-10"></div>
                    <span className="absolute text-[7px] font-bold top-0.5 text-slate-600">12</span>
                    <span className="absolute text-[7px] font-bold bottom-0.5 text-slate-600">6</span>
                    <span className="absolute text-[7px] font-bold right-1 text-slate-600">3</span>
                    <span className="absolute text-[7px] font-bold left-1 text-slate-600">9</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Simulasi Jam Ujian</p>
                    <p className="text-[11px] text-indigo-600 font-semibold">{sessionTime}</p>
                    <p className="text-[10px] text-slate-500">Berjalan sesuai standar CBT</p>
                  </div>
                </div>
              </div>

              {/* 4. Hari & Tanggal Pelaksanaan (Bentuk Kalender) */}
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
                    Hasil Format Resmi: {eventDate}
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

              {/* Ruangan */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Ruang Ujian / Laboratorium:
                </label>
                <input
                  type="text"
                  value={roomLocation}
                  onChange={(e) => setRoomLocation(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

            </div>

            {/* Footer Modal */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsConfigModalOpen(false)}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Simpan &amp; Terapkan ke Berita Acara</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Print Preview Modal Integration */}
      <PrintPreviewModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        defaultOrientation="portrait"
        title={`Berita Acara Pelaksanaan Ujian - ${currentExam?.subjectName || 'CBT'}`}
      >
        <div className="font-serif text-black leading-relaxed">
          <OfficialLetterhead judulDokumen="BERITA ACARA PELAKSANAAN KEGIATAN ASESMEN / UJIAN SISWA" />

          <div className="text-xs sm:text-sm text-justify space-y-2 mt-4">
            <p>
              Pada hari ini <strong>{eventDate}</strong>, bertempat di <strong>UPT SMP Negeri 7 Pasuruan</strong>, telah diselenggarakan kegiatan Asesmen Berbasis Komputer / Penilaian Sumatif dengan rincian data sebagai berikut:
            </p>
          </div>

          <table className="w-full text-xs sm:text-sm border-collapse border border-black my-4 table-fixed">
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
            headmasterName="NUR FADILAH, S.Pd,.MPd"
            headmasterNip="19860410 201001 2 030"
            location="Pasuruan"
            dateStr={eventDate}
          />
        </div>
      </PrintPreviewModal>

    </div>
  );
};
