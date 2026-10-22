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
    if (confirm('Apakah Anda yakin ingin menghapus berkas ini dari Drive?')) {
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
    <div className="w-full flex-1 flex flex-col md:flex-row bg-[#000000] border border-zinc-900 rounded-xl overflow-hidden shadow-xl min-h-[580px] animate-in fade-in duration-200">
      
      {/* 1. DRIVE SIDEBAR (Clean & Minimalist) */}
      <aside className="w-full md:w-56 bg-zinc-950 border-b md:border-b-0 md:border-r border-zinc-900 p-4 flex flex-col justify-between flex-shrink-0">
        <div>
          {/* New Proposal CTA */}
          <button
            type="button"
            onClick={onNewProposal}
            className="w-full py-2 px-3 rounded-lg bg-zinc-100 hover:bg-white text-black font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer mb-5 shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Usulan Baru</span>
          </button>

          {/* Folder Categories */}
          <div className="flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0">
            <button
              type="button"
              onClick={() => setActiveFolder('all')}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 text-xs transition-colors cursor-pointer whitespace-nowrap text-left ${
                activeFolder === 'all'
                  ? 'bg-zinc-900 text-zinc-100 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              <HardDrive className="w-4 h-4 text-zinc-400" />
              <span>Semua Usulan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFolder('word')}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 text-xs transition-colors cursor-pointer whitespace-nowrap text-left ${
                activeFolder === 'word'
                  ? 'bg-zinc-900 text-zinc-100 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              <FileText className="w-4 h-4 text-zinc-400" />
              <span>Dokumen Word (.docx)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFolder('pptx')}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 text-xs transition-colors cursor-pointer whitespace-nowrap text-left ${
                activeFolder === 'pptx'
                  ? 'bg-zinc-900 text-zinc-100 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              <Presentation className="w-4 h-4 text-zinc-400" />
              <span>Slide Sidang (.pptx)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFolder('md')}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 text-xs transition-colors cursor-pointer whitespace-nowrap text-left ${
                activeFolder === 'md'
                  ? 'bg-zinc-900 text-zinc-100 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              <FileCode className="w-4 h-4 text-zinc-400" />
              <span>Naskah Markdown</span>
            </button>
          </div>
        </div>

        {/* Minimal Storage Indicator */}
        <div className="hidden md:block pt-4 border-t border-zinc-900 text-[11px] text-zinc-500">
          <div className="flex justify-between mb-1.5">
            <span>Penyimpanan</span>
            <span className="text-zinc-400 font-mono">12.8 MB / 5 GB</span>
          </div>
          <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
            <div className="w-[10%] h-full bg-zinc-300 rounded-full" />
          </div>
        </div>
      </aside>

      {/* 2. MAIN DRIVE CONTENT AREA */}
      <div className="flex-1 flex flex-col bg-[#000000] overflow-hidden">
        
        {/* Top Search & Filter Bar */}
        <div className="p-3 sm:p-4 border-b border-zinc-900 bg-zinc-950/60 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari usulan atau instansi..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer"
              title="Ganti Mode Tampilan"
            >
              {viewMode === 'list' ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={fetchFiles}
              className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer"
              title="Segarkan Berkas"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {isLoading ? (
            <div className="py-20 text-center text-zinc-500 text-xs flex flex-col items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-zinc-400" />
              <span>Memuat usulan dari penyimpanan...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-zinc-500 text-xs flex flex-col items-center gap-3">
              <HardDrive className="w-8 h-8 text-zinc-700" />
              <div>
                <p className="font-medium text-zinc-300">Belum ada berkas usulan tersimpan</p>
                <p className="text-zinc-500 mt-1">Buat judul usulan baru pada tahap Topik untuk menyusun proposal otomatis.</p>
              </div>
              <button
                type="button"
                onClick={onNewProposal}
                className="mt-2 px-3 py-1.5 rounded-lg bg-zinc-100 text-black text-xs font-medium hover:bg-white transition-all cursor-pointer"
              >
                + Mulai Usulan Baru
              </button>
            </div>
          ) : viewMode === 'list' ? (
            /* LIST VIEW */
            <div className="divide-y divide-zinc-900 border border-zinc-900 rounded-lg overflow-hidden">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onLoadProject(item)}
                  className="p-3 sm:p-4 hover:bg-zinc-950/80 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <FileText className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-medium text-zinc-100 truncate group-hover:text-white transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        {item.targetEntity} &bull; {item.durationMonths} Bulan &bull; Diperbarui: {new Date(item.updatedAt).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={(e) => handleDownloadWord(item, e)}
                      className="px-2.5 py-1 rounded border border-zinc-800 hover:border-zinc-600 text-[11px] text-zinc-300 hover:text-white transition-colors flex items-center gap-1"
                      title="Unduh DOCX"
                    >
                      <Download className="w-3 h-3" /> Word
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDownloadSlide(item, e)}
                      className="px-2.5 py-1 rounded border border-zinc-800 hover:border-zinc-600 text-[11px] text-zinc-300 hover:text-white transition-colors flex items-center gap-1"
                      title="Unduh PPTX"
                    >
                      <Download className="w-3 h-3" /> Slide
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-1 rounded text-zinc-600 hover:text-red-400 transition-colors"
                      title="Hapus Usulan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* GRID VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onLoadProject(item)}
                  className="p-4 rounded-lg border border-zinc-900 bg-zinc-950/60 hover:border-zinc-700 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <FileText className="w-5 h-5 text-zinc-400 mb-2" />
                    <h4 className="text-xs sm:text-sm font-medium text-zinc-100 line-clamp-2 group-hover:text-white">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      {item.targetEntity} &bull; {item.durationMonths} Bulan
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-zinc-900/80 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[10px] text-zinc-600">
                      {new Date(item.updatedAt).toLocaleDateString('id-ID')}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleDownloadWord(item, e)}
                        className="p-1 rounded hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
                        title="Unduh Word"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(item.id, e)}
                        className="p-1 rounded hover:bg-zinc-900 text-zinc-600 hover:text-red-400 transition-colors"
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
