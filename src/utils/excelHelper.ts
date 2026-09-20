import * as XLSX from 'xlsx';
import { User, Subject } from '../types';

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
        'Kelas': '7-A',
        'Username': 'rizky_siswa',
        'Password': 'siswa123'
      },
      {
        'Nomor Induk Siswa (NIS)': '20241011',
        'Nama Lengkap': 'Nabila Putri Zahra',
        'Kelas': '7-A',
        'Username': 'nabila_siswa',
        'Password': 'siswa123'
      },
      {
        'Nomor Induk Siswa (NIS)': '20241012',
        'Nama Lengkap': 'Dimas Anggara',
        'Kelas': '7-B',
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
        'Mata Pelajaran': 'Matematika',
        'Username': 'haryanto_guru',
        'Password': 'guru123'
      },
      {
        'NIP': '199108152018032007',
        'Nama Lengkap Guru': 'Maya Anggraini, S.Si.',
        'Mata Pelajaran': 'IPA Terpadu',
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
        'Kode Mapel': 'MAT-7',
        'Nama Mata Pelajaran': 'Matematika Kelas 7',
        'Guru Pengampu': 'Dr. Haryanto, M.Pd.',
        'KKM': 75
      },
      {
        'Kode Mapel': 'IPA-7',
        'Nama Mata Pelajaran': 'IPA Terpadu',
        'Guru Pengampu': 'Maya Anggraini, S.Si.',
        'KKM': 75
      },
      {
        'Kode Mapel': 'IND-7',
        'Nama Mata Pelajaran': 'Bahasa Indonesia',
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
 * Helper to normalize object keys for flexible Indonesian header matching
 */
const normalizeRowKeys = (row: Record<string, any>): Record<string, string> => {
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(row)) {
    const cleanKey = key
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, ''); // e.g. "Nomor Induk Siswa (NIS)" -> "nomorinduksiswanis"
    normalized[cleanKey] = value !== undefined && value !== null ? String(value).trim() : '';
  }
  return normalized;
};

