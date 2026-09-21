import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AppLink, User } from '../types';
import {
  getAllAppLinks,
  addAppLink,
  updateAppLink,
  deleteAppLink,
  exportAppLinksJSON,
  importAppLinksJSON,
  resetAppLinksToDefault,
  getCurrentUser
} from '../utils/storage';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  Download,
  Upload,
  RotateCcw,
  ExternalLink,
  Globe,
  Search,
  ShieldCheck,
  BookOpen,
  GraduationCap,
  HardDrive,
  School,
  Palette,
  Video,
  MessageCircle,
  FileSpreadsheet,
  Layers,
  Maximize2,
  Minimize2,
  RefreshCw,
  Lock,
  Check,
  X,
  Menu,
  ChevronLeft,
  ChevronRight,
  Info,
  Layers3,
  Settings,
  Share2,
  Copy,
  LayoutDashboard,
  FileText,
  ClipboardList,
  FileCheck
} from 'lucide-react';

interface Dashboard3DLauncherProps {
  children: React.ReactNode;
  currentUser?: User | null;
  activeInternalRoute?: string;
  onSelectInternalRoute?: (route: string) => void;
  isExamActive?: boolean;
}

// Icon helper map
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  GraduationCap,
  FileSpreadsheet,
  BookOpen,
  HardDrive,
  School,
  Palette,
  Video,
  MessageCircle,
  Globe,
  ShieldCheck,
  Layers,
  LayoutDashboard,
  FileText,
  ClipboardList,
  FileCheck
};

// Color theme helper (Soft Light Pastel Palette)
const COLOR_STYLES: Record<
  string,
  {
    bg: string;
    border: string;
    text: string;
    shadow3d: string;
    activeBorder: string;
    activeGlow: string;
    badgeBg: string;
  }
