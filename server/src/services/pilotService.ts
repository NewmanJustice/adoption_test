import { randomUUID } from 'node:crypto';
import {
  PilotAuditLog,
  PilotCompareSummary,
  PilotConfiguration,
  PilotDashboardFilters,
  PilotDashboardResponse,
  PilotDeviation,
  PilotExperimentType,
  PilotLifecycleState,
  PilotMetricEntry,
  PilotMetricNote,
  PilotMetricSummary,
  PilotMetricType,
  PilotPhase,
  PilotTrendPoint,
  PilotTrendSeries,
} from '@adoption/shared';
import { SessionUser, UserRole } from '../types/auth.js';
import { PilotRepository } from '../repositories/pilotRepository.js';

const PILOT_CONFIG_ID = 'pilot-config';
const PILOT_PHASE_ID = 'pilot-phase';

const PHASE_LABELS: Record<PilotPhase, string> = {
  PHASE_1: 'Phase 1 – Structural Foundation',
  PHASE_2: 'Phase 2 – Agentic Specification Loops',
  PHASE_3: 'Phase 3 – Controlled Implementation',
};

const METRIC_DEFINITIONS = [
  { key: 'structural_integrity', type: 'score', unit: 'score' },
  { key: 'predictability', type: 'score', unit: 'score' },
  { key: 'nfr_posture', type: 'score', unit: 'score' },
  { key: 'sme_alignment', type: 'score', unit: 'score' },
  { key: 'governance', type: 'score', unit: 'score' },
] as const;

const REQUIRED_METRIC_KEYS = METRIC_DEFINITIONS.map((metric) => metric.key);

type ServiceResult<T> = { success: true; data: T } | { success: false; error: string; code?: string };

type MetricInput = {
  metricKey?: string;
  value?: number;
  unit?: string;
  date?: string;
  phase?: PilotPhase;
  experimentType?: PilotExperimentType;
  loop?: number;
};

type ConfigInput = {
  domainScope?: string;
  experimentType?: PilotExperimentType;
};

type Bucket = { bucket: string; start: Date; end: Date };

type AggregationSet = {
  summary: PilotMetricSummary[];
  trends: PilotTrendSeries[];
  completeness: { score: number; missingMetricKeys: string[] };
};

export class PilotService {
  constructor(private repository: PilotRepository) {}

  async getOverview(): Promise<{ config: PilotConfiguration | null; phase: PilotLifecycleState | null }> {
    const [config, phase] = await Promise.all([
      this.repository.getConfig(),
      this.repository.getPhaseState(),
    ]);
    return {
      config,
      phase: phase ? this.withPhaseLabel(phase) : null,
    };
  }

  async createConfig(input: ConfigInput, user: SessionUser): Promise<ServiceResult<PilotLifecycleState>> {
    if (!isBuilder(user.role)) {
      return { success: false, error: 'Access denied', code: 'FORBIDDEN' };
    }
    if (!input.domainScope || !input.experimentType || !isExperimentType(input.experimentType)) {
      return { success: false, error: 'Missing required fields', code: 'VALIDATION' };
    }
    const domainScope = input.domainScope;
    const experimentType = input.experimentType;
    const existing = await this.repository.getConfig();
    if (existing) {
      return { success: false, error: 'Pilot already configured', code: 'CONFLICT' };
    }
    const config: PilotConfiguration = {
      id: PILOT_CONFIG_ID,
      domainScope,
      experimentType,
      createdAt: new Date().toISOString(),
      createdBy: user.userId,
    };
    await this.repository.createConfig(config);
    const phase = await this.repository.upsertPhaseState({
      id: PILOT_PHASE_ID,
      configId: config.id,
      phase: 'PHASE_1',
      phaseLabel: PHASE_LABELS.PHASE_1,
      lastTransitionAt: new Date().toISOString(),
      updatedBy: user.userId,
    });
    await this.logAudit('PILOT_CONFIG_CREATE', user, { configId: config.id });
    return { success: true, data: phase };
  }

  async setSpecFreeze(user: SessionUser): Promise<ServiceResult<PilotLifecycleState>> {
    if (!isBuilder(user.role)) {
      return { success: false, error: 'Access denied', code: 'FORBIDDEN' };
    }
    const state = await this.repository.getPhaseState();
    if (!state) {
      return { success: false, error: 'Pilot not configured', code: 'NOT_FOUND' };
    }
    if (state.specFreezeAt) {
      return { success: false, error: 'Spec Freeze already set', code: 'CONFLICT' };
    }
    const updated = await this.repository.upsertPhaseState({
      id: PILOT_PHASE_ID,
      configId: PILOT_CONFIG_ID,
      phase: state.phase,
      phaseLabel: PHASE_LABELS[state.phase],
      specFreezeAt: new Date().toISOString(),
      lastTransitionAt: state.lastTransitionAt,
      stabilityConfirmedAt: state.stabilityConfirmedAt,
      updatedBy: user.userId,
    });
    await this.logAudit('SPEC_FREEZE_SET', user, { phase: state.phase });
    return { success: true, data: this.withPhaseLabel(updated) };
  }

