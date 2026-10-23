"use client";

import React, { useState } from "react";
import { ProposalDocument } from "@/types/studio";
import { 
  GitBranch, 
  ArrowDown, 
  ArrowRight, 
  CheckCircle2, 
  Workflow, 
  Maximize2, 
  RotateCcw,
  Sparkles,
  Info
} from "lucide-react";

interface AcademicFlowchartDiagramProps {
  doc: ProposalDocument;
  type?: "methodology" | "conceptual";
}

export const AcademicFlowchartDiagram: React.FC<AcademicFlowchartDiagramProps> = ({ 
  doc, 
  type = "methodology" 
}) => {
  const isMagang = doc.category === "magang";
  const [activeStep, setActiveStep] = useState<number | null>(null);

  // Methodology Pipeline Steps
  const methodologySteps = isMagang
    ? [
        {
          id: 1,
          type: "terminator",
          tag: "FASE 1 - INISIASI",
          title: "Observasi Lapangan & Identifikasi Kebutuhan",
          subtitle: `Orientasi lingkungan kerja dan ekstraksi SOP pada ${doc.targetEntity}`,
          inputs: "Surat Tugas & Regulasi Internal",
          deliverable: "Problem Statement & Ruang Lingkup",
          color: "emerald"
        },
        {
          id: 2,
          type: "process",
          tag: "FASE 2 - PERANCANGAN",
          title: "Analisis Arsitektur & Spesifikasi Solusi",
          subtitle: "Penyusunan blueprint kerja, pemetaan data flow, dan approval mentor lapangan",
          inputs: "Data Operasional & Hasil Wawancara",
          deliverable: "Dokumen Desain Sistem / SOP Baru",
          color: "blue"
        },
        {
          id: 3,
          type: "process",
          tag: "FASE 3 - EKSEKUSI",
          title: "Implementasi Solusi & Integrasi Teknis",
          subtitle: "Pengembangan instrumen/modul kerja, coding/automasi, dan uji coba lingkungan kerja",
          inputs: "Spesifikasi Desain & Development Tools",
          deliverable: "Prototipe / Alur Kerja Operasional",
          color: "indigo"
        },
        {
          id: 4,
          type: "decision",
          tag: "FASE 4 - VALIDASI",
          title: "Pengujian Fungsional & Evaluasi Mutu",
          subtitle: "Apakah hasil memenuhi standar kinerja dan acceptance criteria mentor?",
          inputs: "UAT Checklist & Metrik Efisiensi",
          deliverable: "Berita Acara Evaluasi Kinerja",
          decision: {
            yes: "Memenuhi Syarat (Fase 5)",
            no: "Revisi & Refinement (Loop ke Fase 3)"
          },
          color: "amber"
        },
        {
          id: 5,
          type: "terminator",
          tag: "FASE 5 - DISEMINASI",
          title: "Dokumentasi Final & Laporan Magang",
          subtitle: "Penyusunan logbook komprehensif, transfer knowledge, dan pengesahan",
          inputs: "Logbook Mingguan & Bukti Luaran",
          deliverable: "Laporan Akhir & Surat Selesai Magang",
          color: "emerald"
        }
      ]
    : [
        {
          id: 1,
          type: "terminator",
          tag: "TAHAP 1 - IDENTIFIKASI",
          title: "Identifikasi Masalah & Perumusan Celah Riset",
          subtitle: `Formulasi problem statement dan penentuan fokus penelitian pada ${doc.targetEntity}`,
          inputs: "Fenomena Lapangan & Kajian Awal",
          deliverable: "Rumusan Masalah & Batasan Riset",
          color: "emerald"
        },
        {
          id: 2,
          type: "process",
          tag: "TAHAP 2 - STUDI LITERATUR",
          title: "Tinjauan Pustaka PRISMA 2020 & Teori",
          subtitle: "Sintesis publikasi ilmiah terindeks (2020-2025) dan penyusunan kerangka konseptual",
          inputs: "Database Jurnal Bereputasi",
          deliverable: "Matriks Keaslian Riset & State-of-the-art",
          color: "blue"
        },
        {
          id: 3,
          type: "process",
          tag: "TAHAP 3 - METODOLOGI",
          title: "Desain Riset & Pengumpulan Data Primer/Sekunder",
          subtitle: "Penetapan instrumen ukur, sampling probabilistik, dan pengujian validitas reliabilitas",
          inputs: "Instrumen Kuesioner / Sensor / Observasi",
          deliverable: "Dataset Terverifikasi & Bebas Bias",
          color: "indigo"
        },
        {
          id: 4,
          type: "decision",
          tag: "TAHAP 4 - UJI & MODEL",
          title: "Pemodelan Komputasi / Analisis Statistik",
          subtitle: "Apakah model/hasil analisis memenuhi ambang signifikansi statistik (p < 0.05 / metrik)?",
          inputs: "Algoritma / Uji Hipotesis Multivariat",
          deliverable: "Hasil Estimasi Koefisien / Metrik Evaluasi",
          decision: {
            yes: "Signifikan / Terverifikasi (Tahap 5)",
            no: "Optimasi Parameter (Looping ke Tahap 3)"
          },
          color: "amber"
        },
        {
          id: 5,
          type: "terminator",
          tag: "TAHAP 5 - KESIMPULAN",
          title: "Sintesis Temuan, Pembahasan, & Naskah Akhir",
          subtitle: "Komparasi temuan dengan literatur sebelumnya, implikasi manajerial, dan draf publikasi",
          inputs: "Bukti Empiris & Hasil Pembahasan",
          deliverable: "Naskah Skripsi Lengkap & Draf Manuskrip",
          color: "emerald"
        }
      ];

  if (type === "conceptual") {
    return (
      <div className="my-6 p-4 sm:p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl font-sans print:border-black print:p-2">
        <div className="text-center mb-6">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">
            Bagan Kerangka Pikir Ilmiah
          </span>
          <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 font-serif">
            Gambar 2.1 Diagram Alur Kerangka Konseptual & Hubungan Antar Variabel
          </h4>
        </div>

        {/* 3-Column Conceptual Model: Input -> Proses Intervensi -> Output Dampak */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {/* Kolom 1: Kondisi Awal / Variabel Independen */}
          <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-2">
                1. Kondisi Eksisting / Problem
              </span>
              <h5 className="font-semibold text-xs text-zinc-800 dark:text-zinc-200 mb-2">
                Celah Lapangan & Kebutuhan
              </h5>
              <ul className="text-[11px] text-zinc-600 dark:text-zinc-300 space-y-1.5 list-disc pl-4">
                <li>Tingginya latensi atau inefisiensi proses konvensional di {doc.targetEntity}.</li>
                <li>Belum adanya standardisasi metodologis yang terdokumentasi rapi.</li>
                <li>Kebutuhan otomasi atau bukti empiris terukur.</li>
              </ul>
            </div>
            <div className="mt-3 pt-2 border-t border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-400 italic">
              Input Variabel / Baseline Data
            </div>
          </div>

          {/* Kolom 2: Intervensi / Solusi Metodologis */}
          <div className="p-4 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border-2 border-indigo-200 dark:border-indigo-800 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-2">
                2. Intervensi / Solusi
              </span>
              <h5 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 mb-2">
                Penerapan Metode & Protokol Riset
              </h5>
              <ul className="text-[11px] text-zinc-700 dark:text-zinc-300 space-y-1.5 list-disc pl-4">
                <li>Penerapan kerangka kerja sistematis berbasis SOP ilmiah teruji.</li>
                <li>Pengembangan instrumen pengukuran dan verifikasi data berkala.</li>
                <li>Pengendalian variabel perancu dan validasi berulang.</li>
              </ul>
            </div>
            <div className="mt-3 pt-2 border-t border-indigo-200 dark:border-indigo-800 text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
              Proses Komputasi / Analisis / Pilot Project
            </div>
          </div>

          {/* Kolom 3: Target Dampak / Variabel Dependen */}
          <div className="p-4 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-2">
                3. Dampak Terukur
              </span>
              <h5 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 mb-2">
                Efisiensi, Capaian, & Validasi
              </h5>
              <ul className="text-[11px] text-zinc-700 dark:text-zinc-300 space-y-1.5 list-disc pl-4">
                <li>Peningkatan akurasi/efisiensi operasional terukur secara kuantitatif.</li>
                <li>Penyelesaian masalah nyata di {doc.targetEntity}.</li>
                <li>Keluaran artikel publikasi ilmiah atau SOP baku industri.</li>
              </ul>
            </div>
            <div className="mt-3 pt-2 border-t border-emerald-200 dark:border-emerald-800 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              Output & Outcome Terverifikasi
            </div>
          </div>
        </div>

        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 text-center mt-4 italic print:text-black">
          *Gambar 2.1 disajikan sesuai kaidah visualisasi kerangka berpikir tugas akhir dan laporan profesional perguruan tinggi.
        </p>
      </div>
    );
  }

  return (
    <div className="my-6 p-4 sm:p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl font-sans print:border-black print:p-2">
      
      {/* Title Caption Standard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-zinc-200 dark:border-zinc-800 print:border-black gap-2">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-0.5">
            Diagram Alur Baku Akademik (Standard Flowchart)
          </span>
          <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 font-serif">
            Gambar 3.1 Bagan Alir Tahapan Pelaksanaan & Metodologi {isMagang ? "Magang Industri" : "Penelitian"}
          </h4>
        </div>

        <div className="flex items-center gap-2 no-print self-start sm:self-auto text-[11px]">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-mono text-[10px]">
            <Workflow className="w-3 h-3 text-zinc-500" />
            5 Tahap Terstruktur
          </span>
        </div>
      </div>

      {/* SVG Pipeline Visualization Flowchart */}
      <div className="space-y-3">
        {methodologySteps.map((step, idx) => {
          const isSelected = activeStep === step.id;
          const isLast = idx === methodologySteps.length - 1;

          return (
            <React.Fragment key={step.id}>
              {/* Step Card / Node */}
              <div
                onClick={() => setActiveStep(isSelected ? null : step.id)}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${
                  step.type === "terminator"
                    ? "bg-zinc-50 dark:bg-zinc-900/80 border-zinc-300 dark:border-zinc-700 hover:border-zinc-500"
                    : step.type === "decision"
                    ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 hover:border-amber-500"
                    : "bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
                } ${isSelected ? "ring-2 ring-zinc-900 dark:ring-zinc-100 shadow-sm" : ""}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-start gap-3">
                    {/* Node Shape Icon */}
                    <div className="shrink-0 mt-0.5">
                      {step.type === "terminator" ? (
                        <div className="w-7 h-7 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black flex items-center justify-center font-mono font-bold text-xs shadow-xs">
                          {step.id}
                        </div>
                      ) : step.type === "decision" ? (
                        <div className="w-7 h-7 rotate-45 rounded-sm bg-amber-500 text-white flex items-center justify-center shadow-xs">
                          <span className="-rotate-45 font-mono font-bold text-xs">{step.id}</span>
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center font-mono font-bold text-xs border border-zinc-300 dark:border-zinc-700">
                          {step.id}
                        </div>
                      )}
                    </div>

                    {/* Step Content */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
                          {step.tag}
                        </span>
                        {step.type === "decision" && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-medium">
                            Decision Node
                          </span>
                        )}
                      </div>
                      <h5 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                        {step.title}
                      </h5>
                      <p className="text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                        {step.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Right Meta Pill: Deliverable */}
                  <div className="sm:text-right shrink-0 self-end sm:self-auto pl-10 sm:pl-0">
                    <span className="text-[10px] text-zinc-400 block font-mono">Luaran Tahapan:</span>
                    <span className="inline-block text-[11px] font-mono font-medium text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-750">
                      {step.deliverable}
                    </span>
                  </div>
                </div>

                {/* Expanded Details when Clicked */}
                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800 text-[11px] grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-600 dark:text-zinc-300 animate-in fade-in duration-150">
                    <div>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200 block mb-0.5">
                        Input & Syarat Masukan:
                      </span>
                      <p className="text-zinc-500 dark:text-zinc-400">{step.inputs}</p>
                    </div>
                    {step.decision ? (
                      <div>
                        <span className="font-semibold text-amber-700 dark:text-amber-400 block mb-0.5">
                          Kriteria Percabangan:
                        </span>
                        <p className="text-emerald-600 dark:text-emerald-400">✓ Ya: {step.decision.yes}</p>
                        <p className="text-rose-600 dark:text-rose-400">✗ Tidak: {step.decision.no}</p>
                      </div>
                    ) : (
                      <div>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 block mb-0.5">
                          Metode Kontrol Kualitas:
                        </span>
                        <p className="text-zinc-500 dark:text-zinc-400">
                          Review berkala & verifikasi formal bersama Dosen / Mentor Industri.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Connecting Down Arrow */}
              {!isLast && (
                <div className="flex items-center justify-center py-0.5">
                  <div className="flex flex-col items-center">
                    <div className="w-0.5 h-3 bg-zinc-300 dark:bg-zinc-700" />
                    <ArrowDown className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 -mt-1" />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Caption Footnote */}
      <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-850 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 italic print:text-black">
        <span>*Dapat dicetak langsung dan disertakan dalam naskah Bab III proposal resmi.</span>
        <span className="no-print font-mono not-italic text-[10px] text-zinc-400">Klik tiap tahapan untuk melihat detail</span>
      </div>
    </div>
  );
};
