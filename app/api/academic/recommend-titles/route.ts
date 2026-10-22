import { NextResponse } from "next/server";
import { TitleRecommendation } from "@/lib/titleGenerator";
import { ProposalCategory } from "@/types/studio";

interface SimplePaper {
  title: string;
  venue: string;
  year: number;
  doi?: string;
  authors?: string;
}

async function fetchRealScholarlyPapers(query: string, limit: number = 4): Promise<SimplePaper[]> {
  try {
    // 1. Try OpenAlex
    const openAlexUrl = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per-page=${limit}`;
    const res = await fetch(openAlexUrl, {
      headers: { "User-Agent": "AcademicAgentStudio/1.0 (mailto:academic.agent@studio.local)" },
      signal: AbortSignal.timeout(5000)
    });

    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        return data.results.map((r: any) => ({
          title: r.title || query,
          venue: r.primary_location?.source?.display_name || "Jurnal Ilmiah Terindeks",
          year: r.publication_year || 2024,
          doi: r.doi || undefined,
          authors: (r.authorships || []).map((a: any) => a.author?.display_name).slice(0, 2).join(", ")
        }));
      }
    }
  } catch (e) {
    // Fallback to Crossref
  }

  try {
    const crossrefUrl = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=${limit}`;
    const res = await fetch(crossrefUrl, {
      headers: { "User-Agent": "AcademicAgentStudio/1.0 (mailto:academic.agent@studio.local)" },
      signal: AbortSignal.timeout(5000)
    });

    if (res.ok) {
      const data = await res.json();
      const items = data.message?.items;
      if (items && items.length > 0) {
        return items.map((item: any) => ({
          title: Array.isArray(item.title) ? item.title[0] : item.title || query,
          venue: item["container-title"]?.[0] || item.publisher || "Jurnal Penelitian Terakreditasi",
          year: item.created?.["date-parts"]?.[0]?.[0] || 2024,
          doi: item.DOI ? `https://doi.org/${item.DOI}` : undefined,
          authors: (item.author || []).map((a: any) => `${a.given || ""} ${a.family || ""}`.trim()).filter(Boolean).slice(0, 2).join(", ")
        }));
      }
    }
  } catch (e) {
    // ignore
  }

  return [];
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const query = (body.query || "").trim();

    if (!query) {
      return NextResponse.json({ error: "Kata kunci topik harus diisi." }, { status: 400 });
    }

    const papers = await fetchRealScholarlyPapers(query, 5);
    const customKey = req.headers.get("x-gemini-key");
    const apiKey = customKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

    // 1. Try Gemini generation if API key is provided
    if (apiKey) {
      try {
        const literatureContext = papers.length > 0 
          ? papers.map((p, i) => `${i + 1}. "${p.title}" - ${p.venue} (${p.year}) ${p.doi || ""}`).join("\n")
          : `Topik utama: ${query}`;

        const prompt = `
Bertindaklah sebagai Senior Academic Advisor & Reviewer Proposal Nasional (SOP Dikti & PRISMA 2020).
Berdasarkan topik penelitian/magang: "${query}"
Dan rujukan jurnal ilmiah primer yang ditemukan:
${literatureContext}

Rumuskan tepat 4 usulan judul proposal akademik (kombinasi magang industri dan skripsi) yang sangat spesifik, bermutu tinggi, dan aplikatif.
Keluarkan *hanya* format JSON valid tanpa markdown tambahan atau pengantar:
{
  "recommendations": [
    {
      "id": "rec-1",
      "title": "Judul proposal lengkap yang berbobot dan jelas variabel penelitian/pekerjaannya",
      "category": "magang atau skripsi",
      "entity": "Instansi/perusahaan tujuan atau laboratorium kampus yang relevan",
      "durationMonths": 5 atau 6,
      "referenceJournal": "Nama jurnal ilmiah & tahun",
      "researchGap": "Penjelasan celah riset atau tantangan teknis riil yang diselesaikan",
      "thinkingMode": "First-Principles Thinking / Occam's Razor / Critical Falsification / Systems Thinking"
    }
  ]
}
`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.5,
                maxOutputTokens: 2048,
                responseMimeType: "application/json"
              }
            })
          }
        );

        if (geminiRes.ok) {
          const gData = await geminiRes.json();
          const rawText = gData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            if (parsed.recommendations && Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0) {
              return NextResponse.json({
                success: true,
                engine: "gemini-1.5-flash",
                recommendations: parsed.recommendations,
                papersCount: papers.length
              });
            }
          }
        }
      } catch (geminiError: any) {
        console.warn("Gemini title recommendation failed, using academic heuristic synthesis:", geminiError?.message);
      }
    }

    // 2. Intelligent Academic Heuristic Synthesis (Multi-Domain Fallback)
    const synthesized = synthesizeRecommendations(query, papers);
    return NextResponse.json({
      success: true,
      engine: "academic-heuristic-synthesizer",
      recommendations: synthesized,
      papersCount: papers.length
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || "Gagal menghasilkan rekomendasi judul."
    }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || "Informatika & AI";
  return POST(new Request(req.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  }));
}

