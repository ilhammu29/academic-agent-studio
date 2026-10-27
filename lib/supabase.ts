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
  userId?: string;
  title: string;
  category: ProposalCategory;
  reportType?: ReportType;
  targetEntity?: string;
  durationMonths: number;
  stage: StudioStage;
  answers: Record<string, string>;
  document?: ProposalDocument;
  documentData?: ProposalDocument;
  treeGraph?: TreeNode;
  campusGuidelineId?: string;
  createdAt: string;
  updatedAt: string;
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  if (!url || !anonKey) {
    return { success: false, message: 'URL dan Anon Key Supabase wajib diisi.' };
  }
  try {
    const res = await fetch(`${url.replace(/\/$/, '')}/rest/v1/`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`
      }
    });
    if (res.ok || res.status === 200 || res.status === 404) {
      return { success: true, message: 'Koneksi ke Supabase REST API berhasil!' };
    }
    return { success: false, message: `Server merespons status HTTP ${res.status}.` };
  } catch (err: any) {
    return { success: false, message: `Gagal terhubung: ${err?.message || 'Periksa URL Supabase'}` };
  }
}

// Default Supabase credentials (fallback/dummy if env is missing)
const DEFAULT_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

const STORAGE_KEYS = {
  SUPABASE_CONFIG: 'academic_studio_supabase_config',
  PROJECTS: 'academic_studio_saved_projects',
  ACTIVE_SESSION: 'academic_studio_active_session',
  USER: 'academic_studio_user_profile',
  REGISTERED_USERS: 'academic_studio_registered_users',
  AUTH_STATUS: 'academic_studio_is_logged_in'
};

export interface ActiveStudioSessionData {
  projectId?: string;
  stage: StudioStage;
  category: ProposalCategory;
  reportType?: ReportType;
  title: string;
  targetEntity?: string;
  institution?: string;
  facultyMajor?: string;
  candidateName?: string;
  candidateId?: string;
  durationMonths?: number;
  targetDepthPages?: number;
  questions?: any[];
  answers?: Record<string, string>;
  generatedDoc?: ProposalDocument | null;
  treeData?: TreeNode | null;
  campusGuideline?: any;
  lastSavedAt: string;
}

export function saveActiveSession(session: ActiveStudioSessionData): boolean {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
      return true;
    } catch (e) {
      console.warn("Storage error when saving active session:", e);
      return false;
    }
  }
  return false;
}

export function getActiveSession(): ActiveStudioSessionData | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.warn("Failed to parse active session:", e);
    }
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

    if (url && anonKey && url.startsWith('http') && !url.includes('xyzcompany')) {
      return createClient(url, anonKey);
    }
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
  }
  return null;
}

export function getStoredSupabaseConfig(): { url: string; anonKey: string } | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEYS.SUPABASE_CONFIG);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return null;
}

export function saveStoredSupabaseConfig(config: { url: string; anonKey: string }) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SUPABASE_CONFIG, JSON.stringify(config));
}

// Multi-user Registered Database
export function getRegisteredUsers(): UserProfile[] {
  if (typeof window === 'undefined') return [SUPERADMIN_USER];
  const raw = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
  if (raw) {
    try {
      const users: UserProfile[] = JSON.parse(raw);
      if (!users.some(u => u.id === SUPERADMIN_USER.id || u.email === SUPERADMIN_USER.email)) {
        users.unshift(SUPERADMIN_USER);
      }
      return users;
    } catch {
      return [SUPERADMIN_USER];
    }
  }
  return [SUPERADMIN_USER];
}

export function saveRegisteredUsers(users: UserProfile[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(users));
}

export function registerUser(newUser: {
  name: string;
  email: string;
  password?: string;
  institution?: string;
  role?: UserRole;
}): { success: boolean; user?: UserProfile; message?: string } {
  const users = getRegisteredUsers();
  const normalizedEmail = newUser.email.trim().toLowerCase();

  if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
    return { success: false, message: 'Email sudah terdaftar. Silakan login langsung.' };
  }

  const profile: UserProfile = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: newUser.name.trim(),
    email: normalizedEmail,
    password: newUser.password || '123456',
    institution: newUser.institution?.trim() || 'Universitas Negeri Padang (UNP)',
    role: newUser.role || 'Mahasiswa',
    isSuperAdmin: false,
    isSubscribed: false,
    subscriptionPlan: 'free',
    trialGeneratesLeft: 3,
    restrictedGeneratesLeft: 5,
    totalGeneratesCount: 0,
    createdAt: new Date().toISOString()
  };

  users.push(profile);
  saveRegisteredUsers(users);
  saveStoredUser(profile);
  setUserLoggedIn(true);

  return { success: true, user: profile, message: 'Pendaftaran berhasil! Anda mendapatkan 3x kuota trial gratis.' };
}

export function loginUser(email: string, password?: string): { success: boolean; user?: UserProfile; message?: string } {
  const users = getRegisteredUsers();
  const normalizedEmail = email.trim().toLowerCase();

  // Superadmin bypass
  if (normalizedEmail === 'superadmin@academic.id' || normalizedEmail === 'ilhammu29' || normalizedEmail === 'admin') {
    saveStoredUser(SUPERADMIN_USER);
    setUserLoggedIn(true);
    return { success: true, user: SUPERADMIN_USER, message: 'Berhasil masuk sebagai Superadmin.' };
  }

  const existing = users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
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
    return {
      allowed: true,
      isRestrictedPreview: false,
      isSuperAdmin: Boolean(current.isSuperAdmin),
      remainingTrial: 999999,
      remainingRestricted: 999999,
      message: 'Akses penuh tanpa batas (Pro/Superadmin).'
    };
  }

  // Status 1: Kuota trial 3x masih ada
  if (current.trialGeneratesLeft > 0) {
    const updatedUser = {
      ...current,
      trialGeneratesLeft: current.trialGeneratesLeft - 1,
      totalGeneratesCount: (current.totalGeneratesCount || 0) + 1
    };
    saveStoredUser(updatedUser);

    const users = getRegisteredUsers();
    const idx = users.findIndex(u => u.id === current.id);
    if (idx >= 0) {
      users[idx] = updatedUser;
      saveRegisteredUsers(users);
    }

    return {
      allowed: true,
      isRestrictedPreview: false,
      isSuperAdmin: false,
      remainingTrial: updatedUser.trialGeneratesLeft,
      remainingRestricted: updatedUser.restrictedGeneratesLeft,
      message: `Penyusunan berhasil. Sisa kuota trial penuh: ${updatedUser.trialGeneratesLeft}x.`
    };
  }

  // Status 2: Trial habis, tetapi kuota restricted 5x masih ada (hanya 3 halaman awal terbuka, halaman 4+ terkunci)
  if (current.restrictedGeneratesLeft > 0) {
    const updatedUser = {
      ...current,
      restrictedGeneratesLeft: current.restrictedGeneratesLeft - 1,
      totalGeneratesCount: (current.totalGeneratesCount || 0) + 1
    };
    saveStoredUser(updatedUser);

    const users = getRegisteredUsers();
    const idx = users.findIndex(u => u.id === current.id);
    if (idx >= 0) {
      users[idx] = updatedUser;
      saveRegisteredUsers(users);
    }

    return {
      allowed: true,
      isRestrictedPreview: true, // Halaman 4+ terkunci
      isSuperAdmin: false,
      remainingTrial: 0,
      remainingRestricted: updatedUser.restrictedGeneratesLeft,
      message: `Trial penuh telah habis. Naskah dibuat dalam Mode Terkunci (Halaman 4+ terkunci). Sisa kuota judul: ${updatedUser.restrictedGeneratesLeft}x. Silakan upgrade ke Pro.`
    };
  }

  // Status 3: Habis total
  return {
    allowed: false,
    isRestrictedPreview: true,
    isSuperAdmin: false,
    remainingTrial: 0,
    remainingRestricted: 0,
    message: 'Seluruh kuota trial dan kuota judul Anda telah habis. Silakan pilih paket langganan untuk melanjutkan.'
  };
}

export function upgradeUserSubscription(userId: string, plan: SubscriptionPlanId = 'pro_skripsi'): UserProfile {
  const users = getRegisteredUsers();
  const idx = users.findIndex(u => u.id === userId);
  
  if (idx >= 0) {
    users[idx].isSubscribed = true;
    users[idx].subscriptionPlan = plan;
    users[idx].trialGeneratesLeft = 999999;
    users[idx].restrictedGeneratesLeft = 999999;
    saveRegisteredUsers(users);
  }

  const current = getStoredUser();
  if (current.id === userId) {
    current.isSubscribed = true;
    current.subscriptionPlan = plan;
    current.trialGeneratesLeft = 999999;
    current.restrictedGeneratesLeft = 999999;
    saveStoredUser(current);
  }
  return current;
}

export function getStoredUser(): UserProfile {
  if (typeof window === 'undefined') {
    return SUPERADMIN_USER;
  }
  const raw = localStorage.getItem(STORAGE_KEYS.USER);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed) {
        if (typeof parsed.trialGeneratesLeft === 'undefined') parsed.trialGeneratesLeft = 3;
        if (typeof parsed.restrictedGeneratesLeft === 'undefined') parsed.restrictedGeneratesLeft = 5;
        if (typeof parsed.totalGeneratesCount === 'undefined') parsed.totalGeneratesCount = 0;
        return parsed;
      }
    } catch {
      // fallback
    }
  }
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(SUPERADMIN_USER));
  return SUPERADMIN_USER;
}

export function saveStoredUser(user: UserProfile) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

// Project Records in Local & Supabase Storage
export async function getSavedProjects(): Promise<SavedProjectRecord[]> {
  if (typeof window === 'undefined') return [];

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
          userId: item.user_id || 'anonymous',
          title: item.title,
          category: item.category,
          targetEntity: item.target_entity,
          durationMonths: item.duration_months || 6,
          stage: item.stage || 'result',
          answers: item.answers || {},
          document: item.document_data,
          treeGraph: item.tree_graph,
          createdAt: item.created_at,
          updatedAt: item.updated_at
        }));
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local storage:', err);
    }
  }

  const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      return [];
    }
  }
  return [];
}

export async function saveProjectRecord(project: SavedProjectRecord): Promise<{ success: boolean; id: string }> {
  if (typeof window === 'undefined') return { success: false, id: project.id };

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('proposals').upsert({
        id: project.id,
        user_id: project.userId,
        title: project.title,
        category: project.category,
        target_entity: project.targetEntity,
        duration_months: project.durationMonths,
        stage: project.stage,
        answers: project.answers,
        document_data: project.document,
        tree_graph: project.treeGraph,
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Supabase save failed, continuing to local storage:', err);
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

// Backup & Recovery JSON helpers
export function exportProjectAsJson(project: SavedProjectRecord): string {
  return JSON.stringify(project, null, 2);
}

export function importProjectFromJson(jsonString: string): SavedProjectRecord {
  const parsed = JSON.parse(jsonString);
  if (!parsed.title || !parsed.category) {
    throw new Error('Format file proyek tidak valid: judul atau kategori tidak ditemukan.');
  }
  return {
    ...parsed,
    id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    updatedAt: new Date().toISOString()
  };
}

// SQL Migration Script for Supabase SQL Editor
export const SUPABASE_SQL_MIGRATION = `-- ==============================================================
-- ACADEMIC & PROPOSAL AGENT STUDIO - SUPABASE DATABASE SCHEMA
-- ==============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  institution TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Mahasiswa',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

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

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Akses publik profil" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Akses publik proposal" ON public.proposals FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_proposals_title ON public.proposals (title);
CREATE INDEX IF NOT EXISTS idx_proposals_category ON public.proposals (category);
`;
