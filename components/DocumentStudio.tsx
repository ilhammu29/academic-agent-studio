"use client";

import React, { useState, useEffect, useRef } from "react";
import { ProposalDocument, TreeNode } from "@/types/studio";
import { VisualTreeGraph } from "./VisualTreeGraph";
import DefenseSimulator from "./DefenseSimulator";
import LiteratureSearchModal from "./LiteratureSearchModal";
import { RevisionMatrixManager } from "./RevisionMatrixManager";
import { TurnitinPreCheckModal } from "./TurnitinPreCheckModal";
import { generateAcademicProposalDocx, downloadDocxBlob } from "@/lib/docxExporter";
import { generateAcademicProposalPptx } from "@/lib/pptxExporter";
import { generateBibTeX, generateRIS, downloadCitationFile } from "@/lib/bibtexExporter";
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
  X,
  FileCheck2,
  RotateCcw,
  RotateCw,
  BookMarked,
  CheckCircle2
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
  const [activeTab, setActiveTab] = useState<"naskah" | "tree" | "jadwal" | "slides" | "audit" | "defense" | "revisionMatrix">("naskah");
  const [copied, setCopied] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [isExportingPptx, setIsExportingPptx] = useState(false);
  const [isLitModalOpen, setIsLitModalOpen] = useState(false);
  const [isTurnitinModalOpen, setIsTurnitinModalOpen] = useState(false);
  
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

      {/* 1. Sleek Action Bar & Document Metadata */}
      <div className="pb-6 mb-6 border-b border-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-lg sm:text-xl font-semibold text-zinc-100 tracking-tight leading-snug">
              {currentDoc.title}
            </h1>
            {lastSaved && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Auto-saved {lastSaved}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400">
            Pengusul: <span className="text-zinc-200 font-medium">{currentDoc.candidateName}</span> &bull; {currentDoc.targetEntity} &bull; {currentDoc.durationMonths} Bulan
          </p>
        </div>

        {/* Action Buttons: Undo/Redo, DOCX, PPTX, BibTeX, Turnitin, Literature, MD, Print */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Undo & Redo History */}
          <div className="flex items-center border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1.5 hover:bg-zinc-800 disabled:opacity-30 text-zinc-300 transition-colors cursor-pointer"
              title="Undo perubahan naskah"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <div className="w-[1px] h-4 bg-zinc-800"></div>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 hover:bg-zinc-800 disabled:opacity-30 text-zinc-300 transition-colors cursor-pointer"
              title="Redo perubahan naskah"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Word DOCX Button */}
          <button
            type="button"
            onClick={handleDownloadDocx}
            disabled={isExportingDocx}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-black text-xs font-semibold transition-all cursor-pointer shadow-sm"
            title="Unduh dokumen Microsoft Word (.docx) berstandar penomoran halaman kampus"
          >
            {isExportingDocx ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Menyusun Word...</span>
              </>
            ) : (
              <>
                <FileDown className="w-3.5 h-3.5" />
                <span>Unduh Word (.docx)</span>
              </>
            )}
          </button>

          {/* PowerPoint PPTX Button */}
          <button
            type="button"
            onClick={handleDownloadPptx}
            disabled={isExportingPptx}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-medium transition-all cursor-pointer"
            title="Unduh slide presentasi 16:9 (.pptx) eksekutif"
          >
            {isExportingPptx ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Menyusun PPTX...</span>
              </>
            ) : (
              <>
                <Presentation className="w-3.5 h-3.5" />
                <span>Unduh Slide (.pptx)</span>
              </>
            )}
          </button>

          {/* Audit Turnitin Pre-Check */}
          <button
            type="button"
            onClick={() => setIsTurnitinModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-medium transition-all cursor-pointer"
            title="Audit Turnitin, frasa klise AI, dan orisinalitas naskah"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-300" />
            <span>Audit Turnitin</span>
          </button>

          {/* Export BibTeX Button */}
          <button
            type="button"
            onClick={handleExportBibTeX}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium transition-all cursor-pointer"
            title="Unduh berkas BibTeX (.bib) untuk Mendeley & Zotero"
          >
            <BookMarked className="w-3.5 h-3.5 text-zinc-400" />
            <span>BibTeX</span>
          </button>

          {/* Literature Search Trigger */}
          <button
            type="button"
            onClick={() => setIsLitModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium transition-all cursor-pointer"
            title="Pencarian paper terindeks & matriks PRISMA"
          >
            <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
            <span>Literatur Jurnal</span>
          </button>

          {/* Copy Markdown */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-zinc-100" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
            <span>{copied ? "Tersalin" : "Markdown"}</span>
          </button>

          {/* Print PDF */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-xs transition-all cursor-pointer"
            title="Cetak format cetak PDF"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Sleek Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-zinc-900 pb-2 mb-6 overflow-x-auto no-print">
        <button
          type="button"
          onClick={() => setActiveTab("naskah")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === "naskah"
              ? "bg-zinc-100 text-black font-semibold"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Naskah Proposal</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("defense")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === "defense"
              ? "bg-zinc-100 text-black font-semibold"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Tanya Jawab Sidang</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tree")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === "tree"
              ? "bg-zinc-100 text-black font-semibold"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>Struktur Pohon Graf</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("jadwal")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === "jadwal"
              ? "bg-zinc-100 text-black font-semibold"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span>Matriks Jadwal</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("slides")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === "slides"
              ? "bg-zinc-100 text-black font-semibold"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <Presentation className="w-3.5 h-3.5" />
          <span>Slide Sidang (16:9)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("revisionMatrix")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === "revisionMatrix"
              ? "bg-zinc-100 text-black font-semibold"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Matriks Revisi Dosen</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("audit")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === "audit"
              ? "bg-zinc-100 text-black font-semibold"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Audit Kualitas</span>
        </button>
      </div>

      {/* TAB 1: NASKAH PROPOSAL LENGKAP */}
      {activeTab === "naskah" && (
        <article className="bg-zinc-950 p-6 sm:p-12 rounded-xl border border-zinc-900 font-serif print:bg-white print:text-black print:p-0 print:border-none">
          
          {/* Cover Header */}
          <div className="text-center pb-8 border-b border-zinc-900 print:border-black mb-8">
            <div className="text-xs font-mono uppercase tracking-widest text-zinc-400 print:text-gray-700">
              PROPOSAL {currentDoc.category.toUpperCase()}
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-zinc-100 mt-2 leading-snug print:text-black">
              {currentDoc.title}
            </h1>
            <p className="text-xs sm:text-sm font-sans text-zinc-400 mt-3 max-w-xl mx-auto print:text-gray-700">
              Diajukan untuk Memenuhi Prasyarat Kurikulum Akademik pada {currentDoc.facultyMajor}, {currentDoc.institution}
            </p>

            <div className="mt-6 pt-4 border-t border-zinc-900/60 max-w-md mx-auto text-center font-sans text-xs space-y-1 text-zinc-300 print:text-black">
              <p className="font-semibold text-zinc-200 print:text-black">{currentDoc.candidateName}</p>
              <p className="text-zinc-500 font-mono print:text-gray-700">NIM: {currentDoc.candidateId}</p>
              <p className="text-zinc-400 print:text-black">{currentDoc.institution} &bull; {currentDoc.generationDate}</p>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="mb-10 p-4 sm:p-5 rounded-lg bg-zinc-900/60 border border-zinc-900 print:border-gray-300 print:bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300 print:text-black">
                Ringkasan Eksekutif
              </h3>
              <button
                type="button"
                onClick={() => handleRefineWithAI("executiveSummary", "Ringkasan Eksekutif", currentDoc.executiveSummary)}
                className="no-print text-[11px] font-mono text-zinc-400 hover:text-zinc-100 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Sparkles className="w-3 h-3 text-zinc-400" />
                <span>Revisi AI</span>
              </button>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans print:text-black">
              {currentDoc.executiveSummary}
            </p>
          </div>

          {/* BAB I */}
          <section className="mb-10">
            <div className="border-b border-zinc-900 pb-2 mb-4 print:border-black">
              <h2 className="text-base sm:text-lg font-serif font-bold text-zinc-100 print:text-black uppercase">
                {currentDoc.bab1.title}
              </h2>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed text-justify print:text-black font-sans">
              <div className="flex items-center justify-between pt-1">
                <h3 className="text-sm font-semibold text-zinc-100 print:text-black font-serif">1.1 Latar Belakang Masalah</h3>
                <button
                  type="button"
                  onClick={() => handleRefineWithAI("bab1.latarBelakang", "1.1 Latar Belakang Masalah", currentDoc.bab1.latarBelakang.join("\n\n"))}
                  className="no-print text-[11px] font-mono text-zinc-400 hover:text-zinc-100 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-zinc-400" />
                  <span>Revisi AI</span>
                </button>
              </div>
              {currentDoc.bab1.latarBelakang.map((para, i) => (
                <p key={i} className="indent-6">{para}</p>
              ))}

              <div className="flex items-center justify-between pt-2">
                <h3 className="text-sm font-semibold text-zinc-100 print:text-black font-serif">1.2 Rumusan Masalah</h3>
                <button
                  type="button"
                  onClick={() => handleRefineWithAI("bab1.rumusanMasalah", "1.2 Rumusan Masalah", currentDoc.bab1.rumusanMasalah.join("\n"))}
                  className="no-print text-[11px] font-mono text-zinc-400 hover:text-zinc-100 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-zinc-400" />
                  <span>Revisi AI</span>
                </button>
              </div>
              <ol className="list-decimal pl-6 space-y-1.5">
                {currentDoc.bab1.rumusanMasalah.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ol>

              <h3 className="text-sm font-semibold text-zinc-100 print:text-black font-serif pt-2">1.3 Batasan Masalah</h3>
              <ul className="list-disc pl-6 space-y-1">
                {currentDoc.bab1.batasanMasalah.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>

              <h3 className="text-sm font-semibold text-zinc-100 print:text-black font-serif pt-2">1.4 Tujuan Kegiatan</h3>
              <p><strong>Tujuan Umum:</strong> {currentDoc.bab1.tujuanUmum}</p>
              <p className="pt-1"><strong>Tujuan Khusus:</strong></p>
              <ul className="list-disc pl-6 space-y-1">
                {currentDoc.bab1.tujuanKhusus.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>

              <h3 className="text-sm font-semibold text-zinc-100 print:text-black font-serif pt-2">1.5 Manfaat Kegiatan</h3>
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
          <section className="mb-10">
            <div className="border-b border-zinc-900 pb-2 mb-4 print:border-black">
              <h2 className="text-base sm:text-lg font-serif font-bold text-zinc-100 print:text-black uppercase">
                {currentDoc.bab2.title}
              </h2>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed text-justify print:text-black font-sans">
              {currentDoc.category === "magang" ? (
                /* Format Khusus Magang: Profil Perusahaan, Visi Misi, Struktur Organisasi */
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-100 print:text-black font-serif">2.1 Profil Instansi Mitra</h3>
                    <button
                      type="button"
                      onClick={() => handleRefineWithAI("bab2.profilInstansi", "2.1 Profil Instansi Mitra", currentDoc.bab2.profilInstansi)}
                      className="no-print text-[11px] font-mono text-zinc-400 hover:text-zinc-100 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Sparkles className="w-3 h-3 text-zinc-400" />
                      <span>Revisi AI</span>
                    </button>
                  </div>
                  <p className="indent-6">{currentDoc.bab2.profilInstansi}</p>
                  
                  <div className="p-3 bg-zinc-900/60 rounded border border-zinc-900 print:bg-gray-50 print:border-gray-300">
                    <p className="font-semibold text-xs text-zinc-200 mb-1 print:text-black">Visi & Misi:</p>
                    <ul className="space-y-1 text-xs">
                      {currentDoc.bab2.visiMisi.map((v, i) => <li key={i}>{v}</li>)}
                    </ul>
                  </div>

                  <p className="indent-6">{currentDoc.bab2.strukturOrganisasi}</p>

                  <h3 className="text-sm font-semibold text-zinc-100 print:text-black font-serif pt-2">2.2 Landasan Teori Terapan & Standar Industri</h3>
                  <div className="space-y-3">
                    {currentDoc.bab2.landasanTeori.map((theory, i) => (
                      <div key={i} className="p-3 rounded bg-zinc-900/40 border border-zinc-900 print:border-gray-200">
                        <h4 className="text-xs font-semibold text-zinc-100 print:text-black mb-1">{theory.topic}</h4>
                        <p className="text-xs text-zinc-300 print:text-black">{theory.elaboration}</p>
                        <p className="text-[11px] text-zinc-500 font-mono mt-1 print:text-gray-600">Rujukan: {theory.citation}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                /* Format Khusus Skripsi/Penelitian: Tinjauan Pustaka, Matriks Keaslian 7 Kolom, Kerangka Konsep, Hipotesis */
                <>
                  <h3 className="text-sm font-semibold text-zinc-100 print:text-black font-serif">2.1 Tinjauan Teoretis Variabel Penelitian</h3>
                  <div className="space-y-3">
                    {currentDoc.bab2.landasanTeori.map((theory, i) => (
                      <div key={i} className="p-3 rounded bg-zinc-900/40 border border-zinc-900 print:border-gray-200">
                        <h4 className="text-xs font-semibold text-zinc-100 print:text-black mb-1">{theory.topic}</h4>
                        <p className="text-xs text-zinc-300 print:text-black">{theory.elaboration}</p>
                        <p className="text-[11px] text-zinc-500 font-mono mt-1 print:text-gray-600">Rujukan Otoritatif: {theory.citation}</p>
                      </div>
                    ))}
                  </div>

                  {/* Matriks Keaslian Penelitian (SOP 7-Kolom PRISMA 2020) */}
                  {currentDoc.bab2.researchGapMatrix && currentDoc.bab2.researchGapMatrix.length > 0 && (
                    <div className="pt-2">
                      <h3 className="text-sm font-semibold text-zinc-100 print:text-black font-serif mb-2">
                        2.2 Matriks Keaslian Penelitian (Research Gap & State-of-the-Art)
                      </h3>
                      <div className="overflow-x-auto my-3">
                        <table className="w-full text-left text-xs font-sans border-t-2 border-b-2 border-zinc-200 print:border-black">
                          <thead>
                            <tr className="border-b border-zinc-800 print:border-black font-semibold text-zinc-100 print:text-black">
                              <th className="py-2 px-2.5">No</th>
                              <th className="py-2 px-2.5">Penulis & Tahun</th>
                              <th className="py-2 px-2.5">Judul & Jurnal</th>
                              <th className="py-2 px-2.5">Desain & Sampel</th>
                              <th className="py-2 px-2.5">Variabel & Instrumen</th>
                              <th className="py-2 px-2.5">Temuan Utama</th>
                              <th className="py-2 px-2.5">Celah & Perbedaan Studi Ini</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-900 print:divide-gray-300 text-zinc-300 print:text-black text-[11px]">
                            {currentDoc.bab2.researchGapMatrix.map((item, idx) => (
                              <tr key={idx} className="align-top">
                                <td className="py-2 px-2.5 font-mono font-medium">{item.no}</td>
                                <td className="py-2 px-2.5 font-medium text-zinc-200 print:text-black whitespace-nowrap">{item.authorYear}</td>
                                <td className="py-2 px-2.5 italic">{item.titleJournal}</td>
                                <td className="py-2 px-2.5">{item.designSample}</td>
                                <td className="py-2 px-2.5">{item.variables}</td>
                                <td className="py-2 px-2.5">{item.findingsEffect}</td>
                                <td className="py-2 px-2.5 font-medium text-zinc-200 print:text-black bg-zinc-900/30 print:bg-gray-50">{item.gapDifference}</td>
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
                      <h3 className="text-sm font-semibold text-zinc-100 print:text-black font-serif mb-1">
                        2.3 Kerangka Konsep Penelitian
                      </h3>
                      <p className="indent-6">{currentDoc.bab2.conceptualFramework}</p>
                    </div>
                  )}

                  {currentDoc.bab2.hypotheses && currentDoc.bab2.hypotheses.length > 0 && (
                    <div className="pt-2">
                      <h3 className="text-sm font-semibold text-zinc-100 print:text-black font-serif mb-1">
                        2.4 Hipotesis Penelitian
                      </h3>
                      <ul className="list-disc pl-6 space-y-1 text-xs">
                        {currentDoc.bab2.hypotheses.map((h, i) => <li key={i}>{h}</li>)}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          {/* BAB III */}
          <section className="mb-10">
            <div className="border-b border-zinc-900 pb-2 mb-4 print:border-black">
              <h2 className="text-base sm:text-lg font-serif font-bold text-zinc-100 print:text-black uppercase">
                {currentDoc.bab3.title}
              </h2>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed text-justify print:text-black font-sans">
              {currentDoc.category === "magang" ? (
                /* Format Khusus Magang: Metode Kerja, WBS, Perangkat, Kompetensi */
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-100 print:text-black font-serif">3.1 Metode Pelaksanaan Kerja</h3>
                    <button
                      type="button"
                      onClick={() => handleRefineWithAI("bab3.metodePelaksanaan", "3.1 Metode Pelaksanaan Kerja", currentDoc.bab3.metodePelaksanaan)}
                      className="no-print text-[11px] font-mono text-zinc-400 hover:text-zinc-100 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Sparkles className="w-3 h-3 text-zinc-400" />
                      <span>Revisi AI</span>
                    </button>
                  </div>
                  <p className="indent-6">{currentDoc.bab3.metodePelaksanaan}</p>

                  <h3 className="text-sm font-semibold text-zinc-100 print:text-black font-serif pt-2">3.2 Lingkup Penugasan (Work Breakdown Structure)</h3>
                  <ol className="list-decimal pl-6 space-y-1">
                    {(currentDoc.bab3.wbsScope || currentDoc.bab3.lingkupPekerjaan).map((l, i) => <li key={i}>{l}</li>)}
                  </ol>

                  <h3 className="text-sm font-semibold text-zinc-100 print:text-black font-serif pt-2">3.3 Lingkungan Kerja, Tools, & SOP</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    {currentDoc.bab3.perangkatTools.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>

                  <h3 className="text-sm font-semibold text-zinc-100 print:text-black font-serif pt-2">3.4 Target Capaian Hard & Soft Skills</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    {currentDoc.bab3.rencanaKompetensi.map((k, i) => <li key={i}>{k}</li>)}
                  </ul>
                </>
              ) : (
                /* Format Khusus Skripsi: Desain Riset, Populasi & Sampel, DOV Table, KEPK */
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-100 print:text-black font-serif">3.1 Jenis dan Desain Penelitian</h3>
                    <button
                      type="button"
                      onClick={() => handleRefineWithAI("bab3.metodePelaksanaan", "3.1 Jenis dan Desain Penelitian", currentDoc.bab3.metodePelaksanaan)}
                      className="no-print text-[11px] font-mono text-zinc-400 hover:text-zinc-100 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Sparkles className="w-3 h-3 text-zinc-400" />
                      <span>Revisi AI</span>
                    </button>
                  </div>
                  <p className="indent-6">{currentDoc.bab3.metodePelaksanaan}</p>

                  {/* Populasi & Sampel */}
                  {currentDoc.bab3.populationSample && (
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-100 print:text-black font-serif pt-2">3.2 Populasi, Sampel, & Kriteria Subjek</h3>
                      <p className="indent-6">{currentDoc.bab3.populationSample}</p>
                    </div>
                  )}

                  {/* Tabel Definisi Operasional Variabel (Tabel 3 Garis Terbuka) */}
                  {currentDoc.bab3.operationalDefinitions && currentDoc.bab3.operationalDefinitions.length > 0 && (
                    <div className="pt-2">
                      <h3 className="text-sm font-semibold text-zinc-100 print:text-black font-serif mb-2">
                        3.3 Tabel Definisi Operasional Variabel (DOV)
                      </h3>
                      <div className="overflow-x-auto my-3">
                        <table className="w-full text-left text-xs font-sans border-t-2 border-b-2 border-zinc-200 print:border-black">
                          <thead>
                            <tr className="border-b border-zinc-800 print:border-black font-semibold text-zinc-100 print:text-black">
                              <th className="py-2 px-3">Variabel Penelitian</th>
                              <th className="py-2 px-3">Definisi Operasional</th>
                              <th className="py-2 px-3">Parameter & Alat Ukur</th>
                              <th className="py-2 px-3">Skala Pengukuran</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-900 print:divide-gray-300 text-zinc-300 print:text-black text-[11px]">
                            {currentDoc.bab3.operationalDefinitions.map((dov, idx) => (
                              <tr key={idx} className="align-top">
                                <td className="py-2 px-3 font-medium text-zinc-200 print:text-black whitespace-nowrap">{dov.variable}</td>
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
                  <h3 className="text-sm font-semibold text-zinc-100 print:text-black font-serif pt-2">3.4 Instrumen & Kalibrasi Alat Ukur</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    {currentDoc.bab3.perangkatTools.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>

                  {/* Kelaikan Etik (Ethical Clearance) */}
                  {currentDoc.bab3.ethicalConsiderations && (
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-100 print:text-black font-serif pt-2">3.5 Protokol Etika Penelitian (Ethical Clearance)</h3>
                      <p className="indent-6">{currentDoc.bab3.ethicalConsiderations}</p>
                    </div>
                  )}

                  <h3 className="text-sm font-semibold text-zinc-100 print:text-black font-serif pt-2">3.6 Rencana Analisis Data & Uji Hipotesis</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    {currentDoc.bab3.rencanaKompetensi.map((k, i) => <li key={i}>{k}</li>)}
                  </ul>
                </>
              )}
            </div>
          </section>

          {/* BAB IV: MATRIKS TABEL AKADEMIK (3 Garis Horizontal Standar) */}
          <section className="mb-10">
            <div className="border-b border-zinc-900 pb-2 mb-4 print:border-black">
              <h2 className="text-base sm:text-lg font-serif font-bold text-zinc-100 print:text-black uppercase">
                {currentDoc.bab4.title}
              </h2>
            </div>

            <h3 className="text-sm font-semibold text-zinc-100 print:text-black font-serif mb-3">
              Tabel 4.1 {currentDoc.category === "magang" ? "Matriks Rencana Kerja Mingguan (Logbook)" : "Jadwal Pelaksanaan Penelitian (Gantt Chart)"}
            </h3>

            {/* Academic 3-line Table */}
            <div className="overflow-x-auto my-4">
              <table className="w-full text-left text-xs font-sans border-t-2 border-b-2 border-zinc-200 print:border-black">
                <thead>
                  <tr className="border-b border-zinc-800 print:border-black font-semibold text-zinc-100 print:text-black">
                    <th className="py-2 px-3">Minggu</th>
                    <th className="py-2 px-3">Tahap Pelaksanaan</th>
                    <th className="py-2 px-3">Rincian Aktivitas</th>
                    <th className="py-2 px-3">Target Luaran (Output)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 print:divide-gray-300 text-zinc-300 print:text-black">
                  {currentDoc.bab4.jadwalMatriks.map((row, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-mono font-medium text-zinc-200 print:text-black whitespace-nowrap">
                        Mg {row.week}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-zinc-100 print:text-black">
                        {row.phase}
                      </td>
                      <td className="py-2.5 px-3">
                        <ul className="list-disc pl-4 space-y-0.5">
                          {row.activities.map((act, aIdx) => <li key={aIdx}>{act}</li>)}
                        </ul>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-300 print:text-black">
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
                <h3 className="text-sm font-semibold text-zinc-100 print:text-black font-serif mb-2">
                  Tabel 4.2 Rencana Anggaran Biaya (RAB Penelitian)
                </h3>
                <div className="overflow-x-auto my-2">
                  <table className="w-full text-left text-xs font-sans border-t-2 border-b-2 border-zinc-200 print:border-black">
                    <thead>
                      <tr className="border-b border-zinc-800 print:border-black font-semibold text-zinc-100 print:text-black">
                        <th className="py-2 px-3">Komponen Biaya</th>
                        <th className="py-2 px-3">Kategori</th>
                        <th className="py-2 px-3 text-right">Alokasi Anggaran (Rp)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900 print:divide-gray-300 text-zinc-300 print:text-black text-[11px]">
                      {currentDoc.bab4.budgetPlan.map((b, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3">{b.item}</td>
                          <td className="py-2 px-3 font-medium text-zinc-400">{b.category}</td>
                          <td className="py-2 px-3 text-right font-mono font-medium text-zinc-200 print:text-black">
                            Rp {b.cost.toLocaleString("id-ID")}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-zinc-700 font-bold text-zinc-100 print:text-black">
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
                <h3 className="text-sm font-semibold text-zinc-100 print:text-black font-serif mb-1">
                  4.3 Rencana Diseminasi & Publikasi Jurnal
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 indent-6 font-sans print:text-black">
                  {currentDoc.bab4.disseminationPlan}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 mb-2">
              <h3 className="text-sm font-semibold text-zinc-100 print:text-black font-serif">
                {currentDoc.category === "magang" ? "4.2 Penutup" : "4.4 Penutup"}
              </h3>
              <button
                type="button"
                onClick={() => handleRefineWithAI("bab4.penutup", "Penutup Proposal", currentDoc.bab4.penutup)}
                className="no-print text-[11px] font-mono text-zinc-400 hover:text-zinc-100 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Sparkles className="w-3 h-3 text-zinc-400" />
                <span>Revisi AI</span>
              </button>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed indent-6 font-sans print:text-black">
              {currentDoc.bab4.penutup}
            </p>
          </section>

          {/* DAFTAR PUSTAKA (Standar APA 7th Edition) */}
          {currentDoc.bibliography && currentDoc.bibliography.length > 0 && (
            <section className="mb-10 pt-6 border-t border-zinc-900 print:border-black">
              <div className="border-b border-zinc-900 pb-2 mb-4 print:border-black">
                <h2 className="text-base sm:text-lg font-serif font-bold text-zinc-100 print:text-black uppercase">
                  DAFTAR PUSTAKA
                </h2>
              </div>
              <div className="space-y-3 text-xs text-zinc-300 print:text-black font-sans">
                {currentDoc.bibliography.map((bib) => (
                  <p key={bib.id} className="pl-6 -indent-6 leading-relaxed">
                    <span className="font-medium text-zinc-200 print:text-black">{bib.author}</span> ({bib.year}). <em>{bib.title}</em>. {bib.source}
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
          <div className="pt-8 mt-10 border-t border-zinc-900 print:border-black font-sans text-xs">
            <h3 className="text-center font-serif font-bold text-sm text-zinc-100 uppercase tracking-wider mb-2 print:text-black">
              {currentDoc.approvalSheet?.title || "LEMBAR PENGESAHAN PROPOSAL"}
            </h3>
            <p className="text-center text-[11px] text-zinc-500 font-mono mb-8 print:text-gray-600">
              Disahkan di {currentDoc.institution}, Tanggal: {currentDoc.approvalSheet?.approvalDate || currentDoc.generationDate}
            </p>

            <div className="grid grid-cols-2 gap-8 text-center pt-4">
              {currentDoc.approvalSheet?.primarySigners ? (
                currentDoc.approvalSheet.primarySigners.map((signer, sIdx) => (
                  <div key={sIdx}>
                    <p className="text-zinc-400 print:text-black mb-16 leading-tight">
                      Menyetujui,<br /><strong>{signer.role}</strong>
                    </p>
                    <p className="font-semibold text-zinc-200 print:text-black underline underline-offset-4">
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
                    <p className="text-zinc-400 print:text-black mb-16">Menyetujui,<br /><strong>Dosen Pembimbing Akademik</strong></p>
                    <p className="font-semibold text-zinc-200 print:text-black">(__________________________________)</p>
                    <p className="text-zinc-500 font-mono print:text-gray-600">NIP.</p>
                  </div>

                  <div>
                    <p className="text-zinc-400 print:text-black mb-16">Menyetujui,<br /><strong>Pimpinan / Mentor Lapangan {currentDoc.targetEntity}</strong></p>
                    <p className="font-semibold text-zinc-200 print:text-black">(__________________________________)</p>
                    <p className="text-zinc-500 font-mono print:text-gray-600">NIP / NIK.</p>
                  </div>
                </>
              )}
            </div>

            {/* Ketua Program Studi Approval */}
            {currentDoc.approvalSheet?.headSigner && (
              <div className="mt-12 text-center">
                <p className="text-zinc-400 print:text-black mb-16 leading-tight">
                  Mengetahui,<br /><strong>{currentDoc.approvalSheet.headSigner.role}</strong>
                </p>
                <p className="font-semibold text-zinc-200 print:text-black underline underline-offset-4">
                  {currentDoc.approvalSheet.headSigner.name}
                </p>
                <p className="text-zinc-500 font-mono print:text-gray-600 mt-0.5">
                  {currentDoc.approvalSheet.headSigner.idNumber}
                </p>
              </div>
            )}
          </div>

        </article>
      )}

      {/* TAB 2: VISUAL TREE GRAPH */}
      {activeTab === "tree" && (
        <div className="w-full">
          <VisualTreeGraph treeData={treeData} />
        </div>
      )}

      {/* TAB 3: MATRIKS JADWAL */}
      {activeTab === "jadwal" && (
        <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-900">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-zinc-100">
              Rencana Jadwal Mingguan Terintegrasi
            </h2>
            <span className="text-xs font-mono text-zinc-400">
              Durasi: {currentDoc.durationMonths} Bulan
            </span>
          </div>

          <div className="space-y-3">
            {currentDoc.bab4.jadwalMatriks.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg border border-zinc-900 bg-zinc-900/30 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded bg-zinc-900 text-zinc-200 flex flex-col items-center justify-center font-mono font-bold flex-shrink-0">
                    <span className="text-[9px] uppercase text-zinc-500">MG</span>
                    <span className="text-xs">{item.week}</span>
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-zinc-100">
                      {item.phase}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {item.activities.join(" • ")}
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Target Kompetensi: {item.competencyTarget}
                    </p>
                  </div>
                </div>

                <div className="md:text-right flex-shrink-0 text-xs">
                  <span className="text-zinc-500 block text-[11px]">Output:</span>
                  <span className="font-mono text-zinc-200">{item.output}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SLIDE PRESENTASI 16:9 */}
      {activeTab === "slides" && (
        <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-900">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-zinc-100">
              Slide Presentasi Ringkasan (16:9)
            </h2>
            
            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-400 font-mono">
                Slide {activeSlideIndex + 1} / {currentDoc.slides.length}
              </span>
              <button
                type="button"
                disabled={activeSlideIndex === 0}
                onClick={() => setActiveSlideIndex(prev => prev - 1)}
                className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 cursor-pointer text-zinc-200 text-xs"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={activeSlideIndex === currentDoc.slides.length - 1}
                onClick={() => setActiveSlideIndex(prev => prev + 1)}
                className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 cursor-pointer text-zinc-200 text-xs"
              >
                Next
              </button>
            </div>
          </div>

          {/* Active 16:9 Screen */}
          {currentDoc.slides[activeSlideIndex] && (
            <div className="w-full aspect-[16/9] max-h-[480px] rounded-lg bg-black border border-zinc-900 p-6 sm:p-10 flex flex-col justify-between relative shadow-xl overflow-hidden">
              <div>
                <span className="text-xs font-mono uppercase text-zinc-400 tracking-wider">
                  {currentDoc.slides[activeSlideIndex].kicker}
                </span>
                <h3 className="text-lg sm:text-2xl font-bold text-zinc-100 mt-2 leading-tight">
                  {currentDoc.slides[activeSlideIndex].title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  {currentDoc.slides[activeSlideIndex].subtitle}
                </p>

                <div className="mt-6 space-y-2.5">
                  {currentDoc.slides[activeSlideIndex].keyPoints.map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300">
                      <span className="w-4 h-4 rounded-full bg-zinc-900 text-zinc-300 font-mono text-[10px] flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                        {pIdx + 1}
                      </span>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                <span>{currentDoc.institution} &bull; {currentDoc.candidateName}</span>
                <span>Slide {activeSlideIndex + 1} / {currentDoc.slides.length}</span>
              </div>
            </div>
          )}

          {/* Speaker Notes */}
          <div className="mt-3 p-3 rounded bg-zinc-900/60 border border-zinc-900">
            <span className="text-[11px] text-zinc-400 font-medium block mb-1">
              Catatan Presenter:
            </span>
            <p className="text-xs text-zinc-300 italic leading-relaxed">
              "{currentDoc.slides[activeSlideIndex]?.speakerNotes}"
            </p>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT KUALITAS */}
      {activeTab === "audit" && (
        <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-900">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-zinc-100">
              Hasil Audit Kepatuhan Dokumen
            </h2>
            <span className="text-xs text-zinc-300">
              Lolos Verifikasi 100%
            </span>
          </div>

          <div className="space-y-3">
            {currentDoc.auditLog.map((log, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg border border-zinc-900 bg-zinc-900/30 flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-zinc-200 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-zinc-100">
                      {log.rule}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {log.details}
                    </p>
                    <span className="text-[11px] text-zinc-500 mt-1 inline-block">
                      Pilar: {log.thinkingMode}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-mono text-zinc-300 flex-shrink-0">
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
            <div className="p-3.5 px-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 flex items-center justify-between text-xs text-zinc-500">
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

    </div>
  );
};