> = {
  indigo: {
    bg: 'from-indigo-50/90 via-indigo-100/70 to-white',
    border: 'border-indigo-200/90',
    text: 'text-indigo-900',
    shadow3d: 'shadow-[0_4px_0_0_#c7d2fe] hover:shadow-[0_6px_0_0_#818cf8]',
    activeBorder: 'border-indigo-500 ring-2 ring-indigo-400/40',
    activeGlow: 'bg-indigo-500 shadow-indigo-500/30',
    badgeBg: 'bg-indigo-100/90 text-indigo-800 border-indigo-300/80'
  },
  emerald: {
    bg: 'from-emerald-50/90 via-emerald-100/70 to-white',
    border: 'border-emerald-200/90',
    text: 'text-emerald-900',
    shadow3d: 'shadow-[0_4px_0_0_#a7f3d0] hover:shadow-[0_6px_0_0_#34d399]',
    activeBorder: 'border-emerald-500 ring-2 ring-emerald-400/40',
    activeGlow: 'bg-emerald-500 shadow-emerald-500/30',
    badgeBg: 'bg-emerald-100/90 text-emerald-800 border-emerald-300/80'
  },
  amber: {
    bg: 'from-amber-50/90 via-amber-100/70 to-white',
    border: 'border-amber-200/90',
    text: 'text-amber-900',
    shadow3d: 'shadow-[0_4px_0_0_#fde68a] hover:shadow-[0_6px_0_0_#fbbf24]',
    activeBorder: 'border-amber-500 ring-2 ring-amber-400/40',
    activeGlow: 'bg-amber-500 shadow-amber-500/30',
    badgeBg: 'bg-amber-100/90 text-amber-800 border-amber-300/80'
  },
  blue: {
    bg: 'from-sky-50/90 via-sky-100/70 to-white',
    border: 'border-sky-200/90',
    text: 'text-sky-900',
    shadow3d: 'shadow-[0_4px_0_0_#bae6fd] hover:shadow-[0_6px_0_0_#38bdf8]',
    activeBorder: 'border-sky-500 ring-2 ring-sky-400/40',
    activeGlow: 'bg-sky-500 shadow-sky-500/30',
    badgeBg: 'bg-sky-100/90 text-sky-800 border-sky-300/80'
  },
  rose: {
    bg: 'from-rose-50/90 via-rose-100/70 to-white',
    border: 'border-rose-200/90',
    text: 'text-rose-900',
    shadow3d: 'shadow-[0_4px_0_0_#fecdd3] hover:shadow-[0_6px_0_0_#fb7185]',
    activeBorder: 'border-rose-500 ring-2 ring-rose-400/40',
    activeGlow: 'bg-rose-500 shadow-rose-500/30',
    badgeBg: 'bg-rose-100/90 text-rose-800 border-rose-300/80'
  },
  purple: {
    bg: 'from-purple-50/90 via-purple-100/70 to-white',
    border: 'border-purple-200/90',
    text: 'text-purple-900',
    shadow3d: 'shadow-[0_4px_0_0_#e9d5ff] hover:shadow-[0_6px_0_0_#c084fc]',
    activeBorder: 'border-purple-500 ring-2 ring-purple-400/40',
    activeGlow: 'bg-purple-500 shadow-purple-500/30',
    badgeBg: 'bg-purple-100/90 text-purple-800 border-purple-300/80'
  },
  teal: {
    bg: 'from-teal-50/90 via-teal-100/70 to-white',
    border: 'border-teal-200/90',
    text: 'text-teal-900',
    shadow3d: 'shadow-[0_4px_0_0_#99f6e4] hover:shadow-[0_6px_0_0_#2dd4bf]',
    activeBorder: 'border-teal-500 ring-2 ring-teal-400/40',
    activeGlow: 'bg-teal-500 shadow-teal-500/30',
    badgeBg: 'bg-teal-100/90 text-teal-800 border-teal-300/80'
  },
  cyan: {
    bg: 'from-cyan-50/90 via-cyan-100/70 to-white',
    border: 'border-cyan-200/90',
    text: 'text-cyan-900',
    shadow3d: 'shadow-[0_4px_0_0_#a5f3fc] hover:shadow-[0_6px_0_0_#22d3ee]',
    activeBorder: 'border-cyan-500 ring-2 ring-cyan-400/40',
    activeGlow: 'bg-cyan-500 shadow-cyan-500/30',
    badgeBg: 'bg-cyan-100/90 text-cyan-800 border-cyan-300/80'
  }
};

