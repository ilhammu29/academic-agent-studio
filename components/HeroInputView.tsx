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
    <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-8 animate-in fade-in duration-200">
      
      {/* ============================================================ */}
      {/* 1. TOP HEADER & BREADCRUMB CONTEXT                           */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">OXID Academic Studio</span>
            <span>/</span>
            <span className="capitalize">{activeMainTab === "dashboard" ? "Dashboard Kerja" : activeMainTab === "create" ? "Buat Usulan Baru" : "Eksplorasi Ide"}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Workspace Penulisan Karya Ilmiah
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Pusat penyusunan, validasi kepatuhan pedoman, dan orkestrasi naskah akademik terstandar.
          </p>
        </div>

        {/* Quick Context & Campus Guideline Badge */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {onOpenGuidelineModal && (
            <button
              type="button"
              onClick={onOpenGuidelineModal}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 text-xs text-zinc-700 dark:text-zinc-300 font-medium transition-all shadow-2xs cursor-pointer"
              title="Sesuaikan pedoman format institusi / kampus"
            >
              <Landmark className="w-3.5 h-3.5 text-indigo-500" />
              <span className="max-w-[150px] truncate">{activeCampusName || "Pedoman Kampus"}</span>
            </button>
          )}

          {onOpenConsultation && (
            <button
              type="button"
              onClick={onOpenConsultation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-medium hover:bg-emerald-100 transition-all shadow-2xs cursor-pointer"
              title="Konsultasi interaktif dengan AI Mentor"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">AI Mentor</span>
            </button>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. PRIMARY WORKSPACE NAVIGATION TABS                         */}
      {/* ============================================================ */}
      <div className="flex items-center gap-2 mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveMainTab("dashboard")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeMainTab === "dashboard"
              ? "bg-zinc-950 text-white dark:bg-zinc-100 dark:text-black shadow-xs"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span>Dashboard &amp; Proyek Terkini</span>
          {recentProjects.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-zinc-700 text-zinc-200 dark:bg-zinc-300 dark:text-zinc-800">
              {recentProjects.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab("create")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeMainTab === "create"
              ? "bg-zinc-950 text-white dark:bg-zinc-100 dark:text-black shadow-xs"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
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
              ? "bg-zinc-950 text-white dark:bg-zinc-100 dark:text-black shadow-xs"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>Generator Judul (AI &amp; Literatur)</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* 3. TAB 1: DASHBOARD & PROYEK TERKINI                        */}
      {/* ============================================================ */}
      {activeMainTab === "dashboard" && (
        <div className="space-y-6">
          
          {/* A. ACTIVE WORK IN PROGRESS CARD (What am I working on?) */}
          {activeDoc ? (
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Sedang Aktif Dikerjakan
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 uppercase">
                      {activeDoc.category}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {activeDoc.candidateName} • {activeDoc.targetEntity}
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold text-zinc-950 dark:text-white leading-snug">
                    {activeDoc.title}
                  </h2>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                    {activeDoc.executiveSummary || "Naskah proposal telah disusun oleh Agen AI dengan struktur Bab I - V lengkap, matriks jadwal, dan tinjauan teori."}
                  </p>

                  <div className="pt-2 flex items-center gap-4 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Struktur Bab I - V Terisi
                    </span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                      Siap Audit Kualitas QA
                    </span>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="flex flex-col gap-2 flex-shrink-0 sm:self-center">
                  {onNavigateStage && (
                    <button
                      type="button"
                      onClick={() => onNavigateStage("result")}
                      className="px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-black text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-black font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer group"
                    >
                      <span>Buka Dokumen Studio</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  )}

                  {onNavigateStage && (
                    <button
                      type="button"
                      onClick={() => onNavigateStage("slides")}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-800 dark:text-zinc-200 font-medium text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Presentation className="w-3.5 h-3.5 text-orange-500" />
                      <span>Slide Sidang (PPTX)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-dashed border-zinc-300 dark:border-zinc-800 text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center mx-auto">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Belum Ada Usulan yang Sedang Berjalan
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                Pilih jenis karya ilmiah dan mulai rumuskan judul penelitian Anda. Sistem memandu Anda langkah demi langkah.
              </p>
              <button
                type="button"
                onClick={() => setActiveMainTab("create")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-950 text-white dark:bg-zinc-100 dark:text-black font-semibold text-xs shadow-xs cursor-pointer hover:opacity-90"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Mulai Usulan Baru Sekarang</span>
              </button>
            </div>
          )}

          {/* B. RECENT PROJECTS LIST */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-zinc-500" />
                <span>Arsip Proyek &amp; Draf Terakhir</span>
              </h3>
              {onOpenDatabase && (
                <button
                  type="button"
                  onClick={onOpenDatabase}
                  className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                >
                  Lihat Semua Arsip →
                </button>
              )}
            </div>

            {recentProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recentProjects.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all flex flex-col justify-between gap-3 shadow-2xs group"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 uppercase font-semibold">
                          {p.category}
                        </span>
                        <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(p.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {p.title}
                      </h4>
                      {p.targetEntity && (
                        <p className="text-[11px] text-zinc-500 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-zinc-400" />
                          <span>{p.targetEntity}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                      <span className="text-[11px] text-zinc-500">
                        {p.documentData ? "Naskah Siap" : "Draf Ide"}
                      </span>
                      {onLoadProject && (
                        <button
                          type="button"
                          onClick={() => onLoadProject(p)}
                          className="px-3 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-900 dark:text-zinc-100 text-xs font-medium transition-colors cursor-pointer"
                        >
                          Lanjutkan Buka →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-zinc-400">
                Belum ada berkas proyek tersimpan.
              </div>
            )}
          </div>

          {/* C. 5-STEP ACADEMIC WORKFLOW ROADMAP */}
          <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Alur Kerja Standar Akademik OXID
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="font-mono text-zinc-400 font-bold">01.</span>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">Topik &amp; Pedoman</p>
                <p className="text-[11px] text-zinc-500">Pilih jenis karya dan format institusi</p>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="font-mono text-zinc-400 font-bold">02.</span>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">Wawancara Lapangan</p>
                <p className="text-[11px] text-zinc-500">Eksplorasi masalah &amp; temuan empiris</p>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="font-mono text-zinc-400 font-bold">03.</span>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">Orkestrasi Naskah</p>
                <p className="text-[11px] text-zinc-500">Penyusunan Bab I - V &amp; Daftar Pustaka</p>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="font-mono text-zinc-400 font-bold">04.</span>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">7-Phase QA Audit</p>
                <p className="text-[11px] text-zinc-500">Verifikasi sitasi, konsistensi &amp; plagiasi</p>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="font-mono text-zinc-400 font-bold">05.</span>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">Ekspor &amp; Sidang</p>
                <p className="text-[11px] text-zinc-500">Unduh DOCX, PPTX 16:9 &amp; BibTeX</p>
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
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black flex items-center justify-center text-[10px] font-mono">1</span>
                  <span>Pilih Jenis Karya Ilmiah</span>
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
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
                        ? "bg-zinc-950 text-white dark:bg-zinc-100 dark:text-black border-zinc-950 dark:border-white shadow-xs"
                        : "bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${
                          isSelected ? "bg-zinc-800 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-800" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                        }`}>
                          {tpl.degreeLevel} • {tpl.category}
                        </span>
                        {tpl.isFinalReport && (
                          <span className="text-[10px] font-semibold text-emerald-400">Laporan Akhir</span>
                        )}
                      </div>
                      <h3 className="text-xs font-bold leading-snug">
                        {tpl.name}
                      </h3>
                      <p className={`text-[11px] mt-1 line-clamp-2 ${isSelected ? "text-zinc-300 dark:text-zinc-700" : "text-zinc-500"}`}>
                        {tpl.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-zinc-200/20 text-[10px]">
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
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black flex items-center justify-center text-[10px] font-mono">2</span>
              <span>Rumusan Judul &amp; Topik Penelitian</span>
            </h2>

            {/* Input Capsule with Search Action */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-2xl p-2 pl-4 pr-2 flex items-center gap-2.5 shadow-sm focus-within:border-zinc-500 focus-within:ring-2 focus-within:ring-zinc-200/60 dark:focus-within:ring-zinc-800 transition-all">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tuliskan judul usulan atau ketik topik (contoh: implementasi deep learning, optimasi rantai pasok)..."
                className="w-full bg-transparent border-none outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 text-sm py-2 text-left"
              />

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

              <button
                type="button"
                onClick={() => {
                  setActiveMainTab("recommender");
                  handleFetchRecommendations(title.trim() || recommenderKeyword);
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 font-medium text-xs transition-colors flex-shrink-0 cursor-pointer shadow-2xs"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Cari Ide Judul</span>
              </button>
            </div>

            {/* Quick Inspiration Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-wrap">
              <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
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
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black font-semibold"
                        : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50"
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
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black flex items-center justify-center text-[10px] font-mono">3</span>
              <span>Identitas Pengusul &amp; Tempat Pelaksanaan</span>
            </h2>

            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Nama Mahasiswa / Peneliti
                </label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="Nama Lengkap"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Instansi Mitra / Tempat Penelitian
                </label>
                <input
                  type="text"
                  value={targetEntity}
                  onChange={(e) => setTargetEntity(e.target.value)}
                  placeholder="Contoh: PT Telkom / Lab Robotika"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Rencana Durasi Kegiatan
                </label>
                <select
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(Number(e.target.value))}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-zinc-400"
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
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="text-xs text-zinc-500">
              Langkah selanjutnya: <span className="font-semibold text-zinc-800 dark:text-zinc-200">Wawancara Diagnostik Lapangan</span> untuk membedah data empiris dan rumusan masalah.
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-950 hover:bg-black text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-black font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer group"
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
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
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
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-zinc-400"
              />
              <button
                type="button"
                onClick={() => handleFetchRecommendations(recommenderKeyword)}
                disabled={isLoadingAi || isLoadingInternet}
                className="px-4 py-2 rounded-lg bg-zinc-950 text-white dark:bg-zinc-100 dark:text-black text-xs font-semibold cursor-pointer disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0"
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
            <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setRecommenderTab("ai")}
                className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                  recommenderTab === "ai"
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                1. Rekomendasi AI Penalaran ({aiRecs.length})
              </button>
              <button
                type="button"
                onClick={() => setRecommenderTab("internet")}
                className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                  recommenderTab === "internet"
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
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
                  <div className="text-center py-8 text-xs text-zinc-500">
                    <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2" />
                    <span>Sedang merumuskan judul akademik berbasis penalaran AI...</span>
                  </div>
                ) : aiRecs.length > 0 ? (
                  aiRecs.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2 hover:border-zinc-400 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 uppercase font-semibold">
                          {rec.category} • {rec.durationMonths} Bulan
                        </span>
                        <span className="text-xs text-zinc-500 font-medium">{rec.entity}</span>
                      </div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                        {rec.title}
                      </h4>
                      {rec.referenceJournal && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">
                          {rec.referenceJournal}
                        </p>
                      )}
                      {rec.researchGap && (
                        <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-[11px] text-amber-800 dark:text-amber-300">
                          <strong>Research Gap:</strong> {rec.researchGap}
                        </div>
                      )}
                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleApplyTitle(rec)}
                          className="px-3.5 py-1.5 rounded-lg bg-zinc-950 text-white dark:bg-zinc-100 dark:text-black text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Gunakan Judul Ini</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-xs text-zinc-500">
                    Ketikkan topik di atas untuk menampilkan usulan judul.
                  </div>
                )}
              </div>
            )}

            {recommenderTab === "internet" && (
              <div className="space-y-3">
                {isLoadingInternet ? (
                  <div className="text-center py-8 text-xs text-zinc-500">
                    <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2" />
                    <span>Sedang mencari publikasi ilmiah di Crossref &amp; OpenAlex...</span>
                  </div>
                ) : internetRecs.length > 0 ? (
                  internetRecs.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2 hover:border-zinc-400 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 uppercase font-semibold">
                          Jurnal Primer
                        </span>
                        {(rec as any).doiUrl && (
                          <span className="text-[11px] font-mono text-zinc-500">{(rec as any).doiUrl}</span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                        {rec.title}
                      </h4>
                      {rec.referenceJournal && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">
                          {rec.referenceJournal}
                        </p>
                      )}
                      {(rec as any).sourceCitation && (
                        <p className="text-[11px] text-zinc-500 italic">
                          Sumber: {(rec as any).sourceCitation}
                        </p>
                      )}
                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleApplyTitle(rec)}
                          className="px-3.5 py-1.5 rounded-lg bg-zinc-950 text-white dark:bg-zinc-100 dark:text-black text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Gunakan Judul Ini</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-xs text-zinc-500">
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
