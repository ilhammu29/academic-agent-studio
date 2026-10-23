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
        showToast(`Jawaban berhasil disusun oleh ${data.engine === 'gemini-3.5-flash-lite' ? 'Gemini AI' : 'Domain AI Engine'} (${data.domain || 'akademik'})!`);
      } else {
        // Fallback to suggestions
        const updated: Record<string, string> = { ...answers };
        questions.forEach(q => {
          updated[q.field] = q.aiSuggestion;
        });
        setAnswers(updated);
        showToast("Jawaban terisi menggunakan saran rekomendasi.");
      }
    } catch (err: any) {
      console.warn("Auto generate answers error:", err);
      // Fallback to question suggestions
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
    <div className="max-w-3xl mx-auto py-6 sm:py-8 w-full animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-zinc-900 border border-zinc-700 text-zinc-100 px-4 py-2.5 rounded-xl shadow-xl text-xs flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Minimal Header */}
      <div className="mb-8 border-b border-zinc-200 dark:border-zinc-850 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Wawancara Diagnostik Usulan
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Topik: <span className="text-zinc-800 dark:text-zinc-200 italic font-medium">"{title}"</span>
            </p>
          </div>

          {/* AI Auto Generate All Answers Button */}
          <button
            type="button"
            onClick={handleAutoGenerateAIAnswers}
            disabled={isGeneratingAll}
            className="self-start sm:self-auto py-2 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer flex-shrink-0 disabled:opacity-50 shadow-xs"
          >
            {isGeneratingAll ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-500" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            )}
            <span>{isGeneratingAll ? "Menyusun Jawaban..." : "✨ Auto-Generate Semua (AI)"}</span>
          </button>
        </div>

        {/* Minimal Progress Indicator */}
        <div className="flex items-center gap-3 pt-2">
          <div className="flex-1 bg-zinc-200 dark:bg-zinc-850 h-1.5 rounded-full overflow-hidden">
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

      {/* 2. Questions Stack (Clean Linear List, No Nested Cardboxes) */}
      <div className="space-y-8">
        {questions.map((q, idx) => {
          const currentVal = answers[q.field] || "";
          const isAnswered = currentVal.trim().length > 0;
          const isListening = listeningField === q.field;

          return (
            <div
              key={q.id}
              className="space-y-3 pb-6 border-b border-zinc-200 dark:border-zinc-850 last:border-b-0"
            >
              {/* Question Header & Label */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="text-xs font-mono font-medium text-zinc-400 pt-0.5">
                    {idx + 1 < 10 ? `0${idx + 1}.` : `${idx + 1}.`}
                  </span>
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                      {q.question}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {q.contextHint} &bull; <span className="text-zinc-600 dark:text-zinc-300">{q.thinkingModeApplied}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Speech Dictation Button */}
                  <button
                    type="button"
                    onClick={() => toggleListening(q.field)}
                    title={isListening ? "Hentikan rekaman suara" : "Diktekan jawaban lewat mikrofon"}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                      isListening
                        ? "bg-red-500 text-white animate-pulse"
                        : "bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800"
                    }`}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-zinc-500" />}
                    <span className="hidden sm:inline text-[11px]">
                      {isListening ? "Mendengarkan..." : "Dikte"}
                    </span>
                  </button>

                  {isAnswered && (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      <Check className="w-3.5 h-3.5" /> Selesai
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
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-500 rounded-xl p-3 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none transition-colors leading-relaxed shadow-2xs"
              />

              {/* Suggestion Quick Fill Link */}
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 gap-4">
                <span className="truncate">
                  Saran: <span className="text-zinc-600 dark:text-zinc-300">{q.aiSuggestion.slice(0, 75)}...</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleApplySingleSuggestion(q)}
                  className="text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:underline text-xs flex-shrink-0 cursor-pointer font-medium"
                >
                  Terapkan Saran Ini
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Action Navigation */}
      <div className="mt-8 pt-4 border-t border-zinc-200 dark:border-zinc-850 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!isAllAnswered}
          title={!isAllAnswered ? "Lengkapi seluruh pertanyaan sebelum melanjutkan" : "Jalankan Penyusunan AI"}
          className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-black font-semibold text-xs transition-all flex items-center gap-2 disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-xs"
        >
          <span>Lanjutkan ke Penyusunan AI</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
