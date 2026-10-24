import { test } from 'node:test';
import assert from 'node:assert';
import { parseChapterTitle, getSectionHeading, getSubSectionHeading } from '../lib/academicNumbering.ts';

test('parseChapterTitle correctly separates chapter numbers and chapter titles for Dikti centered headings', () => {
  // Test Bab I
  const bab1 = parseChapterTitle("BAB I: PENDAHULUAN");
  assert.strictEqual(bab1.chapterNumber, "BAB I");
  assert.strictEqual(bab1.chapterTitle, "PENDAHULUAN");

  // Test Bab II with ampersand
  const bab2 = parseChapterTitle("BAB II: TINJAUAN PUSTAKA & KERANGKA TEORETIS");
  assert.strictEqual(bab2.chapterNumber, "BAB II");
  assert.strictEqual(bab2.chapterTitle, "TINJAUAN PUSTAKA & KERANGKA TEORETIS");

  // Test with hyphen separator
  const bab3 = parseChapterTitle("BAB III - METODE PENELITIAN & PROTOKOL RISET");
  assert.strictEqual(bab3.chapterNumber, "BAB III");
  assert.strictEqual(bab3.chapterTitle, "METODE PENELITIAN & PROTOKOL RISET");

  // Test with Arabic numbers (BAB 1)
  const babArabic = parseChapterTitle("BAB 1: PENDAHULUAN");
  assert.strictEqual(babArabic.chapterNumber, "BAB 1");
  assert.strictEqual(babArabic.chapterTitle, "PENDAHULUAN");

  // Test stripping asterisks if present
  const babAsterisk = parseChapterTitle("**BAB IV: JADWAL PELAKSANAAN & RENCANA ANGGARAN**");
  assert.strictEqual(babAsterisk.chapterNumber, "BAB IV");
  assert.strictEqual(babAsterisk.chapterTitle, "JADWAL PELAKSANAAN & RENCANA ANGGARAN");

  // Test fallback if title doesn't start with BAB
  const fallback = parseChapterTitle("TINJAUAN PUSTAKA", "BAB II", "TINJAUAN PUSTAKA");
  assert.strictEqual(fallback.chapterNumber, "BAB II");
  assert.strictEqual(fallback.chapterTitle, "TINJAUAN PUSTAKA");
});

test('getSectionHeading preserves sub-heading numbering across decimal and alphanumeric styles', () => {
  const decimalHeading = getSectionHeading(1, 0, "Latar Belakang Masalah", "decimal");
  assert.strictEqual(decimalHeading, "1.1 Latar Belakang Masalah");

  const alphaHeading = getSectionHeading(1, 0, "Latar Belakang Masalah", "alphanumeric");
  assert.strictEqual(alphaHeading, "A. Latar Belakang Masalah");

  const subHeading = getSubSectionHeading(1, 0, 0, "Konsep Dasar", "decimal");
  assert.strictEqual(subHeading, "1.1.1 Konsep Dasar");
});
