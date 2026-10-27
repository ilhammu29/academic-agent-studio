"use client";

import React from "react";
import { Lock, Sparkles, ShieldCheck, ArrowRight, Zap, CheckCircle2 } from "lucide-react";

interface LockedContentOverlayProps {
  onOpenSubscription: () => void;
  chapterTitle?: string;
  pageNumber?: number;
  children?: React.ReactNode;
}

export const LockedContentOverlay: React.FC<LockedContentOverlayProps> = ({
  onOpenSubscription,
  chapterTitle = "Bab Dokumen",
  pageNumber,
  children
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 my-6 bg-gradient-to-b from-amber-500/5 via-amber-500/10 to-amber-500/5">
      {/* 1. Background Content with heavy blur effect (Preview silhouette) */}
      <div 
        className="select-none pointer-events-none filter blur-sm opacity-40 p-6 md:p-8 space-y-4 max-h-[360px] overflow-hidden"
        aria-hidden="true"
      >
        {children ? (
          children
        ) : (
          <>
            <div className="h-6 w-1/3 bg-zinc-400 dark:bg-zinc-600 rounded animate-pulse" />
            <div className="h-4 w-full bg-zinc-300 dark:bg-zinc-700 rounded" />
            <div className="h-4 w-5/6 bg-zinc-300 dark:bg-zinc-700 rounded" />
            <div className="h-4 w-4/6 bg-zinc-300 dark:bg-zinc-700 rounded" />
            <div className="grid grid-cols-3 gap-3 my-4">
              <div className="h-16 bg-zinc-300 dark:bg-zinc-700 rounded" />
              <div className="h-16 bg-zinc-300 dark:bg-zinc-700 rounded" />
              <div className="h-16 bg-zinc-300 dark:bg-zinc-700 rounded" />
            </div>
            <div className="h-4 w-full bg-zinc-300 dark:bg-zinc-700 rounded" />
            <div className="h-4 w-3/4 bg-zinc-300 dark:bg-zinc-700 rounded" />
          </>
        )}
      </div>

      {/* 2. Floating Centered Paywall Lock Card */}
      <div className="absolute inset-0 z-20 flex items-center justify-center p-4 backdrop-blur-[2px] bg-white/70 dark:bg-zinc-950/80">
        <div className="max-w-md w-full p-6 sm:p-7 rounded-2xl bg-white dark:bg-zinc-900 border border-amber-500/30 shadow-2xl text-center">
          
          {/* Badge Icon */}
          <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-4 shadow-sm">
            <Lock className="w-7 h-7" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Halaman Terkunci (Freemium Mode)</span>
          </div>

          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {chapterTitle} Terkunci
          </h3>

          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
            Kuota 3x trial penuh Anda telah digunakan. Naskah bab ini telah disusun tuntas oleh 12 Agen AI, namun hanya 3 halaman awal yang dibuka pada versi preview.
          </p>

          <div className="mt-4 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-left space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Buka seluruh bab (Bab II s/d Bab V) &amp; Lampiran</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Ekspor Word DOCX &amp; PDF resmi tanpa watermark</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Akses tabel DOV, WBS, dan RAB tanpa batas</span>
            </div>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenSubscription}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Buka Seluruh Halaman Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-3">
            Mulai Rp 49.000 / naskah • Tersedia paket semester &amp; tahunan
          </p>
        </div>
      </div>
    </div>
  );
};

export default LockedContentOverlay;
