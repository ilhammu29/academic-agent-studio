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
  GraduationCap, 
  ChevronDown, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  Zap, 
  AlertCircle,
  FileText,
  Laptop
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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('Universitas Negeri Padang (UNP)');
  const [role, setRole] = useState<UserRole>('Mahasiswa');
  const [programStudi, setProgramStudi] = useState('Teknik Elektro & Informatika');
  const [rememberMe, setRememberMe] = useState(true);

  // Password Visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    }, 450);
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

    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsLoading(true);

    const res = registerUser({
      name,
      email,
      password,
      institution: institution ? `${institution}${programStudi ? ` - ${programStudi}` : ''}` : 'Universitas Negeri Padang (UNP)',
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

  return (
    <div className="w-full min-h-screen lg:h-screen lg:overflow-hidden bg-white flex flex-col lg:flex-row select-none">

      {/* ========================================================================= */}
      {/* 1. LEFT PANE: BRANDING, HEADLINE, GLOWING 3D RIBBON, & MICRO CARDS        */}
      {/* ========================================================================= */}
      <div className="relative w-full lg:w-5/12 xl:w-[46%] flex flex-col justify-between p-8 sm:p-12 xl:p-16 bg-gradient-to-b from-[#0B101D] via-[#090D18] to-[#070A13] overflow-hidden shrink-0">
        
        {/* Curved 3D Wave Organic Light Ribbons in Bottom-Left */}
        <div className="absolute -left-20 -bottom-20 w-[480px] h-[480px] rounded-full bg-gradient-to-tr from-blue-700/20 via-indigo-600/15 to-purple-600/10 blur-[90px] pointer-events-none" />
        <svg 
          className="absolute -left-12 bottom-0 w-[520px] h-[440px] opacity-40 pointer-events-none"
          viewBox="0 0 520 440" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M-80 440C-30 330 40 220 160 180C280 140 380 210 440 290C500 370 540 440 540 440" 
            stroke="url(#gradient-ribbon-1)" 
            strokeWidth="80" 
            strokeLinecap="round" 
            className="blur-xl"
          />
          <path 
            d="M-40 460C30 350 110 240 220 200C330 160 410 220 470 320" 
            stroke="url(#gradient-ribbon-2)" 
            strokeWidth="38" 
            strokeLinecap="round" 
            className="blur-md"
          />
          <defs>
            <linearGradient id="gradient-ribbon-1" x1="0" y1="200" x2="440" y2="440" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3B82F6" stopOpacity="0.4" />
              <stop offset="0.6" stopColor="#6366F1" stopOpacity="0.3" />
              <stop offset="1" stopColor="#8B5CF6" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="gradient-ribbon-2" x1="50" y1="200" x2="470" y2="400" gradientUnits="userSpaceOnUse">
              <stop stopColor="#60A5FA" stopOpacity="0.6" />
              <stop offset="0.5" stopColor="#818CF8" stopOpacity="0.4" />
              <stop offset="1" stopColor="#A78BFA" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>

        {/* Top Branding */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            {/* 4-Pointed Star Icon */}
            <div className="w-8 h-8 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-base sm:text-lg tracking-tight text-white block lowercase">
                academic agent studio
              </span>
              <span className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase block -mt-0.5">
                v2.5 ANTI-SLOP
              </span>
            </div>
          </Link>
        </div>

        {/* Center Headline & Thesis */}
        <div className="relative z-10 my-auto py-8 sm:py-12 max-w-lg">
          <h1 className="text-3xl sm:text-4xl xl:text-[42px] font-black tracking-tight text-white leading-[1.14] mb-5">
            Riset &amp; penulisan<br />
            naskah akademik,<br />
            <span className="bg-gradient-to-r from-[#60A5FA] via-[#818CF8] to-[#C084FC] bg-clip-text text-transparent">
              presisi tanpa<br />
              kompromi.
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-md">
            Standar format skripsi, tesis, dan proposal penelitian terintegrasi dengan pedoman resmi Dikti &amp; FT UNP 2025.
          </p>
        </div>

        {/* Bottom 3 Micro-Feature Cards */}
        <div className="relative z-10 grid grid-cols-3 gap-2.5 sm:gap-3.5 pt-4">
          <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-2 backdrop-blur-xs">
            <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/25 text-blue-400 flex items-center justify-center shrink-0">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-[11px] font-bold text-white truncate">Template Resmi</div>
              <div className="text-[9px] text-zinc-400 truncate">Dikti &amp; FT UNP 2025</div>
            </div>
          </div>

          <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-2 backdrop-blur-xs">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-[11px] font-bold text-white truncate">AI Assistant</div>
              <div className="text-[9px] text-zinc-400 truncate">Lebih Produktif</div>
            </div>
          </div>

          <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-2 backdrop-blur-xs">
            <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/25 text-purple-400 flex items-center justify-center shrink-0">
              <Laptop className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-[11px] font-bold text-white truncate">Mudah Digunakan</div>
              <div className="text-[9px] text-zinc-400 truncate">Di Semua Perangkat</div>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. RIGHT PANE: FULL-HEIGHT, SPACIOUS, EXPANSIVE FORM PANE                 */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-7/12 xl:w-[54%] flex flex-col justify-between p-6 sm:p-10 lg:p-10 xl:p-14 bg-white overflow-y-auto">
        
        {/* Top Navbar in Form Pane */}
        <div className="w-full max-w-xl mx-auto flex items-center justify-between shrink-0 mb-4 sm:mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 flex items-center justify-center text-[#3B82F6] shrink-0">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-sm sm:text-base tracking-tight text-[#0F172A] block lowercase">
                academic agent studio
              </span>
              <span className="text-[9px] text-slate-400 font-mono tracking-widest uppercase block -mt-0.5">
                v2.5 ANTI-SLOP
              </span>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors py-1.5 px-3 rounded-full border border-slate-200 hover:border-slate-300 bg-slate-50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* Spacious, Expansive Form Container */}
        <div className="w-full max-w-xl mx-auto my-auto py-2 sm:py-4">
          
          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <div className="leading-snug">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
              <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <div className="leading-snug">{successMsg}</div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* A. LOGIN FORM (FULL-WIDTH & SPACIOUS)                                     */}
          {/* ========================================================================= */}
          {mode === 'login' && (
            <div>
              <div className="mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
                  Selamat datang kembali
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
                  Masuk ke akun Anda untuk melanjutkan ke Studio Workspace.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
                {/* Email / Username */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email atau Username
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email atau Username (Contoh: nama@unp.ac.id atau superadmin@academic.id)"
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#3B82F6] focus:bg-white focus:ring-4 focus:ring-blue-500/10 text-xs sm:text-sm text-[#0F172A] placeholder:text-slate-400 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Kata Sandi */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Kata Sandi
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail(SUPERADMIN_USER.email);
                        setPassword('superadmin123');
                      }}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                    >
                      Lupa kata sandi?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi akun Anda..."
                      className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#3B82F6] focus:bg-white focus:ring-4 focus:ring-blue-500/10 text-xs sm:text-sm text-[#0F172A] placeholder:text-slate-400 transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center text-xs">
                  <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-medium">Ingat saya di perangkat ini</span>
                  </label>
                </div>

                {/* Primary Button Masuk */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer pt-2"
                >
                  <span>{isLoading ? 'Memproses Masuk...' : 'Masuk ke Studio Workspace'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Divider "atau" */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-4 text-slate-400 font-medium">atau</span>
                </div>
              </div>

              {/* Secondary Button: Masuk dengan Superadmin */}
              <button
                type="button"
                onClick={handleOneClickSuperadmin}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-2xl border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Zap className="w-4 h-4 text-blue-600" />
                <span>Masuk dengan Superadmin (1-Klik Full Access)</span>
              </button>

              {/* Bottom Switcher */}
              <div className="mt-8 text-center">
                <p className="text-xs sm:text-sm text-slate-500">
                  Belum memiliki akun?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className="text-blue-600 hover:text-blue-700 font-bold transition-colors cursor-pointer"
                  >
                    Daftar di sini
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* B. REGISTER FORM (FULL-WIDTH & SPACIOUS)                                  */}
          {/* ========================================================================= */}
          {mode === 'register' && (
            <div>
              <div className="mb-5 sm:mb-6">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
                  Buat akun baru
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Daftar untuk mulai menggunakan semua fitur multi-agen akademik (Gratis 3x Kuota Penuh).
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-3.5 sm:space-y-4">
                {/* 1. Nama Lengkap */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap &amp; Gelar
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Contoh: Budi Santoso, S.T."
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#3B82F6] focus:bg-white focus:ring-4 focus:ring-blue-500/10 text-xs sm:text-sm text-[#0F172A] placeholder:text-slate-400 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* 2. Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Alamat Email (Kampus / Pribadi)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Contoh: nama@mhs.unp.ac.id"
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#3B82F6] focus:bg-white focus:ring-4 focus:ring-blue-500/10 text-xs sm:text-sm text-[#0F172A] placeholder:text-slate-400 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* 3. Kata Sandi & Konfirmasi (Spacious Grid on Larger Screens) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Kata Sandi (Min. 6)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Kata sandi..."
                        className="w-full pl-11 pr-11 py-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#3B82F6] focus:bg-white focus:ring-4 focus:ring-blue-500/10 text-xs sm:text-sm text-[#0F172A] placeholder:text-slate-400 transition-all outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Konfirmasi Kata Sandi
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi sandi..."
                        className="w-full pl-11 pr-11 py-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#3B82F6] focus:bg-white focus:ring-4 focus:ring-blue-500/10 text-xs sm:text-sm text-[#0F172A] placeholder:text-slate-400 transition-all outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. Perguruan Tinggi / Instansi */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Perguruan Tinggi / Instansi
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className="w-full pl-11 pr-10 py-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#3B82F6] focus:bg-white focus:ring-4 focus:ring-blue-500/10 text-xs sm:text-sm text-[#0F172A] transition-all outline-none appearance-none cursor-pointer font-medium"
                    >
                      <option value="Universitas Negeri Padang (UNP)">Universitas Negeri Padang (UNP)</option>
                      <option value="Universitas Indonesia (UI)">Universitas Indonesia (UI)</option>
                      <option value="Institut Teknologi Bandung (ITB)">Institut Teknologi Bandung (ITB)</option>
                      <option value="Universitas Gadjah Mada (UGM)">Universitas Gadjah Mada (UGM)</option>
                      <option value="Institut Teknologi Sepuluh Nopember (ITS)">Institut Teknologi Sepuluh Nopember (ITS)</option>
                      <option value="Universitas Andalas (UNAND)">Universitas Andalas (UNAND)</option>
                      <option value="Universitas Lainnya / Instansi Mandiri">Universitas Lainnya / Instansi Mandiri</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 5. Program Studi / Peran */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Peran &amp; Jenjang Akademik
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full pl-11 pr-10 py-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#3B82F6] focus:bg-white focus:ring-4 focus:ring-blue-500/10 text-xs sm:text-sm text-[#0F172A] transition-all outline-none appearance-none cursor-pointer font-medium"
                    >
                      <option value="Mahasiswa">Mahasiswa (Skripsi / Tesis / PKL)</option>
                      <option value="Dosen Pembimbing">Dosen Pembimbing / Reviewer</option>
                      <option value="Peneliti">Peneliti / Penulis Jurnal</option>
                      <option value="Reviewer Industri">Reviewer Industri / Magang</option>
                      <option value="Umum">Umum / Penulis Akademik</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>{isLoading ? 'Mendaftarkan Akun...' : 'Daftar Sekarang & Masuk ke Studio'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Bottom Switcher */}
              <div className="mt-6 text-center">
                <p className="text-xs sm:text-sm text-slate-500">
                  Sudah memiliki akun?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className="text-blue-600 hover:text-blue-700 font-bold transition-colors cursor-pointer"
                  >
                    Masuk di sini
                  </button>
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Sub-Footer in Form Pane */}
        <div className="w-full max-w-xl mx-auto text-center text-xs text-slate-400 shrink-0 pt-4 border-t border-slate-100">
          <span>academic agent studio &bull; platform multi-agen akademik otonom &bull; powered by oxidlabs</span>
        </div>

      </div>

    </div>
  );
}
