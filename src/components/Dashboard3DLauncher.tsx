import React, { useState, useEffect, useRef } from 'react';
import { AppLink } from '../types';
import {
  getAllAppLinks,
  addAppLink,
  updateAppLink,
  deleteAppLink,
  exportAppLinksJSON,
  importAppLinksJSON,
  resetAppLinksToDefault
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
  LayoutDashboard
} from 'lucide-react';

interface Dashboard3DLauncherProps {
  children: React.ReactNode;
  activeInternalRoute?: string;
  onSelectInternalRoute?: (route: string) => void;
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
  LayoutDashboard
};

// Color theme helper
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
    bg: 'from-indigo-600 via-indigo-700 to-slate-900',
    border: 'border-indigo-500/50',
    text: 'text-indigo-300',
    shadow3d: 'shadow-[0_6px_0_0_#3730a3] hover:shadow-[0_8px_0_0_#3730a3]',
    activeBorder: 'border-indigo-400 ring-2 ring-indigo-400/50',
    activeGlow: 'bg-indigo-500 shadow-indigo-500/50',
    badgeBg: 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30'
  },
  emerald: {
    bg: 'from-emerald-600 via-emerald-700 to-slate-900',
    border: 'border-emerald-500/50',
    text: 'text-emerald-300',
    shadow3d: 'shadow-[0_6px_0_0_#065f46] hover:shadow-[0_8px_0_0_#065f46]',
    activeBorder: 'border-emerald-400 ring-2 ring-emerald-400/50',
    activeGlow: 'bg-emerald-500 shadow-emerald-500/50',
    badgeBg: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
  },
  amber: {
    bg: 'from-amber-600 via-amber-700 to-slate-900',
    border: 'border-amber-500/50',
    text: 'text-amber-300',
    shadow3d: 'shadow-[0_6px_0_0_#92400e] hover:shadow-[0_8px_0_0_#92400e]',
    activeBorder: 'border-amber-400 ring-2 ring-amber-400/50',
    activeGlow: 'bg-amber-500 shadow-amber-500/50',
    badgeBg: 'bg-amber-500/20 text-amber-200 border-amber-400/30'
  },
  blue: {
    bg: 'from-blue-600 via-blue-700 to-slate-900',
    border: 'border-blue-500/50',
    text: 'text-blue-300',
    shadow3d: 'shadow-[0_6px_0_0_#1e40af] hover:shadow-[0_8px_0_0_#1e40af]',
    activeBorder: 'border-blue-400 ring-2 ring-blue-400/50',
    activeGlow: 'bg-blue-500 shadow-blue-500/50',
    badgeBg: 'bg-blue-500/20 text-blue-200 border-blue-400/30'
  },
  rose: {
    bg: 'from-rose-600 via-rose-700 to-slate-900',
    border: 'border-rose-500/50',
    text: 'text-rose-300',
    shadow3d: 'shadow-[0_6px_0_0_#9f1239] hover:shadow-[0_8px_0_0_#9f1239]',
    activeBorder: 'border-rose-400 ring-2 ring-rose-400/50',
    activeGlow: 'bg-rose-500 shadow-rose-500/50',
    badgeBg: 'bg-rose-500/20 text-rose-200 border-rose-400/30'
  },
  purple: {
    bg: 'from-purple-600 via-purple-700 to-slate-900',
    border: 'border-purple-500/50',
    text: 'text-purple-300',
    shadow3d: 'shadow-[0_6px_0_0_#6b21a8] hover:shadow-[0_8px_0_0_#6b21a8]',
    activeBorder: 'border-purple-400 ring-2 ring-purple-400/50',
    activeGlow: 'bg-purple-500 shadow-purple-500/50',
    badgeBg: 'bg-purple-500/20 text-purple-200 border-purple-400/30'
  },
  teal: {
    bg: 'from-teal-600 via-teal-700 to-slate-900',
    border: 'border-teal-500/50',
    text: 'text-teal-300',
    shadow3d: 'shadow-[0_6px_0_0_#115e59] hover:shadow-[0_8px_0_0_#115e59]',
    activeBorder: 'border-teal-400 ring-2 ring-teal-400/50',
    activeGlow: 'bg-teal-500 shadow-teal-500/50',
    badgeBg: 'bg-teal-500/20 text-teal-200 border-teal-400/30'
  },
  cyan: {
    bg: 'from-cyan-600 via-cyan-700 to-slate-900',
    border: 'border-cyan-500/50',
    text: 'text-cyan-300',
    shadow3d: 'shadow-[0_6px_0_0_#155e75] hover:shadow-[0_8px_0_0_#155e75]',
    activeBorder: 'border-cyan-400 ring-2 ring-cyan-400/50',
    activeGlow: 'bg-cyan-500 shadow-cyan-500/50',
    badgeBg: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/30'
  }
};

export const Dashboard3DLauncher: React.FC<Dashboard3DLauncherProps> = ({
  children,
  activeInternalRoute,
  onSelectInternalRoute
}) => {
  const [links, setLinks] = useState<AppLink[]>(() => getAllAppLinks());
  const [activeLinkId, setActiveLinkId] = useState<string>('link_portal_utama');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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

  const activeLink = links.find(l => l.id === activeLinkId) || links[0] || {
    id: 'link_portal_utama',
    title: 'Portal Ujian SPANJU (Utama)',
    url: 'internal:portal',
    category: 'Aplikasi Utama',
    iconName: 'GraduationCap',
    color: 'indigo',
    description: 'Sistem Utama CBT SPANJU',
    isInternal: true
  };

  // Get categories list
  const categories = ['Semua', ...Array.from(new Set(links.map(l => l.category || 'Umum')))];

  // Filter links
  const filteredLinks = links.filter(link => {
    const matchesCategory = selectedCategory === 'Semua' || link.category === selectedCategory;
    const matchesSearch =
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.url.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-x-hidden selection:bg-indigo-500 selection:text-white">
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
          <div className="flex items-center gap-2.5 px-4 py-3 bg-indigo-900/90 text-white border border-indigo-500/50 rounded-2xl shadow-2xl backdrop-blur-xl text-xs font-bold">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main 3D Dual-Panel Layout */}
      <div className="flex-1 flex flex-col lg:flex-row h-screen overflow-hidden relative">
        
        {/* Ambient 3D Glowing Backdrop */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        {/* LEFT SIDEBAR: 3D APP LAUNCHER PANEL */}
        <aside
          className={`${
            isSidebarOpen ? 'w-full lg:w-96 xl:w-[410px]' : 'w-0 lg:w-16'
          } shrink-0 bg-slate-900/90 backdrop-blur-2xl border-r border-slate-800/80 flex flex-col transition-all duration-300 z-30 relative shadow-2xl overflow-hidden`}
        >
          {/* Header Dashboard Title & Controls */}
          <div className="p-4 border-b border-slate-800/80 bg-slate-900/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/30 flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Layers3 className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
              {isSidebarOpen && (
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-sm font-black tracking-tight text-white uppercase truncate">
                      DASHBOARD PORTAL
                    </h2>
                    <span className="px-1.5 py-0.5 text-[9px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-md shrink-0">
                      3D
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    Launcher & Management Link SPANJU
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              title={isSidebarOpen ? 'Kecilkan Sidebar' : 'Buka Sidebar'}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 active:bg-slate-900 text-slate-300 hover:text-white rounded-xl border border-slate-700/60 transition-all cursor-pointer shrink-0"
            >
              {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {isSidebarOpen && (
            <>
              {/* Search & Backup Action Toolbar */}
              <div className="p-3.5 space-y-3 border-b border-slate-800/80 bg-slate-950/40">
                {/* Search Box */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari nama aplikasi atau link..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-slate-900/90 border border-slate-700/70 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
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
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-700/50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Top Action Bar: Add Link, Backup, Upload, Reset */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={handleOpenAddModal}
                    title="Tambah Link Aplikasi Baru"
                    className="py-2 px-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:from-indigo-800 active:to-indigo-900 text-white font-extrabold text-[11px] rounded-xl flex items-center justify-center gap-1 shadow-lg shadow-indigo-600/25 border-b-2 border-indigo-900 transition-all cursor-pointer col-span-2 active:translate-y-0.5"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>+ Tambah Link</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportBackup}
                    title="Download Backup JSON"
                    className="py-2 px-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 border border-slate-700/80 transition-all cursor-pointer active:translate-y-0.5"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Backup</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload Restore JSON"
                    className="py-2 px-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 border border-slate-700/80 transition-all cursor-pointer active:translate-y-0.5"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Upload</span>
                  </button>
                </div>
              </div>

              {/* Scrollable List of 3D Buttons */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 scrollbar-thin">
                {filteredLinks.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 space-y-2">
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
                            : 'border-slate-800/80 hover:border-slate-700 shadow-[0_4px_0_0_#1e293b] hover:shadow-[0_6px_0_0_#334155] hover:-translate-y-0.5 opacity-90 hover:opacity-100'
                        } active:translate-y-1 active:shadow-none`}
                      >
                        {/* 3D Glossy Light Refraction Effect */}
                        <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/5 rounded-t-2xl pointer-events-none"></div>

                        <div className="relative z-10 flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            {/* 3D Icon Badge Container */}
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg border border-white/20 bg-slate-900/80 ${
                                isSelected ? 'ring-2 ring-white/30' : ''
                              }`}
                            >
                              <IconComp className={`w-5 h-5 ${style.text}`} />
                            </div>

                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h3 className="text-xs font-black text-white tracking-tight leading-snug truncate">
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

                              <p className="text-[11px] text-slate-300/80 line-clamp-1 mt-0.5 font-medium">
                                {link.description || link.url}
                              </p>

                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-950/60 px-2 py-0.5 rounded-md border border-slate-800/80 flex items-center gap-1">
                                  {link.isInternal ? (
                                    <>
                                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                                      Internal SPANJU
                                    </>
                                  ) : (
                                    <>
                                      <Globe className="w-3 h-3 text-cyan-400" />
                                      {new URL(link.url.startsWith('http') ? link.url : `https://${link.url}`).hostname.replace('www.', '')}
                                    </>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons: Edit & Delete */}
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
                            <button
                              type="button"
                              onClick={(e) => handleOpenEditModal(link, e)}
                              title="Edit Link Aplikasi"
                              className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteLinkItem(link.id, e)}
                              title="Hapus Link Aplikasi"
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Active Glowing LED Light Indicator */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-md shadow-emerald-400/80 animate-ping"></span>
                            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-md shadow-emerald-400/80"></span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Sidebar Footer Info */}
              <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <button
                  type="button"
                  onClick={handleResetDefault}
                  className="flex items-center gap-1 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Standar</span>
                </button>
                <span>{links.length} Aplikasi Tersimpan</span>
              </div>
            </>
          )}
        </aside>

        {/* RIGHT MAIN VIEWPORT: APPLICATION FRAME */}
        <main className="flex-1 flex flex-col bg-slate-900 overflow-hidden relative">
          
          {/* Simulated Browser Top Navigation Bar */}
          <div className="h-13 bg-slate-950 border-b border-slate-800/90 px-3 sm:px-5 flex items-center justify-between gap-3 shadow-md shrink-0 z-20">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              
              {/* Toggle Sidebar Button */}
              <button
                type="button"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                title={isSidebarOpen ? 'Sembunyikan Menu Sidebar' : 'Buka Menu Sidebar'}
                className="p-2 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-slate-300 hover:text-white rounded-xl border border-slate-800 cursor-pointer shrink-0 flex items-center gap-1.5 text-xs font-bold"
              >
                <Menu className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">{isSidebarOpen ? 'Sembunyikan Menu' : 'Menu Dashboard'}</span>
              </button>

              {/* Active App Badge */}
              <div className="flex items-center gap-2 min-w-0 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 flex-1 max-w-xl">
                <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-slate-200 truncate font-mono">
                  {activeLink.url}
                </span>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  title="Salin URL Aplikasi"
                  className="p-1 text-slate-400 hover:text-white shrink-0 cursor-pointer ml-auto"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Viewport Control Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setIframeKey(prev => prev + 1)}
                title="Muat Ulang / Refresh Aplikasi"
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              {!activeLink.isInternal && !activeLink.url.startsWith('internal:') && (
                <a
                  href={activeLink.url.startsWith('http') ? activeLink.url : `https://${activeLink.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Buka di Tab Baru Browser"
                  className="p-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 hover:text-white rounded-xl border border-indigo-500/30 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold px-3"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tab Baru</span>
                </a>
              )}

              <button
                type="button"
                onClick={() => setIsIframeFullscreen(!isIframeFullscreen)}
                title={isIframeFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition-colors cursor-pointer"
              >
                {isIframeFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Application Content Canvas Area */}
          <div className="flex-1 relative overflow-auto bg-slate-900">
            {activeLink.isInternal || activeLink.url.startsWith('internal:') ? (
              /* Internal CBT SPANJU Application Container */
              <div className="w-full h-full min-h-full bg-slate-50 text-slate-800 overflow-y-auto">
                {children}
              </div>
            ) : (
              /* External Web Link Embedded View / Frame Workspace */
              <div className="w-full h-full flex flex-col relative bg-slate-950">
                <iframe
                  key={iframeKey}
                  src={activeLink.url.startsWith('http') ? activeLink.url : `https://${activeLink.url}`}
                  title={activeLink.title}
                  className="w-full flex-1 border-none bg-white"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
                />

                {/* Info Bar for External Apps */}
                <div className="bg-slate-900/90 border-t border-slate-800 px-4 py-2 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>
                      Membuka: <strong className="text-white">{activeLink.title}</strong> ({activeLink.url})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>*Jika tampilan situs eksternal terhalang kebijakan keamanan, gunakan tombol:</span>
                    <a
                      href={activeLink.url.startsWith('http') ? activeLink.url : `https://${activeLink.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
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

      {/* MODAL: ADD / EDIT LINK APLIKASI */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 text-slate-100 relative overflow-hidden">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {editingLink ? 'Edit Link Aplikasi' : 'Tambah Link Aplikasi Baru'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Masukkan judul menu dan URL tautan web yang ingin disimpan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLinkForm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Judul Menu Aplikasi <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: E-Rapor Digital, Google Classroom..."
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  URL / Tautan Website <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://..."
                  value={formUrl}
                  onChange={e => setFormUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  *Gunakan prefix <code>internal:portal</code> untuk membuka fitur internal CBT SPANJU.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Kategori Menu
                  </label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
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
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Warna Tema 3D
                  </label>
                  <select
                    value={formColor}
                    onChange={e => setFormColor(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="indigo">Indigo Blue</option>
                    <option value="emerald">Emerald Green</option>
                    <option value="amber">Amber Gold</option>
                    <option value="blue">Royal Blue</option>
                    <option value="rose">Rose Red</option>
                    <option value="purple">Purple Velvet</option>
                    <option value="teal">Teal Cyan</option>
                    <option value="cyan">Cyan Aqua</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Ikon Aplikasi
                  </label>
                  <select
                    value={formIcon}
                    onChange={e => setFormIcon(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
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
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Pita Badge Singkat (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: NEW, PMM, CBT"
                    value={formBadge}
                    onChange={e => setFormBadge(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Keterangan Singkat
                </label>
                <textarea
                  rows={2}
                  placeholder="Deskripsi singkat fungsi aplikasi ini..."
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-1.5"
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
