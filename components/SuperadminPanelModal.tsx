"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Crown, 
  ShieldCheck, 
  Check, 
  CheckCircle2,
  XCircle, 
  Eye, 
  Clock, 
  Search, 
  RefreshCw, 
  UserCheck, 
  DollarSign, 
  AlertCircle,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  CreditCard
} from "lucide-react";
import { 
  PaymentTransaction, 
  getStoredTransactions, 
  approveQRISTransaction, 
  rejectQRISTransaction,
  QRIS_MERCHANT_INFO
} from "@/lib/paymentStore";
import { 
  UserProfile, 
  getRegisteredUsers, 
  saveRegisteredUsers,
  getStoredUser,
  saveStoredUser 
} from "@/lib/supabase";

interface SuperadminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onDataChanged?: () => void;
}

export const SuperadminPanelModal: React.FC<SuperadminPanelModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onDataChanged
}) => {
  const [activeTab, setActiveTab] = useState<"transactions" | "users" | "analytics">("transactions");
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadData = () => {
    setTransactions(getStoredTransactions());
    setUsers(getRegisteredUsers());
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApprove = (tx: PaymentTransaction) => {
    const res = approveQRISTransaction(tx.id);
    if (res.success) {
      setNotification({
        type: "success",
        message: `Pembayaran ${tx.orderCode} (${tx.userName}) BERHASIL DISETUJUI. Akun otomatis menjadi PRO Unlimited!`
      });
      loadData();
      if (onDataChanged) onDataChanged();
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleReject = (tx: PaymentTransaction) => {
    const reason = prompt("Masukkan alasan penolakan pembayaran:", "Nominal tidak sesuai bukti transfer");
    if (reason === null) return;

    const res = rejectQRISTransaction(tx.id, reason.trim() || "Bukti transfer tidak valid");
    if (res.success) {
      setNotification({
        type: "error",
        message: `Pembayaran ${tx.orderCode} ditolak: ${reason}`
      });
      loadData();
      if (onDataChanged) onDataChanged();
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleToggleProUser = (user: UserProfile) => {
    const nextStatus = !user.isSubscribed;
    const allUsers = getRegisteredUsers();
    const idx = allUsers.findIndex(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    if (idx !== -1) {
      allUsers[idx].isSubscribed = nextStatus;
      allUsers[idx].trialGeneratesLeft = nextStatus ? 999999 : 3;
      allUsers[idx].restrictedGeneratesLeft = nextStatus ? 999999 : 5;
      saveRegisteredUsers(allUsers);
    }
    const active = getStoredUser();
    if (active && (active.id === user.id || active.email.toLowerCase() === user.email.toLowerCase())) {
      active.isSubscribed = nextStatus;
      active.trialGeneratesLeft = nextStatus ? 999999 : 3;
      active.restrictedGeneratesLeft = nextStatus ? 999999 : 5;
      saveStoredUser(active);
    }
    setNotification({
      type: "success",
      message: `Status langganan ${user.name || user.email} diubah menjadi: ${nextStatus ? "PRO UNLIMITED ⭐" : "FREE TRIAL"}`
    });
    loadData();
    if (onDataChanged) onDataChanged();
    setTimeout(() => setNotification(null), 3000);
  };

  // Calculations
  const approvedTx = transactions.filter(t => t.status === "approved");
  const pendingTx = transactions.filter(t => t.status === "pending");
  const totalRevenue = approvedTx.reduce((sum, t) => sum + (t.amount || 0), 0);

  const filteredTx = transactions.filter(t => {
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    const matchSearch = t.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.orderCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.senderName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl bg-white dark:bg-[#0B1120] rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Superadmin Banner */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                  Panel Superadmin — Academic Agent Studio
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-mono font-bold text-[10px] tracking-wider uppercase">
                  Full Authority
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Halo <strong>{currentUser?.name || "Superadmin"}</strong> ({currentUser?.email}) — Kelola persetujuan QRIS & kuota pengguna.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadData}
              title="Refresh Data"
              className="p-2 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Notification Banner */}
        {notification && (
          <div className={`px-6 py-2.5 text-xs font-semibold flex items-center justify-between transition-all ${
            notification.type === "success" 
              ? "bg-emerald-500 text-white" 
              : "bg-rose-500 text-white"
          }`}>
            <span>{notification.message}</span>
            <button type="button" onClick={() => setNotification(null)} className="text-white hover:opacity-80">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
          <button
            type="button"
            onClick={() => setActiveTab("transactions")}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === "transactions"
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Persetujuan QRIS</span>
            {pendingTx.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-mono">
                {pendingTx.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === "users"
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Manajemen Pengguna & Kuota ({users.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("analytics")}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === "analytics"
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Rekap Pendapatan (Rp {totalRevenue.toLocaleString("id-ID")})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* TAB 1: TRANSAKSI QRIS */}
          {activeTab === "transactions" && (
            <div className="space-y-4">
              
              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 w-full sm:w-auto">
                  {(["pending", "approved", "rejected", "all"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setFilterStatus(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                        filterStatus === st 
                          ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs" 
                          : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                      }`}
                    >
                      {st === "pending" ? `Menunggu (${pendingTx.length})` : st}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari user / order code..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Transactions Table / Cards */}
              {filteredTx.length === 0 ? (
                <div className="py-12 text-center text-zinc-400 text-xs">
                  Tidak ada transaksi pembayaran pada status ini.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTx.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-900 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        {/* Proof Thumbnail Click to view */}
                        <div 
                          className="w-16 h-16 rounded-lg border border-zinc-200 overflow-hidden bg-zinc-100 relative group cursor-pointer shrink-0"
                          onClick={() => setPreviewImage(tx.proofImageUrl)}
                          title="Klik untuk melihat bukti transfer penuh"
                        >
                          <img 
                            src={tx.proofImageUrl} 
                            alt="Bukti Transfer" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                            <Eye className="w-4 h-4" />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-zinc-800 dark:text-zinc-200">
                              {tx.orderCode}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              tx.status === "approved" 
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" 
                                : tx.status === "rejected" 
                                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse"
                            }`}>
                              {tx.status}
                            </span>
                          </div>

                          <div className="mt-1">
                            <h4 className="font-bold text-sm text-zinc-900 dark:text-white">{tx.userName}</h4>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              {tx.userEmail} • Pengirim: <strong>{tx.senderName}</strong> ({tx.senderBankOrWallet})
                            </p>
                          </div>

                          <div className="mt-1.5 flex items-center gap-3 text-xs">
                            <span className="font-bold text-blue-600 dark:text-blue-400">
                              Rp {tx.totalAmount.toLocaleString("id-ID")}
                            </span>
                            <span className="text-zinc-400">•</span>
                            <span className="text-zinc-500">{tx.planName}</span>
                            <span className="text-zinc-400">•</span>
                            <span className="text-[11px] text-zinc-400 font-mono">
                              {new Date(tx.createdAt).toLocaleDateString("id-ID", {
                                day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                              })}
                            </span>
                          </div>

                          {tx.rejectionReason && (
                            <p className="mt-1 text-[11px] text-rose-500 font-medium">
                              Alasan Tolak: {tx.rejectionReason}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        {tx.status === "pending" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApprove(tx)}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Setujui (Approve)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(tx)}
                              className="px-3 py-2 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              <span>Tolak</span>
                            </button>
                          </>
                        )}

                        {tx.status === "approved" && (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Pro Terverifikasi</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MANAJEMEN PENGGUNA & KUOTA */}
          {activeTab === "users" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white">Daftar Akun Pengguna</h4>
                  <p className="text-xs text-zinc-500">Kelola kuota trial (3x), kuota judul (5x), dan hak akses Pro / Superadmin.</p>
                </div>
              </div>

              <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Nama & Email</th>
                      <th className="py-3 px-4">Status Akun</th>
                      <th className="py-3 px-4">Sisa Trial (Full)</th>
                      <th className="py-3 px-4">Sisa Judul (Lock)</th>
                      <th className="py-3 px-4 text-right">Aksi Superadmin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-zinc-900 dark:text-zinc-100">{u.name || "User"}</div>
                          <div className="text-[11px] text-zinc-500 font-mono">{u.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          {u.isSuperAdmin ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px] border border-amber-500/20">
                              👑 Superadmin
                            </span>
                          ) : u.isSubscribed ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-[10px] border border-blue-500/20">
                              ⭐ Pro Active
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold text-[10px]">
                              Free Trial
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold">
                          {u.isSuperAdmin || u.isSubscribed ? "∞ Unlimited" : `${u.trialGeneratesLeft}/3`}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold">
                          {u.isSuperAdmin || u.isSubscribed ? "∞ Unlimited" : `${u.restrictedGeneratesLeft}/5`}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleProUser(u)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              u.isSubscribed 
                                ? "bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40" 
                                : "bg-emerald-600 text-white hover:bg-emerald-700"
                            }`}
                          >
                            {u.isSubscribed ? "Cabut Akses Pro" : "Beri Akses Pro Langsung"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: REKAP PENDAPATAN & STATISTIK */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-xs text-zinc-500 font-medium">Total Pendapatan Terverifikasi</span>
                  <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    Rp {totalRevenue.toLocaleString("id-ID")}
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-1 block">Dari {approvedTx.length} transaksi QRIS sukses</span>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-xs text-zinc-500 font-medium">Total Pengguna Terdaftar</span>
                  <div className="mt-2 text-2xl font-black text-blue-600 dark:text-blue-400">
                    {users.length} Akun
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    {users.filter(u => u.isSubscribed).length} akun berstatus Pro
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-xs text-zinc-500 font-medium">Antrean Verifikasi Pending</span>
                  <div className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">
                    {pendingTx.length} Transaksi
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-1 block">Menunggu tindakan Superadmin</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <h4 className="font-bold text-sm text-zinc-900 dark:text-white">Informasi Merchant QRIS Aktif</h4>
                <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
                  <div>• Nama Merchant: <strong>{QRIS_MERCHANT_INFO.merchantName}</strong></div>
                  <div>• NMID: <strong className="font-mono">{QRIS_MERCHANT_INFO.nmid}</strong></div>
                  <div>• Lokasi: <strong>{QRIS_MERCHANT_INFO.city} ({QRIS_MERCHANT_INFO.postalCode})</strong></div>
                  <div>• Tipe QRIS: <strong>DANA Bisnis / QRIS Nasional Berstandar ASPI & BI</strong></div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Modal Preview Bukti Gambar Pembayaran Penuh */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-xl max-h-[85vh] bg-white rounded-xl overflow-hidden p-2 shadow-2xl">
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 bg-black/60 rounded-full text-white hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={previewImage} 
              alt="Bukti Transfer Penuh" 
              className="max-h-[80vh] w-auto object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};
