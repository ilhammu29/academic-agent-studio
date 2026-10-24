import { NextResponse } from "next/server";
import { CampusGuideline } from "@/types/studio";
import { callGeminiApi } from "@/lib/geminiApi";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text = "", filename = "Pedoman_Kampus.pdf" } = body;

    const trimmedText = String(text || "").trim();

    if (!trimmedText && !filename) {
      return NextResponse.json(
        { error: "Mohon sediakan isi teks atau berkas pedoman penulisan kampus." },
        { status: 400 }
      );
    }

    const customKey = req.headers.get("x-gemini-key");
    const apiKey = customKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

    // 1. Try Live Gemini 3.5 Flash Lite AI Scanning
    if (apiKey && trimmedText.length > 20) {
      try {
        const prompt = `
Anda adalah Senior Academic Affairs Auditor & Ahli Regulasi Buku Panduan Skripsi/Magang Perguruan Tinggi Indonesia.
Tugas Anda adalah membaca dan menganalisis potongan/isi buku pedoman penulisan berikut:

Nama Berkas: "${filename}"
Isi Teks Pedoman:
"""
${trimmedText.slice(0, 15000)}
"""

Ekstrak seluruh parameter tata letak, margin, font, penomoran, dan lembar pengesahan ke dalam format JSON yang valid persis seperti skema ini:
{
  "campusName": "Nama Perguruan Tinggi (misal: Universitas Gadjah Mada / Institut Teknologi Bandung / Universitas Brawijaya)",
  "facultyMajor": "Fakultas atau Program Studi (jika tertera, atau biarkan umum)",
  "guideDocTitle": "Judul resmi buku panduan (misal: Pedoman Penulisan Tugas Akhir 2024)",
  "paperSize": "A4",
  "margins": {
    "topCm": 4,
    "bottomCm": 3,
    "leftCm": 4,
    "rightCm": 3
  },
  "typography": {
    "fontFamily": "Times New Roman",
    "bodySizePt": 12,
    "heading1SizePt": 14,
    "lineSpacing": 1.5
  },
  "headingStyle": "decimal",
  "citationStyle": "apa",
  "approvalConfig": {
    "supervisorCount": 2,
    "requiresHeadOfProgram": true,
    "requiresDeanOrFieldMentor": false
  },
  "extractedNotes": [
    "Catatan penting 1 mengenai format khusus kampus ini",
    "Catatan penting 2 mengenai lembar pengesahan atau rujukan"
  ]
}

PANDUAN LOGIKA EKSTRAKSI:
- Untuk "margins": cari angka margin kertas (contoh 4-4-3-3 atau 4-3-3-3 atau 3-3-3-3 cm). Jika tidak eksplisit disebut, default standar Indonesia adalah leftCm: 4, topCm: 4, rightCm: 3, bottomCm: 3.
- Untuk "headingStyle": pilih "decimal" jika pakai 1.1, 1.2; atau "alphanumeric" jika pakai A., 1., a.; atau "roman" jika I.1, I.2.
- Untuk "citationStyle": pilih "apa" jika pakai nama-tahun (Sugiyono, 2020), atau "ieee" jika pakai kurung siku numerik [1], atau "harvard" / "vancouver".
- Wajib kembalikan HANYA string JSON murni (valid JSON) tanpa backtick markdown dan tanpa teks pembuka.
`;

        const geminiResult = await callGeminiApi({
          apiKey,
          prompt,
          temperature: 0.2,
          maxOutputTokens: 2048,
        });

        if (geminiResult && geminiResult.text) {
          const rawText = geminiResult.text;
          try {
            const cleanJson = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
            const parsed: CampusGuideline = JSON.parse(cleanJson);
            return NextResponse.json({
              success: true,
              engine: geminiResult.model,
              guideline: parsed
            });
          } catch (pErr) {
            console.warn("Gemini JSON parse fallback:", pErr);
          }
        }
      } catch (geminiErr) {
        console.warn("Gemini scan guideline error, switching to heuristic fallback:", geminiErr);
      }
    }

    // 2. Intelligent Heuristic Extraction (Offline / Fallback)
    const lower = (trimmedText + " " + filename).toLowerCase();

    // Check margin clues
    let leftCm = 4;
    let topCm = 4;
    let rightCm = 3;
    let bottomCm = 3;

    if (lower.includes("4-3-3-3") || lower.includes("kiri 4 cm, atas 3 cm") || lower.includes("margin kiri 4, atas 3")) {
      topCm = 3;
    } else if (lower.includes("3-3-3-3") || lower.includes("margin 3 cm keliling")) {
      leftCm = 3;
      topCm = 3;
    }

    // Check font clues
    let fontFamily = "Times New Roman";
    if (lower.includes("calibri")) fontFamily = "Calibri";
    else if (lower.includes("arial")) fontFamily = "Arial";

    // Check spacing clues
    let lineSpacing = 1.5;
    if (lower.includes("spasi ganda") || lower.includes("spasi 2") || lower.includes("2.0 spasi")) {
      lineSpacing = 2.0;
    }

    // Check citation clues
    let citationStyle: "apa" | "ieee" | "harvard" | "vancouver" = "apa";
    if (lower.includes("ieee") || lower.includes("numerik") || lower.includes("kurung siku [")) {
      citationStyle = "ieee";
    } else if (lower.includes("vancouver")) {
      citationStyle = "vancouver";
    } else if (lower.includes("harvard")) {
      citationStyle = "harvard";
    }

    // Check heading style
    let headingStyle: "decimal" | "alphanumeric" | "roman" = "decimal";
    if (lower.includes("a. ") || lower.includes("huruf besar a") || lower.includes("alphanumeric")) {
      headingStyle = "alphanumeric";
    }

    // Infer campus name from text or filename
    let campusName = "Perguruan Tinggi Terakreditasi";
    if (lower.includes("gadjah mada") || lower.includes("ugm")) campusName = "Universitas Gadjah Mada (UGM)";
    else if (lower.includes("indonesia") || lower.includes("ui ")) campusName = "Universitas Indonesia (UI)";
    else if (lower.includes("bandung") || lower.includes("itb")) campusName = "Institut Teknologi Bandung (ITB)";
    else if (lower.includes("sepuluh nopember") || lower.includes("its")) campusName = "Institut Teknologi Sepuluh Nopember (ITS)";
    else if (lower.includes("diponegoro") || lower.includes("undip")) campusName = "Universitas Diponegoro (Undip)";
    else if (lower.includes("airlangga") || lower.includes("unair")) campusName = "Universitas Airlangga (Unair)";
    else if (lower.includes("telkom")) campusName = "Telkom University";
    else if (lower.includes("binus") || lower.includes("bina nusantara")) campusName = "Universitas Bina Nusantara (BINUS)";
    else if (lower.includes("mbkm") || lower.includes("magang bersertifikat")) campusName = "Pedoman Magang MBKM Kemendikbudristek";
    else if (filename.length > 4) {
      campusName = filename.replace(/\.(pdf|docx|txt)$/i, "").replace(/[_-]/g, " ");
    }

    const fallbackGuideline: CampusGuideline = {
      campusName,
      guideDocTitle: `Pedoman Penulisan Hasil Pemindaian (${filename})`,
      paperSize: "A4",
      margins: { topCm, bottomCm, leftCm, rightCm },
      typography: { fontFamily, bodySizePt: 12, heading1SizePt: 14, lineSpacing },
      headingStyle,
      citationStyle,
      approvalConfig: {
        supervisorCount: 2,
        requiresHeadOfProgram: true,
        requiresDeanOrFieldMentor: lower.includes("magang") || lower.includes("mentor")
      },
      extractedNotes: [
        `Margin terdeteksi: Kiri ${leftCm}cm, Atas ${topCm}cm, Kanan ${rightCm}cm, Bawah ${bottomCm}cm.`,
        `Format tipografi: Font ${fontFamily} 12pt dengan spasi baris ${lineSpacing}.`,
        `Gaya sitasi terpetakan: ${citationStyle.toUpperCase()} Standard.`,
        `Struktur penomoran sub-bab: ${headingStyle === "decimal" ? "Desimal (1.1, 1.2)" : "Abjad-Angka (A., 1., a.)"}.`
      ]
    };

    return NextResponse.json({
      success: true,
      engine: "heuristic-parser",
      guideline: fallbackGuideline
    });
  } catch (err: any) {
    console.error("Scan guideline route error:", err);
    return NextResponse.json(
      { error: "Gagal memproses berkas pedoman: " + (err.message || "Unknown error") },
      { status: 500 }
    );
  }
}
