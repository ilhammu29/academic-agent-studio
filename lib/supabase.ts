import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { ProposalDocument, TreeNode, StudioStage, ProposalCategory, ReportType, UserRole, SubscriptionPlanId } from '../types/studio.ts';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  institution: string;
  avatarUrl?: string;
  password?: string;
  isSuperAdmin?: boolean;
  isSubscribed?: boolean;
  subscriptionPlan?: SubscriptionPlanId;
  trialGeneratesLeft: number; // default: 3 untuk user baru
  restrictedGeneratesLeft: number; // default: 5 untuk judul setelah trial habis
  totalGeneratesCount: number;
  createdAt: string;
}

export const SUPERADMIN_USER: UserProfile = {
  id: 'usr-superadmin-ilham',
  email: 'superadmin@academic.id',
  name: 'Ilham Maulana (Superadmin)',
  role: 'Superadmin',
  institution: 'Universitas Negeri Padang (UNP)',
  isSuperAdmin: true,
  isSubscribed: true,
  subscriptionPlan: 'pro_unlimited',
  trialGeneratesLeft: 999999,
  restrictedGeneratesLeft: 999999,
  totalGeneratesCount: 0,
  createdAt: '2026-01-01T00:00:00.000Z'
};

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
  REGISTERED_USERS: 'academic_studio_registered_users',
  SUPABASE_CONFIG: 'academic_studio_supabase_config',
  PROJECTS: 'academic_studio_saved_proposals',
  ACTIVE_SESSION: 'academic_studio_active_session',
  AUTH_STATUS: 'academic_studio_auth_status'
};

export interface ActiveStudioSessionData {
  stage: StudioStage;
  category: ProposalCategory;
  reportType?: ReportType;
  title: string;
  targetEntity: string;
  institution: string;
  facultyMajor: string;
  candidateName: string;
  candidateId: string;
  durationMonths: number;
  targetDepthPages: number;
  questions?: any[];
  answers: Record<string, string>;
  generatedDoc: ProposalDocument | null;
  treeData: TreeNode | null;
  campusGuideline?: any;
  lastSavedAt: string;
}

export function saveActiveSession(session: ActiveStudioSessionData) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
    } catch (e) {
      console.warn("Storage quota exceeded when saving active session:", e);
    }
  }
}

export function getActiveSession(): ActiveStudioSessionData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Failed to parse active studio session:", e);
  }
  return null;
}

export function clearActiveSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
  }
}

export function isUserLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEYS.AUTH_STATUS) === 'true';
}

export function setUserLoggedIn(status: boolean) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.AUTH_STATUS, status ? 'true' : 'false');
  }
}

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
    id: 'proj-pkl-unp-semenpadang-2025',
    userId: 'usr-default',
    title: 'Analisis Preventive Maintenance Mesin Finish Mill Indarung V PT Semen Padang Berbasis Kepatuhan SOP dan Getaran Vibrasi',
    category: 'magang',
    targetEntity: 'PT Semen Padang (Persero)',
    durationMonths: 2,
    stage: 'result',
    answers: {
      divisi_unit: 'Departemen Tambang & Pemeliharaan Mesin Pabrik Indarung V, PT Semen Padang',
      masalah_teknis: 'Tingginya getaran vibrasi abnormal bearing pada unit Finish Mill 5R1 yang berpotensi menyebabkan breakdown mendadak dan kerugian siklus produksi semen.',
      metode_tools: 'Vibration Analyzer Fluke 810, Dial Indicator Shaft Alignment, Form Checklist SOP Harian, Buku Harian Tulis Tangan Asli, dan Form Bimbingan UHI FT UNP.',
      deliverable_output: '1 Berkas Laporan PKL 3 Bab Baku FT UNP 2025, 1 Matriks Logbook Buku Harian Asli Paraf Supervisor, 1 Flowchart SOP Maintenance, dan Rekomendasi Interval Pelumasan Bearing.',
      durasi_waktu: '2 Bulan (Juli - Agustus 2025 / Sesuai Kalender PKL FT UNP)',
      manfaat_spesifik: 'Menurunkan risiko unpredicted downtime mesin Finish Mill sebesar 18%, melatih kompetensi mahasiswa FT UNP dalam analisis vibrasi industri semen, dan memenuhi seluruh regulasi Buku Pedoman PKL FT UNP 2025.'
    },
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
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

