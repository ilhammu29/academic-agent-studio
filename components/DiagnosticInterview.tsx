"use client";

import React, { useState, useRef, useEffect } from "react";
import { DiagnosticQuestion, ProposalCategory } from "@/types/studio";
import { ArrowLeft, ArrowRight, Sparkles, Check, Loader2, Mic, MicOff } from "lucide-react";

interface DiagnosticInterviewProps {
  category: ProposalCategory;
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

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6 w-full animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-zinc-900 border border-zinc-700 text-zinc-100 px-4 py-2.5 rounded-xl shadow-xl text-xs flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header & Stage Pill */}
      <div className="mb-8">
        
        {/* Step Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-3 shadow-2xs">
          <svg 
            className="w-3.5 h-3.5 text-zinc-800 dark:text-zinc-200" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
          <span>Langkah 2 dari 4: Wawancara Diagnostik</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-white tracking-tight">
              Wawancara Penajaman Metodologi
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl line-clamp-2">
              Topik: <span className="font-semibold text-zinc-800 dark:text-zinc-200">"{title}"</span>
            </p>
          </div>

          {/* AI Auto Generate All Answers Button */}
          <button
            type="button"
            onClick={handleAutoGenerateAIAnswers}
            disabled={isGeneratingAll}
            className="self-start sm:self-auto py-2 px-4 rounded-full border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-medium transition-all flex items-center gap-2 cursor-pointer flex-shrink-0 disabled:opacity-50 shadow-xs hover:border-zinc-300"
          >
            {isGeneratingAll ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-500" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
            )}
            <span>{isGeneratingAll ? "Menyusun Jawaban..." : "Auto-Generate Jawaban (AI)"}</span>
          </button>
        </div>

        {/* Minimal Progress Bar */}
        <div className="flex items-center gap-3 pt-5">
          <div className="flex-1 bg-zinc-200/80 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
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
              className="bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 sm:p-6 transition-all hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs"
            >
              {/* Question Header & Action Row */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-mono font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                      {q.question}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      {q.contextHint} &bull; <span className="font-medium text-zinc-700 dark:text-zinc-300">{q.thinkingModeApplied}</span>
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
                        ? "bg-red-500 text-white animate-pulse"
                        : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-zinc-500" />}
                    <span className="hidden sm:inline text-[11px] font-medium">
                      {isListening ? "Merekam..." : "Dikte"}
                    </span>
                  </button>

                  {isAnswered && (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40">
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
                className="w-full bg-zinc-50/70 dark:bg-zinc-950/60 border border-zinc-200/90 dark:border-zinc-800 rounded-xl p-3.5 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 focus:bg-white dark:focus:bg-zinc-900 transition-all leading-relaxed"
              />

              {/* Suggestion Quick Fill Link */}
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 gap-4 mt-2">
                <span className="truncate">
                  Saran: <span className="text-zinc-700 dark:text-zinc-300 font-medium">{q.aiSuggestion.slice(0, 80)}...</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleApplySingleSuggestion(q)}
                  className="text-zinc-900 dark:text-zinc-100 hover:underline text-xs flex-shrink-0 cursor-pointer font-semibold whitespace-nowrap"
                >
                  Gunakan Saran
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Bottom Action Navigation */}
      <div className="mt-10 pt-6 border-t border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-full border border-zinc-200/90 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!isAllAnswered}
          title={!isAllAnswered ? "Lengkapi seluruh pertanyaan sebelum melanjutkan" : "Jalankan Orkestrasi Multi-Agent"}
          className="px-6 py-2.5 rounded-full bg-[#18181B] hover:bg-black text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 font-semibold text-xs transition-all flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-md group"
        >
          <span>Jalankan Multi-Agent AI</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

    </div>
  );
};
