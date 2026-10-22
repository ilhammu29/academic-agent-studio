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
 * Layer 1: Real scholarly papers from Semantic Scholar API (IEEE, Springer, Nature, ACM)
 * Layer 2: Domain-specific heuristic literature synthesis based on user query
 */
export async function getAiTitleRecommendations(
  keywordOrTopic: string = "Informatika"
): Promise<TitleRecommendation[]> {
  const cleanQuery = keywordOrTopic.trim();

  // 1. Primary: Search real peer-reviewed papers via Semantic Scholar
  try {
    const papers = await searchSemanticScholarPapers(cleanQuery, 4);

    if (papers && papers.length >= 2) {
      return papers.map((paper, idx) => {
        const isInternship = idx % 2 === 0;
        const category: ProposalCategory = isInternship ? "magang" : "skripsi";
        
        let titleFormatted = "";
        let entity = "";

        if (category === "magang") {
          titleFormatted = `Implementasi & Benchmarking ${paper.title.replace(/[.:]$/, '')} pada Lingkungan Industri`;
          entity = "PT Telkom Indonesia (Persero) Tbk / Mitra Industri Terkait";
        } else {
          titleFormatted = `Analisis Komparatif & Optimasi ${paper.title.replace(/[.:]$/, '')}`;
          entity = "Laboratorium Riset Terpadu & RS Pendidikan";
        }

        const thinkingModes = [
          "First-Principles Thinking",
          "Probabilistic & Bayesian Updating",
          "Inversion / Pre-Mortem Thinking",
          "Critical / Falsification Thinking"
        ];

        return {
          id: `rec-${paper.paperId || idx}`,
          title: titleFormatted,
          category,
          entity,
          durationMonths: isInternship ? 6 : 5,
          referenceJournal: `${paper.venue || "Indexed Scientific Proceedings"} (${paper.year || 2024})`,
          researchGap: paper.researchGap || `Keterbatasan pada dataset lokal dan kebutuhan evaluasi latensi pada skenario riil.`,
          thinkingMode: thinkingModes[idx % thinkingModes.length]
        };
      });
    }
  } catch (err) {
    console.warn("Semantic Scholar live paper query failed, falling back to Domain Synthesis Engine:", err);
  }

  // 2. Secondary: Domain-Tailored Synthesis Engine
  const kw = cleanQuery.toLowerCase();
  const titleCase = cleanQuery.charAt(0).toUpperCase() + cleanQuery.slice(1);

  // Medical / Health / Nutrition Domain
  if (kw.includes("medis") || kw.includes("dokter") || kw.includes("kesehatan") || kw.includes("gizi") || kw.includes("klinis") || kw.includes("farmasi")) {
    return [
      {
        id: "rec-med-1",
        title: `Korelasi Kadar Biomarker Spesifik dan Profil Inflamasi pada Kasus Klinis ${titleCase}`,
        category: "skripsi",
        entity: "RSUP Dr. Sardjito / FK-KMK UGM",
        durationMonths: 6,
        referenceJournal: "The Lancet & Journal of Clinical Medicine (2024)",
        researchGap: "Belum meneliti interaksi kombinasi biomarker serum pada populasi pasien Asia Tenggara.",
        thinkingMode: "Probabilistic & Bayesian Updating"
      },
      {
        id: "rec-med-2",
        title: `Analisis Efektivitas Intervensi Terapeutik Berbasis ${titleCase} terhadap Luaran Klinis Pasien Rawat Inap`,
        category: "skripsi",
        entity: "Rumah Sakit Akademik / Laboratorium Farmakologi",
        durationMonths: 6,
        referenceJournal: "BMJ Open & Clinical Pharmacology (2024)",
        researchGap: "Kurangnya data prospektif multicenter mengenai profil tolerabilitas dosis jangka panjang.",
        thinkingMode: "Second-Order Thinking"
      },
      {
        id: "rec-med-3",
        title: `Implementasi Sistem Triase Digital dan Validasi Diagnostik Berbasis ${titleCase} pada Unit Gawat Darurat`,
        category: "magang",
        entity: "Dinas Kesehatan & RSUD Kelas A",
        durationMonths: 4,
        referenceJournal: "International Journal of Medical Informatics (2024)",
        researchGap: "Tingginya angka false positive pada triase manual saat lonjakan pasien darurat.",
        thinkingMode: "First-Principles Thinking"
      },
      {
        id: "rec-med-4",
        title: `Studi Komparasi Determinan Perilaku dan Kepatuhan Pola Hidup Sehat Pasca-Intervensi ${titleCase}`,
        category: "penelitian",
        entity: "Pusat Studi Kebijakan Kesehatan & Komunitas",
        durationMonths: 6,
        referenceJournal: "Public Health Reports & Frontiers in Nutrition (2024)",
        researchGap: "Kesenjangan pemahaman determinan psikososial terhadap keberlanjutan hasil intervensi primer.",
        thinkingMode: "Systems / Holistic Thinking"
      }
    ];
  }

  // Engineering / IoT / Hardware Domain
  if (kw.includes("sipil") || kw.includes("mesin") || kw.includes("elektro") || kw.includes("iot") || kw.includes("energi") || kw.includes("sensor")) {
    return [
      {
        id: "rec-eng-1",
        title: `Rancang Bangun Sistem Monitoring Real-Time Berbasis IoT dan Sensor Presisi pada Infrastruktur ${titleCase}`,
        category: "magang",
        entity: "PT Wijaya Karya / PT PLN (Persero)",
        durationMonths: 6,
        referenceJournal: "IEEE Transactions on Industrial Informatics (2024)",
        researchGap: "Degradasi akurasi sensor dan latency packet loss pada kondisi cuaca ekstrem.",
        thinkingMode: "First-Principles Thinking"
      },
      {
        id: "rec-eng-2",
        title: `Simulasi Kinerja dan Analisis Ketahanan Struktur Material Menggunakan Pendekatan ${titleCase}`,
        category: "skripsi",
        entity: "Laboratorium Uji Bahan & Struktur Teknik",
        durationMonths: 6,
        referenceJournal: "Construction and Building Materials & Elsevier (2024)",
        researchGap: "Perbedaan elastisitas komposit lokal terhadap beban siklik dinamis frekuensi tinggi.",
        thinkingMode: "Critical / Falsification Thinking"
      },
      {
        id: "rec-eng-3",
        title: `Optimasi Konsumsi Daya dan Rekayasa Siklus Termal Berbasis ${titleCase} pada Sistem Pembangkit`,
        category: "penelitian",
        entity: "Pusat Riset Tenaga Listrik BRIN",
        durationMonths: 6,
        referenceJournal: "Applied Energy & Renewable Resources (2023)",
        researchGap: "Inefisiensi termal parsial saat fluktuasi beban puncak belum dimitigasi secara adaptif.",
        thinkingMode: "Occam's Razor"
      },
      {
        id: "rec-eng-4",
        title: `Audit Keandalan Operasional dan Mitigasi Kegagalan Sistem Transmisi Berbasis ${titleCase}`,
        category: "magang",
        entity: "PT Pertamina (Persero) / Mitra Energi",
        durationMonths: 6,
        referenceJournal: "Reliability Engineering & System Safety (2024)",
        researchGap: "Keterbatasan metode observasi visual berkala dibanding continuous failure telemetry.",
        thinkingMode: "Inversion / Pre-Mortem Thinking"
      }
    ];
  }

  // Default: Advanced Informatics, AI, Business, & General Sains
  return [
    {
      id: "rec-gen-1",
      title: `Implementasi Pipeline Otomasi & Benchmarking Performa Arsitektur ${titleCase} pada Lingkungan Produksi`,
      category: "magang",
      entity: "PT Telkom Indonesia (Persero) Tbk / Enterprise Partner",
      durationMonths: 6,
      referenceJournal: `IEEE Transactions on Software Engineering & Systems (2024)`,
      researchGap: `Tingginya latensi pemrosesan data pipeline manual dan perlunya throughput terukur pada ${cleanQuery}.`,
      thinkingMode: "First-Principles Thinking"
    },
    {
      id: "rec-gen-2",
      title: `Analisis Komparatif dan Optimasi Algoritma ${titleCase} Menggunakan Model Evaluasi Terstandarisasi`,
      category: "skripsi",
      entity: "Laboratorium Sains Komputasi & AI Terapan",
      durationMonths: 6,
      referenceJournal: `ACM Computing Surveys & Knowledge Systems (2024)`,
      researchGap: `Penurunan efisiensi komputasi pada volume data masif yang belum teratasi dengan pemodelan konvensional.`,
      thinkingMode: "Critical / Falsification Thinking"
    },
    {
      id: "rec-gen-3",
      title: `Perancangan Arsitektur Microservices Berbasis Event-Driven untuk Integrasi Sistem ${titleCase}`,
      category: "magang",
      entity: "Perusahaan Teknologi Nasional / Fintech",
      durationMonths: 6,
      referenceJournal: `IEEE Cloud Computing & Distributed Systems (2023)`,
      researchGap: `Bottleneck skalabilitas saat lonjakan konkurensi data transaksi tinggi pada platform operasional.`,
      thinkingMode: "Occam's Razor"
    },
    {
      id: "rec-gen-4",
      title: `Studi Kelayakan dan Pengukuran Dampak Transformasi Digital Berbasis ${titleCase} pada Proses Bisnis`,
      category: "penelitian",
      entity: "Lembaga Kajian Strategis & Inovasi Industri",
      durationMonths: 6,
      referenceJournal: `Journal of Business Research & Technological Forecasting (2024)`,
      researchGap: `Kesenjangan adaptasi pengguna internal dan ketiadaan kerangka kerja audit efisiensi investasi teknologi.`,
      thinkingMode: "Systems / Holistic Thinking"
    }
  ];
}
