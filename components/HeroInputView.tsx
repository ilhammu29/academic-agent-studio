"use client";

import React, { useState } from "react";
import { ProposalCategory } from "@/types/studio";
import { 
  ArrowRight, 
  Sparkles, 
  FileText, 
  Cpu, 
  Package, 
  Cog, 
  BookOpen, 
  TrendingUp, 
  ChevronRight,
  Landmark,
  GraduationCap
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
  onOpenGuidelineModal?: () => void;
  onOpenConsultation?: () => void;
  activeCampusName?: string;
}

const TOPIC_CHIPS = [
  {
    id: "ai-rag",
    label: "AI & RAG",
    icon: FileText,
    title: "Implementasi Retrieval-Augmented Generation (RAG) untuk Akselerasi Manajemen Pengetahuan Akademik",
    entity: "PT Telekomunikasi Indonesia",
    category: "skripsi" as ProposalCategory,
    duration: 6
  },
  {
    id: "iot-medis",
    label: "Triase Medis IoT",
    icon: Cpu,
    title: "Analisis Efektivitas Sistem Triase Berbasis IoT dan Machine Learning pada Instalasi Gawat Darurat",
    entity: "RSUP Dr. Sardjito",
    category: "skripsi" as ProposalCategory,
    duration: 6
  },
  {
    id: "supply-chain",
    label: "Supply Chain Retail",
    icon: Package,
    title: "Optimasi Efisiensi Distribusi Rantai Pasok Retail Menggunakan Predictive Analytics",
    entity: "PT Unilever Indonesia",
    category: "magang" as ProposalCategory,
    duration: 4
  },
  {
    id: "manufaktur",
    label: "Presisi Manufaktur",
    icon: Cog,
    title: "Rancang Bangun Sistem Monitoring Preventif Mesin CNC Berbasis Edge Computing",
    entity: "PT Astra Otoparts",
    category: "skripsi" as ProposalCategory,
    duration: 6
  },
  {
    id: "edukasi",
    label: "Edukasi Adaptif",
    icon: BookOpen,
    title: "Evaluasi Efektivitas Platform Pembelajaran Adaptif Berbasis AI terhadap Retensi Belajar Siswa",
    entity: "Dinas Pendidikan Provinsi",
    category: "skripsi" as ProposalCategory,
    duration: 4
  }
];

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
  onOpenDrive,
  onOpenGuidelineModal,
  onOpenConsultation,
  activeCampusName
}) => {
  const [isAiRecommenderOpen, setIsAiRecommenderOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<TitleRecommendation[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [searchTopic, setSearchTopic] = useState("Informatika & AI");

  const handleFetchAiTitles = async (kw?: string) => {
    const target = kw || searchTopic;
    setIsLoadingRecs(true);
    try {
      const res = await fetch("/api/academic/recommend-titles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: target, mode: "ai-pure" })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
          setRecommendations(data.recommendations);
          setIsLoadingRecs(false);
          return;
        }
      }
    } catch (err) {
      console.warn("API title recommendation fetch error, fallback local:", err);
    }
    const localResults = await getAiTitleRecommendations(target, "ai-pure");
    setRecommendations(localResults);
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

  const handleSelectChip = (chip: typeof TOPIC_CHIPS[0]) => {
    setTitle(chip.title);
    setTargetEntity(chip.entity);
    setCategory(chip.category);
    setDurationMonths(chip.duration);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (title.trim()) {
        onSubmit();
      }
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      // If empty, auto-pick first topic to guide them seamlessly
      const first = TOPIC_CHIPS[0];
      setTitle(first.title);
      setTargetEntity(first.entity);
      setCategory(first.category);
    }
    onSubmit();
  };

  return (
    <div className="flex-1 flex flex-col justify-between max-w-7xl mx-auto w-full px-6 sm:px-12 lg:px-16 py-8 sm:py-14 animate-in fade-in duration-300">
      
      {/* ============================================================ */}
      {/* 1. HERO MAIN STAGE: Text & Input (Left) + 3D Sculpture (Right) */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 w-full my-auto">
        
        {/* Left Column: Headline, Subtitle, and Input Capsule */}
        <div className="w-full lg:max-w-2xl flex flex-col items-start text-left z-10">
          
          {/* Subtle Top Badge "✦ Asisten Penelitian & Penulisan" */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-6 shadow-2xs">
            <svg 
              className="w-3.5 h-3.5 text-zinc-800 dark:text-zinc-200" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
            </svg>
            <span>Asisten Penelitian & Penulisan</span>
          </div>

          {/* Headline (Matching typography & hierarchy of ui-referensi.png) */}
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-zinc-950 dark:text-white leading-[1.12]">
              Perumusan Usulan
            </h1>
            <h2 className="text-3xl sm:text-5xl lg:text-[54px] font-semibold tracking-tight text-zinc-500 dark:text-zinc-400 leading-[1.12]">
              Proposal Akademik
            </h2>
          </div>

          {/* Subtitle Description */}
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 mt-4 max-w-lg leading-relaxed font-normal">
            Ketikkan judul usulan Anda atau pilih inspirasi topik di bawah. Sistem akan memandu wawancara diagnostik sebelum dokumen lengkap disusun.
          </p>

          {/* Hero Input Capsule (Giant rounded-full pill) */}
          <div className="w-full mt-8 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-full p-2 pl-5 pr-2.5 flex items-center gap-3 shadow-md shadow-zinc-200/50 dark:shadow-none hover:border-zinc-300 dark:hover:border-zinc-700 transition-all focus-within:border-zinc-400 dark:focus-within:border-zinc-600 focus-within:ring-2 focus-within:ring-zinc-200/60 dark:focus-within:ring-zinc-800">
            {/* Sparkle Icon */}
            <svg 
              className="w-4 h-4 text-zinc-700 dark:text-zinc-300 flex-shrink-0 ml-1" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
            </svg>

            {/* Input Field */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tulis judul usulan atau deskripsi singkat..."
              className="w-full bg-transparent border-none outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 text-sm sm:text-base font-normal py-2"
            />

            {/* Circular Dark Submit Button with Arrow Right */}
            <button
              type="button"
              onClick={handleSubmit}
              title="Mulai Wawancara Diagnostik"
              className="w-10 h-10 rounded-full bg-[#18181B] dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center hover:scale-105 active:scale-95 transition-all flex-shrink-0 cursor-pointer shadow-sm group"
            >
              <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Topic Inspiration Chips (Horizontal Pills under the Input) */}
          <div className="w-full mt-4 flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {TOPIC_CHIPS.map((chip) => {
              const Icon = chip.icon;
              const isSelected = title === chip.title;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => handleSelectChip(chip)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer group shadow-2xs ${
                    isSelected
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black border border-transparent'
                      : 'bg-white dark:bg-zinc-900/90 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0 opacity-70 group-hover:opacity-100" />
                  <span>{chip.label}</span>
                  <ChevronRight className="w-3 h-3 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              );
            })}
          </div>

        </div>

        {/* Right Column: 3D Ceramic/Pebble Organic Abstract Sculpture (Matching ui-referensi.png) */}
        <div className="hidden lg:flex w-full lg:w-[480px] h-[400px] relative items-center justify-center pointer-events-none select-none">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute inset-0 bg-radial from-zinc-200/50 dark:from-zinc-800/20 via-transparent to-transparent rounded-full blur-2xl" />

          {/* 3D SVG Smooth Porcelain Organic Sculpture */}
          <svg 
            className="w-full h-full drop-shadow-2xl overflow-visible" 
            viewBox="0 0 500 450" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Ceramic Light Gradient 1 */}
              <linearGradient id="pebbleGrad1" x1="120" y1="80" x2="420" y2="380" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="45%" stopColor="#F4F4F3" />
                <stop offset="75%" stopColor="#E2E2DF" />
                <stop offset="100%" stopColor="#C8C8C5" />
              </linearGradient>

              {/* Ceramic Shadow Gradient 2 */}
              <linearGradient id="pebbleGrad2" x1="380" y1="120" x2="160" y2="360" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#EFEFED" />
                <stop offset="50%" stopColor="#DFDFDC" />
                <stop offset="85%" stopColor="#C4C4C0" />
                <stop offset="100%" stopColor="#A8A8A4" />
              </linearGradient>

              {/* Smooth Lighting Rim */}
              <linearGradient id="rimGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#A0A0A0" stopOpacity="0.1" />
              </linearGradient>

              {/* Deep Drop Shadow Filter */}
              <filter id="softShadow" x="-10%" y="-10%" width="130%" height="130%" filterUnits="userSpaceOnUse">
                <feDropShadow dx="-10" dy="25" stdDeviation="28" floodColor="#000000" floodOpacity="0.08" />
              </filter>
            </defs>

            {/* Rear Curved Smooth Disc Shape */}
            <path
              d="M 280 80 C 400 80, 480 160, 450 260 C 420 360, 310 400, 210 370 C 110 340, 160 210, 220 130 C 240 100, 260 80, 280 80 Z"
              fill="url(#pebbleGrad2)"
              filter="url(#softShadow)"
            />

            {/* Front Overlapping Diagonal Porcelain Pebble/Disc */}
            <path
              d="M 360 100 C 440 160, 430 290, 340 350 C 250 410, 140 370, 100 290 C 60 210, 120 120, 220 80 C 280 60, 320 70, 360 100 Z"
              fill="url(#pebbleGrad1)"
              stroke="url(#rimGlow)"
              strokeWidth="1.5"
              filter="url(#softShadow)"
            />

            {/* Subtle Inner Accent Ribbon Contour */}
            <path
              d="M 170 170 Q 280 220 380 240"
              stroke="#D2D2CE"
              strokeWidth="1.2"
              strokeDasharray="4 4"
              opacity="0.5"
            />

            {/* 4-Point Star Sparkle Accent (Top Right) */}
            <path
              d="M 440 80 L 443 95 L 458 98 L 443 101 L 440 116 L 437 101 L 422 98 L 437 95 Z"
              fill="#18181B"
              className="dark:fill-white"
            />
          </svg>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 2. FOOTER ROW: Action Links & Workflow Stage Progress */}
      {/* ============================================================ */}
      <div className="w-full pt-8 mt-6 border-t border-zinc-200/60 dark:border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        
        {/* Left Link: Indexed Research Exploration */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={handleOpenAiRecommender}
            className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer group"
          >
            <TrendingUp className="w-4 h-4 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
            <span className="font-medium">Eksplorasi Ide Judul Riset Terindeks</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Right Link: Campus Guidelines & Formatting */}
          {onOpenGuidelineModal && (
            <button
              type="button"
              onClick={onOpenGuidelineModal}
              className="hidden sm:flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer group"
            >
              <FileText className="w-4 h-4 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
              <span className="font-medium">Lihat Panduan Penulisan Proposal</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>

        {/* Far Right: Clean Workflow Progress Pipeline Indicator */}
        <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400 dark:text-zinc-500 tracking-wider">
          <span>——</span>
          <span>IDE</span>
          <span>→</span>
          <span>RISET</span>
          <span>→</span>
          <span>DAMPAK</span>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 3. AI RESEARCH EXPLORATION SLIDE-OVER MODAL */}
      {/* ============================================================ */}
      {isAiRecommenderOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Eksplorasi Ide Judul Riset Terindeks
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Katalog judul berbasis gap riset akademik aktual dan terindeks
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiRecommenderOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Topic Filter Chips */}
            <div className="px-6 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2 overflow-x-auto scrollbar-none bg-zinc-50/50 dark:bg-zinc-950/30">
              {["Informatika & AI", "Medis & Kesehatan", "Teknik & Manufaktur", "Manajemen & Bisnis", "Pendidikan & Guru"].map((domain) => (
                <button
                  key={domain}
                  onClick={() => {
                    setSearchTopic(domain);
                    handleFetchAiTitles(domain);
                  }}
                  className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors cursor-pointer ${
                    searchTopic === domain
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black font-medium"
                      : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400"
                  }`}
                >
                  {domain}
                </button>
              ))}
            </div>

            {/* Titles List */}
            <div className="p-6 overflow-y-auto space-y-3.5 flex-1">
              {isLoadingRecs ? (
                <div className="py-12 text-center text-xs text-zinc-400 flex flex-col items-center gap-2">
                  <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
                  <span>Memindai literatur dan merumuskan judul riset...</span>
                </div>
              ) : (
                recommendations.map((rec, i) => (
                  <div
                    key={i}
                    onClick={() => handleApplyTitle(rec)}
                    className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 bg-white dark:bg-zinc-900/60 transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                          {rec.category} • {rec.durationMonths} Bulan
                        </span>
                        <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-2 group-hover:text-black dark:group-hover:text-white leading-snug">
                          {rec.title}
                        </h4>
                        <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2">
                          {rec.researchGap || rec.referenceJournal}
                        </p>
                      </div>
                      <button className="px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xs">
                        Pilih Judul
                      </button>
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
