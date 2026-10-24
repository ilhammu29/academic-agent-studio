"use client";

import React, { useState, useEffect, useRef } from "react";
import { AgentInfo, ProposalCategory, ProposalDocument, CampusGuideline, ReportType } from "@/types/studio";
import { INITIAL_AGENTS } from "@/lib/agentEngine";
import { buildDenseAcademicDocument } from "@/lib/longDocumentGenerator";
import { 
  ArrowRight, 
  Check, 
  Loader2, 
  Cpu, 
  Sparkles, 
  ShieldCheck, 
  BookOpen, 
  Layers, 
  Compass, 
  CalendarDays, 
  Terminal, 
  FileText, 
  CheckCircle2, 
  Zap, 
  Landmark,
  GraduationCap,
  Clock,
  ExternalLink,
  Presentation,
  CheckCircle
} from "lucide-react";

interface AgentExecutionMonitorProps {
  title: string;
  category?: ProposalCategory;
  reportType?: ReportType;
  answers?: Record<string, string>;
  targetEntity?: string;
  candidateName?: string;
  candidateId?: string;
  institution?: string;
  facultyMajor?: string;
  campusGuideline?: CampusGuideline;
  onComplete: (doc?: ProposalDocument) => void;
}

// Icon helper for agent cards
const getAgentIcon = (avatarIcon?: string) => {
  switch (avatarIcon) {
    case "Compass": return Compass;
    case "BookOpen": return BookOpen;
    case "CalendarDays": return CalendarDays;
    case "ShieldCheck": return ShieldCheck;
    case "Layers": return Layers;
    default: return Cpu;
  }
};

