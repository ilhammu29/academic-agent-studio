"use client";

import React, { useState } from "react";
import { ProposalDocument } from "@/types/studio";
import { 
  FileCheck2, 
  Plus, 
  Trash2, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  Edit3, 
  Save, 
  RefreshCw,
  UserCheck,
  CheckCircle2,
  Clock
} from "lucide-react";

export interface RevisionItem {
  id: string;
  examinerName: string;
  examinerRole: string;
  feedbackNote: string;
  sectionRef: string;
  actionTaken: string;
  status: "SELESAI" | "DIPROSES";
}

interface RevisionMatrixManagerProps {
  doc: ProposalDocument;
}

export const RevisionMatrixManager: React.FC<RevisionMatrixManagerProps> = ({ doc }) => {
  const [items, setItems] = useState<RevisionItem[]>([
    {
      id: "rev-1",
      examinerName: "Dr. Ir. Suharyanto, M.Sc.",
      examinerRole: "Penguji 1 (Metodologi)",
      feedbackNote: "Perjelas batasan masalah agar tidak meluas ke pengujian hardware, fokuskan pada optimasi algoritma dan validasi data.",
      sectionRef: "Bab I: Subbab 1.3 Batasan Masalah",
      actionTaken: "Telah ditambahkan butir batasan operasional yang menegaskan ruang lingkup studi hanya pada pemrosesan dataset dan evaluasi metrik F1-score tanpa modifikasi perangkat keras fisik.",
      status: "SELESAI"
    },
    {
      id: "rev-2",
      examinerName: "Prof. Dr. Med. Ratna Sari, Ph.D.",
      examinerRole: "Penguji 2 (Novelty & Teori)",
      feedbackNote: "Lengkapi tabel perbandingan penelitian terdahulu dengan menyertakan publikasi terindeks Scopus tahun 2024.",
      sectionRef: "Bab II: Matriks Research Gap",
      actionTaken: "Telah diintegrasikan 3 rujukan jurnal primer internasional terbaru (2024) serta dipertegas letak pembeda (novelty) pada mekanisme imputasi adaptif.",
      status: "SELESAI"
    }
  ]);

  const [examinerName, setExaminerName] = useState("");
  const [examinerRole, setExaminerRole] = useState("Penguji 1 (Metodologi)");
  const [feedbackNote, setFeedbackNote] = useState("");
  const [sectionRef, setSectionRef] = useState("Bab I: Pendahuluan");
  const [actionTaken, setActionTaken] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Quick AI Assistant to generate follow-up explanation
  const handleAutoGenerateAction = async () => {
    if (!feedbackNote.trim()) return;
    setIsGeneratingAi(true);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Sebagai mahasiswa akademik yang santun dan profesional, buatkan teks "Tindak Lanjut & Realisasi Perubahan" untuk tabel Matriks Revisi Sidang/Bimbingan Dosen.
Judul Proposal: "${doc.title}"
Target Objek: "${doc.targetEntity}"
Bagian Terkait: "${sectionRef}"
Catatan Koreksi Dosen (${examinerRole}): "${feedbackNote}"

Tuliskan 1-2 kalimat formal yang menjelaskan perbaikan naskah yang telah dilakukan dengan tegas, ilmiah, dan berterima kasih. Langsung berikan teksnya tanpa pembuka.`
        })
      });
      const data = await res.json();
      if (data.success && data.text) {
        setActionTaken(data.text.trim());
      } else {
        // Fallback
        setActionTaken(`Telah dilakukan penyesuaian pada ${sectionRef} sesuai arahan dosen pembimbing/penguji guna memperkuat validitas argumen ilmiah dan ketepatan metodologi.`);
      }
    } catch {
      setActionTaken(`Telah disempurnakan pada bagian ${sectionRef} sesuai arahan revisi.`);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackNote.trim()) return;

    const newItem: RevisionItem = {
      id: `rev-${Date.now()}`,
      examinerName: examinerName.trim() || examinerRole,
      examinerRole,
      feedbackNote: feedbackNote.trim(),
      sectionRef: sectionRef.trim() || "Bab Naskah",
      actionTaken: actionTaken.trim() || `Telah disesuaikan pada naskah ${sectionRef}.`,
      status: "SELESAI"
    };

    setItems([...items, newItem]);
    setFeedbackNote("");
    setActionTaken("");
    setExaminerName("");
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleCopyMarkdown = () => {
    let md = `### LEMBAR MATRIKS TINDAK LANJUT REVISI SIDANG PROPOSAL\n`;
    md += `**Judul:** ${doc.title}\n`;
    md += `**Pengusul:** ${doc.candidateName || "Mahasiswa"} (${doc.candidateId || "NIM"})\n`;
    md += `**Instansi / Kampus:** ${doc.institution}\n\n`;
    md += `| No | Dosen Penguji / Pembimbing | Catatan & Masukan Koreksi | Bagian / Bab Terkait | Tindak Lanjut & Bukti Perubahan | Status |\n`;
    md += `|---|---|---|---|---|---|\n`;
    items.forEach((item, idx) => {
      md += `| ${idx + 1} | ${item.examinerName} (${item.examinerRole}) | ${item.feedbackNote.replace(/\|/g, "/")} | ${item.sectionRef} | ${item.actionTaken.replace(/\|/g, "/")} | ${item.status} |\n`;
    });

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    let csv = `"No","Nama Dosen","Peran","Catatan Koreksi","Bagian Naskah","Tindak Lanjut Revisi","Status"\n`;
    items.forEach((item, idx) => {
      csv += `"${idx + 1}","${item.examinerName}","${item.examinerRole}","${item.feedbackNote.replace(/"/g, '""')}","${item.sectionRef}","${item.actionTaken.replace(/"/g, '""')}","${item.status}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Matriks_Revisi_${doc.id || "Proposal"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-100">
            <FileCheck2 className="w-5 h-5 text-zinc-200" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <span>Matriks Tindak Lanjut Revisi Dosen</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                POST-DEFENSE MATRIX
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Dokumentasi formal perbaikan naskah pasca-sidang atau bimbingan sesuai format resmi pengesahan kampus
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-medium transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
            <span>{copied ? "Tersalin" : "Salin Tabel MD"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-900 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Input Form for New Revision Note */}
      <form onSubmit={handleAddItem} className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
        <div className="font-semibold text-xs text-zinc-200 flex items-center gap-2">
          <Plus className="w-4 h-4 text-zinc-400" />
          <span>Tambah Butir Catatan Revisi Dosen:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">Peran Dosen:</label>
            <select
              value={examinerRole}
              onChange={(e) => setExaminerRole(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-zinc-500"
            >
              <option value="Dosen Pembimbing Utama">Dosen Pembimbing Utama</option>
              <option value="Dosen Pembimbing Pendamping">Dosen Pembimbing Pendamping</option>
              <option value="Ketua Penguji (Metodologi)">Ketua Penguji (Metodologi)</option>
              <option value="Anggota Penguji (Materi/Novelty)">Anggota Penguji (Materi/Novelty)</option>
              <option value="Penguji Praktisi / Industri">Penguji Praktisi / Industri</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">Nama Lengkap Dosen (Opsional):</label>
            <input
              type="text"
              placeholder="Dr. Nama Dosen, M.T."
              value={examinerName}
              onChange={(e) => setExaminerName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">Bab / Bagian Naskah:</label>
            <select
              value={sectionRef}
              onChange={(e) => setSectionRef(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-zinc-500"
            >
              <option value="Bab I: Latar Belakang Masalah">Bab I: Latar Belakang Masalah</option>
              <option value="Bab I: Rumusan & Batasan Masalah">Bab I: Rumusan & Batasan Masalah</option>
              <option value="Bab I: Tujuan & Manfaat Riset">Bab I: Tujuan & Manfaat Riset</option>
              <option value="Bab II: Landasan Teori & State-of-the-Art">Bab II: Landasan Teori & State-of-the-Art</option>
              <option value="Bab II: Kerangka Berpikir & Matriks Gap">Bab II: Kerangka Berpikir & Matriks Gap</option>
              <option value="Bab III: Metode Penelitian / Pelaksanaan">Bab III: Metode Penelitian / Pelaksanaan</option>
              <option value="Bab III: Populasi, Sampel, & Instrumen">Bab III: Populasi, Sampel, & Instrumen</option>
              <option value="Bab IV: Jadwal & Rencana Luaran">Bab IV: Jadwal & Rencana Luaran</option>
              <option value="Daftar Pustaka & Lampiran">Daftar Pustaka & Lampiran</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          <label className="block text-[11px] text-zinc-400">
            Masukan / Catatan Revisi dari Dosen:
          </label>
          <textarea
            rows={2}
            value={feedbackNote}
            onChange={(e) => setFeedbackNote(e.target.value)}
            placeholder="Tuliskan catatan revisi dosen secara presisi, misal: 'Perjelas kriteria inklusi responden dan tambahkan uji normalitas di Bab III'..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 leading-relaxed resize-none"
          />
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] text-zinc-400">
              Tindak Lanjut & Realisasi Perubahan Naskah:
            </label>
            <button
              type="button"
              onClick={handleAutoGenerateAction}
              disabled={isGeneratingAi || !feedbackNote.trim()}
              className="text-[11px] text-zinc-300 hover:text-white flex items-center gap-1.5 font-medium disabled:opacity-40 transition-colors cursor-pointer"
            >
              {isGeneratingAi ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" /> Sedang merumuskan...
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 text-zinc-400" /> Rumuskan Jawaban AI
                </>
              )}
            </button>
          </div>
          <textarea
            rows={2}
            value={actionTaken}
            onChange={(e) => setActionTaken(e.target.value)}
            placeholder="Telah dilakukan penambahan subbab 3.3 mengenai kriteria inklusi..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 leading-relaxed resize-none"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={!feedbackNote.trim()}
            className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white disabled:opacity-40 text-zinc-900 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Masukkan ke Matriks</span>
          </button>
        </div>
      </form>

      {/* Revision Matrix Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-zinc-900/60 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-200">Tabel Rekapitulasi Perbaikan</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
              {items.length} Butir Revisi
            </span>
          </div>
          <span className="text-[11px] text-zinc-400">
            Format resmi lampiran pengesahan proposal skripsi / magang
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/40 text-zinc-400 font-medium">
                <th className="p-3 w-10 text-center">No</th>
                <th className="p-3 w-48">Dosen Penguji / Pembimbing</th>
                <th className="p-3 w-64">Catatan & Masukan Koreksi</th>
                <th className="p-3 w-44">Bagian Naskah</th>
                <th className="p-3">Tindak Lanjut & Bukti Perubahan</th>
                <th className="p-3 w-28 text-center">Status</th>
                <th className="p-3 w-16 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
              {items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-zinc-900/30 transition-colors">
                  <td className="p-3 text-center font-mono text-zinc-400">{idx + 1}</td>
                  <td className="p-3">
                    <div className="font-semibold text-zinc-200">{item.examinerName}</div>
                    <div className="text-[10px] text-zinc-400">{item.examinerRole}</div>
                  </td>
                  <td className="p-3 text-zinc-300 leading-relaxed">{item.feedbackNote}</td>
                  <td className="p-3">
                    <span className="inline-block px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300">
                      {item.sectionRef}
                    </span>
                  </td>
                  <td className="p-3 text-zinc-300 leading-relaxed">{item.actionTaken}</td>
                  <td className="p-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                      <CheckCircle2 className="w-3 h-3" />
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-900 transition-colors cursor-pointer"
                      title="Hapus baris"
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
    </div>
  );
};
