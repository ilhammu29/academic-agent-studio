"use client";

import React, { useState } from "react";
import { X, FileText, Check, Sparkles, Plus, Trash2, Award, UserCheck, Calendar } from "lucide-react";
import { DefenseMinutesInfo } from "@/types/studio";

interface DefenseMinutesModalProps {
  isOpen: boolean;
  onClose: () => void;
  docTitle: string;
  candidateName: string;
  candidateId: string;
  institution: string;
  minutes?: DefenseMinutesInfo;
  onSave: (updatedMinutes: DefenseMinutesInfo) => void;
}

export const DefenseMinutesModal: React.FC<DefenseMinutesModalProps> = ({
  isOpen,
  onClose,
  docTitle,
  candidateName,
  candidateId,
  institution,
  minutes: initialMinutes,
  onSave
}) => {
  const [minutes, setMinutes] = useState<DefenseMinutesInfo>(() => {
    if (initialMinutes) {
      return {
        ...initialMinutes,
        examiners: initialMinutes.examiners || [
          { role: "Ketua Dewan Penguji", name: "Prof. Dr. Ir. Budi Santoso, M.Sc.", nip: "197203151998021001", attendance: "hadir" },
          { role: "Sekretaris Penguji / Pembimbing I", name: "Dr. Ir. Hendro Prabowo, M.T.", nip: "197805122003121002", attendance: "hadir" },
          { role: "Anggota Penguji Utama", name: "Ratna Kusuma Dewi, S.T., M.Sc.", nip: "198509142010122004", attendance: "hadir" }
        ],
        revisionNotes: initialMinutes.revisionNotes || [
          "Perjelas batasan sampel dan teknik pengambilan data pada Bab III Sub-bab 3.2.",
          "Mutakhirkan rujukan landasan teori primer di Bab II dengan publikasi 5 tahun terakhir.",
          "Tambahkan matriks mitigasi risiko operasional pada Bab V."
        ]
      };
    }
    return {
      id: `minutes-${Date.now()}`,
      sessionType: "seminar_proposal",
      date: new Date().toISOString().split("T")[0],
      time: "09:30 - 11:30 WIB",
      roomOrPlatform: "Ruang Sidang Senat Akademik / Daring Zoom",
      examiners: [
        { role: "Ketua Dewan Penguji", name: "Prof. Dr. Ir. Budi Santoso, M.Sc.", nip: "197203151998021001", attendance: "hadir" },
        { role: "Sekretaris Penguji / Pembimbing I", name: "Dr. Ir. Hendro Prabowo, M.T.", nip: "197805122003121002", attendance: "hadir" },
        { role: "Anggota Penguji Utama", name: "Ratna Kusuma Dewi, S.T., M.Sc.", nip: "198509142010122004", attendance: "hadir" }
      ],
      candidateScore: 86.5,
      gradeResult: "Lulus dengan Revisi Minor",
      revisionNotes: [
        "Perjelas batasan sampel dan teknik pengambilan data pada Bab III Sub-bab 3.2.",
        "Mutakhirkan rujukan landasan teori primer di Bab II dengan publikasi 5 tahun terakhir.",
        "Tambahkan matriks mitigasi risiko operasional pada Bab V."
      ],
      signatureReady: true
    };
  });

  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  if (!isOpen) return null;

  const handleUpdate = (field: keyof DefenseMinutesInfo, val: any) => {
    setMinutes({ ...minutes, [field]: val });
  };

  const handleAddNote = () => {
    setMinutes({
      ...minutes,
      revisionNotes: [...(minutes.revisionNotes || []), "Ketikkan butir masukan penguji..."]
    });
  };

  const handleUpdateNote = (idx: number, val: string) => {
    const updated = [...(minutes.revisionNotes || [])];
    updated[idx] = val;
    setMinutes({ ...minutes, revisionNotes: updated });
  };

  const handleRemoveNote = (idx: number) => {
    setMinutes({
      ...minutes,
      revisionNotes: (minutes.revisionNotes || []).filter((_, i) => i !== idx)
    });
  };

  // AI Recommendation for realistic defense minutes and revision notes
  const handleGenerateAiNotes = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `
Sebagai Ketua Dewan Penguji Sidang Akademik Universitas, buatkan CATATAN BERITA ACARA EVALUASI & REVISI SIDANG PROPOSAL yang tajam, konstruktif, dan berstandar Dikti untuk usulan:
- Judul: "${docTitle}"
- Mahasiswa: "${candidateName}" (NIM: ${candidateId})
- Perguruan Tinggi: "${institution}"

Berikan minimal 4 butir masukan perbaikan naskah yang spesifik untuk Bab I, Bab II, Bab III, dan Bab IV.

Format JSON:
{
  "gradeResult": "Lulus dengan Revisi Minor",
  "candidateScore": 87.5,
  "revisionNotes": [
    "Bab I: Pertajam latar belakang dengan menyandingkan data empiris lokus dan target luaran konkret.",
    "Bab II: Perkuat sintesis teori dengan menambah rujukan jurnal bereputasi 5 tahun terakhir.",
    "Bab III: Cantumkan definisi operasional variabel dan rincian instrumen pengujian secara terukur.",
    "Bab IV: Sesuaikan linimasa jadwal matriks mingguan agar selaras dengan target publikasi ilmiah."
  ]
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
        setMinutes({
          ...minutes,
          gradeResult: parsed.gradeResult || minutes.gradeResult,
          candidateScore: parsed.candidateScore || minutes.candidateScore,
          revisionNotes: parsed.revisionNotes || minutes.revisionNotes
        });
      }
    } catch (err) {
      console.warn("AI defense minutes failed:", err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSave = () => {
    onSave(minutes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Lembar Berita Acara (Bimbingan, Seminar, & Sidang)</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-mono text-[11px] font-semibold">
                  {minutes.gradeResult}
                </span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Dokumen yuridis akademik untuk penetapan hasil ujian, catatan revisi dewan penguji, dan lembar perbaikan
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

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Metadata Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-zinc-500 font-semibold block">
                Jenis Forum Sidang:
              </label>
              <select
                value={minutes.sessionType}
                onChange={(e) => handleUpdate("sessionType", e.target.value)}
                className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200"
              >
                <option value="seminar_proposal">Seminar Proposal (Sempro)</option>
                <option value="bimbingan">Bimbingan Berkala Dosen</option>
                <option value="sidang_akhir">Sidang Pertahanan Skripsi / Magang</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-zinc-500 font-semibold block">
                Tanggal & Waktu:
              </label>
              <div className="flex gap-1.5">
                <input
                  type="date"
                  value={minutes.date}
                  onChange={(e) => handleUpdate("date", e.target.value)}
                  className="w-1/2 px-2 py-1 rounded bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-xs font-mono"
                />
                <input
                  type="text"
                  value={minutes.time}
                  onChange={(e) => handleUpdate("time", e.target.value)}
                  placeholder="09:00 - 11:00 WIB"
                  className="w-1/2 px-2 py-1 rounded bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-zinc-500 font-semibold block">
                Keputusan & Nilai:
              </label>
              <div className="flex gap-1.5">
                <select
                  value={minutes.gradeResult}
                  onChange={(e) => handleUpdate("gradeResult", e.target.value)}
                  className="flex-1 px-2 py-1 rounded bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-xs font-semibold text-amber-600 dark:text-amber-400"
                >
                  <option value="Lulus Tanpa Revisi">Lulus Tanpa Revisi</option>
                  <option value="Lulus dengan Revisi Minor">Lulus Revisi Minor</option>
                  <option value="Lulus dengan Revisi Mayor">Lulus Revisi Mayor</option>
                  <option value="Sidang Ulang">Sidang Ulang</option>
                </select>
                <input
                  type="number"
                  step="0.1"
                  value={minutes.candidateScore || 85}
                  onChange={(e) => handleUpdate("candidateScore", parseFloat(e.target.value) || 0)}
                  className="w-16 px-2 py-1 rounded bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-xs font-mono font-bold text-center"
                />
              </div>
            </div>
          </div>

          {/* Dewan Penguji */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
              Susunan Tim Dewan Penguji / Pembimbing:
            </span>
            <div className="space-y-2">
              {(minutes.examiners || []).map((ex, exIdx) => (
                <div key={exIdx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-xs items-center">
                  <div className="sm:col-span-4 font-semibold text-zinc-700 dark:text-zinc-300 font-mono text-[11px]">
                    {ex.role}
                  </div>
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      value={ex.name}
                      onChange={(e) => {
                        const updated = [...(minutes.examiners || [])];
                        updated[exIdx].name = e.target.value;
                        setMinutes({ ...minutes, examiners: updated });
                      }}
                      className="w-full px-2 py-1 rounded bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 font-medium text-xs"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      value={ex.nip}
                      onChange={(e) => {
                        const updated = [...(minutes.examiners || [])];
                        updated[exIdx].nip = e.target.value;
                        setMinutes({ ...minutes, examiners: updated });
                      }}
                      placeholder="NIP / NIDN"
                      className="w-full px-2 py-1 rounded bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 font-mono text-[11px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revision Notes List */}
          <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                Catatan Masukan, Pertanyaan, & Butir Revisi Dewan Penguji:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerateAiNotes}
                  disabled={isGeneratingAi}
                  className="px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/80 hover:bg-amber-100 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center gap-1 border border-amber-200 dark:border-amber-800 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isGeneratingAi ? "Menganalisis..." : "Rekomendasi Revisi via AI"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddNote}
                  className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Butir</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {(minutes.revisionNotes || []).map((note, nIdx) => (
                <div key={nIdx} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-mono text-[10px] flex items-center justify-center font-bold flex-shrink-0 mt-1">
                    {nIdx + 1}
                  </span>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => handleUpdateNote(nIdx, e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveNote(nIdx)}
                    className="p-1 rounded text-zinc-400 hover:text-rose-500 cursor-pointer mt-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex items-center justify-between">
          <span className="text-xs text-zinc-500 font-mono">
            Lembar Berita Acara dapat diunduh tersendiri atau digabungkan ke Lampiran Dokumen.
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
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Simpan Berita Acara</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
