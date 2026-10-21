'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, Brain, Cpu, Database, CheckCircle2 } from 'lucide-react';

interface ScreenLoaderProps {
  onComplete: () => void;
}

export default function ScreenLoader({ onComplete }: ScreenLoaderProps) {
  const [progress, setProgress] = useState(15);
  const [stepIndex, setStepIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  const steps = [
    { label: "Menginisialisasi Kernel 12 Metode Berpikir...", icon: Brain },
    { label: "Menyiapkan 5 Agen Ahli Akademik & SOP Standar...", icon: Cpu },
    { label: "Sinkronisasi Database Supabase & Cache Lokal...", icon: Database },
    { label: "Studio Siap Digunakan.", icon: CheckCircle2 },
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setProgress(45);
      setStepIndex(1);
    }, 350);

    const timer2 = setTimeout(() => {
      setProgress(78);
      setStepIndex(2);
    }, 750);

    const timer3 = setTimeout(() => {
      setProgress(100);
      setStepIndex(3);
    }, 1150);

    const timer4 = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => {
        onComplete();
      }, 400);
    }, 1450);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  const CurrentIcon = steps[stepIndex].icon;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07090E] transition-opacity duration-500 ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background radial atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_45%,rgba(0,163,255,0.12),transparent_75%)] pointer-events-none" />

      {/* Center Animated Emblem */}
      <div className="relative mb-8 flex items-center justify-center">
        {/* Outer Orbit Ring */}
        <div className="w-24 h-24 rounded-full border border-sky-500/20 animate-spin-slow border-t-sky-400 border-r-transparent" />
        
        {/* Inner Counter-Orbit Ring */}
        <div className="absolute w-16 h-16 rounded-full border border-champagne/30 animate-spin border-b-champagne border-l-transparent" style={{ animationDirection: 'reverse', animationDuration: '6s' }} />

        {/* Central Glowing Core */}
        <div className="absolute w-10 h-10 rounded-full bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/30">
          <Sparkles className="w-5 h-5 text-white animate-pulse" />
        </div>
      </div>

      {/* Typography */}
      <div className="text-center z-10 max-w-sm px-4">
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <span className="text-[10px] uppercase font-mono tracking-widest px-2.5 py-0.5 rounded-full bg-sky-950/60 text-sky-400 border border-sky-800/40 font-semibold">
            ACADEMIC ENGINE v2.4
          </span>
        </div>
        <h2 className="text-xl font-bold text-milk-white tracking-tight">
          Academic & Proposal Agent Studio
        </h2>
        <p className="text-xs text-milk-muted mt-1 font-mono flex items-center justify-center gap-1.5 min-h-[20px]">
          <CurrentIcon className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
          <span>{steps[stepIndex].label}</span>
        </p>

        {/* Progress Bar */}
        <div className="mt-5 w-56 h-1.5 bg-[#141A26] rounded-full mx-auto overflow-hidden border border-[#1E2638]">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-cyan-300 transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Direct Skip button */}
        <button
          onClick={() => {
            setIsFading(true);
            setTimeout(onComplete, 200);
          }}
          className="mt-6 text-[11px] text-milk-dim hover:text-milk-muted transition-colors font-mono cursor-pointer underline underline-offset-4"
        >
          Lewati Intro →
        </button>
      </div>
    </div>
  );
}
