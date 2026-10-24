import test from 'node:test';
import assert from 'node:assert';
import {
  isValidDoiSyntax,
  extractCleanDoi,
  extractInTextCitations,
  auditCitationIntegrity
} from '../lib/evidenceVerifier.ts';
import type { ProposalDocument } from '../types/studio.ts';

test('DOI Syntax Validation properly distinguishes valid and invalid DOIs', () => {
  assert.strictEqual(isValidDoiSyntax('10.1016/j.jhep.2024.01.012'), true);
  assert.strictEqual(isValidDoiSyntax('https://doi.org/10.1109/TPWRS.2023.3289123'), true);
  assert.strictEqual(isValidDoiSyntax('10.1000/182'), true);

  // Invalid DOIs
  assert.strictEqual(isValidDoiSyntax('not-a-doi'), false);
  assert.strictEqual(isValidDoiSyntax('http://example.com/paper.pdf'), false);
  assert.strictEqual(isValidDoiSyntax(''), false);
  assert.strictEqual(isValidDoiSyntax(undefined), false);
});

test('extractInTextCitations extracts both APA and IEEE citations', () => {
  const sampleText = `
    Kajian terdahulu oleh (Zhang et al., 2024) menemukan bahwa latency berkurang secara signifikan.
    Hal ini didukung oleh temuan (Smith & Johnson, 2023) yang menggunakan model pembelajaran mesin [1].
    Penelitian lain membuktikan optimasi serupa [2].
  `;

  const { apaCitations, ieeeCitations } = extractInTextCitations(sampleText);
  assert.ok(apaCitations.length >= 2, 'Should find at least 2 APA citations');
  assert.ok(ieeeCitations.includes(1), 'Should find IEEE citation [1]');
  assert.ok(ieeeCitations.includes(2), 'Should find IEEE citation [2]');
});

test('Citation Integrity Auditor detects orphan references and missing bibliography entries', () => {
  const mockDoc: Partial<ProposalDocument> = {
    title: 'Penerapan Deep Learning untuk Deteksi Anomali',
    category: 'skripsi',
    campusGuideline: {
      campusName: 'Universitas Indonesia',
      paperSize: 'A4',
      margins: { topCm: 4, bottomCm: 3, leftCm: 4, rightCm: 3 },
      typography: { fontFamily: 'Times New Roman', bodySizePt: 12, heading1SizePt: 14, lineSpacing: 1.5 },
      headingStyle: 'decimal',
      citationStyle: 'apa',
      approvalConfig: { supervisorCount: 2, requiresHeadOfProgram: true, requiresDeanOrFieldMentor: false }
    },
    bab1: {
      title: 'BAB I: PENDAHULUAN',
      latarBelakang: [
        'Menurut temuan (Kurniawan et al., 2024), anomali jaringan meningkat drastis.',
        'Namun metode konvensional belum mampu menanganinya.'
      ],
      rumusanMasalah: ['Bagaimana model mendeteksi anomali?'],
      batasanMasalah: ['Dataset tahun 2023'],
      tujuanUmum: 'Membangun model',
      tujuanKhusus: ['Menguji akurasi'],
      manfaatMahasiswa: [],
      manfaatInstansi: [],
      manfaatAkademik: []
    },
    bab2: {
      title: 'BAB II: TINJAUAN PUSTAKA',
      profilInstansi: '',
      visiMisi: [],
      strukturOrganisasi: '',
      landasanTeori: [
        {
          topic: 'Convolutional Neural Networks',
          elaboration: 'CNN merupakan arsitektur deep learning...',
          citation: '(LeCun, 2015)'
        }
      ]
    },
    bibliography: [
      // 1. Kurniawan is cited in Bab I
      { id: 1, author: 'Kurniawan, B., & Santoso, H.', year: '2024', title: 'Network Anomaly Detection', source: 'IEEE Trans', doiUrl: '10.1109/TNET.2024.12345' },
      // 2. ORPHAN: Brown is in bibliography but NEVER cited in body text!
      { id: 2, author: 'Brown, Charlie', year: '2021', title: 'Unused Reference Book', source: 'Academic Press', doiUrl: '10.1016/j.comp.2021.05.001' }
      // NOTE: (LeCun, 2015) is cited in Bab II but MISSING from bibliography!
    ],
    slides: []
  };

  const report = auditCitationIntegrity(mockDoc as ProposalDocument);

  assert.ok(report.issues.length >= 2, 'Should detect at least 2 citation integrity issues');

  const orphanIssue = report.issues.find(i => i.type === 'ORPHAN_BIBLIOGRAPHY');
  assert.ok(orphanIssue, 'Must flag orphan bibliography for Brown');
  assert.ok(orphanIssue.location.includes('Brown'));

  const missingIssue = report.issues.find(i => i.type === 'MISSING_BIBLIOGRAPHY');
  assert.ok(missingIssue, 'Must flag missing bibliography for LeCun');
  assert.ok(missingIssue.location.includes('LeCun'));
});
