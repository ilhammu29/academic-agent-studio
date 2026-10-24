/**
 * OXID ACADEMIC STUDIO — MULTI-AGENT ACADEMIC QA PIPELINE
 * 
 * 7 Specialized Comprehensive Validators:
 * 1. StructuralValidator (Front matter, chapters, sections, appendices)
 * 2. FactualEvidenceValidator (Empirical claims grounded in literature)
 * 3. CitationValidator (Bidirectional references, DOI, APA/IEEE consistency)
 * 4. MethodologyValidator (Alignment between research problem and technical methods)
 * 5. ConsistencyValidator (Cross-checking Title, Problem, Objectives, Method, & Conclusion)
 * 6. AcademicRuleValidator (Verification against institutional rule registry)
 * 7. ExportValidator (DOCX & PPTX structural parameters)
 */

import type { ProposalDocument } from '../types/studio.ts';
import { validateProposalDocumentRules } from './academicRuleEngine.ts';
import type { RuleValidationReport, RuleResolutionContext } from './academicRuleEngine.ts';
import { auditCitationIntegrity } from './evidenceVerifier.ts';
import type { EvidenceAuditReport } from './evidenceVerifier.ts';

export type QASeverity = 'critical' | 'high' | 'medium' | 'low';

export interface QAFinding {
  validatorName: 
    | 'StructuralValidator'
    | 'FactualEvidenceValidator'
    | 'CitationValidator'
    | 'MethodologyValidator'
    | 'ConsistencyValidator'
    | 'AcademicRuleValidator'
    | 'ExportValidator';
  severity: QASeverity;
  location: string;
  issueTitle: string;
  evidence: string;
  reasoning: string;
  recommendation: string;
}

export interface QAPipelineReport {
  timestamp: string;
  documentTitle: string;
  institution: string;
  category: string;
  overallScore: number; // 0 - 100%
  overallStatus: 'EXCELLENT' | 'SATISFACTORY' | 'ACTION_REQUIRED' | 'CRITICAL_ISSUES';
  totalFindingsCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  findings: QAFinding[];
  structuralReport: { isComplete: boolean; missingSections: string[] };
  evidenceReport: EvidenceAuditReport;
  ruleReport: RuleValidationReport;
  consistencyScore: number;
}

function resolveDocType(doc: ProposalDocument): any {
  if (doc.reportType === 'tesis') return 'tesis';
  if (doc.reportType === 'magang') return 'laporan_magang';
  if (doc.reportType === 'skripsi' || doc.reportType === 'tugas_akhir') return 'skripsi_final';
  if (doc.reportType === 'penelitian') return 'laporan_penelitian';
  if (doc.category === 'magang') return 'proposal_magang';
  if (doc.category === 'penelitian') return 'proposal_penelitian';
  return 'proposal_skripsi';
}

/**
 * Execute 7-Phase Academic QA Pipeline on a manuscript
 */
