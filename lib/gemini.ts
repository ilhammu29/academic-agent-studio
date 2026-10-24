/**
 * Google Gemini Generative AI Client & WebSocket/Streaming Engine
 * Digunakan untuk:
 * 1. Live Multi-Agent generation streaming
 * 2. Interactive AI Defense & Mock Interview Sempro
 * 3. Ekstraksi sintesis literatur otomatis
 */

export interface GeminiMessage {
  role: 'user' | 'model' | 'system';
  content: string;
}

export const DEFAULT_GEMINI_KEY =
  process.env.GEMINI_API_KEY ||
  '';

export const GEMINI_MODELS = [
  'gemini-flash-latest',
  'gemini-2.5-flash',
  'gemini-pro-latest',
  'gemini-2.5-pro',
];

/**
 * Panggil Gemini API dengan Server-Sent Events / Streaming REST atau Direct Response
 */
export async function callGeminiGenerate(
  prompt: string,
  systemInstruction?: string,
  apiKey: string = DEFAULT_GEMINI_KEY,
  model: string = 'gemini-flash-latest'
): Promise<string> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const payload: any = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 4096,
    },
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000); // 12 detik timeout

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errJson = await response.json().catch(() => null);
      throw new Error(errJson?.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const candidateText =
      data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return candidateText;
  } catch (err: any) {
    console.warn(`Gemini API call failed (${err.message}), utilizing Intelligent Engine fallback.`);
    throw err;
  }
}

/**
 * System Instructions yang menginjeksi 12 Metode Berpikir Ilmiah
 */
export const ACADEMIC_SYSTEM_PROMPT = `Anda adalah Academic Examiner & Senior Research Director berstandar internasional.
Pegang teguh standar penulisan proposal akademik Indonesia (SOP Dikti, STROBE/CONSORT, PRISMA 2020) serta 12 METODE BERPIKIR ILMIAH:
1. First-Principles Thinking (Piramida terbalik, akar masalah sistemik)
2. Second-Order Thinking (Konsekuensi jangka panjang, kelaikan etik)
3. Probabilistic & Bayesian (Rancangan sampling, p-value < 0.05, uji hipotesis)
4. Inversion / Pre-Mortem (Identifikasi potensi kegagalan & mitigasi)
5. Lateral / Divergent (Novelty, kebaruan teknis terhadap paper terdahulu)
6. Dialectical Synthesis (Menyelaraskan kepentingan akademis & industri)
7. Occam's Razor (Stack teknologi efisien & tepat guna)
8. Pareto 80/20 (Fokus pada 20% output bernilai dampak 80%)
9. Critical Falsification (Menguji asumsi agar tidak bias)
10. Analogical Transfer (Mengadopsi pola sukses domain sejenis)
11. Temporal Multi-Horizon (Matriks Gantt roadmap berjangka)
12. Systems / Holistic (Ekosistem menyeluruh & keterhubungan variabel)

Jangan pernah menggunakan kata-kata klise AI slop (delve, tapestry, pivotal, beacon, testament). Gunakan Bahasa Indonesia akademis baku, formal, dan berbobot.`;
