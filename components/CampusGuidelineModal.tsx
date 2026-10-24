"use client";

import React, { useState, useRef } from "react";
import { CampusGuideline } from "@/types/studio";
import { CAMPUS_PRESETS } from "@/lib/campusPresets";
import { 
  X, 
  Sparkles, 
  UploadCloud, 
  Check, 
  SlidersHorizontal, 
  Landmark, 
  FileText, 
  RefreshCw,
  BookmarkCheck,
  ChevronRight,
  Info,
  Scale
} from "lucide-react";

interface CampusGuidelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGuideline?: CampusGuideline;
  onApplyGuideline: (guideline: CampusGuideline) => void;
}

export const CampusGuidelineModal: React.FC<CampusGuidelineModalProps> = ({
  isOpen,
  onClose,
  currentGuideline,
  onApplyGuideline
}) => {
  const [activeTab, setActiveTab] = useState<"presets" | "upload" | "custom">("presets");
  const [selectedPresetId, setSelectedPresetId] = useState<string>("ugm");
  
  // Custom Guideline State initialized with current or UGM
  const [activeGuideline, setActiveGuideline] = useState<CampusGuideline>(
    currentGuideline || CAMPUS_PRESETS[0]
  );

  // File Upload State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatusMessage, setScanStatusMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: typeof CAMPUS_PRESETS[0]) => {
    setSelectedPresetId(preset.id);
    setActiveGuideline(preset);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    
    // If text file, read directly
    if (file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      const text = await file.text();
      setPastedText(text);
    } else {
      // For PDF / docx, we inform the user to scan or paste excerpts
      setScanStatusMessage(`Berkas "${file.name}" siap dipindai oleh AI.`);
    }
  };

  const handleScanGuideline = async () => {
    if (!uploadedFile && !pastedText.trim()) {
      alert("Mohon pilih berkas atau tempelkan potongan teks buku pedoman kampus Anda.");
      return;
    }

    setIsScanning(true);
    setScanStatusMessage("Menghubungkan ke Gemini 3.5 AI Guideline Scanner...");

    try {
      const filename = uploadedFile ? uploadedFile.name : "Kutipan_Pedoman_Kampus.txt";
      const textPayload = pastedText.trim() || `Analisis berkas ${filename} untuk penulisan skripsi/magang perguruan tinggi.`;

      const res = await fetch("/api/academic/scan-guideline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textPayload,
          filename
        })
      });

      const data = await res.json();
      if (data.success && data.guideline) {
        setActiveGuideline(data.guideline);
        setActiveTab("custom");
        setScanStatusMessage(`Ekstraksi berhasil! Format ${data.guideline.campusName} telah dipetakan.`);
      } else {
        alert("Gagal memindai pedoman: " + (data.error || "Format tidak dikenali"));
      }
    } catch (err: any) {
      alert("Terjadi kesalahan saat memindai berkas: " + err.message);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveAndApply = () => {
    onApplyGuideline(activeGuideline);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-white dark:bg-[#0B101A] border border-[#E2E8F0] dark:border-[#253149] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E2E8F0] dark:border-[#253149] flex items-center justify-between bg-[#F8FAFC] dark:bg-[#111827]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#7C9CFF]/15 text-[#7C9CFF] border border-[#7C9CFF]/30 flex items-center justify-center shadow-xs">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-[#F3F6FC] flex items-center gap-2">
                <span>Format Kampus &amp; AI Guideline Scanner</span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30">
                  Auto-Word Sync
                </span>
              </h3>
              <p className="text-[11px] text-[#64748B] dark:text-[#A4B1C7]">
                Sesuaikan margin (4-4-3-3), tipografi, dan lembar pengesahan persis sesuai buku pedoman fakultas Anda.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#172033] text-[#64748B] dark:text-[#A4B1C7] hover:text-[#0F172A] dark:hover:text-[#F3F6FC] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 border-b border-[#E2E8F0] dark:border-[#253149] text-xs font-medium bg-[#F8FAFC] dark:bg-[#080B12] p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("presets")}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "presets"
                ? "bg-white dark:bg-[#111827] text-[#7C9CFF] font-semibold border border-[#7C9CFF]/30 shadow-2xs"
                : "text-[#64748B] dark:text-[#A4B1C7] hover:text-[#0F172A] dark:hover:text-[#F3F6FC]"
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Preset Kampus Populer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "upload"
                ? "bg-white dark:bg-[#111827] text-[#7C9CFF] font-semibold border border-[#7C9CFF]/30 shadow-2xs"
                : "text-[#64748B] dark:text-[#A4B1C7] hover:text-[#0F172A] dark:hover:text-[#F3F6FC]"
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Pindai PDF Pedoman (AI)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "custom"
                ? "bg-white dark:bg-[#111827] text-[#7C9CFF] font-semibold border border-[#7C9CFF]/30 shadow-2xs"
                : "text-[#64748B] dark:text-[#A4B1C7] hover:text-[#0F172A] dark:hover:text-[#F3F6FC]"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Kustomisasi Parameter</span>
          </button>
        </div>

        {/* Body Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* TAB 1: PRESET KAMPUS POPULER */}
          {activeTab === "presets" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-500 pb-1">
                <span>Pilih format yang telah divalidasi sesuai buku pedoman resmi:</span>
                <span className="font-mono text-[11px]">{CAMPUS_PRESETS.length} Template Siap Pakai</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CAMPUS_PRESETS.map((preset) => {
                  const isSelected = activeGuideline.campusName === preset.campusName;

                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? "bg-[#7C9CFF]/15 border-[#7C9CFF]/40 text-[#0F172A] dark:text-[#F3F6FC] shadow-2xs scale-[1.01]"
                          : "bg-white dark:bg-[#111827] border-[#E2E8F0] dark:border-[#253149] hover:border-[#7C9CFF]/40 text-[#0F172A] dark:text-[#F3F6FC]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold leading-tight">
                            {preset.campusName}
                          </h4>
                          <span className={`inline-block text-[10px] font-mono mt-1 px-2 py-0.5 rounded-md ${
                            isSelected 
                              ? "bg-[#7C9CFF]/25 text-[#7C9CFF]" 
                              : "bg-[#F1F5F9] dark:bg-[#172033] text-[#64748B] dark:text-[#A4B1C7]"
                          }`}>
                            {preset.badge}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#34D399] text-[#080B12] flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <p className={`text-[11px] mt-2 line-clamp-2 leading-relaxed ${
                        isSelected ? "text-[#334155] dark:text-[#CBD5E1]" : "text-[#64748B] dark:text-[#A4B1C7]"
                      }`}>
                        {preset.description}
                      </p>

                      <div className={`mt-3 pt-2.5 border-t flex items-center justify-between text-[10px] font-mono ${
                        isSelected ? "border-[#7C9CFF]/30 text-[#7C9CFF]" : "border-[#E2E8F0] dark:border-[#253149] text-[#64748B] dark:text-[#A4B1C7]"
                      }`}>
                        <span>Margin: {preset.margins.leftCm}-{preset.margins.topCm}-{preset.margins.rightCm}-{preset.margins.bottomCm} cm</span>
                        <span>Sitasi: {preset.citationStyle.toUpperCase()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD & SCAN AI */}
          {activeTab === "upload" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Unggah file PDF Buku Pedoman Skripsi/Magang kampus Anda atau salin teks bagian aturan penulisan (margin, font, susunan bab). Gemini 3.5 akan mengekstrak konfigurasinya secara otomatis.
                </p>
              </div>

              {/* Dropzone */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-500 dark:hover:border-zinc-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-zinc-50/50 dark:bg-zinc-900/30"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".pdf,.docx,.txt,.md" 
                  className="hidden" 
                />
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center mx-auto mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {uploadedFile ? uploadedFile.name : "Klik untuk memilih file PDF atau DOCX Pedoman Kampus"}
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  Mendukung format .pdf, .docx, atau .txt (Maksimal 25MB)
                </p>
              </div>

              {/* Or Paste Text Option */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                  <span>Atau Tempelkan Potongan Teks Aturan Format (Opsional):</span>
                  <span className="text-[10px] text-zinc-400 font-mono">Bisa dari copy-paste Bab Pedoman</span>
                </label>
                <textarea
                  rows={4}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Contoh: Naskah diketik pada kertas A4 dengan margin kiri 4cm, atas 4cm, kanan 3cm, bawah 3cm. Huruf Times New Roman 12 pt, spasi 1.5. Penomoran bab menggunakan angka Romawi dan sub-bab desimal..."
                  className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Scan Trigger Button */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-zinc-500 font-mono">
                  {scanStatusMessage}
                </span>

                <button
                  type="button"
                  onClick={handleScanGuideline}
                  disabled={isScanning || (!uploadedFile && !pastedText.trim())}
                  className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-black font-semibold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-40 transition-all shadow-xs"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sedang Memindai dengan AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Pindai Format Kampus dengan AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOMIZE / FINE-TUNE PARAMETERS */}
          {activeTab === "custom" && (
            <div className="space-y-5">
              <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">
                    Format Kampus Terpilih:
                  </span>
                  <input
                    type="text"
                    value={activeGuideline.campusName}
                    onChange={(e) => setActiveGuideline({ ...activeGuideline, campusName: e.target.value })}
                    className="font-bold text-sm text-zinc-900 dark:text-zinc-100 bg-transparent border-b border-transparent focus:border-zinc-400 outline-none mt-0.5 w-full"
                  />
                </div>
                <span className="text-xs font-mono text-zinc-500 bg-white dark:bg-zinc-800 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-700">
                  {activeGuideline.paperSize} Standard
                </span>
              </div>

              {/* Margin Editor */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" />
                  <span>Ukuran Batas Margin Halaman (Centimeter):</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60">
                    <span className="text-[11px] text-zinc-500 block mb-1">Margin Kiri (Left):</span>
                    <div className="flex items-center gap-1.5 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      <input
                        type="number"
                        step={0.5}
                        min={2}
                        max={6}
                        value={activeGuideline.margins.leftCm}
                        onChange={(e) => setActiveGuideline({
                          ...activeGuideline,
                          margins: { ...activeGuideline.margins, leftCm: parseFloat(e.target.value) || 4 }
                        })}
                        className="w-14 p-1 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-center"
                      />
                      <span>cm</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60">
                    <span className="text-[11px] text-zinc-500 block mb-1">Margin Atas (Top):</span>
                    <div className="flex items-center gap-1.5 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      <input
                        type="number"
                        step={0.5}
                        min={2}
                        max={6}
                        value={activeGuideline.margins.topCm}
                        onChange={(e) => setActiveGuideline({
                          ...activeGuideline,
                          margins: { ...activeGuideline.margins, topCm: parseFloat(e.target.value) || 4 }
                        })}
                        className="w-14 p-1 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-center"
                      />
                      <span>cm</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60">
                    <span className="text-[11px] text-zinc-500 block mb-1">Margin Kanan (Right):</span>
                    <div className="flex items-center gap-1.5 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      <input
                        type="number"
                        step={0.5}
                        min={2}
                        max={6}
                        value={activeGuideline.margins.rightCm}
                        onChange={(e) => setActiveGuideline({
                          ...activeGuideline,
                          margins: { ...activeGuideline.margins, rightCm: parseFloat(e.target.value) || 3 }
                        })}
                        className="w-14 p-1 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-center"
                      />
                      <span>cm</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60">
                    <span className="text-[11px] text-zinc-500 block mb-1">Margin Bawah (Bottom):</span>
                    <div className="flex items-center gap-1.5 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      <input
                        type="number"
                        step={0.5}
                        min={2}
                        max={6}
                        value={activeGuideline.margins.bottomCm}
                        onChange={(e) => setActiveGuideline({
                          ...activeGuideline,
                          margins: { ...activeGuideline.margins, bottomCm: parseFloat(e.target.value) || 3 }
                        })}
                        className="w-14 p-1 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-center"
                      />
                      <span>cm</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography & Spacing */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-1 font-medium">
                    Jenis Font Naskah
                  </label>
                  <select
                    value={activeGuideline.typography.fontFamily}
                    onChange={(e) => setActiveGuideline({
                      ...activeGuideline,
                      typography: { ...activeGuideline.typography, fontFamily: e.target.value }
                    })}
                    className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-sans"
                  >
                    <option value="Times New Roman">Times New Roman (Standar Dikti)</option>
                    <option value="Arial">Arial (Modern Sans)</option>
                    <option value="Calibri">Calibri (BINUS / Telkom)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-1 font-medium">
                    Spasi Baris Teks (Line Spacing)
                  </label>
                  <select
                    value={activeGuideline.typography.lineSpacing}
                    onChange={(e) => setActiveGuideline({
                      ...activeGuideline,
                      typography: { ...activeGuideline.typography, lineSpacing: parseFloat(e.target.value) || 1.5 }
                    })}
                    className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value={1.5}>1.5 Spasi (Standar Umum)</option>
                    <option value={2.0}>2.0 Spasi (Ganda / Draft Bimbingan)</option>
                    <option value={1.15}>1.15 Spasi (Kompak)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-1 font-medium">
                    Gaya Sitasi & Rujukan
                  </label>
                  <select
                    value={activeGuideline.citationStyle}
                    onChange={(e) => setActiveGuideline({
                      ...activeGuideline,
                      citationStyle: e.target.value as any
                    })}
                    className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="apa">APA 7th Edition (Nama, Tahun)</option>
                    <option value="ieee">IEEE Standard (Numerik [1])</option>
                    <option value="harvard">Harvard Referencing Style</option>
                    <option value="vancouver">Vancouver (Medis / Biomedis)</option>
                  </select>
                </div>
              </div>

              {/* Heading Numbering Style */}
              <div className="space-y-1.5 text-xs">
                <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block font-medium">
                  Sistem Penomoran Judul Sub-Bab:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveGuideline({ ...activeGuideline, headingStyle: "decimal" })}
                    className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      activeGuideline.headingStyle === "decimal"
                        ? "border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-800 font-semibold text-zinc-900 dark:text-zinc-100"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <p className="font-mono text-xs">1.1, 1.2, 1.2.1</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Desimal Murni (UGM, UI, ITB, ITS, Tel-U)</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveGuideline({ ...activeGuideline, headingStyle: "alphanumeric" })}
                    className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      activeGuideline.headingStyle === "alphanumeric"
                        ? "border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-800 font-semibold text-zinc-900 dark:text-zinc-100"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <p className="font-mono text-xs">A., 1., a., 1)</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Abjad-Angka (Undip, Unair, Unhas)</p>
                  </button>
                </div>
              </div>

              {/* Extracted Notes */}
              {activeGuideline.extractedNotes && activeGuideline.extractedNotes.length > 0 && (
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 text-xs">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 block mb-1.5">
                    Catatan Aturan Khusus dari Buku Pedoman:
                  </span>
                  <ul className="space-y-1 text-zinc-600 dark:text-zinc-400 text-[11px] list-disc list-inside">
                    {activeGuideline.extractedNotes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 px-5 border-t border-[#E2E8F0] dark:border-[#253149] bg-[#F8FAFC] dark:bg-[#111827] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#64748B] dark:text-[#A4B1C7] hidden sm:inline">Format Aktif:</span>
            <span className="font-bold text-[#0F172A] dark:text-[#F3F6FC]">
              {activeGuideline.campusName}
            </span>
            <span className="text-[10px] font-mono text-[#7C9CFF]">
              ({activeGuideline.margins.leftCm}-{activeGuideline.margins.topCm}-{activeGuideline.margins.rightCm}-{activeGuideline.margins.bottomCm} cm)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-[#64748B] dark:text-[#A4B1C7] hover:text-[#0F172A] dark:hover:text-[#F3F6FC] transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSaveAndApply}
              className="px-5 py-2 rounded-xl bg-[#7C9CFF] hover:bg-[#688bf5] text-[#080B12] font-semibold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Terapkan ke Naskah &amp; Word</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
