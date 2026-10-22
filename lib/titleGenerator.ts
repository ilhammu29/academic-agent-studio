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
 * Generate academic title recommendations based on real journal literature or keywords
 * Multi-layer pipeline:
 * Layer 1: Unified Server API (/api/academic/recommend-titles) with OpenAlex + Crossref + Gemini AI
 * Layer 2: Client-side literature query + dynamic academic heuristic synthesis
 */
export async function getAiTitleRecommendations(
  keywordOrTopic: string = "Informatika"
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
      body: JSON.stringify({ query: cleanQuery }),
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

  // 2. Secondary: Client-Side Literature Search & Heuristic Synthesis
  try {
    const papers = await searchSemanticScholarPapers(cleanQuery, 4);
    const titleCase = cleanQuery.charAt(0).toUpperCase() + cleanQuery.slice(1);
    const kw = cleanQuery.toLowerCase();

    let defaultEntityMagang = "PT Telkom Indonesia (Persero) Tbk / Mitra Industri Terkait";
    let defaultEntitySkripsi = "Laboratorium Riset Terpadu Kampus";
    let defaultJournal = "Jurnal Riset Terakreditasi SINTA & Scopus (2024)";

    if (kw.includes("medis") || kw.includes("kesehatan") || kw.includes("dokter") || kw.includes("gizi") || kw.includes("farmasi")) {
      defaultEntityMagang = "RSUP Dr. Sardjito / Dinas Kesehatan";
      defaultEntitySkripsi = "Fakultas Kedokteran & RS Akademik";
      defaultJournal = "The Lancet & Jurnal Kesehatan Masyarakat (2024)";
    } else if (kw.includes("pertanian") || kw.includes("pangan") || kw.includes("tanah")) {
      defaultEntityMagang = "PT Pupuk Indonesia / Balai Penerapan Standar Pertanian";
      defaultEntitySkripsi = "Laboratorium Agroteknologi & Ilmu Tanah";
      defaultJournal = "Jurnal Ilmu Pertanian Indonesia & Crop Science (2024)";
    } else if (kw.includes("pendidikan") || kw.includes("guru") || kw.includes("sekolah")) {
      defaultEntityMagang = "Dinas Pendidikan Provinsi / LPMP";
      defaultEntitySkripsi = "Pusat Riset Pedagogi & Kurikulum";
      defaultJournal = "Jurnal Pendidikan Karakter (2024)";
    } else if (kw.includes("ekonomi") || kw.includes("bisnis") || kw.includes("akuntansi")) {
      defaultEntityMagang = "Bank Indonesia / Kantor Akuntan Publik / FinTech";
      defaultEntitySkripsi = "Pusat Kajian Ekonomi Terapan";
      defaultJournal = "Journal of Business Research (2024)";
    }

    const p1 = papers[0];
    const p2 = papers[1];
    const p3 = papers[2];
    const p4 = papers[3];

    return [
      {
        id: "rec-local-1",
        title: p1 ? `Implementasi dan Benchmarking Metode ${titleCase} pada Lingkungan Kerja Industri` : `Implementasi Pipeline Otomasi dan Evaluasi Kinerja ${titleCase} pada Lingkungan Industri`,
        category: "magang",
        entity: defaultEntityMagang,
        durationMonths: 6,
        referenceJournal: p1 ? `${p1.venue || "Publikasi Ilmiah Terindeks"} (${p1.year || 2024})` : defaultJournal,
        researchGap: p1?.researchGap || `Kesenjangan antara kerangka teoritis dengan keandalan operasional riil pada ${cleanQuery}.`,
        thinkingMode: "First-Principles Thinking"
      },
      {
        id: "rec-local-2",
        title: p2 ? `Analisis Komparatif dan Optimasi Algoritma ${titleCase} Berbasis Standar Empiris` : `Analisis Komparatif Efektivitas dan Uji Validitas Metodologi ${titleCase}`,
        category: "skripsi",
        entity: defaultEntitySkripsi,
        durationMonths: 6,
        referenceJournal: p2 ? `${p2.venue || "Publikasi Ilmiah Terindeks"} (${p2.year || 2024})` : defaultJournal,
        researchGap: p2?.researchGap || `Keterbatasan pengujian empiris berskala riil dan minimnya parameter evaluasi objektif pada ${cleanQuery}.`,
        thinkingMode: "Critical / Falsification Thinking"
      },
      {
        id: "rec-local-3",
        title: p3 ? `Perancangan Arsitektur Sistem Terintegrasi Berbasis ${titleCase} untuk Akselerasi Layanan` : `Perancangan Kerangka Kerja dan Manajemen Risiko Operasional Sistem ${titleCase}`,
        category: "magang",
        entity: defaultEntityMagang,
        durationMonths: 6,
        referenceJournal: p3 ? `${p3.venue || "Publikasi Ilmiah Terindeks"} (${p3.year || 2024})` : defaultJournal,
        researchGap: `Tingginya friksi proses manual yang memicu hambatan skalabilitas dan perlunya otomasi tata kelola pada ${cleanQuery}.`,
        thinkingMode: "Occam's Razor"
      },
      {
        id: "rec-local-4",
        title: p4 ? `Studi Eksperimental Dampak Multi-Variabel ${titleCase} Berdasarkan Kerangka Analisis Terstandarisasi` : `Studi Kelayakan Strategis dan Pemodelan Kausalitas Pengaruh Variabel Penentu terhadap ${titleCase}`,
        category: "penelitian",
        entity: defaultEntitySkripsi,
        durationMonths: 6,
        referenceJournal: p4 ? `${p4.venue || "Publikasi Ilmiah Terindeks"} (${p4.year || 2024})` : defaultJournal,
        researchGap: `Belum terpetakannya korelasi kausal antar variabel determinan dan konsekuensi jangka panjang penerapan ${cleanQuery}.`,
        thinkingMode: "Systems / Holistic Thinking"
      }
    ];
  } catch (err: any) {
    console.error("Critical title generation failure:", err);
    return [];
  }
}
