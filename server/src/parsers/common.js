import crypto from 'node:crypto';
import * as cheerio from 'cheerio';
import { parseSalary, looksLikeSalary } from '../utils/salary.js';

const REMOTE_RE = /\bremote\b|work from home|\bwfh\b/i;
const WORKDAYS_RE =
  /\b(\d)\s*[- ]?days?\s*(a|per)?\s*week\b|\bmon(day)?\s*(-|to)\s*fri(day)?\b/i;
const NOISE_RE =
  /^(easily apply|apply now|apply|view job|new|urgently hiring|be an early applicant|posted|just posted|\d+\s*(day|hour|minute)s?\s*ago|sponsored|save|unsubscribe)/i;

export function stableId(source, key) {
  return crypto
    .createHash('sha1')
    .update(`${source}:${key}`)
    .digest('hex')
    .slice(0, 16);
}

function textLines($, el) {
  const lines = [];
  $(el)
    .find('*')
    .addBack()
    .contents()
    .each((_, node) => {
      if (node.type === 'text') {
        const t = node.data.replace(/\s+/g, ' ').trim();
        if (t) lines.push(t);
      }
    });
  // remove consecutive duplicates
  return lines.filter((l, i) => l !== lines[i - 1]);
}

// Climb from a job link to the largest parent that still holds only that one job.
function jobContainer($, anchor, isJobLink) {
  let current = $(anchor);
  for (let i = 0; i < 6; i += 1) {
    const parent = current.parent();
    if (!parent.length || parent.is('body, html')) break;
    const jobLinks = parent
      .find('a')
      .filter((_, a) => isJobLink($(a).attr('href') || ''));
    const distinct = new Set(jobLinks.map((_, a) => $(a).attr('href')).get());
    if (distinct.size > 1) break;
    current = parent;
  }
  return current;
}

/**
 * Generic extractor: finds job links, then reads company / location / salary
 * from the text around each one.
 *
 * @param {string} html
 * @param {{ source: string, isJobLink: (href: string) => boolean,
 *           linkKey: (href: string) => string, receivedAt?: string }} opts
 */
export function extractJobs(html, opts) {
  const { source, isJobLink, linkKey, receivedAt } = opts;
  const $ = cheerio.load(html);
  const seen = new Set();
  const jobs = [];

  $('a').each((_, a) => {
    const href = ($(a).attr('href') || '').trim();
    if (!href || !isJobLink(href)) return;

    const title = $(a).text().replace(/\s+/g, ' ').trim();
    if (title.length < 3 || NOISE_RE.test(title)) return;

    const key = linkKey(href);
    if (seen.has(key)) return;
    seen.add(key);

    const container = jobContainer($, a, isJobLink);
    const lines = textLines($, container.get(0)).filter(
      (l) => l !== title && !NOISE_RE.test(l),
    );

    const salaryText = lines.find(looksLikeSalary) || '';
    const rest = lines.filter((l) => l !== salaryText);
    const company = rest[0] || '';
    const location = rest[1] || '';
    const workDays = lines.find((l) => WORKDAYS_RE.test(l)) || '';
    const salary = parseSalary(salaryText);
    const haystack = `${title} ${location} ${lines.join(' ')}`;

    jobs.push({
      id: stableId(source, key),
      source,
      title,
      company,
      location,
      remote: REMOTE_RE.test(haystack),
      salaryText,
      salaryMinLpa: salary ? salary.minLpa : null,
      salaryMaxLpa: salary ? salary.maxLpa : null,
      workDays,
      link: href,
      receivedAt: receivedAt || new Date().toISOString(),
      status: 'new',
    });
  });

  return jobs;
}
