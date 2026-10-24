/**
 * OXID ACADEMIC STUDIO — ACADEMIC RULE ENGINE & REGISTRY
 * 
 * Single Source of Truth for Institutional Academic Guidelines & Formats.
 * Implements:
 * 1. Comprehensive Rule Registry with multi-level institutional metadata
 * 2. Hierarchy & Precedence Resolution (institution -> faculty -> studyProgram -> degree -> documentType)
 * 3. Conflict Detection with Dual-Source Citations
 * 4. Deterministic & Semantic Rule Validation Pipeline with Severity Levels
 */

import type { ProposalDocument, CampusGuideline, ProposalCategory, ReportType } from '../types/studio.ts';

export type DegreeLevel = 'D3' | 'D4' | 'S1' | 'S2' | 'S3';
export type AcademicDocumentType =
  | 'proposal_magang'
  | 'laporan_magang'
  | 'proposal_skripsi'
  | 'skripsi_final'
  | 'proposal_penelitian'
  | 'laporan_penelitian'
  | 'tesis';

export type RuleCategory =
  | 'page_setup'
  | 'typography'
  | 'frontmatter'
  | 'numbering'
  | 'headings'
  | 'tables_figures'
  | 'citations'
  | 'appendices'
  | 'defense';

export type RuleSeverity = 'critical' | 'high' | 'medium' | 'low';
export type RuleStatus = 'mandatory' | 'optional' | 'conditional';
export type VerificationStatus = 'verified' | 'unverified' | 'community_contributed';

export interface RuleChangelogEntry {
  date: string;
  version: string;
  summary: string;
  author: string;
}

export interface AcademicRule {
  id: string;
  category: RuleCategory;
  ruleName: string;
  description: string;
  institution: string;
  faculty?: string;
  studyProgram?: string;
  degree?: DegreeLevel;
  documentType?: AcademicDocumentType;
  guidelineName: string;
  guidelineVersion: string;
  effectiveYear: number;
  officialSourcePage: string;
  status: RuleStatus;
  verificationStatus: VerificationStatus;
  conditionText?: string;
  value: Record<string, any>;
  changelog: RuleChangelogEntry[];
}

export interface RuleConflict {
  category: RuleCategory;
  ruleIdA: string;
  sourceA: string;
  valueA: any;
  ruleIdB: string;
  sourceB: string;
  valueB: any;
  conflictDescription: string;
  requiresHumanResolution: boolean;
}

export interface RuleViolation {
  ruleId: string;
  category: RuleCategory;
  severity: RuleSeverity;
  location: string;
  ruleName: string;
  guidelineSource: string;
  officialSourcePage: string;
  explanation: string;
  recommendation: string;
  isDeterministic: boolean;
  remediationStatus: 'pending' | 'resolved' | 'ignored';
}

export interface RuleValidationReport {
  timestamp: string;
  institution: string;
  documentType: AcademicDocumentType;
  totalRulesEvaluated: number;
  passedCount: number;
  violationsCount: number;
  criticalCount: number;
  violations: RuleViolation[];
  conflicts: RuleConflict[];
  compliancePercentage: number;
}

// ============================================================================
// DEFAULT INSTITUTIONAL ACADEMIC RULE REGISTRY
// ============================================================================

