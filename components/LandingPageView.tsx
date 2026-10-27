"use client";

import React, { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  GraduationCap, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  Cpu, 
  Presentation, 
  Download, 
  MessageSquare, 
  Award, 
  Clock, 
  ChevronRight, 
  Building, 
  Check, 
  Lock, 
  UserCheck, 
  SlidersHorizontal,
  ExternalLink,
  ChevronDown,
  Zap,
  Crown
} from "lucide-react";

// Client-only Dynamic Import for Interactive 3D WebGL Glass Orb
const Hero3DOrb = dynamic(
  () => import("./Hero3DOrb").then((mod) => mod.Hero3DOrb),
  {
    ssr: false,
    loading: () => (
      <div className="w-56 h-56 sm:w-64 sm:h-64 lg:w-76 lg:h-76 xl:w-84 xl:h-84 flex items-center justify-center">
        <div className="w-48 h-48 rounded-full bg-gradient-to-tr from-[#60A5FA]/30 via-[#C084FC]/25 to-[#818CF8]/20 blur-2xl animate-pulse" />
      </div>
    ),
  }
);
import { ProposalCategory, ReportType, CampusGuideline } from "@/types/studio";
import { CAMPUS_PRESETS } from "@/lib/campusPresets";
import { UserProfile } from "@/lib/supabase";

