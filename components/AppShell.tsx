'use client';

import React, { useState } from 'react';
import { 
  Home, 
  MessageSquareCode, 
  Cpu, 
  FileText, 
  Brain, 
  RotateCcw, 
  Cloud, 
  Menu,
  X,
  HardDrive
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
  activeTitle = 'Perancangan Usulan Akademik',
  currentUser,
  isSupabaseConfigured = false,
  children,
}: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const stageList: { id: StudioStage; label: string; shortLabel: string; icon: any }[] = [
    { id: 'input', label: 'Topik & Scope', shortLabel: 'Topik', icon: Home },
    { id: 'interview', label: 'Wawancara', shortLabel: 'Wawancara', icon: MessageSquareCode },
    { id: 'orchestration', label: 'Multi-Agent', shortLabel: 'Agen AI', icon: Cpu },
    { id: 'result', label: 'Studio Naskah', shortLabel: 'Studio', icon: FileText },
    { id: 'drive', label: 'Penyimpanan Drive', shortLabel: 'Drive', icon: HardDrive },
  ];

  const categoryLabels: Record<ProposalCategory, string> = {
    magang: 'Magang Industri',
    skripsi: 'Skripsi / TA',
    penelitian: 'Tesis & Hibah Riset'
  };

  return (
    <div className="min-h-screen w-full bg-[#000000] text-zinc-100 font-sans selection:bg-white selection:text-black antialiased flex flex-col md:flex-row">
      
      {/* ============================================================ */}
      {/* 1. DESKTOP MINIMALIST LEFT NAVIGATION RAIL */}
      {/* ============================================================ */}
      <aside className="hidden md:flex w-16 lg:w-18 h-screen fixed left-0 top-0 bottom-0 bg-[#000000] border-r border-zinc-900 flex-col items-center justify-between py-6 z-40">
        
        {/* Top: Sleek Minimal Mark */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => onNavigateStage('input')}
            title="Beranda Studio"
            className="w-10 h-10 rounded-lg bg-zinc-100 text-black flex items-center justify-center font-bold text-xs tracking-wider hover:bg-white transition-all cursor-pointer"
          >
            LIX
          </button>
        </div>

        {/* Center: Stage Nav Icons */}
        <nav className="flex flex-col items-center gap-2 w-full px-2">
          {stageList.map((item) => {
            const Icon = item.icon;
            const isActive = currentStage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigateStage(item.id)}
                title={item.label}
                className={`relative w-11 h-11 rounded-lg flex items-center justify-center transition-all cursor-pointer group ${
                  isActive
                    ? 'text-white bg-zinc-900'
                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-950'
                }`}
              >
                {/* Active Indicator Line */}
                {isActive && (
                  <span className="absolute left-0 top-2.5 bottom-2.5 w-0.5 bg-white rounded-r" />
                )}
                <Icon className="w-4 h-4 stroke-[1.75]" />

                {/* Floating Tooltip */}
                <div className="absolute left-14 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-200 font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg z-50">
                  {item.label}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom: Utilities (12 Modes, Reset, Profile) */}
        <div className="flex flex-col items-center gap-2 w-full px-2">
          {/* 12 Thinking Modes Trigger */}
          <button
            onClick={onOpenTwelveModes}
            title="12 Metode Berpikir Ilmiah"
            className="relative w-10 h-10 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-950 flex items-center justify-center transition-all cursor-pointer group"
          >
            <Brain className="w-4 h-4 stroke-[1.75]" />
            <div className="absolute left-14 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-200 font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg z-50">
              12 Metode Berpikir
            </div>
          </button>

          {/* Reset Session */}
          <button
            onClick={onResetSession}
            title="Reset / Buat Proposal Baru"
            className="relative w-10 h-10 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-950/20 flex items-center justify-center transition-all cursor-pointer group"
          >
            <RotateCcw className="w-4 h-4 stroke-[1.75]" />
            <div className="absolute left-14 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-200 font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg z-50">
              Mulai Ulang Sesi
            </div>
          </button>

          {/* User Profile */}
          <button
            onClick={onOpenAuth}
            title={`${currentUser.name} (${currentUser.role})`}
            className="w-8 h-8 mt-1 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 flex items-center justify-center cursor-pointer transition-colors"
          >
            {currentUser.name.charAt(0).toUpperCase()}
          </button>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. MOBILE TOP BAR */}
      {/* ============================================================ */}
      <header className="md:hidden sticky top-0 z-40 w-full h-14 bg-[#000000]/95 border-b border-zinc-900 px-4 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded bg-zinc-100 text-black font-bold text-xs flex items-center justify-center">
            LIX
          </span>
          <span className="text-xs font-semibold tracking-tight text-zinc-200">
            Academic Studio
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenTwelveModes}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
            title="12 Metode Berpikir"
          >
            <Brain className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenAuth}
            className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-semibold text-zinc-300 flex items-center justify-center"
          >
            {currentUser.name.charAt(0)}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-14 bg-[#09090b] border-b border-zinc-800 p-4 z-40 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150 shadow-2xl">
          <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium px-2 py-1">
            Navigasi Tahapan
          </div>
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
                className={`w-full px-3 py-2.5 rounded-lg flex items-center gap-3 text-xs transition-colors text-left ${
                  isActive 
                    ? 'bg-zinc-100 text-black font-semibold' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-3 mt-2 border-t border-zinc-900 flex items-center justify-between px-2 text-xs text-zinc-400">
            <span>{currentUser.name}</span>
            <button
              onClick={() => {
                onResetSession();
                setMobileMenuOpen(false);
              }}
              className="text-red-400 hover:underline flex items-center gap-1 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Sesi
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. MAIN WORKSPACE VIEWPORT */}
      {/* ============================================================ */}
      <div className="flex-1 md:pl-16 lg:pl-18 min-h-screen flex flex-col overflow-x-hidden">
        
        {/* TOP MINIMALIST HEADER BAR */}
        <div className="w-full h-14 border-b border-zinc-900 bg-[#000000]/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          
          {/* Left: Minimal Context & Title */}
          <div className="flex items-center gap-3 overflow-hidden pr-4">
            <span className="text-[11px] font-medium text-zinc-400 whitespace-nowrap">
              {categoryLabels[activeCategory] || 'Akademik'}
            </span>
            <span className="text-zinc-700 select-none">/</span>
            <h1 className="text-xs sm:text-sm font-medium text-zinc-200 truncate max-w-[200px] sm:max-w-md lg:max-w-xl">
              {activeTitle}
            </h1>
          </div>

          {/* Right: Clean Step Navigation & Cloud Status */}
          <div className="flex items-center gap-3 flex-shrink-0">
            
            {/* Desktop Stage Progress Segment */}
            <nav className="hidden lg:flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-900 text-xs">
              {stageList.map((stg, idx) => {
                const isActive = currentStage === stg.id;
                return (
                  <button
                    key={stg.id}
                    onClick={() => onNavigateStage(stg.id)}
                    className={`px-3 py-1 rounded-md text-[11px] transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-zinc-100 text-black font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span>{idx + 1}. {stg.shortLabel}</span>
                  </button>
                );
              })}
            </nav>

            {/* Supabase Cloud Indicator */}
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
              title="Status Database & Cloud Storage"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isSupabaseConfigured ? 'Supabase Sync' : 'Local + Cloud'}
              </span>
            </button>
          </div>
        </div>

        {/* WORKSPACE CONTENT CANVAS */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col">
          {children}
        </main>
      </div>

      {/* ============================================================ */}
      {/* 4. MOBILE BOTTOM NAVIGATION */}
      {/* ============================================================ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-[#000000] border-t border-zinc-900 flex items-center justify-around px-2 z-40 backdrop-blur-md">
        {stageList.map((item) => {
          const Icon = item.icon;
          const isActive = currentStage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigateStage(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 transition-colors ${
                isActive ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] mt-0.5">{item.shortLabel}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
