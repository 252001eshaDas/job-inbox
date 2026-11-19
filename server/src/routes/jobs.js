import { Router } from 'express';
import { config } from '../config.js';
import { applyFilters } from '../services/filters.js';
import { loadJobs, setStatus, upsertJobs } from '../services/jobStore.js';
import { fetchJobEmails, isAuthorized } from '../services/gmail.js';
import { parseEmail } from '../parsers/index.js';

const router = Router();
let lastSyncAt = 0;

router.get('/jobs', async (req, res, next) => {
  try {
    const jobs = await loadJobs();
    const result = applyFilters(jobs, req.query);
    const pageSize = 10;
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const pageCount = Math.ceil(result.length / pageSize);
    const currentPage = pageCount === 0 ? 1 : Math.min(page, pageCount);
    const start = (currentPage - 1) * pageSize;
    const pageJobs = result.slice(start, start + pageSize);
    res.json({
      count: result.length,
      total: jobs.length,
      jobs: pageJobs,
      page: currentPage,
      pageSize,
      pageCount,
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/jobs/:id', async (req, res, next) => {
  try {
    const job = await setStatus(req.params.id, req.body?.status);
    res.json(job);
  } catch (err) {
    next(err);
  }
});

router.post('/sync', async (req, res, next) => {
  try {
    if (config.mock) {
      return res.json({ mock: true, emails: 0, added: 0, message: 'Mock mode: nothing to sync.' });
    }
    if (!(await isAuthorized())) {
      return res.status(401).json({ error: 'Connect Gmail first.' });
    }

    const pageToken = typeof req.body?.pageToken === 'string' ? req.body.pageToken : undefined;
    const now = Date.now();
    const waitMs = config.syncCooldownMs - (now - lastSyncAt);
    if (!pageToken && lastSyncAt && waitMs > 0) {
      res.set('Retry-After', String(Math.ceil(waitMs / 1000)));
      return res.status(429).json({
        error: 'Gmail sync is limited to once per minute. Please wait before syncing again.',
        retryAfterSeconds: Math.ceil(waitMs / 1000),
      });
    }

    lastSyncAt = now;

    const { emails, nextPageToken } = await fetchJobEmails({ pageToken });
    const jobs = emails.flatMap(parseEmail);
    const { added, total } = await upsertJobs(jobs);
    return res.json({ emails: emails.length, parsed: jobs.length, added, total, nextPageToken });
  } catch (err) {
    return next(err);
  }
});

export default router;
