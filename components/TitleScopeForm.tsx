"use client";

import React from "react";
import { ProposalCategory } from "@/types/studio";
import { ArrowRight, Sparkles, Building2, User, GraduationCap, Clock, BookmarkCheck } from "lucide-react";

interface TitleScopeFormProps {
  category: ProposalCategory;
  title: string;
  setTitle: (t: string) => void;
  targetEntity: string;
  setTargetEntity: (e: string) => void;
  institution: string;
  setInstitution: (i: string) => void;
  facultyMajor: string;
  setFacultyMajor: (f: string) => void;
  candidateName: string;
  setCandidateName: (n: string) => void;
  candidateId: string;
  setCandidateId: (id: string) => void;
  durationMonths: number;
  setDurationMonths: (d: number) => void;
  onSubmit: () => void;
}

export const TitleScopeForm: React.FC<TitleScopeFormProps> = ({
  category,
  title,
  setTitle,
  targetEntity,
  setTargetEntity,
  institution,
  setInstitution,
  facultyMajor,
  setFacultyMajor,
  candidateName,
  setCandidateName,
  candidateId,
  setCandidateId,
  durationMonths,
  setDurationMonths,
  onSubmit
}) => {
  const presets = category === "magang" ? [
    {
      title: "Penerapan Pipeline Otomatisasi Data & Visualisasi Analitik pada Divisi Big Data Enterprise",
      entity: "PT Telkom Indonesia (Persero) Tbk",
      major: "Teknologi Informasi / Ilmu Komputer"
    },
    {
      title: "Pengembangan Modul User Flow & Audit Desain Sistem Antarmuka Aplikasi Mobile Booking",
      entity: "PT Traveloka Indonesia",
      major: "Sistem Informasi / Desain Komunikasi Visual"
    },
    {
      title: "Optimasi Query Database Relasional & Pengujian Integrasi Sistem Pembayaran Digital",
      entity: "PT Bank Mandiri (Persero) Tbk",
      major: "Teknik Informatika / Rekayasa Perangkat Lunak"
    }
  ] : [
    {
      title: "Perbedaan Pola Makan dan Aktivitas Fisik dengan Obesitas pada Remaja di SMA Assalaam Surakarta",
      entity: "SMA PPMI Assalaam Surakarta",
      major: "Pendidikan Dokter (Kedokteran)"
    },
    {
      title: "Pengaruh Formulasi Ekstrak Daun Kelor terhadap Profil Glukosa Darah dan Sitokin Pro-Inflamasi",
      entity: "Laboratorium Farmakologi & RS Akademik UGM",
      major: "Farmasi Klinis & Komunitas"
    },
    {
      title: "Analisis Sentimen Kebijakan Transportasi Publik Berbasis Model Transformer dan Fine-Tuning LoRA",
      entity: "Dinas Perhubungan & Smart City Solo",
      major: "Ilmu Komputer / Sains Data"
    }
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setTitle(p.title);
    setTargetEntity(p.entity);
    setFacultyMajor(p.major);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      
      {/* Hero Heading */}
      <div className="mb-8 text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-champagne/30 bg-champagne/5 text-champagne text-xs font-mono font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Tahap 01 &bull; Inisiasi Topik & Ruang Lingkup
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-milk-white tracking-tight leading-tight">
          {category === "magang" ? "Rancang Proposal Magang & PKL Presisi" : "Rancang Proposal Skripsi & Riset Medis/Teknik"}
        </h1>
        <p className="text-sm text-milk-muted font-sans mt-2 max-w-2xl leading-relaxed">
          Ketikkan judul atau gagasan yang ingin Anda ajukan. Sistem akan menyiapkan serangkaian pertanyaan diagnostik untuk mengumpulkan data spesifik sebelum orkestrasi 5 AI Agent dimulai.
        </p>
      </div>

      {/* Preset Inspiration Pills */}
      <div className="mb-8 p-4 rounded-xl bg-matte-surface border border-matte-border">
        <div className="flex items-center gap-2 mb-2.5 text-xs font-mono font-bold text-champagne uppercase tracking-wider">
          <BookmarkCheck className="w-4 h-4" />
          Inspirasi Judul Siap Pakai (Klik untuk Mengisi Otomatis)
        </div>
        <div className="flex flex-col gap-2">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(p)}
              className="text-left p-3 rounded-lg bg-matte-surface2 hover:bg-matte-border border border-matte-borderLight transition-all group flex items-start justify-between gap-3"
            >
              <div>
                <p className="text-xs font-serif font-semibold text-milk-white group-hover:text-champagne-light transition-colors">
                  {p.title}
                </p>
                <p className="text-[11px] text-milk-muted font-mono mt-0.5">
                  Mitra/Lokasi: <span className="text-milk-soft">{p.entity}</span> &bull; Bidang: {p.major}
                </p>
              </div>
              <span className="text-xs font-mono text-champagne opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 flex-shrink-0">
                Pilih <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Input Form */}
      <div className="space-y-6 bg-matte-surface p-6 md:p-8 rounded-2xl border border-matte-border shadow-xl">
        
        {/* Title Input */}
        <div>
          <label className="block text-xs font-mono font-bold text-milk-white uppercase tracking-wider mb-2">
            Judul Proposal {category === "magang" ? "Magang / PKL" : "Skripsi / Riset"} <span className="text-alert-soft">*</span>
          </label>
          <textarea
            rows={3}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              category === "magang"
                ? "Contoh: Analisis Kinerja Infrastruktur Data dan Otomatisasi Reporting pada Divisi Enterprise..."
                : "Contoh: Perbedaan Pola Makan dan Aktivitas Fisik dengan Obesitas pada Remaja di SMA Assalaam..."
            }
            className="w-full bg-matte-bg border border-matte-border focus:border-champagne/70 rounded-xl px-4 py-3 text-sm text-milk-white placeholder:text-milk-dim focus:outline-none focus:ring-1 focus:ring-champagne transition-all font-serif"
          />
        </div>

        {/* Target Entity & Department */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-bold text-milk-soft uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-champagne" />
              {category === "magang" ? "Perusahaan / Instansi Tujuan" : "Lokasi / Unit Penelitian"} <span className="text-alert-soft">*</span>
            </label>
            <input
              type="text"
              value={targetEntity}
              onChange={(e) => setTargetEntity(e.target.value)}
              placeholder="Contoh: PT Telkom Indonesia / RS Akademik UGM"
              className="w-full bg-matte-bg border border-matte-border focus:border-champagne/70 rounded-xl px-4 py-2.5 text-xs text-milk-white placeholder:text-milk-dim focus:outline-none focus:ring-1 focus:ring-champagne transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-milk-soft uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-champagne" />
              Durasi Rencana Pelaksanaan
            </label>
            <select
              value={durationMonths}
              onChange={(e) => setDurationMonths(Number(e.target.value))}
              className="w-full bg-matte-bg border border-matte-border focus:border-champagne/70 rounded-xl px-4 py-2.5 text-xs text-milk-white focus:outline-none focus:ring-1 focus:ring-champagne transition-all"
            >
              <option value={1}>1 Bulan (4 Minggu)</option>
              <option value={2}>2 Bulan (8 Minggu)</option>
              <option value={3}>3 Bulan (12 Minggu - Standar PKL)</option>
              <option value={4}>4 Bulan (16 Minggu - 1 Semester)</option>
              <option value={6}>6 Bulan (24 Minggu - MBKM 20 SKS / Skripsi)</option>
            </select>
          </div>
        </div>

        {/* Academic Profile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-matte-border/50">
          <div>
            <label className="block text-xs font-mono font-bold text-milk-soft uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-academic-blue" />
              Perguruan Tinggi Asal
            </label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="Contoh: Universitas Gadjah Mada (UGM)"
              className="w-full bg-matte-bg border border-matte-border focus:border-champagne/70 rounded-xl px-4 py-2.5 text-xs text-milk-white placeholder:text-milk-dim focus:outline-none focus:ring-1 focus:ring-champagne transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-milk-soft uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-academic-blue" />
              Program Studi / Fakultas
            </label>
            <input
              type="text"
              value={facultyMajor}
              onChange={(e) => setFacultyMajor(e.target.value)}
              placeholder="Contoh: Teknologi Informasi / Pendidikan Dokter"
              className="w-full bg-matte-bg border border-matte-border focus:border-champagne/70 rounded-xl px-4 py-2.5 text-xs text-milk-white placeholder:text-milk-dim focus:outline-none focus:ring-1 focus:ring-champagne transition-all"
            />
          </div>
        </div>

        {/* Student Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-bold text-milk-soft uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-milk-muted" />
              Nama Lengkap Mahasiswa / Peneliti
            </label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="Contoh: Muhammad Ilham / Nama Pengusul"
              className="w-full bg-matte-bg border border-matte-border focus:border-champagne/70 rounded-xl px-4 py-2.5 text-xs text-milk-white placeholder:text-milk-dim focus:outline-none focus:ring-1 focus:ring-champagne transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-milk-soft uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-milk-muted" />
              Nomor Induk Mahasiswa (NIM / NPM)
            </label>
            <input
              type="text"
              value={candidateId}
              onChange={(e) => setCandidateId(e.target.value)}
              placeholder="Contoh: 22/502810/KU/24144"
              className="w-full bg-matte-bg border border-matte-border focus:border-champagne/70 rounded-xl px-4 py-2.5 text-xs text-milk-white placeholder:text-milk-dim focus:outline-none focus:ring-1 focus:ring-champagne transition-all font-mono"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex justify-end">
          <button
            onClick={onSubmit}
            disabled={!title.trim()}
            className="w-full md:w-auto px-8 py-3.5 rounded-xl bg-champagne hover:bg-champagne-light text-matte-bg font-sans font-bold text-sm tracking-wide transition-all shadow-lg shadow-champagne/10 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>Mulai Sesi Wawancara Diagnostik</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
