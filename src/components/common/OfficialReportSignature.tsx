import React, { useState, useEffect, useCallback } from 'react';
import { PenTool, Trash2 } from 'lucide-react';
import { SignaturePadModal } from './SignaturePadModal';

interface OfficialReportSignatureProps {
  teacherName?: string;
  teacherNip?: string;
  headmasterName?: string;
  headmasterNip?: string;
  location?: string;
  dateStr?: string;
  className?: string;
  interactive?: boolean;
}

// Formatter to ensure the name part is in uppercase, while academic degrees (S.Pd,.MPd, S.Pd, etc.) keep their correct capitalization
const formatSignerNameWithDegree = (rawName: string, role: 'headmaster' | 'teacher'): string => {
  if (!rawName) {
    return role === 'headmaster' ? 'NUR FADILAH, S.Pd,.MPd' : 'WIWIK ISMIATI, S.Pd';
  }

  // Exact matches or variations for Kepala Sekolah
  if (/nur\s*fadilah/i.test(rawName)) {
    return 'NUR FADILAH, S.Pd,.MPd';
  }

  // Exact matches or variations for Guru Wiwik
  if (/wiwik/i.test(rawName)) {
    return 'WIWIK ISMIATI, S.Pd';
  }

  // General formatting for any other teacher
  const commaIdx = rawName.indexOf(',');
  if (commaIdx !== -1) {
    const namePart = rawName.slice(0, commaIdx).toUpperCase();
    let degreesPart = rawName.slice(commaIdx);
    degreesPart = degreesPart
      .replace(/S\.PD\.?/gi, 'S.Pd')
      .replace(/M\.PD\.?/gi, 'MPd')
      .replace(/M\.SI\.?/gi, 'M.Si')
      .replace(/M\.KOM\.?/gi, 'M.Kom')
      .replace(/M\.HUM\.?/gi, 'M.Hum')
      .replace(/S\.KOM\.?/gi, 'S.Kom');
    return `${namePart}${degreesPart}`;
  }

  return rawName;
};

