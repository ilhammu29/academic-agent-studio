'use client';

import React, { useState } from 'react';
import { X, KeyRound, Database, User, Building, Mail, ShieldCheck, Check, Copy, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { UserProfile, testSupabaseConnection, SUPABASE_SQL_MIGRATION } from '@/lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
}

export default function AuthModal({ isOpen, onClose, currentUser, onUpdateUser }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'supabase'>('login');

  // Login / Register state
  const [email, setEmail] = useState(currentUser.email);
  const [password, setPassword] = useState('••••••••');
  const [name, setName] = useState(currentUser.name);
  const [institution, setInstitution] = useState(currentUser.institution);
  const [role, setRole] = useState<UserProfile['role']>(currentUser.role);
  const [authSuccess, setAuthSuccess] = useState(false);

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

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...currentUser,
      email,
      name: name || email.split('@')[0],
      institution: institution || 'Universitas Sebelas Maret (UNS)',
      role
    };
    onUpdateUser(updated);
    setAuthSuccess(true);
    setTimeout(() => {
      setAuthSuccess(false);
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

  // Quick Preset Roles
  const setPresetProfile = (presetRole: UserProfile['role'], pName: string, pInst: string, pEmail: string) => {
    setRole(presetRole);
    setName(pName);
    setInstitution(pInst);
    setEmail(pEmail);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#0D121C] border border-[#1E2738] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#1A2333] flex items-center justify-between bg-[#0A0E17]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-milk-white">Autentikasi & Database Supabase</h3>
              <p className="text-[11px] text-milk-muted">Kelola profil peneliti & sinkronisasi cloud real-time</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#141A26] hover:bg-[#1E2638] text-milk-muted hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#1A2333] bg-[#090D15] px-6 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('login')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'login'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-milk-muted hover:text-milk-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Masuk / Ganti Profil</span>
          </button>

          <button
            onClick={() => setActiveTab('register')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'register'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-milk-muted hover:text-milk-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Daftar Akun Baru</span>
          </button>

          <button
            onClick={() => setActiveTab('supabase')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'supabase'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-milk-muted hover:text-milk-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Koneksi Supabase DB</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-milk-soft mb-1.5">Alamat Email Akademik</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-milk-dim" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama.peneliti@universitas.ac.id"
                    className="w-full bg-[#121824] border border-[#212C3F] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-milk-dim focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-milk-soft mb-1.5">Kata Sandi</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-milk-dim" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#121824] border border-[#212C3F] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-milk-dim focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-milk-soft mb-1.5">Peran Akademik</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserProfile['role'])}
                  className="w-full bg-[#121824] border border-[#212C3F] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Mahasiswa">Mahasiswa (Penyusun Proposal Magang / Skripsi)</option>
                  <option value="Dosen Pembimbing">Dosen Pembimbing Akademik / Promotor</option>
                  <option value="Reviewer Industri">Reviewer Mitra Industri / Mentor Perusahaan</option>
                  <option value="Peneliti">Peneliti Utama / Principal Investigator</option>
                </select>
              </div>

              {/* Quick Preset Selector */}
              <div className="pt-2">
                <span className="text-[11px] text-milk-dim block mb-2">Preset Akun Cepat (Uji Fitur):</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPresetProfile('Mahasiswa', 'Muhammad Ilham', 'Universitas Sebelas Maret (UNS)', 'ilham.akademik@student.uns.ac.id')}
                    className="text-left p-2 rounded-lg bg-[#111723] border border-[#1D2739] hover:border-sky-500/50 text-[11px] transition-all cursor-pointer"
                  >
                    <div className="font-semibold text-milk-white">Muhammad Ilham</div>
                    <div className="text-milk-dim text-[10px]">Mahasiswa Teknik Informatika</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPresetProfile('Dosen Pembimbing', 'Dr. Eng. Ir. Hendra S., M.T.', 'Institut Teknologi Bandung (ITB)', 'hendra.dosen@itb.ac.id')}
                    className="text-left p-2 rounded-lg bg-[#111723] border border-[#1D2739] hover:border-sky-500/50 text-[11px] transition-all cursor-pointer"
                  >
                    <div className="font-semibold text-milk-white">Dr. Eng. Hendra</div>
                    <div className="text-milk-dim text-[10px]">Dosen & Reviewer Riset</div>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs transition-all shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                {authSuccess ? (
                  <>
                    <Check className="w-4 h-4" /> Berhasil Masuk!
                  </>
                ) : (
                  <>
                    Masuk ke Workspace <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {activeTab === 'register' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-milk-soft mb-1.5">Nama Lengkap & Gelar</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-milk-dim" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Muhammad Ilham, S.Kom."
                    className="w-full bg-[#121824] border border-[#212C3F] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-milk-dim focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-milk-soft mb-1.5">Institusi / Perguruan Tinggi</label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 w-4 h-4 text-milk-dim" />
                  <input
                    type="text"
                    required
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="Contoh: Universitas Gadjah Mada / PT Telkom"
                    className="w-full bg-[#121824] border border-[#212C3F] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-milk-dim focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-milk-soft mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@institusi.ac.id"
                  className="w-full bg-[#121824] border border-[#212C3F] rounded-lg px-3 py-2 text-xs text-white placeholder-milk-dim focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-milk-soft mb-1.5">Peran</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserProfile['role'])}
                  className="w-full bg-[#121824] border border-[#212C3F] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Mahasiswa">Mahasiswa</option>
                  <option value="Dosen Pembimbing">Dosen Pembimbing</option>
                  <option value="Reviewer Industri">Reviewer Industri</option>
                  <option value="Peneliti">Peneliti Mandiri</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs transition-all shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                Daftar & Masuk Studio <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {activeTab === 'supabase' && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-sky-950/30 border border-sky-800/40 text-xs text-milk-soft flex items-start gap-2.5">
                <Database className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-sky-300">Integrasi Supabase Cloud Database:</span>
                  <p className="text-[11px] text-milk-muted mt-0.5 leading-relaxed">
                    Aplikasi ini dapat langsung berjalan dengan database lokal browser (LocalStorage / Cache), atau disinkronkan secara langsung dengan proyek Supabase remote Anda untuk penyimpanan dokumen permanen.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-milk-soft mb-1.5">Supabase Project URL</label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full bg-[#121824] border border-[#212C3F] rounded-lg px-3 py-2 text-xs text-white font-mono placeholder-milk-dim focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-milk-soft mb-1.5">Supabase Anon Public API Key</label>
                <input
                  type="password"
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  className="w-full bg-[#121824] border border-[#212C3F] rounded-lg px-3 py-2 text-xs text-white font-mono placeholder-milk-dim focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSaveSupabaseConfig}
                  disabled={isTesting}
                  className="flex-1 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Menguji Koneksi...
                    </>
                  ) : (
                    <>
                      <Database className="w-3.5 h-3.5" /> Simpan & Uji Koneksi
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={copySqlToClipboard}
                  className="py-2 px-3 rounded-lg bg-[#141A26] hover:bg-[#1E2638] text-milk-white border border-[#232D40] text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Salin skrip pembuatan tabel SQL"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Disalin!' : 'Salin SQL Schema'}</span>
                </button>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                    testResult.success
                      ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                      : 'bg-red-950/30 border-red-800/40 text-red-300'
                  }`}
                >
                  {testResult.success ? (
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              {/* SQL Snippet Collapsible info */}
              <div className="border border-[#1E2738] rounded-lg p-3 bg-[#0A0E17]">
                <div className="text-[11px] font-mono text-milk-muted mb-1 flex items-center justify-between">
                  <span>Skema Tabel Supabase (SQL)</span>
                  <span className="text-[10px] text-sky-400">PostgreSQL / Supabase</span>
                </div>
                <pre className="text-[10px] font-mono text-milk-dim max-h-24 overflow-y-auto bg-[#07090E] p-2 rounded border border-[#161F2E]">
                  {SUPABASE_SQL_MIGRATION}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
