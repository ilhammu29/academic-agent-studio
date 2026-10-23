import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ProposalDocument, TreeNode, StudioStage, ProposalCategory } from '@/types/studio';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'Mahasiswa' | 'Dosen Pembimbing' | 'Reviewer Industri' | 'Peneliti';
  institution: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface SavedProjectRecord {
  id: string;
  userId: string;
  title: string;
  category: ProposalCategory;
  targetEntity: string;
  durationMonths: number;
  stage: StudioStage;
  answers: Record<string, string>;
  documentData?: ProposalDocument;
  treeGraph?: TreeNode | TreeNode[];
  updatedAt: string;
  createdAt: string;
}

// Default Supabase credentials or localStorage override
const DEFAULT_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const DEFAULT_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const STORAGE_KEYS = {
  USER: 'academic_studio_user_session',
  SUPABASE_CONFIG: 'academic_studio_supabase_config',
  PROJECTS: 'academic_studio_saved_proposals',
};

// Initialize Supabase Client dynamically
export function getSupabaseClient(): SupabaseClient | null {
  if (typeof window === 'undefined') return null;

  try {
    const customConfig = localStorage.getItem(STORAGE_KEYS.SUPABASE_CONFIG);
    let url = DEFAULT_SUPABASE_URL;
    let anonKey = DEFAULT_SUPABASE_ANON_KEY;

    if (customConfig) {
      const parsed = JSON.parse(customConfig);
      if (parsed.url && parsed.anonKey) {
        url = parsed.url;
        anonKey = parsed.anonKey;
      }
    }

    if (url && anonKey) {
      return createClient(url, anonKey);
    }
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
  }
  return null;
}

