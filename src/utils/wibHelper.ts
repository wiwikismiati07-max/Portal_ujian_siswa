// ====================================================================
// WIB TIMEZONE UTILITY (Waktu Indonesia Barat / Asia/Jakarta, UTC+7)
// Standar waktu resmi untuk pelaksanaan CBT SMP Negeri 7
// ====================================================================

export const WIB_TIMEZONE = 'Asia/Jakarta';
export const WIB_OFFSET_HOURS = 7;
export const WIB_OFFSET_MS = WIB_OFFSET_HOURS * 60 * 60 * 1000;

/**
 * Mendapatkan representasi waktu sekarang dalam WIB
 */
export const getNowWib = (): Date => {
  return new Date();
};

/**
 * Mengubah ISO string atau timestamp menjadi format value input datetime-local: "YYYY-MM-DDTHH:mm"
 * Sesuai waktu WIB (Asia/Jakarta)
 */
export const toWibInputValue = (isoOrDateStr?: string): string => {
  const d = isoOrDateStr ? new Date(isoOrDateStr) : new Date();
  const validDate = isNaN(d.getTime()) ? new Date() : d;

  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: WIB_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).formatToParts(validDate);

    const get = (type: string) => parts.find(p => p.type === type)?.value || '00';
    const year = get('year');
    const month = get('month');
    const day = get('day');
    let hour = get('hour');
    if (hour === '24') hour = '00';
    const minute = get('minute');

    return `${year}-${month}-${day}T${hour}:${minute}`;
  } catch {
    // Fallback jika Intl gagal
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${validDate.getFullYear()}-${pad(validDate.getMonth() + 1)}-${pad(validDate.getDate())}T${pad(validDate.getHours())}:${pad(validDate.getMinutes())}`;
  }
};

/**
 * Mengubah nilai input datetime-local ("YYYY-MM-DDTHH:mm" yang diinput guru dalam WIB)
 * menjadi string ISO UTC yang valid.
 * Contoh: "2026-09-28T10:35" (WIB UTC+7) -> "2026-09-28T03:35:00.000Z"
 */
export const wibInputToIsoString = (inputValue: string): string => {
  if (!inputValue) return new Date().toISOString();

  // Jika sudah format ISO lengkap dengan Z atau offset
  if (inputValue.includes('Z') || (inputValue.length > 19 && (inputValue.includes('+') || inputValue.includes('-')))) {
    const d = new Date(inputValue);
    if (!isNaN(d.getTime())) return d.toISOString();
  }

  try {
    const [datePart, timePart] = inputValue.split('T');
    if (!datePart) return new Date().toISOString();

    const [yearStr, monthStr, dayStr] = datePart.split('-');
    const [hourStr = '00', minStr = '00'] = (timePart || '00:00').split(':');

    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1; // 0-indexed bulan
    const day = parseInt(dayStr, 10);
    const hour = parseInt(hourStr, 10);
    const min = parseInt(minStr, 10);

    // Hitung UTC timestamp berdasarkan waktu WIB (kurang 7 jam)
    const utcTimestamp = Date.UTC(year, month, day, hour - WIB_OFFSET_HOURS, min, 0, 0);
    return new Date(utcTimestamp).toISOString();
  } catch {
    return new Date(inputValue).toISOString();
  }
};

/**
 * Format tanggal dalam Bahasa Indonesia dan zona waktu WIB (Asia/Jakarta)
 * Contoh: "Senin, 28 September 2026"
 */
export const formatWibDate = (isoOrDateStr?: string): string => {
  if (!isoOrDateStr) return '-';
  try {
    const d = new Date(isoOrDateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('id-ID', {
      timeZone: WIB_TIMEZONE,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return '-';
  }
};

/**
 * Format jam dalam WIB (Asia/Jakarta)
 * Contoh: "10.35 WIB"
 */
export const formatWibTime = (isoOrDateStr?: string): string => {
  if (!isoOrDateStr) return '-';
  try {
    const d = new Date(isoOrDateStr);
    if (isNaN(d.getTime())) return '-';
    const parts = new Intl.DateTimeFormat('id-ID', {
      timeZone: WIB_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).formatToParts(d);

    const hour = parts.find(p => p.type === 'hour')?.value || '00';
    const minute = parts.find(p => p.type === 'minute')?.value || '00';
    return `${hour}.${minute} WIB`;
  } catch {
    return '-';
  }
};

/**
 * Format tanggal dan jam lengkap dalam WIB
 * Contoh: "Senin, 28 September 2026 pukul 10.35 WIB"
 */
export const formatWibDateTime = (isoOrDateStr?: string): string => {
  if (!isoOrDateStr) return '-';
  const dateStr = formatWibDate(isoOrDateStr);
  const timeStr = formatWibTime(isoOrDateStr);
  if (dateStr === '-' || timeStr === '-') return '-';
  return `${dateStr} pukul ${timeStr}`;
};

/**
 * Memeriksa apakah waktu rilis ujian sudah tiba (siap dikerjakan).
 * Soal HANYA siap dikerjakan jika nowMs >= releaseTimeMs.
 */
export const isWibExamReady = (uploadDateOrCreatedAt?: string, nowMs: number = Date.now()): boolean => {
  if (!uploadDateOrCreatedAt) return false;
  const releaseTime = new Date(uploadDateOrCreatedAt).getTime();
  if (isNaN(releaseTime)) return false;
  return nowMs >= releaseTime;
};

/**
 * Hitung mundur sisa waktu menuju jam rilis ujian
 */
export const formatWibCountdown = (targetIsoOrDateStr: string, nowMs: number = Date.now()): string => {
  const targetTime = new Date(targetIsoOrDateStr).getTime();
  if (isNaN(targetTime)) return '0 detik';
  const diff = targetTime - nowMs;
  if (diff <= 0) return 'Waktu rilis telah tiba';

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days} hari ${hours} jam lagi`;
  if (hours > 0) return `${hours} jam ${minutes} menit lagi`;
  if (minutes > 0) return `${minutes} menit ${seconds} detik lagi`;
  return `${seconds} detik lagi`;
};