export const OfficialReportSignature: React.FC<OfficialReportSignatureProps> = ({
  teacherName = 'WIWIK ISMIATI, S.Pd',
  teacherNip = '19831116 200904 2 003',
  headmasterName = 'NUR FADILAH, S.Pd,.MPd',
  headmasterNip = '19860410 201001 2 030',
  location = 'Pasuruan',
  dateStr,
  className = '',
  interactive = true
}) => {
  const currentDate = React.useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }, []);

  const displayDate = dateStr || currentDate;
  const cleanHeadmasterNip = (headmasterNip || '').replace(/^NIP\.?\s*/i, '');
  const cleanTeacherNip = (teacherNip || '').replace(/^NIP\.?\s*/i, '');

  const displayHeadmasterName = React.useMemo(
    () => formatSignerNameWithDegree(headmasterName, 'headmaster'),
    [headmasterName]
  );
  const displayTeacherName = React.useMemo(
    () => formatSignerNameWithDegree(teacherName, 'teacher'),
    [teacherName]
  );

  const headmasterStorageKey = 'spanju_signature_headmaster';
  const teacherStorageKey = `spanju_signature_teacher_${cleanTeacherNip.replace(/\s+/g, '')}`;

  const [headmasterSig, setHeadmasterSig] = useState<string | null>(null);
  const [teacherSig, setTeacherSig] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<'headmaster' | 'teacher' | null>(null);

  const loadSignatures = useCallback(() => {
    try {
      const hSig = localStorage.getItem(headmasterStorageKey);
      setHeadmasterSig(hSig);
      const tSig = localStorage.getItem(teacherStorageKey) || localStorage.getItem('spanju_signature_teacher_default');
      setTeacherSig(tSig);
    } catch {
      // ignore
    }
  }, [headmasterStorageKey, teacherStorageKey]);

  useEffect(() => {
    loadSignatures();
    const handleSync = () => loadSignatures();
    window.addEventListener('spanju-signature-updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('spanju-signature-updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [loadSignatures]);

  const handleSaveSignature = (role: 'headmaster' | 'teacher', dataUrl: string) => {
    try {
      if (role === 'headmaster') {
        localStorage.setItem(headmasterStorageKey, dataUrl);
        setHeadmasterSig(dataUrl);
      } else {
        localStorage.setItem(teacherStorageKey, dataUrl);
        localStorage.setItem('spanju_signature_teacher_default', dataUrl);
        setTeacherSig(dataUrl);
      }
      window.dispatchEvent(new Event('spanju-signature-updated'));
    } catch {
      // ignore
    }
  };

  const handleDeleteSignature = (role: 'headmaster' | 'teacher', e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (role === 'headmaster') {
        localStorage.removeItem(headmasterStorageKey);
        setHeadmasterSig(null);
      } else {
        localStorage.removeItem(teacherStorageKey);
        localStorage.removeItem('spanju_signature_teacher_default');
        setTeacherSig(null);
      }
      window.dispatchEvent(new Event('spanju-signature-updated'));
    } catch {
      // ignore
    }
  };

  return (
    <div className={`mt-8 pt-4 font-serif text-black text-xs sm:text-sm break-inside-avoid ${className}`}>
      <div className="grid grid-cols-2 gap-8 text-center">
        {/* Kolom Kiri: Mengetahui Kepala Sekolah */}
        <div className="space-y-1 flex flex-col items-center">
          <p className="font-normal">Mengetahui,</p>
          <p className="font-bold">Kepala UPT SMP Negeri 7 Pasuruan</p>

          {/* Touchscreen / Mouse Signature Container */}
          <div className="h-20 sm:h-24 w-full flex items-center justify-center relative my-1 group">
            {headmasterSig ? (
              <div className="relative flex items-center justify-center h-full w-full">
                <img
                  src={headmasterSig}
                  alt="Tanda Tangan Kepala Sekolah"
                  className="max-h-20 sm:max-h-24 max-w-[190px] object-contain pointer-events-none"
                />
                {interactive && (
                  <div className="no-print absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1.5 backdrop-blur-[1px]">
                    <button
                      type="button"
                      onClick={() => setActiveModal('headmaster')}
                      className="px-2 py-1 bg-white text-indigo-700 text-[10px] font-bold rounded shadow-xs hover:bg-slate-100 cursor-pointer flex items-center gap-1"
                      title="Ganti Tanda Tangan"
                    >
                      <PenTool className="w-3 h-3" />
                      <span>Ubah TTD</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSignature('headmaster', e)}
                      className="p-1 bg-rose-600 text-white rounded shadow-xs hover:bg-rose-700 cursor-pointer"
                      title="Hapus Tanda Tangan"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              interactive && (
                <button
                  type="button"
                  onClick={() => setActiveModal('headmaster')}
                  className="no-print px-3 py-1.5 border border-dashed border-indigo-400/80 bg-indigo-50/50 hover:bg-indigo-100/70 text-indigo-800 text-[11px] font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer hover:border-indigo-600"
                  title="Bubuhkan tanda tangan touchscreen atau mouse"
                >
                  <PenTool className="w-3.5 h-3.5 text-indigo-600" />
                  <span>+ Tanda Tangan Touch / Mouse</span>
                </button>
              )
            )}
          </div>

          <p className="font-bold underline">{displayHeadmasterName}</p>
          <p className="text-[11px] sm:text-xs">NIP. {cleanHeadmasterNip}</p>
        </div>

        {/* Kolom Kanan: Guru Mata Pelajaran */}
        <div className="space-y-1 flex flex-col items-center">
          <p className="font-normal">{location}, {displayDate}</p>
          <p className="font-bold">Guru Mata Pelajaran</p>

          {/* Touchscreen / Mouse Signature Container */}
          <div className="h-20 sm:h-24 w-full flex items-center justify-center relative my-1 group">
            {teacherSig ? (
              <div className="relative flex items-center justify-center h-full w-full">
                <img
                  src={teacherSig}
                  alt="Tanda Tangan Guru Mata Pelajaran"
                  className="max-h-20 sm:max-h-24 max-w-[190px] object-contain pointer-events-none"
                />
                {interactive && (
                  <div className="no-print absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1.5 backdrop-blur-[1px]">
                    <button
                      type="button"
                      onClick={() => setActiveModal('teacher')}
                      className="px-2 py-1 bg-white text-indigo-700 text-[10px] font-bold rounded shadow-xs hover:bg-slate-100 cursor-pointer flex items-center gap-1"
                      title="Ganti Tanda Tangan"
                    >
                      <PenTool className="w-3 h-3" />
                      <span>Ubah TTD</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSignature('teacher', e)}
                      className="p-1 bg-rose-600 text-white rounded shadow-xs hover:bg-rose-700 cursor-pointer"
                      title="Hapus Tanda Tangan"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              interactive && (
                <button
                  type="button"
                  onClick={() => setActiveModal('teacher')}
                  className="no-print px-3 py-1.5 border border-dashed border-indigo-400/80 bg-indigo-50/50 hover:bg-indigo-100/70 text-indigo-800 text-[11px] font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer hover:border-indigo-600"
                  title="Bubuhkan tanda tangan touchscreen atau mouse"
                >
                  <PenTool className="w-3.5 h-3.5 text-indigo-600" />
                  <span>+ Tanda Tangan Touch / Mouse</span>
                </button>
              )
            )}
          </div>

          <p className="font-bold underline">{displayTeacherName}</p>
          <p className="text-[11px] sm:text-xs">NIP. {cleanTeacherNip}</p>
        </div>
      </div>

      {/* Interactive Signature Pad Modal */}
      {activeModal && (
        <SignaturePadModal
          isOpen={!!activeModal}
          onClose={() => setActiveModal(null)}
          onSave={(dataUrl) => handleSaveSignature(activeModal, dataUrl)}
          title={
            activeModal === 'headmaster'
              ? 'Tanda Tangan Digital Kepala Sekolah'
              : 'Tanda Tangan Digital Guru Mata Pelajaran'
          }
          signerRole={activeModal === 'headmaster' ? 'kepala_sekolah' : 'guru'}
          signerName={activeModal === 'headmaster' ? displayHeadmasterName : displayTeacherName}
          initialSignature={activeModal === 'headmaster' ? headmasterSig : teacherSig}
        />
      )}
    </div>
  );
};
