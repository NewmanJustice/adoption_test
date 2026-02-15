import { Response } from 'express';
import { PilotService } from '../services/pilotService.js';
import { AuthRequest } from '../types/auth.js';
import { PilotDashboardFilters, PilotExperimentType, PilotPhase } from '@adoption/shared';

type ErrorCode = 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT' | 'VALIDATION';

export class PilotController {
  constructor(private pilotService: PilotService) {}

  getOverview = async (req: AuthRequest, res: Response) => {
    const overview = await this.pilotService.getOverview();
    res.json(overview);
  };

  createConfig = async (req: AuthRequest, res: Response) => {
    const result = await this.pilotService.createConfig(
      {
        domainScope: req.body.domainScope,
        experimentType: req.body.experimentType,
      },
      req.session.user!
    );
    if (!result.success) {
      return this.sendError(res, result.error, result.code as ErrorCode);
    }
    res.status(201).json({ phase: result.data });
  };

  setSpecFreeze = async (req: AuthRequest, res: Response) => {
    const result = await this.pilotService.setSpecFreeze(req.session.user!);
    if (!result.success) {
      return this.sendError(res, result.error, result.code as ErrorCode);
    }
    res.json({ phase: result.data });
  };

  transitionPhase = async (req: AuthRequest, res: Response) => {
    const result = await this.pilotService.transitionPhase(
      req.body.phase as PilotPhase,
      Boolean(req.body.stabilityConfirmed),
      req.session.user!
    );
    if (!result.success) {
      return this.sendError(res, result.error, result.code as ErrorCode);
    }
    res.json({ phase: result.data });
  };

  createMetricEntry = async (req: AuthRequest, res: Response) => {
    const result = await this.pilotService.createMetricEntry(req.body, req.session.user!);
    if (!result.success) {
      return this.sendError(res, result.error, result.code as ErrorCode);
    }
    res.status(201).json({ entry: result.data });
  };

  updateMetricEntry = async (req: AuthRequest, res: Response) => {
    const result = await this.pilotService.updateMetricEntry(
      req.params.entryId,
      req.body,
      req.session.user!
    );
    if (!result.success) {
      return this.sendError(res, result.error, result.code as ErrorCode);
    }
    res.json({ entry: result.data });
  };

  addMetricNote = async (req: AuthRequest, res: Response) => {
    const result = await this.pilotService.addMetricNote(
      req.params.entryId,
      req.body.note,
      req.session.user!
    );
    if (!result.success) {
      return this.sendError(res, result.error, result.code as ErrorCode);
    }
    res.status(201).json({ note: result.data });
  };

  recordDeviation = async (req: AuthRequest, res: Response) => {
    const result = await this.pilotService.recordDeviation(req.body, req.session.user!);
    if (!result.success) {
      return this.sendError(res, result.error, result.code as ErrorCode);
    }
    res.status(201).json({ deviation: result.data });
  };

  getDashboard = async (req: AuthRequest, res: Response) => {
    const filters = parseDashboardFilters(req.query);
    const result = await this.pilotService.getDashboard(filters, req.session.user!);
    if (!result.success) {
      return this.sendError(res, result.error, result.code as ErrorCode);
    }
    res.json(result.data);
  };

  getAuditLogs = async (req: AuthRequest, res: Response) => {
    const logs = await this.pilotService.getAuditLogs({
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined,
      action: req.query.action as string | undefined,
    });
    res.json({ logs });
  };

  private sendError(res: Response, error: string, code?: ErrorCode) {
    const status = mapErrorStatus(code);
    res.status(status).json({ error, code });
  }
}

function parseDashboardFilters(query: Record<string, unknown>): PilotDashboardFilters {
  const experimentType = parseExperimentType(query.experimentType);
  return {
    dateFrom: query.dateFrom as string | undefined,
    dateTo: query.dateTo as string | undefined,
    phase: query.phase as PilotPhase | undefined,
    loop: query.loop ? Number(query.loop) : undefined,
    experimentType,
    compare: query.compare === 'true',
  };
}

function parseExperimentType(value: unknown): PilotExperimentType | undefined {
  if (value === 'pilot' || value === 'control') {
    return value;
  }
  return undefined;
}

function mapErrorStatus(code?: ErrorCode): number {
  switch (code) {
    case 'FORBIDDEN':
      return 403;
    case 'NOT_FOUND':
      return 404;
    case 'CONFLICT':
      return 409;
    case 'VALIDATION':
      return 400;
    default:
      return 400;
  }
}
