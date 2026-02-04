import session from 'express-session';
import { sessionConfig } from '../config/session.js';

/**
 * Configured session middleware using express-session
 * Uses memory store for development (not suitable for production)
 */
export const sessionMiddleware = session(sessionConfig);
