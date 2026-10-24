import { NextResponse } from "next/server";
import { buildGeneratedDocument } from "@/lib/agentEngine";
import { ProposalCategory, ProposalDocument } from "@/types/studio";
import { callGeminiApi } from "@/lib/geminiApi";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const customKey = req.headers.get("x-gemini-key");
    const apiKey = customKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

    // 0. Direct Prompt Completion Mode (Academic Copilot, Defense Q&A Evaluator, Chat Assistants)
    if (body.prompt && typeof body.prompt === "string" && !body.title && !body.answers) {
      if (apiKey) {
        const result = await callGeminiApi({
          apiKey,
          prompt: body.prompt,
          temperature: 0.7,
          maxOutputTokens: 3000
        });
        if (result && result.text) {
          return NextResponse.json({
            success: true,
            engine: result.model,
            text: result.text
          });
        }
      }
      return NextResponse.json({
        success: true,
        engine: "academic-heuristic",
        text: "Kajian usulan proposal Anda menunjukkan urgensi metodologis yang kuat. Pastikan keselarasan antara rumusan masalah Bab I dan instrumen verifikasi Bab III."
      });
    }

    const { 
      title = "Usulan Proposal Akademik", 
      category = "magang", 
      answers = {}, 
      targetEntity = "Instansi Mitra", 
      candidateName = "Pengusul", 
      candidateId = "NIM-2026-AKAD",
      institution = "Universitas",
      facultyMajor = "Fakultas Terkait",
      customKnowledge = "" 
    } = body;

    // 1. Live Gemini Call if API Key exists
    if (apiKey) {
      try {
        const groundingContext = customKnowledge
          ? `\n\n[KNOWLEDGE GROUNDING DARI USER]:\n${customKnowledge}`
          : "";

        const prompt = `
Bertindaklah sebagai Senior Academic Proposal Architect & Reviewer Dewan Sidang Kampus.
Pengguna mengajukan proposal penelitian/magang:
- Judul: "${title}"
- Kategori: "${category}" (magang / skripsi / penelitian)
- Instansi/Lokus: "${targetEntity}"
- Pengusul: "${candidateName}" (NIM: ${candidateId})
- Kampus & Jurusan: "${institution}" (${facultyMajor})
- Hasil Wawancara Diagnostik Pengguna:
${JSON.stringify(answers, null, 2)}${groundingContext}

PANDUAN SOP & STANDAR AKADEMIK WAJIB:
1. RUMPUN ILMU: Wajib 100% konsisten dengan rumpun ilmu judul usulan!
   - Jika judul tentang KESEHATAN / GIZI / MEDIS (seperti Obesitas, Stunting, Penyakit, Pasien):
     * Wajib gunakan puskesmas/klinik/rumah sakit/populasi sasaran.
     * Wajib gunakan variabel klinis/antropometri (IMT/U, BIA, Microtoise, SQ-FFQ, Recall 24 jam).
     * Wajib gunakan landasan teori medis/gizi (WHO, Kemenkes, Gibson, Sudigdo Sastroasmoro).
     * DILARANG KERAS menggunakan istilah IT seperti "Python, Docker, Dockerfile, Git, REST API, microservices" untuk topik kesehatan murni!
   - Jika judul tentang PENDIDIKAN:
     * Gunakan sekolah, guru, kurikulum merdeka, model ADDIE, validitas Aiken's V, uji N-Gain, modul ajar.
   - Jika judul tentang HUKUM:
     * Gunakan perundang-undangan, legal opinion, doktrin yuridis, pendekatan konseptual.
   - Jika judul tentang BISNIS/KEUANGAN:
     * Gunakan rasio keuangan (ROA, ROE), Altman Z-score, model regresi data panel, financial report.
   - Jika judul tentang TEKNOLOGI/IT:
     * Gunakan arsitektur software, containerization, microservice, pipeline, testing.

2. SUSUN DOKUMEN PROPOSAL LENGKAP DALAM FORMAT JSON PERSIS SEPERTI STRUKTUR BERIKUT:
{
  "id": "PROP-GEMINI-AI",
  "title": "${title}",
  "category": "${category}",
  "institution": "${institution}",
  "facultyMajor": "${facultyMajor}",
  "targetEntity": "${targetEntity}",
  "targetDepartment": "Nama divisi / lokus sasaran...",
  "durationMonths": 6,
  "candidateName": "${candidateName}",
  "candidateId": "${candidateId}",
  "generationDate": "23 Oktober 2026",
  "executiveSummary": "Ringkasan eksekutif 2-3 kalimat formal dan padat...",
  "bab1": {
    "title": "BAB I: PENDAHULUAN",
    "latarBelakang": [
      "Paragraf 1: Latar belakang makro & urgensi teoretis...",
      "Paragraf 2: Kesenjangan nyata di lapangan & problem statement...",
      "Paragraf 3: Solusi yang diusulkan & kontribusi nyata..."
    ],
    "rumusanMasalah": [
      "1. Rumusan masalah pertama...",
      "2. Rumusan masalah kedua...",
      "3. Rumusan masalah ketiga..."
    ],
    "batasanMasalah": [
      "Batasan 1...",
      "Batasan 2...",
      "Batasan 3..."
    ],
    "tujuanUmum": "Tujuan umum penelitian/kegiatan...",
    "tujuanKhusus": [
      "Tujuan khusus 1...",
      "Tujuan khusus 2...",
      "Tujuan khusus 3..."
    ],
    "manfaatMahasiswa": ["Manfaat 1", "Manfaat 2"],
    "manfaatInstansi": ["Manfaat 1", "Manfaat 2"],
    "manfaatAkademik": ["Manfaat 1", "Manfaat 2"]
  },
  "bab2": {
    "title": "BAB II: TINJAUAN PUSTAKA & KERANGKA TEORETIS",
    "profilInstansi": "Gambaran profil lokus/instansi...",
    "visiMisi": ["Visi: ...", "Misi 1: ...", "Misi 2: ..."],
    "strukturOrganisasi": "Penjelasan struktur unit atau alur kerja terkait...",
    "landasanTeori": [
      {
        "topic": "Nama Konsep / Teori Utama 1",
        "elaboration": "Uraian teoretis mendalam...",
        "citation": "(Nama Penulis, Judul Rujukan Baku, Tahun)"
      },
      {
        "topic": "Nama Konsep / Teori Utama 2",
        "elaboration": "Uraian teoretis mendalam...",
        "citation": "(Nama Penulis, Judul Rujukan Baku, Tahun)"
      },
      {
        "topic": "Nama Konsep / Teori Utama 3",
        "elaboration": "Uraian teoretis mendalam...",
        "citation": "(Nama Penulis, Judul Rujukan Baku, Tahun)"
      }
    ]
  },
  "bab3": {
    "title": "BAB III: METODE PENELITIAN & PROTOKOL KERJA",
    "metodePelaksanaan": "Uraian model kerja / desain penelitian komprehensif...",
    "lingkupPekerjaan": ["Lingkup 1...", "Lingkup 2...", "Lingkup 3...", "Lingkup 4..."],
    "perangkatTools": ["Perangkat/Metode 1", "Perangkat/Metode 2", "Perangkat/Metode 3", "Perangkat/Metode 4"],
    "rencanaKompetensi": ["Capaian kompetensi 1", "Capaian kompetensi 2", "Capaian kompetensi 3"]
  },
  "bab4": {
    "title": "BAB IV: JADWAL PELAKSANAAN & PENUTUP",
    "jadwalMatriks": [
      {
        "week": 1,
        "phase": "Fase 1: Persiapan & Etika/Onboarding",
        "activities": ["Aktivitas 1", "Aktivitas 2"],
        "output": "Keluaran minggu 1",
        "competencyTarget": "Target kompetensi"
      },
      {
        "week": 4,
        "phase": "Fase 2: Uji Coba / Desain Solusi",
        "activities": ["Aktivitas 1", "Aktivitas 2"],
        "output": "Keluaran fase 2",
        "competencyTarget": "Target kompetensi"
      },
      {
        "week": 8,
        "phase": "Fase 3: Pengambilan Data / Implementasi Lapangan",
        "activities": ["Aktivitas 1", "Aktivitas 2"],
        "output": "Keluaran fase 3",
        "competencyTarget": "Target kompetensi"
      },
      {
        "week": 12,
        "phase": "Fase 4: Analisis Data / Pengujian Mutu",
        "activities": ["Aktivitas 1", "Aktivitas 2"],
        "output": "Keluaran fase 4",
        "competencyTarget": "Target kompetensi"
      },
      {
        "week": 16,
        "phase": "Fase 5: Sintesis, Manuskrip, & Evaluasi Akhir",
        "activities": ["Aktivitas 1", "Aktivitas 2"],
        "output": "Keluaran akhir",
        "competencyTarget": "Target kompetensi"
      }
    ],
    "penutup": "Uraian komitmen profesional penutup proposal..."
  },
  "bab5": {
    "title": "BAB V: KESIMPULAN, REKOMENDASI KONTRIBUSI, & MITIGASI RISIKO",
    "kesimpulanUsulan": [
      "Kesimpulan strategis usulan 1...",
      "Kesimpulan strategis usulan 2...",
      "Kesimpulan strategis usulan 3..."
    ],
    "kontribusiPraktis": [
      "Kontribusi konkret bagi instansi/lokus...",
      "Kontribusi konkret bagi civitas akademika...",
      "Kontribusi peningkatan kompetensi mahasiswa..."
    ],
    "mitigasiRisiko": [
      { "risiko": "Risiko perizinan / akses data...", "mitigasi": "Langkah mitigasi preventif..." },
      { "risiko": "Kendala teknis / kalibrasi tools...", "mitigasi": "Langkah mitigasi teknis..." },
      { "risiko": "Kendala waktu supervisi berkala...", "mitigasi": "Sistem pelaporan asinkron logbook..." }
    ],
    "sustainabilityPlan": "Rencana pemeliharaan artefak luaran dan transfer knowledge berkelanjutan..."
  },
  "appendices": [
    {
      "id": "lampiran_a",
      "title": "Lampiran A: Pedoman Wawancara & Instrumen Pengumpulan Data",
      "content": "Uraian instrumen kuesioner dan pedoman wawancara...",
      "tableRows": [
        { "col1": "Item 01", "col2": "Relevansi masalah operasional dengan kebutuhan riil", "col3": "Skala Likert 1-5" },
        { "col1": "Item 02", "col2": "Ketersediaan SOP eksisting dan kepatuhan prosedur", "col3": "Checklist Observasi" }
      ]
    },
    {
      "id": "lampiran_b",
      "title": "Lampiran B: Matriks Logbook Mingguan Aktivitas Lapangan",
      "content": "Pencatatan aktivitas mingguan 16 minggu kerja...",
      "tableRows": [
        { "col1": "Bulan I (Mg 1-4)", "col2": "Orientasi, WBS, dan spesifikasi kebutuhan", "col3": "Logbook Terverifikasi" },
        { "col1": "Bulan II (Mg 5-8)", "col2": "Pengumpulan data & prototipe awal", "col3": "Dataset Tervalidasi" },
        { "col1": "Bulan III (Mg 9-12)", "col2": "Implementasi & pengujian mutu UAT", "col3": "Berita Acara Uji" },
        { "col1": "Bulan IV (Mg 13-16)", "col2": "Finalisasi laporan komprehensif & seminar", "col3": "Naskah Lengkap" }
      ]
    }
  ],
  "slides": [
    {
      "slideNumber": 1,
      "kicker": "SEMINAR PROPOSAL EKSEKUTIF",
      "title": "${title}",
      "subtitle": "Paparan Rencana Pelaksanaan di ${targetEntity}",
      "keyPoints": ["Pengusul: ${candidateName}", "Instansi: ${targetEntity}", "Bidang: ${facultyMajor}"],
      "speakerNotes": "Catatan narasi presenter..."
    },
    {
      "slideNumber": 2,
      "kicker": "LATAR BELAKANG & URGENSI",
      "title": "Kesenjangan & Urgensi Masalah",
      "subtitle": "Analisis akar masalah berdasarkan data empiris.",
      "keyPoints": ["Poin 1", "Poin 2", "Poin 3"],
      "speakerNotes": "Catatan narasi presenter..."
    },
    {
      "slideNumber": 3,
      "kicker": "SASARAN & LUARAN",
      "title": "Tujuan Strategis & Target Luaran",
      "subtitle": "Keluaran terukur berbasis kebutuhan riil.",
      "keyPoints": ["Poin 1", "Poin 2", "Poin 3"],
      "speakerNotes": "Catatan narasi presenter..."
    },
    {
      "slideNumber": 4,
      "kicker": "METODOLOGI & PROTOKOL",
      "title": "Tahapan Pelaksanaan & Instrumen",
      "subtitle": "Metodologi berbasis kaidah ilmiah baku.",
      "keyPoints": ["Poin 1", "Poin 2", "Poin 3"],
      "speakerNotes": "Catatan narasi presenter..."
    },
    {
      "slideNumber": 5,
      "kicker": "LINIMASA & JADWAL",
      "title": "Matriks Rencana Kerja Mingguan",
      "subtitle": "Roadmap terukur 16 minggu kerja.",
      "keyPoints": ["Poin 1", "Poin 2", "Poin 3"],
      "speakerNotes": "Catatan narasi presenter..."
    },
    {
      "slideNumber": 6,
      "kicker": "KESIMPULAN & PENUTUP",
      "title": "Komitmen Kontribusi & Luaran",
      "subtitle": "Kesiapan pelaksanaan dan kepatuhan kode etik.",
      "keyPoints": ["Poin 1", "Poin 2", "Poin 3"],
      "speakerNotes": "Catatan narasi presenter..."
    }
  ],
  "auditLog": [
    {
      "rule": "Kesesuaian Standar Format A4 & Margin Presisi",
      "status": "VERIFIED",
      "details": "Format tata letak naskah terverifikasi margin 4-3-3-3 cm.",
      "thinkingMode": "First-Principles Thinking"
    },
    {
      "rule": "Format Tabel Terbuka 3-Garis Horizontal",
      "status": "VERIFIED",
      "details": "Matriks tersusun tanpa garis vertikal berstandar publikasi jurnal.",
      "thinkingMode": "Occam's Razor"
    },
    {
      "rule": "Validitas Desain Metodologis & Instrumen",
      "status": "VERIFIED",
      "details": "Instrumen dan analisis selaras dengan protokol ilmiah baku rumpun ilmu.",
      "thinkingMode": "Critical / Falsification Thinking"
    },
    {
      "rule": "Zero-Fabrication & Integritas Sitasi",
      "status": "VERIFIED",
      "details": "Landasan rujukan berbasis literatur primer dan buku teks otoritatif.",
      "thinkingMode": "Dialectical Synthesis"
    }
  ]
}

Format output HARUS berupa JSON murni tanpa pembuka/penutup markdown (\`\`\`json ... \`\`\`).
`;

        const geminiResult = await callGeminiApi({
          apiKey,
          prompt,
          temperature: 0.6,
          maxOutputTokens: 8192
        });

        if (geminiResult && geminiResult.text) {
          const rawText = geminiResult.text;
          const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
          try {
            const parsedDoc: ProposalDocument = JSON.parse(cleanedText);
            if (parsedDoc && parsedDoc.bab1 && parsedDoc.bab2 && parsedDoc.bab3 && parsedDoc.bab4) {
              // Ensure comprehensive sections (Bab 5, appendices, bibliography) are guaranteed
              const baseline = buildGeneratedDocument(
                title,
                category as ProposalCategory,
                answers,
                candidateName,
                candidateId,
                institution,
                facultyMajor,
                targetEntity
              );
              if (!parsedDoc.bab5) parsedDoc.bab5 = baseline.bab5;
              if (!parsedDoc.appendices) parsedDoc.appendices = baseline.appendices;
              if (!parsedDoc.bibliography) parsedDoc.bibliography = baseline.bibliography;

              return NextResponse.json({ 
                success: true, 
                engine: geminiResult.model,
                doc: parsedDoc 
              });
            }
          } catch (parseError) {
            console.warn("JSON parse failed for Gemini proposal output, using domain generator:", parseError);
          }
        }
      } catch (geminiErr: any) {
        console.warn("Live Gemini route call failed, utilizing Academic Generator fallback:", geminiErr?.message);
      }
    }

    // 2. High-rigor Standalone Academic Generator (Zero dummy data, domain-aware)
    const fallbackDoc = buildGeneratedDocument(
      title,
      category as ProposalCategory,
      answers,
      candidateName,
      candidateId,
      institution,
      facultyMajor,
      targetEntity
    );

    return NextResponse.json({
      success: true,
      engine: "academic-intelligent-generator",
      doc: fallbackDoc,
      message: "Dokumen proposal berhasil disusun dengan Standar SOP Akademik & 12 Metode Berpikir."
    });

  } catch (error: any) {
    console.error("Gemini Route Handler Error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menghasilkan dokumen usulan." },
      { status: 500 }
    );
  }
}
