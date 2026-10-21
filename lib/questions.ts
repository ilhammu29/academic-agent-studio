import { DiagnosticQuestion, ProposalCategory } from "@/types/studio";

export function generateDiagnosticQuestions(
  title: string,
  category: ProposalCategory,
  targetEntity: string
): DiagnosticQuestion[] {
  if (category === "magang") {
    return [
      {
        id: "divisi_unit",
        field: "targetDepartment",
        question: `Di divisi atau direktorat mana magang ini direncanakan berlangsung di ${targetEntity || "perusahaan"}?`,
        contextHint: "SOP Academic Campus Pro mengharuskan identifikasi spesifik unit kerja agar tujuan magang selaras dengan Key Performance Indicators (KPI) instansi.",
        placeholder: "Contoh: Divisi Enterprise & Cloud Solutions / Unit Data Intelligence...",
        aiSuggestion: `Divisi Big Data & Analytics Infrastructure di ${targetEntity || "perusahaan target"}, fokus pada pipeline pemrosesan data real-time.`,
        thinkingModeApplied: "First-Principles Thinking (Identifikasi akar sistem operasional)"
      },
      {
        id: "masalah_teknis",
        field: "problemStatement",
        question: "Apa kesenjangan teknis atau inefisiensi operasional yang ingin Anda pelajari atau carikan solusinya?",
        contextHint: "Latar belakang proposal magang yang kuat harus berangkat dari 'Reverse-Piramid' permasalahan riil industri, bukan sekadar ingin 'mencari pengalaman'.",
        placeholder: "Jelaskan problem spesifik di industri...",
        aiSuggestion: "Tingginya latensi integrasi data antar-cabang dan perlunya otomatisasi validasi laporan analitik harian tanpa intervensi manual yang rentan kesalahan.",
        thinkingModeApplied: "Critical / Falsification Thinking (Menguji asumsi hambatan riil)"
      },
      {
        id: "metode_tools",
        field: "toolsSkillset",
        question: "Perangkat lunak, framework, atau metodologi apa yang akan Anda terapkan selama magang?",
        contextHint: "Daftar kompetensi teknis membuktikan kesiapan mahasiswa menghadapi alur kerja profesional.",
        placeholder: "Contoh: Python, SQL, Next.js, Docker, Agile/Scrum...",
        aiSuggestion: "Python (Pandas, PySpark), PostgreSQL, Docker containerization, REST API, serta metodologi sprint Agile Scrum 2 mingguan.",
        thinkingModeApplied: "Occam's Razor (Memilih stack paling efisien dan aplikatif)"
      },
      {
        id: "deliverable_output",
        field: "deliverables",
        question: "Apa output konkret atau produk kerja yang dijanjikan selesai pada akhir masa magang?",
        contextHint: "Memberikan kejelasan kepada pembimbing lapangan (mentor industri) mengenai kontribusi nyata mahasiswa.",
        placeholder: "Contoh: Modul dashboard analytics, modul pipeline ETL otomatis, dan laporan teknis...",
        aiSuggestion: "1 prototipe modul otomatisasi data ingest, 1 dashboard visualisasi performa real-time, dan 1 dokumen SOP operasional untuk tim internal.",
        thinkingModeApplied: "Pareto Principle 80/20 (Fokus pada 20% output bernilai dampak 80%)"
      },
      {
        id: "durasi_waktu",
        field: "timelinePreference",
        question: "Berapa lama alokasi waktu magang dan kapan rencana mulai pelaksanaannya?",
        contextHint: "Digunakan untuk memetakan Matriks Rencana Kerja Mingguan (Gantt Chart 12–24 minggu).",
        placeholder: "Contoh: 4 bulan (Februari s.d. Mei 2026), 40 jam kerja per minggu...",
        aiSuggestion: "6 bulan (Semester Genap 2026), setara dengan 24 minggu kerja penuh (Program MBKM / Magang Mandiri Berbobot 20 SKS).",
        thinkingModeApplied: "Temporal / Multi-Horizon Thinking (Penyelarasan linimasa akademik & industri)"
      },
      {
        id: "manfaat_spesifik",
        field: "benefitTarget",
        question: "Bagaimana kegiatan magang ini memberikan manfaat timbal-balik bagi perguruan tinggi dan instansi mitra?",
        contextHint: "Menjadi syarat kelolosan verifikasi administrasi kerjasama kampus.",
        placeholder: "Kemitraan riset, talenta siap pakai, transfer pengetahuan...",
        aiSuggestion: "Membuka peluang rintisan kerjasama strategis riset terapan kampus-industri dan mencetak calon profesional siap rekrut dengan onboarding instan.",
        thinkingModeApplied: "Dialectical Synthesis (Menyelaraskan kepentingan akademis & komersial)"
      }
    ];
  } else {
    // Skripsi / Riset Medis & Saintek
    return [
      {
        id: "populasi_sampel",
        field: "targetDepartment",
        question: `Siapakah populasi target dan di mana lokasi penelitian akan diselenggarakan?`,
        contextHint: "Menentukan validitas eksternal dan keterjangkauan geografis subjek penelitian.",
        placeholder: "Contoh: Santri SMA Assalaam usia 15-18 tahun, Pasien Poli Klinik...",
        aiSuggestion: "Seluruh remaja usia 15-18 tahun di institusi sekolah berasrama dengan akses kantin mandiri.",
        thinkingModeApplied: "First-Principles Thinking"
      },
      {
        id: "variabel_riset",
        field: "problemStatement",
        question: "Apa saja variabel independen, dependen, dan variabel perancu yang akan dikontrol?",
        contextHint: "Diperlukan untuk penyusunan Kerangka Konsep Bab II dan Definisi Operasional Bab III.",
        placeholder: "Contoh: Variabel Bebas (Pola Makan, Aktivitas), Variabel Terikat (Obesitas IMT/U)...",
        aiSuggestion: "Variabel Bebas: Skor asupan SQ-FFQ & MET-menit IPAQ-SF; Variabel Terikat: Status Gizi Z-score IMT/U WHO 2007; Kontrol: Durasi tidur & genetik.",
        thinkingModeApplied: "Holistic / Systems Thinking"
      },
      {
        id: "desain_metode",
        field: "toolsSkillset",
        question: "Desain penelitian dan instrumen ukur apa yang direncanakan?",
        contextHint: "Standar pelaporan internasional STROBE / CONSORT menuntut spesifikasi validitas instrumen.",
        placeholder: "Contoh: Cross-sectional analitik komparatif, timbangan digital Seca, kuesioner SQ-FFQ...",
        aiSuggestion: "Observasional analitik komparatif cross-sectional, menggunakan instrumen baku SQ-FFQ modifikasi asrama dan IPAQ-Short Form versi Bahasa Indonesia.",
        thinkingModeApplied: "Critical / Falsification Thinking"
      },
      {
        id: "rencana_analisis",
        field: "deliverables",
        question: "Rencana uji hipotesis statistik apa yang akan digunakan untuk menguji signifikansi?",
        contextHint: "Panduan Academic Biostatistics Pro mewajibkan pencantuman taraf signifikansi α dan uji normalitas.",
        placeholder: "Contoh: Uji normalitas Shapiro-Wilk, Independent t-test / Mann-Whitney, dan Chi-Square...",
        aiSuggestion: "Uji normalitas Shapiro-Wilk, dilanjutkan Independent Sample t-test (atau Mann-Whitney bila skewed) dan Uji Chi-Square pada tingkat kemaknaan p < 0,05.",
        thinkingModeApplied: "Probabilistic & Bayesian Updating"
      },
      {
        id: "kelaikan_etik",
        field: "timelinePreference",
        question: "Bagaimana rencana persetujuan etik (ethical clearance) dan penanganan subjek manusia?",
        contextHint: "Kepatuhan Deklarasi Helsinki dan KEPK Komisi Etik.",
        placeholder: "Contoh: Informed consent orang tua, assent remaja, komisi etik fakultas...",
        aiSuggestion: "Pengajuan ethical clearance ke Komisi Etik Penelitian Kedokteran (KEPK), penyediaan formulir Informed Consent wali dan Assent partisipan remaja.",
        thinkingModeApplied: "Second-Order Thinking (Mitigasi risiko etik dan legalitas)"
      }
    ];
  }
}
