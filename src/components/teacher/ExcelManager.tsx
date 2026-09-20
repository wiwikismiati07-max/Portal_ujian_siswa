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
  ArrowRight
} from 'lucide-react';

interface ExcelManagerProps {
  onImportStudents: (students: User[]) => void;
  onImportTeachers: (teachers: User[]) => void;
  onImportSubjects: (subjects: Subject[]) => void;
}

export const ExcelManager: React.FC<ExcelManagerProps> = ({
  onImportStudents,
  onImportTeachers,
  onImportSubjects
}) => {
  const [targetType, setTargetType] = useState<'siswa' | 'guru' | 'mapel'>('siswa');
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ExcelImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsProcessing(true);
    setImportResult(null);

    const result = await parseUploadedExcel(file, targetType);
    setImportResult(result);
    setIsProcessing(false);

    if (result.success) {
      if (result.importedStudents && result.importedStudents.length > 0) {
        onImportStudents(result.importedStudents);
      }
      if (result.importedTeachers && result.importedTeachers.length > 0) {
        onImportTeachers(result.importedTeachers);
      }
      if (result.importedSubjects && result.importedSubjects.length > 0) {
        onImportSubjects(result.importedSubjects);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            Pusat Impor Data Excel (.xlsx)
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Unggah berkas spreadsheet Excel untuk memperbarui data Siswa, Guru, dan Mata Pelajaran. Data yang diunggah akan otomatis <strong>menindih (overwrite)</strong> data kategori terkait.
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
                <p className="text-[11px] text-slate-500">NIS, Nama, Kelas, Username, Password</p>
              </div>
            </button>

            <button
              type="button"
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
                <h4 className="text-xs sm:text-sm font-bold">Data Guru Pengampu</h4>
                <p className="text-[11px] text-slate-500">NIP, Nama Guru, Mapel, Akun Login</p>
              </div>
            </button>

            <button
              type="button"
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
                <h4 className="text-xs sm:text-sm font-bold">Data Mata Pelajaran</h4>
                <p className="text-[11px] text-slate-500">Kode Mapel, Nama Mapel, KKM, Guru</p>
              </div>
            </button>
          </div>
        </div>

        {/* Step 2: Dropzone */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
            Langkah 2: Pilih File Spreadsheet (.xlsx)
          </label>

          <label className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50/50 hover:bg-indigo-50/20 transition-all">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-emerald-600 mb-3">
              <UploadCloud className="w-7 h-7" />
            </div>
            <span className="text-sm font-bold text-slate-800">
              {isProcessing ? 'Sedang membaca file Excel...' : 'Klik atau Seret Berkas Excel ke Sini'}
            </span>
            <span className="text-xs text-slate-400 mt-1">
              Format yang didukung: .xlsx atau .xls (Ukuran maks: 10MB)
            </span>
          </label>
        </div>

        {/* Feedback Message */}
        {importResult && (
          <div className="mt-6">
            {importResult.success ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs sm:text-sm text-emerald-900 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-950">Berhasil Mengimpor Data!</h4>
                  <p className="mt-0.5">{importResult.message}</p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs sm:text-sm text-rose-900 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-rose-950">Gagal Mengimpor File</h4>
                  <p className="mt-0.5">{importResult.message}</p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
