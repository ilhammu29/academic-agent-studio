import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, category, answers, targetEntity, candidateName, institution, customKnowledge } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY belum dikonfigurasi di environment server." },
        { status: 500 }
      );
    }

    const groundingContext = customKnowledge
      ? `\n\n[KNOWLEDGE GROUNDING / REFERENSI KHUSUS DARI PENGGUNA]:\n${customKnowledge}\n(Gunakan referensi khusus di atas sebagai acuan utama dalam menyusun substansi proposal agar sesuai dengan pedoman tersebut).`
      : "";

    const prompt = `
Bertindaklah sebagai AI Academic Proposal Architect yang sangat ahli dalam menyusun proposal profesional dan akademik untuk ${category}.
Buatkan draf proposal lengkap berdasarkan data berikut:
- Judul: ${title}
- Target Entitas / Perusahaan: ${targetEntity}
- Kandidat: ${candidateName}
- Institusi / Kampus: ${institution}
- Hasil Wawancara Diagnostik / Konteks Tambahan: ${JSON.stringify(answers)}${groundingContext}

Format output harus berstruktur JSON yang valid dengan struktur berikut:
{
  "title": "${title}",
  "candidateName": "${candidateName}",
  "institution": "${institution}",
  "chapters": [
    {
      "chapterTitle": "BAB I: PENDAHULUAN",
      "content": "Latar belakang dan rumusan masalah..."
    },
    {
      "chapterTitle": "BAB II: TINJAUAN PUSTAKA & METODOLOGI",
      "content": "Metodologi pelaksanaan dan tahapan..."
    },
    {
      "chapterTitle": "BAB III: RENCANA KERJA & LUARAN",
      "content": "Timeline, milestone, dan hasil yang diharapkan..."
    }
  ]
}
Pastikan isinya sangat formal, analitis, mendalam, dan langsung berikan format JSON murni tanpa markdown backticks tambahan.
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
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

    let jsonParsed;
    try {
      jsonParsed = JSON.parse(cleanedText);
    } catch (e) {
      jsonParsed = {
        title,
        candidateName,
        institution,
        chapters: [
          {
            chapterTitle: "HASIL GENERASI AI",
            content: rawText
          }
        ]
      };
    }

    return NextResponse.json({ success: true, data: jsonParsed });
  } catch (error: any) {
    console.error("Gemini API Grounding Error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menghasilkan dokumen dengan grounding." },
      { status: 500 }
    );
  }
}
