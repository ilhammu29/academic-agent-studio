"use client";
import { aiFetch } from "@/lib/aiClient";

import React, { useState, useRef, useEffect } from "react";
import { ProposalDocument } from "@/types/studio";
import { 
  Bot, 
  Send, 
  Sparkles, 
  X, 
  RefreshCw, 
  MessageSquare, 
  Lightbulb, 
  ShieldQuestion, 
  BookOpen,
  User,
  ArrowRight
} from "lucide-react";

interface AcademicCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  doc: ProposalDocument;
}

interface ChatMessage {
  id: string;
  sender: "user" | "copilot";
  text: string;
  timestamp: string;
}

export const AcademicCopilotDrawer: React.FC<AcademicCopilotDrawerProps> = ({
  isOpen,
  onClose,
  doc
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "copilot",
      text: `Halo ${doc.candidateName || "Rekan Peneliti"}! Saya Co-Pilot Akademik Anda. Saya telah membaca draf proposal "${doc.title}". Ada bagian metodologi, kebaruan riset, atau persiapan sidang yang ingin kita diskusikan bersama?`,
      timestamp: "Baru saja"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const quickPrompts = [
    "Apa titik paling rentan diserang penguji pada proposal ini?",
    "Rekomendasikan uji statistik yang tepat untuk variabel Bab III",
    "Bagaimana cara mempertegas novelty penelitian ini?",
    "Bantu susun argumen justifikasi pemilihan lokus instansi"
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const prompt = `Anda adalah Senior Research Director & Dosen Pembimbing Skripsi/Tesis Utama berstandar internasional.
Konteks Usulan Proposal Mahasiswa:
- Judul: "${doc.title}"
- Kategori: "${doc.category}"
- Instansi/Lokus: "${doc.targetEntity}" (${doc.targetDepartment})
- Masalah Utama: ${doc.bab1?.latarBelakang?.[1] || "Kesenjangan operasional/metodologis"}
- Metode: ${doc.bab3?.metodePelaksanaan || "Metode penelitian terstruktur"}

Pertanyaan/Kebutuhan Mahasiswa:
"${text}"

Jawablah dengan nada membimbing, suportif, kritis, bernas, dan terstruktur akademis (gunakan poin-poin konkret jika diperlukan). Hindari klise kosong AI.`;

      const res = await aiFetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      const data = await res.json();
      const replyText = data.success && data.text
        ? data.text.trim()
        : "Asisten AI belum tersedia. Hubungkan Gemini dan kirim pertanyaan kembali.";

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "copilot",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "copilot",
        text: "Maaf, terjadi kendala saat menghubungi asisten AI. Silakan coba kembali sesaat lagi.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md sm:max-w-lg bg-zinc-950 border-l border-zinc-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 text-zinc-100">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-100 shadow-sm">
              <Bot className="w-4 h-4 text-zinc-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-semibold text-zinc-100">Co-Pilot Bimbingan Akademik</h3>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
                  ONLINE
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 truncate max-w-[240px]">
                {doc.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat History Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 flex-shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                    isUser
                      ? "bg-zinc-100 text-zinc-950 font-medium rounded-tr-xs"
                      : "bg-zinc-900/90 border border-zinc-800 text-zinc-200 rounded-tl-xs whitespace-pre-line"
                  }`}
                >
                  <p className="text-[11px] sm:text-xs">{msg.text}</p>
                  <span
                    className={`block text-[9px] font-mono mt-1 ${
                      isUser ? "text-zinc-500 text-right" : "text-zinc-500 text-left"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-zinc-400 text-xs py-2 pl-8">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-zinc-300" />
              <span>Co-Pilot sedang menganalisis naskah Anda...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 border-t border-zinc-800/80 bg-zinc-900/30 overflow-x-auto no-scrollbar">
          <div className="text-[10px] text-zinc-500 mb-1.5 flex items-center gap-1 font-mono">
            <Lightbulb className="w-3 h-3 text-zinc-400" />
            <span>Pemicu Pertanyaan Cepat:</span>
          </div>
          <div className="flex items-center gap-1.5 flex-nowrap overflow-x-auto pb-1">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                disabled={isLoading}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 hover:text-white transition-colors cursor-pointer flex-shrink-0 disabled:opacity-40"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Input Field */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-950 flex items-center gap-2">
          <textarea
            rows={1}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Tanyakan analisis teori, celah metodologi, atau persiapan sidang..."
            className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-zinc-600 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none"
          />
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputMessage.trim()}
            className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
