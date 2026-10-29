"use client";

import React, { useState, useRef, useEffect } from "react";
import { ProposalCategory } from "@/types/studio";
import { 
  Send, 
  Sparkles, 
  Bot, 
  Mic, 
  MicOff, 
  SlidersHorizontal,
  Clock,
  Bookmark,
  ArrowRight, 
  Copy, 
  Check,
  X,
  RotateCcw,
  Lightbulb,
  Layers,
  BookOpen,
  CheckCircle2,
  Building2,
  GraduationCap
} from "lucide-react";
import { aiFetch } from "@/lib/aiClient";
import { stripDoubleAsterisks } from "@/lib/textSanitizer";

/**
 * Helper untuk mem-parse teks inline dengan sintaks bold, menghapus asterisks literal '**'
 * dan merendernya sebagai elemen <strong> yang rapi.
 */
function renderFormattedInlineText(text: string) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+?\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const cleanBold = part.slice(2, -2).trim();
      return (
        <strong key={idx} className="font-semibold text-[#0F172A] dark:text-[#F3F6FC]">
          {cleanBold}
        </strong>
      );
    }
    const cleanPlain = part.replace(/\*\*/g, "");
    return <span key={idx}>{cleanPlain}</span>;
  });
}

/**
 * Komponen pemformat jawaban AI Konsultasi:
 * - Menghilangkan tanda '**' yang mengganggu
 * - Memformat nomor poin (1., 2., 3.) dengan lencana nomor terstruktur (01, 02)
 * - Memformat baris atribut (Kondisi:, Solusi:, Rekomendasi Judul:) dengan highlight rapi
 * - Menata paragraf dengan ritme baca dan tipografi modern
 */
