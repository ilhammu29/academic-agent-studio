import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  PageNumber,
  Footer,
  Header,
  convertInchesToTwip
} from "docx";
import { ProposalDocument } from "@/types/studio";

/**
 * Academic Indonesian Proposal .DOCX Exporter
 * Sesuai Standar Pedoman Penulisan Skripsi & Proposal Kampus Indonesia:
 * - Ukuran Kertas: A4 (11.906 x 16.838 dxa)
 * - Margin: Kiri 4 cm (2268 dxa), Atas 4 cm (2268 dxa), Kanan 3 cm (1701 dxa), Bawah 3 cm (1701 dxa)
 * - Font: Times New Roman 12pt (size: 24), Spasi 1.5 baris (line: 360)
 * - Penomoran Halaman:
 *    * Awal Bab (Cover / Halaman Judul Bab): Tengah Bawah
 *    * Halaman Lanjutan: Kanan Atas
 * - Tabel: Tabel Terbuka 3-Garis (Tanpa garis vertikal, border atas & bawah header, border penutup)
 */

// Helper to convert centimeters to DXA (1 cm = 567 DXA)
const cmToDxa = (cm: number) => Math.round(cm * 567);

export async function generateAcademicProposalDocx(doc: ProposalDocument): Promise<Blob> {
  const guideline = doc.campusGuideline;
  const FONT_FAMILY = guideline?.typography?.fontFamily || "Times New Roman";
  const PRIMARY_COLOR = "000000";
  const topCm = guideline?.margins?.topCm ?? 4;
  const leftCm = guideline?.margins?.leftCm ?? 4;
  const rightCm = guideline?.margins?.rightCm ?? 3;
  const bottomCm = guideline?.margins?.bottomCm ?? 3;
  const lineSpacingTwip = guideline?.typography?.lineSpacing === 2.0 ? 480 : 360;
  const isMagang = doc.category === "magang";

  // Reusable Paragraph styling
  const createHeading1 = (text: string) =>
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 280, line: 360 },
      children: [
        new TextRun({
          text,
          bold: true,
          font: FONT_FAMILY,
          size: 28, // 14pt
          color: PRIMARY_COLOR,
        }),
      ],
    });

  const createHeading2 = (text: string) =>
    new Paragraph({
      alignment: AlignmentType.LEFT,
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 140, line: 360 },
      children: [
        new TextRun({
          text,
          bold: true,
          font: FONT_FAMILY,
          size: 24, // 12pt
          color: PRIMARY_COLOR,
        }),
      ],
    });

  const createHeading3 = (text: string) =>
    new Paragraph({
      alignment: AlignmentType.LEFT,
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 160, after: 100, line: 360 },
      children: [
        new TextRun({
          text,
          bold: true,
          font: FONT_FAMILY,
          size: 24, // 12pt
          color: PRIMARY_COLOR,
        }),
      ],
    });

  const createBodyParagraph = (text: string) =>
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 160, line: 360 }, // 1.5 line spacing
      indent: { firstLine: cmToDxa(1.0) }, // Indentasi 1 cm paragraf baru
      children: [
        new TextRun({
          text,
          font: FONT_FAMILY,
          size: 24, // 12pt
          color: PRIMARY_COLOR,
        }),
      ],
    });

  const createBulletItem = (text: string) =>
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 100, line: 360 },
      indent: { left: cmToDxa(0.8), hanging: cmToDxa(0.4) },
      children: [
        new TextRun({
          text: `• ${text}`,
          font: FONT_FAMILY,
          size: 24,
          color: PRIMARY_COLOR,
        }),
      ],
    });

  // Tabel Terbuka 3-Garis (Standar Akademik Dikti & APA)
  const noBorder = { style: BorderStyle.NONE, size: 0, color: "auto" };
  const singleBorder = { style: BorderStyle.SINGLE, size: 12, color: "000000" };
  const doubleBorder = { style: BorderStyle.DOUBLE, size: 12, color: "000000" };

  const tableHeaderBorders = {
    top: doubleBorder,
    bottom: singleBorder,
    left: noBorder,
    right: noBorder,
  };

  const tableRowBorders = {
    top: noBorder,
    bottom: noBorder,
    left: noBorder,
    right: noBorder,
  };

  const tableLastRowBorders = {
    top: noBorder,
    bottom: singleBorder,
    left: noBorder,
    right: noBorder,
  };

  // Section Page setup (Configured with exact university margins)
  const standardPageProperties = {
    page: {
      size: { width: 11906, height: 16838 }, // A4
      margin: {
        top: cmToDxa(topCm),
        left: cmToDxa(leftCm),
        right: cmToDxa(rightCm),
        bottom: cmToDxa(bottomCm),
      },
    },
  };

  // Reusable Section Footer & Header rules:
  // First page of chapter: Page Number at BOTTOM CENTER
  // Subsequent pages: Page Number at TOP RIGHT
  const chapterHeadersFooters = {
    differentFirstPage: true,
    firstPageFooter: new Footer({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              children: [PageNumber.CURRENT],
              font: FONT_FAMILY,
              size: 20,
            }),
          ],
        }),
      ],
    }),
    header: new Header({
      children: [
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({
              children: [PageNumber.CURRENT],
              font: FONT_FAMILY,
              size: 20,
            }),
          ],
        }),
      ],
    }),
  };

  // Build the Document
  const docxDocument = new Document({
    styles: {
      default: {
        document: {
          run: { font: FONT_FAMILY, size: 24, color: PRIMARY_COLOR },
          paragraph: { spacing: { line: 360 } },
        },
      },
    },
    sections: [
      // ==========================================
      // SECTION 1: HALAMAN JUDUL / COVER
      // ==========================================
      {
        properties: standardPageProperties,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 120 },
            children: [
              new TextRun({
                text: "PROPOSAL KEGIATAN",
                bold: true,
                size: 32, // 16pt
                font: FONT_FAMILY,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: doc.category === "magang" ? "PROGRAM MAGANG INDUSTRI & RISET TERAPAN" : "USULAN PENELITIAN SKRIPSI",
                bold: true,
                size: 28, // 14pt
                font: FONT_FAMILY,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 400 },
            children: [
              new TextRun({
                text: doc.title.toUpperCase(),
                bold: true,
                size: 28, // 14pt
                font: FONT_FAMILY,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 800, after: 120 },
            children: [
              new TextRun({
                text: "Diajukan oleh:",
                font: FONT_FAMILY,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: doc.candidateName,
                bold: true,
                underline: {},
                size: 26,
                font: FONT_FAMILY,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 1000 },
            children: [
              new TextRun({
                text: `NIM: ${doc.candidateId}`,
                font: FONT_FAMILY,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 600, after: 80 },
            children: [
              new TextRun({
                text: doc.facultyMajor.toUpperCase(),
                bold: true,
                size: 26,
                font: FONT_FAMILY,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: doc.institution.toUpperCase(),
                bold: true,
                size: 28,
                font: FONT_FAMILY,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "2026",
                bold: true,
                size: 26,
                font: FONT_FAMILY,
              }),
            ],
          }),
        ],
      },

      // ==========================================
      // SECTION 2: LEMBAR PENGESAHAN
      // ==========================================
      {
        properties: standardPageProperties,
        children: [
          createHeading1(doc.approvalSheet?.title || "LEMBAR PENGESAHAN PROPOSAL"),
          new Paragraph({ spacing: { after: 200 } }),
          createBodyParagraph(`Judul Proposal: ${doc.title}`),
          createBodyParagraph(`Nama Mahasiswa: ${doc.candidateName} (NIM: ${doc.candidateId})`),
          createBodyParagraph(`Program Studi: ${doc.facultyMajor}`),
          createBodyParagraph(`Instansi Tujuan: ${doc.targetEntity} (${doc.targetDepartment})`),
          createBodyParagraph(`Waktu Pelaksanaan: ${doc.durationMonths} Bulan (${doc.bab4.jadwalMatriks.length * 4 || 16} Minggu Kerja Penuh)`),
          new Paragraph({ spacing: { after: 300 } }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: doc.approvalSheet?.approvalDate ? `Disahkan: ${doc.approvalSheet.approvalDate}` : `Disetujui pada tanggal: ${doc.generationDate}`,
                font: FONT_FAMILY,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [
              new TextRun({ text: "Menyetujui,", font: FONT_FAMILY, size: 24 }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: noBorder, bottom: noBorder, left: noBorder, right: noBorder,
              insideHorizontal: noBorder, insideVertical: noBorder,
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: doc.approvalSheet?.primarySigners?.[0]?.role || "Dosen Pembimbing Akademik,", font: FONT_FAMILY, bold: true })] }),
                      new Paragraph({ spacing: { before: 800 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: `( ${doc.approvalSheet?.primarySigners?.[0]?.name || "Dr. Ir. Suharyanto, M.Sc."} )`, font: FONT_FAMILY, underline: {} })] }),
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: doc.approvalSheet?.primarySigners?.[0]?.idNumber || "NIP. 19780512 200312 1 002", font: FONT_FAMILY })] }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: doc.approvalSheet?.primarySigners?.[1]?.role || (doc.category === "magang" ? "Pembimbing Lapangan / Mitra," : "Dosen Pembimbing Pendamping,"), font: FONT_FAMILY, bold: true })] }),
                      new Paragraph({ spacing: { before: 800 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: `( ${doc.approvalSheet?.primarySigners?.[1]?.name || (doc.category === "magang" ? `Lead Mentor ${doc.targetEntity}` : "Dian Pratama, M.Kom.")} )`, font: FONT_FAMILY, underline: {} })] }),
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: doc.approvalSheet?.primarySigners?.[1]?.idNumber || "NIP / NIK Mitra Terkait", font: FONT_FAMILY })] }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 500, after: 80 },
            children: [
              new TextRun({ text: "Mengetahui,", font: FONT_FAMILY, size: 24 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 700 },
            children: [
              new TextRun({ text: doc.approvalSheet?.headSigner?.role || "Ketua Program Studi", font: FONT_FAMILY, bold: true, size: 24 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: `( ${doc.approvalSheet?.headSigner?.name || "Prof. Dr. Ir. Budi Hartono, M.Sc."} )`, font: FONT_FAMILY, bold: true, underline: {}, size: 24 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: doc.approvalSheet?.headSigner?.idNumber || "NIP. 19680315 199303 1 001", font: FONT_FAMILY, size: 22 }),
            ],
          }),
        ],
      },

      // ==========================================
      // SECTION 3: RINGKASAN EKSEKUTIF
      // ==========================================
      {
        properties: standardPageProperties,
        ...chapterHeadersFooters,
        children: [
          createHeading1("RINGKASAN EKSEKUTIF"),
          new Paragraph({ spacing: { after: 200 } }),
          createBodyParagraph(doc.executiveSummary),
        ],
      },

      // ==========================================
      // SECTION 4: BAB I PENDAHULUAN
      // ==========================================
      {
        properties: standardPageProperties,
        ...chapterHeadersFooters,
        children: [
          createHeading1(doc.bab1.title),
          new Paragraph({ spacing: { after: 140 } }),

          createHeading2("1.1 Latar Belakang Masalah"),
          ...doc.bab1.latarBelakang.map((p) => createBodyParagraph(p)),

          createHeading2("1.2 Rumusan Masalah"),
          ...doc.bab1.rumusanMasalah.map((r, i) =>
            new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 120, line: 360 },
              indent: { left: cmToDxa(0.8), hanging: cmToDxa(0.4) },
              children: [new TextRun({ text: `${i + 1}. ${r}`, font: FONT_FAMILY, size: 24 })],
            })
          ),

          createHeading2("1.3 Batasan Masalah"),
          ...doc.bab1.batasanMasalah.map((b) => createBulletItem(b)),

          createHeading2("1.4 Tujuan Kegiatan / Penelitian"),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 100, line: 360 },
            children: [new TextRun({ text: "Tujuan Umum:", bold: true, font: FONT_FAMILY, size: 24 })],
          }),
          createBodyParagraph(doc.bab1.tujuanUmum),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 100, after: 100, line: 360 },
            children: [new TextRun({ text: "Tujuan Khusus:", bold: true, font: FONT_FAMILY, size: 24 })],
          }),
          ...doc.bab1.tujuanKhusus.map((t) => createBulletItem(t)),

          createHeading2("1.5 Manfaat Kegiatan"),
          new Paragraph({
            spacing: { after: 80, line: 360 },
            children: [new TextRun({ text: "A. Bagi Mahasiswa Pengusul:", bold: true, font: FONT_FAMILY, size: 24 })],
          }),
          ...doc.bab1.manfaatMahasiswa.map((m) => createBulletItem(m)),

          new Paragraph({
            spacing: { before: 120, after: 80, line: 360 },
            children: [new TextRun({ text: `B. Bagi Instansi Mitra (${doc.targetEntity}):`, bold: true, font: FONT_FAMILY, size: 24 })],
          }),
          ...doc.bab1.manfaatInstansi.map((m) => createBulletItem(m)),

          new Paragraph({
            spacing: { before: 120, after: 80, line: 360 },
            children: [new TextRun({ text: `C. Bagi Perguruan Tinggi (${doc.institution}):`, bold: true, font: FONT_FAMILY, size: 24 })],
          }),
          ...doc.bab1.manfaatAkademik.map((m) => createBulletItem(m)),
        ],
      },

      // ==========================================
      // SECTION 5: BAB II TINJAUAN PUSTAKA / PROFIL INSTANSI
      // ==========================================
      {
        properties: standardPageProperties,
        ...chapterHeadersFooters,
        children: [
          createHeading1(doc.bab2.title),
          new Paragraph({ spacing: { after: 140 } }),

          createHeading2("2.1 Gambaran Umum & Profil Organisasi"),
          createBodyParagraph(doc.bab2.profilInstansi),

          createHeading3("Visi dan Misi Organisasi"),
          ...doc.bab2.visiMisi.map((v) => createBulletItem(v)),

          createHeading3("Struktur Supervisi & Lingkup Kerja"),
          createBodyParagraph(doc.bab2.strukturOrganisasi),

          createHeading2("2.2 Landasan Teori & Tinjauan Pustaka Terkait"),
          ...doc.bab2.landasanTeori.flatMap((t, i) => [
            createHeading3(`2.2.${i + 1} ${t.topic}`),
            createBodyParagraph(t.elaboration),
            new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 180, line: 360 },
              indent: { firstLine: cmToDxa(1.0) },
              children: [
                new TextRun({
                  text: `(Rujukan primer: ${t.citation})`,
                  italics: true,
                  font: FONT_FAMILY,
                  size: 22,
                  color: "444444",
                }),
              ],
            }),
          ]),
        ],
      },

      // ==========================================
      // SECTION 6: BAB III METODOLOGI & RENCANA KERJA
      // ==========================================
      {
        properties: standardPageProperties,
        ...chapterHeadersFooters,
        children: [
          createHeading1(doc.bab3.title),
          new Paragraph({ spacing: { after: 140 } }),

          createHeading2("3.1 Metode Pelaksanaan"),
          createBodyParagraph(doc.bab3.metodePelaksanaan),

          createHeading2("3.2 Ruang Lingkup Penugasan & Pekerjaan"),
          ...doc.bab3.lingkupPekerjaan.map((l, i) =>
            new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 100, line: 360 },
              indent: { left: cmToDxa(0.8), hanging: cmToDxa(0.4) },
              children: [new TextRun({ text: `${i + 1}. ${l}`, font: FONT_FAMILY, size: 24 })],
            })
          ),

          createHeading2("3.3 Spesifikasi Perangkat Lunak & Tools"),
          ...doc.bab3.perangkatTools.map((p) => createBulletItem(p)),

          createHeading2("3.4 Rencana Capaian Kompetensi"),
          ...doc.bab3.rencanaKompetensi.map((c) => createBulletItem(c)),
        ],
      },

      // ==========================================
      // SECTION 7: BAB IV JADWAL MATRIKS & ANGGARAN
      // ==========================================
      {
        properties: standardPageProperties,
        ...chapterHeadersFooters,
        children: [
          createHeading1(doc.bab4.title),
          new Paragraph({ spacing: { after: 140 } }),

          createHeading2("4.1 Matriks Rencana Kerja Mingguan (Tabel 3-Garis)"),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 140, line: 360 },
            children: [
              new TextRun({
                text: "Tabel 4.1. Distribusi Kegiatan Mingguan dan Target Capaian",
                bold: true,
                font: FONT_FAMILY,
                size: 22,
              }),
            ],
          }),

          // Tabel 3-Garis Terbuka
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              // Header Row
              new TableRow({
                children: [
                  new TableCell({
                    borders: tableHeaderBorders,
                    width: { size: 15, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Minggu Ke-", bold: true, font: FONT_FAMILY, size: 22 })] })],
                  }),
                  new TableCell({
                    borders: tableHeaderBorders,
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Fase Pelaksanaan", bold: true, font: FONT_FAMILY, size: 22 })] })],
                  }),
                  new TableCell({
                    borders: tableHeaderBorders,
                    width: { size: 35, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Rincian Aktivitas", bold: true, font: FONT_FAMILY, size: 22 })] })],
                  }),
                  new TableCell({
                    borders: tableHeaderBorders,
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Target Luaran", bold: true, font: FONT_FAMILY, size: 22 })] })],
                  }),
                ],
              }),
              // Data Rows
              ...doc.bab4.jadwalMatriks.map((j, idx) => {
                const isLast = idx === doc.bab4.jadwalMatriks.length - 1;
                const borders = isLast ? tableLastRowBorders : tableRowBorders;
                return new TableRow({
                  children: [
                    new TableCell({
                      borders,
                      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Minggu ${j.week}`, font: FONT_FAMILY, size: 20 })] })],
                    }),
                    new TableCell({
                      borders,
                      children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: j.phase, font: FONT_FAMILY, size: 20, bold: true })] })],
                    }),
                    new TableCell({
                      borders,
                      children: [new Paragraph({ alignment: AlignmentType.JUSTIFIED, children: [new TextRun({ text: j.activities.join("; "), font: FONT_FAMILY, size: 20 })] })],
                    }),
                    new TableCell({
                      borders,
                      children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: j.output, font: FONT_FAMILY, size: 20 })] })],
                    }),
                  ],
                });
              }),
            ],
          }),

          createHeading2("4.2 Penutup"),
          createBodyParagraph(doc.bab4.penutup),
        ],
      },

      // ==========================================
      // SECTION 8: BAB V KESIMPULAN & MITIGASI RISIKO
      // ==========================================
      {
        properties: standardPageProperties,
        ...chapterHeadersFooters,
        children: [
          createHeading1(doc.bab5?.title || (isMagang ? "BAB V: PENUTUP & REKOMENDASI" : "BAB V: KESIMPULAN & REKOMENDASI KONTRIBUSI")),
          
          createHeading2("5.1 Kesimpulan Rencana Usulan"),
          ...(doc.bab5?.kesimpulanUsulan || [
            `Usulan pelaksanaan kegiatan dengan topik "${doc.title}" pada ${doc.targetEntity} telah dirancang secara sistematis memenuhi kaidah akademik.`,
            `Seluruh tahapan kerja dan beban waktu telah diselaraskan dengan standar capaian kompetensi kurikulum.`
          ]).map(k => createBulletItem(k)),

          createHeading2("5.2 Rekomendasi Kontribusi Strategis"),
          ...(doc.bab5?.kontribusiPraktis || [
            `Bagi ${doc.targetEntity}: Memberikan solusi aplikatif untuk mengatasi kendala operasional.`,
            `Bagi ${doc.institution}: Memperkuat jalinan kolaborasi dan dokumentasi studi kasus nyata.`
          ]).map(c => createBulletItem(c)),

          createHeading2("5.3 Matriks Mitigasi Risiko Pelaksanaan"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                tableHeader: true,
                children: [
                  new TableCell({
                    borders: tableHeaderBorders,
                    width: { size: 10, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "No", bold: true, font: FONT_FAMILY, size: 22 })] })],
                  }),
                  new TableCell({
                    borders: tableHeaderBorders,
                    width: { size: 45, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Potensi Risiko / Hambatan", bold: true, font: FONT_FAMILY, size: 22 })] })],
                  }),
                  new TableCell({
                    borders: tableHeaderBorders,
                    width: { size: 45, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Rencana Aksi Mitigasi (Preventif/Korektif)", bold: true, font: FONT_FAMILY, size: 22 })] })],
                  }),
                ],
              }),
              ...(doc.bab5?.mitigasiRisiko || [
                { risiko: "Keterlambatan perizinan akses data", mitigasi: "Pengajuan surat pengantar resmi sejak awal dan penyiapan data sekunder." },
                { risiko: "Kendala teknis instalasi tools", mitigasi: "Uji coba konfigurasi pada fase persiapan orientasi." }
              ]).map((m, idx, arr) => {
                const borders = idx === arr.length - 1 ? tableLastRowBorders : tableRowBorders;
                return new TableRow({
                  children: [
                    new TableCell({
                      borders,
                      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(idx + 1), font: FONT_FAMILY, size: 20 })] })],
                    }),
                    new TableCell({
                      borders,
                      children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: m.risiko, font: FONT_FAMILY, size: 20, bold: true })] })],
                    }),
                    new TableCell({
                      borders,
                      children: [new Paragraph({ alignment: AlignmentType.JUSTIFIED, children: [new TextRun({ text: m.mitigasi, font: FONT_FAMILY, size: 20 })] })],
                    }),
                  ],
                });
              }),
            ],
          }),

          createHeading2("5.4 Rencana Keberlanjutan Proyek (Sustainability Plan)"),
          createBodyParagraph(doc.bab5?.sustainabilityPlan || `Seluruh artefak hasil pekerjaan dan dokumentasi diserahkan secara resmi kepada pihak ${doc.targetEntity} disertai sesi transfer knowledge untuk pemanfaatan berkelanjutan.`),
        ],
      },

      // ==========================================
      // SECTION 9: DAFTAR PUSTAKA
      // ==========================================
      {
        properties: standardPageProperties,
        ...chapterHeadersFooters,
        children: [
          createHeading1("DAFTAR PUSTAKA"),
          new Paragraph({ spacing: { after: 200 } }),
          ...(doc.bibliography || []).map((b, bIdx) =>
            new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 140, line: lineSpacingTwip },
              indent: { left: 720, hanging: 720 },
              children: [
                new TextRun({
                  text: `${b.author} (${b.year}). `,
                  bold: true,
                  font: FONT_FAMILY,
                  size: 22,
                }),
                new TextRun({
                  text: `${b.title}. `,
                  italics: true,
                  font: FONT_FAMILY,
                  size: 22,
                }),
                new TextRun({
                  text: `${b.source}.`,
                  font: FONT_FAMILY,
                  size: 22,
                }),
                ...(b.doiUrl ? [
                  new TextRun({
                    text: ` DOI: ${b.doiUrl}`,
                    font: FONT_FAMILY,
                    size: 18,
                    color: "555555",
                  })
                ] : []),
              ],
            })
          ),
        ],
      },

      // ==========================================
      // SECTION 10: LAMPIRAN-LAMPIRAN
      // ==========================================
      {
        properties: standardPageProperties,
        ...chapterHeadersFooters,
        children: [
          createHeading1("LAMPIRAN-LAMPIRAN"),
          new Paragraph({ spacing: { after: 200 } }),

          ...(doc.appendices || [
            {
              id: "lampiran_a",
              title: "Lampiran A: Pedoman Wawancara & Instrumen Pengumpulan Data",
              content: `Pedoman instrumen ini dirancang untuk pengumpulan data primer dan sekunder di ${doc.targetEntity}.`
            },
            {
              id: "lampiran_b",
              title: "Lampiran B: Matriks Logbook Mingguan Aktivitas Lapangan",
              content: "Matriks logbook pencatatan kehadiran dan keluaran mingguan terstruktur."
            }
          ]).flatMap((app) => [
            createHeading2(app.title),
            createBodyParagraph(app.content),
            ...(app.tableRows && app.tableRows.length > 0 ? [
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    tableHeader: true,
                    children: [
                      new TableCell({
                        borders: tableHeaderBorders,
                        width: { size: 20, type: WidthType.PERCENTAGE },
                        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Indikator / Minggu", bold: true, font: FONT_FAMILY, size: 22 })] })],
                      }),
                      new TableCell({
                        borders: tableHeaderBorders,
                        width: { size: 50, type: WidthType.PERCENTAGE },
                        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Fokus Kegiatan & Parameter Evaluasi", bold: true, font: FONT_FAMILY, size: 22 })] })],
                      }),
                      new TableCell({
                        borders: tableHeaderBorders,
                        width: { size: 30, type: WidthType.PERCENTAGE },
                        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Metode Verifikasi / Output", bold: true, font: FONT_FAMILY, size: 22 })] })],
                      }),
                    ],
                  }),
                  ...app.tableRows.map((r, rIdx, arr) => {
                    const borders = rIdx === arr.length - 1 ? tableLastRowBorders : tableRowBorders;
                    return new TableRow({
                      children: [
                        new TableCell({
                          borders,
                          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: r.col1, font: FONT_FAMILY, size: 20, bold: true })] })],
                        }),
                        new TableCell({
                          borders,
                          children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: r.col2, font: FONT_FAMILY, size: 20 })] })],
                        }),
                        new TableCell({
                          borders,
                          children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: r.col3, font: FONT_FAMILY, size: 20 })] })],
                        }),
                      ],
                    });
                  }),
                ],
              }),
              new Paragraph({ spacing: { after: 200 } }),
            ] : []),
          ]),
        ],
      },
    ],
  });

  return await Packer.toBlob(docxDocument);
}

// Browser Trigger Helper
export function downloadDocxBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
