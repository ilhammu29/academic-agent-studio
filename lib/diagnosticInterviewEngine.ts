/**
 * OXID ACADEMIC STUDIO — ADAPTIVE DIAGNOSTIC INTERVIEW & MISSING INFORMATION DETECTOR
 * 
 * Enforces:
 * 1. Adaptive Interview Questioning based on Document Type & Scientific Domain
 * 2. Missing Information Detector (flags missing variables before AI orchestration)
 * 3. Clear distinction between Proposals (prospective) and Final Reports (empirical data required)
 * 4. Prevents empirical data fabrication and hallucinated conclusions
 */

import type { DiagnosticQuestion, ProposalCategory, ReportType } from '../types/studio.ts';
import type { AcademicDocumentType } from './academicRuleEngine.ts';

export interface MissingInformationItem {
  key: string;
  variableName: string;
  category: 'data_access' | 'methodology' | 'sample_size' | 'ethics_permits' | 'deliverable' | 'mentor_verification';
  severity: 'critical' | 'high' | 'medium';
  questionPrompt: string;
  remediationAdvice: string;
}

export interface InformationCompletenessReport {
  isReadyForOrchestration: boolean;
  completenessPercentage: number;
  criticalMissingCount: number;
  factualEvidenceFound: string[];
  unverifiedAssumptionsFound: string[];
  missingItems: MissingInformationItem[];
}

/**
 * Generate domain & documentType adaptive interview questions
 */
