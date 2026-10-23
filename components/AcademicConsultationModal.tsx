"use client";

import React, { useState, useRef, useEffect } from "react";
import { ProposalCategory } from "@/types/studio";
import { 
  X, 
  Sparkles, 
  GraduationCap, 
  Send, 
  MessageSquare, 
  Compass, 
  Lightbulb, 
  CheckCircle2, 
  ArrowRight, 
  Bot, 
  Building2, 
  Briefcase, 
  HelpCircle,
  RotateCcw,
  BookOpen,
  Check,
  AlertCircle,
  FileCheck2
} from "lucide-react";

export interface ConsultationCardData {
  recommendedTitle: string;
  targetEntity: string;
  coreProblem: string;
  proposedSolution: string;
  flowSteps: string[];
  category: ProposalCategory;
}

interface AcademicConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: ProposalCategory;
  initialTargetEntity?: string;
  onApplyProposal: (title: string, targetEntity: string, category: ProposalCategory) => void;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  card?: ConsultationCardData | null;
  timestamp: string;
}

const QUICK_PROMPTS = [
  "Tugas saya di kantor cuma rekap Excel dan arsip, masalah apa yang bisa saya angkat?",
  "Saya magang di divisi marketing, bagaimana membuat judul yang tidak sekadar deskriptif?",
  "Dosen minta metode yang jelas, tapi data di instansi sangat rahasia, bagaimana solusinya?",
  "Bagaimana cara memetakan alur kerja agar proposal skripsi/magang saya logis dari Bab I s.d. Bab IV?"
];

