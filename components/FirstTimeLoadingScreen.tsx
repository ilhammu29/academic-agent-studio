"use client";

import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, ArrowRight, Sparkles, RefreshCw } from "lucide-react";
import ScreenLoader from "./ScreenLoader";

interface FirstTimeLoadingScreenProps {
  onComplete: () => void;
  forceShow?: boolean; // Allows replaying from landing page
}

export const FirstTimeLoadingScreen: React.FC<FirstTimeLoadingScreenProps> = ({ 
  onComplete,
  forceShow = false
}) => {
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [activeSceneName, setActiveSceneName] = useState("01 // KINETIC INQUIRY");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastBeatFiredRef = useRef<number>(-1);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  // Colors
  const COLOR_BG = "#0A0D14";
  const COLOR_WHITE = "#FFFFFF";
  const COLOR_BLUE = "#2563EB";
  const COLOR_VIOLET = "#7C3AED";
  const COLOR_MUTED = "#64748B";

  // Easing helpers
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
    } catch (e) {
      console.warn("AudioContext init error:", e);
    }
  };

  const playSynthesizedBeat = (beatNumber: number) => {
    if (isMuted || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // 1. Kick drum synthesizer on every beat (120 BPM = every 0.5s)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(36, now + 0.12);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);

      // 2. Harmonic chord hit on key scene transitions (Beats 0, 4, 8, 12, 16, 24)
      if ([0, 4, 8, 12, 16, 24].includes(beatNumber)) {
        const chordFreqs = [261.63, 329.63, 392.00, 523.25]; // C Major add9
        chordFreqs.forEach((freq) => {
          const chordOsc = ctx.createOscillator();
          const chordGain = ctx.createGain();
          chordOsc.type = "triangle";
          chordOsc.frequency.setValueAtTime(freq, now);

          chordGain.gain.setValueAtTime(0.12, now);
          chordGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

          chordOsc.connect(chordGain);
          chordGain.connect(ctx.destination);
          chordOsc.start(now);
          chordOsc.stop(now + 0.65);
        });
      }
    } catch {
      // Audio fallback without interrupting visual motion
    }
  };

  const toggleSound = () => {
    initAudio();
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    setIsMuted((prev) => !prev);
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

  // Master 60 FPS Canvas Motion Render Engine
  useEffect(() => {
    if (!isFirstTime || !hasCheckedStorage) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    startTimeRef.current = performance.now();
    lastBeatFiredRef.current = -1;

    const renderFrame = (now: number) => {
      const elapsedSec = (now - startTimeRef.current) / 1000;
      setCurrentTimeSec(Math.min(elapsedSec, 15.0));

      // Check for completion at 15.0s
      if (elapsedSec >= 15.0) {
        handleFinishShowreel();
        return;
      }

      const t = elapsedSec;
      const beat = Math.floor(t * 2.0); // 120 BPM = 2 beats per second

      // Trigger Web Audio synth per beat
      if (beat !== lastBeatFiredRef.current && beat < 30) {
        lastBeatFiredRef.current = beat;
        playSynthesizedBeat(beat);
      }

      // Maintain high DPI canvas resolution
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
      // SCENE 1: BEATS 0 - 4 (0.0s - 2.0s): HOOK & KINETIC TYPE
      // =========================================================================
      if (t < 2.0) {
        if (activeSceneName !== "01 // KINETIC INQUIRY") setActiveSceneName("01 // KINETIC INQUIRY");
        const p1 = clamp(t / 0.5, 0, 1);
        const p2 = clamp((t - 0.5) / 0.5, 0, 1);
        const p3 = clamp((t - 1.0) / 0.5, 0, 1);
        const p4 = clamp((t - 1.5) / 0.5, 0, 1);

        if (t < 0.5) {
          // Beat 0: Initial white spark expanding
          const radius = lerp(4, 20, easeOutExpo(p1));
          ctx.fillStyle = COLOR_WHITE;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fill();

          const lineLen = lerp(0, 140, easeOutExpo(p1));
          ctx.strokeStyle = COLOR_BLUE;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(cx - lineLen, cy); ctx.lineTo(cx + lineLen, cy);
          ctx.moveTo(cx, cy - lineLen); ctx.lineTo(cx, cy + lineLen);
          ctx.stroke();
        } else if (t < 1.0) {
          // Beat 1: Kinetic Type "INQUIRY"
          const offset = lerp(80, 0, easeOutExpo(p2));
          ctx.font = "900 130px Inter, -apple-system, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = COLOR_WHITE;
          ctx.fillText("INQUIRY", cx, cy - offset * 0.2);

          ctx.font = "700 24px monospace";
          ctx.fillStyle = COLOR_BLUE;
          ctx.fillText("PHASE 01 // ONTOLOGY OF INQUIRY", cx, cy + 90);
        } else if (t < 1.5) {
          // Beat 2: Horizontal Slice Transform into "HYPOTHESIS"
          const split = lerp(0, 42, easeOutExpo(p3));
          ctx.font = "900 120px Inter, -apple-system, sans-serif";
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
            const h = lerp(40, 520, p);
            const y = cy - h / 2;

            ctx.fillStyle = (i === 1 || i === 2) ? COLOR_BLUE : (i === 3 ? COLOR_VIOLET : COLOR_WHITE);
            ctx.fillRect(x - colW / 2, y, colW, h);

            if (p > 0.6) {
              ctx.font = "700 14px monospace";
              ctx.fillStyle = COLOR_BG;
              ctx.textAlign = "center";
              ctx.fillText("COL.0" + (i + 1), x, y + 30);
            }
          }
        }
      }

      // =========================================================================
      // SCENE 2: BEATS 4 - 8 (2.0s - 4.0s): SHAPE MORPHING & TOPOLOGICAL LATTICE
      // =========================================================================
      else if (t < 4.0) {
        if (activeSceneName !== "02 // 12-MODE TOPOLOGY") setActiveSceneName("02 // 12-MODE TOPOLOGY");
        const localT = t - 2.0;
        const subP = clamp((localT % 0.5) / 0.5, 0, 1);
        const subBeat = Math.floor(localT / 0.5);

        ctx.lineWidth = 3;

        if (subBeat === 0) {
          // Beat 4: Pillars compress into intersecting vector arcs
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
          // Beats 5-6: Topological citation network & graph matrix
          const numNodes = 12;
          const nodeRadius = 260;

          ctx.strokeStyle = "#1E293B";
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
            ctx.arc(x1, y1, 8, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.font = "800 32px monospace";
          ctx.fillStyle = COLOR_WHITE;
          ctx.textAlign = "center";
          ctx.fillText("TOPOLOGY: 12 THINKING MODES", cx, cy - 20);
          ctx.font = "500 16px monospace";
          ctx.fillStyle = COLOR_BLUE;
          ctx.fillText("RESEARCH CITATION GRAPH ACTIVE", cx, cy + 20);
        } else {
          // Beat 7: Matrix collapses into standard A4 academic page outline
          const f = easeOutExpo(subP);
          const pageW = lerp(600, 480, f);
          const pageH = lerp(600, 680, f);
          const px = cx - pageW / 2;
          const py = cy - pageH / 2;

          ctx.fillStyle = "#0F172A";
          ctx.strokeStyle = COLOR_WHITE;
          ctx.lineWidth = 2;
          ctx.fillRect(px, py, pageW, pageH);
          ctx.strokeRect(px, py, pageW, pageH);

          // Simulated text paragraph lines
          ctx.fillStyle = "#334155";
          for (let l = 0; l < 8; l++) {
            const lw = (l % 2 === 0 ? 380 : 320);
            ctx.fillRect(px + 50, py + 120 + l * 40, lw, 6);
          }
        }
      }

      // =========================================================================
      // SCENE 3: BEATS 8 - 12 (4.0s - 6.0s): 2D-TO-3D ISOMETRIC CHAPTER UNFOLDING
      // =========================================================================
      else if (t < 6.0) {
        if (activeSceneName !== "03 // ISOMETRIC CHAPTERS") setActiveSceneName("03 // ISOMETRIC CHAPTERS");
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
          ctx.lineWidth = 2;
          ctx.fillRect(-w / 2, -h / 2, w, h);
          ctx.strokeRect(-w / 2, -h / 2, w, h);

          ctx.font = "800 18px Inter, -apple-system, sans-serif";
          ctx.fillStyle = chap.color;
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.fillText(chap.name, -w / 2 + 30, 0);

          ctx.restore();
        });

        ctx.restore();

        ctx.font = "700 16px monospace";
        ctx.fillStyle = COLOR_MUTED;
        ctx.textAlign = "center";
        ctx.fillText("ISOMETRIC STRUCTURE DECOMPOSITION // BAB I - V", cx, 980);
      }

      // =========================================================================
      // SCENE 4: BEATS 12 - 16 (6.0s - 8.0s): DATA & UI MATRIX TELEMETRY
      // =========================================================================
      else if (t < 8.0) {
        if (activeSceneName !== "04 // COMPLIANCE MATRIX") setActiveSceneName("04 // COMPLIANCE MATRIX");
        const localT = t - 6.0;
        const p = clamp(localT / 2.0, 0, 1);

        const cardW = 920;
        const cardH = 500;
        ctx.fillStyle = "#0B1120";
        ctx.strokeStyle = "#1E293B";
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH);
        ctx.fillRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH);

        // Header bar
        ctx.fillStyle = "#1E293B";
        ctx.fillRect(cx - cardW / 2, cy - cardH / 2, cardW, 52);

        ctx.font = "800 16px monospace";
        ctx.fillStyle = COLOR_WHITE;
        ctx.textAlign = "left";
        ctx.fillText("DIKTI & CAMPUS GUIDELINE ENGINE // REAL-TIME VALIDATION", cx - cardW / 2 + 25, cy - cardH / 2 + 32);

        const metrics = [
          { label: "DIKTI STANDARDS COMPLIANCE", val: clamp(Math.round(p * 100), 0, 100) + "%", color: COLOR_WHITE },
          { label: "STRUCTURAL CHAPTER SYMMETRY", val: "5/5 VERIFIED", color: COLOR_BLUE },
          { label: "CITATION INTEGRITY (APA/IEEE)", val: "100% AUDITED", color: COLOR_VIOLET },
          { label: "UNP FT 2025 REGULATORY RULE", val: "LOCKED ACTIVE", color: "#10B981" }
        ];

        metrics.forEach((m, i) => {
          const y = cy - cardH / 2 + 105 + i * 85;
          ctx.font = "700 14px monospace";
          ctx.fillStyle = COLOR_MUTED;
          ctx.fillText(m.label, cx - cardW / 2 + 40, y);

          const barW = 540;
          ctx.fillStyle = "#1E293B";
          ctx.fillRect(cx - cardW / 2 + 40, y + 12, barW, 10);

          const fillW = barW * clamp(p * 1.2, 0, 1);
          ctx.fillStyle = m.color;
          ctx.fillRect(cx - cardW / 2 + 40, y + 12, fillW, 10);

          ctx.font = "800 20px monospace";
          ctx.textAlign = "right";
          ctx.fillText(m.val, cx + cardW / 2 - 40, y + 22);
          ctx.textAlign = "left";
        });
      }

      // =========================================================================
      // SCENE 5 & 6: BEATS 16 - 24 (8.0s - 12.0s): THE STRONGEST MOMENT
      // 3D HOLOGRAPHIC GLASS ORB SYNTHESIS
      // =========================================================================
      else if (t < 12.0) {
        if (activeSceneName !== "05 // 3D ORB SYNTHESIS") setActiveSceneName("05 // 3D ORB SYNTHESIS");
        const localT = t - 8.0;
        const r = 210;
        const rot = localT * 2.2;

        // Shadow breathing
        const shadowW = r * 1.6 * (1 + Math.sin(localT * 3) * 0.08);
        const shadowH = 34 * (1 - Math.sin(localT * 3) * 0.08);
        ctx.fillStyle = "rgba(30, 27, 75, 0.45)";
        ctx.beginPath();
        ctx.ellipse(cx, cy + r + 50, shadowW, shadowH, 0, 0, Math.PI * 2);
        ctx.fill();

        // Radial fluid core
        const grad = ctx.createRadialGradient(
          cx - 40 + Math.sin(rot) * 60, cy - 40 + Math.cos(rot) * 50, 20,
          cx, cy, r
        );
        grad.addColorStop(0, "#FFFFFF");
        grad.addColorStop(0.35, COLOR_BLUE);
        grad.addColorStop(0.75, COLOR_VIOLET);
        grad.addColorStop(1, "#0F172A");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        // Spiral ribs
        ctx.lineWidth = 4;
        for (let i = 0; i < 3; i++) {
          const petalOffset = (i * Math.PI) / 1.5 + rot * 0.6;
          ctx.strokeStyle = i === 1 ? COLOR_WHITE : (i === 0 ? "#60A5FA" : "#C084FC");
          ctx.beginPath();
          ctx.ellipse(cx, cy, r * 0.95, r * 0.42, petalOffset, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Specular highlight rim
        ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(cx, cy, r - 3, -Math.PI * 0.75, -Math.PI * 0.25);
        ctx.stroke();

        if (localT > 1.2) {
          const streakT = (localT - 1.2) / 2.8;
          const words = ["SKRIPSI", "TESIS", "LAPORAN MAGANG", "JURNAL ILMIAH"];
          const wordIdx = Math.floor(streakT * words.length) % words.length;

          ctx.font = "900 48px Inter, -apple-system, sans-serif";
          ctx.fillStyle = COLOR_WHITE;
          ctx.textAlign = "center";
          ctx.fillText(words[wordIdx], cx, 860);

          ctx.font = "700 16px monospace";
          ctx.fillStyle = COLOR_BLUE;
          ctx.fillText("SYNTHESIS ENGINE LOCKED // READY FOR COMPOSITION", cx, 915);
        }
      }

      // =========================================================================
      // SCENE 7: BEATS 24 - 28 (12.0s - 14.0s): END TITLE
      // =========================================================================
      else if (t < 14.0) {
        if (activeSceneName !== "06 // ACADEMIC AGENT STUDIO") setActiveSceneName("06 // ACADEMIC AGENT STUDIO");
        const localT = t - 12.0;
        const p = clamp(localT / 1.0, 0, 1);
        const f = easeOutExpo(p);

        // 4-pointed Star Logo
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

        ctx.font = "900 86px Inter, -apple-system, sans-serif";
        ctx.fillStyle = COLOR_WHITE;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("ACADEMIC AGENT STUDIO", cx, cy + 20);

        ctx.font = "700 24px monospace";
        ctx.fillStyle = COLOR_BLUE;
        ctx.fillText("THE AI RESEARCH & MANUSCRIPT ENGINE", cx, cy + 100);

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
      // SCENE 8: BEATS 28 - 30 (14.0s - 15.0s): SEAMLESS LOOP TRANSITION
      // =========================================================================
      else {
        const localT = t - 14.0;
        const p = clamp(localT / 1.0, 0, 1);
        const f = easeInOutCubic(p);
        const radius = lerp(40, 4, f);

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
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch {
          // ignore
        }
      }
    };
  }, [isFirstTime, hasCheckedStorage, isMuted]);

  // If storage check pending, show clean void
  if (!hasCheckedStorage) {
    return <div className="fixed inset-0 z-50 bg-[#0A0D14]" />;
  }

  // IF REFRESH / SUBSEQUENT VISIT: Show regular lightweight ScreenLoader
  if (!isFirstTime) {
    return <ScreenLoader onComplete={onComplete} />;
  }

  const currentBeat = Math.min(30, Math.floor(currentTimeSec * 2) + 1);
  const progressPct = Math.min(100, (currentTimeSec / 15.0) * 100);

  // IF FIRST TIME VISIT (OR FORCE REPLAY): Show 15-second 60 FPS Canvas Motion Engine
  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#0A0D14] transition-opacity duration-500 overflow-hidden select-none ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="relative w-full h-full flex items-center justify-center bg-[#0A0D14]">
        {/* Real-time 60 FPS HTML5 Canvas (100% immune to browser autoplay policy blocks) */}
        <canvas
          ref={canvasRef}
          width={1920}
          height={1080}
          className="w-full h-full object-contain bg-[#0A0D14]"
        />

        {/* Top Floating Control Bar */}
        <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-30 pointer-events-auto">
          {/* Brand Badge */}
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-mono shadow-xl">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="font-bold tracking-wider">ACADEMIC AGENT STUDIO</span>
            <span className="text-[10px] text-zinc-500 border-l border-zinc-700 pl-2">120 BPM SHOWREEL</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-md border text-xs font-mono transition-all cursor-pointer shadow-lg ${
                isMuted 
                  ? "bg-black/60 border-white/10 text-zinc-400 hover:text-white" 
                  : "bg-blue-600/80 border-blue-400/50 text-white shadow-blue-500/20"
              }`}
              title={isMuted ? "Aktifkan Audio 120 BPM" : "Bisukan Audio"}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isMuted ? "Sound: OFF" : "Sound: ON"}</span>
            </button>

            {/* Skip / Enter Studio Button */}
            <button
              type="button"
              onClick={handleFinishShowreel}
              className="px-4 py-1.5 rounded-full bg-white hover:bg-zinc-100 text-[#0A0D14] font-bold text-xs flex items-center gap-1.5 shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <span>Lewati Intro</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Bottom Real-time Telemetry Bar */}
        <div className="absolute bottom-6 left-6 right-6 z-30 pointer-events-none">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-2">
            <div className="flex items-center gap-3">
              <span className="text-blue-400 font-bold">{activeSceneName}</span>
              <span className="text-zinc-600">|</span>
              <span>BEAT {currentBeat} / 30</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white font-bold">{currentTimeSec.toFixed(1)}s / 15.0s</span>
              <span className="text-zinc-600">|</span>
              <span className="text-emerald-400">60 FPS ENGINE</span>
            </div>
          </div>

          {/* Smooth Timeline Progress Bar */}
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-75"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstTimeLoadingScreen;