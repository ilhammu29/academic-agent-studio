"use client";

import React from "react";
import { ProposalDocument } from "@/types/studio";
import { 
  GitCommit, 
  ArrowRight, 
  ArrowDown, 
  Search, 
  Database, 
  Cpu, 
  CheckCircle2, 
  FileCheck,
  Workflow
} from "lucide-react";

interface ResearchFlowchartProps {
  doc: ProposalDocument;
}

export const ResearchFlowchart: React.FC<ResearchFlowchartProps> = ({ doc }) => {
  const isMagang = doc.category === "magang";

  const phases = isMagang
    ? [
        {
          step: "01",
          title: "Orientasi & Observasi Lapangan",
          desc: `Identifikasi proses bisnis, kendala operasional, dan SOP unit kerja pada ${doc.targetEntity}.`,
          output: "Dokumen Problem Statement & WBS",
          icon: Search
        },
        {
          step: "02",
          title: "Ekstraksi & Analisis Kebutuhan",
          desc: "Wawancara dengan mentor lapangan, observasi data mentah, dan spesifikasi fungsional tools.",
          output: "Spesifikasi Kebutuhan Proyek",
          icon: Database
        },
        {
          step: "03",
          title: "Implementasi Solusi & Eksekusi",
          desc: "Pembangunan modul perangkat lunak, otomasi pipeline data, atau perbaikan tata kelola alur kerja.",
          output: "Prototipe / Sistem Terpasang",
          icon: Cpu
        },
        {
          step: "04",
          title: "Verifikasi, User Acceptance, & SOP",
          desc: "Pengujian fungsionalitas bersama mentor industri, dokumentasi User Manual, dan transfer pengetahuan.",
          output: "Laporan Kinerja & Berita Acara",
          icon: FileCheck
        }
      ]
    : [
        {
          step: "01",
          title: "Inisiasi & Formulasi Masalah",
          desc: `Identifikasi celah riset (research gap) empiris pada ${doc.targetEntity} dan formulasi rumusan masalah.`,
          output: "Matriks Rumusan & Batasan Masalah",
          icon: Search
        },
        {
          step: "02",
          title: "Studi Literatur PRISMA 2020",
          desc: "Ekstraksi publikasi primer terindeks (2020-2025), pemetaan state-of-the-art, dan sintesis kerangka berpikir.",
          output: "Matriks Sintesis Literatur",
          icon: Database
        },
        {
          step: "03",
          title: "Desain Riset & Pengumpulan Data",
          desc: "Penyusunan instrumen kuesioner/alat ukur, penentuan ukuran sampel, dan protokol etika penelitian.",
          output: "Dataset Primer/Sekunder Tervalidasi",
          icon: GitCommit
        },
        {
          step: "04",
          title: "Pemodelan & Implementasi Metode",
          desc: "Pra-pemrosesan data, konfigurasi hyperparameter algoritma, dan pembangunan model eksperimental.",
          output: "Model Komputasi / Desain Intervensi",
          icon: Cpu
        },
        {
          step: "05",
          title: "Validasi Metrik & Uji Hipotesis",
          desc: "Pengujian akurasi, F1-score, uji komparatif signifikansi statistik (p-value < 0.05), dan ablasi studi.",
          output: "Tabel Temuan & Bukti Hipotesis",
          icon: CheckCircle2
        },
        {
          step: "06",
          title: "Diseminasi & Rekomendasi",
          desc: "Penyusunan naskah artikel ilmiah, rekomendasi aplikatif bagi instansi, dan penulisan laporan skripsi.",
          output: "Draf Publikasi & Naskah Akhir",
          icon: FileCheck
        }
      ];

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs font-sans space-y-4 my-4 no-print">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Workflow className="w-4 h-4 text-zinc-300" />
          <span className="font-semibold text-zinc-200">
            Diagram Alir Metodologi Pelaksanaan ({isMagang ? "Work Pipeline" : "Research Pipeline"})
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
          TAHAPAN SISTEMATIS
        </span>
      </div>

      {/* Grid of pipeline cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {phases.map((p, idx) => {
          const Icon = p.icon;
          return (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex flex-col justify-between space-y-2 hover:border-zinc-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-200 font-mono text-[11px] flex items-center justify-center font-bold">
                      {p.step}
                    </span>
                    <Icon className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">Tahap {idx + 1}</span>
                </div>
                <h4 className="font-semibold text-zinc-200 text-xs leading-snug">
                  {p.title}
                </h4>
                <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                  {p.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-800/60 text-[10px] flex items-center justify-between text-zinc-400">
                <span className="text-zinc-500">Luaran:</span>
                <span className="font-mono text-zinc-300 font-medium truncate max-w-[150px]" title={p.output}>
                  {p.output}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
