import fs from 'node:fs/promises';
import { google } from 'googleapis';
import { config } from '../config.js';

function oauthClient() {
  const { clientId, clientSecret, redirectUri } = config.google;
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function credentialsConfigured() {
  return Boolean(config.google.clientId && config.google.clientSecret);
}

export function getAuthUrl() {
  return oauthClient().generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: config.google.scopes,
  });
}

export async function saveTokenFromCode(code) {
  const client = oauthClient();
  const { tokens } = await client.getToken(code);
  await fs.mkdir(config.paths.dataDir, { recursive: true });
  await fs.writeFile(config.paths.token, JSON.stringify(tokens), {
    mode: 0o600,
  });
}

async function loadToken() {
  try {
    return JSON.parse(await fs.readFile(config.paths.token, 'utf8'));
  } catch {
    return null;
  }
}

export async function isAuthorized() {
  return Boolean(await loadToken());
}

async function authedClient() {
  const token = await loadToken();
  if (!token) throw new Error('Gmail is not connected yet.');
  const client = oauthClient();
  client.setCredentials(token);
  // keep refreshed tokens
  client.on('tokens', async (fresh) => {
    const merged = { ...token, ...fresh };
    await fs.writeFile(config.paths.token, JSON.stringify(merged), {
      mode: 0o600,
    });
  });
  return client;
}

function decode(data) {
  return Buffer.from(data, 'base64url').toString('utf8');
}

function findHtml(part) {
  if (!part) return '';
  if (part.mimeType === 'text/html' && part.body?.data) {
    return decode(part.body.data);
  }
  for (const child of part.parts || []) {
    const html = findHtml(child);
    if (html) return html;
  }
  return '';
}

function header(message, name) {
  const h = message.payload?.headers?.find(
    (x) => x.name.toLowerCase() === name.toLowerCase(),
  );
  return h ? h.value : '';
}

/**
 * Reads recent job-alert emails.
 * @returns {Promise<Array<{id:string, from:string, subject:string, receivedAt:string, html:string}>>}
 */
export async function fetchJobEmails({ days = config.syncDays, pageToken } = {}) {
  const auth = await authedClient();
  const gmail = google.gmail({ version: 'v1', auth });

  const domains = Object.values(config.senders).flat();
  const q = `from:(${domains.join(' OR ')}) newer_than:${days}d`;
  const limit = Math.min(10, Math.max(1, Number(config.gmailEmailLimit) || 10));

  const res = await withGmailRetry(() => gmail.users.messages.list({
    userId: 'me',
    q,
    maxResults: limit,
    pageToken,
  }));
  const ids = (res.data.messages || []).slice(0, limit).map((m) => m.id);

  const emails = [];
  for (let i = 0; i < ids.length; i += 1) {
    const id = ids[i];
    const { data } = await withGmailRetry(() => gmail.users.messages.get({
      userId: 'me',
      id,
      format: 'full',
    }));
    emails.push({
      id,
      from: header(data, 'From'),
      subject: header(data, 'Subject'),
      receivedAt: new Date(Number(data.internalDate)).toISOString(),
      html: findHtml(data.payload),
    });

    // Avoid bursts: pace message reads even within a single 10-email sync.
    if (i < ids.length - 1) await sleep(100);
  }
  return {
    emails,
    nextPageToken: res.data.nextPageToken || null,
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function gmailErrorStatus(err) {
  return err?.code || err?.response?.status || err?.status;
}

async function withGmailRetry(operation, attempts = 3) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation();
    } catch (err) {
      lastError = err;
      const status = gmailErrorStatus(err);
      const retryable = status === 429 || status === 403 || (status >= 500 && status < 600);
      if (!retryable || attempt === attempts - 1) throw err;

      const retryAfter = Number(err?.response?.headers?.['retry-after']);
      const delay = Number.isFinite(retryAfter) && retryAfter > 0
        ? retryAfter * 1000
        : 1000 * (2 ** attempt);
      await sleep(delay);
    }
  }
  throw lastError;
}