export function runAcademicQAPipeline(
  doc: ProposalDocument,
  resolutionContext?: RuleResolutionContext
): QAPipelineReport {
  const findings: QAFinding[] = [];

  const context: RuleResolutionContext = resolutionContext || {
    institution: doc.institution || doc.campusGuideline?.campusName || 'Standar Dikti',
    faculty: doc.facultyMajor,
    degree: 'S1',
    documentType: resolveDocType(doc)
  };

  // =========================================================================
  // 1. Structural Validator
  // =========================================================================
  const missingSections: string[] = [];

  if (!doc.title || doc.title.trim().length < 10) {
    findings.push({
      validatorName: 'StructuralValidator',
      severity: 'critical',
      location: 'Halaman Sampul (Cover)',
      issueTitle: 'Judul Dokumen Tidak Memadai',
      evidence: `Judul saat ini: "${doc.title || '(Kosong)'}"`,
      reasoning: 'Judul penelitian wajib jelas, mencerminkan ruang lingkup kajian, dan tidak boleh kosong.',
      recommendation: 'Tentukan judul penelitian yang spesifik dan memuat objek kajian.'
    });
    missingSections.push('Judul Naskah');
  }

  if (!doc.bab1 || !doc.bab1.latarBelakang || doc.bab1.latarBelakang.length === 0) {
    findings.push({
      validatorName: 'StructuralValidator',
      severity: 'critical',
      location: 'Bab I: Pendahuluan',
      issueTitle: 'Latar Belakang Belum Terisi',
      evidence: 'Array latar belakang kosong.',
      reasoning: 'Bab I merupakan fondasi utama proposal yang menerangkan urgensi masalah.',
      recommendation: 'Isi paragraf latar belakang yang menguraikan konteks masalah secara piramida terbalik.'
    });
    missingSections.push('Bab 1 Latar Belakang');
  }

  if (!doc.bab2 || (!doc.bab2.landasanTeori && !doc.bab2.profilInstansi)) {
    findings.push({
      validatorName: 'StructuralValidator',
      severity: 'high',
      location: 'Bab II',
      issueTitle: 'Ketiadaan Landasan Teori / Profil Instansi',
      evidence: 'Bab II tidak memiliki data landasan teori maupun profil instansi.',
      reasoning: 'Bab II berfungsi sebagai landasan teoretis atau profil operasional mitra magang.',
      recommendation: 'Lengkapi Bab II dengan poin-poin teori atau profil instansi.'
    });
    missingSections.push('Bab 2 Teori/Profil');
  }

  if (!doc.bab3 || !doc.bab3.metodePelaksanaan) {
    findings.push({
      validatorName: 'StructuralValidator',
      severity: 'critical',
      location: 'Bab III: Metodologi / Pelaksanaan',
      issueTitle: 'Metode Pelaksanaan Kosong',
      evidence: 'Metode pelaksanaan belum dijabarkan.',
      reasoning: 'Bab III menjabarkan tahapan kerja, alat, dan prosedur ilmiah yang dapat diulang (reproducible).',
      recommendation: 'Uraikan tahapan metode pelaksanaan atau alur perancangan sistem pada Bab III.'
    });
    missingSections.push('Bab 3 Metode');
  }

  // =========================================================================
  // 2. Factual & Evidence Validator
  // =========================================================================
  const landasanTeori = doc.bab2?.landasanTeori || [];
  landasanTeori.forEach((teori, idx) => {
    if (!teori.citation || teori.citation.trim().length === 0) {
      findings.push({
        validatorName: 'FactualEvidenceValidator',
        severity: 'high',
        location: `Bab II: Landasan Teori [Poin #${idx + 1}: ${teori.topic}]`,
        issueTitle: 'Klaim Teoretis Tanpa Sitasi Rujukan',
        evidence: `Topik: "${teori.topic}" tidak memuat informasi sumber sitasi.`,
        reasoning: 'Setiap landasan teori dalam karya ilmiah wajib bersandar pada pustaka primer yang valid.',
        recommendation: `Cantumkan nama penulis dan tahun jurnal (misal: (Smith, 2023)) yang mendasari teori ${teori.topic}.`
      });
    }
  });

  // =========================================================================
  // 3. Citation Validator (using evidenceVerifier)
  // =========================================================================
  const evidenceReport = auditCitationIntegrity(doc);
  evidenceReport.issues.forEach(issue => {
    findings.push({
      validatorName: 'CitationValidator',
      severity: issue.severity,
      location: issue.location,
      issueTitle: issue.description,
      evidence: issue.evidence,
      reasoning: 'Integritas kutipan dan bibliografi mencerminkan kejujuran ilmiah serta mencegah tuduhan plagiasi.',
      recommendation: issue.remediation
    });
  });

  // =========================================================================
  // 4. Methodology Validator
  // =========================================================================
  if (doc.category === 'skripsi' || doc.category === 'penelitian') {
    const methodStr = (doc.bab3?.metodePelaksanaan || '').toLowerCase();
    const hasDataCollection = methodStr.includes('kuesioner') || methodStr.includes('wawancara') || methodStr.includes('dataset') || methodStr.includes('observasi') || methodStr.includes('pengujian');
    if (!hasDataCollection && methodStr.length > 50) {
      findings.push({
        validatorName: 'MethodologyValidator',
        severity: 'medium',
        location: 'Bab III: Metodologi Penelitian',
        issueTitle: 'Teknik Pengumpulan Data Belum Eksplisit',
        evidence: 'Metodologi tidak menyebutkan teknik pengumpulan data seperti dataset, observasi, instrumen angket, atau pengujian API.',
        reasoning: 'Penelitian ilmiah menuntut kejelasan sumber instrumen pengumpulan data primer atau sekunder.',
        recommendation: 'Tambahkan sub-bab mengenai instrumen atau teknik pengumpulan data pada Bab III.'
      });
    }
  }

  // =========================================================================
  // 5. Consistency Validator (Title vs Problem vs Objectives vs Conclusion)
  // =========================================================================
  let consistencyScore = 100;
  const problemCount = doc.bab1?.rumusanMasalah?.length || 0;
  const objectiveCount = doc.bab1?.tujuanKhusus?.length || 0;
  const conclusionCount = doc.bab5?.kesimpulanUsulan?.length || 0;

  // Check 1-to-1 sync between Problem and Objectives
  if (problemCount > 0 && objectiveCount > 0 && problemCount !== objectiveCount) {
    findings.push({
      validatorName: 'ConsistencyValidator',
      severity: 'medium',
      location: 'Bab I: Rumusan Masalah vs Tujuan Penelitian',
      issueTitle: 'Jumlah Rumusan Masalah dan Tujuan Khusus Tidak Selaras',
      evidence: `Terdapat ${problemCount} butir rumusan masalah namun terdapat ${objectiveCount} butir tujuan khusus.`,
      reasoning: 'Secara kaidah akademik baku, setiap butir rumusan masalah harus memiliki tepat 1 butir tujuan khusus yang menjawabnya secara simetris.',
      recommendation: 'Sesuaikan butir-butir tujuan khusus agar menjawab butir rumusan masalah secara 1-banding-1.'
    });
    consistencyScore -= 15;
  }

  // If Bab V conclusions exist, check alignment with objectives
  if (conclusionCount > 0 && objectiveCount > 0 && conclusionCount < objectiveCount) {
    findings.push({
      validatorName: 'ConsistencyValidator',
      severity: 'high',
      location: 'Bab V: Kesimpulan vs Bab I: Tujuan Khusus',
      issueTitle: 'Kesimpulan Belum Menjawab Seluruh Tujuan',
      evidence: `Terdapat ${objectiveCount} tujuan khusus, namun kesimpulan hanya memuat ${conclusionCount} butir.`,
      reasoning: 'Bab kesimpulan wajib merangkum temuan yang membuktikan tercapainya seluruh tujuan penelitian.',
      recommendation: 'Tambahkan butir kesimpulan yang selaras dengan seluruh tujuan pada Bab I.'
    });
    consistencyScore -= 20;
  }

  // =========================================================================
  // 6. Academic Rule Validator (using academicRuleEngine)
  // =========================================================================
  const ruleReport = validateProposalDocumentRules(doc, context);
  ruleReport.violations.forEach(v => {
    findings.push({
      validatorName: 'AcademicRuleValidator',
      severity: v.severity,
      location: v.location,
      issueTitle: v.ruleName,
      evidence: `Pedoman: ${v.guidelineSource} (${v.officialSourcePage})`,
      reasoning: v.explanation,
      recommendation: v.recommendation
    });
  });

  // =========================================================================
  // 7. Export Validator
  // =========================================================================
  if (!doc.slides || doc.slides.length === 0) {
    findings.push({
      validatorName: 'ExportValidator',
      severity: 'low',
      location: 'Slide Presentasi PPTX',
      issueTitle: 'Deck Presentasi Belum Terisi',
      evidence: 'Array slide presentasi kosong.',
      reasoning: 'Dokumen memerlukan bahan tayang presentasi sidang untuk ekspor PPTX.',
      recommendation: 'Buka Slide Studio (16:9) untuk mengonfigurasi materi deck presentasi eksekutif Anda.'
    });
  }

  // Compute final scoring
  const criticalCount = findings.filter(f => f.severity === 'critical').length;
  const highCount = findings.filter(f => f.severity === 'high').length;
  const mediumCount = findings.filter(f => f.severity === 'medium').length;
  const lowCount = findings.filter(f => f.severity === 'low').length;

  let deduction = criticalCount * 30 + highCount * 15 + mediumCount * 5 + lowCount * 2;
  const overallScore = Math.max(0, Math.min(100, 100 - deduction));

  let overallStatus: 'EXCELLENT' | 'SATISFACTORY' | 'ACTION_REQUIRED' | 'CRITICAL_ISSUES' = 'EXCELLENT';
  if (criticalCount > 0) overallStatus = 'CRITICAL_ISSUES';
  else if (highCount > 0 || overallScore < 75) overallStatus = 'ACTION_REQUIRED';
  else if (overallScore < 90) overallStatus = 'SATISFACTORY';

  return {
    timestamp: new Date().toISOString(),
    documentTitle: doc.title,
    institution: context.institution,
    category: doc.category,
    overallScore,
    overallStatus,
    totalFindingsCount: findings.length,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    findings,
    structuralReport: {
      isComplete: missingSections.length === 0,
      missingSections
    },
    evidenceReport,
    ruleReport,
    consistencyScore
  };
}