  async transitionPhase(
    targetPhase: PilotPhase,
    stabilityConfirmed: boolean,
    user: SessionUser
  ): Promise<ServiceResult<PilotLifecycleState>> {
    if (!isDeliveryLead(user.role)) {
      return { success: false, error: 'Access denied', code: 'FORBIDDEN' };
    }
    const state = await this.repository.getPhaseState();
    if (!state) {
      return { success: false, error: 'Pilot not configured', code: 'NOT_FOUND' };
    }
    const gateError = getPhaseGateError(state, targetPhase, stabilityConfirmed);
    if (gateError) {
      return { success: false, error: gateError, code: 'VALIDATION' };
    }
    const updated = await this.repository.upsertPhaseState({
      id: PILOT_PHASE_ID,
      configId: PILOT_CONFIG_ID,
      phase: targetPhase,
      phaseLabel: PHASE_LABELS[targetPhase],
      specFreezeAt: state.specFreezeAt,
      stabilityConfirmedAt: stabilityConfirmed ? new Date().toISOString() : state.stabilityConfirmedAt,
      lastTransitionAt: new Date().toISOString(),
      updatedBy: user.userId,
    });
    await this.logAudit('PHASE_TRANSITION', user, { from: state.phase, to: targetPhase });
    return { success: true, data: this.withPhaseLabel(updated) };
  }

