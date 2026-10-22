import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sectionTitle, currentContent, instruction } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY belum dikonfigurasi di environment server." },
        { status: 500 }
      );
    }

    const prompt = `
Bertindaklah sebagai AI Academic Editor yang ahli dalam menyempurnakan naskah proposal akademik.
Tugas Anda adalah merevisi atau menulis ulang bagian naskah berikut berdasarkan instruksi pengguna.

Judul Bagian / Bab: ${sectionTitle}
Naskah / Konten Saat Ini:
${currentContent}

Instruksi Revisi dari Pengguna:
${instruction}

Berikan *hanya* hasil naskah yang sudah direvisi secara profesional, formal, dan akademis. Jangan sertakan teks pengantar atau penutup seperti "Berikut adalah hasil revisinya:", langsung berikan isi naskahnya saja dalam format teks/markdown bersih.
`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return NextResponse.json(
        { error: `Gemini API Error: ${errText}` },
        { status: geminiRes.status }
      );
    }

    const data = await geminiRes.json();
    const revisedText = data?.candidates?.[0]?.content?.parts?.[0]?.text || currentContent;

    return NextResponse.json({ success: true, revisedContent: revisedText.trim() });
  } catch (error: any) {
    console.error("Gemini Section Refine Error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal merevisi bagian naskah dengan AI." },
      { status: 500 }
    );
  }
}
