"use client";

import React, { useState } from "react";
import { ProposalCategory } from "@/types/studio";
import { 
  ArrowUp, 
  Sparkles, 
  Building2, 
  Clock, 
  SlidersHorizontal,
  ChevronDown,
  GraduationCap,
  Briefcase,
  FlaskConical,
  Database,
  Search,
  BookOpen,
  Check,
  RefreshCw,
  FolderKanban
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
    <div className="flex-1 flex flex-col items-center justify-center py-6 sm:py-10 max-w-4xl mx-auto w-full animate-in fade-in duration-300 text-white">
      
      {/* 1. Sleek Monochrome AI Fluid Orb */}
      <div className="mb-6 flex justify-center">
        <div className="monochrome-orb cursor-pointer hover:scale-105 transition-transform" />
      </div>

      {/* 2. Hero Greetings & Title */}
      <div className="text-center mb-8 px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181B] border border-[#27272A] text-[11px] font-mono text-white mb-3">
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>SOP Akademis &bull; 12 Metode Berpikir Ilmiah &bull; Zero Dummy Data</span>
        </div>
        
        <h1 className="text-2xl sm:text-4xl lg:text-[40px] font-bold text-white tracking-tight leading-tight">
          Mau merumuskan usulan proposal apa hari ini?
        </h1>
        <p className="text-xs sm:text-sm text-bw-muted mt-2 max-w-xl mx-auto leading-relaxed">
          Ketikkan judul proposal Anda atau minta rekomendasi langsung dari AI berdasarkan paper jurnal terbaru. Sistem akan memandu sesi wawancara sebelum agen AI mulai menyusun dokumen.
        </p>
      </div>

      {/* 3. The Central Floating Command Capsule (Monochrome) */}
      <div className="w-full max-w-2xl bg-[#09090B] rounded-[24px] border border-[#27272A] p-3.5 sm:p-4 shadow-2xl relative mb-6 transition-all hover:border-[#3F3F46]">
        
        {/* Top Capsule Banner Badge */}
        <div className="flex items-center justify-between px-3 py-1.5 mb-2 text-xs text-bw-muted border-b border-[#18181B]">
          <button
            onClick={handleOpenAiRecommender}
            className="flex items-center gap-1.5 text-white hover:text-bw-muted font-medium cursor-pointer transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
            <span className="text-[11px] tracking-wide font-mono underline underline-offset-4">
              Rekomendasi Judul dari AI & Jurnal ↗
            </span>
          </button>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-1 text-[11px] text-bw-muted hover:text-white transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3 h-3 text-white" />
            <span>{showConfig ? "Tutup Parameter" : "Parameter Instansi & Waktu"}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showConfig ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Collapsible Parameters (Target, Duration, Identity) */}
        {showConfig && (
          <div className="p-3 mb-3 bg-[#121214] rounded-xl border border-[#27272A] grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs animate-in fade-in duration-200">
            <div>
              <label className="text-[10px] font-mono uppercase text-bw-dim block mb-1">
                Instansi Mitra / Kampus
              </label>
              <input
                type="text"
                value={targetEntity}
                onChange={(e) => setTargetEntity(e.target.value)}
                placeholder="Contoh: PT Telkom / RS UGM"
                className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-2.5 py-1.5 text-white placeholder:text-bw-dim text-xs focus:outline-none focus:border-white transition-colors"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-bw-dim block mb-1">
                Durasi Rencana
              </label>
              <select
                value={durationMonths}
                onChange={(e) => setDurationMonths(Number(e.target.value))}
                className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-white"
              >
                <option value={1}>1 Bulan (4 Minggu)</option>
                <option value={3}>3 Bulan (12 Minggu - PKL)</option>
                <option value={4}>4 Bulan (16 Minggu - 1 Sem)</option>
                <option value={6}>6 Bulan (MBKM 20 SKS / Skripsi)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-bw-dim block mb-1">
                Nama Pengusul
              </label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="Nama Lengkap Anda"
                className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-2.5 py-1.5 text-white placeholder:text-bw-dim text-xs focus:outline-none focus:border-white transition-colors"
              />
            </div>
          </div>
        )}

        {/* Input Textarea */}
        <div className="px-2 pt-1 pb-2">
          <textarea
            rows={2}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketikkan judul proposal magang atau skripsi yang ingin Anda susun..."
            className="w-full bg-transparent text-white placeholder:text-bw-dim text-sm sm:text-base focus:outline-none resize-none font-sans leading-relaxed"
          />
        </div>

        {/* Bottom Action Controls inside Capsule */}
        <div className="flex items-center justify-between pt-2.5 border-t border-[#18181B] px-1 sm:px-2">
          {/* Category Switcher Tabs (Monochrome) */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCategory("magang")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                category === "magang"
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "bg-[#18181B] text-bw-muted hover:text-white border border-[#27272A]"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Magang</span>
            </button>

            <button
              onClick={() => setCategory("skripsi")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                category === "skripsi"
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "bg-[#18181B] text-bw-muted hover:text-white border border-[#27272A]"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Skripsi</span>
            </button>

            <button
              onClick={() => setCategory("penelitian")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                category === "penelitian"
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "bg-[#18181B] text-bw-muted hover:text-white border border-[#27272A]"
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Tesis/Riset</span>
            </button>
          </div>

          {/* White Circular Send Button */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-[10px] text-bw-dim font-mono">
              Enter ↵
            </span>
            <button
              onClick={onSubmit}
              disabled={!title.trim()}
              title="Lanjutkan ke Wawancara Diagnostik"
              className="w-9 h-9 rounded-full bg-white hover:bg-gray-200 active:scale-95 disabled:opacity-20 disabled:pointer-events-none text-black flex items-center justify-center transition-all shadow-md cursor-pointer flex-shrink-0"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

      </div>

      {/* Quick Utilities: Drive & Database Link */}
      <div className="w-full max-w-2xl flex items-center justify-between text-xs text-bw-muted px-2">
        <button
          onClick={handleOpenAiRecommender}
          className="text-white hover:underline flex items-center gap-1.5 cursor-pointer font-mono text-[11px]"
        >
          <Sparkles className="w-3 h-3 text-white" />
          <span>Cari Ide Judul Berdasarkan Jurnal Ilmiah</span>
        </button>

        {onOpenDrive && (
          <button
            onClick={onOpenDrive}
            className="text-bw-muted hover:text-white flex items-center gap-1.5 cursor-pointer font-mono text-[11px]"
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Buka Drive Penyimpanan File</span>
          </button>
        )}
      </div>

      {/* MODAL: REKOMENDASI JUDUL DARI AI & JURNAL TERBARU */}
      {isAiRecommenderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#09090B] border border-[#27272A] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#18181B] flex items-center justify-between bg-[#121214]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Rekomendasi Judul AI Berbasis Literatur</h3>
                  <p className="text-[11px] text-bw-muted">Berdasarkan referensi jurnal terindeks & 12 Metode Berpikir</p>
                </div>
              </div>
              <button
                onClick={() => setIsAiRecommenderOpen(false)}
                className="w-7 h-7 rounded-lg bg-[#18181B] hover:bg-[#27272A] text-bw-muted hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Keyword Input & Action */}
            <div className="p-4 border-b border-[#18181B] bg-[#0E0E10] flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-bw-dim" />
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleFetchAiTitles()}
                  placeholder="Ketik topik minat (misal: AI Medis, MLOps Telkom, Bioplastik, IoT)..."
                  className="w-full bg-[#18181B] border border-[#27272A] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-bw-dim focus:outline-none focus:border-white transition-colors"
                />
              </div>
              <button
                onClick={() => handleFetchAiTitles()}
                disabled={isLoadingRecs}
                className="py-2 px-4 rounded-xl bg-white hover:bg-gray-200 text-black font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                {isLoadingRecs ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Menganalisis...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Dapatkan Judul
                  </>
                )}
              </button>
            </div>

            {/* Recommendations List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoadingRecs ? (
                <div className="py-12 text-center text-bw-dim text-xs flex flex-col items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-white" />
                  <span>AI sedang menyusun usulan judul berbobot ilmiah...</span>
                </div>
              ) : recommendations.length === 0 ? (
                <div className="py-12 text-center text-bw-dim text-xs">
                  Ketik topik atau klik tombol di atas untuk mendapatkan rekomendasi judul.
                </div>
              ) : (
                recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() => handleApplyTitle(rec)}
                    className="p-3.5 rounded-xl bg-[#121214] border border-[#27272A] hover:border-white hover:bg-[#18181B] transition-all cursor-pointer group flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white font-semibold">
                          {rec.category.toUpperCase()} &bull; {rec.entity}
                        </span>
                        <span className="text-[10px] font-mono text-bw-dim">
                          Pilar: {rec.thinkingMode}
                        </span>
                      </div>

                      <h4 className="text-xs font-semibold text-white group-hover:text-gray-100 transition-colors leading-relaxed">
                        {rec.title}
                      </h4>

                      <div className="mt-1.5 text-[10px] font-mono text-bw-muted">
                        📚 Rujukan Primer: {rec.referenceJournal}
                      </div>

                      <div className="mt-1 text-[10px] font-mono text-bw-dim">
                        💡 Celah Riset (Gap): {rec.researchGap}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#1C1C1F] flex items-center justify-between text-[11px] text-white font-mono">
                      <span>Gunakan Judul Ini ↵</span>
                      <span className="text-bw-dim group-hover:text-white">Pilih →</span>
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
