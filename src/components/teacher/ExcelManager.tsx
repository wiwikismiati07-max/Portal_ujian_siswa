import React, { useState } from 'react';
import { User, Subject } from '../../types';
import {
  downloadExcelTemplate,
  parseUploadedExcel,
  ExcelImportResult
} from '../../utils/excelHelper';
import {
  FileSpreadsheet,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Users,
  GraduationCap,
  BookOpen,
  ArrowRight,
  Loader2
} from 'lucide-react';

interface ExcelManagerProps {
  onImportStudents: (students: User[], onProgress?: (processed: number, total: number) => void) => Promise<any> | void;
  onImportTeachers: (teachers: User[], onProgress?: (processed: number, total: number) => void) => Promise<any> | void;
  onImportSubjects: (subjects: Subject[], onProgress?: (processed: number, total: number) => void) => Promise<any> | void;
}

export const ExcelManager: React.FC<ExcelManagerProps> = ({
  onImportStudents,
  onImportTeachers,
  onImportSubjects
}) => {
  const [targetType, setTargetType] = useState<'siswa' | 'guru' | 'mapel'>('siswa');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [importResult, setImportResult] = useState<ExcelImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsProcessing(true);
    setProgressStatus('Membaca dan memproses berkas Excel...');
    setProgressPercent(10);
    setImportResult(null);

    try {
      const result = await parseUploadedExcel(file, targetType);

      if (!result.success) {
        setImportResult(result);
        setIsProcessing(false);
        return;
      }

      setProgressPercent(40);
      setProgressStatus(`Mengekstrak ${result.importedStudents?.length || result.importedTeachers?.length || result.importedSubjects?.length} data...`);

      if (result.importedStudents && result.importedStudents.length > 0) {
        setProgressStatus(`Menyimpan ${result.importedStudents.length} data siswa ke database Supabase...`);
        await onImportStudents(result.importedStudents, (processed, total) => {
          const pct = Math.min(98, 40 + Math.round((processed / total) * 58));
          setProgressPercent(pct);
          setProgressStatus(`Menyimpan ke Supabase: ${processed} dari ${total} siswa...`);
        });
      } else if (result.importedTeachers && result.importedTeachers.length > 0) {
        setProgressStatus(`Menyimpan ${result.importedTeachers.length} data guru ke database Supabase...`);
        await onImportTeachers(result.importedTeachers, (processed, total) => {
          const pct = Math.min(98, 40 + Math.round((processed / total) * 58));
          setProgressPercent(pct);
          setProgressStatus(`Menyimpan ke Supabase: ${processed} dari ${total} guru...`);
        });
      } else if (result.importedSubjects && result.importedSubjects.length > 0) {
        setProgressStatus(`Menyimpan ${result.importedSubjects.length} data mata pelajaran ke database Supabase...`);
        await onImportSubjects(result.importedSubjects, (processed, total) => {
          const pct = Math.min(98, 40 + Math.round((processed / total) * 58));
          setProgressPercent(pct);
          setProgressStatus(`Menyimpan ke Supabase: ${processed} dari ${total} mapel...`);
        });
      }

      setProgressPercent(100);
      setProgressStatus('Selesai disimpan ke Supabase & sistem!');
      setImportResult({
        ...result,
        message: `${result.message} Data langsung tersimpan di Supabase & tabel aktif.`
      });
    } catch (err: any) {
      console.error('Import processing error:', err);
      setImportResult({
        success: false,
        message: `Terjadi kendala saat menyimpan data: ${err?.message || 'Gagal'}`
      });
    } finally {
      setIsProcessing(false);
      // Reset file input so user can re-upload if needed
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            Pusat Impor Data Excel (.xlsx) & Sinkronisasi Langsung ke Supabase
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Unggah berkas spreadsheet Excel untuk memperbarui data Siswa, Guru, dan Mata Pelajaran. Data yang diunggah akan otomatis <strong>langsung tersimpan di Supabase Cloud</strong> dan menindih data lama pada kategori terkait.
          </p>
        </div>

        {/* Template Downloads */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide mr-1">
            Unduh Format:
          </span>
          <button
            type="button"
            onClick={() => downloadExcelTemplate('siswa')}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-indigo-200 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Format Siswa.xlsx</span>
          </button>
          <button
            type="button"
            onClick={() => downloadExcelTemplate('guru')}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-emerald-200 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Format Guru.xlsx</span>
          </button>
          <button
            type="button"
            onClick={() => downloadExcelTemplate('mapel')}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-blue-200 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Format Mapel.xlsx</span>
          </button>
        </div>
      </div>

      {/* Upload Zone Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
        {/* Step 1: Select Type */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
            Langkah 1: Pilih Jenis Data yang Ingin Diunggah
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => {
                setTargetType('siswa');
                setImportResult(null);
              }}
              className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                targetType === 'siswa'
                  ? 'bg-indigo-50/80 border-indigo-600 text-indigo-950 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className={`p-2 rounded-lg ${targetType === 'siswa' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold">Data Siswa</h4>
                <p className="text-[11px] text-slate-500">NIS, Nama Lengkap, Kelas/Rombel, Username, Password</p>
              </div>
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => {
                setTargetType('guru');
                setImportResult(null);
              }}
              className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                targetType === 'guru'
                  ? 'bg-emerald-50/80 border-emerald-600 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className={`p-2 rounded-lg ${targetType === 'guru' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold">Data Guru</h4>
                <p className="text-[11px] text-slate-500">NIP, Nama Lengkap Guru, Mata Pelajaran</p>
              </div>
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => {
                setTargetType('mapel');
                setImportResult(null);
              }}
              className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                targetType === 'mapel'
                  ? 'bg-blue-50/80 border-blue-600 text-blue-950 ring-2 ring-blue-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className={`p-2 rounded-lg ${targetType === 'mapel' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold">Mata Pelajaran</h4>
                <p className="text-[11px] text-slate-500">Kode Mapel, Nama Mapel, Guru, KKM</p>
              </div>
            </button>
          </div>
        </div>

        {/* Step 2: Upload Area */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
            Langkah 2: Unggah File Excel (.xlsx / .xls)
          </label>
          <div className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
            isProcessing ? 'border-indigo-400 bg-indigo-50/30' : 'border-slate-300 hover:border-indigo-500 bg-slate-50/50 hover:bg-slate-50'
          }`}>
            <input
              type="file"
              accept=".xlsx, .xls"
              disabled={isProcessing}
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xs transition-transform ${
                isProcessing ? 'bg-indigo-600 text-white animate-pulse' : 'bg-white text-indigo-600 border border-slate-200'
              }`}>
                {isProcessing ? (
                  <Loader2 className="w-7 h-7 animate-spin" />
                ) : (
                  <UploadCloud className="w-7 h-7" />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  {isProcessing
                    ? progressStatus
                    : 'Klik atau Seret Berkas Excel ke Sini'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Format yang didukung: .xlsx atau .xls (Ukuran maks: 15MB)
                </p>
              </div>

              {isProcessing && (
                <div className="w-full max-w-md mt-4 space-y-2">
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                    <span>{progressStatus}</span>
                    <span>{progressPercent}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {importResult && (
          <div
            className={`mt-6 p-4 rounded-xl flex items-start gap-3 border animate-in fade-in ${
              importResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {importResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <h5 className="text-xs sm:text-sm font-bold">
                {importResult.success ? 'Berhasil Mengimpor Data & Tersimpan ke Supabase!' : 'Gagal Mengimpor Berkas'}
              </h5>
              <p className="text-xs mt-0.5 opacity-90">{importResult.message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
