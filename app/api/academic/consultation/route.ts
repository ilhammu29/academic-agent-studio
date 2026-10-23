import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userQuery = (body.userQuery || body.message || body.prompt || "").trim();
    const messages = body.messages || body.history || [];
    const fieldDetails = body.fieldDetails || body.context || {};
    const mode = body.mode || "conversational";

    const customKey = req.headers.get("x-gemini-key");
    const apiKey = customKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

    const targetEntity = fieldDetails.targetEntity || fieldDetails.entity || "";
    const major = fieldDetails.major || fieldDetails.programStudi || "";
    const currentDuties = fieldDetails.currentDuties || "";
    const rawIdea = fieldDetails.rawIdea || fieldDetails.currentTitle || "";
    const category = fieldDetails.category || "magang";

    // 1. Live Gemini 3.5 Flash Lite Call
    if (apiKey) {
      try {
        let systemPrompt = `
Bertindaklah sebagai "Dr. Bimbingan AI", seorang Dosen Pembimbing Akademik Senior merangkap Lead Industrial Mentor dengan pengalaman 15+ tahun.
Karakter Anda:
- Sangat berempati pada mahasiswa yang bingung, stres, atau belum menemukan masalah di tempat magang/risetnya.
- Berbicara dengan bahasa Indonesia yang hangat, profesional, suportif, terstruktur, dan tidak bertele-tele (no AI slop).
- Mampu membedah rutinitas harian yang tampak biasa (misal: "cuma disuruh rekap excel", "cuma jaga loket", "cuma disuruh input data") menjadi RUMUSAN MASALAH AKADEMIK BERBOBOT dan ALUR KERJA ELEGAN yang disukai dosen penguji dan mentor kantor.

Konteks Pengguna:
- Kategori: ${category} (magang / skripsi / riset)
- Instansi/Tempat: "${targetEntity || 'Belum ditentukan'}"
- Program Studi: "${major || 'Umum'}"
- Tugas/Aktivitas di Lapangan: "${currentDuties || 'Belum dijelaskan'}"
- Ide Kasar/Judul Awal: "${rawIdea || 'Belum ada'}"
`;

        let promptContent = "";

        if (mode === "discover_problem") {
          promptContent = `
Pengguna bingung menemukan masalah di tempat magang/riset:
- Lokus/Instansi: ${targetEntity}
- Jurusan: ${major}
- Aktivitas/Tugas yang diamati: ${currentDuties}

Tugas Anda:
1. Identifikasi 3 Akar Masalah Nyata (Real-world Pain Points) yang paling sering terjadi di instansi tersebut yang sesuai dengan bidang ${major}.
2. Untuk setiap masalah, berikan:
   a. Mengapa ini penting (Urgensi)
   b. Solusi/Intervensi yang realistis diselesaikan mahasiswa dalam waktu 3-6 bulan
   c. Rekomendasi 1 Judul Proposal yang formal dan tajam
   d. Alur kerja singkat (Tahap 1 s.d. 4)
3. Berikan saran taktis bagaimana mahasiswa bisa membicarakan ini dengan mentor/dosen agar langsung disetujui.

Format jawaban harus rapi dengan heading, bullet points, dan bahasa bersahabat.
Sertakan di bagian akhir satu format JSON terpisah bertanda:
\`\`\`consultation_card
{
  "recommendedTitle": "Judul terbaik yang paling realistis...",
  "targetEntity": "${targetEntity || 'Instansi Terkait'}",
  "coreProblem": "Rumusan masalah 1 kalimat tajam...",
  "proposedSolution": "Metode atau intervensi solusi...",
  "flowSteps": [
    "Fase 1: Orientasi & ekstraksi data...",
    "Fase 2: Perancangan instrumen/modul...",
    "Fase 3: Implementasi & uji coba...",
    "Fase 4: Evaluasi & SOP laporan..."
  ],
  "category": "${category}"
}
\`\`\`
`;
        } else if (mode === "sharpen_flow") {
          promptContent = `
Pengguna sudah punya judul/ide kasar, tapi BINGUNG DENGAN ALUR & METODOLOGINYA:
- Judul/Ide: "${rawIdea || userQuery}"
- Instansi: "${targetEntity}"
- Jurusan: "${major}"

Tugas Anda:
1. Bedah dan Pertajam Judul ini agar tidak bias atau dinilai terlalu dangkal oleh Dosen Penguji.
2. Jelaskan Peta Alur Metodologi Step-by-Step (Roadmap Eksekusi) dari A sampai Z secara logis dan runtut.
3. Sebutkan Data/Alat/Instrumen apa saja yang wajib disiapkan mahasiswa.
4. Sebutkan 2 Potensi Red Flags (Jebakan yang sering ditanyakan penguji) dan cara menjawabnya.

Format jawaban harus rapi dengan heading, bullet points, dan bahasa suportif.
Sertakan di bagian akhir format JSON terpisah bertanda:
\`\`\`consultation_card
{
  "recommendedTitle": "Judul yang telah dipertajam...",
  "targetEntity": "${targetEntity || 'Instansi Terkait'}",
  "coreProblem": "Akar masalah inti yang diselesaikan...",
  "proposedSolution": "Metode atau alur kerja terpilih...",
  "flowSteps": [
    "Tahap 1: Pengumpulan baseline data & studi pustaka...",
    "Tahap 2: Pemodelan / Perancangan sistem...",
    "Tahap 3: Uji validasi & evaluasi kinerja...",
    "Tahap 4: Diseminasi & naskah final..."
  ],
  "category": "${category}"
}
\`\`\`
`;
        } else {
          // Interactive Chat Mode
          const conversationHistory = messages.map((m: any) => `${m.role === 'user' ? 'Mahasiswa' : 'Dr. Bimbingan'}: ${m.content}`).join("\n");
          promptContent = `
Berikut adalah riwayat konsultasi sebelumnya:
${conversationHistory || "(Percakapan baru)"}

Pertanyaan/keluhan/ide terbaru dari Mahasiswa:
"${userQuery}"

Tugas Anda:
1. Berikan tanggapan yang hangat, suportif, berbobot akademis, dan langsung menjawab inti kebingungan mahasiswa.
2. Analisis potensi masalah, kebaruan (novelty), serta saran metodologi dan alur kerja yang realistis.
3. Selalu formulasikan 1 usulan judul terbaik yang telah disempurnakan berdasarkan topik pembicaraan ini di dalam blok kartu JSON persis seperti format berikut:
\`\`\`consultation_card
{
  "recommendedTitle": "Judul proposal formal, tajam, dan tidak klise...",
  "targetEntity": "${targetEntity || 'Instansi Terkait'}",
  "coreProblem": "Rumusan masalah 1 kalimat tajam...",
  "proposedSolution": "Solusi atau metodologi yang disarankan...",
  "flowSteps": [
    "Fase 1: Studi pendahuluan & identifikasi gap...",
    "Fase 2: Perancangan instrumen ukur / arsitektur solusi...",
    "Fase 3: Implementasi & uji coba pada subjek...",
    "Fase 4: Evaluasi metrik keberhasilan & pelaporan..."
  ],
  "category": "${category}"
}
\`\`\`
`;
        }

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `${systemPrompt}\n\n${promptContent}` }] }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2500,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          
          // Extract card if present
          let cardData = null;
          const cardMatch = replyText.match(/```consultation_card\s*([\s\S]*?)\s*```/);
          if (cardMatch && cardMatch[1]) {
            try {
              cardData = JSON.parse(cardMatch[1]);
            } catch (e) {
              console.warn("Could not parse consultation card JSON:", e);
            }
          }

          // Clean reply text of raw card block for clean chat UI
          const cleanReply = replyText.replace(/```consultation_card[\s\S]*?```/g, "").trim();

          return NextResponse.json({
            success: true,
            engine: "gemini-3.5-flash-lite",
            reply: cleanReply,
            card: cardData
          });
        }
      } catch (geminiErr: any) {
        console.warn("Consultation route Gemini error, using heuristic mentor fallback:", geminiErr?.message);
      }
    }

    // 2. Intelligent Heuristic Academic Mentor Fallback
    const ent = targetEntity || "Instansi Mitra / Lokus Penelitian";
    const maj = major || "Program Studi Anda";
    
    let fallbackReply = "";
    let fallbackCard = null;

    if (mode === "discover_problem") {
      fallbackReply = `Halo! Sangat wajar jika Anda bingung menentukan masalah di awal penempatan di ${ent}. Banyak mahasiswa mengira masalah harus berupa kerusakan besar, padahal di dunia profesional, ketidakefisienan proses harian justru merupakan sumber judul yang paling diapresiasi.

Berdasarkan bidang ${maj} di ${ent}, berikut 3 celah masalah riil yang dapat Anda angkat:

1. **Inefisiensi Alur Kerja Manual & Redundansi Pencatatan**
   - **Kondisi**: Proses pengolahan data atau koordinasi masih mengandalkan rekapitulasi bertingkat sehingga rawan selisih dan memakan waktu kerja berlebih.
   - **Solusi Realistis**: Standardisasi SOP berbasis matriks alur digital atau otomasi pipeline data sederhana.
   - **Rekomendasi Judul**: *"Analisis Efisiensi Alur Kerja Operasional dan Usulan Otomasi Pelaporan pada ${ent}"*.

2. **Ketiadaan Metrik Evaluasi Kinerja / Monitoring Berkala**
   - **Kondisi**: Pimpinan unit kerja belum memiliki dashboard atau visualisasi metrik performa secara berkala (real-time).
   - **Solusi Realistis**: Perancangan instrumen Key Performance Indicators (KPI) dan dashboard monitoring berbasis visual.
   - **Rekomendasi Judul**: *"Perancangan Sistem Monitoring Indikator Kinerja Utama (KPI) Berbasis Data pada ${ent}"*.

3. **Kesenjangan Kepatuhan Prosedur terhadap Standar Mutu**
   - **Kondisi**: Belum adanya audit kepatuhan atau evaluasi kepuasan pengguna terhadap layanan internal.
   - **Solusi Realistis**: Survei evaluasi berkala menggunakan kuesioner terstandar dan analisis faktor determinan.
   - **Rekomendasi Judul**: *"Evaluasi Kualitas Layanan Operasional Menggunakan Pendekatan Analisis Kesenjangan (Gap Analysis) pada ${ent}"*.

💡 **Tips Bimbingan**: Diskusikan opsi nomor 1 atau 2 dengan mentor lapangan Anda. Sampaikan: *"Pak/Bu, saya melihat bagian rekapitulasi ini menyita waktu, bolehkah saya bantu buatkan sistematisasinya untuk laporan magang/skripsi saya?"*`;

      fallbackCard = {
        recommendedTitle: `Analisis Efisiensi Alur Kerja Operasional dan Usulan Perbaikan Berbasis Data pada ${ent}`,
        targetEntity: ent,
        coreProblem: `Inefisiensi waktu kerja dan risiko kesalahan akibat alur proses manual di ${ent}.`,
        proposedSolution: "Penyusunan blueprint alur kerja terstandar, eliminasi redundansi proses, dan perancangan modul pelaporan terstruktur.",
        flowSteps: [
          "Fase 1: Observasi lapangan, pemetaan alur eksisting, dan wawancara mentor",
          "Fase 2: Identifikasi titik botol (bottleneck) dan perancangan desain perbaikan",
          "Fase 3: Implementasi modul perbaikan dan uji coba fungsional skala terbatas",
          "Fase 4: Evaluasi selisih efisiensi, penyusunan SOP baru, dan finalisasi laporan"
        ],
        category: category
      };
    } else {
      const topic = rawIdea || userQuery || "Usulan Proyek Magang & Riset";
      fallbackReply = `Ide topik Anda mengenai **"${topic}"** di ${ent} sebenarnya sangat potensial dan relevan!

Mari kita bedah agar alur berpikirnya runut dari awal sampai akhir:

### 1. Titik Tolak (Problem Statement)
Jangan langsung melompat ke alat atau tools. Jelaskan dulu apa kendala nyata yang dialami ${ent}: Apakah prosesnya lambat? Apakah datanya tidak akurat? Atau apakah keputusannya masih spekulatif?

### 2. Peta Alur Pelaksanaan (Roadmap 4 Fase)
- **Tahap 1 (Inisiasi & Masukan)**: Mengumpulkan data historis, regulasi internal, dan studi pustaka terakreditasi terkait topik.
- **Tahap 2 (Perancangan & Pemodelan)**: Merumuskan instrumen ukur, diagram alur sistem, atau rancangan intervensi metodologis.
- **Tahap 3 (Eksekusi & Uji Coba)**: Menerapkan metode pada data lapangan dan mencatat metrik perbaikan.
- **Tahap 4 (Evaluasi & Rekomendasi)**: Membandingkan kondisi sebelum vs sesudah intervensi serta merumuskan saran bagi instansi.

### ⚠️ Waspadai Jebakan Dosen Penguji (Red Flags)
- Penguji sering bertanya: *"Kenapa memilih metode ini, bukan metode lain yang lebih sederhana?"*
- **Jawaban**: Siapkan komparasi bahwa metode yang Anda pilih paling sesuai dengan ketersediaan data dan rentang waktu pelaksanaan di ${ent}.`;

      fallbackCard = {
        recommendedTitle: `Implementasi dan Analisis Kinerja ${topic} pada ${ent}`,
        targetEntity: ent,
        coreProblem: `Tantangan operasional dan perlunya optimalisasi berbasis metodologi teruji pada ${ent}.`,
        proposedSolution: "Penerapan model terstruktur berfase dengan pengujian metrik empiris dan verifikasi mentor.",
        flowSteps: [
          "Tahap 1: Studi literatur, pengumpulan data dasar, dan perizinan instansi",
          "Tahap 2: Perancangan arsitektur pemecahan masalah dan instrumen ukur",
          "Tahap 3: Implementasi bertahap dan pengujian akurasi/efektivitas",
          "Tahap 4: Evaluasi komparatif, penyusunan laporan, dan pengesahan"
        ],
        category: category
      };
    }

    return NextResponse.json({
      success: true,
      engine: "academic-mentor-heuristic",
      reply: fallbackReply,
      card: fallbackCard
    });

  } catch (error: any) {
    console.error("Consultation API error:", error);
    return NextResponse.json({
      success: false,
      message: "Gagal memproses sesi konsultasi: " + (error?.message || "Unknown error")
    }, { status: 500 });
  }
}
