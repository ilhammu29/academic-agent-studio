'use client';
import { aiFetch } from '@/lib/aiClient';

import React, { useState, useEffect, useRef } from 'react';
import { ProposalDocument } from '@/types/studio';
import { 
  ShieldAlert, 
  Send, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  HelpCircle,
  Mic,
  MicOff,
  Volume2,
  VolumeX
} from 'lucide-react';

interface DefenseSimulatorProps {
  doc: ProposalDocument;
}

interface DefenseExchange {
  id: string;
  examinerName: string;
  examinerRole: string;
  examinerAvatar: string;
  question: string;
  contextGap: string;
  candidateAnswer?: string;
  score?: number;
  critique?: {
    strengths: string[];
    weaknesses: string[];
    idealRebuttal: string;
    thinkingModeAdvice: string;
  };
}

export default function DefenseSimulator({ doc }: DefenseSimulatorProps) {
  // Generate initial questions based on the candidate's proposal
  const [exchanges, setExchanges] = useState<DefenseExchange[]>(() => [
    {
      id: 'q1',
      examinerName: 'Dr. Ir. Suharyanto, M.Sc.',
      examinerRole: 'Penguji 1 — Metodologi & Desain Riset',
      examinerAvatar: '👨‍🏫',
      question: `Mengapa Anda memilih pendekatan dan arsitektur metode ini daripada pendekatan konvensional yang sudah mapan? Apa justifikasi bahwa metode Anda lebih efisien pada ${doc.targetEntity}?`,
      contextGap: 'Menguji apakah pengusul paham kelemahan komparatif metode yang dipilih atau sekadar ikut tren teknologi terkini.',
    },
    {
      id: 'q2',
      examinerName: 'Prof. Dr. Med. Ratna Sari, Ph.D.',
      examinerRole: 'Penguji 2 — Novelty & State-of-the-Art',
      examinerAvatar: '👩‍🔬',
      question: `Tinjauan pustaka Anda menyebutkan beberapa penelitian terdahulu. Tolong jelaskan secara presisi: apa novelty (kebaruan) mutlak penelitian Anda yang membedakannya dengan publikasi primer tahun 2023-2025?`,
      contextGap: 'Menguji kebaruan agar proposal tidak tergolong duplikasi atau plagiarisme terselubung.',
    },
    {
      id: 'q3',
      examinerName: 'Ir. Budi Wicaksono, M.Kom.',
      examinerRole: 'Penguji Praktisi / Mentor Lapangan',
      examinerAvatar: '👨‍💼',
      question: `Dalam matriks jadwal Bab IV, Anda menjanjikan luaran selesai dalam kurun ${doc.durationMonths} bulan. Bagaimana rencana kontingensi Anda jika terjadi kendala akses data riil, perizinan, atau hambatan teknis?`,
      contextGap: 'Menguji manajemen risiko (Pre-Mortem Thinking) dan kelayakan praktis pelaksanaan di lapangan.',
    },
  ]);

  const [activeQuestionId, setActiveQuestionId] = useState<string>('q1');
  const [currentInput, setCurrentInput] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);

  const activeExchange = exchanges.find((e) => e.id === activeQuestionId) || exchanges[0];

  const handleGenerateNewQuestions = async () => {
    setIsGeneratingQuestions(true);
    try {
      const prompt = `Anda adalah dewan penguji sidang seminar proposal / skripsi yang sangat kritis dan otoritatif.
Konteks Usulan Mahasiswa:
- Judul: "${doc.title}"
- Kategori: "${doc.category}"
- Instansi/Lokus: "${doc.targetEntity}"
- Rumusan Masalah: "${doc.bab1?.rumusanMasalah?.[0] || 'Tantangan operasional'}"
- Metode: "${doc.bab3?.metodePelaksanaan || 'Metodologi terstruktur'}"

Buatlah 2 pertanyaan penguji baru yang tajam dan menantang (1 fokus metodologi/teknis, 1 fokus novelty/validasi empiris).
Format output HARUS JSON murni tanpa markdown:
[
  {
    "examinerName": "Dr. Ir. Hendro Prabowo, M.T.",
    "examinerRole": "Penguji 3 — Validasi Empiris & Arsitektur Sistem",
    "examinerAvatar": "👨‍🏫",
    "question": "...",
    "contextGap": "..."
  },
  {
    "examinerName": "Prof. Dr. Ir. Wahyu Wibowo, M.Sc.",
    "examinerRole": "Penguji 4 — Kelayakan Ilmiah & Generalisasi Hasil",
    "examinerAvatar": "🧑‍🔬",
    "question": "...",
    "contextGap": "..."
  }
]`;

      const res = await aiFetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const json = await res.json();
      if (json.success && json.text) {
        const clean = json.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(clean);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const newExchanges: DefenseExchange[] = parsed.map((item: any, idx: number) => ({
            id: `q-ai-${Date.now()}-${idx}`,
            examinerName: item.examinerName || 'Dosen Penguji Ahli',
            examinerRole: item.examinerRole || 'Penguji Bidang Keilmuan',
            examinerAvatar: item.examinerAvatar || '👨‍🏫',
            question: item.question,
            contextGap: item.contextGap || 'Menguji ketajaman argumentasi kandidat.',
          }));
          setExchanges((prev) => [...prev, ...newExchanges]);
          setActiveQuestionId(newExchanges[0].id);
          setCurrentInput('');
          return;
        }
      }
      alert('Pertanyaan AI belum tersedia. Hubungkan Gemini dan coba lagi.');
    } catch (err) {
      alert('Pertanyaan AI belum tersedia. Hubungkan Gemini dan coba lagi.');
      console.warn('Failed to generate AI defense questions:', err);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // Speech Recognition Setup
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleSpeechRecognition = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Peramban Anda belum mendukung Web Speech Recognition. Gunakan Google Chrome atau Edge.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        setCurrentInput(transcript.trim());
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Text to Speech for Examiner Question
  const toggleSpeakQuestion = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 1.0;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);
    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleEvaluateAnswer = async () => {
    if (!currentInput.trim()) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setIsEvaluating(true);

    try {
      const prompt = `Analisis jawaban sidang seminar proposal berikut:
Judul Proposal: "${doc.title}"
Pertanyaan Penguji (${activeExchange.examinerName} - ${activeExchange.examinerRole}): "${activeExchange.question}"
Jawaban Mahasiswa: "${currentInput}"

Evaluasi ketahanan argumen secara ketat:
1. Beri Skor (0-100)
2. Kelebihan jawaban (poin singkat)
3. Titik lemah / celah yang masih bisa diserang penguji (poin singkat)
4. Rekomendasi jawaban ideal yang meyakinkan (Gold standard rebuttal)
Format dalam JSON:
{"score": 85, "strengths": ["..."], "weaknesses": ["..."], "idealRebuttal": "...", "thinkingModeAdvice": "..."}`;

      const res = await aiFetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const json = await res.json();
      if (json.success && json.text) {
        try {
          const cleanText = json.text.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanText);
          updateExchange(activeExchange.id, currentInput, parsed.score, parsed);
          setIsEvaluating(false);
          return;
        } catch {
          // fallback
        }
      }
    } catch {
      // fallback
    }

    setIsEvaluating(false);
    alert('Penilaian AI tidak tersedia. Hubungkan kunci Gemini dan coba lagi; jawaban belum diberi nilai.');
  };

  const updateExchange = (id: string, ans: string, score: number, critique: any) => {
    setExchanges((prev) =>
      prev.map((e) => (e.id === id ? { ...e, candidateAnswer: ans, score, critique } : e))
    );
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xl animate-in fade-in duration-300 text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-200">
            <ShieldAlert className="w-5 h-5 text-zinc-700 dark:text-zinc-200" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>Simulasi Sidang Sempro & Uji Pertahanan Akademik</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                AI EXAMINER DEFENSE
              </span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Uji ketahanan proposal Anda menghadapi interogasi kritis dewan penguji dengan dukungan audio & suara
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleGenerateNewQuestions}
            disabled={isGeneratingQuestions}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-black font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGeneratingQuestions ? 'animate-spin' : ''}`} />
            <span>{isGeneratingQuestions ? 'Menyusun Pertanyaan...' : '+ Tambah Pertanyaan AI'}</span>
          </button>
          <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
            {exchanges.filter((e) => e.score).length} / {exchanges.length} Teruji
          </span>
        </div>
      </div>

      {/* Main Layout: Left Questions Navigation, Right Interrogation Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5">
        {/* Left Column: Examiner Question Tabs */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
            Daftar Penguji & Pertanyaan:
          </div>
          {exchanges.map((item) => {
            const isSelected = item.id === activeQuestionId;
            const isAnswered = !!item.score;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveQuestionId(item.id);
                  setCurrentInput(item.candidateAnswer || '');
                  if (isPlayingAudio) {
                    window.speechSynthesis?.cancel();
                    setIsPlayingAudio(false);
                  }
                }}
                className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                  isSelected
                    ? 'bg-zinc-100 dark:bg-zinc-900 border-zinc-400 dark:border-zinc-600 shadow-sm'
                    : 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{item.examinerAvatar}</span>
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">{item.examinerName}</span>
                  </div>
                  {isAnswered ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/40 font-bold">
                      Skor {item.score}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">Belum Dijawab</span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                  {item.question}
                </p>
              </button>
            );
          })}
        </div>

        {/* Right Column: Interrogation Arena */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-4 sm:p-5">
          <div>
            {/* Active Examiner Info */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 mb-4 shadow-xs">
              <span className="text-2xl">{activeExchange.examinerAvatar}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-200">{activeExchange.examinerName}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                      {activeExchange.examinerRole}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleSpeakQuestion(activeExchange.question)}
                      className={`p-1 rounded-md text-xs transition-colors cursor-pointer ${
                        isPlayingAudio 
                          ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950' 
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                      title={isPlayingAudio ? 'Hentikan audio' : 'Dengarkan suara penguji'}
                    >
                      {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 mt-2 leading-relaxed">
                  "{activeExchange.question}"
                </p>
                <div className="mt-2 text-[10px] font-mono text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <HelpCircle className="w-3 h-3 text-zinc-400" />
                  <span>Target Uji Penguji: {activeExchange.contextGap}</span>
                </div>
              </div>
            </div>

            {/* Candidate Answer Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Jawaban Pertahanan Kandidat (Argumen Sidang Anda):
                </label>
                {/* Voice Input Toggle Button */}
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700'
                  }`}
                  title="Jawab menggunakan mikrofon suara"
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-3.5 h-3.5" />
                      <span>Mendengarkan Suara...</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5" />
                      <span>Bicara dengan Suara</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                rows={4}
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="Izin menjawab Dewan Penguji. Berdasarkan kajian pustaka dan analisis awal di lapangan, pemilihan metode ini didasarkan pada..."
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-500 font-sans leading-relaxed resize-none shadow-xs"
              />
            </div>

            {/* Action Button */}
            <div className="flex justify-end mt-2.5">
              <button
                onClick={handleEvaluateAnswer}
                disabled={isEvaluating || !currentInput.trim()}
                className="py-2 px-4 rounded-xl bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white disabled:opacity-40 text-white dark:text-zinc-950 font-semibold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                {isEvaluating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Sedang Menguji Argumen...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> Uji Pertahanan di Depan Penguji
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Feedback & Critique Display */}
          {activeExchange.critique && (
            <div className="mt-5 pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3.5 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-200 flex items-center gap-2">
                  <Award className="w-4 h-4 text-zinc-600 dark:text-zinc-300" /> Hasil Evaluasi Sidang
                </span>
                <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-300 dark:border-emerald-800/40">
                  Skor Kesiapan: {activeExchange.score} / 100
                </span>
              </div>

              {/* Strengths and Weaknesses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300">
                  <div className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Kelebihan Argumen:
                  </div>
                  <ul className="space-y-1 text-[11px] list-disc list-inside text-zinc-600 dark:text-zinc-400">
                    {activeExchange.critique.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300">
                  <div className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mb-1 text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5" /> Celah yang Masih Terbuka:
                  </div>
                  <ul className="space-y-1 text-[11px] list-disc list-inside text-zinc-600 dark:text-zinc-400">
                    {activeExchange.critique.weaknesses.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Ideal Rebuttal */}
              <div className="p-3.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
                <div className="text-[11px] font-mono text-zinc-800 dark:text-zinc-200 font-semibold mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" /> Rekomendasi Jawaban Ideal (Gold Standard Rebuttal):
                </div>
                <p className="text-[11px] text-zinc-700 dark:text-zinc-300 leading-relaxed italic">
                  "{activeExchange.critique.idealRebuttal}"
                </p>
                <div className="mt-2 text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                  💡 Tips Berpikir: {activeExchange.critique.thinkingModeAdvice}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
