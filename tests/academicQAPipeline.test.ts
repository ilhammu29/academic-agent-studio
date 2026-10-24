import test from 'node:test';
import assert from 'node:assert';
import { runAcademicQAPipeline } from '../lib/academicQAPipeline.ts';
import type { ProposalDocument } from '../types/studio.ts';

test('Academic QA Pipeline executes 7 validators and flags structural and consistency issues', () => {
  const mockDoc: Partial<ProposalDocument> = {
    title: 'Pengembangan Sistem Rekomendasi Terdistribusi',
    category: 'skripsi',
    institution: 'Universitas Indonesia',
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
      latarBelakang: ['Sistem rekomendasi konvensional mengalami masalah cold-start dan skalabilitas data besar.'],
      // 3 Rumusan Masalah
      rumusanMasalah: [
        'Bagaimana merancang arsitektur terdistribusi?',
        'Bagaimana mengatasi cold start?',
        'Berapa peningkatan throughput sistem?'
      ],
      batasanMasalah: ['Hanya pada data e-commerce'],
      tujuanUmum: 'Meningkatkan skalabilitas sistem',
      // ONLY 1 Tujuan Khusus (Mismatch with 3 problems!)
      tujuanKhusus: [
        'Membangun model terdistribusi'
      ],
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
          topic: 'Collaborative Filtering',
          elaboration: 'Metode rekomendasi berbasis kemiripan interaksi pengguna...',
          citation: '' // Empty citation -> FactualEvidenceValidator must flag!
        }
      ]
    },
    bab3: {
      title: 'BAB III: METODOLOGI PENELITIAN',
      metodePelaksanaan: 'Menggunakan dataset publik MovieLens dan rancangan eksperimen komparatif.',
      lingkupPekerjaan: ['Eksperimen offline'],
      perangkatTools: ['Apache Spark', 'Python'],
      rencanaKompetensi: ['Distributed computing']
    },
    bab4: {
      title: 'BAB IV: JADWAL & PELAKSANAAN',
      jadwalMatriks: [],
      penutup: 'Demikian rancangan penelitian.'
    },
    bibliography: [],
    slides: []
  };

  const report = runAcademicQAPipeline(mockDoc as ProposalDocument);

  assert.ok(report.totalFindingsCount > 0, 'Must produce findings');
  assert.ok(report.overallScore <= 90, 'Score should reflect findings');

  // Check Consistency Validator finding (Problem Count vs Objective Count mismatch)
  const consistencyFinding = report.findings.find(f => f.validatorName === 'ConsistencyValidator');
  assert.ok(consistencyFinding, 'Must flag asymmetry between 3 problems and 1 objective');
  assert.ok(consistencyFinding.evidence.includes('3 butir rumusan masalah'));

  // Check Factual Evidence Validator finding (empty citation on theory)
  const evidenceFinding = report.findings.find(f => f.validatorName === 'FactualEvidenceValidator');
  assert.ok(evidenceFinding, 'Must flag uncited theoretical claim');
  assert.ok(evidenceFinding.location.includes('Collaborative Filtering'));
});
