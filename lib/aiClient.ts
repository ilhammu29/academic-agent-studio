const KEY_NAME = 'academic_studio_gemini_key';

export function getSessionAiKey(): string {
  return typeof window === 'undefined' ? '' : sessionStorage.getItem(KEY_NAME) || '';
}

export function setSessionAiKey(key: string): void {
  if (key.trim()) sessionStorage.setItem(KEY_NAME, key.trim());
  else sessionStorage.removeItem(KEY_NAME);
  window.dispatchEvent(new Event('academic-ai-key-changed'));
}

/** Send the user's session key only to our own AI endpoints. */
export function aiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  if (!/^\/api\/(?:gemini(?:\/refine)?|academic\/(?:consultation|generate-proposal|recommend-titles|scan-guideline|expand-theories)|interview\/(?:generate|auto-answers))$/.test(path)) {
    throw new Error('Endpoint AI tidak dikenal');
  }
  const headers = new Headers(init.headers);
  const key = getSessionAiKey();
  if (key) headers.set('x-gemini-key', key);
  return fetch(path, { ...init, headers });
}
