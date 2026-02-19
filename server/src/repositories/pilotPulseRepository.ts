import { Pool } from 'pg';
import { ScoreOutputs } from '../features/pilotPulse/computeScores.js';
import { QuestionInputs } from '../features/pilotPulse/computeScores.js';
import { PulseRow } from '../features/pilotPulse/aggregateWindows.js';

export interface PulseInsertRow {
  role: string;
  questions: QuestionInputs;
  scores: ScoreOutputs;
  free_text: string | null;
}

const inMemoryStore: PulseRow[] = [];

export class PilotPulseRepository {
  constructor(private pool: Pool) {}

  async insertResponse(row: PulseInsertRow): Promise<void> {
    const q = row.questions;
    const s = row.scores;
    const text = `
      INSERT INTO pilot_pulse_responses (
        role, q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12,
        structural_score_s1, structural_score_s2, structural_score_s3, structural_score_s4,
        clarity_score_s1, clarity_score_s2, clarity_score_s3, clarity_score_s4,
        free_text
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
    `;
    const values = [
      row.role,
      q.q1, q.q2, q.q3, q.q4, q.q5, q.q6, q.q7, q.q8, q.q9, q.q10, q.q11, q.q12,
      s.structural_score_s1, s.structural_score_s2, s.structural_score_s3, s.structural_score_s4,
      s.clarity_score_s1, s.clarity_score_s2, s.clarity_score_s3, s.clarity_score_s4,
      row.free_text,
    ];

    try {
      await this.pool.query(text, values);
    } catch {
      // Fall back to in-memory storage when DB is unavailable
      inMemoryStore.push({
        submitted_at: new Date().toISOString(),
        role: row.role,
        structural_score_s1: s.structural_score_s1,
        structural_score_s2: s.structural_score_s2,
        structural_score_s3: s.structural_score_s3,
        structural_score_s4: s.structural_score_s4,
        clarity_score_s1: s.clarity_score_s1,
        clarity_score_s2: s.clarity_score_s2,
        clarity_score_s3: s.clarity_score_s3,
        clarity_score_s4: s.clarity_score_s4,
      });
    }
  }

  async listResponses(): Promise<PulseRow[]> {
    try {
      const result = await this.pool.query(
        'SELECT * FROM pilot_pulse_responses ORDER BY submitted_at'
      );
      return result.rows as PulseRow[];
    } catch {
      return [...inMemoryStore];
    }
  }
}
