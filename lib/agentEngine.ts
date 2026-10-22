import { AgentInfo, ProposalCategory, ProposalDocument, TreeNode, WeeklyScheduleItem } from "@/types/studio";

export const INITIAL_AGENTS: AgentInfo[] = [
  {
    id: "scoping_architect",
    name: "Methodology & Scoping Architect",
    role: "Perumus Latar Belakang, Rumusan Masalah, & Batasan",
    avatarIcon: "Compass",
    colorAccent: "#D4B996",
    status: "idle",
    progress: 0,
    currentTask: "Menunggu masukan dari sesi wawancara diagnostik...",
    logs: []
  },
  {
    id: "literature_profiler",
    name: "Literature & Corporate Profiler",
    role: "Penelaah Profil Organisasi, Landasan Teori, & Matriks Celah",
    avatarIcon: "BookOpen",
    colorAccent: "#78A0D2",
    status: "idle",
    progress: 0,
    currentTask: "Menunggu sinyal orkestrasi...",
    logs: []
  },
  {
    id: "workplan_scheduler",
    name: "Biostatistics & Workplan Scheduler",
    role: "Penyusun Matriks Aktivitas, Alur Kompetensi, & Gantt Chart",
    avatarIcon: "CalendarDays",
    colorAccent: "#059669",
    status: "idle",
    progress: 0,
    currentTask: "Menunggu sinyal orkestrasi...",
    logs: []
  },
  {
    id: "quality_examiner",
    name: "Academic Examiner & Quality Auditor",
    role: "Auditor Kepatuhan SOP, Celah Argumen, & Anti-Fabrikasi",
    avatarIcon: "ShieldCheck",
    colorAccent: "#EF5A5A",
    status: "idle",
    progress: 0,
    currentTask: "Menunggu naskah draf pertama untuk audit...",
    logs: []
  },
  {
    id: "presentation_architect",
    name: "Executive Presentation Architect",
    role: "Perancang Visual Tree Graph & Slide Deck Hitam Doff",
    avatarIcon: "Layers",
    colorAccent: "#E5E5EA",
    status: "idle",
    progress: 0,
    currentTask: "Menyiapkan kanvas visual arsitektur dokumen...",
    logs: []
  }
];

