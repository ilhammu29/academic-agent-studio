'use client';

import React from 'react';
import { GraduationCap, Sparkles, ShieldCheck } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0C0D0E] select-none overflow-hidden">
      {/* Background radial glow & fine grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1E1F24]/70 via-[#121316] to-[#0C0D0E] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#26282E15_1px,transparent_1px),linear-gradient(to_bottom,#26282E15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-6 px-6 max-w-sm text-center">
        {/* OXID Academic Studio Logo Emblem */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#17181C] via-[#1E1F24] to-[#121316] border border-[#26282E] shadow-[0_0_40px_rgba(124,156,255,0.2)] flex items-center justify-center p-3 relative overflow-hidden">
            <div className="relative flex flex-col items-center justify-center text-center">
              <GraduationCap className="w-6 h-6 text-[#7C9CFF]" />
              <span className="text-[9px] font-black tracking-widest text-[#F3F4F6] mt-0.5 font-mono">
                OXID
              </span>
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#17181C] border border-[#7C9CFF]/40 flex items-center justify-center shadow-xs">
            <Sparkles className="w-2.5 h-2.5 text-[#7C9CFF]" />
          </div>
        </div>

        {/* Product Title */}
        <div className="space-y-1.5">
          <h1 className="text-sm sm:text-base font-bold tracking-[0.22em] text-[#F3F4F6] uppercase font-sans">
            OXID ACADEMIC STUDIO
          </h1>
          <p className="text-[11px] text-[#9CA3AF] tracking-wider font-medium">
            Autonomous Academic Intelligence & Research Engine
          </p>
        </div>

        {/* Infinite subtle pulse loader */}
        <div className="w-64 sm:w-72 space-y-2 mt-1">
          <div className="w-full h-1.5 bg-[#1E1F24] rounded-full overflow-hidden border border-[#26282E]/60 p-[1px]">
            <div className="h-full bg-gradient-to-r from-[#7C9CFF] via-[#9B8CFF] to-[#34D399] rounded-full animate-pulse w-3/4 shadow-[0_0_12px_rgba(124,156,255,0.6)]" />
          </div>
          <div className="flex items-center justify-center gap-1.5 text-[#9CA3AF] text-[10.5px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-ping" />
            <span>Memuat workspace akademik...</span>
          </div>
        </div>

        <div className="pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#17181C]/80 border border-[#26282E] text-[9.5px] font-mono text-[#9CA3AF]">
            <ShieldCheck className="w-3 h-3 text-[#34D399]" />
            <span>STANDAR DIKTI • STROBE / CONSORT</span>
          </div>
        </div>
      </div>
    </div>
  );
}
