import { getRequestAiKey } from "@/lib/serverAiConfig";
import { NextResponse } from "next/server";
import { DiagnosticQuestion, ProposalCategory } from "@/types/studio";
import { callGeminiApi } from "@/lib/geminiApi";

function detectDomain(title: string, category: string, entity: string): "health" | "education" | "law" | "business" | "agriculture" | "tech" {
  const t = (title + " " + entity).toLowerCase();
  
  if (t.match(/obesitas|stunting|gizi|darah|pasien|klinik|puskesmas|rumah sakit|hipertensi|farmasi|obat|medis|nutrisi|epidemiologi|imunisasi|posyandu|perawat|keperawatan|kebidanan|kardiovaskular|diabetes/i)) {
    return "health";
  }
  if (t.match(/pembelajaran|siswa|guru|sekolah|kelas|kurikulum|madrasah|pesantren|didik|edukasi|prestasi belajar|modul ajar|remedial|smk|smp|sma|sd/i)) {
    return "education";
  }
  if (t.match(/hukum|pidana|perdata|hak cipta|undang-undang|uu |pengadilan|jaksa|advokat|kejaksaan|konstitusi|kpk|perkara|yuridis|putusan/i)) {
    return "law";
  }
  if (t.match(/keuangan|saham|laba|investasi|bank|perbankan|akuntansi|pajak|portofolio|ojk|bursa|manajemen|marketing|pemasaran|profit|umkm|audit/i)) {
    return "business";
  }
  if (t.match(/pertanian|tanaman|panen|pangan|tanah|pupuk|irigasi|hama|agro|kehutanan|peternakan|hortikultura|kelapa sawit|padi/i)) {
    return "agriculture";
  }
  return "tech";
}

