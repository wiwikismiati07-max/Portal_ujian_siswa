import React, { useState, useEffect, useMemo } from 'react';
import { User, UserRole, Subject } from '../../types';
import {
  getAllUsers,
  saveUsers,
  getAllSubjects,
  resetToInitialData,
  updateUserCredentials,
  deleteUser,
  overwriteUsersByRoleDirect,
  overwriteSubjectsDirect
} from '../../utils/storage';
import { ExcelManager } from '../teacher/ExcelManager';
import { SUPABASE_SETUP_SQL } from '../../utils/supabaseClient';
import {
  ShieldCheck,
  UserPlus,
  Edit2,
  Trash2,
  RotateCcw,
  KeyRound,
  Users,
  GraduationCap,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Search,
  ChevronLeft,
  ChevronRight,
  Database,
  Copy,
  Check,
  Filter
} from 'lucide-react';

interface AdminDashboardProps {
  admin: User;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ admin }) => {
  const [users, setUsers] = useState<User[]>(getAllUsers());
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showExcelImport, setShowExcelImport] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setUsers(getAllUsers());
    };
    window.addEventListener('cbt_storage_update', handleUpdate);
    return () => window.removeEventListener('cbt_storage_update', handleUpdate);
  }, []);

  // Form State
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('siswa');
  const [formNipNis, setFormNipNis] = useState('');
  const [formClassOrSubject, setFormClassOrSubject] = useState('7-A');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Available classes for filter
  const availableClasses = useMemo(() => {
    const classes = new Set<string>();
    users.forEach(u => {
      if (u.classGroup && u.role === 'siswa') {
        classes.add(u.classGroup);
      }
    });
    return Array.from(classes).sort();
  }, [users]);

  // Counts by role
  const adminCount = useMemo(() => users.filter(u => u.role === 'admin').length, [users]);
  const guruCount = useMemo(() => users.filter(u => u.role === 'guru').length, [users]);
  const siswaCount = useMemo(() => users.filter(u => u.role === 'siswa').length, [users]);

  // Filter and search
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const matchClass =
        selectedClass === 'all' || (u.role === 'siswa' && u.classGroup === selectedClass);
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.nipOrNis && u.nipOrNis.toLowerCase().includes(q)) ||
        (u.classGroup && u.classGroup.toLowerCase().includes(q)) ||
        (u.subjectName && u.subjectName.toLowerCase().includes(q));

      return matchRole && matchClass && matchSearch;
    });
  }, [users, roleFilter, selectedClass, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, selectedClass, searchQuery, pageSize]);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormName('');
    setFormUsername('');
    setFormPassword('123456');
    setFormRole('siswa');
    setFormNipNis('');
    setFormClassOrSubject('7-A');
    setIsAddUserOpen(true);
    setMsg(null);
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setFormName(u.name);
    setFormUsername(u.username);
    setFormPassword(u.password);
    setFormRole(u.role);
    setFormNipNis(u.nipOrNis || '');
    setFormClassOrSubject(u.classGroup || u.subjectName || '');
    setIsAddUserOpen(true);
    setMsg(null);
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === admin.id) {
      alert('Tidak dapat menghapus akun Anda sendiri.');
      return;
    }
    if (window.confirm('Hapus akun pengguna ini dari sistem dan database Supabase?')) {
      await deleteUser(userId);
      setUsers(getAllUsers());
    }
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUsername.trim() || !formName.trim()) return;

    if (editingUser) {
      const res = updateUserCredentials(
        editingUser.id,
        formUsername.trim(),
        formPassword.trim() || undefined,
        formName.trim()
      );

      if (!res.success) {
        setMsg({ type: 'error', text: res.message });
        return;
      }

      // Update role/class too
      const currentUsers = getAllUsers().map(u => {
        if (u.id === editingUser.id) {
          return {
            ...u,
            role: formRole,
            nipOrNis: formNipNis.trim(),
            classGroup: formRole === 'siswa' ? formClassOrSubject.trim() : undefined,
            subjectName: formRole === 'guru' ? formClassOrSubject.trim() : undefined
          };
        }
        return u;
      });
      saveUsers(currentUsers, true);
      setUsers(currentUsers);
      setIsAddUserOpen(false);
    } else {
      if (users.some(u => u.username.toLowerCase() === formUsername.trim().toLowerCase())) {
        setMsg({ type: 'error', text: 'Username tersebut sudah terdaftar.' });
        return;
      }

      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: formName.trim(),
        username: formUsername.trim(),
        password: formPassword.trim() || '123456',
        role: formRole,
        nipOrNis: formNipNis.trim(),
        classGroup: formRole === 'siswa' ? formClassOrSubject.trim() : undefined,
        subjectName: formRole === 'guru' ? formClassOrSubject.trim() : undefined
      };

      const updated = [...users, newUser];
      saveUsers(updated, true);
      setUsers(updated);
      setIsAddUserOpen(false);
    }
  };

  const handleResetAll = () => {
    if (
      window.confirm(
        'PERINGATAN: Apakah Anda yakin ingin mereset seluruh data sistem kembali ke data awal bawaan aplikasi?'
      )
    ) {
      resetToInitialData();
      setUsers(getAllUsers());
      alert('Data sistem telah berhasil direset ke pengaturan awal!');
      window.location.reload();
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-rose-950/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-block px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold text-rose-200 border border-white/15">
              Pusat Pengendali Administrator
            </span>
            <span className="inline-block px-3 py-1 bg-emerald-500/20 backdrop-blur-md rounded-full text-xs font-semibold text-emerald-300 border border-emerald-400/30">
              Supabase Cloud Terhubung
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Kelola Pengguna & Kredensial CBT
          </h1>
          <p className="text-rose-100/90 text-xs sm:text-sm mt-1 max-w-xl">
            Semua perubahan data pengguna, impor siswa Excel, dan konfigurasi ujian langsung tersimpan secara instan di database Supabase Cloud.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowSqlModal(true)}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-rose-100 border border-white/20 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Lihat & Salin Kode SQL Supabase"
          >
            <Database className="w-4 h-4 text-emerald-300" />
            <span>Skrip SQL Supabase</span>
          </button>
          <button
            type="button"
            onClick={() => setShowExcelImport(!showExcelImport)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
              showExcelImport
                ? 'bg-white text-rose-950 border-white shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-rose-100 border-white/20'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>{showExcelImport ? 'Tutup Impor Excel' : 'Impor Excel (.xlsx)'}</span>
          </button>
          <button
            type="button"
            onClick={handleResetAll}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-rose-100 border border-white/20 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Awal</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-3.5 py-2 bg-white text-rose-900 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Akun</span>
          </button>
        </div>
      </div>

      {/* Excel Importer Section */}
      {showExcelImport && (
        <div className="animate-in fade-in duration-200">
          <ExcelManager
            onImportStudents={async (newStudents, onProgress) => {
              const res = await overwriteUsersByRoleDirect('siswa', newStudents, onProgress);
              setUsers(getAllUsers());
              setRoleFilter('siswa');
              if (res.success) {
                alert(`Berhasil! ${newStudents.length} data siswa baru langsung tersimpan di Supabase Cloud & tabel sistem.`);
              } else {
                alert(`Perhatian: Data tersimpan secara lokal. Kendala Supabase: ${res.error}`);
              }
            }}
            onImportTeachers={async (newTeachers, onProgress) => {
              const res = await overwriteUsersByRoleDirect('guru', newTeachers, onProgress);
              setUsers(getAllUsers());
              setRoleFilter('guru');
              if (res.success) {
                alert(`Berhasil! ${newTeachers.length} data guru baru langsung tersimpan di Supabase Cloud.`);
              } else {
                alert(`Perhatian: Data tersimpan secara lokal. Kendala Supabase: ${res.error}`);
              }
            }}
            onImportSubjects={async (newSubjects, onProgress) => {
              const res = await overwriteSubjectsDirect(newSubjects, onProgress);
              if (res.success) {
                alert(`Berhasil! ${newSubjects.length} mata pelajaran baru langsung tersimpan di Supabase Cloud.`);
              }
            }}
          />
        </div>
      )}

      {/* Filter Tabs & Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Top Filter & Search Controls */}
        <div className="p-5 border-b border-slate-200 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Role Filter Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Peran:
              </span>
              <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setRoleFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    roleFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua ({users.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter('admin')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    roleFilter === 'admin'
                      ? 'bg-white text-rose-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Admin ({adminCount})
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter('guru')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    roleFilter === 'guru'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Guru ({guruCount})
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter('siswa')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    roleFilter === 'siswa'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Siswa ({siswaCount})
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-3">
              {roleFilter === 'siswa' && availableClasses.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={selectedClass}
                    onChange={e => setSelectedClass(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">Semua Kelas ({availableClasses.length})</option>
                    {availableClasses.map(cls => (
                      <option key={cls} value={cls}>
                        Kelas {cls}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama, NIS, username..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>
              Menampilkan <strong>{paginatedUsers.length}</strong> dari{' '}
              <strong>{filteredUsers.length}</strong> akun terdaftar
            </span>
            <div className="flex items-center gap-2">
              <span>Per halaman:</span>
              <select
                value={pageSize}
                onChange={e => setPageSize(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={500}>500</option>
                <option value={2000}>Semua</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Nama Lengkap</th>
                <th className="px-4 py-3">Peran Akun</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Password (Aktif)</th>
                <th className="px-4 py-3">NIS / NIP</th>
                <th className="px-4 py-3">Kelas / Mapel</th>
                <th className="px-4 py-3 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Users className="w-8 h-8 text-slate-300" />
                      <p className="font-semibold text-slate-600">Belum ada akun pada filter ini</p>
                      <p className="text-[11px] text-slate-400">
                        Klik "Impor Excel (.xlsx)" atau "Tambah Akun" untuk menambahkan data.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <span className="truncate max-w-[200px] sm:max-w-xs">{u.name}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : u.role === 'guru'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-semibold text-slate-700">
                      @{u.username}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-500">
                      <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {u.password}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{u.nipOrNis || '-'}</td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {u.classGroup || u.subjectName || '-'}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(u)}
                          title="Edit Username & Password"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {u.id !== admin.id && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u.id)}
                            title="Hapus Akun"
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div className="text-xs text-slate-500 font-medium">
              Halaman {currentPage} dari {totalPages}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Sebelumnya</span>
              </button>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SQL SCRIPT MODAL */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-600" />
                  Struktur SQL Database Supabase CBT
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Salin skrip SQL ini lalu jalankan di Supabase Dashboard &gt; SQL Editor untuk membuat semua tabel yang diperlukan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 text-sm font-bold"
              >
                Tutup
              </button>
            </div>

            <div className="my-4 flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-slate-500">PostgreSQL / Supabase DDL</span>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Tersalin ke Clipboard!' : 'Salin Semua SQL'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-slate-200 font-mono text-xs rounded-2xl overflow-y-auto flex-1 border border-slate-800 leading-relaxed select-all">
                {SUPABASE_SETUP_SQL}
              </pre>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT USER MODAL */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {editingUser ? 'Perbarui Akun & Kredensial' : 'Tambah Akun Pengguna Baru'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Atur username, kata sandi, dan hak akses pengguna. Data langsung tersimpan di Supabase Cloud.
            </p>

            {msg && (
              <div
                className={`p-3 rounded-xl text-xs mb-4 flex items-center gap-2 ${
                  msg.type === 'error'
                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-800'
                }`}
              >
                {msg.type === 'error' ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>{msg.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Peran Akun</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['admin', 'guru', 'siswa'] as UserRole[]).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setFormRole(r)}
                      className={`py-2 rounded-xl border text-center font-bold capitalize cursor-pointer transition-colors ${
                        formRole === r
                          ? 'bg-rose-900 text-white border-rose-900 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="Contoh: Muhammad Rizky Pratama"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Username (Login ID)</label>
                <input
                  type="text"
                  required
                  value={formUsername}
                  onChange={e => setFormUsername(e.target.value)}
                  placeholder="Contoh: rizky_siswa"
                  className="w-full px-3.5 py-2.5 font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kata Sandi (Password Aktif)
                </label>
                <input
                  type="text"
                  required
                  value={formPassword}
                  onChange={e => setFormPassword(e.target.value)}
                  placeholder="Password akun"
                  className="w-full px-3.5 py-2.5 font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {formRole === 'siswa' ? 'NIS' : 'NIP / NUPTK'}
                  </label>
                  <input
                    type="text"
                    value={formNipNis}
                    onChange={e => setFormNipNis(e.target.value)}
                    placeholder="Opsional"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {formRole === 'siswa' ? 'Kelas/Rombel' : 'Mata Pelajaran'}
                  </label>
                  <input
                    type="text"
                    value={formClassOrSubject}
                    onChange={e => setFormClassOrSubject(e.target.value)}
                    placeholder={formRole === 'siswa' ? 'Contoh: 7-A' : 'Contoh: IPA'}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-900 hover:bg-rose-800 text-white font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  {editingUser ? 'Simpan Perubahan' : 'Tambah Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
