import test from 'node:test';
import assert from 'node:assert';
import { CAMPUS_PRESETS } from '../lib/campusPresets.ts';
import { ACADEMIC_TEMPLATES } from '../lib/documentTemplates.ts';
import {
  DEFAULT_ACADEMIC_RULES,
  validateProposalDocumentRules
} from '../lib/academicRuleEngine.ts';
import type { RuleResolutionContext } from '../lib/academicRuleEngine.ts';
import { buildDenseAcademicDocument } from '../lib/longDocumentGenerator.ts';
import { generateAcademicProposalDocx } from '../lib/docxExporter.ts';
import type { ProposalDocument } from '../types/studio.ts';

test('CAMPUS_PRESETS contains official FT UNP 2025 specifications', () => {
  const unpPreset = CAMPUS_PRESETS.find(p => p.id === 'unp');
  assert.ok(unpPreset, 'Preset UNP must exist in CAMPUS_PRESETS');
  assert.strictEqual(unpPreset.id, 'unp');
  assert.strictEqual(unpPreset.campusName, 'Universitas Negeri Padang (UNP)');
  assert.strictEqual(unpPreset.chapterCount, 3, 'UNP PKL must strictly have 3 chapters');
  assert.strictEqual(unpPreset.margins.topCm, 4);
  assert.strictEqual(unpPreset.margins.leftCm, 4);
  assert.strictEqual(unpPreset.margins.bottomCm, 3);
  assert.strictEqual(unpPreset.margins.rightCm, 3);
  assert.strictEqual(unpPreset.typography.fontFamily, 'Times New Roman');
  assert.strictEqual(unpPreset.typography.bodySizePt, 12);
  assert.strictEqual(unpPreset.typography.lineSpacing, 1.5);
  assert.strictEqual(unpPreset.typography.tableFontSizePt, 11);
  assert.strictEqual(unpPreset.typography.tableLineSpacing, 1.0);
  assert.strictEqual(unpPreset.numberingSystem, 'alphanumeric');
  assert.ok(unpPreset.rules?.includes('no-first-person'), 'Must enforce no first-person pronouns');
});

test('ACADEMIC_TEMPLATES contains official laporan_pkl_unp 2025 structure', () => {
  const unpTemplate = ACADEMIC_TEMPLATES['laporan_pkl_unp'];
  assert.ok(unpTemplate, 'Template laporan_pkl_unp must exist');
  assert.strictEqual(unpTemplate.category, 'magang');
  assert.strictEqual(unpTemplate.degreeLevel, 'S1');
  assert.strictEqual(unpTemplate.name, 'Laporan Pengalaman Kerja Lapangan (PKL) FT UNP 2025');
  assert.strictEqual(unpTemplate.requiredChapters.length, 3, 'Template must specify exactly 3 chapters');
  assert.strictEqual(unpTemplate.requiredChapters[0].title, 'BAB I: PENDAHULUAN (LOKASI KERJA PKL)');
  assert.strictEqual(unpTemplate.requiredChapters[1].title, 'BAB II: TOPIK BAHASAN');
  assert.strictEqual(unpTemplate.requiredChapters[2].title, 'BAB III: PENUTUP');
  assert.strictEqual(unpTemplate.adminChecklist.length, 9, 'Must have 9 administrative checklist items');
  assert.strictEqual(unpTemplate.requiredSigners.length, 4, 'Must include 4 official UNP signatories');
});

