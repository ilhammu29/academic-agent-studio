import { NextResponse } from 'next/server';
import { buildGeneratedDocument } from '@/lib/agentEngine';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { generateAcademicProposalDocx } from '@/lib/docxExporter';

export async function GET() {
  try {
    const sampleDoc = buildGeneratedDocument(
      "Rancang Bangun Sistem Klasifikasi Citra Medis Berbasis Deep Learning di RS Sardjito",
      "magang",
      {
        targetDepartment: "Unit Radiologi & Rekayasa Biomedika",
        problemStatement: "Kebutuhan triase cepat hasil citra rontgen dada dan minimalisir false negative",
        toolsSkillset: "Python, PyTorch, TorchVision, FastAPI, Docker",
        deliverables: "Model inferensi AI, microservice API, dan laporan validasi klinis"
      },
      "Ahmad Fauzi",
      "22/498765/TK/55123",
      "Universitas Gadjah Mada",
      "Teknik Elektro dan Teknologi Informasi",
      "RSUP Dr. Sardjito Yogyakarta"
    );

    // 1. Test DOCX Generation
    const docxBlob = await generateAcademicProposalDocx(sampleDoc);
    const docxArrayBuffer = await docxBlob.arrayBuffer();

    // 2. Test PPTX Module loading
    const pptxModule = await import('pptxgenjs');
    const pptxgen = (pptxModule as any).default || pptxModule;
    const pptx = new pptxgen();
    pptx.layout = 'LAYOUT_16x9';
    const slide = pptx.addSlide();
    slide.addText(sampleDoc.title, { x: 1, y: 1, w: 10, h: 2, fontSize: 24, bold: true });
    slide.addText(`Pengusul: ${sampleDoc.candidateName} (${sampleDoc.candidateId})`, { x: 1, y: 3, w: 10, h: 1, fontSize: 14 });
    const pptxBuffer = await pptx.write({ outputType: 'nodebuffer' });

    return NextResponse.json({
      status: 'success',
      document: {
        id: sampleDoc.id,
        title: sampleDoc.title,
        candidateName: sampleDoc.candidateName,
        candidateId: sampleDoc.candidateId,
        institution: sampleDoc.institution,
        targetEntity: sampleDoc.targetEntity,
        bab1_sections: Object.keys(sampleDoc.bab1),
        bab1_paragraphs_count: sampleDoc.bab1.latarBelakang.length,
        bab2_sections: Object.keys(sampleDoc.bab2),
        bab3_sections: Object.keys(sampleDoc.bab3),
        bab4_schedule_weeks: sampleDoc.bab4.jadwalMatriks.length,
        slides_count: sampleDoc.slides.length,
      },
      exports: {
        docx_generated: true,
        docx_byte_size: docxArrayBuffer.byteLength,
        pptx_generated: true,
        pptx_byte_size: pptxBuffer ? (pptxBuffer as Buffer).length : 0
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error?.message || String(error),
      stack: error?.stack
    }, { status: 500 });
  }
}
