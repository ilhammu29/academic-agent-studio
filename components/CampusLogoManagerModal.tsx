"use client";

import React, { useState } from "react";
import { X, Upload, Check, Landmark, RefreshCw, Image as ImageIcon } from "lucide-react";
import { PRESET_CAMPUS_LOGOS, CampusLogo } from "@/lib/campusLogos";

interface CampusLogoManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLogoUrl?: string;
  institution: string;
  onSelectLogo: (logoUrl: string) => void;
}

export const CampusLogoManagerModal: React.FC<CampusLogoManagerModalProps> = ({
  isOpen,
  onClose,
  currentLogoUrl,
  institution,
  onSelectLogo
}) => {
  const [selectedLogo, setSelectedLogo] = useState<string>(currentLogoUrl || "");
  const [customUrlInput, setCustomUrlInput] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Harap pilih file gambar (PNG, JPG, WebP, SVG).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Ukuran file maksimal 2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setSelectedLogo(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    setSelectedLogo(customUrlInput.trim());
    setCustomUrlInput("");
  };

  const handleSave = () => {
    onSelectLogo(selectedLogo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Pilih atau Unggah Logo Kampus
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Logo akan disematkan di halaman sampul (Cover) sesuai Standar Dikti
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          
          {/* Current Logo Preview */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
            <div className="w-20 h-20 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2 flex items-center justify-center shadow-xs flex-shrink-0">
              {selectedLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selectedLogo} alt="Logo Kampus Terpilih" className="max-w-full max-h-full object-contain" />
              ) : (
                <ImageIcon className="w-8 h-8 text-zinc-400" />
              )}
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-sky-600 dark:text-sky-400 font-semibold block">
                Pratinjau Logo Cover Aktif
              </span>
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                {institution || "Universitas Pengusul"}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Dimensi cetak standar: ~6 x 6 cm (proporsional di tengah sampul)
              </p>
            </div>
          </div>

          {/* Upload Custom File */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-zinc-500" />
              <span>Unggah File Logo Resmi Kampus (.png / .jpg / .svg):</span>
            </label>
            <div className="relative border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl p-4 text-center hover:border-sky-500 transition-colors">
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp, image/svg+xml"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Klik atau seret file gambar logo kampus ke sini
              </p>
              <p className="text-[10px] text-zinc-400 mt-1">Maksimal 2 MB (PNG transparan sangat disarankan)</p>
            </div>
            {uploadError && (
              <p className="text-xs text-rose-500 font-medium">{uploadError}</p>
            )}
          </div>

          {/* Preset Logos Grid */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
              Atau Pilih dari Preset Logo Universitas Nasional:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PRESET_CAMPUS_LOGOS.map((preset) => {
                const isPicked = selectedLogo === preset.svgIcon;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedLogo(preset.svgIcon)}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-between gap-2 cursor-pointer ${
                      isPicked
                        ? "bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-700 dark:text-sky-300 ring-2 ring-sky-500/20 font-bold"
                        : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-850"
                    }`}
                  >
                    <div className="w-12 h-12 flex items-center justify-center p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={preset.svgIcon} alt={preset.campusName} className="max-w-full max-h-full object-contain" />
                    </div>
                    <span className="text-[11px] font-medium leading-tight">
                      {preset.shortName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom URL Input */}
          <div className="space-y-1.5 pt-2 border-t border-zinc-200 dark:border-zinc-850">
            <label className="text-[11px] text-zinc-500 dark:text-zinc-400 block font-medium">
              Atau Masukkan Tautan / URL Gambar Logo:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                placeholder="https://example.ac.id/logo-kampus.png"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-sky-500"
              />
              <button
                type="button"
                onClick={handleApplyCustomUrl}
                className="px-3 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
              >
                Gunakan URL
              </button>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSelectedLogo("")}
            className="text-xs text-rose-600 dark:text-rose-400 hover:underline cursor-pointer font-medium"
          >
            Hapus Logo dari Cover
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Simpan Logo Cover</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
