import type { CampusGuideline } from '../types/studio.ts';

export const CAMPUS_PRESETS: (CampusGuideline & { id: string; badge: string; description: string })[] = [
  {
    id: 'ugm',
    campusName: 'Universitas Gadjah Mada (UGM)',
    facultyMajor: 'Semua Fakultas / Sekolah Pascasarjana',
    guideDocTitle: 'Panduan Penulisan Skripsi & Tesis Standar UGM',
    badge: 'Margin 4-4-3-3 • TNR 12 • APA 7th',
    description: 'Format baku penulisan tugas akhir UGM dengan margin kiri 4cm, atas 4cm, kanan 3cm, bawah 3cm, spasi 1.5/2.0.',
    paperSize: 'A4',
    margins: {
      leftCm: 4,
      topCm: 4,
      rightCm: 3,
      bottomCm: 3
    },
    typography: {
      fontFamily: 'Times New Roman',
      bodySizePt: 12,
      heading1SizePt: 14,
      lineSpacing: 1.5
    },
    headingStyle: 'decimal',
    citationStyle: 'apa',
    approvalConfig: {
      supervisorCount: 2,
      requiresHeadOfProgram: true,
      requiresDeanOrFieldMentor: false
    },
    extractedNotes: [
      'Penomoran bab menggunakan angka Romawi (BAB I, BAB II), sub-bab desimal (1.1, 1.2).',
      'Jarak antar paragraf 1.5 spasi dengan inden awal 1 cm.',
      'Daftar rujukan wajib mencantumkan DOI atau link publikasi ilmiah.'
    ]
  },
  {
    id: 'ui',
    campusName: 'Universitas Indonesia (UI)',
    facultyMajor: 'Pedoman Teknis Penulisan Tugas Akhir Mahasiswa UI',
    guideDocTitle: 'Pedoman Penulisan Tugas Akhir UI',
    badge: 'Margin 4-4-3-3 • Times New Roman • APA/IEEE',
    description: 'Standar resmi penulisan tugas akhir UI, mengedepankan presisi perumusan masalah, batasan lingkup, dan etika kutipan.',
    paperSize: 'A4',
    margins: {
      leftCm: 4,
      topCm: 4,
      rightCm: 3,
      bottomCm: 3
    },
    typography: {
      fontFamily: 'Times New Roman',
      bodySizePt: 12,
      heading1SizePt: 14,
      lineSpacing: 1.5
    },
    headingStyle: 'decimal',
    citationStyle: 'apa',
    approvalConfig: {
      supervisorCount: 2,
      requiresHeadOfProgram: true,
      requiresDeanOrFieldMentor: true
    },
    extractedNotes: [
      'Halaman awal memakai angka Romawi kecil (i, ii, iii), teks utama memakai angka Arab.',
      'Wajib menyertakan lembar pernyataan bebas plagiarisme dan hak cipta.',
      'Format sitasi menggunakan APA 7th (sosial/humaniora/medis) atau IEEE (teknik/komputer).'
    ]
  },
  {
    id: 'itb',
    campusName: 'Institut Teknologi Bandung (ITB)',
    facultyMajor: 'Sekolah Pascasarjana & Fakultas Rekayasa ITB',
    guideDocTitle: 'Panduan Penulisan Proposal & Tesis ITB',
    badge: 'Margin 4-3-3-3 • Desimal • IEEE/APA',
    description: 'Format rekayasa teknik dan sains ITB: margin atas 3cm, kiri 4cm, kanan 3cm, bawah 3cm, ketat pada metode numerik dan pemodelan.',
    paperSize: 'A4',
    margins: {
      leftCm: 4,
      topCm: 3,
      rightCm: 3,
      bottomCm: 3
    },
    typography: {
      fontFamily: 'Times New Roman',
      bodySizePt: 12,
      heading1SizePt: 14,
      lineSpacing: 1.5
    },
    headingStyle: 'decimal',
    citationStyle: 'ieee',
    approvalConfig: {
      supervisorCount: 2,
      requiresHeadOfProgram: true,
      requiresDeanOrFieldMentor: false
    },
    extractedNotes: [
      'Sub-bab menggunakan notasi desimal murni: 1.1, 1.1.1, 1.1.2.',
      'Persamaan matematika diberi nomor di tepi kanan dalam tanda kurung, misal (1.1).',
      'Format kutipan diutamakan menggunakan gaya numerik IEEE [1], [2].'
    ]
  },
  {
    id: 'its',
    campusName: 'Institut Teknologi Sepuluh Nopember (ITS)',
    facultyMajor: 'Fakultas Sains dan Teknologi Analitika ITS',
    guideDocTitle: 'Buku Panduan Tugas Akhir & Magang Industri ITS',
    badge: 'Margin 4-4-3-3 • Times New Roman • IEEE',
    description: 'Format tugas akhir dan magang industri ITS Surabaya dengan penekanan pada spesifikasi teknis dan matriks pelaksanaan kerja.',
    paperSize: 'A4',
    margins: {
      leftCm: 4,
      topCm: 4,
      rightCm: 3,
      bottomCm: 3
    },
    typography: {
      fontFamily: 'Times New Roman',
      bodySizePt: 12,
      heading1SizePt: 14,
      lineSpacing: 1.5
    },
    headingStyle: 'decimal',
    citationStyle: 'ieee',
    approvalConfig: {
      supervisorCount: 2,
      requiresHeadOfProgram: true,
      requiresDeanOrFieldMentor: true
    },
    extractedNotes: [
      'Diagram alir penelitian (flowchart) wajib ada di awal Bab III.',
      'Tabel dan grafik memiliki format keterangan mandiri (self-explanatory caption).',
      'Sitasi menggunakan gaya IEEE dengan kurung siku.'
    ]
  },
  {
    id: 'undip',
    campusName: 'Universitas Diponegoro (Undip)',
    facultyMajor: 'Buku Pedoman Penulisan Skripsi Undip',
    guideDocTitle: 'Pedoman Penulisan Skripsi dan Laporan PKL Undip',
    badge: 'Margin 4-4-3-3 • Gaya Huruf A. 1. a. • APA 7th',
    description: 'Standar penulisan Undip Semarang yang sering menerapkan kombinasi desimal dan penomoran abjad-angka (A. 1. a.).',
    paperSize: 'A4',
    margins: {
      leftCm: 4,
      topCm: 4,
      rightCm: 3,
      bottomCm: 3
    },
    typography: {
      fontFamily: 'Times New Roman',
      bodySizePt: 12,
      heading1SizePt: 14,
      lineSpacing: 1.5
    },
    headingStyle: 'alphanumeric',
    citationStyle: 'apa',
    approvalConfig: {
      supervisorCount: 2,
      requiresHeadOfProgram: true,
      requiresDeanOrFieldMentor: false
    },
    extractedNotes: [
      'Struktur penomoran sub-bab: A. (Judul Subbab), 1. (Butir), a. (Anak Butir), 1) (Rincian).',
      'Spasi 1.5 dengan batas margin standar 4-4-3-3 cm.',
      'Gaya sitasi baku APA edisi ke-7.'
    ]
  },
  {
    id: 'unair',
    campusName: 'Universitas Airlangga (Unair)',
    facultyMajor: 'Fakultas Kedokteran, Kesehatan Masyarakat, & Humaniora',
    guideDocTitle: 'Pedoman Penulisan Karya Ilmiah Unair',
    badge: 'Margin 4-4-3-3 • TNR 12 • Spasi Ganda (2.0)',
    description: 'Pedoman standar Unair Surabaya, terutama rumpun kesehatan dan sosial dengan preferensi spasi ganda (2.0) saat naskah draf bimbingan.',
    paperSize: 'A4',
    margins: {
      leftCm: 4,
      topCm: 4,
      rightCm: 3,
      bottomCm: 3
    },
    typography: {
      fontFamily: 'Times New Roman',
      bodySizePt: 12,
      heading1SizePt: 14,
      lineSpacing: 2.0
    },
    headingStyle: 'decimal',
    citationStyle: 'apa',
    approvalConfig: {
      supervisorCount: 2,
      requiresHeadOfProgram: true,
      requiresDeanOrFieldMentor: true
    },
    extractedNotes: [
      'Menggunakan spasi 2.0 (ganda) untuk draft proposal bimbingan agar dosen leluasa memberi catatan revisi.',
      'Penyertaan lembar kelaikan etik (Ethical Clearance) untuk subjek manusia/hewan di Bab III.',
      'Daftar rujukan dianjurkan 80% berasal dari jurnal terindeks 5 tahun terakhir.'
    ]
  },
  {
    id: 'telkom',
    campusName: 'Telkom University',
    facultyMajor: 'Fakultas Informatika & Rekayasa Industri',
    guideDocTitle: 'Pedoman Penulisan Proposal Tugas Akhir Tel-U',
    badge: 'Margin 4-3-3-3 • Calibri / TNR • IEEE',
    description: 'Format terstruktur Tel-U berstandar akreditasi internasional IABEE, menekankan Capstone Design & kompetensi industri.',
    paperSize: 'A4',
    margins: {
      leftCm: 4,
      topCm: 3,
      rightCm: 3,
      bottomCm: 3
    },
    typography: {
      fontFamily: 'Times New Roman',
      bodySizePt: 12,
      heading1SizePt: 14,
      lineSpacing: 1.5
    },
    headingStyle: 'decimal',
    citationStyle: 'ieee',
    approvalConfig: {
      supervisorCount: 2,
      requiresHeadOfProgram: true,
      requiresDeanOrFieldMentor: false
    },
    extractedNotes: [
      'Gaya sitasi wajib numerik IEEE.',
      'Bab III wajib menyertakan arsitektur sistem, WBS (Work Breakdown Structure), dan metrik pengujian performa.',
      'Rencana jadwal matriks mingguan mencakup sprint Scrum atau tahapan Waterfall.'
    ]
  },
  {
    id: 'binus',
    campusName: 'Bina Nusantara University (BINUS)',
    facultyMajor: 'School of Computer Science & Business',
    guideDocTitle: 'Thesis Writing Manual Binus University',
    badge: 'Margin 4-3-3-3 • Arial / Calibri • Harvard/APA',
    description: 'Standar penulisan tesis dan skripsi Binus University yang modern dan fleksibel dengan font Arial atau Calibri.',
    paperSize: 'A4',
    margins: {
      leftCm: 4,
      topCm: 3,
      rightCm: 3,
      bottomCm: 3
    },
    typography: {
      fontFamily: 'Arial',
      bodySizePt: 11,
      heading1SizePt: 14,
      lineSpacing: 1.5
    },
    headingStyle: 'decimal',
    citationStyle: 'apa',
    approvalConfig: {
      supervisorCount: 1,
      requiresHeadOfProgram: true,
      requiresDeanOrFieldMentor: true
    },
    extractedNotes: [
      'Dapat menggunakan font sans-serif modern (Arial 11pt atau Calibri 11pt).',
      'Format Executive Summary wajib dwibahasa (Bahasa Indonesia & English).',
      'Sitasi dan bibliografi mengikuti standar APA 7th Edition.'
    ]
  },
  {
    id: 'mbkm',
    campusName: 'Standar Magang MBKM Kemendikbudristek',
    facultyMajor: 'Magang & Studi Independen Bersertifikat (MSIB)',
    guideDocTitle: 'Pedoman Operasional Baku Laporan Magang Industri MBKM',
    badge: 'Margin 3-3-3-3 • TNR / Arial • Logbook & Mentor',
    description: 'Standar nasional konversi 20 SKS program Magang Bersertifikat Kampus Merdeka dengan pengesahan Mentor Lapangan.',
    paperSize: 'A4',
    margins: {
      leftCm: 3,
      topCm: 3,
      rightCm: 3,
      bottomCm: 3
    },
    typography: {
      fontFamily: 'Times New Roman',
      bodySizePt: 12,
      heading1SizePt: 14,
      lineSpacing: 1.5
    },
    headingStyle: 'decimal',
    citationStyle: 'apa',
    approvalConfig: {
      supervisorCount: 1, // Dosen Pembimbing
      requiresHeadOfProgram: true,
      requiresDeanOrFieldMentor: true // Mentor Lapangan Mitra
    },
    extractedNotes: [
      'Margin simetris 3 cm keliling atau 4-3-3-3 cm.',
      'Bab II wajib menguraikan profil mitra, divisi penempatan, dan alur proses bisnis.',
      'Bab IV memuat rincian logbook mingguan dan capaian kompetensi CPL yang dikonversi.',
      'Lembar Pengesahan ditandatangani Dosen Pembimbing Akademik, Mentor Lapangan Industri, dan Ketua Program Studi.'
    ]
  },
  {
    id: 'unp',
    campusName: 'Universitas Negeri Padang (UNP)',
    facultyMajor: 'Fakultas Teknik (FT UNP) — 6 Departemen Rekayasa',
    guideDocTitle: 'Buku Pedoman Pengalaman Kerja Lapangan (PKL) Mahasiswa FT UNP Padang 2025',
    badge: 'Margin 4-4-3-3 • TNR 12 • 3 Bab Baku • UHI FT UNP',
    description: 'Pedoman resmi Laporan Pengalaman Kerja Lapangan (PKL/PLI) FT UNP 2025: Format 3 Bab (Pendahuluan, Topik Bahasan, Penutup), penomoran A. B. C., kaidah kalimat pasif ("penulis"), dilarang tanda hubung (-) pada rincian, dan 11 lampiran wajib termasuk buku harian tulis tangan asli.',
    paperSize: 'A4',
    chapterCount: 3,
    margins: {
      leftCm: 4,
      topCm: 4,
      rightCm: 3,
      bottomCm: 3
    },
    typography: {
      fontFamily: 'Times New Roman',
      bodySizePt: 12,
      heading1SizePt: 14,
      lineSpacing: 1.5,
      tableFontSizePt: 11,
      tableLineSpacing: 1.0
    },
    headingStyle: 'alphanumeric',
    citationStyle: 'apa',
    numberingSystem: 'alphanumeric',
    rules: ['no-first-person', 'mandatory-handwritten-logbook', '3-chapter-structure'],
    approvalConfig: {
      supervisorCount: 1, // Dosen Pembimbing
      requiresHeadOfProgram: true, // Koordinator UHI Departemen
      requiresDeanOrFieldMentor: true // Pembimbing Lapangan + Koordinator UHI Fakultas a.n. Dekan
    },
    extractedNotes: [
      'Struktur 3 Bab Baku: BAB I PENDAHULUAN (7 Sub-bab: Latar Belakang, Deskripsi Perusahaan, Kegiatan Industri, Perencanaan, Pelaksanaan, Hambatan & Solusi, Temuan Menarik), BAB II TOPIK BAHASAN (4 Sub-bab: Alasan Topik, Kajian Teori, Proses Pelaksanaan/Produksi, Pembahasan Kritis Teori vs Praktik), BAB III PENUTUP (Kesimpulan Data Lapangan & Saran Perbaikan Sistem Nyata).',
      'Format Bahasa: Wajib kalimat pasif, kata ganti "saya" diganti "penulis", dilarang tanda hubung (-) di depan rincian ke bawah (wajib angka/huruf).',
      'Aturan Tabel: Huruf Times New Roman 11 pt Bold, spasi 1.0, judul simetris di atas tabel, sumber di kiri bawah.',
      'Daftar Pustaka: Mengacu APA style dengan hanging indent 1 cm dan urutan alfabetis nama belakang penulis pertama.',
      'Lampiran Wajib: Catatan Harian Kerja Tulis Tangan Asli (paraf supervisor tiap hari), Form Bimbingan Dosen (Lampiran 1.3), Rubrik Supervisor 15 Aspek Skala 1-5 (Lampiran 1.5), dan Rubrik Dosen 5 Aspek Skala 100 (Lampiran 1.6).'
    ]
  }
];
