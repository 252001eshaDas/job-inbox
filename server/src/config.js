import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const config = {
  port: Number(process.env.PORT) || 4000,
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  mock: process.env.MOCK === 'true',
  syncDays: Number(process.env.SYNC_DAYS) || 14,
  gmailEmailLimit: Number(process.env.GMAIL_EMAIL_LIMIT) || 10,
  syncCooldownMs: Number(process.env.SYNC_COOLDOWN_MS) || 60_000,
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri:
      process.env.GOOGLE_REDIRECT_URI ||
      'http://localhost:4000/api/auth/google/callback',
    scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
  },
  paths: {
    dataDir: path.join(root, 'data'),
    sampleJobs: path.join(root, 'data', 'sample-jobs.json'),
    jobs: path.join(root, 'data', 'jobs.json'),
    mockJobs: path.join(root, 'data', 'jobs.mock.json'),
    token: path.join(root, 'data', '.token.json'),
  },
  // Senders whose mail we treat as job alerts
  senders: {
    indeed: ['indeed.com', 'indeedemail.com'],
    naukri: ['naukri.com'],
  },
};
