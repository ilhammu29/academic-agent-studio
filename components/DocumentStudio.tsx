"use client";

import React, { useState, useEffect, useRef } from "react";
import { ProposalDocument, TreeNode } from "@/types/studio";
import { VisualTreeGraph } from "./VisualTreeGraph";
import DefenseSimulator from "./DefenseSimulator";
import LiteratureSearchModal from "./LiteratureSearchModal";
import { RevisionMatrixManager } from "./RevisionMatrixManager";
import { TurnitinPreCheckModal } from "./TurnitinPreCheckModal";
import { ResearchInstrumentModal } from "./ResearchInstrumentModal";
import { ApprovalSheetModal } from "./ApprovalSheetModal";
import { CampusGuidelineModal } from "./CampusGuidelineModal";
import { AcademicConsultationModal } from "./AcademicConsultationModal";
import { AcademicFlowchartDiagram } from "./AcademicFlowchartDiagram";
import { AcademicCopilotDrawer } from "./AcademicCopilotDrawer";
import { generateAcademicProposalDocx, downloadDocxBlob } from "@/lib/docxExporter";
import { generateAcademicProposalPptx } from "@/lib/pptxExporter";
import { generateBibTeX, generateRIS, downloadCitationFile } from "@/lib/bibtexExporter";
import { saveProjectRecord, SavedProjectRecord, getStoredUser } from "@/lib/supabase";
import { 
  FileText, 
  Network, 
  CalendarDays, 
  Presentation, 
  ShieldCheck, 
  Copy, 
  Printer, 
  Check, 
  BookOpen, 
  RefreshCw, 
  FileDown,
  ShieldAlert,
  Sparkles,
  Lightbulb,
  Bookmark,
  X,
  FileCheck2,
  RotateCcw,
  RotateCw,
  BookMarked,
  CheckCircle2,
  ClipboardList,
  FileSignature,
  BookmarkCheck,
  ChevronDown,
  Compass,
  Bot,
  Landmark,
  GraduationCap,
  Brain
} from "lucide-react";

interface DocumentStudioProps {
  doc: ProposalDocument;
  treeData: TreeNode;
  onReset: () => void;
}

