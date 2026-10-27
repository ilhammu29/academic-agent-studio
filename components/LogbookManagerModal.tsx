"use client";
import { aiFetch } from "@/lib/aiClient";

import React, { useState } from "react";
import { X, CalendarDays, Plus, Trash2, Check, Sparkles, Download, Clock, CheckCircle2 } from "lucide-react";
import { LogbookEntry, WeeklyScheduleItem } from "@/types/studio";

interface LogbookManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  category: string;
  targetEntity: string;
  scheduleMatrix?: WeeklyScheduleItem[];
  entries: LogbookEntry[];
  onSave: (updatedEntries: LogbookEntry[]) => void;
}

export const LogbookManagerModal: React.FC<LogbookManagerModalProps> = ({
  isOpen,
  onClose,
  title,
  category,
  targetEntity,
  scheduleMatrix = [],
  entries: initialEntries,
  onSave
}) => {
  const [entries, setEntries] = useState<LogbookEntry[]>(() => initialEntries || []);

  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  if (!isOpen) return null;

  const handleAddRow = () => {
    const newEntry: LogbookEntry = {
      id: `log-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      timeRange: "08:00 - 16:00",
      activity: "Uraikan aktivitas dan capaian penugasan...",
      output: "Luaran / bukti pekerjaan",
      mentorFeedback: "Menunggu catatan pembimbing...",
      status: "pending"
    };
    setEntries([...entries, newEntry]);
  };

  const handleUpdate = (idx: number, field: keyof LogbookEntry, val: any) => {
    const updated = [...entries];
    updated[idx] = { ...updated[idx], [field]: val };
    setEntries(updated);
  };

  const handleRemove = (idx: number) => {
    setEntries(entries.filter((_, i) => i !== idx));
  };

  // AI Generator: Auto-populate 8 structured weekly logbook rows based on title & schedule
  const handleAutoFillAi = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await aiFetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `
Sebagai Mentor Pembimbing Lapangan Magang/Penelitian Standar Dikti, buatkan 8 BARIS CATATAN LOGBOOK AKTIVITAS HARIAN/MINGGUAN YANG REALISTIS DAN FORMAL untuk:
- Judul: "${title}"
- Instansi/Lokus: "${targetEntity}"
- Kategori: "${category}"

Format JSON:
{
  "logs": [
    {
      "date": "2026-03-02",
      "timeRange": "08:00 - 16:30",
      "activity": "Uraian tugas teknis formal...",
      "output": "Luaran konkret...",
      "mentorFeedback": "",
      "status": "pending"
    }
  ]
}
`
        })
      });

      const data = await res.json();
      if (!res.ok || !data.text) throw new Error(data.error || "AI belum tersedia");
      if (data.text) {
        let clean = data.text.trim();
        if (clean.includes("```json")) {
          clean = clean.split("```json")[1].split("```")[0].trim();
        } else if (clean.includes("```")) {
          clean = clean.split("```")[1].split("```")[0].trim();
        }
        const parsed = JSON.parse(clean);
        if (parsed.logs && Array.isArray(parsed.logs)) {
          const formatted = parsed.logs.map((l: any, i: number) => ({
            id: `log-ai-${Date.now()}-${i}`,
            date: l.date || new Date().toISOString().split("T")[0],
            timeRange: l.timeRange || "08:00 - 16:00",
            activity: `[Draf saran, perlu dikonfirmasi] ${l.activity || "Aktivitas penugasan lapangan..."}`,
            output: l.output || "Dokumen luaran",
            mentorFeedback: "",
            status: "pending"
          }));
          setEntries(formatted);
        }
      }
    } catch (err) {
      console.warn("AI Logbook autofill failed:", err);
      alert("Saran AI tidak tersedia. Hubungkan Gemini dan coba lagi.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSave = () => {
    onSave(entries);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Buku Catatan Aktivitas Lapangan (Logbook Harian & Mingguan)</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono text-[11px] font-semibold">
                  {entries.length} Catatan Kegiatan
                </span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Logbook resmi untuk verifikasi jam kerja, bukti kehadiran, dan paraf pembimbing lapangan
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

        {/* Toolbar */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-zinc-600 dark:text-zinc-400 font-mono">
            Instansi Mitra: <strong>{targetEntity || "Lokus Mitra"}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAutoFillAi}
              disabled={isGeneratingAi}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGeneratingAi ? "Menyusun Logbook via AI..." : "Isi Otomatis 8 Minggu via AI"}</span>
            </button>
            <button
              type="button"
              onClick={handleAddRow}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-zinc-100"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Baris Log</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="p-5 overflow-y-auto flex-1">
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">No</th>
                  <th className="py-2.5 px-3 w-32">Tanggal & Waktu</th>
                  <th className="py-2.5 px-3">Uraian Aktivitas & Capaian Pekerjaan</th>
                  <th className="py-2.5 px-3 w-44">Target Luaran</th>
                  <th className="py-2.5 px-3 w-36">Catatan Pembimbing</th>
                  <th className="py-2.5 px-3 w-28 text-center">Status Paraf</th>
                  <th className="py-2.5 px-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-850 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200">
                {entries.map((item, idx) => (
                  <tr key={item.id} className="align-top hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40">
                    <td className="py-3 px-3 text-center font-mono font-bold text-zinc-500">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-3 space-y-1">
                      <input
                        type="date"
                        value={item.date}
                        onChange={(e) => handleUpdate(idx, "date", e.target.value)}
                        className="w-full px-2 py-1 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 font-mono text-[11px]"
                      />
                      <input
                        type="text"
                        value={item.timeRange}
                        onChange={(e) => handleUpdate(idx, "timeRange", e.target.value)}
                        placeholder="08:00 - 16:00"
                        className="w-full px-2 py-1 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 font-mono text-[11px]"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <textarea
                        rows={2}
                        value={item.activity}
                        onChange={(e) => handleUpdate(idx, "activity", e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-xs leading-relaxed"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        value={item.output}
                        onChange={(e) => handleUpdate(idx, "output", e.target.value)}
                        placeholder="Hasil capaian..."
                        className="w-full px-2 py-1 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-xs"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        value={item.mentorFeedback || ""}
                        onChange={(e) => handleUpdate(idx, "mentorFeedback", e.target.value)}
                        placeholder="Catatan mentor..."
                        className="w-full px-2 py-1 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-xs italic"
                      />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <select
                        value={item.status}
                        onChange={(e) => handleUpdate(idx, "status", e.target.value)}
                        className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer border ${
                          item.status === "verified"
                            ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300"
                            : "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300"
                        }`}
                      >
                        <option value="verified">✓ Terverifikasi</option>
                        <option value="pending">⏳ Menunggu</option>
                        <option value="revised">↺ Perbaikan</option>
                      </select>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemove(idx)}
                        className="p-1 rounded text-zinc-400 hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex items-center justify-between">
          <span className="text-xs text-zinc-500 font-mono">
            Logbook otomatis disematkan pada <strong>Lampiran Dokumen Akhir</strong>.
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
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Simpan & Terapkan Logbook</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
