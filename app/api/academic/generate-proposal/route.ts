import { NextResponse } from "next/server";
import { ProposalDocument, ProposalCategory, ReportType, CampusGuideline } from "@/types/studio";
import { buildDenseAcademicDocument, planDocumentOutline } from "@/lib/longDocumentGenerator";
import { sanitizeAcademicText } from "@/lib/textSanitizer";

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

    // 1. Build dense, resilient baseline document first
    const baseDoc = buildDenseAcademicDocument(
      title,
      category as ProposalCategory,
      answers,
      candidateName,
      candidateId,
      institution,
      facultyMajor,
      targetEntity,
      campusGuideline,
      reportType
    );

    if (campusLogoUrl) {
      baseDoc.campusLogoUrl = campusLogoUrl;
    }

    // 2. If Gemini API key is available, synthesize custom AI content on top of dense structure
    if (apiKey) {
      try {
        const prompt = `
Bertindaklah sebagai Dewan Guru Besar & Tim Reviewer Akademik Universitas Nasional (Standar Dikti).
Tugas Anda adalah menyusun NASKAH PROPOSAL / LAPORAN AKADEMIK AUTENTIK, MENDALAM, DAN KOMPREHENSIF.

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
1. RUMPUN ILMU: Wajib 100% konsisten dengan bidang judul (Kesehatan/Gizi/Medis, Pendidikan, Hukum, Bisnis/Akuntansi, atau Teknik/IT).
2. BAB I: PENDAHULUAN harus memiliki 5-8 paragraf latar belakang mendalam (fenomena makro, kesenjangan empiris, urgensi lokus ${targetEntity}, dan solusi terstandar). Rumusan masalah minimal 3 butir terukur.
3. BAB II: LANDASAN TEORETIS harus memiliki TEPAT ${theoryCount} TEORI/KERANGKA dengan uraian komprehensif mekanisme kerja, dan sitasi formal penulis & tahun.
4. DAFTAR PUSTAKA: Setiap teori pada Bab II WAJIB memiliki entri pustaka lengkap yang sinkron.
5. BAB III: METODOLOGI harus mencantumkan tahapan operasional sistematis, batasan sampel/populasi atau lingkup kerja, alat/instrumen, serta definisi operasional.
6. BAB IV & V: Matriks linimasa mingguan, rencana anggaran biaya (RAB), kesimpulan usulan, serta matriks mitigasi risiko.
7. HALAMAN AWAL: Susun Kata Pengantar formal dan Abstrak dwibahasa (abstractId & abstractEn).

OUTPUT WAJIB: Balas HANYA dengan objek JSON valid tanpa markdown fence:
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
    { "id": 1, "author": "...", "year": "...", "title": "...", "source": "...", "doiUrl": "..." }
  ],
  "slides": [
    { "slideNumber": 1, "kicker": "COVER EKSEKUTIF", "title": "${title}", "subtitle": "${institution}", "keyPoints": ["..."], "speakerNotes": "..." }
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
            const parsedDoc: Partial<ProposalDocument> = JSON.parse(rawText);

            // Merge parsed AI output on top of the dense baseline
            const mergedDoc: ProposalDocument = {
              ...baseDoc,
              ...parsedDoc,
              id: parsedDoc.id || baseDoc.id,
              title: parsedDoc.title || baseDoc.title,
              preface: parsedDoc.preface || baseDoc.preface,
              abstractId: parsedDoc.abstractId || baseDoc.abstractId,
              abstractEn: parsedDoc.abstractEn || baseDoc.abstractEn,
              executiveSummary: parsedDoc.executiveSummary || baseDoc.executiveSummary,
              bab1: {
                ...baseDoc.bab1,
                ...(parsedDoc.bab1 || {}),
                latarBelakang: (parsedDoc.bab1?.latarBelakang && parsedDoc.bab1.latarBelakang.length >= 4) 
                  ? parsedDoc.bab1.latarBelakang 
                  : baseDoc.bab1.latarBelakang
              },
              bab2: {
                ...baseDoc.bab2,
                ...(parsedDoc.bab2 || {}),
                landasanTeori: (parsedDoc.bab2?.landasanTeori && parsedDoc.bab2.landasanTeori.length >= 4)
                  ? parsedDoc.bab2.landasanTeori
                  : baseDoc.bab2.landasanTeori,
                researchGapMatrix: baseDoc.bab2?.researchGapMatrix
              },
              bab3: {
                ...baseDoc.bab3,
                ...(parsedDoc.bab3 || {}),
                operationalDefinitions: baseDoc.bab3?.operationalDefinitions
              },
              bab4: {
                ...baseDoc.bab4,
                ...(parsedDoc.bab4 || {})
              },
              bab5: {
                title: parsedDoc.bab5?.title || baseDoc.bab5?.title || "BAB V: KESIMPULAN & MITIGASI RISIKO",
                kesimpulanUsulan: parsedDoc.bab5?.kesimpulanUsulan || baseDoc.bab5?.kesimpulanUsulan || [],
                kontribusiPraktis: parsedDoc.bab5?.kontribusiPraktis || baseDoc.bab5?.kontribusiPraktis || [],
                mitigasiRisiko: (parsedDoc.bab5?.mitigasiRisiko && parsedDoc.bab5.mitigasiRisiko.length > 0)
                  ? parsedDoc.bab5.mitigasiRisiko
                  : (baseDoc.bab5?.mitigasiRisiko || []),
                sustainabilityPlan: parsedDoc.bab5?.sustainabilityPlan || baseDoc.bab5?.sustainabilityPlan
              },
              bibliography: (parsedDoc.bibliography && parsedDoc.bibliography.length >= 4)
                ? parsedDoc.bibliography
                : baseDoc.bibliography,
              slides: (parsedDoc.slides && parsedDoc.slides.length > 0)
                ? parsedDoc.slides
                : baseDoc.slides,
              customSheets: baseDoc.customSheets,
              preliminaryOptions: baseDoc.preliminaryOptions,
              campusGuideline: campusGuideline || baseDoc.campusGuideline,
              campusLogoUrl: campusLogoUrl || baseDoc.campusLogoUrl
            };

            return NextResponse.json({
              success: true,
              document: sanitizeAcademicText(mergedDoc),
              approximatePageCount: targetDepthPages || 45,
              engine: "gemini-2.5-flash-dense-hybrid"
            });
          }
        }
      } catch (err: any) {
        console.warn("Gemini generation failed, using intelligent dense engine:", err?.message);
      }
    }

    // 3. Resilient Full Dense Academic Document Return
    return NextResponse.json({
      success: true,
      document: sanitizeAcademicText(baseDoc),
      approximatePageCount: targetDepthPages || 40,
      engine: "academic-dense-engine"
    });

  } catch (error: any) {
    console.error("Error in generate-proposal API:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Gagal menghasilkan dokumen" },
      { status: 500 }
    );
  }
}
