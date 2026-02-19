import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { AuthRequest, UserRole } from '../types/auth.js';
import { PilotPulseController } from '../controllers/pilotPulseController.js';

const BUILDER_SME: UserRole[] = ['PILOT_BUILDER', 'PILOT_SME'];
const ALL_PILOT: UserRole[] = ['PILOT_BUILDER', 'PILOT_SME', 'PILOT_OBSERVER'];

type AsyncHandler = (req: AuthRequest, res: Response) => Promise<unknown>;

function wrapAsync(handler: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req as AuthRequest, res)).catch(next);
  };
}

const SECTION_QUESTIONS = [
  {
    sectionName: 'Authority',
    fullName: 'Authority & Decision Structure',
    questions: [
      { id: 'q1', label: 'Decision-making authority is clearly defined' },
      { id: 'q2', label: 'Responsibilities are appropriately distributed' },
      { id: 'q3', label: 'Clarity of authority structures feels adequate' },
    ],
  },
  {
    sectionName: 'Service Intent',
    fullName: 'Service Intent & Boundaries',
    questions: [
      { id: 'q4', label: 'Service boundaries are well understood' },
      { id: 'q5', label: 'Intent is clearly communicated across teams' },
      { id: 'q6', label: 'Service intent clarity feels adequate' },
    ],
  },
  {
    sectionName: 'Lifecycle',
    fullName: 'Lifecycle & Operational Modelling',
    questions: [
      { id: 'q7', label: 'Lifecycle stages are clearly defined' },
      { id: 'q8', label: 'Operational models are well understood' },
      { id: 'q9', label: 'Lifecycle and operational clarity feels adequate' },
    ],
  },
  {
    sectionName: 'Architectural',
    fullName: 'Architectural & Dependency Discipline',
    questions: [
      { id: 'q10', label: 'Architectural dependencies are well documented' },
      { id: 'q11', label: 'Technical debt is managed effectively' },
      { id: 'q12', label: 'Architectural clarity feels adequate' },
    ],
  },
];

function renderQuestionnaireHtml(role: string): string {
  const fieldsets = SECTION_QUESTIONS.flatMap(section =>
    section.questions.map(q => `
    <fieldset class="govuk-fieldset">
      <legend class="govuk-fieldset__legend govuk-fieldset__legend--s">
        <h3 class="govuk-fieldset__heading">${section.fullName} — ${q.label}</h3>
      </legend>
      <div class="govuk-radios" data-module="govuk-radios">
        ${[1,2,3,4,5].map(v => `
        <div class="govuk-radios__item">
          <input class="govuk-radios__input" id="${q.id}-${v}" name="${q.id}" type="radio" value="${v}">
          <label class="govuk-label govuk-radios__label" for="${q.id}-${v}">${v}</label>
        </div>`).join('')}
      </div>
    </fieldset>`)
  ).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Pulse Questionnaire</title></head>
<body class="govuk-template__body">
  <div class="govuk-width-container">
    <main class="govuk-main-wrapper">
      <h1 class="govuk-heading-xl">Pilot Pulse Questionnaire</h1>
      <p class="govuk-body">Role: ${role}</p>
      <form action="/api/pilot/pulse" method="post">
        <h2 class="govuk-heading-l">Authority</h2>
        <h2 class="govuk-heading-l">Service Intent</h2>
        <h2 class="govuk-heading-l">Lifecycle</h2>
        <h2 class="govuk-heading-l">Architectural</h2>
        ${fieldsets}
        <div class="govuk-form-group">
          <label class="govuk-label" for="free_text">
            Where does structural clarity feel weakest right now?
          </label>
          <div id="free_text-hint" class="govuk-hint">Do not include personal data</div>
          <textarea class="govuk-textarea" id="free_text" name="free_text" rows="5"
            aria-describedby="free_text-hint"></textarea>
        </div>
        <button type="submit" class="govuk-button">Submit</button>
      </form>
    </main>
  </div>
</body>
</html>`;
}

function renderTrendsHtml(trendsData: { windows: unknown[]; trendInferenceSuppressed: boolean }): string {
  const suppressed = trendsData.trendInferenceSuppressed;
  const empty = trendsData.windows.length === 0;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Structural Trends</title></head>
<body class="govuk-template__body">
  <div class="govuk-width-container">
    <main class="govuk-main-wrapper">
      <h1 class="govuk-heading-xl">Structural Trends</h1>
      ${empty ? '<div class="govuk-inset-text"><p class="govuk-body">No pulse responses have been submitted yet</p></div>' : ''}
      ${suppressed && !empty ? '<div class="govuk-inset-text"><p class="govuk-body">Insufficient data for trend inference</p></div>' : ''}
      <h2 class="govuk-heading-l">Authority</h2>
      <h2 class="govuk-heading-l">Service Intent</h2>
      <h2 class="govuk-heading-l">Lifecycle</h2>
      <h2 class="govuk-heading-l">Architectural</h2>
      <div id="trends-data" data-windows="${trendsData.windows.length}"></div>
    </main>
  </div>
</body>
</html>`;
}

function renderPilotHtml(role: string): string {
  const canSeeQuestionnaire = role === 'PILOT_BUILDER' || role === 'PILOT_SME';
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Pilot Dashboard</title></head>
<body class="govuk-template__body">
  <div class="govuk-width-container">
    <div class="govuk-grid-row">
      <aside class="govuk-grid-column-one-quarter">
        <nav>
          <ul class="govuk-list">
            <li><a class="govuk-link" href="/pilot/pulse/trends">Structural trends</a></li>
            ${canSeeQuestionnaire ? '<li><a class="govuk-link" href="/pilot/pulse/questionnaire">Pulse questionnaire</a></li>' : ''}
          </ul>
        </nav>
      </aside>
      <main class="govuk-grid-column-three-quarters govuk-main-wrapper">
        <h1 class="govuk-heading-xl">Pilot</h1>
      </main>
    </div>
  </div>
</body>
</html>`;
}

export function createPilotPulseRoutes(controller: PilotPulseController): Router {
  const router = Router();

  // API routes
  router.post('/api/pilot/pulse', requireAuth({ allowedRoles: BUILDER_SME }), wrapAsync(controller.submit));
  router.get('/api/pilot/pulse/trends', requireAuth({ allowedRoles: ALL_PILOT }), wrapAsync(controller.getTrends));
  router.put('/api/pilot/pulse/:id', (_req: Request, res: Response) => res.status(405).json({ error: 'Method Not Allowed' }));
  router.patch('/api/pilot/pulse/:id', (_req: Request, res: Response) => res.status(405).json({ error: 'Method Not Allowed' }));
  router.delete('/api/pilot/pulse/:id', (_req: Request, res: Response) => res.status(405).json({ error: 'Method Not Allowed' }));

  // Server-rendered HTML routes
  router.get('/pilot/pulse/questionnaire', requireAuth({ allowedRoles: BUILDER_SME }), (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    res.setHeader('Content-Type', 'text/html');
    res.send(renderQuestionnaireHtml(authReq.session.user!.role));
  });

  router.get('/pilot/pulse/trends', requireAuth({ allowedRoles: ALL_PILOT }), async (req: Request, res: Response) => {
    const trendsData = await controller['service'].getTrends();
    res.setHeader('Content-Type', 'text/html');
    res.send(renderTrendsHtml(trendsData));
  });

  router.get('/pilot', requireAuth({ allowedRoles: ALL_PILOT }), (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    res.setHeader('Content-Type', 'text/html');
    res.send(renderPilotHtml(authReq.session.user!.role));
  });

  return router;
}
