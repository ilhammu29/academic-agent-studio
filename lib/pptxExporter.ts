import { ProposalDocument } from "@/types/studio";

/**
 * Academic Executive Presentation .PPTX Exporter
 * Standar OilUI & RyuxDesign:
 * - Rasio Layar: Widescreen 16:9
 * - Palet: Hitam Doff (#0D111A), Permukaan Kartu (#141B28), Putih Susu (#F8FAFC), Aksen Electric Cyan (#00A3FF), Champagne (#D4B996)
 * - Tipografi: Sans-serif modern (Plus Jakarta Sans / Arial)
 * - Format: Card Containers, Data-Driven Visuals, Speaker Notes terintegrasi
 */

export async function generateAcademicProposalPptx(doc: ProposalDocument): Promise<void> {
  const pptxModule = await import("pptxgenjs");
  const pptxgen = (pptxModule as any).default || pptxModule;
  const pptx = new pptxgen();

  // Set 16:9 widescreen layout
  pptx.layout = "LAYOUT_16x9";
  pptx.author = doc.candidateName;
  pptx.company = doc.institution;
  pptx.title = doc.title;

  // Color Tokens
  const BG_COLOR = "090D15";
  const CARD_BG = "121824";
  const CARD_BORDER = "1E283A";
  const TEXT_WHITE = "F8FAFC";
  const TEXT_MUTED = "94A3B8";
  const TEXT_DIM = "64748B";
  const ACCENT_CYAN = "00A3FF";
  const ACCENT_CHAMPAGNE = "D4B996";

  const FONT_PRIMARY = "Arial"; // Universally supported in MS PowerPoint, LibreOffice, Google Slides

  // ----------------------------------------------------
  // SLIDE 1: COVER PRESENTASI EKSEKUTIF
  // ----------------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_COLOR };

    // Decorative ambient glow bar top
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: "100%",
      h: 0.08,
      fill: { color: ACCENT_CYAN },
    });

    // Badge Pill Kategori
    const categoryLabel =
      doc.category === "magang"
        ? "PROPOSAL MAGANG INDUSTRI & RISET TERAPAN"
        : "SEMINAR PROPOSAL PENELITIAN SKRIPSI";

    slide.addText(categoryLabel, {
      x: 0.8,
      y: 0.9,
      w: 8.0,
      h: 0.4,
      fontFace: FONT_PRIMARY,
      fontSize: 10,
      bold: true,
      color: ACCENT_CYAN,
      charSpacing: 2,
    });

    // Judul Proposal
    slide.addText(doc.title, {
      x: 0.8,
      y: 1.4,
      w: 11.5,
      h: 2.2,
      fontFace: FONT_PRIMARY,
      fontSize: 26,
      bold: true,
      color: TEXT_WHITE,
      valign: "top",
    });

    // Subtitle Container Card
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 3.8,
      w: 11.7,
      h: 2.6,
      rectRadius: 0.1,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1 },
    });

    // Column Left: Identity
    slide.addText("PENGUSUL / KANDIDAT", {
      x: 1.1,
      y: 4.1,
      w: 4.0,
      h: 0.3,
      fontSize: 9,
      bold: true,
      color: TEXT_DIM,
      fontFace: FONT_PRIMARY,
    });
    slide.addText(`${doc.candidateName}\nNIM: ${doc.candidateId}\n${doc.facultyMajor}`, {
      x: 1.1,
      y: 4.4,
      w: 4.5,
      h: 1.5,
      fontSize: 13,
      bold: true,
      color: TEXT_WHITE,
      fontFace: FONT_PRIMARY,
    });

    // Column Center: Institution
    slide.addText("PERGURUAN TINGGI", {
      x: 5.8,
      y: 4.1,
      w: 3.5,
      h: 0.3,
      fontSize: 9,
      bold: true,
      color: TEXT_DIM,
      fontFace: FONT_PRIMARY,
    });
    slide.addText(`${doc.institution}\nUnit Akademik & Riset Terapan\nTahun Sidang: 2026`, {
      x: 5.8,
      y: 4.4,
      w: 3.5,
      h: 1.5,
      fontSize: 13,
      bold: true,
      color: TEXT_MUTED,
      fontFace: FONT_PRIMARY,
    });

    // Column Right: Target Entity
    slide.addText("INSTANSI MITRA / TARGET", {
      x: 9.2,
      y: 4.1,
      w: 3.0,
      h: 0.3,
      fontSize: 9,
      bold: true,
      color: TEXT_DIM,
      fontFace: FONT_PRIMARY,
    });
    slide.addText(`${doc.targetEntity}\nUnit: ${doc.targetDepartment}\nDurasi: ${doc.durationMonths} Bulan Penuh`, {
      x: 9.2,
      y: 4.4,
      w: 3.0,
      h: 1.5,
      fontSize: 13,
      bold: true,
      color: ACCENT_CHAMPAGNE,
      fontFace: FONT_PRIMARY,
    });

    // Speaker Notes
    slide.addNotes(
      `Selamat pagi/siang Dewan Penguji yang terhormat. Pada kesempatan ini saya memaparkan usulan proposal dengan judul "${doc.title}" yang dirancang dengan standar rigoritas metodologis tinggi.`
    );
  }

  // ----------------------------------------------------
  // SLIDE 2: LATAR BELAKANG & PROBLEM STATEMENT
  // ----------------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_COLOR };

    slide.addText("BAB I: PENDAHULUAN & URGENSI", {
      x: 0.8,
      y: 0.5,
      w: 8.0,
      h: 0.3,
      fontFace: FONT_PRIMARY,
      fontSize: 10,
      bold: true,
      color: ACCENT_CYAN,
      charSpacing: 1.5,
    });

    slide.addText("Latar Belakang & Kesenjangan Masalah (Gap)", {
      x: 0.8,
      y: 0.8,
      w: 11.5,
      h: 0.6,
      fontFace: FONT_PRIMARY,
      fontSize: 22,
      bold: true,
      color: TEXT_WHITE,
    });

    // Card 1: Urgensi Makro
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 1.7,
      w: 3.7,
      h: 4.8,
      rectRadius: 0.1,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1 },
    });
    slide.addText("01 / KONTEKS & URGENSI", {
      x: 1.0,
      y: 1.9,
      w: 3.3,
      h: 0.3,
      fontSize: 10,
      bold: true,
      color: ACCENT_CYAN,
      fontFace: FONT_PRIMARY,
    });
    slide.addText(
      doc.bab1.latarBelakang[0] ||
        "Tingginya ketergantungan proses operasional pada penanganan data manual yang rentan terhadap inefisiensi dan risiko latensi tinggi.",
      {
        x: 1.0,
        y: 2.3,
        w: 3.3,
        h: 3.9,
        fontSize: 11,
        color: TEXT_MUTED,
        fontFace: FONT_PRIMARY,
        align: "justify",
      }
    );

    // Connector Arrow 1 -> 2
    slide.addText("➔", {
      x: 4.45,
      y: 3.8,
      w: 0.38,
      h: 0.4,
      fontSize: 14,
      bold: true,
      color: ACCENT_CYAN,
      fontFace: FONT_PRIMARY,
      align: "center",
    });

    // Card 2: Permasalahan Riil
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 4.8,
      y: 1.7,
      w: 3.7,
      h: 4.8,
      rectRadius: 0.1,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1 },
    });
    slide.addText("02 / GAP PROBLEM SPESIFIK", {
      x: 5.0,
      y: 1.9,
      w: 3.3,
      h: 0.3,
      fontSize: 10,
      bold: true,
      color: ACCENT_CHAMPAGNE,
      fontFace: FONT_PRIMARY,
    });
    slide.addText(
      doc.bab1.latarBelakang[1] ||
        "Belum tersedianya arsitektur otomatisasi pipeline terstandarisasi yang mampu menyelaraskan validasi sistematis dan observabilitas menyeluruh.",
      {
        x: 5.0,
        y: 2.3,
        w: 3.3,
        h: 3.9,
        fontSize: 11,
        color: TEXT_MUTED,
        fontFace: FONT_PRIMARY,
        align: "justify",
      }
    );

    // Connector Arrow 2 -> 3
    slide.addText("➔", {
      x: 8.45,
      y: 3.8,
      w: 0.38,
      h: 0.4,
      fontSize: 14,
      bold: true,
      color: ACCENT_CYAN,
      fontFace: FONT_PRIMARY,
      align: "center",
    });

    // Card 3: Solusi yang Diusulkan
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 8.8,
      y: 1.7,
      w: 3.7,
      h: 4.8,
      rectRadius: 0.1,
      fill: { color: CARD_BG },
      line: { color: ACCENT_CYAN, width: 1.5 },
    });
    slide.addText("03 / SOLUSI & STATE-OF-THE-ART", {
      x: 9.0,
      y: 1.9,
      w: 3.3,
      h: 0.3,
      fontSize: 10,
      bold: true,
      color: ACCENT_CYAN,
      fontFace: FONT_PRIMARY,
    });
    slide.addText(
      doc.bab1.tujuanUmum ||
        "Membangun sistem pipeline komprehensif yang memvalidasi efisiensi operasional dengan benchmarking terukur dan luaran terverifikasi.",
      {
        x: 9.0,
        y: 2.3,
        w: 3.3,
        h: 3.9,
        fontSize: 11,
        color: TEXT_WHITE,
        fontFace: FONT_PRIMARY,
        align: "justify",
      }
    );

    slide.addNotes(
      "Slide ini memaparkan piramida terbalik latar belakang: dari fenomena industri makro, bottleneck operasional nyata, hingga positioning solusi terukur yang kami usulkan."
    );
  }

  // ----------------------------------------------------
  // SLIDE 3: RUMUSAN MASALAH & TARGET LUARAN
  // ----------------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_COLOR };

    slide.addText("FOKUS PENELITIAN & CAPAIAN", {
      x: 0.8,
      y: 0.5,
      w: 8.0,
      h: 0.3,
      fontFace: FONT_PRIMARY,
      fontSize: 10,
      bold: true,
      color: ACCENT_CYAN,
      charSpacing: 1.5,
    });

    slide.addText("Rumusan Masalah & Target Deliverables", {
      x: 0.8,
      y: 0.8,
      w: 11.5,
      h: 0.6,
      fontFace: FONT_PRIMARY,
      fontSize: 22,
      bold: true,
      color: TEXT_WHITE,
    });

    // Left Column: Rumusan Masalah
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 1.7,
      w: 5.7,
      h: 4.8,
      rectRadius: 0.1,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1 },
    });
    slide.addText("RUMUSAN MASALAH UTAMA", {
      x: 1.1,
      y: 1.9,
      w: 5.1,
      h: 0.3,
      fontSize: 11,
      bold: true,
      color: ACCENT_CHAMPAGNE,
      fontFace: FONT_PRIMARY,
    });

    const rumusanItems = doc.bab1.rumusanMasalah.map((r, i) => `${i + 1}. ${r}`).join("\n\n");
    slide.addText(rumusanItems, {
      x: 1.1,
      y: 2.3,
      w: 5.1,
      h: 3.9,
      fontSize: 11,
      color: TEXT_WHITE,
      fontFace: FONT_PRIMARY,
      align: "justify",
    });

    // Right Column: Target Luaran (Deliverables)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.8,
      y: 1.7,
      w: 5.7,
      h: 4.8,
      rectRadius: 0.1,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1 },
    });
    slide.addText("TARGET CAPAIAN & LUARAN (KPI)", {
      x: 7.1,
      y: 1.9,
      w: 5.1,
      h: 0.3,
      fontSize: 11,
      bold: true,
      color: ACCENT_CYAN,
      fontFace: FONT_PRIMARY,
    });

    const outputItems = doc.bab1.tujuanKhusus.map((t, i) => `✔ ${t}`).join("\n\n");
    slide.addText(outputItems, {
      x: 7.1,
      y: 2.3,
      w: 5.1,
      h: 3.9,
      fontSize: 11,
      color: TEXT_MUTED,
      fontFace: FONT_PRIMARY,
      align: "justify",
    });
  }

  // ----------------------------------------------------
  // SLIDE 4: LANDASAN TEORI & SINTESIS PUSTAKA (PRISMA)
  // ----------------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_COLOR };

    slide.addText("BAB II: KERANGKA TEORETIS & LITERATUR", {
      x: 0.8,
      y: 0.5,
      w: 8.0,
      h: 0.3,
      fontFace: FONT_PRIMARY,
      fontSize: 10,
      bold: true,
      color: ACCENT_CYAN,
      charSpacing: 1.5,
    });

    slide.addText("Landasan Teori & Matriks Sintesis Pustaka Primer", {
      x: 0.8,
      y: 0.8,
      w: 11.5,
      h: 0.6,
      fontFace: FONT_PRIMARY,
      fontSize: 22,
      bold: true,
      color: TEXT_WHITE,
    });

    doc.bab2.landasanTeori.slice(0, 3).forEach((teori, idx) => {
      const xPos = 0.8 + idx * 4.0;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 1.7,
        w: 3.7,
        h: 4.8,
        rectRadius: 0.1,
        fill: { color: CARD_BG },
        line: { color: CARD_BORDER, width: 1 },
      });

      slide.addText(`RUJUKAN ${idx + 1}`, {
        x: xPos + 0.2,
        y: 1.9,
        w: 3.3,
        h: 0.3,
        fontSize: 9,
        bold: true,
        color: ACCENT_CYAN,
        fontFace: FONT_PRIMARY,
      });

      slide.addText(teori.topic, {
        x: xPos + 0.2,
        y: 2.2,
        w: 3.3,
        h: 0.8,
        fontSize: 12,
        bold: true,
        color: TEXT_WHITE,
        fontFace: FONT_PRIMARY,
      });

      slide.addText(teori.elaboration, {
        x: xPos + 0.2,
        y: 3.0,
        w: 3.3,
        h: 2.6,
        fontSize: 10,
        color: TEXT_MUTED,
        fontFace: FONT_PRIMARY,
        align: "justify",
      });

      slide.addText(`Sitasi: ${teori.citation}`, {
        x: xPos + 0.2,
        y: 5.7,
        w: 3.3,
        h: 0.6,
        fontSize: 9,
        color: ACCENT_CHAMPAGNE,
        fontFace: FONT_PRIMARY,
      });
    });
  }

  // ----------------------------------------------------
  // SLIDE 5: METODOLOGI PELAKSANAAN & ARSITEKTUR
  // ----------------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_COLOR };

    slide.addText("BAB III: METODOLOGI & ARSITEKTUR KERJA", {
      x: 0.8,
      y: 0.5,
      w: 8.0,
      h: 0.3,
      fontFace: FONT_PRIMARY,
      fontSize: 10,
      bold: true,
      color: ACCENT_CYAN,
      charSpacing: 1.5,
    });

    slide.addText("Desain Metodologi & Lingkup Penugasan", {
      x: 0.8,
      y: 0.8,
      w: 11.5,
      h: 0.6,
      fontFace: FONT_PRIMARY,
      fontSize: 22,
      bold: true,
      color: TEXT_WHITE,
    });

    // ----------------------------------------------------
    // GOOGLE FLOW PIPELINE VISUAL (4 TAHAPAN PROSES)
    // ----------------------------------------------------
    const flowSteps = [
      {
        no: "01",
        label: "AKUISISI DATA",
        desc: "Pengumpulan dataset & observasi lapangan",
        accent: ACCENT_CYAN,
      },
      {
        no: "02",
        label: "PIPELINE DESAIN",
        desc: "Pemodelan arsitektur & pipeline sistem",
        accent: ACCENT_CYAN,
      },
      {
        no: "03",
        label: "UJI & VALIDASI",
        desc: "Benchmarking akurasi & mitigasi eror",
        accent: ACCENT_CHAMPAGNE,
      },
      {
        no: "04",
        label: "DISEMINASI",
        desc: "Evaluasi luaran & laporan terstandarisasi",
        accent: ACCENT_CYAN,
      },
    ];

    flowSteps.forEach((step, sIdx) => {
      const cardX = 0.8 + sIdx * 3.0;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: cardX,
        y: 1.6,
        w: 2.6,
        h: 1.8,
        rectRadius: 0.08,
        fill: { color: CARD_BG },
        line: { color: step.accent, width: 1.2 },
      });

      slide.addText(`TAHAP ${step.no}`, {
        x: cardX + 0.15,
        y: 1.75,
        w: 2.3,
        h: 0.25,
        fontSize: 9,
        bold: true,
        color: step.accent,
        fontFace: FONT_PRIMARY,
      });

      slide.addText(step.label, {
        x: cardX + 0.15,
        y: 2.05,
        w: 2.3,
        h: 0.4,
        fontSize: 11,
        bold: true,
        color: TEXT_WHITE,
        fontFace: FONT_PRIMARY,
      });

      slide.addText(step.desc, {
        x: cardX + 0.15,
        y: 2.45,
        w: 2.3,
        h: 0.8,
        fontSize: 9,
        color: TEXT_MUTED,
        fontFace: FONT_PRIMARY,
      });

      // Connector Arrow between step cards
      if (sIdx < flowSteps.length - 1) {
        slide.addText("➔", {
          x: cardX + 2.58,
          y: 2.3,
          w: 0.45,
          h: 0.4,
          fontSize: 16,
          bold: true,
          color: ACCENT_CYAN,
          fontFace: FONT_PRIMARY,
          align: "center",
        });
      }
    });

    // Subcard: Lingkup Kerja
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 3.7,
      w: 5.7,
      h: 2.8,
      rectRadius: 0.1,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1 },
    });
    slide.addText("RUANG LINGKUP PENUGASAN (SCOPE)", {
      x: 1.1,
      y: 3.9,
      w: 5.1,
      h: 0.3,
      fontSize: 10,
      bold: true,
      color: ACCENT_CHAMPAGNE,
      fontFace: FONT_PRIMARY,
    });
    slide.addText(doc.bab3.lingkupPekerjaan.slice(0, 4).map((l, i) => `${i + 1}. ${l}`).join("\n"), {
      x: 1.1,
      y: 4.3,
      w: 5.1,
      h: 2.0,
      fontSize: 10,
      color: TEXT_MUTED,
      fontFace: FONT_PRIMARY,
    });

    // Subcard: Tools & Lingkungan Kerja
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.8,
      y: 3.7,
      w: 5.7,
      h: 2.8,
      rectRadius: 0.1,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1 },
    });
    slide.addText("SPESIFIKASI TOOLS & LINGKUNGAN KERJA", {
      x: 7.1,
      y: 3.9,
      w: 5.1,
      h: 0.3,
      fontSize: 10,
      bold: true,
      color: ACCENT_CYAN,
      fontFace: FONT_PRIMARY,
    });
    slide.addText(doc.bab3.perangkatTools.map((p) => `• ${p}`).join("\n"), {
      x: 7.1,
      y: 4.3,
      w: 5.1,
      h: 2.0,
      fontSize: 10,
      color: TEXT_MUTED,
      fontFace: FONT_PRIMARY,
    });
  }

  // ----------------------------------------------------
  // SLIDE 6: ROADMAP MATRIKS & KESIAPAN PERTAHANAN SIDANG
  // ----------------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_COLOR };

    slide.addText("BAB IV: LINIMASA & KESIAPAN SIDANG", {
      x: 0.8,
      y: 0.5,
      w: 8.0,
      h: 0.3,
      fontFace: FONT_PRIMARY,
      fontSize: 10,
      bold: true,
      color: ACCENT_CYAN,
      charSpacing: 1.5,
    });

    slide.addText("Roadmap Mingguan & Rencana Penyelesaian", {
      x: 0.8,
      y: 0.8,
      w: 11.5,
      h: 0.6,
      fontFace: FONT_PRIMARY,
      fontSize: 22,
      bold: true,
      color: TEXT_WHITE,
    });

    doc.bab4.jadwalMatriks.slice(0, 4).forEach((item, idx) => {
      const yPos = 1.6 + idx * 1.2;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8,
        y: yPos,
        w: 11.7,
        h: 1.05,
        rectRadius: 0.08,
        fill: { color: CARD_BG },
        line: { color: CARD_BORDER, width: 1 },
      });

      // Week Tag
      slide.addText(`MG ${item.week}`, {
        x: 1.1,
        y: yPos + 0.35,
        w: 1.2,
        h: 0.4,
        fontSize: 14,
        bold: true,
        color: ACCENT_CYAN,
        fontFace: FONT_PRIMARY,
      });

      // Phase
      slide.addText(item.phase, {
        x: 2.5,
        y: yPos + 0.2,
        w: 3.5,
        h: 0.3,
        fontSize: 11,
        bold: true,
        color: TEXT_WHITE,
        fontFace: FONT_PRIMARY,
      });
      slide.addText(item.activities.join(", "), {
        x: 2.5,
        y: yPos + 0.55,
        w: 4.5,
        h: 0.45,
        fontSize: 9,
        color: TEXT_MUTED,
        fontFace: FONT_PRIMARY,
      });

      // Output Target
      slide.addText("TARGET OUTPUT:", {
        x: 7.3,
        y: yPos + 0.2,
        w: 4.8,
        h: 0.3,
        fontSize: 9,
        bold: true,
        color: ACCENT_CHAMPAGNE,
        fontFace: FONT_PRIMARY,
      });
      slide.addText(item.output, {
        x: 7.3,
        y: yPos + 0.5,
        w: 4.8,
        h: 0.45,
        fontSize: 10,
        color: TEXT_WHITE,
        fontFace: FONT_PRIMARY,
      });
    });

    slide.addNotes(
      "Demikian paparan rencana pelaksanaan proposal ini. Seluruh tahapan telah dirancang secara bertahap dan terukur. Saya siap menerima masukan, saran, dan pertanyaan dari Dewan Penguji."
    );
  }

  // Trigger browser direct file download
  const filename = `Slide_Eksekutif_${doc.category.toUpperCase()}_${doc.candidateName.replace(/\s+/g, "_")}.pptx`;
  await pptx.writeFile({ fileName: filename });
}
