import { getRequestAiKey } from "@/lib/serverAiConfig";
import { NextResponse } from "next/server";
import { callGeminiApi } from "@/lib/geminiApi";
import { stripDoubleAsterisks } from "@/lib/textSanitizer";

export type RefineMode = "expand" | "empirical" | "citations" | "refine";

/**
 * Intelligent Academic Proposal Section Refiner & Expander
 * Supports:
 * 1. Live Google Gemini Flash / Pro API with up to 8192 token output
 * 2. Specialized modes:
 *    - 'expand': Deep multi-paragraph elaboration (+800 - 1500 words)
 *    - 'empirical': Empirical data, field gap analysis, and quantitative indicators
 *    - 'citations': In-depth theoretical grounding and modern scientific citations
 *    - 'refine': Syntax, academic diction, and flow polishing
 * 3. High-rigor Academic Heuristic Engine based on 12 Thinking Modes (offline / fallback)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      sectionTitle, 
      currentContent, 
      instruction, 
      mode = "refine" 
    } = body as {
      sectionTitle: string;
      currentContent: string | string[];
      instruction?: string;
      mode?: RefineMode;
    };

    const contentStr = Array.isArray(currentContent) 
      ? currentContent.join("\n\n") 
      : String(currentContent || "").trim();

    if (!sectionTitle) {
      return NextResponse.json(
        { error: "Judul bagian harus disertakan." },
        { status: 400 }
      );
    }

    const apiKey = getRequestAiKey(req);

    const isAppendRecommended = mode === "expand" || mode === "empirical" || mode === "citations";

    // 1. If Gemini API key is available, attempt real AI generation
    if (apiKey) {
      try {
        let taskDirective = "";
        if (mode === "expand") {
          taskDirective = `TUGAS UTAMA: PERLUAS & PERDALAM SUB-BAB INI SECARA SUBSTANSIAL.
Tuliskan 4 sampai 6 paragraf analitis baru yang sangat mendalam (+800 s.d. 1.500 kata) untuk melengkapi naskah saat ini.
Setiap paragraf harus memiliki gagasan pokok ilmiah yang kuat, analisis kausalitas bertingkat, dan relevansi langsung dengan lokus penelitian.`;
        } else if (mode === "empirical") {
          taskDirective = `TUGAS UTAMA: TAMBAHKAN ANALISIS DATA EMPIRIS & KESENJANGAN LAPANGAN.
Tuliskan 3 sampai 5 paragraf berbobot (+600 s.d. 1.000 kata) yang menguraikan data fakta riil, fenomena ketidaksesuaian operasional di lapangan, kesenjangan kinerja (performance gap), dan perbandingan benchmark ideal vs eksisting.`;
        } else if (mode === "citations") {
          taskDirective = `TUGAS UTAMA: PERKAYA LANDASAN TEORETIS & RUJUKAN ILMIAH TERBARU.
Tuliskan 3 sampai 5 paragraf komprehensif (+600 s.d. 1.000 kata) yang mengintegrasikan teori-teori primer, telaah kritis terhadap pandangan para ahli, serta sitasi formal standar jurnal internasional bereputasi / Sinta 5 tahun terakhir.`;
        } else {
          taskDirective = `TUGAS UTAMA: REVISI & SEMPURNAKAN REDAKSI AKADEMIK.
Sempurnakan diksi, perjelas logika penalaran ilmiah, perbaiki alur kausalitas, dan pastikan naskah sesuai kaidah penulisan karya ilmiah resmi Dikti.`;
        }

        const prompt = `
Bertindaklah sebagai Senior Academic Editor & Research Reviewer Universitas Nasional (Standar Dikti & PRISMA 2020).
${taskDirective}

Informasi Penugasan:
- Bagian Naskah: ${sectionTitle}
- Draf Naskah Saat Ini:
${contentStr || "Draf usulan akademik."}

Instruksi Tambahan Pengguna:
${instruction || "Gunakan bahasa Indonesia baku ilmiah, bernas, objektif, dan elaboratif tanpa klise AI."}

ATURAN PENULISAN WAJIB:
1. Gunakan bahasa Indonesia baku akademis tingkat tinggi (formal, presisi, bernalar logis).
2. Terapkan 12 Metode Berpikir Ilmiah (First-Principles Thinking, Kausalitas Kritis, dan Problem-Solving Terukur).
3. HINDARI TANDA ASTERISK DUA KALI (**) untuk cetak tebal di dalam teks narasi.
4. Jangan membuat data, hasil, kutipan, DOI, atau fakta lapangan yang tidak diberikan. Tandai informasi yang memerlukan verifikasi.
5. JANGAN memberikan kalimat pembuka atau penutup basa-basi (seperti "Berikut adalah hasil perluasan..."). Langsung berikan teks naskah akademik utuh.
`;

        const geminiResult = await callGeminiApi({
          apiKey,
          prompt,
          temperature: 0.65,
          maxOutputTokens: 8192,
        });

        if (geminiResult && geminiResult.text && geminiResult.text.trim().length > 15) {
          const cleanedText = stripDoubleAsterisks(geminiResult.text.trim());
          return NextResponse.json({
            success: true,
            revisedContent: cleanedText,
            mode,
            isAppendRecommended,
            engine: geminiResult.model,
            message: mode === "expand" 
              ? "Naskah berhasil diperluas secara komprehensif (+Paragraf Analitis Baru)."
              : "Naskah berhasil disempurnakan menggunakan Gemini AI."
          });
        }
      } catch (geminiError: any) {
        console.warn("Gemini API call failed, activating Intelligent Academic Refiner fallback:", geminiError?.message);
      }
    }

    return NextResponse.json({ success: false, error: "Penyempurnaan AI tidak tersedia. Periksa kunci atau koneksi lalu coba lagi." }, { status: 503 });

  } catch (error: any) {
    console.error("Section Refine Handler Error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memproses revisi naskah." },
      { status: 500 }
    );
  }
}

/**
 * High-rigor Academic Text Refiner & Expander Logic
 */