test('Rule Registry registers 6 mandatory UNP FT PKL 2025 rules', () => {
  const unpRules = DEFAULT_ACADEMIC_RULES.filter(r => r.id.startsWith('UNP-FT-PKL-'));
  assert.strictEqual(unpRules.length, 6, 'Must have 6 UNP rules');

  const ruleIds = unpRules.map(r => r.id);
  assert.ok(ruleIds.includes('UNP-FT-PKL-STRUCT-001'), 'Structure rule must exist');
  assert.ok(ruleIds.includes('UNP-FT-PKL-MARGIN-001'), 'Margin rule must exist');
  assert.ok(ruleIds.includes('UNP-FT-PKL-TYPO-001'), 'Typography rule must exist');
  assert.ok(ruleIds.includes('UNP-FT-PKL-NUMBERING-001'), 'Numbering rule must exist');
  assert.ok(ruleIds.includes('UNP-FT-PKL-LANGUAGE-001'), 'Language rule must exist');
  assert.ok(ruleIds.includes('UNP-FT-PKL-APPENDICES-001'), 'Appendices rule must exist');
});

test('Rule Engine deterministic validation validates UNP 3-chapter structure and passive language', () => {
  // Document with first-person pronoun violation and 5 chapters
  const invalidDoc: Partial<ProposalDocument> = {
    reportType: 'laporan_pkl_unp',
    institution: 'Universitas Negeri Padang (UNP)',
    preface: 'Saya mengucapkan terima kasih kepada semua pihak.',
    bab1: {
      title: 'BAB I PENDAHULUAN',
      latarBelakang: ['Latar belakang'],
      rumusanMasalah: ['Masalah 1'],
      batasanMasalah: ['Batasan 1'],
      tujuanUmum: 'Tujuan',
      tujuanKhusus: ['Khusus 1'],
      manfaatMahasiswa: ['Manfaat mhs'],
      manfaatInstansi: ['Manfaat instansi'],
      manfaatAkademik: ['Manfaat kampus']
    },
    bab2: {
      title: 'BAB II TOPIK BAHASAN',
      profilInstansi: 'Profil',
      visiMisi: ['Visi', 'Misi'],
      strukturOrganisasi: 'Struktur',
      landasanTeori: [],
      researchGapMatrix: [],
      conceptualFramework: 'Proses'
    },
    bab3: {
      title: 'BAB III METODOLOGI', // Invalid title for UNP, should be PENUTUP
      metodePelaksanaan: 'Metode',
      lingkupPekerjaan: ['Lingkup'],
      perangkatTools: ['Tools'],
      rencanaKompetensi: ['Kompetensi']
    },
    bab4: {
      title: 'BAB IV RENCANA KERJA', // Invalid: UNP shouldn't have Bab IV
      jadwalMatriks: [],
      penutup: '',
      ganttSchedule: [],
      anggaranBiaya: []
    },
    bab5: {
      title: 'BAB V KESIMPULAN',
      kesimpulanUsulan: ['Kesimpulan'],
      kontribusiPraktis: ['Kontribusi'],
      mitigasiRisiko: [{ risiko: 'Risiko 1', mitigasi: 'Mitigasi 1' }],
      kesimpulanUmum: 'Kesimpulan',
      saranPraktis: [],
      kontribusiTeoretis: 'Teori'
    }
  };

  const context: RuleResolutionContext = {
    institution: 'Universitas Negeri Padang (UNP)',
    documentType: 'laporan_pkl_unp',
    degree: 'S1'
  };

  const validation = validateProposalDocumentRules(invalidDoc as ProposalDocument, context);
  assert.ok(validation.violationsCount >= 2, 'Invalid document must flag violations');
  assert.ok(
    validation.violations.some(v => v.ruleId === 'UNP-FT-PKL-STRUCT-001'),
    'Must violate 3-chapter structure rule'
  );
  assert.ok(
    validation.violations.some(v => v.ruleId === 'UNP-FT-PKL-LANGUAGE-001'),
    'Must violate passive language rule (usage of "saya")'
  );
});

