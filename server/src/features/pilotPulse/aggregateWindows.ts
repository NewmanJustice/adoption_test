import { TrendWindow } from './evaluateSignals.js';

export interface PulseRow {
  submitted_at: string | Date;
  role: string;
  structural_score_s1: number | string;
  structural_score_s2: number | string;
  structural_score_s3: number | string;
  structural_score_s4: number | string;
  clarity_score_s1: number | string;
  clarity_score_s2: number | string;
  clarity_score_s3: number | string;
  clarity_score_s4: number | string;
}

export interface AggregateResult {
  windows: (TrendWindow & { windowStart: string; windowIndex: number })[];
  trendInferenceSuppressed: boolean;
}

function toNum(v: number | string | null | undefined): number {
  return Number(v);
}

function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

export function aggregateWindows(rows: PulseRow[]): AggregateResult {
  if (rows.length === 0) {
    return { windows: [], trendInferenceSuppressed: true };
  }

  const sorted = [...rows].sort(
    (a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
  );
  const anchor = new Date(sorted[0].submitted_at).getTime();
  const windowMs = 14 * 24 * 60 * 60 * 1000;

  const buckets = new Map<number, PulseRow[]>();
  for (const row of sorted) {
    const idx = Math.floor((new Date(row.submitted_at).getTime() - anchor) / windowMs);
    const existing = buckets.get(idx) ?? [];
    existing.push(row);
    buckets.set(idx, existing);
  }

  const sections = ['s1', 's2', 's3', 's4'] as const;
  const windows = Array.from(buckets.entries())
    .sort(([a], [b]) => a - b)
    .map(([idx, windowRows], i) => {
      const windowStart = new Date(anchor + idx * windowMs).toISOString();
      const roles = new Set(windowRows.map(r => r.role));
      const hasMultipleRoles = roles.size >= 2;

      const win: TrendWindow & { windowStart: string; windowIndex: number } = {
        windowStart,
        windowIndex: i + 1,
        structuralScore_s1: 0, structuralScore_s2: 0, structuralScore_s3: 0, structuralScore_s4: 0,
        clarityScore_s1: 0, clarityScore_s2: 0, clarityScore_s3: 0, clarityScore_s4: 0,
        alignmentIndex_s1: null, alignmentIndex_s2: null, alignmentIndex_s3: null, alignmentIndex_s4: null,
      };

      for (const s of sections) {
        const ssKey = `structural_score_${s}` as keyof PulseRow;
        const csKey = `clarity_score_${s}` as keyof PulseRow;
        const ssVals = windowRows.map(r => toNum(r[ssKey] as number));
        const csVals = windowRows.map(r => toNum(r[csKey] as number));
        win[`structuralScore_${s}`] = ssVals.reduce((a, b) => a + b, 0) / ssVals.length;
        win[`clarityScore_${s}`] = csVals.reduce((a, b) => a + b, 0) / csVals.length;

        if (hasMultipleRoles) {
          win[`alignmentIndex_${s}`] = stddev(ssVals);
        } else {
          win[`alignmentIndex_${s}`] = null;
          win.alignmentWarning = 'Insufficient role diversity for alignment index';
        }
      }

      return win;
    });

  return {
    windows,
    trendInferenceSuppressed: windows.length < 3,
  };
}
