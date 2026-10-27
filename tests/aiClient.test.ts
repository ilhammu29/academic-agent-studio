import test from 'node:test';
import assert from 'node:assert/strict';
import { aiFetch, getSessionAiKey, setSessionAiKey } from '../lib/aiClient.ts';

test('session AI key is sent only to allowed local AI endpoints', async () => {
  const storage = new Map<string, string>();
  (globalThis as any).sessionStorage = { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value), removeItem: (key: string) => storage.delete(key) };
  (globalThis as any).window = { dispatchEvent: () => true };
  const originalFetch = globalThis.fetch;
  let received: RequestInit | undefined;
  globalThis.fetch = (async (_input: any, init?: RequestInit) => { received = init; return new Response('{}'); }) as typeof fetch;
  try {
    setSessionAiKey(' test-key ');
    assert.equal(getSessionAiKey(), 'test-key');
    await aiFetch('/api/gemini', { method: 'POST' });
    assert.equal(new Headers(received?.headers).get('x-gemini-key'), 'test-key');
    assert.throws(() => aiFetch('https://example.com/api/gemini'));
    setSessionAiKey('');
    assert.equal(getSessionAiKey(), '');
  } finally { globalThis.fetch = originalFetch; }
});
