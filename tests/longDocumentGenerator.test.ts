import test from 'node:test';
import assert from 'node:assert';
import { planDocumentOutline, buildDenseAcademicDocument } from '../lib/longDocumentGenerator.ts';
import { generateAcademicProposalDocx } from '../lib/docxExporter.ts';

test('planDocumentOutline calculates depth blueprint for Proposal Skripsi vs Magang vs Tesis', () => {
  const skripsiPlan = planDocumentOutline('Rancang Bangun Sistem Klasifikasi Citra Medis', 'skripsi', 'proposal_skripsi', 'RSUP Sardjito');
  assert.strictEqual(skripsiPlan.domain, 'health');
  assert.ok(skripsiPlan.targetPagesMin >= 35, 'Proposal skripsi minimum target pages must be >= 35');
  assert.ok(skripsiPlan.theoryTopics.length >= 8, 'Must plan at least 8 specialized theories');

  const magangPlan = planDocumentOutline('Implementasi Pipeline CI/CD dan Observabilitas Sistem', 'magang', 'magang', 'PT Telkom Indonesia');
  assert.strictEqual(magangPlan.domain, 'tech');
  assert.ok(magangPlan.targetTotalWords >= 7000, 'Magang plan must target substantial words');
});

test('buildDenseAcademicDocument generates dense, multi-page authentic academic document', () => {
  const answers = {
    urgensi: 'Tingginya latensi pemrosesan data dan keterbatasan kapasitas throughput.',
    metode: 'Kombinasi algoritma kompresi terdistribusi dan replikasi multi-node.',
    indikator: 'Latensi respon < 100ms dan ketersediaan data 99.9%.'
  };

  const doc = buildDenseAcademicDocument(
    'Optimasi Arsitektur Terdistribusi Berbasis Microservices pada Pemrosesan Data Transaksi Skala Besar',
    'skripsi',
    answers,
    'Ahmad Fauzi',
    'M0521001',
    'Universitas Sebelas Maret (UNS)',
    'Informatika',
    'Bank Mandiri (Persero) Tbk',
    undefined,
    'skripsi'
  );

  // Bab I depth verification
  assert.ok(doc.bab1.latarBelakang.length >= 6, `Bab I must have >= 6 dense paragraphs (actual: ${doc.bab1.latarBelakang.length})`);
  assert.ok(doc.bab1.rumusanMasalah.length >= 3, 'Must formulate at least 3 problem statements');
  assert.ok(doc.bab1.tujuanKhusus.length >= 3, 'Must formulate at least 3 specific objectives');

  // Bab II theoretical foundation & state-of-the-art gap matrix
  assert.ok(doc.bab2.landasanTeori.length >= 8, `Bab II must have >= 8 theoretical foundations (actual: ${doc.bab2.landasanTeori.length})`);
  assert.ok(doc.bab2.researchGapMatrix && doc.bab2.researchGapMatrix.length >= 3, 'Must include 3-study State-of-the-Art research gap matrix');

  // Bab III operational definitions table
  assert.ok(doc.bab3.operationalDefinitions && doc.bab3.operationalDefinitions.length >= 3, 'Bab III must contain Operational Definitions of Variables table');

  // Bab IV WBS matrix & Budget Plan
  assert.ok(doc.bab4.jadwalMatriks.length >= 4, 'Bab IV must contain detailed 16-week execution phases');
  assert.ok(doc.bab4.budgetPlan && doc.bab4.budgetPlan.length >= 3, 'Bab IV must have comprehensive Budget items');

  // Bab V Risk Mitigation
  assert.ok(doc.bab5 && doc.bab5.mitigasiRisiko.length >= 3, 'Bab V must have detailed risk mitigations');

  // Synced Bibliography
  assert.ok(doc.bibliography && doc.bibliography.length >= 8, 'Bibliography must have >= 8 entries matching theoretical foundations');
});

test('Dense academic document exports to large, structurally sound DOCX binary', async () => {
  const doc = buildDenseAcademicDocument(
    'Pengembangan Sistem Deteksi Dini Stunting Berbasis Pembelajaran Mesin',
    'skripsi',
    {
      urgensi: 'Prevalensi stunting pada balita di wilayah pedesaan masih berada di atas ambang batas WHO 20%.',
      metode: 'Pengumpulan data antropometri dan analisis multivariat dengan model XGBoost.'
    },
    'Nurul Hidayah',
    'G0019045',
    'Universitas Indonesia (UI)',
    'Ilmu Gizi & Kedokteran Komunitas',
    'Puskesmas Kecamatan Sukamaju',
    undefined,
    'skripsi'
  );

  const docxBlob = await generateAcademicProposalDocx(doc);
  assert.ok(docxBlob, 'Must generate valid Blob');
  // A dense 40-page academic document with multiple tables (gap matrix, DOV table, WBS, budget) will produce > 20,000 bytes
  assert.ok(docxBlob.size > 20000, `Generated dense DOCX size should exceed 20KB (actual size: ${docxBlob.size} bytes)`);
});
