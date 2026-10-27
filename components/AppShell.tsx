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
  RotateCcw,
  Sparkles,
  GraduationCap,
  Plus,
  Presentation,
  Globe,
  Crown,
  Zap,
  Lock
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
  onOpenPayment?: () => void;
  onOpenSuperadmin?: () => void;
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
  onOpenPayment,
  onOpenSuperadmin,
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

  // User initials (e.g. "IM" for "Ilham Maulana")
  const userInitials = (currentUser.name || 'Ilham Maulana')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'IM';

  const navMenuItems = [
    {
      id: 'landing',
      label: 'Portal / Landing Page',
      icon: Globe,
      isActive: currentStage === 'landing',
      onClick: () => onNavigateStage('landing')
    },
    {
      id: 'beranda',
      label: 'Workspace Usulan (Input)',
      icon: Home,
      isActive: currentStage === 'input' || currentStage === 'interview' || currentStage === 'orchestration',
      onClick: () => onNavigateStage('input')
    },
    {
      id: 'new-proposal',
      label: 'Mulai Usulan Baru (+)',
      icon: Plus,
      isActive: false,
      onClick: () => {
        if (confirm("Mulai sesi usulan baru? Draf naskah Anda tetap tersimpan otomatis di Arsip Proyek.")) {
          onResetSession();
        }
      }
    },
    {
      id: 'chat',
      label: 'Klinik Bimbingan & Konsultasi',
      icon: MessageSquare,
      isActive: currentStage === 'consultation',
      onClick: () => {
        if (onOpenConsultation) onOpenConsultation();
      }
    },
    {
      id: 'dokumen',
      label: 'Dokumen Studio (Naskah)',
      icon: FileText,
      isActive: currentStage === 'result',
      onClick: () => onNavigateStage('result')
    },
    {
      id: 'slides',
      label: 'Slide Studio (PPTX 16:9)',
      icon: Presentation,
      isActive: currentStage === 'slides',
      onClick: () => onNavigateStage('slides')
    },
    {
      id: 'proyek',
      label: 'Arsip & Database Proyek',
      icon: Folder,
      isActive: false,
      onClick: onOpenDatabase
    },
    {
      id: 'drive',
      label: 'Penyimpanan File Drive',
      icon: Cloud,
      isActive: currentStage === 'drive',
      onClick: () => onNavigateStage('drive')
    },
    {
      id: 'pengaturan',
      label: 'Format Kampus & Pengaturan',
      icon: Settings,
      isActive: false,
      onClick: () => {
        if (onOpenGuidelines) onOpenGuidelines();
        else onOpenAuth();
      }
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] dark:bg-[#080B12] text-[#0F172A] dark:text-[#F3F6FC] font-sans antialiased flex flex-col transition-colors duration-200">
      
      {/* ============================================================ */}
      {/* 1. SLIM ICON-ONLY SIDEBAR RAIL (w-16 / 72px) - OXID BRAND     */}
      {/* ============================================================ */}
      <aside className="hidden md:flex w-16 lg:w-[72px] h-screen fixed left-0 top-0 bottom-0 bg-white dark:bg-[#0B101A] border-r border-[#E2E8F0] dark:border-[#253149] flex-col items-center justify-between py-5 z-40 transition-colors duration-200 select-none">
        
        {/* Top: Brand Logo Mark "OXID" (Retained structure & typography) */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => onNavigateStage('input')}
            title="OXID Academic Studio — Beranda"
            className="w-10 h-10 rounded-xl bg-[#0F172A] dark:bg-[#172033] border border-[#E2E8F0] dark:border-[#253149] text-white dark:text-[#7C9CFF] flex flex-col items-center justify-center font-bold tracking-tight hover:border-[#7C9CFF]/60 active:scale-95 transition-all cursor-pointer shadow-xs group"
          >
            <span className="font-mono font-black text-[11px] tracking-tight">OXID</span>
          </button>
        </div>

        {/* Center: Stage & Feature Navigation Icons with Floating Tooltips */}
        <nav className="flex flex-col items-center gap-2.5 w-full px-2">
          {navMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.isActive;
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer group ${
                  isActive
                    ? 'text-[#0F172A] dark:text-[#F3F6FC] bg-[#F1F5F9] dark:bg-[#172033] border border-[#E2E8F0] dark:border-[#7C9CFF]/40 shadow-xs'
                    : 'text-[#475569] dark:text-[#A4B1C7] hover:text-[#0F172A] dark:hover:text-[#F3F6FC] hover:bg-[#F1F5F9] dark:hover:bg-[#172033]/60'
                }`}
              >
                {/* Active Indicator Bar on Left */}
                {isActive && (
                  <span className="absolute -left-2 top-2.5 bottom-2.5 w-1 bg-[#7C9CFF] rounded-r-full" />
                )}
                
                <Icon className={`w-4 h-4 stroke-[2] ${isActive ? 'text-[#7C9CFF]' : ''}`} />

                {/* Floating Tooltip to the right */}
                <div className="absolute left-16 px-2.5 py-1.5 rounded-lg bg-[#0F172A] dark:bg-[#1C263A] border border-transparent dark:border-[#253149] text-white dark:text-[#F3F6FC] text-[11px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-xl z-50 flex items-center gap-1.5">
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom: Utilities (Theme Switcher & User Profile Avatar) */}
        <div className="flex flex-col items-center gap-2 w-full px-2">
          
          {/* Theme Switcher Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Beralih ke Mode Terang (Light)' : 'Beralih ke Mode Gelap (Dark)'}
            className="relative w-10 h-10 rounded-xl text-[#475569] dark:text-[#A4B1C7] hover:text-[#0F172A] dark:hover:text-[#F3F6FC] hover:bg-[#F1F5F9] dark:hover:bg-[#172033] flex items-center justify-center transition-all cursor-pointer group"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#A4B1C7] group-hover:text-[#7C9CFF] transition-colors" />
            ) : (
              <Moon className="w-4 h-4 text-[#475569] group-hover:text-[#0F172A] transition-colors" />
            )}
            <div className="absolute left-16 px-2.5 py-1 rounded-lg bg-[#0F172A] dark:bg-[#1C263A] border border-transparent dark:border-[#253149] text-white dark:text-[#F3F6FC] text-[11px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-xl z-50">
              {theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
            </div>
          </button>

          {/* User Profile Avatar with Initials */}
          <button
            onClick={onOpenAuth}
            title={`${currentUser.name || 'Ilham Maulana'} (${currentUser.role || 'Mahasiswa'})`}
            className="relative w-9 h-9 rounded-full bg-[#0F172A] dark:bg-[#172033] border border-[#E2E8F0] dark:border-[#253149] text-white dark:text-[#7C9CFF] font-bold text-xs flex items-center justify-center cursor-pointer shadow-xs hover:border-[#7C9CFF] hover:scale-105 active:scale-95 transition-all group"
          >
            <span>{userInitials}</span>
            <div className="absolute left-16 px-2.5 py-1.5 rounded-lg bg-[#0F172A] dark:bg-[#1C263A] border border-transparent dark:border-[#253149] text-white dark:text-[#F3F6FC] text-[11px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-xl z-50 flex items-center gap-1.5">
              <span>{currentUser.name || 'Ilham Maulana'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
            </div>
          </button>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. MINIMALIST TOP HEADER                                      */}
      {/* ============================================================ */}
      <header className="fixed top-0 right-0 left-0 md:left-16 lg:left-[72px] h-16 bg-white/95 dark:bg-[#0B101A]/95 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between z-30 transition-colors duration-200 border-b border-[#E2E8F0] dark:border-[#253149]">
        
        {/* Left: Quick Search Capsule "🔍 Cari sesuatu..." */}
        <div className="relative flex-1 max-w-xs sm:max-w-sm">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-[#475569] dark:text-[#A4B1C7] absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
              placeholder="Cari sesuatu di OXID..."
              className="w-full h-9 rounded-full bg-[#F1F5F9] dark:bg-[#111827] text-xs text-[#0F172A] dark:text-[#F3F6FC] placeholder:text-[#475569] dark:placeholder:text-[#A4B1C7] pl-9 pr-4 border border-[#E2E8F0] dark:border-[#253149] focus:border-[#7C9CFF] dark:focus:border-[#7C9CFF] focus:bg-white dark:focus:bg-[#172033] outline-none transition-all shadow-xs"
            />
          </div>

          {/* Quick Command & Search Dropdown */}
          {showSearchDropdown && (
            <div className="absolute top-11 left-0 w-80 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#253149] rounded-xl shadow-xl p-2 z-50 text-xs animate-in fade-in duration-100">
              <div className="text-[10px] uppercase font-semibold text-[#475569] dark:text-[#A4B1C7] px-2 py-1">
                Aksi Cepat & Navigasi OXID
              </div>
              <button
                onMouseDown={() => onNavigateStage('input')}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#172033] flex items-center gap-2 text-[#0F172A] dark:text-[#F3F6FC] cursor-pointer"
              >
                <Home className="w-3.5 h-3.5 text-[#7C9CFF]" />
                <span>Buat Usulan Baru</span>
              </button>
              <button
                onMouseDown={() => {
                  if (onOpenConsultation) onOpenConsultation();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#172033] flex items-center gap-2 text-[#0F172A] dark:text-[#F3F6FC] cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#9B8CFF]" />
                <span>Klinik Bimbingan & Konsultasi Ide</span>
              </button>
              <button
                onMouseDown={onOpenDatabase}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#172033] flex items-center gap-2 text-[#0F172A] dark:text-[#F3F6FC] cursor-pointer"
              >
                <Folder className="w-3.5 h-3.5 text-[#34D399]" />
                <span>Buka Arsip & Database Proyek</span>
              </button>
              <button
                onMouseDown={() => {
                  if (onOpenGuidelines) onOpenGuidelines();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#172033] flex items-center gap-2 text-[#0F172A] dark:text-[#F3F6FC] cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-[#FBBF24]" />
                <span>Pindai Format Kampus (Scan AI)</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Quota Badge, New Proposal Button, Theme Switcher, 12 Thinking Modes Bell, User Profile Badge */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Interactive Quota Status Badge */}
          {currentUser?.isSuperAdmin ? (
            <button
              type="button"
              onClick={onOpenSuperadmin || onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-sm hover:bg-amber-600 transition-colors cursor-pointer"
              title="Panel Superadmin: Persetujuan QRIS & Manajemen Kuota Pengguna"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Panel Superadmin</span>
            </button>
          ) : currentUser?.isSubscribed ? (
            <button
              type="button"
              onClick={onOpenPayment || onOpenAuth}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 hover:bg-purple-500/20 transition-colors cursor-pointer"
              title="Paket Langganan Pro Aktif (Unlimited)"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>Pro (Unlimited)</span>
            </button>
          ) : (currentUser?.trialGeneratesLeft ?? 3) > 0 ? (
            <button
              type="button"
              onClick={onOpenPayment || onOpenAuth}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors cursor-pointer"
              title="Sisa Kuota Trial Penuh: Semua bab terbuka 100%"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
              <span>Trial: {currentUser?.trialGeneratesLeft ?? 3}/3</span>
            </button>
          ) : (currentUser?.restrictedGeneratesLeft ?? 5) > 0 ? (
            <button
              type="button"
              onClick={onOpenPayment || onOpenAuth}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors cursor-pointer"
              title="Trial Habis: Kuota Judul Terkunci (3 Halaman Terbuka) - Klik untuk Bayar QRIS"
            >
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span>Judul: {currentUser?.restrictedGeneratesLeft ?? 5}/5</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenPayment || onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm hover:opacity-90 transition-opacity cursor-pointer animate-pulse"
              title="Kuota Habis: Klik untuk bayar via QRIS Resmi"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Upgrade Pro (QRIS)</span>
            </button>
          )}
          
          {/* New Proposal / Sesi Baru CTA Button */}
          <button
            type="button"
            onClick={() => {
              if (confirm("Mulai sesi usulan baru? Draf naskah Anda tetap tersimpan otomatis di Arsip Proyek.")) {
                onResetSession();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7C9CFF] text-[#080B12] hover:bg-[#9B8CFF] text-xs font-semibold shadow-xs transition-all cursor-pointer"
            title="Mulai usulan proposal baru tanpa me-refresh browser"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Usulan Baru</span>
          </button>

          {/* Theme Selector Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#172033] border border-transparent hover:border-[#E2E8F0] dark:hover:border-[#253149] text-xs font-medium text-[#0F172A] dark:text-[#F3F6FC] transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          >
            {theme === 'dark' ? (
              <Moon className="w-3.5 h-3.5 text-[#7C9CFF]" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-[#FBBF24]" />
            )}
            <span className="capitalize">{theme === 'dark' ? 'Dark' : 'Light'}</span>
            <ChevronDown className="w-3 h-3 text-[#A4B1C7]" />
          </button>

          {/* 12 Thinking Modes Notification Bell */}
          <button
            onClick={() => {
              if (onOpenTwelveModes) onOpenTwelveModes();
            }}
            title="12 Metode Berpikir Ilmiah"
            className="p-2 rounded-lg text-[#475569] dark:text-[#A4B1C7] hover:text-[#0F172A] dark:hover:text-[#F3F6FC] hover:bg-[#F1F5F9] dark:hover:bg-[#172033] transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4 stroke-[1.85]" />
          </button>

          {/* User Avatar Circle Badge */}
          <button
            onClick={onOpenAuth}
            title={`${currentUser.name || 'Ilham Maulana'} (${currentUser.role || 'Mahasiswa'})`}
            className="w-8 h-8 rounded-lg bg-[#0F172A] dark:bg-[#172033] border border-[#E2E8F0] dark:border-[#253149] text-white dark:text-[#7C9CFF] font-bold text-xs flex items-center justify-center cursor-pointer shadow-xs hover:border-[#7C9CFF] hover:scale-105 active:scale-95 transition-transform"
          >
            {userInitials}
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#475569] dark:text-[#A4B1C7] hover:text-[#0F172A] dark:hover:text-[#F3F6FC] hover:bg-[#F1F5F9] dark:hover:bg-[#172033] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 3. MOBILE SLIDE-OUT MENU DRAWER                              */}
      {/* ============================================================ */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bg-white dark:bg-[#0B101A] border-b border-[#E2E8F0] dark:border-[#253149] p-4 z-40 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150 shadow-2xl">
          <div className="text-[10px] uppercase font-semibold text-[#475569] dark:text-[#A4B1C7] px-3">
            Menu Navigasi OXID
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
                    ? 'bg-[#F1F5F9] text-[#0F172A] dark:bg-[#172033] dark:text-[#7C9CFF] font-semibold border border-[#E2E8F0] dark:border-[#253149]' 
                    : 'text-[#475569] dark:text-[#A4B1C7] hover:bg-[#F1F5F9] dark:hover:bg-[#172033]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
          
          <div className="pt-3 mt-2 border-t border-[#E2E8F0] dark:border-[#253149] flex items-center justify-between px-2 text-xs">
            <button
              onClick={() => {
                onResetSession();
                setMobileMenuOpen(false);
              }}
              className="text-[#FB7185] hover:underline flex items-center gap-1.5 text-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sesi</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. WORKSPACE MAIN VIEWPORT                                   */}
      {/* ============================================================ */}
      <main className="flex-1 md:ml-16 lg:ml-[72px] pt-16 min-h-screen flex flex-col overflow-x-hidden">
        {children}
      </main>

    </div>
  );
}
