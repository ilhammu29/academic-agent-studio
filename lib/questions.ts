import { DiagnosticQuestion, ProposalCategory } from "@/types/studio";

/**
 * Dynamic Diagnostic Interview Generator
 * Menghasilkan pertanyaan wawancara mendalam yang 100% spesifik merujuk pada kata kunci judul,
 * instansi sasaran, dan kategori yang dipilih pengguna (Bukan template dummy).
 */
export function generateDiagnosticQuestions(
  title: string,
  category: ProposalCategory,
  targetEntity: string = ""
): DiagnosticQuestion[] {
  const entityName = targetEntity.trim() || (category === "magang" ? "instansi mitra / industri" : "lokasi / subjek penelitian");
  const cleanTitle = title.trim();

  // Keyword extraction for contextual hints
  const lower = cleanTitle.toLowerCase();
  const hasAI = lower.includes("ai") || lower.includes("transformer") || lower.includes("machine learning") || lower.includes("model");
  const hasMedical = lower.includes("medis") || lower.includes("pasien") || lower.includes("klinik") || lower.includes("biomarker") || lower.includes("penyakit");
  const hasData = lower.includes("data") || lower.includes("pipeline") || lower.includes("rag") || lower.includes("analitik");

  if (category === "magang") {
    return [
      {
        id: "targetDepartment",
        field: "targetDepartment",
        question: `Pada divisi atau unit operasional spesifik mana Anda merencanakan implementasi "${cleanTitle}" di ${entityName}?`,
        contextHint: `SOP Magang Kampus mengharuskan identifikasi spesifik direktorat/divisi di ${entityName} agar selaras dengan Key Performance Indicators (KPI) unit kerja.`,
        placeholder: `Contoh: Divisi Enterprise Data & AI / Unit Solusi Cloud ${entityName}...`,
        aiSuggestion: `Divisi Rekayasa Perangkat Lunak & Infrastruktur Sistem di ${entityName}, berfokus pada efisiensi operasional.`,
        thinkingModeApplied: "First-Principles Thinking (Pemetaan fondasi organisasi)"
      },
      {
        id: "problemStatement",
        field: "problemStatement",
        question: `Apa kesenjangan teknis (technical gap) atau inefisiensi nyata yang saat ini terjadi di ${entityName} sehingga topik "${cleanTitle}" mendesak untuk diselesaikan?`,
        contextHint: "Latar belakang proposal magang harus berbasis masalah riil di industri (Reverse-Pyramid problem), bukan sekadar keinginan 'mencari pengalaman'.",
        placeholder: "Uraikan bottleneck operasional, tingginya latensi, biaya tinggi, atau risiko manual yang ingin Anda atasi...",
        aiSuggestion: hasData 
          ? `Tingginya latensi pemrosesan data manual dan keterbatasan sistem eksisting dalam mengelola integrasi multi-sumber secara otomatis.`
          : `Ketiadaan modul otomatisasi terstandar yang menyebabkan inefisiensi waktu kerja hingga 40% pada alur kerja harian.`,
        thinkingModeApplied: "Critical / Falsification Thinking (Menguji asumsi hambatan nyata)"
      },
      {
        id: "toolsSkillset",
        field: "toolsSkillset",
        question: `Perangkat lunak, bahasa pemrograman, framework, atau metodologi kerja apa yang akan Anda terapkan untuk mengeksekusi "${cleanTitle}"?`,
        contextHint: "Kesesuaian stack teknologi membuktikan kesiapan teknis mahasiswa menghadapi standar produksi profesional.",
        placeholder: "Sebutkan framework, database, container, dan metodologi kerja (misal: Agile/Scrum)...",
        aiSuggestion: hasAI
          ? "Python 3.11, PyTorch/TensorFlow, Docker, FastMCP, Git, serta metodologi sprint Agile Scrum 2 mingguan."
          : "TypeScript/Node.js, PostgreSQL, Docker, CI/CD pipeline, dan metodologi Scrum.",
        thinkingModeApplied: "Occam's Razor (Memilih stack paling efisien dan tepat guna)"
      },
      {
        id: "deliverables",
        field: "deliverables",
        question: `Apa produk kerja nyata (tangible deliverable) yang Anda janjikan selesai dan diserahterimakan kepada mentor ${entityName} di akhir masa penugasan?`,
        contextHint: "Menjadi tolok ukur kelulusan dan bukti kontribusi nyata mahasiswa bagi mitra industri.",
        placeholder: "Contoh: 1 prototipe modul microservice terverifikasi, 1 dashboard analitik, dan 1 buku dokumen SOP internal...",
        aiSuggestion: `1 Prototipe sistem fungsional teruji, 1 set dokumentasi teknis & SOP implementasi, serta laporan evaluasi performa benchmarking.`,
        thinkingModeApplied: "Pareto 80/20 (Fokus pada 20% deliverable bernilai dampak 80%)"
      },
      {
        id: "timelinePreference",
        field: "timelinePreference",
        question: `Bagaimana rencana pembagian fase kerja dan mitigasi risiko Anda jika terjadi keterlambatan akses sistem di ${entityName}?`,
        contextHint: "Penerapan Pre-Mortem Thinking untuk memetakan alur kerja mingguan beserta rencana kontingensinya.",
        placeholder: "Fase 1: Asesmen & Desain, Fase 2: Implementasi, Fase 3: Testing & UAT, Fase 4: Deseminasi...",
        aiSuggestion: "Fase 1 (Mg 1-4) Analisis Kebutuhan; Fase 2 (Mg 5-12) Pembangunan Inti; Fase 3 (Mg 13-18) Pengujian UAT; Fase 4 (Mg 19-24) Dokumentasi & Transfer Pengetahuan.",
        thinkingModeApplied: "Inversion / Pre-Mortem Thinking (Mitigasi potensi kegagalan lebih awal)"
      }
    ];
  }

  // Skripsi / Tesis / Penelitian Ilmiah
  return [
    {
      id: "populasi_sampel",
      field: "targetDepartment",
      question: `Siapakah populasi target, karakteristik subjek, atau sumber dataset primer yang akan dianalisis dalam penelitian "${cleanTitle}"?`,
      contextHint: "Menentukan validitas eksternal, keterjangkauan sampel, dan kepatuhan kriteria inklusi/eksklusi.",
      placeholder: `Jelaskan subjek penelitian di ${entityName} atau repositori dataset yang digunakan...`,
      aiSuggestion: hasMedical
        ? `Pasien rawat jalan dan rekam medis terverifikasi di ${entityName} dengan kriteria inklusi terstandarisasi.`
        : `Dataset sekunder teranotasi dan sampel primer yang dikumpulkan secara terstandar di ${entityName}.`,
      thinkingModeApplied: "First-Principles Thinking (Definisi batasan populasi ilmiah)"
    },
    {
      id: "variabel_riset",
      field: "problemStatement",
      question: `Apa saja variabel independen (bebas), variabel dependen (terikat), atau parameter uji utama yang diukur dalam "${cleanTitle}"?`,
      contextHint: "Landasan utama penyusunan Kerangka Konsep Bab II dan Definisi Operasional Bab III.",
      placeholder: "Variabel Bebas: ..., Variabel Terikat: ..., Variabel Kontrol/Perancu: ...",
      aiSuggestion: "Variabel Bebas: Variasi perlakuan/algoritma yang diuji; Variabel Terikat: Metrik performa, akurasi, sensitivitas, atau perubahan biomarker.",
      thinkingModeApplied: "Holistic / Systems Thinking (Pemetaan keterhubungan antar-variabel)"
    },
    {
      id: "desain_metode",
      field: "toolsSkillset",
      question: `Desain penelitian dan instrumen validasi apa yang direncanakan untuk membuktikan hipotesis "${cleanTitle}"?`,
      contextHint: "Mengacu pada pedoman STROBE (observasional) atau CONSORT/IEEE (eksperimental).",
      placeholder: "Contoh: Eksperimental komparatif kuantitatif dengan cross-validation 5-fold...",
      aiSuggestion: "Eksperimental kuantitatif dengan protokol validasi terstandar, pengujian berulang, dan kalibrasi instrumen terukur.",
      thinkingModeApplied: "Critical / Falsification Thinking (Uji ketahanan hipotesis)"
    },
    {
      id: "rencana_analisis",
      field: "deliverables",
      question: `Rencana uji hipotesis statistik atau benchmarking kuantitatif apa yang akan digunakan untuk mengukur signifikansi hasil?`,
      contextHint: "Pencantuman taraf kemaknaan α = 0,05, uji normalitas, serta uji parametrik/non-parametrik yang relevan.",
      placeholder: "Contoh: Uji normalitas Shapiro-Wilk, Independent Sample t-test / Mann-Whitney, evaluasi ROC-AUC...",
      aiSuggestion: "Uji normalitas Shapiro-Wilk dilanjutkan uji signifikansi komparatif (p < 0,05) dan analisis ukuran efek (effect size).",
      thinkingModeApplied: "Probabilistic & Bayesian Updating (Rigoritas data empiris)"
    },
    {
      id: "kelaikan_etik",
      field: "timelinePreference",
      question: `Bagaimana rencana pengajuan persetujuan etik (ethical clearance) atau kepatuhan integritas data pada penelitian ini?`,
      contextHint: "Kepatuhan Deklarasi Helsinki untuk subjek manusia atau tata kelola data konfidensial/GDPR.",
      placeholder: "Informed consent, izin Komisi Etik Penelitian (KEPK), dan anonimisasi data...",
      aiSuggestion: "Pengajuan ethical clearance resmi, penyediaan lembar persetujuan (informed consent), serta anonimisasi identitas seluruh partisipan.",
      thinkingModeApplied: "Second-Order Thinking (Mitigasi konsekuensi etis & legal)"
    }
  ];
}
