import { extractJobs } from './common.js';

// Indeed alert links look like .../viewjob?jk=ID, .../rc/clk?jk=ID or .../pagead/clk?...
const isJobLink = (href) =>
  /indeed\.com/i.test(href) &&
  (/jk=/.test(href) || /\/(viewjob|rc\/clk|pagead\/clk|m\/)/.test(href));

const linkKey = (href) => {
  const m = href.match(/[?&]jk=([a-z0-9]+)/i);
  if (m) return m[1];
  try {
    const u = new URL(href);
    return u.origin + u.pathname;
  } catch {
    return href;
  }
};

export function parseIndeed(html, meta = {}) {
  return extractJobs(html, {
    source: 'indeed',
    isJobLink,
    linkKey,
    receivedAt: meta.receivedAt,
  });
}
