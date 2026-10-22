'use client';

import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  FileText, 
  Presentation, 
  Download, 
  Trash2, 
  Search, 
  Plus, 
  HardDrive, 
  Grid, 
  List, 
  Clock, 
  Building2, 
  ExternalLink,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  FileCode,
  Layers,
  RefreshCw
} from 'lucide-react';
import { SavedProjectRecord, getSavedProjects, deleteProjectRecord } from '@/lib/supabase';
import { generateAcademicProposalDocx, downloadDocxBlob } from '@/lib/docxExporter';
import { generateAcademicProposalPptx } from '@/lib/pptxExporter';

interface DriveFileManagerProps {
  onLoadProject: (project: SavedProjectRecord) => void;
  onNewProposal: () => void;
}

export default function DriveFileManager({
  onLoadProject,
  onNewProposal
}: DriveFileManagerProps) {
  const [projects, setProjects] = useState<SavedProjectRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFolder, setActiveFolder] = useState<'all' | 'word' | 'pptx' | 'md'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const fetchFiles = async () => {
    setIsLoading(true);
    const data = await getSavedProjects();
    setProjects(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Apakah Anda yakin ingin menghapus file ini dari Drive?')) {
      await deleteProjectRecord(id);
      await fetchFiles();
    }
  };

  const handleDownloadWord = async (p: SavedProjectRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!p.documentData) {
      alert('Naskah proposal belum dikompilasi.');
      return;
    }
    const blob = await generateAcademicProposalDocx(p.documentData);
    downloadDocxBlob(blob, `Proposal_${p.category.toUpperCase()}_${p.title.slice(0, 30).replace(/\s+/g, '_')}.docx`);
  };

  const handleDownloadSlide = async (p: SavedProjectRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!p.documentData) {
      alert('Slide presentasi belum dikompilasi.');
      return;
    }
    await generateAcademicProposalPptx(p.documentData);
  };

  const filtered = projects.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.targetEntity.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="w-full flex-1 flex flex-col md:flex-row bg-[#000000] text-white border border-[#27272A] rounded-2xl overflow-hidden shadow-2xl min-h-[640px]">
      {/* ============================================================ */}
      {/* DRIVE SIDEBAR (Google Drive Style) */}
      {/* ============================================================ */}
      <aside className="w-full md:w-64 bg-[#09090B] border-b md:border-b-0 md:border-r border-[#27272A] p-4 flex flex-col justify-between flex-shrink-0">
        <div>
          {/* New Button */}
          <button
            onClick={onNewProposal}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-gray-200 text-black font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mb-6"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Buat Usulan Baru</span>
          </button>

          {/* Drive Navigation Folders */}
          <div className="space-y-1">
            <button
              onClick={() => setActiveFolder('all')}
              className={`w-full p-2.5 rounded-xl flex items-center gap-3 text-xs font-medium transition-colors cursor-pointer ${
                activeFolder === 'all'
                  ? 'bg-[#18181B] text-white font-semibold'
                  : 'text-bw-muted hover:text-white hover:bg-[#121214]'
              }`}
            >
              <HardDrive className="w-4 h-4 text-white" />
              <span>Drive Proposal Saya</span>
            </button>

            <button
              onClick={() => setActiveFolder('word')}
              className={`w-full p-2.5 rounded-xl flex items-center gap-3 text-xs font-medium transition-colors cursor-pointer ${
                activeFolder === 'word'
                  ? 'bg-[#18181B] text-white font-semibold'
                  : 'text-bw-muted hover:text-white hover:bg-[#121214]'
              }`}
            >
              <FileText className="w-4 h-4 text-white" />
              <span>Dokumen Word (.docx)</span>
            </button>

            <button
              onClick={() => setActiveFolder('pptx')}
              className={`w-full p-2.5 rounded-xl flex items-center gap-3 text-xs font-medium transition-colors cursor-pointer ${
                activeFolder === 'pptx'
                  ? 'bg-[#18181B] text-white font-semibold'
                  : 'text-bw-muted hover:text-white hover:bg-[#121214]'
              }`}
            >
              <Presentation className="w-4 h-4 text-white" />
              <span>Slide Sidang (.pptx)</span>
            </button>

            <button
              onClick={() => setActiveFolder('md')}
              className={`w-full p-2.5 rounded-xl flex items-center gap-3 text-xs font-medium transition-colors cursor-pointer ${
                activeFolder === 'md'
                  ? 'bg-[#18181B] text-white font-semibold'
                  : 'text-bw-muted hover:text-white hover:bg-[#121214]'
              }`}
            >
              <FileCode className="w-4 h-4 text-white" />
              <span>Naskah Markdown & Graf</span>
            </button>
          </div>
        </div>

        {/* Cloud Storage Usage Indicator */}
        <div className="pt-6 border-t border-[#1C1C1F]">
          <div className="flex items-center justify-between text-[11px] text-bw-muted font-mono mb-2">
            <span>Penyimpanan Cloud</span>
            <span className="text-white">12.8 MB / 5 GB</span>
          </div>
          <div className="w-full h-1.5 bg-[#18181B] rounded-full overflow-hidden border border-[#27272A]">
            <div className="w-[12%] h-full bg-white rounded-full" />
          </div>
          <p className="text-[10px] text-bw-dim mt-2 font-mono">
            Tersinkronisasi aman di Supabase PostgreSQL & Cache Lokal
          </p>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* DRIVE MAIN CONTENT AREA */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col bg-[#000000] overflow-hidden">
        {/* Drive Top Action Toolbar */}
        <div className="p-4 border-b border-[#27272A] bg-[#09090B] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-bw-dim" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari file di Drive Proposal..."
              className="w-full bg-[#121214] border border-[#27272A] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-bw-dim focus:outline-none focus:border-white transition-colors"
            />
          </div>

          {/* View Mode & Refresh */}
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              className="p-2 rounded-xl bg-[#121214] border border-[#27272A] hover:bg-[#18181B] text-bw-muted hover:text-white transition-colors cursor-pointer"
              title="Ganti Tampilan Grid / List"
            >
              {viewMode === 'list' ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
            </button>

            <button
              onClick={fetchFiles}
              className="p-2 rounded-xl bg-[#121214] border border-[#27272A] hover:bg-[#18181B] text-bw-muted hover:text-white transition-colors cursor-pointer"
              title="Segarkan Drive"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* File Browser Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-bw-muted">
              File Proposal Tersimpan ({filtered.length})
            </h3>
            <span className="text-[10px] font-mono text-bw-dim">Klik baris untuk membuka proyek</span>
          </div>

          {isLoading ? (
            <div className="py-20 text-center text-bw-dim text-xs flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-white" />
              <span>Memuat file dari Drive Supabase...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-bw-dim text-xs">
              Drive kosong atau tidak ada file yang cocok dengan pencarian.
            </div>
          ) : viewMode === 'list' ? (
            /* Table / List View (Google Drive Style) */
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#27272A] text-bw-dim font-mono text-[11px]">
                    <th className="pb-2.5 font-medium">Nama Dokumen</th>
                    <th className="pb-2.5 font-medium">Kategori</th>
                    <th className="pb-2.5 font-medium">Instansi Mitra</th>
                    <th className="pb-2.5 font-medium">Terakhir Diubah</th>
                    <th className="pb-2.5 text-right font-medium">Aksi Cepat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#18181B]">
                  {filtered.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => onLoadProject(item)}
                      className="hover:bg-[#0E0E10] cursor-pointer group transition-colors"
                    >
                      <td className="py-3 pr-4 font-semibold text-white flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#18181B] border border-[#27272A] flex items-center justify-center text-white flex-shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="truncate max-w-xs sm:max-w-md group-hover:underline">
                          {item.title}
                        </span>
                      </td>

                      <td className="py-3 pr-4 font-mono text-[11px] text-bw-muted">
                        <span className="px-2 py-0.5 rounded bg-white/10 text-white font-semibold">
                          {item.category.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3 pr-4 font-mono text-bw-dim truncate max-w-[150px]">
                        {item.targetEntity || '-'}
                      </td>

                      <td className="py-3 pr-4 font-mono text-bw-dim text-[11px]">
                        {new Date(item.updatedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>

                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleDownloadWord(item, e)}
                            className="p-1.5 rounded-lg bg-[#18181B] hover:bg-white hover:text-black text-bw-muted transition-colors cursor-pointer"
                            title="Unduh File Word (.docx)"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => handleDownloadSlide(item, e)}
                            className="p-1.5 rounded-lg bg-[#18181B] hover:bg-white hover:text-black text-bw-muted transition-colors cursor-pointer"
                            title="Unduh File Slide (.pptx)"
                          >
                            <Presentation className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => handleDelete(item.id, e)}
                            className="p-1.5 rounded-lg hover:bg-red-950/40 text-bw-dim hover:text-red-400 transition-colors cursor-pointer"
                            title="Hapus Dokumen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Grid View (Google Drive Grid Cards) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onLoadProject(item)}
                  className="p-4 rounded-xl bg-[#0E0E10] border border-[#27272A] hover:border-white transition-all cursor-pointer group flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-[#18181B] border border-[#27272A] flex items-center justify-center text-white">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white font-semibold">
                        {item.category.toUpperCase()}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-white group-hover:underline line-clamp-2 leading-relaxed">
                      {item.title}
                    </h4>

                    {item.targetEntity && (
                      <p className="text-[11px] text-bw-dim mt-2 flex items-center gap-1 font-mono">
                        <Building2 className="w-3 h-3" />
                        <span className="truncate">{item.targetEntity}</span>
                      </p>
                    )}
                  </div>

                  <div className="pt-2.5 border-t border-[#1C1C1F] flex items-center justify-between text-[11px] font-mono text-bw-dim">
                    <span>
                      {new Date(item.updatedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </span>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleDownloadWord(item, e)}
                        className="p-1 hover:text-white"
                        title="Unduh .docx"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDownloadSlide(item, e)}
                        className="p-1 hover:text-white"
                        title="Unduh .pptx"
                      >
                        <Presentation className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        className="p-1 hover:text-red-400"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
