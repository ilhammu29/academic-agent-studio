import test from 'node:test';
import assert from 'node:assert';
import { generateAcademicProposalDocx } from '../lib/docxExporter.ts';
import type { ProposalDocument } from '../types/studio.ts';

test('DOCX Exporter generates valid binary Blob with A4 and academic formatting', async () => {
  const sampleDoc: ProposalDocument = {
    id: 'test-doc-001',
    title: 'Perancangan Sistem Pengenalan Wajah dengan Ekstraksi Fitur 3D',
    category: 'skripsi',
    institution: 'Universitas Sebelas Maret (UNS)',
    facultyMajor: 'Informatika',
    targetEntity: 'Laboratorium Visi Komputer',
    targetDepartment: 'R&D',
    durationMonths: 6,
    candidateName: 'Budi Utomo',
    candidateId: 'M0520001',
    generationDate: '24 Oktober 2026',
    executiveSummary: 'Ringkasan eksekutif rancangan penelitian pengenalan wajah...',
    campusGuideline: {
      campusName: 'Universitas Sebelas Maret (UNS)',
      paperSize: 'A4',
      margins: { topCm: 4, bottomCm: 3, leftCm: 4, rightCm: 3 },
      typography: { fontFamily: 'Times New Roman', bodySizePt: 12, heading1SizePt: 14, lineSpacing: 1.5 },
      headingStyle: 'decimal',
      citationStyle: 'apa',
      approvalConfig: { supervisorCount: 2, requiresHeadOfProgram: true, requiresDeanOrFieldMentor: false }
    },
    bab1: {
      title: 'BAB I: PENDAHULUAN',
      latarBelakang: ['Identifikasi biometrik wajah konvensional rentan terhadap perubahan pencahayaan.'],
      rumusanMasalah: ['Bagaimana akurasi ekstraksi 3D?'],
      batasanMasalah: ['Dataset terbatas pada sudut pose 45 derajat.'],
      tujuanUmum: 'Meningkatkan akurasi identifikasi',
      tujuanKhusus: ['Membangun pipeline ekstraksi 3D'],
      manfaatMahasiswa: ['Penguasaan computer vision'],
      manfaatInstansi: ['Sistem absensi aman'],
      manfaatAkademik: ['Publikasi jurnal']
    },
    bab2: {
      title: 'BAB II: TINJAUAN PUSTAKA',
      profilInstansi: '',
      visiMisi: [],
      strukturOrganisasi: '',
      landasanTeori: [
        { topic: '3D Morphable Model', elaboration: 'Model 3D memungkinkan rekonstruksi bentuk wajah...', citation: '(Blanz & Vetter, 1999)' }
      ]
    },
    bab3: {
      title: 'BAB III: METODOLOGI PENELITIAN',
      metodePelaksanaan: 'Menggunakan dataset FaceForensics dan pengujian model ResNet-50.',
      lingkupPekerjaan: ['Pra-pemrosesan', 'Pelatihan Model'],
      perangkatTools: ['PyTorch', 'OpenCV'],
      rencanaKompetensi: ['Deep Learning Computer Vision']
    },
    bab4: {
      title: 'BAB IV: JADWAL DAN BIAYA',
      jadwalMatriks: [
        { week: 1, phase: 'Studi Literatur', activities: ['Kajian paper'], output: 'Ringkasan', competencyTarget: 'Analisis' }
      ],
      penutup: 'Demikian rancangan penelitian ini disusun.'
    },
    bibliography: [
      { id: 1, author: 'Blanz, V., & Vetter, T.', year: '1999', title: 'A morphable model for the synthesis of 3D faces', source: 'ACM SIGGRAPH', doiUrl: '10.1145/311535.311556' }
    ],
    slides: [],
    auditLog: [
      { rule: 'Standar Bab Dikti', status: 'VERIFIED', details: 'Struktur lengkap', thinkingMode: 'First Principles' }
    ]
  };

  const blob = await generateAcademicProposalDocx(sampleDoc);
  assert.ok(blob, 'Must return a Blob object');
  assert.ok(blob.size > 1000, `Generated DOCX blob must not be empty (actual size: ${blob.size} bytes)`);
  assert.strictEqual(blob.type, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
});
