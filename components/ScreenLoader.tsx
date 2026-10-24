'use client';

import React, { useEffect, useState } from 'react';
import { GraduationCap, Sparkles, ShieldCheck } from 'lucide-react';

interface ScreenLoaderProps {
  onComplete: () => void;
}

const LOADING_STAGES = [
  { at: 0, text: 'Memuat modul ontologi & pedoman akademik Dikti...' },
  { at: 28, text: 'Menginisialisasi 12 metode berpikir ilmiah & naskah...' },
  { at: 58, text: 'Menyelaraskan mesin verifikasi sitasi & konsultan AI...' },
  { at: 85, text: 'Menyiapkan workspace akademik profesional...' },
  { at: 100, text: 'Workspace siap digunakan.' }
];

export default function ScreenLoader({ onComplete }: ScreenLoaderProps) {
  const [progress, setProgress] = useState(15);
  const [isFading, setIsFading] = useState(false);
  const [currentStageText, setCurrentStageText] = useState(LOADING_STAGES[0].text);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgress(40);
      setCurrentStageText(LOADING_STAGES[1].text);
    }, 180);

    const t2 = setTimeout(() => {
      setProgress(72);
      setCurrentStageText(LOADING_STAGES[2].text);
    }, 420);

    const t3 = setTimeout(() => {
      setProgress(94);
      setCurrentStageText(LOADING_STAGES[3].text);
    }, 700);

    const t4 = setTimeout(() => {
      setProgress(100);
      setCurrentStageText(LOADING_STAGES[4].text);
    }, 950);

    const t5 = setTimeout(() => {
      setIsFading(true);
      setTimeout(onComplete, 350);
    }, 1150);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#080B12] transition-opacity duration-350 select-none overflow-hidden ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background radial glow & fine grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#172033]/70 via-[#0B101A] to-[#080B12] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#25314915_1px,transparent_1px),linear-gradient(to_bottom,#25314915_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Decorative top aura */}
      <div className="absolute top-1/4 w-96 h-96 bg-[#7C9CFF]/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />

      <div className="relative z-10 flex flex-col items-center gap-6 px-6 max-w-sm text-center">
        {/* OXID Academic Studio Logo Emblem */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#111827] via-[#172033] to-[#0B101A] border border-[#253149] shadow-[0_0_40px_rgba(124,156,255,0.2)] flex items-center justify-center p-3 relative overflow-hidden group">
            {/* Subtle animated border highlight */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#7C9CFF]/20 to-transparent animate-pulse" />
            <div className="relative flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-0.5 text-[#7C9CFF]">
                <GraduationCap className="w-6 h-6 text-[#7C9CFF]" />
              </div>
              <span className="text-[9px] font-black tracking-widest text-[#F3F6FC] mt-0.5 font-mono">
                OXID
              </span>
            </div>
          </div>

          {/* Glowing orbital badge */}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#111827] border border-[#7C9CFF]/40 flex items-center justify-center shadow-xs">
            <Sparkles className="w-2.5 h-2.5 text-[#7C9CFF]" />
          </div>
        </div>

        {/* Product Title & Brand Identity */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-sm sm:text-base font-bold tracking-[0.22em] text-[#F3F6FC] uppercase font-sans">
              OXID ACADEMIC STUDIO
            </h1>
          </div>
          <p className="text-[11px] text-[#A4B1C7] tracking-wider font-medium">
            Autonomous Academic Intelligence & Research Engine
          </p>
        </div>

        {/* Sleek Progress Bar */}
        <div className="w-64 sm:w-72 space-y-2 mt-1">
          <div className="w-full h-1.5 bg-[#172033] rounded-full overflow-hidden border border-[#253149]/60 p-[1px]">
            <div
              className="h-full bg-gradient-to-r from-[#7C9CFF] via-[#9B8CFF] to-[#34D399] rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(124,156,255,0.6)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Telemetry Readout & Stage Ticker */}
          <div className="flex items-center justify-between text-[11px] font-mono px-0.5">
            <div className="flex items-center gap-1.5 text-[#A4B1C7] text-left truncate max-w-[200px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse flex-shrink-0" />
              <span className="truncate text-[10.5px]">{currentStageText}</span>
            </div>
            <span className="font-semibold text-[#7C9CFF] flex-shrink-0">
              {progress}%
            </span>
          </div>
        </div>

        {/* Regulatory & Institutional Compliance Badge */}
        <div className="pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111827]/80 border border-[#253149] text-[9.5px] font-mono text-[#A4B1C7]">
            <ShieldCheck className="w-3 h-3 text-[#34D399]" />
            <span>STANDAR DIKTI • STROBE / CONSORT • 12 THINKING MODES</span>
          </div>
        </div>
      </div>
    </div>
  );
}