// Test live Supabase connection
export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!url || !anonKey) {
      return { success: false, message: 'URL dan Anon Key tidak boleh kosong.' };
    }
    const testClient = createClient(url, anonKey);
    const { error } = await testClient.from('proposals').select('id').limit(1);
    if (error && error.code !== 'PGRST116' && !error.message.includes('relation "proposals" does not exist')) {
      // If table doesn't exist yet, connection is still valid!
      if (error.message.includes('relation "proposals" does not exist') || error.message.includes('permission denied')) {
        return { 
          success: true, 
          message: 'Koneksi ke Supabase berhasil! Namun tabel "proposals" belum dibuat. Silakan salin & jalankan skema SQL di bawah pada SQL Editor Supabase.' 
        };
      }
      return { success: false, message: `Koneksi gagal: ${error.message}` };
    }
    return { success: true, message: 'Koneksi ke Supabase berhasil dan tabel "proposals" terdeteksi aktif!' };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Kesalahan jaringan atau URL tidak valid: ${errorMsg}` };
  }
}

// Pre-loaded realistic Indonesian Academic Proposal Projects
export const CURATED_ACADEMIC_TEMPLATES: SavedProjectRecord[] = [
  {
    id: 'proj-telkom-mlops-2026',
    userId: 'usr-default',
    title: 'Implementasi Pipeline MLOps & RAG untuk Knowledge Retrieval Internal di Divisi Digital Telkom Indonesia',
    category: 'magang',
    targetEntity: 'PT Telkom Indonesia Tbk',
    durationMonths: 6,
    stage: 'result',
    answers: {
      divisi_unit: 'Divisi Data & AI Strategy, Group Digital Solutions',
      masalah_teknis: 'Tingginya latensi pencarian SOP teknis lintas repositori internal dan resiko halusinasi LLM konvensional.',
      metode_tools: 'Python 3.11, LangChain, Qdrant Vector Database, Docker, FastMCP, MLflow, CI/CD GitLab.',
      deliverable_output: '1 Prototipe microservice RAG terverifikasi, 1 dashboard observabilitas latency, dan 1 dokumen SOP arsitektur.',
      durasi_waktu: '6 Bulan (Februari - Juli 2026 / 24 Minggu Kerja Penuh MBKM 20 SKS)',
      manfaat_spesifik: 'Efisiensi waktu retrieval dokumen teknis karyawan sebesar 60% dan pencetakan talenta MLOps siap kerja.'
    },
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    id: 'proj-skripsi-vit-retino',
    userId: 'usr-default',
    title: 'Optimasi Model Vision Transformer (ViT) dengan Kuantisasi 4-bit AWQ pada Edge Device untuk Deteksi Dini Retinopati Diabetik',
    category: 'skripsi',
    targetEntity: 'RSUP Dr. Sardjito / Fakultas Kedokteran',
    durationMonths: 5,
    stage: 'result',
    answers: {
      populasi_sampel: '1.200 citra fundus retina teranotasi dari dataset EYEPACS dan RSUP Dr. Sardjito.',
      variabel_riset: 'Variabel Bebas: Bobot model ViT-Base terkuantisasi AWQ 4-bit vs FP16; Variabel Terikat: Akurasi F1-Score, Frame Rate (FPS) pada Raspberry Pi 5 & Jetson Orin.',
      desain_metode: 'Eksperimental komparatif kuantitatif dengan cross-validation 5-fold dan uji inferensi hardware edge.',
      rencana_analisis: 'Uji normalitas Shapiro-Wilk, dilanjutkan Paired t-test dan evaluasi kurva ROC-AUC serta matriks konfusi (Sensitivitas & Spesifisitas).',
      kelaikan_etik: 'Persetujuan etik Komisi Etik Penelitian Kedokteran dan Kesehatan (KEPK) FK-KMK UGM.'
    },
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString()
  },
  {
    id: 'proj-tesis-biomarker-fibrosis',
    userId: 'usr-default',
    title: 'Korelasi Kadar Ekspresi miRNA-21 Serum dan High-Sensitivity CRP terhadap Derajat Fibrosis Pasien Hepatitis B Kronis',
    category: 'penelitian',
    targetEntity: 'Laboratorium Riset Terpadu & RS Pendidikan',
    durationMonths: 6,
    stage: 'result',
    answers: {
      populasi_sampel: '80 pasien Hepatitis B kronis terkonfirmasi FibroScan di Poliklinik Hepatologi.',
      variabel_riset: 'Variabel Bebas: Fold-change qPCR miRNA-21 dan kadar hs-CRP; Variabel Terikat: Skor derajat fibrosis Metavir (F0-F4).',
      desain_metode: 'Observasional analitik cross-sectional berstandar STROBE.',
      rencana_analisis: 'Uji korelasi Spearman Rank dan Regresi Logistik Ordinal Multivariat dengan penyesuaian usia dan viral load HBV-DNA.',
      kelaikan_etik: 'Informed consent tertulis subjek dan ethical clearance resmi.'
    },
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 96).toISOString()
  }
];

// Local User Auth management
export function getStoredUser(): UserProfile {
  if (typeof window === 'undefined') {
    return {
      id: 'usr-default',
      email: 'ilham.maulana@universitas.ac.id',
      name: 'Ilham Maulana',
      role: 'Mahasiswa',
      institution: 'Universitas Sebelas Maret (UNS)',
      createdAt: new Date().toISOString()
    };
  }
  const raw = localStorage.getItem(STORAGE_KEYS.USER);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // fallback
    }
  }
  const defaultUser: UserProfile = {
    id: 'usr-default',
    email: 'ilham.maulana@universitas.ac.id',
    name: 'Ilham Maulana',
    role: 'Mahasiswa',
    institution: 'Universitas Sebelas Maret (UNS)',
    createdAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(defaultUser));
  return defaultUser;
}

export function saveStoredUser(user: UserProfile) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }
}

// Saved Proposals management
export async function getSavedProjects(): Promise<SavedProjectRecord[]> {
  if (typeof window === 'undefined') return CURATED_ACADEMIC_TEMPLATES;

  // Try Supabase first if configured
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .order('updated_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((item: any) => ({
          id: item.id,
          userId: item.user_id,
          title: item.title,
          category: item.category,
          targetEntity: item.target_entity || '',
          durationMonths: item.duration_months || 6,
          stage: item.stage || 'result',
          answers: item.answers || {},
          documentData: item.document_data,
          treeGraph: item.tree_graph,
          updatedAt: item.updated_at || item.created_at,
          createdAt: item.created_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local storage:', err);
    }
  }

  // Local storage fallback
  const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // fallback
    }
  }

  // Store curated default templates
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(CURATED_ACADEMIC_TEMPLATES));
  return CURATED_ACADEMIC_TEMPLATES;
}

export async function saveProjectRecord(project: SavedProjectRecord): Promise<{ success: boolean; id: string }> {
  if (typeof window === 'undefined') return { success: false, id: project.id };

  const supabase = getSupabaseClient();
  let savedToRemote = false;

  if (supabase) {
    try {
      const { error } = await supabase.from('proposals').upsert({
        id: project.id,
        user_id: project.userId,
        title: project.title,
        category: project.category,
        target_entity: project.targetEntity,
        duration_months: project.durationMonths,
        stage: project.stage,
        answers: project.answers,
        document_data: project.documentData,
        tree_graph: project.treeGraph,
        updated_at: new Date().toISOString(),
      });
      if (!error) savedToRemote = true;
    } catch (err) {
      console.warn('Could not save to Supabase, saving to local cache:', err);
    }
  }

  // Save to local storage
  const current = await getSavedProjects();
  const existingIdx = current.findIndex(p => p.id === project.id);
  let updatedList: SavedProjectRecord[];

  if (existingIdx >= 0) {
    updatedList = [...current];
    updatedList[existingIdx] = { ...project, updatedAt: new Date().toISOString() };
  } else {
    updatedList = [{ ...project, updatedAt: new Date().toISOString() }, ...current];
  }

  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updatedList));
  return { success: true, id: project.id };
}

export async function deleteProjectRecord(id: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('proposals').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete error:', err);
    }
  }

  const current = await getSavedProjects();
  const updated = current.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updated));
  return true;
}

// SQL Migration Script for Supabase SQL Editor
export const SUPABASE_SQL_MIGRATION = `-- ==============================================================
-- ACADEMIC & PROPOSAL AGENT STUDIO - SUPABASE DATABASE SCHEMA
-- ==============================================================

-- 1. Tabel Profil Pengguna (Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  institution TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Mahasiswa',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabel Naskah & Proyek Proposal (Proposals)
CREATE TABLE IF NOT EXISTS public.proposals (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  target_entity TEXT,
  duration_months INTEGER DEFAULT 6,
  stage TEXT DEFAULT 'result',
  answers JSONB DEFAULT '{}'::jsonb,
  document_data JSONB,
  tree_graph JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Row Level Security (RLS) - Opsional / Aktifkan sesuai kebutuhan
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- Policy sederhana untuk akses publik studio
CREATE POLICY "Akses publik profil" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Akses publik proposal" ON public.proposals FOR ALL USING (true);

-- Index performa pencarian judul dan kategori
CREATE INDEX IF NOT EXISTS idx_proposals_title ON public.proposals (title);
CREATE INDEX IF NOT EXISTS idx_proposals_category ON public.proposals (category);
`;
