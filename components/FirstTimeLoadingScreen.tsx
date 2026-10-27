"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import ScreenLoader from "./ScreenLoader";

// Dynamic import for Three.js 3D WebGL Sphere (Identical to Landing Page)
const Hero3DOrb = dynamic(
  () => import("./Hero3DOrb").then((mod) => mod.Hero3DOrb),
  {
    ssr: false,
    loading: () => (
      <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr from-[#60A5FA]/30 via-[#C084FC]/25 to-[#818CF8]/20 blur-2xl animate-pulse" />
    ),
  }
);

interface FirstTimeLoadingScreenProps {
  onComplete: () => void;
  forceShow?: boolean;
}

export const FirstTimeLoadingScreen: React.FC<FirstTimeLoadingScreenProps> = ({ 
  onComplete,
  forceShow = false
}) => {
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastBeatFiredRef = useRef<number>(-1);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  // Palette: strictly maximum 3 colors + black and white
  const COLOR_BG = "#0A0D14";
  const COLOR_WHITE = "#FFFFFF";
  const COLOR_BLUE = "#2563EB";
  const COLOR_VIOLET = "#7C3AED";
  const COLOR_SLATE = "#334155";
  const COLOR_MUTED = "#64748B";

  // Mathematical Easing
  const easeOutExpo = (x: number) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x));
  const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  // Initialize storage check
  useEffect(() => {
    if (forceShow) {
      setIsFirstTime(true);
      setHasCheckedStorage(true);
      return;
    }
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
  }, [forceShow]);

  // Audio Synthesizer Engine (Web Audio API)
  const initAudio = () => {
    if (audioCtxRef.current) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    } catch {
      // Audio optional
    }
  };

  const playSynthesizedBeat = (beatNumber: number) => {
    if (!audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // Kick drum on every beat (120 BPM = every 0.5s)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.exponentialRampToValueAtTime(38, now + 0.11);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);

      // Harmonic chords at major scene changes (Beats 0, 4, 8, 12, 16, 24)
      if ([0, 4, 8, 12, 16, 24].includes(beatNumber)) {
        const chordFreqs = [261.63, 329.63, 392.00, 523.25];
        chordFreqs.forEach((freq) => {
          const chordOsc = ctx.createOscillator();
          const chordGain = ctx.createGain();
          chordOsc.type = "triangle";
          chordOsc.frequency.setValueAtTime(freq, now);

          chordGain.gain.setValueAtTime(0.08, now);
          chordGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

          chordOsc.connect(chordGain);
          chordGain.connect(ctx.destination);
          chordOsc.start(now);
          chordOsc.stop(now + 0.6);
        });
      }
    } catch {
      // Audio fallback without interrupting visual motion
    }
  };

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

  // Keyboard and click to proceed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " " || e.key === "Enter") {
        handleFinishShowreel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Master 60 FPS Canvas Motion Render Engine
  useEffect(() => {
    if (!isFirstTime || !hasCheckedStorage) return;

    initAudio();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    startTimeRef.current = performance.now();
    lastBeatFiredRef.current = -1;

    const renderFrame = (now: number) => {
      const elapsedSec = (now - startTimeRef.current) / 1000;
      setCurrentTimeSec(elapsedSec);

      // Complete at 15.0 seconds
      if (elapsedSec >= 15.0) {
        handleFinishShowreel();
        return;
      }

      const t = elapsedSec;
      const beat = Math.floor(t * 2.0);

      // Trigger synth per beat
      if (beat !== lastBeatFiredRef.current && beat < 30) {
        lastBeatFiredRef.current = beat;
        playSynthesizedBeat(beat);
      }

      const width = 1920;
      const height = 1080;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.save();
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = COLOR_BG;
      ctx.fillRect(0, 0, width, height);

      const cx = 960;
      const cy = 540;

      // =========================================================================
      // SCENE 1: BEATS 0 - 4 (0.0s - 2.0s): HOOK & KINETIC TYPOGRAPHY
      // =========================================================================
      if (t < 2.0) {
        const p1 = clamp(t / 0.5, 0, 1);
        const p2 = clamp((t - 0.5) / 0.5, 0, 1);
        const p3 = clamp((t - 1.0) / 0.5, 0, 1);
        const p4 = clamp((t - 1.5) / 0.5, 0, 1);

        if (t < 0.5) {
          // Beat 0: White structural reticle spark
          const radius = lerp(3, 16, easeOutExpo(p1));
          ctx.fillStyle = COLOR_WHITE;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fill();

          // Expanding crosshairs
          const lineLen = lerp(0, 160, easeOutExpo(p1));
          ctx.strokeStyle = COLOR_BLUE;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(cx - lineLen, cy); ctx.lineTo(cx + lineLen, cy);
          ctx.moveTo(cx, cy - lineLen); ctx.lineTo(cx, cy + lineLen);
          ctx.stroke();

          // Hairline coordinate labels
          ctx.font = "600 11px monospace";
          ctx.fillStyle = COLOR_MUTED;
          ctx.textAlign = "center";
          ctx.fillText("[ 00:00:00 // INITIATE ]", cx, cy + 45);
        } else if (t < 1.0) {
          // Beat 1: Kinetic Type "INQUIRY"
          const offset = lerp(70, 0, easeOutExpo(p2));
          ctx.font = "900 140px Inter, -apple-system, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = COLOR_WHITE;
          ctx.fillText("INQUIRY", cx, cy - offset * 0.15);

          ctx.font = "700 18px monospace";
          ctx.fillStyle = COLOR_BLUE;
          ctx.fillText("PHASE 01 // ONTOLOGY OF RESEARCH", cx, cy + 95);
        } else if (t < 1.5) {
          // Beat 2: Kinetic shear slice into "HYPOTHESIS"
          const split = lerp(0, 48, easeOutExpo(p3));
          ctx.font = "900 130px Inter, -apple-system, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // Top slice
          ctx.save();
          ctx.beginPath();
          ctx.rect(0, 0, width, cy);
          ctx.clip();
          ctx.fillStyle = COLOR_BLUE;
          ctx.fillText("HYPOTHESIS", cx - split, cy);
          ctx.restore();

          // Bottom slice
          ctx.save();
          ctx.beginPath();
          ctx.rect(0, cy, width, cy);
          ctx.clip();
          ctx.fillStyle = COLOR_WHITE;
          ctx.fillText("HYPOTHESIS", cx + split, cy);
          ctx.restore();
        } else {
          // Beat 3: Letters collapse into 4 vertical research pillars
          const p = easeOutCubic(p4);
          const colW = 120;
          const spacing = 280;
          const startX = cx - (spacing * 1.5);

          for (let i = 0; i < 4; i++) {
            const x = startX + i * spacing;
            const h = lerp(30, 520, p);
            const y = cy - h / 2;

            ctx.fillStyle = (i === 1 || i === 2) ? COLOR_BLUE : (i === 3 ? COLOR_VIOLET : COLOR_WHITE);
            ctx.fillRect(x - colW / 2, y, colW, h);

            if (p > 0.6) {
              ctx.font = "700 13px monospace";
              ctx.fillStyle = COLOR_BG;
              ctx.textAlign = "center";
              ctx.fillText("PILLAR.0" + (i + 1), x, y + 28);
            }
          }
        }
      }

      // =========================================================================
      // SCENE 2: BEATS 4 - 8 (2.0s - 4.0s): 12-MODE TOPOLOGICAL LATTICE
      // =========================================================================
      else if (t < 4.0) {
        const localT = t - 2.0;
        const subP = clamp((localT % 0.5) / 0.5, 0, 1);
        const subBeat = Math.floor(localT / 0.5);

        ctx.lineWidth = 2.5;

        if (subBeat === 0) {
          // Beat 4: Monoliths curve into orbital arcs
          const f = easeOutExpo(subP);
          for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2 + f * Math.PI * 0.5;
            const r = lerp(320, 240, f);
            ctx.strokeStyle = i % 2 === 0 ? COLOR_BLUE : COLOR_VIOLET;
            ctx.beginPath();
            ctx.arc(cx, cy, r, angle, angle + Math.PI * 0.6);
            ctx.stroke();
          }
        } else if (subBeat === 1 || subBeat === 2) {
          // Beats 5-6: 12-Mode Citation Network Graph
          const numNodes = 12;
          const nodeRadius = 260;

          ctx.strokeStyle = COLOR_SLATE;
          ctx.lineWidth = 1.5;

          for (let i = 0; i < numNodes; i++) {
            const a1 = (i / numNodes) * Math.PI * 2;
            const x1 = cx + Math.cos(a1) * nodeRadius;
            const y1 = cy + Math.sin(a1) * nodeRadius;

            const next = (i + 4) % numNodes;
            const a2 = (next / numNodes) * Math.PI * 2;
            const x2 = cx + Math.cos(a2) * nodeRadius;
            const y2 = cy + Math.sin(a2) * nodeRadius;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            ctx.fillStyle = (i % 3 === 0) ? COLOR_BLUE : (i % 3 === 1 ? COLOR_VIOLET : COLOR_WHITE);
            ctx.beginPath();
            ctx.arc(x1, y1, 7, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.font = "900 36px Inter, sans-serif";
          ctx.fillStyle = COLOR_WHITE;
          ctx.textAlign = "center";
          ctx.fillText("12 COGNITIVE MODES", cx, cy - 20);
          ctx.font = "600 15px monospace";
          ctx.fillStyle = COLOR_BLUE;
          ctx.fillText("CITATION TOPOLOGY GRAPH SYNCHRONIZED", cx, cy + 24);
        } else {
          // Beat 7: Collapsing into standardized academic A4 page
          const f = easeOutExpo(subP);
          const pageW = lerp(580, 480, f);
          const pageH = lerp(580, 680, f);
          const px = cx - pageW / 2;
          const py = cy - pageH / 2;

          ctx.fillStyle = "#0D111A";
          ctx.strokeStyle = COLOR_WHITE;
          ctx.lineWidth = 1.5;
          ctx.fillRect(px, py, pageW, pageH);
          ctx.strokeRect(px, py, pageW, pageH);

          // Simulated paragraph text lines
          ctx.fillStyle = "#2D3748";
          for (let l = 0; l < 8; l++) {
            const lw = (l % 2 === 0 ? 380 : 310);
            ctx.fillRect(px + 50, py + 120 + l * 40, lw, 6);
          }
        }
      }

      // =========================================================================
      // SCENE 3: BEATS 8 - 12 (4.0s - 6.0s): 2D-TO-3D ISOMETRIC CHAPTER UNFOLDING
      // =========================================================================
      else if (t < 6.0) {
        const localT = t - 4.0;
        const p = localT / 2.0;
        const rotY = lerp(0, 0.78, easeInOutCubic(p));
        const rotX = lerp(0, 0.52, easeInOutCubic(p));

        ctx.save();
        ctx.translate(cx, cy);

        const chapters = [
          { name: "BAB I : PENDAHULUAN", color: COLOR_WHITE, z: -120 },
          { name: "BAB II : KAJIAN PUSTAKA", color: COLOR_BLUE, z: -40 },
          { name: "BAB III : METODE PENELITIAN", color: COLOR_VIOLET, z: 40 },
          { name: "BAB IV : ANALISIS & DESAIN", color: COLOR_BLUE, z: 120 },
          { name: "BAB V : PENUTUP", color: COLOR_WHITE, z: 200 }
        ];

        chapters.forEach((chap) => {
          ctx.save();
          const zOffset = chap.z * easeOutCubic(clamp(localT / 1.2, 0, 1));

          ctx.transform(
            Math.cos(rotY), Math.sin(rotX) * 0.4,
            -Math.sin(rotY) * 0.4, Math.cos(rotX),
            0, zOffset * 0.8
          );

          const w = 480;
          const h = 76;
          ctx.fillStyle = "#0F172A";
          ctx.strokeStyle = chap.color;
          ctx.lineWidth = 1.8;
          ctx.fillRect(-w / 2, -h / 2, w, h);
          ctx.strokeRect(-w / 2, -h / 2, w, h);

          ctx.font = "800 17px Inter, -apple-system, sans-serif";
          ctx.fillStyle = chap.color;
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.fillText(chap.name, -w / 2 + 30, 0);

          ctx.restore();
        });

        ctx.restore();

        ctx.font = "700 15px monospace";
        ctx.fillStyle = COLOR_MUTED;
        ctx.textAlign = "center";
        ctx.fillText("ISOMETRIC STRUCTURAL DECOMPOSITION // BAB I - V", cx, 980);
      }

      // =========================================================================
      // SCENE 4: BEATS 12 - 16 (6.0s - 8.0s): DATA & UI MATRIX TELEMETRY
      // =========================================================================
      else if (t < 8.0) {
        const localT = t - 6.0;
        const p = clamp(localT / 2.0, 0, 1);

        const cardW = 920;
        const cardH = 500;
        ctx.fillStyle = "#0B1120";
        ctx.strokeStyle = "#1E293B";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH);
        ctx.fillRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH);

        // Header bar
        ctx.fillStyle = "#162032";
        ctx.fillRect(cx - cardW / 2, cy - cardH / 2, cardW, 52);

        ctx.font = "800 15px monospace";
        ctx.fillStyle = COLOR_WHITE;
        ctx.textAlign = "left";
        ctx.fillText("DIKTI & CAMPUS GUIDELINE ENGINE // REAL-TIME VALIDATION", cx - cardW / 2 + 25, cy - cardH / 2 + 32);

        const metrics = [
          { label: "DIKTI STANDARDS COMPLIANCE", val: clamp(Math.round(p * 100), 0, 100) + "%", color: COLOR_WHITE },
          { label: "STRUCTURAL CHAPTER SYMMETRY", val: "5/5 VERIFIED", color: COLOR_BLUE },
          { label: "CITATION INTEGRITY (APA / IEEE)", val: "100% AUDITED", color: COLOR_VIOLET },
          { label: "UNP FT 2025 REGULATORY PROTOCOL", val: "LOCKED ACTIVE", color: "#10B981" }
        ];

        metrics.forEach((m, i) => {
          const y = cy - cardH / 2 + 105 + i * 85;
          ctx.font = "700 13px monospace";
          ctx.fillStyle = COLOR_MUTED;
          ctx.fillText(m.label, cx - cardW / 2 + 40, y);

          const barW = 540;
          ctx.fillStyle = "#1E293B";
          ctx.fillRect(cx - cardW / 2 + 40, y + 12, barW, 9);

          const fillW = barW * clamp(p * 1.2, 0, 1);
          ctx.fillStyle = m.color;
          ctx.fillRect(cx - cardW / 2 + 40, y + 12, fillW, 9);

          ctx.font = "800 18px monospace";
          ctx.textAlign = "right";
          ctx.fillText(m.val, cx + cardW / 2 - 40, y + 21);
          ctx.textAlign = "left";
        });
      }

      // =========================================================================
      // SCENE 5 & 6: BEATS 16 - 24 (8.0s - 12.0s): 3D SPHERE STAGE
      // Background and rotating research titles (The 3D WebGL Orb is mounted over canvas)
      // =========================================================================
      else if (t < 12.0) {
        const localT = t - 8.0;

        // Subtle ambient perspective line
        ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, cy + 180);
        ctx.lineTo(width, cy + 180);
        ctx.stroke();

        // High-speed academic keyword rotation synchronized on beats
        const words = ["SKRIPSI & TUGAS AKHIR", "TESIS & DISERTASI", "LAPORAN PKL UNP 2025", "JURNAL ILMIAH BEREPUTASI"];
        const wordIdx = Math.floor(localT * 1.0) % words.length;

        ctx.font = "900 44px Inter, -apple-system, sans-serif";
        ctx.fillStyle = COLOR_WHITE;
        ctx.textAlign = "center";
        ctx.fillText(words[wordIdx], cx, 870);

        ctx.font = "700 15px monospace";
        ctx.fillStyle = COLOR_BLUE;
        ctx.fillText("3D VOLUMETRIC SYNTHESIS // READY FOR COMPOSITION", cx, 920);
      }

      // =========================================================================
      // SCENE 7: BEATS 24 - 28 (12.0s - 14.0s): END TITLE
      // =========================================================================
      else if (t < 14.0) {
        const localT = t - 12.0;
        const p = clamp(localT / 1.0, 0, 1);
        const f = easeOutExpo(p);

        // 4-pointed Star Emblem
        ctx.save();
        ctx.translate(cx, cy - 90);
        ctx.scale(f, f);
        ctx.fillStyle = COLOR_WHITE;
        ctx.beginPath();
        ctx.moveTo(0, -32);
        ctx.quadraticCurveTo(0, 0, 32, 0);
        ctx.quadraticCurveTo(0, 0, 0, 32);
        ctx.quadraticCurveTo(0, 0, -32, 0);
        ctx.quadraticCurveTo(0, 0, 0, -32);
        ctx.fill();
        ctx.restore();

        // Main Title
        ctx.font = "900 86px Inter, -apple-system, sans-serif";
        ctx.fillStyle = COLOR_WHITE;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("ACADEMIC AGENT STUDIO", cx, cy + 20);

        // Subtitle
        ctx.font = "700 22px monospace";
        ctx.fillStyle = COLOR_BLUE;
        ctx.fillText("THE AI RESEARCH & MANUSCRIPT ENGINE", cx, cy + 96);

        // Badges
        const badges = ["FT UNP 2025 COMPLIANT", "DIKTI STANDARDS", "12 COGNITIVE MODES", "DOCX / PPTX EXPORT"];
        const totalW = badges.length * 220;
        const startX = cx - totalW / 2 + 110;

        badges.forEach((b, i) => {
          const bx = startX + i * 220;
          const by = cy + 180;
          ctx.strokeStyle = "#334155";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(bx - 100, by - 16, 200, 32);

          ctx.font = "700 11px monospace";
          ctx.fillStyle = COLOR_MUTED;
          ctx.fillText(b, bx, by + 4);
        });
      }

      // =========================================================================
      // SCENE 8: BEATS 28 - 30 (14.0s - 15.0s): SEAMLESS POINT COLLAPSE
      // =========================================================================
      else {
        const localT = t - 14.0;
        const p = clamp(localT / 1.0, 0, 1);
        const f = easeInOutCubic(p);
        const radius = lerp(36, 3, f);

        ctx.fillStyle = COLOR_WHITE;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        const lineLen = lerp(80, 0, f);
        ctx.strokeStyle = COLOR_BLUE;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - lineLen, cy); ctx.lineTo(cx + lineLen, cy);
        ctx.moveTo(cx, cy - lineLen); ctx.lineTo(cx, cy + lineLen);
        ctx.stroke();
      }

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(renderFrame);
    };

    animFrameRef.current = requestAnimationFrame(renderFrame);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch {
          // ignore
        }
      }
    };
  }, [isFirstTime, hasCheckedStorage]);

  // If storage check pending, show clean dark void
  if (!hasCheckedStorage) {
    return <div className="fixed inset-0 z-50 bg-[#0A0D14]" />;
  }

  // IF REFRESH / SUBSEQUENT VISIT: Show simple, minimal ScreenLoader
  if (!isFirstTime) {
    return <ScreenLoader onComplete={onComplete} />;
  }

  // Calculate 3D WebGL Orb visibility between 7.8s and 12.2s
  let orbOpacity = 0;
  let orbScale = 1;
  if (currentTimeSec >= 7.8 && currentTimeSec <= 12.2) {
    if (currentTimeSec < 8.2) {
      orbOpacity = (currentTimeSec - 7.8) / 0.4;
      orbScale = 0.88 + orbOpacity * 0.12;
    } else if (currentTimeSec > 11.6) {
      orbOpacity = Math.max(0, (12.2 - currentTimeSec) / 0.6);
      orbScale = 0.92 + orbOpacity * 0.08;
    } else {
      orbOpacity = 1;
      orbScale = 1;
    }
  }

  // 100% CLEAN, IMMERSIVE, DISTRACTION-FREE MOTION SCREEN (NO DURATION, NO BADGES, NO BUTTONS)
  return (
    <div 
      onClick={handleFinishShowreel}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#0A0D14] transition-opacity duration-500 overflow-hidden select-none cursor-pointer ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      title="Klik untuk langsung masuk"
    >
      <div className="relative w-full h-full flex items-center justify-center bg-[#0A0D14] overflow-hidden">
        {/* Real-time 60 FPS HTML5 Canvas */}
        <canvas
          ref={canvasRef}
          width={1920}
          height={1080}
          className="w-full h-full object-contain bg-[#0A0D14]"
        />

        {/* Real Three.js 3D WebGL Holographic Glass Orb (Appears seamlessly at 8.0s - 12.0s) */}
        {currentTimeSec >= 7.6 && currentTimeSec <= 12.4 && (
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-300"
            style={{
              opacity: orbOpacity,
              transform: `scale(${orbScale}) translateY(-35px)`
            }}
          >
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 flex items-center justify-center">
              {/* Colored Halo Glow Behind 3D Sphere */}
              <div className="absolute w-56 h-56 sm:w-72 sm:h-72 md:w-84 md:h-84 rounded-full bg-gradient-to-tr from-[#60A5FA]/35 via-[#C084FC]/30 to-[#818CF8]/25 blur-3xl pointer-events-none" />
              {/* Authentic Three.js 3D Sphere */}
              <Hero3DOrb className="w-full h-full" />
              {/* Floor Shadow */}
              <div className="absolute -bottom-4 w-44 sm:w-56 h-6 rounded-full bg-blue-950/40 blur-md pointer-events-none" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FirstTimeLoadingScreen;
