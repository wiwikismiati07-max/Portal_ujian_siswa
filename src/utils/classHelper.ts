export const DEFAULT_CLASSES = [
  '7A', '7B', '7C', '7D', '7E', '7F', '7G', '7H',
  '8A', '8B', '8C', '8D', '8E', '8F', '8G', '8H',
  '9A', '9B', '9C', '9D', '9E', '9F', '9G', '9H'
];

/**
 * Mengubah nama kelas ke format standar resmi SMPN 7 tanpa tanda hubung strip (misal: '7-A' -> '7A', '7 - A' -> '7A').
 */
export function normalizeClassGroup(rawClass?: string): string {
  if (!rawClass) return '';
  const clean = rawClass.trim().toUpperCase();
  // Deteksi kelas bertanda hubung strip seperti 7-A, 8-B, 9-H atau spasi
  const match = clean.match(/^(?:KELAS\s*)?(\d+)\s*[-_ ]*\s*([A-Z0-9]+)$/);
  if (match) {
    return `${match[1]}${match[2]}`;
  }
  return clean;
}

/**
 * Checks if a student's class matches any target classes configured for an exam.
 * Handles exact matches, grade levels (e.g., '7' matches '7A', '7-A', 'Kelas 7A'),
 * and variations with hyphens or spaces (e.g., '7-A' matches '7A').
 */
export function isStudentEligibleForExam(
  targetClasses: string[] | undefined,
  studentClass: string | undefined
): boolean {
  if (!targetClasses || targetClasses.length === 0) return true;
  if (!studentClass || !studentClass.trim()) return true;

  const normalize = (val: string) => val.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const sNorm = normalize(studentClass);
  const sRawLower = studentClass.toLowerCase().trim();

  return targetClasses.some(tc => {
    const tNorm = normalize(tc);
    const tRawLower = tc.toLowerCase().trim();

    if (!tNorm) return false;
    if (sRawLower === tRawLower) return true;
    if (sNorm === tNorm) return true;

    if (tNorm === '7' && (sNorm.startsWith('7') || sNorm.includes('7'))) return true;
    if (tNorm === '8' && (sNorm.startsWith('8') || sNorm.includes('8'))) return true;
    if (tNorm === '9' && (sNorm.startsWith('9') || sNorm.includes('9'))) return true;

    if (tNorm === 'KELAS7' && (sNorm.startsWith('7') || sNorm.includes('7'))) return true;
    if (tNorm === 'KELAS8' && (sNorm.startsWith('8') || sNorm.includes('8'))) return true;
    if (tNorm === 'KELAS9' && (sNorm.startsWith('9') || sNorm.includes('9'))) return true;

    return false;
  });
}

/**
 * Natural sorting comparator for class groups (e.g. 7A, 7B, ... 8A, 8B, ... 9A, ... 9H).
 * Sorts by grade number first (7, 8, 9...), then by section letter/alphanumeric (A, B, C...).
 */
export function compareClassNames(classA?: string, classB?: string): number {
  if (!classA && !classB) return 0;
  if (!classA) return 1;
  if (!classB) return -1;

  const parse = (raw: string) => {
    const clean = raw.trim().toUpperCase();
    const match = clean.match(/^(\d+)?\s*[-_ ]*\s*([A-Z0-9]+)?$/);
    if (match) {
      const num = match[1] ? parseInt(match[1], 10) : 999;
      const sec = match[2] || '';
      return { num, sec, clean };
    }
    return { num: 999, sec: clean, clean };
  };

  const a = parse(classA);
  const b = parse(classB);

  if (a.num !== b.num) {
    return a.num - b.num;
  }
  return a.sec.localeCompare(b.sec, 'id', { numeric: true, sensitivity: 'base' });
}

/**
 * Combined comparator that sorts by class first (7A..9H), then by student name alphabetically (A-Z).
 */
export function compareByClassAndName(
  a: { studentClass?: string; classGroup?: string; studentName?: string; name?: string },
  b: { studentClass?: string; classGroup?: string; studentName?: string; name?: string }
): number {
  const clsA = a.studentClass || a.classGroup || '';
  const clsB = b.studentClass || b.classGroup || '';

  const classComp = compareClassNames(clsA, clsB);
  if (classComp !== 0) return classComp;

  const nameA = (a.studentName || a.name || '').trim();
  const nameB = (b.studentName || b.name || '').trim();
  return nameA.localeCompare(nameB, 'id', { sensitivity: 'base' });
}
