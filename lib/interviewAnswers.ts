/** Fill only unanswered fields that belong to the current questionnaire. */
export function fillMissingInterviewAnswers(
  current: Record<string, string>,
  fields: string[],
  suggestions: Record<string, unknown>
): Record<string, string> {
  const updated = { ...current };
  for (const field of fields) {
    const suggestion = suggestions[field];
    if (!updated[field]?.trim() && typeof suggestion === 'string' && suggestion.trim()) updated[field] = suggestion;
  }
  return updated;
}
