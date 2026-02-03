import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import healthRouter from './routes/health';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFound';

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

// API routes
app.use('/api', healthRouter);

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
