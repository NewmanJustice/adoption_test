import { Pool } from 'pg';
import {
  PilotAuditLog,
  PilotConfiguration,
  PilotDeviation,
  PilotLifecycleState,
  PilotMetricEntry,
  PilotMetricHistory,
  PilotMetricNote,
  PilotMetricType,
  PilotPhase,
  UserPreference,
} from '@adoption/shared';

type MetricEntryFilters = {
  dateFrom?: string;
  dateTo?: string;
  phase?: PilotPhase;
  loop?: number;
  metricKey?: string;
};

type AuditFilters = {
  dateFrom?: string;
  dateTo?: string;
  action?: string;
};

export class PilotRepository {
  private schemaEnsured: Promise<void> | null = null;

  constructor(private pool: Pool) {}

  private ensureSchema(): Promise<void> {
    if (this.schemaEnsured) return this.schemaEnsured;

    const ddl = `
      CREATE TABLE IF NOT EXISTS pilot_configuration (
        id VARCHAR(50) PRIMARY KEY,
        domain_scope TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by VARCHAR(100) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS pilot_phase_state (
        id VARCHAR(50) PRIMARY KEY,
        config_id VARCHAR(50) REFERENCES pilot_configuration(id) ON DELETE CASCADE,
        current_phase VARCHAR(20) NOT NULL,
        spec_freeze_at TIMESTAMP WITH TIME ZONE,
        stability_confirmed_at TIMESTAMP WITH TIME ZONE,
        last_transition_at TIMESTAMP WITH TIME ZONE,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_by VARCHAR(100)
      );

      CREATE TABLE IF NOT EXISTS pilot_metric_entries (
        id VARCHAR(50) PRIMARY KEY,
        metric_key VARCHAR(100) NOT NULL,
        metric_type VARCHAR(20) NOT NULL,
        value NUMERIC NOT NULL,
        unit VARCHAR(20) NOT NULL,
        date DATE NOT NULL,
        phase VARCHAR(20) NOT NULL,
        loop_number INT NOT NULL DEFAULT 1,
        role VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by VARCHAR(100) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE
      );

      CREATE TABLE IF NOT EXISTS pilot_metric_history (
        id VARCHAR(50) PRIMARY KEY,
        metric_entry_id VARCHAR(50) REFERENCES pilot_metric_entries(id) ON DELETE CASCADE,
        value NUMERIC NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_by VARCHAR(100) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS pilot_metric_notes (
        id VARCHAR(50) PRIMARY KEY,
        metric_entry_id VARCHAR(50) REFERENCES pilot_metric_entries(id) ON DELETE CASCADE,
        note TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by VARCHAR(100) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS pilot_deviations (
        id VARCHAR(50) PRIMARY KEY,
        description TEXT NOT NULL,
        metric_key VARCHAR(100),
        phase VARCHAR(20) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by VARCHAR(100) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS pilot_audit_log (
        id VARCHAR(50) PRIMARY KEY,
        action VARCHAR(50) NOT NULL,
        actor_id VARCHAR(100) NOT NULL,
        actor_role VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        metadata JSONB
      );

      CREATE TABLE IF NOT EXISTS user_preferences (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        preference_key VARCHAR(100) NOT NULL,
        preference_value TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE,
        UNIQUE(user_id, preference_key)
      );

      CREATE INDEX IF NOT EXISTS idx_pilot_metric_entries_key_date ON pilot_metric_entries(metric_key, date);
      CREATE INDEX IF NOT EXISTS idx_pilot_metric_entries_phase ON pilot_metric_entries(phase);
      CREATE INDEX IF NOT EXISTS idx_pilot_metric_history_entry ON pilot_metric_history(metric_entry_id);
      CREATE INDEX IF NOT EXISTS idx_pilot_metric_notes_entry ON pilot_metric_notes(metric_entry_id);
      CREATE INDEX IF NOT EXISTS idx_pilot_deviations_created_at ON pilot_deviations(created_at);
      CREATE INDEX IF NOT EXISTS idx_pilot_audit_log_created_at ON pilot_audit_log(created_at);
      CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);
    `;

    this.schemaEnsured = this.pool
      .query(ddl)
      .then(() => undefined)
      .catch((err) => {
        this.schemaEnsured = null;
        throw err;
      });

    return this.schemaEnsured;
  }

  async getConfig(): Promise<PilotConfiguration | null> {
    await this.ensureSchema();
    const result = await this.pool.query('SELECT * FROM pilot_configuration LIMIT 1');
    return result.rows[0] ? this.mapConfig(result.rows[0]) : null;
  }

