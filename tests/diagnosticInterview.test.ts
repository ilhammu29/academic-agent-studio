import test from 'node:test';
import assert from 'node:assert';
import {
  getAdaptiveDiagnosticQuestions,
  detectMissingInformation
} from '../lib/diagnosticInterviewEngine.ts';

test('Adaptive Diagnostic Interview generates specific questions for Magang vs Skripsi vs Laporan Final', () => {
  // 1. Magang Proposal
  const magangQuestions = getAdaptiveDiagnosticQuestions('Sistem Informasi Manajemen Logistik', 'magang', 'PT Pelabuhan Indonesia');
  assert.strictEqual(magangQuestions.length, 5);
  const q2Magang = magangQuestions.find(q => q.id === 'q2_scope');
  assert.ok(q2Magang?.question.includes('divisi/unit kerja'), 'Magang must ask for unit placement and scope of work');

  // 2. Skripsi Proposal
  const skripsiQuestions = getAdaptiveDiagnosticQuestions('Analisis Sentimen Menggunakan RoBERTa', 'skripsi', '');
  const q1Skripsi = skripsiQuestions.find(q => q.id === 'q1_research_gap');
  assert.ok(q1Skripsi?.question.includes('Research Gap'), 'Skripsi must probe for research gap and theoretical tension');

  // 3. Final Report
  const finalReportQuestions = getAdaptiveDiagnosticQuestions('Laporan Magang Divisi Data', 'magang', 'Bank Mandiri', 'laporan_magang');
  const q1Final = finalReportQuestions.find(q => q.id === 'q1_actual_results');
  assert.ok(q1Final?.question.includes('temuan atau hasil aktual'), 'Final report must demand actual results, not prospective plans');
});

test('Missing Information Detector prevents premature orchestration when critical info is missing', () => {
  // Empty or vague answers
  const incompleteAnswers: Record<string, string> = {
    q1_problem: 'kurang efisien', // Too short (<30 chars)
    q2_scope: 'apa saja',
    q3_method_tools: '' // Empty
  };

  const report = detectMissingInformation(incompleteAnswers, 'magang', 'proposal_magang');
  assert.strictEqual(report.isReadyForOrchestration, false, 'Must block orchestration when critical variables are missing');
  assert.ok(report.criticalMissingCount >= 2, 'Should flag critical missing variables');

  // Complete answers
  const completeAnswers: Record<string, string> = {
    q1_problem: 'Terdapat inefisiensi pencatatan waktu lembur karyawan yang masih manual sehingga sering terjadi keterlambatan pelaporan bulanan.',
    q2_scope: 'Ditempatkan di Divisi Human Capital, fokus pada digitalisasi pengajuan dan verifikasi lembur berbasis web responsif.',
    q3_method_tools: 'Menggunakan framework Scrum dengan siklus 2 minggu, Next.js, PostgreSQL, dan verifikasi otomatis.',
    q4_competency: 'Penerapan arsitektur REST API dan perancangan database terstruktur.',
    q5_data_access: 'Data karyawan disamarkan (anonymized) dan pembimbing industri telah mengizinkan penggunaan dummy data.'
  };

  const completeReport = detectMissingInformation(completeAnswers, 'magang', 'proposal_magang');
  assert.strictEqual(completeReport.isReadyForOrchestration, true, 'Should approve orchestration when all critical variables are present');
  assert.strictEqual(completeReport.criticalMissingCount, 0);
  assert.ok(completeReport.completenessPercentage >= 80);
});

test('Missing Information Detector strictly requires empirical data for final reports', () => {
  const finalAnswersWithoutData: Record<string, string> = {
    q1_problem: 'Pelaksanaan magang pada divisi analitik data.',
    q3_method_tools: 'Menggunakan Python dan pandas.',
    // Missing q1_actual_results / q2_empirical_data!
  };

  const report = detectMissingInformation(finalAnswersWithoutData, 'magang', 'laporan_magang');
  assert.strictEqual(report.isReadyForOrchestration, false, 'Final reports without empirical data must be rejected from generation');
  const empiricalMissing = report.missingItems.find(m => m.key === 'empirical_findings');
  assert.ok(empiricalMissing, 'Must flag missing empirical findings');
  assert.strictEqual(empiricalMissing.severity, 'critical');
});
