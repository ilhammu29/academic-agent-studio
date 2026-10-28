"use client";
import { aiFetch } from "@/lib/aiClient";

import React, { useState, useEffect } from "react";
import { ProposalCategory, ReportType, ProposalDocument, StudioStage } from "@/types/studio";
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
  X,
  Plus,
  FolderOpen,
  Clock,
  Presentation,
  ShieldCheck,
  Layers,
  Database
} from "lucide-react";
import { TitleRecommendation, getAiTitleRecommendations } from "@/lib/titleGenerator";
import { getSavedProjects, SavedProjectRecord } from "@/lib/supabase";
import { ACADEMIC_TEMPLATES, AcademicDocumentTemplate } from "@/lib/documentTemplates.ts";

interface HeroInputViewProps {
  category: ProposalCategory;
  setCategory: (c: ProposalCategory) => void;
  reportType?: ReportType;
  setReportType?: (r: ReportType) => void;
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
  targetDepthPages?: number;
  setTargetDepthPages?: (p: number) => void;
  onSubmit: () => void;
  onOpenDatabase?: () => void;
  onOpenDrive?: () => void;
  onOpenGuidelineModal?: () => void;
  onOpenConsultation?: () => void;
  activeCampusName?: string;
  activeDoc?: ProposalDocument | null;
  onNavigateStage?: (stage: StudioStage) => void;
  onLoadProject?: (project: SavedProjectRecord) => void;
}

const TOPIC_CHIPS = [
  {
    id: "ai-rag",
    label: "AI & RAG",
    icon: FileText,
    title: "Implementasi Retrieval-Augmented Generation (RAG) untuk Akselerasi Manajemen Pengetahuan Akademik",
    entity: "PT Telekomunikasi Indonesia",
    category: "skripsi" as ProposalCategory,
    reportType: "skripsi" as ReportType,
    duration: 6
  },
  {
    id: "iot-medis",
    label: "Triase Medis IoT",
    icon: Cpu,
    title: "Analisis Efektivitas Sistem Triase Berbasis IoT dan Machine Learning pada Instalasi Gawat Darurat",
    entity: "RSUP Dr. Sardjito",
    category: "skripsi" as ProposalCategory,
    reportType: "skripsi" as ReportType,
    duration: 6
  },
  {
    id: "supply-chain",
    label: "Supply Chain Retail",
    icon: Package,
    title: "Optimasi Efisiensi Distribusi Rantai Pasok Retail Menggunakan Predictive Analytics",
    entity: "PT Unilever Indonesia",
    category: "magang" as ProposalCategory,
    reportType: "magang" as ReportType,
    duration: 4
  },
  {
    id: "manufaktur",
    label: "Presisi Manufaktur",
    icon: Cog,
    title: "Rancang Bangun Sistem Monitoring Preventif Mesin CNC Berbasis Edge Computing",
    entity: "PT Astra Otoparts",
    category: "skripsi" as ProposalCategory,
    reportType: "tugas_akhir" as ReportType,
    duration: 6
  },
  {
    id: "edukasi",
    label: "Edukasi Adaptif",
    icon: BookOpen,
    title: "Evaluasi Efektivitas Platform Pembelajaran Adaptif Berbasis AI terhadap Retensi Belajar Siswa",
    entity: "Dinas Pendidikan Provinsi",
    category: "penelitian" as ProposalCategory,
    reportType: "penelitian" as ReportType,
    duration: 4
  }
];