export const AcademicConsultationModal: React.FC<AcademicConsultationModalProps> = ({
  isOpen,
  onClose,
  initialCategory = "magang",
  initialTargetEntity = "",
  onApplyProposal
}) => {
  const [activeTab, setActiveTab] = useState<"discover" | "sharpen" | "chat">("discover");
  
  // Tab 1: Discover Form
  const [discoverEntity, setDiscoverEntity] = useState(initialTargetEntity || "");
  const [discoverMajor, setDiscoverMajor] = useState("Informatika / Sains Data / Manajemen");
  const [discoverDuties, setDiscoverDuties] = useState("");
  const [discoverCategory, setDiscoverCategory] = useState<ProposalCategory>(initialCategory);

  // Tab 2: Sharpen Form
  const [rawIdea, setRawIdea] = useState("");
  const [sharpenEntity, setSharpenEntity] = useState(initialTargetEntity || "");
  const [sharpenMajor, setSharpenMajor] = useState("Program Studi Terkait");
  const [sharpenCategory, setSharpenCategory] = useState<ProposalCategory>(initialCategory);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeCard, setActiveCard] = useState<ConsultationCardData | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialTargetEntity) {
      setDiscoverEntity(initialTargetEntity);
      setSharpenEntity(initialTargetEntity);
    }
  }, [initialTargetEntity]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const nowTimestamp = () => new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  // Handle Submit Tab 1: Discover Problem
  const handleDiscoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discoverEntity.trim()) {
      alert("Harap sebutkan nama tempat magang / instansi Anda.");
      return;
    }

    setIsLoading(true);
    setActiveTab("chat");

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: `Halo Dr. Bimbingan, saya sedang ${discoverCategory === 'magang' ? 'magang' : 'melakukan penelitian'} di ${discoverEntity} (Jurusan: ${discoverMajor}). Saya bingung menemukan masalah apa yang bisa saya angkat. Catatan observasi/tugas saya saat ini: "${discoverDuties || 'Belum ada tugas spesifik, baru orientasi umum'}". Mohon bantuannya untuk menemukan celah masalah dan rekomendasi judul yang tepat.`,
      timestamp: nowTimestamp()
    };

    setMessages([userMsg]);

    try {
      const res = await fetch("/api/academic/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "discover_problem",
          fieldDetails: {
            targetEntity: discoverEntity,
            major: discoverMajor,
            currentDuties: discoverDuties,
            category: discoverCategory
          }
        })
      });

      const data = await res.json();
      if (data.success && data.reply) {
        const assistantMsg: ChatMessage = {
          id: `ast-${Date.now()}`,
          role: "assistant",
          content: data.reply,
          card: data.card,
          timestamp: nowTimestamp()
        };
        setMessages(prev => [...prev, assistantMsg]);
        if (data.card) {
          setActiveCard(data.card);
        }
      } else {
        throw new Error(data.message || "Gagal mendapatkan saran");
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `ast-${Date.now()}`,
          role: "assistant",
          content: `Terjadi kendala saat menghubungkan ke sesi konsultasi: ${err.message}. Silakan ketikkan pertanyaan Anda langsung pada kolom obrolan di bawah.`,
          timestamp: nowTimestamp()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Submit Tab 2: Sharpen Idea & Flow
  const handleSharpenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawIdea.trim()) {
      alert("Harap tuliskan judul kasar atau ide awal yang Anda miliki.");
      return;
    }

    setIsLoading(true);
    setActiveTab("chat");

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: `Halo Dr. Bimbingan, saya punya ide judul: "${rawIdea}" di ${sharpenEntity || 'instansi tujuan'}. Tapi saya masih bingung dengan alur metodologi dan urutan langkah pelaksanaannya. Mohon dibedah dan disusunkan alur kerja yang runtut.`,
      timestamp: nowTimestamp()
    };

    setMessages([userMsg]);

    try {
      const res = await fetch("/api/academic/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "sharpen_flow",
          fieldDetails: {
            targetEntity: sharpenEntity,
            major: sharpenMajor,
            rawIdea: rawIdea,
            category: sharpenCategory
          }
        })
      });

      const data = await res.json();
      if (data.success && data.reply) {
        const assistantMsg: ChatMessage = {
          id: `ast-${Date.now()}`,
          role: "assistant",
          content: data.reply,
          card: data.card,
          timestamp: nowTimestamp()
        };
        setMessages(prev => [...prev, assistantMsg]);
        if (data.card) {
          setActiveCard(data.card);
        }
      } else {
        throw new Error(data.message || "Gagal memproses alur judul");
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `ast-${Date.now()}`,
          role: "assistant",
          content: `Maaf, kendala jaringan: ${err.message}. Silakan sampaikan pertanyaan Anda di kolom chat.`,
          timestamp: nowTimestamp()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Send Chat
  const handleSendChat = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: nowTimestamp()
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/academic/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "interactive_chat",
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          userQuery: text,
          fieldDetails: {
            targetEntity: discoverEntity || sharpenEntity || initialTargetEntity,
            category: discoverCategory || sharpenCategory
          }
        })
      });

      const data = await res.json();
      if (data.success && data.reply) {
        const assistantMsg: ChatMessage = {
          id: `ast-${Date.now()}`,
          role: "assistant",
          content: data.reply,
          card: data.card,
          timestamp: nowTimestamp()
        };
        setMessages(prev => [...prev, assistantMsg]);
        if (data.card) {
          setActiveCard(data.card);
        }
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `ast-${Date.now()}`,
          role: "assistant",
          content: "Mohon maaf, terjadi gangguan koneksi. Boleh diulang pertanyaan Anda?",
          timestamp: nowTimestamp()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Action: Apply Card to Proposal
  const handleApplyCard = (card: ConsultationCardData) => {
    onApplyProposal(card.recommendedTitle, card.targetEntity, card.category);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[92vh] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-900 dark:text-zinc-100"
        role="dialog"
        aria-modal="true"
      >
        
        {/* Header Modal */}
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-850 flex items-center justify-between shrink-0 bg-zinc-50/70 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                  Klinik Bimbingan & Konsultasi Ide (AI Mentor)
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Dr. Bimbingan Aktif
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Temukan akar masalah di tempat magang, tajamkan rumusan judul, dan rancang alur metodologi step-by-step.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 shrink-0 overflow-x-auto text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("discover")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "discover"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black font-semibold shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>1. Temukan Masalah di Tempat Magang</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sharpen")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "sharpen"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black font-semibold shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>2. Punya Ide Kasar? Bedah Alur & Metodologi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "chat"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black font-semibold shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>3. Chat Obrolan Bimbingan Bebas</span>
            {messages.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] flex items-center justify-center font-mono">
                {messages.length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* TAB 1: DISCOVER PROBLEM FORM */}
          {activeTab === "discover" && (
            <div className="max-w-2xl mx-auto py-2 space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-850 text-xs">
                <h4 className="font-semibold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 mb-1">
                  <Compass className="w-4 h-4 text-emerald-600" />
                  Belum Menemukan Masalah yang Bisa Diangkat?
                </h4>
                <p className="text-emerald-800/80 dark:text-emerald-400/90 leading-relaxed">
                  Ceritakan tempat Anda magang dan tugas harian apa yang Anda amati. AI Mentor akan membedahnya menjadi <strong>3 masalah operasional nyata</strong> lengkap dengan usulan judul berbobot akademik yang disukai dosen pembimbing dan pimpinan kantor.
                </p>
              </div>

              <form onSubmit={handleDiscoverSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block mb-1">
                    Nama Tempat Magang / Instansi / Lokus Riset *
                  </label>
                  <input
                    type="text"
                    required
                    value={discoverEntity}
                    onChange={(e) => setDiscoverEntity(e.target.value)}
                    placeholder="Contoh: PT Telkom Indonesia, RSUP Dr. Sardjito, Dinas Kesehatan Kota, Kantor Akuntan Publik..."
                    className="w-full text-xs p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-zinc-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block mb-1">
                      Program Studi / Jurusan Anda
                    </label>
                    <input
                      type="text"
                      value={discoverMajor}
                      onChange={(e) => setDiscoverMajor(e.target.value)}
                      placeholder="Contoh: Informatika / Teknik / Manajemen..."
                      className="w-full text-xs p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-zinc-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block mb-1">
                      Kategori Usulan
                    </label>
                    <select
                      value={discoverCategory}
                      onChange={(e) => setDiscoverCategory(e.target.value as ProposalCategory)}
                      className="w-full text-xs p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-zinc-400"
                    >
                      <option value="magang">Laporan Magang / PKL / MSIB</option>
                      <option value="skripsi">Usulan Skripsi / Tugas Akhir</option>
                      <option value="penelitian">Proposal Penelitian Riset</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block mb-1">
                    Apa yang Anda Amati / Tugas Harian Anda di Sana?
                  </label>
                  <textarea
                    rows={3}
                    value={discoverDuties}
                    onChange={(e) => setDiscoverDuties(e.target.value)}
                    placeholder="Contoh: Saya ditempatkan di divisi logistik, setiap hari mencatat stok barang secara manual di Excel dan sering ada keterlambatan pengiriman..."
                    className="w-full text-xs p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-zinc-400 resize-none leading-relaxed"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    *Tuliskan apa adanya secara santai. Tugas sekecil apa pun bisa ditransformasi menjadi rumusan masalah ilmiah!
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Bedah Masalah & Rekomendasikan Judul</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: SHARPEN IDEA & FLOW FORM */}
          {activeTab === "sharpen" && (
            <div className="max-w-2xl mx-auto py-2 space-y-4">
              <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-850 text-xs">
                <h4 className="font-semibold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5 mb-1">
                  <Lightbulb className="w-4 h-4 text-indigo-600" />
                  Sudah Ada Ide Kasar Tapi Bingung Alur & Metodologinya?
                </h4>
                <p className="text-indigo-800/80 dark:text-indigo-400/90 leading-relaxed">
                  Tuliskan ide atau judul kasar Anda. AI Mentor akan membedah logika metodologinya dari Tahap 1 sampai Tahap 4, menentukan data yang dibutuhkan, dan memperingatkan jebakan yang sering ditanyakan dosen penguji.
                </p>
              </div>

              <form onSubmit={handleSharpenSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block mb-1">
                    Tuliskan Ide Kasar / Draf Judul Sementara Anda *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={rawIdea}
                    onChange={(e) => setRawIdea(e.target.value)}
                    placeholder="Contoh: Mau bikin sistem deteksi penyakit tanaman / Mau analisis pengaruh insentif terhadap kinerja sales..."
                    className="w-full text-xs p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-zinc-400 resize-none leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block mb-1">
                      Instansi Mitra / Lokus Penelitian
                    </label>
                    <input
                      type="text"
                      value={sharpenEntity}
                      onChange={(e) => setSharpenEntity(e.target.value)}
                      placeholder="Contoh: PT Shopee, Rumah Sakit, Desa Binaan..."
                      className="w-full text-xs p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-zinc-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block mb-1">
                      Kategori
                    </label>
                    <select
                      value={sharpenCategory}
                      onChange={(e) => setSharpenCategory(e.target.value as ProposalCategory)}
                      className="w-full text-xs p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-zinc-400"
                    >
                      <option value="magang">Laporan Magang / PKL</option>
                      <option value="skripsi">Skripsi / Tugas Akhir</option>
                      <option value="penelitian">Penelitian Terapan</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Compass className="w-4 h-4" />
                  <span>Bedah Alur Kerja & Pertajam Judul</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: CHAT OBROLAN BIMBINGAN */}
          {activeTab === "chat" && (
            <div className="space-y-4">
              
              {/* Active Card Notification if available */}
              {activeCard && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-300 dark:border-emerald-800/80 shadow-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block mb-1">
                        🎯 Hasil Rekomendasi Terkalibrasi (Siap Digunakan)
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 font-serif leading-snug">
                        "{activeCard.recommendedTitle}"
                      </h4>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-300 mt-1">
                        <strong>Akar Masalah:</strong> {activeCard.coreProblem}
                      </p>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-300 mt-0.5">
                        <strong>Solusi/Metode:</strong> {activeCard.proposedSolution}
                      </p>
                      
                      <div className="mt-2 flex flex-wrap gap-1">
                        {activeCard.flowSteps?.map((s, idx) => (
                          <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800 text-zinc-700 dark:text-zinc-300">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApplyCard(activeCard)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Gunakan Judul Ini</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Messages list */}
              {messages.length === 0 ? (
                <div className="text-center py-8 px-4 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 flex items-center justify-center mx-auto">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">
                      Ruang Konsultasi Akademik Siap Membantu
                    </h4>
                    <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1">
                      Ketikkan situasi tempat kerja Anda, kebingungan judul, atau klik salah satu topik bimbingan cepat di bawah:
                    </p>
                  </div>

                  {/* Quick Prompts */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl mx-auto pt-2">
                    {QUICK_PROMPTS.map((qp, qIdx) => (
                      <button
                        key={qIdx}
                        type="button"
                        onClick={() => handleSendChat(qp)}
                        className="text-left p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-850 text-[11px] text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                      >
                        "{qp}"
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => {
                    const isUser = msg.role === "user";
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                      >
                        {!isUser && (
                          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                            Dr
                          </div>
                        )}

                        <div
                          className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-2 ${
                            isUser
                              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black rounded-tr-xs"
                              : "bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-tl-xs border border-zinc-200 dark:border-zinc-800"
                          }`}
                        >
                          <div className="whitespace-pre-wrap font-sans">
                            {msg.content}
                          </div>

                          {/* Inline Card if generated inside message */}
                          {msg.card && (
                            <div className="mt-3 p-3 rounded-xl bg-white dark:bg-zinc-950 border border-emerald-300 dark:border-emerald-800 text-zinc-900 dark:text-zinc-100 space-y-1.5 shadow-2xs">
                              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                                Rangkuman Solusi:
                              </span>
                              <h5 className="font-serif font-bold text-xs text-zinc-900 dark:text-zinc-100">
                                {msg.card.recommendedTitle}
                              </h5>
                              <button
                                type="button"
                                onClick={() => handleApplyCard(msg.card!)}
                                className="mt-2 w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Terapkan Judul & Alur Ini ke Studio</span>
                              </button>
                            </div>
                          )}

                          <span className={`block text-[9px] font-mono text-right ${isUser ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-400"}`}>
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {isLoading && (
                    <div className="flex gap-3 justify-start items-center text-xs text-zinc-500">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs font-bold animate-pulse">
                        Dr
                      </div>
                      <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:0.4s]" />
                        <span className="text-[11px] ml-1">Dr. Bimbingan sedang membedah masalah...</span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer / Chat Input */}
        <div className="p-3 sm:p-4 border-t border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChat();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Tanyakan kebingungan Anda (misal: 'Kalau di bank bagian kredit, judul apa yang cocok?')..."
              className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black font-semibold text-xs hover:bg-black dark:hover:bg-white transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kirim</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
