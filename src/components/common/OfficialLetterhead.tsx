import React from 'react';

interface OfficialLetterheadProps {
  mataPelajaran?: string;
  kelas?: string;
  hariTanggal?: string;
  waktu?: string;
  judulDokumen?: string;
  subJudulDokumen?: string;
  // If true, will render with `.print-only` class so it only shows when printed.
  // If false, it renders on screen as well (e.g. for preview modal or print view).
  isPrintOnly?: boolean;
  className?: string;
}

export const OfficialLetterhead: React.FC<OfficialLetterheadProps> = ({
  mataPelajaran = 'Pendidikan Agama Islam & Budi Pekerti',
  kelas = 'VIII (Delapan)',
  hariTanggal,
  waktu = '90 Menit',
  judulDokumen,
  subJudulDokumen,
  isPrintOnly = true,
  className = ''
}) => {
  // Format default date if none provided (e.g. "Senin, 20 September 2026")
  const defaultDate = React.useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }, []);

  const displayDate = hariTanggal || defaultDate;

  return (
    <div className={`${isPrintOnly ? 'print-only' : 'block'} text-black mb-6 ${className}`}>
      {/* KOP SURAT ATAS (Header with Logos & Official Text) */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b-2 border-black/80">
        {/* LOGO DINAS (Pojok Kiri Atas) */}
        <div className="w-20 sm:w-24 shrink-0 flex items-center justify-center">
          <img
            src="https://i.ibb.co.com/C3Y7JXkN/logo-dinas.png"
            alt="Logo Dinas Pendidikan Kota Pasuruan"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            className="h-20 sm:h-24 w-auto object-contain mx-auto"
            onError={(e) => {
              // Fallback if image blocked
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        {/* TEKS RESMI KOP SURAT (Tengah) */}
        <div className="flex-1 text-center font-serif leading-tight px-1">
          <h3 className="text-base sm:text-lg font-bold tracking-wide uppercase text-black">
            PEMERINTAH KOTA PASURUAN
          </h3>
          <h2 className="text-xl sm:text-2xl font-black tracking-wider uppercase text-black my-0.5">
            UPT SMP NEGERI 7
          </h2>
          <p className="text-xs sm:text-sm text-black">
            Jalan Simpang Slamet Riadi Nomor 2, Kota Pasuruan, Jawa Timur, 67139
          </p>
          <p className="text-xs sm:text-sm text-black">
            Telepon (0343) 426845
          </p>
          <p className="text-xs sm:text-sm text-black">
            Pos-el <span className="italic">smp7pas@gmail.com</span>, Laman{' '}
            <span className="underline text-black">www.smpn7pasuruan.sch.id</span>
          </p>
        </div>

        {/* LOGO SMPN 7 (Pojok Kanan Atas) */}
        <div className="w-20 sm:w-24 shrink-0 flex items-center justify-center">
          <img
            src="https://iili.io/KDFk4fI.png"
            alt="Logo SMP Negeri 7 Pasuruan"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            className="h-20 sm:h-24 w-auto object-contain mx-auto"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
      </div>

      {/* DOUBLE DIVIDER LINE (GARIS KOP SURAT RESMI) */}
      <div className="mt-0.5 mb-3">
        <div className="border-t-[2.5px] border-black"></div>
        <div className="border-t-[0.8px] border-black mt-[1.5px]"></div>
      </div>

      {/* OPTIONAL JUDUL DOKUMEN (JIKA ADA) */}
      {judulDokumen && (
        <div className="text-center my-3">
          <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-black">
            {judulDokumen}
          </h3>
          {subJudulDokumen && (
            <p className="text-xs font-semibold text-black/80 mt-0.5">
              {subJudulDokumen}
            </p>
          )}
        </div>
      )}

      {/* KOTAK METADATA UJIAN (SESUAI DOKUMEN LAMPIRAN RESMI) */}
      <div className="border-[2.5px] border-black text-xs sm:text-sm font-semibold text-black bg-white my-2.5">
        {/* Baris 1: Mata Pelajaran & Hari/Tgl */}
        <div className="grid grid-cols-12 px-4 py-2 border-b-[1.5px] border-black">
          <div className="col-span-7 sm:col-span-8 flex items-center">
            <span className="w-32 sm:w-36 shrink-0 font-serif font-bold">Mata Pelajaran</span>
            <span className="mx-2 font-serif font-bold">:</span>
            <span className="font-serif font-normal flex-1 truncate">{mataPelajaran}</span>
          </div>
          <div className="col-span-5 sm:col-span-4 flex items-center">
            <span className="w-20 sm:w-24 shrink-0 font-serif font-bold">Hari/Tgl</span>
            <span className="mx-2 font-serif font-bold">:</span>
            <span className="font-serif font-normal flex-1">{displayDate}</span>
          </div>
        </div>

        {/* Baris 2: Kelas & Waktu */}
        <div className="grid grid-cols-12 px-4 py-2">
          <div className="col-span-7 sm:col-span-8 flex items-center">
            <span className="w-32 sm:w-36 shrink-0 font-serif font-bold">Kelas</span>
            <span className="mx-2 font-serif font-bold">:</span>
            <span className="font-serif font-normal flex-1 truncate">{kelas}</span>
          </div>
          <div className="col-span-5 sm:col-span-4 flex items-center">
            <span className="w-20 sm:w-24 shrink-0 font-serif font-bold">Waktu</span>
            <span className="mx-2 font-serif font-bold">:</span>
            <span className="font-serif font-normal flex-1">{waktu}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
