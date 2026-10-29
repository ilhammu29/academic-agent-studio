'use client';

import React, { useEffect, useState } from 'react';

export interface ScreenLoaderProps {
  onComplete?: () => void;
}

export function ScreenLoader({ onComplete }: ScreenLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Fast, smooth progress transition
    const p1 = setTimeout(() => setProgress(45), 100);
    const p2 = setTimeout(() => setProgress(85), 320);
    const p3 = setTimeout(() => setProgress(100), 550);

    let finishTimer: NodeJS.Timeout | undefined;
    if (onComplete) {
      finishTimer = setTimeout(() => {
        setIsFading(true);
        setTimeout(onComplete, 250);
      }, 720);
    }

    return () => {
      clearTimeout(p1);
      clearTimeout(p2);
      clearTimeout(p3);
      if (finishTimer) clearTimeout(finishTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#09090b] transition-opacity duration-300 select-none overflow-hidden ${
        isFading && onComplete ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
        {/* Sleek 4-pointed Star Emblem with subtle pulse */}
        <div className="w-10 h-10 flex items-center justify-center text-white/95">
          <svg className="w-8 h-8 fill-current animate-pulse text-white" viewBox="0 0 24 24">
            <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
          </svg>
        </div>

        {/* Minimal Clean Typography: academic agent studio */}
        <div className="space-y-1">
          <div className="text-xs sm:text-sm font-semibold tracking-wide text-zinc-200 lowercase">
            academic agent studio
          </div>
        </div>

        {/* Minimalist Razor-Thin Progress Line */}
        <div className="w-36 sm:w-44 h-[1.5px] bg-white/10 rounded-full overflow-hidden mt-1">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default ScreenLoader;
