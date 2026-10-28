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
  ArrowLeft, 
  Zap, 
  AlertCircle,
  FileCheck2,
  GraduationCap,
  BookOpenCheck
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
      if (typeof window !== 'undefined') {
        window.location.href = redirectUrl;
      } else {
        router.push(redirectUrl);
      }
    }, 500);
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
      setErrorMsg(res.message || 'Login gagal. Periksa kembali email dan kata sandi Anda.');
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
      setErrorMsg(res.message || 'Pendaftaran gagal. Periksa kembali kelengkapan data.');
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
    <div className="w-full h-screen min-h-screen lg:h-screen lg:overflow-hidden bg-[#07090E] text-[#F8FAFC] flex flex-col lg:flex-row select-none">

      {/* ========================================================================= */}
      {/* LEFT PANE: BRAND SHOWCASE & FEATURE SPOTLIGHT (DESKTOP)                   */}
      {/* ========================================================================= */}
      <div className="relative hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between p-10 xl:p-14 bg-gradient-to-b from-[#0B0F19] via-[#080B13] to-[#05070B] border-r border-white/10 overflow-hidden">
        {/* Subtle Background Glow Orbs */}
        <div className="absolute -left-20 -top-20 w-96 h-96 rounded-full bg-blue-600/15 blur-[120px] pointer-events-none" />
        <div className="absolute right-0 bottom-10 w-96 h-96 rounded-full bg-purple-600/10 blur-[130px] pointer-events-none" />
        
        {/* Subtle Mathematical Drafting Grid Lines */}
        <div 
          className="absolute inset-0 opacity-[0.04] pointer-events-none" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Top Header Branding */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-all">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block lowercase">
                academic agent studio
              </span>
              <span className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase">
                v2.5 Anti-Slop
              </span>
            </div>
          </Link>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            12 Agents Ready
          </span>
        </div>

        {/* Center Editorial Showcase */}
        <div className="relative z-10 my-auto py-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Academic Multi-Agent Engine</span>
          </div>

          <h1 className="text-3xl xl:text-4xl font-black tracking-tight text-white leading-[1.18] mb-4">
            Riset &amp; penulisan naskah akademik,{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              presisi tanpa kompromi.
            </span>
          </h1>

          <p className="text-sm text-zinc-400 leading-relaxed mb-8">
            Standar format skripsi, tesis, dan proposal penelitian terintegrasi dengan pedoman resmi Dikti &amp; FT UNP 2025.
          </p>

          {/* Value Highlights Cards */}
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3.5 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white">Ekspor DOCX &amp; PPTX 100% Terstandar</h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">Lengkap dengan cover, bab naskah, daftar pustaka APA/IEEE, dan slide sidang 16:9.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3.5 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
                <BookOpenCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white">Verifikasi Sumber &amp; DOI Otentik</h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">Audit silang ke Crossref dan Semantic Scholar, bebas sitasi halusinasi AI.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3.5 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white">Simulasi Sidang &amp; Klinik Bimbingan</h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">Latihan tanya jawab berbasis pertanyaan kritis penguji akademik.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Showcase Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-zinc-500 pt-4 border-t border-white/10">
          <span>&copy; 2026 Academic Agent Studio</span>
          <span className="font-medium text-zinc-400">powered by oxidlabs</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT PANE: MODERN COMPACT AUTHENTICATION FORM                            */}
      {/* ========================================================================= */}
      <div className="flex-1 h-full flex flex-col justify-between p-6 sm:p-10 lg:p-8 xl:p-12 overflow-y-auto bg-[#07090E]">
        
        {/* Top Navbar in Form Pane */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto mb-4 shrink-0">
          {/* Mobile Only Logo */}
          <Link href="/" className="lg:hidden flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
              </svg>
            </div>
            <span className="font-bold text-sm tracking-tight text-white lowercase">
              academic agent studio
            </span>
          </Link>

          <Link
            href="/"
            className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors py-1.5 px-3 rounded-full border border-white/10 hover:border-white/20 bg-white/[0.04]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* Centered Form Wrapper: Perfectly Height-Calibrated to Never Cut Off */}
        <div className="w-full max-w-md mx-auto my-auto py-2">
          
          {/* Pill Tabs Switcher (Masuk / Daftar) */}
          <div className="p-1 rounded-xl bg-zinc-900/90 border border-white/10 flex items-center mb-5 shadow-lg backdrop-blur-md">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Masuk (Login)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Daftar Akun Baru</span>
            </button>
          </div>

          {/* Form Card Container */}
          <div className="rounded-2xl bg-[#0D111A]/95 border border-white/10 p-5 sm:p-6 shadow-2xl backdrop-blur-xl">

            {/* Error & Success Feedback Banners */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <div className="leading-snug">{errorMsg}</div>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <div className="leading-snug">{successMsg}</div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 1. LOGIN FORM                                                             */}
            {/* ========================================================================= */}
            {mode === 'login' && (
              <div>
                <div className="mb-4">
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                    Masuk ke Akun Anda
                  </h2>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Gunakan email akun Anda atau akses khusus superadmin di bawah.
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-3.5">
                  {/* Email / Username */}
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                      Email atau Username
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@unp.ac.id atau superadmin@academic.id"
                        className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-zinc-900/90 border border-white/10 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                      Kata Sandi
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Masukkan kata sandi..."
                        className="w-full pl-9 pr-9 py-2.5 rounded-lg bg-zinc-900/90 border border-white/10 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>{isLoading ? 'Memproses Masuk...' : 'Masuk ke Studio Workspace'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>

                {/* ========================================================================= */}
                {/* AKUN KHUSUS SUPERADMIN CARD (COMPACT & MODERN)                            */}
                {/* ========================================================================= */}
                <div className="mt-5 pt-4 border-t border-white/10">
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 relative">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[11px] font-bold text-amber-300">
                          Akun Khusus Superadmin
                        </span>
                      </div>
                      <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                        Full Access
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-300 bg-black/40 rounded-lg px-2.5 py-1.5 mb-2 border border-white/5">
                      <span><span className="text-zinc-500">Email:</span> superadmin@academic.id</span>
                      <span><span className="text-zinc-500">Pass:</span> superadmin123</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleOneClickSuperadmin}
                        disabled={isLoading}
                        className="flex-1 py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-[11px] shadow-sm flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        <Crown className="w-3 h-3" />
                        <span>1-Klik Masuk Superadmin</span>
                      </button>
                      <button
                        type="button"
                        onClick={handlePreFillSuperadmin}
                        className="py-1.5 px-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-zinc-300 font-medium text-[11px] border border-white/10 transition-colors cursor-pointer"
                      >
                        Isi Form
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer Switcher */}
                <div className="mt-4 text-center">
                  <p className="text-[11px] text-zinc-400">
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
                      Daftar gratis (3x Kuota Trial) &rarr;
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
                <div className="mb-3">
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                    Daftar Akun Baru
                  </h2>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Dapatkan akses langsung ke 12 Autonomous Agents &amp; 3x trial gratis.
                  </p>
                </div>

                {/* Welcome Perks Banner (Compact) */}
                <div className="mb-3.5 p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <div className="text-[10px] text-zinc-300 leading-tight">
                    <strong className="text-white font-semibold">Gratis 3x Generate Bab Lengkap: </strong>
                    Termasuk ekspor DOCX terstandar Dikti &amp; FT UNP 2025.
                  </div>
                </div>

                <form onSubmit={handleRegister} className="space-y-3">
                  {/* Grid 2-Kolom: Nama Lengkap & Peran */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-300 mb-1">
                        Nama Lengkap &amp; Gelar
                      </label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Budi Santoso, S.T."
                          className="w-full pl-8 pr-2.5 py-2 rounded-lg bg-zinc-900/90 border border-white/10 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-300 mb-1">
                        Peran Akademik
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as UserRole)}
                        className="w-full px-2.5 py-2 rounded-lg bg-zinc-900/90 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500 transition-all"
                      >
                        <option value="Mahasiswa">Mahasiswa</option>
                        <option value="Dosen Pembimbing">Dosen Pembimbing</option>
                        <option value="Peneliti">Peneliti</option>
                        <option value="Reviewer Industri">Reviewer Industri</option>
                        <option value="Umum">Umum</option>
                      </select>
                    </div>
                  </div>

                  {/* Grid 2-Kolom: Email & Kata Sandi */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-300 mb-1">
                        Alamat Email
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="nama@kampus.ac.id"
                          className="w-full pl-8 pr-2.5 py-2 rounded-lg bg-zinc-900/90 border border-white/10 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-300 mb-1">
                        Kata Sandi (Min. 6)
                      </label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Kata sandi..."
                          className="w-full pl-8 pr-8 py-2 rounded-lg bg-zinc-900/90 border border-white/10 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Perguruan Tinggi / Instansi */}
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-300 mb-1">
                      Perguruan Tinggi / Instansi
                    </label>
                    <div className="relative">
                      <Building className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="Universitas Negeri Padang (UNP)"
                        className="w-full pl-8 pr-2.5 py-2 rounded-lg bg-zinc-900/90 border border-white/10 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-1.5">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>{isLoading ? 'Mendaftarkan Akun...' : 'Daftar Sekarang & Masuk ke Studio'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>

                {/* Footer Switcher */}
                <div className="mt-3.5 text-center">
                  <p className="text-[11px] text-zinc-400">
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
                      Masuk di sini &rarr;
                    </button>
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Bottom Sub-Footer in Form Pane */}
        <div className="w-full max-w-md mx-auto text-center text-[10px] text-zinc-600 shrink-0 pt-2">
          <span>academic agent studio &bull; powered by oxidlabs</span>
        </div>

      </div>

    </div>
  );
}
