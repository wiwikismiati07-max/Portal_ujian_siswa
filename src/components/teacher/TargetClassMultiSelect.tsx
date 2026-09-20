import React, { useState } from 'react';
import { Check, Plus, X, Layers, CheckCheck, RotateCcw } from 'lucide-react';

export const GRADE_7_CLASSES = ['7A', '7B', '7C', '7D', '7E', '7F', '7G', '7H'];
export const GRADE_8_CLASSES = ['8A', '8B', '8C', '8D', '8E', '8F', '8G', '8H'];
export const GRADE_9_CLASSES = ['9A', '9B', '9C', '9D', '9E', '9F', '9G', '9H'];

export const ALL_ROMPEL_CLASSES = [
  ...GRADE_7_CLASSES,
  ...GRADE_8_CLASSES,
  ...GRADE_9_CLASSES
];

interface TargetClassMultiSelectProps {
  selectedClasses: string[];
  onChange: (classes: string[]) => void;
  className?: string;
}

export const TargetClassMultiSelect: React.FC<TargetClassMultiSelectProps> = ({
  selectedClasses,
  onChange,
  className = ''
}) => {
  const [activeGradeTab, setActiveGradeTab] = useState<'all' | '7' | '8' | '9'>('all');
  const [customClassInput, setCustomClassInput] = useState('');

  const isSelected = (cls: string) => selectedClasses.includes(cls);

  const toggleClass = (cls: string) => {
    if (isSelected(cls)) {
      onChange(selectedClasses.filter(c => c !== cls));
    } else {
      onChange([...selectedClasses, cls]);
    }
  };

  const removeClass = (cls: string) => {
    onChange(selectedClasses.filter(c => c !== cls));
  };

  const selectGroup = (group: string[]) => {
    const allInGroupSelected = group.every(c => selectedClasses.includes(c));
    if (allInGroupSelected) {
      // Unselect all in this group
      onChange(selectedClasses.filter(c => !group.includes(c)));
    } else {
      // Select all in this group (merge unique)
      const combined = Array.from(new Set([...selectedClasses, ...group]));
      onChange(combined);
    }
  };

  const handleAddCustomClass = () => {
    const trimmed = customClassInput.trim().toUpperCase();
    if (!trimmed) return;
    if (!selectedClasses.includes(trimmed)) {
      onChange([...selectedClasses, trimmed]);
    }
    setCustomClassInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomClass();
    }
  };

  const handleSelectAllRombels = () => {
    const allSelected = ALL_ROMPEL_CLASSES.every(c => selectedClasses.includes(c));
    if (allSelected) {
      onChange([]);
    } else {
      onChange(Array.from(new Set([...selectedClasses, ...ALL_ROMPEL_CLASSES])));
    }
  };

  const handleSelectAllGeneralGrades = () => {
    const generalGrades = ['7', '8', '9'];
    const allSelected = generalGrades.every(c => selectedClasses.includes(c));
    if (allSelected) {
      onChange(selectedClasses.filter(c => !generalGrades.includes(c)));
    } else {
      onChange(Array.from(new Set([...selectedClasses, ...generalGrades])));
    }
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const isGradeAllSelected = (group: string[]) => group.every(c => selectedClasses.includes(c));

  return (
    <div className={`space-y-3.5 ${className}`}>
      
      {/* Quick Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
            Pilihan Cepat:
          </span>
          <button
            type="button"
            onClick={handleSelectAllGeneralGrades}
            className={`px-2.5 py-1 rounded-lg font-semibold text-xs transition-all cursor-pointer flex items-center gap-1 ${
              ['7', '8', '9'].every(c => selectedClasses.includes(c))
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
            title="Pilih tingkat umum: 7, 8, 9"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tingkat (7, 8, 9)</span>
          </button>

          <button
            type="button"
            onClick={handleSelectAllRombels}
            className={`px-2.5 py-1 rounded-lg font-semibold text-xs transition-all cursor-pointer flex items-center gap-1 ${
              ALL_ROMPEL_CLASSES.every(c => selectedClasses.includes(c))
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
            title="Pilih seluruh 24 rombel (7A-7H, 8A-8H, 9A-9H)"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Semua Rombel (7A-9H)</span>
          </button>
        </div>

        {selectedClasses.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="px-2 py-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Kosongkan ({selectedClasses.length})</span>
          </button>
        )}
      </div>

      {/* Grade Level Selector Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveGradeTab('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeGradeTab === 'all'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Semua Tingkat
        </button>
        <button
          type="button"
          onClick={() => setActiveGradeTab('7')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeGradeTab === '7'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Kelas 7 ({GRADE_7_CLASSES.filter(c => selectedClasses.includes(c)).length}/{GRADE_7_CLASSES.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveGradeTab('8')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeGradeTab === '8'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Kelas 8 ({GRADE_8_CLASSES.filter(c => selectedClasses.includes(c)).length}/{GRADE_8_CLASSES.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveGradeTab('9')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeGradeTab === '9'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Kelas 9 ({GRADE_9_CLASSES.filter(c => selectedClasses.includes(c)).length}/{GRADE_9_CLASSES.length})
        </button>
      </div>

      {/* Grade Sections & Chips Grid */}
      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        
        {/* TINGKAT 7 */}
        {(activeGradeTab === 'all' || activeGradeTab === '7') && (
          <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-800">
                  Tingkat 7
                </span>
                {/* General grade level toggle */}
                <button
                  type="button"
                  onClick={() => toggleClass('7')}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold border transition-colors cursor-pointer ${
                    isSelected('7')
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                  }`}
                  title="Pilih kode tingkat umum '7'"
                >
                  {isSelected('7') ? '✓ Tingkat 7' : '+ Tingkat 7'}
                </button>
              </div>
              
              <button
                type="button"
                onClick={() => selectGroup(GRADE_7_CLASSES)}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
              >
                {isGradeAllSelected(GRADE_7_CLASSES) ? 'Batal Semua (7A-7H)' : 'Pilih Semua (7A-7H)'}
              </button>
            </div>

            {/* Rombel 7A - 7H buttons */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
              {GRADE_7_CLASSES.map(cls => {
                const checked = isSelected(cls);
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => toggleClass(cls)}
                    className={`py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex flex-col items-center justify-center border ${
                      checked
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-400/30'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span>{cls}</span>
                    {checked && <Check className="w-3 h-3 mt-0.5 text-emerald-100" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TINGKAT 8 */}
        {(activeGradeTab === 'all' || activeGradeTab === '8') && (
          <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-800">
                  Tingkat 8
                </span>
                {/* General grade level toggle */}
                <button
                  type="button"
                  onClick={() => toggleClass('8')}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold border transition-colors cursor-pointer ${
                    isSelected('8')
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                  }`}
                  title="Pilih kode tingkat umum '8'"
                >
                  {isSelected('8') ? '✓ Tingkat 8' : '+ Tingkat 8'}
                </button>
              </div>
              
              <button
                type="button"
                onClick={() => selectGroup(GRADE_8_CLASSES)}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
              >
                {isGradeAllSelected(GRADE_8_CLASSES) ? 'Batal Semua (8A-8H)' : 'Pilih Semua (8A-8H)'}
              </button>
            </div>

            {/* Rombel 8A - 8H buttons */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
              {GRADE_8_CLASSES.map(cls => {
                const checked = isSelected(cls);
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => toggleClass(cls)}
                    className={`py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex flex-col items-center justify-center border ${
                      checked
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-400/30'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span>{cls}</span>
                    {checked && <Check className="w-3 h-3 mt-0.5 text-emerald-100" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TINGKAT 9 */}
        {(activeGradeTab === 'all' || activeGradeTab === '9') && (
          <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-800">
                  Tingkat 9
                </span>
                {/* General grade level toggle */}
                <button
                  type="button"
                  onClick={() => toggleClass('9')}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold border transition-colors cursor-pointer ${
                    isSelected('9')
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                  }`}
                  title="Pilih kode tingkat umum '9'"
                >
                  {isSelected('9') ? '✓ Tingkat 9' : '+ Tingkat 9'}
                </button>
              </div>
              
              <button
                type="button"
                onClick={() => selectGroup(GRADE_9_CLASSES)}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
              >
                {isGradeAllSelected(GRADE_9_CLASSES) ? 'Batal Semua (9A-9H)' : 'Pilih Semua (9A-9H)'}
              </button>
            </div>

            {/* Rombel 9A - 9H buttons */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
              {GRADE_9_CLASSES.map(cls => {
                const checked = isSelected(cls);
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => toggleClass(cls)}
                    className={`py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex flex-col items-center justify-center border ${
                      checked
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-400/30'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span>{cls}</span>
                    {checked && <Check className="w-3 h-3 mt-0.5 text-emerald-100" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Manual Custom Class Input */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="text"
          value={customClassInput}
          onChange={e => setCustomClassInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tambah kelas kustom (misal: 7I, 8-Unggulan, X-IPA-1)"
          className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        />
        <button
          type="button"
          onClick={handleAddCustomClass}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah</span>
        </button>
      </div>

      {/* Active Selected Classes Summary & Badge Tags */}
      <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-emerald-900">
            Kelas Terpilih ({selectedClasses.length} Target):
          </span>
          {selectedClasses.length === 0 && (
            <span className="text-[11px] text-amber-700 font-semibold">
              * Belum ada kelas yang dipilih (klik tombol rombel di atas)
            </span>
          )}
        </div>

        {selectedClasses.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {selectedClasses.map(cls => (
              <span
                key={cls}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white font-bold text-xs rounded-lg shadow-xs animate-in zoom-in-95 duration-100"
              >
                <span>{cls}</span>
                <button
                  type="button"
                  onClick={() => removeClass(cls)}
                  className="p-0.5 hover:bg-emerald-700 rounded-md transition-colors cursor-pointer text-emerald-100 hover:text-white"
                  title={`Hapus ${cls}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-slate-500 italic">
            Klik tombol rombel (7A-7H, 8A-8H, 9A-9H) atau tingkat (7,8,9) di atas untuk menentukan target peserta ujian.
          </p>
        )}
      </div>

    </div>
  );
};