interface LandingPageViewProps {
  onEnterStudio: (preset?: {
    title?: string;
    category?: ProposalCategory;
    reportType?: ReportType;
    targetEntity?: string;
    campusGuideline?: CampusGuideline;
  }) => void;
  onOpenAuth: () => void;
  currentUser: UserProfile;
  isLoggedIn: boolean;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onEnterStudio,
  onOpenAuth,
  currentUser,
  isLoggedIn,
}) => {
  const [quickTitle, setQuickTitle] = useState("");
  const [quickCategory, setQuickCategory] = useState<ProposalCategory>("skripsi");
  const [quickReportType, setQuickReportType] = useState<ReportType>("skripsi");
  const [quickEntity, setQuickEntity] = useState("");
  const [selectedCampus, setSelectedCampus] = useState<CampusGuideline>(CAMPUS_PRESETS[0]);

  // 3D Mouse Parallax & Gyro Tilt State
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const heroContainerRef = useRef<HTMLDivElement>(null);

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroContainerRef.current) return;
    const rect = heroContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1 to 1
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1; // -1 to 1
    setMouseOffset({ x, y });
  };

  const handleHeroMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
  };

  const handleQuickStart = (e: React.FormEvent) => {
    e.preventDefault();
    onEnterStudio({
      title: quickTitle.trim() || undefined,
      category: quickCategory,
      reportType: quickReportType,
      targetEntity: quickEntity.trim() || undefined,
      campusGuideline: selectedCampus
    });
  };

  const sampleTopics = [
    {
      title: "Analisis Preventive Maintenance Mesin Finish Mill Indarung V PT Semen Padang Berbasis Kepatuhan SOP dan Vibrasi",
      category: "magang" as ProposalCategory,
      reportType: "laporan_pkl_unp" as ReportType,
      entity: "PT Semen Padang (Persero)",
      campusId: "unp",
      badge: "FT UNP 2025"
    },
    {
      title: "Optimasi Model Vision Transformer (ViT) dengan Kuantisasi 4-bit AWQ pada Edge Device untuk Deteksi Dini Retinopati Diabetik",
      category: "skripsi" as ProposalCategory,
      reportType: "skripsi" as ReportType,
      entity: "RSUP Dr. Sardjito",
      campusId: "dikti",
      badge: "Skripsi Dikti"
    },
    {
      title: "Implementasi Pipeline MLOps & RAG untuk Knowledge Retrieval Internal di Divisi Digital Telkom Indonesia",
      category: "magang" as ProposalCategory,
      reportType: "laporan_magang" as ReportType,
      entity: "PT Telkom Indonesia Tbk",
      campusId: "uns",
      badge: "Magang Industri"
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFE] dark:bg-[#080B12] text-[#0F172A] dark:text-[#F3F6FC] transition-colors selection:bg-[#7C9CFF]/30 font-sans relative overflow-x-hidden">
      
      {/* ========================================================================= */}
      {/* EMBEDDED CSS KEYFRAMES FOR SMOOTH 3D MOTION & LEVITATION                  */}
      {/* ========================================================================= */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes orbFloatingMotion {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(2.5deg);
          }
          100% {
            transform: translateY(0px) rotate(0deg);
          }
        }
        @keyframes orbFloorShadow {
          0% {
            transform: scale(1);
            opacity: 0.35;
          }
          50% {
            transform: scale(0.82);
            opacity: 0.18;
          }
          100% {
            transform: scale(1);
            opacity: 0.35;
          }
        }
        @keyframes auraBreath {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            opacity: 0.45;
          }
          50% {
            transform: scale(1.12) rotate(180deg);
            opacity: 0.75;
          }
        }
        @keyframes glassSpecularSweep {
          0% {
            transform: translateX(-120%) rotate(35deg);
          }
          40%, 100% {
            transform: translateX(180%) rotate(35deg);
          }
        }
        .anim-orb-float {
          animation: orbFloatingMotion 5s ease-in-out infinite;
        }
        .anim-orb-shadow {
          animation: orbFloorShadow 5s ease-in-out infinite;
        }
        .anim-aura-breath {
          animation: auraBreath 8s ease-in-out infinite;
        }
        .anim-specular {
          animation: glassSpecularSweep 6s ease-in-out infinite;
        }
      `}} />

      {/* ========================================================================= */}
      {/* AMBIENT CHROMATIC BLUR BACKGROUND (Matches UI Reference Exactly)           */}
      {/* ========================================================================= */}
      <div 
        className="pointer-events-none fixed inset-0 overflow-hidden z-0" 
        aria-hidden="true"
      >
        {/* Soft Blue / Cyan ambient glow on left */}
        <div className="absolute -left-[8%] top-[12%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-tr from-[#60A5FA]/12 via-[#93C5FD]/8 to-transparent blur-[120px] dark:from-[#3B82F6]/10" />
        {/* Soft Magenta / Purple ambient glow on right */}
        <div className="absolute -right-[10%] top-[25%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-bl from-[#C084FC]/14 via-[#E879F9]/8 to-transparent blur-[140px] dark:from-[#8B5CF6]/10" />
        {/* Ultra-soft central aura */}
        <div className="absolute left-[32%] top-[8%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-b from-[#E0E7FF]/20 to-transparent blur-[110px] dark:from-[#1E1B4B]/20" />
      </div>

      {/* ========================================================================= */}
      {/* 1. TOP NAVBAR (Clean, Symmetrical, Aligned)                                */}
      {/* ========================================================================= */}
      <header className="relative z-40 bg-transparent">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 h-24 flex items-center justify-between">
          
          {/* Left: 4-pointed Sparkle Star + "academic agent studio" */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => onEnterStudio()}
          >
            <div className="w-6 h-6 flex items-center justify-center text-[#0F172A] dark:text-white shrink-0 group-hover:rotate-45 transition-transform duration-300">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
              </svg>
            </div>
            <span className="font-bold text-lg sm:text-xl tracking-tight text-[#0F172A] dark:text-white font-sans lowercase">
              academic agent studio
            </span>
          </div>

          {/* Right: Navigation Links + Separator + "Try Studio ->" Button */}
          <div className="flex items-center gap-5 sm:gap-7">
            <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-[#475569] dark:text-[#94A3B8]">
              <a 
                href="#product-section" 
                className="hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer"
              >
                Product
              </a>
              <a 
                href="#examples-section" 
                className="hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer"
              >
                Examples
              </a>
              <a 
                href="#pricing-section" 
                className="hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer"
              >
                Pricing
              </a>
              <a 
                href="#docs-section" 
                className="hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer"
              >
                Docs
              </a>
            </nav>

            {/* Subtle Vertical Divider */}
            <span className="hidden md:inline-block w-[1px] h-4 bg-[#CBD5E1] dark:bg-[#334155]" />

            {/* User Account / Try Studio CTA */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="flex items-center gap-2 text-xs font-medium px-3.5 py-1.5 rounded-full border border-[#E2E8F0] dark:border-[#334155] bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xs hover:bg-zinc-100 dark:hover:bg-[#1E293B] transition-colors"
                >
                  <span className={`w-2 h-2 rounded-full ${currentUser?.isSuperAdmin ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`} />
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{currentUser.name || "Akun Saya"}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {currentUser?.isSuperAdmin ? "👑 Superadmin" : currentUser?.isSubscribed ? "⭐ Pro" : `⚡ Trial: ${currentUser?.trialGeneratesLeft ?? 3}/3`}
                  </span>
                </button>
              ) : null}

              {/* Try Studio Button (Matching Black Pill with Right Arrow) */}
              <button
                type="button"
                onClick={() => onEnterStudio()}
                className="px-5 py-2.5 rounded-full bg-[#0F172A] hover:bg-black text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-[#0F172A] font-semibold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer group"
              >
                <span>Try Studio</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2] group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION WITH INTERACTIVE 3D GLASS SPHERE ORB                       */}
      {/* ========================================================================= */}
      <section 
        ref={heroContainerRef}
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
        className="relative z-10 pt-6 sm:pt-12 pb-20 px-4 sm:px-6 lg:px-8 select-none"
      >
        <div className="max-w-6xl mx-auto text-center">
          
          {/* Top Kicker: — AI WRITING PARTNER — */}
          <div className="flex items-center justify-center gap-3 text-[11px] sm:text-xs font-mono font-medium tracking-[0.25em] text-[#64748B] dark:text-[#94A3B8] uppercase mb-8 sm:mb-12">
            <span className="w-8 sm:w-12 h-[1px] bg-[#CBD5E1] dark:bg-[#334155]" />
            <span>AI WRITING PARTNER</span>
            <span className="w-8 sm:w-12 h-[1px] bg-[#CBD5E1] dark:bg-[#334155]" />
          </div>

          {/* MAIN 3-COLUMN HERO HEADLINE WITH 3D INTERACTIVE GLASS ORB */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-8 xl:gap-12">
            
            {/* Left Headline: "Turn your ideas into" */}
            <div className="text-center lg:text-left font-black tracking-tight text-[#0F172A] dark:text-white text-4xl sm:text-6xl lg:text-[72px] xl:text-[80px] leading-[1.04] shrink-0">
              <span className="block">Turn your</span>
              <span className="block">ideas into</span>
            </div>

            {/* Center: Real Interactive 3D WebGL Holographic Glass Orb */}
            <div 
              className="relative my-2 lg:my-0 flex-shrink-0 flex flex-col items-center justify-center w-56 h-56 sm:w-64 sm:h-64 lg:w-76 lg:h-76 xl:w-84 xl:h-84"
            >
              {/* Layer 1: Ambient Colored Halo Glow Behind Sphere */}
              <div 
                className="anim-aura-breath absolute w-48 h-48 sm:w-60 sm:h-60 rounded-full bg-gradient-to-tr from-[#60A5FA]/35 via-[#C084FC]/30 to-[#818CF8]/25 blur-3xl pointer-events-none"
                style={{
                  transform: `translate(${mouseOffset.x * 20}px, ${mouseOffset.y * 20}px)`
                }}
              />

              {/* Layer 2: Real 3D Three.js WebGL Interactive Floating Sphere */}
              <div className="anim-orb-float relative z-10 w-full h-full flex items-center justify-center">
                <Hero3DOrb 
                  mouseParallax={mouseOffset} 
                  className="w-full h-full"
                />
              </div>

              {/* Layer 3: Floor Shadow That Breathes in Sync with Levitation */}
              <div 
                className="anim-orb-shadow -mt-4 w-36 sm:w-44 h-6 sm:h-7 rounded-full bg-gradient-to-r from-blue-900/20 via-indigo-950/30 to-purple-900/20 blur-md pointer-events-none"
                style={{
                  transform: `translate(${mouseOffset.x * 8}px, 0px)`
                }}
              />
            </div>

            {/* Right Headline: "academic work, faster." (Vibrant Blue to Indigo Gradient) */}
            <div className="text-center lg:text-left font-black tracking-tight text-4xl sm:text-6xl lg:text-[72px] xl:text-[80px] leading-[1.04] shrink-0">
              <span className="block bg-gradient-to-r from-[#3B82F6] via-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent">
                academic
              </span>
              <span className="block bg-gradient-to-r from-[#3B82F6] via-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent">
                work, faster.
              </span>
            </div>
          </div>

          {/* Call to Action Buttons */}
          <div className="mt-10 sm:mt-14 flex flex-wrap items-center justify-center gap-4">
            {/* Start Creating -> Button (Black Pill) */}
            <button
              type="button"
              onClick={() => onEnterStudio()}
              className="px-8 py-3.5 rounded-full bg-[#18181B] hover:bg-black text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer group"
            >
              <span>Start Creating</span>
              <ArrowRight className="w-4 h-4 stroke-[2] group-hover:translate-x-0.5 transition-transform" />
            </button>
            
            {/* See Examples Button (Light Pill) */}
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('examples-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-3.5 rounded-full bg-[#F8FAFC] dark:bg-[#1E293B] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] border border-[#E2E8F0] dark:border-[#334155] text-[#334155] dark:text-[#F1F5F9] text-xs sm:text-sm font-semibold transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-2xs"
            >
              <span>See Examples</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* 4 FEATURE PILLARS BAR (Matches Reference Bottom Perfectly)                */}
          {/* ========================================================================= */}
          <div className="mt-16 sm:mt-20 pt-10 border-t border-[#E2E8F0]/70 dark:border-[#1E293B] max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
            
            {/* 1. AI-Powered */}
            <div className="flex items-center gap-3.5 text-left p-2 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/60 shadow-2xs">
                <Sparkles className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-[#1E293B] dark:text-white">AI-Powered</div>
                <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Smart, accurate, contextual</div>
              </div>
            </div>

            {/* 2. Multiple Document Types */}
            <div className="flex items-center gap-3.5 text-left p-2 rounded-xl lg:border-l lg:border-[#E2E8F0] dark:lg:border-[#334155] lg:pl-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/60 shadow-2xs">
                <FileText className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-[#1E293B] dark:text-white">Multiple Document Types</div>
                <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Skripsi, TA, Laporan, Penelitian</div>
              </div>
            </div>

            {/* 3. Fast & Reliable */}
            <div className="flex items-center gap-3.5 text-left p-2 rounded-xl lg:border-l lg:border-[#E2E8F0] dark:lg:border-[#334155] lg:pl-6">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900/60 shadow-2xs">
                <Zap className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-[#1E293B] dark:text-white">Fast &amp; Reliable</div>
                <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Save time, focus on what matters</div>
              </div>
            </div>

            {/* 4. Secure & Private */}
            <div className="flex items-center gap-3.5 text-left p-2 rounded-xl lg:border-l lg:border-[#E2E8F0] dark:lg:border-[#334155] lg:pl-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/60 shadow-2xs">
                <ShieldCheck className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-[#1E293B] dark:text-white">Secure &amp; Private</div>
                <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Your data, your control</div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE TOPIC BUILDER & QUICK LAUNCHER (Usulan Riset & Kampus)     */}
      {/* ========================================================================= */}
      <section id="product-section" className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 border-t border-[#E2E8F0] dark:border-[#1E293B] bg-gradient-to-b from-white to-[#F8FAFC] dark:from-[#080B12] dark:to-[#0B101A]">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 uppercase tracking-wider">
              Quick Launcher
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-white mt-3 tracking-tight">
              Mulai Susun Naskah Akademik Sekarang
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-2">
              Pilih format dokumen resmi, sesuaikan dengan pedoman kampus Anda, dan biarkan 12 Agen AI menyusun naskah utuh berstandar Dikti &amp; FT UNP.
            </p>
          </div>

          {/* Quick Launcher Form Container */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1F2937] shadow-xl shadow-blue-500/5">
            <form onSubmit={handleQuickStart} className="space-y-5">
              
              {/* Jenis Naskah Tabs */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F3F6FC] mb-2">
                  1. Pilih Jenis Naskah Dokumen:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'skripsi', label: 'Skripsi / Tugas Akhir', cat: 'skripsi' as ProposalCategory, rep: 'skripsi' as ReportType },
                    { id: 'laporan_pkl_unp', label: 'Laporan PKL UNP 2025', cat: 'magang' as ProposalCategory, rep: 'laporan_pkl_unp' as ReportType },
                    { id: 'laporan_magang', label: 'Laporan Magang Industri', cat: 'magang' as ProposalCategory, rep: 'laporan_magang' as ReportType },
                    { id: 'penelitian', label: 'Proposal Riset & Tesis', cat: 'penelitian' as ProposalCategory, rep: 'tesis' as ReportType }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setQuickCategory(t.cat);
                        setQuickReportType(t.rep);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        quickReportType === t.rep
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                          : 'border-[#E2E8F0] dark:border-[#334155] hover:border-zinc-300 dark:hover:border-zinc-700 text-[#475569] dark:text-[#94A3B8]'
                      }`}
                    >
                      <div className="text-xs font-bold leading-snug">{t.label}</div>
                      <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                        {t.cat === 'magang' ? 'Sesuai Buku Pedoman' : '5 Bab Standar Dikti'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pedoman Kampus Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F3F6FC] mb-2">
                  2. Pilih Standar Pedoman Format Kampus:
                </label>
                <div className="relative">
                  <select
                    value={selectedCampus.id}
                    onChange={(e) => {
                      const found = CAMPUS_PRESETS.find(p => p.id === e.target.value);
                      if (found) setSelectedCampus(found);
                    }}
                    className="w-full bg-[#F8FAFC] dark:bg-[#0B101A] border border-[#CBD5E1] dark:border-[#334155] rounded-xl px-4 py-2.5 text-xs text-[#0F172A] dark:text-white font-medium focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    {CAMPUS_PRESETS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.campusName} — {p.id === 'unp' ? 'Panduan Resmi FT UNP 2025' : p.id === 'dikti' ? 'Standar Nasional Dikti' : (p.guideDocTitle || p.campusName)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Input Judul Usulan */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F3F6FC] mb-2">
                  3. Judul Usulan / Topik Penelitian:
                </label>
                <input
                  type="text"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  placeholder="Ketik usulan judul Anda... (Contoh: Analisis Preventive Maintenance Mesin Finish Mill PT Semen Padang)"
                  className="w-full bg-[#F8FAFC] dark:bg-[#0B101A] border border-[#CBD5E1] dark:border-[#334155] rounded-xl px-4 py-3 text-xs text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Input Instansi Mitra */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F3F6FC] mb-2">
                  4. Instansi Mitra / Lokasi Riset (Opsional):
                </label>
                <input
                  type="text"
                  value={quickEntity}
                  onChange={(e) => setQuickEntity(e.target.value)}
                  placeholder="Contoh: PT Semen Padang / RSUP Dr. Sardjito / Divisi Digital Telkom"
                  className="w-full bg-[#F8FAFC] dark:bg-[#0B101A] border border-[#CBD5E1] dark:border-[#334155] rounded-xl px-4 py-2.5 text-xs text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-[#0F172A] hover:bg-black text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-[#0F172A] font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Mulai Penyusunan Naskah di Workspace Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </form>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. VERIFIED EXAMPLES & TEMPLATES SECTION                                   */}
      {/* ========================================================================= */}
      <section id="examples-section" className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 border-t border-[#E2E8F0] dark:border-[#1E293B]">
        <div className="max-w-6xl mx-auto">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-1">
                Verified Indonesian Academia
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
                Contoh Dokumen Standar Terverifikasi
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onEnterStudio()}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Jelajahi Semua Arsip Template</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {sampleTopics.map((item, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1E293B] hover:border-blue-500/50 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                      {item.badge}
                    </span>
                    <span className="text-[10px] text-zinc-400 uppercase font-mono">
                      {item.category}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-3 leading-snug">
                    {item.title}
                  </h3>

                  <div className="mt-3 flex items-center gap-1.5 text-xs text-zinc-500">
                    <Building className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate">{item.entity}</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400">Siap Ekspor Word &amp; PDF</span>
                  <button
                    type="button"
                    onClick={() => {
                      onEnterStudio({
                        title: item.title,
                        category: item.category,
                        reportType: item.reportType,
                        targetEntity: item.entity,
                        campusGuideline: CAMPUS_PRESETS.find(p => p.id === item.campusId) || CAMPUS_PRESETS[0]
                      });
                    }}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Pakai Template</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. PRICING & SUBSCRIPTION SECTION                                         */}
      {/* ========================================================================= */}
      <section id="pricing-section" className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 border-t border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#080B12]">
        <div className="max-w-5xl mx-auto text-center">
          
          <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 uppercase tracking-wider">
            Paket Langganan Civitas
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-white mt-3 tracking-tight">
            Transparan, Terjangkau &amp; Tanpa Biaya Tersembunyi
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] max-w-lg mx-auto mt-2">
            Mulai dari 3x kuota trial penuh gratis hingga paket tanpa batas untuk skripsi, tesis, dan proposal hibah riset.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 text-left">
            
            {/* Free Trial Tier */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1F2937] flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Free Trial</div>
                <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1">Rp 0</div>
                <div className="text-[11px] text-zinc-400">3x Percobaan Generate Penuh</div>
                <ul className="mt-5 space-y-2.5 text-xs text-zinc-600 dark:text-zinc-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>3x Dokumen Utuh Terbuka 100%</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Ekspor Word DOCX &amp; PDF</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>5x Kuota Judul Preview Terkunci</span>
                  </li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => onEnterStudio()}
                className="mt-6 w-full py-2.5 rounded-full border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold transition-colors cursor-pointer text-zinc-900 dark:text-white"
              >
                Coba Gratis Sekarang
              </button>
            </div>

            {/* Skripsi & Tesis Pro Tier */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border-2 border-amber-500 flex flex-col justify-between relative shadow-xl shadow-amber-500/10">
              <span className="absolute -top-3 right-6 text-[10px] font-bold px-3 py-0.5 rounded-full bg-amber-500 text-white shadow-xs">
                REKOMENDASI MAHASISWA
              </span>
              <div>
                <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Skripsi &amp; Tesis Pro</div>
                <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1">Rp 99.000</div>
                <div className="text-[11px] text-zinc-400">Akses Penuh 1 Semester</div>
                <ul className="mt-5 space-y-2.5 text-xs text-zinc-600 dark:text-zinc-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Unlimited generate naskah</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Bebas gembok 100% (Semua Bab)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Slide Presentasi Sidang 16:9</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Klinik Bimbingan &amp; Revisi Dosen</span>
                  </li>
                </ul>
              </div>
              <button
                type="button"
                onClick={onOpenAuth}
                className="mt-6 w-full py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Pilih Paket Skripsi Pro
              </button>
            </div>

            {/* Peneliti Unlimited Tier */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1F2937] flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Peneliti &amp; Dosen</div>
                <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1">Rp 199.000</div>
                <div className="text-[11px] text-zinc-400">1 Tahun Penuh Tanpa Batas</div>
                <ul className="mt-5 space-y-2.5 text-xs text-zinc-600 dark:text-zinc-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Proposal Hibah Dikti &amp; Riset</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Format Jurnal Scopus &amp; SINTA</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Prioritas Antrian Agen Super Cepat</span>
                  </li>
                </ul>
              </div>
              <button
                type="button"
                onClick={onOpenAuth}
                className="mt-6 w-full py-2.5 rounded-full border border-purple-300 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-xs font-semibold text-purple-700 dark:text-purple-300 transition-colors cursor-pointer"
              >
                Pilih Paket Peneliti
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. FOOTER SECTION                                                         */}
      {/* ========================================================================= */}
      <footer id="docs-section" className="relative z-10 py-12 px-4 sm:px-6 lg:px-8 border-t border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#0B101A] text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <svg className="w-4 h-4 fill-current text-zinc-700 dark:text-zinc-300" viewBox="0 0 24 24">
              <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
            </svg>
            <span className="font-bold text-zinc-800 dark:text-zinc-200 lowercase">academic agent studio</span>
            <span className="text-zinc-400">© 2026 • Standar Dikti &amp; FT UNP 2025</span>
          </div>

          <div className="flex items-center gap-6">
            <button type="button" onClick={onOpenAuth} className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer">
              Login Superadmin
            </button>
            <a href="#product-section" className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer">
              Panduan Format
            </a>
            <button type="button" onClick={() => onEnterStudio()} className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer font-semibold text-blue-600 dark:text-blue-400">
              Buka Studio →
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPageView;
