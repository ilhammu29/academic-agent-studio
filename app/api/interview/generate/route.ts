import { NextResponse } from "next/server";
import { DiagnosticQuestion, ProposalCategory } from "@/types/studio";
import { generateDiagnosticQuestions } from "@/lib/questions";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const title = (body.title || "").trim();
    const category: ProposalCategory = body.category || "magang";
    const targetEntity = (body.targetEntity || "").trim();

    if (!title) {
      return NextResponse.json({ error: "Judul harus diisi." }, { status: 400 });
    }

    const customKey = req.headers.get("x-gemini-key");
    const apiKey = customKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

    if (apiKey) {
      try {
        const prompt = `
Bertindaklah sebagai Senior Academic Reviewer & Interviewer Sidang Proposal Kampus.
Pengguna mengajukan usulan proposal:
Judul: "${title}"
Kategori: "${category}" (magang industri atau skripsi/penelitian)
Instansi/Subjek Sasaran: "${targetEntity || "Instansi / Laboratorium Terkait"}"

Tugas Anda adalah merumuskan tepat 4 pertanyaan wawancara diagnostik mendalam untuk menggali detail proposal tersebut sebelum disusun oleh tim agen AI.
Pertanyaan dan saran jawaban (aiSuggestion) HARUS DISESUAIKAN SECARA TEPAT DENGAN RUMPUN ILMU JUDUL (contoh: jika kesehatan/gizi/kedokteran seperti Obesitas, gunakan istilah klinis/antropometri/pola gizi, JANGAN gunakan istilah IT seperti algoritma atau docker).

Format JSON valid tanpa markdown (\`\`\`json):
{
  "questions": [
    {
      "id": "targetDepartment",
      "field": "targetDepartment",
      "question": "Pertanyaan spesifik divisi/unit atau subjek/populasi sasaran...",
      "contextHint": "Petunjuk konteks akademis singkat...",
      "placeholder": "Contoh pengisian ringkas...",
      "aiSuggestion": "Saran jawaban lengkap, formal, dan spesifik yang siap diterapkan...",
      "thinkingModeApplied": "First-Principles Thinking"
    },
    {
      "id": "problemStatement",
      "field": "problemStatement",
      "question": "Pertanyaan mengenai kesenjangan masalah (gap) atau inefisiensi nyata di lapangan...",
      "contextHint": "Petunjuk konteks...",
      "placeholder": "...",
      "aiSuggestion": "Saran jawaban komprehensif berbasis data empiris...",
      "thinkingModeApplied": "Critical / Falsification Thinking"
    },
    {
      "id": "toolsSkillset",
      "field": "toolsSkillset",
      "question": "Pertanyaan mengenai metodologi kerja, alat ukur/instrumen, atau perangkat pendukung...",
      "contextHint": "Petunjuk konteks...",
      "placeholder": "...",
      "aiSuggestion": "Saran daftar alat, metode, atau instrumen yang relevan dengan bidangnya...",
      "thinkingModeApplied": "Occam's Razor"
    },
    {
      "id": "deliverables",
      "field": "deliverables",
      "question": "Pertanyaan mengenai produk kerja nyata (tangible deliverable) atau luaran yang dihasilkan...",
      "contextHint": "Petunjuk konteks...",
      "placeholder": "...",
      "aiSuggestion": "Saran luaran konkret dan terukur (laporan, prototipe, SOP, dsb)...",
      "thinkingModeApplied": "Systems / Holistic Thinking"
    }
  ]
}
`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.6,
                maxOutputTokens: 2048,
              }
            })
          }
        );

        if (geminiRes.ok) {
          const gData = await geminiRes.json();
          const rawText = gData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(cleanJson);
            if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
              return NextResponse.json({
                success: true,
                engine: "gemini-3.5-flash-lite",
                questions: parsed.questions
              });
            }
          }
        }
      } catch (geminiError: any) {
        console.warn("Gemini interview generation call failed, activating smart domain fallback:", geminiError?.message);
      }
    }

    // Fallback: Smart Domain-Aware Question Generator
    const fallbackQuestions = generateDiagnosticQuestions(title, category, targetEntity);
    return NextResponse.json({
      success: true,
      engine: "domain-aware-generator",
      questions: fallbackQuestions
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || "Gagal menghasilkan pertanyaan wawancara."
    }, { status: 500 });
  }
}
