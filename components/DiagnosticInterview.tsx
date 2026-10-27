"use client";
import { aiFetch } from "@/lib/aiClient";
import { fillMissingInterviewAnswers } from "@/lib/interviewAnswers";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { DiagnosticQuestion, ProposalCategory } from "@/types/studio";
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Check, 
  Loader2, 
  Mic, 
  MicOff, 
  Layers, 
  ShieldCheck, 
  AlertCircle,
  BookOpen,
  Bot,
  BrainCircuit,
  ChevronRight,
  ChevronLeft,
  Wand2,
  ListFilter,
  CheckCircle2,
  Clock,
  RotateCcw,
  Maximize2,
  Minimize2,
  FileText,
  Building2,
  Compass,
  Lightbulb
} from "lucide-react";
import { detectMissingInformation, MissingInformationItem } from "@/lib/diagnosticInterviewEngine.ts";

interface DiagnosticInterviewProps {
  category: ProposalCategory;
  reportType?: string;
  title: string;
  targetEntity?: string;
  questions: DiagnosticQuestion[];
  answers: Record<string, string>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onBack: () => void;
  onSubmit: () => void;
}

// Chapter Mapping helper based on field name
const getChapterMapping = (field: string, category: ProposalCategory) => {
  const f = field.toLowerCase();
  if (f.includes("latar") || f.includes("problem") || f.includes("gap") || f.includes("masalah")) {
    return {
      chapter: "BAB I: PENDAHULUAN",
      subchapter: "Subbab 1.1 Latar Belakang & 1.2 Rumusan Masalah",
      role: "Fondasi justifikasi urgensi penelitian & kesenjangan empiris"
    };
  }
  if (f.includes("lingkup") || f.includes("scope") || f.includes("batasan")) {
    return {
      chapter: "BAB I: PENDAHULUAN",
      subchapter: "Subbab 1.3 Batasan Masalah & Ruang Lingkup",
      role: "Membatasi cakupan variabel agar penelitian terarah dan terukur"
    };
  }
  if (f.includes("teori") || f.includes("pustaka") || f.includes("state") || f.includes("kompetensi")) {
    return {
      chapter: category === "magang" ? "BAB II: GAMBARAN MITRA & TEORI" : "BAB II: TINJAUAN PUSTAKA",
      subchapter: "Subbab 2.1 Landasan Teori & 2.2 Penelitian Terdahulu",
      role: "State of the art ilmiah dan keterkaitan kurikulum kompetensi"
    };
  }
  if (f.includes("metode") || f.includes("alat") || f.includes("tools") || f.includes("perangkat") || f.includes("akses")) {
    return {
      chapter: "BAB III: METODOLOGI PENELITIAN",
      subchapter: "Subbab 3.1 Desain Studi, 3.2 Alat Kerja & Protokol Data",
      role: "Kerangka teknis, algoritma, instrumen validasi, dan etika data"
    };
  }
  if (f.includes("hasil") || f.includes("temuan") || f.includes("evaluasi") || f.includes("target")) {
    return {
      chapter: "BAB IV: PEMBAHASAN & LUARAN",
      subchapter: "Subbab 4.1 Temuan Empiris & 4.2 Analisis Kinerja",
      role: "Korelasi antara hasil kerja aktual dengan target keberhasilan"
    };
  }
  return {
    chapter: "BAB I: PENDAHULUAN",
    subchapter: "Kerangka Dasar Proposal",
    role: "Parameter penunjang kelengkapan administrasi naskah"
  };
};

// Friendly short labels for questions in left navigator
const getQuestionShortLabel = (q: DiagnosticQuestion, index: number) => {
  const f = q.field.toLowerCase();
  if (f.includes("problem") || f.includes("latar") || f.includes("gap")) return "Latar Belakang & Masalah";
  if (f.includes("scope") || f.includes("lingkup") || f.includes("batasan")) return "Batasan & Ruang Lingkup";
  if (f.includes("method") || f.includes("tools") || f.includes("perangkat")) return "Metodologi & Alat Kerja";
  if (f.includes("competency") || f.includes("kompetensi") || f.includes("tujuan")) return "Target Capaian & Luaran";
  if (f.includes("access") || f.includes("akses") || f.includes("data")) return "Akses Data & Etika NDA";
  if (f.includes("result") || f.includes("hasil") || f.includes("temuan")) return "Temuan & Data Empiris";
  return `Parameter ${index + 1}`;
};

