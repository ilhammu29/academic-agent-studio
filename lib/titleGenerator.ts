import { ProposalCategory } from "@/types/studio";
import { searchSemanticScholarPapers } from "./semanticScholar";

export interface TitleRecommendation {
  id: string;
  title: string;
  category: ProposalCategory;
  entity: string;
  durationMonths: number;
  referenceJournal: string;
  researchGap: string;
  thinkingMode: string;
}

/**
 * Generate academic title recommendations
 * Mode 1: 'ai-pure' (Default): Pure AI-driven title determination tailored to the specific field of study
 * Mode 2: 'literature': Titling anchored directly to retrieved peer-reviewed papers (OpenAlex/Crossref)
 */
export async function getAiTitleRecommendations(
  keywordOrTopic: string = "Informatika",
  mode: "ai-pure" | "literature" = "ai-pure"
): Promise<TitleRecommendation[]> {
  const cleanQuery = keywordOrTopic.trim();
  if (!cleanQuery) return [];

  // 1. Primary: Unified Academic Recommender API
  try {
    const isBrowser = typeof window !== "undefined";
    const apiUrl = isBrowser 
      ? "/api/academic/recommend-titles" 
      : "http://localhost:3000/api/academic/recommend-titles";

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: cleanQuery, mode }),
      signal: AbortSignal.timeout(8000)
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
        return data.recommendations;
      }
    }
  } catch (apiErr: any) {
    console.warn("Server title recommendation API failed or timed out, activating local synthesis:", apiErr?.message);
  }

  // 2. Secondary: Client-Side Domain-Aware Synthesis (Zero Forced IT Jargon)
  try {
    const papers = mode === "literature" ? await searchSemanticScholarPapers(cleanQuery, 4) : [];
    const titleCase = cleanQuery.charAt(0).toUpperCase() + cleanQuery.slice(1);
    const kw = cleanQuery.toLowerCase();

    // Health & Clinical Domain (e.g. Obesitas, Stunting, Diabetes)
    if (
      kw.includes("obesitas") ||
      kw.includes("medis") ||
      kw.includes("kesehatan") ||
      kw.includes("gizi") ||
      kw.includes("dokter") ||
      kw.includes("klinis") ||
      kw.includes("stunting") ||
      kw.includes("diabetes")
    ) {
      return [
        {
          id: "rec-med-1",
          title: `Analisis Faktor Risiko dan Pengaruh Pola Konsumsi terhadap Kejadian ${titleCase} pada Populasi Remaja Urban`,
          category: "skripsi",
          entity: "RSUP Dr. Sardjito / Laboratorium Gizi Klinis FK-KMK",
          durationMonths: 6,
          referenceJournal: "The Lancet & Jurnal Gizi Klinik Indonesia (2024)",
          researchGap: `Kesenjangan antara pemahaman gizi teoritis dengan kebiasaan sedentary lifestyle dan konsumsi fast food pada ${cleanQuery}.`,
          thinkingMode: "First-Principles Thinking"
        },
        {
          id: "rec-med-2",
          title: `Evaluasi Program Intervensi Gizi Seimbang dan Modifikasi Perilaku Hidup Sehat dalam Pengendalian ${titleCase}`,
          category: "magang",
          entity: "Dinas Kesehatan Kota & Unit Pelayanan Terpadu Puskesmas",
          durationMonths: 6,
          referenceJournal: "Asia Pacific Journal of Clinical Nutrition (2024)",
          researchGap: `Kurangnya evaluasi longitudinal terhadap retensi kepatuhan diet dan aktivitas fisik pasca-intervensi pada ${cleanQuery}.`,
          thinkingMode: "Probabilistic & Bayesian Updating"
        },
        {
          id: "rec-med-3",
          title: `Korelasi Kadar Profil Lipid Serum dan Indeks Massa Tubuh (IMT) terhadap Risiko Komorbiditas Pasien ${titleCase}`,
          category: "skripsi",
          entity: "Rumah Sakit Akademik / Laboratorium Patologi Klinik",
          durationMonths: 6,
          referenceJournal: "Journal of Clinical Medicine & Endocrinology (2023)",
          researchGap: `Belum dipetakannya variasi biomarker inflamasi spesifik pada penderita ${cleanQuery} usia produktif.`,
          thinkingMode: "Critical / Falsification Thinking"
        },
        {
          id: "rec-med-4",
          title: `Perancangan Program Manajemen Terpadu dan Edukasi Preventif Pencegahan ${titleCase} Berbasis Komunitas`,
          category: "magang",
          entity: "Pusat Promosi Kesehatan / NGO Kesehatan Masyarakat",
          durationMonths: 6,
          referenceJournal: "BMC Public Health & Jurnal Kesehatan Masyarakat (2024)",
          researchGap: `Tingginya stigma berat badan dan rendahnya keterlibatan keluarga dalam program pendampingan pasien ${cleanQuery}.`,
          thinkingMode: "Systems / Holistic Thinking"
        }
      ];
    }

    // Education Domain
    if (kw.includes("pendidikan") || kw.includes("guru") || kw.includes("sekolah") || kw.includes("belajar") || kw.includes("siswa")) {
      return [
        {
          id: "rec-edu-1",
          title: `Efektivitas Pendekatan Pembelajaran Berdiferensiasi dalam Meningkatkan Kemampuan Berpikir Kritis Siswa pada Materi ${titleCase}`,
          category: "skripsi",
          entity: "Laboratorium Pedagogi & Sekolah Menengah Mitra Kampus",
          durationMonths: 6,
          referenceJournal: "Jurnal Pendidikan Karakter & Cakrawala Pendidikan (2024)",
          researchGap: `Keterbatasan instrumen asesmen formatif adaptif yang dapat mengakomodasi gaya belajar heterogen siswa pada ${cleanQuery}.`,
          thinkingMode: "First-Principles Thinking"
        },
        {
          id: "rec-edu-2",
          title: `Implementasi Manajemen Mutu Pembelajaran dan Evaluasi Ketercapaian Kurikulum Terpadu Berbasis ${titleCase}`,
          category: "magang",
          entity: "Dinas Pendidikan Provinsi / LPMP",
          durationMonths: 6,
          referenceJournal: "Educational Management Administration & Leadership (2024)",
          researchGap: `Kesenjangan standarisasi kompetensi guru dalam merancang perangkat ajar kontekstual pada ${cleanQuery}.`,
          thinkingMode: "Occam's Razor"
        }
      ];
    }

    // General Technology / Engineering Default
    const p1 = papers[0];
    const p2 = papers[1];

    return [
      {
        id: "rec-local-1",
        title: `Rancang Bangun dan Evaluasi Kinerja Sistem Terpadu Berbasis ${titleCase} pada Skala Operasional`,
        category: "magang",
        entity: "PT Telkom Indonesia (Persero) Tbk / Mitra Industri Terkait",
        durationMonths: 6,
        referenceJournal: p1 ? `${p1.venue} (${p1.year})` : "IEEE Transactions on Software Engineering (2024)",
        researchGap: `Kesenjangan antara kerangka teoritis dengan keandalan latensi dan throughput saat menangani beban kerja riil pada ${cleanQuery}.`,
        thinkingMode: "First-Principles Thinking"
      },
      {
        id: "rec-local-2",
        title: `Analisis Komparatif Efisiensi dan Uji Validitas Metodologi ${titleCase} Berbasis Standar Empiris`,
        category: "skripsi",
        entity: "Laboratorium Riset Terpadu Rekayasa & Sistem",
        durationMonths: 6,
        referenceJournal: p2 ? `${p2.venue} (${p2.year})` : "ACM Computing Surveys & Knowledge Systems (2024)",
        researchGap: `Keterbatasan evaluasi empiris independen yang terstandarisasi untuk membandingkan akurasi pada ${cleanQuery}.`,
        thinkingMode: "Critical / Falsification Thinking"
      },
      {
        id: "rec-local-3",
        title: `Implementasi Otomasi Pipeline Observabilitas dan Manajemen Risiko Sistem ${titleCase}`,
        category: "magang",
        entity: "Perusahaan Enterprise / Startup Digital Terkemuka",
        durationMonths: 6,
        referenceJournal: "IEEE Cloud Computing & Distributed Systems (2023)",
        researchGap: `Tingginya friksi penanganan insiden manual yang memicu down-time layanan pada ${cleanQuery}.`,
        thinkingMode: "Occam's Razor"
      },
      {
        id: "rec-local-4",
        title: `Studi Kelayakan Strategis dan Pemodelan Kausalitas Dampak Implementasi ${titleCase} terhadap Efisiensi Kerja`,
        category: "penelitian",
        entity: "Pusat Studi Rekayasa dan Inovasi Teknologi",
        durationMonths: 6,
        referenceJournal: "Journal of Systems Architecture (2024)",
        researchGap: `Belum terpetakannya korelasi variabel penentu terhadap keberhasilan adaptasi sistemik pada penerapan ${cleanQuery}.`,
        thinkingMode: "Systems / Holistic Thinking"
      }
    ];
  } catch (err: any) {
    console.error("Critical title generation failure:", err);
    return [];
  }
}
