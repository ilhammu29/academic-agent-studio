'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  BookOpen, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles, 
  FileCode, 
  Layers, 
  RefreshCw,
  Quote
} from 'lucide-react';
import { AcademicPaper, searchSemanticScholarPapers, generateBibtex } from '@/lib/semanticScholar';

interface LiteratureSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery: string;
  onAddPaperToProposal?: (paper: AcademicPaper) => void;
}

export default function LiteratureSearchModal({
  isOpen,
  onClose,
  initialQuery,
  onAddPaperToProposal,
}: LiteratureSearchModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [papers, setPapers] = useState<AcademicPaper[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedBibtex, setCopiedBibtex] = useState(false);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    const results = await searchSemanticScholarPapers(query, 6);
    setPapers(results);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen && initialQuery) {
      setQuery(initialQuery);
      handleSearch();
    }
  }, [isOpen, initialQuery]);

  if (!isOpen) return null;

  const handleCopyBibtex = () => {
    const bibtex = generateBibtex(papers);
    navigator.clipboard.writeText(bibtex);
    setCopiedBibtex(true);
    setTimeout(() => setCopiedBibtex(false), 2000);
  };

  const handleAddPaper = (paper: AcademicPaper) => {
    setAddedIds((prev) => ({ ...prev, [paper.paperId]: true }));
    if (onAddPaperToProposal) {
      onAddPaperToProposal(paper);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#0D121C] border border-[#1E2738] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1A2333] flex items-center justify-between bg-[#0A0E17]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-center text-purple-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-milk-white flex items-center gap-2">
                <span>Pencarian Literatur & Matriks PRISMA 2020</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950/60 text-purple-300 border border-purple-800/40">
                  SEMANTIC SCHOLAR API
                </span>
              </h3>
              <p className="text-[11px] text-milk-muted font-mono">
                Jurnal terindeks Scopus & SINTA dengan DOI aktif untuk memperkuat Bab II
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#141A26] hover:bg-[#1E2638] text-milk-muted hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar & Action Ribbon */}
        <div className="p-4 border-b border-[#1A2333] bg-[#0E1420] flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-milk-dim" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Cari kata kunci topik skripsi / magang (misal: vision transformer, RAG, miRNA)..."
              className="w-full bg-[#121824] border border-[#212C3F] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-milk-dim focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSearch}
              disabled={isLoading || !query.trim()}
              className="py-2 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Mencari...
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" /> Cari Paper
                </>
              )}
            </button>

            {papers.length > 0 && (
              <button
                onClick={handleCopyBibtex}
                className="py-2 px-3 rounded-xl bg-[#141A26] hover:bg-[#1E2638] text-milk-soft border border-[#232D40] text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Salin referensi format BibTeX untuk Mendeley / Zotero"
              >
                {copiedBibtex ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Quote className="w-3.5 h-3.5 text-champagne" />}
                <span>{copiedBibtex ? 'BibTeX Disalin!' : 'Ekspor BibTeX'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {isLoading ? (
            <div className="py-16 text-center text-milk-dim text-xs flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
              <span>Menelusuri database Semantic Scholar & Crossref...</span>
            </div>
          ) : papers.length === 0 ? (
            <div className="py-16 text-center text-milk-dim text-xs">
              Belum ada paper yang ditampilkan. Ketikkan kata kunci dan tekan Cari.
            </div>
          ) : (
            <>
              <div className="text-[11px] font-mono text-milk-dim flex items-center justify-between">
                <span>Ditemukan {papers.length} Rujukan Terindeks:</span>
                <span className="text-purple-400">Standar PRISMA 2020</span>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {papers.map((paper) => {
                  const isAdded = !!addedIds[paper.paperId];

                  return (
                    <div
                      key={paper.paperId}
                      className="p-4 rounded-xl bg-[#101622] border border-[#1D2739] hover:border-purple-500/40 transition-all flex flex-col justify-between gap-3 shadow-sm"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[10px] font-mono text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
                            {paper.venue} ({paper.year})
                          </span>
                          <span className="text-[10px] font-mono text-milk-dim">
                            Sitasi: {paper.citationCount} kali
                          </span>
                        </div>

                        <h4 className="text-xs sm:text-sm font-semibold text-milk-white hover:text-purple-300 transition-colors">
                          {paper.title}
                        </h4>

                        <p className="text-[11px] text-milk-muted font-mono mt-1">
                          Penulis: {paper.authors.map((a) => a.name).join(', ')}
                        </p>

                        <p className="text-[11px] text-milk-dim mt-2 leading-relaxed line-clamp-3">
                          {paper.abstract}
                        </p>

                        {/* Research Gap Pill */}
                        <div className="mt-2.5 p-2 rounded-lg bg-[#0A0E17] border border-[#182130] text-[10px] text-champagne font-mono flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-champagne flex-shrink-0" />
                          <span>Identifikasi Celah Riset (Gap): {paper.researchGap}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#182130] flex items-center justify-between">
                        {paper.doi ? (
                          <a
                            href={paper.doi}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-sky-400 hover:underline flex items-center gap-1 font-mono"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Buka DOI Jurnal</span>
                          </a>
                        ) : (
                          <span className="text-[10px] text-milk-dim font-mono">Open Access Indexed</span>
                        )}

                        <button
                          onClick={() => handleAddPaper(paper)}
                          disabled={isAdded}
                          className={`py-1 px-3 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                            isAdded
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                              : 'bg-purple-600 hover:bg-purple-500 text-white shadow-sm'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" /> Masuk ke Bab II
                            </>
                          ) : (
                            <>
                              <Layers className="w-3.5 h-3.5" /> Tambah ke Matriks Bab II
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
