/**
 * OXID ACADEMIC STUDIO — DOCUMENT TEMPLATES & WORKFLOW REGISTRY
 * 
 * Provides extensible academic template definitions for:
 * 1. Proposal Magang Industri
 * 2. Laporan Magang Industri
 * 3. Proposal Skripsi / Tugas Akhir
 * 4. Skripsi / Tugas Akhir Final
 * 5. Proposal Penelitian
 * 6. Laporan Penelitian
 * 7. Tesis Riset (S2)
 */

import type { AcademicDocumentType } from './academicRuleEngine.ts';
import type { ProposalCategory, ReportType } from '../types/studio.ts';

export type { AcademicDocumentType };

export interface DocumentSectionConfig {
  key: string;
  title: string;
  isMandatory: boolean;
  description: string;
  suggestedWordCountMin?: number;
}

export interface AdministrativeChecklistItem {
  id: string;
  label: string;
  isRequired: boolean;
  stage: 'pre_submission' | 'post_seminar' | 'final_defense';
  notes: string;
}

export interface AcademicDocumentTemplate {
  id: AcademicDocumentType;
  name: string;
  category: ProposalCategory;
  reportType: ReportType;
  degreeLevel: 'D3' | 'D4' | 'S1' | 'S2';
  isFinalReport: boolean;
  badge: string;
  description: string;
  requiredChapters: {
    chapterNumber: number;
    title: string;
    sections: DocumentSectionConfig[];
  }[];
  adminChecklist: AdministrativeChecklistItem[];
  requiredSigners: { role: string; description: string; count: number }[];
  targetDepthPagesDefault: number;
}

