import { computeScores, QuestionInputs } from '../features/pilotPulse/computeScores.js';
import { aggregateWindows } from '../features/pilotPulse/aggregateWindows.js';
import { evaluateSignals, TrendWindow } from '../features/pilotPulse/evaluateSignals.js';
import { PilotPulseRepository } from '../repositories/pilotPulseRepository.js';

function sanitizeFreeText(text: string): string {
  return text.replace(/<[^>]*>/g, '');
}

function validateQuestions(body: Record<string, unknown>): { valid: true; questions: QuestionInputs } | { valid: false; errors: string[] } {
  const keys = ['q1','q2','q3','q4','q5','q6','q7','q8','q9','q10','q11','q12'] as const;
  const errors: string[] = [];
  const questions: Partial<QuestionInputs> = {};

  for (const k of keys) {
    const val = Number(body[k]);
    if (body[k] === undefined || body[k] === null || body[k] === '') {
      errors.push(`${k} is required`);
    } else if (!Number.isInteger(val) || val < 1 || val > 5) {
      errors.push(`${k} must be an integer between 1 and 5`);
    } else {
      questions[k] = val;
    }
  }

  if (errors.length > 0) return { valid: false, errors };
  return { valid: true, questions: questions as QuestionInputs };
}

export class PilotPulseService {
  constructor(private repository: PilotPulseRepository) {}

  async submitPulse(body: Record<string, unknown>, role: string): Promise<{ success: true } | { success: false; errors: string[] }> {
    const validation = validateQuestions(body);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const scores = computeScores(validation.questions);
    const free_text = body.free_text ? sanitizeFreeText(String(body.free_text)) : null;

    await this.repository.insertResponse({ role, questions: validation.questions, scores, free_text });
    return { success: true };
  }

  async getTrends(): Promise<{ windows: (TrendWindow & { windowStart: string; windowIndex: number })[]; trendInferenceSuppressed: boolean; signals: ReturnType<typeof evaluateSignals> }> {
    const rows = await this.repository.listResponses();
    const { windows, trendInferenceSuppressed } = aggregateWindows(rows);
    const signals = evaluateSignals(windows);
    return { windows, trendInferenceSuppressed, signals };
  }
}
