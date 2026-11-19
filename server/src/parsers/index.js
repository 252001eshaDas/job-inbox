import { config } from '../config.js';
import { parseIndeed } from './indeed.js';
import { parseNaukri } from './naukri.js';

const parsers = { indeed: parseIndeed, naukri: parseNaukri };

// "Indeed <alert@indeed.com>" -> "indeed"; unknown senders -> null
export function detectSource(from = '') {
  const f = from.toLowerCase();
  for (const [source, domains] of Object.entries(config.senders)) {
    if (domains.some((d) => f.includes(d))) return source;
  }
  return null;
}

/** @param {{ from: string, html: string, receivedAt: string }} email */
export function parseEmail(email) {
  const source = detectSource(email.from);
  if (!source || !email.html) return [];
  return parsers[source](email.html, { receivedAt: email.receivedAt });
}
