'use client';

import React, { useState } from 'react';
import { 
  Home, 
  MessageSquareCode, 
  Cpu, 
  FileText, 
  Brain, 
  RotateCcw, 
  Database,
  Cloud, 
  User, 
  CheckCircle2, 
  Sparkles,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { StudioStage, ProposalCategory } from '@/types/studio';
import { UserProfile } from '@/lib/supabase';

interface AppShellProps {
  currentStage: StudioStage;
  onNavigateStage: (stage: StudioStage) => void;
  onOpenTwelveModes: () => void;
  onOpenDatabase: () => void;
  onOpenAuth: () => void;
  onResetSession: () => void;
  activeCategory?: ProposalCategory;
  activeTitle?: string;
  currentUser: UserProfile;
  isSupabaseConfigured?: boolean;
  children: React.ReactNode;
}

export default function AppShell({
  currentStage,
  onNavigateStage,
  onOpenTwelveModes,
  onOpenDatabase,
  onOpenAuth,
  onResetSession,
  activeCategory = 'magang',
  activeTitle = 'Perancangan Proposal Akademik & Magang',
  currentUser,
  isSupabaseConfigured = false,
  children,
}: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const stageList: { id: StudioStage; label: string; shortLabel: string; icon: any }[] = [
    { id: 'input', label: 'Topik & Scope', shortLabel: 'Topik', icon: Home },
    { id: 'interview', label: 'Wawancara Diagnostik', shortLabel: 'Wawancara', icon: MessageSquareCode },
    { id: 'orchestration', label: 'Multi-Agent Hub', shortLabel: 'Agen AI', icon: Cpu },
    { id: 'result', label: 'Studio Naskah & Graf', shortLabel: 'Studio', icon: FileText },
  ];

  const getCategoryBadge = () => {
    switch (activeCategory) {
      case 'magang':
        return { label: 'Magang Industri', class: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40' };
      case 'skripsi':
        return { label: 'Skripsi / TA', class: 'bg-sky-950/60 text-sky-400 border-sky-800/40' };
      case 'penelitian':
        return { label: 'Tesis & Hibah', class: 'bg-purple-950/60 text-purple-400 border-purple-800/40' };
      default:
        return { label: 'Akademik', class: 'bg-slate-900 text-slate-400 border-slate-700' };
    }
  };

  const badge = getCategoryBadge();

  return (
    <div className="min-h-screen w-full bg-[#07090E] ambient-gradient-bg flex flex-col md:flex-row text-milk-white font-sans selection:bg-sky-500/25 selection:text-white">
      {/* ============================================================ */}
      {/* DESKTOP PERMANENT LEFT DOCK (Rail) */}
      {/* ============================================================ */}
      <aside className="hidden md:flex w-20 h-screen fixed left-0 top-0 bottom-0 bg-[#090D15]/90 border-r border-[#171F2C] flex-col items-center justify-between py-5 z-40 backdrop-blur-xl">
        {/* Top Logo Mark */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => onNavigateStage('input')}
            title="Academic Agent Studio"
            className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500/20 to-cyan-500/10 border border-sky-500/30 flex items-center justify-center font-sans font-black text-sm text-milk-white tracking-widest hover:text-sky-300 hover:border-sky-400 transition-all cursor-pointer shadow-lg shadow-sky-500/10"
          >
            LIX
          </button>
          <span className="text-[9px] font-mono text-sky-400/80 font-semibold tracking-tighter">STUDIO</span>
        </div>

        {/* Center Stage Nav Icons */}
        <nav className="flex flex-col items-center gap-3">
          {stageList.map((item) => {
            const Icon = item.icon;
            const isActive = currentStage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigateStage(item.id)}
                title={item.label}
                className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-[#00A3FF] text-white shadow-lg shadow-sky-500/35 scale-105'
                    : 'bg-[#101622] text-milk-muted hover:text-milk-white hover:bg-[#182130] border border-[#1A2333]'
                }`}
              >
                <Icon className="w-5 h-5" />
                {/* Floating Tooltip */}
                <div className="absolute left-16 px-3 py-1.5 rounded-lg bg-[#0F1624] border border-[#223046] text-xs text-white font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all shadow-xl z-50">
                  {item.label}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom Utility Tools */}
        <div className="flex flex-col items-center gap-3">
          {/* Database & Arsip Proposal Drawer */}
          <button
            onClick={onOpenDatabase}
            title="Database & Arsip Proposal"
            className="relative w-10 h-10 rounded-xl bg-[#101622] border border-[#1A2333] hover:border-sky-500/50 hover:bg-[#182130] text-sky-400 flex items-center justify-center transition-all cursor-pointer group"
          >
            <Database className="w-4 h-4" />
            <div className="absolute left-14 px-3 py-1.5 rounded-lg bg-[#0F1624] border border-[#223046] text-xs text-white font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all shadow-xl z-50">
              Database & Arsip
            </div>
          </button>

          {/* 12 Thinking Modes Trigger */}
          <button
            onClick={onOpenTwelveModes}
            title="12 Metode Berpikir Ilmiah"
            className="relative w-10 h-10 rounded-xl bg-[#101622] border border-[#1A2333] hover:border-champagne hover:bg-[#182130] text-champagne flex items-center justify-center transition-all cursor-pointer group"
          >
            <Brain className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-champagne text-[9px] font-bold text-black flex items-center justify-center">
              12
            </span>
            <div className="absolute left-14 px-3 py-1.5 rounded-lg bg-[#0F1624] border border-[#223046] text-xs text-white font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all shadow-xl z-50">
              12 Metode Berpikir
            </div>
          </button>

          {/* Reset / New Session */}
          <button
            onClick={onResetSession}
            title="Reset / Buat Proposal Baru"
            className="relative w-10 h-10 rounded-xl bg-[#101622] border border-[#1A2333] hover:border-red-500/50 hover:bg-[#182130] text-milk-dim hover:text-red-400 flex items-center justify-center transition-all cursor-pointer group"
          >
            <RotateCcw className="w-4 h-4" />
            <div className="absolute left-14 px-3 py-1.5 rounded-lg bg-[#0F1624] border border-[#223046] text-xs text-white font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all shadow-xl z-50">
              Reset Sesi
            </div>
          </button>

          {/* User Profile Avatar */}
          <button
            onClick={onOpenAuth}
            title={`Profil: ${currentUser.name} (${currentUser.role})`}
            className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-sky-600 to-cyan-400 border-2 border-[#1E2635] flex items-center justify-center font-bold text-xs text-white shadow-md cursor-pointer group hover:scale-105 transition-all"
          >
            {currentUser.name.charAt(0).toUpperCase()}
            {/* Live Indicator */}
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0A0D13]" />
            <div className="absolute left-14 px-3 py-1.5 rounded-lg bg-[#0F1624] border border-[#223046] text-xs text-white font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all shadow-xl z-50">
              {currentUser.name} ({currentUser.role})
            </div>
          </button>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* MOBILE TOP BAR (Phone / Tablet) */}
      {/* ============================================================ */}
      <header className="md:hidden sticky top-0 z-40 w-full h-14 bg-[#090D15]/95 border-b border-[#171F2C] px-4 flex items-center justify-between backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500/20 to-cyan-500/10 border border-sky-500/30 flex items-center justify-center font-sans font-black text-xs text-white">
            LIX
          </span>
          <span className="text-xs font-bold text-milk-white">Academic Studio</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenDatabase}
            className="p-2 rounded-lg bg-[#121824] border border-[#1E2738] text-sky-400 text-xs flex items-center gap-1"
          >
            <Database className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenTwelveModes}
            className="p-2 rounded-lg bg-[#121824] border border-[#1E2738] text-champagne text-xs flex items-center gap-1"
          >
            <Brain className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenAuth}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center text-xs font-bold text-white"
          >
            {currentUser.name.charAt(0)}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-[#121824] border border-[#1E2738] text-milk-muted"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation if menu open */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-14 bg-[#090D15] border-b border-[#1A2333] p-4 z-40 space-y-2 shadow-2xl animate-in slide-in-from-top duration-200">
          <div className="text-[11px] font-mono text-milk-dim mb-2 uppercase tracking-wider">Tahapan Studio:</div>
          {stageList.map((item) => {
            const Icon = item.icon;
            const isActive = currentStage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigateStage(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl flex items-center gap-3 text-xs transition-colors ${
                  isActive ? 'bg-[#00A3FF] text-white font-semibold' : 'bg-[#101622] text-milk-muted hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-2 border-t border-[#1C2535] flex justify-between items-center text-xs text-milk-muted">
            <span>{currentUser.name} ({currentUser.institution})</span>
            <button
              onClick={() => {
                onResetSession();
                setMobileMenuOpen(false);
              }}
              className="text-red-400 text-xs flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MAIN VIEWPORT CANVAS (Full-Bleed Desktop) */}
      {/* ============================================================ */}
      <div className="flex-1 md:pl-20 min-h-screen flex flex-col overflow-x-hidden">
        {/* TOP STATUS BAR (Full Desktop) */}
        <div className="w-full h-14 border-b border-[#171F2C] bg-[#090D15]/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          {/* Left Breadcrumbs / Active Context */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-hidden pr-2">
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-semibold flex-shrink-0 ${badge.class}`}>
              {badge.label}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-milk-dim flex-shrink-0" />
            <h1 className="text-xs sm:text-sm font-semibold text-milk-white truncate max-w-[200px] sm:max-w-md lg:max-w-lg">
              {activeTitle}
            </h1>
          </div>

          {/* Right Stage & Cloud Indicators */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Desktop Stage Progress indicator */}
            <div className="hidden lg:flex items-center gap-1 bg-[#101622] border border-[#1A2333] p-1 rounded-xl">
              {stageList.map((stg, idx) => {
                const isActive = currentStage === stg.id;
                return (
                  <button
                    key={stg.id}
                    onClick={() => onNavigateStage(stg.id)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#00A3FF] text-white shadow-sm'
                        : 'text-milk-muted hover:text-white'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-black/20 text-[9px] flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span>{stg.shortLabel}</span>
                  </button>
                );
              })}
            </div>

            {/* Supabase Status Pill */}
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#111724] border border-[#1E283A] hover:border-sky-500/50 text-[11px] text-milk-muted hover:text-milk-white transition-colors cursor-pointer"
              title="Klik untuk membuka konfigurasi Supabase DB"
            >
              <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-sky-400'}`} />
              <Cloud className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline font-mono">
                {isSupabaseConfigured ? 'Supabase Sync' : 'Local + Supabase Ready'}
              </span>
            </button>

            {/* User Pill Button */}
            <button
              onClick={onOpenAuth}
              className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#111724] border border-[#1E283A] hover:border-sky-500/50 text-xs text-milk-white transition-colors cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center text-[10px] font-bold">
                {currentUser.name.charAt(0)}
              </div>
              <span className="text-[11px] font-medium">{currentUser.name.split(' ')[0]}</span>
            </button>
          </div>
        </div>

        {/* WORKSPACE CONTENT AREA (Fluid & Responsive) */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 flex flex-col">
          {children}
        </main>
      </div>

      {/* ============================================================ */}
      {/* MOBILE BOTTOM NAVIGATION BAR */}
      {/* ============================================================ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#090D15]/95 border-t border-[#171F2C] flex items-center justify-around px-2 z-40 backdrop-blur-xl">
        {stageList.map((item) => {
          const Icon = item.icon;
          const isActive = currentStage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigateStage(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all ${
                isActive ? 'text-[#00A3FF]' : 'text-milk-muted hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{item.shortLabel}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
