import { NextResponse } from "next/server";
import { TitleRecommendation } from "@/lib/titleGenerator";
import { ProposalCategory } from "@/types/studio";
import { callGeminiApi } from "@/lib/geminiApi";
import { sanitizeAcademicText } from "@/lib/textSanitizer";

interface SimplePaper {
  title: string;
  venue: string;
  year: number;
  doi?: string;
  authors?: string;
}

async function fetchRealScholarlyPapers(query: string, limit: number = 4): Promise<SimplePaper[]> {
  try {
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
    const mode = body.mode || "ai-pure"; // 'ai-pure' (default) or 'literature'

    if (!query) {
      return NextResponse.json({ error: "Kata kunci topik harus diisi." }, { status: 400 });
    }

    const papers = mode === "literature" ? await fetchRealScholarlyPapers(query, 5) : [];
    const customKey = req.headers.get("x-gemini-key");
    const apiKey = customKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

    // 1. Try Gemini generation if API key is provided
    if (apiKey) {
      try {
        let prompt = "";

        if (mode === "literature" && papers.length > 0) {
          const literatureContext = papers
            .map((p, i) => `${i + 1}. "${p.title}" - ${p.venue} (${p.year}) ${p.doi || ""}`)
            .join("\n");

          prompt = `
Bertindaklah sebagai Senior Academic Advisor & Reviewer Proposal Nasional (SOP Dikti & PRISMA 2020).
Berdasarkan topik penelitian/magang: "${query}"
Dan rujukan jurnal ilmiah primer yang ditemukan:
${literatureContext}

Rumuskan tepat 4 usulan judul proposal akademik (kombinasi magang industri dan skripsi) yang sangat spesifik, bermutu tinggi, dan aplikatif.
SESUAIKAN DENGAN RUMPUN ILMU TOPIK (Contoh: jika topik kesehatan/gizi/medis seperti Obesitas, gunakan terminologi medis/gizi/epidemiologi, JANGAN gunakan istilah IT seperti 'algoritma' atau 'pipeline').
Keluarkan *hanya* format JSON valid tanpa tanda kutip markdown (\`\`\`json):
{
  "recommendations": [
    {
      "id": "rec-1",
      "title": "Judul proposal lengkap dan alami sesuai kaidah bahasa Indonesia akademik",
      "category": "magang atau skripsi",
      "entity": "Instansi/perusahaan tujuan atau laboratorium kampus yang relevan",
      "durationMonths": 5 atau 6,
      "referenceJournal": "Nama jurnal ilmiah & tahun rujukan",
      "researchGap": "Penjelasan celah riset atau urgensi masalah riil yang diselesaikan",
      "thinkingMode": "First-Principles Thinking / Occam's Razor / Critical Falsification / Systems Thinking"
    }
  ]
}
`;
        } else {
          // AI PURE MODE (Default: AI bebas menentukan judul sesuai rumpun ilmu)
          prompt = `
Bertindaklah sebagai Senior Academic Committee & Research Proposal Director.
Pengguna ingin merumuskan usulan judul proposal akademik untuk topik: "${query}".

Tugas Anda adalah merumuskan tepat 4 usulan judul proposal akademik bermutu tinggi (2 Skripsi dan 2 Magang Industri) yang ALAMI, PRESISI, dan SESUAI DENGAN RUMPUN ILMUNYA.

PENTING - ATURAN BIDANG ILMU:
1. Jika topik Kesehatan / Gizi / Medis (misal: Obesitas, Stunting, Diabetes, Hipertensi, Farmasi):
   - Gunakan pendekatan klinis, epidemiologi, faktor risiko, intervensi pola hidup/gizi, atau evaluasi program kesehatan masyarakat.
   - DILARANG memaksakan istilah IT seperti "algoritma", "pipeline", "benchmarking software", kecuali diminta secara eksplisit.
2. Jika topik Pendidikan / Guru:
   - Gunakan pendekatan model pembelajaran, efektivitas kurikulum, asesmen kompetensi, media ajar.
3. Jika topik Ekonomi / Manajemen / Bisnis:
   - Gunakan pendekatan strategi pemasaran, kinerja keuangan, perilaku konsumen, audit tata kelola.
4. Jika topik Teknik / Sains / IT:
   - Gunakan istilah rekayasa, rancang bangun sistem, optimasi parameter, atau arsitektur yang relevan.

Keluarkan *hanya* format JSON valid:
{
  "recommendations": [
    {
      "id": "rec-1",
      "title": "Judul proposal lengkap yang berbobot dan alami",
      "category": "skripsi atau magang",
      "entity": "Nama instansi/rumah sakit/perusahaan/laboratorium yang sesuai",
      "durationMonths": 6,
      "referenceJournal": "Jurnal bidang terkait terindeks Scopus/SINTA (misal: The Lancet, Jurnal Gizi Klinik, dsb)",
      "researchGap": "Penjelasan kesenjangan riset atau tantangan di lapangan",
      "thinkingMode": "First-Principles Thinking / Occam's Razor / Critical Falsification / Systems Thinking"
    }
  ]
}
`;
        }

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
          if (parsed.recommendations && Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0) {
            return NextResponse.json({
              success: true,
              engine: geminiResult.model,
              mode,
              recommendations: sanitizeAcademicText(parsed.recommendations),
              papersCount: papers.length
            });
          }
        }
      } catch (geminiError: any) {
        console.warn("Gemini title recommendation call failed, activating smart domain synthesis:", geminiError?.message);
      }
    }

    // 2. Intelligent Academic Heuristic Synthesis (Domain-Specific, Zero Forced IT Jargon)
    const synthesized = synthesizeDomainAwareRecommendations(query, mode, papers);
    return NextResponse.json({
      success: true,
      engine: "domain-aware-synthesizer",
      mode,
      recommendations: sanitizeAcademicText(synthesized),
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
  const mode = searchParams.get("mode") || "ai-pure";
  return POST(new Request(req.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, mode })
  }));
}

