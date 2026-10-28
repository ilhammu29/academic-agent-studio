'use client';

import React, { useState } from 'react';
import { 
  X, 
  KeyRound, 
  Database, 
  User, 
  Building, 
  Mail, 
  Check, 
  Copy, 
  ArrowRight, 
  RefreshCw, 
  AlertCircle, 
  LogOut, 
  Crown, 
  Sparkles, 
  Lock, 
  Zap, 
  ShieldCheck, 
  CreditCard 
} from 'lucide-react';
import { 
  UserProfile, 
  testSupabaseConnection, 
  SUPABASE_SQL_MIGRATION, 
  loginUser, 
  registerUser, 
  upgradeUserSubscription,
  SUPERADMIN_USER 
} from '@/lib/supabase';
import { SubscriptionPlanId, UserRole } from '@/types/studio';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
  isLoggedIn?: boolean;
  onLogout?: () => void;
  defaultTab?: 'login' | 'register' | 'pricing' | 'supabase';
}

export default function AuthModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  onUpdateUser, 
  isLoggedIn, 
  onLogout,
  defaultTab = 'login'
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'pricing' | 'supabase'>(defaultTab);

  // Login & Register Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('Universitas Negeri Padang (UNP)');
  const [role, setRole] = useState<UserRole>('Mahasiswa');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId>('pro_skripsi');
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Supabase Config state
  const [supabaseUrl, setSupabaseUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      const cfg = localStorage.getItem('academic_studio_supabase_config');
      if (cfg) {
        try { return JSON.parse(cfg).url || ''; } catch {}
      }
    }
    return process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  });

  const [supabaseAnonKey, setSupabaseAnonKey] = useState(() => {
    if (typeof window !== 'undefined') {
      const cfg = localStorage.getItem('academic_studio_supabase_config');
      if (cfg) {
        try { return JSON.parse(cfg).anonKey || ''; } catch {}
      }
    }
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  });

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  // Handler Login Biasa
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const res = loginUser(email, password);
    if (!res.success) {
      setAuthError(res.message || 'Login gagal.');
      return;
    }
    if (res.user) {
      onUpdateUser(res.user);
      setAuthSuccess(true);
      setTimeout(() => {
        setAuthSuccess(false);
        onClose();
      }, 500);
    }
  };

  // Handler Login 1-Klik Superadmin
  const handleSuperadminLogin = () => {
    setAuthError('');
    const res = loginUser(SUPERADMIN_USER.email, 'superadmin123');
    if (res.user) {
      onUpdateUser(res.user);
      setAuthSuccess(true);
      setTimeout(() => {
        setAuthSuccess(false);
        onClose();
      }, 500);
    }
  };

  // Handler Registrasi Akun Baru (Mendapat 3 Trial)
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!name.trim()) {
      setAuthError('Nama lengkap wajib diisi.');
      return;
    }
    if (!email.trim()) {
      setAuthError('Email wajib diisi.');
      return;
    }

    const res = registerUser({
      name,
      email,
      password,
      institution,
      role
    });

    if (!res.success) {
      setAuthError(res.message || 'Pendaftaran gagal.');
      return;
    }

    if (res.user) {
      onUpdateUser(res.user);
      setAuthSuccess(true);
      setTimeout(() => {
        setAuthSuccess(false);
        onClose();
      }, 500);
    }
  };

  // Handler Pembayaran / Aktivasi Paket Langganan
  const handleSubscribe = (planId: SubscriptionPlanId) => {
    setIsUpgrading(true);
    setTimeout(() => {
      const updated = upgradeUserSubscription(currentUser.id, planId);
      onUpdateUser(updated);
      setIsUpgrading(false);
      alert(`Selamat! Akun Anda telah berhasil di-upgrade ke Paket Pro (${planId.replace('_', ' ').toUpperCase()}). Seluruh gembok naskah dokumen telah dibuka 100%!`);
      onClose();
    }, 600);
  };

  const handleSaveSupabaseConfig = async () => {
    setIsTesting(true);
    setTestResult(null);

    const result = await testSupabaseConnection(supabaseUrl, supabaseAnonKey);
    setTestResult(result);
    setIsTesting(false);

    if (typeof window !== 'undefined') {
      localStorage.setItem('academic_studio_supabase_config', JSON.stringify({
        url: supabaseUrl,
        anonKey: supabaseAnonKey
      }));
    }
  };

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_MIGRATION);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-850 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Autentikasi &amp; Paket Civitas</span>
                {currentUser?.isSuperAdmin && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold">
                    SUPERADMIN
                  </span>
                )}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Kelola hak akses, kuota trial 3x, dan langganan naskah
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center justify-center transition-colors text-sm cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-900 px-5 pt-2 gap-3 text-xs font-medium overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'login'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-300 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Masuk (Login)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'register'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-300 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Daftar Baru (3x Trial)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'pricing'
                ? 'border-amber-500 text-amber-600 dark:border-amber-400 dark:text-amber-300 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Paket Langganan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('supabase')}
            className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'supabase'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-300 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Cloud Database</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {authError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <div className="space-y-4">
              
              {/* TOMBOL SPESIAL SUPERADMIN UNTUK ANDA */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-orange-500/10 border border-amber-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                      <Crown className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <span>Akun Superadmin Anda</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono font-bold">UNLIMITED</span>
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {SUPERADMIN_USER.email} (Bypass seluruh gembok naskah)
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSuperadminLogin}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>Masuk Superadmin</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Status Akun Pengguna yang Sedang Login */}
              {isLoggedIn && (
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Akun Aktif:</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{currentUser.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Status Langganan:</span>
                    <span className={`font-semibold ${currentUser.isSuperAdmin || currentUser.isSubscribed ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {currentUser.isSuperAdmin ? '👑 Superadmin (Full Access)' : currentUser.isSubscribed ? '⭐ Pro Subscriber' : '⚡ Free Trial'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-200 dark:border-zinc-800 text-center">
                    <div className="p-2 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                      <div className="text-[10px] text-zinc-500">Trial Penuh Tersisa</div>
                      <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {currentUser.isSuperAdmin || currentUser.isSubscribed ? '∞' : `${currentUser.trialGeneratesLeft ?? 3}/3`}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                      <div className="text-[10px] text-zinc-500">Kuota Judul (3 Hal)</div>
                      <div className="text-sm font-bold text-amber-500">
                        {currentUser.isSuperAdmin || currentUser.isSubscribed ? '∞' : `${currentUser.restrictedGeneratesLeft ?? 5}/5`}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Login Biasa */}
              <form onSubmit={handleLoginSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Email Pengguna
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@kampus.ac.id"
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi..."
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    {authSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" /> Berhasil Masuk
                      </>
                    ) : (
                      <>
                        Masuk ke Studio <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {isLoggedIn && onLogout && (
                    <button
                      type="button"
                      onClick={() => {
                        onLogout();
                        onClose();
                      }}
                      className="w-full py-2 rounded-xl border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Keluar dari Akun (Logout)</span>
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: REGISTER AKUN BARU */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Bonus Kuota Baru:</strong> Setiap pendaftaran akun baru langsung mendapatkan <strong>3x Percobaan Trial Penuh</strong> (semua bab terbuka dan bisa diunduh) + <strong>5x Percobaan Judul</strong>!
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nama Lengkap &amp; Gelar
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Rahmat Hidayat, S.T."
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Email Perguruan Tinggi / Instansi
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@unp.ac.id / user@kampus.ac.id"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Kata Sandi
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Institusi Kampus
                  </label>
                  <input
                    type="text"
                    required
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="UNP / UNS / ITB"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Status Civitas
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Mahasiswa">Mahasiswa</option>
                    <option value="Dosen Pembimbing">Dosen Pembimbing</option>
                    <option value="Reviewer Industri">Reviewer Industri</option>
                    <option value="Peneliti">Peneliti</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Daftar &amp; Ambil 3x Kuota Trial Gratis</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 3: PAKET LANGGANAN & UPGRADE */}
          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <div className="text-center max-w-sm mx-auto">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Tingkatkan ke Akun Pro Berlangganan
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Buka gembok naskah dokumen, hilangkan efek blur di Bab 2-5, dan unduh berkas Word DOCX &amp; PDF lengkap.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Paket 1: Per Dokumen */}
                <div 
                  onClick={() => setSelectedPlan('pro_mahasiswa')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedPlan === 'pro_mahasiswa'
                      ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                  }`}
                >
                  <div>
                    <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                      Mahasiswa Sempro
                    </div>
                    <div className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">
                      Rp 49.000
                    </div>
                    <div className="text-[10px] text-zinc-500">Per 1 Naskah Lengkap</div>
                    <ul className="mt-3 space-y-1.5 text-[11px] text-zinc-600 dark:text-zinc-300">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Buka semua bab 1-5</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Ekspor DOCX &amp; PDF</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Matriks DOV &amp; RAB</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Paket 2: Skripsi Pro */}
                <div 
                  onClick={() => setSelectedPlan('pro_skripsi')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                    selectedPlan === 'pro_skripsi'
                      ? 'border-amber-500 bg-amber-50/30 dark:bg-amber-950/30 ring-2 ring-amber-500/20 shadow-md'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                  }`}
                >
                  <span className="absolute -top-2.5 right-3 text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-xs">
                    PALING LARIS
                  </span>
                  <div>
                    <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                      Skripsi &amp; Tesis Pro
                    </div>
                    <div className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">
                      Rp 99.000
                    </div>
                    <div className="text-[10px] text-zinc-500">Akses 1 Semester Penuh</div>
                    <ul className="mt-3 space-y-1.5 text-[11px] text-zinc-600 dark:text-zinc-300">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Unlimited generate</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Bebas gembok 100%</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Slide Presentasi 16:9</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Paket 3: Peneliti Unlimited */}
                <div 
                  onClick={() => setSelectedPlan('pro_unlimited')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedPlan === 'pro_unlimited'
                      ? 'border-purple-500 bg-purple-50/30 dark:bg-purple-950/30 ring-2 ring-purple-500/20'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                  }`}
                >
                  <div>
                    <div className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                      Peneliti &amp; Dosen
                    </div>
                    <div className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">
                      Rp 199.000
                    </div>
                    <div className="text-[10px] text-zinc-500">1 Tahun Unlimited</div>
                    <ul className="mt-3 space-y-1.5 text-[11px] text-zinc-600 dark:text-zinc-300">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Hibah Dikti &amp; Riset</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Prioritas Agen Cepat</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Dukungan Tim Ahli</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  disabled={isUpgrading}
                  onClick={() => handleSubscribe(selectedPlan)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {isUpgrading ? "Sedang Memproses Aktivasi..." : `Aktifkan ${selectedPlan.replace('_', ' ').toUpperCase()} Sekarang`}
                  </span>
                </button>
                <p className="text-[10px] text-center text-zinc-400 dark:text-zinc-500 mt-2">
                  ⚡ Simulasi pembayaran otomatis aktif seketika tanpa perlu menunggu verifikasi manual.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: SUPABASE */}
          {activeTab === 'supabase' && (
            <div className="space-y-3.5">
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Platform Academic Agent Studio mendukung penyimpanan lokal peramban (browser) dan sinkronisasi otomatis ke database PostgreSQL Supabase Anda.
              </p>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="url"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Supabase Anon / Public API Key
                </label>
                <input
                  type="password"
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 font-mono"
                />
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${
                    testResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                  }`}
                >
                  {testResult.success ? (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-semibold">{testResult.success ? 'Koneksi Berhasil' : 'Koneksi Bermasalah'}</span>
                    <p className="mt-0.5 text-[11px] leading-relaxed opacity-90">{testResult.message}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSaveSupabaseConfig}
                  disabled={isTesting}
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
                  <span>Simpan &amp; Uji Koneksi</span>
                </button>

                <button
                  type="button"
                  onClick={copySqlToClipboard}
                  className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Tersalin' : 'Salin Skema SQL'}</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
