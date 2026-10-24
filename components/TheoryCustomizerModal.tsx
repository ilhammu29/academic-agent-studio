"use client";

import React, { useState } from "react";
import { X, Sparkles, BookOpen, Plus, Trash2, Check, RefreshCw, Layers } from "lucide-react";
import { BibliographyItem } from "@/types/studio";

interface TheoryItem {
  topic: string;
  elaboration: string;
  citation: string;
}

interface TheoryCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  category: string;
  theories: TheoryItem[];
  bibliography: BibliographyItem[];
  onSave: (updatedTheories: TheoryItem[], updatedBibliography: BibliographyItem[]) => void;
}

export const TheoryCustomizerModal: React.FC<TheoryCustomizerModalProps> = ({
  isOpen,
  onClose,
  title,
  category,
  theories: initialTheories,
  bibliography: initialBib,
  onSave
}) => {
  const [theories, setTheories] = useState<TheoryItem[]>(initialTheories || []);
  const [bibItems, setBibItems] = useState<BibliographyItem[]>(initialBib || []);
  const [isExpanding, setIsExpanding] = useState(false);
  const [selectedCount, setSelectedCount] = useState<number>(13);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Trigger AI generation of N theories (e.g. 13 theories)
  const handleGenerateTheories = async (targetCount: number) => {
    setIsExpanding(true);
    try {
      const res = await fetch("/api/academic/expand-theories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          targetCount,
          currentTheories: theories
        })
      });

      const data = await res.json();
      if (data.success && data.theories && Array.isArray(data.theories)) {
        setTheories(data.theories);
        
        // Merge bibliography items without duplicates
        if (data.bibliography && Array.isArray(data.bibliography)) {
          const mergedBib = [...bibItems];
          data.bibliography.forEach((b: BibliographyItem) => {
            const exists = mergedBib.some(m => m.title.toLowerCase().includes(b.title.toLowerCase().slice(0, 20)));
            if (!exists) {
              mergedBib.push(b);
            }
          });
          setBibItems(mergedBib);
        }
        showToast(`Berhasil menyusun ${data.theories.length} landasan teori & sinkron ke Daftar Pustaka!`);
      }
    } catch (err) {
      console.error("Gagal memperluas teori:", err);
      showToast("Gagal memperluas teori secara online.");
    } finally {
      setIsExpanding(false);
    }
  };

  const handleAddManualTheory = () => {
    const newIdx = theories.length + 1;
    const newTheory: TheoryItem = {
      topic: `Landasan Teori ${newIdx}: [Ketikkan Konsep / Variabel]`,
      elaboration: "Uraikan mekanisme konseptual, dalil teoretis, dan relevansi langsung terhadap pemecahan masalah penelitian ini.",
      citation: "(Penulis, 2024)"
    };
    setTheories([...theories, newTheory]);

    // Add corresponding bibliography stub
    const newBib: BibliographyItem = {
      id: Date.now(),
      author: "Penulis, A.",
      year: "2024",
      title: `Kajian Teoretis Mengenai ${newTheory.topic}`,
      source: "Jurnal Ilmiah Terindeks Nasional, Vol. 12(2), 110-125.",
      doiUrl: "https://doi.org/10.1234/jurnal.2024"
    };
    setBibItems([...bibItems, newBib]);
  };

  const handleUpdateTheory = (index: number, field: keyof TheoryItem, value: string) => {
    const updated = [...theories];
    updated[index] = { ...updated[index], [field]: value };
    setTheories(updated);
  };

  const handleRemoveTheory = (index: number) => {
    const updated = theories.filter((_, i) => i !== index);
    setTheories(updated);
  };

  const handleSave = () => {
    onSave(theories, bibItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Kustomisasi Bab II: Landasan Teori & Jurnal</span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-mono text-[11px] font-semibold">
                  {theories.length} Teori Aktif
                </span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Tentukan jumlah teori dan rujukan ilmiah yang otomatis disinkronkan ke Bab II dan Daftar Pustaka
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

        {/* Quick Batch Actions & AI Depth Controller */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Preset Kedalaman Teori:
            </span>
            {[5, 8, 13, 20].map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => {
                  setSelectedCount(cnt);
                  handleGenerateTheories(cnt);
                }}
                disabled={isExpanding}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  theories.length === cnt
                    ? "bg-indigo-600 text-white font-bold shadow-xs"
                    : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                }`}
              >
                {cnt} Teori {cnt === 13 ? "★ Komprehensif" : cnt === 20 ? "★ Disertasi/Tesis" : ""}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleGenerateTheories(selectedCount)}
              disabled={isExpanding}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors disabled:opacity-50"
            >
              {isExpanding ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>{isExpanding ? "Menyusun via AI..." : `Generate ${selectedCount} Teori via AI`}</span>
            </button>
            
            <button
              type="button"
              onClick={handleAddManualTheory}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Teori Manual</span>
            </button>
          </div>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800 px-4 py-2 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2 font-medium">
            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* List of Theories */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {theories.map((theory, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-2.5 relative group"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-mono text-xs font-bold flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={theory.topic}
                    onChange={(e) => handleUpdateTheory(idx, "topic", e.target.value)}
                    placeholder="Nama Teori / Kerangka Ilmiah..."
                    className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 bg-transparent border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-indigo-500 focus:outline-hidden w-full max-w-lg"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveTheory(idx)}
                  className="p-1 rounded text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer opacity-80 hover:opacity-100"
                  title="Hapus Teori"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Elaboration */}
              <div>
                <label className="text-[11px] font-mono text-zinc-500 block mb-1">
                  Uraian Konseptual & Mekanisme Ilmiah:
                </label>
                <textarea
                  rows={2}
                  value={theory.elaboration}
                  onChange={(e) => handleUpdateTheory(idx, "elaboration", e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              {/* Citation */}
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-mono text-zinc-500 flex-shrink-0">
                  Format Sitasi Dalam Teks:
                </label>
                <input
                  type="text"
                  value={theory.citation}
                  onChange={(e) => handleUpdateTheory(idx, "citation", e.target.value)}
                  placeholder="(Nama Penulis, Tahun)"
                  className="flex-1 px-2.5 py-1 rounded bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-indigo-600 dark:text-indigo-400 font-mono font-medium focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex items-center justify-between">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2 font-mono">
            <Layers className="w-4 h-4 text-indigo-500" />
            <span>Total: <strong>{theories.length} Teori</strong> &bull; Otomatis sinkron ke Daftar Pustaka</span>
          </div>

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
              <span>Simpan & Terapkan ke Bab II</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
