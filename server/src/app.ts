import express, { Request, Response, NextFunction, Router } from 'express';
import { AuthSessionData } from './types/auth.js';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config/index.js';
import { pool } from './config/database.js';
import { sessionMiddleware } from './middleware/sessionMiddleware.js';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import protectedRouter from './routes/protected.js';
import caseRouter from './routes/cases.js';
import { createDocumentRoutes } from './routes/documents.js';
import { DocumentRepository } from './repositories/documentRepository.js';
import { DocumentService } from './services/documentService.js';
import { OcrService } from './services/ocrService.js';
import { DocumentController } from './controllers/documentController.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFound.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust proxy for Azure App Service (required for secure cookies behind load balancer)
app.set('trust proxy', 1);

// Security middleware with CSP configured for React SPA and GOV.UK Frontend
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      fontSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware (must come before auth routes)
app.use(sessionMiddleware);

// Site access code configuration
const siteAccessCode = process.env.SITE_ACCESS_CODE || '';
const siteAccessEnabled = siteAccessCode.length > 0;

if (siteAccessEnabled) {
  console.log('[Site Access] Access code protection enabled');
}

// Helper to check if site access is granted
function hasSiteAccess(req: Request): boolean {
  if (!siteAccessEnabled) return true;
  const session = req.session as AuthSessionData;
  return session?.siteAccessGranted === true;
}

// Site access verification endpoint
app.post('/api/site-access/verify', (req: Request, res: Response) => {
  const { code } = req.body;

  if (!siteAccessEnabled) {
    return res.json({ success: true });
  }

  if (code === siteAccessCode) {
    const session = req.session as AuthSessionData;
    session.siteAccessGranted = true;
    return res.json({ success: true });
  }

  return res.status(401).json({ success: false, error: 'Invalid access code' });
});

// Site access status endpoint
app.get('/api/site-access/status', (req: Request, res: Response) => {
  res.json({
    required: siteAccessEnabled,
    granted: hasSiteAccess(req)
  });
});

const annotationEnabled = process.env.ANNOTATION_ENABLED === 'true';
const annotationDbPath = process.env.ANNOTATION_DB_PATH || './prototype-annotator/annotator.sqlite';

if (annotationEnabled) {
  console.log(`[Annotator] Enabled: true, DB Path: ${annotationDbPath}`);
} else {
  console.log('[Annotator] Disabled');
}

// Annotator middleware - must be initialized early to inject scripts into HTML responses
type AnnotatorInstance = { middleware: () => Router; router: Router; injector: (req: Request, res: Response, next: NextFunction) => void };
let annotatorPromise: Promise<AnnotatorInstance> | null = null;
let annotatorError: Error | null = null;

async function getAnnotator(): Promise<AnnotatorInstance | null> {
  if (!annotationEnabled) return null;
  if (annotatorError) return null;

  if (!annotatorPromise) {
    annotatorPromise = (async () => {
      try {
        const parentDir = path.dirname(annotationDbPath);
        fs.mkdirSync(parentDir, { recursive: true });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`[Annotator] Failed to initialise: ${errorMessage}`);
        throw err;
      }

      const mod = await import('prototype-annotator');
      return mod.createPrototypeAnnotator({
        basePath: '/__prototype-annotator',
        actorMode: 'prompt',
        urlMode: 'canonical',
        dbPath: annotationDbPath
      });
    })();
  }

  try {
    return await annotatorPromise;
  } catch (err) {
    if (!annotatorError) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`[Annotator] Failed to initialise: ${errorMessage}`);
      annotatorError = err instanceof Error ? err : new Error(String(err));
    }
    return null;
  }
}

if (annotationEnabled) {
  // Mount annotator router for API routes at /__prototype-annotator/*
  // Note: We don't use the injector middleware because express.static uses
  // streaming (pipe) which bypasses response wrappers. Instead, we manually
  // inject the script when serving index.html in production.
  app.use(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.path.startsWith('/__prototype-annotator')) {
      return next();
    }

    // Require site access for annotator
    if (!hasSiteAccess(req)) {
      return res.status(403).json({ error: 'Site access required' });
    }

    const annotator = await getAnnotator();
    if (!annotator) {
      return res.status(404).json({ error: 'Annotator not available' });
    }

    // Use router for API routes and static assets (overlay.js, dashboard)
    annotator.router(req, res, next);
  });
}

// Helper to inject annotator script into HTML
function injectAnnotatorScript(html: string): string {
  if (!annotationEnabled) return html;
  if (!html.includes('</body>')) return html;
  if (html.includes('prototype-annotator-root')) return html; // Already injected

  const configScript = `<script>window.__PROTOTYPE_ANNOTATOR_CONFIG__=${JSON.stringify({
    basePath: '/__prototype-annotator',
    apiUrl: '/__prototype-annotator/api',
    defaultActor: 'anonymous',
    actorMode: 'prompt'
  })};</script>`;
  const overlayScript = `<script src="/__prototype-annotator/overlay.js"></script>`;

  return html.replace('</body>', `${configScript}${overlayScript}</body>`);
}

// API routes
app.use('/api', healthRouter);

// Public health endpoint (accessible without auth)
app.get('/api/public/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Auth routes (login, logout, session - all public)
app.use('/api', authRouter);

// Protected routes (require authentication)
app.use('/api', protectedRouter);

// Case management routes
app.use('/api', caseRouter);

// Document management routes
const documentRepository = new DocumentRepository(pool);
const ocrService = new OcrService(documentRepository);
const documentService = new DocumentService(documentRepository, ocrService);
const documentController = new DocumentController(documentService);
const documentRoutes = createDocumentRoutes(documentController);
app.use('/api', documentRoutes);

// Serve static files from client build (production)
if (process.env.NODE_ENV === 'production') {
  const publicPath = path.join(__dirname, 'public');
  const indexHtmlPath = path.join(publicPath, 'index.html');

  // Cache both versions of index.html
  let cachedIndexHtmlWithAnnotator: string | null = null;
  let cachedIndexHtmlWithoutAnnotator: string | null = null;

  function getIndexHtml(withAnnotator: boolean): string {
    if (withAnnotator) {
      if (!cachedIndexHtmlWithAnnotator) {
        const rawHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
        cachedIndexHtmlWithAnnotator = injectAnnotatorScript(rawHtml);
      }
      return cachedIndexHtmlWithAnnotator;
    } else {
      if (!cachedIndexHtmlWithoutAnnotator) {
        cachedIndexHtmlWithoutAnnotator = fs.readFileSync(indexHtmlPath, 'utf-8');
      }
      return cachedIndexHtmlWithoutAnnotator;
    }
  }

  // Serve static assets (but not index.html directly - we handle that separately)
  app.use(express.static(publicPath, {
    index: false // Don't serve index.html automatically
  }));

  // Handle SPA routes - serve index.html with conditionally injected annotator script
  // Only for navigation requests, not static assets
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    // Skip API and annotator routes
    if (req.path.startsWith('/api') || req.path.startsWith('/__prototype-annotator')) {
      return next();
    }

    // Skip static asset requests - let them 404 naturally
    // This prevents serving HTML for missing .js/.css/.map files
    const staticExtensions = ['.js', '.css', '.map', '.json', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'];
    if (staticExtensions.some(ext => req.path.endsWith(ext))) {
      return next();
    }

    // Only inject annotator if site access is granted
    const shouldInjectAnnotator = hasSiteAccess(req);

    res.setHeader('Content-Type', 'text/html');
    res.send(getIndexHtml(shouldInjectAnnotator));
  });
}

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