  async createConfig(config: PilotConfiguration): Promise<PilotConfiguration> {
    await this.ensureSchema();
    const result = await this.pool.query(
      `INSERT INTO pilot_configuration (id, domain_scope, created_at, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [config.id, config.domainScope, config.createdAt, config.createdBy]
    );
    return this.mapConfig(result.rows[0]);
  }

  async getPhaseState(): Promise<PilotLifecycleState | null> {
    await this.ensureSchema();
    const result = await this.pool.query('SELECT * FROM pilot_phase_state LIMIT 1');
    return result.rows[0] ? this.mapPhase(result.rows[0]) : null;
  }

  async upsertPhaseState(state: {
    id: string;
    configId: string;
    phase: PilotPhase;
    phaseLabel: string;
    lastTransitionAt?: string;
    specFreezeAt?: string;
    stabilityConfirmedAt?: string;
    updatedBy?: string;
  }): Promise<PilotLifecycleState> {
    await this.ensureSchema();
    const result = await this.pool.query(
      `INSERT INTO pilot_phase_state (
        id, config_id, current_phase, spec_freeze_at, stability_confirmed_at,
        last_transition_at, updated_by, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (id) DO UPDATE SET
        config_id = EXCLUDED.config_id,
        current_phase = EXCLUDED.current_phase,
        spec_freeze_at = EXCLUDED.spec_freeze_at,
        stability_confirmed_at = EXCLUDED.stability_confirmed_at,
        last_transition_at = EXCLUDED.last_transition_at,
        updated_by = EXCLUDED.updated_by,
        updated_at = NOW()
      RETURNING *`,
      [
        state.id,
        state.configId,
        state.phase,
        state.specFreezeAt || null,
        state.stabilityConfirmedAt || null,
        state.lastTransitionAt || null,
        state.updatedBy || null,
      ]
    );
    const mapped = this.mapPhase(result.rows[0]);
    return { ...mapped, phaseLabel: state.phaseLabel };
  }

  async listMetricEntries(filters: MetricEntryFilters): Promise<PilotMetricEntry[]> {
    await this.ensureSchema();
    const { clause, values } = this.buildMetricFilters(filters);
    const result = await this.pool.query(
      `SELECT * FROM pilot_metric_entries ${clause}
       ORDER BY metric_key ASC, date ASC, created_at ASC`,
      values
    );
    return result.rows.map((row) => this.mapMetric(row));
  }

  async getMetricEntry(entryId: string): Promise<PilotMetricEntry | null> {
    await this.ensureSchema();
    const result = await this.pool.query(
      'SELECT * FROM pilot_metric_entries WHERE id = $1',
      [entryId]
    );
    return result.rows[0] ? this.mapMetric(result.rows[0]) : null;
  }

  async createMetricEntry(entry: PilotMetricEntry): Promise<PilotMetricEntry> {
    await this.ensureSchema();
    const result = await this.pool.query(
      `INSERT INTO pilot_metric_entries (
        id, metric_key, metric_type, value, unit, date, phase,
        loop_number, role, created_at, created_by, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        entry.id,
        entry.metricKey,
        entry.metricType,
        entry.value,
        entry.unit,
        entry.date,
        entry.phase,
        entry.loop,
        entry.role,
        entry.createdAt,
        entry.createdBy,
        entry.updatedAt || null,
      ]
    );
    return this.mapMetric(result.rows[0]);
  }

  async updateMetricEntry(
    entryId: string,
    updates: {
      value: number;
      unit: string;
      date: string;
      phase: PilotPhase;
      loop: number;
      metricType: PilotMetricType;
      role: string;
    }
  ): Promise<PilotMetricEntry> {
    await this.ensureSchema();
    const result = await this.pool.query(
      `UPDATE pilot_metric_entries
       SET value = $1, unit = $2, date = $3, phase = $4, loop_number = $5,
           metric_type = $6, role = $7, updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [
        updates.value,
        updates.unit,
        updates.date,
        updates.phase,
        updates.loop,
        updates.metricType,
        updates.role,
        entryId,
      ]
    );
    return this.mapMetric(result.rows[0]);
  }

  async createMetricHistory(history: PilotMetricHistory): Promise<void> {
    await this.ensureSchema();
    await this.pool.query(
      `INSERT INTO pilot_metric_history (id, metric_entry_id, value, updated_at, updated_by)
       VALUES ($1, $2, $3, $4, $5)`,
      [history.id, history.metricEntryId, history.value, history.updatedAt, history.updatedBy]
    );
  }

  async createMetricNote(note: PilotMetricNote): Promise<PilotMetricNote> {
    await this.ensureSchema();
    const result = await this.pool.query(
      `INSERT INTO pilot_metric_notes (id, metric_entry_id, note, created_at, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [note.id, note.metricEntryId, note.note, note.createdAt, note.createdBy]
    );
    return this.mapMetricNote(result.rows[0]);
  }

  async listDeviations(filters: MetricEntryFilters): Promise<PilotDeviation[]> {
    await this.ensureSchema();
    const { clause, values } = this.buildMetricFilters(filters, 'pilot_deviations');
    const result = await this.pool.query(
      `SELECT * FROM pilot_deviations ${clause}
       ORDER BY created_at DESC`,
      values
    );
    return result.rows.map((row) => this.mapDeviation(row));
  }

  async createDeviation(deviation: PilotDeviation): Promise<PilotDeviation> {
    await this.ensureSchema();
    const result = await this.pool.query(
      `INSERT INTO pilot_deviations (
        id, description, metric_key, phase, created_at, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        deviation.id,
        deviation.description,
        deviation.metricKey || null,
        deviation.phase,
        deviation.createdAt,
        deviation.createdBy,
      ]
    );
    return this.mapDeviation(result.rows[0]);
  }

  async createAuditLog(log: PilotAuditLog): Promise<void> {
    await this.ensureSchema();
    await this.pool.query(
      `INSERT INTO pilot_audit_log (id, action, actor_id, actor_role, created_at, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [log.id, log.action, log.actorId, log.actorRole, log.createdAt, log.metadata || null]
    );
  }

  async listAuditLogs(filters: AuditFilters): Promise<PilotAuditLog[]> {
    await this.ensureSchema();
    const clauses: string[] = [];
    const values: Array<string> = [];

    if (filters.dateFrom) {
      values.push(filters.dateFrom);
      clauses.push(`created_at >= $${values.length}`);
    }
    if (filters.dateTo) {
      values.push(filters.dateTo);
      clauses.push(`created_at <= $${values.length}`);
    }
    if (filters.action) {
      values.push(filters.action);
      clauses.push(`action = $${values.length}`);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const result = await this.pool.query(
      `SELECT * FROM pilot_audit_log ${where} ORDER BY created_at DESC`,
      values
    );
    return result.rows.map((row) => this.mapAudit(row));
  }

  private mapConfig(row: any): PilotConfiguration {
    return {
      id: row.id,
      domainScope: row.domain_scope,
      createdAt: row.created_at,
      createdBy: row.created_by,
    };
  }

  private mapPhase(row: any): PilotLifecycleState {
    return {
      phase: row.current_phase,
      phaseLabel: row.current_phase,
      lastTransitionAt: row.last_transition_at,
      specFreezeAt: row.spec_freeze_at,
      stabilityConfirmedAt: row.stability_confirmed_at,
    };
  }

  private mapMetric(row: any): PilotMetricEntry {
    return {
      id: row.id,
      metricKey: row.metric_key,
      metricType: row.metric_type,
      value: Number(row.value),
      unit: row.unit,
      date: row.date,
      phase: row.phase,
      loop: row.loop_number,
      role: row.role,
      createdAt: row.created_at,
      createdBy: row.created_by,
      updatedAt: row.updated_at || undefined,
    };
  }

  private mapMetricNote(row: any): PilotMetricNote {
    return {
      id: row.id,
      metricEntryId: row.metric_entry_id,
      note: row.note,
      createdAt: row.created_at,
      createdBy: row.created_by,
    };
  }

  private mapDeviation(row: any): PilotDeviation {
    return {
      id: row.id,
      description: row.description,
      metricKey: row.metric_key || undefined,
      phase: row.phase,
      createdAt: row.created_at,
      createdBy: row.created_by,
    };
  }

  private mapAudit(row: any): PilotAuditLog {
    return {
      id: row.id,
      action: row.action,
      actorId: row.actor_id,
      actorRole: row.actor_role,
      createdAt: row.created_at,
      metadata: row.metadata || undefined,
    };
  }

  private buildMetricFilters(filters: MetricEntryFilters, table = 'pilot_metric_entries') {
    const clauses: string[] = [];
    const values: Array<string | number> = [];
    const dateColumn = table === 'pilot_deviations' ? 'created_at' : 'date';

    if (filters.dateFrom) {
      values.push(filters.dateFrom);
      clauses.push(`${dateColumn} >= $${values.length}`);
    }
    if (filters.dateTo) {
      values.push(filters.dateTo);
      clauses.push(`${dateColumn} <= $${values.length}`);
    }
    if (filters.phase) {
      values.push(filters.phase);
      clauses.push(`phase = $${values.length}`);
    }
    if (filters.loop !== undefined && table !== 'pilot_deviations') {
      values.push(filters.loop);
      clauses.push(`loop_number = $${values.length}`);
    }
    if (filters.metricKey) {
      values.push(filters.metricKey);
      clauses.push(`metric_key = $${values.length}`);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const clause = table === 'pilot_deviations' ? where : where;
    return { clause, values };
  }

  async getUserPreference(userId: string, key: string): Promise<UserPreference | null> {
    await this.ensureSchema();
    const result = await this.pool.query(
      'SELECT * FROM user_preferences WHERE user_id = $1 AND preference_key = $2',
      [userId, key]
    );
    return result.rows[0] ? this.mapUserPreference(result.rows[0]) : null;
  }

  async setUserPreference(pref: UserPreference): Promise<UserPreference> {
    await this.ensureSchema();
    const result = await this.pool.query(
      `INSERT INTO user_preferences (id, user_id, preference_key, preference_value, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, preference_key)
       DO UPDATE SET preference_value = $4, updated_at = $6
       RETURNING *`,
      [pref.id, pref.userId, pref.preferenceKey, pref.preferenceValue, pref.createdAt, pref.updatedAt || null]
    );
    return this.mapUserPreference(result.rows[0]);
  }

  private mapUserPreference(row: any): UserPreference {
    return {
      id: row.id,
      userId: row.user_id,
      preferenceKey: row.preference_key,
      preferenceValue: row.preference_value,
      createdAt: row.created_at,
      updatedAt: row.updated_at || undefined,
    };
  }
}
