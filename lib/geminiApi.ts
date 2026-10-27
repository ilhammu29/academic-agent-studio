/**
 * Resilient Google Gemini Generative AI Client
 * Automatically tries primary model and cascades to latest alternatives if rate-limited or deprecated.
 */

export const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro"
];

export interface GeminiApiOptions {
  apiKey: string;
  prompt: string;
  temperature?: number;
  maxOutputTokens?: number;
  responseMimeType?: string;
  timeoutMs?: number;
}

export async function callGeminiApi({
  apiKey,
  prompt,
  temperature = 0.7,
  maxOutputTokens = 4096,
  responseMimeType,
  timeoutMs = 30000
}: GeminiApiOptions): Promise<{ text: string; model: string } | null> {
  if (!apiKey) return null;

  for (const model of GEMINI_MODELS) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const generationConfig: Record<string, any> = {
        temperature,
        maxOutputTokens,
      };
      if (responseMimeType) {
        generationConfig.responseMimeType = responseMimeType;
      }

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig,
          }),
          signal: controller.signal
        }
      );
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 0) {
          return { text: text.trim(), model };
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        console.warn(`Gemini model ${model} status ${res.status}:`, errData?.error?.message || res.statusText);
      }
    } catch (e: any) {
      console.warn(`Gemini fetch error on model ${model}:`, e?.message);
    }
  }

  return null;
}