const findField = (row: Record<string, string>, possibleKeys: string[]): string => {
  for (const key of possibleKeys) {
    const cleanTarget = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (row[cleanTarget] !== undefined && row[cleanTarget] !== '') {
      return row[cleanTarget];
    }
  }
  // Fallback: check if any key in row contains the target substring
  for (const key of possibleKeys) {
    const cleanTarget = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const [rKey, rVal] of Object.entries(row)) {
      if (rVal && (rKey.includes(cleanTarget) || cleanTarget.includes(rKey))) {
        return rVal;
      }
    }
  }
  return '';
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
    if (!firstSheetName) {
      return { success: false, message: 'Berkas Excel tidak memiliki sheet yang dapat dibaca.' };
    }
    const worksheet = workbook.Sheets[firstSheetName];
    const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    if (!rawRows || rawRows.length === 0) {
      return { success: false, message: 'File Excel kosong atau tidak memiliki data baris!' };
    }

    if (targetType === 'siswa') {
      const students: User[] = [];
      const usedUsernames = new Set<string>();

      rawRows.forEach((rawRow, index) => {
        const row = normalizeRowKeys(rawRow);

        // Flexible search for name
        const name = findField(row, [
          'namalengkap',
          'nama',
          'namasiswa',
          'namapeserta',
          'namalengkapsiswa',
          'fullname',
          'studentname',
          'peserta'
        ]);

        if (!name) return; // Skip empty rows

        // Flexible search for NIS / NISN
        const nis = findField(row, [
          'nomorinduksiswanis',
          'nomorinduk',
          'nis',
          'nisn',
          'nisnisn',
          'nopeserta',
          'nomorpeserta',
          'noinduk',
          'idpeserta'
        ]);

        // Flexible search for class/rombel
        const classGroup = findField(row, [
          'kelas',
          'rombel',
          'kelasrombel',
          'tingkat',
          'ruang',
          'kelassiswa'
        ]) || '7-A';

        // Flexible search for username
        let rawUsername = findField(row, [
          'username',
          'user',
          'userid',
          'idpengguna',
          'nopeserta',
          'nis'
        ]);

        if (!rawUsername) {
          if (nis) {
            rawUsername = `siswa_${nis.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
          } else {
            const cleanName = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
            rawUsername = `${cleanName || 'siswa'}_${index + 1}`;
          }
        } else {
          rawUsername = rawUsername.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        }

        // Ensure unique username
        let finalUsername = rawUsername;
        let suffix = 1;
        while (usedUsernames.has(finalUsername)) {
          finalUsername = `${rawUsername}_${suffix}`;
          suffix++;
        }
        usedUsernames.add(finalUsername);

        // Flexible search for password
        const password = findField(row, [
          'password',
          'katasandi',
          'pass',
          'sandi',
          'pin'
        ]) || 'siswa123';

        students.push({
          id: `user_siswa_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`,
          username: finalUsername,
          password: password,
          name: name,
          role: 'siswa',
          nipOrNis: nis || undefined,
          classGroup: classGroup
        });
      });

      if (students.length === 0) {
        return {
          success: false,
          message: 'Tidak ditemukan kolom data siswa (Nama Lengkap) yang valid pada berkas Excel.'
        };
      }

      return {
        success: true,
        message: `Berhasil mengekstrak ${students.length} data siswa dari Excel.`,
        importedStudents: students
      };
    }

    if (targetType === 'guru') {
      const teachers: User[] = [];
      const usedUsernames = new Set<string>();

      rawRows.forEach((rawRow, index) => {
        const row = normalizeRowKeys(rawRow);

        const name = findField(row, [
          'namalengkapguru',
          'namaguru',
          'namalengkap',
          'nama',
          'fullname',
          'teachername'
        ]);

        if (!name) return;

        const nip = findField(row, [
          'nip',
          'nuptk',
          'nomorindukpegawai',
          'noinduk'
        ]);

        const subject = findField(row, [
          'matapelajaran',
          'mapel',
          'subject',
          'pengampu'
        ]) || 'Guru Mata Pelajaran';

        let rawUsername = findField(row, [
          'username',
          'user',
          'userid',
          'idpengguna',
          'nip'
        ]);

        if (!rawUsername) {
          const cleanName = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
          rawUsername = `guru_${cleanName || index + 1}`;
        } else {
          rawUsername = rawUsername.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        }

        let finalUsername = rawUsername;
        let suffix = 1;
        while (usedUsernames.has(finalUsername)) {
          finalUsername = `${rawUsername}_${suffix}`;
          suffix++;
        }
        usedUsernames.add(finalUsername);

        const password = findField(row, [
          'password',
          'katasandi',
          'pass',
          'sandi'
        ]) || 'guru123';

        teachers.push({
          id: `user_guru_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`,
          username: finalUsername,
          password: password,
          name: name,
          role: 'guru',
          nipOrNis: nip || undefined,
          subjectName: subject
        });
      });

      if (teachers.length === 0) {
        return {
          success: false,
          message: 'Tidak ditemukan kolom data guru (Nama Lengkap) yang valid pada berkas Excel.'
        };
      }

      return {
        success: true,
        message: `Berhasil mengekstrak ${teachers.length} data guru dari Excel.`,
        importedTeachers: teachers
      };
    }

    if (targetType === 'mapel') {
      const subjects: Subject[] = [];

      rawRows.forEach((rawRow, index) => {
        const row = normalizeRowKeys(rawRow);

        const name = findField(row, [
          'namamatapelajaran',
          'namamapel',
          'matapelajaran',
          'mapel',
          'subject'
        ]);

        if (!name) return;

        const code = findField(row, [
          'kodemapel',
          'kode',
          'kodematapelajaran'
        ]) || `MAPEL-${index + 1}`;

        const teacher = findField(row, [
          'gurupengampu',
          'guru',
          'namaguru',
          'pengampu'
        ]) || 'Guru Pengampu';

        const kkmStr = findField(row, [
          'kkm',
          'passinggrade',
          'nilaiminimal',
          'kriteria'
        ]);
        const kkm = Number(kkmStr) || 75;

        subjects.push({
          id: `subj_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`,
          code: code,
          name: name,
          teacherName: teacher,
          passingGrade: kkm
        });
      });

      if (subjects.length === 0) {
        return {
          success: false,
          message: 'Tidak ditemukan kolom data mata pelajaran yang valid pada berkas Excel.'
        };
      }

      return {
        success: true,
        message: `Berhasil mengekstrak ${subjects.length} data mata pelajaran dari Excel.`,
        importedSubjects: subjects
      };
    }

    return { success: false, message: 'Jenis data tidak valid.' };
  } catch (err: any) {
    console.error('Excel parse error:', err);
    return {
      success: false,
      message: `Gagal membaca berkas Excel: ${err?.message || 'Format berkas rusak atau tidak sesuai'}`
    };
  }
};

/**
 * Export student exam results/submissions to an Excel file
 */
export const exportExamResultsToExcel = (
  submissions: any[],
  examTitle: string,
  className?: string
) => {
  const wb = XLSX.utils.book_new();
  const rows = submissions.map((sub, idx) => ({
    'No': idx + 1,
    'Nama Siswa': sub.studentName,
    'Kelas': sub.studentClass,
    'Mata Pelajaran': sub.subjectName,
    'Judul Ujian': sub.examTitle,
    'Nilai Skor': sub.percentage,
    'Skor Diperoleh': `${sub.earnedScore} / ${sub.totalScore}`,
    'Status Kelulusan': sub.passed ? 'LULUS (TUNTAS)' : 'BELUM TUNTAS',
    'Jumlah Pelanggaran Layar': sub.violationCount || 0,
    'Waktu Selesai': sub.submittedAt ? new Date(sub.submittedAt).toLocaleString('id-ID') : '-'
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Rekap_Nilai');
  const safeFilename = `Rekap_Nilai_${examTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}${className ? `_${className}` : ''}.xlsx`;
  XLSX.writeFile(wb, safeFilename);
};

