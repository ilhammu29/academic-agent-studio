"use client";

import React, { useState } from "react";
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
  ChevronDown
} from "lucide-react";
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
    <div className="min-h-screen bg-white dark:bg-[#080B12] text-[#0F172A] dark:text-[#F3F6FC] transition-colors selection:bg-[#7C9CFF]/30">
      
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#080B12]/90 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#1E293B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F172A] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-white dark:text-[#7C9CFF] flex items-center justify-center font-bold tracking-tight shadow-xs">
              <span className="font-mono text-sm tracking-tight">OXID</span>
            </div>
            <div>
              <span className="font-bold text-sm sm:text-base tracking-tight text-[#0F172A] dark:text-white">
                Academic Agent Studio
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                Dikti &amp; UNP 2025
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#334155] hover:bg-zinc-100 dark:hover:bg-[#1E293B] transition-colors"
                >
                  <span className={`w-2 h-2 rounded-full ${currentUser?.isSuperAdmin ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`} />
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{currentUser.name || "Akun Saya"}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {currentUser?.isSuperAdmin ? "👑 Superadmin" : currentUser?.isSubscribed ? "⭐ Pro" : `⚡ Trial: ${currentUser?.trialGeneratesLeft ?? 3}/3`}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onEnterStudio()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Buka Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="px-3.5 py-1.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] hover:bg-zinc-100 dark:hover:bg-[#1E293B] text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Masuk Akun</span>
                </button>
                <button
                  type="button"
                  onClick={() => onEnterStudio()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Masuk Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[250px] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          
          {/* Top Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 shadow-xs">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                Sistem Multi-Agent AI Akademik Pertama di Indonesia
              </span>
              <span className="text-[10px] bg-blue-200/60 dark:bg-blue-800/60 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full font-mono font-bold">
                v2.5 Hybrid
              </span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="text-center max-w-4xl mx-auto mb-8">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-tight text-zinc-900 dark:text-white">
              Susun Proposal, PKL &amp; Skripsi <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent">
                Standar Resmi Kampus Tanpa Batas Token
              </span>
            </h1>
            <p className="mt-5 text-sm sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Arsitektur Multi-Agent cerdas memadukan dewan guru besar, reviewer metodologi, dan telaah format perguruan tinggi (FT UNP 2025 &amp; Standar Dikti). Hasilkan naskah utuh berbobot, tabel riset lengkap, ekspor Word (.docx) &amp; PDF siap cetak.
            </p>
          </div>

          {/* Interactive Fast Launcher Card */}
          <div className="max-w-3xl mx-auto bg-white dark:bg-[#111827] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative mb-12">
            <form onSubmit={handleQuickStart} className="space-y-4">
              
              {/* Category & Campus Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Jenjang / Jenis Usulan
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => { setQuickCategory("magang"); setQuickReportType("magang"); }}
                      className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        quickCategory === "magang"
                          ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs"
                          : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                      }`}
                    >
                      PKL / Magang
                    </button>
                    <button
                      type="button"
                      onClick={() => { setQuickCategory("skripsi"); setQuickReportType("skripsi"); }}
                      className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        quickCategory === "skripsi"
                          ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs"
                          : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                      }`}
                    >
                      Skripsi S1
                    </button>
                    <button
                      type="button"
                      onClick={() => { setQuickCategory("penelitian"); setQuickReportType("tesis"); }}
                      className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        quickCategory === "penelitian"
                          ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs"
                          : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                      }`}
                    >
                      Tesis / Riset
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Pedoman Kampus (SOP Format)
                  </label>
                  <select
                    value={selectedCampus.id}
                    onChange={(e) => {
                      const found = CAMPUS_PRESETS.find(p => p.id === e.target.value) || CAMPUS_PRESETS[0];
                      setSelectedCampus(found);
                      if (found.id === "unp" && quickCategory === "magang") {
                        setQuickReportType("laporan_pkl_unp");
                      }
                    }}
                    className="w-full h-10 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
                  >
                    {CAMPUS_PRESETS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.campusName} — {p.id === 'unp' ? 'Panduan Resmi FT UNP 2025' : p.id === 'dikti' ? 'Standar Nasional Dikti' : (p.guideDocTitle || p.campusName)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Topik / Judul Usulan Riset atau Pekerjaan
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    placeholder="Contoh: Implementasi Pipeline MLOps & RAG pada Divisi Digital..."
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-blue-500 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Entity / Mitra & Submit */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={quickEntity}
                    onChange={(e) => setQuickEntity(e.target.value)}
                    placeholder="Instansi / Mitra Sasaran (misal: PT Semen Padang, RSUP Sardjito)"
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-blue-500 font-sans"
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full h-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Mulai di Studio</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Quick Click Sample Showcase */}
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">
              Atau Pilih Contoh Proposal Standar Terverifikasi:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {sampleTopics.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    const found = CAMPUS_PRESETS.find(p => p.id === s.campusId) || CAMPUS_PRESETS[0];
                    onEnterStudio({
                      title: s.title,
                      category: s.category,
                      reportType: s.reportType,
                      targetEntity: s.entity,
                      campusGuideline: found
                    });
                  }}
                  className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#111827]/70 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 border border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-800 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                      {s.badge}
                    </span>
                    <span className="text-[10px] text-zinc-500">{s.entity}</span>
                  </div>
                  <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {s.title}
                  </p>
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 3. FITUR UNGGULAN (6 PILAR UTAMA) */}
      <section className="py-20 bg-zinc-50 dark:bg-[#0B101A] border-t border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">
              Keunggulan Arsitektur Sistem
            </h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Dirancang Khusus Menjawab Standar Baku Sidang Perguruan Tinggi
            </h3>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              Bukan sekadar generator teks biasa, melainkan orkestrasi metodologi ilmiah, verifikasi sitasi empiris, dan kepatuhan panduan resmi kampus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Fitur 1 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Multi-Agent Swarm Intelligence
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                5 agen AI spesialis (Dewan Guru Besar, Reviewer Metodologi, Ahli Teori, Penelaah Format, dan Penguji Sidang) bekerja serentak mengaudit kebaruan dan logika kausalitas naskah.
              </p>
            </div>

            {/* Fitur 2 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Buku Pedoman Kampus Resmi (UNP 2025)
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Kepatuhan mutlak pada Buku Panduan FT UNP 2025 (3 Bab, margin 4-4-3-3 cm, font TNR 12pt, tanpa Abstrak) serta struktur resmi Skripsi 5 Bab Dikti dengan Abstrak dwibahasa.
              </p>
            </div>

            {/* Fitur 3 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Mesin Anti-Token Limit (Multi-Worker &amp; Append)
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Menerobos limit 2.000 kata LLM melalui generate paralel multi-bab serta tombol interaktif &quot;✨ Perluas Sub-Bab (+1.000 Kata)&quot; langsung menyambung tanpa menimpa naskah.
              </p>
            </div>

            {/* Fitur 4 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <Download className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Ekspor Final Word (.docx) &amp; PDF Rapi
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Menghasilkan tabel terbuka 3 garis formal, indentasi paragraf 1 cm, spasi 1.5, cover berlogo universitas resmi, dan seluruh lampiran kuesioner siap dicetak dan diserahkan ke dosen.
              </p>
            </div>

            {/* Fitur 5 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                <Presentation className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Studio Slide Sidang Eksekutif (PPTX 16:9)
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Otomatisasi slide presentasi sidang berbasis naskah dokumen dengan kicker, poin eksekutif, catatan presenter (*speaker notes*), dan desain bebas elemen terpotong.
              </p>
            </div>

            {/* Fitur 6 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-4">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Klinik Bimbingan &amp; Konsultasi AI 24/7
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Workbench interaktif untuk membedah ide riset, menguji novelty, dan merumuskan hipotesis berdasarkan 12 metode berpikir ilmiah standar Guru Besar.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 4. TAHAPAN ALUR KERJA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">
              Alur Kerja Terstruktur
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              4 Langkah Mudah Dari Ide Hingga Naskah Siap Uji
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Tentukan Topik & Lokus",
                desc: "Masukkan judul, instansi mitra sasaran, dan pilih pedoman kampus resmi (UNP, Dikti, UNS, dll.)."
              },
              {
                step: "02",
                title: "Wawancara Diagnostik",
                desc: "Jawab 4-6 pertanyaan kritis untuk mempertajam kesenjangan empiris, lingkup teknis, dan novelty."
              },
              {
                step: "03",
                title: "Orkestrasi Multi-Agent",
                desc: "5 agen AI bekerja paralel merumuskan bab komprehensif, kerangka PRISMA, rumus Slovin, dan RAB SBM."
              },
              {
                step: "04",
                title: "Telaah & Ekspor Final",
                desc: "Perluas sub-bab sesuka hati, unduh dokumen Word (.docx) bergaris rapi, PDF, dan slide presentasi sidang."
              }
            ].map((st, idx) => (
              <div key={idx} className="relative p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111827]/50">
                <span className="text-3xl font-black font-mono text-blue-600/30 dark:text-blue-400/20 mb-3 block">
                  {st.step}
                </span>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                  {st.title}
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. CALL TO ACTION SECTION */}
      <section className="py-20 bg-gradient-to-b from-blue-600/10 to-transparent border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4">
            Siap Menyelesaikan Proposal &amp; Skripsi Tepat Standar?
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto mb-8">
            Hemat waktu bimbingan hingga berminggu-minggu dengan naskah berbobot akademik tinggi dan terbebas dari kesalahan format pedoman kampus.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onEnterStudio()}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Mulai Masuk Studio Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            {!isLoggedIn && (
              <button
                type="button"
                onClick={onOpenAuth}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-zinc-500" />
                <span>Masuk / Daftar Akun Civitas</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 bg-zinc-50 dark:bg-[#080B12] text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-900 dark:text-zinc-100">OXID Academic Agent Studio</span>
            <span>&bull; Standar Dikti &amp; Buku Panduan FT UNP 2025</span>
          </div>
          <p className="text-[11px]">
            &copy; {new Date().getFullYear()} OXID Intelligence System. Hak cipta dilindungi.
          </p>
        </div>
      </footer>

    </div>
  );
};
