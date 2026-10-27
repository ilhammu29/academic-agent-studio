/**
 * Server AI Configuration
 * Resolves Gemini API key safely:
 * 1. User-supplied session key from 'x-gemini-key' header (highest priority).
 * 2. Server-configured process.env.GEMINI_API_KEY (for deployment on Vercel / server).
 */
export function getRequestAiKey(req: Request): string {
  const supplied = req.headers.get('x-gemini-key')?.trim();
  if (supplied) return supplied;

  // Origin verification for safety against CSRF / foreign origins
  const origin = req.headers.get('origin');
  if (origin) {
    try {
      const requestUrl = new URL(req.url);
      const requestHost = req.headers.get('host') || requestUrl.host;
      const originUrl = new URL(origin);
      // Allow requests from same host or official Vercel deployment domains
      const isAllowedHost = originUrl.host === requestHost || 
        originUrl.host.endsWith('.vercel.app') || 
        originUrl.host === 'localhost' || 
        originUrl.host.startsWith('127.0.0.1');
        
      if (!isAllowedHost) return '';
    } catch {
      // Ignore URL parsing issues for local calls
    }
  }

  return process.env.GEMINI_API_KEY || '';
}

export function isLocalDevAiEnabled(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}
