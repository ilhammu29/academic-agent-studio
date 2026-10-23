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
  MessageSquare
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
      {/* 1. HERO MAIN STAGE: Text & Input (Left) + Morphing Slime (Right) */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14 w-full my-auto">
        
        {/* Left Column: Headline, Actions, and Input Capsule */}
        <div className="w-full lg:max-w-2xl flex flex-col items-start text-left z-10">
          
          {/* Subtle Top Badge (Academic Emblem, No generic star) */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-200/80 dark:bg-zinc-900 border border-zinc-300/80 dark:border-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-200 mb-6 shadow-2xs">
            <GraduationCap className="w-4 h-4 text-zinc-800 dark:text-zinc-300 flex-shrink-0" />
            <span>Asisten Perumusan Usulan Akademik</span>
          </div>

          {/* Headline (Matching typography & hierarchy of reference) */}
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-zinc-950 dark:text-white leading-[1.12]">
              Perumusan Usulan
            </h1>
            <h2 className="text-3xl sm:text-5xl lg:text-[54px] font-semibold tracking-tight text-zinc-600 dark:text-zinc-400 leading-[1.12]">
              Proposal Akademik
            </h2>
          </div>

          {/* Subtitle Description */}
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-4 max-w-xl leading-relaxed font-normal">
            Ketikkan judul usulan Anda atau pilih inspirasi topik di bawah. Sistem akan memandu wawancara diagnostik sebelum dokumen lengkap disusun.
          </p>

          {/* PROMINENT QUICK ACTIONS TOOLBAR (AI Generate, Konsultasi, Format Kampus, Parameter) */}
          <div className="w-full mt-6 flex flex-wrap items-center gap-2 text-xs">
            {/* 1. Tombol Rekomendasi Judul (AI) */}
            <button
              type="button"
              onClick={handleOpenAiRecommender}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium transition-all shadow-2xs cursor-pointer group hover:bg-zinc-50 dark:hover:bg-zinc-850"
              title="Cari ide judul akademik terindeks dan gap riset terkini"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
              <span>Rekomendasi Judul AI</span>
            </button>

            {/* 2. Tombol Konsultasi Masalah Magang (AI Mentor) */}
            {onOpenConsultation && (
              <button
                type="button"
                onClick={onOpenConsultation}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 hover:border-emerald-400 text-emerald-800 dark:text-emerald-300 font-medium transition-all shadow-2xs cursor-pointer"
                title="Bimbingan menemukan masalah lapangan dan membedah alur riset"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Konsultasi Ide & Masalah</span>
              </button>
            )}

            {/* 3. Tombol Format Kampus (Scan AI) */}
            {onOpenGuidelineModal && (
              <button
                type="button"
                onClick={onOpenGuidelineModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium transition-all shadow-2xs cursor-pointer"
                title="Pindai PDF panduan kampus atau pilih template format kampus Anda"
              >
                <Landmark className="w-3.5 h-3.5 text-indigo-500" />
                <span>{activeCampusName ? activeCampusName.split("(")[0].trim() : "Format Kampus"}</span>
              </button>
            )}

            {/* 4. Tombol Parameter Instansi & Durasi */}
            <button
              type="button"
              onClick={() => setShowParameters(!showParameters)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium transition-all shadow-2xs cursor-pointer"
            >
              <SlidersHorizontal className="w-3 h-3 text-zinc-500" />
              <span>{showParameters ? "Tutup Parameter" : "Instansi & Durasi"}</span>
              <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${showParameters ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Expandable Parameters Box */}
          {showParameters && (
            <div className="w-full mt-3 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs animate-in fade-in zoom-in-95 duration-150 shadow-sm">
              <div>
                <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Instansi / Tempat Magang
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

          {/* Hero Input Capsule (Giant rounded-full pill) */}
          <div className="w-full mt-4 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-full p-2 pl-4 pr-2.5 flex items-center gap-3 shadow-md shadow-zinc-200/50 dark:shadow-none hover:border-zinc-400 dark:hover:border-zinc-700 transition-all focus-within:border-zinc-500 dark:focus-within:border-zinc-500 focus-within:ring-2 focus-within:ring-zinc-200/60 dark:focus-within:ring-zinc-800">
            {/* AI Idea Quick Trigger Button on Left of input */}
            <button
              type="button"
              onClick={handleOpenAiRecommender}
              title="Buka saran judul AI otomatis"
              className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-amber-500 transition-colors cursor-pointer flex-shrink-0"
            >
              <Lightbulb className="w-4 h-4 text-amber-500" />
            </button>

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

        {/* Right Column: FLUID MORPHING SLIME / BUBBLE ANIMATION (Wave Motion) */}
        <div className="hidden lg:flex w-full lg:w-[460px] h-[400px] relative items-center justify-center pointer-events-none select-none">
          
          {/* 1. Ambient Fluid Ripple Background */}
          <div className="absolute w-72 h-72 rounded-full bg-zinc-300/40 dark:bg-zinc-700/20 blur-3xl animate-slime-pulse" />

          {/* 2. Secondary Floating Fluid Droplet (Wave Motion Behind) */}
          <div 
            style={{
              width: "280px",
              height: "280px",
              background: "radial-gradient(circle at 40% 40%, rgba(255,255,255,0.9) 0%, rgba(220,220,220,0.6) 45%, rgba(180,180,180,0.4) 100%)",
            }}
            className="absolute rounded-full filter blur-sm opacity-60 animate-slime-morph" 
          />

          {/* 3. Primary Organic Morphing Slime / Fluid Bubble */}
          <div 
            style={{
              width: "320px",
              height: "300px",
              background: "radial-gradient(circle at 35% 30%, #FFFFFF 0%, #F1F1EF 35%, #D4D4D0 75%, #A3A39E 100%)",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.18), inset -10px -10px 25px rgba(0,0,0,0.22), inset 12px 12px 25px rgba(255,255,255,0.9)"
            }}
            className="relative animate-slime-morph border border-white/60 flex items-center justify-center transition-all"
          >
            {/* Inner Floating Liquid Core Bubble */}
            <div 
              style={{
                width: "120px",
                height: "110px",
                background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.95) 0%, rgba(240,240,238,0.7) 50%, rgba(200,200,195,0.3) 100%)",
                boxShadow: "inset -4px -4px 10px rgba(0,0,0,0.15), inset 6px 6px 12px rgba(255,255,255,0.9)"
              }}
              className="rounded-full animate-slime-morph opacity-90 filter blur-[0.5px]"
            />

            {/* Specular Glaze Highlight */}
            <div className="absolute top-10 left-12 w-14 h-8 bg-white/70 rounded-full rotate-[-25deg] filter blur-[2px]" />
          </div>

          {/* 4. Small Satellite Bubble Droplet */}
          <div 
            style={{
              width: "55px",
              height: "55px",
              background: "radial-gradient(circle at 35% 35%, #FFFFFF 0%, #E8E8E4 60%, #B8B8B2 100%)",
              boxShadow: "0 10px 20px rgba(0,0,0,0.1), inset -3px -3px 8px rgba(0,0,0,0.2), inset 3px 3px 8px rgba(255,255,255,0.9)"
            }}
            className="absolute top-14 right-10 rounded-full animate-slime-morph"
          />

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
      {/* 3. AI RESEARCH EXPLORATION SLIDE-OVER MODAL                  */}
      {/* ============================================================ */}
      {isAiRecommenderOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Eksplorasi Ide Judul Riset Terindeks
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Katalog judul berbasis gap riset akademik aktual dan terindeks
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiRecommenderOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Topic Filter Chips */}
            <div className="px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2 overflow-x-auto scrollbar-none bg-zinc-50 dark:bg-zinc-950">
              {["Informatika & AI", "Medis & Kesehatan", "Teknik & Manufaktur", "Manajemen & Bisnis", "Pendidikan & Guru"].map((domain) => (
                <button
                  key={domain}
                  onClick={() => {
                    setSearchTopic(domain);
                    handleFetchAiTitles(domain);
                  }}
                  className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors cursor-pointer ${
                    searchTopic === domain
                      ? "bg-zinc-950 text-white dark:bg-zinc-100 dark:text-black font-semibold"
                      : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400"
                  }`}
                >
                  {domain}
                </button>
              ))}
            </div>

            {/* Titles List */}
            <div className="p-6 overflow-y-auto space-y-3.5 flex-1">
              {isLoadingRecs ? (
                <div className="py-12 text-center text-xs text-zinc-500 dark:text-zinc-400 flex flex-col items-center gap-2">
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
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                          {rec.category} • {rec.durationMonths} Bulan
                        </span>
                        <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-2 group-hover:text-black dark:group-hover:text-white leading-snug">
                          {rec.title}
                        </h4>
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
                          {rec.researchGap || rec.referenceJournal}
                        </p>
                      </div>
                      <button className="px-3 py-1.5 rounded-lg bg-zinc-950 dark:bg-zinc-100 text-white dark:text-black text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xs">
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
