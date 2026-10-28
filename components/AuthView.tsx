'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Crown, 
  Sparkles, 
  Check, 
  ArrowRight, 
  Lock, 
  Mail, 
  User, 
  Building, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowLeft, 
  Zap, 
  AlertCircle 
} from 'lucide-react';
import { 
  UserProfile, 
  loginUser, 
  registerUser, 
  SUPERADMIN_USER 
} from '@/lib/supabase';
import { UserRole } from '@/types/studio';

interface AuthViewProps {
  initialMode?: 'login' | 'register';
  redirectUrl?: string;
  onSuccess?: (user: UserProfile) => void;
}

export default function AuthView({ 
  initialMode = 'login',
  redirectUrl = '/',
  onSuccess 
}: AuthViewProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('Universitas Negeri Padang (UNP)');
  const [role, setRole] = useState<UserRole>('Mahasiswa');
  const [showPassword, setShowPassword] = useState(false);

  // Status & Feedback
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setErrorMsg('');
    setSuccessMsg('');
  }, [initialMode]);

  const handleCompleteAuth = (user: UserProfile, message: string) => {
    setSuccessMsg(message);
    setErrorMsg('');
    setIsLoading(false);

    if (onSuccess) {
      onSuccess(user);
    }

    setTimeout(() => {
      // Redirect to studio or designated target
      if (typeof window !== 'undefined') {
        window.location.href = redirectUrl;
      } else {
        router.push(redirectUrl);
      }
    }, 600);
  };

  // Submit Handler untuk Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    const res = loginUser(email, password);
    if (!res.success || !res.user) {
      setIsLoading(false);
      setErrorMsg(res.message || 'Login gagal. Silakan periksa kembali email dan kata sandi Anda.');
      return;
    }

    handleCompleteAuth(res.user, res.message || 'Berhasil masuk ke akun Anda.');
  };

  // Submit Handler untuk Registrasi
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    const res = registerUser({
      name,
      email,
      password,
      institution,
      role
    });

    if (!res.success || !res.user) {
      setIsLoading(false);
      setErrorMsg(res.message || 'Pendaftaran gagal. Silakan periksa kembali data yang Anda masukkan.');
      return;
    }

    handleCompleteAuth(res.user, res.message || 'Pendaftaran berhasil!');
  };

  // 1-Klik Masuk Superadmin
  const handleOneClickSuperadmin = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    const res = loginUser(SUPERADMIN_USER.email, 'superadmin123');
    if (res.user) {
      handleCompleteAuth(res.user, 'Berhasil masuk sebagai Superadmin.');
    } else {
      setIsLoading(false);
      setErrorMsg('Gagal masuk sebagai superadmin.');
    }
  };

  // Pre-fill formulir dengan kredensial Superadmin
  const handlePreFillSuperadmin = () => {
    setEmail(SUPERADMIN_USER.email);
    setPassword('superadmin123');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen w-full bg-[#08090D] text-[#F8FAFC] flex flex-col justify-between selection:bg-blue-600/30 selection:text-white">
      {/* Background Decorative Ambient Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -left-[10%] top-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-[#3B82F6]/10 via-[#6366F1]/5 to-transparent blur-[140px]" />
        <div className="absolute -right-[10%] bottom-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-bl from-[#8B5CF6]/10 via-[#C084FC]/5 to-transparent blur-[140px]" />
      </div>

      {/* Top Navigation Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 h-20 flex items-center justify-between">
        <Link 
          href="/" 
          className="flex items-center gap-3 group cursor-pointer"
        >
          <div className="w-8 h-8 flex items-center justify-center text-white shrink-0 group-hover:rotate-45 transition-transform duration-300">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
            </svg>
          </div>
          <span className="font-bold text-lg sm:text-xl tracking-tight text-white lowercase">
            academic agent studio
          </span>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors py-2 px-3.5 rounded-full border border-white/10 hover:border-white/20 bg-white/5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda</span>
        </Link>
      </header>

      {/* Main Auth Content Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-md">

          {/* Mode Switcher Tabs */}
          <div className="p-1.5 rounded-2xl bg-zinc-900/90 border border-white/10 flex items-center mb-6 shadow-xl backdrop-blur-md">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                mode === 'login'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Masuk (Login)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                mode === 'register'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Daftar Akun Baru</span>
            </button>
          </div>

          {/* Card Body */}
          <div className="rounded-3xl bg-[#0F131D]/90 border border-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">

            {/* Error & Success Alerts */}
            {errorMsg && (
              <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-3 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <div className="leading-relaxed">{errorMsg}</div>
              </div>
            )}

            {successMsg && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-3 animate-in fade-in duration-200">
                <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <div className="leading-relaxed">{successMsg}</div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 1. LOGIN FORM                                                             */}
            {/* ========================================================================= */}
            {mode === 'login' && (
              <div>
                <div className="mb-6">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    Masuk ke Akun Anda
                  </h1>
                  <p className="text-xs text-zinc-400 mt-1">
                    Lanjutkan penyusunan proposal, skripsi, dan naskah riset akademik Anda.
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Email / Username */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Email atau Username
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="contoh: nama@unp.ac.id atau superadmin@academic.id"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-900/80 border border-white/10 text-xs sm:text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-zinc-300">
                        Kata Sandi
                      </label>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Masukkan kata sandi Anda..."
                        className="w-full pl-10 pr-10 py-3 rounded-xl bg-zinc-900/80 border border-white/10 text-xs sm:text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>{isLoading ? 'Memproses Masuk...' : 'Masuk ke Studio Workspace'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>

                {/* ========================================================================= */}
                {/* AKUN KHUSUS SUPERADMIN CARD (TERINTEGRASI DI HALAMAN LOGIN)                */}
                {/* ========================================================================= */}
                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                          <Crown className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-amber-300">
                          Akun Khusus Superadmin
                        </span>
                      </div>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Full Access
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-300 leading-relaxed mb-3">
                      Gunakan akun superadmin untuk mengelola verifikasi QRIS dan kuota tanpa batas.
                    </p>

                    <div className="bg-black/40 rounded-xl p-2.5 text-[11px] font-mono text-zinc-300 mb-3 space-y-1 border border-white/5">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Email:</span>
                        <span className="text-amber-200">superadmin@academic.id</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Sandi:</span>
                        <span className="text-amber-200">superadmin123</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleOneClickSuperadmin}
                        disabled={isLoading}
                        className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Crown className="w-3.5 h-3.5" />
                        <span>1-Klik Masuk Superadmin</span>
                      </button>
                      <button
                        type="button"
                        onClick={handlePreFillSuperadmin}
                        className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-300 font-semibold text-xs border border-white/10 transition-colors cursor-pointer"
                        title="Isi form dengan kredensial superadmin"
                      >
                        Isi Form
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer Switcher */}
                <div className="mt-6 text-center">
                  <p className="text-xs text-zinc-400">
                    Belum memiliki akun?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('register');
                        setErrorMsg('');
                        setSuccessMsg('');
                      }}
                      className="text-blue-400 hover:text-blue-300 font-semibold transition-colors cursor-pointer"
                    >
                      Daftar gratis di sini (3x Kuota Trial)
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 2. REGISTER FORM                                                          */}
            {/* ========================================================================= */}
            {mode === 'register' && (
              <div>
                <div className="mb-6">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    Daftar Akun Baru
                  </h1>
                  <p className="text-xs text-zinc-400 mt-1">
                    Dapatkan akses langsung ke 12 Autonomous Agents &amp; 3x kuota trial gratis.
                  </p>
                </div>

                {/* Welcome Perks Banner */}
                <div className="mb-5 p-3 rounded-2xl bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/20 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="text-[11px] text-zinc-300">
                    <strong className="text-white block font-semibold">Gratis 3x Generate Bab Penuh</strong>
                    Termasuk ekspor DOCX terstandar Dikti &amp; FT UNP 2025.
                  </div>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Nama Lengkap &amp; Gelar
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Contoh: Budi Santoso, S.T."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/80 border border-white/10 text-xs sm:text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Alamat Email (Kampus / Pribadi)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Contoh: budi.santoso@mhs.unp.ac.id"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/80 border border-white/10 text-xs sm:text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Kata Sandi (Minimal 6 karakter)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimal 6 karakter..."
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-900/80 border border-white/10 text-xs sm:text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Campus / Institution */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Perguruan Tinggi / Instansi
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="Contoh: Universitas Negeri Padang (UNP)"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/80 border border-white/10 text-xs sm:text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Role Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Peran Akademik Anda
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/80 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="Mahasiswa">Mahasiswa (Skripsi / Tesis / PKL)</option>
                      <option value="Dosen Pembimbing">Dosen Pembimbing / Akademisi</option>
                      <option value="Peneliti">Peneliti / Penulis Jurnal</option>
                      <option value="Reviewer Industri">Reviewer Industri / Mitra</option>
                      <option value="Umum">Umum / Profesional</option>
                    </select>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>{isLoading ? 'Mendaftarkan Akun...' : 'Daftar Sekarang & Masuk ke Studio'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>

                {/* Footer Switcher */}
                <div className="mt-6 text-center">
                  <p className="text-xs text-zinc-400">
                    Sudah memiliki akun?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setErrorMsg('');
                        setSuccessMsg('');
                      }}
                      className="text-blue-400 hover:text-blue-300 font-semibold transition-colors cursor-pointer"
                    >
                      Masuk di sini
                    </button>
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-zinc-600 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>academic agent studio • platform multi-agen akademik otonom</span>
          <span>powered by oxidlabs</span>
        </div>
      </footer>
    </div>
  );
}
