export const DEFAULT_CLASSES = [
  '7A', '7B', '7C', '7D', '7E', '7F', '7G', '7H',
  '8A', '8B', '8C', '8D', '8E', '8F', '8G', '8H',
  '9A', '9B', '9C', '9D', '9E', '9F', '9G', '9H'
];

/**
 * Checks if a student's class matches any target classes configured for an exam.
 * Handles exact matches, grade levels (e.g., '7' matches '7A', '7-A', 'Kelas 7A'),
 * and variations with hyphens or spaces (e.g., '7-A' matches '7A').
 */
export function isStudentEligibleForExam(
  targetClasses: string[] | undefined,
  studentClass: string | undefined
): boolean {
  // If exam has no targetClasses or it's empty, open to all students
  if (!targetClasses || targetClasses.length === 0) return true;
  if (!studentClass || !studentClass.trim()) return true;

  const normalize = (val: string) => val.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const sNorm = normalize(studentClass);
  const sRawLower = studentClass.toLowerCase().trim();

  return targetClasses.some(tc => {
    const tNorm = normalize(tc);
    const tRawLower = tc.toLowerCase().trim();

    if (!tNorm) return false;

    // Direct match (case-insensitive)
    if (sRawLower === tRawLower) return true;

    // Normalized match (ignoring dashes/spaces, e.g. "7-A" matches "7A")
    if (sNorm === tNorm) return true;

    // Single grade match: "7" matches "7A", "7-A", "7B", "KELAS7A", etc.
    if (tNorm === '7' && (sNorm.startsWith('7') || sNorm.includes('7'))) return true;
    if (tNorm === '8' && (sNorm.startsWith('8') || sNorm.includes('8'))) return true;
    if (tNorm === '9' && (sNorm.startsWith('9') || sNorm.includes('9'))) return true;

    // "KELAS7" matches "7A", etc.
    if (tNorm === 'KELAS7' && (sNorm.startsWith('7') || sNorm.includes('7'))) return true;
    if (tNorm === 'KELAS8' && (sNorm.startsWith('8') || sNorm.includes('8'))) return true;
    if (tNorm === 'KELAS9' && (sNorm.startsWith('9') || sNorm.includes('9'))) return true;

    return false;
  });
}
