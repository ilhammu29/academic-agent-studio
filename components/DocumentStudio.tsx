"use client";

import React, { useState } from "react";
import { ProposalDocument, TreeNode } from "@/types/studio";
import { VisualTreeGraph } from "./VisualTreeGraph";
import { 
  FileText, 
  Network, 
  CalendarDays, 
  Presentation, 
  ShieldCheck, 
  Copy, 
  Download, 
  Printer, 
  Check, 
  Sparkles,
  Building2,
  User,
  GraduationCap,
  Clock,
  Layers,
  ChevronRight,
  ExternalLink
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
  const [activeTab, setActiveTab] = useState<"naskah" | "tree" | "jadwal" | "slides" | "audit">("naskah");
  const [copied, setCopied] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

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

### 2.1 Profil & Gambaran Umum Organisasi
${doc.bab2.profilInstansi}

**Visi dan Misi:**
${doc.bab2.visiMisi.join("\n")}

**Struktur Organisasi & Supervisi:**
${doc.bab2.strukturOrganisasi}

### 2.2 Landasan Teori & Referensi Ilmiah
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

  const handleDownload = () => {
    const text = generateFullMarkdown();
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `PROPOSAL_${doc.category.toUpperCase()}_${doc.candidateName.replace(/\s+/g, "_")}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      
      {/* Top Action & Meta Bar */}
      <div className="p-4 md:p-6 rounded-2xl bg-matte-surface border border-matte-border mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl no-print">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-champagne px-2 py-0.5 rounded border border-champagne/30 bg-champagne/10">
              Dokumen Terverifikasi &bull; Siap Ekspor
            </span>
            <span className="text-xs font-mono text-milk-muted">
              ID: {doc.id}
            </span>
          </div>
          <h1 className="text-lg md:text-xl font-serif font-bold text-milk-white">
            {doc.title}
          </h1>
          <p className="text-xs text-milk-muted font-sans mt-0.5">
            Pengusul: <strong className="text-milk-soft">{doc.candidateName}</strong> ({doc.candidateId}) &bull; {doc.targetEntity} ({doc.targetDepartment})
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-matte-surface2 hover:bg-matte-border border border-matte-borderLight text-xs font-mono text-milk-soft hover:text-milk-white transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-champagne" />}
            <span>{copied ? "Tersalin!" : "Salin Markdown"}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-matte-surface2 hover:bg-matte-border border border-matte-borderLight text-xs font-mono text-milk-soft hover:text-milk-white transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-champagne" />
            <span>Unduh .md</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-champagne hover:bg-champagne-light text-matte-bg text-xs font-mono font-bold transition-all shadow-md shadow-champagne/10 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak / Simpan PDF</span>
          </button>

          <button
            onClick={onReset}
            className="px-3 py-2 rounded-xl text-xs font-mono text-milk-muted hover:text-milk-white transition-colors ml-2"
          >
            + Buat Baru
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-matte-border pb-3 mb-6 overflow-x-auto no-print">
        <button
          onClick={() => setActiveTab("naskah")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "naskah"
              ? "bg-champagne text-matte-bg shadow-md shadow-champagne/15"
              : "bg-matte-surface border border-matte-border text-milk-muted hover:text-milk-soft"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Naskah Proposal Utuh</span>
        </button>

        <button
          onClick={() => setActiveTab("tree")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "tree"
              ? "bg-champagne text-matte-bg shadow-md shadow-champagne/15"
              : "bg-matte-surface border border-matte-border text-milk-muted hover:text-milk-soft"
          }`}
        >
          <Network className="w-4 h-4" />
          <span>Visual Tree Graph</span>
        </button>

        <button
          onClick={() => setActiveTab("jadwal")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "jadwal"
              ? "bg-champagne text-matte-bg shadow-md shadow-champagne/15"
              : "bg-matte-surface border border-matte-border text-milk-muted hover:text-milk-soft"
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Matriks Jadwal Mingguan</span>
        </button>

        <button
          onClick={() => setActiveTab("slides")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "slides"
              ? "bg-champagne text-matte-bg shadow-md shadow-champagne/15"
              : "bg-matte-surface border border-matte-border text-milk-muted hover:text-milk-soft"
          }`}
        >
          <Presentation className="w-4 h-4" />
          <span>Slide Seminar Eksekutif</span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "audit"
              ? "bg-champagne text-matte-bg shadow-md shadow-champagne/15"
              : "bg-matte-surface border border-matte-border text-milk-muted hover:text-milk-soft"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Audit Log & 12 Berpikir</span>
        </button>
      </div>

      {/* TAB 1: NASKAH PROPOSAL UTUH */}
      {activeTab === "naskah" && (
        <div className="bg-matte-surface p-8 md:p-14 rounded-2xl border border-matte-border shadow-2xl max-w-4xl mx-auto font-serif print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">
          
          {/* Cover Header */}
          <div className="text-center pb-8 border-b border-matte-border/80 print:border-black mb-8">
            <span className="text-xs font-mono font-bold text-champagne uppercase tracking-widest print:text-gray-700">
              PROPOSAL {doc.category.toUpperCase()}
            </span>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-milk-white mt-2 leading-snug print:text-black">
              {doc.title}
            </h1>
            <p className="text-sm font-sans text-milk-muted mt-3 max-w-2xl mx-auto print:text-gray-700">
              Diajukan untuk Memenuhi Prasyarat Kurikulum Akademik pada {doc.facultyMajor}, {doc.institution}
            </p>

            <div className="mt-8 pt-6 border-t border-matte-border/50 max-w-md mx-auto text-center font-sans text-xs space-y-1 text-milk-soft print:text-black">
              <p className="font-bold text-sm text-milk-white print:text-black">{doc.candidateName}</p>
              <p className="font-mono text-milk-muted print:text-gray-700">NIM: {doc.candidateId}</p>
              <p className="text-champagne font-medium print:text-black">{doc.institution} &bull; {doc.generationDate}</p>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="mb-10 p-5 rounded-xl bg-matte-bg border border-matte-border print:border-gray-300 print:bg-gray-50">
            <h3 className="text-xs font-mono font-bold text-champagne uppercase tracking-wider mb-2 print:text-black">
              Ringkasan Eksekutif
            </h3>
            <p className="text-sm text-milk-soft leading-relaxed print:text-black font-sans">
              {doc.executiveSummary}
            </p>
          </div>

          {/* BAB I */}
          <section className="mb-12">
            <h2 className="text-lg font-serif font-bold text-milk-white border-b border-matte-border pb-2 mb-4 print:text-black print:border-black uppercase">
              {doc.bab1.title}
            </h2>

            <div className="space-y-4 text-sm text-milk-soft leading-relaxed text-justify print:text-black font-sans">
              <h3 className="text-sm font-bold text-milk-white print:text-black font-serif">1.1 Latar Belakang Masalah</h3>
              {doc.bab1.latarBelakang.map((para, i) => (
                <p key={i} className="indent-8">{para}</p>
              ))}

              <h3 className="text-sm font-bold text-milk-white print:text-black font-serif pt-3">1.2 Rumusan Masalah</h3>
              <ol className="list-decimal pl-6 space-y-1.5">
                {doc.bab1.rumusanMasalah.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ol>

              <h3 className="text-sm font-bold text-milk-white print:text-black font-serif pt-3">1.3 Batasan Masalah</h3>
              <ul className="list-disc pl-6 space-y-1">
                {doc.bab1.batasanMasalah.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>

              <h3 className="text-sm font-bold text-milk-white print:text-black font-serif pt-3">1.4 Tujuan Kegiatan</h3>
              <p><strong>Tujuan Umum:</strong> {doc.bab1.tujuanUmum}</p>
              <p className="pt-1"><strong>Tujuan Khusus:</strong></p>
              <ul className="list-disc pl-6 space-y-1">
                {doc.bab1.tujuanKhusus.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>

              <h3 className="text-sm font-bold text-milk-white print:text-black font-serif pt-3">1.5 Manfaat Kegiatan</h3>
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
          <section className="mb-12">
            <h2 className="text-lg font-serif font-bold text-milk-white border-b border-matte-border pb-2 mb-4 print:text-black print:border-black uppercase">
              {doc.bab2.title}
            </h2>

            <div className="space-y-4 text-sm text-milk-soft leading-relaxed text-justify print:text-black font-sans">
              <h3 className="text-sm font-bold text-milk-white print:text-black font-serif">2.1 Profil Instansi Mitra</h3>
              <p className="indent-8">{doc.bab2.profilInstansi}</p>
              
              <div className="p-3 bg-matte-bg rounded-lg border border-matte-border print:bg-gray-50 print:border-gray-300">
                <p className="font-bold text-xs text-champagne mb-1 print:text-black">Visi & Misi:</p>
                <ul className="space-y-1 text-xs">
                  {doc.bab2.visiMisi.map((v, i) => <li key={i}>{v}</li>)}
                </ul>
              </div>

              <p className="indent-8">{doc.bab2.strukturOrganisasi}</p>

              <h3 className="text-sm font-bold text-milk-white print:text-black font-serif pt-3">2.2 Landasan Teori Ilmiah</h3>
              <div className="space-y-3">
                {doc.bab2.landasanTeori.map((theory, i) => (
                  <div key={i} className="p-3.5 rounded-lg bg-matte-bg/60 border border-matte-border print:border-gray-200">
                    <h4 className="text-xs font-bold text-milk-white print:text-black mb-1">{theory.topic}</h4>
                    <p className="text-xs text-milk-soft print:text-black">{theory.elaboration}</p>
                    <p className="text-[11px] font-mono text-champagne mt-1.5 print:text-gray-600">Rujukan: {theory.citation}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* BAB III */}
          <section className="mb-12">
            <h2 className="text-lg font-serif font-bold text-milk-white border-b border-matte-border pb-2 mb-4 print:text-black print:border-black uppercase">
              {doc.bab3.title}
            </h2>

            <div className="space-y-4 text-sm text-milk-soft leading-relaxed text-justify print:text-black font-sans">
              <h3 className="text-sm font-bold text-milk-white print:text-black font-serif">3.1 Metode Pelaksanaan Kerja</h3>
              <p className="indent-8">{doc.bab3.metodePelaksanaan}</p>

              <h3 className="text-sm font-bold text-milk-white print:text-black font-serif pt-3">3.2 Lingkup Penugasan</h3>
              <ol className="list-decimal pl-6 space-y-1">
                {doc.bab3.lingkupPekerjaan.map((l, i) => <li key={i}>{l}</li>)}
              </ol>

              <h3 className="text-sm font-bold text-milk-white print:text-black font-serif pt-3">3.3 Lingkungan Kerja & Tools</h3>
              <ul className="list-disc pl-6 space-y-1">
                {doc.bab3.perangkatTools.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          </section>

          {/* BAB IV: MATRIKS TABEL AKADEMIK (3 Garis Horizontal) */}
          <section className="mb-12">
            <h2 className="text-lg font-serif font-bold text-milk-white border-b border-matte-border pb-2 mb-4 print:text-black print:border-black uppercase">
              {doc.bab4.title}
            </h2>

            <h3 className="text-sm font-bold text-milk-white print:text-black font-serif mb-3">
              Tabel 4.1 Matriks Rencana Kerja Mingguan
            </h3>

            {/* Academic 3-line Table */}
            <div className="overflow-x-auto my-4">
              <table className="w-full text-left text-xs font-sans border-t-2 border-b-2 border-milk-white print:border-black">
                <thead>
                  <tr className="border-b border-milk-white/40 print:border-black font-bold text-milk-white print:text-black bg-matte-surface2/50 print:bg-transparent">
                    <th className="py-2.5 px-3">Minggu</th>
                    <th className="py-2.5 px-3">Tahap Pelaksanaan</th>
                    <th className="py-2.5 px-3">Rincian Aktivitas Lapangan</th>
                    <th className="py-2.5 px-3">Target Luaran (Output)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-matte-border/40 print:divide-gray-300 text-milk-soft print:text-black">
                  {doc.bab4.jadwalMatriks.map((row, idx) => (
                    <tr key={idx} className="hover:bg-matte-bg/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-champagne print:text-black whitespace-nowrap">
                        Mg {row.week}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-milk-white print:text-black">
                        {row.phase}
                      </td>
                      <td className="py-2.5 px-3">
                        <ul className="list-disc pl-4 space-y-0.5">
                          {row.activities.map((act, aIdx) => <li key={aIdx}>{act}</li>)}
                        </ul>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-emerald-400 print:text-black">
                        {row.output}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-[10px] text-milk-muted font-mono mt-2 italic print:text-gray-600">
                *Tabel disusun mengikuti 10 Standar Tata Letak & Tabel Presisi (3 garis horizontal, tanpa garis vertikal, batas area cetak ≤ 14.0 cm).
              </p>
            </div>

            <h3 className="text-sm font-bold text-milk-white print:text-black font-serif pt-4 mb-2">4.2 Penutup</h3>
            <p className="text-sm text-milk-soft leading-relaxed indent-8 font-sans print:text-black">
              {doc.bab4.penutup}
            </p>
          </section>

          {/* Lembar Pengesahan */}
          <div className="pt-8 mt-12 border-t border-matte-border/80 print:border-black font-sans text-xs">
            <h3 className="text-center font-serif font-bold text-sm text-milk-white uppercase tracking-wider mb-8 print:text-black">
              LEMBAR PENGESAHAN PROPOSAL
            </h3>

            <div className="grid grid-cols-2 gap-8 text-center pt-4">
              <div>
                <p className="text-milk-muted print:text-black mb-16">Mengetahui,<br /><strong>Dosen Pembimbing Akademik</strong></p>
                <p className="font-bold text-milk-white print:text-black">(__________________________________)</p>
                <p className="text-milk-dim print:text-gray-600 font-mono">NIP.</p>
              </div>

              <div>
                <p className="text-milk-muted print:text-black mb-16">Menyetujui,<br /><strong>Pimpinan / Mentor Lapangan {doc.targetEntity}</strong></p>
                <p className="font-bold text-milk-white print:text-black">(__________________________________)</p>
                <p className="text-milk-dim print:text-gray-600 font-mono">NIP / NIK.</p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: VISUAL TREE GRAPH */}
      {activeTab === "tree" && (
        <div className="w-full">
          <VisualTreeGraph treeData={treeData} />
        </div>
      )}

      {/* TAB 3: MATRIKS JADWAL MINGGUAN */}
      {activeTab === "jadwal" && (
        <div className="bg-matte-surface p-6 md:p-8 rounded-2xl border border-matte-border shadow-xl">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-[10px] font-mono uppercase text-champagne font-bold tracking-widest">
                Gantt Pipeline Architecture
              </span>
              <h2 className="text-xl font-serif font-bold text-milk-white mt-1">
                Peta Rencana Kerja Mingguan Terintegrasi
              </h2>
            </div>
            <span className="text-xs font-mono text-milk-muted px-3 py-1 rounded bg-matte-bg border border-matte-border">
              Total Durasi: {doc.durationMonths} Bulan
            </span>
          </div>

          <div className="space-y-4">
            {doc.bab4.jadwalMatriks.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-matte-bg border border-matte-border hover:border-matte-borderLight transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-matte-surface2 border border-champagne/30 text-champagne flex flex-col items-center justify-center font-mono font-bold flex-shrink-0">
                    <span className="text-[9px] uppercase">MG</span>
                    <span className="text-sm">{item.week}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-serif font-bold text-milk-white">
                      {item.phase}
                    </h3>
                    <p className="text-xs text-milk-soft mt-1">
                      {item.activities.join(" • ")}
                    </p>
                    <p className="text-[11px] font-mono text-champagne mt-1">
                      Kompetensi Target: {item.competencyTarget}
                    </p>
                  </div>
                </div>

                <div className="md:text-right flex-shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-matte-border">
                  <span className="text-[10px] font-mono uppercase text-milk-muted block">Output Terverifikasi:</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">{item.output}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SLIDE PRESENTASI EKSEKUTIF (Hitam Doff & Putih Susu) */}
      {activeTab === "slides" && (
        <div className="bg-matte-surface p-6 md:p-8 rounded-2xl border border-matte-border shadow-xl">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-[10px] font-mono uppercase text-champagne font-bold tracking-widest">
                Executive Presentation Deck &bull; 16:9 Widescreen
              </span>
              <h2 className="text-xl font-serif font-bold text-milk-white mt-1">
                Slide Ringkasan Seminar Proposal (Hitam Doff & Putih Susu)
              </h2>
            </div>
            
            {/* Slide Navigation Controls */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-milk-muted">
                Slide {activeSlideIndex + 1} dari {doc.slides.length}
              </span>
              <button
                disabled={activeSlideIndex === 0}
                onClick={() => setActiveSlideIndex(prev => prev - 1)}
                className="px-3 py-1.5 rounded-lg bg-matte-bg border border-matte-border text-xs font-mono disabled:opacity-30 cursor-pointer"
              >
                Prev
              </button>
              <button
                disabled={activeSlideIndex === doc.slides.length - 1}
                onClick={() => setActiveSlideIndex(prev => prev + 1)}
                className="px-3 py-1.5 rounded-lg bg-matte-bg border border-matte-border text-xs font-mono disabled:opacity-30 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>

          {/* Active 16:9 Slide Screen */}
          {doc.slides[activeSlideIndex] && (
            <div className="w-full aspect-[16/9] max-h-[520px] rounded-2xl bg-matte-bg border border-matte-borderLight p-8 md:p-12 flex flex-col justify-between relative shadow-2xl overflow-hidden">
              {/* Subtle top rule */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-champagne"></div>

              <div>
                <span className="text-xs font-mono font-bold uppercase text-champagne tracking-widest">
                  {doc.slides[activeSlideIndex].kicker}
                </span>
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-milk-white mt-2 leading-tight">
                  {doc.slides[activeSlideIndex].title}
                </h3>
                <p className="text-xs md:text-sm text-milk-muted font-sans mt-2">
                  {doc.slides[activeSlideIndex].subtitle}
                </p>

                {/* Key Points */}
                <div className="mt-8 space-y-3">
                  {doc.slides[activeSlideIndex].keyPoints.map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-3 p-3 rounded-xl bg-matte-surface/70 border border-matte-border">
                      <span className="w-5 h-5 rounded bg-matte-surface2 text-champagne font-mono text-xs flex items-center justify-center font-bold flex-shrink-0">
                        {pIdx + 1}
                      </span>
                      <span className="text-xs md:text-sm text-milk-soft font-sans">{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Slide Footer */}
              <div className="pt-4 border-t border-matte-border/60 flex items-center justify-between text-[11px] font-mono text-milk-dim">
                <span>{doc.institution} &bull; {doc.candidateName}</span>
                <span>Slide {activeSlideIndex + 1} / {doc.slides.length}</span>
              </div>
            </div>
          )}

          {/* Speaker Notes */}
          <div className="mt-4 p-4 rounded-xl bg-matte-bg border border-matte-border">
            <span className="text-[10px] font-mono uppercase text-champagne font-bold tracking-wider block mb-1">
              Catatan Latihan Presenter (Speaker Rehearsal Notes):
            </span>
            <p className="text-xs text-milk-soft italic font-sans leading-relaxed">
              "{doc.slides[activeSlideIndex]?.speakerNotes}"
            </p>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOG */}
      {activeTab === "audit" && (
        <div className="bg-matte-surface p-6 md:p-8 rounded-2xl border border-matte-border shadow-xl">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-[10px] font-mono uppercase text-champagne font-bold tracking-widest">
                Academic Examiner Assurance
              </span>
              <h2 className="text-xl font-serif font-bold text-milk-white mt-1">
                Laporan Hasil Audit Kepatuhan Metodologi & Format
              </h2>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
              100% Lolos Verifikasi
            </span>
          </div>

          <div className="space-y-3">
            {doc.auditLog.map((log, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-matte-bg border border-matte-border flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-mono font-bold text-milk-white">
                      {log.rule}
                    </h3>
                    <p className="text-xs text-milk-soft font-sans mt-0.5">
                      {log.details}
                    </p>
                    <span className="inline-block text-[10px] font-mono text-champagne bg-matte-surface px-2 py-0.5 rounded border border-matte-border mt-1.5">
                      Pilar: {log.thinkingMode}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30 flex-shrink-0">
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