export const DocumentStudio: React.FC<DocumentStudioProps> = ({
  doc,
  treeData,
  onReset
}) => {
  const [currentDoc, setCurrentDoc] = useState<ProposalDocument>(doc);
  const [activeTab, setActiveTab] = useState<"naskah" | "flowchart" | "tree" | "jadwal" | "slides" | "audit" | "defense" | "revisionMatrix">("naskah");
  const [workspaceCategory, setWorkspaceCategory] = useState<"naskah" | "metodologi" | "sidang" | "kualitas">("naskah");
  const [jadwalViewMode, setJadwalViewMode] = useState<"gantt" | "detail">("gantt");
  const [copied, setCopied] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [isExportingPptx, setIsExportingPptx] = useState(false);
  const [isLitModalOpen, setIsLitModalOpen] = useState(false);
  const [isTurnitinModalOpen, setIsTurnitinModalOpen] = useState(false);
  const [isInstrumentModalOpen, setIsInstrumentModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isGuidelineModalOpen, setIsGuidelineModalOpen] = useState(false);
  const [citationStyle, setCitationStyle] = useState<"apa" | "ieee">("apa");
  const [showMarginRuler, setShowMarginRuler] = useState(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  
  // Co-Pilot & Dropdown states
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const toolsDropdownRef = useRef<HTMLDivElement>(null);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(event.target as Node)) {
        setIsToolsDropdownOpen(false);
      }
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setIsExportDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  
  // History & Auto-save states
  const [history, setHistory] = useState<ProposalDocument[]>([doc]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // AI Refinement states
  const [refineKey, setRefineKey] = useState<string | null>(null);
  const [refineSectionTitle, setRefineSectionTitle] = useState<string | null>(null);
  const [refineContent, setRefineContent] = useState("");
  const [refineInstruction, setRefineInstruction] = useState("");
  const [revisedPreview, setRevisedPreview] = useState<string | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSavingArchive, setIsSavingArchive] = useState(false);

  const handleSaveToArchive = async () => {
    setIsSavingArchive(true);
    try {
      const user = getStoredUser();
      const record: SavedProjectRecord = {
        id: currentDoc.id || `proj-${Date.now()}`,
        userId: user.id || "usr-default",
        title: currentDoc.title,
        category: currentDoc.category,
        targetEntity: currentDoc.targetEntity,
        durationMonths: currentDoc.durationMonths,
        stage: "result",
        answers: {},
        documentData: currentDoc,
        treeGraph: treeData,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      await saveProjectRecord(record);
      setToastMessage("✓ Naskah berhasil disimpan ke Arsip Proyek!");
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error("Gagal menyimpan ke arsip:", err);
    } finally {
      setIsSavingArchive(false);
    }
  };

  useEffect(() => {
    setCurrentDoc(doc);
    setHistory([doc]);
    setHistoryIndex(0);
  }, [doc]);

  // Auto-Save effect to localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && currentDoc) {
      try {
        localStorage.setItem(`academic_studio_autosave_${currentDoc.id || "draft"}`, JSON.stringify(currentDoc));
        const now = new Date();
        setLastSaved(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      } catch {
        // storage quota exceeded or disabled
      }
    }
  }, [currentDoc]);

  // Undo / Redo handlers
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevDoc = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setCurrentDoc(prevDoc);
      setToastMessage("Berhasil kembali ke versi naskah sebelumnya (Undo).");
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextDoc = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setCurrentDoc(nextDoc);
      setToastMessage("Berhasil memulihkan versi revisi (Redo).");
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  const pushToHistory = (newDoc: ProposalDocument) => {
    const truncatedHistory = history.slice(0, historyIndex + 1);
    truncatedHistory.push(newDoc);
    setHistory(truncatedHistory);
    setHistoryIndex(truncatedHistory.length - 1);
  };

  const handleExportBibTeX = () => {
    const bib = generateBibTeX(currentDoc);
    downloadCitationFile(bib, `Sitasi_${currentDoc.id || "Proposal"}.bib`, "application/x-bibtex");
    setToastMessage("Berkas BibTeX (.bib) untuk Mendeley & Zotero berhasil diunduh.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportRIS = () => {
    const ris = generateRIS(currentDoc);
    downloadCitationFile(ris, `Sitasi_${currentDoc.id || "Proposal"}.ris`, "application/x-research-info-systems");
    setToastMessage("Berkas RIS untuk Reference Manager berhasil diunduh.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRefineWithAI = (key: string, title: string, textToRefine: string) => {
    setRefineKey(key);
    setRefineSectionTitle(title);
    setRefineContent(textToRefine || "");
    setRefineInstruction("");
    setRevisedPreview(null);
    setRefineError(null);
  };

  const closeRefineModal = () => {
    setRefineSectionTitle(null);
    setRefineKey(null);
    setRefineInstruction("");
    setRevisedPreview(null);
    setRefineError(null);
  };

  const submitAiRefinement = async () => {
    if (!refineKey || !refineInstruction.trim()) return;
    setIsRefining(true);
    setRefineError(null);
    try {
      const res = await fetch("/api/gemini/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionTitle: refineSectionTitle,
          currentContent: refineContent,
          instruction: refineInstruction
        })
      });
      const data = await res.json();
      if (data.success && data.revisedContent) {
        setRevisedPreview(data.revisedContent);
      } else {
        setRefineError(data.error || "Gagal merevisi naskah. Silakan coba kembali.");
      }
    } catch (e: any) {
      setRefineError(`Terjadi kesalahan: ${e.message}`);
    } finally {
      setIsRefining(false);
    }
  };

  const applyRefinedContent = (finalText: string) => {
    if (!refineKey) return;
    setCurrentDoc(prev => {
      const updated = { ...prev };
      if (refineKey === "executiveSummary") {
        updated.executiveSummary = finalText;
      } else if (refineKey === "bab1.latarBelakang") {
        const paras = finalText.split("\n\n").map((p: string) => p.trim()).filter(Boolean);
        updated.bab1 = { ...updated.bab1, latarBelakang: paras.length > 0 ? paras : [finalText] };
      } else if (refineKey === "bab1.rumusanMasalah") {
        const items = finalText.split("\n").map((l: string) => l.replace(/^[\d\.\-\*\•\s]+/, "").trim()).filter(Boolean);
        updated.bab1 = { ...updated.bab1, rumusanMasalah: items.length > 0 ? items : [finalText] };
      } else if (refineKey === "bab1.batasanMasalah") {
        const items = finalText.split("\n").map((l: string) => l.replace(/^[\d\.\-\*\•\s]+/, "").trim()).filter(Boolean);
        updated.bab1 = { ...updated.bab1, batasanMasalah: items.length > 0 ? items : [finalText] };
      } else if (refineKey === "bab1.tujuanUmum") {
        updated.bab1 = { ...updated.bab1, tujuanUmum: finalText };
      } else if (refineKey === "bab2.profilInstansi") {
        updated.bab2 = { ...updated.bab2, profilInstansi: finalText };
      } else if (refineKey === "bab2.conceptualFramework") {
        updated.bab2 = { ...updated.bab2, conceptualFramework: finalText };
      } else if (refineKey === "bab3.metodePelaksanaan") {
        updated.bab3 = { ...updated.bab3, metodePelaksanaan: finalText };
      } else if (refineKey === "bab3.populationSample") {
        updated.bab3 = { ...updated.bab3, populationSample: finalText };
      } else if (refineKey === "bab3.ethicalConsiderations") {
        updated.bab3 = { ...updated.bab3, ethicalConsiderations: finalText };
      } else if (refineKey === "bab4.penutup") {
        updated.bab4 = { ...updated.bab4, penutup: finalText };
      } else if (refineKey === "bab4.disseminationPlan") {
        updated.bab4 = { ...updated.bab4, disseminationPlan: finalText };
      }
      pushToHistory(updated);
      return updated;
    });

    setToastMessage(`Bagian "${refineSectionTitle}" berhasil diperbarui ke dalam naskah!`);
    setTimeout(() => setToastMessage(null), 3500);
    closeRefineModal();
  };

  const generateFullMarkdown = () => {
    return `# PROPOSAL ${currentDoc.category.toUpperCase()}

## ${currentDoc.title.toUpperCase()}

**Diajukan untuk Memenuhi Persyaratan Akademik pada:**
**${currentDoc.facultyMajor} - ${currentDoc.institution}**

---

### IDENTITAS PENELITI / MAHASISWA
- **Nama:** ${currentDoc.candidateName}
- **NIM / NPM:** ${currentDoc.candidateId}
- **Program Studi:** ${currentDoc.facultyMajor}
- **Perguruan Tinggi:** ${currentDoc.institution}
- **Instansi Tujuan:** ${currentDoc.targetEntity} (${currentDoc.targetDepartment})
- **Rencana Durasi:** ${currentDoc.durationMonths} Bulan (${currentDoc.bab4.jadwalMatriks.length * 4 || 16} Minggu Kerja)
- **Tanggal Penyusunan:** ${currentDoc.generationDate}

---

## RINGKASAN EKSEKUTIF
${currentDoc.executiveSummary}

---

## ${currentDoc.bab1.title}

### 1.1 Latar Belakang Masalah
${currentDoc.bab1.latarBelakang.join("\n\n")}

### 1.2 Rumusan Masalah
${currentDoc.bab1.rumusanMasalah.map((r, i) => `${i + 1}. ${r}`).join("\n")}

### 1.3 Batasan Masalah
${currentDoc.bab1.batasanMasalah.map((b, i) => `• ${b}`).join("\n")}

### 1.4 Tujuan Penelitian / Magang
**Tujuan Umum:**
${currentDoc.bab1.tujuanUmum}

**Tujuan Khusus:**
${currentDoc.bab1.tujuanKhusus.map((t, i) => `• ${t}`).join("\n")}

### 1.5 Manfaat Kegiatan
**Bagi Mahasiswa:**
${currentDoc.bab1.manfaatMahasiswa.map(m => `• ${m}`).join("\n")}

**Bagi Instansi Mitra (${currentDoc.targetEntity}):**
${currentDoc.bab1.manfaatInstansi.map(m => `• ${m}`).join("\n")}

**Bagi Perguruan Tinggi (${currentDoc.institution}):**
${currentDoc.bab1.manfaatAkademik.map(m => `• ${m}`).join("\n")}

---

## ${currentDoc.bab2.title}

### 2.1 Profil Instansi / Objek Penelitian
${currentDoc.bab2.profilInstansi}

**Visi & Misi:**
${currentDoc.bab2.visiMisi.map((v, i) => `${i + 1}. ${v}`).join("\n")}

**Struktur Organisasi:**
${currentDoc.bab2.strukturOrganisasi}

### 2.2 Landasan Teori Ilmiah
${currentDoc.bab2.landasanTeori.map((t, i) => `#### 2.2.${i + 1} ${t.topic}\n${t.elaboration}\n*Rujukan: ${t.citation}*`).join("\n\n")}

---

## ${currentDoc.bab3.title}

### 3.1 Metode Pelaksanaan
${currentDoc.bab3.metodePelaksanaan}

### 3.2 Ruang Lingkup Penugasan
${currentDoc.bab3.lingkupPekerjaan.map((l, i) => `${i + 1}. ${l}`).join("\n")}

### 3.3 Spesifikasi Perangkat & Lingkungan Kerja
${currentDoc.bab3.perangkatTools.map(p => `• ${p}`).join("\n")}

### 3.4 Target Capaian Kompetensi
${currentDoc.bab3.rencanaKompetensi.map(c => `• ${c}`).join("\n")}

---

## ${currentDoc.bab4.title}

### 4.1 Matriks Rencana Kerja Mingguan
| Minggu | Tahap Pelaksanaan | Rincian Aktivitas | Target Luaran (Output) |
|---|---|---|---|
${currentDoc.bab4.jadwalMatriks.map(j => `| Mg ${j.week} | ${j.phase} | ${j.activities.join("; ")} | ${j.output} |`).join("\n")}

### 4.2 Penutup
${currentDoc.bab4.penutup}

---

### LEMBAR PENGESAHAN

Mengetahui,
**Dosen Pembimbing Akademik,**


(________________________________)
NIP.


Menyetujui,
**Pimpinan / Mentor Lapangan ${currentDoc.targetEntity},**


(________________________________)
NIP / NIK.
`;
  };

  const handleCopy = () => {
    const text = generateFullMarkdown();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDocx = async () => {
    setIsExportingDocx(true);
    try {
      const blob = await generateAcademicProposalDocx(currentDoc);
      downloadDocxBlob(blob, `Proposal_${currentDoc.category.toUpperCase()}_${currentDoc.candidateName.replace(/\s+/g, "_")}.docx`);
    } catch (err) {
      console.error("Gagal mengekspor DOCX:", err);
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleDownloadPptx = async () => {
    setIsExportingPptx(true);
    try {
      await generateAcademicProposalPptx(currentDoc);
    } catch (err) {
      console.error("Gagal mengekspor PPTX:", err);
    } finally {
      setIsExportingPptx(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-4 sm:py-6 animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs rounded-xl shadow-2xl animate-in slide-in-from-bottom-5">
          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-zinc-500 hover:text-zinc-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Sleek Consolidated Action Bar & Document Metadata */}
      <div className="pb-5 mb-5 border-b border-zinc-200 dark:border-zinc-850 flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
        {/* Left Cluster: Category, Saved Status, Title, Author Info */}
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase font-mono tracking-wider px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold border border-zinc-200 dark:border-zinc-700/50">
              {currentDoc.category === "magang" ? "Magang Industri" : currentDoc.category === "skripsi" ? "Skripsi / TA" : "Tesis & Riset"}
            </span>
            <button
              type="button"
              onClick={() => setIsGuidelineModalOpen(true)}
              title="Klik untuk memilih preset kampus (UGM, UI, ITB, dll.) atau memindai PDF buku pedoman kampus Anda"
              className="inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 transition-colors cursor-pointer"
            >
              <Landmark className="w-3 h-3 text-indigo-500" />
              <span>
                Format: {currentDoc.campusGuideline?.campusName || "Standar Dikti"} ({currentDoc.campusGuideline?.margins ? `${currentDoc.campusGuideline.margins.leftCm}-${currentDoc.campusGuideline.margins.topCm}-${currentDoc.campusGuideline.margins.rightCm}-${currentDoc.campusGuideline.margins.bottomCm} cm` : "4-4-3-3 cm"})
              </span>
            </button>
            {lastSaved && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>Auto-saved {lastSaved}</span>
              </span>
            )}
          </div>
          <h1 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-snug line-clamp-1" title={currentDoc.title}>
            {currentDoc.title}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2 flex-wrap">
            <span className="text-zinc-800 dark:text-zinc-200 font-medium">{currentDoc.candidateName}</span>
            <span>&bull;</span>
            <span>{currentDoc.targetEntity}</span>
            <span>&bull;</span>
            <span>{currentDoc.durationMonths} Bulan</span>
          </p>
        </div>

        {/* Right Cluster: Undo/Redo, APA/IEEE switch, Tools dropdown, Export dropdown, Copilot button */}
        <div className="flex items-center flex-wrap gap-2 lg:self-center">
          {/* Undo & Redo History */}
          <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-900 shadow-xs">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
              title="Undo perubahan naskah"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-800"></div>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
              title="Redo perubahan naskah"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Citation Switcher Pill */}
          <button
            type="button"
            onClick={() => setCitationStyle(prev => prev === "apa" ? "ieee" : "apa")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-mono transition-all cursor-pointer shadow-xs"
            title="Ganti format kutipan & daftar pustaka antara APA 7th Edition dan IEEE"
          >
            <BookmarkCheck className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            <span>{citationStyle === "apa" ? "APA 7th" : "IEEE"}</span>
          </button>

          {/* Dropdown 1: Alat Riset */}
          <div className="relative" ref={toolsDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsToolsDropdownOpen(!isToolsDropdownOpen);
                setIsExportDropdownOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer shadow-xs ${
                isToolsDropdownOpen
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black border-zinc-900 dark:border-zinc-100"
                  : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Alat Riset</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isToolsDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isToolsDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1.5 shadow-xl z-30 animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsToolsDropdownOpen(false);
                    setIsConsultationModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors text-left cursor-pointer border-b border-zinc-100 dark:border-zinc-800/80 mb-1"
                >
                  <GraduationCap className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">Klinik Bimbingan Ide & Alur (AI)</p>
                    <p className="text-[10px] text-zinc-500">Konsultasi masalah lapangan & alur riset</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsToolsDropdownOpen(false);
                    setIsGuidelineModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left cursor-pointer"
                >
                  <Landmark className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">Format Kampus & Panduan (AI)</p>
                    <p className="text-[10px] text-zinc-500">Pindai PDF / Pilih Preset Kampus Populer</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsToolsDropdownOpen(false);
                    setIsTurnitinModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">Audit Turnitin & Anti-Slop</p>
                    <p className="text-[10px] text-zinc-500">Cek orisinalitas & indikator klise AI</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsToolsDropdownOpen(false);
                    setIsInstrumentModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left cursor-pointer"
                >
                  <ClipboardList className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">Instrumen Riset & Angket</p>
                    <p className="text-[10px] text-zinc-500">Skala Likert, Wawancara, & Observasi</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsToolsDropdownOpen(false);
                    setIsApprovalModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left cursor-pointer"
                >
                  <FileSignature className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">Lembar Pengesahan Dosen</p>
                    <p className="text-[10px] text-zinc-500">Data Pembimbing & NIP Kaprodi</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsToolsDropdownOpen(false);
                    setIsLitModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">Literatur Jurnal & Matriks</p>
                    <p className="text-[10px] text-zinc-500">Pencarian paper & sintesis PRISMA</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Dropdown 2: Unduh & Ekspor */}
          <div className="relative" ref={exportDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsExportDropdownOpen(!isExportDropdownOpen);
                setIsToolsDropdownOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer shadow-xs ${
                isExportDropdownOpen
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black border-zinc-900 dark:border-zinc-100"
                  : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
              }`}
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Ekspor</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExportDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isExportDropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1.5 shadow-xl z-30 animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsExportDropdownOpen(false);
                    handleDownloadDocx();
                  }}
                  disabled={isExportingDocx}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left cursor-pointer"
                >
                  <FileDown className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {isExportingDocx ? "Menyusun Word..." : "Dokumen Word (.docx)"}
                    </p>
                    <p className="text-[10px] text-zinc-500">Standar nomor halaman & margin kampus</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsExportDropdownOpen(false);
                    handleDownloadPptx();
                  }}
                  disabled={isExportingPptx}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left cursor-pointer"
                >
                  <Presentation className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {isExportingPptx ? "Menyusun Slide..." : "Slide Sidang (.pptx)"}
                    </p>
                    <p className="text-[10px] text-zinc-500">Format eksekutif 16:9 siap presentasi</p>
                  </div>
                </button>

                <div className="my-1 border-t border-zinc-200 dark:border-zinc-800"></div>

                <button
                  type="button"
                  onClick={() => {
                    setIsExportDropdownOpen(false);
                    handleExportBibTeX();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left cursor-pointer"
                >
                  <BookMarked className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">Kutipan BibTeX (.bib)</p>
                    <p className="text-[10px] text-zinc-500">Untuk Mendeley & Zotero</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsExportDropdownOpen(false);
                    handleExportRIS();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left cursor-pointer"
                >
                  <BookmarkCheck className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">Kutipan RIS (.ris)</p>
                    <p className="text-[10px] text-zinc-500">Untuk EndNote & RefWorks</p>
                  </div>
                </button>

                <div className="my-1 border-t border-zinc-200 dark:border-zinc-800"></div>

                <button
                  type="button"
                  onClick={() => {
                    setIsExportDropdownOpen(false);
                    handleCopy();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left cursor-pointer"
                >
                  <Copy className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {copied ? "Tersalin ke Clipboard" : "Salin Markdown (.md)"}
                    </p>
                    <p className="text-[10px] text-zinc-500">Naskah lengkap format Markdown</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsExportDropdownOpen(false);
                    handlePrint();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">Cetak Dokumen / PDF</p>
                    <p className="text-[10px] text-zinc-500">Tata letak cetak A4 langsung</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Dedicated Simpan ke Arsip Proyek Button */}
          <button
            type="button"
            onClick={handleSaveToArchive}
            disabled={isSavingArchive}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            title="Simpan naskah dan perubahan ini ke database arsip"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-500" />
            <span>{isSavingArchive ? "Menyimpan..." : "Simpan ke Arsip"}</span>
          </button>

          {/* Co-Pilot AI Slide-over Drawer Trigger */}
          <button
            type="button"
            onClick={() => setIsCopilotOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-950 hover:bg-black text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-black text-xs font-semibold shadow-xs transition-all cursor-pointer"
            title="Buka asisten Co-Pilot AI untuk konsultasi metodologi & simulasi penguji"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Co-Pilot AI</span>
          </button>
        </div>
      </div>

      {/* 2. Structured Category Navigation Bar (Clean Grouping) */}
      <div className="border-b border-zinc-200 dark:border-zinc-850 pb-3 mb-4 no-print space-y-2.5">
        
        {/* Tier 1: Main Category Segment Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => {
              setWorkspaceCategory("naskah");
              setActiveTab("naskah");
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              workspaceCategory === "naskah"
                ? "bg-zinc-950 text-white dark:bg-zinc-100 dark:text-black font-semibold shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>1. Naskah &amp; Publikasi</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setWorkspaceCategory("metodologi");
              setActiveTab("jadwal");
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              workspaceCategory === "metodologi"
                ? "bg-zinc-950 text-white dark:bg-zinc-100 dark:text-black font-semibold shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent"
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>2. Metodologi &amp; Alur Kerja</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setWorkspaceCategory("sidang");
              setActiveTab("defense");
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              workspaceCategory === "sidang"
                ? "bg-zinc-950 text-white dark:bg-zinc-100 dark:text-black font-semibold shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>3. Kesiapan Sidang &amp; Bimbingan</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setWorkspaceCategory("kualitas");
              setActiveTab("audit");
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              workspaceCategory === "kualitas"
                ? "bg-zinc-950 text-white dark:bg-zinc-100 dark:text-black font-semibold shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>4. Kualitas &amp; Orisinalitas</span>
          </button>
        </div>

        {/* Tier 2: Contextual Sub-Pills for the Active Category */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {workspaceCategory === "naskah" && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab("naskah")}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "naskah"
                    ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 font-semibold"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>Naskah Proposal (A4)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsApprovalModalOpen(true)}
                className="px-3 py-1 rounded-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <FileSignature className="w-3 h-3 text-amber-500" />
                <span>Lembar Pengesahan Dosen</span>
              </button>

              <button
                type="button"
                onClick={() => setIsInstrumentModalOpen(true)}
                className="px-3 py-1 rounded-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ClipboardList className="w-3 h-3 text-blue-500" />
                <span>Instrumen Riset &amp; Angket</span>
              </button>

              <button
                type="button"
                onClick={() => setIsGuidelineModalOpen(true)}
                className="px-3 py-1 rounded-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Landmark className="w-3 h-3 text-indigo-500" />
                <span>Panduan Kampus ({currentDoc.campusGuideline?.campusName.split("(")[0].trim() || "Standar Dikti"})</span>
              </button>
            </>
          )}

          {workspaceCategory === "metodologi" && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab("jadwal")}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "jadwal"
                    ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 font-semibold"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                <CalendarDays className="w-3 h-3" />
                <span>Matriks Jadwal &amp; Timeline</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("flowchart")}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "flowchart"
                    ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 font-semibold"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                <Network className="w-3 h-3" />
                <span>Bagan Alir Penelitian (Bagan Resmi)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("tree")}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "tree"
                    ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 font-semibold"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                <Compass className="w-3 h-3" />
                <span>Pohon Alur Riset &amp; Roadmap Belajar</span>
              </button>
            </>
          )}

          {workspaceCategory === "sidang" && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab("defense")}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "defense"
                    ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 font-semibold"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                <ShieldAlert className="w-3 h-3" />
                <span>Tanya Jawab Sidang Penguji</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("slides")}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "slides"
                    ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 font-semibold"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                <Presentation className="w-3 h-3" />
                <span>Slide Sidang (16:9 Eksekutif)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("revisionMatrix")}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "revisionMatrix"
                    ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 font-semibold"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                <FileCheck2 className="w-3 h-3" />
                <span>Matriks Revisi Dosen</span>
              </button>
            </>
          )}

          {workspaceCategory === "kualitas" && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab("audit")}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "audit"
                    ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 font-semibold"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Audit Kualitas Ilmiah</span>
              </button>

              <button
                type="button"
                onClick={() => setIsTurnitinModalOpen(true)}
                className="px-3 py-1 rounded-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span>Cek Turnitin &amp; Orisinalitas</span>
              </button>

              <button
                type="button"
                onClick={() => setIsLitModalOpen(true)}
                className="px-3 py-1 rounded-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <BookOpen className="w-3 h-3 text-purple-500" />
                <span>Literatur Jurnal Primer (PRISMA)</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* QUICK JUMP OUTLINE RAIL (Only for Naskah Tab) */}
      {activeTab === "naskah" && (
        <div className="flex items-center gap-1.5 pb-4 mb-4 overflow-x-auto text-[11px] font-mono no-print">
          <span className="text-zinc-400 dark:text-zinc-500 flex items-center gap-1 mr-1 text-[11px]">
            <Compass className="w-3.5 h-3.5" /> Lompat Cepat:
          </span>
          <button
            type="button"
            onClick={() => scrollToSection("section-ringkasan")}
            className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 whitespace-nowrap transition-colors cursor-pointer"
          >
            Ringkasan
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("section-bab1")}
            className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 whitespace-nowrap transition-colors cursor-pointer"
          >
            Bab I: Pendahuluan
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("section-bab2")}
            className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 whitespace-nowrap transition-colors cursor-pointer"
          >
            Bab II: Kajian Pustaka
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("section-bab3")}
            className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 whitespace-nowrap transition-colors cursor-pointer"
          >
            Bab III: Metodologi
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("section-bab4")}
            className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 whitespace-nowrap transition-colors cursor-pointer"
          >
            Bab IV: Rencana Kerja
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("section-bab5")}
            className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 whitespace-nowrap transition-colors cursor-pointer"
          >
            Bab V: Kesimpulan & Mitigasi
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("section-pustaka")}
            className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 whitespace-nowrap transition-colors cursor-pointer"
          >
            Daftar Pustaka
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("section-pengesahan")}
            className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 whitespace-nowrap transition-colors cursor-pointer"
          >
            Lembar Pengesahan
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("section-lampiran")}
            className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 whitespace-nowrap transition-colors cursor-pointer"
          >
            Lampiran Lengkap
          </button>
        </div>
      )}

      {/* INTERACTIVE CAMPUS FORMAT INSPECTOR BAR */}
      {activeTab === "naskah" && (
        <div className="mb-4 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs no-print">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800/80">
              <Landmark className="w-3.5 h-3.5" />
              <span>Format: {currentDoc.campusGuideline?.campusName || "Standar Dikti"}</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 font-mono text-[11px]">
              <span>Margin: Kiri {currentDoc.campusGuideline?.margins?.leftCm ?? 4}cm • Atas {currentDoc.campusGuideline?.margins?.topCm ?? 4}cm • Kanan {currentDoc.campusGuideline?.margins?.rightCm ?? 3}cm • Bawah {currentDoc.campusGuideline?.margins?.bottomCm ?? 3}cm</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 font-mono text-[11px]">
              <span>Font: {currentDoc.campusGuideline?.typography?.fontFamily || "Times New Roman"} • Spasi {currentDoc.campusGuideline?.typography?.lineSpacing || 1.5}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Ruler Guide */}
            <button
              type="button"
              onClick={() => setShowMarginRuler(!showMarginRuler)}
              className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                showMarginRuler
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"
              }`}
            >
              <span>{showMarginRuler ? "✓ Batas Margin Aktif" : "Tampilkan Batas Margin (Ruler)"}</span>
            </button>

            {/* Change Guideline */}
            <button
              type="button"
              onClick={() => setIsGuidelineModalOpen(true)}
              className="px-2.5 py-1 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black font-semibold text-xs hover:bg-black dark:hover:bg-white transition-colors cursor-pointer shadow-xs"
            >
              Pindai / Ubah Format
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: NASKAH PROPOSAL LENGKAP */}
      {activeTab === "naskah" && (
        <article 
          style={{
            fontFamily: `${currentDoc.campusGuideline?.typography?.fontFamily || "Times New Roman"}, serif`,
            lineHeight: currentDoc.campusGuideline?.typography?.lineSpacing === 2.0 ? "2.0" : "1.65",
            paddingTop: `${(currentDoc.campusGuideline?.margins?.topCm ?? 4) * 9}px`,
            paddingBottom: `${(currentDoc.campusGuideline?.margins?.bottomCm ?? 3) * 9}px`,
            paddingLeft: `${(currentDoc.campusGuideline?.margins?.leftCm ?? 4) * 9}px`,
            paddingRight: `${(currentDoc.campusGuideline?.margins?.rightCm ?? 3) * 9}px`,
          }}
          className="relative bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-100 print:bg-white print:text-black print:p-0 print:border-none print:shadow-none transition-all duration-200"
        >
          {/* Visual Dashed Margin Guideline Overlay when ruler is toggled */}
          {showMarginRuler && (
            <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-indigo-400/40 dark:border-indigo-500/40 rounded-xl m-2 p-2 flex flex-col justify-between text-[10px] font-mono text-indigo-600 dark:text-indigo-400 no-print z-10">
              <div className="flex justify-between items-center bg-indigo-50/80 dark:bg-indigo-950/80 px-2 py-0.5 rounded shadow-xs">
                <span>▲ Margin Atas: {currentDoc.campusGuideline?.margins?.topCm ?? 4} cm</span>
                <span>Standar Kertas A4 (21 x 29.7 cm)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="bg-indigo-50/80 dark:bg-indigo-950/80 px-1.5 py-0.5 rounded shadow-xs">◀ Kiri: {currentDoc.campusGuideline?.margins?.leftCm ?? 4} cm</span>
                <span className="bg-indigo-50/80 dark:bg-indigo-950/80 px-1.5 py-0.5 rounded shadow-xs">Kanan: {currentDoc.campusGuideline?.margins?.rightCm ?? 3} cm ▶</span>
              </div>
              <div className="flex justify-between items-center bg-indigo-50/80 dark:bg-indigo-950/80 px-2 py-0.5 rounded shadow-xs">
                <span>▼ Margin Bawah: {currentDoc.campusGuideline?.margins?.bottomCm ?? 3} cm</span>
                <span>Font: {currentDoc.campusGuideline?.typography?.fontFamily || "Times New Roman"} • Spasi: {currentDoc.campusGuideline?.typography?.lineSpacing || 1.5}</span>
              </div>
            </div>
          )}
          
          {/* Cover Header */}
          <div className="text-center pb-8 border-b border-zinc-200 dark:border-zinc-850 print:border-black mb-8">
            <div className="text-xs font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400 print:text-gray-700">
              PROPOSAL {currentDoc.category.toUpperCase()}
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-zinc-900 dark:text-zinc-100 mt-2 leading-snug print:text-black">
              {currentDoc.title}
            </h1>
            <p className="text-xs sm:text-sm font-sans text-zinc-600 dark:text-zinc-400 mt-3 max-w-xl mx-auto print:text-gray-700">
              Diajukan untuk Memenuhi Prasyarat Kurikulum Akademik pada {currentDoc.facultyMajor}, {currentDoc.institution}
            </p>

            <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-850/60 max-w-md mx-auto text-center font-sans text-xs space-y-1 text-zinc-700 dark:text-zinc-300 print:text-black">
              <p className="font-semibold text-zinc-900 dark:text-zinc-200 print:text-black">{currentDoc.candidateName}</p>
              <p className="text-zinc-500 font-mono print:text-gray-700">NIM: {currentDoc.candidateId}</p>
              <p className="text-zinc-600 dark:text-zinc-400 print:text-black">{currentDoc.institution} &bull; {currentDoc.generationDate}</p>
            </div>
          </div>

          {/* Executive Summary */}
          <div id="section-ringkasan" className="mb-10 p-4 sm:p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-850 print:border-gray-300 print:bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-300 print:text-black">
                Ringkasan Eksekutif
              </h3>
              <button
                type="button"
                onClick={() => handleRefineWithAI("executiveSummary", "Ringkasan Eksekutif", currentDoc.executiveSummary)}
                className="no-print text-[11px] font-mono text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-white dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
              >
                <Sparkles className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
                <span>Revisi AI</span>
              </button>
            </div>
            <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans print:text-black">
              {currentDoc.executiveSummary}
            </p>
          </div>

          {/* BAB I */}
          <section id="section-bab1" className="mb-10">
            <div className="border-b border-zinc-200 dark:border-zinc-850 pb-2 mb-4 print:border-black">
              <h2 className="text-base sm:text-lg font-serif font-bold text-zinc-900 dark:text-zinc-100 print:text-black uppercase">
                {currentDoc.bab1.title}
              </h2>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-zinc-800 dark:text-zinc-300 leading-relaxed text-justify print:text-black font-sans">
              <div className="flex items-center justify-between pt-1">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif">1.1 Latar Belakang Masalah</h3>
                <button
                  type="button"
                  onClick={() => handleRefineWithAI("bab1.latarBelakang", "1.1 Latar Belakang Masalah", currentDoc.bab1.latarBelakang.join("\n\n"))}
                  className="no-print text-[11px] font-mono text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                >
                  <Sparkles className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
                  <span>Revisi AI</span>
                </button>
              </div>
              {currentDoc.bab1.latarBelakang.map((para, i) => (
                <p key={i} className="indent-6">{para}</p>
              ))}

              <div className="flex items-center justify-between pt-2">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif">1.2 Rumusan Masalah</h3>
                <button
                  type="button"
                  onClick={() => handleRefineWithAI("bab1.rumusanMasalah", "1.2 Rumusan Masalah", currentDoc.bab1.rumusanMasalah.join("\n"))}
                  className="no-print text-[11px] font-mono text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                >
                  <Sparkles className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
                  <span>Revisi AI</span>
                </button>
              </div>
              <ol className="list-decimal pl-6 space-y-1.5">
                {currentDoc.bab1.rumusanMasalah.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ol>

              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif pt-2">1.3 Batasan Masalah</h3>
              <ul className="list-disc pl-6 space-y-1">
                {currentDoc.bab1.batasanMasalah.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>

              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif pt-2">1.4 Tujuan Kegiatan</h3>
              <p><strong>Tujuan Umum:</strong> {currentDoc.bab1.tujuanUmum}</p>
              <p className="pt-1"><strong>Tujuan Khusus:</strong></p>
              <ul className="list-disc pl-6 space-y-1">
                {currentDoc.bab1.tujuanKhusus.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>

              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif pt-2">1.5 Manfaat Kegiatan</h3>
              <div className="space-y-2">
                <p><strong>1. Bagi Mahasiswa:</strong></p>
                <ul className="list-disc pl-6 space-y-0.5">
                  {currentDoc.bab1.manfaatMahasiswa.map((m, i) => <li key={i}>{m}</li>)}
                </ul>

                <p className="pt-1"><strong>2. Bagi Instansi Mitra ({currentDoc.targetEntity}):</strong></p>
                <ul className="list-disc pl-6 space-y-0.5">
                  {currentDoc.bab1.manfaatInstansi.map((m, i) => <li key={i}>{m}</li>)}
                </ul>

                <p className="pt-1"><strong>3. Bagi Perguruan Tinggi ({currentDoc.institution}):</strong></p>
                <ul className="list-disc pl-6 space-y-0.5">
                  {currentDoc.bab1.manfaatAkademik.map((m, i) => <li key={i}>{m}</li>)}
                </ul>
              </div>
            </div>
          </section>

          {/* BAB II */}
          <section id="section-bab2" className="mb-10">
            <div className="border-b border-zinc-200 dark:border-zinc-850 pb-2 mb-4 print:border-black">
              <h2 className="text-base sm:text-lg font-serif font-bold text-zinc-900 dark:text-zinc-100 print:text-black uppercase">
                {currentDoc.bab2.title}
              </h2>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-zinc-800 dark:text-zinc-300 leading-relaxed text-justify print:text-black font-sans">
              {currentDoc.category === "magang" ? (
                /* Format Khusus Magang: Profil Perusahaan, Visi Misi, Struktur Organisasi */
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif">2.1 Profil Instansi Mitra</h3>
                    <button
                      type="button"
                      onClick={() => handleRefineWithAI("bab2.profilInstansi", "2.1 Profil Instansi Mitra", currentDoc.bab2.profilInstansi)}
                      className="no-print text-[11px] font-mono text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                    >
                      <Sparkles className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
                      <span>Revisi AI</span>
                    </button>
                  </div>
                  <p className="indent-6">{currentDoc.bab2.profilInstansi}</p>
                  
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800 print:bg-gray-50 print:border-gray-300">
                    <p className="font-semibold text-xs text-zinc-900 dark:text-zinc-200 mb-1 print:text-black">Visi & Misi:</p>
                    <ul className="space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
                      {currentDoc.bab2.visiMisi.map((v, i) => <li key={i}>{v}</li>)}
                    </ul>
                  </div>

                  <p className="indent-6">{currentDoc.bab2.strukturOrganisasi}</p>

                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif pt-2">2.2 Landasan Teori Terapan & Standar Industri</h3>
                  <div className="space-y-3">
                    {currentDoc.bab2.landasanTeori.map((theory, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 print:border-gray-200">
                        <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 print:text-black mb-1">{theory.topic}</h4>
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 print:text-black">{theory.elaboration}</p>
                        <p className="text-[11px] text-zinc-500 font-mono mt-1 print:text-gray-600">Rujukan: {theory.citation}</p>
                      </div>
                    ))}
                  </div>

                  {/* Diagram Alur Kerangka Konseptual & Berpikir */}
                  <AcademicFlowchartDiagram doc={currentDoc} type="conceptual" />
                </>
              ) : (
                /* Format Khusus Skripsi/Penelitian: Tinjauan Pustaka, Matriks Keaslian 7 Kolom, Kerangka Konsep, Hipotesis */
                <>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif">2.1 Tinjauan Teoretis Variabel Penelitian</h3>
                  <div className="space-y-3">
                    {currentDoc.bab2.landasanTeori.map((theory, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 print:border-gray-200">
                        <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 print:text-black mb-1">{theory.topic}</h4>
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 print:text-black">{theory.elaboration}</p>
                        <p className="text-[11px] text-zinc-500 font-mono mt-1 print:text-gray-600">Rujukan Otoritatif: {theory.citation}</p>
                      </div>
                    ))}
                  </div>

                  {/* Matriks Keaslian Penelitian (SOP 7-Kolom PRISMA 2020) */}
                  {currentDoc.bab2.researchGapMatrix && currentDoc.bab2.researchGapMatrix.length > 0 && (
                    <div className="pt-2">
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif mb-2">
                        2.2 Matriks Keaslian Penelitian (Research Gap & State-of-the-Art)
                      </h3>
                      <div className="overflow-x-auto my-3">
                        <table className="w-full text-left text-xs font-sans border-t-2 border-b-2 border-zinc-300 dark:border-zinc-700 print:border-black">
                          <thead>
                            <tr className="border-b border-zinc-200 dark:border-zinc-800 print:border-black font-semibold text-zinc-900 dark:text-zinc-100 print:text-black">
                              <th className="py-2 px-2.5">No</th>
                              <th className="py-2 px-2.5">Penulis & Tahun</th>
                              <th className="py-2 px-2.5">Judul & Jurnal</th>
                              <th className="py-2 px-2.5">Desain & Sampel</th>
                              <th className="py-2 px-2.5">Variabel & Instrumen</th>
                              <th className="py-2 px-2.5">Temuan Utama</th>
                              <th className="py-2 px-2.5">Celah & Perbedaan Studi Ini</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 print:divide-gray-300 text-zinc-700 dark:text-zinc-300 print:text-black text-[11px]">
                            {currentDoc.bab2.researchGapMatrix.map((item, idx) => (
                              <tr key={idx} className="align-top">
                                <td className="py-2 px-2.5 font-mono font-medium">{item.no}</td>
                                <td className="py-2 px-2.5 font-medium text-zinc-900 dark:text-zinc-200 print:text-black whitespace-nowrap">{item.authorYear}</td>
                                <td className="py-2 px-2.5 italic">{item.titleJournal}</td>
                                <td className="py-2 px-2.5">{item.designSample}</td>
                                <td className="py-2 px-2.5">{item.variables}</td>
                                <td className="py-2 px-2.5">{item.findingsEffect}</td>
                                <td className="py-2 px-2.5 font-medium text-zinc-900 dark:text-zinc-200 print:text-black bg-zinc-50 dark:bg-zinc-900/40 print:bg-gray-50">{item.gapDifference}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <p className="text-[11px] text-zinc-500 mt-1.5 italic print:text-gray-600">
                          *Matriks sintesis 7 kolom berstandar pedoman PRISMA 2020 & STROBE.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Kerangka Konseptual & Hipotesis */}
                  {currentDoc.bab2.conceptualFramework && (
                    <div className="pt-2">
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif mb-1">
                        2.3 Kerangka Konsep Penelitian
                      </h3>
                      <p className="indent-6">{currentDoc.bab2.conceptualFramework}</p>
                    </div>
                  )}

                  {/* Diagram Alur Kerangka Konseptual & Berpikir */}
                  <AcademicFlowchartDiagram doc={currentDoc} type="conceptual" />

                  {currentDoc.bab2.hypotheses && currentDoc.bab2.hypotheses.length > 0 && (
                    <div className="pt-2">
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif mb-1">
                        2.4 Hipotesis Penelitian
                      </h3>
                      <ul className="list-disc pl-6 space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
                        {currentDoc.bab2.hypotheses.map((h, i) => <li key={i}>{h}</li>)}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          {/* BAB III */}
          <section id="section-bab3" className="mb-10">
            <div className="border-b border-zinc-200 dark:border-zinc-850 pb-2 mb-4 print:border-black">
              <h2 className="text-base sm:text-lg font-serif font-bold text-zinc-900 dark:text-zinc-100 print:text-black uppercase">
                {currentDoc.bab3.title}
              </h2>
            </div>

            {/* Formal Academic Figure 3.1: Bagan Alir Tahapan Pelaksanaan */}
            <div className="my-6 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-center">
              <div className="max-w-2xl mx-auto py-2">
                <AcademicFlowchartDiagram doc={currentDoc} type="methodology" />
              </div>
              <p className="text-xs font-serif font-bold text-zinc-900 dark:text-zinc-100 mt-2 text-center">
                Gambar 3.1 Bagan Alir Tahapan Pelaksanaan {currentDoc.category === "magang" ? "Kegiatan Magang & Analisis" : "Penelitian"}
              </p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-zinc-800 dark:text-zinc-300 leading-relaxed text-justify print:text-black font-sans">
              {currentDoc.category === "magang" ? (
                /* Format Khusus Magang: Metode Kerja, WBS, Perangkat, Kompetensi */
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif">3.1 Metode Pelaksanaan Kerja</h3>
                    <button
                      type="button"
                      onClick={() => handleRefineWithAI("bab3.metodePelaksanaan", "3.1 Metode Pelaksanaan Kerja", currentDoc.bab3.metodePelaksanaan)}
                      className="no-print text-[11px] font-mono text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                    >
                      <Sparkles className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
                      <span>Revisi AI</span>
                    </button>
                  </div>
                  <p className="indent-6">{currentDoc.bab3.metodePelaksanaan}</p>

                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif pt-2">3.2 Lingkup Penugasan (Work Breakdown Structure)</h3>
                  <ol className="list-decimal pl-6 space-y-1">
                    {(currentDoc.bab3.wbsScope || currentDoc.bab3.lingkupPekerjaan).map((l, i) => <li key={i}>{l}</li>)}
                  </ol>

                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif pt-2">3.3 Lingkungan Kerja, Tools, & SOP</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    {currentDoc.bab3.perangkatTools.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>

                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif pt-2">3.4 Target Capaian Hard & Soft Skills</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    {currentDoc.bab3.rencanaKompetensi.map((k, i) => <li key={i}>{k}</li>)}
                  </ul>
                </>
              ) : (
                /* Format Khusus Skripsi: Desain Riset, Populasi & Sampel, DOV Table, KEPK */
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif">3.1 Jenis dan Desain Penelitian</h3>
                    <button
                      type="button"
                      onClick={() => handleRefineWithAI("bab3.metodePelaksanaan", "3.1 Jenis dan Desain Penelitian", currentDoc.bab3.metodePelaksanaan)}
                      className="no-print text-[11px] font-mono text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                    >
                      <Sparkles className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
                      <span>Revisi AI</span>
                    </button>
                  </div>
                  <p className="indent-6">{currentDoc.bab3.metodePelaksanaan}</p>

                  {/* Populasi & Sampel */}
                  {currentDoc.bab3.populationSample && (
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif pt-2">3.2 Populasi, Sampel, & Kriteria Subjek</h3>
                      <p className="indent-6">{currentDoc.bab3.populationSample}</p>
                    </div>
                  )}

                  {/* Tabel Definisi Operasional Variabel (Tabel 3 Garis Terbuka) */}
                  {currentDoc.bab3.operationalDefinitions && currentDoc.bab3.operationalDefinitions.length > 0 && (
                    <div className="pt-2">
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif mb-2">
                        3.3 Tabel Definisi Operasional Variabel (DOV)
                      </h3>
                      <div className="overflow-x-auto my-3">
                        <table className="w-full text-left text-xs font-sans border-t-2 border-b-2 border-zinc-300 dark:border-zinc-700 print:border-black">
                          <thead>
                            <tr className="border-b border-zinc-200 dark:border-zinc-800 print:border-black font-semibold text-zinc-900 dark:text-zinc-100 print:text-black">
                              <th className="py-2 px-3">Variabel Penelitian</th>
                              <th className="py-2 px-3">Definisi Operasional</th>
                              <th className="py-2 px-3">Parameter & Alat Ukur</th>
                              <th className="py-2 px-3">Skala Pengukuran</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 print:divide-gray-300 text-zinc-700 dark:text-zinc-300 print:text-black text-[11px]">
                            {currentDoc.bab3.operationalDefinitions.map((dov, idx) => (
                              <tr key={idx} className="align-top">
                                <td className="py-2 px-3 font-medium text-zinc-900 dark:text-zinc-200 print:text-black whitespace-nowrap">{dov.variable}</td>
                                <td className="py-2 px-3">{dov.definition}</td>
                                <td className="py-2 px-3">{dov.parameterTool}</td>
                                <td className="py-2 px-3 font-mono">{dov.indicatorScale}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Instrumen & Kalibrasi */}
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif pt-2">3.4 Instrumen & Kalibrasi Alat Ukur</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    {currentDoc.bab3.perangkatTools.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>

                  {/* Kelaikan Etik (Ethical Clearance) */}
                  {currentDoc.bab3.ethicalConsiderations && (
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif pt-2">3.5 Protokol Etika Penelitian (Ethical Clearance)</h3>
                      <p className="indent-6">{currentDoc.bab3.ethicalConsiderations}</p>
                    </div>
                  )}

                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif pt-2">3.6 Rencana Analisis Data & Uji Hipotesis</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    {currentDoc.bab3.rencanaKompetensi.map((k, i) => <li key={i}>{k}</li>)}
                  </ul>
                </>
              )}
            </div>
          </section>

          {/* BAB IV: MATRIKS TABEL AKADEMIK (3 Garis Horizontal Standar) */}
          <section id="section-bab4" className="mb-10">
            <div className="border-b border-zinc-200 dark:border-zinc-850 pb-2 mb-4 print:border-black">
              <h2 className="text-base sm:text-lg font-serif font-bold text-zinc-900 dark:text-zinc-100 print:text-black uppercase">
                {currentDoc.bab4.title}
              </h2>
            </div>

            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif mb-3">
              Tabel 4.1 {currentDoc.category === "magang" ? "Matriks Rencana Kerja Mingguan (Logbook)" : "Jadwal Pelaksanaan Penelitian (Gantt Chart)"}
            </h3>

            {/* Academic 3-line Table */}
            <div className="overflow-x-auto my-4">
              <table className="w-full text-left text-xs font-sans border-t-2 border-b-2 border-zinc-300 dark:border-zinc-700 print:border-black">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 print:border-black font-semibold text-zinc-900 dark:text-zinc-100 print:text-black">
                    <th className="py-2 px-3">Minggu</th>
                    <th className="py-2 px-3">Tahap Pelaksanaan</th>
                    <th className="py-2 px-3">Rincian Aktivitas</th>
                    <th className="py-2 px-3">Target Luaran (Output)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 print:divide-gray-300 text-zinc-700 dark:text-zinc-300 print:text-black">
                  {currentDoc.bab4.jadwalMatriks.map((row, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-mono font-medium text-zinc-900 dark:text-zinc-200 print:text-black whitespace-nowrap">
                        Mg {row.week}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-zinc-900 dark:text-zinc-100 print:text-black">
                        {row.phase}
                      </td>
                      <td className="py-2.5 px-3">
                        <ul className="list-disc pl-4 space-y-0.5">
                          {row.activities.map((act, aIdx) => <li key={aIdx}>{act}</li>)}
                        </ul>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-600 dark:text-zinc-300 print:text-black">
                        {row.output}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-[11px] text-zinc-500 mt-2 italic print:text-gray-600">
                *Tabel terbuka 3 garis horizontal sesuai kaidah penulisan karya ilmiah perguruan tinggi.
              </p>
            </div>

            {/* Tabel Rencana Anggaran Biaya (RAB) untuk Skripsi/Penelitian */}
            {currentDoc.bab4.budgetPlan && currentDoc.bab4.budgetPlan.length > 0 && (
              <div className="pt-3 mb-6">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif mb-2">
                  Tabel 4.2 Rencana Anggaran Biaya (RAB Penelitian)
                </h3>
                <div className="overflow-x-auto my-2">
                  <table className="w-full text-left text-xs font-sans border-t-2 border-b-2 border-zinc-300 dark:border-zinc-700 print:border-black">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 print:border-black font-semibold text-zinc-900 dark:text-zinc-100 print:text-black">
                        <th className="py-2 px-3">Komponen Biaya</th>
                        <th className="py-2 px-3">Kategori</th>
                        <th className="py-2 px-3 text-right">Alokasi Anggaran (Rp)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 print:divide-gray-300 text-zinc-700 dark:text-zinc-300 print:text-black text-[11px]">
                      {currentDoc.bab4.budgetPlan.map((b, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3">{b.item}</td>
                          <td className="py-2 px-3 font-medium text-zinc-600 dark:text-zinc-400">{b.category}</td>
                          <td className="py-2 px-3 text-right font-mono font-medium text-zinc-900 dark:text-zinc-200 print:text-black">
                            Rp {b.cost.toLocaleString("id-ID")}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-zinc-300 dark:border-zinc-700 font-bold text-zinc-900 dark:text-zinc-100 print:text-black">
                        <td colSpan={2} className="py-2.5 px-3">Total Anggaran Riset</td>
                        <td className="py-2.5 px-3 text-right font-mono">
                          Rp {currentDoc.bab4.budgetPlan.reduce((acc, curr) => acc + curr.cost, 0).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Target Publikasi / Diseminasi untuk Skripsi */}
            {currentDoc.bab4.disseminationPlan && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif mb-1">
                  4.3 Rencana Diseminasi & Publikasi Jurnal
                </h3>
                <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-300 indent-6 font-sans print:text-black">
                  {currentDoc.bab4.disseminationPlan}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 mb-2">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif">
                {currentDoc.category === "magang" ? "4.2 Penutup" : "4.4 Penutup"}
              </h3>
              <button
                type="button"
                onClick={() => handleRefineWithAI("bab4.penutup", "Penutup Proposal", currentDoc.bab4.penutup)}
                className="no-print text-[11px] font-mono text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
              >
                <Sparkles className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
                <span>Revisi AI</span>
              </button>
            </div>
            <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-300 leading-relaxed indent-6 font-sans print:text-black">
              {currentDoc.bab4.penutup}
            </p>
          </section>

          {/* BAB V: KESIMPULAN, REKOMENDASI KONTRIBUSI, & MITIGASI RISIKO */}
          <section id="section-bab5" className="mb-10">
            <div className="border-b border-zinc-200 dark:border-zinc-850 pb-2 mb-4 print:border-black">
              <h2 className="text-base sm:text-lg font-serif font-bold text-zinc-900 dark:text-zinc-100 print:text-black uppercase">
                {currentDoc.bab5?.title || (currentDoc.category === "magang" ? "BAB V: PENUTUP, KONTRIBUSI, & MITIGASI RISIKO" : "BAB V: KESIMPULAN, REKOMENDASI KONTRIBUSI, & MITIGASI RISIKO")}
              </h2>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-zinc-800 dark:text-zinc-300 leading-relaxed text-justify print:text-black font-sans">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif pt-1">
                5.1 Kesimpulan Rencana Usulan
              </h3>
              <ul className="list-disc pl-6 space-y-1.5">
                {(currentDoc.bab5?.kesimpulanUsulan || [
                  `Usulan pelaksanaan kegiatan dengan topik "${currentDoc.title}" pada ${currentDoc.targetEntity} telah dirancang secara sistematis berbasis kebutuhan lapangan dan kaidah ilmiah yang ketat.`,
                  `Rancangan kerja berfase (Fase 1 s.d. 5) telah mengantisipasi seluruh risiko teknis dan menyelaraskan target luaran dengan standar capaian kompetensi kurikulum perguruan tinggi.`,
                  `Keterlibatan aktif pembimbing akademik dan mentor lapangan industri menjadi kunci ketercapaian seluruh target luaran tepat waktu.`
                ]).map((k, i) => (
                  <li key={i}>{k}</li>
                ))}
              </ul>

              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif pt-2">
                5.2 Rekomendasi Kontribusi Strategis
              </h3>
              <div className="space-y-2">
                {(currentDoc.bab5?.kontribusiPraktis || [
                  `Bagi ${currentDoc.targetEntity}: Memberikan solusi aplikatif teruji dan prototipe kerja yang dapat mengurangi inefisiensi proses operasional eksisting.`,
                  `Bagi Civitas Akademika (${currentDoc.institution}): Memperkaya basis studi kasus nyata dan memperkuat jejaring kemitraan strategis dengan dunia usaha/industri.`,
                  `Bagi Mahasiswa/Peneliti: Mengasah kompetensi analitis tingkat tinggi (HOTS), kedisiplinan kerja, serta etika profesionalisme.`
                ]).map((c, i) => (
                  <p key={i}>• {c}</p>
                ))}
              </div>

              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif pt-2 mb-2">
                5.3 Matriks Mitigasi Risiko Pelaksanaan (Contingency Plan)
              </h3>
              <div className="overflow-x-auto my-3">
                <table className="w-full text-left text-xs font-sans border-t-2 border-b-2 border-zinc-300 dark:border-zinc-700 print:border-black">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-850 print:border-black font-semibold text-zinc-900 dark:text-zinc-100 print:text-black">
                      <th className="py-2 px-3">No</th>
                      <th className="py-2 px-3">Potensi Hambatan / Risiko</th>
                      <th className="py-2 px-3">Rencana Aksi Mitigasi (Preventif/Korektif)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 print:divide-gray-300 text-zinc-700 dark:text-zinc-300 print:text-black text-[11px]">
                    {(currentDoc.bab5?.mitigasiRisiko || [
                      { risiko: "Keterlambatan perizinan administratif atau otorisasi akses data", mitigasi: "Pengajuan surat pengantar resmi sejak Minggu ke-1 dan penyiapan dataset sekunder sebagai penyangga (buffer)." },
                      { risiko: "Kendala teknis instalasi tools atau ketidaksesuaian alat ukur", mitigasi: "Pelaksanaan kalibrasi instrumen dan pre-flight testing pada fase persiapan awal." },
                      { risiko: "Keterbatasan waktu supervisi berkala dengan mentor lapangan", mitigasi: "Penerapan sistem pelaporan asinkron melalui logbook mingguan digital terpusat." }
                    ]).map((m, idx) => (
                      <tr key={idx} className="align-top">
                        <td className="py-2 px-3 font-mono font-medium text-zinc-900 dark:text-zinc-200 print:text-black">{idx + 1}</td>
                        <td className="py-2 px-3 font-medium text-zinc-900 dark:text-zinc-100 print:text-black">{m.risiko}</td>
                        <td className="py-2 px-3">{m.mitigasi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif pt-2">
                5.4 Rencana Keberlanjutan Proyek (Sustainability Plan)
              </h3>
              <p className="indent-6">
                {currentDoc.bab5?.sustainabilityPlan || `Seluruh artefak hasil pelaksanaan, meliputi dokumentasi teknis, lembar SOP, kode sumber/dataset tervalidasi, serta panduan operasional diserahkan secara resmi melalui Berita Acara Serah Terima kepada unit terkait di ${currentDoc.targetEntity} agar dapat dipelihara dan dikembangkan secara berkelanjutan.`}
              </p>
            </div>
          </section>

          {/* DAFTAR PUSTAKA (Standar APA 7th Edition / IEEE) */}
          {currentDoc.bibliography && currentDoc.bibliography.length > 0 && (
            <section id="section-pustaka" className="mb-10 pt-6 border-t border-zinc-200 dark:border-zinc-850 print:border-black">
              <div className="border-b border-zinc-200 dark:border-zinc-850 pb-2 mb-4 print:border-black flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-serif font-bold text-zinc-900 dark:text-zinc-100 print:text-black uppercase">
                  DAFTAR PUSTAKA ({citationStyle === "apa" ? "STANDAR APA 7TH EDITION" : "STANDAR IEEE"})
                </h2>
                <span className="no-print text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                  {citationStyle === "apa" ? "Format: Nama, Tahun" : "Format: Numerik [N]"}
                </span>
              </div>
              <div className="space-y-3 text-xs text-zinc-700 dark:text-zinc-300 print:text-black font-sans">
                {currentDoc.bibliography.map((bib, bIdx) => (
                  <p key={bib.id} className="pl-6 -indent-6 leading-relaxed">
                    {citationStyle === "ieee" ? (
                      <>
                        <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 mr-1.5">[{bIdx + 1}]</span>
                        <span className="text-zinc-800 dark:text-zinc-200 print:text-black">{bib.author}</span>, "{bib.title}," <em>{bib.source}</em>, {bib.year}.
                      </>
                    ) : (
                      <>
                        <span className="font-medium text-zinc-800 dark:text-zinc-200 print:text-black">{bib.author}</span> ({bib.year}). <em>{bib.title}</em>. {bib.source}
                      </>
                    )}
                    {bib.doiUrl && (
                      <span className="block pl-0 font-mono text-[10px] text-zinc-500 print:text-gray-600 mt-0.5">
                        DOI/URL: {bib.doiUrl}
                      </span>
                    )}
                  </p>
                ))}
              </div>
            </section>
          )}

          {/* Lembar Pengesahan Formal */}
          <div id="section-pengesahan" className="pt-8 mt-10 border-t border-zinc-200 dark:border-zinc-850 print:border-black font-sans text-xs relative">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-serif font-bold text-sm text-zinc-900 dark:text-zinc-100 uppercase tracking-wider print:text-black text-center flex-1">
                {currentDoc.approvalSheet?.title || "LEMBAR PENGESAHAN PROPOSAL"}
              </h3>
              <button
                type="button"
                onClick={() => setIsApprovalModalOpen(true)}
                className="no-print text-[11px] font-mono text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-white dark:bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                title="Kustomisasi tanda tangan dosen pembimbing dan kaprodi"
              >
                <FileSignature className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                <span>Edit Tanda Tangan</span>
              </button>
            </div>
            <p className="text-center text-[11px] text-zinc-500 font-mono mb-8 print:text-gray-600">
              Disahkan di {currentDoc.institution}, Tanggal: {currentDoc.approvalSheet?.approvalDate || currentDoc.generationDate}
            </p>

            <div className="grid grid-cols-2 gap-8 text-center pt-4">
              {currentDoc.approvalSheet?.primarySigners ? (
                currentDoc.approvalSheet.primarySigners.map((signer, sIdx) => (
                  <div key={sIdx}>
                    <p className="text-zinc-600 dark:text-zinc-400 print:text-black mb-16 leading-tight">
                      Menyetujui,<br /><strong className="text-zinc-800 dark:text-zinc-200">{signer.role}</strong>
                    </p>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-200 print:text-black underline underline-offset-4">
                      {signer.name}
                    </p>
                    <p className="text-zinc-500 font-mono print:text-gray-600 mt-0.5">
                      {signer.idNumber}
                    </p>
                  </div>
                ))
              ) : (
                <>
                  <div>
                    <p className="text-zinc-600 dark:text-zinc-400 print:text-black mb-16">Menyetujui,<br /><strong className="text-zinc-800 dark:text-zinc-200">Dosen Pembimbing Akademik</strong></p>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-200 print:text-black">(__________________________________)</p>
                    <p className="text-zinc-500 font-mono print:text-gray-600">NIP.</p>
                  </div>

                  <div>
                    <p className="text-zinc-600 dark:text-zinc-400 print:text-black mb-16">Menyetujui,<br /><strong className="text-zinc-800 dark:text-zinc-200">Pimpinan / Mentor Lapangan {currentDoc.targetEntity}</strong></p>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-200 print:text-black">(__________________________________)</p>
                    <p className="text-zinc-500 font-mono print:text-gray-600">NIP / NIK.</p>
                  </div>
                </>
              )}
            </div>

            {/* Ketua Program Studi Approval */}
            {currentDoc.approvalSheet?.headSigner && (
              <div className="mt-12 text-center">
                <p className="text-zinc-500 dark:text-zinc-400 print:text-black mb-16 leading-tight">
                  Mengetahui,<br /><strong className="text-zinc-800 dark:text-zinc-200">{currentDoc.approvalSheet.headSigner.role}</strong>
                </p>
                <p className="font-semibold text-zinc-900 dark:text-zinc-200 print:text-black underline underline-offset-4">
                  {currentDoc.approvalSheet.headSigner.name}
                </p>
                <p className="text-zinc-500 font-mono print:text-gray-600 mt-0.5">
                  {currentDoc.approvalSheet.headSigner.idNumber}
                </p>
              </div>
            )}
          </div>

          {/* LAMPIRAN-LAMPIRAN AKADEMIK */}
          <section id="section-lampiran" className="mt-12 pt-8 border-t-2 border-zinc-300 dark:border-zinc-800 print:border-black font-sans">
            <div className="border-b border-zinc-200 dark:border-zinc-850 pb-2 mb-6 print:border-black text-center">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400 block mb-1">
                BERKAS PENDUKUNG & INSTRUMEN BAKU
              </span>
              <h2 className="text-base sm:text-lg font-serif font-bold text-zinc-900 dark:text-zinc-100 print:text-black uppercase">
                LAMPIRAN-LAMPIRAN DOKUMEN USULAN
              </h2>
            </div>

            <div className="space-y-6">
              {(currentDoc.appendices || [
                {
                  id: "lampiran_a",
                  title: "Lampiran A: Pedoman Wawancara & Instrumen Pengumpulan Data",
                  content: `Pedoman instrumen ini dirancang untuk mengumpulkan data empiris pada ${currentDoc.targetEntity}. Terdiri dari instrumen kuesioner berskala Likert 1-5, rubrik observasi lapangan terstruktur, dan panduan wawancara mendalam.`,
                  tableRows: [
                    { col1: "Item 01", col2: "Tingkat relevansi masalah operasional dengan kebutuhan riil unit kerja sasaran", col3: "Skala Likert 1-5 & Catatan Kualitatif" },
                    { col1: "Item 02", col2: "Ketersediaan dokumentasi SOP eksisting dan kepatuhan pengguna terhadap prosedur", col3: "Checklist Observasi Langsung" },
                    { col1: "Item 03", col2: "Efektivitas integrasi alat ukur/sistem yang diusulkan terhadap waktu siklus kerja", col3: "Metrik Kinerja & Uji Waktu Kerja" },
                    { col1: "Item 04", col2: "Tingkat kepuasan pengguna akhir (User Acceptance Testing) terhadap luaran fungsional", col3: "Kuesioner UAT (4 Parameter Kunci)" }
                  ]
                },
                {
                  id: "lampiran_b",
                  title: "Lampiran B: Matriks Logbook Mingguan Aktivitas Lapangan & Bukti Capaian",
                  content: "Logbook berkala ini merekam kehadiran, aktivitas harian, bimbingan berkala, dan luaran mingguan selama 16 minggu pelaksanaan kegiatan akademik.",
                  tableRows: [
                    { col1: "Bulan I (Minggu 1-4)", col2: "Orientasi lingkungan kerja, perizinan, WBS, dan penyusunan instrumen spesifikasi", col3: "Logbook Ditandatangani & Dokumen Spesifikasi" },
                    { col1: "Bulan II (Minggu 5-8)", col2: "Pengambilan data primer/lapangan, kalibrasi instrumen, dan pembangunan prototipe awal", col3: "Dataset Terverifikasi & Draf Bab III" },
                    { col1: "Bulan III (Minggu 9-12)", col2: "Implementasi inti, pengujian fungsionalitas, evaluasi bersama mentor, dan perbaikan", col3: "Berita Acara Uji Hasil & Revisi" },
                    { col1: "Bulan IV (Minggu 13-16)", col2: "Penyusunan laporan komprehensif lengkap, manuskrip publikasi, dan seminar pertanggungjawaban", col3: "Naskah Lengkap & Lembar Pengesahan" }
                  ]
                },
                {
                  id: "lampiran_c",
                  title: "Lampiran C: Surat Pernyataan Pakta Integritas & Bebas Fabrikasi Data",
                  content: `Pernyataan tertulis bermeterai dari mahasiswa pengusul (${currentDoc.candidateName}, NIM: ${currentDoc.candidateId}) yang menyatakan bahwa seluruh data, metodologi, dan naskah yang diajukan adalah orisinal, bebas dari unsur fabrikasi, falsifikasi, dan plagiarisme, serta menjunjung tinggi kerahasiaan informasi internal ${currentDoc.targetEntity}.`
                }
              ]).map((app, aIdx) => (
                <div key={app.id || aIdx} className="p-4 sm:p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 print:bg-white print:border-gray-300">
                  <h3 className="text-xs sm:text-sm font-semibold font-serif text-zinc-900 dark:text-zinc-100 mb-2 print:text-black">
                    {app.title}
                  </h3>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 mb-3 leading-relaxed">
                    {app.content}
                  </p>

                  {app.tableRows && app.tableRows.length > 0 && (
                    <div className="overflow-x-auto my-2">
                      <table className="w-full text-left text-xs font-sans border-t-2 border-b-2 border-zinc-300 dark:border-zinc-700 print:border-black">
                        <thead>
                          <tr className="border-b border-zinc-200 dark:border-zinc-850 print:border-black font-semibold text-zinc-900 dark:text-zinc-100 print:text-black">
                            <th className="py-2 px-2.5">Indikator / Periode</th>
                            <th className="py-2 px-2.5">Aktivitas & Parameter</th>
                            <th className="py-2 px-2.5">Metode Verifikasi / Bukti</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 print:divide-gray-300 text-zinc-700 dark:text-zinc-300 print:text-black text-[11px]">
                          {app.tableRows.map((r, rIdx) => (
                            <tr key={rIdx} className="align-top">
                              <td className="py-2 px-2.5 font-mono font-medium text-zinc-900 dark:text-zinc-200 print:text-black">{r.col1}</td>
                              <td className="py-2 px-2.5">{r.col2}</td>
                              <td className="py-2 px-2.5 font-mono text-[10px]">{r.col3}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

        </article>
      )}

      {/* TAB 2: VISUAL TREE GRAPH */}
      {activeTab === "tree" && (
        <div className="w-full">
          <VisualTreeGraph treeData={treeData} />
        </div>
      )}

      {/* TAB: BAGAN ALIR PENELITIAN INTERAKTIF (Dedicated Web View) */}
      {activeTab === "flowchart" && (
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-850 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-850 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Network className="w-5 h-5 text-indigo-500" />
                <span>Bagan Alir Metodologi &amp; Desain Penelitian</span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Visualisasi terstruktur tahapan pelaksanaan (Input, Proses, Validasi, Luaran) yang terhubung dengan Bab III
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("naskah")}
              className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors self-start sm:self-auto cursor-pointer"
            >
              ← Kembali ke Teks Naskah
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-3 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Bagan Alir Tahapan Eksekusi Metodologi:</span>
              </h3>
              <AcademicFlowchartDiagram doc={currentDoc} type="methodology" />
            </div>

            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-850">
              <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-3 flex items-center gap-2">
                <Brain className="w-3.5 h-3.5 text-indigo-500" />
                <span>Kerangka Konseptual &amp; Kausalitas Antar-Variabel:</span>
              </h3>
              <AcademicFlowchartDiagram doc={currentDoc} type="conceptual" />
            </div>
          </div>
        </div>
      )}

      {/* TAB: MATRIKS JADWAL & GANTT CHART */}
      {activeTab === "jadwal" && (
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-850 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-850 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-indigo-500" />
                <span>Matriks Jadwal Pelaksanaan &amp; Timeline Riset</span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Alokasi waktu {currentDoc.durationMonths} Bulan ({currentDoc.durationMonths * 4} Minggu Kerja) dengan target luaran terukur
              </p>
            </div>

            {/* Toggle Gantt vs Detail Cards */}
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-medium self-start sm:self-auto shadow-2xs">
              <button
                type="button"
                onClick={() => setJadwalViewMode("gantt")}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  jadwalViewMode === "gantt"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                Diagram Gantt
              </button>
              <button
                type="button"
                onClick={() => setJadwalViewMode("detail")}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  jadwalViewMode === "detail"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                Kartu Rincian
              </button>
            </div>
          </div>

          {/* VIEW 1: INTERACTIVE GANTT TIMELINE MATRIX */}
          {jadwalViewMode === "gantt" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <thead className="bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="p-3 w-1/4">Tahapan / Kegiatan</th>
                    <th className="p-3 w-1/4">Aktivitas Utama</th>
                    {Array.from({ length: Math.min(6, currentDoc.durationMonths || 6) }).map((_, mIdx) => (
                      <th key={mIdx} className="p-3 text-center border-l border-zinc-200 dark:border-zinc-800 font-mono text-[11px]">
                        Bulan {mIdx + 1}
                      </th>
                    ))}
                    <th className="p-3 text-right">Luaran (Deliverable)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {currentDoc.bab4.jadwalMatriks.map((item, idx) => {
                    const totalMonths = Math.min(6, currentDoc.durationMonths || 6);
                    const activeMonthIdx = idx % totalMonths;

                    return (
                      <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                        <td className="p-3 font-semibold text-zinc-900 dark:text-zinc-100 align-top">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-[10px] font-mono flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                            <span>{item.phase}</span>
                          </div>
                        </td>
                        <td className="p-3 text-zinc-600 dark:text-zinc-400 text-[11px] align-top">
                          {item.activities.join(" • ")}
                        </td>
                        {Array.from({ length: totalMonths }).map((_, mIdx) => {
                          const isCurrent = mIdx === activeMonthIdx;
                          return (
                            <td key={mIdx} className="p-3 text-center border-l border-zinc-200 dark:border-zinc-800 align-middle">
                              {isCurrent ? (
                                <div className="h-6 rounded-md bg-indigo-600 text-white font-mono text-[10px] font-semibold flex items-center justify-center shadow-xs">
                                  Mg {item.week}
                                </div>
                              ) : (
                                <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-850 mx-auto w-8" />
                              )}
                            </td>
                          );
                        })}
                        <td className="p-3 text-right font-mono text-zinc-800 dark:text-zinc-200 text-[11px] font-medium align-top">
                          {item.output}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* VIEW 2: DETAIL CARDS */}
          {jadwalViewMode === "detail" && (
            <div className="space-y-3">
              {currentDoc.bab4.jadwalMatriks.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 flex flex-col items-center justify-center font-mono font-bold flex-shrink-0">
                      <span className="text-[9px] uppercase text-zinc-500">MG</span>
                      <span className="text-xs">{item.week}</span>
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {item.phase}
                      </h3>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                        {item.activities.join(" • ")}
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Target Kompetensi: {item.competencyTarget}
                      </p>
                    </div>
                  </div>

                  <div className="md:text-right flex-shrink-0 text-xs">
                    <span className="text-zinc-500 block text-[11px]">Output:</span>
                    <span className="font-mono text-zinc-800 dark:text-zinc-200 font-medium">{item.output}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SLIDE PRESENTASI 16:9 */}
      {activeTab === "slides" && (
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-850 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Slide Presentasi Ringkasan (16:9)
            </h2>
            
            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-500 dark:text-zinc-400 font-mono">
                Slide {activeSlideIndex + 1} / {currentDoc.slides.length}
              </span>
              <button
                type="button"
                disabled={activeSlideIndex === 0}
                onClick={() => setActiveSlideIndex(prev => prev - 1)}
                className="px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-30 cursor-pointer text-zinc-800 dark:text-zinc-200 text-xs transition-colors"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={activeSlideIndex === currentDoc.slides.length - 1}
                onClick={() => setActiveSlideIndex(prev => prev + 1)}
                className="px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-30 cursor-pointer text-zinc-800 dark:text-zinc-200 text-xs transition-colors"
              >
                Next
              </button>
            </div>
          </div>

          {/* Active 16:9 Screen */}
          {currentDoc.slides[activeSlideIndex] && (
            <div className="w-full aspect-[16/9] max-h-[480px] rounded-xl bg-zinc-900 text-white border border-zinc-800 p-6 sm:p-10 flex flex-col justify-between relative shadow-xl overflow-hidden">
              <div>
                <span className="text-xs font-mono uppercase text-zinc-400 tracking-wider">
                  {currentDoc.slides[activeSlideIndex].kicker}
                </span>
                <h3 className="text-lg sm:text-2xl font-bold text-white mt-2 leading-tight">
                  {currentDoc.slides[activeSlideIndex].title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 mt-1">
                  {currentDoc.slides[activeSlideIndex].subtitle}
                </p>

                <div className="mt-6 space-y-2.5">
                  {currentDoc.slides[activeSlideIndex].keyPoints.map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-200">
                      <span className="w-4 h-4 rounded-full bg-zinc-800 text-zinc-200 font-mono text-[10px] flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                        {pIdx + 1}
                      </span>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                <span>{currentDoc.institution} &bull; {currentDoc.candidateName}</span>
                <span>Slide {activeSlideIndex + 1} / {currentDoc.slides.length}</span>
              </div>
            </div>
          )}

          {/* Speaker Notes */}
          <div className="mt-4 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium block mb-1">
              Catatan Presenter:
            </span>
            <p className="text-xs text-zinc-700 dark:text-zinc-300 italic leading-relaxed">
              "{currentDoc.slides[activeSlideIndex]?.speakerNotes}"
            </p>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT KUALITAS */}
      {activeTab === "audit" && (
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-850 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Hasil Audit Kepatuhan Dokumen
            </h2>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Lolos Verifikasi 100%
            </span>
          </div>

          <div className="space-y-3">
            {currentDoc.auditLog.map((log, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {log.rule}
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                      {log.details}
                    </p>
                    <span className="text-[11px] text-zinc-500 mt-1 inline-block font-mono">
                      Pilar: {log.thinkingMode}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: SIMULASI SIDANG */}
      {activeTab === "defense" && (
        <DefenseSimulator doc={currentDoc} />
      )}

      {/* TAB 7: MATRIKS REVISI DOSEN */}
      {activeTab === "revisionMatrix" && (
        <RevisionMatrixManager doc={currentDoc} />
      )}

      {/* MODAL: AUDIT TURNITIN & ANTI-SLOP */}
      <TurnitinPreCheckModal
        isOpen={isTurnitinModalOpen}
        onClose={() => setIsTurnitinModalOpen(false)}
        doc={currentDoc}
      />

      {/* MODAL: PENCARIAN LITERATUR SEMANTIC SCHOLAR */}
      <LiteratureSearchModal
        isOpen={isLitModalOpen}
        onClose={() => setIsLitModalOpen(false)}
        initialQuery={currentDoc.title}
        onAddPaperToProposal={(paper) => {
          setCurrentDoc(prev => ({
            ...prev,
            bab2: {
              ...prev.bab2,
              landasanTeori: [
                ...prev.bab2.landasanTeori,
                {
                  topic: `Kajian Terindeks: ${paper.title}`,
                  elaboration: paper.abstract || "Kajian primer mengenai metodologi komparatif dan kerangka kerja empiris.",
                  citation: `${paper.authors?.map(a => a.name).join(", ") || "Peneliti"} (${paper.year || 2024}). ${paper.venue || "Publikasi Ilmiah"}. DOI: ${paper.doi || "Tersedia"}`
                }
              ]
            }
          }));
          setToastMessage(`Paper "${paper.title.slice(0, 40)}..." berhasil ditambahkan ke Bab 2!`);
          setTimeout(() => setToastMessage(null), 4000);
        }}
      />

      {/* MODAL: GENERATOR INSTRUMEN RISET & KUESIONER */}
      <ResearchInstrumentModal
        isOpen={isInstrumentModalOpen}
        onClose={() => setIsInstrumentModalOpen(false)}
        doc={currentDoc}
      />

      {/* MODAL: KUSTOMISASI LEMBAR PENGESAHAN */}
      <ApprovalSheetModal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        doc={currentDoc}
        onSave={(info) => {
          setCurrentDoc(prev => {
            const updated = { ...prev, approvalSheet: info };
            pushToHistory(updated);
            return updated;
          });
          setToastMessage("Lembar pengesahan resmi berhasil diperbarui!");
          setTimeout(() => setToastMessage(null), 3000);
        }}
      />

      {/* MODAL: FORMAT KAMPUS & AI GUIDELINE SCANNER */}
      <CampusGuidelineModal
        isOpen={isGuidelineModalOpen}
        onClose={() => setIsGuidelineModalOpen(false)}
        currentGuideline={currentDoc.campusGuideline}
        onApplyGuideline={(guideline) => {
          setCurrentDoc(prev => {
            const updated = { 
              ...prev, 
              campusGuideline: guideline,
              institution: guideline.campusName.split("(")[0].trim() || prev.institution
            };
            pushToHistory(updated);
            return updated;
          });
          if (guideline.citationStyle) {
            setCitationStyle(guideline.citationStyle === "ieee" ? "ieee" : "apa");
          }
          setToastMessage(`Format resmi ${guideline.campusName} berhasil diterapkan ke Naskah & Dokumen Word!`);
          setTimeout(() => setToastMessage(null), 3500);
        }}
      />

      {/* CO-PILOT AI INTERACTIVE SLIDE-OVER DRAWER */}
      <AcademicCopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        doc={currentDoc}
      />

      {/* FLOATING ACADEMIC AI REVISION MODAL DIALOG */}
      {refineSectionTitle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Revisi AI Akademik: <span className="font-normal text-zinc-600 dark:text-zinc-400">{refineSectionTitle}</span>
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-mono">
                    Didukung Google Gemini 3.5 & SOP 12 Metode Berpikir
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeRefineModal}
                className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[70vh]">
              {refineError && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>{refineError}</span>
                </div>
              )}

              {/* Revision Instructions */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Pilih Arahan Cepat atau Masukkan Instruksi Khusus:
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {[
                    "Perdalam analisis teoritis & rujukan primer",
                    "Perjelas metodologi kuantitatif & indikator",
                    "Tingkatkan formalitas bahasa akademik baku",
                    "Pertegas urgensi rumusan & kesenjangan masalah",
                    "Ringkas & padatkan narasi agar lebih tajam"
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRefineInstruction(chip)}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <textarea
                    rows={2}
                    value={refineInstruction}
                    onChange={(e) => setRefineInstruction(e.target.value)}
                    placeholder="Contoh: Perluas uraian dengan menambahkan variabel perancu dan dasar teori dari Gibson (2019)..."
                    className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-500 font-sans leading-relaxed resize-none"
                  />
                  <button
                    type="button"
                    disabled={isRefining || !refineInstruction.trim()}
                    onClick={submitAiRefinement}
                    className="absolute right-2.5 bottom-2.5 px-3 py-1 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black font-semibold text-xs hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    {isRefining ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>{isRefining ? "Merumuskan AI..." : "Jalankan Revisi AI"}</span>
                  </button>
                </div>
              </div>

              {/* AI Generated Preview (if available) */}
              {revisedPreview ? (
                <div className="space-y-2 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
                      Hasil Rumusan Revisi AI:
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">Siap Diterapkan</span>
                  </div>
                  <textarea
                    rows={6}
                    value={revisedPreview}
                    onChange={(e) => setRevisedPreview(e.target.value)}
                    className="w-full p-3 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none font-sans leading-relaxed resize-y"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setRevisedPreview(null)}
                      className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 text-xs transition-colors cursor-pointer"
                    >
                      Batal Hasil Ini
                    </button>
                    <button
                      type="button"
                      onClick={() => applyRefinedContent(revisedPreview)}
                      className="px-4 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black font-semibold text-xs hover:opacity-90 transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Terapkan ke Naskah Proposal</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Editable Original Text Area */
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Teks Naskah Saat Ini (Bisa Disunting Manual Langsung):
                    </label>
                    <span className="text-[10px] text-zinc-500 font-mono">Sunting Bebas</span>
                  </div>
                  <textarea
                    rows={5}
                    value={refineContent}
                    onChange={(e) => setRefineContent(e.target.value)}
                    className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none font-sans leading-relaxed resize-y"
                  />
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => applyRefinedContent(refineContent)}
                      className="px-3.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Simpan Perubahan Manual Langsung
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 px-5 border-t border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-900/40 flex items-center justify-between text-xs text-zinc-500">
              <span>Klik luar atau tombol X untuk membatalkan</span>
              <button
                type="button"
                onClick={closeRefineModal}
                className="px-3 py-1 rounded-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: KLINIK KONSULTASI BIMBINGAN (AI MENTOR) */}
      <AcademicConsultationModal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        initialCategory={currentDoc.category}
        initialTargetEntity={currentDoc.targetEntity}
        onApplyProposal={(appliedTitle, appliedEntity, appliedCategory) => {
          setCurrentDoc(prev => {
            const updated = {
              ...prev,
              title: appliedTitle,
              targetEntity: appliedEntity || prev.targetEntity,
              category: appliedCategory || prev.category
            };
            pushToHistory(updated);
            return updated;
          });
          setToastMessage(`Judul berhasil diperbarui ke: "${appliedTitle}"`);
          setTimeout(() => setToastMessage(null), 3000);
        }}
      />

    </div>
  );
};
