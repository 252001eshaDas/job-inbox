import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEmail, detectSource } from '../src/parsers/index.js';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');
const read = (f) => fs.readFileSync(path.join(dir, f), 'utf8');
const receivedAt = '2026-11-18T09:30:00.000Z';

test('detects sender source', () => {
  assert.equal(detectSource('Indeed <alert@alert.indeed.com>'), 'indeed');
  assert.equal(detectSource('Naukri <info@naukri.com>'), 'naukri');
  assert.equal(detectSource('Friend <a@gmail.com>'), null);
});

test('parses Indeed alert into separate jobs and ignores unsubscribe link', () => {
  const jobs = parseEmail({
    from: 'Indeed <alert@indeed.com>',
    html: read('indeed-alert.html'),
    receivedAt,
  });
  assert.equal(jobs.length, 2);

  const [react, fullstack] = jobs;
  assert.equal(react.title, 'React Developer');
  assert.equal(react.company, 'Pixel Labs');
  assert.equal(react.location, 'Remote');
  assert.equal(react.remote, true);
  assert.equal(react.salaryMinLpa, 6);
  assert.equal(react.salaryMaxLpa, 9);
  assert.match(react.workDays, /5 days a week/i);

  assert.equal(fullstack.company, 'Northwind');
  assert.match(fullstack.location, /Kolkata/);
  assert.equal(fullstack.remote, false);
  assert.equal(fullstack.salaryMaxLpa, null);
});

test('parses Naukri alert, treats work from home as remote', () => {
  const jobs = parseEmail({
    from: 'Naukri <info@naukri.com>',
    html: read('naukri-alert.html'),
    receivedAt,
  });
  assert.equal(jobs.length, 2);
  assert.equal(jobs[0].title, 'MERN Stack Developer');
  assert.equal(jobs[0].salaryMaxLpa, 10);
  assert.equal(jobs[1].remote, true);
  assert.equal(jobs[1].salaryMaxLpa, 4.8);
});

test('same job gets the same id across emails', () => {
  const a = parseEmail({ from: 'x@indeed.com', html: read('indeed-alert.html'), receivedAt });
  const b = parseEmail({ from: 'x@indeed.com', html: read('indeed-alert.html'), receivedAt });
  assert.equal(a[0].id, b[0].id);
});
