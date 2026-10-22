"use client";

import React from "react";
import { DiagnosticQuestion, ProposalCategory } from "@/types/studio";
import { ArrowLeft, ArrowRight, Brain, Sparkles, HelpCircle, Lightbulb, CheckCircle2 } from "lucide-react";

interface DiagnosticInterviewProps {
  category: ProposalCategory;
  title: string;
  questions: DiagnosticQuestion[];
  answers: Record<string, string>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onBack: () => void;
  onSubmit: () => void;
}

export const DiagnosticInterview: React.FC<DiagnosticInterviewProps> = ({
  category,
  title,
  questions,
  answers,
  setAnswers,
  onBack,
  onSubmit
}) => {
  const handleAnswerChange = (field: string, val: string) => {
    setAnswers(prev => ({ ...prev, [field]: val }));
  };

  const handleApplySingleSuggestion = (q: DiagnosticQuestion) => {
    setAnswers(prev => ({ ...prev, [q.field]: q.aiSuggestion }));
  };

  const handleApplyAllSuggestions = () => {
    const updated: Record<string, string> = { ...answers };
    questions.forEach(q => {
      updated[q.field] = q.aiSuggestion;
    });
    setAnswers(updated);
  };

  const answeredCount = questions.filter(q => !!answers[q.field]?.trim()).length;
  const progressPercent = Math.round((answeredCount / (questions.length || 1)) * 100);
  const isAllAnswered = answeredCount === questions.length && questions.length > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-white animate-in fade-in duration-300">
      
      {/* Header Info */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#27272A] bg-[#18181B] text-white text-xs font-mono font-semibold uppercase tracking-wider">
            <Brain className="w-3.5 h-3.5" />
            Tahap 02 &bull; Wawancara Diagnostik Kritis
          </div>
          
          {/* Quick autofill all */}
          <button
            onClick={handleApplyAllSuggestions}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#27272A] bg-white hover:bg-gray-200 text-black text-xs font-semibold transition-all cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Rekomendasi Lengkap (1-Klik)</span>
          </button>
        </div>

        <h2 className="text-xl sm:text-3xl font-bold text-white tracking-tight">
          Pengumpulan Data Spesifik Berdasarkan Judul
        </h2>
        <p className="text-xs text-bw-muted font-mono mt-1">
          Topik: <span className="text-white italic">"{title}"</span>
        </p>

        {/* Progress Bar */}
        <div className="mt-4 p-3 rounded-xl bg-[#09090B] border border-[#27272A] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-bw-muted">Status Kelengkapan:</span>
            <span className="font-bold text-white">{answeredCount} dari {questions.length} Pertanyaan Terisi</span>
          </div>
          <div className="flex-1 max-w-xs bg-[#18181B] h-2 rounded-full overflow-hidden border border-[#27272A]">
            <div
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-white">{progressPercent}%</span>
        </div>
      </div>

      {/* Questions Stack */}
      <div className="space-y-4 sm:space-y-5">
        {questions.map((q, idx) => {
          const currentVal = answers[q.field] || "";
          const isAnswered = currentVal.trim().length > 0;

          return (
            <div
              key={q.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                isAnswered
                  ? "bg-[#09090B] border-white/40"
                  : "bg-[#09090B]/90 border-[#27272A]"
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-[#18181B] border border-[#27272A] flex items-center justify-center font-mono font-bold text-xs text-white">
                    {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-white">
                    {q.question}
                  </h3>
                </div>

                {isAnswered && (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-white bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20 flex-shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-white" /> Terisi
                  </span>
                )}
              </div>

              {/* Context Hint */}
              <div className="mb-2.5 px-3 py-2 rounded-lg bg-[#121214] border border-[#27272A] text-[11px] text-bw-muted flex items-start gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-white flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Konteks SOP:</strong> {q.contextHint}
                  <span className="ml-2 font-mono text-bw-dim">[{q.thinkingModeApplied}]</span>
                </span>
              </div>

              {/* Textarea */}
              <textarea
                rows={3}
                value={currentVal}
                onChange={(e) => handleAnswerChange(q.field, e.target.value)}
                placeholder={q.placeholder}
                className="w-full bg-[#121214] border border-[#27272A] focus:border-white rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-bw-dim focus:outline-none transition-all font-sans leading-relaxed"
              />

              {/* Suggestion Pill / Auto-fill button */}
              <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                <span className="text-[11px] text-bw-dim truncate">
                  Saran Jawaban: <span className="text-bw-muted italic">{q.aiSuggestion.slice(0, 70)}...</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleApplySingleSuggestion(q)}
                  className="flex items-center gap-1 text-[11px] font-mono text-white hover:underline flex-shrink-0 cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  Gunakan Rekomendasi
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 pt-4 border-t border-[#27272A] flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl border border-[#27272A] bg-[#09090B] hover:bg-[#18181B] text-white text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Topik</span>
        </button>

        <button
          onClick={onSubmit}
          disabled={!isAllAnswered}
          title={!isAllAnswered ? "Lengkapi seluruh pertanyaan sebelum melanjutkan" : "Luncurkan Agen AI"}
          className="px-6 py-3 rounded-xl bg-white hover:bg-gray-200 text-black font-semibold text-xs tracking-wide transition-all shadow-md flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <span>Luncurkan Multi-Agent Orchestrator</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
