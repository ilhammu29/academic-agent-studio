'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  BookOpen, 
  ExternalLink, 
  Check, 
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
  const [searchError, setSearchError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedBibtex, setCopiedBibtex] = useState(false);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const handleSearch = async (kw?: string) => {
    const targetQuery = (kw !== undefined ? kw : query).trim();
    if (!targetQuery) return;
    setIsLoading(true);
    setSearchError("");
    try {
      const results = await searchSemanticScholarPapers(targetQuery, 6);
      setPapers(results);
    } catch (e) {
      setPapers([]);
      setSearchError("Pencarian tidak tersedia. Periksa koneksi dan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && initialQuery) {
      setQuery(initialQuery);
      handleSearch(initialQuery);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        
        {searchError && <p role="alert" className="mx-4 my-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{searchError}</p>}
      {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-850 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Pencarian Literatur & Matriks PRISMA 2020</span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                  OPENALEX & CROSSREF API
                </span>
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Jurnal terindeks Scopus & SINTA dengan DOI aktif untuk memperkuat Bab II Landasan Teori
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center justify-center transition-colors cursor-pointer text-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar & Action Ribbon */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Cari kata kunci topik proposal (misal: RAG, Deep Learning, Manajemen Distribusi)..."
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSearch()}
              disabled={isLoading}
              className="px-4 py-2 rounded-full bg-zinc-950 hover:bg-black text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-black text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>Cari Paper</span>
            </button>

            {papers.length > 0 && (
              <button
                onClick={handleCopyBibtex}
                className="px-3.5 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Salin seluruh sitasi dalam format BibTeX"
              >
                {copiedBibtex ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Quote className="w-3.5 h-3.5" />}
                <span>{copiedBibtex ? "Tersalin" : "BibTeX"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Papers List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {isLoading ? (
            <div className="py-16 text-center text-zinc-500 dark:text-zinc-400 text-xs flex flex-col items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-zinc-500" />
              <span>Menghubungi API OpenAlex dan Semantic Scholar untuk mengambil metadata DOI...</span>
            </div>
          ) : papers.length === 0 ? (
            <div className="py-16 text-center text-zinc-400 text-xs">
              <BookOpen className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2 opacity-50" />
              <p>Belum ada literatur yang dicari. Masukkan kata kunci topik di atas dan tekan Cari.</p>
            </div>
          ) : (
            papers.map((p) => {
              const isAdded = !!addedIds[p.paperId];

              return (
                <div
                  key={p.paperId}
                  className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                          {p.year || 'Terkini'}
                        </span>
                        {p.venue && (
                          <span className="text-[11px] text-zinc-500 font-sans truncate max-w-xs">
                            {p.venue}
                          </span>
                        )}
                        {p.citationCount !== undefined && (
                          <span className="text-[10px] text-zinc-400 font-mono">
                            • {p.citationCount} Sitasi
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                        {p.title}
                      </h4>

                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-1">
                        Penulis: {p.authors?.join(', ') || 'Tim Peneliti'}
                      </p>

                      {p.abstract && (
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-2 leading-relaxed bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-850">
                          {p.abstract}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {p.url && (
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          title="Buka publikasi sumber (DOI / Semantic Scholar)"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

                      <button
                        onClick={() => handleAddPaper(p)}
                        disabled={isAdded}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                          isAdded
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black hover:opacity-90'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Ditambahkan</span>
                          </>
                        ) : (
                          <>
                            <Layers className="w-3.5 h-3.5" />
                            <span>Tambahkan</span>
                          </>
                        )}
                      </button>
                    </div>
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
