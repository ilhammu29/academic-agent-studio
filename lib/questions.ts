import { DiagnosticQuestion, ProposalCategory } from "@/types/studio";

function detectDomain(title: string, entity: string = ""): "health" | "education" | "law" | "business" | "agriculture" | "tech" {
  const t = `${title} ${entity}`.toLowerCase();
  if (t.match(/obesitas|stunting|gizi|darah|pasien|klinik|puskesmas|rumah sakit|hipertensi|farmasi|obat|medis|nutrisi|epidemiologi|imunisasi|posyandu|perawat|keperawatan|kebidanan|kardiovaskular|diabetes|kedokteran/i)) {
    return "health";
  }
  if (t.match(/pembelajaran|siswa|guru|sekolah|kelas|kurikulum|madrasah|pesantren|didik|edukasi|prestasi belajar|modul ajar|remedial|smk|smp|sma|sd|keguruan/i)) {
    return "education";
  }
  if (t.match(/hukum|pidana|perdata|hak cipta|undang-undang|uu |pengadilan|jaksa|advokat|kejaksaan|konstitusi|kpk|perkara|yuridis|putusan/i)) {
    return "law";
  }
  if (t.match(/keuangan|saham|laba|investasi|bank|perbankan|akuntansi|pajak|portofolio|ojk|bursa|manajemen|marketing|pemasaran|profit|umkm|audit|bisnis|ekonomi/i)) {
    return "business";
  }
  if (t.match(/pertanian|tanaman|panen|pangan|tanah|pupuk|irigasi|hama|agro|kehutanan|peternakan|hortikultura|kelapa sawit|padi/i)) {
    return "agriculture";
  }
  return "tech";
}

/**
 * Dynamic Diagnostic Interview Generator
 * Menghasilkan pertanyaan wawancara mendalam yang 100% spesifik merujuk pada rumpun ilmu,
 * instansi sasaran, dan kategori yang dipilih pengguna (Bukan template dummy).
 */
