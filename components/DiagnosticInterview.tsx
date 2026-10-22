"use client";

import React from "react";
import { DiagnosticQuestion, ProposalCategory } from "@/types/studio";
import { ArrowLeft, ArrowRight, Sparkles, Check } from "lucide-react";

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
    <div className="max-w-3xl mx-auto py-6 sm:py-8 w-full animate-in fade-in duration-200">
      
      {/* 1. Minimal Header */}
      <div className="mb-8 border-b border-zinc-900 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-zinc-100 tracking-tight">
              Wawancara Diagnostik Usulan
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Topik: <span className="text-zinc-200 italic font-medium">"{title}"</span>
            </p>
          </div>

          <button
            type="button"
            onClick={handleApplyAllSuggestions}
            className="self-start sm:self-auto py-1.5 px-3 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer flex-shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
            <span>Isi Semua Saran Rekomendasi</span>
          </button>
        </div>

        {/* Minimal Progress Indicator */}
        <div className="flex items-center gap-3 pt-2">
          <div className="flex-1 bg-zinc-900 h-1 rounded-full overflow-hidden">
            <div
              className="h-full bg-zinc-200 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            {answeredCount}/{questions.length} Terisi ({progressPercent}%)
          </span>
        </div>
      </div>

      {/* 2. Questions Stack (Clean Linear List, No Nested Cardboxes) */}
      <div className="space-y-8">
        {questions.map((q, idx) => {
          const currentVal = answers[q.field] || "";
          const isAnswered = currentVal.trim().length > 0;

          return (
            <div
              key={q.id}
              className="space-y-2.5 pb-6 border-b border-zinc-900/80 last:border-b-0"
            >
              {/* Question Header & Label */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="text-xs font-mono font-medium text-zinc-500 pt-0.5">
                    {idx + 1 < 10 ? `0${idx + 1}.` : `${idx + 1}.`}
                  </span>
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-zinc-100 leading-snug">
                      {q.question}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      {q.contextHint} &bull; <span className="text-zinc-400">{q.thinkingModeApplied}</span>
                    </p>
                  </div>
                </div>

                {isAnswered && (
                  <span className="flex items-center gap-1 text-[11px] text-zinc-400 flex-shrink-0">
                    <Check className="w-3.5 h-3.5 text-zinc-300" /> Selesai
                  </span>
                )}
              </div>

              {/* Textarea Input */}
              <textarea
                rows={3}
                value={currentVal}
                onChange={(e) => handleAnswerChange(q.field, e.target.value)}
                placeholder={q.placeholder}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-lg p-3 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none transition-colors leading-relaxed"
              />

              {/* Suggestion Quick Fill Link */}
              <div className="flex items-center justify-between text-xs text-zinc-500 gap-4">
                <span className="truncate">
                  Saran: <span className="text-zinc-400">{q.aiSuggestion.slice(0, 75)}...</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleApplySingleSuggestion(q)}
                  className="text-zinc-300 hover:text-white hover:underline text-xs flex-shrink-0 cursor-pointer"
                >
                  Terapkan Saran
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Action Navigation */}
      <div className="mt-8 pt-4 border-t border-zinc-900 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-lg border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-900 text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!isAllAnswered}
          title={!isAllAnswered ? "Lengkapi seluruh pertanyaan sebelum melanjutkan" : "Jalankan Penyusunan AI"}
          className="px-5 py-2.5 rounded-lg bg-zinc-100 hover:bg-white text-black font-semibold text-xs transition-all flex items-center gap-2 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
        >
          <span>Lanjutkan ke Penyusunan AI</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
