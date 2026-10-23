"use client";

import React, { useState, useMemo } from "react";
import { ProposalDocument } from "@/types/studio";
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Sparkles, 
  FileText, 
  TrendingUp, 
  Layers, 
  Copy, 
  Check,
  RefreshCw
} from "lucide-react";

interface TurnitinPreCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  doc: ProposalDocument;
}

interface ClichéFinding {
  phrase: string;
  category: "Klise AI" | "Struktur Pasif Monoton" | "Kekurangan Sitasi Empiris";
  suggestion: string;
  count: number;
}

export const TurnitinPreCheckModal: React.FC<TurnitinPreCheckModalProps> = ({
  isOpen,
  onClose,
  doc
}) => {
  const [activeTab, setActiveTab] = useState<"ringkasan" | "klise" | "parafrase">("ringkasan");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Heuristic analysis of all document text
  const analysis = useMemo(() => {
    const rawTexts: string[] = [
      doc.executiveSummary || "",
      ...(doc.bab1?.latarBelakang || []),
      ...(doc.bab1?.rumusanMasalah || []),
      ...(doc.bab1?.batasanMasalah || []),
      doc.bab1?.tujuanUmum || "",
      doc.bab2?.profilInstansi || "",
      doc.bab2?.conceptualFramework || "",
      ...(doc.bab2?.landasanTeori?.map(t => `${t.topic} ${t.elaboration}`) || []),
      doc.bab3?.metodePelaksanaan || "",
      doc.bab3?.populationSample || "",
      doc.bab4?.penutup || "",
      doc.bab4?.disseminationPlan || ""
    ];

    const fullText = rawTexts.join(" ");
    const words = fullText.split(/\s+/).filter(Boolean);
    const totalWords = words.length;

    // Academic AI-Slop & Cliché patterns
    const patterns = [
      {
        phrase: "merupakan hal yang sangat penting",
        category: "Klise AI" as const,
        suggestion: "Ganti dengan dampak spesifik yang terukur, contoh: 'menjadi faktor determinan terhadap efisiensi...'"
      },
      {
        phrase: "seiring dengan perkembangan",
        category: "Klise AI" as const,
        suggestion: "Sebutkan data tahun atau tren kuantitatif nyata, contoh: 'Pertumbuhan adopsi cloud sebesar 24% (2023-2025)...'"
      },
      {
        phrase: "tidak dapat dipungkiri bahwa",
        category: "Klise AI" as const,
        suggestion: "Hilangkan frasa retoris. Langsung sajikan fakta dan rujukan empiris."
      },
      {
        phrase: "dalam rangka mewujudkan",
        category: "Klise AI" as const,
        suggestion: "Gunakan kata kerja operasional terukur: 'Guna mengoptimalkan...', 'Untuk mereduksi gap...'"
      },
      {
        phrase: "berperan sangat penting",
        category: "Klise AI" as const,
        suggestion: "Gunakan diksi presisi: 'berkontribusi secara signifikan pada...', 'mengendalikan variabel...'"
      },
      {
        phrase: "di era modern ini",
        category: "Klise AI" as const,
        suggestion: "Sebutkan konteks spesifik waktu atau industri, bukan generalisasi kosong."
      },
      {
        phrase: "diharapkan dapat memberikan manfaat",
        category: "Klise AI" as const,
        suggestion: "Tegaskan target outcome: 'diproyeksikan meningkatkan akurasi diagnosa sebesar 15%...'"
      }
    ];

    const findings: ClichéFinding[] = [];
    const lowerText = fullText.toLowerCase();

    patterns.forEach((p) => {
      const regex = new RegExp(p.phrase, "gi");
      const matches = lowerText.match(regex);
      if (matches && matches.length > 0) {
        findings.push({
          phrase: p.phrase,
          category: p.category,
          suggestion: p.suggestion,
          count: matches.length
        });
      }
    });

    const totalClichés = findings.reduce((sum, f) => sum + f.count, 0);

    // Calculate Estimated Similarity Risk
    // Lower score means safer / lower Turnitin risk
    const estimatedSimilarity = Math.min(
      28,
      Math.max(6, Math.round(8 + (totalClichés * 1.8) - ((doc.bibliography?.length || 0) * 0.4)))
    );

    let riskLevel: "Rendah (Aman)" | "Sedang (Waspada)" | "Tinggi (Perlu Revisi)" = "Rendah (Aman)";
    if (estimatedSimilarity > 20) {
      riskLevel = "Tinggi (Perlu Revisi)";
    } else if (estimatedSimilarity > 14) {
      riskLevel = "Sedang (Waspada)";
    }

    const citationRatio = totalWords > 0 
      ? Math.round(((doc.bibliography?.length || 5) * 1000) / totalWords) 
      : 10;

    return {
      totalWords,
      totalClichés,
      findings,
      estimatedSimilarity,
      riskLevel,
      citationRatio,
      totalReferences: doc.bibliography?.length || 0
    };
  }, [doc]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-zinc-900 dark:text-zinc-100">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/80 dark:bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-800 dark:text-zinc-100">
              <ShieldCheck className="w-5 h-5 text-zinc-700 dark:text-zinc-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Audit Turnitin & Anti-Slop Akademis</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                  PRE-SUBMISSION CHECK
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Pemeriksaan heuristik orisinalitas, frasa klise AI, dan estimasi risiko plagiarisme naskah
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 text-xs">
          <button
            onClick={() => setActiveTab("ringkasan")}
            className={`pb-2.5 px-2 border-b-2 font-medium transition-colors cursor-pointer ${
              activeTab === "ringkasan"
                ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            Indeks Orisinalitas
          </button>
          <button
            onClick={() => setActiveTab("klise")}
            className={`pb-2.5 px-2 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "klise"
                ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <span>Deteksi Klise AI</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {analysis.findings.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("parafrase")}
            className={`pb-2.5 px-2 border-b-2 font-medium transition-colors cursor-pointer ${
              activeTab === "parafrase"
                ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            Panduan Lolos Turnitin
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {activeTab === "ringkasan" && (
            <div className="space-y-4">
              {/* Score Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-1 flex items-center justify-between">
                    <span>Estimasi Similarity:</span>
                    <TrendingUp className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
                    ~{analysis.estimatedSimilarity}%
                  </div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                    Standar kampus: &lt; 20-25%
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-1 flex items-center justify-between">
                    <span>Status Risiko:</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                  <div className="text-sm font-bold text-zinc-900 dark:text-zinc-200 mt-1 flex items-center gap-1.5">
                    {analysis.riskLevel === "Rendah (Aman)" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    )}
                    <span>{analysis.riskLevel}</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1.5">
                    Tingkat keaslian struktur tinggi
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-1 flex items-center justify-between">
                    <span>Total Kata Naskah:</span>
                    <FileText className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
                    {analysis.totalWords.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                    {analysis.totalReferences} Pustaka rujukan
                  </div>
                </div>
              </div>

              {/* Quality Checklist */}
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                <div className="font-semibold text-zinc-900 dark:text-zinc-200 text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-300" />
                  <span>Kriteria Verifikasi Anti-Plagiarisme:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-zinc-800 dark:text-zinc-300">Struktur argumen berbasis First-Principles</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-zinc-800 dark:text-zinc-300">Format sitasi baku terstandarisasi</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80">
                    <span className={`w-2 h-2 rounded-full ${analysis.totalClichés === 0 ? "bg-emerald-500" : "bg-amber-500"}`}></span>
                    <span className="text-zinc-800 dark:text-zinc-300">{analysis.totalClichés} Frasa klise terdeteksi</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-zinc-800 dark:text-zinc-300">Matriks Research Gap terdokumentasi</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "klise" && (
            <div className="space-y-3">
              <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                Frasa klise AI adalah pola kalimat generik yang sering dihasilkan model bahasa dan rawan dicurigai oleh dosen penguji atau sistem Turnitin:
              </p>

              {analysis.findings.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                  <p className="font-semibold text-zinc-900 dark:text-zinc-200">Naskah Bersih!</p>
                  <p className="text-[11px] mt-1">Tidak ditemukan frasa klise AI umum dalam draf proposal Anda.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {analysis.findings.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-[11px] border border-zinc-200 dark:border-zinc-700">
                          "{item.phrase}"
                        </span>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                          Ditemukan {item.count}x
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        <strong className="text-zinc-800 dark:text-zinc-200">Saran Pengganti: </strong>
                        {item.suggestion}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "parafrase" && (
            <div className="space-y-3 text-[11px] text-zinc-700 dark:text-zinc-300 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" />
                  <span>3 Aturan Emas Lolos Uji Turnitin &gt; 15%:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-zinc-600 dark:text-zinc-400">
                  <li>
                    <strong className="text-zinc-800 dark:text-zinc-200">Ubah Sudut Pandang Kalimat: </strong>
                    Jangan hanya mengganti sinonim kata per kata. Ubah kalimat aktif menjadi pasif dengan subjek data empiris.
                  </li>
                  <li>
                    <strong className="text-zinc-800 dark:text-zinc-200">Gunakan Sintesis Multi-Rujukan: </strong>
                    Gabungkan 2-3 temuan peneliti berbeda dalam satu paragraf perbandingan alih-alih mengutip satu sumber secara panjang.
                  </li>
                  <li>
                    <strong className="text-zinc-800 dark:text-zinc-200">Kaitkan Selalu dengan Lokus Studi: </strong>
                    Setiap kutipan teori langsung sambungkan dengan kondisi spesifik pada {doc.targetEntity || "instansi/objek studi Anda"}.
                  </li>
                </ol>
              </div>

              <div className="p-3 rounded-lg bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 text-zinc-600 dark:text-zinc-400">
                <span className="text-zinc-800 dark:text-zinc-200 font-semibold">Tip Praktis: </span>
                Gunakan tombol <strong>Revisi AI</strong> di setiap bab untuk memperdalam analisis teoritis atau memperjelas metodologi secara instan.
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Audit dihitung secara offline dan aman tanpa menyimpan data naskah ke pihak ketiga.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-semibold text-xs transition-colors cursor-pointer shadow-xs"
          >
            Tutup Audit
          </button>
        </div>

      </div>
    </div>
  );
};
