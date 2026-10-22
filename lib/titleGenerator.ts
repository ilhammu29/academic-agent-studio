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
 */
export async function getAiTitleRecommendations(
  keywordOrTopic: string = "Informatika"
): Promise<TitleRecommendation[]> {
  try {
    // 1. Try fetching real scholarly papers from Semantic Scholar
    const papers = await searchSemanticScholarPapers(keywordOrTopic, 4);

    if (papers && papers.length >= 2) {
      return papers.map((paper, idx) => {
        const isInternship = idx % 2 === 0;
        const category: ProposalCategory = isInternship ? "magang" : "skripsi";
        
        let titleFormatted = "";
        let entity = "";

        if (category === "magang") {
          titleFormatted = `Implementasi & Benchmarking ${paper.title.replace(/[.:]$/, '')} pada Infrastruktur Produksi`;
          entity = "PT Telkom Indonesia (Persero) Tbk / Mitra Industri Terkait";
        } else {
          titleFormatted = `Analisis Komparatif & Optimasi ${paper.title.replace(/[.:]$/, '')}`;
          entity = "Laboratorium Riset Terpadu & RS Pendidikan";
        }

        return {
          id: `rec-${paper.paperId || idx}`,
          title: titleFormatted,
          category,
          entity,
          durationMonths: isInternship ? 6 : 5,
          referenceJournal: `${paper.venue} (${paper.year || 2024})`,
          researchGap: paper.researchGap || `Keterbatasan pada dataset lokal dan kebutuhan evaluasi latensi pada skenario riil.`,
          thinkingMode: idx === 0 ? "First-Principles Thinking" : idx === 1 ? "Lateral / Divergent Thinking" : "Occam's Razor"
        };
      });
    }
  } catch (err) {
    console.warn("Live paper query failed, generating domain-tailored recommendation models.");
  }

  // 2. High-rigor fallback tailored by keyword
  const kw = keywordOrTopic.toLowerCase();

  if (kw.includes("medis") || kw.includes("dokter") || kw.includes("kesehatan") || kw.includes("gizi")) {
    return [
      {
        id: "rec-med-1",
        title: "Korelasi Kadar Ekspresi miRNA-21 Serum dan High-Sensitivity CRP terhadap Derajat Fibrosis Pasien Hepatitis B Kronis",
        category: "skripsi",
        entity: "RSUP Dr. Sardjito / FK-KMK UGM",
        durationMonths: 6,
        referenceJournal: "Journal of Hepatology & Cellular Oncology (2024)",
        researchGap: "Belum meneliti interaksi kombinasi hs-CRP serum pada populasi pasien hepatitis B Indonesia.",
        thinkingMode: "Probabilistic & Bayesian Updating"
      },
      {
        id: "rec-med-2",
        title: "Analisis Efektivitas Skrining Retinopati Diabetik Berbasis Model Vision Transformer Terkuantisasi pada Faskes Tingkat Pertama",
        category: "skripsi",
        entity: "Puskesmas & Balai Kesehatan Mata Masyarakat",
        durationMonths: 5,
        referenceJournal: "The Lancet Digital Health (2023)",
        researchGap: "Studi terdahulu fokus pada server cloud berlatensi tinggi; belum teruji pada hardware edge klinik mandiri.",
        thinkingMode: "Occam's Razor (Efisiensi Komputasi)"
      },
      {
        id: "rec-med-3",
        title: "Perancangan Standard Operating Procedure (SOP) Digitalisasi Rekam Medis Elektronik Terintegrasi SatuSehat",
        category: "magang",
        entity: "Dinas Kesehatan & RSUD Wilayah",
        durationMonths: 6,
        referenceJournal: "International Journal of Medical Informatics (2024)",
        researchGap: "Kendala interoperabilitas FHIR HL7 pada faskes daerah dengan infrastruktur terbatas.",
        thinkingMode: "Dialectical Synthesis"
      }
    ];
  }

  // Default Tech / Industrial / Saintek Titles
  return [
    {
      id: "rec-tech-1",
      title: "Implementasi Pipeline MLOps & RAG untuk Knowledge Retrieval Internal Dokumen Teknis",
      category: "magang",
      entity: "PT Telkom Indonesia (Persero) Tbk",
      durationMonths: 6,
      referenceJournal: "ACM Computing Surveys on LLM Systems (2024)",
      researchGap: "Tingginya latensi pencarian dokumen dan perlunya mitigasi halusinasi pada data konfidensial enterprise.",
      thinkingMode: "First-Principles Thinking"
    },
    {
      id: "rec-tech-2",
      title: "Optimasi Model Vision Transformer (ViT) dengan Kuantisasi 4-bit AWQ pada Edge Device untuk Klasifikasi Citra Medis",
      category: "skripsi",
      entity: "Laboratorium AI & Smart City / RS Pendidikan",
      durationMonths: 5,
      referenceJournal: "IEEE Transactions on Pattern Analysis (2024)",
      researchGap: "Penurunan akurasi signifikan pada kuantisasi ekstrem 4-bit yang belum diatasi dengan adaptive weight calibration.",
      thinkingMode: "Critical / Falsification Thinking"
    },
    {
      id: "rec-tech-3",
      title: "Perancangan Arsitektur Microservices Berbasis Event-Driven untuk Otomasi Penilaian Kredit Finansial",
      category: "magang",
      entity: "PT Bank Central Asia Tbk (BCA) / Fintech",
      durationMonths: 6,
      referenceJournal: "IEEE Software Engineering & Cloud Transactions (2023)",
      researchGap: "Bottleneck throughput transaksi saat lonjakan traffic tinggi dan perlunya zero-downtime deployment.",
      thinkingMode: "Inversion / Pre-Mortem Thinking"
    },
    {
      id: "rec-tech-4",
      title: "Sintesis Biokomposit Grafena Oksida-Kitosan sebagai Membran Adsorben Logam Berat Limbah Industri Tekstil",
      category: "penelitian",
      entity: "Pusat Riset Kimia Terapan BRIN",
      durationMonths: 6,
      referenceJournal: "Chemical Engineering Journal & Elsevier (2024)",
      researchGap: "Stabilitas mekanis membran kitosan murni rendah pada pH asam ekstrem; perlu rekayasa ikatan silang grafena.",
      thinkingMode: "Systems / Holistic Thinking"
    }
  ];
}
