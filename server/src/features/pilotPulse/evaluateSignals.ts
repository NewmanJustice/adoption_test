export interface TrendWindow {
  structuralScore_s1: number;
  structuralScore_s2: number;
  structuralScore_s3: number;
  structuralScore_s4: number;
  clarityScore_s1: number;
  clarityScore_s2: number;
  clarityScore_s3: number;
  clarityScore_s4: number;
  alignmentIndex_s1: number | null;
  alignmentIndex_s2: number | null;
  alignmentIndex_s3: number | null;
  alignmentIndex_s4: number | null;
  alignmentWarning?: string;
  [key: string]: unknown;
}

export interface Signal {
  level: 'critical' | 'warning';
  code: string;
  section: string;
}

const SECTION_NAMES: Record<string, string> = {
  s1: 'Authority & Decision Structure',
  s2: 'Service Intent & Boundaries',
  s3: 'Lifecycle & Operational Modelling',
  s4: 'Architectural & Dependency Discipline',
};

export function evaluateSignals(windows: TrendWindow[]): Signal[] {
  const signals: Signal[] = [];
  if (!windows || windows.length === 0) return signals;

  const latest = windows[windows.length - 1];
  const previous = windows.length >= 2 ? windows[windows.length - 2] : null;
  const sections = ['s1', 's2', 's3', 's4'] as const;

  for (const s of sections) {
    const ss = latest[`structuralScore_${s}`] as number | undefined;
    const ai = latest[`alignmentIndex_${s}`] as number | null | undefined;

    if (ss !== undefined && ss < 3.0) {
      signals.push({ level: 'critical', code: 'LOW_STRUCTURAL_SCORE', section: SECTION_NAMES[s] });
    }
    if (ai !== null && ai !== undefined && ai >= 1.0) {
      signals.push({ level: 'critical', code: 'HIGH_ALIGNMENT_INDEX', section: SECTION_NAMES[s] });
    }

    if (previous) {
      const prevSS = previous[`structuralScore_${s}`] as number | undefined;
      const prevCS = previous[`clarityScore_${s}`] as number | undefined;
      const latCS = latest[`clarityScore_${s}`] as number | undefined;
      const prevAI = previous[`alignmentIndex_${s}`] as number | null | undefined;
      const latAI = latest[`alignmentIndex_${s}`] as number | null | undefined;

      if (prevSS !== undefined && ss !== undefined && Math.abs(ss - prevSS) <= 0.1 &&
          prevCS !== undefined && latCS !== undefined && latCS < prevCS) {
        signals.push({ level: 'warning', code: 'CLARITY_FALLING', section: SECTION_NAMES[s] });
      }
      if (prevAI !== null && prevAI !== undefined &&
          latAI !== null && latAI !== undefined && latAI > prevAI) {
        signals.push({ level: 'warning', code: 'ALIGNMENT_INCREASING', section: SECTION_NAMES[s] });
      }
    }
  }

  return signals;
}