export const DEFAULT_ACADEMIC_RULES: AcademicRule[] = [
  // --- STANDAR DIKTI GENERAL (FALLBACK BASELINE) ---
  {
    id: 'DIKTI-PAGE-SIZE-001',
    category: 'page_setup',
    ruleName: 'Ukuran Kertas Standar A4',
    description: 'Naskah akademik wajib dicetak pada kertas HVS putih berukuran A4 (21 x 29.7 cm) 80 gram.',
    institution: 'Kemendiktisaintek RI',
    degree: 'S1',
    guidelineName: 'Pedoman Penulisan Karya Ilmiah Standar Nasional',
    guidelineVersion: 'v2024.1',
    effectiveYear: 2024,
    officialSourcePage: 'Pedoman Dikti Hal. 8',
    status: 'mandatory',
    verificationStatus: 'verified',
    value: { paperSize: 'A4', widthCm: 21, heightCm: 29.7, paperWeightGsm: 80 },
    changelog: [{ date: '2024-01-10', version: 'v2024.1', summary: 'Standar kertas A4 80gsm', author: 'Dikti' }]
  },
  {
    id: 'DIKTI-MARGIN-001',
    category: 'page_setup',
    ruleName: 'Margin Halaman Standar 4-4-3-3',
    description: 'Batas tepi pengetikan adalah Kiri 4 cm, Atas 4 cm, Kanan 3 cm, dan Bawah 3 cm.',
    institution: 'Kemendiktisaintek RI',
    guidelineName: 'Pedoman Penulisan Karya Ilmiah Standar Nasional',
    guidelineVersion: 'v2024.1',
    effectiveYear: 2024,
    officialSourcePage: 'Pedoman Dikti Hal. 9',
    status: 'mandatory',
    verificationStatus: 'verified',
    value: { leftCm: 4, topCm: 4, rightCm: 3, bottomCm: 3 },
    changelog: [{ date: '2024-01-10', version: 'v2024.1', summary: 'Margin 4-4-3-3 cm baku', author: 'Dikti' }]
  },
  {
    id: 'DIKTI-TYPO-TNR-001',
    category: 'typography',
    ruleName: 'Tipografi Times New Roman 12pt Spasi 1.5',
    description: 'Huruf naskah isi menggunakan Times New Roman ukuran 12pt dengan jarak antarbaris 1.5 spasi.',
    institution: 'Kemendiktisaintek RI',
    guidelineName: 'Pedoman Penulisan Karya Ilmiah Standar Nasional',
    guidelineVersion: 'v2024.1',
    effectiveYear: 2024,
    officialSourcePage: 'Pedoman Dikti Hal. 10',
    status: 'mandatory',
    verificationStatus: 'verified',
    value: { fontFamily: 'Times New Roman', bodySizePt: 12, heading1SizePt: 14, lineSpacing: 1.5 },
    changelog: [{ date: '2024-01-10', version: 'v2024.1', summary: 'Font Times New Roman 12pt', author: 'Dikti' }]
  },
  {
    id: 'DIKTI-TABLE-3LINES-001',
    category: 'tables_figures',
    ruleName: 'Tabel Terbuka Tiga Garis Horizontal',
    description: 'Format tabel ilmiah wajib menggunakan tabel terbuka tanpa garis vertikal, hanya terdiri dari 3 garis horizontal utama.',
    institution: 'Kemendiktisaintek RI',
    guidelineName: 'Pedoman Penulisan Karya Ilmiah Standar Nasional',
    guidelineVersion: 'v2024.1',
    effectiveYear: 2024,
    officialSourcePage: 'Pedoman Dikti Hal. 14',
    status: 'mandatory',
    verificationStatus: 'verified',
    value: { openThreeLines: true, verticalBorders: false },
    changelog: [{ date: '2024-01-10', version: 'v2024.1', summary: 'Format tabel terbuka 3 garis', author: 'Dikti' }]
  },
  {
    id: 'DIKTI-PAGINATION-001',
    category: 'numbering',
    ruleName: 'Penomoran Halaman Campuran (Romawi Awal & Arab Isi)',
    description: 'Bagian awal bernomor Romawi kecil (i, ii...) di tengah bawah; Bagian isi bernomor Arab (1, 2...) di kanan atas kecuali awal bab di tengah bawah.',
    institution: 'Kemendiktisaintek RI',
    guidelineName: 'Pedoman Penulisan Karya Ilmiah Standar Nasional',
    guidelineVersion: 'v2024.1',
    effectiveYear: 2024,
    officialSourcePage: 'Pedoman Dikti Hal. 12',
    status: 'mandatory',
    verificationStatus: 'verified',
    value: {
      frontmatterStyle: 'roman_lower',
      frontmatterPosition: 'bottom_center',
      bodyStyle: 'arabic',
      bodyPositionNormal: 'top_right',
      bodyPositionChapterStart: 'bottom_center'
    },
    changelog: [{ date: '2024-01-10', version: 'v2024.1', summary: 'Sistem penomoran halaman baku', author: 'Dikti' }]
  },

  // --- INSTITUTION SPECIFIC: UNIVERSITAS SEBELAS MARET (UNS) ---
  {
    id: 'UNS-MARGIN-001',
    category: 'page_setup',
    ruleName: 'Margin Tugas Akhir & Skripsi UNS 4-4-3-3',
    description: 'Pedoman Tugas Akhir UNS mewajibkan batas tepi Kiri 4 cm, Atas 4 cm, Kanan 3 cm, dan Bawah 3 cm.',
    institution: 'Universitas Sebelas Maret (UNS)',
    guidelineName: 'Buku Pedoman Penulisan Skripsi UNS',
    guidelineVersion: 'v2024.2',
    effectiveYear: 2024,
    officialSourcePage: 'Pedoman Skripsi UNS Hal. 15',
    status: 'mandatory',
    verificationStatus: 'verified',
    value: { leftCm: 4, topCm: 4, rightCm: 3, bottomCm: 3 },
    changelog: [{ date: '2024-03-01', version: 'v2024.2', summary: 'Pengesahan Pedoman TA UNS', author: 'LPPM UNS' }]
  },
  {
    id: 'UNS-HEADING-STYLE-001',
    category: 'headings',
    ruleName: 'Gaya Penomoran Subbab Desimal UNS',
    description: 'Penomoran bab angka Romawi (BAB I, BAB II), subbab menggunakan desimal bertingkat (1.1, 1.1.1).',
    institution: 'Universitas Sebelas Maret (UNS)',
    guidelineName: 'Buku Pedoman Penulisan Skripsi UNS',
    guidelineVersion: 'v2024.2',
    effectiveYear: 2024,
    officialSourcePage: 'Pedoman Skripsi UNS Hal. 18',
    status: 'mandatory',
    verificationStatus: 'verified',
    value: { headingStyle: 'decimal', chapterPrefix: 'BAB ' },
    changelog: [{ date: '2024-03-01', version: 'v2024.2', summary: 'Gaya penomoran subbab desimal', author: 'LPPM UNS' }]
  },

  // --- INSTITUTION SPECIFIC: INSTITUT TEKNOLOGI BANDUNG (ITB) ---
  {
    id: 'ITB-CITATION-IEEE-001',
    category: 'citations',
    ruleName: 'Sitasi Standar IEEE / Harvard ITB',
    description: 'Fakultas Teknik & Sains ITB mengutamakan penulisan sitasi menggunakan format IEEE bernomor siku [1] atau Harvard.',
    institution: 'Institut Teknologi Bandung (ITB)',
    guidelineName: 'Pedoman Penulisan Tugas Akhir & Tesis ITB',
    guidelineVersion: 'v2023.1',
    effectiveYear: 2023,
    officialSourcePage: 'Pedoman Pascasarjana ITB Hal. 22',
    status: 'mandatory',
    verificationStatus: 'verified',
    value: { citationStyle: 'ieee', numericOrder: true },
    changelog: [{ date: '2023-08-15', version: 'v2023.1', summary: 'Ketentuan sitasi IEEE ITB', author: 'SPS ITB' }]
  },

  // --- INSTITUTION SPECIFIC: UNIVERSITAS INDONESIA (UI) ---
  {
    id: 'UI-FRONTMATTER-ORDER-001',
    category: 'frontmatter',
    ruleName: 'Urutan Kelengkapan Awal UI',
    description: 'Halaman Sampul -> Halaman Judul -> Pernyataan Bebas Plagiarisme -> Lembar Pengesahan -> Kata Pengantar -> Lembar Persetujuan Publikasi -> Abstrak (ID & EN) -> Daftar Isi.',
    institution: 'Universitas Indonesia (UI)',
    guidelineName: 'Pedoman Teknis Penulisan Tugas Akhir UI',
    guidelineVersion: 'v2024.1',
    effectiveYear: 2024,
    officialSourcePage: 'Pedoman UI Hal. 11',
    status: 'mandatory',
    verificationStatus: 'verified',
    value: {
      sequence: [
        'cover',
        'title_page',
        'plagiarism_declaration',
        'approval_sheet',
        'preface',
        'publication_consent',
        'abstract_id',
        'abstract_en',
        'table_of_contents'
      ]
    },
    changelog: [{ date: '2024-01-20', version: 'v2024.1', summary: 'Urutan baku kelengkapan awal UI', author: 'UI Press' }]
  },

  // --- SPECIFIC DOCUMENT TYPE: LAPORAN MAGANG INDUSTRI ---
  {
    id: 'MAGANG-CHAPTER-STRUCTURE-001',
    category: 'frontmatter',
    ruleName: 'Struktur Wajib Laporan Magang Industri',
    description: 'Laporan magang wajib memuat Profil Instansi & Struktur Organisasi di Bab II, serta Logbook Kegiatan Terverifikasi di Lampiran.',
    institution: 'Kemendiktisaintek RI',
    documentType: 'laporan_magang',
    guidelineName: 'Panduan Magang Studi Independen Bersertifikat (MSIB)',
    guidelineVersion: 'v2024.1',
    effectiveYear: 2024,
    officialSourcePage: 'Buku Panduan Magang MSIB Hal. 24',
    status: 'mandatory',
    verificationStatus: 'verified',
    value: {
      requiresCompanyProfile: true,
      requiresOrganizationStructure: true,
      requiresVerifiedLogbook: true,
      requiresIndustryMentorSignature: true
    },
    changelog: [{ date: '2024-02-01', version: 'v2024.1', summary: 'Struktur laporan magang industri', author: 'MSIB' }]
  }
];

