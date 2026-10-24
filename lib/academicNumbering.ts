/**
 * Academic Numbering Helper for Indonesian Higher Education (Dikti / Kampus)
 * Supports:
 * - 'decimal': 1.1, 1.2, 1.2.1, a., 1)
 * - 'alphanumeric': A., B., 1., a., 1) (Standar Klasik / ITB / UI / UGM)
 * - 'roman': I.A., I.B., 1., a.
 */

export type HeadingStyleType = 'decimal' | 'alphanumeric' | 'roman';

export function getSectionHeading(
  chapterNumber: number,
  sectionIndex: number,
  title: string,
  style: HeadingStyleType = 'decimal'
): string {
  const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M"];
  const romans = ["I", "II", "III", "IV", "V", "VI"];

  if (style === 'alphanumeric') {
    const letter = letters[sectionIndex] || String.fromCharCode(65 + sectionIndex);
    return `${letter}. ${title}`;
  }

  if (style === 'roman') {
    const romanCh = romans[chapterNumber - 1] || chapterNumber;
    const letter = letters[sectionIndex] || String.fromCharCode(65 + sectionIndex);
    return `${romanCh}.${letter} ${title}`;
  }

  // Default Decimal (1.1, 1.2, etc.)
  return `${chapterNumber}.${sectionIndex + 1} ${title}`;
}

export function getSubSectionHeading(
  chapterNumber: number,
  sectionIndex: number,
  subSectionIndex: number,
  title: string,
  style: HeadingStyleType = 'decimal'
): string {
  if (style === 'alphanumeric') {
    return `${subSectionIndex + 1}. ${title}`;
  }

  if (style === 'roman') {
    return `${subSectionIndex + 1}. ${title}`;
  }

  return `${chapterNumber}.${sectionIndex + 1}.${subSectionIndex + 1} ${title}`;
}

/**
 * Parses chapter titles (e.g. "BAB I: PENDAHULUAN", "BAB II - TINJAUAN PUSTAKA", "BAB 1 PENDAHULUAN")
 * into separated Chapter Number and Chapter Title for centered Indonesian academic report formatting.
 */
export function parseChapterTitle(
  rawTitle: string,
  fallbackChapter = "BAB I",
  fallbackTitle = "PENDAHULUAN"
): {
  chapterNumber: string;
  chapterTitle: string;
} {
  const cleaned = (rawTitle || "").replace(/\*\*/g, "").trim();
  const match = cleaned.match(/^(BAB\s+[IVXLCDM\d]+)\s*[:\-–]?\s*(.+)$/i);
  if (match) {
    return {
      chapterNumber: match[1].toUpperCase(),
      chapterTitle: match[2].toUpperCase(),
    };
  }
  return {
    chapterNumber: fallbackChapter.toUpperCase(),
    chapterTitle: (cleaned || fallbackTitle).toUpperCase(),
  };
}

