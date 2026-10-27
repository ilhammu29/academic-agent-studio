"use client";
import { aiFetch } from "@/lib/aiClient";

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
      const res = await aiFetch("/api/academic/expand-theories", {
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
        showToast(`${data.theories.length} saran teori disusun. Periksa seluruh sumber sebelum digunakan.`);
      } else {
        showToast(data.error || "Perluasan teori tidak tersedia. Hubungkan Gemini dan coba lagi.");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0B101A] border border-[#E2E8F0] dark:border-[#253149] rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0] dark:border-[#253149] bg-[#F8FAFC] dark:bg-[#111827]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#7C9CFF]/15 border border-[#7C9CFF]/30 flex items-center justify-center text-[#7C9CFF]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F3F6FC] flex items-center gap-2">
                <span>Kustomisasi Bab II: Landasan Teori &amp; Jurnal</span>
                <span className="px-2 py-0.5 rounded-md bg-[#7C9CFF]/15 text-[#7C9CFF] font-mono text-[11px] font-semibold border border-[#7C9CFF]/30">
                  {theories.length} Teori Aktif
                </span>
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#A4B1C7]">
                Tentukan jumlah teori dan rujukan ilmiah yang otomatis disinkronkan ke Bab II dan Daftar Pustaka
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] dark:text-[#A4B1C7] hover:text-[#0F172A] dark:hover:text-[#F3F6FC] hover:bg-[#F1F5F9] dark:hover:bg-[#172033] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Batch Actions & AI Depth Controller */}
        <div className="p-4 bg-[#F8FAFC] dark:bg-[#080B12] border-b border-[#E2E8F0] dark:border-[#253149] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#0F172A] dark:text-[#F3F6FC]">
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
                    ? "bg-[#7C9CFF] text-[#080B12] font-bold shadow-2xs"
                    : "bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F3F6FC] border border-[#E2E8F0] dark:border-[#253149] hover:border-[#7C9CFF]"
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
              className="px-3 py-1.5 rounded-lg bg-[#7C9CFF] hover:bg-[#688bf5] text-[#080B12] text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors disabled:opacity-50"
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
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#253149] text-[#0F172A] dark:text-[#F3F6FC] text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-[#F1F5F9] dark:hover:bg-[#172033]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Teori Manual</span>
            </button>
          </div>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="bg-[#34D399]/15 border-b border-[#34D399]/30 px-4 py-2 text-xs text-[#34D399] flex items-center gap-2 font-medium">
            <Check className="w-4 h-4 text-[#34D399] flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* List of Theories */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {theories.map((theory, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#111827]/70 border border-[#E2E8F0] dark:border-[#253149] space-y-2.5 relative group"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-[#7C9CFF]/15 text-[#7C9CFF] font-mono text-xs font-bold flex items-center justify-center border border-[#7C9CFF]/30">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={theory.topic}
                    onChange={(e) => handleUpdateTheory(idx, "topic", e.target.value)}
                    placeholder="Nama Teori / Kerangka Ilmiah..."
                    className="font-semibold text-xs sm:text-sm text-[#0F172A] dark:text-[#F3F6FC] bg-transparent border-b border-transparent hover:border-[#E2E8F0] dark:hover:border-[#253149] focus:border-[#7C9CFF] focus:outline-hidden w-full max-w-lg"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveTheory(idx)}
                  className="p-1 rounded text-[#64748B] hover:text-rose-500 transition-colors cursor-pointer opacity-80 hover:opacity-100"
                  title="Hapus Teori"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Elaboration */}
              <div>
                <label className="text-[11px] font-mono text-[#64748B] dark:text-[#A4B1C7] block mb-1">
                  Uraian Konseptual &amp; Mekanisme Ilmiah:
                </label>
                <textarea
                  rows={2}
                  value={theory.elaboration}
                  onChange={(e) => handleUpdateTheory(idx, "elaboration", e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#0B101A] border border-[#E2E8F0] dark:border-[#253149] text-xs text-[#0F172A] dark:text-[#F3F6FC] leading-relaxed focus:outline-hidden focus:border-[#7C9CFF]"
                />
              </div>

              {/* Citation */}
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-mono text-[#64748B] dark:text-[#A4B1C7] flex-shrink-0">
                  Format Sitasi Dalam Teks:
                </label>
                <input
                  type="text"
                  value={theory.citation}
                  onChange={(e) => handleUpdateTheory(idx, "citation", e.target.value)}
                  placeholder="(Nama Penulis, Tahun)"
                  className="flex-1 px-2.5 py-1 rounded bg-white dark:bg-[#0B101A] border border-[#E2E8F0] dark:border-[#253149] text-xs text-[#7C9CFF] font-mono font-medium focus:outline-hidden focus:border-[#7C9CFF]"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E2E8F0] dark:border-[#253149] bg-[#F8FAFC] dark:bg-[#111827] flex items-center justify-between">
          <div className="text-xs text-[#64748B] dark:text-[#A4B1C7] flex items-center gap-2 font-mono">
            <Layers className="w-4 h-4 text-[#7C9CFF]" />
            <span>Total: <strong>{theories.length} Teori</strong> &bull; Otomatis sinkron ke Daftar Pustaka</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-[#64748B] dark:text-[#A4B1C7] hover:bg-[#F1F5F9] dark:hover:bg-[#172033] transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-[#7C9CFF] hover:bg-[#688bf5] text-[#080B12] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Simpan &amp; Terapkan ke Bab II</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
