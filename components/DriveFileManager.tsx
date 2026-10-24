'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Presentation, 
  Trash2, 
  Search, 
  Plus, 
  HardDrive, 
  Grid, 
  List, 
  Clock, 
  ExternalLink,
  FileCode,
  Download,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  FolderOpen
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
    if (confirm('Apakah Anda yakin ingin menghapus berkas ini dari Drive Studio?')) {
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
    <div className="w-full flex-1 flex flex-col md:flex-row bg-white dark:bg-[#0B101A] border border-[#E2E8F0] dark:border-[#253149] rounded-2xl overflow-hidden shadow-xl min-h-[600px] animate-in fade-in duration-200">
      
      {/* 1. DRIVE SIDEBAR (Studio Token Design) */}
      <aside className="w-full md:w-64 bg-[#F8FAFC] dark:bg-[#080B12] border-b md:border-b-0 md:border-r border-[#E2E8F0] dark:border-[#253149] p-4 flex flex-col justify-between flex-shrink-0">
        <div>
          {/* New Proposal CTA */}
          <button
            type="button"
            onClick={onNewProposal}
            className="w-full py-2.5 px-3 rounded-xl bg-[#7C9CFF] hover:bg-[#688bf5] text-[#080B12] font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer mb-5 shadow-xs"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Mulai Usulan Baru</span>
          </button>

          {/* Folder Categories */}
          <div className="flex md:flex-col gap-1.5 overflow-x-auto pb-2 md:pb-0">
            <button
              type="button"
              onClick={() => setActiveFolder('all')}
              className={`px-3 py-2 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer whitespace-nowrap text-left ${
                activeFolder === 'all'
                  ? 'bg-[#7C9CFF]/15 text-[#7C9CFF] border border-[#7C9CFF]/30 font-semibold shadow-2xs'
                  : 'text-[#64748B] dark:text-[#A4B1C7] hover:text-[#0F172A] dark:hover:text-[#F3F6FC] hover:bg-[#F1F5F9] dark:hover:bg-[#111827]'
              }`}
            >
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4" />
                <span>Semua Usulan</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#253149]">
                {projects.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFolder('word')}
              className={`px-3 py-2 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer whitespace-nowrap text-left ${
                activeFolder === 'word'
                  ? 'bg-[#7C9CFF]/15 text-[#7C9CFF] border border-[#7C9CFF]/30 font-semibold shadow-2xs'
                  : 'text-[#64748B] dark:text-[#A4B1C7] hover:text-[#0F172A] dark:hover:text-[#F3F6FC] hover:bg-[#F1F5F9] dark:hover:bg-[#111827]'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Dokumen Word (.docx)</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#253149]">
                Dikti
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFolder('pptx')}
              className={`px-3 py-2 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer whitespace-nowrap text-left ${
                activeFolder === 'pptx'
                  ? 'bg-[#7C9CFF]/15 text-[#7C9CFF] border border-[#7C9CFF]/30 font-semibold shadow-2xs'
                  : 'text-[#64748B] dark:text-[#A4B1C7] hover:text-[#0F172A] dark:hover:text-[#F3F6FC] hover:bg-[#F1F5F9] dark:hover:bg-[#111827]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Presentation className="w-4 h-4" />
                <span>Slide Sidang (.pptx)</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#253149]">
                16:9
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFolder('md')}
              className={`px-3 py-2 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer whitespace-nowrap text-left ${
                activeFolder === 'md'
                  ? 'bg-[#7C9CFF]/15 text-[#7C9CFF] border border-[#7C9CFF]/30 font-semibold shadow-2xs'
                  : 'text-[#64748B] dark:text-[#A4B1C7] hover:text-[#0F172A] dark:hover:text-[#F3F6FC] hover:bg-[#F1F5F9] dark:hover:bg-[#111827]'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4" />
                <span>Naskah Markdown</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#253149]">
                Raw
              </span>
            </button>
          </div>
        </div>

        {/* Studio Storage Indicator */}
        <div className="hidden md:block pt-4 border-t border-[#E2E8F0] dark:border-[#253149] text-[11px] text-[#64748B] dark:text-[#A4B1C7]">
          <div className="flex justify-between items-center mb-1.5">
            <span className="font-medium flex items-center gap-1.5 text-[#0F172A] dark:text-[#F3F6FC]">
              <HardDrive className="w-3.5 h-3.5 text-[#7C9CFF]" />
              Penyimpanan Studio
            </span>
            <span className="text-[#34D399] font-mono font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#34D399]" />
              Cloud Sync
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#E2E8F0] dark:bg-[#111827] rounded-full overflow-hidden mb-1">
            <div className="w-[100%] h-full bg-gradient-to-r from-[#7C9CFF] to-[#34D399] rounded-full" />
          </div>
          <p className="text-[10px] text-[#64748B] dark:text-[#A4B1C7]">
            {projects.length} Usulan Tersimpan &amp; Terindeks
          </p>
        </div>
      </aside>

      {/* 2. MAIN DRIVE CONTENT AREA */}
      <div className="flex-1 flex flex-col bg-white dark:bg-[#0B101A] overflow-hidden">
        
        {/* Top Search & Filter Bar */}
        <div className="p-3 sm:p-4 border-b border-[#E2E8F0] dark:border-[#253149] bg-[#F8FAFC]/70 dark:bg-[#0B101A]/80 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#64748B] dark:text-[#A4B1C7]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari usulan berdasarkan judul atau instansi..."
              className="w-full bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#253149] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#0F172A] dark:text-[#F3F6FC] placeholder:text-[#64748B] dark:placeholder:text-[#A4B1C7] focus:outline-hidden focus:border-[#7C9CFF] transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#253149] text-[#64748B] dark:text-[#A4B1C7] hover:text-[#0F172A] dark:hover:text-[#F3F6FC] hover:bg-[#F1F5F9] dark:hover:bg-[#111827] transition-colors cursor-pointer"
              title="Ganti Mode Tampilan"
            >
              {viewMode === 'list' ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={fetchFiles}
              className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#253149] text-[#64748B] dark:text-[#A4B1C7] hover:text-[#0F172A] dark:hover:text-[#F3F6FC] hover:bg-[#F1F5F9] dark:hover:bg-[#111827] transition-colors cursor-pointer"
              title="Segarkan Berkas"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {isLoading ? (
            <div className="py-20 text-center text-[#64748B] dark:text-[#A4B1C7] text-xs flex flex-col items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-[#7C9CFF]" />
              <span>Memuat usulan dari penyimpanan studio...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-[#64748B] dark:text-[#A4B1C7] text-xs flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#7C9CFF]/10 border border-[#7C9CFF]/20 flex items-center justify-center text-[#7C9CFF]">
                <HardDrive className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-sm text-[#0F172A] dark:text-[#F3F6FC]">Belum ada berkas usulan tersimpan</p>
                <p className="text-[#64748B] dark:text-[#A4B1C7] mt-1 max-w-sm mx-auto">
                  Mulai usulan proposal baru dari tahap Topik untuk menyusun naskah dan slide secara otomatis.
                </p>
              </div>
              <button
                type="button"
                onClick={onNewProposal}
                className="mt-2 px-4 py-2 rounded-xl bg-[#7C9CFF] text-[#080B12] text-xs font-semibold hover:bg-[#688bf5] transition-all cursor-pointer shadow-xs"
              >
                + Mulai Usulan Baru
              </button>
            </div>
          ) : viewMode === 'list' ? (
            /* LIST VIEW */
            <div className="divide-y divide-[#E2E8F0] dark:divide-[#253149] border border-[#E2E8F0] dark:border-[#253149] rounded-xl overflow-hidden bg-white dark:bg-[#111827]">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onLoadProject(item)}
                  className="p-3.5 sm:p-4 hover:bg-[#F8FAFC] dark:hover:bg-[#172033] transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#7C9CFF]/15 text-[#7C9CFF] flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#7C9CFF]/30">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#7C9CFF]/15 text-[#7C9CFF] font-semibold border border-[#7C9CFF]/30">
                          {item.category.toUpperCase()}
                        </span>
                        <span className="text-[11px] text-[#64748B] dark:text-[#A4B1C7]">
                          {item.targetEntity}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-[#F3F6FC] truncate group-hover:text-[#7C9CFF] transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-[#64748B] dark:text-[#A4B1C7] mt-0.5">
                        Durasi: {item.durationMonths} Bulan &bull; Diperbarui: {new Date(item.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={(e) => handleDownloadWord(item, e)}
                      className="px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#253149] hover:border-[#7C9CFF] text-[11px] font-medium text-[#0F172A] dark:text-[#F3F6FC] hover:text-[#7C9CFF] bg-white dark:bg-[#0B101A] transition-colors flex items-center gap-1.5 shadow-2xs"
                      title="Unduh DOCX Standar Dikti"
                    >
                      <Download className="w-3.5 h-3.5 text-[#7C9CFF]" /> Word (.docx)
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDownloadSlide(item, e)}
                      className="px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#253149] hover:border-[#9B8CFF] text-[11px] font-medium text-[#0F172A] dark:text-[#F3F6FC] hover:text-[#9B8CFF] bg-white dark:bg-[#0B101A] transition-colors flex items-center gap-1.5 shadow-2xs"
                      title="Unduh Slide Sidang PPTX 16:9"
                    >
                      <Presentation className="w-3.5 h-3.5 text-[#9B8CFF]" /> Slide (.pptx)
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-1.5 rounded-lg text-[#64748B] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                      title="Hapus Usulan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* GRID VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onLoadProject(item)}
                  className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#253149] bg-white dark:bg-[#111827] hover:border-[#7C9CFF] transition-all cursor-pointer flex flex-col justify-between group shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#7C9CFF]/15 text-[#7C9CFF] font-semibold border border-[#7C9CFF]/30">
                        {item.category.toUpperCase()}
                      </span>
                      <span className="text-[11px] font-mono text-[#64748B] dark:text-[#A4B1C7]">
                        {item.durationMonths} Bulan
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-[#F3F6FC] line-clamp-2 group-hover:text-[#7C9CFF] transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-[#64748B] dark:text-[#A4B1C7] mt-1.5 truncate">
                      {item.targetEntity}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#E2E8F0] dark:border-[#253149] flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[10px] font-mono text-[#64748B] dark:text-[#A4B1C7]">
                      {new Date(item.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleDownloadWord(item, e)}
                        className="p-1.5 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#172033] text-[#64748B] hover:text-[#7C9CFF] transition-colors"
                        title="Unduh Word"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDownloadSlide(item, e)}
                        className="p-1.5 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#172033] text-[#64748B] hover:text-[#9B8CFF] transition-colors"
                        title="Unduh Slide"
                      >
                        <Presentation className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(item.id, e)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-[#64748B] hover:text-red-400 transition-colors"
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
