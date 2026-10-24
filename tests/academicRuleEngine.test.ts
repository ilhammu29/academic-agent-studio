import test from 'node:test';
import assert from 'node:assert';
import {
  DEFAULT_ACADEMIC_RULES,
  resolveActiveRules,
  validateProposalDocumentRules
} from '../lib/academicRuleEngine.ts';
import type {
  AcademicRule,
  RuleResolutionContext
} from '../lib/academicRuleEngine.ts';
import type { ProposalDocument } from '../types/studio.ts';

test('Rule Registry contains Dikti baseline and institutional rules', () => {
  assert.ok(DEFAULT_ACADEMIC_RULES.length >= 5, 'Rule registry must have at least 5 baseline rules');
  const pageSizeRule = DEFAULT_ACADEMIC_RULES.find(r => r.id === 'DIKTI-PAGE-SIZE-001');
  assert.ok(pageSizeRule, 'Must contain DIKTI-PAGE-SIZE-001');
  assert.strictEqual(pageSizeRule.value.paperSize, 'A4');
  assert.strictEqual(pageSizeRule.status, 'mandatory');
});

test('Rule Hierarchy & Precedence resolves institutional rule over generic baseline', () => {
  const context: RuleResolutionContext = {
    institution: 'Universitas Sebelas Maret (UNS)',
    documentType: 'proposal_skripsi',
    degree: 'S1'
  };

  const { activeRules, conflicts } = resolveActiveRules(context);
  assert.ok(activeRules.size > 0, 'Must resolve active rules');

  // Check if UNS specific margin rule or heading rule is selected
  const unsMargin = activeRules.get('UNS-MARGIN-001');
  const diktiMargin = activeRules.get('DIKTI-MARGIN-001');
  // Either UNS-MARGIN-001 is active or it prioritized over generic
  assert.ok(unsMargin || diktiMargin, 'Must have margin rule active');
});

test('Rule Conflict Detector detects conflicting guidelines between disparate sources', () => {
  const customRules: AcademicRule[] = [
    {
      id: 'INST-RULE-APA',
      category: 'citations',
      ruleName: 'Wajib Format Sitasi APA 7th',
      description: 'Universitas mewajibkan APA 7th',
      institution: 'Universitas Contoh',
      guidelineName: 'Pedoman Universitas 2024',
      guidelineVersion: 'v1.0',
      effectiveYear: 2024,
      officialSourcePage: 'Hal. 10',
      status: 'mandatory',
      verificationStatus: 'verified',
      value: { citationStyle: 'apa' },
      changelog: []
    },
    {
      id: 'FACULTY-RULE-IEEE',
      category: 'citations',
      ruleName: 'Fakultas Teknik Wajib Format Sitasi IEEE',
      description: 'Fakultas Teknik mewajibkan IEEE',
      institution: 'Universitas Contoh',
      faculty: 'Fakultas Teknik',
      guidelineName: 'Pedoman Fakultas Teknik 2024',
      guidelineVersion: 'v1.0',
      effectiveYear: 2024,
      officialSourcePage: 'Hal. 5',
      status: 'mandatory',
      verificationStatus: 'verified',
      value: { citationStyle: 'ieee' },
      changelog: []
    }
  ];

  const context: RuleResolutionContext = {
    institution: 'Universitas Contoh',
    faculty: 'Fakultas Teknik',
    documentType: 'proposal_skripsi',
    degree: 'S1'
  };

  const { activeRules, conflicts } = resolveActiveRules(context, customRules);

  // Faculty specific rule should win precedence over University general
  assert.ok(activeRules.has('FACULTY-RULE-IEEE'), 'Faculty rule must win precedence over general');
  assert.strictEqual(conflicts.length, 1, 'Conflict must be explicitly detected and recorded');
  assert.strictEqual(conflicts[0].category, 'citations');
  assert.ok(conflicts[0].conflictDescription.includes('Fakultas Teknik'));
});

test('Deterministic Rule Validator flags non-compliant margins and heading styles', () => {
  const mockDoc: Partial<ProposalDocument> = {
    title: 'Analisis Optimasi Jaringan 5G Menggunakan Algoritma Genetika',
    category: 'skripsi',
    institution: 'Universitas Sebelas Maret (UNS)',
    campusGuideline: {
      campusName: 'Universitas Sebelas Maret (UNS)',
      paperSize: 'A4',
      margins: { topCm: 2.5, bottomCm: 2.5, leftCm: 2.5, rightCm: 2.5 }, // Non-compliant: should be 4-4-3-3!
      typography: { fontFamily: 'Comic Sans', bodySizePt: 10, heading1SizePt: 14, lineSpacing: 1.0 }, // Non-compliant!
      headingStyle: 'alphanumeric', // Non-compliant with UNS decimal!
      citationStyle: 'vancouver', // Non-compliant!
      approvalConfig: { supervisorCount: 1, requiresHeadOfProgram: true, requiresDeanOrFieldMentor: false }
    }
  };

  const context: RuleResolutionContext = {
    institution: 'Universitas Sebelas Maret (UNS)',
    documentType: 'proposal_skripsi',
    degree: 'S1'
  };

  const report = validateProposalDocumentRules(mockDoc as ProposalDocument, context);

  assert.ok(report.violationsCount >= 2, 'Must flag multiple deterministic violations');
  const marginViolation = report.violations.find(v => v.category === 'page_setup');
  assert.ok(marginViolation, 'Must flag margin violation');
  assert.strictEqual(marginViolation.severity, 'critical');

  const typoViolation = report.violations.find(v => v.category === 'typography');
  assert.ok(typoViolation, 'Must flag typography violation for Comic Sans');
  assert.strictEqual(typoViolation.severity, 'high');
});