function synthesizeDomainAwareRecommendations(
  query: string,
  mode: string,
  papers: SimplePaper[]
): TitleRecommendation[] {
  const clean = query.trim();
  const titleCase = clean.charAt(0).toUpperCase() + clean.slice(1);
  const kw = clean.toLowerCase();

  // 1. Health / Nutrition / Medicine / Clinical Domain (e.g. Obesitas, Stunting, Diabetes)
  if (
    kw.includes("obesitas") ||
    kw.includes("medis") ||
    kw.includes("kesehatan") ||
    kw.includes("gizi") ||
    kw.includes("dokter") ||
    kw.includes("klinis") ||
    kw.includes("stunting") ||
    kw.includes("diabetes") ||
    kw.includes("farmasi")
  ) {
    return [
      {
        id: "rec-med-1",
        title: `Analisis Faktor Risiko dan Pengaruh Pola Konsumsi terhadap Angka Kejadian ${titleCase} pada Populasi Remaja Urban`,
        category: "skripsi",
        entity: "RSUP Dr. Sardjito / Laboratorium Gizi Klinis FK-KMK",
        durationMonths: 6,
        referenceJournal: "The Lancet & Jurnal Gizi Klinik Indonesia (2024)",
        researchGap: `Kesenjangan antara edukasi gizi teoritis dengan kebiasaan sedentary lifestyle dan konsumsi makanan olahan cepat saji pada ${clean}.`,
        thinkingMode: "First-Principles Thinking"
      },
      {
        id: "rec-med-2",
        title: `Evaluasi Efektivitas Program Intervensi Gizi Seimbang dan Modifikasi Perilaku Hidup Sehat dalam Pengendalian ${titleCase}`,
        category: "magang",
        entity: "Dinas Kesehatan Kota & Unit Pelayanan Kesehatan Masyarakat (Puskesmas)",
        durationMonths: 6,
        referenceJournal: "Asia Pacific Journal of Clinical Nutrition (2024)",
        researchGap: `Kurangnya evaluasi longitudinal terhadap retensi kepatuhan diet dan aktivitas fisik pasca-intervensi primer pada ${clean}.`,
        thinkingMode: "Probabilistic & Bayesian Updating"
      },
      {
        id: "rec-med-3",
        title: `Korelasi Kadar Profil Lipid Serum dan Indeks Massa Tubuh (IMT) terhadap Risiko Komorbiditas pada Pasien ${titleCase}`,
        category: "skripsi",
        entity: "Rumah Sakit Akademik / Laboratorium Patologi Klinik",
        durationMonths: 6,
        referenceJournal: "Journal of Clinical Medicine & Endocrinology (2023)",
        researchGap: `Belum dipetakannya variasi biomarker inflamasi spesifik pada kelompok usia produktif penderita ${clean}.`,
        thinkingMode: "Critical / Falsification Thinking"
      },
      {
        id: "rec-med-4",
        title: `Perancangan Program Manajemen Terpadu dan Edukasi Preventif Pencegahan ${titleCase} Berbasis Komunitas`,
        category: "magang",
        entity: "Pusat Promosi Kesehatan / LSM Kesehatan Masyarakat",
        durationMonths: 6,
        referenceJournal: "BMC Public Health & Jurnal Kesehatan Masyarakat (2024)",
        researchGap: `Tingginya stigma berat badan dan rendahnya keterlibatan keluarga dalam program pendampingan pasien ${clean}.`,
        thinkingMode: "Systems / Holistic Thinking"
      }
    ];
  }

  // 2. Education & Pedagogy Domain
  if (
    kw.includes("pendidikan") ||
    kw.includes("guru") ||
    kw.includes("sekolah") ||
    kw.includes("belajar") ||
    kw.includes("siswa") ||
    kw.includes("kurikulum")
  ) {
    return [
      {
        id: "rec-edu-1",
        title: `Efektivitas Pendekatan Pembelajaran Berdiferensiasi dalam Meningkatkan Kemampuan Berpikir Kritis Siswa pada Materi ${titleCase}`,
        category: "skripsi",
        entity: "Laboratorium Pedagogi & Sekolah Menengah Mitra Kampus",
        durationMonths: 6,
        referenceJournal: "Jurnal Pendidikan Karakter & Cakrawala Pendidikan (2024)",
        researchGap: `Keterbatasan instrumen asesmen formatif adaptif yang dapat mengukur gaya belajar heterogen siswa pada ${clean}.`,
        thinkingMode: "First-Principles Thinking"
      },
      {
        id: "rec-edu-2",
        title: `Implementasi Manajemen Mutu Pembelajaran dan Evaluasi Ketercapaian Kurikulum Terpadu Berbasis ${titleCase}`,
        category: "magang",
        entity: "Dinas Pendidikan / Lembaga Penjaminan Mutu Pendidikan (LPMP)",
        durationMonths: 6,
        referenceJournal: "Educational Management Administration & Leadership (2024)",
        researchGap: `Kesenjangan standarisasi kompetensi guru dalam merancang perangkat ajar kontekstual berbasis ${clean}.`,
        thinkingMode: "Occam's Razor"
      },
      {
        id: "rec-edu-3",
        title: `Pengembangan Media Pembelajaran Interaktif dan Analisis Respon Minat Belajar Siswa terhadap ${titleCase}`,
        category: "skripsi",
        entity: "Pusat Sumber Belajar & Riset Inovasi Kurikulum",
        durationMonths: 5,
        referenceJournal: "Computers & Education (2023)",
        researchGap: `Media konvensional kurang mendorong retensi pemahaman konsep abstrak pada pembelajaran ${clean}.`,
        thinkingMode: "Inversion / Pre-Mortem Thinking"
      },
      {
        id: "rec-edu-4",
        title: `Pendampingan Program Penguatan Karakter dan Budaya Literasi Siswa Berbasis ${titleCase}`,
        category: "magang",
        entity: "Balai Pengembangan Media Pendidikan & Kebudayaan",
        durationMonths: 6,
        referenceJournal: "Jurnal Ilmu Pendidikan (2024)",
        researchGap: `Minimnya keterlibatan lingkungan non-formal dalam memperkuat integrasi nilai karakter pada ${clean}.`,
        thinkingMode: "Systems / Holistic Thinking"
      }
    ];
  }

  // 3. Economy, Accounting, & Business Domain
  if (
    kw.includes("ekonomi") ||
    kw.includes("bisnis") ||
    kw.includes("manajemen") ||
    kw.includes("akuntansi") ||
    kw.includes("keuangan") ||
    kw.includes("pemasaran")
  ) {
    return [
      {
        id: "rec-eco-1",
        title: `Pengaruh Kualitas Layanan Digital dan Literasi Finansial terhadap Keputusan Penggunaan ${titleCase} pada UMKM`,
        category: "skripsi",
        entity: "Pusat Inkubasi Bisnis & Riset Ekonomi Terapan",
        durationMonths: 6,
        referenceJournal: "Journal of Business Research & Jurnal Manajemen (2024)",
        researchGap: `Tingkat resistensi adopsi transaksi non-tunai akibat kekhawatiran keamanan siber dan pencatatan manual pada ${clean}.`,
        thinkingMode: "First-Principles Thinking"
      },
      {
        id: "rec-eco-2",
        title: `Analisis Efisiensi Biaya Operasional dan Kepatuhan Tata Kelola Pengendalian Internal pada Siklus ${titleCase}`,
        category: "magang",
        entity: "Kantor Akuntan Publik / Divisi Keuangan Korporasi Mitra",
        durationMonths: 6,
        referenceJournal: "The Accounting Review & Jurnal Akuntansi Multiparadigma (2024)",
        researchGap: `Inefisiensi rekonsiliasi data transaksi periodik yang menghambat akurasi laporan keuangan pada ${clean}.`,
        thinkingMode: "Occam's Razor"
      },
      {
        id: "rec-eco-3",
        title: `Strategi Pemasaran Omnichannel dan Analisis Loyalitas Konsumen dalam Meningkatkan Pangsa Pasar ${titleCase}`,
        category: "magang",
        entity: "Perusahaan E-Commerce / Retail Nasional",
        durationMonths: 6,
        referenceJournal: "Journal of Marketing Theory and Practice (2023)",
        researchGap: `Tingginya friksi pengalaman belanja lintas saluran (online-to-offline) pada kategori produk ${clean}.`,
        thinkingMode: "Second-Order Thinking"
      },
      {
        id: "rec-eco-4",
        title: `Studi Kelayakan Investasi dan Pemodelan Mitigasi Risiko Kredit UMKM Sektor ${titleCase}`,
        category: "skripsi",
        entity: "Bank Pembangunan Daerah / Lembaga Keuangan Mikro",
        durationMonths: 5,
        referenceJournal: "Journal of Financial Stability (2024)",
        researchGap: `Ketiadaan kerangka scoring kredit alternatif berbasis data arus kas operasional harian pada ${clean}.`,
        thinkingMode: "Probabilistic & Bayesian Updating"
      }
    ];
  }

  // 4. Agriculture & Food Domain
  if (
    kw.includes("pertanian") ||
    kw.includes("pangan") ||
    kw.includes("tanah") ||
    kw.includes("tanaman") ||
    kw.includes("agrotek")
  ) {
    return [
      {
        id: "rec-agr-1",
        title: `Pengaruh Variasi Dosis Pupuk Organik Cair terhadap Pertumbuhan dan Produktivitas Komoditas ${titleCase}`,
        category: "skripsi",
        entity: "Kebun Percobaan & Laboratorium Ilmu Tanah Agroteknologi",
        durationMonths: 6,
        referenceJournal: "Jurnal Ilmu Pertanian Indonesia & Crop Science (2024)",
        researchGap: `Keterbatasan formulasi nutrisi organik yang mampu mempertahankan stabilitas hara pada fluktuasi iklim mikro ${clean}.`,
        thinkingMode: "First-Principles Thinking"
      },
      {
        id: "rec-agr-2",
        title: `Penerapan Standar Budidaya Pertanian Baik (Good Agricultural Practices) pada Pasca-Panen ${titleCase}`,
        category: "magang",
        entity: "PT Pupuk Indonesia / Balai Standardisasi Instrumen Pertanian (BSIP)",
        durationMonths: 6,
        referenceJournal: "Journal of Agricultural and Food Chemistry (2024)",
        researchGap: `Tingginya persentase susut mutu hasil panen (post-harvest losses) akibat keterbatasan rantai dingin pada ${clean}.`,
        thinkingMode: "Occam's Razor"
      },
      {
        id: "rec-agr-3",
        title: `Analisis Tingkat Kesuburan Kimiawi Tanah dan Karakteristik Mikrobioma pada Lahan Budidaya ${titleCase}`,
        category: "skripsi",
        entity: "Balai Penelitian Tanah & Agro-Klimatologi",
        durationMonths: 6,
        referenceJournal: "Soil Biology and Biochemistry (2023)",
        researchGap: `Penurunan kualitas agregat tanah akibat residu pupuk kimia berkepanjangan pada areal budidaya ${clean}.`,
        thinkingMode: "Critical / Falsification Thinking"
      },
      {
        id: "rec-agr-4",
        title: `Manajemen Rantai Pasok dan Kemitraan Petani dalam Menjaga Stabilitas Distribusi ${titleCase}`,
        category: "magang",
        entity: "Perum BULOG / Dinas Pertanian dan Ketahanan Pangan",
        durationMonths: 6,
        referenceJournal: "Food Policy & Jurnal Manajemen Agribisnis (2024)",
        researchGap: `Disparitas harga di tingkat produsen dan pasar induk akibat rantai distribusi perantara yang panjang pada ${clean}.`,
        thinkingMode: "Systems / Holistic Thinking"
      }
    ];
  }

  // 5. Law & Governance Domain
  if (
    kw.includes("hukum") ||
    kw.includes("pidana") ||
    kw.includes("perdata") ||
    kw.includes("kebijakan") ||
    kw.includes("konstitusi")
  ) {
    return [
      {
        id: "rec-law-1",
        title: `Tinjauan Yuridis Perlindungan Hak Korban dan Batas Pertanggungjawaban Pidana dalam Kasus ${titleCase}`,
        category: "skripsi",
        entity: "Laboratorium Hukum & Pusat Studi Konstitusi Peradilan",
        durationMonths: 6,
        referenceJournal: "Jurnal Hukum Ius Quia Iustum & Jurnal Legitimasi (2024)",
        researchGap: `Kekosongan norma hukum yang jelas mengenai klasifikasi alat bukti elektronik dalam pembuktian perkara ${clean}.`,
        thinkingMode: "First-Principles Thinking"
      },
      {
        id: "rec-law-2",
        title: `Analisis Tata Kelola Penanganan Perkara dan Efektivitas Mediasi Non-Litigasi Terkait Sengketa ${titleCase}`,
        category: "magang",
        entity: "Kantor Advokat & Konsultan Hukum / Pengadilan Negeri",
        durationMonths: 6,
        referenceJournal: "Jurnal Yudisial & Constitutional Review (2024)",
        researchGap: `Rendahnya tingkat kepatuhan eksekusi kesepakatan perdamaian alternatif tanpa pengesahan akta otentik pada ${clean}.`,
        thinkingMode: "Occam's Razor"
      },
      {
        id: "rec-law-3",
        title: `Harmonisasi Regulasi Daerah dan Perlindungan Kepentingan Publik dalam Penyelenggaraan ${titleCase}`,
        category: "skripsi",
        entity: "Biro Hukum Sekretariat Daerah / DPRD",
        durationMonths: 5,
        referenceJournal: "Jurnal Legislasi Indonesia (2023)",
        researchGap: `Tumpang tindih kewenangan antar instansi vertikal dan otonom dalam penegakan kepatuhan ${clean}.`,
        thinkingMode: "Second-Order Thinking"
      },
      {
        id: "rec-law-4",
        title: `Studi Praktik Bantuan Hukum Pro Bono bagi Masyarakat Marjinal dalam Penyelesaian Sengketa ${titleCase}`,
        category: "magang",
        entity: "Lembaga Bantuan Hukum (LBH) / Posbakum",
        durationMonths: 6,
        referenceJournal: "Indonesian Journal of International Law (2024)",
        researchGap: `Keterbatasan akses advokasi dan minimnya pemahaman prosedural hukum di kalangan kelompok rentan pada kasus ${clean}.`,
        thinkingMode: "Systems / Holistic Thinking"
      }
    ];
  }

  // 6. Default: Informatics, Technology, & Engineering Domain
  return [
    {
      id: "rec-tech-1",
      title: `Rancang Bangun dan Evaluasi Kinerja Sistem Terintegrasi Berbasis ${titleCase} pada Skala Operasional`,
      category: "magang",
      entity: "PT Telkom Indonesia (Persero) Tbk / Mitra Teknologi Industri",
      durationMonths: 6,
      referenceJournal: "IEEE Transactions on Software Engineering (2024)",
      researchGap: `Kesenjangan antara kerangka teoritis dengan keandalan latensi dan throughput saat menangani beban konkurensi riil pada ${clean}.`,
      thinkingMode: "First-Principles Thinking"
    },
    {
      id: "rec-tech-2",
      title: `Analisis Komparatif Efisiensi dan Pengukuran Validitas Metodologi ${titleCase} Berbasis Standar Industri`,
      category: "skripsi",
      entity: "Laboratorium Riset Terpadu Rekayasa & Sistem",
      durationMonths: 6,
      referenceJournal: "ACM Computing Surveys & Knowledge Systems (2024)",
      researchGap: `Keterbatasan evaluasi empiris independen yang terstandarisasi untuk membandingkan akurasi dan pemakaian memori pada ${clean}.`,
      thinkingMode: "Critical / Falsification Thinking"
    },
    {
      id: "rec-tech-3",
      title: `Implementasi Otomasi Pipeline Observabilitas dan Manajemen Risiko Sistem ${titleCase}`,
      category: "magang",
      entity: "Perusahaan Enterprise / Startup Digital Terkemuka",
      durationMonths: 6,
      referenceJournal: "IEEE Cloud Computing & Distributed Systems (2023)",
      researchGap: `Tingginya friksi penanganan insiden manual yang memicu down-time layanan dan perlunya monitoring otomatis pada ${clean}.`,
      thinkingMode: "Occam's Razor"
    },
    {
      id: "rec-tech-4",
      title: `Studi Kelayakan Strategis dan Pemodelan Kausalitas Dampak Implementasi ${titleCase} terhadap Efisiensi Kerja`,
      category: "penelitian",
      entity: "Pusat Studi Rekayasa dan Inovasi Teknologi",
      durationMonths: 6,
      referenceJournal: "Journal of Systems Architecture (2024)",
      researchGap: `Belum terpetakannya korelasi variabel penentu terhadap keberhasilan adaptasi sistemik pada penerapan ${clean}.`,
      thinkingMode: "Systems / Holistic Thinking"
    }
  ];
}
