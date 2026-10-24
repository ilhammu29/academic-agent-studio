import { test } from 'node:test';
import assert from 'node:assert';
import { stripDoubleAsterisks, cleanAcademicPlainText, sanitizeAcademicText } from '../lib/textSanitizer.ts';

test('stripDoubleAsterisks removes literal ** without losing text content', () => {
  const input = '**1. Latar Belakang Masalah**';
  const expected = '1. Latar Belakang Masalah';
  assert.strictEqual(stripDoubleAsterisks(input), expected);

  const inline = 'Tujuan penelitian adalah **mengidentifikasi inefisiensi** pada proses data.';
  const expectedInline = 'Tujuan penelitian adalah mengidentifikasi inefisiensi pada proses data.';
  assert.strictEqual(stripDoubleAsterisks(inline), expectedInline);

  const empty = '';
  assert.strictEqual(stripDoubleAsterisks(empty), '');
});

test('sanitizeAcademicText recursively strips ** across nested objects and arrays', () => {
  const complexDoc = {
    title: '**Analisis Kinerja Sistem**',
    category: 'skripsi',
    bab1: {
      latarBelakang: [
        '**Paragraf 1:** Fenomena di lapangan menunjukkan **kesenjangan digital**.',
        'Kondisi operasional belum memenuhi standar **SOP Dikti**.'
      ],
      tujuan: ['**1. Menguji efektivitas**', '2. Menyusun rekomendasi']
    },
    theories: [
      { name: '**Technology Acceptance Model**', citation: '(Davis, **1989**)' }
    ]
  };

  const clean = sanitizeAcademicText(complexDoc);

  assert.strictEqual(clean.title, 'Analisis Kinerja Sistem');
  assert.strictEqual(clean.bab1.latarBelakang[0], 'Paragraf 1: Fenomena di lapangan menunjukkan kesenjangan digital.');
  assert.strictEqual(clean.bab1.latarBelakang[1], 'Kondisi operasional belum memenuhi standar SOP Dikti.');
  assert.strictEqual(clean.bab1.tujuan[0], '1. Menguji efektivitas');
  assert.strictEqual(clean.theories[0].name, 'Technology Acceptance Model');
  assert.strictEqual(clean.theories[0].citation, '(Davis, 1989)');
});
