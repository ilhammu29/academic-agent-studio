import test from 'node:test';
import assert from 'node:assert/strict';
import { fillMissingInterviewAnswers } from '../lib/interviewAnswers.ts';

test('auto suggestions fill only empty questionnaire fields without overwriting user answers', () => {
  const existing = { issue: 'Fakta pengguna', goal: '  ' };
  const result = fillMissingInterviewAnswers(existing, ['issue', 'goal', 'method'], { issue: 'Tebakan', goal: 'Tujuan draf', method: 123, unknown: 'Abaikan' });
  assert.deepEqual(result, { issue: 'Fakta pengguna', goal: 'Tujuan draf' });
  assert.deepEqual(existing, { issue: 'Fakta pengguna', goal: '  ' });
});
