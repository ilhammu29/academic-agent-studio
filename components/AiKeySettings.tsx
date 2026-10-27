"use client";
import React, { useEffect, useState } from "react";
import { getSessionAiKey, setSessionAiKey } from "@/lib/aiClient";

export function AiKeySettings() {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState("");
  const [configured, setConfigured] = useState(false);
  const [localConfigured, setLocalConfigured] = useState(false);
  useEffect(() => { const update = () => setConfigured(Boolean(getSessionAiKey())); update(); window.addEventListener('academic-ai-key-changed', update); return () => window.removeEventListener('academic-ai-key-changed', update); }, []);
  useEffect(() => { fetch('/api/ai-status').then(res => res.json()).then(data => setLocalConfigured(Boolean(data.localDevConfigured))).catch(() => setLocalConfigured(false)); }, []);
  return <div className="fixed bottom-4 right-4 z-[100]">
    {open && <div role="dialog" aria-label="Pengaturan AI" className="mb-2 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-slate-300 bg-white p-5 text-slate-900 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-white">
      <h2 className="font-bold">Hubungkan Gemini</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Masukkan kunci Gemini untuk sesi tab ini. Kunci dikirim ke server aplikasi saat memakai AI; gunakan hanya server tepercaya. Penggunaan mengikuti kuota dan biaya pemilik kunci.</p>
      {localConfigured && <p role="status" className="mt-3 text-sm text-blue-700 dark:text-blue-300">Kunci proyek aktif untuk pengembangan lokal. Kunci sesi yang Anda masukkan akan diprioritaskan.</p>}
      <label htmlFor="gemini-session-key" className="mt-4 block text-sm font-medium">Kunci API</label>
      <input id="gemini-session-key" type="password" autoComplete="off" value={key} onChange={e => setKey(e.target.value)} placeholder={configured ? "Kunci sudah tersimpan" : "Masukkan kunci Gemini"} className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-600" />
      <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => { if (key.trim()) { setSessionAiKey(key); setKey(''); setOpen(false); } }} disabled={!key.trim()} className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">Simpan untuk sesi ini</button><button type="button" onClick={() => { setSessionAiKey(''); setKey(''); setOpen(false); }} className="rounded-lg border border-slate-400 px-3 py-2 text-sm">Hapus kunci</button><button type="button" onClick={() => setOpen(false)} className="px-2 py-2 text-sm">Tutup</button></div>
    </div>}
    <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="rounded-full bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-blue-800">AI: {configured ? 'kunci sesi aktif' : localConfigured ? 'aktif lokal' : 'hubungkan'}</button>
  </div>;
}
