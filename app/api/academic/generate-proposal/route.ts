import { NextResponse } from "next/server";
import { ProposalDocument, ProposalCategory, ReportType, CampusGuideline } from "@/types/studio";
import { buildGeneratedDocument } from "@/lib/agentEngine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const customKey = req.headers.get("x-gemini-key");
    const apiKey = customKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

    const {
      title = "Usulan Proposal Akademik",
      category = "magang",
      reportType = (category === "magang" ? "magang" : "skripsi") as ReportType,
      answers = {},
      targetEntity = "Instansi Mitra",
      candidateName = "Pengusul Akademik",
      candidateId = "NIM-2026-AKAD",
      institution = "Universitas Sebelas Maret (UNS)",
      facultyMajor = "Informatika & Sains Data",
      campusGuideline,
      theoryCount = 8,
      targetDepthPages = 45,
      campusLogoUrl
    } = body;

    // 1. If Gemini API key is available, generate deeply customized authentic document
    if (apiKey) {
      try {
        const prompt = `
Bertindaklah sebagai Dewan Guru Besar & Tim Reviewer Akademik Universitas Nasional (Standar Dikti).
Tugas Anda adalah menyusun NASKAH PROPOSAL / LAPORAN AKADEMIK AUTENTIK, MENDALAM, DAN KOMPREHENSIF (Bukan template dummy).

Identitas Penugasan:
- Judul: "${title}"
- Kategori / Jenis Laporan: "${reportType}" (Kategori dasar: ${category})
- Lokus / Instansi Sasaran: "${targetEntity}"
- Pengusul: "${candidateName}" (NIM: ${candidateId})
- Perguruan Tinggi & Jurusan: "${institution}" (${facultyMajor})
- Target Kedalaman Halaman: ~${targetDepthPages} Halaman Akademik
- Jumlah Landasan Teori Wajib: TEPAT ${theoryCount} TEORI POKOK (dengan sitasi jurnal nyata dan terindeks)
- Hasil Wawancara Diagnostik & Konteks Lapangan:
${JSON.stringify(answers, null, 2)}

ATURAN STRUKTUR AKADEMIK WAJIB:
1. RUMPUN ILMU: Wajib 100% konsisten dengan bidang judul (Kesehatan/Gizi/Medis, Pendidikan, Hukum, Bisnis/Akuntansi, atau Teknik/IT). Dilarang memasukkan istilah di luar rumpun ilmu judul!
2. BAB I: PENDAHULUAN harus memiliki 4-6 paragraf latar belakang yang menguraikan fenomena makro, kesenjangan empiris, urgensi lokus ${targetEntity}, dan solusi. Rumusan masalah minimal 3 butir terukur.
3. BAB II: LANDASAN TEORETIS harus memiliki TEPAT ${theoryCount} TEORI/KERANGKA yang mencantumkan nama konsep spesifik, mekanisme kerja, dan sitasi formal penulis & tahun.
4. DAFTAR PUSTAKA (BIBLIOGRAPHY): Setiap teori pada Bab II WAJIB memiliki entri pustaka lengkap yang sinkron (Penulis, Tahun, Judul Artikel/Buku, Nama Jurnal/Penerbit, Volume, DOI/URL).
5. BAB III: METODOLOGI harus mencantumkan tahapan operasional sistematis, batasan sampel/populasi atau lingkup kerja, alat/instrumen, serta definisi operasional.
6. BAB IV & BAB V: Matriks linimasa mingguan dengan target capaian konkret, rencana anggaran biaya (RAB), kesimpulan usulan, serta matriks mitigasi risiko.
7. HALAMAN AWAL (PRELIMINARY): Susun Kata Pengantar formal (preface) dan Abstrak dwibahasa (abstractId & abstractEn).

OUTPUT WAJIB: Balas HANYA dengan objek JSON valid tanpa markdown fence berikut:
{
  "id": "PROP-GEN-${Date.now().toString(36).toUpperCase()}",
  "title": "${title}",
  "category": "${category}",
  "reportType": "${reportType}",
  "institution": "${institution}",
  "facultyMajor": "${facultyMajor}",
  "targetEntity": "${targetEntity}",
  "targetDepartment": "Divisi / Unit Kerja Terkait",
  "durationMonths": 6,
  "candidateName": "${candidateName}",
  "candidateId": "${candidateId}",
  "generationDate": "${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}",
  "targetDepthPages": ${targetDepthPages},
  "preface": "Puji syukur kami panjatkan...",
  "abstractId": "Ringkasan naskah usulan penelitian/kegiatan ini bertujuan untuk...",
  "abstractEn": "This proposal aims to investigate and address...",
  "executiveSummary": "Ringkasan eksekutif 3-4 kalimat komprehensif...",
  "bab1": {
    "title": "BAB I: PENDAHULUAN",
    "latarBelakang": ["Paragraf 1...", "Paragraf 2...", "Paragraf 3...", "Paragraf 4...", "Paragraf 5..."],
    "rumusanMasalah": ["1. ...", "2. ...", "3. ..."],
    "batasanMasalah": ["1. ...", "2. ..."],
    "tujuanUmum": "...",
    "tujuanKhusus": ["1. ...", "2. ...", "3. ..."],
    "manfaatMahasiswa": ["1. ...", "2. ..."],
    "manfaatInstansi": ["1. ...", "2. ..."],
    "manfaatAkademik": ["1. ...", "2. ..."]
  },
  "bab2": {
    "title": "BAB II: TINJAUAN PUSTAKA & KERANGKA TEORETIS",
    "profilInstansi": "Profil instansi mitra...",
    "visiMisi": ["Visi: ...", "Misi: ..."],
    "strukturOrganisasi": "...",
    "landasanTeori": [
      // Hasilkan tepat ${theoryCount} objek teori
      { "topic": "Nama Teori 1", "elaboration": "Penjelasan mekanisme dan relevansi...", "citation": "(Penulis, Tahun)" }
    ],
    "conceptualFramework": "Alur kerangka konseptual..."
  },
  "bab3": {
    "title": "BAB III: METODOLOGI & PERANCANGAN KERJA",
    "metodePelaksanaan": "Uraian metode...",
    "lingkupPekerjaan": ["1. ...", "2. ...", "3. ...", "4. ..."],
    "perangkatTools": ["Tool 1", "Tool 2", "Tool 3"],
    "rencanaKompetensi": ["Kompetensi 1", "Kompetensi 2"],
    "populationSample": "Subjek sasaran...",
    "ethicalConsiderations": "Prinsip etika..."
  },
  "bab4": {
    "title": "BAB IV: JADWAL KERJA & RENCANA ANGGARAN",
    "jadwalMatriks": [
      { "week": 1, "phase": "Fase 1: Persiapan", "activities": ["..."], "output": "...", "competencyTarget": "..." },
      { "week": 4, "phase": "Fase 2: Eksekusi", "activities": ["..."], "output": "...", "competencyTarget": "..." },
      { "week": 8, "phase": "Fase 3: Pengujian", "activities": ["..."], "output": "...", "competencyTarget": "..." },
      { "week": 12, "phase": "Fase 4: Finalisasi", "activities": ["..."], "output": "...", "competencyTarget": "..." }
    ],
    "rencanaAnggaran": "RAB rinci...",
    "penutup": "Penutup rencana kerja..."
  },
  "bab5": {
    "title": "BAB V: KESIMPULAN & MITIGASI RISIKO",
    "kesimpulanUsulan": ["Kesimpulan 1", "Kesimpulan 2"],
    "kontribusiPraktis": ["Kontribusi 1", "Kontribusi 2"],
    "mitigasiRisiko": [
      { "risiko": "Risiko 1", "mitigasi": "Langkah mitigasi 1" },
      { "risiko": "Risiko 2", "mitigasi": "Langkah mitigasi 2" }
    ],
    "sustainabilityPlan": "Rencana keberlanjutan..."
  },
  "bibliography": [
    // Array rujukan yang sinkron dengan seluruh teori di atas
    { "id": 1, "author": "...", "year": "...", "title": "...", "source": "...", "doiUrl": "..." }
  ],
  "slides": [
    { "slideNumber": 1, "kicker": "COVER EKSEKUTIF", "title": "${title}", "subtitle": "${institution}", "keyPoints": ["..."], "speakerNotes": "..." },
    { "slideNumber": 2, "kicker": "LATAR BELAKANG", "title": "Urgensi Masalah", "subtitle": "Problem Gap", "keyPoints": ["..."], "speakerNotes": "..." },
    { "slideNumber": 3, "kicker": "RUMUSAN MASALAH", "title": "Fokus & Target", "subtitle": "Deliverables", "keyPoints": ["..."], "speakerNotes": "..." },
    { "slideNumber": 4, "kicker": "LANDASAN TEORI", "title": "Sintesis Pustaka", "subtitle": "State-of-The-Art", "keyPoints": ["..."], "speakerNotes": "..." },
    { "slideNumber": 5, "kicker": "METODOLOGI", "title": "Pipeline Kerja", "subtitle": "Google Flow Architecture", "keyPoints": ["..."], "speakerNotes": "..." },
    { "slideNumber": 6, "kicker": "ROADMAP", "title": "Linimasa & Capaian", "subtitle": "Jadwal", "keyPoints": ["..."], "speakerNotes": "..." }
  ]
}
`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.65,
                maxOutputTokens: 8192,
                responseMimeType: "application/json",
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsedDoc: ProposalDocument = JSON.parse(rawText);
            
            // Enrich with campus guidelines & logos
            if (campusGuideline) {
              parsedDoc.campusGuideline = campusGuideline;
            }
            if (campusLogoUrl) {
              parsedDoc.campusLogoUrl = campusLogoUrl;
            }

            // Ensure preliminary options default
            parsedDoc.preliminaryOptions = {
              includeToC: true,
              includeListOfFigures: true,
              includeListOfTables: true,
              includePreface: true,
              includeAbstract: true
            };

            // Ensure default custom sheets are populated
            parsedDoc.customSheets = [
              {
                id: "sheet-pengesahan",
                type: "pengesahan",
                title: "Lembar Pengesahan Naskah",
                pagePosition: 2,
                enabled: true,
                signers: [
                  { role: "Dosen Pembimbing I", name: "Dr. Ir. Hendro Prabowo, M.T.", idNumber: "197805122003121002" },
                  { role: "Dosen Pembimbing II / Mentor Industri", name: "Ratna Kusuma Dewi, S.T., M.Sc.", idNumber: "198509142010122004" }
                ]
              },
              {
                id: "sheet-orisinalitas",
                type: "pernyataan_orisinalitas",
                title: "Lembar Pernyataan Orisinalitas & Integritas Ilmiah",
                pagePosition: 3,
                enabled: true,
                content: `Dengan ini saya menyatakan dengan sesungguhnya bahwa naskah usulan ${reportType} ini adalah karya saya sendiri, tidak terdapat karya atau pendapat yang pernah ditulis atau diterbitkan oleh orang lain, kecuali yang secara tertulis diacu dalam naskah ini dan disebutkan dalam daftar pustaka.`
              },
              {
                id: "sheet-berita-acara",
                type: "berita_acara",
                title: "Lembar Berita Acara Bimbingan & Sidang Proposal",
                pagePosition: 4,
                enabled: false,
                content: `Telah dilaksanakan evaluasi dan pertahanan usulan naskah proposal pada tanggal ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} dengan hasil direkomendasikan untuk pelaksanaan.`
              }
            ];

            return NextResponse.json({
              success: true,
              document: parsedDoc,
              approximatePageCount: targetDepthPages || 45,
              engine: "gemini-2.5-flash"
            });
          }
        }
      } catch (err: any) {
        console.warn("Gemini generation failed, using intelligent local engine:", err?.message);
      }
    }

    // 2. Intelligent local fallback if Gemini key is missing or failed
    const fallbackDoc = buildGeneratedDocument(
      title,
      category,
      answers,
      candidateName,
      candidateId,
      institution,
      facultyMajor,
      targetEntity
    );

    if (campusGuideline) {
      fallbackDoc.campusGuideline = campusGuideline;
    }
    if (campusLogoUrl) {
      fallbackDoc.campusLogoUrl = campusLogoUrl;
    }

    fallbackDoc.reportType = reportType;
    fallbackDoc.targetDepthPages = targetDepthPages;
    fallbackDoc.preface = `Puji syukur kami panjatkan ke hadirat Tuhan Yang Maha Esa atas limpahan rahmat dan karunia-Nya sehingga naskah usulan ${reportType.toUpperCase()} berjudul "${title}" ini dapat diselesaikan dengan baik sesuai standar akademik. Naskah ini disusun untuk memenuhi salah satu syarat kelulusan kurikulum di ${institution}.`;
    fallbackDoc.abstractId = `Naskah usulan ini membahas perumusan sistematis pemecahan masalah "${title}" pada lokus ${targetEntity}. Melalui kerangka kerja berbasis bukti dan penerapan instrumen tervalidasi, usulan ini dirancang untuk menghasilkan kontribusi terukur baik secara metodologis maupun aplikatif bagi instansi mitra dan perguruan tinggi.`;
    fallbackDoc.abstractEn = `This proposal outlines a structured methodological framework addressing "${title}" situated at ${targetEntity}. Through evidence-based practices and validated academic instruments, this research establishes measurable outputs contributing to both industry partners and higher education curriculum standards.`;

    fallbackDoc.preliminaryOptions = {
      includeToC: true,
      includeListOfFigures: true,
      includeListOfTables: true,
      includePreface: true,
      includeAbstract: true
    };

    fallbackDoc.customSheets = [
      {
        id: "sheet-pengesahan",
        type: "pengesahan",
        title: "Lembar Pengesahan Naskah",
        pagePosition: 2,
        enabled: true,
        signers: [
          { role: "Dosen Pembimbing I", name: "Dr. Ir. Hendro Prabowo, M.T.", idNumber: "197805122003121002" },
          { role: "Dosen Pembimbing II / Mentor Industri", name: "Ratna Kusuma Dewi, S.T., M.Sc.", idNumber: "198509142010122004" }
        ]
      },
      {
        id: "sheet-orisinalitas",
        type: "pernyataan_orisinalitas",
        title: "Lembar Pernyataan Orisinalitas & Bebas Plagiarisme",
        pagePosition: 3,
        enabled: true,
        content: `Dengan ini saya menyatakan bahwa usulan naskah ini merupakan karya orisinal saya sendiri, bebas dari unsur plagiarisme, dan seluruh kutipan telah dicantumkan sumbernya secara benar dalam Daftar Pustaka.`
      }
    ];

    return NextResponse.json({
      success: true,
      document: fallbackDoc,
      approximatePageCount: targetDepthPages || 30,
      engine: "academic-heuristic-engine"
    });

  } catch (error: any) {
    console.error("Error in generate-proposal API:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Gagal menghasilkan dokumen" },
      { status: 500 }
    );
  }
}
