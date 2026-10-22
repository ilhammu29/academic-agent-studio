'use client';

import React, { useState } from 'react';
import { X, KeyRound, Database, User, Building, Mail, Check, Copy, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
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

  const setPresetProfile = (presetRole: UserProfile['role'], pName: string, pInst: string, pEmail: string) => {
    setRole(presetRole);
    setName(pName);
    setInstitution(pInst);
    setEmail(pEmail);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-zinc-900 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">Profil & Database Supabase</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Kelola identitas pengusul & sinkronisasi database cloud</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded hover:bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-900 bg-zinc-950 px-5 pt-1 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`pb-2.5 px-2 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'login'
                ? 'border-zinc-100 text-zinc-100 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Profil Pengusul</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`pb-2.5 px-2 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'register'
                ? 'border-zinc-100 text-zinc-100 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Akun Baru</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('supabase')}
            className={`pb-2.5 px-2 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'supabase'
                ? 'border-zinc-100 text-zinc-100 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Koneksi Supabase</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Email Akademik</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama.peneliti@universitas.ac.id"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Peran Akademik</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserProfile['role'])}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-500"
                >
                  <option value="Mahasiswa">Mahasiswa (Penyusun Proposal Magang / Skripsi)</option>
                  <option value="Dosen Pembimbing">Dosen Pembimbing Akademik / Promotor</option>
                  <option value="Reviewer Industri">Reviewer Industri / Mentor Lapangan</option>
                  <option value="Peneliti">Peneliti Utama / Peneliti Mandiri</option>
                </select>
              </div>

              {/* Quick Preset Selector */}
              <div className="pt-2">
                <span className="text-[11px] text-zinc-500 block mb-1.5">Preset Cepat:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPresetProfile('Mahasiswa', 'Muhammad Ilham', 'Universitas Sebelas Maret (UNS)', 'ilham.akademik@student.uns.ac.id')}
                    className="text-left p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 hover:border-zinc-600 text-xs transition-colors cursor-pointer"
                  >
                    <div className="font-medium text-zinc-200">Muhammad Ilham</div>
                    <div className="text-zinc-500 text-[11px]">Mahasiswa Informatika</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPresetProfile('Dosen Pembimbing', 'Dr. Eng. Ir. Hendra S., M.T.', 'Institut Teknologi Bandung (ITB)', 'hendra.dosen@itb.ac.id')}
                    className="text-left p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 hover:border-zinc-600 text-xs transition-colors cursor-pointer"
                  >
                    <div className="font-medium text-zinc-200">Dr. Eng. Hendra</div>
                    <div className="text-zinc-500 text-[11px]">Dosen & Reviewer</div>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-2.5 rounded-lg bg-zinc-100 hover:bg-white text-black font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {authSuccess ? (
                  <>
                    <Check className="w-4 h-4" /> Berhasil Tersimpan
                  </>
                ) : (
                  <>
                    Simpan Profil & Lanjutkan <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {activeTab === 'register' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Nama Lengkap & Gelar</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Muhammad Ilham, S.Kom."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Institusi / Perguruan Tinggi</label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="Contoh: Universitas Gadjah Mada / PT Telkom"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@institusi.ac.id"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Peran</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserProfile['role'])}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-500"
                >
                  <option value="Mahasiswa">Mahasiswa</option>
                  <option value="Dosen Pembimbing">Dosen Pembimbing</option>
                  <option value="Reviewer Industri">Reviewer Industri</option>
                  <option value="Peneliti">Peneliti Mandiri</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-2.5 rounded-lg bg-zinc-100 hover:bg-white text-black font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                Daftar & Masuk Studio <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {activeTab === 'supabase' && (
            <div className="space-y-3.5">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Aplikasi ini mendukung penyimpanan lokal browser dan sinkronisasi otomatis ke proyek remote Supabase PostgreSQL Anda.
              </p>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Supabase Project URL</label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 font-mono placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Supabase Anon Key</label>
                <input
                  type="password"
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 font-mono placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSaveSupabaseConfig}
                  disabled={isTesting}
                  className="flex-1 py-2 rounded-lg bg-zinc-100 hover:bg-white text-black font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Menguji Koneksi...
                    </>
                  ) : (
                    <>
                      <Database className="w-3.5 h-3.5" /> Uji & Simpan Koneksi
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={copySqlToClipboard}
                  className="py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Salin skrip pembuatan tabel SQL"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-zinc-100" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Disalin' : 'Salin SQL'}</span>
                </button>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                    testResult.success
                      ? 'bg-zinc-900 border-zinc-700 text-zinc-200'
                      : 'bg-red-950/40 border-red-900 text-red-300'
                  }`}
                >
                  {testResult.success ? (
                    <Check className="w-4 h-4 text-zinc-100 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              {/* SQL Snippet */}
              <div className="border border-zinc-900 rounded-lg p-3 bg-zinc-950">
                <div className="text-[11px] text-zinc-500 mb-1 flex items-center justify-between">
                  <span>Skema Tabel SQL (PostgreSQL):</span>
                </div>
                <pre className="text-[10px] font-mono text-zinc-400 max-h-20 overflow-y-auto bg-black p-2 rounded border border-zinc-900">
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
