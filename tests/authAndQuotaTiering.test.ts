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

test('Login logic validates passwords and non-existent users accurately', () => {
  // 1. Unregistered user cannot log in
  const notFound = loginUser('unregistered.person@example.com', 'somepass');
  assert.equal(notFound.success, false);
  assert.match(notFound.message || '', /tidak ditemukan/i);

  // 2. Wrong password for registered user
  const wrongPass = loginUser('budi.santoso@mhs.unp.ac.id', 'wrongpassword');
  assert.equal(wrongPass.success, false);
  assert.match(wrongPass.message || '', /kata sandi tidak sesuai/i);

  // 3. Correct password for registered user
  const correct = loginUser('budi.santoso@mhs.unp.ac.id', 'password123');
  assert.equal(correct.success, true);
  assert.equal(correct.user?.email, 'budi.santoso@mhs.unp.ac.id');

  // 4. Superadmin login with password
  const adminCorrect = loginUser('superadmin@academic.id', 'superadmin123');
  assert.equal(adminCorrect.success, true);
  assert.equal(adminCorrect.user?.isSuperAdmin, true);

  // 5. Superadmin login with invalid password
  const adminWrong = loginUser('superadmin@academic.id', 'randomfakekey');
  assert.equal(adminWrong.success, false);
});