export const DiagnosticInterview: React.FC<DiagnosticInterviewProps> = ({
  category,
  reportType,
  title,
  targetEntity = "",
  questions,
  answers,
  setAnswers,
  onBack,
  onSubmit
}) => {
  // Active question index in Focus Mode
  const [activeIndex, setActiveIndex] = useState(0);

  // View Mode: 'focus' (single step canvas) vs 'overview' (full parameters grid)
  const [viewMode, setViewMode] = useState<"focus" | "overview">("focus");

  // Right sidebar toggle for maximum writing canvas
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  // Loading states
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [isRefiningCurrent, setIsRefiningCurrent] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Speech Dictation
  const [listeningField, setListeningField] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const currentQuestion = questions[activeIndex] || questions[0];

  const handleAnswerChange = (field: string, val: string) => {
    setAnswers(prev => ({ ...prev, [field]: val }));
  };

  const handleApplySingleSuggestion = (q: DiagnosticQuestion) => {
    setAnswers(prev => ({ ...prev, [q.field]: q.aiSuggestion }));
    showToast(`Saran AI untuk ${getQuestionShortLabel(q, activeIndex)} diterapkan.`);
  };

  const handleAppendSuggestion = (q: DiagnosticQuestion) => {
    const existing = answers[q.field] || "";
    const updated = existing ? `${existing.trim()}\n\n${q.aiSuggestion}` : q.aiSuggestion;
    setAnswers(prev => ({ ...prev, [q.field]: updated }));
    showToast(`Saran AI disisipkan ke naskah jawaban.`);
  };

  // Speech Recognition
  const toggleListening = (field: string) => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("Browser Anda belum mendukung Web Speech Recognition. Gunakan Chrome atau Edge.");
      return;
    }

    if (listeningField === field) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setListeningField(null);
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "id-ID";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setListeningField(field);
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + " ";
        }
        setAnswers(prev => ({
          ...prev,
          [field]: transcript.trim()
        }));
      };

      recognition.onerror = () => {
        setListeningField(null);
      };

      recognition.onend = () => {
        setListeningField(null);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn("Speech recognition error:", err);
      setListeningField(null);
    }
  };

  // AI-Powered Auto-Generate All Answers via Gemini
  const handleAutoGenerateAIAnswers = async () => {
    setIsGeneratingAll(true);
    try {
      const res = await aiFetch("/api/interview/auto-answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          targetEntity,
          questions
        })
      });

      const data = await res.json();
      if (data.success && data.answers) {
        setAnswers(prev => fillMissingInterviewAnswers(prev, questions.map(q => q.field), data.answers));
        showToast(data.engine === "domain-heuristics" ? "Saran lokal untuk kolom kosong telah diisi. Periksa dan sesuaikan dengan kondisi Anda." : "Saran AI untuk kolom kosong telah diisi. Periksa dan sesuaikan dengan kondisi Anda.");
      } else {
        const updated: Record<string, string> = { ...answers };
        questions.forEach(q => {
          if (!updated[q.field]?.trim()) updated[q.field] = q.aiSuggestion;
        });
        setAnswers(updated);
        showToast("Saran lokal untuk kolom kosong telah diisi. Periksa dan sesuaikan dengan kondisi Anda.");
      }
    } catch (err: any) {
      console.warn("Auto generate answers error:", err);
      const updated: Record<string, string> = { ...answers };
      questions.forEach(q => {
        if (!updated[q.field]?.trim()) updated[q.field] = q.aiSuggestion;
      });
      setAnswers(updated);
      showToast("Saran lokal untuk kolom kosong telah diisi. Periksa dan sesuaikan dengan kondisi Anda.");
    } finally {
      setIsGeneratingAll(false);
    }
  };

  // Refine current active question's answer using Gemini Academic Refiner
  const handleRefineCurrentAnswer = async () => {
    if (!currentQuestion) return;
    const currentVal = answers[currentQuestion.field] || "";
    if (!currentVal.trim()) {
      showToast("Tuliskan draf jawaban terlebih dahulu sebelum disempurnakan AI.");
      return;
    }

    setIsRefiningCurrent(true);
    try {
      const res = await aiFetch("/api/gemini/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionTitle: currentQuestion.question,
          currentContent: currentVal,
          instruction: "Sempurnakan kalimat menjadi bahasa Indonesia baku berbobot akademis, perjelas kausalitas masalah, dan perkuat istilah teknis tanpa mengubah esensi fakta."
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.revisedContent) {
          handleAnswerChange(currentQuestion.field, data.revisedContent);
          showToast("Jawaban berhasil disempurnakan dengan standar diksi akademis.");
          return;
        }
      }
      showToast("Penyempurnaan belum tersedia. Periksa koneksi dan pengaturan AI.");
    } catch (e) {
      console.warn("Refine error:", e);
      showToast("Gagal menghubungi agen refiner. Periksa koneksi Anda.");
    } finally {
      setIsRefiningCurrent(false);
    }
  };

  // Keyboard navigation: Ctrl+Enter to advance or submit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (activeIndex < questions.length - 1) {
        setActiveIndex(prev => prev + 1);
      } else if (isAllAnswered) {
        onSubmit();
      }
    }
  };

  const answeredCount = questions.filter(q => !!answers[q.field]?.trim()).length;
  const progressPercent = Math.round((answeredCount / (questions.length || 1)) * 100);
  const isAllAnswered = answeredCount === questions.length && questions.length > 0;

  const completeness = useMemo(() => {
    return detectMissingInformation(answers, category, reportType as any);
  }, [answers, category, reportType]);

  const activeChapterInfo = currentQuestion ? getChapterMapping(currentQuestion.field, category) : null;

  return (
    <div 
      onKeyDown={handleKeyDown}
      className="flex-1 flex flex-col w-full h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] overflow-hidden bg-[#F8FAFC] dark:bg-[#080B12] text-[#0F172A] dark:text-[#F3F6FC] animate-in fade-in duration-200"
    >
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-18 right-6 z-50 bg-[#0F172A] dark:bg-[#1C263A] border border-[#253149] text-white dark:text-[#F3F6FC] px-4 py-2.5 rounded-xl shadow-2xl text-xs flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <Sparkles className="w-3.5 h-3.5 text-[#7C9CFF]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. TOP HEADER & WORKSPACE UTILITY BAR                         */}
      {/* ============================================================ */}
      <div className="h-14 min-h-[56px] border-b border-[#E2E8F0] dark:border-[#253149] bg-white/95 dark:bg-[#0B101A]/95 px-4 sm:px-6 flex items-center justify-between gap-4 z-20 shrink-0">
        
        {/* Left: Back & Topic Context */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#253149] hover:bg-[#F1F5F9] dark:hover:bg-[#172033] text-[#475569] dark:text-[#A4B1C7] hover:text-[#0F172A] dark:hover:text-[#F3F6FC] transition-colors cursor-pointer shrink-0"
            title="Kembali ke Beranda"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#7C9CFF]/10 text-[#7C9CFF] border border-[#7C9CFF]/20 shrink-0">
                Langkah 2: Wawancara Diagnostik
              </span>
              <span className="text-[11px] text-[#64748B] dark:text-[#A4B1C7] hidden md:inline truncate max-w-sm">
                Topik: <span className="font-semibold text-[#0F172A] dark:text-[#F3F6FC]">{title}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Center: Stepper Dots & Progress Meter */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#F1F5F9] dark:bg-[#111827] px-2.5 py-1 rounded-full border border-[#E2E8F0] dark:border-[#253149]">
            {questions.map((q, idx) => {
              const isDone = !!answers[q.field]?.trim();
              const isActive = activeIndex === idx && viewMode === "focus";
              return (
                <button
                  key={q.id || idx}
                  type="button"
                  onClick={() => {
                    setActiveIndex(idx);
                    setViewMode("focus");
                  }}
                  className={`w-6 h-6 rounded-full text-[10px] font-mono font-bold flex items-center justify-center transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#7C9CFF] text-[#080B12] ring-2 ring-[#7C9CFF]/40 shadow-xs scale-105"
                      : isDone
                      ? "bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/40 hover:bg-[#34D399]/25"
                      : "bg-white dark:bg-[#172033] text-[#64748B] dark:text-[#A4B1C7] border border-[#E2E8F0] dark:border-[#253149] hover:border-[#7C9CFF]"
                  }`}
                  title={`${getQuestionShortLabel(q, idx)} (${isDone ? "Terisi" : "Belum"})`}
                >
                  {isDone ? <Check className="w-3 h-3 stroke-[2.5]" /> : idx + 1}
                </button>
              );
            })}
          </div>

          <span className="text-xs font-mono font-medium text-[#64748B] dark:text-[#A4B1C7]">
            {answeredCount}/{questions.length} Terisi ({progressPercent}%)
          </span>
        </div>

        {/* Right: View Mode Toggle & Primary Actions */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* View Mode Switcher */}
          <div className="hidden sm:flex items-center p-0.5 rounded-lg bg-[#F1F5F9] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#253149] text-xs">
            <button
              type="button"
              onClick={() => setViewMode("focus")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                viewMode === "focus"
                  ? "bg-white dark:bg-[#172033] text-[#7C9CFF] shadow-2xs font-semibold"
                  : "text-[#64748B] dark:text-[#A4B1C7] hover:text-[#0F172A] dark:hover:text-[#F3F6FC]"
              }`}
            >
              Fokus
            </button>
            <button
              type="button"
              onClick={() => setViewMode("overview")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                viewMode === "overview"
                  ? "bg-white dark:bg-[#172033] text-[#7C9CFF] shadow-2xs font-semibold"
                  : "text-[#64748B] dark:text-[#A4B1C7] hover:text-[#0F172A] dark:hover:text-[#F3F6FC]"
              }`}
            >
              Semua
            </button>
          </div>

          {/* AI Auto-Generate All */}
          <button
            type="button"
            onClick={handleAutoGenerateAIAnswers}
            disabled={isGeneratingAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#CBD5E1] dark:border-[#253149] bg-white dark:bg-[#111827] hover:bg-[#F8FAFC] dark:hover:bg-[#172033] text-xs font-medium text-[#0F172A] dark:text-[#F3F6FC] hover:border-[#7C9CFF] transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            title="Isi seluruh parameter otomatis menggunakan penalaran ilmiah Gemini"
          >
            {isGeneratingAll ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#7C9CFF]" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-[#FBBF24]" />
            )}
            <span className="hidden sm:inline">Auto-Generate (AI)</span>
          </button>

          {/* Submit / Launch Agents Button */}
          <button
            type="button"
            onClick={onSubmit}
            disabled={!isAllAnswered}
            title={!isAllAnswered ? "Lengkapi seluruh parameter sebelum menjalankan orkestrasi" : "Jalankan Orkestrasi Multi-Agent AI"}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0F172A] dark:bg-[#7C9CFF] hover:bg-black dark:hover:bg-[#9B8CFF] text-white dark:text-[#080B12] text-xs font-semibold transition-all shadow-xs disabled:opacity-40 disabled:pointer-events-none cursor-pointer group"
          >
            <span>Jalankan Multi-Agent AI</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Toggle Right Panel */}
          <button
            type="button"
            onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
            className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#253149] text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F3F6FC] transition-colors cursor-pointer hidden xl:flex"
            title={isRightPanelOpen ? "Tutup panel samping" : "Buka panel samping"}
          >
            {isRightPanelOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

        </div>

      </div>

      {/* ============================================================ */}
      {/* 2. MAIN WORKSPACE: 3-PANEL IMMERSIVE STUDIO LAYOUT           */}
      {/* ============================================================ */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ========================================================== */}
        {/* PANEL A: LEFT RAIL — PARAMETER NAVIGATOR & QUALITY GATE    */}
        {/* ========================================================== */}
        <aside className="w-72 lg:w-80 border-r border-[#E2E8F0] dark:border-[#253149] bg-white dark:bg-[#0B101A] flex flex-col justify-between overflow-hidden shrink-0 hidden md:flex">
          
          {/* Question Stepper List */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-1.5">
            <div className="px-2 py-1 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#A4B1C7] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#7C9CFF]" />
                <span>Parameter Riset Standar Dikti</span>
              </span>
            </div>

            {questions.map((q, idx) => {
              const currentVal = answers[q.field] || "";
              const isAnswered = currentVal.trim().length > 0;
              const isActive = activeIndex === idx && viewMode === "focus";
              const shortLabel = getQuestionShortLabel(q, idx);

              return (
                <button
                  key={q.id || idx}
                  type="button"
                  onClick={() => {
                    setActiveIndex(idx);
                    setViewMode("focus");
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                    isActive
                      ? "bg-[#7C9CFF]/10 border-[#7C9CFF] ring-1 ring-[#7C9CFF]/30 text-[#0F172A] dark:text-[#F3F6FC] shadow-2xs"
                      : isAnswered
                      ? "bg-[#F8FAFC] dark:bg-[#111827] border-[#E2E8F0] dark:border-[#253149] text-[#475569] dark:text-[#A4B1C7] hover:border-[#7C9CFF]/40"
                      : "bg-transparent border-transparent hover:bg-[#F1F5F9] dark:hover:bg-[#111827] text-[#64748B] dark:text-[#A4B1C7]"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5 ${
                    isAnswered 
                      ? "bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/40" 
                      : isActive
                      ? "bg-[#7C9CFF] text-[#080B12]"
                      : "bg-[#E2E8F0] dark:bg-[#172033] text-[#64748B]"
                  }`}>
                    {isAnswered ? <Check className="w-3 h-3 stroke-[2.5]" /> : idx + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-xs font-semibold truncate text-[#0F172A] dark:text-[#F3F6FC]">
                        {shortLabel}
                      </span>
                      {isAnswered && (
                        <span className="text-[9px] font-mono font-semibold text-[#34D399] shrink-0">
                          OK
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#64748B] dark:text-[#A4B1C7] line-clamp-1">
                      {q.thinkingModeApplied}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom Quality Gate Card */}
          <div className="p-3.5 border-t border-[#E2E8F0] dark:border-[#253149] bg-[#F8FAFC] dark:bg-[#080B12] space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#0F172A] dark:text-[#F3F6FC] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#34D399]" />
                <span>Kesiapan Naskah</span>
              </span>
              <span className={`font-mono font-bold ${
                completeness.completenessPercentage >= 80 ? "text-[#34D399]" : "text-[#FBBF24]"
              }`}>
                {completeness.completenessPercentage}%
              </span>
            </div>

            {/* Micro Progress Bar */}
            <div className="w-full bg-[#E2E8F0] dark:bg-[#253149] h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 rounded-full ${
                  completeness.completenessPercentage >= 80 ? "bg-[#34D399]" : "bg-[#FBBF24]"
                }`}
                style={{ width: `${completeness.completenessPercentage}%` }}
              />
            </div>

            <p className="text-[10px] text-[#64748B] dark:text-[#A4B1C7] leading-relaxed">
              {completeness.criticalMissingCount > 0 
                ? `⚠️ Masih ada ${completeness.criticalMissingCount} variabel krusial yang perlu diuraikan.`
                : "✓ Parameter lengkap untuk orkestrasi bab mendalam."}
            </p>
          </div>

        </aside>

        {/* ========================================================== */}
        {/* PANEL B: CENTER STAGE — DIAGNOSTIC CANVAS                  */}
        {/* ========================================================== */}
        <main className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F8FAFC] dark:bg-[#080B12]">
          
          {/* MODE 1: FOCUSED SINGLE QUESTION STAGE (DEFAULT) */}
          {viewMode === "focus" && currentQuestion && (
            <div className="max-w-3xl w-full mx-auto flex-1 flex flex-col justify-between space-y-6">
              
              {/* Question Header Card */}
              <div className="space-y-3">
                
                {/* Meta Badge Bar */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#F1F5F9] dark:bg-[#172033] text-[#475569] dark:text-[#A4B1C7] border border-[#E2E8F0] dark:border-[#253149]">
                      PARAMETER {activeIndex + 1} DARI {questions.length}
                    </span>
                    <span className="text-[10px] font-mono text-[#7C9CFF] bg-[#7C9CFF]/10 px-2 py-0.5 rounded border border-[#7C9CFF]/20">
                      🧠 {currentQuestion.thinkingModeApplied}
                    </span>
                  </div>

                  {/* Speech Dictation Indicator */}
                  {listeningField === currentQuestion.field && (
                    <span className="text-[11px] font-semibold text-[#FB7185] flex items-center gap-1.5 animate-pulse">
                      <Mic className="w-3.5 h-3.5" />
                      <span>Sedang mendengarkan ucapan Anda...</span>
                    </span>
                  )}
                </div>

                {/* Editorial Question Text */}
                <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-[#0F172A] dark:text-[#F3F6FC] leading-snug">
                  {currentQuestion.question}
                </h2>

                {/* Academic Context Hint */}
                <div className="p-3 rounded-xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#253149] text-xs text-[#64748B] dark:text-[#A4B1C7] leading-relaxed flex items-start gap-2.5 shadow-2xs">
                  <Lightbulb className="w-4 h-4 text-[#FBBF24] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#0F172A] dark:text-[#F3F6FC]">
                      Fokus Penajaman:{" "}
                    </span>
                    <span>{currentQuestion.contextHint}</span>
                  </div>
                </div>

              </div>

              {/* Main Writing Canvas Card */}
              <div className="flex-1 flex flex-col bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#253149] rounded-2xl shadow-sm focus-within:border-[#7C9CFF] focus-within:ring-2 focus-within:ring-[#7C9CFF]/20 transition-all overflow-hidden min-h-[260px]">
                
                {/* Canvas Toolbar */}
                <div className="px-4 py-2.5 border-b border-[#E2E8F0] dark:border-[#253149] bg-[#F8FAFC] dark:bg-[#0B101A] flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#A4B1C7]">
                    Draf Uraian Anda:
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* Speech Dictation Button */}
                    <button
                      type="button"
                      onClick={() => toggleListening(currentQuestion.field)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                        listeningField === currentQuestion.field
                          ? "bg-[#FB7185] text-white animate-pulse"
                          : "bg-white dark:bg-[#172033] border border-[#E2E8F0] dark:border-[#253149] text-[#475569] dark:text-[#A4B1C7] hover:border-[#7C9CFF]"
                      }`}
                      title="Diktekan jawaban lewat mikrofon"
                    >
                      {listeningField === currentQuestion.field ? (
                        <MicOff className="w-3 h-3" />
                      ) : (
                        <Mic className="w-3 h-3 text-[#7C9CFF]" />
                      )}
                      <span>{listeningField === currentQuestion.field ? "Berhenti" : "Dikte"}</span>
                    </button>

                    {/* AI Polish / Refine Button */}
                    <button
                      type="button"
                      onClick={handleRefineCurrentAnswer}
                      disabled={isRefiningCurrent || !answers[currentQuestion.field]?.trim()}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white dark:bg-[#172033] border border-[#E2E8F0] dark:border-[#253149] hover:border-[#7C9CFF] text-[#475569] dark:text-[#A4B1C7] hover:text-[#0F172A] dark:hover:text-[#F3F6FC] text-xs font-medium transition-colors cursor-pointer disabled:opacity-40"
                      title="Sempurnakan kalimat menjadi bahasa Indonesia akademis baku"
                    >
                      {isRefiningCurrent ? (
                        <Loader2 className="w-3 h-3 animate-spin text-[#7C9CFF]" />
                      ) : (
                        <Wand2 className="w-3 h-3 text-[#9B8CFF]" />
                      )}
                      <span>Sempurnakan (AI)</span>
                    </button>

                    {/* Clear Button */}
                    {answers[currentQuestion.field] && (
                      <button
                        type="button"
                        onClick={() => handleAnswerChange(currentQuestion.field, "")}
                        className="p-1 rounded-md text-[#64748B] hover:text-[#FB7185] transition-colors cursor-pointer"
                        title="Kosongkan teks"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Big Distraction-Free Textarea */}
                <textarea
                  rows={6}
                  value={answers[currentQuestion.field] || ""}
                  onChange={(e) => handleAnswerChange(currentQuestion.field, e.target.value)}
                  placeholder={currentQuestion.placeholder}
                  className="flex-1 w-full bg-transparent border-none outline-none p-4 text-xs sm:text-sm text-[#0F172A] dark:text-[#F3F6FC] placeholder:text-[#64748B] leading-relaxed resize-none"
                />

                {/* Canvas Status Footer */}
                <div className="px-4 py-2 border-t border-[#E2E8F0]/70 dark:border-[#253149]/70 bg-[#F8FAFC]/50 dark:bg-[#0B101A]/50 flex items-center justify-between text-[11px] text-[#64748B] font-mono">
                  <span>
                    {(answers[currentQuestion.field] || "").trim().split(/\s+/).filter(Boolean).length} kata &bull; {(answers[currentQuestion.field] || "").length} karakter
                  </span>
                  {answers[currentQuestion.field]?.trim() ? (
                    <span className="text-[#34D399] flex items-center gap-1 font-sans font-medium">
                      <Check className="w-3 h-3" /> Parameter Terpenuhi
                    </span>
                  ) : (
                    <span className="text-[#FBBF24] font-sans">
                      *Wajib diisi atau terapkan rekomendasi AI
                    </span>
                  )}
                </div>

              </div>

              {/* AI Recommendation Capsule Card */}
              {currentQuestion.aiSuggestion && (
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#253149] shadow-2xs space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-[#FBBF24] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Rekomendasi Argumen Ilmiah AI:</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleApplySingleSuggestion(currentQuestion)}
                        className="px-2.5 py-1 rounded-lg bg-[#7C9CFF]/15 hover:bg-[#7C9CFF]/25 border border-[#7C9CFF]/30 text-[#7C9CFF] text-[11px] font-semibold transition-all cursor-pointer"
                      >
                        Gunakan Saran Ini
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAppendSuggestion(currentQuestion)}
                        className="px-2.5 py-1 rounded-lg bg-[#F1F5F9] dark:bg-[#172033] hover:bg-[#E2E8F0] dark:hover:bg-[#1C263A] text-[#475569] dark:text-[#A4B1C7] text-[11px] font-medium transition-all cursor-pointer"
                        title="Tambahkan saran ke akhir teks yang sudah ada"
                      >
                        Sisipkan di Akhir
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-[#475569] dark:text-[#A4B1C7] leading-relaxed bg-[#F8FAFC] dark:bg-[#080B12] p-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#253149]">
                    {currentQuestion.aiSuggestion}
                  </p>
                </div>
              )}

              {/* Stepper Navigation Footer */}
              <div className="pt-2 flex items-center justify-between gap-4 border-t border-[#E2E8F0] dark:border-[#253149]">
                <button
                  type="button"
                  onClick={() => setActiveIndex(prev => Math.max(0, prev - 1))}
                  disabled={activeIndex === 0}
                  className="px-4 py-2 rounded-xl border border-[#CBD5E1] dark:border-[#253149] text-xs font-medium text-[#475569] dark:text-[#A4B1C7] hover:bg-white dark:hover:bg-[#172033] hover:text-[#0F172A] dark:hover:text-[#F3F6FC] transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Sebelumnya</span>
                </button>

                <div className="text-xs text-[#64748B] dark:text-[#A4B1C7] font-medium hidden sm:inline">
                  Tekan <kbd className="px-1.5 py-0.5 rounded bg-[#E2E8F0] dark:bg-[#172033] text-[10px] font-mono">⌘/Ctrl + Enter</kbd> untuk lanjut
                </div>

                {activeIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setActiveIndex(prev => Math.min(questions.length - 1, prev + 1))}
                    className="px-4 py-2 rounded-xl bg-[#0F172A] dark:bg-[#7C9CFF] hover:bg-black dark:hover:bg-[#9B8CFF] text-white dark:text-[#080B12] text-xs font-semibold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 group"
                  >
                    <span>Parameter Selanjutnya</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onSubmit}
                    disabled={!isAllAnswered}
                    className="px-5 py-2 rounded-xl bg-[#34D399] hover:bg-[#059669] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5"
                  >
                    <span>Selesai &amp; Mulai AI</span>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </button>
                )}
              </div>

            </div>
          )}

          {/* MODE 2: OVERVIEW GRID VIEW (FOR REVIEWING ALL AT ONCE) */}
          {viewMode === "overview" && (
            <div className="max-w-5xl w-full mx-auto space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] dark:border-[#253149]">
                <div>
                  <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F3F6FC]">
                    Tinjauan Seluruh Parameter Wawancara
                  </h3>
                  <p className="text-xs text-[#64748B] dark:text-[#A4B1C7]">
                    Periksa atau lengkapi seluruh {questions.length} parameter secara bersamaan.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewMode("focus")}
                  className="px-3 py-1.5 rounded-lg bg-[#7C9CFF] text-[#080B12] text-xs font-semibold cursor-pointer"
                >
                  Kembali ke Mode Fokus
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {questions.map((q, idx) => {
                  const currentVal = answers[q.field] || "";
                  const isAnswered = currentVal.trim().length > 0;
                  return (
                    <div
                      key={q.id || idx}
                      className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#253149] space-y-2.5 shadow-2xs hover:border-[#7C9CFF]/50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#F1F5F9] dark:bg-[#172033] text-[#475569] dark:text-[#A4B1C7]">
                          #{idx + 1} &bull; {getQuestionShortLabel(q, idx)}
                        </span>
                        {isAnswered ? (
                          <span className="text-[10px] text-[#34D399] font-medium flex items-center gap-1">
                            <Check className="w-3 h-3" /> Terisi
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#FBBF24]">Kosong</span>
                        )}
                      </div>

                      <h4 className="text-xs font-semibold text-[#0F172A] dark:text-[#F3F6FC] line-clamp-2">
                        {q.question}
                      </h4>

                      <textarea
                        rows={3}
                        value={currentVal}
                        onChange={(e) => handleAnswerChange(q.field, e.target.value)}
                        placeholder={q.placeholder}
                        className="w-full bg-[#F8FAFC] dark:bg-[#080B12] border border-[#E2E8F0] dark:border-[#253149] rounded-lg p-2.5 text-xs text-[#0F172A] dark:text-[#F3F6FC] placeholder:text-[#64748B] focus:outline-none focus:border-[#7C9CFF]"
                      />

                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <button
                          type="button"
                          onClick={() => handleApplySingleSuggestion(q)}
                          className="text-[#7C9CFF] hover:underline font-medium cursor-pointer"
                        >
                          Gunakan Saran AI
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveIndex(idx);
                            setViewMode("focus");
                          }}
                          className="text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F3F6FC] font-medium cursor-pointer flex items-center gap-0.5"
                        >
                          <span>Edit Fokus</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </main>

        {/* ========================================================== */}
        {/* PANEL C: RIGHT RAIL — AI CO-PILOT & REAL-TIME SYNTHESIS   */}
        {/* ========================================================== */}
        {isRightPanelOpen && (
          <aside className="w-80 lg:w-88 border-l border-[#E2E8F0] dark:border-[#253149] bg-white dark:bg-[#0B101A] flex flex-col overflow-y-auto p-4 shrink-0 space-y-4 hidden xl:flex">
            
            {/* Header */}
            <div className="pb-2 border-b border-[#E2E8F0] dark:border-[#253149] flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-[#F3F6FC] flex items-center gap-1.5">
                <BrainCircuit className="w-4 h-4 text-[#7C9CFF]" />
                <span>AI Co-Pilot &amp; Sintesis</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#7C9CFF]/15 text-[#7C9CFF]">
                Live Inspector
              </span>
            </div>

            {/* 1. Chapter Structure Mapping */}
            {activeChapterInfo && (
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#253149] space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase text-[#7C9CFF] flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  <span>Struktur Naskah Dituju:</span>
                </span>
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A] dark:text-[#F3F6FC]">
                    {activeChapterInfo.chapter}
                  </h4>
                  <p className="text-[11px] font-medium text-[#7C9CFF] mt-0.5">
                    {activeChapterInfo.subchapter}
                  </p>
                </div>
                <p className="text-[11px] text-[#64748B] dark:text-[#A4B1C7] leading-relaxed pt-1 border-t border-[#E2E8F0] dark:border-[#253149]">
                  {activeChapterInfo.role}
                </p>
              </div>
            )}

            {/* 2. Real-Time Extracted Research Brief */}
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#253149] space-y-2.5">
              <span className="text-[10px] font-mono font-bold uppercase text-[#64748B] dark:text-[#A4B1C7] flex items-center gap-1">
                <FileText className="w-3 h-3 text-[#34D399]" />
                <span>Ringkasan Usulan yang Terekstrak:</span>
              </span>

              <div className="space-y-2 text-[11px]">
                <div className="p-2 rounded-lg bg-white dark:bg-[#080B12] border border-[#E2E8F0] dark:border-[#253149]">
                  <span className="text-[10px] font-semibold text-[#64748B] dark:text-[#A4B1C7] block mb-0.5">
                    Lokus Mitra / Subjek:
                  </span>
                  <span className="text-[#0F172A] dark:text-[#F3F6FC] font-medium">
                    {targetEntity || "Belum ditentukan"}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-white dark:bg-[#080B12] border border-[#E2E8F0] dark:border-[#253149]">
                  <span className="text-[10px] font-semibold text-[#64748B] dark:text-[#A4B1C7] block mb-0.5">
                    Masalah Utama:
                  </span>
                  <span className="text-[#0F172A] dark:text-[#F3F6FC] line-clamp-2">
                    {answers["latarBelakang"] || answers["q1_problem"] || answers["q1_research_gap"] || "(Menunggu pengisian...)"}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-white dark:bg-[#080B12] border border-[#E2E8F0] dark:border-[#253149]">
                  <span className="text-[10px] font-semibold text-[#64748B] dark:text-[#A4B1C7] block mb-0.5">
                    Metode &amp; Tools:
                  </span>
                  <span className="text-[#0F172A] dark:text-[#F3F6FC] line-clamp-2">
                    {answers["perangkatTools"] || answers["q3_method_tools"] || answers["metodePelaksanaan"] || "(Menunggu pengisian...)"}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Multi-Agent Readiness Roster */}
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#253149] space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase text-[#64748B] dark:text-[#A4B1C7] flex items-center gap-1">
                <Bot className="w-3 h-3 text-[#9B8CFF]" />
                <span>4 Agen Spesialis Siap Mengorkestrasi:</span>
              </span>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-white dark:bg-[#080B12] border border-[#E2E8F0] dark:border-[#253149]">
                  <span className="text-[11px] text-[#0F172A] dark:text-[#F3F6FC]">🔬 Agen Metodologi</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#34D399]/15 text-[#34D399] font-bold">SIAP</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-white dark:bg-[#080B12] border border-[#E2E8F0] dark:border-[#253149]">
                  <span className="text-[11px] text-[#0F172A] dark:text-[#F3F6FC]">⚖️ Agen Kepatuhan SN-Dikti</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#34D399]/15 text-[#34D399] font-bold">SIAP</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-white dark:bg-[#080B12] border border-[#E2E8F0] dark:border-[#253149]">
                  <span className="text-[11px] text-[#0F172A] dark:text-[#F3F6FC]">🔍 Agen Sitasi &amp; Fakta Jurnal</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#34D399]/15 text-[#34D399] font-bold">SIAP</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-white dark:bg-[#080B12] border border-[#E2E8F0] dark:border-[#253149]">
                  <span className="text-[11px] text-[#0F172A] dark:text-[#F3F6FC]">✍️ Agen Penulis Naskah Bab</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#34D399]/15 text-[#34D399] font-bold">SIAP</span>
                </div>
              </div>
            </div>

            {/* Missing Items Warning if any */}
            {completeness.missingItems.length > 0 && (
              <div className="p-3 rounded-xl bg-[#FBBF24]/10 border border-[#FBBF24]/30 text-xs space-y-1.5">
                <span className="text-[11px] font-bold text-[#FBBF24] flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Saran Penajaman Jawaban:</span>
                </span>
                <ul className="text-[11px] text-[#475569] dark:text-[#A4B1C7] space-y-1 list-disc pl-4">
                  {completeness.missingItems.slice(0, 2).map((m, i) => (
                    <li key={i}>
                      <strong className="text-[#0F172A] dark:text-[#F3F6FC]">{m.variableName}:</strong> {m.remediationAdvice}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </aside>
        )}

      </div>

    </div>
  );
};