export const ACADEMIC_TEMPLATES: Record<AcademicDocumentType, AcademicDocumentTemplate> = {
  proposal_magang: {
    id: 'proposal_magang',
    name: 'Proposal Magang Industri / Praktik Kerja',
    category: 'magang',
    reportType: 'magang',
    degreeLevel: 'S1',
    isFinalReport: false,
    badge: 'Magang • Rencana Kerja • Mitra Industri',
    description: 'Dokumen pengajuan izin magang industri ke mitra perusahaan/instansi memuat latar belakang, rumusan masalah, rencana kerja mingguan (WBS), dan target kompetensi.',
    targetDepthPagesDefault: 20,
    requiredChapters: [
      {
        chapterNumber: 1,
        title: 'BAB I: PENDAHULUAN',
        sections: [
          { key: 'latarBelakang', title: 'Latar Belakang & Urgensi Magang', isMandatory: true, description: 'Latar belakang pemilihan mitra dan masalah lapangan' },
          { key: 'rumusanMasalah', title: 'Rumusan Masalah / Kebutuhan Mitra', isMandatory: true, description: 'Bottleneck operasional yang hendak diselesaikan' },
          { key: 'batasanMasalah', title: 'Batasan Masalah & Lingkup Magang', isMandatory: true, description: 'Lingkup pekerjaan yang disepakati' },
          { key: 'tujuan', title: 'Tujuan Magang (Umum & Khusus)', isMandatory: true, description: 'Target capaian spesifik selama magang' },
          { key: 'manfaat', title: 'Manfaat Magang (Mahasiswa, Mitra, Kampus)', isMandatory: true, description: 'Dampak positif bagi ketiga pihak' }
        ]
      },
      {
        chapterNumber: 2,
        title: 'BAB II: GAMBARAN UMUM MITRA & TINJAUAN PUSTAKA',
        sections: [
          { key: 'profilInstansi', title: 'Profil & Sejarah Singkat Perusahaan', isMandatory: true, description: 'Visi, misi, dan lini bisnis perusahaan' },
          { key: 'strukturOrganisasi', title: 'Struktur Organisasi & Unit Kerja', isMandatory: true, description: 'Struktur divisi penempatan magang' },
          { key: 'landasanTeori', title: 'Landasan Teori & Standar Industri', isMandatory: true, description: 'Konsep dasar keilmuan yang diaplikasikan' }
        ]
      },
      {
        chapterNumber: 3,
        title: 'BAB III: RENCANA KERJA & METODE PELAKSANAAN',
        sections: [
          { key: 'waktuTempat', title: 'Waktu dan Tempat Pelaksanaan', isMandatory: true, description: 'Jadwal dan lokasi fisik/remote' },
          { key: 'metodePelaksanaan', title: 'Metode & Alur Kerja Lapangan', isMandatory: true, description: 'Kerangka kerja pengembangan/analisis' },
          { key: 'perangkatTools', title: 'Perangkat Keras, Lunak & Akses Sistem', isMandatory: true, description: 'Tools yang digunakan di tempat magang' },
          { key: 'rencanaKompetensi', title: 'Rencana Capaian Kompetensi Kurikulum', isMandatory: true, description: 'Sinkronisasi dengan mata kuliah kampus' }
        ]
      },
      {
        chapterNumber: 4,
        title: 'BAB IV: JADWAL KEGIATAN & PENUTUP',
        sections: [
          { key: 'jadwalMatriks', title: 'Matriks Jadwal Mingguan (Gantt Chart)', isMandatory: true, description: 'Aktivitas minggu ke-1 s.d. selesai' },
          { key: 'penutup', title: 'Penutup Usulan Magang', isMandatory: true, description: 'Pernyataan kesiapan pelaksanaan magang' }
        ]
      }
    ],
    adminChecklist: [
      { id: 'surat_pengantar', label: 'Surat Pengantar Magang dari Fakultas/Prodi', isRequired: true, stage: 'pre_submission', notes: 'Diterbitkan TU Fakultas' },
      { id: 'lembar_pengesahan', label: 'Lembar Pengesahan Dosen Pembimbing', isRequired: true, stage: 'pre_submission', notes: 'Tanda tangan basah / digital' },
      { id: 'cv_portofolio', label: 'CV & Portofolio Mahasiswa Pengusul', isRequired: true, stage: 'pre_submission', notes: 'Lampiran berkas' }
    ],
    requiredSigners: [
      { role: 'Dosen Pembimbing Magang', description: 'Dosen pembimbing dari program studi', count: 1 },
      { role: 'Ketua Program Studi', description: 'Pengesahan departemen akademik', count: 1 }
    ]
  },

  laporan_magang: {
    id: 'laporan_magang',
    name: 'Laporan Akhir Magang Industri / PKL',
    category: 'magang',
    reportType: 'magang',
    degreeLevel: 'S1',
    isFinalReport: true,
    badge: 'Laporan Akhir • Logbook • Hasil Nyata',
    description: 'Laporan pertanggungjawaban kegiatan magang memuat hasil kerja aktual, artefak luaran, evaluasi kendala, logbook tervalidasi pembimbing industri, dan berita acara sidang.',
    targetDepthPagesDefault: 45,
    requiredChapters: [
      {
        chapterNumber: 1,
        title: 'BAB I: PENDAHULUAN',
        sections: [
          { key: 'latarBelakang', title: 'Latar Belakang Pelaksanaan Magang', isMandatory: true, description: 'Urgensi kegiatan yang telah diselesaikan' },
          { key: 'tujuanManfaat', title: 'Tujuan & Manfaat Magang Tercapai', isMandatory: true, description: 'Realisasi capaian kegiatan' }
        ]
      },
      {
        chapterNumber: 2,
        title: 'BAB II: PROFIL LENGKAP INSTANSI MITRA',
        sections: [
          { key: 'profilPerusahaan', title: 'Profil, Budaya Kerja & Visi Misi', isMandatory: true, description: 'Uraian profil mitra tempat magang' },
          { key: 'strukturUnit', title: 'Struktur Organisasi Unit Kerja', isMandatory: true, description: 'Alur kerja di unit penempatan' }
        ]
      },
      {
        chapterNumber: 3,
        title: 'BAB III: PELAKSANAAN & TUGAS KHUSUS',
        sections: [
          { key: 'uraianKegiatan', title: 'Uraian Pelaksanaan Kerja Harian & Mingguan', isMandatory: true, description: 'Tugas yang dikerjakan secara komprehensif' },
          { key: 'tugasKhusus', title: 'Proyek / Tugas Khusus yang Diselesaikan', isMandatory: true, description: 'Dokumentasi artefak atau sistem yang dibangun' },
          { key: 'kendalaSolusi', title: 'Kendala yang Dihadapi & Pemecahan Masalah', isMandatory: true, description: 'Dinamika penanganan masalah riil' }
        ]
      },
      {
        chapterNumber: 4,
        title: 'BAB IV: PEMBAHASAN HASIL & KONTRIBUSI',
        sections: [
          { key: 'analisisHasil', title: 'Analisis Hasil Kerja & Metrik Kinerja', isMandatory: true, description: 'Bukti keberhasilan proyek magang' },
          { key: 'relevansiTeori', title: 'Relevansi Teori Perkuliahan dengan Praktik Industri', isMandatory: true, description: 'Korelasi kurikulum dengan dunia kerja' }
        ]
      },
      {
        chapterNumber: 5,
        title: 'BAB V: PENUTUP, KESIMPULAN & SARAN',
        sections: [
          { key: 'kesimpulan', title: 'Kesimpulan Akhir Magang', isMandatory: true, description: 'Ringkasan capaian seluruh kegiatan' },
          { key: 'saran', title: 'Saran untuk Mitra dan Program Studi', isMandatory: true, description: 'Rekomendasi perbaikan proses magang' }
        ]
      }
    ],
    adminChecklist: [
      { id: 'logbook_tervalidasi', label: 'Logbook Catatan Lapangan Ditandatangani Pembimbing Industri', isRequired: true, stage: 'final_defense', notes: 'Wajib ada paraf setiap minggu' },
      { id: 'nilai_industri', label: 'Formulir Penilaian dari Pembimbing Lapangan', isRequired: true, stage: 'final_defense', notes: 'Amplop tertutup / nilai resmi' },
      { id: 'berita_acara_sidang', label: 'Lembar Berita Acara Ujian Magang', isRequired: true, stage: 'final_defense', notes: 'Tanda tangan dewan penguji' }
    ],
    requiredSigners: [
      { role: 'Dosen Pembimbing Magang', description: 'Pembimbing dari kampus', count: 1 },
      { role: 'Pembimbing Lapangan / Mentor Industri', description: 'Mentor di perusahaan', count: 1 },
      { role: 'Ketua Program Studi', description: 'Pejabat fakultas/prodi', count: 1 }
    ]
  },

  proposal_skripsi: {
    id: 'proposal_skripsi',
    name: 'Proposal Skripsi / Tugas Akhir (Sempro)',
    category: 'skripsi',
    reportType: 'skripsi',
    degreeLevel: 'S1',
    isFinalReport: false,
    badge: 'Skripsi • Seminar Proposal • Metodologi',
    description: 'Proposal penelitian sarjana memuat rumusan masalah akademik, tinjauan pustaka komparatif (state of the art), kerangka konseptual, hipotesis, dan metode penelitian ilmiah.',
    targetDepthPagesDefault: 35,
    requiredChapters: [
      {
        chapterNumber: 1,
        title: 'BAB I: PENDAHULUAN',
        sections: [
          { key: 'latarBelakang', title: 'Latar Belakang & Research Gap', isMandatory: true, description: 'Fenomena dan kesenjangan teoretis piramida terbalik' },
          { key: 'rumusanMasalah', title: 'Rumusan Masalah Penelitian', isMandatory: true, description: 'Pertanyaan penelitian terarah dan terukur' },
          { key: 'batasanMasalah', title: 'Batasan Masalah & Asumsi Penelitian', isMandatory: true, description: 'Ruang lingkup variabel dan populasi' },
          { key: 'tujuanPenelitian', title: 'Tujuan Penelitian (Umum & Khusus)', isMandatory: true, description: 'Sinkron 1-banding-1 dengan rumusan masalah' },
          { key: 'manfaatPenelitian', title: 'Manfaat Penelitian (Teoretis & Praktis)', isMandatory: true, description: 'Kontribusi ilmiah dan aplikatif' }
        ]
      },
      {
        chapterNumber: 2,
        title: 'BAB II: TINJAUAN PUSTAKA & KERANGKA TEORI',
        sections: [
          { key: 'landasanTeori', title: 'Landasan Teori Komprehensif', isMandatory: true, description: 'Kajian konsep variabel yang diteliti' },
          { key: 'penelitianTerdahulu', title: 'Penelitian Terdahulu & Matriks Research Gap', isMandatory: true, description: 'Tabel state of the art minimal 5-10 jurnal primer' },
          { key: 'kerangkaKonseptual', title: 'Kerangka Konseptual / Berpikir', isMandatory: true, description: 'Diagram alur hubungan antarvariabel' },
          { key: 'hipotesis', title: 'Hipotesis Penelitian (Jika Kuantitatif)', isMandatory: false, description: 'Dugaan sementara yang akan diuji' }
        ]
      },
      {
        chapterNumber: 3,
        title: 'BAB III: METODOLOGI PENELITIAN',
        sections: [
          { key: 'desainPenelitian', title: 'Desain & Jenis Penelitian', isMandatory: true, description: 'Kuantitatif, kualitatif, eksperimental, atau R&D' },
          { key: 'populasiSampel', title: 'Populasi, Sampel & Teknik Sampling', isMandatory: true, description: 'Metode penentuan jumlah dan kriteria sampel' },
          { key: 'definisiOperasional', title: 'Definisi Operasional Variabel & Indikator', isMandatory: true, description: 'Tabel parameter pengukuran variabel' },
          { key: 'instrumenPenelitian', title: 'Instrumen Penelitian & Uji Validitas/Reliabilitas', isMandatory: true, description: 'Kuesioner/alat ukur dan protokol kalibrasi' },
          { key: 'teknikAnalisis', title: 'Teknik Pengumpulan & Analisis Data', isMandatory: true, description: 'Uji statistik / algoritma yang akan digunakan' }
        ]
      }
    ],
    adminChecklist: [
      { id: 'sk_pembimbing', label: 'SK Dosen Pembimbing Skripsi', isRequired: true, stage: 'pre_submission', notes: 'Diterbitkan Dekan' },
      { id: 'lembar_persetujuan_sempro', label: 'Lembar Persetujuan Seminar Proposal Ditandatangani Pembimbing', isRequired: true, stage: 'pre_submission', notes: 'Syarat maju sempro' },
      { id: 'turnitin_precheck', label: 'Bukti Pra-Cek Turnitin / Orisinalitas', isRequired: true, stage: 'pre_submission', notes: 'Maksimal kemiripan sesuai aturan kampus' }
    ],
    requiredSigners: [
      { role: 'Dosen Pembimbing I', description: 'Pembimbing utama skripsi', count: 1 },
      { role: 'Dosen Pembimbing II', description: 'Pembimbing pendamping skripsi', count: 1 },
      { role: 'Ketua Program Studi', description: 'Pengesahan usulan', count: 1 }
    ]
  },

  skripsi_final: {
    id: 'skripsi_final',
    name: 'Skripsi / Tugas Akhir Lengkap (Sidang Munaqasyah)',
    category: 'skripsi',
    reportType: 'tugas_akhir',
    degreeLevel: 'S1',
    isFinalReport: true,
    badge: 'Skripsi Final • Hasil Empiris • Sidang',
    description: 'Naskah skripsi lengkap siap sidang mencakup Bab I s.d. Bab V, hasil analisis data empiris, pengujian hipotesis, pembahasan kritis, kesimpulan, serta lampiran instrumen lengkap.',
    targetDepthPagesDefault: 80,
    requiredChapters: [
      { chapterNumber: 1, title: 'BAB I: PENDAHULUAN', sections: [{ key: 'pendahuluan', title: 'Latar Belakang, Masalah, Tujuan & Manfaat', isMandatory: true, description: 'Pondasi penelitian' }] },
      { chapterNumber: 2, title: 'BAB II: TINJAUAN PUSTAKA', sections: [{ key: 'pustaka', title: 'Landasan Teori & Kerangka Berpikir', isMandatory: true, description: 'Kajian pustaka komprehensif' }] },
      { chapterNumber: 3, title: 'BAB III: METODOLOGI PENELITIAN', sections: [{ key: 'metode', title: 'Metode Penelitian, Populasi, Sampel & Analisis', isMandatory: true, description: 'Desain studi ilmiah' }] },
      {
        chapterNumber: 4,
        title: 'BAB IV: HASIL PENELITIAN DAN PEMBAHASAN',
        sections: [
          { key: 'deskripsiData', title: 'Deskripsi Karakteristik Data & Responden', isMandatory: true, description: 'Tabel profil data empiris' },
          { key: 'hasilUji', title: 'Hasil Pengujian Hipotesis / Kinerja Sistem', isMandatory: true, description: 'Data numerik dan visual grafik hasil' },
          { key: 'pembahasanKritis', title: 'Pembahasan Mendalam & Komparasi Literatur', isMandatory: true, description: 'Diskusi ilmiah mengaitkan temuan dengan Bab II' }
        ]
      },
      {
        chapterNumber: 5,
        title: 'BAB V: PENUTUP, KESIMPULAN DAN SARAN',
        sections: [
          { key: 'kesimpulan', title: 'Kesimpulan Menjawab Rumusan Masalah', isMandatory: true, description: 'Jawaban tuntas tujuan penelitian' },
          { key: 'implikasiSaran', title: 'Implikasi Teoretis, Praktis & Saran Keberlanjutan', isMandatory: true, description: 'Rekomendasi tindak lanjut' }
        ]
      }
    ],
    adminChecklist: [
      { id: 'bebas_plagiasi_resmi', label: 'Sertifikat Bebas Plagiarisme Turnitin Resmi Kampus', isRequired: true, stage: 'final_defense', notes: 'Batas maksimal kemiripan (misal 20%)' },
      { id: 'transkrip_lengkap', label: 'Transkrip Nilai Bebas Mata Kuliah Prasyarat', isRequired: true, stage: 'final_defense', notes: 'Lulus seluruh SKS wajib' },
      { id: 'draft_artikel_jurnal', label: 'Draf Naskah Publikasi Ilmiah / Artikel Jurnal', isRequired: true, stage: 'final_defense', notes: 'Format IEEE/APA jurnal target' },
      { id: 'berita_acara_sidang', label: 'Lembar Berita Acara Sidang Munaqasyah', isRequired: true, stage: 'final_defense', notes: 'Formulir ujian dewan penguji' }
    ],
    requiredSigners: [
      { role: 'Dosen Pembimbing I', description: 'Pembimbing Utama', count: 1 },
      { role: 'Dosen Pembimbing II', description: 'Pembimbing Pendamping', count: 1 },
      { role: 'Dosen Penguji I (Ketua Penguji)', description: 'Ketua Dewan Penguji', count: 1 },
      { role: 'Dosen Penguji II (Anggota)', description: 'Penguji Ahli Bidang', count: 1 },
      { role: 'Dekan Fakultas', description: 'Pengesahan kelulusan', count: 1 }
    ]
  },

  proposal_penelitian: {
    id: 'proposal_penelitian',
    name: 'Proposal Hibah Penelitian / Riset Kompetitif',
    category: 'penelitian',
    reportType: 'penelitian',
    degreeLevel: 'S1',
    isFinalReport: false,
    badge: 'Penelitian • Hibah Dikti • TKT / Roadmap',
    description: 'Proposal penelitian kompetitif memuat roadmap riset, Tingkat Kesiapterapan Teknologi (TKT), rencana anggaran biaya (RAB), dan luaran wajib artikel terindeks/paten.',
    targetDepthPagesDefault: 30,
    requiredChapters: [
      { chapterNumber: 1, title: 'BAB I: PENDAHULUAN & URGENSI RISET', sections: [{ key: 'urgensi', title: 'Latar Belakang & Urgensi Penelitian', isMandatory: true, description: 'Peta jalan dan urgensi nasional' }] },
      { chapterNumber: 2, title: 'BAB II: TINJAUAN PUSTAKA & ROADMAP', sections: [{ key: 'roadmap', title: 'State of the Art & Peta Jalan Riset', isMandatory: true, description: 'Keterkaitan dengan riset sebelumnya' }] },
      { chapterNumber: 3, title: 'BAB III: METODE & DESAIN PENELITIAN', sections: [{ key: 'metode', title: 'Metode Kerja, TKT & Diagram Alir', isMandatory: true, description: 'Target TKT dan tahapan riset' }] },
      { chapterNumber: 4, title: 'BAB IV: BIAYA & JADWAL PENELITIAN', sections: [{ key: 'rabJadwal', title: 'Rencana Anggaran Biaya (RAB) & Jadwal Bar Chart', isMandatory: true, description: 'Rincian anggaran SBM Dikti' }] }
    ],
    adminChecklist: [
      { id: 'rab_sbm', label: 'RAB Sesuai Standar Biaya Masukan (SBM) Kemenkeu', isRequired: true, stage: 'pre_submission', notes: 'Audit keuangan riset' },
      { id: 'tkt_measurement', label: 'Lembar Pengukuran Mandiri Tingkat Kesiapterapan Teknologi (TKT)', isRequired: true, stage: 'pre_submission', notes: 'Target TKT 1-9' }
    ],
    requiredSigners: [
      { role: 'Ketua Peneliti', description: 'Pengusul utama hibah', count: 1 },
      { role: 'Ketua LPPM', description: 'Lembaga Penelitian dan Pengabdian Masyarakat', count: 1 }
    ]
  },

  laporan_penelitian: {
    id: 'laporan_penelitian',
    name: 'Laporan Kemajuan / Akhir Hibah Penelitian',
    category: 'penelitian',
    reportType: 'penelitian',
    degreeLevel: 'S1',
    isFinalReport: true,
    badge: 'Laporan Riset • Realisasi Anggaran • Luaran',
    description: 'Laporan pertanggungjawaban hibah penelitian memuat realisasi capaian TKT, bukti publikasi ilmiah (accepted/published), serapan anggaran, dan laporan akhir.',
    targetDepthPagesDefault: 60,
    requiredChapters: [
      { chapterNumber: 1, title: 'BAB I: PENDAHULUAN', sections: [{ key: 'pendahuluan', title: 'Ringkasan Kemajuan Riset', isMandatory: true, description: 'Target vs capaian' }] },
      { chapterNumber: 2, title: 'BAB II: REALISASI METODE RISET', sections: [{ key: 'realisasiMetode', title: 'Tahapan Riset yang Telah Dilaksanakan', isMandatory: true, description: 'Implementasi lapangan' }] },
      { chapterNumber: 3, title: 'BAB III: HASIL YANG DICAPAI & LUARAN', sections: [{ key: 'luaranRiset', title: 'Bukti Luaran (Jurnal/Paten/Prototipe)', isMandatory: true, description: 'Dokumentasi bukti fisik' }] },
      { chapterNumber: 4, title: 'BAB IV: KESIMPULAN & RENCANA TAHAP LANJUT', sections: [{ key: 'kesimpulan', title: 'Kesimpulan & Tindak Lanjut', isMandatory: true, description: 'Komitmen riset berkelanjutan' }] }
    ],
    adminChecklist: [
      { id: 'bukti_luaran_jurnal', label: 'Bukti Submit / Acceptance Letter Jurnal Internasional/Sinta', isRequired: true, stage: 'final_defense', notes: 'Luaran wajib hibah' },
      { id: 'laporan_keuangan_100', label: 'Laporan Penggunaan Anggaran 100% (SPTB)', isRequired: true, stage: 'final_defense', notes: 'Surat pernyataan tanggung jawab belanja' }
    ],
    requiredSigners: [
      { role: 'Ketua Peneliti', description: 'Ketua tim riset', count: 1 },
      { role: 'Reviewer Internal LPPM', description: 'Penilai monitoring & evaluasi', count: 1 },
      { role: 'Ketua LPPM', description: 'Pengesahan laporan akhir', count: 1 }
    ]
  },

  tesis: {
    id: 'tesis',
    name: 'Tesis Magister (S2)',
    category: 'penelitian',
    reportType: 'tesis',
    degreeLevel: 'S2',
    isFinalReport: true,
    badge: 'Tesis Magister • Novelty Tinggi • Publikasi Scopus',
    description: 'Karya ilmiah tingkat magister dengan tuntutan kebaruan (novelty) metodologis yang ketat, sintesis literatur global (Scopus Q1-Q4), analisis statistik multivariat, dan syarat publikasi internasional.',
    targetDepthPagesDefault: 120,
    requiredChapters: [
      { chapterNumber: 1, title: 'BAB I: PENDAHULUAN', sections: [{ key: 'urgensiNovelty', title: 'Urgensi Teoretis, Research Gap & Novelty Statement', isMandatory: true, description: 'Perumusan novelty magister' }] },
      { chapterNumber: 2, title: 'BAB II: KAJIAN TEORI & CRITICAL REVIEW', sections: [{ key: 'criticalReview', title: 'Sintesis Teori Mutakhir & Matriks PRISMA', isMandatory: true, description: 'Analisis kritis literatur' }] },
      { chapterNumber: 3, title: 'BAB III: METODE PENELITIAN', sections: [{ key: 'metodeLanjutan', title: 'Desain Eksperimen / Pemodelan Multivariat', isMandatory: true, description: 'Prosedur rigor ilmiah' }] },
      { chapterNumber: 4, title: 'BAB IV: HASIL ANALISIS & PEMBAHASAN MENDALAM', sections: [{ key: 'pembahasanTesis', title: 'Validasi Model, Pembuktian Teoretis & Diskusi', isMandatory: true, description: 'Eksplanasi ilmiah tingkat tinggi' }] },
      { chapterNumber: 5, title: 'BAB V: KESIMPULAN, IMPLIKASI & KONTRIBUSI KEILMUAN', sections: [{ key: 'kontribusiIlmiah', title: 'Sumbangsih terhadap Khazanah Ilmu Pengetahuan', isMandatory: true, description: 'Generalisasi temuan riset' }] }
    ],
    adminChecklist: [
      { id: 'ethical_clearance', label: 'Sertifikat Kelaikan Etik Penelitian (Ethical Clearance)', isRequired: true, stage: 'pre_submission', notes: 'Dari Komite Etik Riset' },
      { id: 'scopus_manuscript', label: 'Bukti Publikasi / Under Review di Jurnal Terindeks Scopus', isRequired: true, stage: 'final_defense', notes: 'Syarat mutlak yudisium S2' },
      { id: 'turnitin_tesis', label: 'Hasil Cek Plagiarisme Turnitin < 15%', isRequired: true, stage: 'final_defense', notes: 'Standar ketat pascasarjana' }
    ],
    requiredSigners: [
      { role: 'Promotor / Pembimbing Utama', description: 'Guru Besar / Lektor Kepala', count: 1 },
      { role: 'Ko-Promotor / Pembimbing Pendamping', description: 'Doktor / Lektor Kepala', count: 1 },
      { role: 'Ketua Program Studi Magister', description: 'Pengesahan Pascasarjana', count: 1 },
      { role: 'Direktur Sekolah Pascasarjana', description: 'Pengesahan institusional', count: 1 }
    ]
  }
};

/**
 * Retrieve template by document type with fallback
 */
export function getAcademicTemplate(type: AcademicDocumentType | string): AcademicDocumentTemplate {
  if (type in ACADEMIC_TEMPLATES) {
    return ACADEMIC_TEMPLATES[type as AcademicDocumentType];
  }
  return ACADEMIC_TEMPLATES['proposal_skripsi'];
}