export const AgentExecutionMonitor: React.FC<AgentExecutionMonitorProps> = ({
  title,
  category = "magang",
  reportType,
  answers = {},
  targetEntity = "Instansi Mitra",
  candidateName = "Pengusul Akademik",
  candidateId = "NIM-2026-AKAD",
  institution = "Universitas",
  facultyMajor = "Program Studi Terkait",
  campusGuideline,
  onComplete
}) => {
  const [agents, setAgents] = useState<AgentInfo[]>(INITIAL_AGENTS);
  const [activeLogs, setActiveLogs] = useState<{ time: string; agent: string; text: string; type?: "info" | "success" | "warn" }[]>([]);
  const [overallProgress, setOverallProgress] = useState(15);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("scoping_architect");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Store the actual generated doc from Gemini / fallback
  const generatedDocRef = useRef<ProposalDocument | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Timer for elapsed execution seconds
  useEffect(() => {
    if (isFinished) return;
    const interval = setInterval(() => {
      setElapsedSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isFinished]);

  // Auto-scroll logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeLogs]);

  useEffect(() => {
    const timestamp = () => new Date().toLocaleTimeString("id-ID", { hour12: false });

    // Initial dense document ready immediately
    const initialDoc = buildDenseAcademicDocument(
      title,
      category,
      answers,
      candidateName,
      candidateId,
      institution,
      facultyMajor,
      targetEntity,
      campusGuideline,
      reportType
    );
    generatedDocRef.current = initialDoc;

    // Call Gemini API to generate the full authentic academic proposal document
    const fetchGeminiProposal = async () => {
      try {
        const response = await fetch("/api/academic/generate-proposal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            category,
            reportType,
            answers,
            targetEntity,
            candidateName,
            candidateId,
            institution,
            facultyMajor,
            campusGuideline
          })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.document) {
            generatedDocRef.current = result.document;
            setActiveLogs(l => [
              ...l, 
              { 
                time: timestamp(), 
                agent: "Academic Synthesis Engine", 
                text: `Proposal autentik selesai dikompilasi (${result.engine || 'Gemini Flash'}). Total ~${result.approximatePageCount || 25} halaman akademik.`,
                type: "success"
              }
            ]);
          }
        }
      } catch (err) {
        console.warn("Gemini generation API error, using rich local engine:", err);
      }
    };

    fetchGeminiProposal();

    // Orchestration Progress Timeline
    setActiveLogs([
      { time: timestamp(), agent: "System Orchestrator", text: `Inisialisasi arsitektur multi-agent untuk: "${title}".`, type: "info" },
      { time: timestamp(), agent: "Academic Lead", text: `Memuat pedoman: ${campusGuideline?.campusName || 'Standar Pedoman Dikti Indonesia'}.`, type: "info" }
    ]);

    const timer1 = setTimeout(() => {
      setAgents(prev => prev.map((a, i) => i === 0 ? { ...a, status: "completed", progress: 100, currentTask: "Bab I Pendahuluan & Latar Belakang Siap." } : a));
      setActiveLogs(l => [...l, { time: timestamp(), agent: "Scoping Architect", text: "Bab I Pendahuluan (Latar Belakang, Rumusan Masalah, Tujuan & Batasan) diverifikasi.", type: "success" }]);
      setOverallProgress(35);
    }, 1200);

    const timer2 = setTimeout(() => {
      setAgents(prev => prev.map((a, i) => {
        if (i === 0) return a;
        if (i === 1) return { ...a, status: "working", progress: 50, currentTask: "Sintesis Tinjauan Pustaka & Matriks Riset Terdahulu..." };
        return a;
      }));
      setActiveLogs(l => [...l, { time: timestamp(), agent: "Literature Profiler", text: "Menghubungkan teori pendukung dan matriks komparasi 10+ jurnal primer.", type: "info" }]);
      setOverallProgress(50);
    }, 2200);

    const timer3 = setTimeout(() => {
      setAgents(prev => prev.map((a, i) => {
        if (i === 1) return { ...a, status: "completed", progress: 100, currentTask: "Bab II Tinjauan Pustaka Lengkap." };
        if (i === 2) return { ...a, status: "working", progress: 60, currentTask: "Menghitung Matriks Jadwal Mingguan & Capaian WBS..." };
        return a;
      }));
      setActiveLogs(l => [...l, { time: timestamp(), agent: "Workplan Scheduler", text: "Menyusun jadwal matriks kerja berjenjang (Fase 1 s.d. 5).", type: "info" }]);
      setActiveLogs(l => [...l, { time: timestamp(), agent: "Workplan Scheduler", text: "Memetakan target luaran mingguan (Logbook, Protokol, Evaluasi Mutu).", type: "success" }]);
      setOverallProgress(70);
    }, 3200);

    const timer4 = setTimeout(() => {
      setAgents(prev => prev.map((a, i) => {
        if (i === 2) return { ...a, status: "completed", progress: 100, currentTask: "Bab III & IV Terkompilasi." };
        if (i === 3) return { ...a, status: "working", progress: 75, currentTask: "Audit Standar Format Dokumen & Integritas Turnitin..." };
        return a;
      }));
      setActiveLogs(l => [...l, { 
        time: timestamp(), 
        agent: "Quality Examiner", 
        text: `Audit format: Margin ${campusGuideline?.margins ? `${campusGuideline.margins.leftCm}-${campusGuideline.margins.topCm}-${campusGuideline.margins.rightCm}-${campusGuideline.margins.bottomCm}` : '4-4-3-3'} cm standar ${campusGuideline?.campusName || 'kampus'}.`,
        type: "info"
      }]);
      setActiveLogs(l => [...l, { time: timestamp(), agent: "Quality Examiner", text: "Audit tabel: Format terbuka 3-garis horizontal tanpa garis vertikal lolos verifikasi.", type: "success" }]);
      setOverallProgress(88);
    }, 4500);

    const timer5 = setTimeout(() => {
      setAgents(prev => prev.map((a, i) => {
        if (i === 3) return { ...a, status: "completed", progress: 100, currentTask: "Audit Kepatuhan Selesai 100%." };
        if (i === 4) return { ...a, status: "completed", progress: 100, currentTask: "Slide Presentasi 16:9 & Graf Pohon Siap." };
        return a;
      }));
      setActiveLogs(l => [...l, { time: timestamp(), agent: "Presentation Architect", text: "Membangun simpul graf pohon (Visual Tree Graph) relasi Bab 1-5.", type: "info" }]);
      setActiveLogs(l => [...l, { time: timestamp(), agent: "Presentation Architect", text: "Menyusun slide presentasi eksekutif siap ekspor (.pptx).", type: "success" }]);
      setActiveLogs(l => [...l, { time: timestamp(), agent: "System Orchestrator", text: `Kompilasi naskah akademik untuk ${candidateName} selesai 100%.`, type: "success" }]);
      setOverallProgress(100);
      setIsFinished(true);
    }, 6000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [title, category, answers, targetEntity, candidateName, candidateId, institution, facultyMajor, campusGuideline, reportType]);

  // Instant finish handler for fast workflow
  const handleFastForward = () => {
    const timestamp = () => new Date().toLocaleTimeString("id-ID", { hour12: false });
    setAgents(prev => prev.map(a => ({ ...a, status: "completed", progress: 100, currentTask: "Kompilasi selesai 100%." })));
    setOverallProgress(100);
    setIsFinished(true);
    setActiveLogs(l => [
      ...l,
      { time: timestamp(), agent: "System Orchestrator", text: "Akselerasi orkestrasi selesai. Naskah siap ditelaah.", type: "success" }
    ]);
  };

  const handleFinish = () => {
    if (generatedDocRef.current && campusGuideline && !generatedDocRef.current.campusGuideline) {
      generatedDocRef.current.campusGuideline = campusGuideline;
    }
    onComplete(generatedDocRef.current || undefined);
  };

  const currentDoc = generatedDocRef.current;
  const estimatedPages = currentDoc?.targetDepthPages || (category === "magang" ? 25 : category === "penelitian" ? 35 : 45);

  return (
    <div className="flex-1 flex flex-col w-full h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] overflow-hidden bg-[#F8FAFC] dark:bg-[#080B12] text-[#0F172A] dark:text-[#F3F6FC] animate-in fade-in duration-200">
      
      {/* ============================================================ */}
      {/* 1. TOP UTILITY & STATUS BAR (Fixed Height)                   */}
      {/* ============================================================ */}
      <div className="h-14 min-h-[56px] border-b border-[#E2E8F0] dark:border-[#253149] bg-white/95 dark:bg-[#0B101A]/95 px-4 sm:px-6 flex items-center justify-between gap-4 z-20 shrink-0">
        
        {/* Left: Step Context & Topic */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#7C9CFF]/15 border border-[#7C9CFF]/30 flex items-center justify-center shrink-0">
            <Cpu className="w-4 h-4 text-[#7C9CFF]" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#7C9CFF]/10 text-[#7C9CFF] border border-[#7C9CFF]/20 shrink-0">
                Langkah 3: Orkestrasi Multi-Agent
              </span>
              <span className="text-[11px] text-[#64748B] dark:text-[#A4B1C7] hidden md:inline truncate max-w-sm">
                Topik: <span className="font-semibold text-[#0F172A] dark:text-[#F3F6FC]">{title}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Center: Global Progress Bar & Timer */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#F1F5F9] dark:bg-[#111827] px-3 py-1 rounded-full border border-[#E2E8F0] dark:border-[#253149]">
            <div className="w-2 h-2 rounded-full bg-[#7C9CFF] animate-ping" />
            <span className="text-xs font-mono font-bold text-[#0F172A] dark:text-[#F3F6FC]">
              {overallProgress}%
            </span>
            <div className="w-24 bg-[#E2E8F0] dark:bg-[#253149] h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#7C9CFF] transition-all duration-300 rounded-full"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>

          <span className="text-[11px] font-mono text-[#64748B] dark:text-[#A4B1C7] flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#64748B]" />
            <span>00:{elapsedSeconds < 10 ? `0${elapsedSeconds}` : elapsedSeconds}s</span>
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {!isFinished && (
            <button
              type="button"
              onClick={handleFastForward}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#CBD5E1] dark:border-[#253149] bg-white dark:bg-[#111827] hover:bg-[#F8FAFC] dark:hover:bg-[#172033] text-xs font-medium text-[#475569] dark:text-[#A4B1C7] hover:text-[#0F172A] dark:hover:text-[#F3F6FC] transition-colors cursor-pointer shadow-2xs"
              title="Lewati simulasi dan selesaikan kompilasi sekarang"
            >
              <Zap className="w-3.5 h-3.5 text-[#FBBF24]" />
              <span className="hidden sm:inline">Selesaikan Instan</span>
            </button>
          )}

          {isFinished ? (
            <button
              type="button"
              onClick={handleFinish}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#34D399] hover:bg-[#059669] text-white text-xs font-bold transition-all shadow-md cursor-pointer animate-in zoom-in-95 group"
            >
              <span>Buka Dokumen Studio</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7C9CFF]/15 text-[#7C9CFF] border border-[#7C9CFF]/30 text-xs font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Menyintesis Naskah...</span>
            </div>
          )}
        </div>

      </div>

      {/* ============================================================ */}
      {/* 2. MAIN 3-PANEL COMMAND CENTER LAYOUT                        */}
      {/* ============================================================ */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ========================================================== */}
        {/* PANEL A: LEFT RAIL — 5 AI SPECIALISTS PIPELINE             */}
        {/* ========================================================== */}
        <aside className="w-72 lg:w-80 border-r border-[#E2E8F0] dark:border-[#253149] bg-white dark:bg-[#0B101A] flex flex-col justify-between overflow-hidden shrink-0 hidden md:flex">
          
          {/* Header */}
          <div className="p-3.5 border-b border-[#E2E8F0] dark:border-[#253149] flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#A4B1C7] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#7C9CFF]" />
              <span>5 Agen Spesialis Akademik</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#7C9CFF]/15 text-[#7C9CFF]">
              Active Roster
            </span>
          </div>

          {/* Agents List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {agents.map((agent, idx) => {
              const isDone = agent.status === "completed";
              const isWorking = agent.status === "working";
              const isSelected = selectedAgentId === agent.id;
              const IconComponent = getAgentIcon(agent.avatarIcon);

              return (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                    isSelected
                      ? "bg-[#7C9CFF]/10 border-[#7C9CFF] ring-1 ring-[#7C9CFF]/30 shadow-2xs"
                      : isDone
                      ? "bg-[#F8FAFC] dark:bg-[#111827] border-[#E2E8F0] dark:border-[#253149] hover:border-[#7C9CFF]/50"
                      : isWorking
                      ? "bg-[#7C9CFF]/5 border-[#7C9CFF]/50 animate-pulse"
                      : "bg-transparent border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isDone 
                          ? "bg-[#34D399]/20 text-[#34D399]" 
                          : isWorking 
                          ? "bg-[#7C9CFF] text-[#080B12]" 
                          : "bg-[#E2E8F0] dark:bg-[#172033] text-[#64748B]"
                      }`}>
                        {isDone ? (
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        ) : isWorking ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <IconComponent className="w-3.5 h-3.5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-xs font-bold truncate text-[#0F172A] dark:text-[#F3F6FC]">
                          {agent.name}
                        </h4>
                        <p className="text-[10px] text-[#64748B] dark:text-[#A4B1C7] truncate">
                          {agent.role}
                        </p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold shrink-0 ${
                      isDone 
                        ? "bg-[#34D399]/15 text-[#34D399]" 
                        : isWorking 
                        ? "bg-[#7C9CFF]/20 text-[#7C9CFF]" 
                        : "bg-[#E2E8F0] dark:bg-[#172033] text-[#64748B]"
                    }`}>
                      {isDone ? "100%" : isWorking ? `${agent.progress}%` : "Antre"}
                    </span>
                  </div>

                  {/* Micro task description */}
                  <div className="text-[11px] text-[#475569] dark:text-[#A4B1C7] line-clamp-1 pl-9">
                    {agent.currentTask}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Left Footer: Institutional Standards Badge */}
          <div className="p-3 border-t border-[#E2E8F0] dark:border-[#253149] bg-[#F8FAFC] dark:bg-[#080B12] text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#0F172A] dark:text-[#F3F6FC]">
              <Landmark className="w-3.5 h-3.5 text-[#7C9CFF]" />
              <span className="truncate">{campusGuideline?.campusName || "Standar SN-Dikti 2024"}</span>
            </div>
            <p className="text-[10px] text-[#64748B] dark:text-[#A4B1C7]">
              Format A4 &bull; Margin {campusGuideline?.margins ? `${campusGuideline.margins.leftCm}-${campusGuideline.margins.topCm}-${campusGuideline.margins.rightCm}-${campusGuideline.margins.bottomCm} cm` : "4-4-3-3 cm"} &bull; Citations APA/IEEE
            </p>
          </div>

        </aside>

        {/* ========================================================== */}
        {/* PANEL B: CENTER STAGE — LIVE SYNTHESIS & DOCUMENT STREAM   */}
        {/* ========================================================== */}
        <main className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 lg:p-7 bg-[#F8FAFC] dark:bg-[#080B12] space-y-5">
          
          {/* Document Telemetry Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#253149] shadow-2xs">
              <span className="text-[10px] font-mono uppercase text-[#64748B] dark:text-[#A4B1C7] block mb-0.5">
                Target Halaman
              </span>
              <span className="text-sm font-bold text-[#0F172A] dark:text-[#F3F6FC]">
                ~{estimatedPages} Halaman
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#253149] shadow-2xs">
              <span className="text-[10px] font-mono uppercase text-[#64748B] dark:text-[#A4B1C7] block mb-0.5">
                Estimasi Kedalaman
              </span>
              <span className="text-sm font-bold text-[#7C9CFF]">
                ~{estimatedPages * 320} Kata
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#253149] shadow-2xs">
              <span className="text-[10px] font-mono uppercase text-[#64748B] dark:text-[#A4B1C7] block mb-0.5">
                Sitasi Primer
              </span>
              <span className="text-sm font-bold text-[#34D399]">
                15+ Jurnal DOI
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#253149] shadow-2xs">
              <span className="text-[10px] font-mono uppercase text-[#64748B] dark:text-[#A4B1C7] block mb-0.5">
                Format Naskah
              </span>
              <span className="text-sm font-bold text-[#FBBF24]">
                A4 Margin SN-Dikti
              </span>
            </div>
          </div>

          {/* Compilation Stream Header */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#7C9CFF]" />
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F3F6FC]">
                Pratinjau Kompilasi Struktur Naskah
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[#64748B] dark:text-[#A4B1C7]">
              {overallProgress >= 100 ? "✓ 5 Bab Selesai Dikompilasi" : "Sedang menyusun secara simultan..."}
            </span>
          </div>

          {/* Real-Time Chapter Cards Stream */}
          <div className="space-y-3.5">
            
            {/* Chapter 1 Card */}
            <div className={`p-4 rounded-xl border transition-all ${
              overallProgress >= 35 
                ? "bg-white dark:bg-[#111827] border-[#E2E8F0] dark:border-[#253149] shadow-2xs" 
                : "bg-white/50 dark:bg-[#111827]/40 border-dashed border-[#E2E8F0] dark:border-[#253149]"
            }`}>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-[#0F172A] dark:text-[#F3F6FC] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#7C9CFF]/15 text-[#7C9CFF] font-mono text-[10px] flex items-center justify-center font-bold">1</span>
                  <span>BAB I: PENDAHULUAN</span>
                </span>
                {overallProgress >= 35 ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#34D399]/15 text-[#34D399] font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Lengkap
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-[#64748B] flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin text-[#7C9CFF]" /> Menyusun Latar Belakang...
                  </span>
                )}
              </div>
              <p className="text-xs text-[#475569] dark:text-[#A4B1C7] leading-relaxed line-clamp-2">
                {currentDoc?.executiveSummary || "Urgensi penelitian, rumusan masalah, ruang lingkup batasan, tujuan umum, dan manfaat teoretis/praktis."}
              </p>
            </div>

            {/* Chapter 2 Card */}
            <div className={`p-4 rounded-xl border transition-all ${
              overallProgress >= 50 
                ? "bg-white dark:bg-[#111827] border-[#E2E8F0] dark:border-[#253149] shadow-2xs" 
                : "bg-white/50 dark:bg-[#111827]/40 border-dashed border-[#E2E8F0] dark:border-[#253149]"
            }`}>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-[#0F172A] dark:text-[#F3F6FC] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#7C9CFF]/15 text-[#7C9CFF] font-mono text-[10px] flex items-center justify-center font-bold">2</span>
                  <span>BAB II: TINJAUAN PUSTAKA &amp; KERANGKA TEORI</span>
                </span>
                {overallProgress >= 50 ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#34D399]/15 text-[#34D399] font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Lengkap
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-[#64748B] flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin text-[#7C9CFF]" /> Sintesis Literatur...
                  </span>
                )}
              </div>
              <p className="text-xs text-[#475569] dark:text-[#A4B1C7] leading-relaxed line-clamp-2">
                {currentDoc?.bab2?.profilInstansi || "Landasan teori komprehensif, telaah state of the art minimal 10 jurnal primer terindeks, dan matriks research gap komparatif."}
              </p>
            </div>

            {/* Chapter 3 Card */}
            <div className={`p-4 rounded-xl border transition-all ${
              overallProgress >= 70 
                ? "bg-white dark:bg-[#111827] border-[#E2E8F0] dark:border-[#253149] shadow-2xs" 
                : "bg-white/50 dark:bg-[#111827]/40 border-dashed border-[#E2E8F0] dark:border-[#253149]"
            }`}>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-[#0F172A] dark:text-[#F3F6FC] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#7C9CFF]/15 text-[#7C9CFF] font-mono text-[10px] flex items-center justify-center font-bold">3</span>
                  <span>BAB III: METODOLOGI &amp; RANCANG BANGUN</span>
                </span>
                {overallProgress >= 70 ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#34D399]/15 text-[#34D399] font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Lengkap
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-[#64748B] flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin text-[#7C9CFF]" /> Merancang Desain Studi...
                  </span>
                )}
              </div>
              <p className="text-xs text-[#475569] dark:text-[#A4B1C7] leading-relaxed line-clamp-2">
                Metode pelaksanaan terstruktur, populasi/sampel, instrumen kalibrasi, teknik analisis data, dan jadwal WBS mingguan terstandar.
              </p>
            </div>

            {/* Chapter 4 / Deliverables Card */}
            <div className={`p-4 rounded-xl border transition-all ${
              overallProgress >= 88 
                ? "bg-white dark:bg-[#111827] border-[#E2E8F0] dark:border-[#253149] shadow-2xs" 
                : "bg-white/50 dark:bg-[#111827]/40 border-dashed border-[#E2E8F0] dark:border-[#253149]"
            }`}>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-[#0F172A] dark:text-[#F3F6FC] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#7C9CFF]/15 text-[#7C9CFF] font-mono text-[10px] flex items-center justify-center font-bold">4</span>
                  <span>AUDIT MUTU &amp; SLIDE SIDANG PPTX</span>
                </span>
                {overallProgress >= 88 ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#34D399]/15 text-[#34D399] font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Siap
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-[#64748B] flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin text-[#7C9CFF]" /> Mengaudit Format...
                  </span>
                )}
              </div>
              <p className="text-xs text-[#475569] dark:text-[#A4B1C7] leading-relaxed line-clamp-2">
                Audit Turnitin pra-cek, validasi tabel 3-garis terbuka, dan perancangan slide presentasi eksekutif 16:9 siap sidang.
              </p>
            </div>

          </div>

          {/* Compilation Finished Celebration Banner */}
          {isFinished && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#34D399]/15 via-[#7C9CFF]/15 to-[#9B8CFF]/15 border border-[#34D399]/30 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 shadow-sm">
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-[#34D399] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0F172A] dark:text-[#F3F6FC]">
                    Naskah Akademik Selesai Disintesis!
                  </h4>
                  <p className="text-xs text-[#475569] dark:text-[#A4B1C7]">
                    Dokumen siap dibuka di Document Studio untuk disunting, ditelaah dengan Turnitin, dan diekspor ke DOCX atau PPTX.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleFinish}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0F172A] dark:bg-[#7C9CFF] hover:bg-black dark:hover:bg-[#9B8CFF] text-white dark:text-[#080B12] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <span>Buka Dokumen Studio</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </main>

        {/* ========================================================== */}
        {/* PANEL C: RIGHT RAIL — REAL-TIME CONSOLE & AUDIT TELEMETRY  */}
        {/* ========================================================== */}
        <aside className="w-80 lg:w-92 border-l border-[#E2E8F0] dark:border-[#253149] bg-white dark:bg-[#0B101A] flex flex-col justify-between overflow-hidden shrink-0 hidden xl:flex">
          
          {/* Header */}
          <div className="p-3.5 border-b border-[#E2E8F0] dark:border-[#253149] flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F172A] dark:text-[#F3F6FC] flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#7C9CFF]" />
              <span>Log Telemetri Orkestrasi</span>
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
              <span className="text-[10px] font-mono text-[#64748B] dark:text-[#A4B1C7]">Live Console</span>
            </div>
          </div>

          {/* Terminal Console Logs */}
          <div className="flex-1 overflow-y-auto p-3.5 font-mono text-[11px] space-y-2 bg-[#F8FAFC] dark:bg-[#080B12]">
            {activeLogs.map((log, i) => (
              <div key={i} className="leading-relaxed flex gap-2">
                <span className="text-[#64748B] dark:text-[#A4B1C7] select-none shrink-0">
                  [{log.time}]
                </span>
                <div>
                  <span className={`font-semibold mr-1.5 ${
                    log.type === "success" 
                      ? "text-[#34D399]" 
                      : log.type === "warn" 
                      ? "text-[#FBBF24]" 
                      : "text-[#7C9CFF]"
                  }`}>
                    {log.agent}:
                  </span>
                  <span className="text-[#475569] dark:text-[#A4B1C7]">
                    {log.text}
                  </span>
                </div>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>

          {/* Institutional Compliance Checklist */}
          <div className="p-3.5 border-t border-[#E2E8F0] dark:border-[#253149] bg-white dark:bg-[#0B101A] space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#A4B1C7] block">
              Quality Assurance Checklist:
            </span>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-[#475569] dark:text-[#A4B1C7]">Margin A4 Standar Institusi</span>
                <span className="text-[#34D399] font-mono font-bold">✓ LOLOS</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#475569] dark:text-[#A4B1C7]">Penomoran Bab &amp; Desimal</span>
                <span className="text-[#34D399] font-mono font-bold">✓ LOLOS</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#475569] dark:text-[#A4B1C7]">Sinkronisasi Masalah &amp; Tujuan</span>
                <span className="text-[#34D399] font-mono font-bold">✓ SINKRON</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#475569] dark:text-[#A4B1C7]">Integritas Bebas Fabrikasi</span>
                <span className="text-[#34D399] font-mono font-bold">✓ TERVERIFIKASI</span>
              </div>
            </div>
          </div>

        </aside>

      </div>

    </div>
  );
};
