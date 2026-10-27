import { getRequestAiKey } from "@/lib/serverAiConfig";
import { NextResponse } from "next/server";
import { callGeminiApi } from "@/lib/geminiApi";
import { sanitizeAcademicText } from "@/lib/textSanitizer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const apiKey = getRequestAiKey(req);

    const {
      title = "Judul Penelitian",
      category = "skripsi",
      targetCount = 13,
      currentTheories = [],
      domain = "general"
    } = body;

    if (apiKey) {
      try {
        const prompt = `
Sebagai Dewan Penguji & Pakar Metodologi Penelitian Nasional, buatkan TEPAT ${targetCount} LANDASAN TEORI & KERANGKA KONSEPTUAL ILMIAH yang otoritatif untuk judul:
"${title}" (Kategori: ${category}, Domain: ${domain}).

Instruksi:
Jangan mengarang DOI atau metadata. Jika tidak yakin, kosongkan dan beri penanda untuk verifikasi pengguna.
1. Setiap teori wajib memiliki:
   - "topic": Nama teori atau kerangka kerja spesifik (misal: "Teori Perilaku Terencana (Theory of Planned Behavior)", "Model Penerimaan Teknologi (TAM)", "Prinsip Antropometri Gibson", dll.)
   - "elaboration": 2-3 kalimat penjelasan mendalam mengenai mekanisme konseptual dan bagaimana teori ini mendasari pemecahan masalah pada judul.
   - "citation": Sitasi formal dalam kurung, misal "(Ajzen, 1991; Davis, 1989)"
2. Setiap teori WAJIB memiliki entri pustaka (bibliography item) yang sinkron dan lengkap:
   - "author": Penulis (misal "Ajzen, I.")
   - "year": Tahun terbit (misal "1991")
   - "title": Judul buku atau artikel jurnal primer
   - "source": Nama jurnal ilmiah / penerbit bereputasi
   - "doiUrl": Tautan DOI atau URL resmi rujukan

Balas HANYA dengan format JSON valid tanpa markdown fence:
{
  "theories": [
    {
      "topic": "...",
      "elaboration": "...",
      "citation": "..."
    }
  ],
  "bibliography": [
    {
      "id": 1,
      "author": "...",
      "year": "...",
      "title": "...",
      "source": "...",
      "doiUrl": "..."
    }
  ]
}
`;

        const result = await callGeminiApi({ apiKey, prompt, temperature: 0.65, maxOutputTokens: 8192, responseMimeType: "application/json" });
        if (result?.text) {
          const parsed = JSON.parse(result.text.replace(/```json/gi, "").replace(/```/g, "").trim());
          if (Array.isArray(parsed.theories)) {
            return NextResponse.json({ success: true, theories: sanitizeAcademicText(parsed.theories), bibliography: sanitizeAcademicText(parsed.bibliography || []), engine: result.model });
          }
        }
      } catch (err: any) {
        console.warn("Gemini expand theories failed, using heuristic synthesizer:", err?.message);
      }
    }

    return NextResponse.json({
      success: false,
      error: "Perluasan teori tidak tersedia. Periksa kunci AI dan coba lagi; sumber harus diverifikasi secara manual."
    }, { status: 503 });
  } catch (error: any) {
    console.error("Error in expand-theories API:", error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
