"use client";

import React, { useState } from "react";
import { ProposalCategory } from "@/types/studio";
import { 
  ArrowUp, 
  Sparkles, 
  Building2, 
  Clock, 
  Compass, 
  BookOpen, 
  Layers, 
  HelpCircle, 
  FileUp, 
  SlidersHorizontal,
  ChevronDown
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
  onSubmit
}) => {
  const [showConfig, setShowConfig] = useState(false);

  const presets = [
    {
      category: "magang" as ProposalCategory,
      badge: "Surprise me!",
      title: "Penerapan Pipeline Otomatisasi Data & Visualisasi Analitik",
      entity: "PT Telkom Indonesia (Persero) Tbk",
      desc: "Magang Divisi Big Data Enterprise & Cloud Solutions"
    },
    {
      category: "skripsi" as ProposalCategory,
      badge: "Skripsi Kedokteran",
      title: "Perbedaan Pola Makan & Aktivitas Fisik dengan Obesitas Remaja",
      entity: "SMA PPMI Assalaam Surakarta",
      desc: "Studi Observasional Komparatif FK-KMK UGM"
    },
    {
      category: "skripsi" as ProposalCategory,
      badge: "Riset Saintek & AI",
      title: "Pengembangan Model Transformer untuk Klasifikasi Multimodal",
      entity: "Laboratorium AI & Smart City",
      desc: "Penelitian Algoritma Fine-Tuning LoRA"
    }
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setCategory(p.category);
    setTitle(p.title);
    setTargetEntity(p.entity);
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
    <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 py-8 md:py-12 max-w-4xl mx-auto w-full">
      
      {/* 1. Iridescent Glowing AI Orb from Reference */}
      <div className="mb-6 flex justify-center">
        <div className="iridescent-orb cursor-pointer hover:scale-105 transition-transform" />
      </div>

      {/* 2. Hero Greetings & Title */}
      <div className="text-center mb-8">
        <p className="text-xs md:text-sm font-sans font-medium text-milk-muted tracking-wide mb-1.5">
          Selamat Datang, {candidateName.split(" ")[0] || "Peneliti"}
        </p>
        <h1 className="text-3xl md:text-4xl lg:text-[42px] font-sans font-bold text-milk-white tracking-tight leading-tight">
          Mau buat proposal apa hari ini?
        </h1>
        <p className="text-xs md:text-sm text-milk-muted font-sans mt-2 max-w-lg mx-auto leading-relaxed">
          Ketikkan judul atau topik Anda — agen AI spesialis akan memandu wawancara diagnostik, menyusun naskah utuh, dan memetakan struktur visualnya.
        </p>
      </div>

      {/* 3. The Central Floating Command Capsule (Reference Capsule) */}
      <div className="w-full max-w-2xl bg-[#141A23] rounded-[24px] border border-[#222C3A] p-3 md:p-4 shadow-2xl relative mb-8 transition-all hover:border-[#2C384A]">
        
        {/* Top Capsule Banner Badge */}
        <div className="flex items-center justify-between px-3 py-1.5 mb-2 text-xs font-sans text-milk-muted border-b border-[#1E2633]/60">
          <div className="flex items-center gap-1.5 text-sky-400 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-[11px] tracking-wide font-sans">
              5 Agen AI Spesialis Aktif &bull; 12 Metode Berpikir
            </span>
          </div>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-1 text-[11px] text-milk-muted hover:text-milk-white transition-colors cursor-pointer"
          >
            <span>{showConfig ? "Tutup Parameter" : "Parameter Target"}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showConfig ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Collapsible Parameters (Target, Duration, Identity) */}
        {showConfig && (
          <div className="p-3 mb-3 bg-[#0E131A] rounded-xl border border-[#1E2633] grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs animate-in fade-in duration-200">
            <div>
              <label className="text-[10px] font-mono uppercase text-milk-dim block mb-1">
                Instansi Tujuan
              </label>
              <input
                type="text"
                value={targetEntity}
                onChange={(e) => setTargetEntity(e.target.value)}
                placeholder="Contoh: PT Telkom / RS UGM"
                className="w-full bg-[#161C26] border border-[#222B38] rounded-lg px-2.5 py-1.5 text-milk-white placeholder:text-milk-dim text-xs focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-milk-dim block mb-1">
                Durasi Rencana
              </label>
              <select
                value={durationMonths}
                onChange={(e) => setDurationMonths(Number(e.target.value))}
                className="w-full bg-[#161C26] border border-[#222B38] rounded-lg px-2.5 py-1.5 text-milk-white text-xs focus:outline-none focus:border-sky-500"
              >
                <option value={1}>1 Bulan (4 Minggu)</option>
                <option value={3}>3 Bulan (12 Minggu - PKL)</option>
                <option value={4}>4 Bulan (16 Minggu - 1 Sem)</option>
                <option value={6}>6 Bulan (MBKM 20 SKS / Skripsi)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-milk-dim block mb-1">
                Nama & NIM Pengusul
              </label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="Nama Pengusul"
                className="w-full bg-[#161C26] border border-[#222B38] rounded-lg px-2.5 py-1.5 text-milk-white placeholder:text-milk-dim text-xs focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        )}

        {/* Input Textarea */}
        <div className="px-3 pt-1 pb-2">
          <textarea
            rows={2}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketikkan judul proposal magang atau skripsi yang ingin Anda buat..."
            className="w-full bg-transparent text-milk-white placeholder:text-milk-dim text-sm md:text-base focus:outline-none resize-none font-sans leading-relaxed"
          />
        </div>

        {/* Bottom Action Controls inside Capsule */}
        <div className="flex items-center justify-between pt-2 border-t border-[#1C2330] px-2">
          {/* Quick Option Badges */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCategory(category === "magang" ? "skripsi" : "magang")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1A2230] hover:bg-[#222C3D] border border-[#28354A] text-xs font-sans text-milk-soft hover:text-milk-white transition-all cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
              <span>{category === "magang" ? "Proposal Magang" : "Proposal Skripsi"}</span>
            </button>

            <span className="hidden sm:inline-block text-[11px] text-milk-dim font-mono">
              Tekan Enter ↵ untuk mulai
            </span>
          </div>

          {/* Cyan Circular Send Button from Reference */}
          <button
            onClick={onSubmit}
            disabled={!title.trim()}
            title="Lanjutkan ke Wawancara Diagnostik"
            className="w-9 h-9 rounded-full bg-[#00A3FF] hover:bg-[#38BDF8] active:scale-95 disabled:opacity-30 disabled:pointer-events-none text-white flex items-center justify-center transition-all shadow-lg shadow-sky-500/25 cursor-pointer flex-shrink-0"
          >
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

      </div>

      {/* 4. Three Quick Action Cards from Reference (Surprise me, Skripsi, Riset) */}
      <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-3 gap-3">
        {presets.map((p, idx) => (
          <div
            key={idx}
            onClick={() => handleApplyPreset(p)}
            className="p-3.5 rounded-2xl bg-[#111620] hover:bg-[#161D2B] border border-[#1E2636] hover:border-sky-500/40 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-lg bg-[#182130] text-sky-400 border border-[#253347] flex items-center justify-center text-xs">
                {idx === 0 ? "💬" : idx === 1 ? "🩺" : "🔬"}
              </span>
              <span className="text-xs font-sans font-semibold text-milk-white group-hover:text-sky-300 transition-colors">
                {p.badge}
              </span>
            </div>
            
            <p className="text-[11px] text-milk-muted group-hover:text-milk-soft line-clamp-2 leading-snug">
              {p.title}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
};
