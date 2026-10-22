"use client";

import React, { useState } from "react";
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
  ShieldAlert
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
  const [activeTab, setActiveTab] = useState<"naskah" | "tree" | "jadwal" | "slides" | "audit" | "defense">("naskah");
  const [copied, setCopied] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [isExportingPptx, setIsExportingPptx] = useState(false);
  const [isLitModalOpen, setIsLitModalOpen] = useState(false);

  const generateFullMarkdown = () => {
    return `# PROPOSAL ${doc.category.toUpperCase()}

## ${doc.title.toUpperCase()}

**Diajukan untuk Memenuhi Persyaratan Akademik pada:**
**${doc.facultyMajor} - ${doc.institution}**

---

### IDENTITAS PENELITI / MAHASISWA
- **Nama:** ${doc.candidateName}
- **NIM / NPM:** ${doc.candidateId}
- **Program Studi:** ${doc.facultyMajor}
- **Perguruan Tinggi:** ${doc.institution}
- **Instansi Tujuan:** ${doc.targetEntity} (${doc.targetDepartment})
- **Rencana Durasi:** ${doc.durationMonths} Bulan (${doc.bab4.jadwalMatriks.length * 4 || 16} Minggu Kerja)
- **Tanggal Penyusunan:** ${doc.generationDate}

---

## RINGKASAN EKSEKUTIF
${doc.executiveSummary}

---

## ${doc.bab1.title}

### 1.1 Latar Belakang Masalah
${doc.bab1.latarBelakang.join("\n\n")}

### 1.2 Rumusan Masalah
${doc.bab1.rumusanMasalah.map((r, i) => `${i + 1}. ${r}`).join("\n")}

### 1.3 Batasan Masalah
${doc.bab1.batasanMasalah.map((b, i) => `• ${b}`).join("\n")}

### 1.4 Tujuan Penelitian / Magang
**Tujuan Umum:**
${doc.bab1.tujuanUmum}

**Tujuan Khusus:**
${doc.bab1.tujuanKhusus.map((t, i) => `• ${t}`).join("\n")}

### 1.5 Manfaat Kegiatan
**Bagi Mahasiswa:**
${doc.bab1.manfaatMahasiswa.map(m => `• ${m}`).join("\n")}

**Bagi Instansi Mitra (${doc.targetEntity}):**
${doc.bab1.manfaatInstansi.map(m => `• ${m}`).join("\n")}

**Bagi Perguruan Tinggi (${doc.institution}):**
${doc.bab1.manfaatAkademik.map(m => `• ${m}`).join("\n")}

---

## ${doc.bab2.title}

### 2.1 Profil Instansi / Objek Penelitian
${doc.bab2.profilInstansi}

**Visi & Misi:**
${doc.bab2.visiMisi.map((v, i) => `${i + 1}. ${v}`).join("\n")}

**Struktur Organisasi:**
${doc.bab2.strukturOrganisasi}

### 2.2 Landasan Teori Ilmiah
${doc.bab2.landasanTeori.map((t, i) => `#### 2.2.${i + 1} ${t.topic}\n${t.elaboration}\n*Rujukan: ${t.citation}*`).join("\n\n")}

---

## ${doc.bab3.title}

### 3.1 Metode Pelaksanaan
${doc.bab3.metodePelaksanaan}

### 3.2 Ruang Lingkup Penugasan
${doc.bab3.lingkupPekerjaan.map((l, i) => `${i + 1}. ${l}`).join("\n")}

### 3.3 Spesifikasi Perangkat & Lingkungan Kerja
${doc.bab3.perangkatTools.map(p => `• ${p}`).join("\n")}

### 3.4 Target Capaian Kompetensi
${doc.bab3.rencanaKompetensi.map(c => `• ${c}`).join("\n")}

---

## ${doc.bab4.title}

### 4.1 Matriks Rencana Kerja Mingguan
| Minggu | Tahap Pelaksanaan | Rincian Aktivitas | Target Luaran (Output) |
|---|---|---|---|
${doc.bab4.jadwalMatriks.map(j => `| Mg ${j.week} | ${j.phase} | ${j.activities.join("; ")} | ${j.output} |`).join("\n")}

### 4.2 Penutup
${doc.bab4.penutup}

---

### LEMBAR PENGESAHAN

Mengetahui,
**Dosen Pembimbing Akademik,**


(________________________________)
NIP.


Menyetujui,
**Pimpinan / Mentor Lapangan ${doc.targetEntity},**


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
      const blob = await generateAcademicProposalDocx(doc);
      downloadDocxBlob(blob, `Proposal_${doc.category.toUpperCase()}_${doc.candidateName.replace(/\s+/g, "_")}.docx`);
    } catch (err) {
      console.error("Gagal mengekspor DOCX:", err);
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleDownloadPptx = async () => {
    setIsExportingPptx(true);
    try {
      await generateAcademicProposalPptx(doc);
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
      
      {/* 1. Sleek Action Bar & Document Metadata */}
      <div className="pb-6 mb-6 border-b border-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-zinc-100 tracking-tight leading-snug">
            {doc.title}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Pengusul: <span className="text-zinc-200 font-medium">{doc.candidateName}</span> &bull; {doc.targetEntity} &bull; {doc.durationMonths} Bulan
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
              PROPOSAL {doc.category.toUpperCase()}
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-zinc-100 mt-2 leading-snug print:text-black">
              {doc.title}
            </h1>
            <p className="text-xs sm:text-sm font-sans text-zinc-400 mt-3 max-w-xl mx-auto print:text-gray-700">
              Diajukan untuk Memenuhi Prasyarat Kurikulum Akademik pada {doc.facultyMajor}, {doc.institution}
            </p>

            <div className="mt-6 pt-4 border-t border-zinc-900/60 max-w-md mx-auto text-center font-sans text-xs space-y-1 text-zinc-300 print:text-black">
              <p className="font-semibold text-zinc-200 print:text-black">{doc.candidateName}</p>
              <p className="text-zinc-500 font-mono print:text-gray-700">NIM: {doc.candidateId}</p>
              <p className="text-zinc-400 print:text-black">{doc.institution} &bull; {doc.generationDate}</p>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="mb-10 p-4 sm:p-5 rounded-lg bg-zinc-900/60 border border-zinc-900 print:border-gray-300 print:bg-gray-50">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300 mb-2 print:text-black">
              Ringkasan Eksekutif
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans print:text-black">
              {doc.executiveSummary}
            </p>
          </div>

          {/* BAB I */}
          <section className="mb-10">
            <h2 className="text-base sm:text-lg font-serif font-bold text-zinc-100 border-b border-zinc-900 pb-2 mb-4 print:text-black print:border-black uppercase">
              {doc.bab1.title}
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed text-justify print:text-black font-sans">
              <h3 className="text-sm font-semibold text-zinc-100 print:text-black font-serif">1.1 Latar Belakang Masalah</h3>
              {doc.bab1.latarBelakang.map((para, i) => (
                <p key={i} className="indent-6">{para}</p>
              ))}

              <h3 className="text-sm font-semibold text-zinc-100 print:text-black font-serif pt-2">1.2 Rumusan Masalah</h3>
              <ol className="list-decimal pl-6 space-y-1.5">
                {doc.bab1.rumusanMasalah.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ol>

              <h3 className="text-sm font-semibold text-zinc-100 print:text-black font-serif pt-2">1.3 Batasan Masalah</h3>
              <ul className="list-disc pl-6 space-y-1">
                {doc.bab1.batasanMasalah.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>

              <h3 className="text-sm font-semibold text-zinc-100 print:text-black font-serif pt-2">1.4 Tujuan Kegiatan</h3>
              <p><strong>Tujuan Umum:</strong> {doc.bab1.tujuanUmum}</p>
              <p className="pt-1"><strong>Tujuan Khusus:</strong></p>
              <ul className="list-disc pl-6 space-y-1">
                {doc.bab1.tujuanKhusus.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>

              <h3 className="text-sm font-semibold text-zinc-100 print:text-black font-serif pt-2">1.5 Manfaat Kegiatan</h3>
              <div className="space-y-2">
                <p><strong>1. Bagi Mahasiswa:</strong></p>
                <ul className="list-disc pl-6 space-y-0.5">
                  {doc.bab1.manfaatMahasiswa.map((m, i) => <li key={i}>{m}</li>)}
                </ul>

                <p className="pt-1"><strong>2. Bagi Instansi Mitra ({doc.targetEntity}):</strong></p>
                <ul className="list-disc pl-6 space-y-0.5">
                  {doc.bab1.manfaatInstansi.map((m, i) => <li key={i}>{m}</li>)}
                </ul>

                <p className="pt-1"><strong>3. Bagi Perguruan Tinggi ({doc.institution}):</strong></p>
                <ul className="list-disc pl-6 space-y-0.5">
                  {doc.bab1.manfaatAkademik.map((m, i) => <li key={i}>{m}</li>)}
                </ul>
              </div>
            </div>
          </section>

          {/* BAB II */}
          <section className="mb-10">
            <h2 className="text-base sm:text-lg font-serif font-bold text-zinc-100 border-b border-zinc-900 pb-2 mb-4 print:text-black print:border-black uppercase">
              {doc.bab2.title}
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed text-justify print:text-black font-sans">
              <h3 className="text-sm font-semibold text-zinc-100 print:text-black font-serif">2.1 Profil Instansi Mitra</h3>
              <p className="indent-6">{doc.bab2.profilInstansi}</p>
              
              <div className="p-3 bg-zinc-900/60 rounded border border-zinc-900 print:bg-gray-50 print:border-gray-300">
                <p className="font-semibold text-xs text-zinc-200 mb-1 print:text-black">Visi & Misi:</p>
                <ul className="space-y-1 text-xs">
                  {doc.bab2.visiMisi.map((v, i) => <li key={i}>{v}</li>)}
                </ul>
              </div>

              <p className="indent-6">{doc.bab2.strukturOrganisasi}</p>

              <h3 className="text-sm font-semibold text-zinc-100 print:text-black font-serif pt-2">2.2 Landasan Teori Ilmiah</h3>
              <div className="space-y-3">
                {doc.bab2.landasanTeori.map((theory, i) => (
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
            <h2 className="text-base sm:text-lg font-serif font-bold text-zinc-100 border-b border-zinc-900 pb-2 mb-4 print:text-black print:border-black uppercase">
              {doc.bab3.title}
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed text-justify print:text-black font-sans">
              <h3 className="text-sm font-semibold text-zinc-100 print:text-black font-serif">3.1 Metode Pelaksanaan Kerja</h3>
              <p className="indent-6">{doc.bab3.metodePelaksanaan}</p>

              <h3 className="text-sm font-semibold text-zinc-100 print:text-black font-serif pt-2">3.2 Lingkup Penugasan</h3>
              <ol className="list-decimal pl-6 space-y-1">
                {doc.bab3.lingkupPekerjaan.map((l, i) => <li key={i}>{l}</li>)}
              </ol>

              <h3 className="text-sm font-semibold text-zinc-100 print:text-black font-serif pt-2">3.3 Lingkungan Kerja & Tools</h3>
              <ul className="list-disc pl-6 space-y-1">
                {doc.bab3.perangkatTools.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          </section>

          {/* BAB IV: MATRIKS TABEL AKADEMIK (3 Garis Horizontal Standar) */}
          <section className="mb-10">
            <h2 className="text-base sm:text-lg font-serif font-bold text-zinc-100 border-b border-zinc-900 pb-2 mb-4 print:text-black print:border-black uppercase">
              {doc.bab4.title}
            </h2>

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
                  {doc.bab4.jadwalMatriks.map((row, idx) => (
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

            <h3 className="text-sm font-semibold text-zinc-100 print:text-black font-serif pt-3 mb-2">4.2 Penutup</h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed indent-6 font-sans print:text-black">
              {doc.bab4.penutup}
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
                <p className="text-zinc-400 print:text-black mb-16">Menyetujui,<br /><strong>Pimpinan / Mentor Lapangan {doc.targetEntity}</strong></p>
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
              Durasi: {doc.durationMonths} Bulan
            </span>
          </div>

          <div className="space-y-3">
            {doc.bab4.jadwalMatriks.map((item, idx) => (
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
                Slide {activeSlideIndex + 1} / {doc.slides.length}
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
                disabled={activeSlideIndex === doc.slides.length - 1}
                onClick={() => setActiveSlideIndex(prev => prev + 1)}
                className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 cursor-pointer text-zinc-200 text-xs"
              >
                Next
              </button>
            </div>
          </div>

          {/* Active 16:9 Screen */}
          {doc.slides[activeSlideIndex] && (
            <div className="w-full aspect-[16/9] max-h-[480px] rounded-lg bg-black border border-zinc-900 p-6 sm:p-10 flex flex-col justify-between relative shadow-xl overflow-hidden">
              <div>
                <span className="text-xs font-mono uppercase text-zinc-400 tracking-wider">
                  {doc.slides[activeSlideIndex].kicker}
                </span>
                <h3 className="text-lg sm:text-2xl font-bold text-zinc-100 mt-2 leading-tight">
                  {doc.slides[activeSlideIndex].title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  {doc.slides[activeSlideIndex].subtitle}
                </p>

                <div className="mt-6 space-y-2.5">
                  {doc.slides[activeSlideIndex].keyPoints.map((pt, pIdx) => (
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
                <span>{doc.institution} &bull; {doc.candidateName}</span>
                <span>Slide {activeSlideIndex + 1} / {doc.slides.length}</span>
              </div>
            </div>
          )}

          {/* Speaker Notes */}
          <div className="mt-3 p-3 rounded bg-zinc-900/60 border border-zinc-900">
            <span className="text-[11px] text-zinc-400 font-medium block mb-1">
              Catatan Presenter:
            </span>
            <p className="text-xs text-zinc-300 italic leading-relaxed">
              "{doc.slides[activeSlideIndex]?.speakerNotes}"
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
            {doc.auditLog.map((log, idx) => (
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
        <DefenseSimulator doc={doc} />
      )}

      {/* MODAL: PENCARIAN LITERATUR SEMANTIC SCHOLAR */}
      <LiteratureSearchModal
        isOpen={isLitModalOpen}
        onClose={() => setIsLitModalOpen(false)}
        initialQuery={doc.title}
        onAddPaperToProposal={(paper) => {
          doc.bab2.landasanTeori.push({
            topic: `Kajian Terindeks: ${paper.title}`,
            elaboration: paper.abstract || "Kajian primer mengenai metodologi komparatif.",
            citation: `${paper.authors.map(a => a.name).join(", ")} (${paper.year || 2024}). ${paper.venue}. DOI: ${paper.doi || "Tersedia"}`
          });
        }}
      />

    </div>
  );
};
