import express, { Request, Response, NextFunction, Router } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'fs';
import path from 'path';
import { config } from './config';
import { sessionMiddleware } from './middleware/sessionMiddleware';
import healthRouter from './routes/health';
import authRouter from './routes/auth';
import protectedRouter from './routes/protected';
import caseRouter from './routes/cases';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFound';

type AnnotatorMiddleware = { router: Router };

const app = express();

// Security middleware
app.use(helmet());

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

const annotationEnabled = process.env.ANNOTATION_ENABLED === 'true';
const annotationDbPath = process.env.ANNOTATION_DB_PATH || './prototype-annotator/annotator.sqlite';

if (annotationEnabled) {
  console.log(`[Annotator] Enabled: true, DB Path: ${annotationDbPath}`);
} else {
  console.log('[Annotator] Disabled');
}

if (annotationEnabled) {
  let annotatorPromise: Promise<AnnotatorMiddleware> | null = null;
  let annotatorError: Error | null = null;

  app.use(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.path.startsWith('/__prototype-annotator')) {
      return next();
    }

    if (annotatorError) {
      return next(annotatorError);
    }

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
      const annotator = await annotatorPromise;
      annotator.router(req, res, next);
    } catch (err) {
      if (!annotatorError) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`[Annotator] Failed to initialise: ${errorMessage}`);
        annotatorError = err instanceof Error ? err : new Error(String(err));
      }
      next(annotatorError);
    }
  });
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

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
