"use client";

import React from "react";
import { X, Brain, Check, Sparkles, BookOpen } from "lucide-react";

interface TwelveModesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TwelveModesModal: React.FC<TwelveModesModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const modes = [
    {
      num: "01",
      name: "First-Principles Thinking",
      desc: "Membedah persoalan ke elemen fisik/biologis paling mendasar (misal: kalori masuk vs kalori keluar, arsitektur data primitif), bukan sekadar meniru analogi umum.",
      application: "Digunakan pada BAB I: Perumusan Latar Belakang & Rumusan Masalah."
    },
    {
      num: "02",
      name: "Second-Order Thinking",
      desc: "Mempertimbangkan 'dan setelah itu apa?'. Menilai dampak jangka panjang, tracking effect, efek samping klinis, atau konsekuensi pemeliharaan sistem.",
      application: "Digunakan pada Rasionalisasi Klinis & Kelaikan Etik."
    },
    {
      num: "03",
      name: "Inversion Thinking (Mulai dari Akhir)",
      desc: "Membalik cara pandang: bagaimana skenario proyek ini gagal total? Mengidentifikasi titik kegagalan (bias seleksi, instrumen corrupt) dan memasang pengaman.",
      application: "Digunakan pada Batasan Masalah & Kriteria Eksklusi."
    },
    {
      num: "04",
      name: "Pareto Principle (Aturan 80/20)",
      desc: "Menemukan 20% variabel atau modul paling kritis yang menghasilkan 80% dampak luaran konkret.",
      application: "Digunakan pada Perumusan Tujuan Khusus & Target Deliverables."
    },
    {
      num: "05",
      name: "Probabilistic & Bayesian Updating",
      desc: "Memperbarui keyakinan hipotesis berdasarkan bukti empiris baru (p-value, odds ratio, hasil uji normalitas).",
      application: "Digunakan pada Rancangan Uji Biostatistika."
    },
    {
      num: "06",
      name: "Lateral Thinking",
      desc: "Mencari solusi melompat ke samping di luar prosedur linear konvensional untuk menembus kebuntuan.",
      application: "Digunakan pada Inovasi Metodologi Pengumpulan Data."
    },
    {
      num: "07",
      name: "Holistic / Systems Thinking",
      desc: "Melihat ekosistem secara utuh sebagai jejaring saling-terkait (misal: jadwal asrama berinteraksi dengan kantin dan hormon metabolik).",
      application: "Digunakan pada Kerangka Teori & Kerangka Konsep Bab II."
    },
    {
      num: "08",
      name: "Critical / Falsification Thinking",
      desc: "Menguji apakah suatu klaim dapat digugurkan (Popperian Falsification). Melarang konfirmasi bias dan menolak fabrikasi data.",
      application: "Digunakan pada Audit Kualitas & Keaslian Penelitian."
    },
    {
      num: "09",
      name: "Design Thinking",
      desc: "Berpusat pada pengalaman manusia nyata (santri yang mengisi kuesioner, mentor lapangan yang menerima laporan).",
      application: "Digunakan pada Desain Kuesioner & Antarmuka Sistem."
    },
    {
      num: "10",
      name: "Temporal / Multi-Horizon Thinking",
      desc: "Menyeimbangkan target harian, mingguan, dan semesteran dalam matriks linimasa yang realistis.",
      application: "Digunakan pada Matriks Jadwal Kerja Mingguan (Gantt Chart)."
    },
    {
      num: "11",
      name: "Occam's Razor",
      desc: "Di antara dua penjelasan atau solusi yang setara, pilih yang paling sederhana dan minim asumsi tambahan.",
      application: "Digunakan pada Pemilihan Stack Alat & Format Tabel 3-Garis Presisi."
    },
    {
      num: "12",
      name: "Dialectical Synthesis",
      desc: "Menemukan titik temu sintesis antara tesis (kebutuhan ideal akademis) dan antitesis (kendala teknis lapangan).",
      application: "Digunakan pada Kesimpulan, Manfaat 3-Pihak, & Lembar Pengesahan."
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-matte-bg/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-matte-surface border border-matte-borderLight rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-matte-border flex items-center justify-between gap-4 bg-matte-surface2/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-matte-bg border border-champagne/40 text-champagne flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-serif font-bold text-milk-white">
                12 Metode Berpikir Tingkat Tinggi (Proprietary Thinking Modes)
              </h2>
              <p className="text-[11px] font-mono text-milk-muted">
                Landasan kognitif yang memandu orkestrasi 5 AI Agent dalam Studio ini
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-matte-surface hover:bg-matte-border text-milk-muted hover:text-milk-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-3.5 divide-y divide-matte-border/40">
          {modes.map((m) => (
            <div key={m.num} className="pt-3.5 first:pt-0">
              <div className="flex items-start gap-3">
                <span className="font-mono text-xs font-bold text-champagne bg-matte-bg px-2 py-0.5 rounded border border-matte-border flex-shrink-0">
                  {m.num}
                </span>
                <div>
                  <h3 className="text-xs font-serif font-bold text-milk-white">
                    {m.name}
                  </h3>
                  <p className="text-xs text-milk-soft font-sans mt-0.5 leading-relaxed">
                    {m.desc}
                  </p>
                  <p className="text-[11px] font-mono text-champagne/90 mt-1">
                    <span className="text-milk-dim">Penerapan pada Proposal:</span> {m.application}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-matte-border bg-matte-bg flex items-center justify-between text-xs font-mono">
          <span className="text-milk-muted">Tersinkronisasi dengan SOP Academic Campus Pro</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-champagne hover:bg-champagne-light text-matte-bg font-bold cursor-pointer"
          >
            Tutup Panduan
          </button>
        </div>

      </div>
    </div>
  );
};
