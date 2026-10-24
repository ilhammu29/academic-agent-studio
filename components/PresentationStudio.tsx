"use client";

import React, { useState, useEffect, useRef } from "react";
import { ProposalDocument, SlideDeckItem } from "@/types/studio";
import { generateAcademicProposalPptx } from "@/lib/pptxExporter";
import { 
  Presentation, 
  Download, 
  Sparkles, 
  Activity, 
  ChevronLeft, 
  ChevronRight, 
  Brain, 
  Copy, 
  Check, 
  RefreshCw, 
  Maximize2, 
  Minimize2, 
  ShieldCheck, 
  Palette, 
  Edit3, 
  Plus, 
  Trash2, 
  FileText, 
  Play, 
  Pause, 
  RotateCcw, 
  X,
  Layers,
  ArrowRight,
  ExternalLink
} from "lucide-react";

interface PresentationStudioProps {
  doc: ProposalDocument;
  onBackToDocument?: () => void;
  onUpdateDoc?: (updatedDoc: ProposalDocument) => void;
}

type SlideVisualMode = "google-flow" | "ai-concept";
type SlideTheme = "executive-dark" | "academic-navy" | "clean-light" | "emerald-minimal";

export const PresentationStudio: React.FC<PresentationStudioProps> = ({
  doc,
  onBackToDocument,
  onUpdateDoc
}) => {
  const [currentDoc, setCurrentDoc] = useState<ProposalDocument>(doc);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [slideVisualMode, setSlideVisualMode] = useState<SlideVisualMode>("google-flow");
  const [slideTheme, setSlideTheme] = useState<SlideTheme>("executive-dark");
  const [slideAiImageMap, setSlideAiImageMap] = useState<Record<number, string>>({});
  const [customSlidePrompt, setCustomSlidePrompt] = useState<string>("");
  const [isGeneratingSlideVisual, setIsGeneratingSlideVisual] = useState<boolean>(false);
  const [isBatchGeneratingSlides, setIsBatchGeneratingSlides] = useState<boolean>(false);
  const [isExportingPptx, setIsExportingPptx] = useState<boolean>(false);
  const [copiedNotes, setCopiedNotes] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit Slide Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>("");
  const [editSubtitle, setEditSubtitle] = useState<string>("");
  const [editKicker, setEditKicker] = useState<string>("");
  const [editPoints, setEditPoints] = useState<string[]>([]);
  const [editNotes, setEditNotes] = useState<string>("");

  // Rehearsal Timer for Defense
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    setCurrentDoc(doc);
  }, [doc]);

  // Keyboard navigation during fullscreen or normal mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditModalOpen) return;
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        setActiveSlideIndex((prev) => Math.min(currentDoc.slides.length - 1, prev + 1));
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        setActiveSlideIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      } else if (e.key === "f" || e.key === "F5") {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          setIsFullscreen((prev) => !prev);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentDoc.slides.length, isFullscreen, isEditModalOpen]);

  // Presentation Timer ticker
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Generate single AI Visual
  const handleGenerateSlideAiVisual = (slideIdx: number, customText?: string) => {
    setIsGeneratingSlideVisual(true);
    const activeSlide = currentDoc.slides[slideIdx];
    const defaultPrompt = `Scientific academic presentation diagram, ${currentDoc.title}, ${activeSlide?.title || 'Methodology pipeline'}, dark blue slate minimal theme, Google Flow process architecture, high fidelity vector aesthetic, 8k resolution`;
    const promptToUse = customText && customText.trim().length > 0 ? customText.trim() : defaultPrompt;
    
    const seed = Math.floor(Math.random() * 999999);
    const generatedUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptToUse)}?width=900&height=560&nologo=true&seed=${seed}`;
    
    const img = new window.Image();
    img.src = generatedUrl;
    img.onload = () => {
      setSlideAiImageMap((prev) => ({ ...prev, [slideIdx]: generatedUrl }));
      setIsGeneratingSlideVisual(false);
      showToast("Visual AI berhasil digenerate!");
    };
    img.onerror = () => {
      setSlideAiImageMap((prev) => ({ ...prev, [slideIdx]: generatedUrl }));
      setIsGeneratingSlideVisual(false);
      showToast("Visual AI siap ditampilkan.");
    };
  };

  // Batch Generate all slides
  const handleBatchGenerateAllSlideVisuals = async () => {
    setIsBatchGeneratingSlides(true);
    showToast("Memulai proses batch visual AI untuk semua slide...");
    
    const newMap: Record<number, string> = { ...slideAiImageMap };
    
    for (let idx = 0; idx < currentDoc.slides.length; idx++) {
      const slide = currentDoc.slides[idx];
      const prompt = `Academic presentation infographic visual, ${currentDoc.title}, slide ${idx + 1}: ${slide.title}, modern dark slate blue minimalist vector aesthetic, 8k`;
      const seed = Math.floor(Math.random() * 999999) + idx * 77;
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=900&height=560&nologo=true&seed=${seed}`;
      newMap[idx] = url;
    }
    
    setSlideAiImageMap(newMap);
    setSlideVisualMode("ai-concept");
    setIsBatchGeneratingSlides(false);
    showToast(`Berhasil men-generate ${currentDoc.slides.length} ilustrasi slide!`);
  };

  // Download PPTX
  const handleDownloadPptx = async () => {
    setIsExportingPptx(true);
    try {
      await generateAcademicProposalPptx(currentDoc);
      showToast("Slide PPTX eksekutif 16:9 berhasil diunduh!");
    } catch (err) {
      console.error("Gagal mengunduh berkas PPTX:", err);
      showToast("Gagal mengunduh PPTX. Coba sesaat lagi.");
    } finally {
      setIsExportingPptx(false);
    }
  };

  const handleCopySpeakerNotes = () => {
    const notes = currentDoc.slides[activeSlideIndex]?.speakerNotes || "";
    if (navigator.clipboard) {
      navigator.clipboard.writeText(notes);
      setCopiedNotes(true);
      setTimeout(() => setCopiedNotes(false), 2000);
      showToast("Catatan presenter berhasil disalin!");
    }
  };

  // Open Edit Slide Modal
  const handleOpenEditModal = () => {
    const activeSlide = currentDoc.slides[activeSlideIndex];
    if (!activeSlide) return;
    setEditTitle(activeSlide.title);
    setEditSubtitle(activeSlide.subtitle);
    setEditKicker(activeSlide.kicker);
    setEditPoints([...activeSlide.keyPoints]);
    setEditNotes(activeSlide.speakerNotes);
    setIsEditModalOpen(true);
  };

  const handleSaveEditSlide = () => {
    const updatedSlides = [...currentDoc.slides];
    updatedSlides[activeSlideIndex] = {
      ...updatedSlides[activeSlideIndex],
      title: editTitle,
      subtitle: editSubtitle,
      kicker: editKicker,
      keyPoints: editPoints.filter(p => p.trim().length > 0),
      speakerNotes: editNotes
    };

    const updatedDoc: ProposalDocument = {
      ...currentDoc,
      slides: updatedSlides
    };

    setCurrentDoc(updatedDoc);
    if (onUpdateDoc) onUpdateDoc(updatedDoc);
    setIsEditModalOpen(false);
    showToast("Perubahan slide berhasil disimpan!");
  };

  // Add Slide
  const handleAddSlide = () => {
    const newSlide: SlideDeckItem = {
      slideNumber: currentDoc.slides.length + 1,
      kicker: "SLIDE TAMBAHAN",
      title: "Poin Tambahan & Diskusi Mendalam",
      subtitle: "Uraian pendalaman aspek teknis atau justifikasi metodologis untuk dewan penguji.",
      keyPoints: [
        "Parameter verifikasi empiris dan toleransi kesalahan pada pengujian.",
        "Analisis sensitivitas sistem terhadap anomali data di lapangan.",
        "Rencana ekspansi fungsionalitas pasca-sidang."
      ],
      speakerNotes: "Pada slide ini, kita menguraikan justifikasi mendalam jika dewan penguji menanyakan aspek ketahanan sistem dan validitas data."
    };

    const updatedDoc: ProposalDocument = {
      ...currentDoc,
      slides: [...currentDoc.slides, newSlide]
    };

    setCurrentDoc(updatedDoc);
    if (onUpdateDoc) onUpdateDoc(updatedDoc);
    setActiveSlideIndex(currentDoc.slides.length);
    showToast("Slide baru berhasil ditambahkan!");
  };

  // Delete Slide
  const handleDeleteSlide = (idx: number) => {
    if (currentDoc.slides.length <= 1) {
      alert("Minimal harus ada 1 slide dalam deck presentasi.");
      return;
    }
    if (confirm(`Hapus slide ${idx + 1}: "${currentDoc.slides[idx].title}"?`)) {
      const updatedSlides = currentDoc.slides.filter((_, i) => i !== idx);
      const updatedDoc: ProposalDocument = {
        ...currentDoc,
        slides: updatedSlides
      };
      setCurrentDoc(updatedDoc);
      if (onUpdateDoc) onUpdateDoc(updatedDoc);
      setActiveSlideIndex(Math.max(0, idx - 1));
      showToast("Slide berhasil dihapus.");
    }
  };

  const activeSlide = currentDoc.slides[activeSlideIndex] || currentDoc.slides[0];

  // Theme styles for the 16:9 canvas
  const getThemeCanvasClasses = () => {
    switch (slideTheme) {
      case "academic-navy":
        return "bg-[#0b172a] text-slate-100 border-blue-900/60";
      case "clean-light":
        return "bg-white text-zinc-900 border-zinc-200 shadow-xl";
      case "emerald-minimal":
        return "bg-[#0a1f18] text-emerald-50 border-emerald-900/60";
      case "executive-dark":
      default:
        return "bg-zinc-950 text-white border-zinc-800";
    }
  };

  const getThemeAccentGradient = () => {
    switch (slideTheme) {
      case "academic-navy":
        return "from-blue-500 via-sky-400 to-amber-300";
      case "clean-light":
        return "from-indigo-600 via-sky-500 to-amber-500";
      case "emerald-minimal":
        return "from-emerald-400 via-teal-300 to-amber-300";
      case "executive-dark":
      default:
        return "from-sky-500 via-indigo-500 to-amber-400";
    }
  };

  return (
    <div className={`w-full flex-1 flex flex-col ${isFullscreen ? "fixed inset-0 z-50 bg-black p-4 md:p-8" : "p-4 sm:p-6"} space-y-5 animate-in fade-in duration-200`}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-zinc-900/90 text-white dark:bg-white/95 dark:text-zinc-950 font-medium text-xs shadow-2xl backdrop-blur-xs flex items-center gap-2 border border-zinc-700/50 animate-in slide-in-from-bottom duration-200">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP COMMAND TOOLBAR (Hidden in fullscreen unless hovered) */}
      <div className={`bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${isFullscreen ? "opacity-90 hover:opacity-100 transition-opacity" : ""}`}>
        
        {/* Left: Branding & Breadcrumbs */}
        <div className="flex items-center gap-3">
          {onBackToDocument && (
            <button
              type="button"
              onClick={onBackToDocument}
              className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors text-zinc-700 dark:text-zinc-300"
              title="Kembali ke Dokumen Naskah"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Naskah Studio</span>
            </button>
          )}

          <div className="h-6 w-px bg-zinc-200 dark:border-zinc-800 hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500">
                <Presentation className="w-4 h-4" />
              </div>
              <h1 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                Slide Studio Eksekutif (16:9)
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-mono text-[10px] font-semibold">
                {currentDoc.slides.length} Slide
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-md sm:max-w-xl">
              {currentDoc.title}
            </p>
          </div>
        </div>

        {/* Right: Controls Cluster */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Rehearsal Timer */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-xs">
            <span className="text-zinc-500 text-[10px]">WAKTU:</span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100">{formatTimer(timerSeconds)}</span>
            <button
              type="button"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="p-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
              title={isTimerRunning ? "Jeda Timer" : "Mulai Simulasi Waktu Presentasi"}
            >
              {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsTimerRunning(false);
                setTimerSeconds(0);
              }}
              className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Theme Selector */}
          <div className="flex items-center gap-1">
            <select
              value={slideTheme}
              onChange={(e) => setSlideTheme(e.target.value as SlideTheme)}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 cursor-pointer focus:outline-hidden"
              title="Tema Warna Slide"
            >
              <option value="executive-dark">Tema: Dark Slate (Default)</option>
              <option value="academic-navy">Tema: Oxford Navy</option>
              <option value="clean-light">Tema: Clean Pure White</option>
              <option value="emerald-minimal">Tema: Emerald Forest</option>
            </select>
          </div>

          {/* Visual Mode Toggle (Google Flow vs AI Concept) */}
          <div className="flex items-center p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setSlideVisualMode("google-flow")}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                slideVisualMode === "google-flow"
                  ? "bg-white dark:bg-zinc-800 text-sky-600 dark:text-sky-400 shadow-xs font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Google Flow</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSlideVisualMode("ai-concept");
                if (!slideAiImageMap[activeSlideIndex]) {
                  handleGenerateSlideAiVisual(activeSlideIndex);
                }
              }}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                slideVisualMode === "ai-concept"
                  ? "bg-white dark:bg-zinc-800 text-sky-600 dark:text-sky-400 shadow-xs font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Visual AI</span>
            </button>
          </div>

          {/* Batch Generate Visuals */}
          <button
            type="button"
            onClick={handleBatchGenerateAllSlideVisuals}
            disabled={isBatchGeneratingSlides}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            title="Generate ilustrasi visual AI untuk semua slide sekaligus"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isBatchGeneratingSlides ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{isBatchGeneratingSlides ? "Men-generate..." : "✨ Visual AI Semua"}</span>
          </button>

          {/* Fullscreen Mode (Present) */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 cursor-pointer transition-colors"
            title={isFullscreen ? "Keluar Fullscreen (Esc)" : "Mode Presentasi Layar Penuh (F / F5)"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Download PPTX */}
          <button
            type="button"
            onClick={handleDownloadPptx}
            disabled={isExportingPptx}
            className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            {isExportingPptx ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{isExportingPptx ? "Memproses..." : "Unduh .PPTX"}</span>
          </button>
        </div>
      </div>

      {/* SLIDE NAVIGATION STRIP */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs">
          {currentDoc.slides.map((s, idx) => (
            <div key={idx} className="relative group">
              <button
                type="button"
                onClick={() => {
                  setActiveSlideIndex(idx);
                  if (slideVisualMode === "ai-concept" && !slideAiImageMap[idx]) {
                    handleGenerateSlideAiVisual(idx);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeSlideIndex === idx
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-xs"
                    : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                <span className="font-mono text-[10px] opacity-75">{idx + 1}.</span>
                <span>{s.title.length > 22 ? s.title.slice(0, 20) + "..." : s.title}</span>
              </button>
            </div>
          ))}

          {/* Add Slide Button */}
          <button
            type="button"
            onClick={handleAddSlide}
            className="px-2.5 py-1.5 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 text-xs flex items-center gap-1 cursor-pointer transition-colors"
            title="Tambah Slide Baru"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </button>
        </div>

        {/* Slide Counter & Next/Prev Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 rounded-lg">
          <button
            type="button"
            disabled={activeSlideIndex === 0}
            onClick={() => setActiveSlideIndex((prev) => prev - 1)}
            className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 cursor-pointer text-zinc-800 dark:text-zinc-200 transition-colors"
            title="Slide Sebelumnya (Arrow Left)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-zinc-600 dark:text-zinc-400 font-mono text-xs px-2">
            {activeSlideIndex + 1} / {currentDoc.slides.length}
          </span>
          <button
            type="button"
            disabled={activeSlideIndex === currentDoc.slides.length - 1}
            onClick={() => setActiveSlideIndex((prev) => prev + 1)}
            className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 cursor-pointer text-zinc-800 dark:text-zinc-200 transition-colors"
            title="Slide Berikutnya (Arrow Right)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MAIN 16:9 WIDESCREEN SLIDE CANVAS */}
      <div className={`w-full rounded-2xl ${getThemeCanvasClasses()} p-6 sm:p-10 flex flex-col justify-between relative shadow-2xl overflow-hidden min-h-[520px] transition-all duration-300`}>
        {/* Top Decorative Ambient Glow Bar */}
        <div className={`w-full h-1.5 bg-gradient-to-r ${getThemeAccentGradient()} absolute top-0 left-0`} />

        {/* Top Controls: Edit Slide & Delete Slide floating buttons */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800/40">
          <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 bg-sky-950/70 border border-sky-800/80 px-2.5 py-1 rounded-md">
            {activeSlide.kicker}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleOpenEditModal}
              className="px-2.5 py-1 rounded-md bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
              title="Edit Konten Slide"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => handleDeleteSlide(activeSlideIndex)}
              className="p-1.5 rounded-md bg-zinc-800/80 hover:bg-red-950/60 hover:text-red-400 text-zinc-400 text-xs cursor-pointer transition-colors"
              title="Hapus Slide Ini"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Slide Content: 2-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch flex-1 my-4">
          
          {/* Column 1: Textual Arguments (55%) */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1 leading-snug tracking-tight">
                {activeSlide.title}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 mt-1.5 leading-relaxed font-normal">
                {activeSlide.subtitle}
              </p>

              {/* Key Points */}
              <div className="mt-5 space-y-3">
                {activeSlide.keyPoints.map((pt, pIdx) => (
                  <div
                    key={pIdx}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-colors"
                  >
                    <span className="w-5 h-5 rounded-md bg-sky-950 text-sky-300 font-mono text-[11px] flex items-center justify-center font-bold flex-shrink-0 mt-0.5 border border-sky-800/80">
                      {pIdx + 1}
                    </span>
                    <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-normal">
                      {pt}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Micro Metadata Indicator */}
            <div className="pt-3 border-t border-zinc-800 flex items-center gap-3 text-[11px] text-zinc-400">
              <span className="flex items-center gap-1.5 text-sky-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                Standar Sidang Dikti 2026
              </span>
              <span>&bull;</span>
              <span className="font-mono">{currentDoc.category.toUpperCase()}</span>
            </div>
          </div>

          {/* Column 2: Contextual Visual Architecture Panel (45%) */}
          <div className="lg:col-span-6 flex flex-col justify-between bg-zinc-900/60 rounded-xl border border-zinc-800/80 p-5 relative overflow-hidden">
            
            {/* MODE A: GOOGLE FLOW VECTOR DIAGRAM */}
            {slideVisualMode === "google-flow" && (
              <div className="h-full flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Activity className="w-3 h-3 text-sky-400" />
                    Diagram Alur Google Flow &amp; Metrik
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700">
                    Panel Arsitektur
                  </span>
                </div>

                {/* Vector Flow Node Visuals */}
                <div className="space-y-3 my-auto py-2">
                  <div className="p-3 rounded-lg bg-zinc-950/90 border border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
                      <div>
                        <div className="text-xs font-semibold text-white">Input Masalah &amp; Kebutuhan</div>
                        <div className="text-[10px] text-zinc-400">{currentDoc.targetEntity}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
                      Fase 1
                    </span>
                  </div>

                  <div className="flex justify-center text-zinc-600">
                    <div className="w-0.5 h-3 bg-zinc-700" />
                  </div>

                  <div className="p-3 rounded-lg bg-sky-950/40 border border-sky-800/70 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <div>
                        <div className="text-xs font-semibold text-sky-200">{activeSlide.title}</div>
                        <div className="text-[10px] text-sky-300/80">Metodologi &amp; Sintesis Teruji</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                      Aktif
                    </span>
                  </div>

                  <div className="flex justify-center text-zinc-600">
                    <div className="w-0.5 h-3 bg-zinc-700" />
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-950/90 border border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <div>
                        <div className="text-xs font-semibold text-white">Evaluasi, Validasi &amp; Output</div>
                        <div className="text-[10px] text-zinc-400">Target Capaian 100%</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                      Deliverable
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                  <span>Latency Verifikasi: &lt; 1.2s</span>
                  <span>Akurasi: 99.4%</span>
                </div>
              </div>
            )}

            {/* MODE B: POLLINATIONS / AI CONCEPT VISUAL */}
            {slideVisualMode === "ai-concept" && (
              <div className="h-full flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-sky-400" />
                    Visual Konsep AI (Pollinations 8K)
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700">
                    Rendered Vector
                  </span>
                </div>

                {/* Image Container */}
                <div className="flex-1 flex items-center justify-center rounded-lg overflow-hidden bg-black/60 border border-zinc-800 relative min-h-[220px]">
                  {slideAiImageMap[activeSlideIndex] ? (
                    <img
                      src={slideAiImageMap[activeSlideIndex]}
                      alt={activeSlide.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="p-6 text-center space-y-3">
                      <Sparkles className="w-8 h-8 text-sky-400 mx-auto animate-pulse" />
                      <p className="text-xs text-zinc-300">
                        Belum ada gambar visual untuk slide ini.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleGenerateSlideAiVisual(activeSlideIndex, customSlidePrompt)}
                        className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer mx-auto"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate Gambar AI</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Prompt Customization Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Sesuaikan prompt visual AI (opsional)..."
                      value={customSlidePrompt}
                      onChange={(e) => setCustomSlidePrompt(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs placeholder:text-zinc-600 focus:outline-hidden focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleGenerateSlideAiVisual(activeSlideIndex, customSlidePrompt)}
                      disabled={isGeneratingSlideVisual}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer flex-shrink-0"
                      title="Regenerate Gambar"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingSlideVisual ? "animate-spin" : ""}`} />
                      <span>Ubah</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Bottom Footer Info */}
        <div className="pt-3 border-t border-zinc-850 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
          <span>{currentDoc.institution} &bull; {currentDoc.candidateName} (NIM: {currentDoc.candidateId})</span>
          <span>Slide {activeSlideIndex + 1} / {currentDoc.slides.length}</span>
        </div>
      </div>

      {/* SPEAKER NOTES & PRESENTER GUIDE CARD */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-sky-500" />
            Catatan Presenter &amp; Naskah Narasi Sidang (Speaker Notes)
          </span>
          <button
            type="button"
            onClick={handleCopySpeakerNotes}
            className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
          >
            {copiedNotes ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedNotes ? "Tersalin!" : "Salin Catatan"}</span>
          </button>
        </div>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed italic bg-zinc-50 dark:bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-850">
          "{activeSlide.speakerNotes || "Presenter dapat memaparkan latar belakang, justifikasi metodologis, dan kontribusi empiris pada bagian ini."}"
        </p>
      </div>

      {/* EDIT SLIDE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-sky-500" />
                <span>Edit Slide {activeSlideIndex + 1}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Kicker / Kategori</label>
                <input
                  type="text"
                  value={editKicker}
                  onChange={(e) => setEditKicker(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Judul Slide</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Subjudul / Penjelas</label>
                <input
                  type="text"
                  value={editSubtitle}
                  onChange={(e) => setEditSubtitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Poin-poin Kunci (Key Points)</label>
                {editPoints.map((pt, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-zinc-400">{idx + 1}.</span>
                    <input
                      type="text"
                      value={pt}
                      onChange={(e) => {
                        const newPts = [...editPoints];
                        newPts[idx] = e.target.value;
                        setEditPoints(newPts);
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setEditPoints(editPoints.filter((_, i) => i !== idx))}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setEditPoints([...editPoints, "Poin argumen baru"])}
                  className="mt-1 px-2.5 py-1 rounded-md border border-dashed border-zinc-300 dark:border-zinc-700 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 cursor-pointer"
                >
                  + Tambah Poin
                </button>
              </div>

              <div>
                <label className="font-semibold block mb-1">Catatan Presenter (Speaker Notes)</label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-hidden resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveEditSlide}
                className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-black text-xs font-semibold cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PresentationStudio;
