"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { DiagnosticQuestion, ProposalCategory } from "@/types/studio";
import { ArrowLeft, ArrowRight, Sparkles, Check, Loader2, Mic, MicOff, Layers, ShieldCheck, AlertCircle } from "lucide-react";
import { detectMissingInformation } from "@/lib/diagnosticInterviewEngine.ts";

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
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
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

  const handleAnswerChange = (field: string, val: string) => {
    setAnswers(prev => ({ ...prev, [field]: val }));
  };

  const handleApplySingleSuggestion = (q: DiagnosticQuestion) => {
    setAnswers(prev => ({ ...prev, [q.field]: q.aiSuggestion }));
    showToast(`Saran untuk pertanyaan ${q.field} diterapkan.`);
  };

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
      const res = await fetch("/api/interview/auto-answers", {
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
        setAnswers(prev => ({
          ...prev,
          ...data.answers
        }));
        showToast("Jawaban wawancara diagnostik berhasil dirumuskan AI secara akurat.");
      } else {
        const updated: Record<string, string> = { ...answers };
        questions.forEach(q => {
          updated[q.field] = q.aiSuggestion;
        });
        setAnswers(updated);
        showToast("Jawaban terisi menggunakan saran rekomendasi.");
      }
    } catch (err: any) {
      console.warn("Auto generate answers error:", err);
      const updated: Record<string, string> = { ...answers };
      questions.forEach(q => {
        updated[q.field] = q.aiSuggestion;
      });
      setAnswers(updated);
      showToast("Jawaban terisi menggunakan saran rekomendasi.");
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const answeredCount = questions.filter(q => !!answers[q.field]?.trim()).length;
  const progressPercent = Math.round((answeredCount / (questions.length || 1)) * 100);
  const isAllAnswered = answeredCount === questions.length && questions.length > 0;

  const completeness = useMemo(() => {
    return detectMissingInformation(answers, category, reportType as any);
  }, [answers, category, reportType]);

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6 w-full animate-in fade-in duration-300 text-[#0F172A] dark:text-[#F3F6FC]">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0F172A] dark:bg-[#1C263A] border border-[#253149] text-white dark:text-[#F3F6FC] px-4 py-2.5 rounded-xl shadow-xl text-xs flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <Sparkles className="w-3.5 h-3.5 text-[#7C9CFF]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header & Stage Pill */}
      <div className="mb-8">
        
        {/* Step Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#F1F5F9] dark:bg-[#172033] border border-[#E2E8F0] dark:border-[#253149] text-xs font-medium text-[#0F172A] dark:text-[#7C9CFF] mb-3 shadow-2xs">
          <Layers className="w-3.5 h-3.5 text-[#7C9CFF]" />
          <span>Langkah 2 dari 4: Wawancara Diagnostik Lapangan</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] dark:text-[#F3F6FC] tracking-tight">
              Wawancara Eksplorasi &amp; Penajaman Konteks
            </h2>
            <p className="text-xs sm:text-sm text-[#475569] dark:text-[#A4B1C7] mt-1 max-w-xl line-clamp-2">
              Topik: <span className="font-semibold text-[#0F172A] dark:text-[#F3F6FC]">"{title}"</span>
            </p>
          </div>

          {/* AI Auto Generate All Answers Button */}
          <button
            type="button"
            onClick={handleAutoGenerateAIAnswers}
            disabled={isGeneratingAll}
            className="self-start sm:self-auto py-2 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#253149] bg-white dark:bg-[#172033] hover:bg-[#F1F5F9] dark:hover:bg-[#1C263A] text-[#0F172A] dark:text-[#F3F6FC] text-xs font-medium transition-all flex items-center gap-2 cursor-pointer flex-shrink-0 disabled:opacity-50 shadow-xs hover:border-[#7C9CFF]"
          >
            {isGeneratingAll ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#7C9CFF]" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-[#7C9CFF]" />
            )}
            <span>{isGeneratingAll ? "Menyusun Jawaban..." : "Auto-Generate Jawaban (AI)"}</span>
          </button>
        </div>

        {/* Purpose Explainer Banner */}
        <div className="mt-4 p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#253149] bg-white dark:bg-[#111827] text-xs text-[#475569] dark:text-[#A4B1C7] leading-relaxed flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-[#7C9CFF] shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-[#0F172A] dark:text-[#F3F6FC] mb-0.5">
              Fungsi Wawancara Diagnostik:
            </p>
            <p>
              Proposal naskah berbobot puluhan halaman tidak bisa disusun dari sekadar judul umum. Wawancara ini menggali 6 parameter fondasi: lokus spesifik, celah masalah empiris, batasan lingkup, instrumen ukur, metrik validasi, dan luaran nyata. Informasi ini menjadi basis fakta bagi Agen AI dalam menyusun Bab I sampai Bab IV secara akurat tanpa asumsi fiktif.
            </p>
          </div>
        </div>

        {/* Minimal Progress Bar */}
        <div className="flex items-center gap-3 pt-5">
          <div className="flex-1 bg-[#E2E8F0] dark:bg-[#253149] h-1.5 rounded-md overflow-hidden">
            <div
              className="h-full bg-[#7C9CFF] transition-all duration-300 rounded-md"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs text-[#475569] dark:text-[#A4B1C7] font-mono">
            {answeredCount}/{questions.length} Terisi ({progressPercent}%)
          </span>
        </div>
      </div>

      {/* 2. Questions Stack (Clean Cards with Soft Shadows) */}
      <div className="space-y-6">
        {questions.map((q, idx) => {
          const currentVal = answers[q.field] || "";
          const isAnswered = currentVal.trim().length > 0;
          const isListening = listeningField === q.field;

          return (
            <div
              key={q.id}
              className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#253149] rounded-2xl p-5 sm:p-6 transition-all hover:border-[#7C9CFF]/60 shadow-xs"
            >
              {/* Question Header & Action Row */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#F1F5F9] dark:bg-[#172033] text-[#0F172A] dark:text-[#7C9CFF] text-xs font-mono font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-[#0F172A] dark:text-[#F3F6FC] leading-snug">
                      {q.question}
                    </h3>
                    <p className="text-xs text-[#475569] dark:text-[#A4B1C7] mt-1">
                      {q.contextHint} &bull; <span className="font-medium text-[#0F172A] dark:text-[#F3F6FC]">{q.thinkingModeApplied}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Speech Dictation Button */}
                  <button
                    type="button"
                    onClick={() => toggleListening(q.field)}
                    title={isListening ? "Hentikan rekaman suara" : "Diktekan jawaban lewat suara"}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${
                      isListening
                        ? "bg-[#FB7185] text-white animate-pulse"
                        : "bg-[#F1F5F9] dark:bg-[#172033] hover:bg-[#E2E8F0] dark:hover:bg-[#1C263A] text-[#475569] dark:text-[#A4B1C7]"
                    }`}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-[#475569] dark:text-[#A4B1C7]" />}
                    <span className="hidden sm:inline text-[11px] font-medium">
                      {isListening ? "Merekam..." : "Dikte"}
                    </span>
                  </button>

                  {isAnswered && (
                    <span className="flex items-center gap-1 text-xs text-[#34D399] font-medium px-2 py-1 rounded-full bg-[#34D399]/15 border border-[#34D399]/30">
                      <Check className="w-3.5 h-3.5" /> Siap
                    </span>
                  )}
                </div>
              </div>

              {/* Textarea Input */}
              <textarea
                rows={3}
                value={currentVal}
                onChange={(e) => handleAnswerChange(q.field, e.target.value)}
                placeholder={q.placeholder}
                className="w-full bg-[#F8FAFC] dark:bg-[#0B101A] border border-[#E2E8F0] dark:border-[#253149] rounded-xl p-3.5 text-xs sm:text-sm text-[#0F172A] dark:text-[#F3F6FC] placeholder:text-[#475569] dark:placeholder:text-[#A4B1C7] focus:outline-none focus:border-[#7C9CFF] focus:bg-white dark:focus:bg-[#111827] transition-all leading-relaxed"
              />

              {/* Suggestion Quick Fill Link */}
              <div className="flex items-center justify-between text-xs text-[#475569] dark:text-[#A4B1C7] gap-4 mt-2">
                <span className="truncate">
                  Saran: <span className="text-[#0F172A] dark:text-[#F3F6FC] font-medium">{q.aiSuggestion.slice(0, 80)}...</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleApplySingleSuggestion(q)}
                  className="text-[#7C9CFF] hover:text-[#9B8CFF] hover:underline text-xs flex-shrink-0 cursor-pointer font-semibold whitespace-nowrap"
                >
                  Gunakan Saran
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2.5 Real-Time Academic Quality Gate Indicator */}
      <div className="mt-8 p-4 rounded-xl border border-[#E2E8F0] dark:border-[#253149] bg-white dark:bg-[#111827] shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#34D399]" />
            <span className="font-bold text-[#0F172A] dark:text-[#F3F6FC]">
              Validasi Kesiapan Data &amp; Metodologi
            </span>
          </div>
          <span className="font-mono font-bold text-[#7C9CFF]">
            {completeness.completenessPercentage}% Lengkap
          </span>
        </div>

        {completeness.missingItems.length > 0 ? (
          <div className="space-y-1.5 pt-2 border-t border-[#E2E8F0] dark:border-[#253149] text-xs">
            <p className="text-[11px] text-[#FBBF24] font-medium flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{completeness.criticalMissingCount > 0 ? "Terdapat variabel kritis yang belum diuraikan:" : "Rekomendasi penajaman jawaban:"}</span>
            </p>
            <ul className="space-y-1 text-[11px] text-[#475569] dark:text-[#A4B1C7] pl-5 list-disc">
              {completeness.missingItems.slice(0, 3).map((item, i) => (
                <li key={i}>
                  <strong className="text-[#0F172A] dark:text-[#F3F6FC]">{item.variableName}:</strong> {item.remediationAdvice}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-[11px] text-[#34D399] font-medium pt-1 border-t border-[#E2E8F0] dark:border-[#253149]">
            ✓ Seluruh variabel penelitian telah terpenuhi. Dokumen siap diorkestrasi oleh Agen AI secara mendalam.
          </p>
        )}
      </div>

      {/* 3. Bottom Action Navigation */}
      <div className="mt-10 pt-6 border-t border-[#E2E8F0] dark:border-[#253149] flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#253149] text-[#475569] dark:text-[#A4B1C7] hover:text-[#0F172A] dark:hover:text-[#F3F6FC] hover:bg-[#F1F5F9] dark:hover:bg-[#172033] text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!isAllAnswered}
          title={!isAllAnswered ? "Lengkapi seluruh pertanyaan sebelum melanjutkan" : "Jalankan Orkestrasi Multi-Agent"}
          className="px-6 py-2.5 rounded-xl bg-[#7C9CFF] hover:bg-[#9B8CFF] text-[#080B12] font-semibold text-xs transition-all flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-md group"
        >
          <span>Jalankan Multi-Agent AI</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

    </div>
  );
};
