import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  SUPERADMIN_USER, 
  registerUser, 
  loginUser, 
  consumeUserQuota, 
  upgradeUserSubscription,
  getStoredUser
} from '../lib/supabase.ts';

// Mock localStorage in Node test environment
const mockStorage: Record<string, string> = {};
(global as any).window = {};
(global as any).localStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, val: string) => { mockStorage[key] = val; },
  removeItem: (key: string) => { delete mockStorage[key]; }
};

test('Superadmin Account has unlimited access and bypasses quota limit', () => {
  assert.equal(SUPERADMIN_USER.email, 'superadmin@academic.id');
  assert.equal(SUPERADMIN_USER.isSuperAdmin, true);
  assert.equal(SUPERADMIN_USER.isSubscribed, true);
  assert.equal(SUPERADMIN_USER.trialGeneratesLeft, 999999);
  assert.equal(SUPERADMIN_USER.restrictedGeneratesLeft, 999999);

  const loginRes = loginUser('superadmin@academic.id');
  assert.equal(loginRes.success, true);
  assert.equal(loginRes.user?.isSuperAdmin, true);

  const quota = consumeUserQuota(SUPERADMIN_USER.id);
  assert.equal(quota.allowed, true);
  assert.equal(quota.isRestrictedPreview, false);
  assert.equal(quota.isSuperAdmin, true);
});

test('New user registration grants 3 trial generates and 5 restricted title generates', () => {
  const regRes = registerUser({
    name: 'Budi Santoso',
    email: 'budi@ft.unp.ac.id',
    password: 'password123',
    institution: 'Universitas Negeri Padang (UNP)',
    role: 'Mahasiswa'
  });

  assert.equal(regRes.success, true);
  assert.equal(regRes.user?.trialGeneratesLeft, 3);
  assert.equal(regRes.user?.restrictedGeneratesLeft, 5);
  assert.equal(regRes.user?.isSubscribed, false);
  assert.equal(regRes.user?.isSuperAdmin, false);

  // 1st Trial Generate
  const q1 = consumeUserQuota(regRes.user!.id);
  assert.equal(q1.allowed, true);
  assert.equal(q1.isRestrictedPreview, false);
  assert.equal(q1.remainingTrial, 2);

  // 2nd Trial Generate
  const q2 = consumeUserQuota(regRes.user!.id);
  assert.equal(q2.allowed, true);
  assert.equal(q2.isRestrictedPreview, false);
  assert.equal(q2.remainingTrial, 1);

  // 3rd Trial Generate
  const q3 = consumeUserQuota(regRes.user!.id);
  assert.equal(q3.allowed, true);
  assert.equal(q3.isRestrictedPreview, false);
  assert.equal(q3.remainingTrial, 0);

  // 4th Generate: Trial has expired! Should enter restricted preview (gembok 3 halaman)
  const q4 = consumeUserQuota(regRes.user!.id);
  assert.equal(q4.allowed, true);
  assert.equal(q4.isRestrictedPreview, true); // Terkunci!
  assert.equal(q4.remainingRestricted, 4);

  // Consume remaining 4 restricted generates
  consumeUserQuota(regRes.user!.id); // 3 left
  consumeUserQuota(regRes.user!.id); // 2 left
  consumeUserQuota(regRes.user!.id); // 1 left
  const qLast = consumeUserQuota(regRes.user!.id); // 0 left
  assert.equal(qLast.isRestrictedPreview, true);
  assert.equal(qLast.remainingRestricted, 0);

  // Next Generate: Totally blocked! Must upgrade subscription
  const qBlocked = consumeUserQuota(regRes.user!.id);
  assert.equal(qBlocked.allowed, false);
  assert.ok(qBlocked.message?.includes('habis'));

  // Upgrade to Pro
  const upgraded = upgradeUserSubscription(regRes.user!.id, 'pro_skripsi');
  assert.equal(upgraded.isSubscribed, true);
  
  // After upgrade: Unlimited access
  const qAfterUpgrade = consumeUserQuota(regRes.user!.id);
  assert.equal(qAfterUpgrade.allowed, true);
  assert.equal(qAfterUpgrade.isRestrictedPreview, false);
});
