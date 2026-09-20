import React, { useState, useEffect } from 'react';
import { User, UserRole, Subject } from '../../types';
import {
  getAllUsers,
  saveUsers,
  getAllSubjects,
  resetToInitialData,
  updateUserCredentials,
  overwriteUsersByRole,
  overwriteAllSubjects
} from '../../utils/storage';
import { ExcelManager } from '../teacher/ExcelManager';
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
  FileSpreadsheet
} from 'lucide-react';

interface AdminDashboardProps {
  admin: User;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ admin }) => {
  const [users, setUsers] = useState<User[]>(getAllUsers());
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showExcelImport, setShowExcelImport] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setUsers(getAllUsers());
    };
    window.addEventListener('cbt_storage_update', handleUpdate);
    return () => window.removeEventListener('cbt_storage_update', handleUpdate);
  }, []);

  // New/Edit User Form
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('siswa');
  const [formNipNis, setFormNipNis] = useState('');
  const [formClassOrSubject, setFormClassOrSubject] = useState('X-IPA-1');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const filteredUsers = users.filter(u => roleFilter === 'all' || u.role === roleFilter);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormName('');
    setFormUsername('');
    setFormPassword('123456');
    setFormRole('siswa');
    setFormNipNis('');
    setFormClassOrSubject('X-IPA-1');
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

  const handleDeleteUser = (userId: string) => {
    if (userId === admin.id) {
      alert('Tidak dapat menghapus akun Anda sendiri.');
      return;
    }
    if (window.confirm('Hapus akun pengguna ini dari sistem?')) {
      const updated = users.filter(u => u.id !== userId);
      saveUsers(updated);
      setUsers(updated);
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
      saveUsers(currentUsers);
      setUsers(currentUsers);
      setIsAddUserOpen(false);
    } else {
      // Check username exists
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
      saveUsers(updated);
      setUsers(updated);
      setIsAddUserOpen(false);
    }
  };

  const handleResetAll = () => {
    if (window.confirm('PERINGATAN: Apakah Anda yakin ingin mereset seluruh data sistem kembali ke data awal bawaan aplikasi?')) {
      resetToInitialData();
      setUsers(getAllUsers());
      alert('Data sistem telah berhasil direset ke pengaturan awal!');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-rose-950/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-block px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold text-rose-200 mb-3 border border-white/15">
            Pusat Pengendali Administrator
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Kelola Pengguna & Kredensial
          </h1>
          <p className="text-rose-100/90 text-xs sm:text-sm mt-1 max-w-xl">
            Administrator memiliki hak penuh untuk menambahkan akun baru, mengatur peran, mengganti username dan password siapa saja (Admin, Guru, Siswa), serta memelihara data.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowExcelImport(!showExcelImport)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
              showExcelImport
                ? 'bg-white text-rose-950 border-white shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-rose-100 border-white/20'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>{showExcelImport ? 'Tutup Impor Excel' : 'Impor Data Excel (Tindih Data)'}</span>
          </button>
          <button
            type="button"
            onClick={handleResetAll}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-rose-100 border border-white/20 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Database Awal</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-white text-rose-900 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Akun Baru</span>
          </button>
        </div>
      </div>

      {/* Excel Importer Section */}
      {showExcelImport && (
        <div className="animate-in fade-in duration-200">
          <ExcelManager
            onImportStudents={(newStudents) => {
              overwriteUsersByRole('siswa', newStudents);
              setUsers(getAllUsers());
              alert(`Berhasil! Seluruh data siswa lama telah ditindih dengan ${newStudents.length} data siswa baru dari Excel.`);
            }}
            onImportTeachers={(newTeachers) => {
              overwriteUsersByRole('guru', newTeachers);
              setUsers(getAllUsers());
              alert(`Berhasil! Seluruh data guru lama telah ditindih dengan ${newTeachers.length} data guru baru dari Excel.`);
            }}
            onImportSubjects={(newSubjects) => {
              overwriteAllSubjects(newSubjects);
              alert(`Berhasil! Seluruh data mata pelajaran lama telah ditindih dengan ${newSubjects.length} mata pelajaran baru dari Excel.`);
            }}
          />
        </div>
      )}

      {/* Filter Tabs & Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Table Top Controls */}
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Filter Peran:
            </span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setRoleFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  roleFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Semua ({users.length})
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('admin')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  roleFilter === 'admin' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('guru')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  roleFilter === 'guru' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Guru
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('siswa')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  roleFilter === 'siswa' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Siswa
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-400">
            Total {filteredUsers.length} akun terdaftar
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
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-slate-900 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                      {u.name.charAt(0)}
                    </div>
                    <span>{u.name}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                      u.role === 'admin'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : u.role === 'guru'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}>
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
                  <td className="px-4 py-3.5 text-slate-600">
                    {u.nipOrNis || '-'}
                  </td>
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
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* ADD / EDIT USER MODAL */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {editingUser ? 'Perbarui Akun & Kredensial' : 'Tambah Akun Pengguna Baru'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Atur username, kata sandi, dan hak akses pengguna.
            </p>

            {msg && (
              <div className={`p-3 rounded-xl text-xs mb-4 flex items-center gap-2 ${
                msg.type === 'error' ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-emerald-50 text-emerald-800'
              }`}>
                {msg.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{msg.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Peran (Role)</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none"
                >
                  <option value="siswa">Siswa</option>
                  <option value="guru">Guru</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Username Baru</label>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Password</label>
                  <input
                    type="text"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIS / NIP</label>
                  <input
                    type="text"
                    value={formNipNis}
                    onChange={(e) => setFormNipNis(e.target.value)}
                    placeholder="Contoh: 20241001"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {formRole === 'siswa' ? 'Kelas (e.g. X-IPA-1)' : 'Mata Pelajaran'}
                  </label>
                  <input
                    type="text"
                    value={formClassOrSubject}
                    onChange={(e) => setFormClassOrSubject(e.target.value)}
                    placeholder="Contoh: X-IPA-1"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
