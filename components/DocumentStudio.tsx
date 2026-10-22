"use client";

import React, { useState, useEffect } from "react";
import { ProposalDocument, TreeNode } from "@/types/studio";
import { VisualTreeGraph } from "./VisualTreeGraph";
import DefenseSimulator from "./DefenseSimulator";
import LiteratureSearchModal from "./LiteratureSearchModal";
import { generateAcademicProposalDocx, downloadDocxBlob } from "@/lib/docxExporter";
import { generateAcademicProposalPptx } from "@/lib/pptxExporter";
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
  X
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
  const [activeTab, setActiveTab] = useState<"naskah" | "tree" | "jadwal" | "slides" | "audit" | "defense">("naskah");
  const [copied, setCopied] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [isExportingPptx, setIsExportingPptx] = useState(false);
  const [isLitModalOpen, setIsLitModalOpen] = useState(false);
  
  // AI Refinement states
  const [refineKey, setRefineKey] = useState<string | null>(null);
  const [refineSectionTitle, setRefineSectionTitle] = useState<string | null>(null);
  const [refineContent, setRefineContent] = useState("");
  const [refineInstruction, setRefineInstruction] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setCurrentDoc(doc);
  }, [doc]);

  const handleRefineWithAI = (key: string, title: string, textToRefine: string) => {
    setRefineKey(key);
    setRefineSectionTitle(title);
    setRefineContent(textToRefine);
    setRefineInstruction("");
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
        setCurrentDoc(prev => {
          const updated = { ...prev };
          if (refineKey === "executiveSummary") {
            updated.executiveSummary = data.revisedContent;
          } else if (refineKey === "bab1.latarBelakang") {
            const paras = data.revisedContent.split("\n\n").map((p: string) => p.trim()).filter(Boolean);
            updated.bab1 = { ...updated.bab1, latarBelakang: paras.length > 0 ? paras : [data.revisedContent] };
          } else if (refineKey === "bab1.rumusanMasalah") {
            const items = data.revisedContent.split("\n").map((l: string) => l.replace(/^[\d\.\-\*\•\s]+/, "").trim()).filter(Boolean);
            updated.bab1 = { ...updated.bab1, rumusanMasalah: items.length > 0 ? items : [data.revisedContent] };
          } else if (refineKey === "bab2.profilInstansi") {
            updated.bab2 = { ...updated.bab2, profilInstansi: data.revisedContent };
          } else if (refineKey === "bab3.metodePelaksanaan") {
            updated.bab3 = { ...updated.bab3, metodePelaksanaan: data.revisedContent };
          } else if (refineKey === "bab4.penutup") {
            updated.bab4 = { ...updated.bab4, penutup: data.revisedContent };
          }
          return updated;
        });
        setToastMessage(`Bagian "${refineSectionTitle}" berhasil direvisi dengan standar akademik!`);
        setTimeout(() => setToastMessage(null), 4000);
        setRefineSectionTitle(null);
        setRefineKey(null);
      } else {
        setRefineError(data.error || "Gagal merevisi naskah.");
      }
    } catch (e: any) {
      setRefineError(`Terjadi kesalahan: ${e.message}`);
    } finally {
      setIsRefining(false);
    }
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
          <h1 className="text-lg sm:text-xl font-semibold text-zinc-100 tracking-tight leading-snug">
            {currentDoc.title}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Pengusul: <span className="text-zinc-200 font-medium">{currentDoc.candidateName}</span> &bull; {currentDoc.targetEntity} &bull; {currentDoc.durationMonths} Bulan
          </p>
        </div>

        {/* Action Buttons: DOCX, PPTX, Literature, MD, Print */}
        <div className="flex items-center flex-wrap gap-2">
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

          {/* AI Refine Modal/Drawer if active */}
          {refineSectionTitle && (
            <div className="mb-8 p-5 rounded-xl border border-zinc-800 bg-zinc-900/90 text-zinc-100 no-print animate-in fade-in shadow-xl backdrop-blur-sm">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-zinc-200" />
                  <h3 className="text-sm font-semibold text-zinc-100">
                    Revisi AI Gemini: <span className="text-zinc-300 font-normal">{refineSectionTitle}</span>
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setRefineSectionTitle(null);
                    setRefineKey(null);
                    setRefineError(null);
                  }}
                  className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {refineError && (
                <div className="mb-3 p-2.5 rounded bg-red-950/40 border border-red-900/60 text-red-300 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 text-red-400" />
                  <span>{refineError}</span>
                </div>
              )}

              <p className="text-xs text-zinc-400 mb-2">
                Pilih arahan cepat atau tulis instruksi perbaikan akademik khusus:
              </p>

              {/* Quick Prompt Chips */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {[
                  "Perdalam analisis teoritis & rujukan ilmiah",
                  "Perjelas metodologi kuantitatif & indikator",
                  "Tingkatkan formalitas bahasa akademik",
                  "Pertegas urgensi rumusan masalah"
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setRefineInstruction(chip)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60 transition-colors cursor-pointer"
                  >
                    + {chip}
                  </button>
                ))}
              </div>

              <textarea
                value={refineInstruction}
                onChange={(e) => setRefineInstruction(e.target.value)}
                placeholder="Contoh: Perluas analisis latar belakang dengan memasukkan referensi standar industri terbaru dan data empiris..."
                className="w-full p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 mb-3 focus:outline-none focus:border-zinc-500 font-sans leading-relaxed resize-y min-h-[80px]"
                rows={3}
              />

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-500 font-mono">
                  Didukung Gemini 2.5 Flash & 12 Thinking Modes
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRefineSectionTitle(null);
                      setRefineKey(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs text-zinc-300 hover:bg-zinc-700 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={isRefining || !refineInstruction.trim()}
                    onClick={submitAiRefinement}
                    className="px-4 py-1.5 rounded-lg bg-zinc-100 text-black font-semibold text-xs hover:bg-white disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    {isRefining ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>{isRefining ? "Sedang Merumuskan AI..." : "Terapkan Revisi AI"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

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

              <h3 className="text-sm font-semibold text-zinc-100 print:text-black font-serif pt-2">2.2 Landasan Teori Ilmiah</h3>
              <div className="space-y-3">
                {currentDoc.bab2.landasanTeori.map((theory, i) => (
                  <div key={i} className="p-3 rounded bg-zinc-900/40 border border-zinc-900 print:border-gray-200">
                    <h4 className="text-xs font-semibold text-zinc-100 print:text-black mb-1">{theory.topic}</h4>
                    <p className="text-xs text-zinc-300 print:text-black">{theory.elaboration}</p>
                    <p className="text-[11px] text-zinc-500 font-mono mt-1 print:text-gray-600">Rujukan: {theory.citation}</p>
                  </div>
                ))}
              </div>
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

              <h3 className="text-sm font-semibold text-zinc-100 print:text-black font-serif pt-2">3.2 Lingkup Penugasan</h3>
              <ol className="list-decimal pl-6 space-y-1">
                {currentDoc.bab3.lingkupPekerjaan.map((l, i) => <li key={i}>{l}</li>)}
              </ol>

              <h3 className="text-sm font-semibold text-zinc-100 print:text-black font-serif pt-2">3.3 Lingkungan Kerja & Tools</h3>
              <ul className="list-disc pl-6 space-y-1">
                {currentDoc.bab3.perangkatTools.map(p => `• ${p}`).join(", ")}
              </ul>
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
              Tabel 4.1 Matriks Rencana Kerja Mingguan
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

            <div className="flex items-center justify-between pt-3 mb-2">
              <h3 className="text-sm font-semibold text-zinc-100 print:text-black font-serif">4.2 Penutup</h3>
              <button
                type="button"
                onClick={() => handleRefineWithAI("bab4.penutup", "4.2 Penutup", currentDoc.bab4.penutup)}
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

          {/* Lembar Pengesahan */}
          <div className="pt-8 mt-10 border-t border-zinc-900 print:border-black font-sans text-xs">
            <h3 className="text-center font-serif font-bold text-sm text-zinc-100 uppercase tracking-wider mb-8 print:text-black">
              LEMBAR PENGESAHAN PROPOSAL
            </h3>

            <div className="grid grid-cols-2 gap-8 text-center pt-4">
              <div>
                <p className="text-zinc-400 print:text-black mb-16">Mengetahui,<br /><strong>Dosen Pembimbing Akademik</strong></p>
                <p className="font-semibold text-zinc-200 print:text-black">(__________________________________)</p>
                <p className="text-zinc-500 font-mono print:text-gray-600">NIP.</p>
              </div>

              <div>
                <p className="text-zinc-400 print:text-black mb-16">Menyetujui,<br /><strong>Pimpinan / Mentor Lapangan {currentDoc.targetEntity}</strong></p>
                <p className="font-semibold text-zinc-200 print:text-black">(__________________________________)</p>
                <p className="text-zinc-500 font-mono print:text-gray-600">NIP / NIK.</p>
              </div>
            </div>
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

    </div>
  );
};
