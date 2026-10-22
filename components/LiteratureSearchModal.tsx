'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  BookOpen, 
  ExternalLink, 
  Check, 
  Sparkles, 
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

  const handleSearch = async (kw?: string) => {
    const targetQuery = (kw !== undefined ? kw : query).trim();
    if (!targetQuery) return;
    setIsLoading(true);
    try {
      const results = await searchSemanticScholarPapers(targetQuery, 6);
      setPapers(results);
    } catch (e) {
      console.warn("Search papers failed:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const q = initialQuery?.trim() || "Informatika & AI";
      setQuery(q);
      handleSearch(q);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-900 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <span>Pencarian Literatur & Matriks PRISMA 2020</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-800">
                  OPENALEX & CROSSREF API
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400 font-sans">
                Jurnal terindeks Scopus & SINTA dengan DOI aktif untuk memperkuat Bab II Landasan Teori
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar & Action Ribbon */}
        <div className="p-4 border-b border-zinc-900 bg-zinc-950/80 flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Cari kata kunci topik proposal (misal: Deep Learning, Manajemen Keuangan, Sistem Irigasi)..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSearch()}
              disabled={isLoading || !query.trim()}
              className="py-2 px-4 rounded-lg bg-zinc-100 hover:bg-white disabled:opacity-40 text-black font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
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
                className="py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Salin referensi format BibTeX untuk Mendeley / Zotero"
              >
                {copiedBibtex ? <Check className="w-3.5 h-3.5 text-zinc-100" /> : <Quote className="w-3.5 h-3.5 text-zinc-400" />}
                <span>{copiedBibtex ? 'BibTeX Disalin!' : 'Ekspor BibTeX'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {isLoading ? (
            <div className="py-16 text-center text-zinc-400 text-xs flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-zinc-300" />
              <span>Menelusuri database OpenAlex, Crossref & Semantic Scholar...</span>
            </div>
          ) : papers.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 text-xs">
              Belum ada paper yang ditampilkan. Ketikkan kata kunci dan tekan Cari.
            </div>
          ) : (
            <>
              <div className="text-[11px] font-mono text-zinc-400 flex items-center justify-between">
                <span>Ditemukan {papers.length} Rujukan Terindeks untuk "{query}":</span>
                <span className="text-zinc-500">Standar PRISMA 2020</span>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {papers.map((paper) => {
                  const isAdded = !!addedIds[paper.paperId];

                  return (
                    <div
                      key={paper.paperId}
                      className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between gap-3 shadow-sm"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[10px] font-mono text-zinc-300 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                            {paper.venue} ({paper.year})
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500">
                            Sitasi: {paper.citationCount} kali
                          </span>
                        </div>

                        <h4 className="text-xs sm:text-sm font-semibold text-zinc-100 leading-snug">
                          {paper.title}
                        </h4>

                        <p className="text-[11px] text-zinc-400 font-mono mt-1">
                          Penulis: {paper.authors.map((a) => a.name).join(', ')}
                        </p>

                        <p className="text-xs text-zinc-300 mt-2 leading-relaxed line-clamp-3">
                          {paper.abstract}
                        </p>

                        {/* Research Gap Pill */}
                        <div className="mt-2.5 p-2 rounded-lg bg-zinc-950 border border-zinc-800/80 text-[11px] text-zinc-300 font-sans flex items-start gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0 mt-0.5" />
                          <span><strong>Celah Riset (Gap):</strong> {paper.researchGap}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between">
                        {paper.doi ? (
                          <a
                            href={paper.doi}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-zinc-400 hover:text-zinc-100 flex items-center gap-1 font-mono transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span className="truncate max-w-[200px]">{paper.doi.replace('https://doi.org/', 'DOI: ')}</span>
                          </a>
                        ) : (
                          <span className="text-[10px] text-zinc-500 font-mono">Open Access Indexed</span>
                        )}

                        <button
                          onClick={() => handleAddPaper(paper)}
                          disabled={isAdded}
                          className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm ${
                            isAdded
                              ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                              : 'bg-zinc-100 hover:bg-white text-black font-semibold'
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
