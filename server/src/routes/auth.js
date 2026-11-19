import { Router } from 'express';
import { config } from '../config.js';
import {
  credentialsConfigured,
  getAuthUrl,
  isAuthorized,
  saveTokenFromCode,
} from '../services/gmail.js';

const router = Router();

router.get('/auth/status', async (_req, res) => {
  res.json({
    mock: config.mock,
    credentialsConfigured: credentialsConfigured(),
    authorized: config.mock ? true : await isAuthorized(),
  });
});

router.get('/auth/google', (_req, res) => {
  if (!credentialsConfigured()) {
    return res
      .status(500)
      .send('Google credentials are missing. See docs/GMAIL_SETUP.md.');
  }
  return res.redirect(getAuthUrl());
});

router.get('/auth/google/callback', async (req, res, next) => {
  try {
    const { code, error } = req.query;
    if (error || !code) {
      return res.redirect(`${config.clientOrigin}/?auth=failed`);
    }
    await saveTokenFromCode(String(code));
    return res.redirect(`${config.clientOrigin}/?auth=ok`);
  } catch (err) {
    return next(err);
  }
});

export default router;
