import test from 'node:test';
import assert from 'node:assert/strict';
import { saveActiveSession, getActiveSession } from '../lib/supabase.ts';
import type { ActiveStudioSessionData } from '../lib/supabase.ts';

test('session save reports failure when browser storage is unavailable', () => {
  const previousWindow = (globalThis as any).window;
  const previousStorage = (globalThis as any).localStorage;
  const data = new Map<string, string>();
  (globalThis as any).window = {};
  (globalThis as any).localStorage = { getItem: (key: string) => data.get(key) || null, setItem: (key: string, value: string) => data.set(key, value) };
  const session = { title: 'Draf uji', answers: {}, stage: 'input' } as ActiveStudioSessionData;
  try {
    assert.equal(saveActiveSession(session), true);
    assert.equal(getActiveSession()?.title, 'Draf uji');
    (globalThis as any).localStorage.setItem = () => { throw new Error('quota'); };
    const originalWarn = console.warn;
    console.warn = () => {};
    try { assert.equal(saveActiveSession(session), false); } finally { console.warn = originalWarn; }
  } finally { (globalThis as any).window = previousWindow; (globalThis as any).localStorage = previousStorage; }
});