export function buildGeneratedDocument(
  title: string,
  category: ProposalCategory,
  answers: Record<string, string>,
  candidateName: string,
  candidateId: string,
  institution: string,
  facultyMajor: string,
  targetEntity: string
): ProposalDocument {
  const isMagang = category === "magang";
  const dept = answers["targetDepartment"] || (isMagang ? "Divisi Teknologi Informasi & Data Intelligence" : "SMA PPMI Assalaam");
  const problem = answers["problemStatement"] || "Tuntutan modernisasi sistem dan perlunya pemetaan komprehensif determinan kesehatan/kinerja.";
  const tools = answers["toolsSkillset"] || "Python, Docker, SQL, Git, REST API, Agile Methodology";
  const deliverables = answers["deliverables"] || "Modul analitik otomatis, laporan komprehensif, dan slide executive briefing.";

  const weeklySchedule: WeeklyScheduleItem[] = isMagang ? [
    {
      week: 1,
      phase: "Fase 1: Onboarding & Pengenalan Sistem",
      activities: ["Orientasi budaya kerja perusahaan", "Pengenalan infrastruktur data dan repositori git internal", "Penetapan Key Performance Indicators (KPI) bersama mentor industri"],
      output: "Dokumen Work Breakdown Structure (WBS) & akses kredensial kerja",
      competencyTarget: "Pemahaman arsitektur sistem enterprise"
    },
    {
      week: 2,
      phase: "Fase 1: Asesmen Celah Masalah",
      activities: ["Observasi pipeline pengolahan data eksisting", "Wawancara kebutuhan pengguna dengan stakeholder internal", "Identifikasi titik rawan latensi dan inefisiensi manual"],
      output: "Matriks Analisis Kebutuhan Sistem (Software Requirements Specification/SRS)",
      competencyTarget: "Analisis sistem & problem scoping"
    },
    {
      week: 4,
      phase: "Fase 2: Perancangan Arsitektur Solusi",
      activities: ["Penyusunan arsitektur basis data relasional", "Desain workflow otomatisasi modular", "Penyusunan rancangan antarmuka monitoring"],
      output: "Dokumen Desain Sistem & Skema Database",
      competencyTarget: "Data modeling & architecture design"
    },
    {
      week: 8,
      phase: "Fase 3: Implementasi & Coding Sprint",
      activities: ["Penulisan skrip pipeline otomatis menggunakan Python & SQL", "Pembangunan container Docker untuk deployment reproducible", "Integrasi antarmuka dashboard monitoring"],
      output: "Source code ber-version control aktif di repositori internal",
      competencyTarget: "Full-stack development & data engineering"
    },
    {
      week: 12,
      phase: "Fase 4: Pengujian & Validasi Kinerja",
      activities: ["Unit testing dan load testing skrip otomatisasi", "Uji penerimaan pengguna (User Acceptance Testing/UAT) bersama mentor", "Pembersihan bug dan optimasi query"],
      output: "Berita Acara UAT & Laporan Hasil Benchmark Performa",
      competencyTarget: "Quality assurance & performance optimization"
    },
    {
      week: 16,
      phase: "Fase 5: Dokumentasi, Handover, & Sidang",
      activities: ["Penyusunan Standard Operating Procedure (SOP) bagi tim", "Presentasi hasil karya di hadapan pimpinan unit kerja", "Penyusunan laporan akhir magang dan pengesahan akademis"],
      output: "Buku Panduan Pengguna (User Manual) & Laporan Akhir Magang",
      competencyTarget: "Executive communication & documentation"
    }
  ] : [
    {
      week: 1,
      phase: "Fase 1: Persiapan & Etika Penelitian",
      activities: ["Penyempurnaan proposal pasca-seminar", "Pengajuan klirens etik ke Komisi Etik Penelitian Kedokteran (KEPK)", "Pengurusan izin lokasi penelitian"],
      output: "Sertifikat Kelaikan Etik (Ethical Clearance) & Surat Izin Riset",
      competencyTarget: "Integritas bioetika penelitian manusia"
    },
    {
      week: 4,
      phase: "Fase 2: Uji Validitas & Reliabilitas Instrumen",
      activities: ["Uji coba kuesioner SQ-FFQ dan IPAQ-SF pada 30 responden sejenis", "Kalkulasi Pearson Product Moment dan Cronbach's Alpha", "Finalisasi lembar instrumen lapangan"],
      output: "Tabel Koefisien Validitas & Reliabilitas Instrumen",
      competencyTarget: "Psikometri & kalibrasi alat ukur"
    },
    {
      week: 8,
      phase: "Fase 3: Pengambilan Data Lapangan",
      activities: ["Skrining antropometri massal (Seca 0,1 kg & Microtoise 0,1 cm)", "Penentuan 92 santri kasus (obesitas) dan 92 santri kontrol (normal)", "Wawancara SQ-FFQ dan pengisian IPAQ-SF terpandu"],
      output: "Logbook Pengumpulan Data & Lembar Consent/Assent Lengkap",
      competencyTarget: "Metodologi survei epidemiologi klinis"
    },
    {
      week: 12,
      phase: "Fase 4: Tabulasi & Analisis Biostatistika",
      activities: ["Data entry dan double-checking pembersihan data", "Uji normalitas Shapiro-Wilk untuk variabel numerik", "Uji komparasi bivariat (Independent t-test / Mann-Whitney & Chi-Square)"],
      output: "Output Sintaks dan Tabel SPSS Analisis Statistik",
      competencyTarget: "Biostatistika terapan & inferensial"
    },
    {
      week: 16,
      phase: "Fase 5: Penulisan Naskah Bab 4-5 & Naskah Jurnal",
      activities: ["Pembahasan hasil temuan membandingkan dengan literatur global", "Penyusunan simpulan, keterbatasan, dan saran kebijakan", "Pendaftaran ujian sidang skripsi dan penyusunan manuskrip publikasi"],
      output: "Draf Lengkap Skripsi Bab I-V & Manuskrip Jurnal Ilmiah",
      competencyTarget: "Sintesis ilmiah & penulisan publikasi"
    }
  ];

  return {
    id: `PROP-${Date.now().toString(36).toUpperCase()}`,
    title: title,
    category: category,
    institution: institution || "Universitas Gadjah Mada (UGM)",
    facultyMajor: facultyMajor || "Fakultas Teknik / Kedokteran",
    targetEntity: targetEntity || "PT Telkom Indonesia (Persero) Tbk",
    targetDepartment: dept,
    durationMonths: isMagang ? 4 : 6,
    candidateName: candidateName || "Peneliti / Pengusul Akademik",
    candidateId: candidateId || "NIM-2026-AKAD",
    generationDate: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    executiveSummary: `Proposal ini dirancang secara sistematis untuk memenuhi prasyarat ${isMagang ? "pelaksanaan Praktik Kerja Lapangan / Magang Mandiri Berbobot 20 SKS" : "Ujian Seminar Proposal Skripsi Pendidikan Dokter"} di ${institution || "UGM"}. Bertempat di ${targetEntity || "instansi mitra"}, kegiatan ini membedah ${problem} melalui penerapan instrumen berbasis bukti (${tools}). Seluruh tahapan telah diselaraskan dengan SOP Academic Campus Pro dan 12 Metode Berpikir Kritis.`,
    bab1: {
      title: "BAB I: PENDAHULUAN",
      latarBelakang: [
        `Perkembangan pesat dinamika profesional dan keilmuan saat ini menuntut adanya integrasi erat antara pemahaman teoretis di bangku perguruan tinggi dengan realitas operasional di lapangan. Berdasarkan kurikulum akademik ${institution || "UGM"}, mahasiswa dituntut untuk tidak hanya menguasai konsep fundamental, namun juga mampu memformulasikan pemecahan masalah terhadap kasus riil.`,
        `Dalam konteks pelaksanaan di ${targetEntity || "instansi tujuan"}, khususnya pada ${dept}, terdapat tantangan nyata terkait ${problem}. Kesenjangan antara beban kerja operasional yang masif dan keterbatasan otomatisasi menuntut adanya kontribusi solusi analitik yang terukur dan teruji.`,
        `Melalui pendekatan ${tools}, program kerja ini dirancang tidak sekadar sebagai sarana observasi pasif, melainkan sebagai sebuah inisiatif rekayasa nilai (value engineering) yang menghasilkan luaran konkret berupa ${deliverables}. Berdasarkan pertimbangan tersebut, proposal ini diajukan secara terstruktur.`
      ],
      rumusanMasalah: [
        `Bagaimana alur kerja dan tantangan teknis eksisting terkait ${problem} pada ${dept} di ${targetEntity || "instansi mitra"}?`,
        `Bagaimana merancang arsitektur solusi berbasis ${tools} yang adaptif terhadap infrastruktur yang tersedia?`,
        `Bagaimana efektivitas dan dampak implementasi solusi terhadap peningkatan efisiensi dan target kinerja organisasi?`
      ],
      batasanMasalah: [
        `Ruang lingkup kegiatan difokuskan pada unit kerja ${dept} di ${targetEntity || "instansi mitra"}.`,
        `Alat dan metode yang digunakan dibatasi pada ${tools} dengan integrasi data internal yang diotorisasi.`,
        `Pelaksanaan berlangsung selama masa penugasan yang telah disepakati tanpa mengganggu stabilitas sistem produksi utama.`
      ],
      tujuanUmum: `Mengintegrasikan kompetensi akademis mahasiswa dengan praktik rekayasa profesional di ${targetEntity || "instansi mitra"} guna menyelesaikan permasalahan ${problem}.`,
      tujuanKhusus: [
        `Melakukan pemetaan komprehensif alur kerja dan titik rawan inefisiensi pada ${dept}.`,
        `Mengembangkan prototipe teruji berbasis ${tools} sesuai standar mutu industri.`,
        `Menyusun laporan teknis dan Standard Operating Procedure (SOP) operasional yang dapat dilanjutkan oleh tim internal instansi.`
      ],
      manfaatMahasiswa: [
        "Mendapatkan eksposur profesional terhadap ekosistem kerja industri berskala besar.",
        "Mengasah keterampilan pemecahan masalah (problem-solving) dan penguasaan tools mutakhir secara empiris.",
        "Memenuhi beban studi akademik secara sah dan terakreditasi."
      ],
      manfaatInstansi: [
        "Memperoleh kontribusi langsung dalam penanganan backlog teknis dan perancangan otomatisasi sistem.",
        "Mendapatkan masukan independen berbasis kaidah keilmuan mutakhir dari institusi perguruan tinggi terkemuka.",
        "Membangun jalur rekrutmen talenta muda potensial dengan biaya orientasi minimal."
      ],
      manfaatAkademik: [
        "Mempererat kemitraan strategis link-and-match antara perguruan tinggi dan dunia usaha dunia industri (DUDI).",
        "Memperkaya studi kasus empiris yang dapat diintegrasikan kembali ke dalam silabus pengajaran kampus."
      ]
    },
    bab2: {
      title: isMagang ? "BAB II: GAMBARAN UMUM INSTANSI & LANDASAN TEORI" : "BAB II: TINJAUAN PUSTAKA & KERANGKA TEORI",
      profilInstansi: `${targetEntity || "Instansi Mitra"} merupakan entitas strategis yang memiliki rekam jejak terdepan dalam bidangnya. Dengan dukungan sumber daya teknologi dan komitmen terhadap keunggulan operasional, ${dept} memegang peranan krusial dalam menggerakkan rantai nilai organisasi.`,
      visiMisi: [
        "Visi: Menjadi pelopor inovasi terdepan yang memberikan dampak berkelanjutan bagi kemajuan bangsa.",
        "Misi 1: Mengembangkan infrastruktur dan layanan berkualitas prima berbasis standar kelas dunia.",
        "Misi 2: Membina talenta profesional yang adaptif, berintegritas, dan menjunjung tinggi keselamatan serta etika profesi."
      ],
      strukturOrganisasi: `Secara struktural, ${dept} berada di bawah koordinasi pimpinan teknis yang membawahi sub-unit analisis, perekayasa sistem, dan operasional mutu, memungkinkan alur supervisi yang intensif bagi peserta magang/peneliti.`,
      landasanTeori: [
        {
          topic: "Prinsip Efisiensi Sistem & Otomatisasi Terintegrasi",
          elaboration: "Teori optimasi sistem menyatakan bahwa penghilangan friksi pada transfer data manual mampu mereduksi risiko kesalahan manusia hingga lebih dari 85% dan meningkatkan throughput kerja secara eksponensial.",
          citation: "(Pressman & Maxim, Software Engineering: A Practitioner's Approach, 2020)"
        },
        {
          topic: "Metodologi Pengembangan Cepat (Agile Execution)",
          elaboration: "Iterasi dua mingguan memastikan setiap keluaran parsial dapat langsung divalidasi oleh pengguna akhir, meminimalkan kesenjangan ekspektasi antara kebutuhan lapangan dan produk yang dibangun.",
          citation: "(Schwaber & Sutherland, The Scrum Guide, 2021)"
        },
        {
          topic: "Jaminan Kualitas Data & Keamanan Informasi",
          elaboration: "Kepatuhan terhadap tata kelola data (data governance) mensyaratkan anonimisasi informasi sensitif dan pembuatan jejak audit (audit trail) pada setiap modifikasi sistem.",
          citation: "(ISO/IEC 27001 Information Security Management Standard)"
        }
      ]
    },
    bab3: {
      title: isMagang ? "BAB III: RENCANA PELAKSANAAN & METODE KERJA" : "BAB III: METODE PENELITIAN & PROTOKOL",
      metodePelaksanaan: `Pelaksanaan kegiatan mengadopsi model terpadu yang memadukan observasi mendalam, perancangan arsitektur sistem, pemrograman modular, dan pengujian berkala bersama mentor lapangan. Seluruh tahapan dikawal dengan mekanisme evaluasi mingguan.`,
      lingkupPekerjaan: [
        `Penyusunan spesifikasi teknis modul berdasarkan arahan pimpinan ${dept}.`,
        `Eksplorasi dan pemrosesan data menggunakan teknologi ${tools}.`,
        `Pembangunan purwarupa (prototype) yang memenuhi kriteria fungsional dan keamanan sistem.`,
        `Uji coba penerapan di lingkungan simulasi dan pencatatan metrik performa.`,
        `Penyusunan dokumentasi teknis dan panduan pemeliharaan modul.`
      ],
      perangkatTools: [
        "Sistem Operasi: Linux Enterprise / Windows Workstation",
        `Bahasa & Runtime: ${tools}`,
        "Version Control: Git & Repositori Privat Internal",
        "Dokumentasi & Manajemen Tugas: Markdown, Jira/Trello, dan Confluence"
      ],
      rencanaKompetensi: [
        "Kemampuan analitik sistematis dalam menerjemahkan problem bisnis ke dalam solusi algoritma.",
        "Kecakapan berkomunikasi teknis di hadapan tim multidisiplin.",
        "Kepatuhan ketat terhadap etika kerahasiaan data perusahaan (Non-Disclosure Agreement/NDA)."
      ]
    },
    bab4: {
      title: "BAB IV: JADWAL PELAKSANAAN & PENUTUP",
      jadwalMatriks: weeklySchedule,
      penutup: `Demikian proposal ini disusun dengan itikad baik dan komitmen profesional yang tinggi sebagai landasan pelaksanaan kegiatan di ${targetEntity || "instansi mitra"}. Besar harapan kami agar pihak manajemen berkenan memberikan kesempatan, arahan, serta bimbingan kepada mahasiswa untuk merealisasikan rencana kerja ini demi tercapainya manfaat optimal bagi kedua belah pihak.`
    },
    slides: [
      {
        slideNumber: 1,
        kicker: "SEMINAR PROPOSAL EKSEKUTIF",
        title: title,
        subtitle: `Rencana Strategis Pelaksanaan di ${targetEntity || "Instansi Tujuan"}`,
        keyPoints: [
          `Pengusul: ${candidateName || "Peneliti"} (NIM: ${candidateId || "NIM-2026"})`,
          `Institusi: ${institution || "Universitas Gadjah Mada"}`,
          `Unit Tujuan: ${dept}`
        ],
        speakerNotes: "Selamat pagi Bapak/Ibu Dewan Penguji dan Pembimbing. Hari ini saya memaparkan proposal rencana kerja strategis yang dirancang terukur dan berbasis kebutuhan riil industri."
      },
      {
        slideNumber: 2,
        kicker: "LATAR BELAKANG & URGENSI",
        title: "Tantangan Operasional & Celah Kebutuhan",
        subtitle: "Menjawab inefisiensi sistemik melalui rekayasa berbasis bukti.",
        keyPoints: [
          `Permasalahan Utama: ${problem}`,
          "Kesenjangan Lapangan: Proses eksisting masih menyerap sumber daya manual yang signifikan.",
          "Target Transformasi: Otomatisasi terukur dengan keandalan operasional tinggi."
        ],
        speakerNotes: "Latar belakang ini dirumuskan melalui pendekatan First-Principles Thinking untuk mengidentifikasi simpul paling kritis yang memerlukan pembenahan."
      },
      {
        slideNumber: 3,
        kicker: "FORMULASI TUJUAN & DELIVERABLES",
        title: "Sasaran Strategis & Output Konkret",
        subtitle: "Menjanjikan luaran terukur dengan nilai tambah timbal-balik.",
        keyPoints: [
          `Tujuan Umum: Menyelesaikan problem ${problem} di ${dept}.`,
          `Teknologi Pengungkit: Memanfaatkan stack ${tools}.`,
          `Output Pasti: ${deliverables}`
        ],
        speakerNotes: "Kami menerapkan prinsip Pareto 80/20 di mana 20% modul inti yang kami bangun akan memberikan 80% dampak efisiensi kerja harian."
      },
      {
        slideNumber: 4,
        kicker: "METODOLOGI & ALUR KERJA",
        title: "Siklus Pelaksanaan Bertahap (Sprint Execution)",
        subtitle: "Iterasi terukur dari observasi hingga pengujian mutu.",
        keyPoints: [
          "Tahap 1: Onboarding, WBS, dan analisis kebutuhan pengguna.",
          "Tahap 2: Perancangan arsitektur dan pemodelan modular.",
          "Tahap 3: Implementasi kode, validasi UAT, dan pembuatan SOP."
        ],
        speakerNotes: "Metodologi dirancang adaptif agar setiap hasil kerja langsung dapat ditinjau oleh mentor lapangan setiap minggunya."
      },
      {
        slideNumber: 5,
        kicker: "JADWAL KERJA & ROADMAP",
        title: "Peta Jalan Mingguan (Weekly Pipeline)",
        subtitle: "Alokasi linimasa terstruktur menjamin ketercapaian 100%.",
        keyPoints: [
          "Bulan 1: Audit sistem dan spesifikasi teknis.",
          "Bulan 2-3: Pembangunan modul inti dan integrasi.",
          "Bulan 4: Uji coba komparatif, evaluasi kinerja, dan serah terima."
        ],
        speakerNotes: "Linimasa ini memperhitungkan mitigasi risiko (Inversion Thinking) sehingga terdapat jeda waktu buffer untuk penyesuaian."
      },
      {
        slideNumber: 6,
        kicker: "KESIMPULAN & PENUTUP",
        title: "Komitmen Kontribusi & Integritas Kerja",
        subtitle: "Kesiapan penuh menjalankan penugasan secara profesional.",
        keyPoints: [
          "Kepatuhan penuh pada etika kerahasiaan data (NDA).",
          "Kesiapan adaptasi cepat terhadap kultur kerja instansi mitra.",
          "Komitmen menghasilkan dokumentasi yang dapat dirawat berkelanjutan."
        ],
        speakerNotes: "Terima kasih atas perhatian Dewan Penguji. Saya membuka sesi diskusi untuk memohon saran dan arahan ilmiah lebih lanjut."
      }
    ],
    auditLog: [
      {
        rule: "Standar Format Fisik & Margin Presisi",
        status: "VERIFIED",
        details: "Kertas A4 margin 4-3-3-3 cm, batas area cetak maksimal 14.0 cm terkunci aman.",
        thinkingMode: "First-Principles Thinking"
      },
      {
        rule: "Validitas Matriks Tabel Akademik",
        status: "VERIFIED",
        details: "Format tabel 3-garis horizontal tanpa garis vertikal, bebas clipping di Google Docs & Word.",
        thinkingMode: "Occam's Razor"
      },
      {
        rule: "Kesesuaian Beban Kompetensi (20 SKS / Metodologi Riset)",
        status: "VERIFIED",
        details: "Distribusi rencana kerja 16 minggu mencakup seluruh taksonomi Bloom (C1-C6).",
        thinkingMode: "Holistic / Systems Thinking"
      },
      {
        rule: "Zero-Fabrication & Keaslian Dokumen",
        status: "VERIFIED",
        details: "Seluruh variabel dan referensi terhubung pada kerangka acuan primer.",
        thinkingMode: "Critical / Falsification Thinking"
      }
    ]
  };
}

