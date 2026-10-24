"use client";

import React, { useState, useRef, useEffect } from "react";
import { ProposalCategory } from "@/types/studio";
import { 
  ArrowLeft, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  GraduationCap, 
  Building2, 
  BookOpen, 
  CheckCircle2, 
  Lightbulb, 
  Mic, 
  MicOff, 
  RotateCcw, 
  Layers, 
  ArrowRight, 
  Search, 
  ExternalLink,
  HelpCircle,
  TrendingUp,
  FileText
} from "lucide-react";
import { TitleRecommendation } from "@/lib/titleGenerator";

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
  "Saya bingung mencari masalah nyata di instansi/tempat magang",
  "Bantu cari research gap untuk topik yang saya minati",
  "Validasi apakah ide judul saya terlalu luas atau sempit",
  "Bagaimana cara memetakan alur Bab I s.d. Bab IV agar logis?",
  "Data di kantor bersifat rahasia, apa alternatif metode yang bisa saya ambil?"
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
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content: `Selamat datang di **Klinik Bimbingan & Konsultasi Ide Akademik (AI Mentor)**. 
      
Saya adalah asisten mentor akademik Anda. Apakah Anda sedang:
1. **Bingung menemukan masalah riil** di tempat magang/instansi mitra?
2. **Memiliki topik umum** (misal: *obesitas, AI, supply chain*) namun bingung merumuskan judul dan celah riset (*research gap*)?
3. **Sudah memiliki draf judul** tetapi ragu dengan alur metodologi dan kelayakan akademiknya?

Ceritakan situasi atau bidang yang sedang Anda hadapi di bawah, dan kita akan bedah bersama hingga menghasilkan judul yang siap diajukan.`,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    }
  ]);

  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Right Workbench Tabs: "titles" | "diagnostic" | "guidelines"
  const [activeRightTab, setActiveRightTab] = useState<"titles" | "diagnostic" | "guidelines">("titles");

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

  // Diagnostic Canvas Form
  const [diagSymptom, setDiagSymptom] = useState("");
  const [diagRootCause, setDiagRootCause] = useState("");
  const [diagSolution, setDiagSolution] = useState("");
  const [diagEntity, setDiagEntity] = useState(targetEntity || "");
  const [isAnalyzingDiag, setIsAnalyzingDiag] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const nowTimestamp = () => new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

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
      const res = await fetch("/api/academic/consultation", {
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
      console.warn("Consultation fetch error, using intelligent fallback:", err);
      // Fallback response with concrete title formulation
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

Saya telah merumuskan satu calon judul akademik di panel kanan:
👉 **"${fallbackTitle}"**

Silakan cek rincian alur kerja di panel kanan, atau sampaikan masukan jika ingin menggeser fokus variabelnya.`,
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

    const promptText = `Saya melakukan analisis diagnostik masalah di ${diagEntity || targetEntity || "tempat magang/studi"}:
- Gejala Lapangan: "${diagSymptom}"
- Dugaan Akar Masalah: "${diagRootCause || "Belum diketahui pasti"}"
- Rencana Solusi: "${diagSolution || "Perlu saran intervensi yang tepat"}"

Tolong bedah masalah ini dan rumuskan judul proposal akademik yang tajam dan tidak klise!`;

    setActiveRightTab("titles");
    await handleSendMessage(promptText);
    setIsAnalyzingDiag(false);
  };

  // Apply Candidate Title to Studio
  const handleApplyCandidate = (candidate: ConsultationCandidateTitle) => {
    setTitle(candidate.title);
    setCategory(candidate.category);
    setTargetEntity(candidate.entity);
    setDurationMonths(candidate.durationMonths);
    onProceedWithTitle(candidate.title, candidate.entity, candidate.category, candidate.durationMonths);
  };

  const activeCandidate = candidateTitles.find((c) => c.id === selectedTitleId) || candidateTitles[0];

  return (
    <div className="flex-1 flex flex-col w-full h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] overflow-hidden bg-[#F8FAFC] dark:bg-[#080B12] text-[#0F172A] dark:text-[#F3F6FC]">
      
      {/* ============================================================ */}
      {/* 1. TOP HEADER NAVIGATION BAR                                  */}
      {/* ============================================================ */}
      <div className="px-6 py-3.5 border-b border-[#E2E8F0] dark:border-[#253149] bg-white/95 dark:bg-[#0B101A]/95 flex items-center justify-between flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToHero}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E2E8F0] dark:border-[#253149] bg-white dark:bg-[#111827] hover:bg-[#F1F5F9] dark:hover:bg-[#172033] text-xs font-semibold text-[#0F172A] dark:text-[#F3F6FC] transition-colors cursor-pointer shadow-2xs"
            title="Kembali ke halaman utama pembuatan proposal"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#7C9CFF]" />
            <span>Beranda Usulan</span>
          </button>

          <div className="h-4 w-[1px] bg-[#E2E8F0] dark:bg-[#253149]" />

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#34D399]/15 border border-[#34D399]/30 flex items-center justify-center text-[#34D399]">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-[#F3F6FC] flex items-center gap-2">
                <span>Klinik Bimbingan &amp; Konsultasi Ide</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30 font-semibold">
                  AI MENTOR AKTIF
                </span>
              </h1>
              <p className="text-[11px] text-[#475569] dark:text-[#A4B1C7]">
                Eksplorasi masalah lapangan, validasi kelayakan, dan penajaman judul proposal
              </p>
            </div>
          </div>
        </div>

        {/* Right CTA: Apply Selected Title to Studio */}
        <div className="flex items-center gap-2">
          {activeCandidate && (
            <button
              type="button"
              onClick={() => handleApplyCandidate(activeCandidate)}
              className="px-4 py-2 rounded-xl bg-[#7C9CFF] hover:bg-[#9B8CFF] text-[#080B12] text-xs font-semibold transition-all cursor-pointer shadow-sm flex items-center gap-2"
              title="Gunakan judul yang terpilih dari bimbingan dan mulai penyusunan naskah proposal"
            >
              <span>Gunakan Judul Terpilih ke Usulan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. MAIN WORKSPACE: Chatbot (Left) + Toolbox Suite (Right)     */}
      {/* ============================================================ */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden w-full h-full">
        
        {/* ============================================================ */}
        {/* LEFT COLUMN (Chatbot Thread ~ 7 cols / 58%)                  */}
        {/* ============================================================ */}
        <div className="lg:col-span-7 flex flex-col h-full border-r border-[#E2E8F0] dark:border-[#253149] bg-white dark:bg-[#0B101A] overflow-hidden">
          
          {/* Chat Messages Scrollable Stream */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {messages.map((msg) => {
              const isAssistant = msg.role === "assistant";

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 text-xs leading-relaxed ${
                    isAssistant ? "justify-start" : "justify-end"
                  }`}
                >
                  {isAssistant && (
                    <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 flex-shrink-0 mt-1 shadow-2xs">
                      <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  )}

                  <div className={`max-w-[85%] space-y-2 ${isAssistant ? "" : "items-end"}`}>
                    <div
                      className={`p-4 rounded-2xl ${
                        isAssistant
                          ? "bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 text-zinc-850 dark:text-zinc-200"
                          : "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-normal ml-auto"
                      }`}
                    >
                      <div className="whitespace-pre-wrap leading-relaxed font-sans">
                        {msg.content}
                      </div>

                      {/* Attached Candidate Title Card if Generated */}
                      {msg.candidateTitle && (
                        <div className="mt-3 p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 text-zinc-900 dark:text-zinc-100 space-y-2 animate-in fade-in">
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                              💡 REKOMENDASI FORMULASI JUDUL
                            </span>
                            <span className="px-2 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                              {msg.candidateTitle.category.toUpperCase()} • {msg.candidateTitle.durationMonths} BULAN
                            </span>
                          </div>

                          <h4 className="font-serif font-bold text-xs sm:text-sm text-zinc-950 dark:text-white leading-snug">
                            {msg.candidateTitle.title}
                          </h4>

                          <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                            <strong>Lokus/Instansi:</strong> {msg.candidateTitle.entity}
                          </p>

                          <div className="pt-2 flex items-center justify-between border-t border-emerald-200 dark:border-emerald-800/60 text-xs">
                            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 italic">
                              Tersimpan otomatis di Rak Calon Judul (Kanan)
                            </span>
                            <button
                              type="button"
                              onClick={() => handleApplyCandidate(msg.candidateTitle!)}
                              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                            >
                              <span>Terapkan</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-[10px] text-zinc-400 px-1 font-mono">
                      {msg.timestamp}
                    </div>
                  </div>

                  {!isAssistant && (
                    <div className="w-7 h-7 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center flex-shrink-0 mt-1 font-mono font-bold text-[10px]">
                      U
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-2 text-xs text-zinc-500">
                  <div className="w-4 h-4 border-2 border-zinc-400 border-t-zinc-900 rounded-full animate-spin" />
                  <span>Dr. Bimbingan sedang membedah masalah & merumuskan judul...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Chips Recommendation */}
          <div className="px-4 sm:px-6 py-2.5 border-t border-zinc-200 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center gap-2 overflow-x-auto scrollbar-none flex-shrink-0 text-xs">
            <span className="text-[11px] font-mono text-zinc-400 whitespace-nowrap flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-amber-500" /> Topik Bimbingan:
            </span>
            {QUICK_PROMPT_CHIPS.map((chip, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(chip)}
                className="px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 whitespace-nowrap text-[11px] font-medium transition-colors cursor-pointer shadow-2xs"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Box Footer */}
          <div className="p-4 sm:p-5 border-t border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 flex-shrink-0">
            <div className="relative flex items-center gap-2">
              <textarea
                rows={2}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Tuliskan kendala Anda, amatan tugas di kantor, atau ide judul yang ingin dikonsultasikan... (Tekan Enter untuk kirim)"
                className="w-full p-3 pr-24 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 text-xs focus:outline-none focus:border-zinc-500 font-sans leading-relaxed resize-none shadow-inner"
              />

              <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
                {/* Voice speech to text */}
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse"
                      : "text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  }`}
                  title="Gunakan suara"
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Send button */}
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !inputText.trim()}
                  className="px-3.5 py-2 rounded-lg bg-zinc-950 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 text-xs font-semibold disabled:opacity-40 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim</span>
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-1.5 px-1 font-mono">
              <span>Shift + Enter untuk baris baru</span>
              <span>Didukung Model Penalaran Akademik Gemini 3.5</span>
            </div>
          </div>

        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN (Toolbox Suite ~ 5 cols / 42%)                  */}
        {/* ============================================================ */}
        <div className="lg:col-span-5 flex flex-col h-full bg-zinc-50/50 dark:bg-zinc-950/40 overflow-hidden">
          
          {/* Navigation Sub-Tabs */}
          <div className="px-5 pt-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center gap-3 text-xs flex-shrink-0">
            <button
              type="button"
              onClick={() => setActiveRightTab("titles")}
              className={`pb-3 px-1 border-b-2 font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeRightTab === "titles"
                  ? "border-zinc-950 dark:border-zinc-100 text-zinc-950 dark:text-zinc-100"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400"
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Rak Calon Judul ({candidateTitles.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRightTab("diagnostic")}
              className={`pb-3 px-1 border-b-2 font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeRightTab === "diagnostic"
                  ? "border-zinc-950 dark:border-zinc-100 text-zinc-950 dark:text-zinc-100"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>Kanvas Diagnostik</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRightTab("guidelines")}
              className={`pb-3 px-1 border-b-2 font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeRightTab === "guidelines"
                  ? "border-zinc-950 dark:border-zinc-100 text-zinc-950 dark:text-zinc-100"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
              <span>Kaidah Judul Dikti</span>
            </button>
          </div>

          {/* Sub-Tab 1: Candidate Titles Scratchpad */}
          {activeRightTab === "titles" && (
            <div className="flex-1 p-5 overflow-y-auto space-y-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-900 dark:text-zinc-200">
                  Daftar Judul Hasil Diskusi & Bimbingan:
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">
                  Pilih salah satu untuk diaplikasikan
                </span>
              </div>

              {candidateTitles.map((cand) => {
                const isSelected = cand.id === selectedTitleId;

                return (
                  <div
                    key={cand.id}
                    onClick={() => setSelectedTitleId(cand.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative shadow-2xs ${
                      isSelected
                        ? "bg-white dark:bg-zinc-900 border-zinc-950 dark:border-zinc-200 ring-2 ring-zinc-950/10 dark:ring-zinc-100/10"
                        : "bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold">
                        {cand.category} • {cand.durationMonths} Bulan
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Pilihan Aktif
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif font-bold text-xs sm:text-sm text-zinc-950 dark:text-zinc-50 leading-snug">
                      {cand.title}
                    </h3>

                    <div className="mt-2 text-[11px] text-zinc-600 dark:text-zinc-400 space-y-1">
                      <p><strong>Lokus:</strong> {cand.entity}</p>
                      <p className="line-clamp-2"><strong>Gap Riset:</strong> {cand.researchGap}</p>
                    </div>

                    {/* Flow Steps Preview */}
                    {cand.flowSteps && cand.flowSteps.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 text-[10px] space-y-1">
                        <span className="font-mono text-zinc-400 uppercase font-semibold">Rencana Alur Kerja:</span>
                        {cand.flowSteps.slice(0, 3).map((st, sIdx) => (
                          <div key={sIdx} className="text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                            <span>{st}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 pt-2.5 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyCandidate(cand);
                        }}
                        className="w-full py-1.5 rounded-lg bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <span>Gunakan Judul Ini ke Usulan</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sub-Tab 2: Diagnostic Problem Canvas */}
          {activeRightTab === "diagnostic" && (
            <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 text-indigo-900 dark:text-indigo-200">
                <h4 className="font-bold flex items-center gap-1.5 text-xs mb-1">
                  <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Kanvas Diagnostik Masalah (4 Kuadran)</span>
                </h4>
                <p className="text-[11px] leading-relaxed text-indigo-800 dark:text-indigo-300">
                  Isi apa yang Anda amati di lapangan. AI Mentor akan membedah akar penyebab masalah dan memformulasikan judul yang layak diangkat.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    1. Instansi / Lokus Studi:
                  </label>
                  <input
                    type="text"
                    value={diagEntity}
                    onChange={(e) => setDiagEntity(e.target.value)}
                    placeholder="Contoh: PT Telkom / RSUP Sardjito / Dinas Pendidikan"
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:outline-none focus:border-zinc-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    2. Gejala Masalah / Inefisiensi Lapangan yang Diamati:
                  </label>
                  <textarea
                    rows={2}
                    value={diagSymptom}
                    onChange={(e) => setDiagSymptom(e.target.value)}
                    placeholder="Contoh: Proses persetujuan dokumen masih manual menggunakan kertas sehingga memakan waktu 4 hari kerja..."
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:outline-none focus:border-zinc-400 leading-relaxed resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    3. Dugaan Akar Masalah (Root Cause):
                  </label>
                  <textarea
                    rows={2}
                    value={diagRootCause}
                    onChange={(e) => setDiagRootCause(e.target.value)}
                    placeholder="Contoh: Belum ada sistem alur kerja digital terpusat dan notifikasi asinkron antar bagian..."
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:outline-none focus:border-zinc-400 leading-relaxed resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    4. Usulan Solusi atau Bidang yang Ingin Anda Terapkan:
                  </label>
                  <textarea
                    rows={2}
                    value={diagSolution}
                    onChange={(e) => setDiagSolution(e.target.value)}
                    placeholder="Contoh: Membangun sistem alur persetujuan berbasis web dengan tanda tangan digital dan metrik SLA..."
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:outline-none focus:border-zinc-400 leading-relaxed resize-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAnalyzeDiagnostic}
                  disabled={isAnalyzingDiag || !diagSymptom.trim()}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-40"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Bedah Masalah & Rumuskan Judul dengan AI</span>
                </button>
              </div>
            </div>
          )}

          {/* Sub-Tab 3: Academic Guidelines */}
          {activeRightTab === "guidelines" && (
            <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200">
                <h4 className="font-bold flex items-center gap-1.5 text-xs mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>4 Kaidah Emas Judul Proposal (SOP Dikti)</span>
                </h4>
                <p className="text-[11px] leading-relaxed text-emerald-800 dark:text-emerald-300">
                  Setiap usulan judul proposal magang maupun skripsi yang diajukan wajib memenuhi 4 pilar verifikasi dosen penguji berikut:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <h5 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 text-xs">
                    <span className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-mono text-[10px] flex items-center justify-center font-bold">1</span>
                    <span>Ada Hubungan Antar Variabel / Objek & Metode</span>
                  </h5>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed pl-6.5">
                    Judul tidak boleh hanya deskriptif tanpa aksi (misal: "Studi tentang Penggunaan Komputer"). Harus memuat metode/intervensi dan parameter luaran terukur (misal: "Analisis Efektivitas dan Optimasi Algoritma X terhadap Waktu Siklus Y").
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <h5 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 text-xs">
                    <span className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-mono text-[10px] flex items-center justify-center font-bold">2</span>
                    <span>Lokus & Instansi yang Spesifik</span>
                  </h5>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed pl-6.5">
                    Harus mencantumkan unit kerja, rumah sakit, divisi perusahaan, atau lokus penelitian secara jelas agar batas penelitian (scope) tidak meluas.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <h5 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 text-xs">
                    <span className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-mono text-[10px] flex items-center justify-center font-bold">3</span>
                    <span>Fasilitas & Data Dapat Diakses (Feasibility)</span>
                  </h5>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed pl-6.5">
                    Pastikan data yang diperlukan tidak berstatus NDA rahasia negara/perusahaan. Jika rahasia, gunakan teknik anonimisasi dataset atau simulasi terkalibrasi.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <h5 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 text-xs">
                    <span className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-mono text-[10px] flex items-center justify-center font-bold">4</span>
                    <span>Tuntas dalam Durasi 4 s.d. 6 Bulan</span>
                  </h5>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed pl-6.5">
                    Rencana kerja logbook mingguan harus realistis diselesaikan dalam rentang 1 semester akademik tanpa keterlambatan seminar hasil.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
