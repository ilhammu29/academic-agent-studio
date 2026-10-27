/** Pemeriksaan lokal format dan konsistensi sitasi. Tidak memverifikasi metadata,
 * akses terbuka, pencabutan, atau isi sumber terhadap basis data eksternal. */

import type { BibliographyItem, ProposalDocument } from '../types/studio.ts';

export type EvidenceVerificationLevel =
  | 'LEVEL_0_UNVERIFIED'           // No source found or claim unsupported
  | 'LEVEL_1_METADATA_VERIFIED'     // Verified publication metadata & DOI exists
  | 'LEVEL_2_ABSTRACT_GROUNDED'     // Abstract confirms the conceptual claim
  | 'LEVEL_3_FULL_TEXT_VERIFIED';   // Open-access / full-text peer-reviewed validation

export interface VerifiedReference {
  id: number | string;
  doi?: string;
  cleanDoi?: string;
  title: string;
  authors: string[];
  year: number | string;
  venue: string;
  url?: string;
  isOpenAccess: boolean;
  isRetracted: boolean;
  retractionDetails?: string;
  verificationLevel: EvidenceVerificationLevel;
  supportedClaims: string[];
  confidenceScore: number; // 0.0 to 1.0
  providerSource: 'OpenAlex' | 'Crossref' | 'SemanticScholar' | 'Manual';
}

export interface CitationIntegrityIssue {
  type: 
    | 'ORPHAN_BIBLIOGRAPHY'       // In references but never cited in body
    | 'MISSING_BIBLIOGRAPHY'      // Cited in body (e.g. (Smith, 2023)) but not in references
    | 'INVALID_OR_FAKED_DOI'      // Malformed or non-resolving DOI
    | 'RETRACTED_PAPER_CITED'     // Paper has been officially retracted
    | 'YEAR_AUTHOR_MISMATCH'      // Year or author name mismatch between in-text and references
    | 'UNGROUNDED_CRITICAL_CLAIM' // Empirical assertion made without literature citation
    | 'FORMAT_INCONSISTENCY';     // Mixing APA with IEEE syntax
  severity: 'critical' | 'high' | 'medium' | 'low';
  location: string;
  description: string;
  evidence: string;
  remediation: string;
}

export interface EvidenceAuditReport {
  timestamp: string;
  totalReferencesChecked: number;
  verifiedCount: number;
  retractedCount: number;
  integrityIssuesCount: number;
  integrityScore: number; // 0 - 100%
  references: VerifiedReference[];
  issues: CitationIntegrityIssue[];
}

/**
 * Validate DOI format syntax (e.g. 10.1000/182)
 */
