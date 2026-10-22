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
  HardDrive,
  Sun,
  Moon,
  ChevronRight,
  Database
} from 'lucide-react';
import { StudioStage, ProposalCategory } from '@/types/studio';
import { UserProfile } from '@/lib/supabase';
import { useTheme } from '@/components/ThemeProvider';

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
  const { theme, toggleTheme } = useTheme();

  const stageList: { id: StudioStage; label: string; shortLabel: string; icon: any; stepNumber: number }[] = [
    { id: 'input', label: 'Topik & Scope Usulan', shortLabel: 'Topik', icon: Home, stepNumber: 1 },
    { id: 'interview', label: 'Wawancara Diagnostik', shortLabel: 'Wawancara', icon: MessageSquareCode, stepNumber: 2 },
    { id: 'orchestration', label: 'Multi-Agent Orkestrasi', shortLabel: 'Agen AI', icon: Cpu, stepNumber: 3 },
    { id: 'result', label: 'Studio Naskah Proposal', shortLabel: 'Studio', icon: FileText, stepNumber: 4 },
    { id: 'drive', label: 'Penyimpanan File Drive', shortLabel: 'Drive', icon: HardDrive, stepNumber: 5 },
  ];

  const categoryLabels: Record<ProposalCategory, string> = {
    magang: 'Magang Industri',
    skripsi: 'Skripsi / TA',
    penelitian: 'Tesis & Riset'
  };

  return (
    <div className="min-h-screen w-full bg-zinc-50 dark:bg-[#000000] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white dark:selection:bg-white dark:selection:text-black antialiased flex flex-col md:flex-row transition-colors duration-200">
      
      {/* ============================================================ */}
      {/* 1. REDESIGNED DESKTOP MINIMALIST LEFT NAVIGATION RAIL */}
      {/* ============================================================ */}
      <aside className="hidden md:flex w-16 lg:w-[72px] h-screen fixed left-0 top-0 bottom-0 bg-white dark:bg-[#000000] border-r border-zinc-200 dark:border-zinc-900 flex-col items-center justify-between py-5 z-40 shadow-sm transition-colors duration-200">
        
        {/* Top: Sleek Minimal Branding Mark */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => onNavigateStage('input')}
            title="Beranda Academic Studio"
            className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black flex flex-col items-center justify-center font-bold text-xs tracking-wider hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <span>LIX</span>
          </button>
        </div>

        {/* Center: Stage Nav Icons with Enhanced Tooltips */}
        <nav className="flex flex-col items-center gap-2.5 w-full px-2">
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
                    ? 'text-white dark:text-black bg-zinc-900 dark:bg-zinc-100 shadow-sm'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                }`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <span className="absolute -left-2 top-3 bottom-3 w-1 bg-zinc-900 dark:bg-zinc-100 rounded-r-full" />
                )}
                <Icon className="w-4 h-4 stroke-[1.85]" />

                {/* Floating Tooltip */}
                <div className="absolute left-16 px-2.5 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-800 text-white text-[11px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-xl z-50 flex items-center gap-1.5">
                  <span className="font-mono text-zinc-400">{item.stepNumber}.</span>
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom: Utilities (Theme Switcher, 12 Modes, Drive/DB, Profile) */}
        <div className="flex flex-col items-center gap-2 w-full px-2">
          
          {/* Theme Switcher Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Beralih ke Mode Terang (Light Mode)' : 'Beralih ke Mode Gelap (Dark Mode)'}
            className="relative w-10 h-10 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center justify-center transition-all cursor-pointer group"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 stroke-[1.85] text-zinc-400 group-hover:text-zinc-100 transition-colors" />
            ) : (
              <Moon className="w-4 h-4 stroke-[1.85] text-zinc-600 group-hover:text-zinc-900 transition-colors" />
            )}
            <div className="absolute left-16 px-2.5 py-1 rounded-lg bg-zinc-900 dark:bg-zinc-800 text-white text-[11px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-xl z-50">
              {theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
            </div>
          </button>

          {/* 12 Thinking Modes Trigger */}
          <button
            onClick={onOpenTwelveModes}
            title="12 Metode Berpikir Ilmiah"
            className="relative w-10 h-10 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center justify-center transition-all cursor-pointer group"
          >
            <Brain className="w-4 h-4 stroke-[1.85]" />
            <div className="absolute left-16 px-2.5 py-1 rounded-lg bg-zinc-900 dark:bg-zinc-800 text-white text-[11px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-xl z-50">
              12 Metode Berpikir
            </div>
          </button>

          {/* Database Drawer Trigger */}
          <button
            onClick={onOpenDatabase}
            title="Riwayat Proposal & Database"
            className="relative w-10 h-10 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center justify-center transition-all cursor-pointer group"
          >
            <Database className="w-4 h-4 stroke-[1.85]" />
            <div className="absolute left-16 px-2.5 py-1 rounded-lg bg-zinc-900 dark:bg-zinc-800 text-white text-[11px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-xl z-50">
              Arsip & Database
            </div>
          </button>

          {/* User Profile Avatar */}
          <button
            onClick={onOpenAuth}
            title={`${currentUser.name} (${currentUser.role})`}
            className="w-8 h-8 mt-1 rounded-full bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-center cursor-pointer transition-colors shadow-sm"
          >
            {currentUser.name.charAt(0).toUpperCase()}
          </button>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. REDESIGNED MOBILE TOP BAR */}
      {/* ============================================================ */}
      <header className="md:hidden sticky top-0 z-40 w-full h-14 bg-white/95 dark:bg-[#000000]/95 border-b border-zinc-200 dark:border-zinc-900 px-4 flex items-center justify-between backdrop-blur-md transition-colors">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black font-bold text-xs flex items-center justify-center shadow-sm">
            LIX
          </span>
          <span className="text-xs font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Academic Studio
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
            {categoryLabels[activeCategory] || 'Akademik'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Mobile Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenTwelveModes}
            className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            title="12 Metode Berpikir"
          >
            <Brain className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenAuth}
            className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-800 text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-center"
          >
            {currentUser.name.charAt(0)}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-14 bg-white dark:bg-[#09090b] border-b border-zinc-200 dark:border-zinc-800 p-4 z-40 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150 shadow-2xl">
          <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium px-2 py-1">
            Navigasi Tahapan Usulan
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
                className={`w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-xs transition-colors text-left ${
                  isActive 
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black font-semibold shadow-sm' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.stepNumber}. {item.label}</span>
              </button>
            );
          })}
          
          <div className="pt-3 mt-2 border-t border-zinc-200 dark:border-zinc-900 flex items-center justify-between px-2 text-xs">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white font-medium"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{theme === 'dark' ? 'Mode Terang (Light)' : 'Mode Gelap (Dark)'}</span>
            </button>
            <button
              onClick={() => {
                onResetSession();
                setMobileMenuOpen(false);
              }}
              className="text-red-500 hover:underline flex items-center gap-1 text-xs"
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
      <div className="flex-1 md:pl-16 lg:pl-[72px] min-h-screen flex flex-col overflow-x-hidden">
        
        {/* REDESIGNED TOP HEADER NAVBAR */}
        <div className="w-full h-15 border-b border-zinc-200 dark:border-zinc-900 bg-white/80 dark:bg-[#000000]/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 transition-colors duration-200">
          
          {/* Left: Category Badge & Proposal Title Breadcrumb */}
          <div className="flex items-center gap-2.5 overflow-hidden pr-4">
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 whitespace-nowrap shadow-xs">
              {categoryLabels[activeCategory] || 'Akademik'}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600 flex-shrink-0" />
            <h1 
              title={activeTitle}
              className="text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-[180px] sm:max-w-xs md:max-w-md lg:max-w-lg cursor-default"
            >
              {activeTitle}
            </h1>
          </div>

          {/* Center/Right: Stepper Segment & Action Controls */}
          <div className="flex items-center gap-3 flex-shrink-0">
            
            {/* Desktop Stage Segmented Stepper */}
            <nav className="hidden lg:flex items-center gap-1 bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl border border-zinc-200 dark:border-zinc-900 text-xs shadow-xs">
              {stageList.map((stg) => {
                const isActive = currentStage === stg.id;
                return (
                  <button
                    key={stg.id}
                    onClick={() => onNavigateStage(stg.id)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-white dark:bg-zinc-100 text-zinc-900 dark:text-black font-semibold shadow-xs'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-900/60'
                    }`}
                  >
                    <span className="font-mono text-[10px] opacity-60">{stg.stepNumber}.</span>
                    <span>{stg.shortLabel}</span>
                  </button>
                );
              })}
            </nav>

            {/* Quick Theme Switcher Pill Button */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer shadow-xs"
              title={theme === 'dark' ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-zinc-300" />
                  <span className="hidden sm:inline text-[11px]">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-zinc-600" />
                  <span className="hidden sm:inline text-[11px]">Dark</span>
                </>
              )}
            </button>

            {/* Supabase Cloud Sync Pill */}
            <button
              onClick={onOpenAuth}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 bg-zinc-100/60 dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-colors"
              title="Status Database & Cloud Storage"
            >
              <Cloud className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-[11px]">
                {isSupabaseConfigured ? 'Sync Aktif' : 'Penyimpanan'}
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
      {/* 4. REDESIGNED MOBILE BOTTOM NAVIGATION */}
      {/* ============================================================ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white/95 dark:bg-[#000000]/95 border-t border-zinc-200 dark:border-zinc-900 flex items-center justify-around px-2 z-40 backdrop-blur-md transition-colors">
        {stageList.map((item) => {
          const Icon = item.icon;
          const isActive = currentStage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigateStage(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 text-[10px] font-medium transition-colors ${
                isActive 
                  ? 'text-zinc-900 dark:text-zinc-100 font-semibold' 
                  : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              <Icon className="w-4 h-4 stroke-[1.85]" />
              <span>{item.shortLabel}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}
