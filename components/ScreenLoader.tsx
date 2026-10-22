'use client';

import React, { useEffect, useState } from 'react';

interface ScreenLoaderProps {
  onComplete: () => void;
}

export default function ScreenLoader({ onComplete }: ScreenLoaderProps) {
  const [progress, setProgress] = useState(25);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setProgress(65), 200);
    const timer2 = setTimeout(() => setProgress(100), 500);
    const timer3 = setTimeout(() => {
      setIsFading(true);
      setTimeout(onComplete, 300);
    }, 700);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-300 ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-zinc-100 text-black flex items-center justify-center font-bold text-sm tracking-widest shadow-md">
          LIX
        </div>
        <h2 className="text-sm font-medium tracking-tight text-zinc-300">
          Academic Agent Studio
        </h2>
        <div className="w-36 h-0.5 bg-zinc-900 rounded-full overflow-hidden mt-1">
          <div
            className="h-full bg-zinc-100 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
