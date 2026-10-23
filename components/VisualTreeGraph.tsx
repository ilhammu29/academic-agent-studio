"use client";

import React, { useState } from "react";
import { TreeNode } from "@/types/studio";
import { 
  Network, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Check, 
  Brain, 
  FileText, 
  BookOpen, 
  CheckCircle2, 
  Compass, 
  Layers, 
  Sparkles,
  ArrowRight
} from "lucide-react";

interface VisualTreeGraphProps {
  treeData: TreeNode;
  onSelectSection?: (sectionId: string) => void;
}

interface LearningMilestone {
  id: string;
  phase: string;
  title: string;
  coreObjective: string;
  recommendedReadings: string[];
  selfCheckItems: string[];
}

export const VisualTreeGraph: React.FC<VisualTreeGraphProps> = ({
  treeData,
  onSelectSection
}) => {
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(treeData);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  // Dynamic Learning Milestones mapped from the active research topic
  const learningMilestones: Record<string, LearningMilestone> = {
    root: {
      id: "root",
      phase: "Pondasi Utama Riset",
      title: treeData.label,
      coreObjective: "Memahami benang merah penelitian dari rumusan masalah, novelty, hingga luaran terukur.",
      recommendedReadings: [
        "Pedoman Standar Penulisan Proposal & Skripsi Nasional (Kemendikbudristek)",
        "Panduan Metodologi Riset Empiris & Terapan",
        "Kaidah Etika Penelitian & Integritas Publikasi"
      ],
      selfCheckItems: [
        "Saya dapat menjelaskan urgensi riset ini dalam 1 menit tanpa membaca catatan",
        "Saya memahami kesenjangan (gap) antara kondisi eksisting dengan target capaian",
        "Saya telah memverifikasi ketersediaan data riil di instansi / lokus"
      ]
    },
    bab1: {
      id: "bab1",
      phase: "Fase 1: Diagnosa Masalah & Problem-Gap",
      title: "Bab I: Pendahuluan & Urgensi",
      coreObjective: "Merumuskan kesenjangan empiris di lapangan menjadi rumusan masalah akademik yang tajam dan terukur.",
      recommendedReadings: [
        "Jurnal Primer 2023-2025 terkait topik studi",
        "Laporan Kinerja / Data Statistik Resmi Instansi Mitra",
        "Kajian Kebijakan / SOP Operasional Terkini"
      ],
      selfCheckItems: [
        "Latar belakang memuat data kuantitatif fakta lapangan (bukan sekadar asumsi umum)",
        "Rumusan masalah tidak dijawab dengan 'ya/tidak', melainkan 'bagaimana' atau 'sejauh mana'",
        "Batasan masalah secara tegas menetapkan apa yang diteliti dan apa yang dieksklusi"
      ]
    },
    bab2: {
      id: "bab2",
      phase: "Fase 2: Landasan Teori & State-of-the-Art",
      title: "Bab II: Tinjauan Pustaka & Kerangka Konseptual",
      coreObjective: "Membangun landasan ilmiah yang kokoh agar metodologi tidak tergolong trial-and-error.",
      recommendedReadings: [
        "Buku Teks Utama Bidang Ilmu (Otoritas Standar)",
        "Sintesis Matriks Komparasi 5 Paper Internasional Bereputasi",
        "Dokumen Standar Nasional / Internasional (ISO/IEEE/WHO)"
      ],
      selfCheckItems: [
        "Tinjauan teori langsung mengait pada variabel yang akan diukur",
        "Kerangka konseptual memvisualisasikan hubungan sebab-akibat antar variabel",
        "Tidak ada klaim teoritis tanpa sitasi rujukan resmi"
      ]
    },
    bab3: {
      id: "bab3",
      phase: "Fase 3: Desain Metodologi & Eksekusi",
      title: "Bab III: Metodologi Penelitian / Rencana Kerja",
      coreObjective: "Menyusun peta alur tahapan kerja sistematis dari persiapan data hingga teknik validasi.",
      recommendedReadings: [
        "Buku Metodologi Penelitian Kuantitatif / Terapan",
        "Panduan Validasi Instrumen (Skala Likert / Alpha Cronbach / Uji Fungsional)",
        "Standar Verifikasi Metrik Kinerja Ilmiah"
      ],
      selfCheckItems: [
        "Alur kerja memiliki tahapan berurutan (Fase 1 s.d. 4) yang jelas input dan outputnya",
        "Instrumen pengumpulan data terkalibrasi dan memiliki panduan operasional",
        "Teknik pengujian hasil mampu membuktikan apakah solusi yang diusulkan efektif"
      ]
    },
    bab4: {
      id: "bab4",
      phase: "Fase 4: Rencana Jadwal, Anggaran & Luaran",
      title: "Bab IV: Timeline & Deliverables",
      coreObjective: "Menjamin kelayakan pelaksanaan dalam rentang waktu yang tersedia (Feasibility & Risk Mitigation).",
      recommendedReadings: [
        "Manajemen Waktu Riset & Critical Path Method",
        "Pedoman Standar Biaya Masukan (SBM) Nasional",
        "Sistematika Pelaporan Akhir & Seminar Hasil"
      ],
      selfCheckItems: [
        "Setiap bulan/minggu memiliki milestone dan deliverable konkret",
        "Rencana anggaran biaya rasional dan teralokasi sesuai kebutuhan riset",
        "Tersedia rencana kontingensi jika terdapat hambatan perizinan di lapangan"
      ]
    }
  };

  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleZoom = (delta: number) => {
    setZoomLevel(prev => Math.min(Math.max(0.7, prev + delta), 1.3));
  };

  const resetView = () => {
    setZoomLevel(1);
    setSelectedNode(treeData);
    setCollapsedNodes({});
  };

  const toggleStepCompleted = (key: string) => {
    setCompletedSteps(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const activeMilestoneKey = selectedNode?.id?.includes("bab1")
    ? "bab1"
    : selectedNode?.id?.includes("bab2")
    ? "bab2"
    : selectedNode?.id?.includes("bab3")
    ? "bab3"
    : selectedNode?.id?.includes("bab4")
    ? "bab4"
    : "root";

  const activeMilestone = learningMilestones[activeMilestoneKey] || learningMilestones.root;

  return (
    <div className="w-full flex flex-col lg:flex-row rounded-2xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
      
      {/* Main Canvas Viewport */}
      <div className="flex-1 flex flex-col relative min-h-[500px] border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-850">
        
        {/* Canvas Toolbar */}
        <div className="px-5 py-3 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-850 flex items-center justify-between gap-4 z-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
            <Compass className="w-4 h-4 text-indigo-500" />
            <span>Peta Alur Riset & Roadmap Belajar Mandiri</span>
          </div>

          <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-0.5 text-xs shadow-2xs">
            <button
              type="button"
              onClick={() => handleZoom(0.1)}
              title="Perbesar"
              className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded transition-colors cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleZoom(-0.1)}
              title="Perkecil"
              className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded transition-colors cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={resetView}
              title="Reset Tampilan"
              className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[10px] font-mono text-zinc-500">
              {Math.round(zoomLevel * 100)}%
            </span>
          </div>
        </div>

        {/* Tree Container */}
        <div className="flex-1 p-6 overflow-auto flex items-start justify-center bg-zinc-50/40 dark:bg-black/30">
          <div
            className="transition-transform duration-200 origin-top flex flex-col items-center gap-6 w-full max-w-3xl"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* Root Node (Top Concept) */}
            <div
              onClick={() => setSelectedNode(treeData)}
              className={`p-4 rounded-xl border text-center max-w-md w-full cursor-pointer transition-all shadow-xs ${
                selectedNode?.id === treeData.id
                  ? "bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:border-white dark:text-black"
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-600"
              }`}
            >
              <span className={`text-[10px] font-mono uppercase tracking-wider block ${selectedNode?.id === treeData.id ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-500 dark:text-zinc-400"}`}>
                {treeData.category} • Peta Induk Roadmap
              </span>
              <h3 className="text-xs sm:text-sm font-semibold mt-1 leading-snug">
                {treeData.label}
              </h3>
            </div>

            {/* Downward Line */}
            <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-800"></div>

            {/* 4 Phases Learning Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
              {treeData.children?.map((chapter, cIdx) => {
                const isSelected = selectedNode?.id === chapter.id;
                const isCollapsed = !!collapsedNodes[chapter.id];

                return (
                  <div key={chapter.id} className="flex flex-col items-center gap-2">
                    {/* Chapter Card */}
                    <div
                      onClick={() => setSelectedNode(chapter)}
                      className={`p-3 rounded-xl border w-full cursor-pointer transition-all shadow-2xs ${
                        isSelected
                          ? "bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:border-white dark:text-black"
                          : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className={`text-[10px] font-mono uppercase font-semibold ${isSelected ? "text-zinc-300 dark:text-zinc-600" : "text-indigo-600 dark:text-indigo-400"}`}>
                          Fase {cIdx + 1}
                        </span>
                        {chapter.children && chapter.children.length > 0 && (
                          <button
                            type="button"
                            onClick={(e) => toggleCollapse(chapter.id, e)}
                            className="p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded text-zinc-400 text-[10px] cursor-pointer"
                          >
                            {isCollapsed ? "+" : "−"}
                          </button>
                        )}
                      </div>
                      <h4 className="text-xs font-semibold line-clamp-2 leading-snug">
                        {chapter.label}
                      </h4>
                    </div>

                    {/* Section Children (Sub-milestones) */}
                    {!isCollapsed && chapter.children && (
                      <div className="w-full flex flex-col gap-1.5 pl-2 border-l border-zinc-300 dark:border-zinc-800">
                        {chapter.children.map((section) => {
                          const isSecSelected = selectedNode?.id === section.id;
                          return (
                            <div
                              key={section.id}
                              onClick={() => setSelectedNode(section)}
                              className={`p-2 rounded-lg border text-left cursor-pointer transition-all text-xs ${
                                isSecSelected
                                  ? "bg-zinc-800 border-zinc-700 text-white dark:bg-zinc-800 dark:border-zinc-600 dark:text-white"
                                  : "bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                              }`}
                            >
                              <div className="text-[11px] font-medium truncate">
                                {section.label}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Side Inspector & Learning Guide Drawer */}
      <div className="w-full lg:w-88 bg-white dark:bg-zinc-950 p-5 flex flex-col justify-between border-t lg:border-t-0 border-zinc-200 dark:border-zinc-850">
        <div className="space-y-4">
          
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-850 pb-3">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Panduan Belajar & Milestone
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
              ROADMAP
            </span>
          </div>

          {/* Phase Badge & Title */}
          <div>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
              {activeMilestone.phase}
            </span>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1 leading-snug">
              {selectedNode ? selectedNode.label : activeMilestone.title}
            </h3>
          </div>

          {/* Core Learning Objective */}
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs">
            <p className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Target Kompetensi Tahap Ini:
            </p>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[11px]">
              {activeMilestone.coreObjective}
            </p>
          </div>

          {/* Self-Check Checklist */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Checklist Pemahaman Mandiri:
            </h4>
            <div className="space-y-1.5">
              {activeMilestone.selfCheckItems.map((chk, i) => {
                const stepKey = `${activeMilestone.id}-${i}`;
                const isDone = !!completedSteps[stepKey];
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleStepCompleted(stepKey)}
                    className={`w-full p-2 rounded-lg border text-left text-xs transition-colors flex items-start gap-2 cursor-pointer ${
                      isDone
                        ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                        : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300"
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded mt-0.5 border flex items-center justify-center flex-shrink-0 ${
                      isDone ? "bg-emerald-600 border-emerald-600 text-white" : "border-zinc-400"
                    }`}>
                      {isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span className="text-[11px] leading-tight">{chk}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recommended Literature */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              Rujukan & Landasan Konsep:
            </h4>
            <ul className="space-y-1 text-[11px] text-zinc-600 dark:text-zinc-400">
              {activeMilestone.recommendedReadings.map((r, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-indigo-500 font-bold">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Action to Jump to Section */}
        {selectedNode && onSelectSection && (
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-850 mt-4">
            <button
              type="button"
              onClick={() => onSelectSection(selectedNode.id)}
              className="w-full py-2 px-3 rounded-lg bg-zinc-900 hover:bg-black text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-black font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <span>Lompat ke Naskah {selectedNode.category}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
};