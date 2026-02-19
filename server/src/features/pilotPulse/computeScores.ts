export interface QuestionInputs {
  q1: number; q2: number; q3: number;
  q4: number; q5: number; q6: number;
  q7: number; q8: number; q9: number;
  q10: number; q11: number; q12: number;
}

export interface ScoreOutputs {
  structural_score_s1: number;
  structural_score_s2: number;
  structural_score_s3: number;
  structural_score_s4: number;
  clarity_score_s1: number;
  clarity_score_s2: number;
  clarity_score_s3: number;
  clarity_score_s4: number;
}

export function computeScores(q: QuestionInputs): ScoreOutputs {
  return {
    structural_score_s1: (q.q1 + q.q2) / 2,
    structural_score_s2: (q.q4 + q.q5) / 2,
    structural_score_s3: (q.q7 + q.q8) / 2,
    structural_score_s4: (q.q10 + q.q11) / 2,
    clarity_score_s1: q.q3,
    clarity_score_s2: q.q6,
    clarity_score_s3: q.q9,
    clarity_score_s4: q.q12,
  };
}
