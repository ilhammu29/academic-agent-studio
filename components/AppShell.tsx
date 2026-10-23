'use client';

import React, { useState } from 'react';
import { 
  Home, 
  MessageSquare, 
  FileText, 
  Folder, 
  Cloud, 
  Settings, 
  Search, 
  Sun, 
  Moon, 
  Bell, 
  ChevronDown, 
  Menu, 
  X,
  RotateCcw
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
  onOpenConsultation?: () => void;
  onOpenGuidelines?: () => void;
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
  onOpenConsultation,
  onOpenGuidelines,
  onResetSession,
  activeCategory = 'magang',
  activeTitle = '',
  currentUser,
  isSupabaseConfigured = false,
  children,
}: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Get user initials (e.g. "IM" for "Ilham Maulana")
  const userInitials = (currentUser.name || 'Ilham Maulana')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'IM';

  const navMenuItems = [
    {
      id: 'beranda',
      label: 'Beranda',
      icon: Home,
      isActive: currentStage === 'input' || currentStage === 'interview' || currentStage === 'orchestration',
      onClick: () => onNavigateStage('input')
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: MessageSquare,
      isActive: false,
      onClick: () => {
        if (onOpenConsultation) onOpenConsultation();
      }
    },
    {
      id: 'dokumen',
      label: 'Dokumen',
      icon: FileText,
      isActive: currentStage === 'result',
      onClick: () => onNavigateStage('result')
    },
    {
      id: 'proyek',
      label: 'Proyek',
      icon: Folder,
      isActive: false,
      onClick: onOpenDatabase
    },
    {
      id: 'drive',
      label: 'Drive',
      icon: Cloud,
      isActive: currentStage === 'drive',
      onClick: () => onNavigateStage('drive')
    },
    {
      id: 'pengaturan',
      label: 'Pengaturan',
      icon: Settings,
      isActive: false,
      onClick: () => {
        if (onOpenGuidelines) onOpenGuidelines();
        else onOpenAuth();
      }
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[#F9F9F8] dark:bg-[#000000] text-zinc-900 dark:text-zinc-100 font-sans antialiased flex flex-col transition-colors duration-200">
      
      {/* ============================================================ */}
      {/* 1. MINIMALIST DESKTOP LEFT SIDEBAR (Matching ui-referensi.png) */}
      {/* ============================================================ */}
      <aside className="hidden md:flex w-60 lg:w-64 h-screen fixed left-0 top-0 bottom-0 bg-[#F9F9F8] dark:bg-[#000000] border-r border-zinc-200/70 dark:border-zinc-800/80 flex-col justify-between p-5 z-40 transition-colors duration-200 select-none">
        
        {/* Top: Logo Brand "✦ LIX" */}
        <div>
          <div className="flex items-center gap-2.5 px-3 py-2 mb-6 cursor-pointer" onClick={() => onNavigateStage('input')}>
            {/* Minimal 4-Point Star Sparkle Icon */}
            <svg 
              className="w-5 h-5 text-zinc-950 dark:text-white flex-shrink-0" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
            </svg>
            <span className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
              LIX
            </span>
          </div>

          {/* Navigation Links List */}
          <nav className="flex flex-col gap-1.5 w-full">
            {navMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.isActive;
              return (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3.5 text-sm transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#ECECEC] dark:bg-zinc-800 text-zinc-950 dark:text-white font-medium shadow-2xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-900/60 font-normal'
                  }`}
                >
                  <Icon className="w-4 h-4 stroke-[2] flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Profile & Online Status Card */}
        <div className="pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60">
          <button
            onClick={onOpenAuth}
            className="w-full px-2.5 py-2 rounded-xl flex items-center gap-3 hover:bg-zinc-200/60 dark:hover:bg-zinc-900 transition-colors text-left cursor-pointer group"
          >
            {/* User Initials Avatar Circle */}
            <div className="w-9 h-9 rounded-full bg-[#18181B] dark:bg-zinc-100 text-white dark:text-zinc-950 font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
              {userInitials}
            </div>

            {/* User Name & Status */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-black dark:group-hover:text-white">
                {currentUser.name || 'Ilham Maulana'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse" />
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-normal">
                  Online
                </span>
              </div>
            </div>

            {/* Chevron Icon */}
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors flex-shrink-0" />
          </button>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. MINIMALIST TOP HEADER (Matching ui-referensi.png) */}
      {/* ============================================================ */}
      <header className="fixed top-0 right-0 left-0 md:left-60 lg:left-64 h-16 bg-[#F9F9F8]/90 dark:bg-[#000000]/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between z-30 transition-colors duration-200">
        
        {/* Left: Quick Search Capsule "🔍 Cari sesuatu..." */}
        <div className="relative flex-1 max-w-xs sm:max-w-sm">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
              placeholder="Cari sesuatu..."
              className="w-full h-9 rounded-full bg-[#F1F1EF] dark:bg-zinc-900/90 text-xs text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 pl-9 pr-4 border border-transparent focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-900 outline-none transition-all shadow-2xs"
            />
          </div>

          {/* Quick Command & Search Dropdown */}
          {showSearchDropdown && (
            <div className="absolute top-11 left-0 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl p-2 z-50 text-xs animate-in fade-in duration-100">
              <div className="text-[10px] uppercase font-semibold text-zinc-400 px-2 py-1">
                Aksi Cepat & Navigasi
              </div>
              <button
                onMouseDown={() => onNavigateStage('input')}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 text-zinc-700 dark:text-zinc-300"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Buat Usulan Baru</span>
              </button>
              <button
                onMouseDown={() => {
                  if (onOpenConsultation) onOpenConsultation();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 text-zinc-700 dark:text-zinc-300"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Konsultasi Ide & Masalah Magang</span>
              </button>
              <button
                onMouseDown={onOpenDatabase}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 text-zinc-700 dark:text-zinc-300"
              >
                <Folder className="w-3.5 h-3.5" />
                <span>Buka Riwayat Proyek Proposal</span>
              </button>
              <button
                onMouseDown={() => {
                  if (onOpenGuidelines) onOpenGuidelines();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 text-zinc-700 dark:text-zinc-300"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Pindai Format Kampus (Scan AI)</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Theme Switcher, Bell Icon, User Profile Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Theme Selector Pill "☼ Light ⌄" */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-zinc-200/50 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          >
            {theme === 'dark' ? (
              <Moon className="w-3.5 h-3.5 text-zinc-300" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-zinc-600" />
            )}
            <span className="capitalize">{theme === 'dark' ? 'Dark' : 'Light'}</span>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </button>

          {/* Notification Bell */}
          <button
            onClick={() => {
              if (onOpenTwelveModes) onOpenTwelveModes();
            }}
            title="12 Model Berpikir Ilmiah"
            className="p-2 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4 stroke-[1.85]" />
          </button>

          {/* User Avatar Circle Badge */}
          <button
            onClick={onOpenAuth}
            title={`${currentUser.name} (${currentUser.role})`}
            className="w-8 h-8 rounded-full bg-[#18181B] dark:bg-zinc-100 text-white dark:text-zinc-950 font-bold text-xs flex items-center justify-center cursor-pointer shadow-xs hover:scale-105 active:scale-95 transition-transform"
          >
            {userInitials}
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 3. MOBILE SLIDE-OUT MENU DRAWER */}
      {/* ============================================================ */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bg-white dark:bg-[#09090b] border-b border-zinc-200 dark:border-zinc-800 p-4 z-40 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150 shadow-2xl">
          <div className="text-[10px] uppercase font-semibold text-zinc-400 px-3">
            Menu Navigasi
          </div>
          {navMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  item.onClick();
                  setMobileMenuOpen(false);
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl flex items-center gap-3 text-xs transition-colors text-left ${
                  item.isActive 
                    ? 'bg-[#ECECEC] text-zinc-950 dark:bg-zinc-800 dark:text-white font-semibold' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
          
          <div className="pt-3 mt-2 border-t border-zinc-200 dark:border-zinc-900 flex items-center justify-between px-2 text-xs">
            <button
              onClick={() => {
                onResetSession();
                setMobileMenuOpen(false);
              }}
              className="text-red-500 hover:underline flex items-center gap-1.5 text-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sesi</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. WORKSPACE MAIN VIEWPORT */}
      {/* ============================================================ */}
      <main className="flex-1 md:ml-60 lg:ml-64 pt-16 min-h-screen flex flex-col overflow-x-hidden">
        {children}
      </main>

    </div>
  );
}