function getFallbackAnswers(domain: string, title: string, category: string, targetEntity: string): Record<string, string> {
  const isMagang = category === "magang";

  if (domain === "health") {
    return {
      targetDepartment: isMagang 
        ? `Unit Pelayanan Gizi Klinis & Promosi Kesehatan (Promkes) di ${targetEntity || "Instansi Kesehatan Terkait"}`
        : `Populasi remaja/subjek sasaran di lingkungan ${targetEntity || "Puskesmas / Wilayah Kerja Terkait"}`,
      problemStatement: `Tingginya prevalensi gangguan status nutrisi dan minimnya intervensi berbasis data biomarker kuantitatif serta pola konsumsi harian yang terstandar, sehingga deteksi dini faktor risiko sering terlambat teridentifikasi.`,
      toolsSkillset: `Timbangan digital Bioelectrical Impedance Analysis (BIA), Microtoise ketelitian 0,1 cm, kuesioner Semi-Quantitative Food Frequency Questionnaire (SQ-FFQ), IPAQ-SF (skor MET), software WHO AnthroPlus, dan analisis biostatistika SPSS (Chi-Square & Regresi Logistik Biner).`,
      deliverables: `Laporan epidemiologi komprehensif berstandar STROBE, pemodelan multivariat risiko (Odds Ratio & 95% CI), modul intervensi edukasi gizi praktis, dan draf manuskrip publikasi jurnal ilmiah terakreditasi SINTA.`
    };
  }

  if (domain === "education") {
    return {
      targetDepartment: `Divisi Kurikulum, Tenaga Kependidikan, & Evaluasi Pembelajaran di ${targetEntity || "Satuan Pendidikan Terkait"}`,
      problemStatement: `Rendahnya daya serap materi dan keterlibatan aktif peserta didik akibat pendekatan instruksional konvensional satu arah, serta belum adanya instrumen asesmen diagnostik formatif yang adaptif.`,
      toolsSkillset: `Model pengembangan ADDIE / 4D, instrumen pre-test & post-test tervalidasi Aiken's V, uji reliabilitas Cronbach's Alpha, analisis uji N-Gain ternormalisasi, dan media pembelajaran interaktif berbasis kognitif.`,
      deliverables: `Paket modul ajar kurikulum terintegrasi, lembar kerja siswa (LKPD) berbasis inquiry, dokumen laporan efektivitas gain belajar, serta pedoman implementasi bagi dewan guru.`
    };
  }

  if (domain === "law") {
    return {
      targetDepartment: `Bagian Hukum, Perancangan Perundang-Undangan, & Bantuan Advokasi di ${targetEntity || "Lembaga Terkait"}`,
      problemStatement: `Timbulnya kekosongan hukum (*rechtsvacuum*) dan ambiguitas interpretasi regulasi sektoral terhadap dinamika kasus kontemporer, yang berdampak pada ketidakpastian perlindungan hak subjek hukum.`,
      toolsSkillset: `Metode penelitian hukum normatif-empiris, pendekatan perundang-undangan (*statute approach*), pendekatan konseptual (*conceptual approach*), penelusuran bahan hukum primer/sekunder, dan analisis hermeneutika yuridis.`,
      deliverables: `Naskah *Legal Opinion* / anotasi putusan mendalam, matriks harmonisasi norma hukum, naskah akademik rekomendasi kebijakan regulasi, dan draf artikel jurnal hukum.`
    };
  }

  if (domain === "business") {
    return {
      targetDepartment: `Departemen Analisis Risiko Keuangan, Akuntansi, & Pengendalian Internal di ${targetEntity || "Perusahaan Terkait"}`,
      problemStatement: `Volatilitas likuiditas dan inefisiensi alokasi modal kerja yang belum termodelkan secara prediktif, mengakibatkan deviasi performa terhadap target solvabilitas dan profitabilitas.`,
      toolsSkillset: `Rasio profitabilitas (ROA, ROE), Altman Z-Score, model regresi data panel (EViews / STATA), analisis uji asumsi klasik, dan visualisasi performa finansial Power BI / Excel Modeling.`,
      deliverables: `Executive Financial Dashboard, laporan audit risiko dan solvabilitas berkala, rekomendasi mitigasi rasio modal kerja, serta ringkasan kebijakan manajerial.`
    };
  }

  if (domain === "agriculture") {
    return {
      targetDepartment: `Unit Riset Agronomi, Manajemen Kesuburan Tanah, & Proteksi Tanaman di ${targetEntity || "Balai / Kebun Terkait"}`,
      problemStatement: `Fluktuasi produktivitas panen akibat degradasi nutrisi tanah dan serangan organisme pengganggu tanaman (OPT) yang belum dimitigasi secara presisi.`,
      toolsSkillset: `Rancangan Acak Kelompok (RAK) faktorial, uji Duncan / BNJ, analisis klorofil SPAD-502, sensor kelembapan tanah, dan uji efikasi agronomis.`,
      deliverables: `SOP manajemen nutrisi spesifik lokasi, peta kesuburan petak uji, dokumen rekomendasi pengendalian OPT terpadu, dan naskah publikasi agronomi.`
    };
  }

  // Default Tech / Engineering
  return {
    targetDepartment: isMagang 
      ? `Divisi Rekayasa Perangkat Lunak & Sistem Cerdas di ${targetEntity || "PT Perusahaan Teknologi"}`
      : `Laboratorium Rekayasa Perangkat Lunak & Sistem Komputasi`,
    problemStatement: `Inefisiensi alur pemrosesan data manual serta tingginya latensi pada sistem eksisting yang menghambat kecepatan pengambilan keputusan operasional.`,
    toolsSkillset: `Arsitektur microservices, REST API / gRPC, automated testing (Jest / PyTest), version control Git, Docker containerization, dan CI/CD pipeline.`,
    deliverables: `Repositori kode sumber terdokumentasi rapi, modul layanan terintegrasi dengan unit test cakupan >80%, dokumen Software Requirements Specification (SRS), dan panduan instalasi sistem.`
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const title = (body.title || "").trim();
    const category: ProposalCategory = body.category || "magang";
    const targetEntity = (body.targetEntity || "").trim();
    const questions: DiagnosticQuestion[] = body.questions || [];

    if (!title) {
      return NextResponse.json({ error: "Judul harus diisi." }, { status: 400 });
    }

    const domain = detectDomain(title, category, targetEntity);
    const apiKey = getRequestAiKey(req);

    if (apiKey) {
      try {
        const questionPrompts = questions.length > 0 
          ? questions.map((q, i) => `${i + 1}. [Field: "${q.field}"] Pertanyaan: "${q.question}"`).join("\n")
          : `1. [Field: "targetDepartment"] Divisi/populasi sasaran
2. [Field: "problemStatement"] Masalah kesenjangan utama
3. [Field: "toolsSkillset"] Metodologi, alat ukur/instrumen
4. [Field: "deliverables"] Luaran nyata`;

        const prompt = `
Bertindaklah sebagai Senior Academic Reviewer & Methodologist Sidang Skripsi/Magang.
Seorang mahasiswa/peneliti mengajukan proposal dengan informasi:
- Judul: "${title}"
- Kategori Usulan: "${category}" (magang / skripsi / penelitian)
- Instansi/Lokus Sasaran: "${targetEntity || "Instansi / Lembaga Mitra"}"
- Rumpun Bidang Terdeteksi: "${domain.toUpperCase()}"

PENTING & KRUSIAL:
Jawaban wawancara HARUS 100% DISESUAIKAN DENGAN RUMPUN ILMU:
- Jika KESEHATAN / GIZI / MEDIS (contoh: Obesitas, Stunting, Penyakit): WAJIB gunakan unit klinis/puskesmas/posyandu, antropometri (IMT/U, Microtoise, BIA), kuesioner SQ-FFQ / recall 24 jam, biostatistika (SPSS, Chi-Square, Odds Ratio), artikel publikasi SINTA/Scopus. DILARANG KERAS menggunakan istilah IT seperti "Python, Docker, database, microservice, github"!
- Jika PENDIDIKAN: Gunakan sekolah, guru, kelas, kurikulum, tes kognitif, Aiken's V, N-Gain. JANGAN gunakan istilah IT kecuali jika judulnya eksplisit tentang software pembelajaran.
- Jika HUKUM: Gunakan pengadilan, norma yuridis, perundang-undangan, pendekatan statute.
- Jika BISNIS: Gunakan rasio keuangan, ROA, audited report, EViews.
- Jika TEKNIK/IT: Gunakan rekayasa perangkat lunak, sistem, infrastruktur.

Berikan saran awal untuk setiap field yang tercantum. Jangan mengarang fakta lapangan, hasil, data, atau persetujuan; tandai detail yang belum diketahui untuk dikonfirmasi pengguna:
${questionPrompts}

Format balasan HARUS JSON VALID tanpa markdown. Gunakan tepat nama field yang tertera pada setiap pertanyaan, tanpa menambah field lain:
{ "answers": { "nama_field_pertanyaan": "saran jawaban yang perlu dikonfirmasi" } }
`;

        const geminiResult = await callGeminiApi({
          apiKey,
          prompt,
          temperature: 0.5,
          maxOutputTokens: 2048,
        });

        if (geminiResult && geminiResult.text) {
          const rawText = geminiResult.text;
          const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleanJson);
          if (parsed.answers && typeof parsed.answers === "object") {
            return NextResponse.json({
              success: true,
              engine: geminiResult.model,
              domain,
              answers: parsed.answers
            });
          }
        }
      } catch (geminiError: any) {
        console.warn("Gemini auto-answers failed, activating smart domain fallback:", geminiError?.message);
      }
    }

    // Smart Domain-Aware Fallback
    const fallbackAnswers = questions.length > 0
      ? Object.fromEntries(questions.filter(q => q.field && q.aiSuggestion).map(q => [q.field, q.aiSuggestion]))
      : getFallbackAnswers(domain, title, category, targetEntity);
    return NextResponse.json({
      success: true,
      engine: "domain-heuristics",
      domain,
      answers: fallbackAnswers
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || "Gagal menghasilkan jawaban otomatis wawancara."
    }, { status: 500 });
  }
}
