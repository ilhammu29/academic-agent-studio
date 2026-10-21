"use client";

import React from "react";
import { StudioStage } from "@/types/studio";
import { Check, Edit3, MessageSquareCode, Cpu, FileText } from "lucide-react";

interface StageStepperProps {
  currentStage: StudioStage;
  setStage: (stage: StudioStage) => void;
  canNavigateTo: (stage: StudioStage) => boolean;
}

export const StageStepper: React.FC<StageStepperProps> = ({
  currentStage,
  setStage,
  canNavigateTo
}) => {
  const stages: { key: StudioStage; num: string; label: string; desc: string; icon: any }[] = [
    {
      key: "input",
      num: "01",
      label: "LINGKUP & JUDUL",
      desc: "Topik & Identitas",
      icon: Edit3
    },
    {
      key: "interview",
      num: "02",
      label: "DIAGNOSTIK INTERVIEW",
      desc: "Sesi Tanya-Jawab Kritis",
      icon: MessageSquareCode
    },
    {
      key: "orchestration",
      num: "03",
      label: "AGENT ORKESTRASI",
      desc: "5 AI Spesialis Bekerja",
      icon: Cpu
    },
    {
      key: "result",
      num: "04",
      label: "STUDIO & TREE GRAPH",
      desc: "Naskah & Peta Struktur",
      icon: FileText
    }
  ];

  const getStageIndex = (key: StudioStage) => stages.findIndex(s => s.key === key);
  const currentIndex = getStageIndex(currentStage);

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6 border-b border-matte-border bg-matte-bg">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isActive = stage.key === currentStage;
          const isPassed = idx < currentIndex;
          const isClickable = canNavigateTo(stage.key);

          return (
            <div
              key={stage.key}
              onClick={() => isClickable && setStage(stage.key)}
              className={`p-3.5 rounded-xl border transition-all duration-200 flex items-start gap-3 relative overflow-hidden ${
                isActive
                  ? "bg-matte-surface border-champagne/60 shadow-lg shadow-champagne/5"
                  : isPassed
                  ? "bg-matte-surface/70 border-matte-borderLight cursor-pointer hover:border-milk-muted/50"
                  : "bg-matte-surface/20 border-matte-border/50 opacity-60 cursor-not-allowed"
              }`}
            >
              {/* Top Accent Line for Active Stage */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-champagne"></div>
              )}

              {/* Status Circle Badge */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 transition-colors ${
                  isActive
                    ? "bg-champagne text-matte-bg"
                    : isPassed
                    ? "bg-matte-surface2 text-emerald-400 border border-emerald-500/40"
                    : "bg-matte-surface text-milk-dim border border-matte-border"
                }`}
              >
                {isPassed ? <Check className="w-3.5 h-3.5" /> : stage.num}
              </div>

              {/* Text Meta */}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[11px] font-mono tracking-wider font-bold truncate ${
                      isActive
                        ? "text-milk-white"
                        : isPassed
                        ? "text-milk-soft"
                        : "text-milk-muted"
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
                <p className="text-[11px] text-milk-muted truncate mt-0.5 font-sans">
                  {stage.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
