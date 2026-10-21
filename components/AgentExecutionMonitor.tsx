"use client";

import React, { useState, useEffect } from "react";
import { AgentInfo } from "@/types/studio";
import { INITIAL_AGENTS } from "@/lib/agentEngine";
import { ArrowRight, Cpu, Terminal, CheckCircle2, Loader2, Sparkles, AlertCircle } from "lucide-react";

interface AgentExecutionMonitorProps {
  title: string;
  onComplete: () => void;
}

export const AgentExecutionMonitor: React.FC<AgentExecutionMonitorProps> = ({
  title,
  onComplete
}) => {
  const [agents, setAgents] = useState<AgentInfo[]>(INITIAL_AGENTS);
  const [activeLogs, setActiveLogs] = useState<{ time: string; agent: string; text: string }[]>([]);
  const [overallProgress, setOverallProgress] = useState(15);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const timestamp = () => new Date().toLocaleTimeString("id-ID", { hour12: false });

    // Step-by-step orchestrator timeline simulation
    const timer1 = setTimeout(() => {
      setAgents(prev => prev.map((a, i) => i === 0 ? {
        ...a,
        status: "working",
        progress: 45,
        currentTask: "Merumuskan Latar Belakang Piramida Terbalik & Batasan Masalah..."
      } : a));
      setActiveLogs(l => [...l, { time: timestamp(), agent: "Scoping Architect", text: `Menganalisis topik: "${title}"` }]);
      setActiveLogs(l => [...l, { time: timestamp(), agent: "Scoping Architect", text: "Menyusun 3 Rumusan Masalah & Matriks Kemanfaatan 3-Pihak." }]);
      setOverallProgress(30);
    }, 600);

    const timer2 = setTimeout(() => {
      setAgents(prev => prev.map((a, i) => {
        if (i === 0) return { ...a, status: "completed", progress: 100, currentTask: "Bab I Selesai Divalidasi." };
        if (i === 1) return { ...a, status: "working", progress: 50, currentTask: "Menyusun Profil Entitas, Visi-Misi, & Landasan Teori Ilmiah..." };
        return a;
      }));
      setActiveLogs(l => [...l, { time: timestamp(), agent: "Literature Profiler", text: "Mengintegrasikan standar ISO 27001 dan Pressman & Maxim (2020)." }]);
      setActiveLogs(l => [...l, { time: timestamp(), agent: "Literature Profiler", text: "Menyusun profil unit kerja dan alur koordinasi supervisi teknis." }]);
      setOverallProgress(50);
    }, 1800);

    const timer3 = setTimeout(() => {
      setAgents(prev => prev.map((a, i) => {
        if (i === 1) return { ...a, status: "completed", progress: 100, currentTask: "Bab II Lengkap." };
        if (i === 2) return { ...a, status: "working", progress: 60, currentTask: "Mengkalkulasi Matriks Jadwal Mingguan & Kompetensi Taksonomi Bloom..." };
        return a;
      }));
      setActiveLogs(l => [...l, { time: timestamp(), agent: "Biostatistics Scheduler", text: "Menyusun jadwal Gantt Chart 16 minggu kerja berjenjang (Fase 1 s.d. 5)." }]);
      setActiveLogs(l => [...l, { time: timestamp(), agent: "Biostatistics Scheduler", text: "Memetakan target luaran mingguan (WBS, SRS, Prototype, UAT, Manual)." }]);
      setOverallProgress(70);
    }, 3200);

    const timer4 = setTimeout(() => {
      setAgents(prev => prev.map((a, i) => {
        if (i === 2) return { ...a, status: "completed", progress: 100, currentTask: "Bab III & IV Terkompilasi." };
        if (i === 3) return { ...a, status: "working", progress: 75, currentTask: "Menjalankan Audit Integritas: Anti-Fabrikasi & Standar 10-Layout..." };
        return a;
      }));
      setActiveLogs(l => [...l, { time: timestamp(), agent: "Quality Examiner", text: "Audit format fisik: A4 margin 4-3-3-3 cm, batas area cetak 14.0 cm terkunci aman." }]);
      setActiveLogs(l => [...l, { time: timestamp(), agent: "Quality Examiner", text: "Audit tabel: Format 3 garis horizontal terbuka, bebas garis vertikal." }]);
      setActiveLogs(l => [...l, { time: timestamp(), agent: "Quality Examiner", text: "Verifikasi Zero-Fabrication: Semua data dan rujukan memiliki landasan sah." }]);
      setOverallProgress(88);
    }, 4600);

    const timer5 = setTimeout(() => {
      setAgents(prev => prev.map((a, i) => {
        if (i === 3) return { ...a, status: "completed", progress: 100, currentTask: "Lolos Kualifikasi Audit 100%." };
        if (i === 4) return { ...a, status: "completed", progress: 100, currentTask: "Arsitektur Visual Tree & Slide Deck Hitam Doff Siap." };
        return a;
      }));
      setActiveLogs(l => [...l, { time: timestamp(), agent: "Presentation Architect", text: "Membangun simpul graf pohon (Visual Tree Graph) relasi Bab 1 s.d. 4." }]);
      setActiveLogs(l => [...l, { time: timestamp(), agent: "Presentation Architect", text: "Menghasilkan 6 slide seminar eksekutif (Hitam Doff & Putih Susu)." }]);
      setActiveLogs(l => [...l, { time: timestamp(), agent: "Orchestrator System", text: "Seluruh artefak dokumen telah berhasil dikompilasi secara paripurna." }]);
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
  }, [title]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      
      {/* Stage Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-champagne/30 bg-champagne/5 text-champagne text-xs font-mono font-bold uppercase tracking-wider mb-2">
          <Cpu className="w-3.5 h-3.5 animate-pulse" />
          Tahap 03 &bull; Orkestrasi 5 AI Agent Aktif
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-milk-white tracking-tight">
              Proses Kompilasi & Verifikasi Mandiri
            </h2>
            <p className="text-xs text-milk-muted font-mono mt-1">
              Topik: <span className="text-milk-soft italic font-serif">"{title}"</span>
            </p>
          </div>

          {/* Overall Progress Badge */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-matte-surface border border-matte-border self-start">
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase text-milk-muted">Total Progress</div>
              <div className="text-lg font-mono font-bold text-champagne">{overallProgress}%</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-matte-surface2 border border-matte-border flex items-center justify-center">
              {isFinished ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              ) : (
                <Loader2 className="w-6 h-6 text-champagne animate-spin" />
              )}
            </div>
          </div>
        </div>

        {/* Big Progress Bar */}
        <div className="mt-4 w-full bg-matte-surface h-2.5 rounded-full overflow-hidden border border-matte-border">
          <div
            className="h-full bg-gradient-to-r from-champagne-dark via-champagne to-champagne-light transition-all duration-500 ease-out"
            style={{ width: `${overallProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Agents Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-6">
        {agents.map((agent) => {
          const isDone = agent.status === "completed";
          const isWorking = agent.status === "working";

          return (
            <div
              key={agent.id}
              className={`p-4 rounded-xl border transition-all relative overflow-hidden ${
                isWorking
                  ? "bg-matte-surface border-champagne/70 shadow-lg shadow-champagne/5"
                  : isDone
                  ? "bg-matte-surface/90 border-matte-borderLight"
                  : "bg-matte-surface/40 border-matte-border/60 opacity-60"
              }`}
            >
              {/* Working Indicator Top Line */}
              {isWorking && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-champagne animate-pulse"></div>
              )}

              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold border"
                    style={{
                      backgroundColor: "#161619",
                      borderColor: agent.colorAccent,
                      color: agent.colorAccent
                    }}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isWorking ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "AG"
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-mono font-bold text-milk-white truncate max-w-[170px]">
                      {agent.name}
                    </h3>
                    <p className="text-[10px] text-milk-muted font-sans truncate max-w-[170px]">
                      {agent.role}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                    isDone
                      ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                      : isWorking
                      ? "text-champagne border-champagne/30 bg-champagne/10 animate-pulse"
                      : "text-milk-dim border-matte-border bg-matte-bg"
                  }`}
                >
                  {agent.status}
                </span>
              </div>

              {/* Current Task Description */}
              <p className="text-[11px] text-milk-soft font-sans line-clamp-2 h-8 leading-tight mt-1">
                {agent.currentTask}
              </p>

              {/* Micro Progress Bar */}
              <div className="mt-3 w-full bg-matte-bg h-1 rounded-full overflow-hidden border border-matte-border/60">
                <div
                  className="h-full bg-champagne transition-all duration-300"
                  style={{ width: `${agent.progress}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Terminal Live Activity Log */}
      <div className="p-4 md:p-5 rounded-2xl bg-matte-bg border border-matte-border font-mono text-xs shadow-inner">
        <div className="flex items-center justify-between border-b border-matte-border pb-3 mb-3">
          <div className="flex items-center gap-2 text-milk-muted">
            <Terminal className="w-4 h-4 text-champagne" />
            <span className="font-bold text-[11px] uppercase tracking-wider text-milk-soft">
              Stream Log Aktivitas Agen (Live Execution Console)
            </span>
          </div>
          <span className="text-[10px] text-milk-dim">Format: UTC+7 &bull; Real-time Audit</span>
        </div>

        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2">
          {activeLogs.map((log, index) => (
            <div key={index} className="flex items-start gap-2.5 text-[11px] leading-relaxed">
              <span className="text-milk-dim flex-shrink-0">[{log.time}]</span>
              <span className="text-champagne flex-shrink-0 font-bold truncate max-w-[140px]">
                {log.agent}:
              </span>
              <span className="text-milk-soft">{log.text}</span>
            </div>
          ))}
          {!isFinished && (
            <div className="flex items-center gap-2 text-[11px] text-milk-muted pt-1">
              <Loader2 className="w-3 h-3 animate-spin text-champagne" />
              <span>Memproses inferensi heuristik dan audit format akademik...</span>
            </div>
          )}
        </div>
      </div>

      {/* Completion Action */}
      <div className="mt-8 flex justify-center md:justify-end">
        <button
          onClick={onComplete}
          disabled={!isFinished}
          className="w-full md:w-auto px-8 py-3.5 rounded-xl bg-champagne hover:bg-champagne-light text-matte-bg font-sans font-bold text-sm tracking-wide transition-all shadow-xl shadow-champagne/15 flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Buka Studio Naskah & Peta Struktur Visual</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
