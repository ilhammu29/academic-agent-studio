"use client";

import React, { useState } from "react";
import { ProposalCategory } from "@/types/studio";
import { 
  ArrowUp, 
  Sparkles, 
  SlidersHorizontal,
  ChevronDown,
  GraduationCap,
  Briefcase,
  FlaskConical,
  Search,
  RefreshCw,
  FolderKanban,
  Check
} from "lucide-react";
import { TitleRecommendation, getAiTitleRecommendations } from "@/lib/titleGenerator";

interface HeroInputViewProps {
  category: ProposalCategory;
  setCategory: (c: ProposalCategory) => void;
  title: string;
  setTitle: (t: string) => void;
  targetEntity: string;
  setTargetEntity: (e: string) => void;
  durationMonths: number;
  setDurationMonths: (d: number) => void;
  candidateName: string;
  setCandidateName: (n: string) => void;
  candidateId: string;
  setCandidateId: (id: string) => void;
  onSubmit: () => void;
  onOpenDatabase?: () => void;
  onOpenDrive?: () => void;
}

export const HeroInputView: React.FC<HeroInputViewProps> = ({
  category,
  setCategory,
  title,
  setTitle,
  targetEntity,
  setTargetEntity,
  durationMonths,
  setDurationMonths,
  candidateName,
  setCandidateName,
  candidateId,
  setCandidateId,
  onSubmit,
  onOpenDatabase,
  onOpenDrive
}) => {
  const [showConfig, setShowConfig] = useState(false);
  const [isAiRecommenderOpen, setIsAiRecommenderOpen] = useState(false);
  const [keywordInput, setKeywordInput] = useState("");
  const [recommendations, setRecommendations] = useState<TitleRecommendation[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);

  const handleFetchAiTitles = async (kw?: string) => {
    setIsLoadingRecs(true);
    const results = await getAiTitleRecommendations(kw || keywordInput || "Informatika & AI");
    setRecommendations(results);
    setIsLoadingRecs(false);
  };

  const handleOpenAiRecommender = () => {
    setIsAiRecommenderOpen(true);
    if (recommendations.length === 0) {
      handleFetchAiTitles("Informatika & AI");
    }
  };

  const handleApplyTitle = (rec: TitleRecommendation) => {
    setTitle(rec.title);
    setCategory(rec.category);
    setTargetEntity(rec.entity);
    setDurationMonths(rec.durationMonths);
    setIsAiRecommenderOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (title.trim()) {
        onSubmit();
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-6 sm:py-12 max-w-3xl mx-auto w-full animate-in fade-in duration-200">
      
      {/* 1. Sleek Minimal Typography & Heading */}
      <div className="text-center mb-8 px-4 w-full">
        <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-zinc-100 leading-tight">
          Perumusan Usulan Proposal Akademik
        </h1>
        <p className="text-sm text-zinc-400 mt-2 max-w-lg mx-auto leading-relaxed">
          Ketikkan judul usulan Anda atau minta rekomendasi dari paper ilmiah terkini. Sistem akan melakukan wawancara diagnostik sebelum dokumen disusun.
        </p>
      </div>

      {/* 2. Sleek Command Input Surface (No bulky cardbox) */}
      <div className="w-full bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-3 sm:p-4 transition-all focus-within:border-zinc-500 shadow-xl mb-4">
        
        {/* Top Action Row inside input */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-900 text-xs">
          <button
            type="button"
            onClick={handleOpenAiRecommender}
            className="flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors cursor-pointer text-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
            <span className="underline underline-offset-4 decoration-zinc-700 hover:decoration-white">
              Rekomendasi Judul dari Jurnal
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>{showConfig ? "Tutup Parameter" : "Instansi & Durasi"}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showConfig ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Expandable Parameters */}
        {showConfig && (
          <div className="py-3 mb-3 border-b border-zinc-900 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs animate-in fade-in duration-150">
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">
                Instansi Mitra / Kampus
              </label>
              <input
                type="text"
                value={targetEntity}
                onChange={(e) => setTargetEntity(e.target.value)}
                placeholder="Contoh: PT Telkom / RS Sardjito"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 placeholder:text-zinc-600 text-xs focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">
                Durasi Kegiatan
              </label>
              <select
                value={durationMonths}
                onChange={(e) => setDurationMonths(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 text-xs focus:outline-none focus:border-zinc-500 transition-colors"
              >
                <option value={1}>1 Bulan (4 Minggu)</option>
                <option value={3}>3 Bulan (12 Minggu - PKL)</option>
                <option value={4}>4 Bulan (16 Minggu - 1 Semester)</option>
                <option value={6}>6 Bulan (MBKM 20 SKS / Skripsi)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">
                Nama Pengusul
              </label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="Nama Lengkap Anda"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 placeholder:text-zinc-600 text-xs focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Input Textarea */}
        <div className="py-1">
          <textarea
            rows={2}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketikkan judul proposal magang, skripsi, atau riset yang ingin disusun..."
            className="w-full bg-transparent text-zinc-100 placeholder:text-zinc-600 text-sm sm:text-base focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Bottom Control Bar */}
        <div className="flex items-center justify-between pt-3 mt-1 border-t border-zinc-900">
          {/* Category Tabs */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCategory("magang")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                category === "magang"
                  ? "bg-zinc-100 text-black font-medium"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Magang</span>
            </button>

            <button
              type="button"
              onClick={() => setCategory("skripsi")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                category === "skripsi"
                  ? "bg-zinc-100 text-black font-medium"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Skripsi</span>
            </button>

            <button
              type="button"
              onClick={() => setCategory("penelitian")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                category === "penelitian"
                  ? "bg-zinc-100 text-black font-medium"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Tesis/Riset</span>
            </button>
          </div>

          {/* Submit Arrow */}
          <button
            type="button"
            onClick={onSubmit}
            disabled={!title.trim()}
            title="Lanjut ke Wawancara Diagnostik"
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-white active:scale-95 disabled:opacity-20 disabled:pointer-events-none text-black flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
          >
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* 3. Sleek Quick Links */}
      <div className="w-full flex items-center justify-between text-xs text-zinc-500 px-1">
        <button
          type="button"
          onClick={handleOpenAiRecommender}
          className="text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
          <span>Eksplorasi Ide Judul Riset Terindeks</span>
        </button>

        {onOpenDrive && (
          <button
            type="button"
            onClick={onOpenDrive}
            className="text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
          >
            <FolderKanban className="w-3.5 h-3.5 text-zinc-400" />
            <span>Buka Drive Penyimpanan</span>
          </button>
        )}
      </div>

      {/* 4. MODAL: REKOMENDASI JUDUL ILMIAH */}
      {isAiRecommenderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-zinc-900 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">
                  Rekomendasi Judul Berbasis Literatur
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Kurasi judul terarah berdasarkan celah riset dan 12 metode berpikir ilmiah
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAiRecommenderOpen(false)}
                className="w-7 h-7 rounded-md hover:bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {/* Keyword Input */}
            <div className="p-4 border-b border-zinc-900 bg-zinc-950/50 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleFetchAiTitles()}
                  placeholder="Ketik topik minat (misal: AI Medis, MLOps, Bioplastik, IoT)..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={() => handleFetchAiTitles()}
                disabled={isLoadingRecs}
                className="py-2 px-4 rounded-lg bg-zinc-100 hover:bg-white text-black font-medium text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                {isLoadingRecs ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Menganalisis...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Cari
                  </>
                )}
              </button>
            </div>

            {/* Recommendations List (Clean & Minimalist, No Cardbox nesting) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-zinc-900">
              {isLoadingRecs ? (
                <div className="py-12 text-center text-zinc-500 text-xs flex flex-col items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-zinc-400" />
                  <span>Menyusun rekomendasi berbasis literatur...</span>
                </div>
              ) : recommendations.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  Ketikkan kata kunci topik di atas lalu tekan Cari.
                </div>
              ) : (
                recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="pt-3 first:pt-0 group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <h4 className="text-xs sm:text-sm font-medium text-zinc-100 leading-snug group-hover:text-white transition-colors">
                        {rec.title}
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleApplyTitle(rec)}
                        className="py-1 px-2.5 rounded bg-zinc-900 hover:bg-zinc-100 hover:text-black border border-zinc-800 text-[11px] text-zinc-300 font-medium transition-colors flex-shrink-0 cursor-pointer"
                      >
                        Pilih Judul
                      </button>
                    </div>

                    <p className="text-xs text-zinc-400 mb-2 leading-relaxed">
                      {rec.researchGap}
                    </p>

                    <div className="text-[11px] text-zinc-500 space-y-1">
                      <div>
                        <span className="text-zinc-400">Instansi & Durasi:</span> {rec.entity} ({rec.durationMonths} Bulan)
                      </div>
                      <div>
                        <span className="text-zinc-400">Rujukan:</span> {rec.referenceJournal}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
