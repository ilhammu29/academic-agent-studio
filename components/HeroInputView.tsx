"use client";

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
  CheckCircle2,
  AlertCircle,
  FileDown,
  Presentation,
  ShieldCheck,
  Layers,
  Building2,
  Calendar
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
  // Main view tab: 'dashboard' | 'create' | 'recommender'
  const [activeMainTab, setActiveMainTab] = useState<"dashboard" | "create" | "recommender">(
    activeDoc ? "dashboard" : "create"
  );

  // Recent Projects from LocalStorage / Supabase
  const [recentProjects, setRecentProjects] = useState<SavedProjectRecord[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  // Selected document template key from ACADEMIC_TEMPLATES
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>("proposal_skripsi");

  // Recommender states
  const [recommenderKeyword, setRecommenderKeyword] = useState("Kecerdasan Buatan");
  const [recommenderTab, setRecommenderTab] = useState<"ai" | "internet">("ai");
  const [aiRecs, setAiRecs] = useState<TitleRecommendation[]>([]);
  const [internetRecs, setInternetRecs] = useState<TitleRecommendation[]>([]);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isLoadingInternet, setIsLoadingInternet] = useState(false);

  // Load recent projects on mount
  useEffect(() => {
    let isMounted = true;
    setIsLoadingProjects(true);
    getSavedProjects()
      .then((records) => {
        if (isMounted) {
          setRecentProjects(records.slice(0, 4));
        }
      })
      .catch((e) => console.warn("Failed to load recent projects:", e))
      .finally(() => {
        if (isMounted) setIsLoadingProjects(false);
      });
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

  const handleApplyTitle = (rec: TitleRecommendation) => {
    setTitle(rec.title);
    setCategory(rec.category);
    setTargetEntity(rec.entity);
    setDurationMonths(rec.durationMonths);
    if (setReportType) {
      setReportType(rec.category === "magang" ? "magang" : rec.category === "penelitian" ? "penelitian" : "skripsi");
    }
    setActiveMainTab("create");
  };

  const handleSelectTemplate = (key: string, tpl: AcademicDocumentTemplate) => {
    setSelectedTemplateKey(key);
    setCategory(tpl.category);
    if (setReportType) {
      setReportType(tpl.reportType);
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
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      alert("Harap masukkan judul atau pilih topik usulan penelitian Anda.");
      return;
    }
    onSubmit();
  };

  return (
    <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-8 animate-in fade-in duration-200 text-[#0F172A] dark:text-[#F3F6FC]">
      
      {/* ============================================================ */}
      {/* 1. TOP HEADER & BREADCRUMB CONTEXT                           */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#E2E8F0] dark:border-[#253149]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#475569] dark:text-[#A4B1C7]">
            <span className="font-semibold text-[#0F172A] dark:text-[#F3F6FC]">OXID Academic Studio</span>
            <span>/</span>
            <span className="capitalize">{activeMainTab === "dashboard" ? "Dashboard Kerja" : activeMainTab === "create" ? "Buat Usulan Baru" : "Eksplorasi Ide"}</span>
          </div>
          <div className="text-xs font-medium text-[#7C9CFF]">
            Selamat datang kembali, {candidateName || "Ilham Maulana"}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] dark:text-[#F3F6FC]">
            Workspace Riset &amp; Penulisan Akademik
          </h1>
          <p className="text-xs text-[#475569] dark:text-[#A4B1C7]">
            Pusat penyusunan, validasi kepatuhan institusi, dan orkestrasi naskah ilmiah terstandar.
          </p>
        </div>

        {/* Quick Context & Campus Guideline Badge */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {onOpenGuidelineModal && (
            <button
              type="button"
              onClick={onOpenGuidelineModal}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#253149] hover:border-[#7C9CFF] text-xs text-[#0F172A] dark:text-[#F3F6FC] font-medium transition-all shadow-2xs cursor-pointer"
              title="Sesuaikan pedoman format institusi / kampus"
            >
              <Landmark className="w-3.5 h-3.5 text-[#7C9CFF]" />
              <span className="max-w-[150px] truncate">{activeCampusName || "Pedoman Kampus"}</span>
            </button>
          )}

          {onOpenConsultation && (
            <button
              type="button"
              onClick={onOpenConsultation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#34D399]/10 border border-[#34D399]/30 text-xs text-[#34D399] font-medium hover:bg-[#34D399]/20 transition-all shadow-2xs cursor-pointer"
              title="Konsultasi interaktif dengan AI Mentor"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#34D399]" />
              <span className="hidden sm:inline">AI Mentor</span>
            </button>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. PRIMARY WORKSPACE NAVIGATION TABS                         */}
      {/* ============================================================ */}
      <div className="flex items-center gap-2 mb-6 border-b border-[#E2E8F0] dark:border-[#253149] pb-3">
        <button
          type="button"
          onClick={() => setActiveMainTab("dashboard")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeMainTab === "dashboard"
              ? "bg-[#0F172A] text-white dark:bg-[#172033] dark:text-[#7C9CFF] border border-transparent dark:border-[#7C9CFF]/40 shadow-xs"
              : "text-[#475569] dark:text-[#A4B1C7] hover:text-[#0F172A] dark:hover:text-[#F3F6FC] hover:bg-[#F1F5F9] dark:hover:bg-[#172033]"
          }`}
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span>Dashboard &amp; Proyek Terkini</span>
          {recentProjects.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-[#E2E8F0] text-[#0F172A] dark:bg-[#253149] dark:text-[#A4B1C7]">
              {recentProjects.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab("create")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeMainTab === "create"
              ? "bg-[#0F172A] text-white dark:bg-[#172033] dark:text-[#7C9CFF] border border-transparent dark:border-[#7C9CFF]/40 shadow-xs"
              : "text-[#475569] dark:text-[#A4B1C7] hover:text-[#0F172A] dark:hover:text-[#F3F6FC] hover:bg-[#F1F5F9] dark:hover:bg-[#172033]"
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Mulai Usulan Baru</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveMainTab("recommender");
            handleFetchRecommendations(recommenderKeyword);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeMainTab === "recommender"
              ? "bg-[#0F172A] text-white dark:bg-[#172033] dark:text-[#7C9CFF] border border-transparent dark:border-[#7C9CFF]/40 shadow-xs"
              : "text-[#475569] dark:text-[#A4B1C7] hover:text-[#0F172A] dark:hover:text-[#F3F6FC] hover:bg-[#F1F5F9] dark:hover:bg-[#172033]"
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5 text-[#FBBF24]" />
          <span>Generator Judul (AI &amp; Literatur)</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* 3. TAB 1: DASHBOARD & WORKSPACE UTAMA                        */}
      {/* ============================================================ */}
      {activeMainTab === "dashboard" && (
        <div className="space-y-8">
          
          {/* A. AI COMMAND WORKSPACE (ChatGPT & Google AI Studio inspired) */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#253149] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#475569] dark:text-[#A4B1C7] flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#7C9CFF]" />
                <span>Apa yang ingin Anda teliti atau susun hari ini?</span>
              </label>
              <span className="text-[11px] text-[#475569] dark:text-[#A4B1C7] hidden sm:inline">
                Ketik topik, pilih tindakan, atau gunakan template
              </span>
            </div>

            {/* Main Prompt Input Box */}
            <div className="bg-[#F8FAFC] dark:bg-[#0B101A] border border-[#E2E8F0] dark:border-[#253149] rounded-xl p-3 flex items-center gap-2.5 focus-within:border-[#7C9CFF] focus-within:ring-2 focus-within:ring-[#7C9CFF]/20 transition-all">
              <Search className="w-4 h-4 text-[#475569] dark:text-[#A4B1C7] shrink-0" />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (title.trim()) handleSubmit();
                  }
                }}
                placeholder="Ketikkan ide penelitian, rumusan masalah, atau topik (contoh: Implementasi RAG untuk pencarian akademik)..."
                className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-[#0F172A] dark:text-[#F3F6FC] placeholder:text-[#475569] dark:placeholder:text-[#A4B1C7]"
              />
              {title && (
                <button
                  type="button"
                  onClick={() => setTitle("")}
                  className="p-1 rounded-md text-[#475569] dark:text-[#A4B1C7] hover:text-[#0F172A] dark:hover:text-[#F3F6FC] cursor-pointer"
                  title="Hapus teks"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Working Action Shortcuts (5 Quick Action Pills) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setActiveMainTab("create");
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F1F5F9] dark:bg-[#172033] hover:bg-[#E2E8F0] dark:hover:bg-[#1C263A] text-xs font-medium text-[#0F172A] dark:text-[#F3F6FC] border border-[#E2E8F0] dark:border-[#253149] transition-all cursor-pointer shadow-2xs"
              >
                <span>🚀 Buat Proyek Baru</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveMainTab("recommender");
                  setRecommenderTab("internet");
                  handleFetchRecommendations(title.trim() || recommenderKeyword);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F1F5F9] dark:bg-[#172033] hover:bg-[#E2E8F0] dark:hover:bg-[#1C263A] text-xs font-medium text-[#0F172A] dark:text-[#F3F6FC] border border-[#E2E8F0] dark:border-[#253149] transition-all cursor-pointer shadow-2xs"
              >
                <Search className="w-3.5 h-3.5 text-[#7C9CFF]" />
                <span>Cari Literatur Primer</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveMainTab("recommender");
                  setRecommenderTab("ai");
                  handleFetchRecommendations(title.trim() || recommenderKeyword);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F1F5F9] dark:bg-[#172033] hover:bg-[#E2E8F0] dark:hover:bg-[#1C263A] text-xs font-medium text-[#0F172A] dark:text-[#F3F6FC] border border-[#E2E8F0] dark:border-[#253149] transition-all cursor-pointer shadow-2xs"
              >
                <Lightbulb className="w-3.5 h-3.5 text-[#FBBF24]" />
                <span>Generator Judul AI</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (activeDoc && onNavigateStage) {
                    onNavigateStage("result");
                  } else {
                    alert("Silakan buka dokumen aktif atau buat usulan baru untuk menjalankan audit mutu QA & Turnitin.");
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F1F5F9] dark:bg-[#172033] hover:bg-[#E2E8F0] dark:hover:bg-[#1C263A] text-xs font-medium text-[#0F172A] dark:text-[#F3F6FC] border border-[#E2E8F0] dark:border-[#253149] transition-all cursor-pointer shadow-2xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
                <span>Audit Mutu &amp; Turnitin</span>
              </button>

              {onOpenGuidelineModal && (
                <button
                  type="button"
                  onClick={onOpenGuidelineModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F1F5F9] dark:bg-[#172033] hover:bg-[#E2E8F0] dark:hover:bg-[#1C263A] text-xs font-medium text-[#0F172A] dark:text-[#F3F6FC] border border-[#E2E8F0] dark:border-[#253149] transition-all cursor-pointer shadow-2xs"
                >
                  <Landmark className="w-3.5 h-3.5 text-[#9B8CFF]" />
                  <span>Format Pedoman Kampus</span>
                </button>
              )}
            </div>

            {/* Inspiration Chips & Submit Action */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#E2E8F0] dark:border-[#253149]">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-wrap text-xs">
                <span className="text-[11px] font-semibold text-[#475569] dark:text-[#A4B1C7] mr-1">
                  Topik Populer:
                </span>
                {TOPIC_CHIPS.slice(0, 4).map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => handleSelectChip(chip)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#F1F5F9] dark:bg-[#172033] hover:bg-[#E2E8F0] dark:hover:bg-[#1C263A] text-[11px] text-[#475569] dark:text-[#A4B1C7] hover:text-[#0F172A] dark:hover:text-[#F3F6FC] transition-colors cursor-pointer"
                  >
                    <span>{chip.label}</span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                className="px-5 py-2.5 rounded-xl bg-[#7C9CFF] hover:bg-[#9B8CFF] text-[#080B12] font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer group shrink-0"
              >
                <span>Mulai Analisis</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* B. MULAI DARI SINI: COMPACT GRID OF SUPPORTED DOCUMENT TYPES */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#0F172A] dark:text-[#F3F6FC] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#7C9CFF]" />
                  <span>Mulai dari Sini: Pilih Template Dokumen Akademik</span>
                </h2>
                <p className="text-xs text-[#475569] dark:text-[#A4B1C7] mt-0.5">
                  Format bab, checklist administratif, dan alur sidang dikonfigurasi otomatis sesuai jenis dokumen.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {Object.entries(ACADEMIC_TEMPLATES).map(([key, tpl]) => {
                const isSelected = selectedTemplateKey === key;
                return (
                  <div
                    key={key}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 shadow-2xs group ${
                      isSelected
                        ? "bg-white dark:bg-[#172033] border-[#7C9CFF] shadow-xs"
                        : "bg-white dark:bg-[#111827] border-[#E2E8F0] dark:border-[#253149] hover:border-[#7C9CFF]/60"
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md font-semibold bg-[#F1F5F9] dark:bg-[#172033] text-[#475569] dark:text-[#A4B1C7] border border-[#E2E8F0] dark:border-[#253149]">
                          {tpl.degreeLevel} • {tpl.category}
                        </span>
                        {tpl.isFinalReport && (
                          <span className="text-[10px] font-semibold text-[#34D399]">Laporan Akhir</span>
                        )}
                      </div>
                      <h3 className="text-xs font-bold text-[#0F172A] dark:text-[#F3F6FC] group-hover:text-[#7C9CFF] transition-colors leading-snug">
                        {tpl.name}
                      </h3>
                      <p className="text-[11px] text-[#475569] dark:text-[#A4B1C7] line-clamp-2 leading-relaxed">
                        {tpl.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#253149] flex items-center justify-between text-[11px]">
                      <span className="text-[#475569] dark:text-[#A4B1C7] font-mono">
                        {tpl.requiredChapters.length} Bab • ~{tpl.targetDepthPagesDefault} Hal
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          handleSelectTemplate(key, tpl);
                          setActiveMainTab("create");
                        }}
                        className="text-xs font-semibold text-[#7C9CFF] hover:text-[#9B8CFF] flex items-center gap-1 cursor-pointer"
                      >
                        <span>Pilih Template</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* C. 2-COLUMN SECTION: ACTIVE WORK IN PROGRESS & RECENT PROJECTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            
            {/* COLUMN 1: ACTIVE PROJECT PROGRESS */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F3F6FC] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#7C9CFF]" />
                <span>Naskah Aktif Berjalan</span>
              </h3>

              {activeDoc ? (
                <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#253149] shadow-sm flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
                        Sedang Aktif Dikerjakan
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#F1F5F9] dark:bg-[#172033] text-[#475569] dark:text-[#A4B1C7] uppercase">
                        {activeDoc.category}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#0F172A] dark:text-[#F3F6FC] leading-snug">
                      {activeDoc.title}
                    </h4>

                    <p className="text-xs text-[#475569] dark:text-[#A4B1C7] line-clamp-2">
                      {activeDoc.executiveSummary || "Naskah proposal telah disusun oleh Agen AI dengan struktur Bab I - V lengkap, matriks jadwal, dan tinjauan teori."}
                    </p>

                    <div className="pt-2 grid grid-cols-2 gap-2 text-xs text-[#475569] dark:text-[#A4B1C7]">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
                        <span>Struktur Bab I - V Terisi</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#7C9CFF]" />
                        <span>Siap Audit Mutu QA</span>
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#253149] flex items-center justify-between gap-2">
                    {onNavigateStage && (
                      <button
                        type="button"
                        onClick={() => onNavigateStage("result")}
                        className="px-4 py-2 rounded-xl bg-[#7C9CFF] hover:bg-[#9B8CFF] text-[#080B12] font-semibold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Buka Dokumen Studio</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {onNavigateStage && (
                      <button
                        type="button"
                        onClick={() => onNavigateStage("slides")}
                        className="px-3.5 py-2 rounded-xl bg-[#F1F5F9] dark:bg-[#172033] hover:bg-[#E2E8F0] dark:hover:bg-[#1C263A] text-xs font-medium text-[#0F172A] dark:text-[#F3F6FC] border border-[#E2E8F0] dark:border-[#253149] transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Presentation className="w-3.5 h-3.5 text-[#FBBF24]" />
                        <span>Slide PPTX</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-dashed border-[#E2E8F0] dark:border-[#253149] text-center space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] dark:bg-[#172033] text-[#475569] dark:text-[#A4B1C7] flex items-center justify-center mx-auto">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-semibold text-[#0F172A] dark:text-[#F3F6FC]">
                    Belum Ada Naskah yang Aktif
                  </h4>
                  <p className="text-[11px] text-[#475569] dark:text-[#A4B1C7] max-w-xs mx-auto">
                    Pilih salah satu template karya ilmiah di atas atau ketikkan ide usulan pada kolom AI Command.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveMainTab("create")}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#7C9CFF] text-[#080B12] font-semibold text-xs shadow-xs cursor-pointer hover:bg-[#9B8CFF]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Mulai Usulan Baru</span>
                  </button>
                </div>
              )}
            </div>

            {/* COLUMN 2: RECENT PROJECTS & ARCHIVE */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F3F6FC] flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-[#7C9CFF]" />
                  <span>Arsip &amp; Draf Terakhir</span>
                </h3>
                {onOpenDatabase && (
                  <button
                    type="button"
                    onClick={onOpenDatabase}
                    className="text-xs font-semibold text-[#7C9CFF] hover:text-[#9B8CFF] transition-colors cursor-pointer"
                  >
                    Semua Arsip →
                  </button>
                )}
              </div>

              {recentProjects.length > 0 ? (
                <div className="space-y-2.5">
                  {recentProjects.slice(0, 3).map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#253149] hover:border-[#7C9CFF]/60 transition-all flex items-center justify-between gap-3 shadow-2xs group"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#F1F5F9] dark:bg-[#172033] text-[#475569] dark:text-[#A4B1C7] uppercase font-semibold">
                            {p.category}
                          </span>
                          <span className="text-[10px] text-[#475569] dark:text-[#A4B1C7] flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {new Date(p.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-[#0F172A] dark:text-[#F3F6FC] truncate leading-snug group-hover:text-[#7C9CFF] transition-colors">
                          {p.title}
                        </h4>
                        {p.targetEntity && (
                          <p className="text-[10px] text-[#475569] dark:text-[#A4B1C7] truncate">
                            {p.targetEntity}
                          </p>
                        )}
                      </div>

                      {onLoadProject && (
                        <button
                          type="button"
                          onClick={() => onLoadProject(p)}
                          className="px-3 py-1.5 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] dark:bg-[#172033] dark:hover:bg-[#1C263A] text-[#0F172A] dark:text-[#F3F6FC] text-xs font-medium transition-colors cursor-pointer shrink-0"
                        >
                          Buka →
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-dashed border-[#E2E8F0] dark:border-[#253149] text-center text-xs text-[#475569] dark:text-[#A4B1C7]">
                  Belum ada berkas proyek tersimpan di browser Anda.
                </div>
              )}
            </div>

          </div>

          {/* D. 5-PHASE STANDAR AKADEMIK WORKFLOW FOOTER */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#253149] space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#475569] dark:text-[#A4B1C7]">
              Standar Alur Kerja Akademik OXID
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0B101A] border border-[#E2E8F0] dark:border-[#253149] space-y-0.5">
                <span className="font-mono text-[#7C9CFF] font-bold text-[11px]">01. Topik &amp; Pedoman</span>
                <p className="text-[10px] text-[#475569] dark:text-[#A4B1C7]">Format bab &amp; pedoman kampus</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0B101A] border border-[#E2E8F0] dark:border-[#253149] space-y-0.5">
                <span className="font-mono text-[#7C9CFF] font-bold text-[11px]">02. Wawancara Empiris</span>
                <p className="text-[10px] text-[#475569] dark:text-[#A4B1C7]">Data lapangan &amp; rumusan masalah</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0B101A] border border-[#E2E8F0] dark:border-[#253149] space-y-0.5">
                <span className="font-mono text-[#7C9CFF] font-bold text-[11px]">03. Orkestrasi Naskah</span>
                <p className="text-[10px] text-[#475569] dark:text-[#A4B1C7]">Bab I - V padat &amp; kepustakaan</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0B101A] border border-[#E2E8F0] dark:border-[#253149] space-y-0.5">
                <span className="font-mono text-[#7C9CFF] font-bold text-[11px]">04. 7-Phase QA Audit</span>
                <p className="text-[10px] text-[#475569] dark:text-[#A4B1C7]">Verifikasi sitasi &amp; Turnitin</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0B101A] border border-[#E2E8F0] dark:border-[#253149] space-y-0.5 col-span-2 sm:col-span-1">
                <span className="font-mono text-[#7C9CFF] font-bold text-[11px]">05. Ekspor &amp; Sidang</span>
                <p className="text-[10px] text-[#475569] dark:text-[#A4B1C7]">DOCX, PPTX 16:9 &amp; BibTeX</p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* 4. TAB 2: MULAI USULAN BARU (3-Step Guided Form)             */}
      {/* ============================================================ */}
      {activeMainTab === "create" && (
        <div className="space-y-6">
          
          {/* STEP 1: Pilih Jenis Dokumen Akademik */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#0F172A] dark:text-[#F3F6FC] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#7C9CFF] text-[#080B12] flex items-center justify-center text-[10px] font-mono font-bold">1</span>
                  <span>Pilih Jenis Karya Ilmiah</span>
                </h2>
                <p className="text-xs text-[#475569] dark:text-[#A4B1C7] mt-0.5">
                  Format bab, checklist administratif, dan alur sidang akan disesuaikan secara otomatis.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(ACADEMIC_TEMPLATES).map(([key, tpl]) => {
                const isSelected = selectedTemplateKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectTemplate(key, tpl)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 shadow-2xs ${
                      isSelected
                        ? "bg-white dark:bg-[#172033] text-[#0F172A] dark:text-[#F3F6FC] border-[#7C9CFF] shadow-xs"
                        : "bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F3F6FC] border-[#E2E8F0] dark:border-[#253149] hover:border-[#7C9CFF]/60"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${
                          isSelected ? "bg-[#7C9CFF]/20 text-[#7C9CFF]" : "bg-[#F1F5F9] dark:bg-[#172033] text-[#475569] dark:text-[#A4B1C7]"
                        }`}>
                          {tpl.degreeLevel} • {tpl.category}
                        </span>
                        {tpl.isFinalReport && (
                          <span className="text-[10px] font-semibold text-[#34D399]">Laporan Akhir</span>
                        )}
                      </div>
                      <h3 className="text-xs font-bold leading-snug">
                        {tpl.name}
                      </h3>
                      <p className={`text-[11px] mt-1 line-clamp-2 ${isSelected ? "text-[#475569] dark:text-[#A4B1C7]" : "text-[#475569] dark:text-[#A4B1C7]"}`}>
                        {tpl.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[#E2E8F0] dark:border-[#253149] text-[10px] text-[#475569] dark:text-[#A4B1C7]">
                      <span>{tpl.requiredChapters.length} Bab Wajib</span>
                      <span>Target ~{tpl.targetDepthPagesDefault} Hal</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Rumuskan Topik & Judul Usulan */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-[#0F172A] dark:text-[#F3F6FC] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#7C9CFF] text-[#080B12] flex items-center justify-center text-[10px] font-mono font-bold">2</span>
              <span>Rumusan Judul &amp; Topik Penelitian</span>
            </h2>

            {/* Input Capsule with Search Action */}
            <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#253149] rounded-2xl p-2 pl-4 pr-2 flex items-center gap-2.5 shadow-sm focus-within:border-[#7C9CFF] focus-within:ring-2 focus-within:ring-[#7C9CFF]/20 transition-all">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tuliskan judul usulan atau ketik topik (contoh: implementasi deep learning, optimasi rantai pasok)..."
                className="w-full bg-transparent border-none outline-none text-[#0F172A] dark:text-[#F3F6FC] placeholder:text-[#475569] dark:placeholder:text-[#A4B1C7] text-sm py-2 text-left"
              />

              {title && (
                <button
                  type="button"
                  onClick={() => setTitle("")}
                  className="p-1 rounded-md text-[#475569] dark:text-[#A4B1C7] hover:text-[#0F172A] dark:hover:text-[#F3F6FC] transition-colors cursor-pointer"
                  title="Hapus teks"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setActiveMainTab("recommender");
                  handleFetchRecommendations(title.trim() || recommenderKeyword);
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] dark:bg-[#172033] dark:hover:bg-[#1C263A] text-[#0F172A] dark:text-[#F3F6FC] font-medium text-xs transition-colors flex-shrink-0 cursor-pointer shadow-2xs"
              >
                <Lightbulb className="w-3.5 h-3.5 text-[#FBBF24]" />
                <span>Cari Ide Judul</span>
              </button>
            </div>

            {/* Quick Inspiration Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-wrap">
              <span className="text-[11px] font-semibold text-[#475569] dark:text-[#A4B1C7] flex items-center gap-1">
                Inspirasi Topik:
              </span>
              {TOPIC_CHIPS.map((chip) => {
                const isSelected = title === chip.title;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => handleSelectChip(chip)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#7C9CFF] text-[#080B12] font-semibold"
                        : "bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F3F6FC] border border-[#E2E8F0] dark:border-[#253149] hover:border-[#7C9CFF]/60"
                    }`}
                  >
                    <span>{chip.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 3: Parameter Pelaksanaan & Data Pengusul */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-[#0F172A] dark:text-[#F3F6FC] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#7C9CFF] text-[#080B12] flex items-center justify-center text-[10px] font-mono font-bold">3</span>
              <span>Identitas Pengusul &amp; Tempat Pelaksanaan</span>
            </h2>

            <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#253149] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-[#0F172A] dark:text-[#F3F6FC] block mb-1">
                  Nama Mahasiswa / Peneliti
                </label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="Nama Lengkap"
                  className="w-full bg-[#F8FAFC] dark:bg-[#0B101A] border border-[#E2E8F0] dark:border-[#253149] rounded-lg px-3 py-1.5 text-[#0F172A] dark:text-[#F3F6FC] text-xs focus:outline-none focus:border-[#7C9CFF]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#0F172A] dark:text-[#F3F6FC] block mb-1">
                  Instansi Mitra / Tempat Penelitian
                </label>
                <input
                  type="text"
                  value={targetEntity}
                  onChange={(e) => setTargetEntity(e.target.value)}
                  placeholder="Contoh: PT Telkom / Lab Robotika"
                  className="w-full bg-[#F8FAFC] dark:bg-[#0B101A] border border-[#E2E8F0] dark:border-[#253149] rounded-lg px-3 py-1.5 text-[#0F172A] dark:text-[#F3F6FC] text-xs focus:outline-none focus:border-[#7C9CFF]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#0F172A] dark:text-[#F3F6FC] block mb-1">
                  Rencana Durasi Kegiatan
                </label>
                <select
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(Number(e.target.value))}
                  className="w-full bg-[#F8FAFC] dark:bg-[#0B101A] border border-[#E2E8F0] dark:border-[#253149] rounded-lg px-3 py-1.5 text-[#0F172A] dark:text-[#F3F6FC] text-xs focus:outline-none focus:border-[#7C9CFF]"
                >
                  <option value={1}>1 Bulan (4 Minggu)</option>
                  <option value={3}>3 Bulan (12 Minggu - PKL)</option>
                  <option value={4}>4 Bulan (16 Minggu - 1 Semester)</option>
                  <option value={6}>6 Bulan (MBKM 20 SKS / Skripsi)</option>
                </select>
              </div>
            </div>
          </div>

          {/* PRIMARY SUBMIT CTA BAR */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E2E8F0] dark:border-[#253149]">
            <div className="text-xs text-[#475569] dark:text-[#A4B1C7]">
              Langkah selanjutnya: <span className="font-semibold text-[#0F172A] dark:text-[#F3F6FC]">Wawancara Diagnostik Lapangan</span> untuk membedah data empiris dan rumusan masalah.
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#7C9CFF] hover:bg-[#9B8CFF] text-[#080B12] font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>Lanjut ke Wawancara Diagnostik</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. TAB 3: GENERATOR JUDUL (AI & LITERATUR)                   */}
      {/* ============================================================ */}
      {activeMainTab === "recommender" && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#253149] space-y-3">
            <h2 className="text-sm font-bold text-[#0F172A] dark:text-[#F3F6FC]">
              Cari Ide Judul Berbasis Penalaran AI &amp; Jurnal Internasional
            </h2>
            <div className="flex items-center gap-2">
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
                placeholder="Ketik kata kunci topik (contoh: obesitas, transformer, blockchain)..."
                className="w-full bg-[#F8FAFC] dark:bg-[#0B101A] border border-[#E2E8F0] dark:border-[#253149] rounded-lg px-3 py-2 text-xs text-[#0F172A] dark:text-[#F3F6FC] placeholder:text-[#475569] dark:placeholder:text-[#A4B1C7] focus:outline-none focus:border-[#7C9CFF]"
              />
              <button
                type="button"
                onClick={() => handleFetchRecommendations(recommenderKeyword)}
                disabled={isLoadingAi || isLoadingInternet}
                className="px-4 py-2 rounded-lg bg-[#7C9CFF] hover:bg-[#9B8CFF] text-[#080B12] text-xs font-semibold cursor-pointer disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0"
              >
                {isLoadingAi || isLoadingInternet ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                <span>Generate Judul</span>
              </button>
            </div>

            {/* Sub-tabs AI vs Literature */}
            <div className="flex items-center gap-2 pt-2 border-t border-[#E2E8F0] dark:border-[#253149]">
              <button
                type="button"
                onClick={() => setRecommenderTab("ai")}
                className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                  recommenderTab === "ai"
                    ? "bg-[#7C9CFF] text-[#080B12]"
                    : "text-[#475569] dark:text-[#A4B1C7] hover:text-[#0F172A] dark:hover:text-[#F3F6FC]"
                }`}
              >
                1. Rekomendasi AI Penalaran ({aiRecs.length})
              </button>
              <button
                type="button"
                onClick={() => setRecommenderTab("internet")}
                className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                  recommenderTab === "internet"
                    ? "bg-[#7C9CFF] text-[#080B12]"
                    : "text-[#475569] dark:text-[#A4B1C7] hover:text-[#0F172A] dark:hover:text-[#F3F6FC]"
                }`}
              >
                2. Rujukan Literatur Primer ({internetRecs.length})
              </button>
            </div>
          </div>

          {/* Results Grid */}
          <div className="space-y-3">
            {recommenderTab === "ai" && (
              <div className="space-y-3">
                {isLoadingAi ? (
                  <div className="text-center py-8 text-xs text-[#475569] dark:text-[#A4B1C7]">
                    <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-[#7C9CFF]" />
                    <span>Sedang merumuskan judul akademik berbasis penalaran AI...</span>
                  </div>
                ) : aiRecs.length > 0 ? (
                  aiRecs.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#253149] space-y-2 hover:border-[#7C9CFF]/60 transition-colors shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F1F5F9] dark:bg-[#172033] text-[#475569] dark:text-[#A4B1C7] uppercase font-semibold">
                          {rec.category} • {rec.durationMonths} Bulan
                        </span>
                        <span className="text-xs text-[#475569] dark:text-[#A4B1C7] font-medium">{rec.entity}</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#0F172A] dark:text-[#F3F6FC] leading-snug">
                        {rec.title}
                      </h4>
                      {rec.referenceJournal && (
                        <p className="text-xs text-[#475569] dark:text-[#A4B1C7]">
                          {rec.referenceJournal}
                        </p>
                      )}
                      {rec.researchGap && (
                        <div className="p-2 rounded bg-[#FBBF24]/10 border border-[#FBBF24]/30 text-[11px] text-[#FBBF24]">
                          <strong>Research Gap:</strong> {rec.researchGap}
                        </div>
                      )}
                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleApplyTitle(rec)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#7C9CFF] hover:bg-[#9B8CFF] text-[#080B12] text-xs font-semibold transition-opacity cursor-pointer flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Gunakan Judul Ini</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-xs text-[#475569] dark:text-[#A4B1C7]">
                    Ketikkan topik di atas untuk menampilkan usulan judul.
                  </div>
                )}
              </div>
            )}

            {recommenderTab === "internet" && (
              <div className="space-y-3">
                {isLoadingInternet ? (
                  <div className="text-center py-8 text-xs text-[#475569] dark:text-[#A4B1C7]">
                    <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-[#7C9CFF]" />
                    <span>Sedang mencari publikasi ilmiah di Crossref &amp; OpenAlex...</span>
                  </div>
                ) : internetRecs.length > 0 ? (
                  internetRecs.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#253149] space-y-2 hover:border-[#7C9CFF]/60 transition-colors shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#7C9CFF]/15 text-[#7C9CFF] border border-[#7C9CFF]/30 uppercase font-semibold">
                          Jurnal Primer
                        </span>
                        {(rec as any).doiUrl && (
                          <span className="text-[11px] font-mono text-[#475569] dark:text-[#A4B1C7]">{(rec as any).doiUrl}</span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-[#0F172A] dark:text-[#F3F6FC] leading-snug">
                        {rec.title}
                      </h4>
                      {rec.referenceJournal && (
                        <p className="text-xs text-[#475569] dark:text-[#A4B1C7]">
                          {rec.referenceJournal}
                        </p>
                      )}
                      {(rec as any).sourceCitation && (
                        <p className="text-[11px] text-[#475569] dark:text-[#A4B1C7] italic">
                          Sumber: {(rec as any).sourceCitation}
                        </p>
                      )}
                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleApplyTitle(rec)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#7C9CFF] hover:bg-[#9B8CFF] text-[#080B12] text-xs font-semibold transition-opacity cursor-pointer flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Gunakan Judul Ini</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-xs text-[#475569] dark:text-[#A4B1C7]">
                    Ketikkan topik di atas untuk mencari artikel jurnal primer.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
