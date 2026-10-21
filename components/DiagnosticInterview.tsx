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
  const progressPercent = Math.round((answeredCount / questions.length) * 100);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      
      {/* Header Info */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-champagne/30 bg-champagne/5 text-champagne text-xs font-mono font-bold uppercase tracking-wider">
            <Brain className="w-3.5 h-3.5" />
            Tahap 02 &bull; Wawancara Diagnostik Kritis
          </div>
          
          {/* Quick autofill all */}
          <button
            onClick={handleApplyAllSuggestions}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-champagne/40 bg-champagne/10 hover:bg-champagne/20 text-champagne text-xs font-mono font-bold transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Rekomendasi Lengkap (1-Klik)
          </button>
        </div>

        <h2 className="text-2xl md:text-3xl font-serif font-bold text-milk-white tracking-tight">
          Sesi Pengumpulan Data Spesifik
        </h2>
        <p className="text-xs text-milk-muted font-mono mt-1">
          Topik Terpilih: <span className="text-milk-soft italic font-serif">"{title}"</span>
        </p>

        {/* Progress Bar */}
        <div className="mt-4 p-3 rounded-xl bg-matte-surface border border-matte-border flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-milk-muted">Kelengkapan Jawaban:</span>
            <span className="font-bold text-milk-white">{answeredCount} dari {questions.length} Selesai</span>
          </div>
          <div className="flex-1 max-w-xs bg-matte-bg h-2 rounded-full overflow-hidden border border-matte-border">
            <div
              className="h-full bg-champagne transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <span className="text-xs font-mono font-bold text-champagne">{progressPercent}%</span>
        </div>
      </div>

      {/* Questions Stack */}
      <div className="space-y-6">
        {questions.map((q, idx) => {
          const currentVal = answers[q.field] || "";
          const isAnswered = currentVal.trim().length > 0;

          return (
            <div
              key={q.id}
              className={`p-6 rounded-2xl border transition-all ${
                isAnswered
                  ? "bg-matte-surface border-matte-borderLight"
                  : "bg-matte-surface/80 border-matte-border"
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-matte-surface2 border border-matte-border flex items-center justify-center font-mono font-bold text-xs text-champagne">
                    {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                  </span>
                  <h3 className="text-sm font-serif font-bold text-milk-white">
                    {q.question}
                  </h3>
                </div>

                {isAnswered && (
                  <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex-shrink-0">
                    <CheckCircle2 className="w-3 h-3" /> Terisi
                  </span>
                )}
              </div>

              {/* Context Hint */}
              <div className="mb-3 px-3.5 py-2 rounded-lg bg-matte-bg/60 border border-matte-border/50 text-[11px] text-milk-muted flex items-start gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-champagne flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="text-milk-soft">Konteks SOP:</strong> {q.contextHint}
                  <span className="ml-2 font-mono text-champagne/80">[{q.thinkingModeApplied}]</span>
                </span>
              </div>

              {/* Textarea */}
              <textarea
                rows={3}
                value={currentVal}
                onChange={(e) => handleAnswerChange(q.field, e.target.value)}
                placeholder={q.placeholder}
                className="w-full bg-matte-bg border border-matte-border focus:border-champagne/70 rounded-xl px-4 py-3 text-xs text-milk-white placeholder:text-milk-dim focus:outline-none focus:ring-1 focus:ring-champagne transition-all font-sans leading-relaxed"
              />

              {/* Suggestion Pill / Auto-fill button */}
              <div className="mt-2.5 flex items-center justify-between gap-3 text-xs">
                <span className="text-[11px] text-milk-dim truncate">
                  Saran AI: <span className="text-milk-muted italic">{q.aiSuggestion.slice(0, 65)}...</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleApplySingleSuggestion(q)}
                  className="flex items-center gap-1 text-[11px] font-mono text-champagne hover:text-champagne-light hover:underline flex-shrink-0"
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
      <div className="mt-8 pt-4 border-t border-matte-border flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl border border-matte-border bg-matte-surface hover:bg-matte-surface2 text-milk-soft text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Topik
        </button>

        <button
          onClick={onSubmit}
          disabled={answeredCount === 0}
          className="px-8 py-3.5 rounded-xl bg-champagne hover:bg-champagne-light text-matte-bg font-sans font-bold text-sm tracking-wide transition-all shadow-lg shadow-champagne/10 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <span>Luncurkan Multi-Agent Orchestrator</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
