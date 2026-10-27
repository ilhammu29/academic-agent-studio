"use client";

import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, ArrowRight, Sparkles, GraduationCap } from "lucide-react";
import ScreenLoader from "./ScreenLoader";

interface FirstTimeLoadingScreenProps {
  onComplete: () => void;
}

export const FirstTimeLoadingScreen: React.FC<FirstTimeLoadingScreenProps> = ({ onComplete }) => {
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Check if user has already watched the full first-time showreel
    try {
      const seen = localStorage.getItem("academic_showreel_seen");
      if (!seen) {
        setIsFirstTime(true);
      } else {
        setIsFirstTime(false);
      }
    } catch {
      setIsFirstTime(false);
    }
    setHasCheckedStorage(true);
  }, []);

  const handleFinishShowreel = () => {
    try {
      localStorage.setItem("academic_showreel_seen", "true");
    } catch (e) {
      console.warn("Storage not available", e);
    }
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 450);
  };

  const toggleSound = () => {
    if (!videoRef.current) return;
    const nextMute = !videoRef.current.muted;
    videoRef.current.muted = nextMute;
    setIsMuted(nextMute);
  };

  // If storage check pending, show black void
  if (!hasCheckedStorage) {
    return <div className="fixed inset-0 z-50 bg-[#0A0D14]" />;
  }

  // IF REFRESH / SUBSEQUENT VISIT: Show regular lightweight ScreenLoader
  if (!isFirstTime) {
    return <ScreenLoader onComplete={onComplete} />;
  }

  // IF FIRST TIME VISIT: Show 15-second Motion Design Showreel Video
  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#0A0D14] transition-opacity duration-500 overflow-hidden select-none ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* 1920x1080 Aspect Ratio Video Container */}
      <div className="relative w-full h-full flex items-center justify-center">
        <video
          ref={videoRef}
          src="/intro-showreel.mp4"
          autoPlay
          playsInline
          muted={isMuted}
          onEnded={handleFinishShowreel}
          className="w-full h-full object-contain md:object-cover bg-[#0A0D14]"
        />

        {/* Top Controls: Logo + Audio Toggle + Skip Button */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20 pointer-events-auto">
          {/* Brand Emblem */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="font-bold tracking-wider">ACADEMIC AGENT STUDIO</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-white hover:text-blue-400 transition-colors cursor-pointer"
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Skip / Enter Studio Button */}
            <button
              type="button"
              onClick={handleFinishShowreel}
              className="px-4 py-2 rounded-full bg-white/90 hover:bg-white text-[#0A0D14] font-bold text-xs flex items-center gap-1.5 shadow-lg hover:scale-105 transition-all cursor-pointer"
            >
              <span>Masuk ke Studio</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Bottom Status Ticker */}
        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between z-20 text-[11px] font-mono text-zinc-400 pointer-events-none">
          <span>CONCEPT: INQUIRY → HYPOTHESIS → MANUSCRIPT</span>
          <span className="hidden sm:inline">120 BPM MOTION ENGINE // 15.0 SECONDS</span>
        </div>
      </div>
    </div>
  );
};

export default FirstTimeLoadingScreen;