export const HeroInputView: React.FC<HeroInputViewProps> = ({
  category,
  setCategory,
  reportType,
  setReportType,
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
  targetDepthPages = 45,
  setTargetDepthPages,
  onSubmit,
  onOpenDatabase,
  onOpenDrive,
  onOpenGuidelineModal,
  onOpenConsultation,
  activeCampusName,
  activeDoc,
  onNavigateStage,
  onLoadProject
}) => {
  // Expandable parameter & template drawer state
  const [showParameters, setShowParameters] = useState(false);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>("proposal_skripsi");

  // Dual-Engine Title Generator Modal State
  const [isAiRecommenderOpen, setIsAiRecommenderOpen] = useState(false);
  const [recommenderKeyword, setRecommenderKeyword] = useState("Kecerdasan Buatan");
  const [recommenderTab, setRecommenderTab] = useState<"ai" | "internet">("ai");
  const [aiRecs, setAiRecs] = useState<TitleRecommendation[]>([]);
  const [internetRecs, setInternetRecs] = useState<TitleRecommendation[]>([]);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isLoadingInternet, setIsLoadingInternet] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [internetMessage, setInternetMessage] = useState("");

  // Recent Projects from Supabase / LocalStorage
  const [recentProjects, setRecentProjects] = useState<SavedProjectRecord[]>([]);

  // Load recent projects for quick access
  useEffect(() => {
    let isMounted = true;
    getSavedProjects()
      .then((records) => {
        if (isMounted) {
          setRecentProjects(records.slice(0, 5));
        }
      })
      .catch((e) => console.warn("Failed to load recent projects:", e));
    return () => {
      isMounted = false;
    };
  }, []);

  const handleFetchRecommendations = async (kw: string) => {
    const target = kw.trim();
    if (!target) return;
    setRecommenderKeyword(target);
    setIsLoadingAi(true);
    setIsLoadingInternet(true);
    setAiMessage("");
    setInternetMessage("");
    setAiRecs([]);
    setInternetRecs([]);

    // 1. Fetch AI pure recommendations
    (async () => {
      try {
        const res = await aiFetch("/api/academic/recommend-titles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: target, mode: "ai-pure" })
        });
        const data = await res.json();
        if (res.ok) {
          if (data.success && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
            setAiMessage(data.engine === "domain-aware-synthesizer" ? "Gemini belum tersedia. Berikut contoh judul lokal; periksa dan sesuaikan sebelum digunakan." : "Saran dibuat dengan Gemini. Periksa judul, data, dan referensi sebelum digunakan.");
            setAiRecs(data.recommendations);
            setIsLoadingAi(false);
            return;
          }
        }
        setAiMessage(data.error || "Judul belum dapat dibuat. Periksa pengaturan AI lalu coba lagi.");
      } catch (e) {
        setAiMessage("Tidak dapat menghubungi layanan judul. Periksa koneksi lalu coba lagi.");
        console.warn("AI title recs error:", e);
      }
      setAiRecs([]);
      setIsLoadingAi(false);
    })();

    // 2. Fetch Internet literature recommendations
    (async () => {
      try {
        const res = await aiFetch("/api/academic/recommend-titles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: target, mode: "literature" })
        });
        const data = await res.json();
        if (res.ok) {
          if (data.success && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
            setInternetMessage("Saran berbasis hasil pencarian; periksa kecocokan setiap publikasi dan referensi.");
            setInternetRecs(data.recommendations);
            setIsLoadingInternet(false);
            return;
          }
        }
        setInternetMessage(data.error || "Pencarian literatur belum tersedia. Coba lagi.");
      } catch (e) {
        setInternetMessage("Tidak dapat menghubungi pencarian literatur. Periksa koneksi lalu coba lagi.");
        console.warn("Internet title recs error:", e);
      }
      setInternetRecs([]);
      setIsLoadingInternet(false);
    })();
  };

  const handleOpenAiRecommender = (seedQuery?: string) => {
    const queryToUse = seedQuery || title.trim() || "Kecerdasan Buatan";
    setRecommenderKeyword(queryToUse);
    setIsAiRecommenderOpen(true);
    handleFetchRecommendations(queryToUse);
  };

  const handleApplyTitle = (rec: TitleRecommendation) => {
    setTitle(rec.title);
    setCategory(rec.category);
    setTargetEntity(rec.entity);
    setDurationMonths(rec.durationMonths);
    if (setReportType) {
      setReportType(rec.category === "magang" ? "magang" : rec.category === "penelitian" ? "penelitian" : "skripsi");
    }
    setIsAiRecommenderOpen(false);
  };

  const handleSelectTemplate = (key: string, tpl: AcademicDocumentTemplate) => {
    setSelectedTemplateKey(key);
    setCategory(tpl.category);
    if (setReportType) {
      setReportType(tpl.reportType);
    }
    if (setTargetDepthPages && tpl.targetDepthPagesDefault) {
      setTargetDepthPages(tpl.targetDepthPagesDefault);
    }
  };

  const handleSelectChip = (chip: typeof TOPIC_CHIPS[0]) => {
    setTitle(chip.title);
    setTargetEntity(chip.entity);
    setCategory(chip.category);
    setDurationMonths(chip.duration);
    if (setReportType && chip.reportType) {
      setReportType(chip.reportType);
    }
    if (setTargetDepthPages) {
      setTargetDepthPages(chip.category === "magang" ? 25 : 45);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // If user typed a short keyword like "obesitas" or "ai", give them recommendations
      if (title.trim().length > 0 && title.trim().split(" ").length <= 3) {
        handleOpenAiRecommender(title.trim());
      } else if (title.trim()) {
        onSubmit();
      }
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      alert("Harap tentukan judul proposal terlebih dahulu.");
      return;
    }
    onSubmit();
  };

  return (
    <div className="flex-1 flex flex-col justify-between max-w-5xl mx-auto w-full px-4 sm:px-8 py-5 sm:py-7 animate-in fade-in duration-300 text-[#0F172A] dark:text-[#F3F6FC]">
      
      {/* ============================================================ */}
      {/* TOP ENHANCEMENT: ACTIVE WORK-IN-PROGRESS QUICK RESUME BAR    */}
      {/* ============================================================ */}
      {activeDoc && (
        <div className="w-full mb-4 p-3 sm:p-3.5 rounded-xl bg-white dark:bg-[#17181C] border border-[#CBD5E1] dark:border-[#26282E] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
            <div className="w-8 h-8 rounded-lg bg-[#7C9CFF]/15 border border-[#7C9CFF]/30 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-[#7C9CFF]" />
            </div>
            <div className="min-w-0 text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#7C9CFF]/10 text-[#7C9CFF] border border-[#7C9CFF]/20">
                  DOKUMEN AKTIF • {activeDoc.category.toUpperCase()}
                </span>
                <span className="text-[11px] text-[#64748B] dark:text-[#9CA3AF]">
                  ~{activeDoc.targetDepthPages || 25} Halaman
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-[#F3F6FC] truncate max-w-xl">
                {activeDoc.title}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {onNavigateStage && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigateStage("result")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F172A] dark:bg-[#7C9CFF] text-white dark:text-[#0C0D0E] hover:bg-black dark:hover:bg-[#9B8CFF] text-xs font-semibold transition-all shadow-xs cursor-pointer"
                >
                  <span>Buka Dokumen Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateStage("slides")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F1F5F9] dark:bg-[#1E1F24] hover:bg-[#E2E8F0] dark:hover:bg-[#25262C] text-[#0F172A] dark:text-[#F3F6FC] border border-[#CBD5E1] dark:border-[#26282E] text-xs font-medium transition-all shadow-2xs cursor-pointer"
                  title="Buka Slide Sidang PPTX"
                >
                  <Presentation className="w-3.5 h-3.5 text-[#9B8CFF]" />
                  <span className="hidden sm:inline">Slide Sidang</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. HERO MAIN STAGE: Center-Aligned with Compact Slime Bubble */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col items-center text-center justify-center w-full my-auto z-10 py-3 sm:py-5">
        
        {/* COMPACT FLUID MORPHING SLIME / BUBBLE (Centered & Scaled) */}
        <div className="w-[180px] h-[150px] relative flex items-center justify-center pointer-events-none select-none mb-3">
          {/* Ambient Glow */}
          <div className="absolute w-44 h-44 rounded-full bg-blue-500/15 dark:bg-[#7C9CFF]/15 blur-2xl animate-slime-pulse" />
          
          {/* Secondary Droplet */}
          <div 
            style={{
              width: "150px",
              height: "150px",
              background: "radial-gradient(circle at 40% 40%, rgba(255,255,255,0.85) 0%, rgba(200,215,255,0.4) 50%, rgba(140,170,255,0.2) 100%)",
            }}
            className="absolute rounded-full filter blur-xs opacity-50 animate-slime-morph" 
          />

          {/* Primary Slime Bubble */}
          <div 
            style={{
              width: "160px",
              height: "140px",
              background: "radial-gradient(circle at 35% 30%, #FFFFFF 0%, #F1F5F9 35%, #CBD5E1 75%, #94A3B8 100%)",
              boxShadow: "0 15px 35px -8px rgba(0,0,0,0.2), inset -6px -6px 16px rgba(0,0,0,0.18), inset 8px 8px 16px rgba(255,255,255,0.9)"
            }}
            className="relative animate-slime-morph border border-white/60 dark:border-white/20 flex items-center justify-center transition-all"
          >
            {/* Inner Core */}
            <div 
              style={{
                width: "60px",
                height: "55px",
                background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.95) 0%, rgba(225,235,255,0.7) 50%, rgba(180,205,255,0.3) 100%)",
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
              background: "radial-gradient(circle at 35% 35%, #FFFFFF 0%, #E2E8F0 60%, #94A3B8 100%)",
              boxShadow: "0 6px 12px rgba(0,0,0,0.1), inset -2px -2px 5px rgba(0,0,0,0.15), inset 2px 2px 5px rgba(255,255,255,0.9)"
            }}
            className="absolute top-3 right-4 rounded-full animate-slime-morph"
          />
        </div>

        {/* Subtle Top Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white dark:bg-[#17181C] border border-[#E2E8F0] dark:border-[#26282E] text-xs font-medium text-[#475569] dark:text-[#9CA3AF] mb-3 shadow-2xs">
          <GraduationCap className="w-3.5 h-3.5 text-[#7C9CFF] flex-shrink-0" />
          <span>{activeCampusName ? activeCampusName : "OXID Academic Studio • Standar Pedoman Dikti & Kampus"}</span>
        </div>

        {/* Centered Headline */}
        <div className="space-y-1.5 max-w-2xl">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#0F172A] dark:text-[#F3F6FC] leading-tight">
            Perumusan Usulan Proposal &amp; Karya Ilmiah
          </h1>
          <p className="text-sm sm:text-base text-[#475569] dark:text-[#9CA3AF] mt-2 max-w-xl mx-auto leading-relaxed font-normal">
            Ketikkan judul usulan Anda atau cari inspirasi topik. Agen AI memandu wawancara diagnostik sebelum draf proposal disusun untuk Anda tinjau.
          </p>
        </div>

        {/* ACTION TOOLBAR: Spacious, neatly grouped with rounded-lg */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
          {/* 1. Generator Judul (AI & Internet) */}
          <button
            type="button"
            onClick={() => handleOpenAiRecommender()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#17181C] border border-[#CBD5E1] dark:border-[#26282E] hover:border-[#7C9CFF] text-[#0F172A] dark:text-[#F3F6FC] font-medium transition-all shadow-2xs cursor-pointer group hover:bg-[#F8FAFC] dark:hover:bg-[#1E1F24]"
            title="Cari ide judul akademik berbasis penalaran AI dan literatur primer jurnal internasional"
          >
            <Lightbulb className="w-3.5 h-3.5 text-[#FBBF24] group-hover:scale-110 transition-transform" />
            <span>Generator Judul (AI &amp; Internet)</span>
          </button>

          {/* 2. AI Mentor & Konsultasi Ide */}
          {onOpenConsultation && (
            <button
              type="button"
              onClick={onOpenConsultation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#34D399]/10 border border-[#34D399]/30 hover:border-[#34D399] text-[#34D399] font-medium transition-all shadow-2xs cursor-pointer hover:bg-[#34D399]/20"
              title="Bimbingan interaktif membedah masalah lapangan, novelty, dan alur riset"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#34D399]" />
              <span>AI Mentor &amp; Konsultasi Ide</span>
            </button>
          )}

          {/* 3. Format Kampus */}
          {onOpenGuidelineModal && (
            <button
              type="button"
              onClick={onOpenGuidelineModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#17181C] border border-[#CBD5E1] dark:border-[#26282E] hover:border-[#7C9CFF] text-[#0F172A] dark:text-[#F3F6FC] font-medium transition-all shadow-2xs cursor-pointer hover:bg-[#F8FAFC] dark:hover:bg-[#1E1F24]"
              title="Pilih format kampus atau tempelkan teks pedoman"
            >
              <Landmark className="w-3.5 h-3.5 text-[#9B8CFF]" />
              <span>{activeCampusName ? activeCampusName.split("(")[0].trim() : "Format Kampus"}</span>
            </button>
          )}

          {/* 4. Parameter & Format Template */}
          <button
            type="button"
            onClick={() => setShowParameters(!showParameters)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all shadow-2xs cursor-pointer ${
              showParameters
                ? "bg-[#7C9CFF]/15 border-[#7C9CFF] text-[#7C9CFF]"
                : "bg-white dark:bg-[#17181C] border-[#CBD5E1] dark:border-[#26282E] hover:border-[#7C9CFF] text-[#0F172A] dark:text-[#F3F6FC]"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#7C9CFF]" />
            <span>{showParameters ? "Tutup Parameter" : `Target ~${targetDepthPages} Hal • Template`}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-[#64748B] transition-transform ${showParameters ? "rotate-180" : ""}`} />
          </button>

          {/* 5. NEW SESSION / RESET BUTTON */}
          {(title || targetEntity) && (
            <button
              type="button"
              onClick={() => {
                if (confirm("Mulai sesi baru? Input judul dan parameter saat ini akan dikosongkan.")) {
                  setTitle("");
                  setTargetEntity("");
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F1F5F9] dark:bg-[#1E1F24] border border-[#CBD5E1] dark:border-[#26282E] hover:bg-[#E2E8F0] dark:hover:bg-[#25262C] text-[#475569] dark:text-[#9CA3AF] font-medium transition-all shadow-2xs cursor-pointer"
              title="Mulai usulan baru / bersihkan formulir input tanpa refresh browser"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Sesi Baru</span>
            </button>
          )}
        </div>

        {/* ============================================================ */}
        {/* EXPANDABLE PARAMETERS & ACADEMIC TEMPLATE SELECTOR           */}
        {/* ============================================================ */}
        {showParameters && (
          <div className="w-full max-w-3xl mt-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#17181C] border border-[#CBD5E1] dark:border-[#26282E] shadow-md animate-in fade-in zoom-in-95 duration-150 space-y-4 text-left">
            
            {/* Section 1: Template Karya Ilmiah */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#475569] dark:text-[#9CA3AF] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#7C9CFF]" />
                  <span>Pilih Format &amp; Template Dokumen Akademik</span>
                </label>
                <span className="text-[10px] text-[#64748B] dark:text-[#9CA3AF] hidden sm:inline">
                  Mengatur struktur bab, target halaman &amp; rubrik pengujian
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(ACADEMIC_TEMPLATES).map(([key, tpl]) => {
                  const isSelected = selectedTemplateKey === key || (category === tpl.category && reportType === tpl.reportType);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSelectTemplate(key, tpl)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-[#7C9CFF]/10 border-[#7C9CFF] ring-1 ring-[#7C9CFF]/40 text-[#0F172A] dark:text-[#F3F6FC]"
                          : "bg-[#F8FAFC] dark:bg-[#121316] border-[#E2E8F0] dark:border-[#26282E] hover:border-[#7C9CFF]/50 text-[#475569] dark:text-[#9CA3AF]"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-white dark:bg-[#1E1F24] border border-[#E2E8F0] dark:border-[#26282E]">
                            {tpl.degreeLevel} • {tpl.requiredChapters?.length || 3} Bab
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#7C9CFF]" />}
                        </div>
                        <div className="text-xs font-semibold leading-tight line-clamp-1 text-[#0F172A] dark:text-[#F3F6FC]">
                          {tpl.name.split("/")[0].trim()}
                        </div>
                      </div>
                      <div className="text-[10px] text-[#64748B] dark:text-[#9CA3AF] mt-1.5 font-mono">
                        Target: ~{tpl.targetDepthPagesDefault} Hal
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Metadata Pelaksanaan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-[#E2E8F0] dark:border-[#26282E]">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#475569] dark:text-[#9CA3AF] mb-1">
                  Lokus / Mitra Sasaran
                </label>
                <input
                  type="text"
                  value={targetEntity}
                  onChange={(e) => setTargetEntity(e.target.value)}
                  placeholder="Contoh: PT Telkom / RSUP Sardjito"
                  className="w-full bg-[#F8FAFC] dark:bg-[#121316] border border-[#E2E8F0] dark:border-[#26282E] rounded-lg px-3 py-1.5 text-xs text-[#0F172A] dark:text-[#F3F6FC] placeholder:text-[#64748B] focus:outline-none focus:border-[#7C9CFF] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#475569] dark:text-[#9CA3AF] mb-1">
                  Durasi Pelaksanaan
                </label>
                <select
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(Number(e.target.value))}
                  className="w-full bg-[#F8FAFC] dark:bg-[#121316] border border-[#E2E8F0] dark:border-[#26282E] rounded-lg px-3 py-1.5 text-xs text-[#0F172A] dark:text-[#F3F6FC] focus:outline-none focus:border-[#7C9CFF] transition-colors cursor-pointer"
                >
                  <option value={1}>1 Bulan (Penelitian Singkat)</option>
                  <option value={2}>2 Bulan</option>
                  <option value={3}>3 Bulan</option>
                  <option value={4}>4 Bulan (Magang Standar)</option>
                  <option value={6}>6 Bulan (1 Semester / Skripsi)</option>
                  <option value={12}>12 Bulan (Tesis / Multi-tahun)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#475569] dark:text-[#9CA3AF] mb-1">
                  Nama Mahasiswa / Peneliti
                </label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="Nama Lengkap Anda"
                  className="w-full bg-[#F8FAFC] dark:bg-[#121316] border border-[#E2E8F0] dark:border-[#26282E] rounded-lg px-3 py-1.5 text-xs text-[#0F172A] dark:text-[#F3F6FC] placeholder:text-[#64748B] focus:outline-none focus:border-[#7C9CFF] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#475569] dark:text-[#9CA3AF] mb-1">
                  NIM / NIDN
                </label>
                <input
                  type="text"
                  value={candidateId}
                  onChange={(e) => setCandidateId(e.target.value)}
                  placeholder="Nomor Induk Mahasiswa"
                  className="w-full bg-[#F8FAFC] dark:bg-[#121316] border border-[#E2E8F0] dark:border-[#26282E] rounded-lg px-3 py-1.5 text-xs text-[#0F172A] dark:text-[#F3F6FC] placeholder:text-[#64748B] focus:outline-none focus:border-[#7C9CFF] transition-colors"
                />
              </div>
            </div>

            {/* Section 3: Target Tebal Dokumen (Custom Halaman) */}
            <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#26282E]">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#475569] dark:text-[#9CA3AF] flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#7C9CFF]" />
                  <span>Target Ketebalan Naskah Dokumen (Custom Halaman)</span>
                </label>
                <span className="text-[10px] text-[#64748B] dark:text-[#9CA3AF] hidden sm:inline">
                  Mengatur kedalaman analitis, jumlah teori (8-16) &amp; rincian bab
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {[
                  { pages: 25, label: "25 Hal", desc: "Ringkas / Magang" },
                  { pages: 45, label: "45 Hal", desc: "Standar Skripsi Dikti" },
                  { pages: 65, label: "65 Hal", desc: "Skripsi Komprehensif" },
                  { pages: 85, label: "85 Hal", desc: "Tesis / Laporan Penuh" },
                ].map((preset) => {
                  const isSelected = (targetDepthPages ?? 45) === preset.pages;
                  return (
                    <button
                      key={preset.pages}
                      type="button"
                      onClick={() => setTargetDepthPages && setTargetDepthPages(preset.pages)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-[#7C9CFF] text-[#0C0D0E] font-bold border-[#7C9CFF] shadow-xs"
                          : "bg-[#F8FAFC] dark:bg-[#121316] border-[#E2E8F0] dark:border-[#26282E] text-[#475569] dark:text-[#9CA3AF] hover:border-[#7C9CFF]/50"
                      }`}
                    >
                      <span>{preset.label}</span>
                      <span className="text-[10px] opacity-75">({preset.desc})</span>
                    </button>
                  );
                })}

                {/* Custom Page Number Input */}
                <div className="flex items-center gap-1.5 sm:ml-auto bg-[#F8FAFC] dark:bg-[#121316] border border-[#E2E8F0] dark:border-[#26282E] rounded-xl px-2.5 py-1">
                  <span className="text-[10px] font-bold uppercase text-[#64748B] dark:text-[#9CA3AF]">
                    Custom:
                  </span>
                  <input
                    type="number"
                    min={15}
                    max={150}
                    value={targetDepthPages ?? 45}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && setTargetDepthPages) {
                        setTargetDepthPages(Math.max(10, Math.min(150, val)));
                      }
                    }}
                    className="w-12 bg-transparent text-xs font-bold text-[#0F172A] dark:text-[#F3F6FC] text-center focus:outline-none"
                  />
                  <span className="text-[10px] text-[#64748B] dark:text-[#9CA3AF]">Hal</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* HERO INPUT CAPSULE (Centered, Spacious, High Interaction)     */}
        {/* ============================================================ */}
        <div className="w-full max-w-3xl mt-5 bg-white dark:bg-[#17181C] border border-[#CBD5E1] dark:border-[#26282E] rounded-2xl p-2 pl-4 pr-2.5 flex items-center gap-2.5 shadow-md shadow-zinc-200/50 dark:shadow-none hover:border-[#7C9CFF]/60 dark:hover:border-[#7C9CFF]/60 transition-all focus-within:border-[#7C9CFF] focus-within:ring-2 focus-within:ring-[#7C9CFF]/20">
          <input
            type="text"
            aria-label="Judul atau topik usulan"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tuliskan judul usulan atau ketik topik (contoh: obesitas, AI, supply chain, fintech)..."
            className="w-full bg-transparent border-none outline-none text-[#0F172A] dark:text-[#F3F6FC] placeholder:text-[#64748B] text-sm sm:text-base font-normal py-2 text-left"
          />

          {/* Clear button if text entered */}
          {title && (
            <button
              type="button"
              onClick={() => setTitle("")}
              className="p-1 rounded-md text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F3F6FC] transition-colors cursor-pointer"
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
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] dark:bg-[#1E1F24] dark:hover:bg-[#25262C] text-[#0F172A] dark:text-[#F3F6FC] font-medium text-xs transition-colors flex-shrink-0 cursor-pointer shadow-2xs"
          >
            <Lightbulb className="w-3.5 h-3.5 text-[#FBBF24]" />
            <span>Cari Ide Judul</span>
          </button>

          {/* Circular Submit Button with Arrow Right */}
          <button
            type="button"
            onClick={handleSubmit}
            title="Mulai Wawancara Diagnostik"
            className="w-10 h-10 rounded-xl bg-[#0F172A] dark:bg-[#7C9CFF] text-white dark:text-[#0C0D0E] flex items-center justify-center hover:scale-105 active:scale-95 transition-all flex-shrink-0 cursor-pointer shadow-sm group" aria-label="Mulai wawancara diagnostik"
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
                    ? "bg-[#0F172A] text-white dark:bg-[#7C9CFF] dark:text-[#0C0D0E] border border-transparent"
                    : "bg-white dark:bg-[#17181C] text-[#0F172A] dark:text-[#9CA3AF] border border-[#E2E8F0] dark:border-[#26282E] hover:bg-[#F8FAFC] dark:hover:bg-[#1E1F24] hover:border-[#CBD5E1] dark:hover:border-[#7C9CFF]/40"
                }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0 opacity-70 group-hover:opacity-100" />
                <span>{chip.label}</span>
                <ChevronRight className="w-3 h-3 text-[#64748B] group-hover:translate-x-0.5 transition-transform" />
              </button>
            );
          })}
        </div>

        {/* ============================================================ */}
        {/* RECENT PROJECTS QUICK ACCESS STRIP                           */}
        {/* ============================================================ */}
        {recentProjects.length > 0 && (
          <div className="w-full max-w-3xl mt-5 pt-4 border-t border-[#E2E8F0]/70 dark:border-[#26282E]/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none flex-wrap justify-center sm:justify-start">
              <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#9CA3AF] flex items-center gap-1.5 shrink-0">
                <Clock className="w-3.5 h-3.5 text-[#7C9CFF]" />
                <span>Draf Terkini:</span>
              </span>
              {recentProjects.slice(0, 3).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    if (onLoadProject) {
                      onLoadProject(p);
                    } else {
                      setTitle(p.title);
                      setCategory(p.category as ProposalCategory);
                      setTargetEntity(p.targetEntity || "");
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#17181C] hover:bg-[#F8FAFC] dark:hover:bg-[#1E1F24] border border-[#E2E8F0] dark:border-[#26282E] hover:border-[#7C9CFF]/50 text-xs text-[#0F172A] dark:text-[#F3F6FC] transition-all cursor-pointer shadow-2xs group max-w-[200px] truncate"
                  title={p.title}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
                  <span className="truncate">{p.title}</span>
                </button>
              ))}
            </div>

            {onOpenDatabase && (
              <button
                type="button"
                onClick={onOpenDatabase}
                className="text-[11px] text-[#7C9CFF] hover:text-[#9B8CFF] font-medium shrink-0 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Lihat Arsip ({recentProjects.length})</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

      </div>

      {/* ============================================================ */}
      {/* 2. FOOTER ROW: Action Links & Workflow Stage Progress        */}
      {/* ============================================================ */}
      <div className="w-full pt-6 mt-4 border-t border-[#E2E8F0] dark:border-[#26282E] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B] dark:text-[#9CA3AF]">
        
        {/* Left Link: Indexed Research Exploration */}
        <div className="flex items-center gap-5">
          {onOpenDatabase && (
            <button
              type="button"
              onClick={onOpenDatabase}
              className="inline-flex items-center gap-1.5 hover:text-[#0F172A] dark:hover:text-[#F3F6FC] transition-colors cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-[#7C9CFF]" />
              <span>Database Arsip Usulan</span>
            </button>
          )}

          {onOpenDrive && (
            <button
              type="button"
              onClick={onOpenDrive}
              className="inline-flex items-center gap-1.5 hover:text-[#0F172A] dark:hover:text-[#F3F6FC] transition-colors cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5 text-[#9B8CFF]" />
              <span>File lokal</span>
            </button>
          )}
        </div>

        {/* Center/Right Workflow info */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-[#64748B] dark:text-[#9CA3AF]">
          <span>SN-Dikti 2024 &amp; Pedoman Institusi</span>
          <span>•</span>
          <span className="text-[#34D399]">Draf dan referensi perlu ditinjau</span>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 3. DUAL-ENGINE TITLE GENERATOR MODAL                         */}
      {/* ============================================================ */}
      {isAiRecommenderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#121316] border border-[#CBD5E1] dark:border-[#26282E] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-[#26282E] flex items-center justify-between bg-white dark:bg-[#17181C]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FBBF24]/15 border border-[#FBBF24]/30 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-[#FBBF24]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F3F6FC]">
                    Dual-Engine Generator Judul Akademik
                  </h3>
                  <p className="text-[11px] text-[#64748B] dark:text-[#9CA3AF]">
                    Saran AI dan pencarian literatur untuk ditinjau kembali
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAiRecommenderOpen(false)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F3F6FC] hover:bg-[#F1F5F9] dark:hover:bg-[#1E1F24] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Keyword Search Bar in Modal */}
            <div className="p-4 border-b border-[#E2E8F0] dark:border-[#26282E] bg-[#F8FAFC] dark:bg-[#0C0D0E]">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
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
                    placeholder="Masukkan kata kunci riset (contoh: stunting, blockchain, cyber security)..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-[#17181C] border border-[#CBD5E1] dark:border-[#26282E] text-xs text-[#0F172A] dark:text-[#F3F6FC] placeholder:text-[#64748B] focus:outline-none focus:border-[#7C9CFF] transition-colors"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleFetchRecommendations(recommenderKeyword)}
                  disabled={isLoadingAi || isLoadingInternet}
                  className="px-4 py-2 rounded-xl bg-[#0F172A] dark:bg-[#7C9CFF] hover:bg-black dark:hover:bg-[#9B8CFF] text-white dark:text-[#0C0D0E] text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  {(isLoadingAi || isLoadingInternet) ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>Generate Judul</span>
                </button>
              </div>

              {/* Engine Tabs */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setRecommenderTab("ai")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    recommenderTab === "ai"
                      ? "bg-white dark:bg-[#1E1F24] text-[#7C9CFF] border border-[#7C9CFF]/40 shadow-xs"
                      : "text-[#64748B] dark:text-[#9CA3AF] hover:text-[#0F172A] dark:hover:text-[#F3F6FC]"
                  }`}
                >
                  <Bot className="w-3.5 h-3.5 text-[#7C9CFF]" />
                  <span>AI Penalaran &amp; State-of-the-Art</span>
                  {aiRecs.length > 0 && (
                    <span className="text-[10px] font-mono px-1.5 rounded-full bg-[#7C9CFF]/20 text-[#7C9CFF]">
                      {aiRecs.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setRecommenderTab("internet")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    recommenderTab === "internet"
                      ? "bg-white dark:bg-[#1E1F24] text-[#34D399] border border-[#34D399]/40 shadow-xs"
                      : "text-[#64748B] dark:text-[#9CA3AF] hover:text-[#0F172A] dark:hover:text-[#F3F6FC]"
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-[#34D399]" />
                  <span>Jurnal Primer (CrossRef &amp; OpenAlex)</span>
                  {internetRecs.length > 0 && (
                    <span className="text-[10px] font-mono px-1.5 rounded-full bg-[#34D399]/20 text-[#34D399]">
                      {internetRecs.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Recommendations Content Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FAFC] dark:bg-[#121316]">
              {(recommenderTab === "ai" ? aiMessage : internetMessage) && <p role="status" className="rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 px-3 py-2 text-xs leading-relaxed text-blue-900 dark:text-blue-200">{recommenderTab === "ai" ? aiMessage : internetMessage}</p>}
              {/* Tab 1: AI Pure Recommendations */}
              {recommenderTab === "ai" && (
                <>
                  {isLoadingAi ? (
                    <div className="py-12 text-center text-xs text-[#64748B] dark:text-[#9CA3AF] flex flex-col items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-[#7C9CFF]" />
                      <span>Agen AI sedang menganalisis rumusan masalah dan novelty...</span>
                    </div>
                  ) : aiRecs.length === 0 ? (
                    <div className="py-12 text-center text-xs text-[#64748B] dark:text-[#9CA3AF]">
                      Ketik topik di atas lalu klik <strong>Generate Judul</strong>.
                    </div>
                  ) : (
                    aiRecs.map((rec, i) => (
                      <div
                        key={rec.id || i}
                        className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#26282E] hover:border-[#7C9CFF] bg-white dark:bg-[#17181C] transition-all shadow-2xs group"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex-1 space-y-1.5 text-left">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#7C9CFF]/10 text-[#7C9CFF] border border-[#7C9CFF]/20">
                                {rec.category.toUpperCase()} • {rec.durationMonths} BULAN
                              </span>
                              {rec.referenceJournal && (
                                <span className="text-[10px] font-mono text-[#64748B] dark:text-[#9CA3AF] bg-[#F1F5F9] dark:bg-[#1E1F24] px-2 py-0.5 rounded border border-[#E2E8F0] dark:border-[#26282E]">
                                  📚 {rec.referenceJournal}
                                </span>
                              )}
                            </div>

                            <h4 className="text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-[#F3F6FC] leading-snug">
                              {rec.title}
                            </h4>

                            <div className="text-[11px] text-[#64748B] dark:text-[#9CA3AF] space-y-0.5 pt-1">
                              <p><strong>Lokus Rekomendasi:</strong> {rec.entity}</p>
                              {rec.researchGap && (
                                <p className="line-clamp-2"><strong>Research Gap:</strong> {rec.researchGap}</p>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleApplyTitle(rec)}
                            className="px-3.5 py-2 rounded-lg bg-[#0F172A] hover:bg-black dark:bg-[#7C9CFF] dark:hover:bg-[#9B8CFF] text-white dark:text-[#0C0D0E] text-xs font-semibold whitespace-nowrap transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer self-end sm:self-center"
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

              {/* Tab 2: Live Internet / Journal Literature */}
              {recommenderTab === "internet" && (
                <>
                  {isLoadingInternet ? (
                    <div className="py-12 text-center text-xs text-[#64748B] dark:text-[#9CA3AF] flex flex-col items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-[#34D399]" />
                      <span>Memindai literatur riil di OpenAlex &amp; CrossRef...</span>
                    </div>
                  ) : internetRecs.length === 0 ? (
                    <div className="py-12 text-center text-xs text-[#64748B] dark:text-[#9CA3AF]">
                      Ketik topik di atas lalu klik <strong>Generate Judul</strong>.
                    </div>
                  ) : (
                    internetRecs.map((rec, i) => (
                      <div
                        key={rec.id || i}
                        className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#26282E] hover:border-[#34D399] bg-white dark:bg-[#17181C] transition-all shadow-2xs group"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex-1 space-y-1.5 text-left">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20">
                                {rec.category.toUpperCase()} • {rec.durationMonths} BULAN
                              </span>
                              {rec.referenceJournal && (
                                <span className="text-[10px] font-mono text-[#64748B] dark:text-[#9CA3AF] bg-[#F1F5F9] dark:bg-[#1E1F24] px-2 py-0.5 rounded border border-[#E2E8F0] dark:border-[#26282E]">
                                  🌐 {rec.referenceJournal}
                                </span>
                              )}
                              {(rec as any).doiUrl && (
                                <span className="text-[10px] font-mono text-[#7C9CFF] truncate max-w-xs">
                                  {(rec as any).doiUrl}
                                </span>
                              )}
                            </div>

                            <h4 className="text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-[#F3F6FC] leading-snug">
                              {rec.title}
                            </h4>

                            <div className="text-[11px] text-[#64748B] dark:text-[#9CA3AF] space-y-0.5 pt-1">
                              <p><strong>Lokus Rekomendasi:</strong> {rec.entity}</p>
                              {rec.researchGap && (
                                <p className="line-clamp-2"><strong>Landasan Riset:</strong> {rec.researchGap}</p>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleApplyTitle(rec)}
                            className="px-3.5 py-2 rounded-lg bg-[#34D399] hover:bg-[#059669] text-white text-xs font-semibold whitespace-nowrap transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer self-end sm:self-center"
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
            <div className="px-6 py-3 border-t border-[#E2E8F0] dark:border-[#26282E] bg-white dark:bg-[#17181C] flex items-center justify-between text-[11px] text-[#64748B] font-mono">
              <span>*Judul yang dipilih akan otomatis mengisi usulan Anda</span>
              <button
                type="button"
                onClick={() => setIsAiRecommenderOpen(false)}
                className="px-3 py-1 rounded-lg border border-[#CBD5E1] dark:border-[#26282E] text-[#475569] dark:text-[#9CA3AF] hover:text-[#0F172A] dark:hover:text-[#F3F6FC] transition-colors cursor-pointer"
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
