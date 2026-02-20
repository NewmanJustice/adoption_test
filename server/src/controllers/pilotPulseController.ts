import { Response } from 'express';
import { AuthRequest } from '../types/auth.js';
import { PilotPulseService } from '../services/pilotPulseService.js';

export class PilotPulseController {
  constructor(public service: PilotPulseService) {}

  submit = async (req: AuthRequest, res: Response): Promise<void> => {
    const role = req.session.user!.role;
    const result = await this.service.submitPulse(req.body as Record<string, unknown>, role);
    if (!result.success) {
      res.status(400).json({ error: 'Validation failed', fields: result.errors });
      return;
    }
    res.status(201).json({ success: true, role });
  };

  getTrends = async (_req: AuthRequest, res: Response): Promise<void> => {
    const result = await this.service.getTrends();
    res.status(200).json({ data: result });
  };
}
