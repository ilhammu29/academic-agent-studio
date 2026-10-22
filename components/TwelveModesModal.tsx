"use client";

import React from "react";
import { X, Brain } from "lucide-react";

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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-zinc-300" />
            <h2 className="text-sm font-semibold text-zinc-100">
              12 Metode Berpikir Ilmiah
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded hover:bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 divide-y divide-zinc-900">
          {modes.map((m) => (
            <div key={m.num} className="pt-3 first:pt-0">
              <div className="flex items-start gap-3">
                <span className="font-mono text-xs text-zinc-400 flex-shrink-0 pt-0.5">
                  {m.num}.
                </span>
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-zinc-100">
                    {m.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    {m.desc}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    <span className="text-zinc-400">Penerapan:</span> {m.application}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-900 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-black text-xs font-semibold cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
