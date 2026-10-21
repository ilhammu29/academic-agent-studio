"use client";

import React from "react";
import { StudioStage, ProposalCategory } from "@/types/studio";
import { 
  Home, 
  MessageSquareCode, 
  Cpu, 
  FileText, 
  Brain, 
  Settings, 
  Sparkles, 
  RotateCcw,
  Network
} from "lucide-react";

interface AppShellProps {
  currentStage: StudioStage;
  setStage: (s: StudioStage) => void;
  canNavigateTo: (s: StudioStage) => boolean;
  onOpenThinkingModes: () => void;
  onReset: () => void;
  candidateName: string;
  category: ProposalCategory;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentStage,
  setStage,
  canNavigateTo,
  onOpenThinkingModes,
  onReset,
  candidateName,
  category,
  children
}) => {
  const navItems = [
    {
      stage: "input" as StudioStage,
      icon: Home,
      label: "Beranda & Judul"
    },
    {
      stage: "interview" as StudioStage,
      icon: MessageSquareCode,
      label: "Wawancara Diagnostik"
    },
    {
      stage: "orchestration" as StudioStage,
      icon: Cpu,
      label: "Multi-Agent Hub"
    },
    {
      stage: "result" as StudioStage,
      icon: FileText,
      label: "Studio Naskah & Graf"
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[#080B10] ambient-glow flex items-center justify-center p-3 sm:p-6 lg:p-10 font-sans selection:bg-sky-500/25">
      
      {/* The Floating Canvas Window from Reference (Rounded 36px, Dark Matte Surface, Subtle Border) */}
      <div className="w-full max-w-[1360px] min-h-[760px] max-h-[94vh] bg-[#0C1017]/95 border border-[#1E2635] rounded-[32px] sm:rounded-[40px] shadow-2xl flex flex-col md:flex-row overflow-hidden relative backdrop-blur-2xl">
        
        {/* Left Vertical Dock (Sidebar from Reference Image) */}
        <aside className="w-full md:w-[76px] bg-[#0A0D13] border-b md:border-b-0 md:border-r border-[#19202D] flex md:flex-col items-center justify-between py-4 px-3 md:py-6 md:px-0 flex-shrink-0 z-20">
          
          {/* Top Logo (LIX in Reference) */}
          <div className="flex md:flex-col items-center gap-2">
            <button
              onClick={onReset}
              title="Academic Agent Studio"
              className="w-10 h-10 flex items-center justify-center font-sans font-black text-sm text-milk-white tracking-widest hover:text-sky-400 transition-colors cursor-pointer"
            >
              LIX
            </button>
          </div>

          {/* Center Navigation Icons Stack */}
          <nav className="flex md:flex-col items-center gap-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentStage === item.stage;
              const isEnabled = canNavigateTo(item.stage);

              return (
                <button
                  key={item.stage}
                  onClick={() => isEnabled && setStage(item.stage)}
                  disabled={!isEnabled}
                  title={item.label}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#00A3FF] text-white shadow-lg shadow-sky-500/30 scale-105"
                      : isEnabled
                      ? "bg-[#141A24] text-milk-muted hover:text-milk-white hover:bg-[#1E2634]"
                      : "opacity-30 cursor-not-allowed text-milk-dim"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </nav>

          {/* Bottom Utility Icons */}
          <div className="flex md:flex-col items-center gap-3">
            {/* 12 Thinking Modes Trigger */}
            <button
              onClick={onOpenThinkingModes}
              title="12 Metode Berpikir Tingkat Tinggi"
              className="w-10 h-10 rounded-full bg-[#141A24] text-amber-400/90 hover:text-amber-300 hover:bg-[#1E2634] flex items-center justify-center transition-all cursor-pointer"
            >
              <Brain className="w-4 h-4" />
            </button>

            {/* Reset / New Proposal */}
            <button
              onClick={onReset}
              title="Mulai Proposal Baru"
              className="w-10 h-10 rounded-full bg-[#141A24] text-milk-muted hover:text-milk-white hover:bg-[#1E2634] flex items-center justify-center transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* User Avatar Circle */}
            <div
              title={candidateName}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-500 border border-[#2B3547] flex items-center justify-center text-xs font-bold text-white shadow-inner flex-shrink-0"
            >
              {candidateName ? candidateName.charAt(0).toUpperCase() : "U"}
            </div>
          </div>

        </aside>

        {/* Main Content Workspace Container */}
        <main className="flex-1 flex flex-col overflow-y-auto relative bg-[#0C1017]">
          {children}
        </main>

      </div>

    </div>
  );
};