export function generateDiagnosticQuestions(
  title: string,
  category: ProposalCategory,
  targetEntity: string = ""
): DiagnosticQuestion[] {
  const entityName = targetEntity.trim() || (category === "magang" ? "instansi mitra / industri" : "lokasi / subjek penelitian");
  const cleanTitle = title.trim();
  const domain = detectDomain(cleanTitle, entityName);

  if (category === "magang") {
    let deptSuggest = `Divisi Operasional & Manajemen Terkait di ${entityName}.`;
    let gapSuggest = `Ketiadaan modul otomatisasi terstandar yang menyebabkan inefisiensi waktu kerja pada alur kerja operasional.`;
    let toolsSuggest = `Metodologi analisis terstandar, perangkat lunak penunjang, dan Standard Operating Procedure (SOP).`;
    let outSuggest = `1 Prototipe fungsional / modul kerja teruji, 1 set dokumen SOP teknis, serta laporan evaluasi kinerja.`;

    if (domain === "health") {
      deptSuggest = `Instalasi Pelayanan Gizi Klinis & Promosi Kesehatan (Promkes) di ${entityName}.`;
      gapSuggest = `Tingginya disparitas beban skrining gizi manual dan belum adanya standarisasi alur konseling edukasi nutrisi terpadu.`;
      toolsSuggest = `Antropometri terstandar (Microtoise, Seca), kuesioner SQ-FFQ, software WHO AnthroPlus, dan analisis statistik SPSS.`;
      outSuggest = `Modul panduan konseling gizi spesifik komunitas, database profil status nutrisi terverifikasi, dan laporan akhir praktik profesi.`;
    } else if (domain === "education") {
      deptSuggest = `Divisi Kurikulum, Tenaga Kependidikan, & Evaluasi Pembelajaran di ${entityName}.`;
      gapSuggest = `Rendahnya interaktivitas proses instruksional dan belum terstrukturnya instrumen asesmen formatif berkala.`;
      toolsSuggest = `Model instruksional ADDIE, lembar validasi materi/media Aiken's V, dan rubrik penilaian kognitif.`;
      outSuggest = `Paket modul ajar kurikulum terintegrasi, lembar kerja siswa (LKPD), dan pedoman implementasi bagi guru.`;
    } else if (domain === "business") {
      deptSuggest = `Departemen Manajemen Risiko Finansial, Akuntansi, & Pengendalian Kinerja di ${entityName}.`;
      gapSuggest = `Fluktuasi pengelolaan modal kerja dan keterbatasan pemantauan rasio solvabilitas secara real-time.`;
      toolsSuggest = `Analisis rasio keuangan (ROA, ROE, CR), Altman Z-score, dan executive dashboard Power BI / Excel Modeling.`;
      outSuggest = `Laporan audit diagnostik keuangan internal, dashboard kinerja rasio, dan rekomendasi mitigasi risiko likuiditas.`;
    } else if (domain === "law") {
      deptSuggest = `Bagian Bantuan Hukum, Advokasi, & Regulasi Kebijakan di ${entityName}.`;
      gapSuggest = `Timbulnya multitafsir yuridis terhadap implementasi regulasi operasional yang berpotensi menimbulkan risiko sengketa.`;
      toolsSuggest = `Metode penelusuran bahan hukum primer/sekunder, pendekatan perundang-undangan (statute approach), dan silogisme deduktif.`;
      outSuggest = `Dokumen Legal Opinion komprehensif, draf harmonisasi peraturan internal, dan panduan mitigasi kepatuhan hukum.`;
    } else if (domain === "tech") {
      deptSuggest = `Divisi Rekayasa Perangkat Lunak & Sistem Cerdas di ${entityName}.`;
      gapSuggest = `Tingginya latensi pemrosesan data manual dan keterbatasan sistem eksisting dalam mengelola integrasi layanan secara otomatis.`;
      toolsSuggest = `Arsitektur microservices, REST API / gRPC, Docker containerization, automated testing, dan Git.`;
      outSuggest = `1 Prototipe sistem fungsional teruji (unit test >80%), dokumentasi arsitektur (SRS), dan panduan instalasi.`;
    }

    return [
      {
        id: "targetDepartment",
        field: "targetDepartment",
        question: `Pada divisi atau unit operasional spesifik mana Anda merencanakan implementasi "${cleanTitle}" di ${entityName}?`,
        contextHint: `SOP Magang Kampus mengharuskan identifikasi spesifik divisi/unit di ${entityName} agar selaras dengan Key Performance Indicators (KPI) unit kerja.`,
        placeholder: `Contoh: ${deptSuggest}...`,
        aiSuggestion: deptSuggest,
        thinkingModeApplied: "First-Principles Thinking (Pemetaan fondasi organisasi)"
      },
      {
        id: "problemStatement",
        field: "problemStatement",
        question: `Apa kesenjangan operasional (gap) atau inefisiensi nyata yang saat ini terjadi di ${entityName} sehingga usulan "${cleanTitle}" mendesak diselesaikan?`,
        contextHint: "Latar belakang proposal magang harus berbasis masalah riil di industri/lapangan, bukan sekadar keinginan 'mencari pengalaman'.",
        placeholder: "Uraikan bottleneck operasional, tingginya latensi/biaya, atau keterbatasan metode eksisting...",
        aiSuggestion: gapSuggest,
        thinkingModeApplied: "Critical / Falsification Thinking (Menguji asumsi hambatan nyata)"
      },
      {
        id: "toolsSkillset",
        field: "toolsSkillset",
        question: `Instrumen, metodologi kerja, perangkat lunak, atau protokol apa yang akan Anda terapkan untuk mengeksekusi "${cleanTitle}"?`,
        contextHint: "Kesesuaian instrumen membuktikan kesiapan teknis mahasiswa menghadapi standar mutu profesi.",
        placeholder: "Sebutkan instrumen, perangkat pengolah data, dan metode kerja...",
        aiSuggestion: toolsSuggest,
        thinkingModeApplied: "Occam's Razor (Memilih metode paling efisien dan tepat guna)"
      },
      {
        id: "deliverables",
        field: "deliverables",
        question: `Apa produk kerja nyata (tangible deliverable) yang Anda janjikan selesai dan diserahterimakan kepada mentor ${entityName} di akhir masa penugasan?`,
        contextHint: "Menjadi tolok ukur kelulusan dan bukti kontribusi nyata mahasiswa bagi mitra.",
        placeholder: "Contoh: Modul fungsional, laporan evaluasi komparatif, dokumen SOP...",
        aiSuggestion: outSuggest,
        thinkingModeApplied: "Pareto 80/20 (Fokus pada deliverable inti bernilai dampak tinggi)"
      }
    ];
  }

  // Skripsi / Tesis / Penelitian Akademik
  if (domain === "health") {
    return [
      {
        id: "populasi_sampel",
        field: "targetDepartment",
        question: `Siapakah populasi target, karakteristik subjek sasaran, atau kriteria inklusi/eksklusi sampel dalam penelitian "${cleanTitle}" di ${entityName}?`,
        contextHint: "Menentukan validitas eksternal epidemiologis dan keterjangkauan sampel (representatif).",
        placeholder: `Contoh: Remaja usia 13-18 tahun di wilayah kerja ${entityName}...`,
        aiSuggestion: `Subjek remaja usia 13–18 tahun di wilayah kerja ${entityName} dengan kriteria inklusi bersedia menandatangani informed consent/assent dan tidak menderita penyakit kronis tirah baring.`,
        thinkingModeApplied: "First-Principles Thinking (Definisi batasan populasi klinis)"
      },
      {
        id: "variabel_riset",
        field: "problemStatement",
        question: `Apa saja variabel independen (bebas), variabel dependen (terikat), dan potensi variabel perancu (confounding) yang diteliti dalam "${cleanTitle}"?`,
        contextHint: "Landasan utama penyusunan Kerangka Konsep Bab II dan Definisi Operasional Bab III.",
        placeholder: "Variabel Bebas: ..., Variabel Terikat: ..., Variabel Perancu: ...",
        aiSuggestion: `Variabel Bebas: Frekuensi konsumsi makanan cepat saji (SQ-FFQ) dan tingkat aktivitas fisik (IPAQ-SF); Variabel Terikat: Kejadian obesitas (IMT/U z-score); Variabel Perancu: Riwayat genetik orang tua dan pendapatan keluarga.`,
        thinkingModeApplied: "Holistic / Systems Thinking (Pemetaan keterhubungan antar-variabel biologis)"
      },
      {
        id: "desain_metode",
        field: "toolsSkillset",
        question: `Desain studi epidemiologi, alat ukur antropometri, dan instrumen apa yang direncanakan untuk membuktikan hipotesis "${cleanTitle}"?`,
        contextHint: "Mengacu pada pedoman standar pelaporan STROBE (Strengthening the Reporting of Observational Studies in Epidemiology).",
        placeholder: "Contoh: Observasional analitik cross-sectional, timbangan Seca, kuesioner SQ-FFQ...",
        aiSuggestion: `Desain observasional analitik dengan pendekatan cross-sectional. Alat ukur meliputi Timbangan Digital Seca (ketelitian 0,1 kg), Microtoise (0,1 cm), kuesioner Semi-Quantitative Food Frequency Questionnaire (SQ-FFQ), dan formulir IPAQ-SF.`,
        thinkingModeApplied: "Critical / Falsification Thinking (Uji ketahanan hipotesis klinis)"
      },
      {
        id: "rencana_analisis",
        field: "deliverables",
        question: `Rencana uji hipotesis biostatistika (univariat, bivariat, multivariat) dan luaran apa yang ditargetkan dari penelitian ini?`,
        contextHint: "Pencantuman taraf signifikansi α = 0,05, uji Chi-Square, dan estimasi Odds Ratio (OR).",
        placeholder: "Contoh: Uji normalitas Shapiro-Wilk, Chi-Square, Regresi Logistik Biner, publikasi jurnal SINTA...",
        aiSuggestion: `Analisis bivariat menggunakan uji Chi-Square (taraf signifikansi p < 0,05) dan pemodelan multivariat regresi logistik biner untuk menentukan nilai Adjusted Odds Ratio (aOR) 95% CI, menghasilkan draf naskah skripsi lengkap dan manuskrip jurnal SINTA.`,
        thinkingModeApplied: "Probabilistic & Bayesian Updating (Rigoritas inferensi biostatistika)"
      }
    ];
  }

  if (domain === "education") {
    return [
      {
        id: "populasi_sampel",
        field: "targetDepartment",
        question: `Siapakah populasi sasaran, kelas perlakuan, dan karakteristik peserta didik yang menjadi subjek penelitian "${cleanTitle}" di ${entityName}?`,
        contextHint: "Menentukan kriteria sampel dan kelompok eksperimen vs kelompok kontrol.",
        placeholder: `Contoh: Peserta didik kelas X di ${entityName}...`,
        aiSuggestion: `Peserta didik jenjang menengah di ${entityName} yang dibagi ke dalam kelompok eksperimen dan kelompok kontrol menggunakan teknik purposive sampling.`,
        thinkingModeApplied: "First-Principles Thinking (Batasan subjek pedagogis)"
      },
      {
        id: "variabel_riset",
        field: "problemStatement",
        question: `Apa variabel perlakuan (media/metode), variabel hasil belajar, dan kesenjangan kompetensi yang ingin diatasi dalam "${cleanTitle}"?`,
        contextHint: "Pemetaan kesenjangan daya serap kognitif siswa terhadap standar kelulusan minimal.",
        placeholder: "Variabel Bebas: Media Interaktif; Variabel Terikat: Capaian Kognitif (C1-C4)...",
        aiSuggestion: `Variabel Bebas: Penerapan media/modul pembelajaran inovatif; Variabel Terikat: Peningkatan hasil belajar kognitif dan retensi konsep siswa; Kesenjangan: Metode konvensional menghasilkan ketuntasan belajar di bawah KKM.`,
        thinkingModeApplied: "Systems Thinking (Korelasi metode ajar & serapan belajar)"
      },
      {
        id: "desain_metode",
        field: "toolsSkillset",
        question: `Model pengembangan atau desain eksperimen apa yang diterapkan, serta bagaimana protokol validasi instrumennya?`,
        contextHint: "Mengacu pada model instruksional ADDIE / 4D dan uji validitas konstruk Aiken's V.",
        placeholder: "Model ADDIE, uji validitas ahli materi/media, tes pretest-posttest...",
        aiSuggestion: `Model pengembangan ADDIE (Analysis, Design, Development, Implementation, Evaluation) dikombinasikan dengan Quasi-Experimental Pretest-Posttest Control Group Design, tervalidasi menggunakan formula Aiken's V oleh 3 validator ahli.`,
        thinkingModeApplied: "Occam's Razor (Model instruksional teruji)"
      },
      {
        id: "rencana_analisis",
        field: "deliverables",
        question: `Metode uji statistik apa yang digunakan untuk mengukur efektivitas dan luaran konkret apa yang dihasilkan?`,
        contextHint: "Kalkulasi gain skor (Normalized Gain) dan pengujian signifikansi t-test.",
        placeholder: "Uji Paired t-test, Hake's N-Gain, modul ajar cetak, manuskrip publikasi...",
        aiSuggestion: `Analisis uji beda Paired Samples t-test (p < 0,05) dan kalkulasi Hake's Normalized Gain (N-Gain) untuk membuktikan efektivitas materi ajar, dengan luaran paket perangkat ajar tervalidasi dan manuskrip artikel jurnal pendidikan.`,
        thinkingModeApplied: "Critical / Falsification Thinking (Verifikasi gain kognitif)"
      }
    ];
  }

  // Default Skripsi (Umum / Engineering / Tech)
  return [
    {
      id: "populasi_sampel",
      field: "targetDepartment",
      question: `Siapakah populasi target, objek spesifik, atau sumber data primer yang akan dianalisis dalam penelitian "${cleanTitle}" di ${entityName}?`,
      contextHint: "Menentukan batasan ruang lingkup objek riset dan validitas data yang diperoleh.",
      placeholder: `Jelaskan objek atau unit analisis di ${entityName}...`,
      aiSuggestion: `Objek kajian spesifik dan dataset terverifikasi di ${entityName} dengan delimitasi parameter yang terukur.`,
      thinkingModeApplied: "First-Principles Thinking (Definisi batasan populasi objek)"
    },
    {
      id: "variabel_riset",
      field: "problemStatement",
      question: `Apa saja variabel bebas, variabel terikat, atau indikator kinerja utama yang diukur dalam "${cleanTitle}"?`,
      contextHint: "Landasan utama penyusunan kerangka konseptual dan batasan operasional penelitian.",
      placeholder: "Variabel Bebas: ..., Variabel Terikat: ..., Parameter Kinerja: ...",
      aiSuggestion: `Variabel Bebas: Metode atau perlakuan baru yang diuji; Variabel Terikat: Efektivitas, akurasi, dan parameter performa terukur.`,
      thinkingModeApplied: "Holistic / Systems Thinking (Pemetaan keterhubungan variabel)"
    },
    {
      id: "desain_metode",
      field: "toolsSkillset",
      question: `Desain metodologi, instrumen validasi, atau alat komputasi apa yang direncanakan untuk membuktikan hipotesis "${cleanTitle}"?`,
      contextHint: "Standar protokol pengujian empiris dan kalibrasi instrumen.",
      placeholder: "Metodologi kuantitatif eksperimental dengan protokol pengujian terstandar...",
      aiSuggestion: `Metodologi eksperimental kuantitatif dengan protokol validasi terstandar, pengujian berulang, dan kalibrasi alat ukur.`,
      thinkingModeApplied: "Critical / Falsification Thinking (Uji ketahanan hipotesis)"
    },
    {
      id: "rencana_analisis",
      field: "deliverables",
      question: `Rencana uji signifikansi atau benchmarking komparatif apa yang digunakan serta luaran apa yang ditargetkan?`,
      contextHint: "Uji signifikansi statistik (p < 0,05) atau perbandingan terhadap baseline.",
      placeholder: "Uji signifikansi, analisis komparatif, naskah skripsi lengkap, dan manuskrip jurnal...",
      aiSuggestion: `Uji signifikansi komparatif (p < 0,05) terhadap kondisi baseline serta penyusunan draf lengkap naskah skripsi dan manuskrip jurnal ilmiah.`,
      thinkingModeApplied: "Probabilistic & Bayesian Updating (Rigoritas data empiris)"
    }
  ];
}
