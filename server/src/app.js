import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import jobsRouter from './routes/jobs.js';
import authRouter from './routes/auth.js';

export function createApp() {
  const app = express();
  app.use(cors({ origin: config.clientOrigin }));
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, mock: config.mock });
  });
  app.use('/api', authRouter);
  app.use('/api', jobsRouter);

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    const googleStatus = err?.code || err?.response?.status;
    const status = err.statusCode || (googleStatus === 429 ? 429 : 500);
    if (status === 500) console.error(err);
    if (googleStatus === 429) {
      res.set('Retry-After', '60');
      return res.status(429).json({
        error: 'Gmail API quota exceeded. Sync is limited to 10 emails; please wait one minute and try again.',
        retryAfterSeconds: 60,
      });
    }
    return res.status(status).json({ error: err.message || 'Server error' });
  });

  return app;
}
