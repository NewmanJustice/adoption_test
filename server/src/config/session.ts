import { SessionOptions } from 'express-session';
import { config } from './index.js';

/**
 * Session configuration for express-session
 */
export const sessionConfig: SessionOptions = {
  secret: config.sessionSecret,
  name: 'adoption.sid',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 30 * 60 * 1000, // 30 minutes
  },
};
