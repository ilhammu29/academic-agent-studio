"use client";

import React from "react";
import { X, Brain, CheckCircle2 } from "lucide-react";

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
      desc: "Membedah persoalan ke elemen paling mendasar dan kausalitas objektif, bukan sekadar meniru analogi umum.",
      application: "Digunakan pada BAB I: Perumusan Latar Belakang Piramida Terbalik & Rumusan Masalah."
    },
    {
      num: "02",
      name: "Second-Order Thinking",
      desc: "Mempertimbangkan konsekuensi lanjutan dan efek samping jangka panjang setelah solusi diterapkan.",
      application: "Digunakan pada Rasionalisasi Metodologi & Kelaikan Etik Riset."
    },
    {
      num: "03",
      name: "Inversion Thinking (Mulai dari Akhir)",
      desc: "Membalik sudut pandang: mendiagnosis potensi kegagalan sistem atau bias instrumen sebelum menyusun mitigasi.",
      application: "Digunakan pada Batasan Masalah & Kriteria Eksklusi."
    },
    {
      num: "04",
      name: "Pareto Principle (Aturan 80/20)",
      desc: "Menemukan 20% variabel atau modul paling kritis yang menghasilkan 80% dampak luaran konkret.",
      application: "Digunakan pada Perumusan Tujuan Khusus & Target Capaian."
    },
    {
      num: "05",
      name: "Probabilistic & Bayesian Updating",
      desc: "Memperbarui hipotesis berdasarkan bukti empiris dan uji signifikansi data terkini.",
      application: "Digunakan pada Rancangan Uji Inferensial & Analisis Data."
    },
    {
      num: "06",
      name: "Lateral Thinking",
      desc: "Mencari solusi inovatif di luar prosedur konvensional untuk mengatasi kendala lapangan.",
      application: "Digunakan pada Inovasi Metodologi Pengumpulan Data."
    },
    {
      num: "07",
      name: "Holistic / Systems Thinking",
      desc: "Melihat ekosistem secara utuh sebagai jejaring saling-terkait antara infrastruktur, proses, dan sumber daya.",
      application: "Digunakan pada Kerangka Teori & Kerangka Konseptual Bab II."
    },
    {
      num: "08",
      name: "Critical / Falsification Thinking",
      desc: "Menguji klaim hipotesis secara ketat, melarang fabrikasi data, dan menjaga integritas rujukan.",
      application: "Digunakan pada Audit Kualitas Naskah & Turnitin Integrity."
    },
    {
      num: "09",
      name: "Design Thinking",
      desc: "Berpusat pada kebutuhan pengguna nyata dan stakeholder lapangan.",
      application: "Digunakan pada Perancangan Alur Pengguna & Desain Solusi."
    },
    {
      num: "10",
      name: "Temporal / Multi-Horizon Thinking",
      desc: "Menyeimbangkan target mingguan dan pencapaian akhir dalam matriks linimasa yang realistis.",
      application: "Digunakan pada Matriks Jadwal Kerja Mingguan (Gantt Chart)."
    },
    {
      num: "11",
      name: "Occam's Razor",
      desc: "Memilih metodologi dan arsitektur paling efisien dengan asumsi minimal tanpa over-engineering.",
      application: "Digunakan pada Pemilihan Stack Alat & Format Tabel 3-Garis Presisi."
    },
    {
      num: "12",
      name: "Dialectical Synthesis",
      desc: "Menemukan titik temu sintesis antara standar akademik ideal dan batasan operasional di industri.",
      application: "Digunakan pada Kesimpulan, Manfaat 3-Pihak, & Lembar Pengesahan."
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-850 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center shadow-xs">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                12 Metode Berpikir Ilmiah
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Landasan epistemologis di balik formulasi setiap bab proposal akademik
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center justify-center transition-colors text-sm cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 divide-y divide-zinc-200 dark:divide-zinc-850">
          {modes.map((m) => (
            <div key={m.num} className="pt-4 first:pt-0">
              <div className="flex items-start gap-3">
                <span className="font-mono text-xs font-bold text-zinc-400 dark:text-zinc-500 flex-shrink-0 pt-0.5">
                  {m.num}.
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {m.name}
                  </h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                    {m.desc}
                  </p>
                  <p className="text-[11px] text-zinc-800 dark:text-zinc-300 font-mono mt-1.5 flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 px-2.5 py-1 rounded-lg">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span>{m.application}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
