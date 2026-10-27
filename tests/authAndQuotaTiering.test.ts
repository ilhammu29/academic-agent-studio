import test from 'node:test';
import assert from 'node:assert/strict';
import { loginUser, registerUser, getStoredUser, consumeUserQuota, SUPERADMIN_USER } from '../lib/supabase.ts';

const data: Record<string, string> = {};
(global as any).window = {};
(global as any).localStorage = { 
  getItem: (key: string) => data[key] ?? null, 
  setItem: (key: string, value: string) => { data[key] = value; }, 
  removeItem: (key: string) => { delete data[key]; } 
};

test('Superadmin Account has unlimited access and bypasses quota limit', () => {
  const superadminLogin = loginUser('superadmin@academic.id');
  assert.equal(superadminLogin.success, true);
  assert.equal(superadminLogin.user?.isSuperAdmin, true);
  assert.equal(superadminLogin.user?.isSubscribed, true);

  const quotaCheck = consumeUserQuota(superadminLogin.user!.id);
  assert.equal(quotaCheck.allowed, true);
  assert.equal(quotaCheck.isRestrictedPreview, false);
});

test('New user registration grants 3 trial generates and 5 restricted title generates', () => {
  const newUser = registerUser({
    name: 'Budi Santoso',
    email: 'budi.santoso@mhs.unp.ac.id',
    password: 'password123',
    institution: 'Universitas Negeri Padang (UNP)',
    role: 'Mahasiswa'
  });

  assert.equal(newUser.success, true);
  assert.equal(newUser.user?.trialGeneratesLeft, 3);
  assert.equal(newUser.user?.restrictedGeneratesLeft, 5);

  // Consume trial 1
  const q1 = consumeUserQuota(newUser.user!.id);
  assert.equal(q1.allowed, true);
  assert.equal(q1.isRestrictedPreview, false);
  assert.equal(q1.remainingTrial, 2);

  // Consume trial 2
  const q2 = consumeUserQuota(newUser.user!.id);
  assert.equal(q2.remainingTrial, 1);

  // Consume trial 3
  const q3 = consumeUserQuota(newUser.user!.id);
  assert.equal(q3.remainingTrial, 0);

  // Trial habis, masuk mode restricted (Halaman 4+ terkunci)
  const q4 = consumeUserQuota(newUser.user!.id);
  assert.equal(q4.allowed, true);
  assert.equal(q4.isRestrictedPreview, true);
  assert.equal(q4.remainingRestricted, 4);
});
