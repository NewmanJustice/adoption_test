import express, { Request, Response, NextFunction, Router } from 'express';
import cors from 'cors';
import helmet from 'helmet';
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

if (process.env.NODE_ENV === 'development') {
  let annotatorPromise: Promise<AnnotatorMiddleware> | null = null;

  app.use(async (req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV !== 'development') {
      return next();
    }

    if (!req.path.startsWith('/__prototype-annotator')) {
      return next();
    }

    if (!annotatorPromise) {
      annotatorPromise = import('prototype-annotator').then(mod =>
        mod.createPrototypeAnnotator({
          basePath: '/__prototype-annotator',
          actorMode: 'prompt',
          urlMode: 'canonical'
        })
      );
    }

    try {
      const annotator = await annotatorPromise;
      annotator.router(req, res, next);
    } catch (err) {
      next(err as Error);
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
