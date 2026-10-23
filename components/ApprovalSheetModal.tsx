"use client";

import React, { useState } from "react";
import { ProposalDocument, ApprovalSheetInfo } from "@/types/studio";
import { 
  FileSignature, 
  X, 
  Save, 
  Check, 
  UserCheck, 
  Building2, 
  Calendar
} from "lucide-react";

interface ApprovalSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  doc: ProposalDocument;
  onSave: (info: ApprovalSheetInfo) => void;
}

export const ApprovalSheetModal: React.FC<ApprovalSheetModalProps> = ({
  isOpen,
  onClose,
  doc,
  onSave
}) => {
  const [approvalDate, setApprovalDate] = useState(
    doc.approvalSheet?.approvalDate || `${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`
  );
  const [city, setCity] = useState("Jakarta");

  const [signer1Name, setSigner1Name] = useState(
    doc.approvalSheet?.primarySigners?.[0]?.name || "Dr. Ir. Suharyanto, M.Sc."
  );
  const [signer1Id, setSigner1Id] = useState(
    doc.approvalSheet?.primarySigners?.[0]?.idNumber || "19780512 200312 1 002"
  );
  const [signer1Role, setSigner1Role] = useState(
    doc.approvalSheet?.primarySigners?.[0]?.role || "Dosen Pembimbing Utama (I)"
  );

  const [signer2Name, setSigner2Name] = useState(
    doc.approvalSheet?.primarySigners?.[1]?.name || "Dian Pratama, M.Kom."
  );
  const [signer2Id, setSigner2Id] = useState(
    doc.approvalSheet?.primarySigners?.[1]?.idNumber || "19850920 201012 2 005"
  );
  const [signer2Role, setSigner2Role] = useState(
    doc.approvalSheet?.primarySigners?.[1]?.role || (doc.category === "magang" ? "Pembimbing Lapangan / Mentor" : "Dosen Pembimbing Pendamping (II)")
  );

  const [headName, setHeadName] = useState(
    doc.approvalSheet?.headSigner?.name || "Prof. Dr. Ir. Budi Hartono, M.Sc."
  );
  const [headId, setHeadId] = useState(
    doc.approvalSheet?.headSigner?.idNumber || "19680315 199303 1 001"
  );
  const [headRole, setHeadRole] = useState(
    doc.approvalSheet?.headSigner?.role || "Ketua Program Studi"
  );

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSheet: ApprovalSheetInfo = {
      title: `LEMBAR PENGESAHAN PROPOSAL ${doc.category.toUpperCase()}`,
      approvalDate: `${city}, ${approvalDate}`,
      primarySigners: [
        { role: signer1Role, name: signer1Name, idNumber: signer1Id },
        { role: signer2Role, name: signer2Name, idNumber: signer2Id }
      ],
      headSigner: {
        role: headRole,
        name: headName,
        idNumber: headId
      }
    };
    onSave(updatedSheet);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-zinc-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-100">
              <FileSignature className="w-5 h-5 text-zinc-200" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">Kustomisasi Lembar Pengesahan Kampus</h3>
              <p className="text-xs text-zinc-400">
                Nama dosen pembimbing, penguji, NIP/NIDN, dan tanda tangan resmi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Kota & Tanggal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Kota Kampus / Pelaksanaan:</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-zinc-500"
                placeholder="Contoh: Jakarta"
              />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Tanggal Persetujuan:</label>
              <input
                type="text"
                value={approvalDate}
                onChange={(e) => setApprovalDate(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-zinc-500"
                placeholder="Contoh: 24 Oktober 2026"
              />
            </div>
          </div>

          {/* Dosen Pembimbing 1 */}
          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2.5">
            <div className="font-semibold text-zinc-200 flex items-center justify-between text-xs">
              <span>{signer1Role}</span>
              <span className="text-[10px] font-mono text-zinc-500">PENANDATANGAN 1</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Nama Lengkap & Gelar:</label>
                <input
                  type="text"
                  value={signer1Name}
                  onChange={(e) => setSigner1Name(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-zinc-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">NIP / NIDN:</label>
                <input
                  type="text"
                  value={signer1Id}
                  onChange={(e) => setSigner1Id(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 font-mono focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>
          </div>

          {/* Dosen Pembimbing 2 / Mentor */}
          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2.5">
            <div className="font-semibold text-zinc-200 flex items-center justify-between text-xs">
              <span>{signer2Role}</span>
              <span className="text-[10px] font-mono text-zinc-500">PENANDATANGAN 2</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Nama Lengkap & Gelar:</label>
                <input
                  type="text"
                  value={signer2Name}
                  onChange={(e) => setSigner2Name(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-zinc-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">NIP / NIDN / NIK:</label>
                <input
                  type="text"
                  value={signer2Id}
                  onChange={(e) => setSigner2Id(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 font-mono focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>
          </div>

          {/* Ketua Program Studi */}
          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2.5">
            <div className="font-semibold text-zinc-200 flex items-center justify-between text-xs">
              <span>Mengetahui: {headRole}</span>
              <span className="text-[10px] font-mono text-zinc-500">PENGESAH KAMPUS</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Nama Lengkap & Gelar:</label>
                <input
                  type="text"
                  value={headName}
                  onChange={(e) => setHeadName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-zinc-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">NIP / NIDN:</label>
                <input
                  type="text"
                  value={headId}
                  onChange={(e) => setHeadId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 font-mono focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Terapkan ke Naskah</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