// ============================================================================
// RULE RESOLUTION & PRECEDENCE ENGINE
// ============================================================================

export interface RuleResolutionContext {
  institution: string;
  faculty?: string;
  studyProgram?: string;
  degree?: DegreeLevel;
  documentType: AcademicDocumentType;
  guidelineVersion?: string;
}

/**
 * Resolves active rules based on explicit precedence hierarchy:
 * institution -> faculty -> studyProgram -> degree -> documentType -> guidelineVersion
 */
export function resolveActiveRules(
  context: RuleResolutionContext,
  allRules: AcademicRule[] = DEFAULT_ACADEMIC_RULES
): { activeRules: Map<string, AcademicRule>; conflicts: RuleConflict[] } {
  const activeRules = new Map<string, AcademicRule>();
  const categoryRules = new Map<RuleCategory, AcademicRule[]>();
  const conflicts: RuleConflict[] = [];

  // Calculate specificity score for each rule
  for (const rule of allRules) {
    // Check compatibility
    const institutionMatch =
      rule.institution === context.institution || rule.institution === 'Kemendiktisaintek RI';
    if (!institutionMatch) continue;

    if (rule.faculty && context.faculty && rule.faculty !== context.faculty) continue;
    if (rule.studyProgram && context.studyProgram && rule.studyProgram !== context.studyProgram) continue;
    if (rule.degree && context.degree && rule.degree !== context.degree) continue;
    if (rule.documentType && rule.documentType !== context.documentType) continue;

    // Track for conflict detection
    const existing = categoryRules.get(rule.category) || [];
    existing.push(rule);
    categoryRules.set(rule.category, existing);
  }

  // Detect conflicts and resolve precedence
  for (const [cat, rules] of categoryRules.entries()) {
    // Sort rules by specificity
    rules.sort((a, b) => getRuleSpecificity(b, context) - getRuleSpecificity(a, context));

    if (rules.length > 1) {
      const topRule = rules[0];
      const secondRule = rules[1];

      // Check if values conflict on key parameters
      if (hasValueConflict(topRule.value, secondRule.value)) {
        conflicts.push({
          category: cat,
          ruleIdA: topRule.id,
          sourceA: `${topRule.institution} (${topRule.officialSourcePage})`,
          valueA: topRule.value,
          ruleIdB: secondRule.id,
          sourceB: `${secondRule.institution} (${secondRule.officialSourcePage})`,
          valueB: secondRule.value,
          conflictDescription: `Konflik aturan pada kategori '${cat}' antara pedoman institusi '${topRule.institution}' dengan pedoman '${secondRule.institution}'. Sistem menerapkan aturan yang lebih spesifik (${topRule.ruleName}).`,
          requiresHumanResolution: topRule.institution === secondRule.institution
        });
      }
    }

    // Set highest specificity rule
    if (rules[0]) {
      activeRules.set(rules[0].id, rules[0]);
    }
  }

  return { activeRules, conflicts };
}

