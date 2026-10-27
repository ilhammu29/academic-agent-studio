"use client";

import React, { useState } from "react";
import { 
  X, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Upload, 
  ShieldCheck, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  Zap, 
  CreditCard,
  QrCode,
  ArrowRight,
  ExternalLink,
  Crown
} from "lucide-react";
import { 
  PricingPlan, 
  PRICING_PLANS, 
  QRIS_MERCHANT_INFO, 
  createQRISTransaction, 
  getStoredTransactions, 
  PaymentTransaction 
} from "@/lib/paymentStore";
import { UserProfile } from "@/lib/supabase";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onPaymentSuccess?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onPaymentSuccess
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>(PRICING_PLANS[0]);
  const [step, setStep] = useState<"choose_plan" | "qris_pay" | "upload_proof" | "success">("choose_plan");
  
  // Payment Form States
  const [senderName, setSenderName] = useState(currentUser?.name || "");
  const [senderBank, setSenderBank] = useState("Bank Mandiri / BCA / Dana / GoPay");
  const [senderPhone, setSenderPhone] = useState("");
  const [proofImageBase64, setProofImageBase64] = useState<string>("");
  const [activeTx, setActiveTx] = useState<PaymentTransaction | null>(null);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedNmid, setCopiedNmid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleCopy = (text: string, type: "amount" | "nmid") => {
    navigator.clipboard.writeText(text);
    if (type === "amount") {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    } else {
      setCopiedNmid(true);
      setTimeout(() => setCopiedNmid(false), 2000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Ukuran file maksimal 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProofImageBase64(reader.result as string);
      setErrorMessage("");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim()) {
      setErrorMessage("Mohon isi nama pengirim / pemilik rekening.");
      return;
    }
    if (!proofImageBase64) {
      setErrorMessage("Mohon lampirkan foto / tangkapan layar bukti transfer QRIS.");
      return;
    }

    setIsSubmitting(true);
    try {
      const tx = createQRISTransaction({
        user: currentUser,
        plan: selectedPlan,
        senderName: senderName.trim(),
        senderBankOrWallet: senderBank.trim(),
        senderPhone: senderPhone.trim() || undefined,
        proofImageUrl: proofImageBase64
      });

      setActiveTx(tx);
      setStep("success");
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal mengirim konfirmasi pembayaran.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-[#0F172A] rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Pembayaran Resmi QRIS</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                  Real Instant
                </span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Merchant: <strong className="text-zinc-700 dark:text-zinc-300">{QRIS_MERCHANT_INFO.merchantName}</strong> ({QRIS_MERCHANT_INFO.city})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* STEP 1: CHOOSE PLAN */}
          {step === "choose_plan" && (
            <div className="space-y-6">
              <div className="text-center max-w-md mx-auto">
                <h4 className="text-lg font-bold text-zinc-900 dark:text-white">Pilih Paket Langganan Akademik</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Buka semua bab yang terkunci, generator judul tanpa batas, dan ekspor naskah standar resmi universitas.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PRICING_PLANS.map((plan) => {
                  const isSelected = selectedPlan.id === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      className={`relative rounded-xl p-5 border-2 cursor-pointer transition-all ${
                        isSelected 
                          ? "border-blue-600 bg-blue-50/30 dark:bg-blue-950/20 shadow-md ring-2 ring-blue-500/20" 
                          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/60"
                      }`}
                    >
                      {plan.popular && (
                        <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-[10px] uppercase tracking-wider shadow-sm">
                          {plan.badge}
                        </span>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{plan.name}</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? "border-blue-600 bg-blue-600 text-white" : "border-zinc-300"}`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>

                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-xs font-semibold text-zinc-500">Rp</span>
                        <span className="text-2xl font-black text-zinc-900 dark:text-white">
                          {plan.price.toLocaleString("id-ID")}
                        </span>
                        <span className="text-[11px] text-zinc-500 font-medium">/{plan.period}</span>
                      </div>

                      <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {plan.description}
                      </p>

                      <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                        {plan.features.map((feat, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep("qris_pay")}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <span>Lanjutkan ke Pembayaran QRIS</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SCAN QRIS */}
          {step === "qris_pay" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <span className="text-xs text-zinc-500">Paket Dipilih:</span>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white">{selectedPlan.name}</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setStep("choose_plan")}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Ganti Paket
                </button>
              </div>

              {/* QRIS Card with exact barcode */}
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center text-center">
                <div className="text-xs font-mono font-medium text-zinc-500 uppercase tracking-widest mb-3">
                  QRIS STANDAR PEMBAYARAN NASIONAL
                </div>

                {/* The QRIS Barcode Image */}
                <div className="relative p-3 bg-white rounded-xl shadow-lg border border-zinc-200 w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
                  <img 
                    src={QRIS_MERCHANT_INFO.imagePath} 
                    alt="QRIS Barcode Pembayaran OXID Project" 
                    className="w-full h-full object-contain select-none"
                  />
                </div>

                <div className="mt-4 flex flex-col items-center">
                  <span className="font-bold text-base text-zinc-900 dark:text-white">
                    {QRIS_MERCHANT_INFO.merchantName}
                  </span>
                  <span className="text-xs font-mono text-zinc-500 flex items-center gap-2">
                    <span>NMID: {QRIS_MERCHANT_INFO.nmid}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(QRIS_MERCHANT_INFO.nmid, "nmid")}
                      className="text-blue-600 hover:underline"
                    >
                      {copiedNmid ? <Check className="w-3 h-3 text-emerald-500 inline" /> : <Copy className="w-3 h-3 inline" />}
                    </button>
                  </span>
                </div>

                {/* Amount to pay */}
                <div className="mt-5 w-full max-w-sm p-3.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-zinc-500 block">Total Nominal Transfer:</span>
                    <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                      Rp {selectedPlan.price.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedPlan.price.toString(), "amount")}
                    className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-600 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5"
                  >
                    {copiedAmount ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Nominal</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="mt-3 text-[11px] text-zinc-500 max-w-md">
                  Mendukung semua aplikasi perbankan & e-wallet: <strong>BCA, Mandiri, BRI, BNI, Dana, OVO, GoPay, ShopeePay, LinkAja</strong>, dan seluruh aplikasi berstandar QRIS.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep("choose_plan")}
                  className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={() => setStep("upload_proof")}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <span>Saya Sudah Transfer</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: UPLOAD PROOF OF PAYMENT */}
          {step === "upload_proof" && (
            <form onSubmit={handleSubmitProof} className="space-y-5">
              <div>
                <h4 className="text-base font-bold text-zinc-900 dark:text-white">Konfirmasi & Bukti Pembayaran</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Lampirkan bukti transfer QRIS agar Superadmin dapat segera mengaktifkan status Pro akun Anda.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Nama Pemilik Rekening / Pengirim <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Contoh: Ahmad Rizky"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Bank / E-Wallet Pengirim
                    </label>
                    <input
                      type="text"
                      value={senderBank}
                      onChange={(e) => setSenderBank(e.target.value)}
                      placeholder="BCA / Mandiri / Dana / Gopay"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Nomor WhatsApp / HP (Opsional)
                    </label>
                    <input
                      type="tel"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      placeholder="0812xxxxxxx"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Upload Bukti Transfer QRIS <span className="text-rose-500">*</span>
                  </label>
                  
                  {proofImageBase64 ? (
                    <div className="relative p-3 rounded-xl border border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/20 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img 
                          src={proofImageBase64} 
                          alt="Preview Bukti" 
                          className="w-16 h-16 object-cover rounded-lg border border-zinc-200"
                        />
                        <div>
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                            Bukti Transfer Terlampir
                          </span>
                          <span className="text-[11px] text-zinc-500">Siap dikirim untuk verifikasi admin</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setProofImageBase64("")}
                        className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100"
                      >
                        Ganti Foto
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-500 bg-zinc-50/50 dark:bg-zinc-900/50 cursor-pointer transition-colors group">
                      <Upload className="w-8 h-8 text-zinc-400 group-hover:text-blue-500 transition-colors mb-2" />
                      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Klik untuk upload foto screenshot bukti transfer
                      </span>
                      <span className="text-[11px] text-zinc-400 mt-1">PNG, JPG, atau JPEG (Maks. 5MB)</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        className="hidden" 
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setStep("qris_pay")}
                  className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? (
                    <span>Mengirim...</span>
                  ) : (
                    <>
                      <span>Kirim Konfirmasi Pembayaran</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: SUCCESS SUBMISSION */}
          {step === "success" && (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-bold text-zinc-900 dark:text-white">
                  Konfirmasi Pembayaran Diterima!
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                  Terima kasih! Bukti transfer Anda untuk <strong>{selectedPlan.name}</strong> telah masuk ke antrean verifikasi Superadmin.
                </p>
              </div>

              {activeTx && (
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 max-w-sm mx-auto text-left space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Kode Transaksi:</span>
                    <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{activeTx.orderCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Nominal Transfer:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">Rp {activeTx.totalAmount.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Status Akun:</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
                      Menunggu Approval Admin
                    </span>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-zinc-400">
                Aktivasi otomatis dilakukan segera setelah Superadmin memeriksa bukti pembayaran.
              </p>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-xs sm:text-sm hover:opacity-90 transition-opacity"
                >
                  Tutup & Kembali ke Studio
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