export function isValidDoiSyntax(doi?: string): boolean {
  if (!doi) return false;
  const clean = doi.replace(/^https?:\/\/doi\.org\//, '').trim();
  // Standard DOI regex: 10.NNNN/...
  const doiRegex = /^10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+$/;
  return doiRegex.test(clean);
}

export function extractCleanDoi(doiOrUrl?: string): string | null {
  if (!doiOrUrl) return null;
  const match = doiOrUrl.match(/10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+/);
  return match ? match[0] : null;
}

/**
 * Extract in-text citation keys from manuscript body
 * Matches patterns like (Author, 2024), (Author et al., 2024), or [1], [2]
 */
export function extractInTextCitations(fullText: string): { apaCitations: string[]; ieeeCitations: number[] } {
  const apaCitations: string[] = [];
  const ieeeCitations: number[] = [];

  // 1. APA regex: (Smith, 2024) or (Smith & Johnson, 2023) or (Smith et al., 2022)
  const apaRegex = /\(([A-Z][a-zA-Z\s&.,]+,\s*(?:19|20)\d{2})\)/g;
  let match;
  while ((match = apaRegex.exec(fullText)) !== null) {
    apaCitations.push(match[1]);
  }

  // 2. IEEE regex: [1], [2], [1-3]
  const ieeeRegex = /\[(\d{1,3})\]/g;
  while ((match = ieeeRegex.exec(fullText)) !== null) {
    const num = parseInt(match[1], 10);
    if (!isNaN(num) && !ieeeCitations.includes(num)) {
      ieeeCitations.push(num);
    }
  }

  return { apaCitations, ieeeCitations };
}

/**
 * Perform comprehensive citation integrity & evidence audit on a proposal document
 */
export function auditCitationIntegrity(doc: ProposalDocument): EvidenceAuditReport {
  const issues: CitationIntegrityIssue[] = [];
  const verifiedRefs: VerifiedReference[] = [];

  // Compile full text from all chapters for cross-referencing
  const textBodyParts: string[] = [];
  if (doc.bab1) {
    textBodyParts.push(...(doc.bab1.latarBelakang || []));
    textBodyParts.push(...(doc.bab1.rumusanMasalah || []));
    textBodyParts.push(...(doc.bab1.tujuanKhusus || []));
  }
  if (doc.bab2) {
    textBodyParts.push(doc.bab2.profilInstansi || '');
    (doc.bab2.landasanTeori || []).forEach(t => {
      textBodyParts.push(`${t.topic} ${t.elaboration} ${t.citation}`);
    });
    if ((doc.bab2 as any).teoriDasar && Array.isArray((doc.bab2 as any).teoriDasar)) {
      ((doc.bab2 as any).teoriDasar).forEach((t: any) => {
        textBodyParts.push(`${t.topic || ''} ${t.elaboration || ''} ${t.citation || ''}`);
      });
    }
  }
  if (doc.bab3) {
    textBodyParts.push(doc.bab3.metodePelaksanaan || '');
    textBodyParts.push(...(doc.bab3.lingkupPekerjaan || []));
  }
  if (doc.bab4) {
    textBodyParts.push(doc.bab4.penutup || '');
  }
  if (doc.bab5) {
    textBodyParts.push(...(doc.bab5.kesimpulanUsulan || []));
  }

  const fullManuscriptText = textBodyParts.join(' ');
  const { apaCitations, ieeeCitations } = extractInTextCitations(fullManuscriptText);
  const bibliography = doc.bibliography || [];

  // 1. Check Bibliography Entries for DOI validity, metadata & retraction
  bibliography.forEach((item, index) => {
    const cleanDoi = extractCleanDoi(item.doiUrl);
    const hasValidDoi = isValidDoiSyntax(cleanDoi || undefined);

    // Syntax checks do not establish that a source or its metadata exists.
    const verificationLevel: EvidenceVerificationLevel = 'LEVEL_0_UNVERIFIED';
    const confidenceScore = 0;

    if (item.doiUrl && !hasValidDoi) {
      issues.push({
        type: 'INVALID_OR_FAKED_DOI',
        severity: 'high',
        location: `Daftar Pustaka [Entri #${index + 1}]`,
        description: `Tautan atau format DOI '${item.doiUrl}' tidak valid secara sintaksis standar internasional (10.NNNN/...).`,
        evidence: `Entri: ${item.author} (${item.year}). ${item.title}.`,
        remediation: 'Periksa kembali DOI asli artikel di Crossref, OpenAlex, atau landing page jurnal penerbit.'
      });
    }

    verifiedRefs.push({
      id: item.id || index + 1,
      doi: item.doiUrl,
      cleanDoi: cleanDoi || undefined,
      title: item.title,
      authors: item.author ? [item.author] : [],
      year: item.year,
      venue: item.source,
      url: item.doiUrl,
      isOpenAccess: false,
      isRetracted: false,
      verificationLevel,
      supportedClaims: [],
      confidenceScore,
      providerSource: 'Manual'
    });
  });

  // 2. Check for Orphan Bibliography (References listed in bibliography but never cited in text)
  const citationStyle = doc.campusGuideline?.citationStyle || 'apa';

  bibliography.forEach((item) => {
    const authorLastName = item.author.split(/[\s,]+/)[0].toLowerCase();
    const yearStr = String(item.year);

    const isCitedInApa = apaCitations.some(cit => {
      const citLower = cit.toLowerCase();
      return citLower.includes(authorLastName) && citLower.includes(yearStr);
    });

    const isCitedInIeee = ieeeCitations.includes(Number(item.id));

    const isCitedAnywhereInText = fullManuscriptText.toLowerCase().includes(authorLastName);

    if (!isCitedInApa && !isCitedInIeee && !isCitedAnywhereInText) {
      issues.push({
        type: 'ORPHAN_BIBLIOGRAPHY',
        severity: 'medium',
        location: `Daftar Pustaka: ${item.author} (${item.year})`,
        description: `Referensi '${item.title}' terdaftar dalam Daftar Pustaka tetapi tidak pernah disitir pada paragraf isi manapun.`,
        evidence: `Pustaka: ${item.author} (${item.year}). ${item.title}.`,
        remediation: 'Sisipkan rujukan kutipan ke dalam paragraf Bab II (Landasan Teori) atau hapus entri ini jika memang tidak digunakan.'
      });
    }
  });

  // 3. Check for In-text citations missing from Bibliography
  if (citationStyle === 'apa') {
    apaCitations.forEach(citationText => {
      const parts = citationText.split(',');
      const authorPart = parts[0]?.trim().toLowerCase();
      const yearPart = parts[1]?.trim();
      const primarySurname = authorPart.split(/[\s&]+/)[0]?.replace(/[^a-z]/g, '');

      const existsInBib = bibliography.some(b => {
        const bAuthor = b.author.toLowerCase();
        const bYear = String(b.year).trim();
        const yearMatches = !yearPart || bYear === yearPart;
        const authorMatches = bAuthor.includes(authorPart) || (primarySurname ? bAuthor.includes(primarySurname) : false);
        return authorMatches && yearMatches;
      });

      if (!existsInBib && authorPart) {
        issues.push({
          type: 'MISSING_BIBLIOGRAPHY',
          severity: 'critical',
          location: `Naskah Isi: Sitasi (${citationText})`,
          description: `Kutipan in-text '(${citationText})' ada di dalam teks, namun rincian publikasinya tidak ditemukan dalam Daftar Pustaka.`,
          evidence: `Sitasi teks: (${citationText})`,
          remediation: `Tambahkan entri lengkap untuk '${citationText}' ke dalam Daftar Pustaka.`
        });
      }
    });
  }

  // 4. Format Inconsistency Audit (detect mixing APA with IEEE syntax)
  if (apaCitations.length > 0 && ieeeCitations.length > 0) {
    issues.push({
      type: 'FORMAT_INCONSISTENCY',
      severity: 'high',
      location: 'Seluruh Naskah Dokumen',
      description: `Ditemukan ketidakkonsistenan format sitasi: dokumen memuat ${apaCitations.length} sitasi gaya APA (Penulis, Tahun) dan ${ieeeCitations.length} sitasi bernomor gaya IEEE [n].`,
      evidence: `Contoh APA: (${apaCitations[0] || ''}) vs Contoh IEEE: [${ieeeCitations[0] || '1'}]`,
      remediation: `Standardisasi seluruh naskah menggunakan satu format tunggal (${citationStyle.toUpperCase()}).`
    });
  }

  // Calculate overall integrity score
  const totalRefs = bibliography.length;
  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  const highCount = issues.filter(i => i.severity === 'high').length;
  const mediumCount = issues.filter(i => i.severity === 'medium').length;

  let penalty = criticalCount * 25 + highCount * 10 + mediumCount * 5;
  const integrityScore = Math.max(0, Math.min(100, 100 - penalty));

  return {
    timestamp: new Date().toISOString(),
    totalReferencesChecked: totalRefs,
    verifiedCount: verifiedRefs.filter(r => r.verificationLevel !== 'LEVEL_0_UNVERIFIED').length,
    retractedCount: verifiedRefs.filter(r => r.isRetracted).length,
    integrityIssuesCount: issues.length,
    integrityScore,
    references: verifiedRefs,
    issues
  };
}
