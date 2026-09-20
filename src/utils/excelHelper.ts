import * as XLSX from 'xlsx';
import { User, Subject, ExamSubmission } from '../types';

export interface ExcelImportResult {
  success: boolean;
  message: string;
  importedStudents?: User[];
  importedTeachers?: User[];
  importedSubjects?: Subject[];
}

/**
 * Downloads a pre-formatted Excel template for Students, Teachers, or Subjects
 */
export const downloadExcelTemplate = (type: 'siswa' | 'guru' | 'mapel') => {
  const wb = XLSX.utils.book_new();

  if (type === 'siswa') {
    const data = [
      {
        'Nomor Induk Siswa (NIS)': '20241010',
        'Nama Lengkap': 'Muhammad Rizky Pratama',
        'Kelas': 'X-IPA-1',
        'Username': 'rizky_siswa',
        'Password': 'siswa123'
      },
      {
        'Nomor Induk Siswa (NIS)': '20241011',
        'Nama Lengkap': 'Nabila Putri Zahra',
        'Kelas': 'X-IPA-1',
        'Username': 'nabila_siswa',
        'Password': 'siswa123'
      },
      {
        'Nomor Induk Siswa (NIS)': '20241012',
        'Nama Lengkap': 'Dimas Anggara',
        'Kelas': 'X-IPA-2',
        'Username': 'dimas_siswa',
        'Password': 'siswa123'
      }
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Data_Siswa');
    XLSX.writeFile(wb, 'Template_Data_Siswa.xlsx');
  } else if (type === 'guru') {
    const data = [
      {
        'NIP': '198904122014021004',
        'Nama Lengkap Guru': 'Dr. Haryanto, M.Pd.',
        'Mata Pelajaran': 'Matematika Peminatan',
        'Username': 'haryanto_guru',
        'Password': 'guru123'
      },
      {
        'NIP': '199108152018032007',
        'Nama Lengkap Guru': 'Maya Anggraini, S.Si.',
        'Mata Pelajaran': 'Biologi',
        'Username': 'maya_guru',
        'Password': 'guru123'
      }
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Data_Guru');
    XLSX.writeFile(wb, 'Template_Data_Guru.xlsx');
  } else {
    const data = [
      {
        'Kode Mapel': 'BIO-10',
        'Nama Mata Pelajaran': 'Biologi Sel & Genetik',
        'Guru Pengampu': 'Maya Anggraini, S.Si.',
        'KKM': 75
      },
      {
        'Kode Mapel': 'KIM-10',
        'Nama Mata Pelajaran': 'Kimia Dasar',
        'Guru Pengampu': 'Drs. Supriyanto',
        'KKM': 75
      },
      {
        'Kode Mapel': 'SEJ-10',
        'Nama Mata Pelajaran': 'Sejarah Indonesia',
        'Guru Pengampu': 'Nurul Hidayah, S.Pd.',
        'KKM': 78
      }
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Data_Mata_Pelajaran');
    XLSX.writeFile(wb, 'Template_Data_MataPelajaran.xlsx');
  }
};

/**
 * Parses an uploaded Excel file and extracts either Students, Teachers, or Subjects
 */
export const parseUploadedExcel = async (
  file: File,
  targetType: 'siswa' | 'guru' | 'mapel'
): Promise<ExcelImportResult> => {
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    if (!rawRows || rawRows.length === 0) {
      return { success: false, message: 'File Excel kosong atau tidak memiliki data baris!' };
    }

    if (targetType === 'siswa') {
      const students: User[] = [];
      for (const row of rawRows) {
        // Find fields by flexible matching
        const nis = row['Nomor Induk Siswa (NIS)'] || row['NIS'] || row['nis'] || '';
        const name = row['Nama Lengkap'] || row['Nama'] || row['nama'] || '';
        const classGroup = row['Kelas'] || row['kelas'] || 'X-IPA-1';
        const username =
          row['Username'] ||
          row['username'] ||
          (name ? name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') : `siswa_${Date.now()}`);
        const password = row['Password'] || row['password'] || 'siswa123';

        if (name) {
          students.push({
            id: `user_siswa_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            username: String(username).trim(),
            password: String(password).trim(),
            name: String(name).trim(),
            role: 'siswa',
            nipOrNis: String(nis).trim(),
            classGroup: String(classGroup).trim()
          });
        }
      }

      if (students.length === 0) {
        return { success: false, message: 'Tidak ditemukan data siswa yang valid pada file Excel.' };
      }
      return {
        success: true,
        message: `Berhasil mengekstrak ${students.length} data siswa dari Excel.`,
        importedStudents: students
      };
    }

    if (targetType === 'guru') {
      const teachers: User[] = [];
      for (const row of rawRows) {
        const nip = row['NIP'] || row['nip'] || '';
        const name = row['Nama Lengkap Guru'] || row['Nama'] || row['nama'] || '';
        const subject = row['Mata Pelajaran'] || row['Mapel'] || row['mapel'] || '';
        const username =
          row['Username'] ||
          row['username'] ||
          (name ? name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') : `guru_${Date.now()}`);
        const password = row['Password'] || row['password'] || 'guru123';

        if (name) {
          teachers.push({
            id: `user_guru_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            username: String(username).trim(),
            password: String(password).trim(),
            name: String(name).trim(),
            role: 'guru',
            nipOrNis: String(nip).trim(),
            subjectName: String(subject).trim()
          });
        }
      }

      if (teachers.length === 0) {
        return { success: false, message: 'Tidak ditemukan data guru yang valid pada file Excel.' };
      }
      return {
        success: true,
        message: `Berhasil mengekstrak ${teachers.length} data guru dari Excel.`,
        importedTeachers: teachers
      };
    }

    if (targetType === 'mapel') {
      const subjects: Subject[] = [];
      for (const row of rawRows) {
        const code = row['Kode Mapel'] || row['Kode'] || row['kode'] || `MP-${Math.floor(Math.random() * 900) + 100}`;
        const name = row['Nama Mata Pelajaran'] || row['Nama'] || row['mapel'] || '';
        const teacher = row['Guru Pengampu'] || row['Guru'] || row['Pengampu'] || 'Guru Pengampu';
        const kkm = Number(row['KKM'] || row['kkm'] || 75);

        if (name) {
          subjects.push({
            id: `subj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            code: String(code).trim(),
            name: String(name).trim(),
            teacherName: String(teacher).trim(),
            passingGrade: isNaN(kkm) ? 75 : kkm
          });
        }
      }

      if (subjects.length === 0) {
        return { success: false, message: 'Tidak ditemukan data mata pelajaran yang valid pada file Excel.' };
      }
      return {
        success: true,
        message: `Berhasil mengekstrak ${subjects.length} data mata pelajaran dari Excel.`,
        importedSubjects: subjects
      };
    }

    return { success: false, message: 'Tipe import tidak dikenali.' };
  } catch (err: any) {
    console.error('Error parsing excel:', err);
    return { success: false, message: `Gagal membaca file Excel: ${err.message || 'Format tidak didukung'}` };
  }
};

/**
 * Export Exam Submissions to Excel
 */
export const exportExamResultsToExcel = (
  submissions: ExamSubmission[],
  examTitle: string,
  filterClass?: string
) => {
  const wb = XLSX.utils.book_new();

  const data = submissions.map((sub, idx) => ({
    'No': idx + 1,
    'Nama Siswa': sub.studentName,
    'Kelas': sub.studentClass,
    'Mata Pelajaran': sub.subjectName,
    'Judul Ujian': sub.examTitle,
    'Nilai Angka': sub.earnedScore,
    'Nilai Maksimum': sub.totalScore,
    'Persentase (%)': `${sub.percentage}%`,
    'Status Kelulusan': sub.passed ? 'TUNTAS' : 'REMEDIAL',
    'Jumlah Pelanggaran (Lockdown)': sub.violationCount,
    'Waktu Selesai': new Date(sub.submittedAt).toLocaleString('id-ID')
  }));

  const ws = XLSX.utils.json_to_sheet(data);

  // Column width auto
  const colWidths = [
    { wch: 5 },
    { wch: 25 },
    { wch: 12 },
    { wch: 25 },
    { wch: 35 },
    { wch: 12 },
    { wch: 14 },
    { wch: 15 },
    { wch: 18 },
    { wch: 22 },
    { wch: 20 }
  ];
  ws['!cols'] = colWidths;

  const sheetName = filterClass ? `Nilai_${filterClass}`.substring(0, 31) : 'Rekap_Nilai';
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const cleanTitle = examTitle.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
  XLSX.writeFile(wb, `Rekap_Nilai_${cleanTitle}_${filterClass || 'Semua'}.xlsx`);
};