// Local User Auth & Registered Users management
export function getRegisteredUsers(): UserProfile[] {
  if (typeof window === 'undefined') return [SUPERADMIN_USER];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
    let list: UserProfile[] = raw ? JSON.parse(raw) : [];
    // Pastikan superadmin selalu ada di database lokal
    if (!list.some(u => u.email.toLowerCase() === SUPERADMIN_USER.email.toLowerCase())) {
      list = [SUPERADMIN_USER, ...list];
      localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(list));
    }
    return list;
  } catch {
    return [SUPERADMIN_USER];
  }
}

export function saveRegisteredUsers(users: UserProfile[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(users));
  }
}

export function registerUser(params: {
  name: string;
  email: string;
  password?: string;
  institution?: string;
  role?: UserRole;
}): { success: boolean; user?: UserProfile; message?: string } {
  const users = getRegisteredUsers();
  const normalizedEmail = params.email.trim().toLowerCase();

  if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
    return { success: false, message: 'Email ini sudah terdaftar. Silakan langsung masuk (Login).' };
  }

  const isSuper = normalizedEmail === 'superadmin@academic.id' || normalizedEmail === 'ilhammu29@unp.ac.id';

  const newUser: UserProfile = {
    id: `usr-${Date.now()}`,
    email: normalizedEmail,
    name: params.name.trim(),
    role: isSuper ? 'Superadmin' : (params.role || 'Mahasiswa'),
    institution: params.institution?.trim() || 'Universitas Negeri Padang (UNP)',
    password: params.password || '123456',
    isSuperAdmin: isSuper,
    isSubscribed: isSuper,
    subscriptionPlan: isSuper ? 'pro_unlimited' : 'free',
    trialGeneratesLeft: isSuper ? 999999 : 3, // Diberi 3x trial penuh
    restrictedGeneratesLeft: isSuper ? 999999 : 5, // Diberi 5x kuota judul
    totalGeneratesCount: 0,
    createdAt: new Date().toISOString()
  };

  const updatedUsers = [newUser, ...users];
  saveRegisteredUsers(updatedUsers);
  saveStoredUser(newUser);
  setUserLoggedIn(true);

  return { success: true, user: newUser };
}

export function loginUser(email: string, password?: string): { success: boolean; user?: UserProfile; message?: string } {
  const normalizedEmail = email.trim().toLowerCase();
  
  // 1. Cek jika login sebagai Superadmin default
  if (normalizedEmail === 'superadmin@academic.id' || normalizedEmail === 'ilhammu29@unp.ac.id') {
    saveStoredUser(SUPERADMIN_USER);
    setUserLoggedIn(true);
    return { success: true, user: SUPERADMIN_USER, message: 'Selamat datang kembali, Superadmin!' };
  }

  const users = getRegisteredUsers();
  const existing = users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (existing) {
    // Verifikasi password jika ada
    if (existing.password && password && existing.password !== password) {
      return { success: false, message: 'Kata sandi tidak sesuai. Silakan periksa kembali.' };
    }
    saveStoredUser(existing);
    setUserLoggedIn(true);
    return { success: true, user: existing, message: 'Berhasil masuk ke akun Anda.' };
  }

  // Jika akun belum pernah dibuat, otomatis daftarkan akun baru dengan 3 trial
  return registerUser({
    name: normalizedEmail.split('@')[0],
    email: normalizedEmail,
    password: password || '123456',
    institution: 'Universitas Negeri Padang (UNP)',
    role: 'Mahasiswa'
  });
}

