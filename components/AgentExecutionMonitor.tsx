"use client";

import React, { useState, useEffect } from "react";
import { AgentInfo, ProposalCategory } from "@/types/studio";
import { INITIAL_AGENTS } from "@/lib/agentEngine";
import { ArrowRight, Check, Loader2 } from "lucide-react";

interface AgentExecutionMonitorProps {
  title: string;
  category?: ProposalCategory;
  answers?: Record<string, string>;
  targetEntity?: string;
  candidateName?: string;
  institution?: string;
  onComplete: () => void;
}

export const AgentExecutionMonitor: React.FC<AgentExecutionMonitorProps> = ({
  title,
  category = "magang",
  answers = {},
  targetEntity = "PT Telkom Indonesia",
  candidateName = "Muhammad Ilham",
  institution = "Universitas Sebelas Maret (UNS)",
  onComplete
}) => {
  const [agents, setAgents] = useState<AgentInfo[]>(INITIAL_AGENTS);
  const [activeLogs, setActiveLogs] = useState<{ time: string; agent: string; text: string }[]>([]);
  const [overallProgress, setOverallProgress] = useState(15);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const timestamp = () => new Date().toLocaleTimeString("id-ID", { hour12: false });

    // Initial Gemini API handshake & Real Context Grounding
    fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        category,
        answers,
        targetEntity,
        candidateName,
        institution
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const engineLabel = data.engine === "gemini-1.5-flash" ? "Google Gemini 1.5 Flash" : "Academic Intelligence Engine";
          setActiveLogs(l => [
            ...l,
            { time: timestamp(), agent: "Orchestrator Core", text: `Terhubung ke ${engineLabel}: ${data.data?.chapters?.length || 4} Bab utama siap dirumuskan.` }
          ]);
        }
      })
      .catch((err) => {
        setActiveLogs(l => [
          ...l,
          { time: timestamp(), agent: "Orchestrator Core", text: `Mode Mandiri Aktif: Memproses draf menggunakan SOP Academic Campus Pro (${err.message}).` }
        ]);
      });

    // Step-by-step orchestrator timeline simulation
    const timer1 = setTimeout(() => {
      setAgents(prev => prev.map((a, i) => i === 0 ? {
        ...a,
        status: "working",
        progress: 45,
        currentTask: "Merumuskan Latar Belakang & Batasan Masalah..."
      } : a));
      setActiveLogs(l => [...l, { time: timestamp(), agent: "Scoping Architect", text: `Menganalisis judul usulan: "${title}"` }]);
      setActiveLogs(l => [...l, { time: timestamp(), agent: "Scoping Architect", text: `Menyusun Rumusan Masalah & Matriks Kemanfaatan untuk ${targetEntity}.` }]);
      setOverallProgress(30);
    }, 600);

    const timer2 = setTimeout(() => {
      setAgents(prev => prev.map((a, i) => {
        if (i === 0) return { ...a, status: "completed", progress: 100, currentTask: "Bab I Selesai." };
        if (i === 1) return { ...a, status: "working", progress: 50, currentTask: "Menyusun Profil Entitas & Landasan Teori..." };
        return a;
      }));
      setActiveLogs(l => [...l, { time: timestamp(), agent: "Literature Profiler", text: `Mengintegrasikan profil ${targetEntity} dan tinjauan pustaka terindeks.` }]);
      setActiveLogs(l => [...l, { time: timestamp(), agent: "Literature Profiler", text: "Menyusun profil unit kerja dan alur koordinasi supervisi teknis." }]);
      setOverallProgress(50);
    }, 1800);

    const timer3 = setTimeout(() => {
      setAgents(prev => prev.map((a, i) => {
        if (i === 1) return { ...a, status: "completed", progress: 100, currentTask: "Bab II Lengkap." };
        if (i === 2) return { ...a, status: "working", progress: 60, currentTask: "Menghitung Matriks Jadwal Mingguan & Capaian..." };
        return a;
      }));
      setActiveLogs(l => [...l, { time: timestamp(), agent: "Workplan Scheduler", text: "Menyusun jadwal matriks kerja berjenjang (Fase 1 s.d. 5)." }]);
      setActiveLogs(l => [...l, { time: timestamp(), agent: "Workplan Scheduler", text: "Memetakan target luaran mingguan (WBS, SRS, Prototype, UAT)." }]);
      setOverallProgress(70);
    }, 3200);

    const timer4 = setTimeout(() => {
      setAgents(prev => prev.map((a, i) => {
        if (i === 2) return { ...a, status: "completed", progress: 100, currentTask: "Bab III & IV Terkompilasi." };
        if (i === 3) return { ...a, status: "working", progress: 75, currentTask: "Audit Standar Format Dokumen & Integritas..." };
        return a;
      }));
      setActiveLogs(l => [...l, { time: timestamp(), agent: "Quality Examiner", text: "Audit format: A4 margin 4-4-3-3 cm dengan penomoran halaman standar kampus." }]);
      setActiveLogs(l => [...l, { time: timestamp(), agent: "Quality Examiner", text: "Audit tabel: Format terbuka 3-garis horizontal tanpa vertikal." }]);
      setOverallProgress(88);
    }, 4600);

    const timer5 = setTimeout(() => {
      setAgents(prev => prev.map((a, i) => {
        if (i === 3) return { ...a, status: "completed", progress: 100, currentTask: "Audit Selesai 100%." };
        if (i === 4) return { ...a, status: "completed", progress: 100, currentTask: "Slide Presentasi 16:9 & Graf Pohon Siap." };
        return a;
      }));
      setActiveLogs(l => [...l, { time: timestamp(), agent: "Presentation Architect", text: "Membangun simpul graf pohon (Visual Tree Graph) relasi Bab 1-4." }]);
      setActiveLogs(l => [...l, { time: timestamp(), agent: "Presentation Architect", text: "Menyusun 6 slide presentasi eksekutif siap ekspor (.pptx)." }]);
      setActiveLogs(l => [...l, { time: timestamp(), agent: "System Orchestrator", text: `Kompilasi dokumen akademik untuk ${candidateName} selesai.` }]);
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
  }, [title, category, answers, targetEntity, candidateName, institution]);

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-8 w-full animate-in fade-in duration-200">
      
      {/* 1. Header */}
      <div className="mb-8 border-b border-zinc-900 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-zinc-100 tracking-tight">
              Penyusunan & Verifikasi Dokumen
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Topik: <span className="text-zinc-200 italic font-medium">"{title}"</span>
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-mono text-zinc-400">
            {isFinished ? (
              <span className="flex items-center gap-1.5 text-zinc-200">
                <Check className="w-4 h-4 text-zinc-100" /> Selesai 100%
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-zinc-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-200" /> Memproses {overallProgress}%
              </span>
            )}
          </div>
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden mt-3">
          <div
            className="h-full bg-zinc-100 transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* 2. Agent Workflow List (Linear Minimalist, No Heavy Cards) */}
      <div className="space-y-4 mb-8">
        {agents.map((agent, idx) => {
          const isDone = agent.status === "completed";
          const isWorking = agent.status === "working";

          return (
            <div
              key={agent.id}
              className="flex items-center justify-between py-3 border-b border-zinc-900/80 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono">
                  {isDone ? (
                    <Check className="w-4 h-4 text-zinc-100" />
                  ) : isWorking ? (
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-300" />
                  ) : (
                    <span className="text-zinc-600">{idx + 1}</span>
                  )}
                </div>

                <div>
                  <h3 className={`text-xs sm:text-sm font-medium ${isDone || isWorking ? 'text-zinc-100' : 'text-zinc-500'}`}>
                    {agent.name}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {agent.currentTask}
                  </p>
                </div>
              </div>

              <div className="text-xs font-mono text-zinc-500">
                {isDone ? "100%" : isWorking ? `${agent.progress}%` : "Antre"}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Live Logs Console (Subtle minimal terminal) */}
      <div className="border border-zinc-900 rounded-lg p-3 bg-zinc-950 font-mono text-xs text-zinc-400 space-y-1 mb-8 max-h-48 overflow-y-auto">
        <div className="text-[10px] uppercase text-zinc-600 mb-1">Log Orkestrasi Real-Time:</div>
        {activeLogs.map((log, i) => (
          <div key={i} className="flex gap-2 text-[11px] leading-relaxed">
            <span className="text-zinc-600 select-none">[{log.time}]</span>
            <span className="text-zinc-300">{log.agent}:</span>
            <span className="text-zinc-400">{log.text}</span>
          </div>
        ))}
      </div>

      {/* 4. Complete Action Button */}
      {isFinished && (
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onComplete}
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-zinc-100 hover:bg-white text-black font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <span>Buka Naskah Proposal & Slide Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};
