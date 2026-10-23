"use client";

import React, { useState } from "react";
import { ProposalDocument } from "@/types/studio";
import { 
  ClipboardList, 
  X, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  Plus, 
  Trash2, 
  RefreshCw,
  FileSpreadsheet,
  MessageSquare,
  Eye,
  Layers
} from "lucide-react";

interface ResearchInstrumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  doc: ProposalDocument;
}

interface QuestionnaireItem {
  id: number;
  variable: string;
  indicator: string;
  questionText: string;
}

export const ResearchInstrumentModal: React.FC<ResearchInstrumentModalProps> = ({
  isOpen,
  onClose,
  doc
}) => {
  const [activeTab, setActiveTab] = useState<"kuesioner" | "wawancara" | "observasi">("kuesioner");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [copied, setCopied] = useState(false);

  // Initial generated Likert questionnaire items
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireItem[]>(() => {
    const defaultVar = doc.category === "magang" ? "Efektivitas Alur Kerja" : "Kinerja Sistem Usulan";
    return [
      {
        id: 1,
        variable: defaultVar,
        indicator: "Kemudahan Penggunaan (Usability)",
        questionText: `Antarmuka dan proses operasional pada ${doc.targetEntity} mudah dipahami dan diakses oleh pengguna tanpa memerlukan pelatihan teknis mendalam.`
      },
      {
        id: 2,
        variable: defaultVar,
        indicator: "Kecepatan Respon (Response Time)",
        questionText: `Waktu pemrosesan data dan transisi antar fitur berjalan cepat serta tidak mengalami hambatan (lagging) saat diuji pada kondisi beban riil.`
      },
      {
        id: 3,
        variable: defaultVar,
        indicator: "Akurasi Hasil (Accuracy & Reliability)",
        questionText: `Keluaran informasi atau hasil pencatatan yang dihasilkan oleh sistem memiliki tingkat keakuratan tinggi dan selaras dengan dokumen acuan.`
      },
      {
        id: 4,
        variable: defaultVar,
        indicator: "Integritas & Keamanan Data (Security)",
        questionText: `Sistem menjamin privasi dan keamanan data penting instansi dari risiko duplikasi, kerusakan, atau akses tanpa izin.`
      },
      {
        id: 5,
        variable: defaultVar,
        indicator: "Dampak Efisiensi Kerja (Impact)",
        questionText: `Implementasi usulan ini mampu mereduksi durasi kerja manual harian secara signifikan dibandingkan prosedur konvensional.`
      }
    ];
  });

  // In-Depth Interview Questions
  const [interviewGuides, setInterviewGuides] = useState<string[]>([
    `Bagaimana alur kerja atau proses penanganan masalah yang saat ini berjalan di unit kerja ${doc.targetEntity}?`,
    `Apa saja kendala teknis dan operasional paling signifikan yang sering menghambat produktivitas tim?`,
    `Sejauh mana kesiapan infrastruktur dan kapabilitas personel dalam mengadopsi solusi inovasi yang diusulkan?`,
    `Kriteria keberhasilan atau metrik apa yang paling krusial menurut Anda untuk menilai efektivitas luaran ini?`,
    `Apa ekspektasi manajemen terhadap kelanjutan dan pemeliharaan hasil proyek ini dalam jangka panjang?`
  ]);

  // Observation Checklist Items
  const [observationChecklist, setObservationChecklist] = useState<string[]>([
    `Ketersediaan perangkat keras dan koneksi jaringan di lingkungan kerja ${doc.targetEntity}.`,
    `Tingkat kepatuhan personel terhadap SOP pencatatan atau pengolahan data eksisting.`,
    `Frekuensi terjadinya galat (human error) pada proses kerja manual per siklus kerja.`,
    `Waktu rata-rata yang dihabiskan untuk menyelesaikan satu siklus transaksi atau analisis data.`
  ]);

  // AI-Powered Instrument Generator
  const handleGenerateAiInstruments = async () => {
    setIsGeneratingAi(true);
    try {
      const prompt = `Bertindaklah sebagai Konsultan Metodologi Penelitian Akademik berstandar Dikti.
Buatkan butir-butir instrumen riset untuk proposal berikut:
Judul: "${doc.title}"
Kategori: "${doc.category}"
Target Objek: "${doc.targetEntity}"

Hasilkan format JSON murni:
{
  "questionnaire": [
    { "variable": "Nama Variabel", "indicator": "Indikator", "questionText": "Pernyataan kuesioner skala Likert..." }
  ],
  "interview": [
    "Pertanyaan wawancara mendalam 1...",
    "Pertanyaan wawancara mendalam 2...",
    "Pertanyaan wawancara mendalam 3..."
  ],
  "observation": [
    "Aspek observasi lapangan 1...",
    "Aspek observasi lapangan 2..."
  ]
}`;

      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      const json = await res.json();
      if (json.success && json.text) {
        const clean = json.text.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(clean);
        if (parsed.questionnaire && Array.isArray(parsed.questionnaire)) {
          setQuestionnaire(parsed.questionnaire.map((q: any, i: number) => ({
            id: i + 1,
            variable: q.variable || "Variabel Penelitian",
            indicator: q.indicator || "Indikator",
            questionText: q.questionText || ""
          })));
        }
        if (parsed.interview && Array.isArray(parsed.interview)) {
          setInterviewGuides(parsed.interview);
        }
        if (parsed.observation && Array.isArray(parsed.observation)) {
          setObservationChecklist(parsed.observation);
        }
      }
    } catch {
      // fallback to existing
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleCopyMarkdown = () => {
    let md = `# LAMPIRAN INSTRUMEN PENELITIAN & PENGUMPULAN DATA\n\n`;
    md += `**Judul:** ${doc.title}\n`;
    md += `**Objek Studi:** ${doc.targetEntity}\n\n`;

    md += `## A. ANGKET KUESIONER PENELITIAN (SKALA LIKERT 1-5)\n`;
    md += `*Petunjuk: 1 = Sangat Tidak Setuju (STS), 2 = Tidak Setuju (TS), 3 = Kurang Setuju (KS), 4 = Setuju (S), 5 = Sangat Setuju (SS)*\n\n`;
    md += `| No | Variabel | Indikator | Pernyataan Instrumen | STS | TS | KS | S | SS |\n`;
    md += `|---|---|---|---|:---:|:---:|:---:|:---:|:---:|\n`;
    questionnaire.forEach((q) => {
      md += `| ${q.id} | ${q.variable} | ${q.indicator} | ${q.questionText} | [ ] | [ ] | [ ] | [ ] | [ ] |\n`;
    });

    md += `\n## B. PEDOMAN WAWANCARA MENDALAM (IN-DEPTH INTERVIEW GUIDE)\n`;
    interviewGuides.forEach((item, i) => {
      md += `${i + 1}. ${item}\n`;
    });

    md += `\n## C. LEMBAR OBSERVASI LAPANGAN\n`;
    observationChecklist.forEach((item, i) => {
      md += `- [ ] ${item}\n`;
    });

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    let csv = `"No","Variabel","Indikator","Pernyataan Kuesioner (Skala 1-5)"\n`;
    questionnaire.forEach((q) => {
      csv += `"${q.id}","${q.variable}","${q.indicator}","${q.questionText.replace(/"/g, '""')}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Instrumen_Kuesioner_${doc.id || "Proposal"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-zinc-900 dark:text-zinc-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/80 dark:bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-800 dark:text-zinc-100">
              <ClipboardList className="w-5 h-5 text-zinc-700 dark:text-zinc-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Generator Instrumen Riset & Angket</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                  LAMPIRAN BAB III
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Kuesioner Skala Likert 1–5, Pedoman Wawancara, dan Lembar Observasi Lapangan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGenerateAiInstruments}
              disabled={isGeneratingAi}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40 shadow-xs"
              title="Generate instrumen otomatis selaras dengan judul dan variabel proposal"
            >
              {isGeneratingAi ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyusun Instrumen...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate AI</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-xs">
          <button
            onClick={() => setActiveTab("kuesioner")}
            className={`pb-2.5 px-2 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "kuesioner"
                ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Kuesioner Likert (1–5)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {questionnaire.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("wawancara")}
            className={`pb-2.5 px-2 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "wawancara"
                ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Pedoman Wawancara</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {interviewGuides.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("observasi")}
            className={`pb-2.5 px-2 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "observasi"
                ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Checklist Observasi</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {observationChecklist.length}
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {activeTab === "kuesioner" && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-[11px] flex items-center justify-between">
                <span>Skala Penilaian: 1 = Sangat Tidak Setuju (STS) &bull; 2 = TS &bull; 3 = Netral/KS &bull; 4 = S &bull; 5 = Sangat Setuju (SS)</span>
                <span className="text-zinc-900 dark:text-zinc-300 font-mono font-semibold">{questionnaire.length} Butir Angket</span>
              </div>

              <div className="space-y-2.5">
                {questionnaire.map((q) => (
                  <div key={q.id} className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-mono text-[10px] flex items-center justify-center font-bold">
                          {q.id}
                        </span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-200">{q.variable}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                          {q.indicator}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                        <span>STS</span>
                        <span>[1]</span>
                        <span>[2]</span>
                        <span>[3]</span>
                        <span>[4]</span>
                        <span>[5]</span>
                        <span>SS</span>
                      </div>
                    </div>
                    <p className="text-zinc-700 dark:text-zinc-300 text-[11px] leading-relaxed pl-7">
                      "{q.questionText}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "wawancara" && (
            <div className="space-y-3">
              <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                Pertanyaan panduan wawancara mendalam untuk menggali aspek kualitatif, hambatan implementasi, dan justifikasi operasional:
              </p>

              <div className="space-y-2">
                {interviewGuides.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-mono text-[10px] flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-zinc-700 dark:text-zinc-300 text-[11px] leading-relaxed">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "observasi" && (
            <div className="space-y-3">
              <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                Checklist pengamatan langsung di lokus {doc.targetEntity} untuk memvalidasi kondisi lapangan sebelum dan sesudah intervensi:
              </p>

              <div className="space-y-2">
                {observationChecklist.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
                    <input
                      type="checkbox"
                      readOnly
                      className="w-4 h-4 rounded bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                    />
                    <span className="text-zinc-700 dark:text-zinc-300 text-[11px]">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 text-xs font-medium transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
              <span>{copied ? "Tersalin!" : "Salin Format MD"}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 text-xs font-medium transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-zinc-500" />
              <span>Unduh CSV</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-semibold text-xs transition-colors cursor-pointer shadow-xs"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