function getRuleSpecificity(rule: AcademicRule, context: RuleResolutionContext): number {
  let score = 0;
  if (rule.institution === context.institution) score += 50;
  if (rule.faculty && rule.faculty === context.faculty) score += 30;
  if (rule.studyProgram && rule.studyProgram === context.studyProgram) score += 20;
  if (rule.degree && rule.degree === context.degree) score += 10;
  if (rule.documentType && rule.documentType === context.documentType) score += 10;
  if (rule.guidelineVersion && rule.guidelineVersion === context.guidelineVersion) score += 5;
  return score;
}

function hasValueConflict(valA: Record<string, any>, valB: Record<string, any>): boolean {
  for (const key of Object.keys(valA)) {
    if (valB[key] !== undefined && JSON.stringify(valA[key]) !== JSON.stringify(valB[key])) {
      return true;
    }
  }
  return false;
}

// ============================================================================
// DETERMINISTIC & SEMANTIC RULE VALIDATOR
// ============================================================================

export function validateProposalDocumentRules(
  doc: ProposalDocument,
  context: RuleResolutionContext,
  allRules: AcademicRule[] = DEFAULT_ACADEMIC_RULES
): RuleValidationReport {
  const { activeRules, conflicts } = resolveActiveRules(context, allRules);
  const violations: RuleViolation[] = [];
  let passedCount = 0;

  for (const [, rule] of activeRules) {
    let rulePassed = true;

    // 1. Page Setup / Margins
    if (rule.category === 'page_setup' && rule.value.leftCm) {
      const docMargins = doc.campusGuideline?.margins;
      if (docMargins) {
        if (
          docMargins.leftCm !== rule.value.leftCm ||
          docMargins.topCm !== rule.value.topCm ||
          docMargins.rightCm !== rule.value.rightCm ||
          docMargins.bottomCm !== rule.value.bottomCm
        ) {
          violations.push({
            ruleId: rule.id,
            category: rule.category,
            severity: 'critical',
            location: 'Pengaturan Kertas & Margin',
            ruleName: rule.ruleName,
            guidelineSource: rule.guidelineName,
            officialSourcePage: rule.officialSourcePage,
            explanation: `Margin dokumen saat ini (${docMargins.leftCm}-${docMargins.topCm}-${docMargins.rightCm}-${docMargins.bottomCm} cm) tidak sesuai dengan standar wajib institusi (${rule.value.leftCm}-${rule.value.topCm}-${rule.value.rightCm}-${rule.value.bottomCm} cm).`,
            recommendation: `Sesuaikan margin dokumen pada pengaturan kampus menjadi Kiri: ${rule.value.leftCm}cm, Atas: ${rule.value.topCm}cm, Kanan: ${rule.value.rightCm}cm, Bawah: ${rule.value.bottomCm}cm.`,
            isDeterministic: true,
            remediationStatus: 'pending'
          });
          rulePassed = false;
        }
      }
    }

    // 2. Typography
    if (rule.category === 'typography' && rule.value.fontFamily) {
      const docFont = doc.campusGuideline?.typography?.fontFamily;
      if (docFont && docFont.toLowerCase() !== rule.value.fontFamily.toLowerCase()) {
        violations.push({
          ruleId: rule.id,
          category: rule.category,
          severity: 'high',
          location: 'Format Tipografi Dokumen',
          ruleName: rule.ruleName,
          guidelineSource: rule.guidelineName,
          officialSourcePage: rule.officialSourcePage,
          explanation: `Jenis huruf naskah (${docFont}) tidak selaras dengan pedoman resmi (${rule.value.fontFamily}).`,
          recommendation: `Ganti jenis huruf utama naskah menjadi ${rule.value.fontFamily} dengan ukuran teks 12pt.`,
          isDeterministic: true,
          remediationStatus: 'pending'
        });
        rulePassed = false;
      }
    }

    // 3. Heading Style
    if (rule.category === 'headings' && rule.value.headingStyle) {
      const docHeading = doc.campusGuideline?.headingStyle;
      if (docHeading && docHeading !== rule.value.headingStyle) {
        violations.push({
          ruleId: rule.id,
          category: rule.category,
          severity: 'medium',
          location: 'Penomoran Judul & Subbab',
          ruleName: rule.ruleName,
          guidelineSource: rule.guidelineName,
          officialSourcePage: rule.officialSourcePage,
          explanation: `Sistem penomoran subbab saat ini menggunakan format '${docHeading}', sedangkan institusi mewajibkan format '${rule.value.headingStyle}'.`,
          recommendation: `Pilih opsi gaya penomoran '${rule.value.headingStyle}' pada bilah alat format naskah.`,
          isDeterministic: true,
          remediationStatus: 'pending'
        });
        rulePassed = false;
      }
    }

    // 4. Citation Style
    if (rule.category === 'citations' && rule.value.citationStyle) {
      const docCitation = doc.campusGuideline?.citationStyle;
      if (docCitation && docCitation.toLowerCase() !== rule.value.citationStyle.toLowerCase()) {
        violations.push({
          ruleId: rule.id,
          category: rule.category,
          severity: 'high',
          location: 'Daftar Pustaka & Sitasi',
          ruleName: rule.ruleName,
          guidelineSource: rule.guidelineName,
          officialSourcePage: rule.officialSourcePage,
          explanation: `Format sitasi (${docCitation.toUpperCase()}) tidak sesuai dengan kewajiban fakultas/program studi (${rule.value.citationStyle.toUpperCase()}).`,
          recommendation: `Ubah sakelar format sitasi menjadi ${rule.value.citationStyle.toUpperCase()} untuk memenuhi standar penulisan artikel/tugas akhir.`,
          isDeterministic: true,
          remediationStatus: 'pending'
        });
        rulePassed = false;
      }
    }

    // 5. Structure & Special Sheets (e.g. Laporan Magang)
    if (rule.documentType === 'laporan_magang' && rule.value.requiresVerifiedLogbook) {
      if (!doc.logbookEntries || doc.logbookEntries.length === 0) {
        violations.push({
          ruleId: rule.id,
          category: 'frontmatter',
          severity: 'critical',
          location: 'Lampiran / Kelengkapan Laporan Magang',
          ruleName: rule.ruleName,
          guidelineSource: rule.guidelineName,
          officialSourcePage: rule.officialSourcePage,
          explanation: 'Laporan magang wajib memuat logbook aktivitas mingguan/harian terverifikasi oleh pembimbing lapangan.',
          recommendation: 'Buka menu Kelola Naskah > Logbook Catatan Lapangan dan lengkapi entri kegiatan magang Anda.',
          isDeterministic: true,
          remediationStatus: 'pending'
        });
        rulePassed = false;
      }
    }

    if (rulePassed) {
      passedCount++;
    }
  }

  const totalRules = activeRules.size;
  const criticalCount = violations.filter(v => v.severity === 'critical').length;
  const compliancePercentage = totalRules > 0 ? Math.round((passedCount / totalRules) * 100) : 100;

  return {
    timestamp: new Date().toISOString(),
    institution: context.institution,
    documentType: context.documentType,
    totalRulesEvaluated: totalRules,
    passedCount,
    violationsCount: violations.length,
    criticalCount,
    violations,
    conflicts,
    compliancePercentage
  };
}
