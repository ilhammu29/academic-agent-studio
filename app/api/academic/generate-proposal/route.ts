import { getRequestAiKey } from "@/lib/serverAiConfig";
import { GEMINI_MODELS } from "@/lib/geminiApi";
import { NextResponse } from "next/server";
import { ProposalDocument, ProposalCategory, ReportType, CampusGuideline } from "@/types/studio";
import { buildDenseAcademicDocument, planDocumentOutline, scaleAcademicDocumentDepth } from "@/lib/longDocumentGenerator";
import { sanitizeAcademicText } from "@/lib/textSanitizer";

/**
 * Resilient JSON fetcher across available Gemini models
 */
async function fetchGeminiJson(apiKey: string, prompt: string, maxTokens = 8192, timeoutMs = 28000): Promise<any | null> {
  const models = GEMINI_MODELS;
  for (const model of models) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.65,
              maxOutputTokens: maxTokens,
              responseMimeType: "application/json",
            },
          }),
          signal: controller.signal
        }
      );
      if (res.ok) {
        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          return JSON.parse(rawText);
        }
      }
    } catch (e: any) {
      console.warn(`Worker call on model ${model} skipped:`, e?.message);
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const apiKey = getRequestAiKey(req);

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
      reportType,
      targetDepthPages
    );

    if (campusLogoUrl) {
      baseDoc.campusLogoUrl = campusLogoUrl;
    }

    // 2. If Gemini API key is available, run generation
    if (apiKey) {
      try {
        const isDeepTarget = targetDepthPages >= 35;

        // Prompt Master: Blueprint & Overall Structure
        const masterPrompt = `
Bertindaklah sebagai Dewan Guru Besar & Tim Reviewer Akademik Universitas Nasional (Standar Dikti).
Tugas Anda adalah merumuskan BLUEPRINT MASTER NASKAH AKADEMIK untuk usulan berikut:
- Judul: "${title}"
- Kategori / Jenis Laporan: "${reportType}" (Kategori dasar: ${category})
- Lokus / Instansi Sasaran: "${targetEntity}"
- Pengusul: "${candidateName}" (NIM: ${candidateId})
- Perguruan Tinggi & Jurusan: "${institution}" (${facultyMajor})
- Target Kedalaman Halaman: ~${targetDepthPages} Halaman
- Jumlah Landasan Teori Wajib: TEPAT ${theoryCount} Teori Pokok
- Konteks Diagnostik Lapangan:
${JSON.stringify(answers, null, 2)}

Jangan mengarang hasil, data lapangan, DOI, maupun referensi. Tandai informasi yang belum diketahui untuk ditinjau pengguna.

OUTPUT WAJIB JSON: Balas HANYA dengan objek JSON valid tanpa markdown fence:
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
  "preface": "Puji syukur kami panjatkan ke hadirat Tuhan Yang Maha Esa atas berkat dan karunia-Nya...",
  "abstractId": "Ringkasan naskah usulan penelitian/kegiatan ini bertujuan untuk menganalisis dan memecahkan permasalahan secara sistematis pada ${targetEntity}...",
  "abstractEn": "This academic proposal aims to systematically investigate and resolve key challenges at ${targetEntity} using empirical methods...",
  "executiveSummary": "Ringkasan eksekutif komprehensif menguraikan urgensi permasalahan, pendekatan metodologis terukur, dan target kontribusi bagi ${targetEntity}...",
  "bab1": {
    "title": "BAB I: PENDAHULUAN",
    "latarBelakang": ["Paragraf 1 fenomena makro...", "Paragraf 2 kesenjangan...", "Paragraf 3 urgensi..."],
    "rumusanMasalah": ["1. Bagaimana kondisi eksisting...", "2. Bagaimana rancangan solusi...", "3. Sejauh mana efektivitas..."],
    "batasanMasalah": ["1. Fokus pada lokus ${targetEntity}...", "2. Periode pengamatan..."],
    "tujuanUmum": "Menganalisis dan merumuskan intervensi ilmiah yang terukur guna meningkatkan efisiensi di ${targetEntity}.",
    "tujuanKhusus": ["1. Mengidentifikasi akar masalah...", "2. Mengembangkan instrumen...", "3. Mengevaluasi dampak..."],
    "manfaatMahasiswa": ["1. Penguasaan kompetensi aplikatif...", "2. Publikasi ilmiah..."],
    "manfaatInstansi": ["1. Rekomendasi solusi berbasis data...", "2. Optimasi proses kerja..."],
    "manfaatAkademik": ["1. Pengayaan pustaka empiris...", "2. Referensi penelitian lanjutan..."]
  },
  "bab2": {
    "title": "BAB II: TINJAUAN PUSTAKA & KERANGKA TEORETIS",
    "profilInstansi": "Gambaran umum operasional dan struktur organisasi ${targetEntity}...",
    "visiMisi": ["Visi: Menjadi unit kerja unggul...", "Misi: Menerapkan tata kelola profesional..."],
    "strukturOrganisasi": "Bagan hierarki komando dan koordinasi operasional pada unit kerja ${targetEntity}...",
    "landasanTeori": [
      { "topic": "Teori Pokok 1", "elaboration": "Uraian mekanisme kerja dan indikator...", "citation": "(Ahli, Tahun)" }
    ],
    "conceptualFramework": "Alur hubungan kausalitas antara variabel masalah, intervensi metodologis, dan luaran kinerja..."
  },
  "bab3": {
    "title": "BAB III: METODOLOGI & PERANCANGAN KERJA",
    "metodePelaksanaan": "Rancangan operasional penelitian dan alur pemecahan masalah...",
    "lingkupPekerjaan": ["1. Analisis awal", "2. Pengumpulan data", "3. Perancangan solusi", "4. Uji validasi"],
    "perangkatTools": ["Alat Analisis 1", "Software Pengolah Data", "Instrumen Lapangan"],
    "rencanaKompetensi": ["Analisis Data", "Problem Solving Terstruktur"],
    "populationSample": "Subjek sasaran penelitian meliputi seluruh unit kerja terkait di ${targetEntity}...",
    "ethicalConsiderations": "Penerapan prinsip konfidensialitas, persetujuan tertulis (informed consent), dan integritas data..."
  },
  "bab4": {
    "title": "BAB IV: JADWAL KERJA & RENCANA ANGGARAN",
    "jadwalMatriks": [
      { "week": 1, "phase": "Fase 1: Persiapan", "activities": ["Studi literatur", "Koordinasi lapangan"], "output": "Proposal final", "competencyTarget": "Manajemen proyek" },
      { "week": 4, "phase": "Fase 2: Eksekusi", "activities": ["Pengumpulan data empiris"], "output": "Dataset primer", "competencyTarget": "Teknik instrumentasi" },
      { "week": 8, "phase": "Fase 3: Analisis", "activities": ["Pengujian hipotesis & kalibrasi"], "output": "Hasil komputasi", "competencyTarget": "Keahlian analitik" },
      { "week": 12, "phase": "Fase 4: Finalisasi", "activities": ["Penyusunan laporan & diseminasi"], "output": "Dokumen laporan akhir", "competencyTarget": "Komunikasi ilmiah" }
    ],
    "rencanaAnggaran": "Rencana alokasi anggaran biaya disesuaikan dengan Standar Biaya Masukan (SBM) resmi Kemenkeu...",
    "penutup": "Rencana kerja disusun dengan mempertimbangkan efektivitas waktu dan ketersediaan sumber daya..."
  },
  "bab5": {
    "title": "BAB V: KESIMPULAN & MITIGASI RISIKO",
    "kesimpulanUsulan": [
      "Usulan kegiatan/penelitian ini mengintegrasikan pendekatan teoritis mutakhir dan kebutuhan riil di ${targetEntity}.",
      "Kerangka metodologis yang dirancang menjamin validitas hasil serta keberlanjutan rekomendasi."
    ],
    "kontribusiPraktis": [
      "Menyediakan model intervensi yang dapat diadopsi langsung oleh manajemen ${targetEntity}.",
      "Meningkatkan akurasi pengambilan keputusan strategis berbasis data faktual."
    ],
    "mitigasiRisiko": [
      { "risiko": "Kendala akses data primer di lapangan", "mitigasi": "Menyiapkan protokol legalitas dan alternatif triangulasi data sekunder" },
      { "risiko": "Keterlambatan jadwal pengujian teknis", "mitigasi": "Alokasi buffer waktu 2 minggu pada jadwal operasional" }
    ],
    "sustainabilityPlan": "Rencana transfer pengetahuan melalui lokakarya internal dan dokumentasi SOP teknis bagi personel ${targetEntity}."
  },
  "bibliography": [
    { "id": 1, "author": "Creswell, J. W.", "year": "2021", "title": "Research Design: Qualitative, Quantitative, and Mixed Methods Approaches", "source": "SAGE Publications", "doiUrl": "https://doi.org/10.1177/001" }
  ],
  "slides": [
    { "slideNumber": 1, "kicker": "COVER EKSEKUTIF", "title": "${title}", "subtitle": "${institution}", "keyPoints": ["Pengusul: ${candidateName}", "Lokus: ${targetEntity}"], "speakerNotes": "Pembukaan presentasi resmi..." }
  ]
}
`;

        const parsedMasterDoc: Partial<ProposalDocument> | null = await fetchGeminiJson(apiKey, masterPrompt, 8192);
        if (!parsedMasterDoc) throw new Error("Gemini tidak menghasilkan dokumen yang dapat dibaca.");

        let deepBab1 = parsedMasterDoc?.bab1 || baseDoc.bab1;
        let deepBab2 = parsedMasterDoc?.bab2 || baseDoc.bab2;
        let deepBab3 = parsedMasterDoc?.bab3 || baseDoc.bab3;
        let deepBab4 = parsedMasterDoc?.bab4 || baseDoc.bab4;
        let deepBab5 = parsedMasterDoc?.bab5 || baseDoc.bab5;
        let deepBibliography = parsedMasterDoc?.bibliography || baseDoc.bibliography;

        // CARA 2: MULTI-WORKER PARALLEL ORCHESTRATION (For High Depth Targets >= 35 pages)
        if (isDeepTarget) {
          const workerBab1Prompt = `
Bertindaklah sebagai Pakar Penulisan Akademik Nasional.
TUGAS SPESIFIK: Tuliskan BAB I: PENDAHULUAN SECARA SANGAT MENDALAM untuk judul: "${title}" pada instansi "${targetEntity}".
Instruksi:
1. Latar Belakang WAJIB berupa 8 sampai 10 paragraf analitis panjang dan berbobot ilmiah (analisis makro, kesenjangan meso, fenomena empiris mikro di ${targetEntity}, gap problem, urgensi novelty, dan implikasi solusi).
2. Rumusan Masalah minimal 4 butir terukur.
3. Batasan Masalah minimal 3 butir.
4. Tujuan Umum dan minimal 4 Tujuan Khusus.
5. Manfaat terbagi 3: Mahasiswa, Instansi Mitra, dan Akademisi.
HINDARI tanda double asterisks (**).
OUTPUT HANYA JSON:
{
  "title": "BAB I: PENDAHULUAN",
  "latarBelakang": ["Paragraf 1...", "Paragraf 2...", "Paragraf 3...", "Paragraf 4...", "Paragraf 5...", "Paragraf 6...", "Paragraf 7...", "Paragraf 8..."],
  "rumusanMasalah": ["1. ...", "2. ...", "3. ...", "4. ..."],
  "batasanMasalah": ["1. ...", "2. ...", "3. ..."],
  "tujuanUmum": "...",
  "tujuanKhusus": ["1. ...", "2. ...", "3. ...", "4. ..."],
  "manfaatMahasiswa": ["1. ...", "2. ..."],
  "manfaatInstansi": ["1. ...", "2. ..."],
  "manfaatAkademik": ["1. ...", "2. ..."]
}
`;

          const workerBab2Prompt = `
Bertindaklah sebagai Guru Besar & Reviewer Jurnal Internasional.
TUGAS SPESIFIK: Tuliskan BAB II: TINJAUAN PUSTAKA & KERANGKA TEORETIS SECARA SANGAT MENDALAM untuk judul: "${title}".
Instruksi:
1. Buatkan TEPAT ${Math.max(theoryCount, 10)} Teori / Landasan Ilmiah Otoritatif. Setiap teori WAJIB memiliki:
   - "topic": Nama teori spesifik.
   - "elaboration": 2-3 paragraf panjang menjelaskan mekanisme konseptual, indikator operasional, kritik teoretis, dan relevansi langsung dengan masalah di ${targetEntity}.
   - "citation": Sitasi formal penulis & tahun, misal "(Davis, 1989; Sugiyono, 2022)".
2. Kerangka konseptual naratif yang komprehensif.
3. Daftar pustaka sinkron untuk setiap teori.
HINDARI tanda double asterisks (**).
OUTPUT HANYA JSON:
{
  "profilInstansi": "Uraian mendalam profil dan tata kerja ${targetEntity}...",
  "landasanTeori": [
    { "topic": "Nama Teori 1", "elaboration": "...", "citation": "(Penulis, Tahun)" }
  ],
  "conceptualFramework": "Alur kerangka berpikir komprehensif...",
  "bibliography": [
    { "id": 1, "author": "...", "year": "...", "title": "...", "source": "...", "doiUrl": "..." }
  ]
}
`;

          const workerBab3Prompt = `
Bertindaklah sebagai Pakar Metodologi Penelitian Kuantitatif & Terapan.
TUGAS SPESIFIK: Tuliskan BAB III: METODOLOGI & PERANCANGAN KERJA SISTEMATIS untuk judul: "${title}" di "${targetEntity}".
Instruksi:
1. Metode Pelaksanaan menguraikan desain 8 tahapan operasional riset/kerja secara presisi.
2. Lingkup pekerjaan rinci minimal 6 tahapan.
3. Populasi dan Sampel lengkap dengan konteks sampling ilmiah (rumus Slovin).
4. Prinsip etika data dan konfidensialitas mitra.
5. Perangkat & tools yang digunakan.
HINDARI tanda double asterisks (**).
OUTPUT HANYA JSON:
{
  "metodePelaksanaan": "Uraian desain dan metodologi operasional...",
  "lingkupPekerjaan": ["Tahap 1: ...", "Tahap 2: ...", "Tahap 3: ...", "Tahap 4: ...", "Tahap 5: ...", "Tahap 6: ..."],
  "perangkatTools": ["Tool 1", "Tool 2", "Tool 3", "Tool 4", "Tool 5"],
  "rencanaKompetensi": ["Kompetensi 1", "Kompetensi 2", "Kompetensi 3"],
  "populationSample": "Uraian populasi target dan teknik sampling...",
  "ethicalConsiderations": "Penerapan etika penelitian, informed consent, dan keamanan data instansi..."
}
`;

          const workerBab4And5Prompt = `
Bertindaklah sebagai Konsultan Perencanaan Strategis & Manajemen Risiko Akademik.
TUGAS SPESIFIK: Tuliskan BAB IV JADWAL & RAB serta BAB V KESIMPULAN & MITIGASI RISIKO untuk judul: "${title}" di "${targetEntity}".
Instruksi:
1. Rencana Anggaran Biaya (RAB) naratif standar SBM Kemenkeu.
2. Kesimpulan usulan minimal 3 poin mendalam menjawab rumusan masalah.
3. Kontribusi praktis bagi mitra ${targetEntity}.
4. Matriks mitigasi risiko: minimal 4 skenario risiko nyata dan tindakan preventif terukur.
5. Rencana keberlanjutan (sustainability plan).
HINDARI tanda double asterisks (**).
OUTPUT HANYA JSON:
{
  "rencanaAnggaran": "Alokasi anggaran terstruktur berdasarkan komponen operasional SBM...",
  "penutup": "Penutup rencana pelaksanaan kegiatan...",
  "kesimpulanUsulan": ["Kesimpulan 1...", "Kesimpulan 2...", "Kesimpulan 3..."],
  "kontribusiPraktis": ["Kontribusi 1...", "Kontribusi 2...", "Kontribusi 3..."],
  "mitigasiRisiko": [
    { "risiko": "Risiko teknis 1", "mitigasi": "Langkah mitigasi terinci 1" },
    { "risiko": "Risiko operasional 2", "mitigasi": "Langkah mitigasi terinci 2" },
    { "risiko": "Risiko data 3", "mitigasi": "Langkah mitigasi terinci 3" },
    { "risiko": "Risiko linimasa 4", "mitigasi": "Langkah mitigasi terinci 4" }
  ],
  "sustainabilityPlan": "Rencana transfer pengetahuan dan keberlanjutan hasil kerja..."
}
`;

          // Execute workers in parallel via Promise.allSettled
          const workerResults = await Promise.allSettled([
            fetchGeminiJson(apiKey, workerBab1Prompt, 8192, 25000),
            fetchGeminiJson(apiKey, workerBab2Prompt, 8192, 25000),
            fetchGeminiJson(apiKey, workerBab3Prompt, 8192, 25000),
            fetchGeminiJson(apiKey, workerBab4And5Prompt, 8192, 25000),
          ]);

          const [resB1, resB2, resB3, resB45] = workerResults;

          if (resB1.status === "fulfilled" && resB1.value) {
            const val = resB1.value;
            if (val.latarBelakang && Array.isArray(val.latarBelakang) && val.latarBelakang.length >= 4) {
              deepBab1 = { ...deepBab1, ...val };
            }
          }

          if (resB2.status === "fulfilled" && resB2.value) {
            const val = resB2.value;
            if (val.landasanTeori && Array.isArray(val.landasanTeori) && val.landasanTeori.length >= 4) {
              deepBab2 = { ...deepBab2, ...val };
              if (val.bibliography && Array.isArray(val.bibliography) && val.bibliography.length >= 4) {
                deepBibliography = val.bibliography;
              }
            }
          }

          if (resB3.status === "fulfilled" && resB3.value) {
            const val = resB3.value;
            if (val.metodePelaksanaan) {
              deepBab3 = { ...deepBab3, ...val };
            }
          }

          if (resB45.status === "fulfilled" && resB45.value) {
            const val = resB45.value;
            if (val.rencanaAnggaran || val.penutup) {
              deepBab4 = { ...deepBab4, ...(val.rencanaAnggaran ? { rencanaAnggaran: val.rencanaAnggaran } : {}), ...(val.penutup ? { penutup: val.penutup } : {}) };
            }
            if (val.kesimpulanUsulan || val.mitigasiRisiko) {
              deepBab5 = { 
                ...deepBab5, 
                title: deepBab5?.title || baseDoc.bab5?.title || "BAB V: KESIMPULAN & MITIGASI RISIKO",
                kesimpulanUsulan: val.kesimpulanUsulan || deepBab5?.kesimpulanUsulan || [],
                kontribusiPraktis: val.kontribusiPraktis || deepBab5?.kontribusiPraktis || [],
                mitigasiRisiko: val.mitigasiRisiko || deepBab5?.mitigasiRisiko || [],
                sustainabilityPlan: val.sustainabilityPlan || deepBab5?.sustainabilityPlan
              };
            }
          }
        }

        // Merge all worker and master outputs into unified ProposalDocument
        const mergedDoc: ProposalDocument = {
          ...baseDoc,
          ...(parsedMasterDoc || {}),
          id: parsedMasterDoc?.id || baseDoc.id,
          title: parsedMasterDoc?.title || baseDoc.title,
          preface: parsedMasterDoc?.preface || baseDoc.preface,
          abstractId: parsedMasterDoc?.abstractId || baseDoc.abstractId,
          abstractEn: parsedMasterDoc?.abstractEn || baseDoc.abstractEn,
          executiveSummary: parsedMasterDoc?.executiveSummary || baseDoc.executiveSummary,
          bab1: deepBab1,
          bab2: {
            ...deepBab2,
            researchGapMatrix: baseDoc.bab2?.researchGapMatrix
          },
          bab3: {
            ...deepBab3,
            operationalDefinitions: baseDoc.bab3?.operationalDefinitions
          },
          bab4: deepBab4,
          bab5: deepBab5,
          bibliography: deepBibliography,
          slides: (parsedMasterDoc?.slides && parsedMasterDoc.slides.length > 0)
            ? parsedMasterDoc.slides
            : baseDoc.slides,
          customSheets: baseDoc.customSheets,
          preliminaryOptions: baseDoc.preliminaryOptions,
          campusGuideline: campusGuideline || baseDoc.campusGuideline,
          campusLogoUrl: campusLogoUrl || baseDoc.campusLogoUrl
        };

        const finalDoc = (targetDepthPages && targetDepthPages > 25)
          ? scaleAcademicDocumentDepth(mergedDoc, targetDepthPages)
          : mergedDoc;

        return NextResponse.json({
          success: true,
          document: sanitizeAcademicText(finalDoc),
          approximatePageCount: null,
          engine: isDeepTarget ? "gemini-multi-worker-parallel-engine" : "gemini-flash-dense-hybrid"
        });

      } catch (err: any) {
        console.warn("Gemini generation failed, activating resilient dense engine fallback:", err?.message);
      }
    }

    // 3. Resilient Full Dense Academic Document Return (Offline / Fallback)
    const finalBaseDoc = (targetDepthPages && targetDepthPages > 25)
      ? scaleAcademicDocumentDepth(baseDoc, targetDepthPages)
      : baseDoc;

    return NextResponse.json({
      success: true,
      document: sanitizeAcademicText(finalBaseDoc),
      approximatePageCount: null,
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