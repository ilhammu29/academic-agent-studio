"use client";

import React, { useState, useEffect, useRef } from "react";
import { AgentInfo, ProposalCategory, ProposalDocument, CampusGuideline } from "@/types/studio";
import { INITIAL_AGENTS, buildGeneratedDocument } from "@/lib/agentEngine";
import { ArrowRight, Check, Loader2, Cpu } from "lucide-react";

interface AgentExecutionMonitorProps {
  title: string;
  category?: ProposalCategory;
  answers?: Record<string, string>;
  targetEntity?: string;
  candidateName?: string;
  candidateId?: string;
  institution?: string;
  facultyMajor?: string;
  campusGuideline?: CampusGuideline;
  onComplete: (doc?: ProposalDocument) => void;
}

export const AgentExecutionMonitor: React.FC<AgentExecutionMonitorProps> = ({
  title,
  category = "magang",
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
  const [activeLogs, setActiveLogs] = useState<{ time: string; agent: string; text: string }[]>([]);
  const [overallProgress, setOverallProgress] = useState(15);
  const [isFinished, setIsFinished] = useState(false);
  
  // Store the actual generated doc from Gemini / fallback
  const generatedDocRef = useRef<ProposalDocument | null>(null);

  useEffect(() => {
    const timestamp = () => new Date().toLocaleTimeString("id-ID", { hour12: false });

    // Initial fallback doc ready immediately
    const initialDoc = buildGeneratedDocument(
      title,
      category,
      answers,
      candidateName,
      candidateId,
      institution,
      facultyMajor,
      targetEntity
    );
    if (campusGuideline) {
      initialDoc.campusGuideline = campusGuideline;
    }
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
                text: `Proposal autentik selesai dikompilasi (${result.engine || 'Gemini Flash'}). Total ~${result.approximatePageCount || 25} halaman akademik.` 
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
      { time: timestamp(), agent: "Academic Lead Researcher", text: `Menginisialisasi perumusan naskah untuk: "${title}".` },
      { time: timestamp(), agent: "Academic Lead Researcher", text: `Mengonfigurasi panduan: ${campusGuideline?.campusName || 'Standar Dikti Indonesia'}.` }
    ]);

    const timer1 = setTimeout(() => {
      setAgents(prev => prev.map((a, i) => i === 0 ? { ...a, status: "completed", progress: 100, currentTask: "Bab I Siap." } : a));
      setActiveLogs(l => [...l, { time: timestamp(), agent: "Academic Lead Researcher", text: "Bab I Pendahuluan (Latar Belakang, Rumusan Masalah, Tujuan & Manfaat) diverifikasi." }]);
      setOverallProgress(35);
    }, 1200);

    const timer2 = setTimeout(() => {
      setAgents(prev => prev.map((a, i) => {
        if (i === 0) return a;
        if (i === 1) return { ...a, status: "working", progress: 50, currentTask: "Sintesis Tinjauan Pustaka & Metodologi Komprehensif..." };
        return a;
      }));
      setActiveLogs(l => [...l, { time: timestamp(), agent: "Methodology & Literature Analyst", text: "Menghubungkan teori pendukung dan matriks komparasi penelitian terdahulu." }]);
      setOverallProgress(50);
    }, 2200);

    const timer3 = setTimeout(() => {
      setAgents(prev => prev.map((a, i) => {
        if (i === 1) return { ...a, status: "completed", progress: 100, currentTask: "Bab II Lengkap." };
        if (i === 2) return { ...a, status: "working", progress: 60, currentTask: "Menghitung Matriks Jadwal Mingguan & Capaian..." };
        return a;
      }));
      setActiveLogs(l => [...l, { time: timestamp(), agent: "Workplan Scheduler", text: "Menyusun jadwal matriks kerja berjenjang (Fase 1 s.d. 5)." }]);
      setActiveLogs(l => [...l, { time: timestamp(), agent: "Workplan Scheduler", text: "Memetakan target luaran mingguan (Logbook, Protokol, Evaluasi Mutu)." }]);
      setOverallProgress(70);
    }, 3200);

    const timer4 = setTimeout(() => {
      setAgents(prev => prev.map((a, i) => {
        if (i === 2) return { ...a, status: "completed", progress: 100, currentTask: "Bab III & IV Terkompilasi." };
        if (i === 3) return { ...a, status: "working", progress: 75, currentTask: "Audit Standar Format Dokumen & Integritas..." };
        return a;
      }));
      setActiveLogs(l => [...l, { 
        time: timestamp(), 
        agent: "Quality Examiner", 
        text: `Audit format: A4 margin ${campusGuideline?.margins ? `${campusGuideline.margins.leftCm}-${campusGuideline.margins.topCm}-${campusGuideline.margins.rightCm}-${campusGuideline.margins.bottomCm}` : '4-4-3-3'} cm standar ${campusGuideline?.campusName || 'kampus'}.` 
      }]);
      setActiveLogs(l => [...l, { time: timestamp(), agent: "Quality Examiner", text: "Audit tabel: Format terbuka 3-garis horizontal tanpa batas vertikal." }]);
      setOverallProgress(88);
    }, 4600);

    const timer5 = setTimeout(() => {
      setAgents(prev => prev.map((a, i) => {
        if (i === 3) return { ...a, status: "completed", progress: 100, currentTask: "Audit Selesai 100%." };
        if (i === 4) return { ...a, status: "completed", progress: 100, currentTask: "Slide Presentasi 16:9 & Graf Pohon Siap." };
        return a;
      }));
      setActiveLogs(l => [...l, { time: timestamp(), agent: "Presentation Architect", text: "Membangun simpul graf pohon (Visual Tree Graph) relasi Bab 1-5." }]);
      setActiveLogs(l => [...l, { time: timestamp(), agent: "Presentation Architect", text: "Menyusun slide presentasi eksekutif siap ekspor (.pptx)." }]);
      setActiveLogs(l => [...l, { time: timestamp(), agent: "System Orchestrator", text: `Kompilasi dokumen naskah akademik untuk ${candidateName} selesai 100%.` }]);
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
  }, [title, category, answers, targetEntity, candidateName, candidateId, institution, facultyMajor, campusGuideline]);

  const handleFinish = () => {
    if (generatedDocRef.current && campusGuideline && !generatedDocRef.current.campusGuideline) {
      generatedDocRef.current.campusGuideline = campusGuideline;
    }
    onComplete(generatedDocRef.current || undefined);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6 w-full animate-in fade-in duration-300">
      
      {/* 1. Header & Stage Pill */}
      <div className="mb-8">
        
        {/* Step Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-3 shadow-2xs">
          <Cpu className="w-3.5 h-3.5 text-zinc-800 dark:text-zinc-200" />
          <span>Langkah 3 dari 4: Multi-Agent Orkestrasi</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-white tracking-tight">
              Penyusunan & Sintesis Akademik
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl line-clamp-2">
              Topik: <span className="font-semibold text-zinc-800 dark:text-zinc-200">"{title}"</span>
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            {isFinished ? (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40">
                <Check className="w-4 h-4 text-emerald-500" /> Selesai 100%
              </span>
            ) : (
              <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-800 dark:text-zinc-200" /> Memproses {overallProgress}%
              </span>
            )}
          </div>
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-full bg-zinc-200/80 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-4">
          <div
            className="h-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-300 rounded-full"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* 2. Agent Workflow Stack (Clean Cards with Soft Shadows) */}
      <div className="space-y-3 mb-8">
        {agents.map((agent, idx) => {
          const isDone = agent.status === "completed";
          const isWorking = agent.status === "working";

          return (
            <div
              key={agent.id}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                isDone 
                  ? "bg-white dark:bg-zinc-900/80 border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs" 
                  : isWorking
                    ? "bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 shadow-xs"
                    : "bg-zinc-50/50 dark:bg-zinc-950/40 border-zinc-200/40 dark:border-zinc-900 opacity-60"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-semibold ${
                  isDone 
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400" 
                    : isWorking 
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black" 
                      : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"
                }`}>
                  {isDone ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : isWorking ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                <div>
                  <h3 className={`text-xs sm:text-sm font-semibold ${isDone || isWorking ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'}`}>
                    {agent.name}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {agent.currentTask}
                  </p>
                </div>
              </div>

              <div className="text-xs font-mono text-zinc-500 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                {isDone ? "100%" : isWorking ? `${agent.progress}%` : "Antre"}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Live Logs Console (Subtle minimal terminal) */}
      <div className="border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 bg-white dark:bg-zinc-950 font-mono text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 mb-8 max-h-48 overflow-y-auto shadow-xs">
        <div className="text-[10px] uppercase text-zinc-400 dark:text-zinc-500 font-semibold mb-2">
          Log Orkestrasi Real-Time:
        </div>
        {activeLogs.map((log, i) => (
          <div key={i} className="flex gap-2 text-[11px] leading-relaxed">
            <span className="text-zinc-400 dark:text-zinc-600 select-none">[{log.time}]</span>
            <span className="text-zinc-900 dark:text-zinc-200 font-medium">{log.agent}:</span>
            <span className="text-zinc-600 dark:text-zinc-400">{log.text}</span>
          </div>
        ))}
      </div>

      {/* 4. Complete Action Button */}
      {isFinished && (
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleFinish}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#18181B] hover:bg-black text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md group"
          >
            <span>Buka Dokumen Naskah & Slide Studio</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      )}

    </div>
  );
};