export function getAdaptiveDiagnosticQuestions(
  title: string,
  category: ProposalCategory,
  targetEntity: string = '',
  reportType?: ReportType | AcademicDocumentType
): DiagnosticQuestion[] {
  const isFinalReport = reportType === 'laporan_magang' || reportType === 'skripsi_final' || reportType === 'laporan_penelitian';
  const isTesis = reportType === 'tesis' || category === 'penelitian';

  // Base domain questions for PROPOSALS
  if (!isFinalReport) {
    if (category === 'magang') {
      return [
        {
          id: 'q1_problem',
          field: 'latarBelakang',
          question: `Apa masalah konkret atau hambatan operasional utama di ${targetEntity || 'instansi/perusahaan'} yang hendak Anda selesaikan melalui magang ini?`,
          contextHint: 'Sebutkan proses manual, inefisiensi waktu, keterbatasan sistem, atau kebutuhan unit kerja mitra.',
          placeholder: 'Contoh: Proses rekapitulasi data inventaris masih manual menggunakan spreadsheet terpisah sehingga memakan waktu 3 hari setiap akhir bulan...',
          aiSuggestion: `Identifikasi bottleneck operasional atau kesenjangan teknologi yang dihadapi ${targetEntity || 'mitra'}.`,
          thinkingModeApplied: 'First-Principles Thinking & Gap Analysis'
        },
        {
          id: 'q2_scope',
          field: 'lingkupPekerjaan',
          question: `Di divisi/unit kerja mana Anda ditempatkan, dan apa saja batasan lingkup pekerjaan (scope of work) yang disepakati?`,
          contextHint: 'Jelaskan batasan apa yang DIKERJAKAN dan apa yang TIDAK DIKERJAKAN agar target magang terukur.',
          placeholder: 'Contoh: Ditempatkan di Divisi IT & Infrastruktur. Fokus pada perancangan modul dashboard monitoring, tidak mencakup implementasi payment gateway...',
          aiSuggestion: 'Tentukan batasan lingkup WBS (Work Breakdown Structure) yang realistis dalam durasi magang.',
          thinkingModeApplied: 'Scope Bounding & Constraint Modeling'
        },
        {
          id: 'q3_method_tools',
          field: 'perangkatTools',
          question: `Metode kerja, kerangka kerja (framework), serta perangkat keras/lunak apa saja yang akan Anda terapkan?`,
          contextHint: 'Sebutkan bahasa pemrograman, software analitik, standar SOP industri, atau model pengembangan (misal: Agile/Scrum).',
          placeholder: 'Contoh: Menggunakan metode Scrum 2-mingguan, stack Next.js, PostgreSQL, Docker, serta pengujian automated testing...',
          aiSuggestion: 'Petakan tools teknis dan metodologi kerja industri yang relevan.',
          thinkingModeApplied: 'Algorithmic Systems Design'
        },
        {
          id: 'q4_competency',
          field: 'rencanaKompetensi',
          question: `Keterampilan teknis dan kompetensi capaian pembelajaran apa yang ditargetkan dalam kurikulum program studi Anda?`,
          contextHint: 'Sinkronisasi antara capaian mata kuliah magang dengan proyek nyata di instansi.',
          placeholder: 'Contoh: Kemampuan perancangan arsitektur basis data relasional, implementasi REST API aman, dan kolaborasi git workflow tim...',
          aiSuggestion: 'Hubungkan aktivitas magang dengan target kompetensi SKKNI atau silabus kampus.',
          thinkingModeApplied: 'Bloom Taxonomy & Competency Alignment'
        },
        {
          id: 'q5_data_access',
          field: 'aksesData',
          question: `Bagaimana status izin akses data perusahaan dan ketentuan Non-Disclosure Agreement (NDA) terkait kerahasiaan informasi?`,
          contextHint: 'Penting agar laporan magang tidak melanggar privasi atau membocorkan data rahasia instansi.',
          placeholder: 'Contoh: Data pengguna akan di-anonymize (disamarkan) dan pihak pembimbing industri telah menyetujui pemakaian data sampel dummy untuk naskah laporan...',
          aiSuggestion: 'Tetapkan protokol mitigasi NDA dan anonimisasi data perusahaan.',
          thinkingModeApplied: 'Ethical & Compliance Risk Modeling'
        }
      ];
    }

    // SKRIPSI / PENELITIAN / TESIS PROPOSAL
    return [
      {
        id: 'q1_research_gap',
        field: 'latarBelakang',
        question: `Apa kesenjangan penelitian (Research Gap) atau celah teoritis antara literatur terkini dengan kondisi empiris yang Anda teliti?`,
        contextHint: 'Jelaskan mengapa penelitian ini penting dilakukan sekarang dan apa kelemahan dari penelitian-penelitian sebelumnya.',
        placeholder: 'Contoh: Penelitian terdahulu oleh Smith (2023) hanya menguji model pada dataset sintetis, sedangkan pada kondisi riil dengan noise tinggi akurasi menurun drastis...',
        aiSuggestion: isTesis ? 'Rumuskan novelty teoretis dan celah paradigma dalam literatur Scopus/Sinta.' : 'Uraikan kesenjangan antara teori dengan fenomena nyata.',
        thinkingModeApplied: 'Dialectical Synthesis & Research Gap Mapping'
      },
      {
        id: 'q2_problem_statement',
        field: 'rumusanMasalah',
        question: `Bagaimana perumusan masalah penelitian Anda secara spesifik, terukur, dan berorientasi pada hipotesis/pertanyaan ilmiah?`,
        contextHint: 'Rumuskan dalam 2 atau 3 butir pertanyaan ilmiah yang akan dijawab tuntas pada bab pembahasan.',
        placeholder: 'Contoh: 1. Bagaimana pengaruh parameter X terhadap variabel Y? 2. Seberapa efektif algoritma Z dalam mereduksi latency...?',
        aiSuggestion: 'Gunakan kaidah rumusan masalah 5W+1H yang memiliki variabel dependen dan independen jelas.',
        thinkingModeApplied: 'Cartesian Reductionism & Variable Modeling'
      },
      {
        id: 'q3_methodology',
        field: 'metodePelaksanaan',
        question: `Metode penelitian, desain eksperimen/studi, teknik sampling, serta instrumen pengumpulan data apa yang direncanakan?`,
        contextHint: 'Kualitatif/Kuantitatif/Eksperimental/R&D. Sebutkan jumlah sampel, populasi, atau parameter pengujian.',
        placeholder: 'Contoh: Metode kuantitatif eksperimental dengan rancangan pre-post test. Populasi 150 responden dengan purposive sampling 60 sampel...',
        aiSuggestion: 'Sebutkan instrumen pengumpulan data (kuesioner Likert/sensor/API log) dan teknik analisis statistiknya.',
        thinkingModeApplied: 'Biostatistics & Experimental Rigor'
      },
      {
        id: 'q4_data_availability',
        field: 'ketersediaanData',
        question: `Dari mana sumber dataset atau subjek penelitian diperoleh, dan apakah instrumen telah melalui uji validitas/reliabilitas?`,
        contextHint: 'Keabsahan data sangat krusial agar penguji tidak meragukan keaslian data penelitian Anda.',
        placeholder: 'Contoh: Data sekunder diunduh dari repositori publik Kaggle/BPS periode 2020-2024. Instrumen kuesioner akan diuji validitas Pearson Product Moment...',
        aiSuggestion: 'Pastikan data dapat diakses secara legal dan tidak melanggar etika penelitian.',
        thinkingModeApplied: 'Empirical Verification Protocol'
      },
      {
        id: 'q5_novelty_contribution',
        field: 'tujuanKhusus',
        question: `Apa kontribusi kebaruan (Novelty) dan luaran spesifik (Sistem/Artikel Jurnal/Paten) yang akan dihasilkan?`,
        contextHint: 'Tunjukkan perbedaan pembeda utama usulan Anda dibandingkan karya ilmiah yang sudah ada.',
        placeholder: 'Contoh: Modifikasi penambahan attention mechanism pada arsitektur model, menghasilkan purwarupa web interaktif dan draft manuskrip jurnal Sinta 2...',
        aiSuggestion: 'Tegaskan kontribusi teoretis maupun praktis yang nyata.',
        thinkingModeApplied: 'Novelty Differentiation Matrix'
      }
    ];
  }

  // QUESTIONS FOR FINAL REPORTS (LAPORAN MAGANG / SKRIPSI FINAL)
  return [
    {
      id: 'q1_actual_results',
      field: 'hasilPelaksanaan',
      question: `Apa saja temuan atau hasil aktual yang telah berhasil dicapai dari pelaksanaan kegiatan/penelitian di lapangan?`,
      contextHint: 'Laporan final WAJIB memuat data riil: metrik kinerja, artefak yang selesai dibangun, atau data statistik yang didapatkan.',
      placeholder: 'Contoh: Telah berhasil mengimplementasikan sistem monitoring dengan rata-rata waktu respon 120ms dan mereduksi insiden downtime sebesar 35%...',
      aiSuggestion: 'Paparkan angka capaian konkret, bukan rencana masa depan.',
      thinkingModeApplied: 'Empirical Grounding & Result Validation'
    },
    {
      id: 'q2_empirical_data',
      field: 'dataTemuan',
      question: `Sebutkan parameter uji, tabel data pengujian, atau bukti dokumentasi kegiatan yang siap dicantumkan dalam Bab IV?`,
      contextHint: 'Sistem menolak fabrikasi data fiktif. Mohon masukkan ringkasan data pengukuran atau bukti observasi Anda.',
      placeholder: 'Contoh: Pengujian dilakukan pada 1.200 transaksi uji dengan tingkat akurasi 94.2%, F1-score 0.91, dan p-value < 0.05...',
      aiSuggestion: 'Sertakan metrik kuantitatif atau temuan kualitatif utama.',
      thinkingModeApplied: 'Anti-Fabrication & Evidence Cross-Check'
    },
    {
      id: 'q3_discussion_comparison',
      field: 'pembahasanKomparatif',
      question: `Bagaimana perbandingan antara hasil yang Anda capai dengan teori atau penelitian terdahulu yang dirujuk pada Bab II?`,
      contextHint: 'Apakah hasil temuan Anda mendukung teori, membantah hipotesis, atau menghasilkan pola baru di lapangan?',
      placeholder: 'Contoh: Hasil membuktikan bahwa penerapan arsitektur microservices lebih efisien dibanding monolitik, sejalan dengan temuan Tan (2023)...',
      aiSuggestion: 'Hubungkan temuan Bab IV secara kritis dengan tinjauan pustaka Bab II.',
      thinkingModeApplied: 'Comparative Theoretical Grounding'
    },
    {
      id: 'q4_obstacles_mitigation',
      field: 'kendalaDanSolusi',
      question: `Kendala teknis atau kendala lapangan apa saja yang dihadapi selama proses berjalan, dan bagaimana solusi yang Anda ambil?`,
      contextHint: 'Penguji sidang selalu menanyakan kendala riil dan keabsahan penyelesaian masalah oleh mahasiswa.',
      placeholder: 'Contoh: Sempat terjadi ketidakseimbangan kelas data (imbalance dataset), diselesaikan dengan teknik SMOTE oversampling...',
      aiSuggestion: 'Tuliskan dinamika pemecahan masalah riil selama penelitian/magang.',
      thinkingModeApplied: 'Heuristic Problem Solving & Reflection'
    },
    {
      id: 'q5_conclusion_recommendation',
      field: 'kesimpulanSaran',
      question: `Apa kesimpulan utama yang menjawab langsung rumusan masalah awal, serta saran keberlanjutan bagi mitra/peneliti selanjutnya?`,
      contextHint: 'Pastikan kesimpulan Anda sinkron 1-banding-1 dengan tujuan yang diajukan di Bab I.',
      placeholder: 'Contoh: 1. Sistem berhasil diintegrasikan dengan efisiensi 94%. 2. Disarankan penambahan modul prediksi otomatis untuk tahap pengembangan berikutnya...',
      aiSuggestion: 'Rumuskan kesimpulan padat yang terbukti oleh data empiris.',
      thinkingModeApplied: 'Triangulation & Teleological Closure'
    }
  ];
}

