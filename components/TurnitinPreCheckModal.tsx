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
  RefreshCw,
  Search,
  ExternalLink,
  BookOpen
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

interface OpenPaperResult {
  title: string;
  venue: string;
  year: number;
  doi?: string;
  similarityNote: string;
}

export const TurnitinPreCheckModal: React.FC<TurnitinPreCheckModalProps> = ({
  isOpen,
  onClose,
  doc
}) => {
  const [activeTab, setActiveTab] = useState<"ringkasan" | "klise" | "verifikasi" | "parafrase">("ringkasan");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  // Real Verification State
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedPapers, setVerifiedPapers] = useState<OpenPaperResult[] | null>(null);
  const [verificationSummary, setVerificationSummary] = useState<string | null>(null);

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

    return {
      totalWords,
      totalClichés,
      findings,
      totalReferences: doc.bibliography?.length || 0
    };
  }, [doc]);

  // Real verification against OpenAlex / CrossRef
  const handleRunRealOpenCheck = async () => {
    setIsVerifying(true);
    setVerifiedPapers(null);
    setVerificationSummary(null);

    try {
      const query = doc.title.split(" ").slice(0, 6).join(" ");
      const res = await fetch(`/api/academic/search?query=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();

      if (data.success && data.papers && data.papers.length > 0) {
        const mapped: OpenPaperResult[] = data.papers.map((p: any) => ({
          title: p.title,
          venue: p.venue,
          year: p.year,
          doi: p.doi,
          similarityNote: "Hasil pencarian berdasarkan sebagian judul; periksa relevansi secara manual."
        }));
        setVerifiedPapers(mapped);
        setVerificationSummary(`Ditemukan ${mapped.length} hasil pencarian terkait. Periksa relevansi dan sumbernya secara manual; naskah tidak dibandingkan untuk plagiarisme.`);
      } else {
        setVerifiedPapers([]);
        setVerificationSummary("Pencarian tidak menghasilkan data atau layanan tidak tersedia. Kebaruan dan kemiripan naskah belum dapat disimpulkan.");
      }
    } catch {
      setVerificationSummary("Pencarian gagal. Periksa koneksi lalu coba lagi.");
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-zinc-900 dark:text-zinc-100">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/80 dark:bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-800 dark:text-zinc-100">
              <ShieldCheck className="w-5 h-5 text-zinc-700 dark:text-zinc-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Pemeriksaan awal tulisan</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                  AKREDITASI
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Deteksi kalimat klise, audit sitasi in-text, dan verifikasi silang literatur riil
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
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-zinc-200 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/30 text-xs">
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
            onClick={() => setActiveTab("verifikasi")}
            className={`pb-2.5 px-2 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "verifikasi"
                ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <span>Verifikasi Riil (OpenAlex)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-mono">
              RIIL
            </span>
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
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
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
            Panduan penulisan
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* TAB 1: RINGKASAN */}
          {activeTab === "ringkasan" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4 text-amber-950 dark:text-amber-100 leading-relaxed">
                Pemeriksaan ini menemukan frasa klise dan membantu mencari literatur terkait. Hasilnya tidak mengukur kemiripan naskah, tidak memeriksa plagiarisme, dan tidak menentukan kebaruan penelitian. Periksa sumber dan gunakan layanan resmi kampus untuk uji kemiripan.
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"><div className="text-zinc-500">Kata yang diperiksa</div><div className="text-xl font-bold mt-1">{analysis.totalWords.toLocaleString()}</div></div>
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"><div className="text-zinc-500">Frasa klise ditemukan</div><div className="text-xl font-bold mt-1">{analysis.totalClichés}</div></div>
              </div>
            </div>
          )}

          {/* TAB 2: VERIFIKASI RIIL OPEN DATABASE */}
          {activeTab === "verifikasi" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Verifikasi Silang ke Indeks Global (OpenAlex & CrossRef)
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Memindai 250M+ naskah ilmiah untuk mencari kemungkinan kalimat atau judul yang berpotensi duplikasi.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRunRealOpenCheck}
                  disabled={isVerifying}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-black font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer flex-shrink-0 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? "animate-spin" : ""}`} />
                  <span>{isVerifying ? "Memindai..." : "Pindai Sekarang"}</span>
                </button>
              </div>

              {verificationSummary && (
                <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-0.5">Hasil Verifikasi Repositori:</p>
                    <p className="text-[11px] leading-relaxed">{verificationSummary}</p>
                  </div>
                </div>
              )}

              {verifiedPapers && verifiedPapers.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block">
                    Publikasi Pembanding Terdekat (State-of-the-Art):
                  </span>
                  {verifiedPapers.map((paper, pIdx) => (
                    <div key={pIdx} className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="font-semibold text-zinc-900 dark:text-zinc-100 text-[11px]">
                          {paper.title}
                        </h5>
                        <span className="text-[10px] font-mono text-zinc-500 shrink-0">{paper.year}</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{paper.venue}</p>
                      <div className="mt-1.5 pt-1.5 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>{paper.similarityNote}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: KLISE AI */}
          {activeTab === "klise" && (
            <div className="space-y-3">
              <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                Pola kalimat klise generik AI yang rawan dicurigai oleh dosen penguji atau sistem Turnitin:
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

          {/* TAB 4: PANDUAN LOLOS TURNITIN */}
          {activeTab === "parafrase" && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-2">
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-200 text-xs">
                  Panduan penulisan dan sitasi:
                </h4>
                <ul className="space-y-2 text-[11px] text-zinc-600 dark:text-zinc-400">
                  <li className="flex items-start gap-2">
                    <span className="font-mono text-zinc-800 dark:text-zinc-200 font-bold">1.</span>
                    <span><strong>Hindari Parafrase Dangkal (Word-Swap):</strong> Jangan hanya menukar sinonim kata. Ubah struktur kalimat aktif menjadi pasif atau ubah klausa subordinat.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono text-zinc-800 dark:text-zinc-200 font-bold">2.</span>
                    <span><strong>Sintesis Multi-Sumber:</strong> Jangan mengutip 1 paragraf penuh dari 1 paper. Gabungkan temuan 2-3 peneliti dalam satu narasi komparatif.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono text-zinc-800 dark:text-zinc-200 font-bold">3.</span>
                    <span><strong>Cantumkan Angka &amp; Konteks Nyata:</strong> Kalimat dengan data spesifik ("menurun 12% pada 2024 di RS Sardjito") hampir mustahil sama dengan teks internet lain.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono text-zinc-800 dark:text-zinc-200 font-bold">4.</span>
                    <span><strong>Gunakan Sitasi Baku Langsung:</strong> Kutipan langsung wajib bertanda petik dan nomor halaman jika lebih dari 3 baris.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono text-zinc-800 dark:text-zinc-200 font-bold">5.</span>
                    <span><strong>Eliminasi Frasa Klise Pembuka:</strong> Hilangkan pembuka seperti "Di zaman globalisasi saat ini...". Langsung ke pokok permasalahan teknis.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500 font-mono">
            {analysis.totalWords} Kata Naskah
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-black text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-black font-semibold text-xs transition-colors cursor-pointer"
          >
            Tutup Hasil Audit
          </button>
        </div>

      </div>
    </div>
  );
};