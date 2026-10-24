"use client";

import React, { useState } from "react";
import { X, Image as ImageIcon, Upload, Plus, Trash2, Check, Sparkles, Layers, ArrowRight } from "lucide-react";
import { DocumentFigureItem } from "@/types/studio";

interface DocumentImageManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  docTitle: string;
  figures: DocumentFigureItem[];
  onSave: (updatedFigures: DocumentFigureItem[]) => void;
}

export const DocumentImageManagerModal: React.FC<DocumentImageManagerModalProps> = ({
  isOpen,
  onClose,
  docTitle,
  figures: initialFigures,
  onSave
}) => {
  const [figures, setFigures] = useState<DocumentFigureItem[]>(initialFigures || []);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [isRecommending, setIsRecommending] = useState(false);
  const [aiRationale, setAiRationale] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddNewFigure = () => {
    const chapter = "bab3";
    const existingInChapter = figures.filter(f => f.chapterKey === chapter).length + 1;
    const newFig: DocumentFigureItem = {
      id: `fig-${Date.now()}`,
      chapterKey: chapter,
      subSectionKey: "3.2",
      figureNumber: `Gambar 3.${existingInChapter}`,
      title: "Bagan Alir Alur Pelaksanaan Sistem",
      caption: "Bagan alir tahapan akuisisi data, pra-pemrosesan, dan evaluasi hasil.",
      imageUrl: "",
      sourceText: "Dokumentasi Primer Tim Pengusul (2026)"
    };
    setFigures([...figures, newFig]);
    setActiveIdx(figures.length);
  };

  const handleFileUpload = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const updated = [...figures];
        updated[idx] = { ...updated[idx], imageUrl: dataUrl };
        setFigures(updated);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateFigure = (idx: number, field: keyof DocumentFigureItem, val: any) => {
    const updated = [...figures];
    updated[idx] = { ...updated[idx], [field]: val };

    // Auto-update figure number based on chapter
    if (field === "chapterKey") {
      const chNum = val === "bab1" ? "1" : val === "bab2" ? "2" : val === "bab3" ? "3" : val === "bab4" ? "4" : val === "bab5" ? "5" : "L";
      const countInCh = updated.filter((f, i) => f.chapterKey === val && i <= idx).length;
      updated[idx].figureNumber = `Gambar ${chNum}.${countInCh}`;
    }

    setFigures(updated);
  };

  const handleRemoveFigure = (idx: number) => {
    setFigures(figures.filter((_, i) => i !== idx));
    if (activeIdx >= figures.length - 1) {
      setActiveIdx(Math.max(0, figures.length - 2));
    }
  };

  // AI Recommendation for best placement location
  const handleAiRecommendation = async (idx: number) => {
    const fig = figures[idx];
    if (!fig) return;

    setIsRecommending(true);
    setAiRationale(null);

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `
Sebagai Reviewer Naskah Akademik Dikti, berikan rekomendasi penempatan bab dan nomor sub-bab terbaik untuk gambar/diagram berikut:
- Judul Riset: "${docTitle}"
- Judul Gambar: "${fig.title}"
- Deskripsi/Keterangan Gambar: "${fig.caption}"

PILIHAN BAB:
1. "bab2" - Tinjauan Pustaka / Kerangka Berpikir / Model Teoretis
2. "bab3" - Metodologi Penelitian / Bagan Alir Pelaksanaan / Arsitektur Sistem / Pipeline
3. "bab4" - Hasil & Pembahasan / Hasil Uji Coba / Screenshot Antarmuka / Grafik Data
4. "bab5" - Rencana Implementasi / Roadmap Keberlanjutan

Jawab HANYA dalam JSON valid:
{
  "recommendedChapter": "bab3",
  "recommendedSubSection": "3.2",
  "rationale": "Diagram ini menggambarkan alur metodologis sistem, sehingga paling tepat diletakkan pada Bab III Sub-bab 3.2 (Bagan Alir Penelitian)."
}
`
        })
      });

      const data = await res.json();
      if (data.text) {
        let clean = data.text.trim();
        if (clean.includes("```json")) {
          clean = clean.split("```json")[1].split("```")[0].trim();
        } else if (clean.includes("```")) {
          clean = clean.split("```")[1].split("```")[0].trim();
        }
        const parsed = JSON.parse(clean);
        if (parsed.recommendedChapter) {
          const ch = parsed.recommendedChapter as any;
          const chNum = ch === "bab1" ? "1" : ch === "bab2" ? "2" : ch === "bab3" ? "3" : ch === "bab4" ? "4" : ch === "bab5" ? "5" : "L";
          const countInCh = figures.filter((f, i) => f.chapterKey === ch && i !== idx).length + 1;

          const updated = [...figures];
          updated[idx] = {
            ...updated[idx],
            chapterKey: ch,
            subSectionKey: parsed.recommendedSubSection || "3.2",
            figureNumber: `Gambar ${chNum}.${countInCh}`,
            placementRationale: parsed.rationale
          };
          setFigures(updated);
          setAiRationale(parsed.rationale);
        }
      }
    } catch (err) {
      console.warn("AI recommendation failed, using rule-based recommendation:", err);
      // Heuristic fallback
      const t = `${fig.title} ${fig.caption}`.toLowerCase();
      let ch: any = "bab3";
      let sub = "3.2";
      let rationale = "Diagram alir proses ditempatkan pada Bab III Metodologi.";
      if (t.match(/kerangka|teori|konsep|prisma|literatur/i)) {
        ch = "bab2";
        sub = "2.3";
        rationale = "Kerangka berpikir/teoretis ditempatkan pada Bab II Tinjauan Pustaka.";
      } else if (t.match(/hasil|grafik|screenshot|ui|antarmuka|evaluasi|akurasi|tampilan/i)) {
        ch = "bab4";
        sub = "4.2";
        rationale = "Hasil pengujian dan antarmuka ditempatkan pada Bab IV Hasil & Pembahasan.";
      }

      const chNum = ch === "bab1" ? "1" : ch === "bab2" ? "2" : ch === "bab3" ? "3" : ch === "bab4" ? "4" : ch === "bab5" ? "5" : "L";
      const countInCh = figures.filter((f, i) => f.chapterKey === ch && i !== idx).length + 1;

      const updated = [...figures];
      updated[idx] = {
        ...updated[idx],
        chapterKey: ch,
        subSectionKey: sub,
        figureNumber: `Gambar ${chNum}.${countInCh}`,
        placementRationale: rationale
      };
      setFigures(updated);
      setAiRationale(rationale);
    } finally {
      setIsRecommending(false);
    }
  };

  const handleSave = () => {
    onSave(figures);
    onClose();
  };

  const currentFig = figures[activeIdx];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Manajemen Gambar & Diagram Bab (Bab 2, 3, 4, 5)</span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-[11px] font-semibold">
                  {figures.length} Gambar Terdaftar
                </span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Sisipkan gambar/diagram ke bab yang sesuai dengan rekomendasi AI dan otomatis terdaftar di Daftar Gambar
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body: Sidebar List & Editor Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Column: Figures List */}
          <div className="w-full md:w-72 border-r border-zinc-200 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/30 p-3 space-y-2 overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-[11px] font-mono uppercase text-zinc-500 font-semibold">
                Daftar Gambar Dokumen
              </span>
              <button
                type="button"
                onClick={handleAddNewFigure}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Tambah</span>
              </button>
            </div>

            {figures.length === 0 ? (
              <p className="text-xs text-zinc-400 text-center py-6">
                Belum ada gambar yang disisipkan.
              </p>
            ) : (
              figures.map((fig, idx) => {
                const isSelected = idx === activeIdx;
                return (
                  <div
                    key={fig.id}
                    onClick={() => setActiveIdx(idx)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                      isSelected
                        ? "bg-white dark:bg-zinc-900 border-indigo-500 shadow-xs ring-1 ring-indigo-500/20"
                        : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                        {fig.figureNumber}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase">
                        {(fig.chapterKey || "bab3").toUpperCase()}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                      {fig.title}
                    </p>

                    <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                      <span>{fig.imageUrl ? "✓ Gambar siap" : "⚠ Belum ada file"}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Detail & Uploader */}
          {currentFig ? (
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Edit: {currentFig.figureNumber} - {currentFig.title}
                  </h4>
                  <p className="text-xs text-zinc-500">
                    Tentukan penempatan bab, judul gambar resmi, dan upload diagram
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAiRecommendation(activeIdx)}
                    disabled={isRecommending}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-800 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isRecommending ? "Menganalisis..." : "Rekomendasi Lokasi AI"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveFigure(activeIdx)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>

              {/* AI Rationale banner if available */}
              {(aiRationale || currentFig.placementRationale) && (
                <div className="p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-800 dark:text-indigo-200 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Rekomendasi AI:</strong> {aiRationale || currentFig.placementRationale}
                  </p>
                </div>
              )}

              {/* Title & Chapter Placement Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Judul Keterangan Gambar (Caption):
                  </label>
                  <input
                    type="text"
                    value={currentFig.title}
                    onChange={(e) => handleUpdateFigure(activeIdx, "title", e.target.value)}
                    placeholder="misal: Bagan Alir Tahapan Pra-pemrosesan Data"
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-indigo-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Ditempatkan di Bab:
                  </label>
                  <select
                    value={currentFig.chapterKey}
                    onChange={(e) => handleUpdateFigure(activeIdx, "chapterKey", e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="bab1">Bab I: Pendahuluan</option>
                    <option value="bab2">Bab II: Tinjauan Pustaka</option>
                    <option value="bab3">Bab III: Metodologi / Pipeline</option>
                    <option value="bab4">Bab IV: Hasil & Jadwal</option>
                    <option value="bab5">Bab V: Kesimpulan & Mitigasi</option>
                    <option value="lampiran">Lampiran Dokumen</option>
                  </select>
                </div>
              </div>

              {/* Image Upload Area */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                  File Gambar Diagram / Bagan / Foto:
                </label>
                {currentFig.imageUrl ? (
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-850 space-y-2 text-center">
                    <div className="max-h-56 overflow-hidden rounded-lg border bg-white flex items-center justify-center p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={currentFig.imageUrl} alt={currentFig.title} className="max-h-52 object-contain" />
                    </div>
                    <p className="text-[11px] font-mono font-bold text-zinc-800 dark:text-zinc-200">
                      {currentFig.figureNumber} {currentFig.title}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleUpdateFigure(activeIdx, "imageUrl", "")}
                      className="text-xs text-rose-500 hover:underline cursor-pointer"
                    >
                      Ganti Gambar Lain
                    </button>
                  </div>
                ) : (
                  <div className="relative border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp, image/svg+xml"
                      onChange={(e) => handleFileUpload(activeIdx, e)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-6 h-6 text-zinc-400 mx-auto mb-1.5" />
                    <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Klik atau seret file gambar diagram ke sini (.png, .jpg, .svg)
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      Bagan alir, arsitektur sistem, skema rangkaian, atau dokumentasi
                    </p>
                  </div>
                )}
              </div>

              {/* Caption Description & Source */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                  Keterangan & Sumber Gambar:
                </label>
                <input
                  type="text"
                  value={currentFig.sourceText || ""}
                  onChange={(e) => handleUpdateFigure(activeIdx, "sourceText", e.target.value)}
                  placeholder="Sumber: Olahan Data Penelitian (2026) / Dokumentasi Lapangan"
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-400">
              <ImageIcon className="w-12 h-12 text-zinc-300 mb-2" />
              <p className="text-xs">Pilih gambar di sebelah kiri atau tambah gambar baru.</p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex items-center justify-between">
          <span className="text-xs text-zinc-500 font-mono">
            Seluruh gambar otomatis terindeks pada halaman <strong>Daftar Gambar</strong>.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Terapkan Gambar ke Bab Dokumen</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
