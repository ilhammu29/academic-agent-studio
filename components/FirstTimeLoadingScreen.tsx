"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import ScreenLoader from "./ScreenLoader";

// Dynamic import for Three.js 3D WebGL Holographic Sphere
const Hero3DOrb = dynamic(
  () => import("./Hero3DOrb").then((mod) => mod.Hero3DOrb),
  {
    ssr: false,
    loading: () => (
      <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr from-[#60A5FA]/25 via-[#C084FC]/20 to-[#818CF8]/15 blur-2xl animate-pulse" />
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

  // Thoughtful, disciplined editorial palette
  const COLOR_BG = "#08090D";
  const COLOR_TEXT_PRIMARY = "#F8FAFC";
  const COLOR_TEXT_MUTED = "#64748B";
  const COLOR_TEXT_DIM = "#334155";
  const COLOR_ACCENT_BLUE = "#3B82F6";
  const COLOR_ACCENT_INDIGO = "#6366F1";
  const COLOR_ACCENT_PURPLE = "#8B5CF6";
  const COLOR_LINE_HAIRLINE = "rgba(255, 255, 255, 0.08)";
  const COLOR_LINE_STRONG = "rgba(255, 255, 255, 0.18)";

  // Mathematical Easing Functions (Pure Functions of Time)
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

  // Audio Synthesizer Engine (Warm, Organic Web Audio API Synthesis)
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

      // Warm acoustic sub-kick on every beat (120 BPM = 0.5s interval)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(34, now + 0.12);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);

      // Warm harmonic chords on scene transitions (Beats 0, 4, 8, 12, 16, 24)
      if ([0, 4, 8, 12, 16, 24].includes(beatNumber)) {
        const chordPitches = [220.00, 261.63, 329.63, 392.00]; // A minor 7 / C Major 6
        chordPitches.forEach((freq) => {
          const chordOsc = ctx.createOscillator();
          const chordGain = ctx.createGain();
          chordOsc.type = "triangle";
          chordOsc.frequency.setValueAtTime(freq, now);

          chordGain.gain.setValueAtTime(0.07, now);
          chordGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

          chordOsc.connect(chordGain);
          chordGain.connect(ctx.destination);
          chordOsc.start(now);
          chordOsc.stop(now + 0.65);
        });
      }
    } catch {
      // Graceful fallback
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

      // End at exactly 15.0s
      if (elapsedSec >= 15.0) {
        handleFinishShowreel();
        return;
      }

      const t = elapsedSec;
      const beat = Math.floor(t * 2.0); // 120 BPM

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

      // Deep obsidian void background
      ctx.fillStyle = COLOR_BG;
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // =========================================================================
      // SCENE 1: BEATS 0 - 4 (0.0s - 2.0s): THE PREMISE (ARCHITECTURAL TYPOGRAPHY)
      // =========================================================================
      if (t < 2.0) {
        const p1 = clamp(t / 0.5, 0, 1);
        const p2 = clamp((t - 0.5) / 0.5, 0, 1);
        const p3 = clamp((t - 1.0) / 0.5, 0, 1);
        const p4 = clamp((t - 1.5) / 0.5, 0, 1);

        // Subtle typographic drafting grid
        ctx.strokeStyle = COLOR_LINE_HAIRLINE;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - 400, cy); ctx.lineTo(cx + 400, cy);
        ctx.moveTo(cx, cy - 250); ctx.lineTo(cx, cy + 250);
        ctx.stroke();

        if (t < 0.5) {
          // Beat 0: Typesetter's register mark expanding with optical weight
          const markSize = lerp(4, 24, easeOutExpo(p1));
          ctx.strokeStyle = COLOR_ACCENT_BLUE;
          ctx.lineWidth = 2;
          ctx.beginPath();
          // Corner register brackets
          ctx.moveTo(cx - markSize, cy - markSize / 2);
          ctx.lineTo(cx - markSize, cy - markSize);
          ctx.lineTo(cx - markSize / 2, cy - markSize);

          ctx.moveTo(cx + markSize, cy - markSize / 2);
          ctx.lineTo(cx + markSize, cy - markSize);
          ctx.lineTo(cx + markSize / 2, cy - markSize);

          ctx.moveTo(cx - markSize, cy + markSize / 2);
          ctx.lineTo(cx - markSize, cy + markSize);
          ctx.lineTo(cx - markSize / 2, cy + markSize);

          ctx.moveTo(cx + markSize, cy + markSize / 2);
          ctx.lineTo(cx + markSize, cy + markSize);
          ctx.lineTo(cx + markSize / 2, cy + markSize);
          ctx.stroke();

          // Center solid point
          ctx.fillStyle = COLOR_TEXT_PRIMARY;
          ctx.beginPath();
          ctx.arc(cx, cy, 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = "500 13px Inter, -apple-system, sans-serif";
          ctx.fillStyle = COLOR_TEXT_MUTED;
          ctx.textAlign = "center";
          ctx.fillText("§ 1.0 · ON THE FOUNDATION OF ACADEMIC INQUIRY", cx, cy + 50);
        } else if (t < 1.0) {
          // Beat 1: Grand Display "INQUIRY"
          const f = easeOutExpo(p2);
          const yOff = lerp(40, 0, f);
          ctx.font = "900 136px Inter, -apple-system, sans-serif";
          ctx.letterSpacing = "-0.04em";
          ctx.fillStyle = COLOR_TEXT_PRIMARY;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("INQUIRY", cx, cy - 10 + yOff * 0.1);

          ctx.font = "500 14px Inter, -apple-system, sans-serif";
          ctx.fillStyle = COLOR_ACCENT_BLUE;
          ctx.fillText("THE FORMULATION OF RESEARCH QUESTIONS", cx, cy + 90);
        } else if (t < 1.5) {
          // Beat 2: Typographic mask shear into "EVIDENCE"
          const split = lerp(0, 36, easeOutExpo(p3));
          ctx.font = "900 130px Inter, -apple-system, sans-serif";
          ctx.letterSpacing = "-0.04em";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // Top half
          ctx.save();
          ctx.beginPath();
          ctx.rect(0, 0, width, cy);
          ctx.clip();
          ctx.fillStyle = COLOR_ACCENT_BLUE;
          ctx.fillText("EVIDENCE", cx - split, cy);
          ctx.restore();

          // Bottom half
          ctx.save();
          ctx.beginPath();
          ctx.rect(0, cy, width, cy);
          ctx.clip();
          ctx.fillStyle = COLOR_TEXT_PRIMARY;
          ctx.fillText("EVIDENCE", cx + split, cy);
          ctx.restore();

          ctx.font = "500 14px Inter, -apple-system, sans-serif";
          ctx.fillStyle = COLOR_ACCENT_PURPLE;
          ctx.fillText("EMPIRICAL GROUNDING & RIGOROUS PROOF", cx, cy + 90);
        } else {
          // Beat 3: Monolithic Architectural Columns (Ontology · Methodology · Axiology)
          const p = easeOutCubic(p4);
          const colWidth = 140;
          const spacing = 320;
          const startX = cx - spacing;

          const pillars = [
            { title: "ONTOLOGI", desc: "Objek & Hakikat Riset", color: COLOR_TEXT_PRIMARY },
            { title: "EPISTEMOLOGI", desc: "Metode Ilmiah Teruji", color: COLOR_ACCENT_BLUE },
            { title: "AKSIOLOGI", desc: "Dampak & Kemanfaatan", color: COLOR_ACCENT_PURPLE }
          ];

          pillars.forEach((pil, i) => {
            const x = startX + i * spacing;
            const h = lerp(40, 520, p);
            const y = cy - h / 2;

            ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
            ctx.strokeStyle = pil.color;
            ctx.lineWidth = 1.5;
            ctx.fillRect(x - colWidth / 2, y, colWidth, h);
            ctx.strokeRect(x - colWidth / 2, y, colWidth, h);

            if (p > 0.6) {
              ctx.font = "800 16px Inter, sans-serif";
              ctx.fillStyle = pil.color;
              ctx.textAlign = "center";
              ctx.fillText(pil.title, x, y + 36);

              ctx.font = "500 11px Inter, sans-serif";
              ctx.fillStyle = COLOR_TEXT_MUTED;
              ctx.fillText(pil.desc, x, y + 58);
            }
          });
        }
      }

      // =========================================================================
      // SCENE 2: BEATS 4 - 8 (2.0s - 4.0s): THE CITATION TOPOLOGY & ACADEMIC GRID
      // =========================================================================
      else if (t < 4.0) {
        const localT = t - 2.0;
        const subP = clamp((localT % 0.5) / 0.5, 0, 1);
        const subBeat = Math.floor(localT / 0.5);

        if (subBeat === 0) {
          // Beat 4: Architectural pillars rotate into concentric circular geodesics
          const f = easeOutExpo(subP);
          for (let i = 0; i < 3; i++) {
            const r = lerp(340 - i * 60, 260 - i * 50, f);
            const startAng = (i * Math.PI) / 3;
            ctx.strokeStyle = i === 1 ? COLOR_ACCENT_BLUE : (i === 2 ? COLOR_ACCENT_PURPLE : COLOR_LINE_STRONG);
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(cx, cy, r, startAng, startAng + Math.PI * 1.2 * f);
            ctx.stroke();
          }
        } else if (subBeat === 1 || subBeat === 2) {
          // Beats 5-6: Dialectical Citation Graph (Real Scholarly Networks)
          const nodeRadius = 260;
          const nodes = [
            "Latar Belakang", "Kajian Literatur", "Metodologi", "Sampel & Data",
            "Validasi Empiris", "Pengujian Sistem", "Analisis Temuan", "Diskusi Kritis",
            "Keterbatasan", "Kebaharuan (Novelty)", "Implikasi Praktis", "Daftar Rujukan"
          ];

          ctx.strokeStyle = "rgba(255, 255, 255, 0.09)";
          ctx.lineWidth = 1;

          // Connect dialectical chords
          for (let i = 0; i < nodes.length; i++) {
            const a1 = (i / nodes.length) * Math.PI * 2;
            const x1 = cx + Math.cos(a1) * nodeRadius;
            const y1 = cy + Math.sin(a1) * nodeRadius;

            const next = (i + 4) % nodes.length;
            const a2 = (next / nodes.length) * Math.PI * 2;
            const x2 = cx + Math.cos(a2) * nodeRadius;
            const y2 = cy + Math.sin(a2) * nodeRadius;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            // Scholarly Nodes
            ctx.fillStyle = (i % 3 === 0) ? COLOR_ACCENT_BLUE : (i % 3 === 1 ? COLOR_ACCENT_PURPLE : COLOR_TEXT_PRIMARY);
            ctx.beginPath();
            ctx.arc(x1, y1, 5, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.font = "800 36px Inter, sans-serif";
          ctx.fillStyle = COLOR_TEXT_PRIMARY;
          ctx.textAlign = "center";
          ctx.fillText("12 MODA PENALARAN ILMIAH", cx, cy - 14);

          ctx.font = "500 14px Inter, sans-serif";
          ctx.fillStyle = COLOR_ACCENT_BLUE;
          ctx.fillText("INTEGRASI SINTESIS SITASI & STRUKTUR LOGIKA NASKAH", cx, cy + 24);
        } else {
          // Beat 7: Converging into Authentic Academic A4 Document Blueprint
          const f = easeOutExpo(subP);
          const pageW = lerp(560, 480, f);
          const pageH = lerp(560, 680, f);
          const px = cx - pageW / 2;
          const py = cy - pageH / 2;

          // Vellum sheet card
          ctx.fillStyle = "#0F1420";
          ctx.strokeStyle = COLOR_LINE_STRONG;
          ctx.lineWidth = 1.5;
          ctx.fillRect(px, py, pageW, pageH);
          ctx.strokeRect(px, py, pageW, pageH);

          // Real Academic Header Elements (Not generic skeleton bars!)
          ctx.font = "800 13px Inter, sans-serif";
          ctx.fillStyle = COLOR_TEXT_PRIMARY;
          ctx.textAlign = "center";
          ctx.fillText("PROPOSAL PENELITIAN & SKRIPSI", cx, py + 80);

          ctx.font = "600 11px Inter, sans-serif";
          ctx.fillStyle = COLOR_TEXT_MUTED;
          ctx.fillText("STANDAR BAKU AKADEMIK DIKTI & FAKULTAS TEKNIK UNP", cx, py + 104);

          // Horizontal rule
          ctx.strokeStyle = COLOR_ACCENT_BLUE;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px + 60, py + 125);
          ctx.lineTo(px + pageW - 60, py + 125);
          ctx.stroke();

          // Academic outline sections
          const sections = [
            "BAB I · PENDAHULUAN (Latar Belakang, Identifikasi, Rumusan, Tujuan)",
            "BAB II · KAJIAN TEORI (Tinjauan Pustaka & Kerangka Berpikir)",
            "BAB III · METODOLOGI PENELITIAN (Prosedur, Instrumen, Analisis)",
            "BAB IV · HASIL PENELITIAN DAN PEMBAHASAN (Data & Pengujian)",
            "BAB V · PENUTUP (Kesimpulan Komprehensif & Saran Akademik)"
          ];

          sections.forEach((sec, idx) => {
            const sy = py + 165 + idx * 45;
            ctx.font = "500 11px Inter, sans-serif";
            ctx.fillStyle = idx === 0 ? COLOR_TEXT_PRIMARY : COLOR_TEXT_MUTED;
            ctx.textAlign = "left";
            ctx.fillText(sec, px + 60, sy);
          });
        }
      }

      // =========================================================================
      // SCENE 3: BEATS 8 - 12 (4.0s - 6.0s): 3D ISOMETRIC CHAPTER CASCADE
      // =========================================================================
      else if (t < 6.0) {
        const localT = t - 4.0;
        const p = localT / 2.0;
        const rotY = lerp(0, 0.75, easeInOutCubic(p));
        const rotX = lerp(0, 0.50, easeInOutCubic(p));

        ctx.save();
        ctx.translate(cx, cy);

        const chapters = [
          { code: "BAB I", name: "PENDAHULUAN", sub: "Latar Belakang & Perumusan Masalah", color: COLOR_TEXT_PRIMARY, z: -130 },
          { code: "BAB II", name: "KAJIAN PUSTAKA", sub: "Landasan Teori & Tinjauan Riset Terdahulu", color: COLOR_ACCENT_BLUE, z: -50 },
          { code: "BAB III", name: "METODE PENELITIAN", sub: "Desain Prosedur & Pengumpulan Data", color: COLOR_ACCENT_PURPLE, z: 30 },
          { code: "BAB IV", name: "HASIL & PEMBAHASAN", sub: "Komparasi Kuantitatif & Verifikasi Temuan", color: COLOR_ACCENT_BLUE, z: 110 },
          { code: "BAB V", name: "PENUTUP & SARAN", sub: "Sintesis Akhir & Rekomendasi Terapan", color: COLOR_TEXT_PRIMARY, z: 190 }
        ];

        chapters.forEach((chap) => {
          ctx.save();
          const zOffset = chap.z * easeOutCubic(clamp(localT / 1.2, 0, 1));

          // Isometric 2.5D skew projection
          ctx.transform(
            Math.cos(rotY), Math.sin(rotX) * 0.38,
            -Math.sin(rotY) * 0.38, Math.cos(rotX),
            0, zOffset * 0.78
          );

          const w = 520;
          const h = 76;
          ctx.fillStyle = "rgba(15, 20, 32, 0.95)";
          ctx.strokeStyle = chap.color;
          ctx.lineWidth = 1.5;
          ctx.fillRect(-w / 2, -h / 2, w, h);
          ctx.strokeRect(-w / 2, -h / 2, w, h);

          // Chapter Code Badge
          ctx.font = "800 13px Inter, sans-serif";
          ctx.fillStyle = chap.color;
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.fillText(chap.code, -w / 2 + 28, -10);

          // Chapter Name
          ctx.font = "700 15px Inter, sans-serif";
          ctx.fillStyle = COLOR_TEXT_PRIMARY;
          ctx.fillText(chap.name, -w / 2 + 90, -10);

          // Subtitle
          ctx.font = "500 11px Inter, sans-serif";
          ctx.fillStyle = COLOR_TEXT_MUTED;
          ctx.fillText(chap.sub, -w / 2 + 28, 16);

          ctx.restore();
        });

        ctx.restore();

        ctx.font = "600 14px Inter, sans-serif";
        ctx.fillStyle = COLOR_TEXT_MUTED;
        ctx.textAlign = "center";
        ctx.fillText("STRUKTUR NASKAH LENGKAP · KETERLACAKAN BAB I HINGGA V", cx, 980);
      }

      // =========================================================================
      // SCENE 4: BEATS 12 - 16 (6.0s - 8.0s): RIGOROUS ACADEMIC STANDARDS MATRIX
      // =========================================================================
      else if (t < 8.0) {
        const localT = t - 6.0;
        const p = clamp(localT / 2.0, 0, 1);

        const cardW = 960;
        const cardH = 500;
        const px = cx - cardW / 2;
        const py = cy - cardH / 2;

        ctx.fillStyle = "#0B0F19";
        ctx.strokeStyle = COLOR_LINE_STRONG;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(px, py, cardW, cardH);
        ctx.fillRect(px, py, cardW, cardH);

        // Header
        ctx.fillStyle = "#121926";
        ctx.fillRect(px, py, cardW, 56);

        ctx.font = "800 15px Inter, sans-serif";
        ctx.fillStyle = COLOR_TEXT_PRIMARY;
        ctx.textAlign = "left";
        ctx.fillText("STANDAR REGULASI & KEPATUHAN PEDOMAN AKADEMIK", px + 30, py + 34);

        // Left Column: Guidelines
        const standards = [
          { label: "Buku Pedoman Skripsi & Tugas Akhir", spec: "Format Baku Dikti Kemendikbudristek RI" },
          { label: "Pedoman PKL Fakultas Teknik UNP 2025", spec: "Sistematika 3 Bab Industri & Format Lampiran" },
          { label: "Standar Sitasi Internasional", spec: "APA 7th Edition / IEEE Transactions" },
          { label: "Format Margin & Tipografi Naskah", spec: "A4 (4cm Kiri/Atas, 3cm Kanan/Bawah), Times/Inter" }
        ];

        standards.forEach((std, i) => {
          const sy = py + 105 + i * 95;
          ctx.font = "700 14px Inter, sans-serif";
          ctx.fillStyle = COLOR_TEXT_PRIMARY;
          ctx.textAlign = "left";
          ctx.fillText(std.label, px + 35, sy);

          ctx.font = "500 12px Inter, sans-serif";
          ctx.fillStyle = COLOR_TEXT_MUTED;
          ctx.fillText(std.spec, px + 35, sy + 22);

          // Verification indicator
          const isVerified = p > (i * 0.25);
          ctx.font = "700 12px Inter, sans-serif";
          ctx.fillStyle = isVerified ? "#10B981" : COLOR_TEXT_DIM;
          ctx.textAlign = "right";
          ctx.fillText(isVerified ? "✓ TERVERIFIKASI" : "MEMERIKSA...", px + cardW - 40, sy + 12);
        });
      }

      // =========================================================================
      // SCENE 5 & 6: BEATS 16 - 24 (8.0s - 12.0s): THE SYNTHESIS CORE (3D WEBGL ORB)
      // =========================================================================
      else if (t < 12.0) {
        const localT = t - 8.0;

        // Editorial publication types sequence advancing every 1 second
        const publications = [
          { title: "PROPOSAL SKRIPSI & TUGAS AKHIR", note: "Struktur Komprehensif BAB I – V Terintegrasi" },
          { title: "LAPORAN PRAKTIK KERJA LAPANGAN", note: "Kepatuhan Penuh Pedoman Resmi FT UNP 2025" },
          { title: "PROPOSAL TESIS & ARTIKEL RISET", note: "Sintesis Literatur Berbasis Bukti & Matriks Novelty" },
          { title: "12 AGEN KOGNITIF MULTI-DISIPLIN", note: "Penyusunan Naskah Utuh, Konsistensi Logika & Ekspor DOCX" }
        ];

        const pubIdx = Math.min(publications.length - 1, Math.floor(localT * 1.0));
        const pub = publications[pubIdx];

        ctx.font = "800 38px Inter, -apple-system, sans-serif";
        ctx.letterSpacing = "-0.03em";
        ctx.fillStyle = COLOR_TEXT_PRIMARY;
        ctx.textAlign = "center";
        ctx.fillText(pub.title, cx, 875);

        ctx.font = "500 14px Inter, sans-serif";
        ctx.fillStyle = COLOR_ACCENT_BLUE;
        ctx.fillText(pub.note, cx, 915);
      }

      // =========================================================================
      // SCENE 7: BEATS 24 - 28 (12.0s - 14.0s): BRAND SEAL & IDENTITY LOCKUP
      // =========================================================================
      else if (t < 14.0) {
        const localT = t - 12.0;
        const p = clamp(localT / 1.0, 0, 1);
        const f = easeOutExpo(p);

        // 4-pointed Star Mark with precise geometry
        ctx.save();
        ctx.translate(cx, cy - 85);
        ctx.scale(f, f);
        ctx.fillStyle = COLOR_TEXT_PRIMARY;
        ctx.beginPath();
        ctx.moveTo(0, -34);
        ctx.quadraticCurveTo(0, 0, 34, 0);
        ctx.quadraticCurveTo(0, 0, 0, 34);
        ctx.quadraticCurveTo(0, 0, -34, 0);
        ctx.quadraticCurveTo(0, 0, 0, -34);
        ctx.fill();
        ctx.restore();

        // Main Title (Prestigious lowercase branding)
        ctx.font = "800 68px Inter, -apple-system, sans-serif";
        ctx.letterSpacing = "-0.04em";
        ctx.fillStyle = COLOR_TEXT_PRIMARY;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("academic agent studio", cx, cy + 24);

        // Subtitle
        ctx.font = "500 15px Inter, sans-serif";
        ctx.fillStyle = COLOR_TEXT_MUTED;
        ctx.fillText("THE COGNITIVE RESEARCH & MANUSCRIPT ENGINE FOR INDONESIAN ACADEMIA", cx, cy + 86);

        // Institutional Badges
        const markers = [
          "STANDAR DIKTI KEMENDIKBUD",
          "PEDOMAN FT UNP 2025",
          "12 AGEN KOGNITIF",
          "EKSPOR RESMI DOCX"
        ];

        const totalW = markers.length * 230;
        const startX = cx - totalW / 2 + 115;

        markers.forEach((m, i) => {
          const bx = startX + i * 230;
          const by = cy + 155;
          ctx.strokeStyle = COLOR_LINE_STRONG;
          ctx.lineWidth = 1;
          ctx.strokeRect(bx - 105, by - 16, 210, 32);

          ctx.font = "700 11px Inter, sans-serif";
          ctx.fillStyle = COLOR_TEXT_MUTED;
          ctx.fillText(m, bx, by + 4);
        });
      }

      // =========================================================================
      // SCENE 8: BEATS 28 - 30 (14.0s - 15.0s): SEAMLESS DISSOLVE
      // =========================================================================
      else {
        const localT = t - 14.0;
        const p = clamp(localT / 1.0, 0, 1);
        const f = easeInOutCubic(p);
        const radius = lerp(34, 2, f);

        ctx.fillStyle = COLOR_TEXT_PRIMARY;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
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
    return <div className="fixed inset-0 z-50 bg-[#08090D]" />;
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

  return (
    <div 
      onClick={handleFinishShowreel}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#08090D] transition-opacity duration-500 overflow-hidden select-none cursor-pointer ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      title="Klik untuk langsung masuk"
    >
      <div className="relative w-full h-full flex items-center justify-center bg-[#08090D] overflow-hidden">
        {/* Real-time 60 FPS HTML5 Canvas (Pure Crafted Editorial Motion) */}
        <canvas
          ref={canvasRef}
          width={1920}
          height={1080}
          className="w-full h-full object-contain bg-[#08090D]"
        />

        {/* Real Three.js 3D WebGL Holographic Glass Orb (Beats 16 - 24 / 8.0s - 12.0s) */}
        {currentTimeSec >= 7.6 && currentTimeSec <= 12.4 && (
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-300 z-20"
            style={{
              opacity: orbOpacity,
              transform: `scale(${orbScale}) translateY(-35px)`
            }}
          >
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 flex items-center justify-center">
              {/* Colored Halo Glow Behind 3D Sphere */}
              <div className="absolute w-56 h-56 sm:w-72 sm:h-72 md:w-84 md:h-84 rounded-full bg-gradient-to-tr from-[#60A5FA]/30 via-[#C084FC]/25 to-[#818CF8]/20 blur-3xl pointer-events-none" />
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
