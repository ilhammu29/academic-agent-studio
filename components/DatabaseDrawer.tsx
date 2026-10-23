'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Folder, 
  Trash2, 
  Plus, 
  Building2, 
  CheckCircle2, 
  RefreshCw, 
  FileText, 
  Search, 
  Calendar,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { SavedProjectRecord, getSavedProjects, deleteProjectRecord } from '@/lib/supabase';

interface DatabaseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadProject: (project: SavedProjectRecord) => void;
  onSaveCurrentProject: () => Promise<void> | void;
}

export default function DatabaseDrawer({
  isOpen,
  onClose,
  onLoadProject,
  onSaveCurrentProject
}: DatabaseDrawerProps) {
  const [projects, setProjects] = useState<SavedProjectRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState<'all' | 'magang' | 'skripsi' | 'penelitian'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await getSavedProjects();
      setProjects(data);
    } catch (err) {
      console.warn('Gagal memuat arsip proyek:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Apakah Anda yakin ingin menghapus proyek ini dari arsip?')) {
      await deleteProjectRecord(id);
      await fetchProjects();
    }
  };

  const handleSaveCurrent = async () => {
    setIsSaving(true);
    try {
      await onSaveCurrentProject();
      setSaveSuccessMsg(true);
      await fetchProjects();
      setTimeout(() => setSaveSuccessMsg(false), 3000);
    } catch (err) {
      console.error('Gagal menyimpan proyek:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = projects.filter(p => {
    const matchCat = filterCategory === 'all' || p.category === filterCategory;
    const matchSearch = (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.targetEntity || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl h-full bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 flex flex-col shadow-2xl animate-in slide-in-from-right duration-250">
        
        {/* 1. Drawer Header */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center font-bold shadow-xs">
              <Folder className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                Arsip & Database Proyek
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Tersinkronisasi LocalStorage & Cloud Supabase
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Top Action Bar: Save Current Draft & Refresh */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-850 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between bg-white dark:bg-zinc-950">
          <button
            onClick={handleSaveCurrent}
            disabled={isSaving}
            className="py-2 px-4 rounded-lg bg-zinc-950 hover:bg-black text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : saveSuccessMsg ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            <span>
              {isSaving ? "Menyimpan ke Arsip..." : saveSuccessMsg ? "✓ Naskah Berhasil Disimpan!" : "Simpan Naskah Aktif ke Arsip"}
            </span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const jsonStr = JSON.stringify(projects, null, 2);
                const blob = new Blob([jsonStr], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `OXID_Academic_Projects_Backup_${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="py-2 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              title="Unduh seluruh database arsip dalam berkas JSON"
            >
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              <span>Cadangan (.json)</span>
            </button>

            <button
              onClick={fetchProjects}
              className="py-2 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              title="Muat ulang dari database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Segarkan</span>
            </button>
          </div>
        </div>

        {/* 3. Search & Filter Category Pills */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 space-y-3 bg-zinc-50/50 dark:bg-zinc-900/30">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan judul usulan atau nama instansi..."
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {[
              { id: 'all', label: 'Semua Kategori' },
              { id: 'magang', label: 'Magang Industri' },
              { id: 'skripsi', label: 'Skripsi / TA' },
              { id: 'penelitian', label: 'Tesis / Riset' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterCategory(tab.id as any)}
                className={`py-1 px-3 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  filterCategory === tab.id
                    ? 'bg-zinc-950 text-white dark:bg-zinc-100 dark:text-black font-semibold'
                    : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Projects List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="py-16 text-center text-zinc-400 text-xs flex flex-col items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-zinc-400" />
              <span>Memuat arsip proposal dari database...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-zinc-400 text-xs">
              <Folder className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2 opacity-50" />
              <p>Tidak ada proyek proposal yang cocok dengan kriteria pencarian.</p>
            </div>
          ) : (
            filtered.map((proj) => {
              const updatedAtFormatted = new Date(proj.updatedAt || proj.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              });

              return (
                <div
                  key={proj.id}
                  onClick={() => {
                    onLoadProject(proj);
                    onClose();
                  }}
                  className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 bg-white dark:bg-zinc-900 transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono">
                          {proj.category === 'magang' ? 'Magang' : proj.category === 'skripsi' ? 'Skripsi' : 'Riset'}
                        </span>
                        {proj.durationMonths && (
                          <span className="text-[10px] font-mono text-zinc-500">
                            • {proj.durationMonths} Bulan
                          </span>
                        )}
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 ml-auto flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          <span>{updatedAtFormatted}</span>
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white transition-colors line-clamp-2 leading-relaxed">
                        {proj.title}
                      </h4>

                      {proj.targetEntity && (
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5 flex items-center gap-1.5">
                          <Building2 className="w-3 h-3 text-zinc-400" />
                          <span className="truncate">{proj.targetEntity}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => handleDelete(proj.id, e)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                        title="Hapus dari arsip"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400">
                      Status: {proj.stage === 'result' ? 'Naskah Lengkap' : 'Draf Awal'}
                    </span>
                    <span className="text-zinc-800 dark:text-zinc-200 font-semibold group-hover:underline flex items-center gap-1">
                      <span>Buka Naskah</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
