"use client";

import React from "react";
import { ProposalCategory } from "@/types/studio";
import { Sparkles, Brain, Cpu, BookOpen, Layers } from "lucide-react";

interface HeaderProps {
  category: ProposalCategory;
  setCategory: (c: ProposalCategory) => void;
  onOpenThinkingModes: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  category,
  setCategory,
  onOpenThinkingModes,
  onReset
}) => {
  return (
    <header className="border-b border-matte-border bg-matte-bg/95 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Identity */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onReset}>
          <div className="w-10 h-10 rounded-lg bg-matte-surface border border-matte-border flex items-center justify-center text-champagne shadow-sm">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-lg text-milk-white tracking-wide">
                ACADEMIC PROPOSAL STUDIO
              </span>
              <span className="text-[10px] font-mono tracking-widest px-2 py-0.5 rounded border border-champagne/40 text-champagne bg-champagne/5 uppercase">
                v2.5 Anti-Slop
              </span>
            </div>
            <p className="text-xs text-milk-muted font-sans">
              Autonomous Multi-Agent Suite &bull; 12 High-Level Thinking Modes
            </p>
          </div>
        </div>

        {/* Category Switcher Tabs */}
        <div className="flex items-center p-1 rounded-lg bg-matte-surface border border-matte-border text-xs font-medium">
          <button
            onClick={() => setCategory("magang")}
            className={`px-3.5 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              category === "magang"
                ? "bg-matte-surface2 text-milk-white border border-matte-borderLight shadow-sm font-semibold"
                : "text-milk-muted hover:text-milk-soft hover:bg-matte-surface/60"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-champagne" />
            Proposal Magang & PKL
          </button>

          <button
            onClick={() => setCategory("skripsi")}
            className={`px-3.5 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              category === "skripsi"
                ? "bg-matte-surface2 text-milk-white border border-matte-borderLight shadow-sm font-semibold"
                : "text-milk-muted hover:text-milk-soft hover:bg-matte-surface/60"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-academic-blue" />
            Proposal Skripsi & Tesis
          </button>
        </div>

        {/* Action Controls & Thinking Mode Trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenThinkingModes}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-matte-border bg-matte-surface hover:bg-matte-surface2 hover:border-champagne/40 text-xs font-medium text-milk-soft hover:text-milk-white transition-all group"
          >
            <Brain className="w-4 h-4 text-champagne group-hover:scale-110 transition-transform" />
            <span>12 Metode Berpikir</span>
          </button>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-milk-muted pl-2 border-l border-matte-border">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>5 Agents Online</span>
          </div>
        </div>

      </div>
    </header>
  );
};