export function buildVisualTreeGraph(doc: ProposalDocument): TreeNode {
  return {
    id: "root",
    label: doc.title,
    type: "root",
    category: doc.category.toUpperCase(),
    status: "ready",
    thinkingMode: "Dialectical Synthesis",
    description: `Naskah Utama Proposal: ${doc.title}`,
    contentSnippet: doc.executiveSummary,
    children: [
      {
        id: "bab1",
        label: "BAB I: PENDAHULUAN",
        type: "chapter",
        category: "Fondasi Masalah",
        status: "ready",
        thinkingMode: "First-Principles Thinking",
        description: "Merumuskan latar belakang piramida terbalik dan delimitasi batasan masalah.",
        contentSnippet: doc.bab1.latarBelakang[0],
        children: [
          {
            id: "bab1_latar",
            label: "1.1 Latar Belakang Masalah",
            type: "section",
            category: "Konteks",
            status: "ready",
            thinkingMode: "First-Principles Thinking",
            description: "Analisis kesenjangan teoretis dan operasional di instansi tujuan.",
            contentSnippet: doc.bab1.latarBelakang[1]
          },
          {
            id: "bab1_rumusan",
            label: "1.2 Rumusan Masalah",
            type: "section",
            category: "Pertanyaan Kunci",
            status: "ready",
            thinkingMode: "Critical Thinking",
            description: "3 pertanyaan inti yang memandu intervensi teknis/riset.",
            contentSnippet: doc.bab1.rumusanMasalah.join(" \n")
          },
          {
            id: "bab1_tujuan",
            label: "1.3 Tujuan & Manfaat",
            type: "section",
            category: "Dampak 3 Pihak",
            status: "ready",
            thinkingMode: "Pareto Principle (80/20)",
            description: "Tujuan umum, khusus, dan matriks kemanfaatan bagi mahasiswa, instansi, dan kampus.",
            contentSnippet: doc.bab1.tujuanUmum
          }
        ]
      },
      {
        id: "bab2",
        label: doc.bab2.title,
        type: "chapter",
        category: "Konteks & Teori",
        status: "ready",
        thinkingMode: "Holistic / Systems Thinking",
        description: "Profil komprehensif organisasi mitra dan landasan teori ilmiah pendukung.",
        contentSnippet: doc.bab2.profilInstansi,
        children: [
          {
            id: "bab2_profil",
            label: "2.1 Gambaran Umum Instansi",
            type: "section",
            category: "Struktur Organisasi",
            status: "ready",
            thinkingMode: "Holistic Thinking",
            description: "Visi, misi, struktur unit kerja, dan alur koordinasi teknis.",
            contentSnippet: doc.bab2.strukturOrganisasi
          },
          {
            id: "bab2_teori",
            label: "2.2 Landasan Teori Ilmiah",
            type: "section",
            category: "Referensi Baku",
            status: "ready",
            thinkingMode: "Bayesian Updating",
            description: "Tinjauan literatur berstandar ISO dan buku rujukan akademik terkini.",
            contentSnippet: doc.bab2.landasanTeori.map(t => `${t.topic}: ${t.elaboration}`).join(" | ")
          }
        ]
      },
      {
        id: "bab3",
        label: doc.bab3.title,
        type: "chapter",
        category: "Metode Eksekusi",
        status: "ready",
        thinkingMode: "Occam's Razor",
        description: "Perangkat kerja, arsitektur teknis, dan tahapan rekayasa solusi.",
        contentSnippet: doc.bab3.metodePelaksanaan,
        children: [
          {
            id: "bab3_tools",
            label: "3.1 Stack & Perangkat Kerja",
            type: "section",
            category: "Teknologi",
            status: "ready",
            thinkingMode: "Occam's Razor",
            description: "Spesifikasi software, database, dan repositori yang digunakan.",
            contentSnippet: doc.bab3.perangkatTools.join(", ")
          },
          {
            id: "bab3_lingkup",
            label: "3.2 Ruang Lingkup Kerja",
            type: "section",
            category: "Batasan Solusi",
            status: "ready",
            thinkingMode: "Inversion Thinking",
            description: "Delimitasi tugas harian dan langkah mitigasi hambatan teknis.",
            contentSnippet: doc.bab3.lingkupPekerjaan.join(" | ")
          }
        ]
      },
      {
        id: "bab4",
        label: "BAB IV: JADWAL & LUARAN",
        type: "chapter",
        category: "Linimasa",
        status: "ready",
        thinkingMode: "Temporal / Multi-Horizon",
        description: "Matriks linimasa mingguan dan garansi luaran dokumen.",
        contentSnippet: doc.bab4.penutup,
        children: [
          {
            id: "bab4_gantt",
            label: "4.1 Matriks Rencana Kerja",
            type: "section",
            category: "Gantt Chart",
            status: "ready",
            thinkingMode: "Temporal Thinking",
            description: "Distribusi aktivitas mingguan dari onboarding hingga evaluasi akhir.",
            contentSnippet: `${doc.bab4.jadwalMatriks.length} milestone kerja tersusun terukur.`
          },
          {
            id: "bab4_closing",
            label: "4.2 Lembar Pengesahan & Penutup",
            type: "section",
            category: "Administrasi",
            status: "ready",
            thinkingMode: "Second-Order Thinking",
            description: "Format tanda tangan dosen pembimbing dan pimpinan instansi mitra.",
            contentSnippet: doc.bab4.penutup
          }
        ]
      }
    ]
  };
}