function synthesizeRecommendations(query: string, papers: SimplePaper[]): TitleRecommendation[] {
  const clean = query.trim();
  const titleCase = clean.charAt(0).toUpperCase() + clean.slice(1);
  const kw = clean.toLowerCase();

  // Determine domain context
  let defaultEntityMagang = "PT Telkom Indonesia (Persero) Tbk / Mitra Industri";
  let defaultEntitySkripsi = "Laboratorium Riset Terpadu & Pusat Studi";
  let defaultJournal = "Jurnal Riset Terakreditasi SINTA & Scopus (2024)";

  if (kw.includes("medis") || kw.includes("kesehatan") || kw.includes("dokter") || kw.includes("gizi") || kw.includes("farmasi") || kw.includes("klinis")) {
    defaultEntityMagang = "RSUP Dr. Sardjito / Dinas Kesehatan";
    defaultEntitySkripsi = "Fakultas Kedokteran & Laboratorium Biomedis";
    defaultJournal = "The Lancet & Jurnal Kesehatan Masyarakat (2024)";
  } else if (kw.includes("mesin") || kw.includes("sipil") || kw.includes("elektro") || kw.includes("energi") || kw.includes("tambang") || kw.includes("industri")) {
    defaultEntityMagang = "PT Pertamina (Persero) / PT Wijaya Karya";
    defaultEntitySkripsi = "Laboratorium Sistem Energi & Manufaktur";
    defaultJournal = "Applied Energy & Jurnal Rekayasa Sipil (2024)";
  } else if (kw.includes("ekonomi") || kw.includes("akuntansi") || kw.includes("manajemen") || kw.includes("bisnis") || kw.includes("keuangan")) {
    defaultEntityMagang = "Bank Indonesia / Kantor Akuntan Publik / FinTech Nasional";
    defaultEntitySkripsi = "Pusat Studi Ekonomi Pembangunan & Keuangan";
    defaultJournal = "Journal of Business Research & Jurnal Akuntansi Multiparadigma (2024)";
  } else if (kw.includes("pendidikan") || kw.includes("guru") || kw.includes("sekolah") || kw.includes("belajar") || kw.includes("kurikulum")) {
    defaultEntityMagang = "Dinas Pendidikan / Lembaga Penjaminan Mutu Pendidikan (LPMP)";
    defaultEntitySkripsi = "Laboratorium Pembelajaran Inovatif & Pedagogi";
    defaultJournal = "Jurnal Pendidikan Karakter & Cakrawala Pendidikan (2024)";
  } else if (kw.includes("pertanian") || kw.includes("pangan") || kw.includes("tanah") || kw.includes("tanaman") || kw.includes("peternakan")) {
    defaultEntityMagang = "PT Pupuk Indonesia / Balai Penerapan Standar Instrumen Pertanian";
    defaultEntitySkripsi = "Laboratorium Agroteknologi & Ilmu Tanah";
    defaultJournal = "Jurnal Ilmu Pertanian Indonesia & Crop Science (2024)";
  } else if (kw.includes("hukum") || kw.includes("pidana") || kw.includes("perdata") || kw.includes("kebijakan") || kw.includes("pemerintahan")) {
    defaultEntityMagang = "Kejaksaan Negeri / Kantor Advokat & Konsultan Hukum";
    defaultEntitySkripsi = "Pusat Studi Konstitusi & Hak Asasi Manusia";
    defaultJournal = "Jurnal Hukum Pidana & Politik Hukum (2024)";
  }

  const p1 = papers[0];
  const p2 = papers[1];
  const p3 = papers[2];
  const p4 = papers[3];

  return [
    {
      id: "rec-1",
      title: p1 ? `Implementasi dan Benchmarking Metode ${titleCase} Berdasarkan Analisis ${p1.title.replace(/[.:]$/, '')}` : `Implementasi Pipeline Otomasi dan Evaluasi Kinerja ${titleCase} pada Lingkungan Operasional`,
      category: "magang",
      entity: defaultEntityMagang,
      durationMonths: 6,
      referenceJournal: p1 ? `${p1.venue} (${p1.year})` : defaultJournal,
      researchGap: `Kesenjangan antara kerangka teoritis dengan keandalan operasional saat menghadapi latensi dan fluktuasi beban riil pada ${clean}.`,
      thinkingMode: "First-Principles Thinking"
    },
    {
      id: "rec-2",
      title: p2 ? `Analisis Komparatif dan Optimasi Algoritma ${titleCase} Mengacu pada ${p2.title.replace(/[.:]$/, '')}` : `Analisis Komparatif Efektivitas dan Keandalan Metodologi ${titleCase} Melalui Validasi Empiris`,
      category: "skripsi",
      entity: defaultEntitySkripsi,
      durationMonths: 6,
      referenceJournal: p2 ? `${p2.venue} (${p2.year})` : defaultJournal,
      researchGap: `Keterbatasan pengujian empiris berskala riil dan belum adanya parameter pembanding objektif yang terstandarisasi untuk ${clean}.`,
      thinkingMode: "Critical / Falsification Thinking"
    },
    {
      id: "rec-3",
      title: p3 ? `Perancangan Kerangka Kerja dan Evaluasi Risiko Penerapan ${titleCase} (Kajian ${p3.venue})` : `Perancangan Arsitektur Sistem Terintegrasi Berbasis ${titleCase} untuk Akselerasi Transformasi Layanan`,
      category: "magang",
      entity: defaultEntityMagang,
      durationMonths: 6,
      referenceJournal: p3 ? `${p3.venue} (${p3.year})` : defaultJournal,
      researchGap: `Tingginya friksi proses manual yang memicu hambatan skalabilitas dan perlunya arsitektur tata kelola berbasis telemetry pada ${clean}.`,
      thinkingMode: "Occam's Razor"
    },
    {
      id: "rec-4",
      title: p4 ? `Studi Eksperimental Dampak Multi-Variabel ${titleCase} Menggunakan Kerangka Analisis ${p4.title.replace(/[.:]$/, '')}` : `Studi Kelayakan Strategis dan Pemodelan Kausalitas Pengaruh Variabel Kunci terhadap Efektivitas ${titleCase}`,
      category: "penelitian",
      entity: defaultEntitySkripsi,
      durationMonths: 6,
      referenceJournal: p4 ? `${p4.venue} (${p4.year})` : defaultJournal,
      researchGap: `Belum terpetakannya korelasi kausal antar variabel determinan dan konsekuensi jangka panjang penerapan ${clean}.`,
      thinkingMode: "Systems / Holistic Thinking"
    }
  ];
}