  async createMetricEntry(input: MetricInput, user: SessionUser): Promise<ServiceResult<PilotMetricEntry>> {
    if (!canWriteMetrics(user.role)) {
      return { success: false, error: 'Access denied', code: 'FORBIDDEN' };
    }
    const parsed = validateMetricInput(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error, code: 'VALIDATION' };
    }
    const definition = getMetricDefinition(parsed.data.metricKey);
    const entry: PilotMetricEntry = {
      id: randomUUID(),
      metricKey: parsed.data.metricKey,
      metricType: definition.type,
      value: parsed.data.value,
      unit: parsed.data.unit || definition.unit,
      date: parsed.data.date,
      phase: parsed.data.phase,
      loop: parsed.data.loop,
      experimentType: parsed.data.experimentType,
      role: user.role,
      createdAt: new Date().toISOString(),
      createdBy: user.userId,
    };
    const stored = await this.repository.createMetricEntry(entry);
    await this.logAudit('METRIC_CREATE', user, { metricKey: stored.metricKey, entryId: stored.id });
    return { success: true, data: stored };
  }

  async updateMetricEntry(
    entryId: string,
    input: MetricInput,
    user: SessionUser
  ): Promise<ServiceResult<PilotMetricEntry>> {
    if (!canWriteMetrics(user.role)) {
      return { success: false, error: 'Access denied', code: 'FORBIDDEN' };
    }
    const current = await this.repository.getMetricEntry(entryId);
    if (!current) {
      return { success: false, error: 'Metric entry not found', code: 'NOT_FOUND' };
    }
    const parsed = validateMetricInput({
      metricKey: current.metricKey,
      value: input.value ?? current.value,
      unit: input.unit ?? current.unit,
      date: input.date ?? current.date,
      phase: input.phase ?? current.phase,
      experimentType: input.experimentType ?? current.experimentType,
      loop: input.loop ?? current.loop,
    });
    if (!parsed.success) {
      return { success: false, error: parsed.error, code: 'VALIDATION' };
    }
    await this.repository.createMetricHistory({
      id: randomUUID(),
      metricEntryId: current.id,
      value: current.value,
      updatedAt: new Date().toISOString(),
      updatedBy: user.userId,
    });
    const definition = getMetricDefinition(current.metricKey);
    const updated = await this.repository.updateMetricEntry(current.id, {
      value: parsed.data.value,
      unit: parsed.data.unit || definition.unit,
      date: parsed.data.date,
      phase: parsed.data.phase,
      loop: parsed.data.loop,
      experimentType: parsed.data.experimentType,
      metricType: definition.type,
      role: user.role,
    });
    await this.logAudit('METRIC_UPDATE', user, { metricKey: current.metricKey, entryId: current.id });
    return { success: true, data: updated };
  }

  async addMetricNote(
    entryId: string,
    note: string,
    user: SessionUser
  ): Promise<ServiceResult<PilotMetricNote>> {
    if (!isSME(user.role)) {
      return { success: false, error: 'Access denied', code: 'FORBIDDEN' };
    }
    if (!note?.trim()) {
      return { success: false, error: 'Note is required', code: 'VALIDATION' };
    }
    const stored = await this.repository.createMetricNote({
      id: randomUUID(),
      metricEntryId: entryId,
      note: note.trim(),
      createdAt: new Date().toISOString(),
      createdBy: user.userId,
    });
    return { success: true, data: stored };
  }

  async recordDeviation(
    input: { description?: string; metricKey?: string; phase?: PilotPhase; experimentType?: PilotExperimentType },
    user: SessionUser
  ): Promise<ServiceResult<PilotDeviation | null>> {
    if (!isBuilder(user.role)) {
      return { success: false, error: 'Access denied', code: 'FORBIDDEN' };
    }
    const state = await this.repository.getPhaseState();
    if (!state?.specFreezeAt) {
      return { success: true, data: null };
    }
    if (!input.description || !input.phase || !input.experimentType) {
      return { success: false, error: 'Missing required fields', code: 'VALIDATION' };
    }
    const stored = await this.repository.createDeviation({
      id: randomUUID(),
      description: input.description,
      metricKey: input.metricKey,
      phase: input.phase,
      experimentType: input.experimentType,
      createdAt: new Date().toISOString(),
      createdBy: user.userId,
    });
    await this.logAudit('DEVIATION_LOG', user, { deviationId: stored.id });
    return { success: true, data: stored };
  }

  async getDashboard(filters: PilotDashboardFilters, user: SessionUser): Promise<ServiceResult<PilotDashboardResponse>> {
    if (!canViewDashboard(user.role)) {
      return { success: false, error: 'Access denied', code: 'FORBIDDEN' };
    }
    const parsedFilters = normalizeFilters(filters);
    const entries = await this.repository.listMetricEntries(parsedFilters);
    const deviations = await this.repository.listDeviations(parsedFilters);
    const buckets = buildBuckets(parsedFilters.dateFrom, parsedFilters.dateTo);
    const metricKeys = getMetricKeys(entries);
    const aggregate = buildAggregation(entries, metricKeys, buckets);
    const response: PilotDashboardResponse = {
      filters: parsedFilters,
      summary: aggregate.summary,
      trends: aggregate.trends,
      completeness: aggregate.completeness,
      deviations,
    };
    if (parsedFilters.compare) {
      response.compare = await this.buildCompare(parsedFilters, buckets, metricKeys);
    }
    return { success: true, data: response };
  }

  async getAuditLogs(filters: { dateFrom?: string; dateTo?: string; action?: string }): Promise<PilotAuditLog[]> {
    return this.repository.listAuditLogs(filters);
  }

  private async buildCompare(filters: PilotDashboardFilters, buckets: Bucket[], metricKeys: string[]) {
    const pilotEntries = await this.repository.listMetricEntries({
      ...filters,
      experimentType: 'pilot',
    });
    const controlEntries = await this.repository.listMetricEntries({
      ...filters,
      experimentType: 'control',
    });
    const pilotAgg = buildAggregation(pilotEntries, metricKeys, buckets);
    const controlAgg = buildAggregation(controlEntries, metricKeys, buckets);
    const summaries = buildCompareSummaries(pilotAgg.summary, controlAgg.summary);
    const hasControl = controlEntries.length > 0;
    return {
      enabled: true,
      warning: hasControl ? undefined : 'Control data not available for selected range',
      summaries: hasControl ? summaries : undefined,
      trends: hasControl ? controlAgg.trends : undefined,
    };
  }

  private async logAudit(action: string, user: SessionUser, metadata?: Record<string, unknown>) {
    await this.repository.createAuditLog({
      id: randomUUID(),
      action,
      actorId: user.userId,
      actorRole: user.role,
      createdAt: new Date().toISOString(),
      metadata,
    });
  }

  private withPhaseLabel(state: PilotLifecycleState): PilotLifecycleState {
    return { ...state, phaseLabel: PHASE_LABELS[state.phase] };
  }
}

function isExperimentType(value: string): value is PilotExperimentType {
  return value === 'pilot' || value === 'control';
}

function isPhase(value: string): value is PilotPhase {
  return value === 'PHASE_1' || value === 'PHASE_2' || value === 'PHASE_3';
}