/**
 * Missing Information Detector
 * Validates user answers before AI orchestration to avoid hallucinated documents
 */
export function detectMissingInformation(
  answers: Record<string, string>,
  category: ProposalCategory,
  reportType?: ReportType | AcademicDocumentType
): InformationCompletenessReport {
  const missingItems: MissingInformationItem[] = [];
  const factualEvidenceFound: string[] = [];
  const unverifiedAssumptionsFound: string[] = [];

  const isFinalReport = reportType === 'laporan_magang' || reportType === 'skripsi_final' || reportType === 'laporan_penelitian';

  // 1. Check Problem Definition
  const problemText = answers['q1_problem'] || answers['q1_research_gap'] || answers['latarBelakang'] || '';
  if (!problemText || problemText.trim().length < 30) {
    missingItems.push({
      key: 'problem_clarity',
      variableName: 'Akar Masalah / Research Gap',
      category: 'methodology',
      severity: 'critical',
      questionPrompt: 'Masalah penelitian atau kebutuhan lapangan belum diuraikan secara mendalam.',
      remediationAdvice: 'Tuliskan minimal 2-3 kalimat penjelasan mengenai masalah nyata yang dihadapi atau kesenjangan teoretis yang ingin dipecahkan.'
    });
  } else {
    factualEvidenceFound.push('Deskripsi masalah / research gap telah diisi pengguna.');
  }

  // 2. Check Methodology & Tools
  const methodText = answers['q3_method_tools'] || answers['q3_methodology'] || answers['metodePelaksanaan'] || '';
  if (!methodText || methodText.trim().length < 25) {
    missingItems.push({
      key: 'methodology_tools',
      variableName: 'Metodologi & Alat Kerja',
      category: 'methodology',
      severity: 'critical',
      questionPrompt: 'Metode pelaksanaan atau kerangka kerja teknis belum terdefinisi.',
      remediationAdvice: 'Sebutkan metode analisis, algoritma, atau framework yang akan Anda terapkan agar naskah Bab III tidak generik.'
    });
  } else {
    factualEvidenceFound.push('Metode dan perangkat kerja telah dinyatakan.');
  }

  // 3. For Final Reports: Must Have Actual Data / Findings
  if (isFinalReport) {
    const resultsText = answers['q1_actual_results'] || answers['q2_empirical_data'] || answers['hasilPelaksanaan'] || '';
    if (!resultsText || resultsText.trim().length < 35) {
      missingItems.push({
        key: 'empirical_findings',
        variableName: 'Data Hasil Temuan Aktual',
        category: 'data_access',
        severity: 'critical',
        questionPrompt: 'Laporan final tidak dapat disusun tanpa data hasil temuan empiris yang nyata.',
        remediationAdvice: 'Masukkan ringkasan data capaian, angka hasil pengujian, atau artefak konkret yang telah diselesaikan di lapangan. AI dilarang memfabrikasi data fiktif.'
      });
    } else {
      factualEvidenceFound.push('Data temuan empiris telah disediakan oleh pengguna.');
    }
  }

  // 4. Check Data Access & NDA for Magang
  if (category === 'magang') {
    const accessText = answers['q5_data_access'] || answers['aksesData'] || '';
    if (!accessText || accessText.trim().length < 15) {
      missingItems.push({
        key: 'nda_data_privacy',
        variableName: 'Izin Akses Data & Kerahasiaan (NDA)',
        category: 'ethics_permits',
        severity: 'high',
        questionPrompt: 'Status izin akses data dan kepatuhan NDA mitra belum dicantumkan.',
        remediationAdvice: 'Jelaskan apakah data perusahaan bersifat rahasia dan apakah dilakukan anonimisasi data untuk naskah laporan.'
      });
    }
  }

  // Assess language for assumptions vs facts
  const combinedAnswers = Object.values(answers).join(' ').toLowerCase();
  const assumptionWords = ['mungkin', 'sepertinya', 'kira-kira', 'asumsi', 'kemungkinan', 'bisa jadi', 'konon'];
  assumptionWords.forEach(word => {
    if (combinedAnswers.includes(word)) {
      unverifiedAssumptionsFound.push(`Terdapat kata bernuansa asumsi ('${word}') pada masukan pengguna.`);
    }
  });

  const criticalMissingCount = missingItems.filter(m => m.severity === 'critical').length;
  const isReady = criticalMissingCount === 0;

  // Calculate completeness score
  const totalChecks = isFinalReport ? 5 : 4;
  const passedChecks = totalChecks - missingItems.length;
  const completenessPercentage = Math.max(20, Math.min(100, Math.round((passedChecks / totalChecks) * 100)));

  return {
    isReadyForOrchestration: isReady,
    completenessPercentage,
    criticalMissingCount,
    factualEvidenceFound,
    unverifiedAssumptionsFound,
    missingItems
  };
}
