import test from 'node:test';
import assert from 'node:assert/strict';
import { getRequestAiKey, isLocalDevAiEnabled } from '../lib/serverAiConfig.ts';

test('server AI key resolves correctly with security checks', () => {
  const old = { ...process.env };
  try {
    process.env.GEMINI_API_KEY = 'server-test-key';
    assert.equal(isLocalDevAiEnabled(), true);
    assert.equal(getRequestAiKey(new Request('http://localhost/api/gemini')), 'server-test-key');
    assert.equal(getRequestAiKey(new Request('http://localhost/api/gemini', { headers: { origin: 'https://attacker.com' } })), '');
    assert.equal(getRequestAiKey(new Request('http://localhost/api/gemini', { headers: { origin: 'http://localhost' } })), 'server-test-key');
    assert.equal(getRequestAiKey(new Request('http://localhost:3000/api/gemini', { headers: { host: '127.0.0.1:3000', origin: 'http://127.0.0.1:3000' } })), 'server-test-key');
    assert.equal(getRequestAiKey(new Request('http://localhost:3000/api/gemini', { headers: { host: '127.0.0.1:3000', origin: 'https://attacker.example' } })), '');
    assert.equal(getRequestAiKey(new Request('http://localhost/api/gemini', { headers: { 'x-gemini-key': 'user-test-key' } })), 'user-test-key');
  } finally { 
    process.env = old; 
  }
});