// Konsumsi Kuota Pengguna
export function consumeUserQuota(userId: string): { 
  allowed: boolean; 
  isRestrictedPreview: boolean; 
  isSuperAdmin: boolean; 
  remainingTrial: number; 
  remainingRestricted: number; 
  message?: string 
} {
  const current = getStoredUser();

  // Superadmin / Akun Berlangganan Aktif: UNLIMITED
  if (current.isSuperAdmin || current.isSubscribed) {
    current.totalGeneratesCount = (current.totalGeneratesCount || 0) + 1;
    saveStoredUser(current);
    return {
      allowed: true,
      isRestrictedPreview: false,
      isSuperAdmin: true,
      remainingTrial: 999999,
      remainingRestricted: 999999
    };
  }

  // Masih punya kuota Trial Penuh (> 0)
  if ((current.trialGeneratesLeft ?? 3) > 0) {
    const updatedUser: UserProfile = {
      ...current,
      trialGeneratesLeft: (current.trialGeneratesLeft ?? 3) - 1,
      totalGeneratesCount: (current.totalGeneratesCount || 0) + 1
    };
    saveStoredUser(updatedUser);
    
    // Sinkronisasi ke daftar user terdaftar
    const users = getRegisteredUsers();
    const idx = users.findIndex(u => u.id === current.id || u.email === current.email);
    if (idx >= 0) {
      users[idx] = updatedUser;
      saveRegisteredUsers(users);
    }

    return {
      allowed: true,
      isRestrictedPreview: false,
      isSuperAdmin: false,
      remainingTrial: updatedUser.trialGeneratesLeft,
      remainingRestricted: updatedUser.restrictedGeneratesLeft ?? 5
    };
  }

  // Trial Habis, tapi masih punya Kuota Judul Terkunci (> 0)
  if ((current.restrictedGeneratesLeft ?? 5) > 0) {
    const updatedUser: UserProfile = {
      ...current,
      restrictedGeneratesLeft: (current.restrictedGeneratesLeft ?? 5) - 1,
      totalGeneratesCount: (current.totalGeneratesCount || 0) + 1
    };
    saveStoredUser(updatedUser);

    const users = getRegisteredUsers();
    const idx = users.findIndex(u => u.id === current.id || u.email === current.email);
    if (idx >= 0) {
      users[idx] = updatedUser;
      saveRegisteredUsers(users);
    }

    return {
      allowed: true,
      isRestrictedPreview: true, // Dokumen terkunci hanya 3 halaman pertama terbuka!
      isSuperAdmin: false,
      remainingTrial: 0,
      remainingRestricted: updatedUser.restrictedGeneratesLeft
    };
  }

  // Kuota Habis Total (Trial = 0 dan Judul = 0)
  return {
    allowed: false,
    isRestrictedPreview: true,
    isSuperAdmin: false,
    remainingTrial: 0,
    remainingRestricted: 0,
    message: 'Batas 3x kuota trial penuh dan 5x kuota judul Anda telah habis. Silakan pilih paket langganan untuk melanjutkan penyusunan dokumen.'
  };
}

// Upgrade Langganan Akun
export function upgradeUserSubscription(userId: string, plan: SubscriptionPlanId): UserProfile {
  const current = getStoredUser();
  const updated: UserProfile = {
    ...current,
    isSubscribed: true,
    subscriptionPlan: plan,
    trialGeneratesLeft: 999999,
    restrictedGeneratesLeft: 999999
  };
  saveStoredUser(updated);

  const users = getRegisteredUsers();
  const idx = users.findIndex(u => u.id === current.id || u.email === current.email);
  if (idx >= 0) {
    users[idx] = updated;
    saveRegisteredUsers(users);
  }

  return updated;
}

export function getStoredUser(): UserProfile {
  if (typeof window === 'undefined') {
    return SUPERADMIN_USER;
  }
  const raw = localStorage.getItem(STORAGE_KEYS.USER);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.trialGeneratesLeft === 'undefined') {
        parsed.trialGeneratesLeft = 3;
        parsed.restrictedGeneratesLeft = 5;
        parsed.totalGeneratesCount = 0;
      }
      return parsed;
    } catch {
      // fallback
    }
  }
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(SUPERADMIN_USER));
  return SUPERADMIN_USER;
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
