import { NextResponse } from "next/server";
import { DiagnosticQuestion, ProposalCategory } from "@/types/studio";
import { generateDiagnosticQuestions } from "@/lib/questions";
import { callGeminiApi } from "@/lib/geminiApi";

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

Tugas Anda adalah merumuskan 5 hingga 6 pertanyaan wawancara diagnostik mendalam untuk menggali secara tuntas potensi, realitas lapangan, dan metodologi dari judul tersebut sebelum disusun oleh tim agen AI.
Pertanyaan dan saran jawaban (aiSuggestion) HARUS MENGIKUTI PERSEPSI & RUMPUN ILMU DARI JUDUL (contoh: jika kesehatan/gizi/kedokteran seperti Obesitas, gunakan istilah klinis/antropometri/pola gizi/faktor determinan; jika teknik/IT, gunakan istilah rekayasa sistem; jika ekonomi/manajemen, gunakan efisiensi operasional/supply chain/finansial).

Pertanyaan yang harus dicakup:
1. Unit Sasaran / Divisi / Populasi Spesifik (targetDepartment)
2. Gejala Nyata & Akar Masalah Lapangan (problemStatement)
3. Batasan Ruang Lingkup & Asumsi (scopeLimitations)
4. Metodologi Kerja, Alat Ukur & Instrumen Pengumpulan Data (toolsSkillset)
5. Metrik Validasi & Pengujian Keberhasilan (evaluationMetrics)
6. Luaran Nyata / Tangible Deliverables (deliverables)

Format JSON valid tanpa markdown (\`\`\`json):
{
  "questions": [
    {
      "id": "targetDepartment",
      "field": "targetDepartment",
      "question": "Pertanyaan spesifik divisi/unit atau subjek sasaran di lapangan...",
      "contextHint": "Petunjuk konteks akademis singkat...",
      "placeholder": "Contoh pengisian ringkas...",
      "aiSuggestion": "Saran jawaban lengkap, formal, dan spesifik yang siap diterapkan...",
      "thinkingModeApplied": "First-Principles Thinking"
    },
    {
      "id": "problemStatement",
      "field": "problemStatement",
      "question": "Pertanyaan mengenai gap masalah empiris atau inefisiensi nyata yang dihadapi...",
      "contextHint": "Petunjuk konteks...",
      "placeholder": "...",
      "aiSuggestion": "Saran jawaban komprehensif berbasis fakta lapangan...",
      "thinkingModeApplied": "Critical / Falsification Thinking"
    },
    {
      "id": "scopeLimitations",
      "field": "scopeLimitations",
      "question": "Pertanyaan batasan ruang lingkup agar riset/tugas realistis selesai tepat waktu...",
      "contextHint": "Mencegah bias dan topik melebar...",
      "placeholder": "...",
      "aiSuggestion": "Saran batasan lingkup...",
      "thinkingModeApplied": "Boundary Thinking"
    },
    {
      "id": "toolsSkillset",
      "field": "toolsSkillset",
      "question": "Pertanyaan mengenai instrumen ukur, metodologi analisis, atau perangkat kerja yang digunakan...",
      "contextHint": "Petunjuk metodologi...",
      "placeholder": "...",
      "aiSuggestion": "Saran daftar instrumen/metode...",
      "thinkingModeApplied": "Occam's Razor"
    },
    {
      "id": "evaluationMetrics",
      "field": "evaluationMetrics",
      "question": "Pertanyaan mengenai bagaimana keberhasilan intervensi atau hasil riset ini diukur secara objektif...",
      "contextHint": "Metrik ketercapaian...",
      "placeholder": "...",
      "aiSuggestion": "Saran metrik evaluasi...",
      "thinkingModeApplied": "Empirical Verification"
    },
    {
      "id": "deliverables",
      "field": "deliverables",
      "question": "Pertanyaan mengenai produk luaran nyata (dokumen, prototipe, SOP, sistem) yang diserahkan...",
      "contextHint": "Luaran terukur...",
      "placeholder": "...",
      "aiSuggestion": "Saran produk luaran...",
      "thinkingModeApplied": "Systems / Holistic Thinking"
    }
  ]
}
`;

        const geminiResult = await callGeminiApi({
          apiKey,
          prompt,
          temperature: 0.6,
          maxOutputTokens: 2048,
        });

        if (geminiResult && geminiResult.text) {
          const rawText = geminiResult.text;
          const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleanJson);
          if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
            return NextResponse.json({
              success: true,
              engine: geminiResult.model,
              questions: parsed.questions
            });
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