function isBuilder(role: UserRole): boolean {
  return role === 'PILOT_BUILDER';
}

function isDeliveryLead(role: UserRole): boolean {
  return role === 'PILOT_DELIVERY_LEAD';
}

function isSME(role: UserRole): boolean {
  return role === 'PILOT_SME';
}

function canWriteMetrics(role: UserRole): boolean {
  return role === 'PILOT_BUILDER' || role === 'PILOT_DELIVERY_LEAD';
}

function canViewDashboard(role: UserRole): boolean {
  return role.startsWith('PILOT_');
}

function getPhaseGateError(state: PilotLifecycleState, target: PilotPhase, stabilityConfirmed: boolean): string | null {
  if (target === 'PHASE_2' && !state.specFreezeAt) {
    return 'Spec Freeze must be set before Phase 2';
  }
  if (target === 'PHASE_3' && !stabilityConfirmed) {
    return 'Stability confirmation required before Phase 3';
  }
  return null;
}

function validateMetricInput(input: MetricInput): ServiceResult<Required<MetricInput>> {
  if (!input.metricKey || input.value === undefined || !input.unit || !input.date || !input.phase || !input.experimentType) {
    return { success: false, error: 'Missing required fields' };
  }
  if (!isPhase(input.phase)) {
    return { success: false, error: 'Invalid phase' };
  }
  if (!isExperimentType(input.experimentType)) {
    return { success: false, error: 'Invalid experiment type' };
  }
  if (Number.isNaN(Number(input.value))) {
    return { success: false, error: 'Invalid value' };
  }
  return {
    success: true,
    data: {
      metricKey: input.metricKey,
      value: Number(input.value),
      unit: input.unit,
      date: input.date,
      phase: input.phase,
      experimentType: input.experimentType,
      loop: input.loop ?? 1,
    },
  };
}

function getMetricDefinition(metricKey: string): { type: PilotMetricType; unit: string } {
  const match = METRIC_DEFINITIONS.find((metric) => metric.key === metricKey);
  return match || { type: 'score', unit: 'score' };
}

function normalizeFilters(filters: PilotDashboardFilters): PilotDashboardFilters {
  const dateFrom = filters.dateFrom || new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const dateTo = filters.dateTo || new Date().toISOString().slice(0, 10);
  return {
    ...filters,
    dateFrom,
    dateTo,
    loop: filters.loop ?? 1,
    experimentType: filters.experimentType || 'pilot',
  };
}

function getMetricKeys(entries: PilotMetricEntry[]): string[] {
  const keys = new Set(REQUIRED_METRIC_KEYS);
  entries.forEach((entry) => keys.add(entry.metricKey as typeof REQUIRED_METRIC_KEYS[number]));
  return Array.from(keys).sort();
}

function buildAggregation(entries: PilotMetricEntry[], metricKeys: string[], buckets: Bucket[]): AggregationSet {
  const grouped = groupByMetric(entries);
  const summary = buildSummary(grouped, metricKeys);
  const trends = buildTrends(grouped, metricKeys, buckets);
  const missing = REQUIRED_METRIC_KEYS.filter((key) => !grouped[key]?.length);
  const score = REQUIRED_METRIC_KEYS.length
    ? Math.round(((REQUIRED_METRIC_KEYS.length - missing.length) / REQUIRED_METRIC_KEYS.length) * 100)
    : 100;
  return { summary, trends, completeness: { score, missingMetricKeys: missing } };
}

function buildSummary(grouped: Record<string, PilotMetricEntry[]>, metricKeys: string[]): PilotMetricSummary[] {
  return metricKeys.map((key) => {
    const entries = grouped[key] || [];
    const latest = getLatestEntry(entries);
    const definition = getMetricDefinition(key);
    return {
      metricKey: key,
      metricType: definition.type,
      unit: latest?.unit || definition.unit,
      value: latest?.value ?? null,
      latestAt: latest?.createdAt,
      incomplete: REQUIRED_METRIC_KEYS.includes(key) && !latest,
    };
  });
}

function buildTrends(
  grouped: Record<string, PilotMetricEntry[]>,
  metricKeys: string[],
  buckets: Bucket[]
): PilotTrendSeries[] {
  return metricKeys.map((key) => {
    const entries = grouped[key] || [];
    const definition = getMetricDefinition(key);
    const points = buckets.map((bucket) => ({
      bucket: bucket.bucket,
      startDate: formatDate(bucket.start),
      endDate: formatDate(bucket.end),
      value: aggregateBucket(entries, bucket.start, bucket.end, definition.type),
    }));
    return { metricKey: key, metricType: definition.type, unit: definition.unit, points };
  });
}

