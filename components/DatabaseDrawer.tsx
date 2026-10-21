'use client';

import React, { useState, useEffect } from 'react';
import { X, Database, FolderOpen, Trash2, Plus, Clock, Building2, CheckCircle2, RefreshCw, FileText } from 'lucide-react';
import { SavedProjectRecord, getSavedProjects, deleteProjectRecord } from '@/lib/supabase';

interface DatabaseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadProject: (project: SavedProjectRecord) => void;
  onSaveCurrentProject: () => void;
}

export default function DatabaseDrawer({
  isOpen,
  onClose,
  onLoadProject,
  onSaveCurrentProject
}: DatabaseDrawerProps) {
  const [projects, setProjects] = useState<SavedProjectRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<'all' | 'magang' | 'skripsi' | 'penelitian'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  const fetchProjects = async () => {
    setIsLoading(true);
    const data = await getSavedProjects();
    setProjects(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Apakah Anda yakin ingin menghapus proyek ini dari database?')) {
      await deleteProjectRecord(id);
      await fetchProjects();
    }
  };

  const handleSaveCurrent = () => {
    onSaveCurrentProject();
    setSaveSuccessMsg(true);
    fetchProjects();
    setTimeout(() => setSaveSuccessMsg(false), 2500);
  };

  const filtered = projects.filter(p => {
    const matchCat = filterCategory === 'all' || p.category === filterCategory;
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.targetEntity.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl h-full bg-[#0B0F17] border-l border-[#1D2738] flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-[#1A2333] flex items-center justify-between bg-[#080C14]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-milk-white">Database & Arsip Proposal</h3>
              <p className="text-[11px] text-milk-muted font-mono">Tersinkronisasi Cloud Supabase & Local Cache</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#141A26] hover:bg-[#1E2638] text-milk-muted hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="p-4 border-b border-[#1A2333] bg-[#0E131E] flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          <button
            onClick={handleSaveCurrent}
            className="py-2 px-3.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Simpan Naskah Aktif ke Database</span>
          </button>

          <button
            onClick={fetchProjects}
            className="py-2 px-3 rounded-lg bg-[#141A26] hover:bg-[#1E2638] text-milk-muted hover:text-milk-white border border-[#212C3F] text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            title="Refresh dari Cloud"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {saveSuccessMsg && (
          <div className="mx-4 mt-3 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Naskah proposal saat ini berhasil disimpan ke database!</span>
          </div>
        )}

        {/* Filter & Search */}
        <div className="px-5 pt-4 pb-2 space-y-2.5">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul proposal atau instansi mitra..."
            className="w-full bg-[#121824] border border-[#212C3F] rounded-lg px-3 py-2 text-xs text-white placeholder-milk-dim focus:outline-none focus:border-sky-500 transition-colors"
          />

          <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px]">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                filterCategory === 'all'
                  ? 'bg-sky-500 text-white font-medium'
                  : 'bg-[#141A26] text-milk-muted hover:text-milk-white'
              }`}
            >
              Semua ({projects.length})
            </button>
            <button
              onClick={() => setFilterCategory('magang')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                filterCategory === 'magang'
                  ? 'bg-sky-500 text-white font-medium'
                  : 'bg-[#141A26] text-milk-muted hover:text-milk-white'
              }`}
            >
              Magang Industri
            </button>
            <button
              onClick={() => setFilterCategory('skripsi')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                filterCategory === 'skripsi'
                  ? 'bg-sky-500 text-white font-medium'
                  : 'bg-[#141A26] text-milk-muted hover:text-milk-white'
              }`}
            >
              Skripsi
            </button>
            <button
              onClick={() => setFilterCategory('penelitian')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                filterCategory === 'penelitian'
                  ? 'bg-sky-500 text-white font-medium'
                  : 'bg-[#141A26] text-milk-muted hover:text-milk-white'
              }`}
            >
              Tesis & Hibah
            </button>
          </div>
        </div>

        {/* List of Proposals */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
          {isLoading ? (
            <div className="py-12 text-center text-milk-dim text-xs flex flex-col items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-sky-400" />
              <span>Memuat arsip dari database...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-milk-dim text-xs">
              Tidak ada proposal yang sesuai dengan filter.
            </div>
          ) : (
            filtered.map((item) => {
              const categoryBadge =
                item.category === 'magang'
                  ? { label: 'Magang Industri', bg: 'bg-emerald-950/50 text-emerald-300 border-emerald-800/40' }
                  : item.category === 'skripsi'
                  ? { label: 'Skripsi / TA', bg: 'bg-sky-950/50 text-sky-300 border-sky-800/40' }
                  : { label: 'Tesis / Riset', bg: 'bg-purple-950/50 text-purple-300 border-purple-800/40' };

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onLoadProject(item);
                    onClose();
                  }}
                  className="p-4 rounded-xl bg-[#121824] border border-[#202B3E] hover:border-sky-500/50 hover:bg-[#151D2C] transition-all cursor-pointer group flex flex-col justify-between gap-3 shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-semibold ${categoryBadge.bg}`}>
                        {categoryBadge.label}
                      </span>
                      <span className="text-[10px] font-mono text-milk-dim flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.updatedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-milk-white group-hover:text-sky-300 transition-colors line-clamp-2 leading-relaxed">
                      {item.title}
                    </h4>

                    {item.targetEntity && (
                      <p className="text-[11px] text-milk-muted mt-1.5 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-milk-dim" />
                        <span className="truncate">{item.targetEntity}</span>
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#1C2535] flex items-center justify-between">
                    <span className="text-[10px] text-sky-400 font-mono flex items-center gap-1 group-hover:underline">
                      <FolderOpen className="w-3 h-3" /> Buka Proyek Ini
                    </span>

                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-1.5 rounded text-milk-dim hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                      title="Hapus proposal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
