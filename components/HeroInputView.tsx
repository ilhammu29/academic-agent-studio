"use client";

import React, { useState } from "react";
import { ProposalCategory } from "@/types/studio";
import { 
  ArrowUp, 
  Sparkles, 
  Building2, 
  Clock, 
  BookOpen, 
  Layers, 
  SlidersHorizontal,
  ChevronDown,
  GraduationCap,
  Briefcase,
  FlaskConical,
  Database
} from "lucide-react";

interface HeroInputViewProps {
  category: ProposalCategory;
  setCategory: (c: ProposalCategory) => void;
  title: string;
  setTitle: (t: string) => void;
  targetEntity: string;
  setTargetEntity: (e: string) => void;
  durationMonths: number;
  setDurationMonths: (d: number) => void;
  candidateName: string;
  setCandidateName: (n: string) => void;
  candidateId: string;
  setCandidateId: (id: string) => void;
  onSubmit: () => void;
  onOpenDatabase?: () => void;
}

export const HeroInputView: React.FC<HeroInputViewProps> = ({
  category,
  setCategory,
  title,
  setTitle,
  targetEntity,
  setTargetEntity,
  durationMonths,
  setDurationMonths,
  candidateName,
  setCandidateName,
  candidateId,
  setCandidateId,
  onSubmit,
  onOpenDatabase
}) => {
  const [showConfig, setShowConfig] = useState(false);

  const presets = [
    {
      category: "magang" as ProposalCategory,
      badge: "Magang Industri (MBKM)",
      icon: Briefcase,
      title: "Implementasi Pipeline MLOps & RAG untuk Knowledge Retrieval Internal",
      entity: "PT Telkom Indonesia (Persero) Tbk",
      duration: 6,
      desc: "Divisi Data & AI Strategy — 24 Minggu Kerja MBKM 20 SKS"
    },
    {
      category: "skripsi" as ProposalCategory,
      badge: "Skripsi Informatika & AI",
      icon: GraduationCap,
      title: "Optimasi Model Vision Transformer (ViT) dengan Kuantisasi 4-bit AWQ pada Edge Device",
      entity: "RSUP Dr. Sardjito / FK-KMK UGM",
      duration: 5,
      desc: "Deteksi Dini Retinopati Diabetik dengan Evaluasi F1-Score & FPS"
    },
    {
      category: "penelitian" as ProposalCategory,
      badge: "Tesis & Riset Biomedis",
      icon: FlaskConical,
      title: "Korelasi Kadar Ekspresi miRNA-21 Serum dan High-Sensitivity CRP terhadap Fibrosis Hepar",
      entity: "Laboratorium Riset Terpadu & RS Pendidikan",
      duration: 6,
      desc: "Uji Korelasi Spearman & Regresi Logistik Ordinal Berstandar STROBE"
    }
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setCategory(p.category);
    setTitle(p.title);
    setTargetEntity(p.entity);
    setDurationMonths(p.duration);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (title.trim()) {
        onSubmit();
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-6 sm:py-10 max-w-4xl mx-auto w-full animate-in fade-in duration-300">
      
      {/* 1. Iridescent Glowing AI Fluid Orb */}
      <div className="mb-6 flex justify-center">
        <div className="iridescent-orb cursor-pointer hover:scale-105 transition-transform" />
      </div>

      {/* 2. Hero Greetings & Title */}
      <div className="text-center mb-8 px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/40 border border-sky-800/40 text-[11px] font-mono text-sky-400 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>SOP Academic Campus Pro &bull; 12 Metode Berpikir Ilmiah</span>
        </div>
        
        <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-bold text-milk-white tracking-tight leading-tight">
          Mau merumuskan proposal apa hari ini?
        </h1>
        <p className="text-xs sm:text-sm text-milk-muted mt-2 max-w-xl mx-auto leading-relaxed">
          Ketikkan judul atau topik Anda. 5 Agen AI spesialis akan memandu sesi wawancara diagnostik, menyusun naskah akademik berstandar APA/Dikti, dan membangun graf pohon pengetahuannya.
        </p>
      </div>

      {/* 3. The Central Floating Command Capsule */}
      <div className="w-full max-w-2xl bg-[#0D121C] rounded-[24px] border border-[#1E2738] p-3.5 sm:p-4 shadow-2xl relative mb-6 transition-all hover:border-[#2C3B54]">
        
        {/* Top Capsule Banner Badge */}
        <div className="flex items-center justify-between px-3 py-1.5 mb-2 text-xs text-milk-muted border-b border-[#1A2333]">
          <div className="flex items-center gap-1.5 text-sky-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-[11px] tracking-wide font-mono">
              5 Agen Spesialis Siap Membedah Judul
            </span>
          </div>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-1 text-[11px] text-milk-muted hover:text-milk-white transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3 h-3 text-sky-400" />
            <span>{showConfig ? "Tutup Parameter" : "Parameter Instansi & Waktu"}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showConfig ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Collapsible Parameters (Target, Duration, Identity) */}
        {showConfig && (
          <div className="p-3 mb-3 bg-[#0A0E17] rounded-xl border border-[#192232] grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs animate-in fade-in duration-200">
            <div>
              <label className="text-[10px] font-mono uppercase text-milk-dim block mb-1">
                Instansi Mitra / Kampus
              </label>
              <input
                type="text"
                value={targetEntity}
                onChange={(e) => setTargetEntity(e.target.value)}
                placeholder="Contoh: PT Telkom / RS UGM"
                className="w-full bg-[#121824] border border-[#1E2738] rounded-lg px-2.5 py-1.5 text-milk-white placeholder:text-milk-dim text-xs focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-milk-dim block mb-1">
                Durasi Rencana
              </label>
              <select
                value={durationMonths}
                onChange={(e) => setDurationMonths(Number(e.target.value))}
                className="w-full bg-[#121824] border border-[#1E2738] rounded-lg px-2.5 py-1.5 text-milk-white text-xs focus:outline-none focus:border-sky-500"
              >
                <option value={1}>1 Bulan (4 Minggu)</option>
                <option value={3}>3 Bulan (12 Minggu - PKL)</option>
                <option value={4}>4 Bulan (16 Minggu - 1 Sem)</option>
                <option value={6}>6 Bulan (MBKM 20 SKS / Skripsi)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-milk-dim block mb-1">
                Nama Pengusul
              </label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="Nama Pengusul"
                className="w-full bg-[#121824] border border-[#1E2738] rounded-lg px-2.5 py-1.5 text-milk-white placeholder:text-milk-dim text-xs focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        )}

        {/* Input Textarea */}
        <div className="px-2 pt-1 pb-2">
          <textarea
            rows={2}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketikkan judul atau gagasan proposal magang, skripsi, atau riset yang ingin dirancang..."
            className="w-full bg-transparent text-milk-white placeholder:text-milk-dim text-sm sm:text-base focus:outline-none resize-none font-sans leading-relaxed"
          />
        </div>

        {/* Bottom Action Controls inside Capsule */}
        <div className="flex items-center justify-between pt-2.5 border-t border-[#182130] px-1 sm:px-2">
          {/* Category Switcher Tabs */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCategory("magang")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                category === "magang"
                  ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 shadow-sm"
                  : "bg-[#121824] text-milk-muted hover:text-white border border-transparent"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Magang</span>
            </button>

            <button
              onClick={() => setCategory("skripsi")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                category === "skripsi"
                  ? "bg-sky-950/60 text-sky-300 border border-sky-800/50 shadow-sm"
                  : "bg-[#121824] text-milk-muted hover:text-white border border-transparent"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Skripsi</span>
            </button>

            <button
              onClick={() => setCategory("penelitian")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                category === "penelitian"
                  ? "bg-purple-950/60 text-purple-300 border border-purple-800/50 shadow-sm"
                  : "bg-[#121824] text-milk-muted hover:text-white border border-transparent"
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Tesis/Riset</span>
            </button>
          </div>

          {/* Cyan Circular Send Button */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-[10px] text-milk-dim font-mono">
              Enter ↵
            </span>
            <button
              onClick={onSubmit}
              disabled={!title.trim()}
              title="Lanjutkan ke Wawancara Diagnostik"
              className="w-9 h-9 rounded-full bg-[#00A3FF] hover:bg-sky-400 active:scale-95 disabled:opacity-30 disabled:pointer-events-none text-white flex items-center justify-center transition-all shadow-lg shadow-sky-500/30 cursor-pointer flex-shrink-0"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

      </div>

      {/* 4. Three Quick Action Cards (Curated Academic Presets) */}
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[11px] font-mono text-milk-dim uppercase tracking-wider">
            Rekomendasi Topik Siap Uji:
          </span>
          {onOpenDatabase && (
            <button
              onClick={onOpenDatabase}
              className="text-[11px] text-sky-400 hover:text-sky-300 font-mono flex items-center gap-1 cursor-pointer"
            >
              <Database className="w-3 h-3" />
              <span>Buka Arsip Database</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {presets.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                onClick={() => handleApplyPreset(p)}
                className="p-3.5 rounded-2xl bg-[#0D121C] hover:bg-[#121A28] border border-[#1A2333] hover:border-sky-500/40 transition-all cursor-pointer group flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-lg bg-[#141B28] text-sky-400 border border-[#212C3F] flex items-center justify-center text-xs">
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-xs font-semibold text-milk-white group-hover:text-sky-300 transition-colors">
                      {p.badge}
                    </span>
                  </div>
                  
                  <p className="text-[11px] text-milk-muted group-hover:text-milk-soft line-clamp-2 leading-relaxed">
                    {p.title}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#17202E] text-[10px] text-milk-dim truncate font-mono">
                  {p.entity}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