function buildCompareSummaries(pilot: PilotMetricSummary[], control: PilotMetricSummary[]): PilotCompareSummary[] {
  const controlMap = new Map(control.map((summary) => [summary.metricKey, summary]));
  return pilot.map((summary) => {
    const controlSummary = controlMap.get(summary.metricKey);
    const delta = computeDelta(summary.value, controlSummary?.value ?? null);
    return {
      metricKey: summary.metricKey,
      metricType: summary.metricType,
      unit: summary.unit,
      pilotValue: summary.value,
      controlValue: controlSummary?.value ?? null,
      delta: delta.value,
      direction: delta.direction,
    };
  });
}

function computeDelta(pilot: number | null, control: number | null): { value: number | null; direction: 'up' | 'down' | 'flat' | null } {
  if (pilot === null || control === null) {
    return { value: null, direction: null };
  }
  const value = Number((pilot - control).toFixed(2));
  const direction = value === 0 ? 'flat' : value > 0 ? 'up' : 'down';
  return { value, direction };
}

function groupByMetric(entries: PilotMetricEntry[]): Record<string, PilotMetricEntry[]> {
  return entries.reduce<Record<string, PilotMetricEntry[]>>((acc, entry) => {
    acc[entry.metricKey] = acc[entry.metricKey] || [];
    acc[entry.metricKey].push(entry);
    return acc;
  }, {});
}

function getLatestEntry(entries: PilotMetricEntry[]): PilotMetricEntry | undefined {
  return [...entries].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.createdAt.localeCompare(b.createdAt);
  }).pop();
}

function aggregateBucket(entries: PilotMetricEntry[], start: Date, end: Date, type: PilotMetricType): number | null {
  const inRange = entries.filter((entry) => {
    const date = parseDate(entry.date);
    return date >= start && date <= end;
  });
  if (!inRange.length) return null;
  if (type === 'count') {
    return inRange.reduce((sum, entry) => sum + entry.value, 0);
  }
  const avg = inRange.reduce((sum, entry) => sum + entry.value, 0) / inRange.length;
  return Number(avg.toFixed(2));
}

function buildBuckets(dateFrom?: string, dateTo?: string): Bucket[] {
  const start = parseDate(dateFrom || formatDate(new Date(Date.now() - 7 * 86400000)));
  const end = parseDate(dateTo || formatDate(new Date()));
  const days = Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
  if (days <= 14) {
    return buildDailyBuckets(start, end);
  }
  if (days <= 90) {
    return buildWeeklyBuckets(start, end);
  }
  return buildMonthlyBuckets(start, end);
}

function buildDailyBuckets(start: Date, end: Date): Bucket[] {
  const buckets: Bucket[] = [];
  let current = new Date(start);
  while (current <= end) {
    const next = new Date(current);
    buckets.push({ bucket: formatDate(current), start: new Date(current), end: new Date(next) });
    current.setDate(current.getDate() + 1);
  }
  return buckets;
}

function buildWeeklyBuckets(start: Date, end: Date): Bucket[] {
  const buckets: Bucket[] = [];
  let current = startOfIsoWeek(start);
  while (current <= end) {
    const bucketStart = new Date(current);
    const bucketEnd = new Date(current);
    bucketEnd.setDate(bucketEnd.getDate() + 6);
    buckets.push({ bucket: isoWeekLabel(bucketStart), start: bucketStart, end: bucketEnd });
    current.setDate(current.getDate() + 7);
  }
  return buckets;
}

function buildMonthlyBuckets(start: Date, end: Date): Bucket[] {
  const buckets: Bucket[] = [];
  let current = new Date(start.getFullYear(), start.getMonth(), 1);
  while (current <= end) {
    const bucketStart = new Date(current);
    const bucketEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
    buckets.push({ bucket: `${bucketStart.getFullYear()}-${String(bucketStart.getMonth() + 1).padStart(2, '0')}`, start: bucketStart, end: bucketEnd });
    current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
  }
  return buckets;
}

function startOfIsoWeek(date: Date): Date {
  const day = date.getUTCDay() || 7;
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  start.setUTCDate(start.getUTCDate() - day + 1);
  return start;
}

function isoWeekLabel(date: Date): string {
  const temp = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = temp.getUTCDay() || 7;
  temp.setUTCDate(temp.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((temp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${temp.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function parseDate(value: string): Date {
  return new Date(`${value}T00:00:00Z`);
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
