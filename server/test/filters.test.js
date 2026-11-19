import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { applyFilters } from '../src/services/filters.js';
import { config } from '../src/config.js';

const jobs = JSON.parse(fs.readFileSync(config.paths.sampleJobs, 'utf8'));

test('remote only', () => {
  const out = applyFilters(jobs, { remote: 'true' });
  assert.ok(out.length > 0 && out.every((j) => j.remote));
});

test('location accepts a comma list and matches remote keyword', () => {
  const out = applyFilters(jobs, { location: 'kolkata,remote' });
  assert.ok(out.every((j) => j.remote || /kolkata/i.test(j.location)));
  assert.ok(out.some((j) => /kolkata/i.test(j.location)));
});

test('min salary keeps unlisted by default, drops them when asked', () => {
  const keep = applyFilters(jobs, { minSalary: '9' });
  const drop = applyFilters(jobs, { minSalary: '9', includeUnlisted: 'false' });
  assert.ok(keep.some((j) => j.salaryMaxLpa == null));
  assert.ok(drop.every((j) => j.salaryMaxLpa >= 9));
});

test('dismissed jobs hidden unless requested', () => {
  const withDismissed = jobs.map((j, i) => (i === 0 ? { ...j, status: 'dismissed' } : j));
  assert.equal(applyFilters(withDismissed, {}).length, jobs.length - 1);
  assert.equal(applyFilters(withDismissed, { status: 'dismissed' }).length, 1);
});

test('sort by salary puts highest first and unlisted last', () => {
  const out = applyFilters(jobs, { sort: 'salary' });
  assert.equal(out[0].salaryMaxLpa, 12);
  assert.equal(out[out.length - 1].salaryMaxLpa, null);
});
