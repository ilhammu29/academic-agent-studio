"use client";

import React, { useState } from "react";
import { X, FileText, Plus, Trash2, Check, Upload, ArrowUpDown, FileCheck, Landmark, Eye } from "lucide-react";
import { CustomSheetItem, SheetType, ApprovalSigner } from "@/types/studio";

interface CustomSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheets: CustomSheetItem[];
  onSave: (updatedSheets: CustomSheetItem[]) => void;
}

export const CustomSheetModal: React.FC<CustomSheetModalProps> = ({
  isOpen,
  onClose,
  sheets: initialSheets,
  onSave
}) => {
  const [sheets, setSheets] = useState<CustomSheetItem[]>(() => {
    if (initialSheets && initialSheets.length > 0) return initialSheets;
    return [
      {
        id: "sheet-pengesahan",
        type: "pengesahan",
        title: "Lembar Pengesahan Naskah",
        pagePosition: 2,
        enabled: true,
        signers: [
          { role: "Dosen Pembimbing I", name: "Dr. Ir. Hendro Prabowo, M.T.", idNumber: "197805122003121002" },
          { role: "Dosen Pembimbing II / Mentor Industri", name: "Ratna Kusuma Dewi, S.T., M.Sc.", idNumber: "198509142010122004" },
          { role: "Ketua Program Studi", name: "Prof. Dr. Ir. Wahyu Wibowo, M.Sc.", idNumber: "196903251994031001" }
        ]
      },
      {
        id: "sheet-orisinalitas",
        type: "pernyataan_orisinalitas",
        title: "Lembar Pernyataan Orisinalitas & Integritas",
        pagePosition: 3,
        enabled: true,
        content: "Dengan ini saya menyatakan bahwa usulan naskah ini adalah karya orisinal saya sendiri, bebas dari fabrikasi data dan plagiarisme, serta mematuhi seluruh kaidah etika akademik."
      },
      {
        id: "sheet-pengantar",
        type: "kata_pengantar",
        title: "Kata Pengantar",
        pagePosition: 4,
        enabled: true,
        content: "Puji syukur kami panjatkan ke hadirat Tuhan Yang Maha Esa atas terselesaikannya naskah usulan akademik ini..."
      },
      {
        id: "sheet-abstrak",
        type: "abstrak",
        title: "Abstrak & Abstract (ID / EN)",
        pagePosition: 5,
        enabled: true,
        content: "Naskah usulan ini menyajikan investigasi komprehensif...",
        englishContent: "This proposal presents a comprehensive methodological framework..."
      }
    ];
  });

  const [activeSheetIndex, setActiveSheetIndex] = useState<number>(0);

  if (!isOpen) return null;

  const handleToggleSheet = (idx: number) => {
    const updated = [...sheets];
    updated[idx] = { ...updated[idx], enabled: !updated[idx].enabled };
    setSheets(updated);
  };

  const handlePositionChange = (idx: number, pos: number) => {
    const updated = [...sheets];
    updated[idx] = { ...updated[idx], pagePosition: Math.max(2, pos) };
    setSheets(updated);
  };

  const handleFileUpload = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const updated = [...sheets];
        updated[idx] = {
          ...updated[idx],
          uploadedFileUrl: dataUrl
        };
        setSheets(updated);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddNewSheet = () => {
    const newSheet: CustomSheetItem = {
      id: `sheet-custom-${Date.now()}`,
      type: "custom_upload",
      title: "Lembar Khusus Kampus (Upload Scan)",
      pagePosition: sheets.length + 2,
      enabled: true,
      content: "Lembar lampiran / form resmi dari fakultas atau instansi mitra."
    };
    setSheets([...sheets, newSheet]);
    setActiveSheetIndex(sheets.length);
  };

  const handleRemoveSheet = (idx: number) => {
    setSheets(sheets.filter((_, i) => i !== idx));
    if (activeSheetIndex >= sheets.length - 1) {
      setActiveSheetIndex(Math.max(0, sheets.length - 2));
    }
  };

  const handleSave = () => {
    // Sort by page position ascending
    const sorted = [...sheets].sort((a, b) => (a.pagePosition ?? 0) - (b.pagePosition ?? 0));
    onSave(sorted);
    onClose();
  };

  const currentSheet = sheets[activeSheetIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0B101A] border border-[#E2E8F0] dark:border-[#253149] rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0] dark:border-[#253149] bg-[#F8FAFC] dark:bg-[#111827]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#34D399]/15 border border-[#34D399]/30 flex items-center justify-center text-[#34D399]">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F3F6FC] flex items-center gap-2">
                <span>Kelola Lembar Khusus, Pengesahan, &amp; Scan Kampus</span>
                <span className="px-2 py-0.5 rounded-md bg-[#34D399]/15 text-[#34D399] font-mono text-[11px] font-semibold border border-[#34D399]/30">
                  {sheets.filter(s => s.enabled).length} Lembar Aktif
                </span>
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#A4B1C7]">
                Atur posisi nomor halaman, isi teks tanda tangan, atau upload scan resmi bertanda tangan dari kampus
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] dark:text-[#A4B1C7] hover:text-[#0F172A] dark:hover:text-[#F3F6FC] hover:bg-[#F1F5F9] dark:hover:bg-[#172033] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body: Sidebar List & Editor Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Column: Sheet List */}
          <div className="w-full md:w-72 border-r border-zinc-200 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/30 p-3 space-y-2 overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-[11px] font-mono uppercase text-zinc-500 font-semibold">
                Daftar Halaman Awal
              </span>
              <button
                type="button"
                onClick={handleAddNewSheet}
                className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Tambah</span>
              </button>
            </div>

            {sheets.map((sheet, idx) => {
              const isSelected = idx === activeSheetIndex;
              return (
                <div
                  key={sheet.id}
                  onClick={() => setActiveSheetIndex(idx)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                    isSelected
                      ? "bg-white dark:bg-zinc-900 border-sky-500 shadow-xs ring-1 ring-sky-500/20"
                      : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                      {sheet.title}
                    </span>
                    <input
                      type="checkbox"
                      checked={sheet.enabled}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleToggleSheet(idx);
                      }}
                      className="rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
                      Hal. {sheet.pagePosition}
                    </span>
                    <span className="text-[10px] uppercase text-zinc-400">
                      {sheet.uploadedFileUrl ? "✓ Ada Scan File" : "Teks Formulir"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Sheet Detail & Scan Upload Editor */}
          {currentSheet && (
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Konfigurasi: {currentSheet.title}
                  </h4>
                  <p className="text-xs text-zinc-500">
                    Sesuaikan judul, nomor halaman, dan konten atau upload berkas scan resmi
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRemoveSheet(activeSheetIndex)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Lembar</span>
                  </button>
                </div>
              </div>

              {/* Title & Page Number Positioning */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Judul Lembar Halaman:
                  </label>
                  <input
                    type="text"
                    value={currentSheet.title}
                    onChange={(e) => {
                      const updated = [...sheets];
                      updated[activeSheetIndex].title = e.target.value;
                      setSheets(updated);
                    }}
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-sky-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                    <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                    <span>Urutan Halaman:</span>
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={20}
                    value={currentSheet.pagePosition ?? 2}
                    onChange={(e) => handlePositionChange(activeSheetIndex, parseInt(e.target.value) || 2)}
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-xs font-mono font-bold text-sky-600 focus:outline-hidden focus:border-sky-500"
                  />
                  <span className="text-[10px] text-zinc-400 block">Cover = Hal 1</span>
                </div>
              </div>

              {/* Upload Official Scan (PNG / JPG / PDF) */}
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-sky-500" />
                    <span>Opsi: Upload Berkas Scan Resmi dari Kampus / Fakultas</span>
                  </span>
                  {currentSheet.uploadedFileUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...sheets];
                        delete updated[activeSheetIndex].uploadedFileUrl;
                        setSheets(updated);
                      }}
                      className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                    >
                      Hapus File Scan
                    </button>
                  )}
                </div>

                {currentSheet.uploadedFileUrl ? (
                  <div className="p-3 bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
                    <div className="w-16 h-16 rounded border bg-zinc-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={currentSheet.uploadedFileUrl} alt="Scan Pratinjau" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Berkas Scan Terlampir
                      </span>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Gambar ini akan langsung dirender penuh pada Halaman {currentSheet.pagePosition}.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl p-4 text-center hover:border-sky-500 transition-colors">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={(e) => handleFileUpload(activeSheetIndex, e)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Upload scan lembar bertanda tangan / berkas stempel (.png, .jpg)
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      Jika diunggah, halaman ini akan menampilkan gambar scan secara utuh
                    </p>
                  </div>
                )}
              </div>

              {/* Text Content Editor (If not using uploaded scan) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                  Isi Naskah / Teks Formulir (Jika tidak menggunakan scan):
                </label>
                <textarea
                  rows={5}
                  value={currentSheet.content || ""}
                  onChange={(e) => {
                    const updated = [...sheets];
                    updated[activeSheetIndex].content = e.target.value;
                    setSheets(updated);
                  }}
                  placeholder="Ketikkan naskah isi lembar..."
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 leading-relaxed focus:outline-hidden focus:border-sky-500"
                />
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E2E8F0] dark:border-[#253149] bg-[#F8FAFC] dark:bg-[#111827] flex items-center justify-between">
          <span className="text-xs text-[#64748B] dark:text-[#A4B1C7] font-mono">
            Halaman awal menggunakan penomoran Romawi (i, ii, iii) sesuai kaidah Dikti.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-[#64748B] dark:text-[#A4B1C7] hover:bg-[#F1F5F9] dark:hover:bg-[#172033] transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-[#7C9CFF] hover:bg-[#688bf5] text-[#080B12] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Terapkan Lembar ke Dokumen</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
