"use client";

import React, { useState } from "react";
import { ProposalCategory } from "@/types/studio";
import { 
  ArrowRight, 
  Lightbulb, 
  FileText, 
  Cpu, 
  Package, 
  Cog, 
  BookOpen, 
  TrendingUp, 
  ChevronRight,
  ChevronDown,
  Landmark,
  GraduationCap,
  SlidersHorizontal,
  MessageSquare,
  Search,
  Globe,
  Bot,
  Sparkles,
  Check,
  RefreshCw,
  RotateCcw,
  X
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
  const [showParameters, setShowParameters] = useState(false);
  const [isAiRecommenderOpen, setIsAiRecommenderOpen] = useState(false);
  const [recommenderKeyword, setRecommenderKeyword] = useState("Obesitas");
  const [recommenderTab, setRecommenderTab] = useState<"ai" | "internet">("ai");
  const [aiRecs, setAiRecs] = useState<TitleRecommendation[]>([]);
  const [internetRecs, setInternetRecs] = useState<TitleRecommendation[]>([]);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isLoadingInternet, setIsLoadingInternet] = useState(false);

  const handleFetchRecommendations = async (kw: string) => {
    const target = kw.trim();
    if (!target) return;
    setRecommenderKeyword(target);
    setIsLoadingAi(true);
    setIsLoadingInternet(true);

    // 1. Fetch AI pure recommendations
    (async () => {
      try {
        const res = await fetch("/api/academic/recommend-titles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: target, mode: "ai-pure" })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
            setAiRecs(data.recommendations);
            setIsLoadingAi(false);
            return;
          }
        }
      } catch (e) {
        console.warn("AI title recs error, fallback local:", e);
      }
      const local = await getAiTitleRecommendations(target, "ai-pure");
      setAiRecs(local);
      setIsLoadingAi(false);
    })();

    // 2. Fetch Internet literature recommendations
    (async () => {
      try {
        const res = await fetch("/api/academic/recommend-titles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: target, mode: "literature" })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
            setInternetRecs(data.recommendations);
            setIsLoadingInternet(false);
            return;
          }
        }
      } catch (e) {
        console.warn("Internet title recs error, fallback local:", e);
      }
      const local = await getAiTitleRecommendations(target, "literature");
      setInternetRecs(local);
      setIsLoadingInternet(false);
    })();
  };

  const handleOpenAiRecommender = (initialKw?: string | React.MouseEvent) => {
    const queryToUse = typeof initialKw === "string" && initialKw.trim()
      ? initialKw.trim()
      : title.trim() || recommenderKeyword || "Obesitas";
    setRecommenderKeyword(queryToUse);
    setIsAiRecommenderOpen(true);
    handleFetchRecommendations(queryToUse);
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
      // If user typed a short keyword like "obesitas" or "ai", give them recommendations!
      if (title.trim().length > 0 && title.trim().split(" ").length <= 3) {
        handleOpenAiRecommender(title.trim());
      } else if (title.trim()) {
        onSubmit();
      }
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      const first = TOPIC_CHIPS[0];
      setTitle(first.title);
      setTargetEntity(first.entity);
      setCategory(first.category);
    }
    onSubmit();
  };

  return (
    <div className="flex-1 flex flex-col justify-between max-w-5xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-10 animate-in fade-in duration-300">
      
      {/* ============================================================ */}
      {/* 1. HERO MAIN STAGE: Center-Aligned with Compact Slime Bubble */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col items-center text-center justify-center w-full my-auto z-10">
        
        {/* COMPACT FLUID MORPHING SLIME / BUBBLE (Centered & Scaled Down) */}
        <div className="w-[180px] h-[150px] relative flex items-center justify-center pointer-events-none select-none mb-3">
          {/* Ambient Glow */}
          <div className="absolute w-44 h-44 rounded-full bg-zinc-300/35 dark:bg-zinc-700/20 blur-2xl animate-slime-pulse" />
          
          {/* Secondary Droplet */}
          <div 
            style={{
              width: "150px",
              height: "150px",
              background: "radial-gradient(circle at 40% 40%, rgba(255,255,255,0.85) 0%, rgba(220,220,220,0.5) 50%, rgba(180,180,180,0.3) 100%)",
            }}
            className="absolute rounded-full filter blur-xs opacity-50 animate-slime-morph" 
          />

          {/* Primary Slime Bubble */}
          <div 
            style={{
              width: "160px",
              height: "140px",
              background: "radial-gradient(circle at 35% 30%, #FFFFFF 0%, #F4F4F2 35%, #D4D4D0 75%, #A3A39E 100%)",
              boxShadow: "0 15px 35px -8px rgba(0,0,0,0.15), inset -6px -6px 16px rgba(0,0,0,0.18), inset 8px 8px 16px rgba(255,255,255,0.9)"
            }}
            className="relative animate-slime-morph border border-white/60 flex items-center justify-center transition-all"
          >
            {/* Inner Core */}
            <div 
              style={{
                width: "60px",
                height: "55px",
                background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.95) 0%, rgba(240,240,238,0.7) 50%, rgba(200,200,195,0.3) 100%)",
                boxShadow: "inset -2px -2px 6px rgba(0,0,0,0.12), inset 4px 4px 8px rgba(255,255,255,0.9)"
              }}
              className="rounded-full animate-slime-morph opacity-90 filter blur-[0.5px]"
            />
            {/* Specular Glaze */}
            <div className="absolute top-4 left-6 w-8 h-4 bg-white/70 rounded-full rotate-[-25deg] filter blur-[1px]" />
          </div>

          {/* Small Satellite Droplet */}
          <div 
            style={{
              width: "30px",
              height: "30px",
              background: "radial-gradient(circle at 35% 35%, #FFFFFF 0%, #E8E8E4 60%, #B8B8B2 100%)",
              boxShadow: "0 6px 12px rgba(0,0,0,0.1), inset -2px -2px 5px rgba(0,0,0,0.15), inset 2px 2px 5px rgba(255,255,255,0.9)"
            }}
            className="absolute top-3 right-4 rounded-full animate-slime-morph"
          />
        </div>

        {/* Subtle Top Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 mb-4 shadow-2xs">
          <GraduationCap className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300 flex-shrink-0" />
          <span>OXID Academic Studio • Standar Pedoman Dikti</span>
        </div>

        {/* Centered Headline */}
        <div className="space-y-1 max-w-2xl">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-950 dark:text-white leading-tight">
            Perumusan Usulan Proposal
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-2 max-w-xl mx-auto leading-relaxed font-normal">
            Ketikkan judul usulan Anda atau cari inspirasi topik. Agen AI memandu wawancara diagnostik sebelum naskah proposal terverifikasi disusun.
          </p>
        </div>

        {/* ACTION TOOLBAR: Spacious, neatly grouped with rounded-lg */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
          {/* 1. Generator Judul (AI & Internet) */}
          <button
            type="button"
            onClick={() => handleOpenAiRecommender()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium transition-all shadow-2xs cursor-pointer group hover:bg-zinc-50 dark:hover:bg-zinc-850"
            title="Cari ide judul akademik berbasis penalaran AI dan literatur primer jurnal internasional"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
            <span>Generator Judul (AI & Internet)</span>
          </button>

          {/* 2. AI Mentor & Konsultasi Ide */}
          {onOpenConsultation && (
            <button
              type="button"
              onClick={onOpenConsultation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 hover:border-emerald-400 text-emerald-800 dark:text-emerald-300 font-medium transition-all shadow-2xs cursor-pointer"
              title="Bimbingan interaktif membedah masalah lapangan, novelty, dan alur riset"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>AI Mentor & Konsultasi Ide</span>
            </button>
          )}

          {/* 3. Format Kampus */}
          {onOpenGuidelineModal && (
            <button
              type="button"
              onClick={onOpenGuidelineModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium transition-all shadow-2xs cursor-pointer"
              title="Pindai PDF panduan kampus atau pilih template format kampus Anda"
            >
              <Landmark className="w-3.5 h-3.5 text-indigo-500" />
              <span>{activeCampusName ? activeCampusName.split("(")[0].trim() : "Format Kampus"}</span>
            </button>
          )}

          {/* 4. Parameter Instansi & Durasi */}
          <button
            type="button"
            onClick={() => setShowParameters(!showParameters)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium transition-all shadow-2xs cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
            <span>{showParameters ? "Tutup Parameter" : "Instansi & Durasi"}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${showParameters ? "rotate-180" : ""}`} />
          </button>

          {/* 5. NEW SESSION / RESET BUTTON (Allows user to reset without page refresh) */}
          {(title || targetEntity) && (
            <button
              type="button"
              onClick={() => {
                if (confirm("Mulai sesi baru? Input judul dan parameter saat ini akan dikosongkan.")) {
                  setTitle("");
                  setTargetEntity("");
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium transition-all shadow-2xs cursor-pointer"
              title="Mulai usulan baru / bersihkan formulir input tanpa refresh browser"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
              <span>Sesi Baru</span>
            </button>
          )}
        </div>

        {/* Expandable Parameters Box (Centered) */}
        {showParameters && (
          <div className="w-full max-w-2xl mt-4 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-left animate-in fade-in zoom-in-95 duration-150 shadow-sm">
            <div>
              <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Instansi / Tempat Mitra
              </label>
              <input
                type="text"
                value={targetEntity}
                onChange={(e) => setTargetEntity(e.target.value)}
                placeholder="Contoh: PT Telkom / RS Sardjito"
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 text-xs focus:outline-none focus:border-zinc-400 transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Durasi Kegiatan
              </label>
              <select
                value={durationMonths}
                onChange={(e) => setDurationMonths(Number(e.target.value))}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-zinc-400 transition-colors"
              >
                <option value={1}>1 Bulan (4 Minggu)</option>
                <option value={3}>3 Bulan (12 Minggu - PKL)</option>
                <option value={4}>4 Bulan (16 Minggu - 1 Semester)</option>
                <option value={6}>6 Bulan (MBKM 20 SKS / Skripsi)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Nama Pengusul
              </label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="Nama Lengkap Anda"
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 text-xs focus:outline-none focus:border-zinc-400 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Hero Input Capsule (Centered, Spacious) */}
        <div className="w-full max-w-3xl mt-5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-2xl p-2 pl-4 pr-2.5 flex items-center gap-2.5 shadow-md shadow-zinc-200/50 dark:shadow-none hover:border-zinc-400 dark:hover:border-zinc-700 transition-all focus-within:border-zinc-500 dark:focus-within:border-zinc-500 focus-within:ring-2 focus-within:ring-zinc-200/60 dark:focus-within:ring-zinc-800">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tuliskan judul usulan atau ketik topik (contoh: obesitas, AI, supply chain, fintech)..."
            className="w-full bg-transparent border-none outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 text-sm sm:text-base font-normal py-2 text-left"
          />

          {/* Clear button if text entered */}
          {title && (
            <button
              type="button"
              onClick={() => setTitle("")}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              title="Hapus teks"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Quick Action: Search & Generate Title */}
          <button
            type="button"
            onClick={() => handleOpenAiRecommender(title.trim())}
            title="Generate usulan judul berdasarkan kata kunci ini (AI & Internet)"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 font-medium text-xs transition-colors flex-shrink-0 cursor-pointer shadow-2xs"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Cari Ide Judul</span>
          </button>

          {/* Circular Dark Submit Button with Arrow Right */}
          <button
            type="button"
            onClick={handleSubmit}
            title="Mulai Wawancara Diagnostik"
            className="w-10 h-10 rounded-xl bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center hover:scale-105 active:scale-95 transition-all flex-shrink-0 cursor-pointer shadow-sm group"
          >
            <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Topic Inspiration Chips (Centered, rounded-lg) */}
        <div className="w-full max-w-3xl mt-4 flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none flex-wrap">
          {TOPIC_CHIPS.map((chip) => {
            const Icon = chip.icon;
            const isSelected = title === chip.title;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleSelectChip(chip)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer group shadow-2xs ${
                  isSelected
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black border border-transparent'
                    : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
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

      {/* ============================================================ */}
      {/* 2. FOOTER ROW: Action Links & Workflow Stage Progress        */}
      {/* ============================================================ */}
      <div className="w-full pt-8 mt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        
        {/* Left Link: Indexed Research Exploration */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={handleOpenAiRecommender}
            className="flex items-center gap-2 text-zinc-700 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer group"
          >
            <TrendingUp className="w-4 h-4 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
            <span className="font-semibold">Eksplorasi Ide Judul Riset Terindeks</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Right Link: Campus Guidelines & Formatting */}
          {onOpenGuidelineModal && (
            <button
              type="button"
              onClick={onOpenGuidelineModal}
              className="hidden sm:flex items-center gap-2 text-zinc-700 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer group"
            >
              <FileText className="w-4 h-4 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
              <span className="font-semibold">Lihat Panduan Penulisan Proposal</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>

        {/* Far Right: Clean Workflow Progress Pipeline Indicator */}
        <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500 dark:text-zinc-400 tracking-wider">
          <span>——</span>
          <span>IDE</span>
          <span>→</span>
          <span>RISET</span>
          <span>→</span>
          <span>DAMPAK</span>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 3. DUAL-ENGINE TITLE GENERATOR MODAL (AI + LIVE INTERNET)    */}
      {/* ============================================================ */}
      {isAiRecommenderOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/80 dark:bg-zinc-950/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 flex items-center justify-center text-amber-700 dark:text-amber-400">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <span>Generator Rekomendasi Judul Proposal</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      DUAL ENGINE
                    </span>
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Hasilkan usulan judul berbasis penalaran AI cerdas atau sumber jurnal riil dari internet
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAiRecommenderOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Keyword Input Box & Quick Presets */}
            <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={recommenderKeyword}
                    onChange={(e) => setRecommenderKeyword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleFetchRecommendations(recommenderKeyword);
                      }
                    }}
                    placeholder="Ketik topik atau kata kunci usulan (misal: obesitas, AI, IoT, supply chain, stunting, fintech)..."
                    className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:border-zinc-500 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 font-sans shadow-inner"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleFetchRecommendations(recommenderKeyword)}
                  disabled={isLoadingAi || isLoadingInternet || !recommenderKeyword.trim()}
                  className="px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-40 whitespace-nowrap transition-all"
                >
                  {isLoadingAi || isLoadingInternet ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>Generate Judul</span>
                </button>
              </div>

              {/* Quick Keyword Preset Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
                <span className="text-[11px] font-mono text-zinc-400 whitespace-nowrap mr-1">
                  Preset Cepat:
                </span>
                {[
                  "Obesitas & Gizi",
                  "Kecerdasan Buatan (AI)",
                  "IoT & Triase Medis",
                  "Supply Chain Retail",
                  "Fintech & Perbankan",
                  "Pendidikan Adaptif"
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      setRecommenderKeyword(chip);
                      handleFetchRecommendations(chip);
                    }}
                    className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 whitespace-nowrap text-[11px] font-medium transition-colors cursor-pointer shadow-2xs"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* TWO OUTPUT TABS: 1. Penalaran AI vs 2. Sumber Internet Riil */}
            <div className="px-6 pt-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setRecommenderTab("ai")}
                className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                  recommenderTab === "ai"
                    ? "border-zinc-950 dark:border-zinc-100 text-zinc-950 dark:text-zinc-100"
                    : "border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400"
                }`}
              >
                <Bot className="w-4 h-4 text-indigo-500" />
                <span>1. Rekomendasi Berdasarkan AI</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {aiRecs.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRecommenderTab("internet")}
                className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                  recommenderTab === "internet"
                    ? "border-zinc-950 dark:border-zinc-100 text-zinc-950 dark:text-zinc-100"
                    : "border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400"
                }`}
              >
                <Globe className="w-4 h-4 text-emerald-500" />
                <span>2. Berdasarkan Sumber Internet (Jurnal Ilmiah Riil)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {internetRecs.length}
                </span>
              </button>
            </div>

            {/* Recommendations List Container */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-3.5 flex-1">
              {/* Tab 1: AI Reasoned Titles */}
              {recommenderTab === "ai" && (
                <>
                  {isLoadingAi ? (
                    <div className="py-14 text-center text-xs text-zinc-500 dark:text-zinc-400 flex flex-col items-center gap-2.5">
                      <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
                      <span className="font-medium">Merumuskan usulan judul berbasis penalaran AI Gemini (First-Principles)...</span>
                    </div>
                  ) : aiRecs.length === 0 ? (
                    <div className="py-12 text-center text-xs text-zinc-400">
                      Ketik topik di atas lalu klik <strong>Generate Judul</strong>.
                    </div>
                  ) : (
                    aiRecs.map((rec, i) => (
                      <div
                        key={rec.id || i}
                        className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900/70 transition-all shadow-2xs group"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex-1 space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                                {rec.category.toUpperCase()} • {rec.durationMonths} BULAN
                              </span>
                              {rec.thinkingMode && (
                                <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-900">
                                  {rec.thinkingMode}
                                </span>
                              )}
                            </div>

                            <h4 className="text-xs sm:text-sm font-serif font-bold text-zinc-950 dark:text-zinc-50 leading-snug">
                              {rec.title}
                            </h4>

                            <div className="text-[11px] text-zinc-600 dark:text-zinc-400 space-y-0.5 pt-1">
                              <p><strong>Lokus Rekomendasi:</strong> {rec.entity}</p>
                              <p className="line-clamp-2"><strong>Celah Masalah (Gap):</strong> {rec.researchGap}</p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleApplyTitle(rec)}
                            className="px-3.5 py-2 rounded-lg bg-zinc-950 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 text-xs font-semibold whitespace-nowrap transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer self-end sm:self-center"
                          >
                            <span>Gunakan Judul Ini</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              {/* Tab 2: Live Internet / Journal Grounded Titles */}
              {recommenderTab === "internet" && (
                <>
                  {isLoadingInternet ? (
                    <div className="py-14 text-center text-xs text-zinc-500 dark:text-zinc-400 flex flex-col items-center gap-2.5">
                      <div className="w-6 h-6 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" />
                      <span className="font-medium">Memindai literatur jurnal ilmiah riil dari internet (OpenAlex & CrossRef)...</span>
                    </div>
                  ) : internetRecs.length === 0 ? (
                    <div className="py-12 text-center text-xs text-zinc-400">
                      Ketik topik di atas lalu klik <strong>Generate Judul</strong>.
                    </div>
                  ) : (
                    internetRecs.map((rec, i) => (
                      <div
                        key={rec.id || i}
                        className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-600 bg-white dark:bg-zinc-900/70 transition-all shadow-2xs group"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex-1 space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                {rec.category.toUpperCase()} • {rec.durationMonths} BULAN
                              </span>
                              <span className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                                🌐 {rec.referenceJournal}
                              </span>
                            </div>

                            <h4 className="text-xs sm:text-sm font-serif font-bold text-zinc-950 dark:text-zinc-50 leading-snug">
                              {rec.title}
                            </h4>

                            <div className="text-[11px] text-zinc-600 dark:text-zinc-400 space-y-0.5 pt-1">
                              <p><strong>Lokus Rekomendasi:</strong> {rec.entity}</p>
                              <p className="line-clamp-2"><strong>Landasan Riset:</strong> {rec.researchGap}</p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleApplyTitle(rec)}
                            className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold whitespace-nowrap transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer self-end sm:self-center"
                          >
                            <span>Gunakan Judul Ini</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
              <span>*Judul yang dipilih akan langsung otomatis mengisi usulan Anda di beranda</span>
              <button
                type="button"
                onClick={() => setIsAiRecommenderOpen(false)}
                className="px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