export const Dashboard3DLauncher: React.FC<Dashboard3DLauncherProps> = ({
  children,
  currentUser,
  activeInternalRoute,
  onSelectInternalRoute,
  isExamActive
}) => {
  const [links, setLinks] = useState<AppLink[]>(() => getAllAppLinks());
  const [activeLinkId, setActiveLinkId] = useState<string>('link_portal_utama');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isIframeFullscreen, setIsIframeFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<AppLink | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Form State for Add / Edit
  const [formTitle, setFormTitle] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formCategory, setFormCategory] = useState('Pembelajaran');
  const [formIcon, setFormIcon] = useState('Globe');
  const [formColor, setFormColor] = useState<keyof typeof COLOR_STYLES>('indigo');
  const [formDescription, setFormDescription] = useState('');
  const [formBadge, setFormBadge] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Effective current user & role
  const effectiveUser = currentUser !== undefined ? currentUser : getCurrentUser();
  const userRole = effectiveUser?.role; // 'guru' | 'siswa' | 'admin' | undefined

  // Refresh links list when storage updates
  useEffect(() => {
    const handleUpdate = () => {
      setLinks(getAllAppLinks());
    };
    window.addEventListener('cbt_app_links_update', handleUpdate);
    return () => {
      window.removeEventListener('cbt_app_links_update', handleUpdate);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Base role-filtered links:
  // - Guru: Hanya Menu Guru ("Fitur Guru") dan Menu Utama ("Aplikasi Utama")
  // - Siswa: Hanya Menu Siswa ("Fitur Siswa")
  // - Administrator: Tampilkan SEMUA
  const roleAllowedLinks = useMemo(() => {
    if (!userRole) {
      return links.filter(l => l.category === 'Aplikasi Utama' || l.category === 'Fitur Siswa');
    }
    if (userRole === 'guru') {
      return links.filter(l => l.category === 'Fitur Guru' || l.category === 'Aplikasi Utama');
    }
    if (userRole === 'siswa') {
      return links.filter(l => l.category === 'Fitur Siswa');
    }
    // admin sees all
    return links;
  }, [links, userRole]);

  // Derived available categories for the role
  const categories = useMemo(() => {
    const rawCategories = Array.from(new Set(roleAllowedLinks.map(l => l.category || 'Umum')));
    if (userRole === 'siswa') {
      return rawCategories.length > 1 ? ['Semua', ...rawCategories] : rawCategories;
    }
    return ['Semua', ...rawCategories];
  }, [roleAllowedLinks, userRole]);

  // Ensure selectedCategory is valid
  useEffect(() => {
    if (categories.length > 0 && !categories.includes(selectedCategory)) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  const activeLink = roleAllowedLinks.find(l => l.id === activeLinkId) || roleAllowedLinks[0] || {
    id: 'link_portal_utama',
    title: 'Portal Ujian SPANJU (Utama)',
    url: 'internal:portal',
    category: 'Aplikasi Utama',
    iconName: 'GraduationCap',
    color: 'indigo',
    description: 'Sistem Utama CBT SPANJU',
    isInternal: true
  };

  // Filter links based on role, category, and search query
  const filteredLinks = useMemo(() => {
    return roleAllowedLinks.filter(link => {
      const matchesCategory = selectedCategory === 'Semua' || link.category === selectedCategory;
      const matchesSearch =
        link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.url.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [roleAllowedLinks, selectedCategory, searchQuery]);

  const handleSelectLink = (link: AppLink) => {
    setActiveLinkId(link.id);
    setIsSidebarOpen(false);
    if (link.isInternal || link.url.startsWith('internal:')) {
      if (onSelectInternalRoute) {
        onSelectInternalRoute(link.url);
      }
    }
  };

  const handleOpenAddModal = () => {
    setEditingLink(null);
    setFormTitle('');
    setFormUrl('https://');
    setFormCategory('Pembelajaran');
    setFormIcon('Globe');
    setFormColor('indigo');
    setFormDescription('');
    setFormBadge('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (link: AppLink, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingLink(link);
    setFormTitle(link.title);
    setFormUrl(link.url);
    setFormCategory(link.category || 'Umum');
    setFormIcon(link.iconName || 'Globe');
    setFormColor((link.color as any) || 'indigo');
    setFormDescription(link.description || '');
    setFormBadge(link.badge || '');
    setIsAddModalOpen(true);
  };

  const handleDeleteLinkItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (links.length <= 1) {
      showToast('⚠️ Anda tidak dapat menghapus link terakhir.');
      return;
    }
    if (confirm('Apakah Anda yakin ingin menghapus aplikasi/link ini?')) {
      deleteAppLink(id);
      showToast('🗑️ Link aplikasi berhasil dihapus.');
      if (activeLinkId === id) {
        const remaining = links.filter(l => l.id !== id);
        if (remaining.length > 0) setActiveLinkId(remaining[0].id);
      }
    }
  };

  const handleSaveLinkForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formUrl.trim()) {
      alert('Mohon isi Judul dan URL Aplikasi.');
      return;
    }

    const isInternal = formUrl.startsWith('internal:');

    if (editingLink) {
      updateAppLink({
        ...editingLink,
        title: formTitle,
        url: formUrl,
        category: formCategory,
        iconName: formIcon,
        color: formColor as AppLink['color'],
        description: formDescription,
        isInternal,
        badge: formBadge || undefined
      });
      showToast('✅ Berhasil memperbarui link aplikasi!');
    } else {
      const newCreated = addAppLink({
        title: formTitle,
        url: formUrl,
        category: formCategory,
        iconName: formIcon,
        color: formColor as AppLink['color'],
        description: formDescription,
        isInternal,
        badge: formBadge || undefined
      });
      setActiveLinkId(newCreated.id);
      showToast('✨ Aplikasi baru berhasil ditambahkan!');
    }

    setIsAddModalOpen(false);
  };

  const handleExportBackup = () => {
    exportAppLinksJSON();
    showToast('📥 File backup JSON berhasil diunduh.');
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const imported = importAppLinksJSON(content);
        setLinks(imported);
        if (imported.length > 0) setActiveLinkId(imported[0].id);
        showToast(`🎉 Berhasil memuat ${imported.length} link dari file backup!`);
      } catch (err: any) {
        alert(err.message || 'Gagal membaca file JSON backup.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetDefault = () => {
    if (confirm('Kembalikan semua daftar link aplikasi ke versi standar awal?')) {
      const defs = resetAppLinksToDefault();
      setLinks(defs);
      setActiveLinkId(defs[0].id);
      showToast('🔄 Berhasil reset link ke standar awal.');
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(activeLink.url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // If exam is active, bypass launcher completely to give student full-screen distraction-free worksheet
  if (isExamActive) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800 flex flex-col font-sans overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Hidden File Input for Backup Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportFileChange}
        accept=".json,application/json"
        className="hidden"
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="flex items-center gap-2.5 px-4 py-3 bg-white text-slate-800 border border-slate-200 rounded-2xl shadow-xl backdrop-blur-xl text-xs font-bold">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main 3D Dual-Panel Layout */}
      <div className="flex-1 flex flex-col lg:flex-row h-screen overflow-hidden relative">
        
        {/* Ambient Glowing Soft Backdrop */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200/30 rounded-full blur-[120px] pointer-events-none no-print"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-200/30 rounded-full blur-[120px] pointer-events-none no-print"></div>

        {/* LEFT SIDEBAR: 3D APP LAUNCHER PANEL */}
        <aside
          className={`${
            isSidebarOpen ? 'w-full lg:w-96 xl:w-[410px]' : 'w-0 max-w-0 border-r-0 p-0 overflow-hidden'
          } shrink-0 bg-white/95 backdrop-blur-2xl border-r border-slate-200/90 flex flex-col transition-all duration-300 z-30 relative shadow-xl overflow-hidden no-print`}
        >
          {/* Header Dashboard Title & Controls */}
          <div className="p-4 border-b border-slate-200/90 bg-slate-50/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-cyan-500 p-0.5 shadow-md shadow-indigo-500/20 flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                  <Layers3 className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
              {isSidebarOpen && (
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-sm font-black tracking-tight text-slate-900 uppercase truncate">
                      {userRole === 'guru'
                        ? 'MENU GURU & UTAMA'
                        : userRole === 'siswa'
                        ? 'RUANG UJIAN SISWA'
                        : userRole === 'admin'
                        ? 'PANEL ADMINISTRATOR'
                        : 'DASHBOARD PORTAL'}
                    </h2>
                    <span
                      className={`px-1.5 py-0.5 text-[9px] font-black rounded-md border shrink-0 ${
                        userRole === 'guru'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : userRole === 'siswa'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : userRole === 'admin'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}
                    >
                      {userRole === 'guru' ? 'GURU' : userRole === 'siswa' ? 'SISWA' : userRole === 'admin' ? 'ADMIN' : '3D'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    {userRole === 'guru'
                      ? 'Kelola Soal, Paket & Rekap Nilai'
                      : userRole === 'siswa'
                      ? 'Daftar Ujian & Asesmen Terjadwal'
                      : userRole === 'admin'
                      ? 'Akses Penuh Semua Menu & Modul'
                      : 'Launcher & Navigasi SPANJU'}
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              title={isSidebarOpen ? 'Kecilkan Sidebar' : 'Buka Sidebar'}
              className="p-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-xl border border-slate-200 transition-all cursor-pointer shrink-0"
            >
              {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {isSidebarOpen && (
            <>
              {/* Search & Backup Action Toolbar */}
              <div className="p-3.5 space-y-3 border-b border-slate-200/90 bg-slate-50/50">
                {/* Search Box */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari nama aplikasi atau link..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Category Pills (Horizontal Scroll) */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                        selectedCategory === cat
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Top Action Bar: If Siswa, show student banner; If Guru or Admin, show Add, Backup, Upload */}
                {userRole === 'siswa' ? (
                  <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50/80 border border-indigo-200/80 rounded-xl text-xs text-indigo-900 font-bold">
                    <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="truncate">Menu Akses Ujian Khusus Siswa</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={handleOpenAddModal}
                      title="Tambah Link Aplikasi Baru"
                      className="py-2 px-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:from-indigo-800 active:to-indigo-900 text-white font-extrabold text-[11px] rounded-xl flex items-center justify-center gap-1 shadow-md shadow-indigo-600/20 border-b-2 border-indigo-900 transition-all cursor-pointer col-span-2 active:translate-y-0.5"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>+ Tambah Link</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportBackup}
                      title="Download Backup JSON"
                      className="py-2 px-2 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 border border-slate-200 transition-all cursor-pointer active:translate-y-0.5 shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Backup</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      title="Upload Restore JSON"
                      className="py-2 px-2 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 border border-slate-200 transition-all cursor-pointer active:translate-y-0.5 shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Upload</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Scrollable List of 3D Buttons */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 scrollbar-thin">
                {filteredLinks.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <Search className="w-8 h-8 mx-auto opacity-40 text-slate-400" />
                    <p className="text-xs font-semibold">Tidak ada aplikasi yang cocok.</p>
                  </div>
                ) : (
                  filteredLinks.map((link) => {
                    const isSelected = link.id === activeLinkId;
                    const IconComp = ICON_MAP[link.iconName || 'Globe'] || Globe;
                    const style = COLOR_STYLES[link.color || 'indigo'] || COLOR_STYLES.indigo;

                    return (
                      <div
                        key={link.id}
                        onClick={() => handleSelectLink(link)}
                        className={`group relative rounded-2xl p-3.5 transition-all duration-200 cursor-pointer border backdrop-blur-md bg-gradient-to-r ${style.bg} ${
                          isSelected
                            ? `${style.activeBorder} ${style.shadow3d} translate-y-0 scale-[1.01]`
                            : 'border-slate-200 hover:border-slate-300 shadow-[0_2px_0_0_#e2e8f0] hover:shadow-[0_4px_0_0_#cbd5e1] hover:-translate-y-0.5 opacity-95 hover:opacity-100'
                        } active:translate-y-1 active:shadow-none`}
                      >
                        {/* 3D Glossy Light Refraction Effect */}
                        <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/40 rounded-t-2xl pointer-events-none"></div>

                        <div className="relative z-10 flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            {/* 3D Icon Badge Container */}
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs border border-slate-200/80 bg-white ${
                                isSelected ? 'ring-2 ring-indigo-400/30' : ''
                              }`}
                            >
                              <IconComp className={`w-5 h-5 ${style.text}`} />
                            </div>

                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h3 className="text-xs font-black text-slate-900 tracking-tight leading-snug truncate">
                                  {link.title}
                                </h3>
                                {link.badge && (
                                  <span
                                    className={`px-1.5 py-0.2 text-[9px] font-black rounded-md border ${style.badgeBg} uppercase shrink-0`}
                                  >
                                    {link.badge}
                                  </span>
                                )}
                              </div>

                              <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5 font-medium">
                                {link.description || link.url}
                              </p>

                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200/90 flex items-center gap-1 shadow-2xs">
                                  {link.isInternal ? (
                                    <>
                                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                                      Internal SPANJU
                                    </>
                                  ) : (
                                    <>
                                      <Globe className="w-3 h-3 text-cyan-600" />
                                      {new URL(link.url.startsWith('http') ? link.url : `https://${link.url}`).hostname.replace('www.', '')}
                                    </>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons: Edit & Delete (Hidden for student) */}
                          {userRole !== 'siswa' && (
                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
                              <button
                                type="button"
                                onClick={(e) => handleOpenEditModal(link, e)}
                                title="Edit Link Aplikasi"
                                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteLinkItem(link.id, e)}
                                title="Hapus Link Aplikasi"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Active Glowing Indicator */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/50 animate-ping"></span>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/50"></span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Sidebar Footer Info */}
              <div className="p-3 border-t border-slate-200/90 bg-slate-50/80 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                {userRole === 'admin' ? (
                  <button
                    type="button"
                    onClick={handleResetDefault}
                    className="flex items-center gap-1 text-slate-500 hover:text-amber-700 transition-colors cursor-pointer font-bold"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Standar</span>
                  </button>
                ) : (
                  <span className="font-semibold text-slate-400 text-[10px]">
                    {userRole === 'guru' ? 'Mode Guru' : userRole === 'siswa' ? 'Mode Siswa' : 'Portal CBT'}
                  </span>
                )}
                <span className="font-semibold">{filteredLinks.length} Menu Aktif</span>
              </div>
            </>
          )}
        </aside>

        {/* RIGHT MAIN VIEWPORT: APPLICATION FRAME */}
        <main className="flex-1 flex flex-col bg-slate-50 overflow-hidden relative">
          
          {/* Simulated Browser Top Navigation Bar */}
          <div className="h-13 bg-white border-b border-slate-200/90 px-3 sm:px-5 flex items-center justify-between gap-3 shadow-2xs shrink-0 z-20 no-print">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              
              {/* Toggle Sidebar Button */}
              <button
                type="button"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                title={isSidebarOpen ? 'Sembunyikan Menu Dashboard' : 'Buka Menu Dashboard'}
                className={`px-3 py-2 rounded-xl border cursor-pointer shrink-0 flex items-center gap-1.5 text-xs font-extrabold transition-all ${
                  !isSidebarOpen
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700 shadow-md shadow-indigo-600/20'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                <Menu className={`w-4 h-4 ${!isSidebarOpen ? 'text-white' : 'text-indigo-600'}`} />
                <span>{isSidebarOpen ? 'Sembunyikan Menu' : '☰ Menu Dashboard'}</span>
              </button>

              {/* Active App Badge */}
              <div className="flex items-center gap-2 min-w-0 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 flex-1 max-w-xl shadow-2xs">
                <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold text-slate-700 truncate font-mono">
                  {activeLink.url}
                </span>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  title="Salin URL Aplikasi"
                  className="p-1 text-slate-400 hover:text-slate-700 shrink-0 cursor-pointer ml-auto"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Viewport Control Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setIframeKey(prev => prev + 1)}
                title="Muat Ulang / Refresh Aplikasi"
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              {!activeLink.isInternal && !activeLink.url.startsWith('internal:') && (
                <a
                  href={activeLink.url.startsWith('http') ? activeLink.url : `https://${activeLink.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Buka di Tab Baru Browser"
                  className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl border border-indigo-200 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold px-3"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tab Baru</span>
                </a>
              )}

              <button
                type="button"
                onClick={() => setIsIframeFullscreen(!isIframeFullscreen)}
                title={isIframeFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                {isIframeFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Application Content Canvas Area */}
          <div className="flex-1 relative overflow-auto bg-slate-50">
            {activeLink.isInternal || activeLink.url.startsWith('internal:') ? (
              /* Internal CBT SPANJU Application Container */
              <div className="w-full h-full min-h-full bg-slate-50 text-slate-800 overflow-y-auto">
                {children}
              </div>
            ) : (
              /* External Web Link Embedded View / Frame Workspace */
              <div className="w-full h-full flex flex-col relative bg-slate-100">
                <iframe
                  key={iframeKey}
                  src={activeLink.url.startsWith('http') ? activeLink.url : `https://${activeLink.url}`}
                  title={activeLink.title}
                  className="w-full flex-1 border-none bg-white"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
                />

                {/* Info Bar for External Apps */}
                <div className="bg-white border-t border-slate-200 px-4 py-2 text-[11px] text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>
                      Membuka: <strong className="text-slate-900">{activeLink.title}</strong> ({activeLink.url})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>*Jika tampilan situs eksternal terhalang kebijakan keamanan, gunakan tombol:</span>
                    <a
                      href={activeLink.url.startsWith('http') ? activeLink.url : `https://${activeLink.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                    >
                      <span>Buka Langsung</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Floating open sidebar button when menu is hidden */}
      {!isSidebarOpen && (
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="fixed bottom-5 left-5 z-40 px-3.5 py-2.5 bg-indigo-600/95 hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-950/20 border border-indigo-400 font-extrabold text-xs flex items-center gap-2 cursor-pointer no-print transition-all hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-left duration-200"
          title="Klik untuk membuka kembali menu Dashboard"
        >
          <Menu className="w-4 h-4 text-white" />
          <span>Menu Dashboard</span>
        </button>
      )}

      {/* MODAL: ADD / EDIT LINK APLIKASI */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 text-slate-800 relative overflow-hidden">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {editingLink ? 'Edit Link Aplikasi' : 'Tambah Link Aplikasi Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Masukkan judul menu dan URL tautan web yang ingin disimpan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLinkForm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Judul Menu Aplikasi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: E-Rapor Digital, Google Classroom..."
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  URL / Tautan Website <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://..."
                  value={formUrl}
                  onChange={e => setFormUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  *Gunakan prefix <code>internal:portal</code> untuk membuka fitur internal CBT SPANJU.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Kategori Menu
                  </label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-indigo-500"
                  >
                    <option value="Aplikasi Utama">Aplikasi Utama</option>
                    <option value="Ujian & AKM">Ujian & AKM</option>
                    <option value="Akademik">Akademik</option>
                    <option value="Pembelajaran">Pembelajaran</option>
                    <option value="Administrasi">Administrasi</option>
                    <option value="Kreatif">Kreatif</option>
                    <option value="Media">Media</option>
                    <option value="Komunikasi">Komunikasi</option>
                    <option value="Kemendikbud">Kemendikbud</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Warna Tema 3D
                  </label>
                  <select
                    value={formColor}
                    onChange={e => setFormColor(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-indigo-500"
                  >
                    <option value="indigo">Soft Indigo Blue</option>
                    <option value="emerald">Soft Emerald Green</option>
                    <option value="amber">Soft Amber Gold</option>
                    <option value="blue">Soft Sky Blue</option>
                    <option value="rose">Soft Rose Red</option>
                    <option value="purple">Soft Purple Lavender</option>
                    <option value="teal">Soft Teal Mint</option>
                    <option value="cyan">Soft Cyan Aqua</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Ikon Aplikasi
                  </label>
                  <select
                    value={formIcon}
                    onChange={e => setFormIcon(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-indigo-500"
                  >
                    <option value="GraduationCap">Graduation Cap</option>
                    <option value="FileSpreadsheet">File Spreadsheet</option>
                    <option value="BookOpen">Book Open</option>
                    <option value="HardDrive">Hard Drive</option>
                    <option value="School">School / Classroom</option>
                    <option value="Palette">Palette / Design</option>
                    <option value="Video">Video / YouTube</option>
                    <option value="MessageCircle">Message Circle / Chat</option>
                    <option value="Globe">Globe / Web</option>
                    <option value="ShieldCheck">Shield / Security</option>
                    <option value="LayoutDashboard">Dashboard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Pita Badge Singkat (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: NEW, PMM, CBT"
                    value={formBadge}
                    onChange={e => setFormBadge(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Keterangan Singkat
                </label>
                <textarea
                  rows={2}
                  placeholder="Deskripsi singkat fungsi aplikasi ini..."
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Link Aplikasi</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};