test('buildDenseAcademicDocument generates compliant UNP FT PKL 2025 document', () => {
  const unpPreset = CAMPUS_PRESETS.find(p => p.id === 'unp');
  const answers: Record<string, string> = {
    divisi_unit: 'Departemen Tambang & Pemeliharaan Mesin Pabrik Indarung V',
    masalah_teknis: 'Tingginya getaran vibrasi abnormal bearing pada unit Finish Mill 5R1.',
    metode_tools: 'Vibration Analyzer Fluke 810, Form Checklist SOP Harian, Buku Harian Asli.',
    deliverable_output: '1 Berkas Laporan PKL 3 Bab Baku FT UNP 2025 dan Form Bimbingan UHI.'
  };

  const generated = buildDenseAcademicDocument(
    'Analisis Preventive Maintenance Mesin Finish Mill Indarung V PT Semen Padang Berbasis Kepatuhan SOP dan Getaran Vibrasi',
    'magang',
    answers,
    'Rahmat Hidayat',
    '21063045',
    'Universitas Negeri Padang (UNP)',
    'Teknik Mesin',
    'PT Semen Padang (Persero)',
    unpPreset,
    'laporan_pkl_unp'
  );

  // Verify campus guideline
  assert.strictEqual(generated.campusGuideline?.id, 'unp');
  assert.strictEqual(generated.campusGuideline?.margins?.topCm, 4);

  // Verify Preface uses "penulis" without "saya" or "kami"
  assert.ok(generated.preface, 'Preface must exist');
  assert.strictEqual(/\bsaya\b/i.test(generated.preface), false, 'Preface must not contain "saya"');
  assert.strictEqual(/\bkami\b/i.test(generated.preface), false, 'Preface must not contain "kami"');
  assert.ok(generated.preface.toLowerCase().includes('penulis'), 'Preface must use "penulis"');

  // Verify Chapter Titles
  assert.strictEqual(generated.bab1.title, 'BAB I: PENDAHULUAN (LOKASI KERJA PKL)');
  assert.strictEqual(generated.bab2.title, 'BAB II: TOPIK BAHASAN');
  assert.strictEqual(generated.bab3.title, 'BAB III: PENUTUP');

  // Verify Bab III content has Kesimpulan and Saran
  assert.ok(generated.bab3.metodePelaksanaan.includes('A. Kesimpulan:'));
  assert.ok(generated.bab3.lingkupPekerjaan.some(s => s.includes('B. Saran:')));

  // Verify 11 official appendices
  assert.ok(generated.appendices, 'Appendices must exist');
  assert.strictEqual(generated.appendices.length, 11, 'Must have 11 official appendices for UNP PKL');
  assert.ok(generated.appendices.some(a => a.title.includes('Lampiran 1.5')));
  assert.ok(generated.appendices.some(a => a.title.includes('Lampiran 1.6')));
  assert.ok(generated.appendices.some(a => a.title.includes('Lampiran 1.4')));
});

test('generateAcademicProposalDocx generates DOCX blob for UNP without throwing error', async () => {
  const unpPreset = CAMPUS_PRESETS.find(p => p.id === 'unp');
  const answers: Record<string, string> = {
    divisi_unit: 'Departemen Tambang & Pemeliharaan Mesin Pabrik Indarung V',
    masalah_teknis: 'Tingginya getaran vibrasi abnormal bearing pada unit Finish Mill 5R1.',
    metode_tools: 'Vibration Analyzer Fluke 810, Form Checklist SOP Harian, Buku Harian Asli.',
    deliverable_output: '1 Berkas Laporan PKL 3 Bab Baku FT UNP 2025 dan Form Bimbingan UHI.'
  };

  const generated = buildDenseAcademicDocument(
    'Analisis Preventive Maintenance Mesin Finish Mill Indarung V PT Semen Padang Berbasis Kepatuhan SOP dan Getaran Vibrasi',
    'magang',
    answers,
    'Rahmat Hidayat',
    '21063045',
    'Universitas Negeri Padang (UNP)',
    'Teknik Mesin',
    'PT Semen Padang (Persero)',
    unpPreset,
    'laporan_pkl_unp'
  );

  const blob = await generateAcademicProposalDocx(generated);
  assert.ok(blob, 'Must return a Blob');
  assert.ok(blob.size > 1000, 'Blob size should be substantial');
});
