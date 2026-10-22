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
  ChevronRight,
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
    { id: 'drive', label: 'Drive Penyimpanan File', shortLabel: 'Drive', icon: HardDrive },
  ];

  const getCategoryBadge = () => {
    switch (activeCategory) {
      case 'magang':
        return { label: 'Magang Industri', class: 'bg-white/10 text-white border-white/20' };
      case 'skripsi':
        return { label: 'Skripsi / TA', class: 'bg-white/10 text-white border-white/20' };
      case 'penelitian':
        return { label: 'Tesis & Hibah', class: 'bg-white/10 text-white border-white/20' };
      default:
        return { label: 'Akademik', class: 'bg-white/10 text-white border-white/20' };
    }
  };

  const badge = getCategoryBadge();

  return (
    <div className="min-h-screen w-full bg-[#000000] text-white font-sans selection:bg-white selection:text-black antialiased">
      {/* ============================================================ */}
      {/* DESKTOP PERMANENT LEFT DOCK (Monochrome) */}
      {/* ============================================================ */}
      <aside className="hidden md:flex w-20 h-screen fixed left-0 top-0 bottom-0 bg-[#09090B] border-r border-[#27272A] flex-col items-center justify-between py-5 z-40 backdrop-blur-xl">
        {/* Top Logo Mark */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => onNavigateStage('input')}
            title="Academic Agent Studio"
            className="w-11 h-11 rounded-xl bg-white text-black border border-white flex items-center justify-center font-sans font-black text-sm tracking-widest hover:bg-gray-200 transition-all cursor-pointer shadow-md"
          >
            LIX
          </button>
          <span className="text-[9px] font-mono text-bw-dim font-semibold tracking-tighter">STUDIO</span>
        </div>

        {/* Center Stage Nav Icons */}
        <nav className="flex flex-col items-center gap-2.5">
          {stageList.map((item) => {
            const Icon = item.icon;
            const isActive = currentStage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigateStage(item.id)}
                title={item.label}
                className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-white text-black shadow-md scale-105'
                    : 'bg-[#121214] text-bw-muted hover:text-white hover:bg-[#18181B] border border-[#27272A]'
                }`}
              >
                <Icon className="w-5 h-5" />
                {/* Floating Tooltip */}
                <div className="absolute left-16 px-3 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-xs text-white font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all shadow-xl z-50">
                  {item.label}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom Utility Tools */}
        <div className="flex flex-col items-center gap-2.5">
          {/* Drive Shortcut */}
          <button
            onClick={() => onNavigateStage('drive')}
            title="Drive Penyimpanan File"
            className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group ${
              currentStage === 'drive'
                ? 'bg-white text-black'
                : 'bg-[#121214] border border-[#27272A] hover:bg-[#18181B] text-white'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <div className="absolute left-14 px-3 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-xs text-white font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all shadow-xl z-50">
              Drive File Saya
            </div>
          </button>

          {/* 12 Thinking Modes Trigger */}
          <button
            onClick={onOpenTwelveModes}
            title="12 Metode Berpikir Ilmiah"
            className="relative w-10 h-10 rounded-xl bg-[#121214] border border-[#27272A] hover:bg-[#18181B] text-white flex items-center justify-center transition-all cursor-pointer group"
          >
            <Brain className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-[9px] font-bold text-black flex items-center justify-center">
              12
            </span>
            <div className="absolute left-14 px-3 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-xs text-white font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all shadow-xl z-50">
              12 Metode Berpikir
            </div>
          </button>

          {/* Reset / New Session */}
          <button
            onClick={onResetSession}
            title="Reset / Buat Proposal Baru"
            className="relative w-10 h-10 rounded-xl bg-[#121214] border border-[#27272A] hover:bg-red-950/40 text-bw-dim hover:text-red-400 flex items-center justify-center transition-all cursor-pointer group"
          >
            <RotateCcw className="w-4 h-4" />
            <div className="absolute left-14 px-3 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-xs text-white font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all shadow-xl z-50">
              Reset Sesi
            </div>
          </button>

          {/* User Profile Avatar */}
          <button
            onClick={onOpenAuth}
            title={`Profil: ${currentUser.name} (${currentUser.role})`}
            className="relative w-10 h-10 rounded-full bg-[#18181B] border border-[#3F3F46] flex items-center justify-center font-bold text-xs text-white shadow-md cursor-pointer group hover:scale-105 transition-all"
          >
            {currentUser.name.charAt(0).toUpperCase()}
            {/* Live Indicator */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-white border-2 border-[#09090B]" />
            <div className="absolute left-14 px-3 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-xs text-white font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all shadow-xl z-50">
              {currentUser.name} ({currentUser.role})
            </div>
          </button>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* MOBILE TOP BAR */}
      {/* ============================================================ */}
      <header className="md:hidden sticky top-0 z-40 w-full h-14 bg-[#09090B] border-b border-[#27272A] px-4 flex items-center justify-between backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-white text-black font-sans font-black text-xs flex items-center justify-center">
            LIX
          </span>
          <span className="text-xs font-bold text-white">Academic Studio</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateStage('drive')}
            className="p-2 rounded-lg bg-[#121214] border border-[#27272A] text-white text-xs flex items-center gap-1"
          >
            <HardDrive className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenTwelveModes}
            className="p-2 rounded-lg bg-[#121214] border border-[#27272A] text-white text-xs flex items-center gap-1"
          >
            <Brain className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenAuth}
            className="w-8 h-8 rounded-full bg-[#18181B] border border-[#27272A] flex items-center justify-center text-xs font-bold text-white"
          >
            {currentUser.name.charAt(0)}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-[#121214] border border-[#27272A] text-bw-muted"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation if menu open */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-14 bg-[#09090B] border-b border-[#27272A] p-4 z-40 space-y-2 shadow-2xl animate-in slide-in-from-top duration-200">
          <div className="text-[11px] font-mono text-bw-dim mb-2 uppercase tracking-wider">Tahapan & Menu:</div>
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
                  isActive ? 'bg-white text-black font-semibold' : 'bg-[#121214] text-bw-muted hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-2 border-t border-[#1C1C1F] flex justify-between items-center text-xs text-bw-muted">
            <span>{currentUser.name}</span>
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
        {/* TOP STATUS BAR (Monochrome) */}
        <div className="w-full h-14 border-b border-[#27272A] bg-[#09090B]/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          {/* Left Breadcrumbs / Active Context */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-hidden pr-2">
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-semibold flex-shrink-0 ${badge.class}`}>
              {badge.label}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-bw-dim flex-shrink-0" />
            <h1 className="text-xs sm:text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-md lg:max-w-lg">
              {activeTitle}
            </h1>
          </div>

          {/* Right Stage & Cloud Indicators */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {/* Desktop Stage Progress indicator */}
            <div className="hidden lg:flex items-center gap-1 bg-[#121214] border border-[#27272A] p-1 rounded-xl">
              {stageList.map((stg, idx) => {
                const isActive = currentStage === stg.id;
                return (
                  <button
                    key={stg.id}
                    onClick={() => onNavigateStage(stg.id)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-white text-black font-semibold shadow-sm'
                        : 'text-bw-muted hover:text-white'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-black/10 text-[9px] flex items-center justify-center font-bold">
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
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#121214] border border-[#27272A] hover:border-white text-[11px] text-bw-muted hover:text-white transition-colors cursor-pointer"
              title="Klik untuk membuka konfigurasi Supabase DB"
            >
              <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-white animate-pulse' : 'bg-gray-400'}`} />
              <Cloud className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline font-mono">
                {isSupabaseConfigured ? 'Supabase Sync' : 'Local + Cloud'}
              </span>
            </button>

            {/* User Pill Button */}
            <button
              onClick={onOpenAuth}
              className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#121214] border border-[#27272A] hover:border-white text-xs text-white transition-colors cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-white/10 text-white border border-white/20 flex items-center justify-center text-[10px] font-bold">
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#09090B] border-t border-[#27272A] flex items-center justify-around px-2 z-40 backdrop-blur-xl">
        {stageList.map((item) => {
          const Icon = item.icon;
          const isActive = currentStage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigateStage(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all ${
                isActive ? 'text-white' : 'text-bw-muted hover:text-white'
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
