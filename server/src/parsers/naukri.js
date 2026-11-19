import { extractJobs } from './common.js';

// Naukri job links contain /job-listings-...
const isJobLink = (href) => /naukri\.com/i.test(href) && /job-listings/i.test(href);

const linkKey = (href) => {
  try {
    const u = new URL(href);
    return u.origin + u.pathname;
  } catch {
    return href;
  }
};

export function parseNaukri(html, meta = {}) {
  return extractJobs(html, {
    source: 'naukri',
    isJobLink,
    linkKey,
    receivedAt: meta.receivedAt,
  });
}