function FormattedConsultationMessage({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let currentBullets: { key?: string; text: string; raw: string }[] = [];

  const flushBullets = (keyIdx: number) => {
    if (currentBullets.length > 0) {
      elements.push(
        <div key={`bullets-${keyIdx}`} className="my-2 space-y-2 pl-1 sm:pl-2">
          {currentBullets.map((b, bIdx) => (
            <div key={bIdx} className="flex items-start gap-2.5 text-xs sm:text-[13px] text-slate-700 dark:text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
              <div className="flex-1 leading-relaxed">
                {b.key ? (
                  <>
                    <strong className="font-semibold text-[#0F172A] dark:text-white">
                      {renderFormattedInlineText(b.key)}:{' '}
                    </strong>
                    <span>{renderFormattedInlineText(b.text)}</span>
                  </>
                ) : (
                  <span>{renderFormattedInlineText(b.raw)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      );
      currentBullets = [];
    }
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();

    if (!line) {
      flushBullets(idx);
      return;
    }

    // Cek bullet: "- ...", "* ...", "• ..."
    const bulletMatch = line.match(/^[-*•]\s+(.*)$/);
    if (bulletMatch) {
      const bulletBody = bulletMatch[1];
      const kvMatch = bulletBody.match(/^(\*\*?[^*:]+\*\*?):\s*(.*)$/);
      if (kvMatch) {
        currentBullets.push({
          key: kvMatch[1].replace(/\*/g, ""),
          text: kvMatch[2],
          raw: bulletBody
        });
      } else {
        currentBullets.push({
          text: bulletBody,
          raw: bulletBody
        });
      }
      return;
    }

    flushBullets(idx);

    // Cek butir bernomor: "1. ...", "2. ..."
    const numMatch = line.match(/^(\d+)[\.\)]\s+(.*)$/);
    if (numMatch) {
      const num = numMatch[1];
      const title = numMatch[2];
      elements.push(
        <div key={`num-${idx}`} className="mt-3.5 mb-1.5 flex items-start gap-2.5">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-blue-500/10 border border-blue-500/25 text-blue-600 dark:text-blue-400 font-mono text-[11px] font-bold flex-shrink-0 mt-0.5">
            {num.length === 1 ? `0${num}` : num}
          </span>
          <div className="font-semibold text-xs sm:text-sm text-[#0F172A] dark:text-[#F3F6FC] leading-snug">
            {renderFormattedInlineText(title)}
          </div>
        </div>
      );
      return;
    }

    // Cek baris penekanan rekomendasi judul atau solusi
    if (line.startsWith("👉") || line.toLowerCase().includes("rekomendasi judul") || line.toLowerCase().includes("rekomendasi formulasi")) {
      elements.push(
        <div key={`rec-${idx}`} className="my-2.5 p-3 sm:p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-[#0F172A] dark:text-white text-xs sm:text-sm font-medium flex items-start gap-2.5">
          <span className="text-blue-500 text-sm leading-none mt-0.5">💡</span>
          <div className="flex-1 leading-relaxed">
            {renderFormattedInlineText(line.replace(/^👉\s*/, ""))}
          </div>
        </div>
      );
      return;
    }

    // Paragraf umum
    elements.push(
      <p key={`p-${idx}`} className="leading-relaxed font-sans text-xs sm:text-[13px] text-slate-700 dark:text-zinc-300 mb-2">
        {renderFormattedInlineText(line)}
      </p>
    );
  });

  flushBullets(lines.length);

  return <div className="space-y-0.5">{elements}</div>;
}

export interface ConsultationCandidateTitle {
  id: string;
  title: string;
  category: ProposalCategory;
  entity: string;
  durationMonths: number;
  reasoning: string;
  researchGap: string;
  flowSteps?: string[];
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  candidateTitle?: ConsultationCandidateTitle | null;
  timestamp: string;
}

interface ConsultationStudioProps {
  category: ProposalCategory;
  setCategory: (c: ProposalCategory) => void;
  targetEntity: string;
  setTargetEntity: (e: string) => void;
  currentTitle: string;
  setTitle: (t: string) => void;
  durationMonths: number;
  setDurationMonths: (d: number) => void;
  onBackToHero: () => void;
  onProceedWithTitle: (title: string, entity: string, category: ProposalCategory, duration: number) => void;
}

const QUICK_PROMPT_CHIPS = [
  "Saya bingung mencari masalah nyata di instansi mitra",
  "Bantu cari research gap untuk topik yang saya minati",
  "Validasi apakah ide judul saya terlalu luas atau sempit",
  "Data bersifat rahasia, apa alternatif metode risetnya?"
];

export const ConsultationStudio: React.FC<ConsultationStudioProps> = ({
  category,
  setCategory,
  targetEntity,
  setTargetEntity,
  currentTitle,
  setTitle,
  durationMonths,
  setDurationMonths,
  onBackToHero,
  onProceedWithTitle
}) => {
  // Chat thread
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // Right Side Drawer State: "none" | "candidates" | "history" | "parameters"
  const [activeDrawer, setActiveDrawer] = useState<"none" | "candidates" | "history" | "parameters">("none");

  // Candidate Titles Scratchpad
  const [candidateTitles, setCandidateTitles] = useState<ConsultationCandidateTitle[]>([
    {
      id: "cand-default-1",
      title: currentTitle || "Analisis Efektivitas dan Optimasi Alur Layanan Terintegrasi",
      category: category,
      entity: targetEntity || "Instansi Mitra / Industri Terkait",
      durationMonths: durationMonths || 6,
      reasoning: "Judul berbasis penyelesaian hambatan operasional lapangan nyata dengan metodologi terukur.",
      researchGap: "Kesenjangan efisiensi alur konvensional dibanding pendekatan otomatisasi.",
      flowSteps: [
        "Fase 1: Observasi lapangan & identifikasi bottleneck",
        "Fase 2: Pengumpulan data empiris & kalibrasi instrumen",
        "Fase 3: Implementasi solusi atau intervensi perbaikan",
        "Fase 4: Evaluasi luaran & penyusunan laporan akhir"
      ]
    }
  ]);

  // Selected candidate title
  const [selectedTitleId, setSelectedTitleId] = useState<string>("cand-default-1");

  // Diagnostic Canvas Form State
  const [diagSymptom, setDiagSymptom] = useState("");
  const [diagRootCause, setDiagRootCause] = useState("");
  const [diagSolution, setDiagSolution] = useState("");
  const [isAnalyzingDiag, setIsAnalyzingDiag] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasChatted = messages.filter((m) => m.role === "user").length > 0;

  useEffect(() => {
    if (hasChatted) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, hasChatted]);

  const nowTimestamp = () => new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(stripDoubleAsterisks(text));
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2500);
  };

  // Voice speech-to-text
  const toggleSpeechRecognition = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Browser Anda belum mendukung input suara Web Speech API.");
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "id-ID";
    recognition.interimResults = false;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: nowTimestamp()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const res = await aiFetch("/api/academic/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "conversational",
          message: text,
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          context: {
            currentTitle,
            category,
            targetEntity
          }
        })
      });

      const data = await res.json();
      if (data.success && data.reply) {
        let newCandidate: ConsultationCandidateTitle | null = null;
        if (data.card && data.card.recommendedTitle) {
          newCandidate = {
            id: `cand-${Date.now()}`,
            title: data.card.recommendedTitle,
            category: data.card.category || category,
            entity: data.card.targetEntity || targetEntity || "Instansi Mitra",
            durationMonths: 6,
            reasoning: data.card.coreProblem || "Hasil perumusan bersama AI Mentor.",
            researchGap: data.card.proposedSolution || "Kesenjangan teoritis dan praktis yang diisi oleh usulan ini.",
            flowSteps: data.card.flowSteps || [
              "Fase 1: Identifikasi masalah & studi pendahuluan",
              "Fase 2: Perumusan instrumen data",
              "Fase 3: Implementasi intervensi / eksperimen",
              "Fase 4: Evaluasi luaran & pelaporan"
            ]
          };

          setCandidateTitles((prev) => [newCandidate!, ...prev]);
          setSelectedTitleId(newCandidate.id);
        }

        const assistantMsg: ChatMessage = {
          id: `ast-${Date.now()}`,
          role: "assistant",
          content: data.reply,
          candidateTitle: newCandidate,
          timestamp: nowTimestamp()
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error(data.error || "Gagal mendapatkan respon");
      }
    } catch (err: any) {
      console.warn("Consultation fetch fallback active:", err);
      const isMagang = category === "magang";
      const fallbackTitle = isMagang 
        ? `Optimasi Alur Kerja dan Evaluasi Efisiensi Berkelanjutan pada ${targetEntity || "Unit Operasional"}`
        : `Analisis Faktor Penentu dan Pemodelan Solusi Terukur dalam Mengatasi Masalah Lapangan`;

      const fallbackCandidate: ConsultationCandidateTitle = {
        id: `cand-fallback-${Date.now()}`,
        title: fallbackTitle,
        category: category,
        entity: targetEntity || "Instansi Mitra",
        durationMonths: durationMonths || 6,
        reasoning: "Diformulasikan berdasarkan First-Principles: fokus pada masalah nyata yang dirasakan instansi.",
        researchGap: "Belum adanya standarisasi alur dan pengukuran objektif efisiensi.",
        flowSteps: [
          "Fase 1: Observasi lapangan & wawancara pemangku kepentingan",
          "Fase 2: Desain instrumen & pengumpulan bukti empiris",
          "Fase 3: Pengujian solusi berbasis kaidah akademik baku",
          "Fase 4: Evaluasi luaran & validasi oleh mentor/pembimbing"
        ]
      };

      setCandidateTitles((prev) => [fallbackCandidate, ...prev]);
      setSelectedTitleId(fallbackCandidate.id);

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: "assistant",
        content: `Terima kasih telah berbagi konteks ini. 

Berdasarkan analisis akademik, kunci utama perumusan judul yang kuat adalah **menghindari sekadar mencatat tugas rutin**, melainkan **mengidentifikasi friksi, inefisiensi, atau kesenjangan (gap)** antara kondisi saat ini dengan kondisi ideal.

Saya telah merumuskan satu calon judul akademik:
👉 **"${fallbackTitle}"**

Silakan cek rincian alur kerja di panel Rak Calon Judul (ikon bookmark kanan), atau sampaikan masukan jika ingin menggeser fokus variabelnya.`,
        candidateTitle: fallbackCandidate,
        timestamp: nowTimestamp()
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Problem Diagnostic Canvas
  const handleAnalyzeDiagnostic = async () => {
    if (!diagSymptom.trim()) {
      alert("Harap tuliskan gejala masalah atau inefisiensi yang diamati di lapangan.");
      return;
    }
    setIsAnalyzingDiag(true);

    const promptText = `Saya melakukan analisis diagnostik masalah di ${targetEntity || "tempat magang/studi"}:
- Gejala Lapangan: "${diagSymptom}"
- Dugaan Akar Masalah: "${diagRootCause || "Belum diketahui pasti"}"
- Rencana Solusi: "${diagSolution || "Perlu saran intervensi yang tepat"}"

Tolong bedah masalah ini dan rumuskan judul proposal akademik yang tajam dan tidak klise!`;

    setActiveDrawer("none");
    await handleSendMessage(promptText);
    setIsAnalyzingDiag(false);
  };

  // Apply Candidate Title to Studio
  const handleApplyCandidate = (cand: ConsultationCandidateTitle) => {
    setTitle(cand.title);
    if (cand.entity) setTargetEntity(cand.entity);
    if (cand.category) setCategory(cand.category);
    if (cand.durationMonths) setDurationMonths(cand.durationMonths);
    onProceedWithTitle(cand.title, cand.entity, cand.category, cand.durationMonths);
  };

  const activeCandidate = candidateTitles.find((c) => c.id === selectedTitleId) || candidateTitles[0];

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex overflow-hidden bg-[#FAFCFF] dark:bg-[#09090b] text-[#0F172A] dark:text-[#F8FAFC]">
      
      {/* ========================================================================= */}
      {/* 1. MAIN EXPANSIVE CONSULTATION CANVAS                                     */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Mobile Action Bar (Top Right) */}
        <div className="md:hidden flex items-center justify-between px-4 py-2 border-b border-slate-200/80 dark:border-[#26282E] bg-white/70 dark:bg-[#121316]/70 backdrop-blur-sm z-20">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Klinik Bimbingan</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveDrawer(activeDrawer === "parameters" ? "none" : "parameters")}
              className={`p-2 rounded-lg text-xs transition-colors ${
                activeDrawer === "parameters"
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                  : "text-slate-500 hover:text-slate-900 dark:text-zinc-400"
              }`}
              title="Parameter Usulan"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setActiveDrawer(activeDrawer === "history" ? "none" : "history")}
              className={`p-2 rounded-lg text-xs transition-colors ${
                activeDrawer === "history"
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                  : "text-slate-500 hover:text-slate-900 dark:text-zinc-400"
              }`}
              title="Riwayat Sesi"
            >
              <Clock className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setActiveDrawer(activeDrawer === "candidates" ? "none" : "candidates")}
              className={`relative p-2 rounded-lg text-xs transition-colors ${
                activeDrawer === "candidates"
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                  : "text-slate-500 hover:text-slate-900 dark:text-zinc-400"
              }`}
              title="Rak Calon Judul"
            >
              <Bookmark className="w-4 h-4" />
              {candidateTitles.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600" />
              )}
            </button>
          </div>
        </div>

        {/* Scrollable Center View */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6 flex flex-col items-center">
          
          {/* STATE A: INITIAL HERO VIEW (Matches Reference Image Exactly) */}
          {!hasChatted ? (
            <div className="w-full max-w-3xl my-auto flex flex-col items-center text-center animate-in fade-in duration-300">
              
              {/* 3D AI Robot Mascot Image */}
              <div className="relative w-64 sm:w-80 md:w-96 max-w-full aspect-[710/425] flex items-center justify-center select-none pointer-events-none mb-3 sm:mb-5">
                <img
                  src="/consultation-mascot.png"
                  alt="AI Mentor Mascot"
                  className="w-full h-auto object-contain drop-shadow-lg transition-transform duration-500 hover:scale-105"
                  loading="eager"
                />
              </div>

              {/* Headline: Klinik Bimbingan & Konsultasi Ide */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#0F172A] dark:text-white font-sans mb-3">
                Klinik Bimbingan &amp; Konsultasi Ide
              </h1>

              {/* Status Badge: AI MENTOR AKTIF */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E6FBF2] dark:bg-emerald-950/50 border border-[#A7F3D0] dark:border-emerald-800 text-[#059669] dark:text-emerald-400 text-xs font-mono font-bold tracking-wider uppercase mb-3.5 shadow-2xs">
                AI MENTOR AKTIF
              </div>

              {/* Subtext */}
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-lg leading-relaxed mb-6 sm:mb-8 font-normal">
                Eksplorasi masalah lapangan, validasi kelayakan, dan penajaman judul proposal.
              </p>

              {/* Quick Prompt Chips */}
              <div className="w-full max-w-2xl flex flex-wrap items-center justify-center gap-2 mb-2">
                {QUICK_PROMPT_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(chip)}
                    className="px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-[#26282E] bg-white/90 dark:bg-[#121316] hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 text-xs text-slate-700 dark:text-zinc-300 font-medium transition-all shadow-2xs hover:scale-102 cursor-pointer active:scale-98"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* STATE B: ACTIVE CONVERSATION STREAM */
            <div className="w-full max-w-3xl space-y-4 pb-4">
              
              {/* Header Mini Pill with Reset option */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200/80 dark:border-[#26282E]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
                    <img src="/consultation-mascot.png" alt="Mascot" className="w-7 h-auto object-contain" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-none">
                      Klinik Bimbingan AI Mentor
                    </h3>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                      ● Sesi Dialog Aktif
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Mulai sesi konsultasi baru dari awal?")) {
                        setMessages([]);
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#26282E] bg-white dark:bg-[#121316] hover:bg-slate-50 text-[11px] font-medium text-slate-600 dark:text-zinc-300 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Sesi Baru</span>
                  </button>
                </div>
              </div>

              {/* Chat Message Stream */}
              {messages.map((msg) => {
                const isAssistant = msg.role === "assistant";

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 text-xs sm:text-sm leading-relaxed ${
                      isAssistant ? "justify-start" : "justify-end"
                    }`}
                  >
                    {isAssistant && (
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1 shadow-2xs">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div className={`max-w-[85%] sm:max-w-[80%] space-y-2 ${isAssistant ? "" : "items-end"}`}>
                      <div
                        className={`p-4 sm:p-5 rounded-2xl ${
                          isAssistant
                            ? "bg-white dark:bg-[#121316] border border-slate-200 dark:border-[#26282E] text-slate-900 dark:text-white shadow-xs"
                            : "bg-[#3B82F6] text-white font-medium ml-auto shadow-sm"
                        }`}
                      >
                        {isAssistant ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#26282E] pb-2 mb-2 text-[11px]">
                              <div className="flex items-center gap-1.5 font-medium text-blue-600 dark:text-blue-400">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Telaah AI Mentor Akademik</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopyMessage(msg.id, msg.content)}
                                className="flex items-center gap-1 text-[10.5px] font-mono text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 px-2 py-0.5 rounded transition-colors cursor-pointer"
                                title="Salin Tanggapan"
                              >
                                {copiedMessageId === msg.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-500" />
                                    <span className="text-emerald-500">Tersalin</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Salin</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <FormattedConsultationMessage content={msg.content} />
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap leading-relaxed font-sans text-xs sm:text-sm">
                            {stripDoubleAsterisks(msg.content)}
                          </div>
                        )}

                        {/* Candidate Title Card Embedded in Message */}
                        {msg.candidateTitle && (
                          <div className="mt-3.5 p-3.5 sm:p-4 rounded-xl border border-blue-500/30 bg-blue-50/70 dark:bg-blue-950/30 text-slate-900 dark:text-white space-y-2">
                            <div className="flex items-center justify-between text-[10px] font-mono">
                              <span className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                💡 REKOMENDASI FORMULASI JUDUL
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 font-semibold">
                                {msg.candidateTitle.category.toUpperCase()} • {msg.candidateTitle.durationMonths} BULAN
                              </span>
                            </div>

                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">
                              {msg.candidateTitle.title}
                            </h4>

                            <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                              <strong>Lokus/Instansi:</strong> {msg.candidateTitle.entity}
                            </p>

                            <div className="pt-2 flex items-center justify-between border-t border-blue-500/20 text-xs">
                              <span className="text-[10.5px] text-slate-500 dark:text-zinc-400 italic">
                                Tersimpan di Rak Calon Judul
                              </span>
                              <button
                                type="button"
                                onClick={() => handleApplyCandidate(msg.candidateTitle!)}
                                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                              >
                                <span>Terapkan ke Usulan</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="text-[10px] text-slate-400 px-1 font-mono">
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121316] border border-slate-200 dark:border-[#26282E] flex items-center gap-2.5 text-xs text-slate-600 dark:text-zinc-300 shadow-xs">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span>AI Mentor sedang membedah masalah &amp; merumuskan judul...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 2. FLOATING BOTTOM INPUT CARD (Matches Reference Image)                   */}
        {/* ========================================================================= */}
        <div className="w-full max-w-4xl mx-auto px-4 pb-4 sm:pb-6 pt-1 z-10 shrink-0">
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-[#26282E] bg-white dark:bg-[#121316] shadow-xl shadow-slate-200/40 dark:shadow-black/50 p-3 sm:p-4 transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
            
            {/* Input Row */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Voice Microphone Button */}
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse"
                    : "text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                }`}
                title={isListening ? "Mendengarkan suara..." : "Input dengan suara"}
              >
                {isListening ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>

              {/* Text Input / Textarea */}
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Tuliskan pertanyaan atau ide yang ingin Anda konsultasikan..."
                className="w-full bg-transparent text-xs sm:text-sm text-[#0F172A] dark:text-[#F3F6FC] placeholder:text-slate-400 outline-none resize-none px-2 py-1.5 font-sans leading-relaxed max-h-28"
              />

              {/* Primary Blue "Kirim" Button with Paper Airplane */}
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputText.trim()}
                className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#3B82F6] hover:bg-[#2563EB] active:scale-95 text-white text-xs sm:text-sm font-semibold disabled:opacity-40 transition-all cursor-pointer shadow-sm flex items-center gap-2 shrink-0"
              >
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Kirim</span>
              </button>
            </div>

            {/* Bottom Caption Row */}
            <div className="flex items-center justify-between text-[10.5px] sm:text-xs text-slate-400 mt-2 px-1 font-sans">
              <span className="hidden sm:inline">Shift + Enter untuk baris baru</span>
              <span className="sm:hidden">Enter untuk kirim</span>
              <span>Didukung Model Penalaran Akademik Gemini 3.5</span>
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 3. RIGHT VERTICAL ACTION RAIL (Matches Reference Image)                   */}
      {/* ========================================================================= */}
      <aside className="hidden md:flex flex-col items-center justify-start gap-5 py-6 px-3 border-l border-slate-200/80 dark:border-[#26282E] bg-white dark:bg-[#121316] select-none z-20 shrink-0">
        
        {/* Button 1: Parameter & Diagnostic Canvas (SlidersHorizontal) */}
        <button
          type="button"
          onClick={() => setActiveDrawer(activeDrawer === "parameters" ? "none" : "parameters")}
          className={`relative p-2.5 rounded-xl transition-all cursor-pointer group ${
            activeDrawer === "parameters"
              ? "text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400"
              : "text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E1F24]"
          }`}
          title="Parameter & Diagnostik Usulan"
        >
          {activeDrawer === "parameters" && (
            <span className="absolute -left-3 top-2.5 bottom-2.5 w-1 bg-blue-600 rounded-r-full" />
          )}
          <SlidersHorizontal className="w-5 h-5 stroke-[2.2]" />
          <div className="absolute right-12 px-2.5 py-1.5 rounded-lg bg-[#0F172A] text-white text-[11px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg z-50">
            Parameter &amp; Diagnostik
          </div>
        </button>

        {/* Button 2: Riwayat Sesi Konsultasi (Clock) */}
        <button
          type="button"
          onClick={() => setActiveDrawer(activeDrawer === "history" ? "none" : "history")}
          className={`relative p-2.5 rounded-xl transition-all cursor-pointer group ${
            activeDrawer === "history"
              ? "text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400"
              : "text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E1F24]"
          }`}
          title="Riwayat Percakapan"
        >
          {activeDrawer === "history" && (
            <span className="absolute -left-3 top-2.5 bottom-2.5 w-1 bg-blue-600 rounded-r-full" />
          )}
          <Clock className="w-5 h-5 stroke-[2.2]" />
          <div className="absolute right-12 px-2.5 py-1.5 rounded-lg bg-[#0F172A] text-white text-[11px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg z-50">
            Riwayat Sesi
          </div>
        </button>

        {/* Button 3: Rak Calon Judul (Bookmark) */}
        <button
          type="button"
          onClick={() => setActiveDrawer(activeDrawer === "candidates" ? "none" : "candidates")}
          className={`relative p-2.5 rounded-xl transition-all cursor-pointer group ${
            activeDrawer === "candidates"
              ? "text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400"
              : "text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E1F24]"
          }`}
          title="Rak Calon Judul Terpilih"
        >
          {activeDrawer === "candidates" && (
            <span className="absolute -left-3 top-2.5 bottom-2.5 w-1 bg-blue-600 rounded-r-full" />
          )}
          <Bookmark className="w-5 h-5 stroke-[2.2]" />
          {candidateTitles.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
          )}
          <div className="absolute right-12 px-2.5 py-1.5 rounded-lg bg-[#0F172A] text-white text-[11px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg z-50">
            Rak Calon Judul ({candidateTitles.length})
          </div>
        </button>
      </aside>

      {/* ========================================================================= */}
      {/* 4. SLIDE-OUT DRAWER PANEL (When Rail Button Clicked)                      */}
      {/* ========================================================================= */}
      {activeDrawer !== "none" && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white dark:bg-[#121316] border-l border-slate-200 dark:border-[#26282E] shadow-2xl z-40 flex flex-col h-full animate-in slide-in-from-right duration-200">
          
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-[#26282E] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {activeDrawer === "candidates" && "Rak Calon Judul"}
                {activeDrawer === "parameters" && "Parameter & Diagnostik"}
                {activeDrawer === "history" && "Riwayat Sesi Bimbingan"}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                {activeDrawer === "candidates" && "Formulasi judul yang siap diterapkan ke usulan"}
                {activeDrawer === "parameters" && "Atur kategori usulan dan bedah masalah riil"}
                {activeDrawer === "history" && "Pertanyaan dan analisis dalam sesi ini"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveDrawer("none")}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E1F24] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            
            {/* TAB 1: RAK CALON JUDUL */}
            {activeDrawer === "candidates" && (
              <div className="space-y-3.5">
                {candidateTitles.map((cand) => {
                  const isSelected = cand.id === selectedTitleId;

                  return (
                    <div
                      key={cand.id}
                      onClick={() => setSelectedTitleId(cand.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative shadow-xs ${
                        isSelected
                          ? "bg-blue-50/60 dark:bg-blue-950/20 border-blue-500 ring-2 ring-blue-500/20"
                          : "bg-white dark:bg-[#17181C] border-slate-200 dark:border-[#26282E] hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">
                          {cand.category} • {cand.durationMonths} BULAN
                        </span>
                        {isSelected && (
                          <span className="flex items-center gap-1 text-[10.5px] font-semibold text-blue-600 dark:text-blue-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Terpilih</span>
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug mb-2">
                        {cand.title}
                      </h4>

                      <div className="text-[11px] text-slate-500 dark:text-zinc-400 space-y-1 mb-3">
                        <div><strong>Lokus:</strong> {cand.entity}</div>
                        <div><strong>Research Gap:</strong> {cand.researchGap}</div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyCandidate(cand);
                        }}
                        className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <span>Gunakan Judul Ini ke Usulan</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 2: PARAMETER & DIAGNOSTIK */}
            {activeDrawer === "parameters" && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Kategori Usulan
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["magang", "skripsi", "tesis"] as ProposalCategory[]).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`py-2 px-3 rounded-xl border text-center font-medium capitalize transition-all cursor-pointer ${
                          category === cat
                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                            : "bg-white dark:bg-[#17181C] border-slate-200 dark:border-[#26282E] text-slate-700 dark:text-zinc-300 hover:bg-slate-50"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Lokus / Instansi Mitra
                  </label>
                  <input
                    type="text"
                    value={targetEntity}
                    onChange={(e) => setTargetEntity(e.target.value)}
                    placeholder="Contoh: PT Telkom Indonesia, Rumah Sakit X"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#26282E] bg-white dark:bg-[#17181C] text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Target Durasi (Bulan)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(Number(e.target.value) || 6)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#26282E] bg-white dark:bg-[#17181C] text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-[#26282E] space-y-3">
                  <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold">
                    <Layers className="w-4 h-4 text-blue-500" />
                    <span>Kanvas Diagnostik Masalah</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                      Gejala Hambatan di Lapangan
                    </label>
                    <textarea
                      rows={2}
                      value={diagSymptom}
                      onChange={(e) => setDiagSymptom(e.target.value)}
                      placeholder="Apa masalah nyata yang dirasakan instansi?"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#26282E] bg-white dark:bg-[#17181C] text-slate-900 dark:text-white outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                      Dugaan Penyebab Pokok
                    </label>
                    <textarea
                      rows={2}
                      value={diagRootCause}
                      onChange={(e) => setDiagRootCause(e.target.value)}
                      placeholder="Mengapa hambatan tersebut bisa terjadi?"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#26282E] bg-white dark:bg-[#17181C] text-slate-900 dark:text-white outline-none resize-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAnalyzeDiagnostic}
                    disabled={isAnalyzingDiag || !diagSymptom.trim()}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Bedah Masalah &amp; Rumuskan Judul</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: RIWAYAT SESI */}
            {activeDrawer === "history" && (
              <div className="space-y-3 text-xs">
                {messages.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    Belum ada percakapan dalam sesi ini.
                  </div>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-[#26282E] bg-white dark:bg-[#17181C] space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span className="font-bold text-slate-700 dark:text-zinc-300 capitalize">{m.role}</span>
                        <span>{m.timestamp}</span>
                      </div>
                      <p className="line-clamp-3 text-slate-600 dark:text-zinc-400">
                        {stripDoubleAsterisks(m.content)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationStudio;
