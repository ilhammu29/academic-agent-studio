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
  Check,
  BookOpen,
  Cpu,
  Landmark
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

const POPULAR_DOMAINS = [
  "Informatika & AI",
  "Medis & Kesehatan",
  "Teknik & Manufaktur",
  "Manajemen & Bisnis",
  "Pendidikan & Guru",
  "Pertanian & Pangan",
  "Hukum & Kebijakan"
];

const QUICK_TOPIC_TEMPLATES = [
  {
    label: "🤖 AI & RAG",
    title: "Implementasi Retrieval-Augmented Generation (RAG) untuk Akselerasi Manajemen Pengetahuan Akademik",
    entity: "PT Telekomunikasi Indonesia",
    category: "skripsi" as ProposalCategory,
    duration: 6
  },
  {
    label: "🏥 Triase Medis IoT",
    title: "Analisis Efektivitas Sistem Triase Berbasis IoT dan Machine Learning pada Instalasi Gawat Darurat",
    entity: "RSUP Dr. Sardjito",
    category: "skripsi" as ProposalCategory,
    duration: 6
  },
  {
    label: "💼 Supply Chain Retail",
    title: "Optimasi Efisiensi Distribusi Rantai Pasok Retail Menggunakan Predictive Analytics",
    entity: "PT Unilever Indonesia",
    category: "magang" as ProposalCategory,
    duration: 4
  },
  {
    label: "⚙️ Presisi Manufaktur",
    title: "Rancang Bangun Sistem Monitoring Preventif Mesin CNC Berbasis Edge Computing",
    entity: "PT Astra Otoparts",
    category: "skripsi" as ProposalCategory,
    duration: 6
  },
  {
    label: "📚 Edukasi Adaptif",
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
  const [showConfig, setShowConfig] = useState(false);
  const [isAiRecommenderOpen, setIsAiRecommenderOpen] = useState(false);
  const [keywordInput, setKeywordInput] = useState("");
  const [activeSearchTopic, setActiveSearchTopic] = useState("Informatika & AI");
  const [recommendations, setRecommendations] = useState<TitleRecommendation[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [papersCount, setPapersCount] = useState<number | null>(null);
  const [recommenderMode, setRecommenderMode] = useState<"ai-pure" | "literature">("ai-pure");

  const handleFetchAiTitles = async (kw?: string, targetMode?: "ai-pure" | "literature") => {
    const target = (kw !== undefined ? kw : keywordInput).trim() || "Informatika & AI";
    const mode = targetMode || recommenderMode;
    setIsLoadingRecs(true);
    setActiveSearchTopic(target);
    setKeywordInput(target);

    try {
      const res = await fetch("/api/academic/recommend-titles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: target, mode })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
          setRecommendations(data.recommendations);
          setPapersCount(data.papersCount || null);
          setIsLoadingRecs(false);
          return;
        }
      }
    } catch (err) {
      console.warn("API title recommendation fetch error, running local fallback:", err);
    }

    const localResults = await getAiTitleRecommendations(target, mode);
    setRecommendations(localResults);
    setPapersCount(localResults.length);
    setIsLoadingRecs(false);
  };

  const handleOpenAiRecommender = () => {
    setIsAiRecommenderOpen(true);
    if (recommendations.length === 0) {
      handleFetchAiTitles("Informatika & AI", recommenderMode);
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
        <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">
          Perumusan Usulan Proposal Akademik
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 max-w-lg mx-auto leading-relaxed">
          Ketikkan judul usulan Anda atau pilih inspirasi topik di bawah. Sistem akan memandu wawancara diagnostik sebelum dokumen lengkap disusun.
        </p>
      </div>

      {/* 2. Sleek Command Input Surface (Light & Dark Adaptive) */}
      <div className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3.5 sm:p-4.5 transition-all focus-within:border-zinc-400 dark:focus-within:border-zinc-500 shadow-sm dark:shadow-2xl mb-4">
        
        {/* Top Action Row inside input */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-100 dark:border-zinc-900 text-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleOpenAiRecommender}
              className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="underline underline-offset-4 decoration-zinc-300 dark:decoration-zinc-700 hover:decoration-black dark:hover:decoration-white font-medium">
                Rekomendasi Judul (AI)
              </span>
            </button>

            {onOpenConsultation && (
              <button
                type="button"
                onClick={onOpenConsultation}
                className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200 transition-colors cursor-pointer text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 shadow-2xs"
                title="Bimbingan & Konsultasi Menemukan Masalah Lapangan dan Merumuskan Alur"
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                <span>Konsultasi Ide & Masalah</span>
              </button>
            )}

            {onOpenGuidelineModal && (
              <button
                type="button"
                onClick={onOpenGuidelineModal}
                className="hidden sm:flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors cursor-pointer text-xs font-medium"
                title="Pindai PDF atau pilih preset format kampus Anda"
              >
                <Landmark className="w-3.5 h-3.5 text-indigo-500" />
                <span className="underline underline-offset-4 decoration-indigo-300 dark:decoration-indigo-700">
                  {activeCampusName ? `Format: ${activeCampusName.split("(")[0].trim()}` : "Format Kampus (Scan AI)"}
                </span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>{showConfig ? "Tutup Parameter" : "Instansi & Durasi"}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showConfig ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Expandable Parameters */}
        {showConfig && (
          <div className="py-3 mb-3 border-b border-zinc-100 dark:border-zinc-900 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs animate-in fade-in duration-150">
            <div>
              <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-1">
                Instansi Mitra / Kampus
              </label>
              <input
                type="text"
                value={targetEntity}
                onChange={(e) => setTargetEntity(e.target.value)}
                placeholder="Contoh: PT Telkom / RS Sardjito"
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-1">
                Durasi Kegiatan
              </label>
              <select
                value={durationMonths}
                onChange={(e) => setDurationMonths(Number(e.target.value))}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
              >
                <option value={1}>1 Bulan (4 Minggu)</option>
                <option value={3}>3 Bulan (12 Minggu - PKL)</option>
                <option value={4}>4 Bulan (16 Minggu - 1 Semester)</option>
                <option value={6}>6 Bulan (MBKM 20 SKS / Skripsi)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-1">
                Nama Pengusul
              </label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="Nama Lengkap Anda"
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
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
            className="w-full bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-sm sm:text-base focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Bottom Control Bar */}
        <div className="flex items-center justify-between pt-3 mt-1 border-t border-zinc-100 dark:border-zinc-900">
          {/* Category Tabs */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCategory("magang")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                category === "magang"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black font-semibold shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
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
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black font-semibold shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
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
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black font-semibold shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Penelitian</span>
            </button>
          </div>

          {/* Submit Action */}
          <button
            type="button"
            onClick={onSubmit}
            disabled={!title.trim()}
            title="Lanjut ke Wawancara Diagnostik"
            className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-black text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-black active:scale-95 disabled:opacity-20 disabled:pointer-events-none flex items-center justify-center transition-all cursor-pointer flex-shrink-0 shadow-xs"
          >
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Quick Topic Starter Chips */}
      <div className="w-full mb-4">
        <div className="flex items-center gap-1.5 mb-2 px-1 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
          <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
          <span>Inspirasi Topik Cepat (1-Klik Terapkan):</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {QUICK_TOPIC_TEMPLATES.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setTitle(item.title);
                setTargetEntity(item.entity);
                setCategory(item.category);
                setDurationMonths(item.duration);
              }}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 whitespace-nowrap transition-all cursor-pointer shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 active:scale-95"
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2.5 BANNER KLINIK KONSULTASI MASALAH & ALUR */}
      {onOpenConsultation && (
        <div className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-white to-indigo-50/80 dark:from-emerald-950/25 dark:via-zinc-900/60 dark:to-indigo-950/25 border border-emerald-200/80 dark:border-emerald-900/50 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm">
                Bingung Menemukan Masalah di Tempat Magang atau Alur Metodologinya?
              </h4>
              <p className="text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                Konsultasikan langsung dengan AI Mentor. Temukan 3 celah masalah operasional riil, rumusan judul berbobot, dan peta alur kerja siap pakai.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenConsultation}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
          >
            <span>Mulai Konsultasi Gratis</span>
            <ArrowUp className="w-3.5 h-3.5 rotate-45" />
          </button>
        </div>
      )}

      {/* 3. Sleek Quick Links */}
      <div className="w-full flex items-center justify-between text-xs text-zinc-500 px-1 flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          {onOpenConsultation && (
            <button
              type="button"
              onClick={onOpenConsultation}
              className="text-emerald-600 dark:text-emerald-400 hover:underline transition-colors flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
              <span>Klinik Bimbingan Masalah (AI Mentor)</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleOpenAiRecommender}
            className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
            <span>Eksplorasi Ide Judul Riset Terindeks</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {onOpenGuidelineModal && (
            <button
              type="button"
              onClick={onOpenGuidelineModal}
              className="text-indigo-600 dark:text-indigo-400 hover:underline transition-colors flex items-center gap-1.5 cursor-pointer text-xs font-medium"
            >
              <Landmark className="w-3.5 h-3.5 text-indigo-500" />
              <span>Pindai PDF Pedoman Kampus (AI)</span>
            </button>
          )}

          {onOpenDrive && (
            <button
              type="button"
              onClick={onOpenDrive}
              className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <FolderKanban className="w-3.5 h-3.5 text-zinc-400" />
              <span>Buka Drive Penyimpanan</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. MODAL: REKOMENDASI JUDUL ILMIAH */}
      {isAiRecommenderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
            
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-zinc-900 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-zinc-300" />
                  <h3 className="text-sm font-semibold text-zinc-100">
                    Generator Rekomendasi Judul Proposal
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {recommenderMode === "ai-pure" 
                    ? "Mode Murni AI: Merumuskan judul yang alami dan presisi sesuai rumpun ilmunya" 
                    : "Mode Literatur: Menautkan judul dengan publikasi terindeks OpenAlex & Crossref"}
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

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1.5 bg-zinc-900/60 border-b border-zinc-900 text-xs gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setRecommenderMode("ai-pure");
                  handleFetchAiTitles(keywordInput, "ai-pure");
                }}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg font-medium transition-colors cursor-pointer ${
                  recommenderMode === "ai-pure"
                    ? "bg-zinc-100 text-black shadow-sm font-semibold"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Smart Generator (Murni AI)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRecommenderMode("literature");
                  handleFetchAiTitles(keywordInput, "literature");
                }}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg font-medium transition-colors cursor-pointer ${
                  recommenderMode === "literature"
                    ? "bg-zinc-100 text-black shadow-sm font-semibold"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Berbasis Literatur Jurnal & DOI</span>
              </button>
            </div>

            {/* Keyword Input & Search Controls */}
            <div className="p-4 border-b border-zinc-900 bg-zinc-950/70 space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleFetchAiTitles()}
                    placeholder={
                      recommenderMode === "ai-pure"
                        ? "Ketik topik/bidang Anda (misal: Obesitas Remaja, Pemasaran UMKM, Kurikulum Merdeka)..."
                        : "Ketik kata kunci pencarian jurnal (misal: Deep Learning, Pertanian Organik, Pidana Siber)..."
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleFetchAiTitles()}
                  disabled={isLoadingRecs}
                  className="py-2 px-4 rounded-lg bg-zinc-100 hover:bg-white text-black font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 shadow-sm"
                >
                  {isLoadingRecs ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Merumuskan...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" /> Rumuskan
                    </>
                  )}
                </button>
              </div>

              {/* Quick Domain Topic Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                <span className="text-zinc-500 text-[10px] uppercase font-mono mr-1 flex-shrink-0">Pilihan Cepat:</span>
                {POPULAR_DOMAINS.map((domain, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleFetchAiTitles(domain)}
                    className={`px-2.5 py-1 rounded-full border text-[11px] whitespace-nowrap transition-colors cursor-pointer ${
                      activeSearchTopic === domain
                        ? "bg-zinc-100 text-black border-zinc-100 font-medium"
                        : "bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-zinc-800"
                    }`}
                  >
                    {domain}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Header / Status Bar */}
            <div className="px-5 py-2.5 bg-zinc-900/30 border-b border-zinc-900 flex items-center justify-between text-xs text-zinc-400">
              <span className="truncate">
                Topik: <span className="text-zinc-200 font-medium">{activeSearchTopic}</span>
                <span className="ml-2 text-[10px] text-zinc-500 font-mono">
                  ({recommenderMode === "ai-pure" ? "Mode: AI Murni" : "Mode: Literatur Jurnal"})
                </span>
              </span>
              <span className="text-[11px] font-mono text-zinc-500 flex-shrink-0">
                {isLoadingRecs ? "Sedang memproses..." : `${recommendations.length} Usulan Terverifikasi`}
              </span>
            </div>

            {/* Recommendations List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-zinc-900">
              {isLoadingRecs ? (
                <div className="py-14 text-center text-zinc-400 text-xs flex flex-col items-center justify-center gap-2.5">
                  <RefreshCw className="w-5 h-5 animate-spin text-zinc-300" />
                  <span>
                    {recommenderMode === "ai-pure"
                      ? "AI Gemini sedang menganalisis topik dan merumuskan usulan proposal akademik..."
                      : "Menelusuri database OpenAlex & Crossref dan merumuskan usulan berbasis jurnal..."}
                  </span>
                </div>
              ) : recommendations.length === 0 ? (
                <div className="py-14 text-center text-zinc-500 text-xs">
                  Tidak ada rekomendasi ditemukan. Coba ketikkan kata kunci lain di atas.
                </div>
              ) : (
                recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="pt-3.5 first:pt-0 group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                            {rec.category.toUpperCase()}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500">
                            {rec.thinkingMode}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-medium text-zinc-100 leading-snug group-hover:text-white transition-colors">
                          {rec.title}
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleApplyTitle(rec)}
                        className="py-1.5 px-3 rounded-lg bg-zinc-100 hover:bg-white text-black font-semibold text-xs transition-colors flex-shrink-0 cursor-pointer shadow-sm"
                      >
                        Pilih Judul
                      </button>
                    </div>

                    <div className="p-2.5 rounded bg-zinc-900/40 border border-zinc-900 mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-0.5">
                        Celah Riset / Urgensi Masalah:
                      </span>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        {rec.researchGap}
                      </p>
                    </div>

                    <div className="text-[11px] text-zinc-400 grid grid-cols-1 sm:grid-cols-2 gap-1 font-sans">
                      <div>
                        <span className="text-zinc-500">Target Instansi / Mitra:</span> {rec.entity} ({rec.durationMonths} Bulan)
                      </div>
                      <div className="truncate">
                        <span className="text-zinc-500">Rujukan:</span> {rec.referenceJournal}
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
