import fs from 'node:fs/promises';
import { config } from '../config.js';

export const STATUSES = ['new', 'applied', 'dismissed'];

const file = () => (config.mock ? config.paths.mockJobs : config.paths.jobs);

async function readJson(path) {
  try {
    return JSON.parse(await fs.readFile(path, 'utf8'));
  } catch {
    return null;
  }
}

async function write(jobs) {
  await fs.mkdir(config.paths.dataDir, { recursive: true });
  await fs.writeFile(file(), JSON.stringify(jobs, null, 2));
}

export async function loadJobs() {
  const existing = await readJson(file());
  if (existing) return existing;
  if (config.mock) {
    const sample = (await readJson(config.paths.sampleJobs)) || [];
    await write(sample);
    return sample;
  }
  return [];
}

/** Adds new jobs; existing ones keep their status. Returns counts. */
export async function upsertJobs(incoming) {
  const jobs = await loadJobs();
  const byId = new Map(jobs.map((j) => [j.id, j]));
  let added = 0;
  for (const job of incoming) {
    const old = byId.get(job.id);
    if (old) {
      byId.set(job.id, { ...job, status: old.status });
    } else {
      byId.set(job.id, job);
      added += 1;
    }
  }
  await write([...byId.values()]);
  return { added, total: byId.size };
}

export async function setStatus(id, status) {
  if (!STATUSES.includes(status)) {
    throw Object.assign(new Error('Invalid status'), { statusCode: 400 });
  }
  const jobs = await loadJobs();
  const job = jobs.find((j) => j.id === id);
  if (!job) {
    throw Object.assign(new Error('Job not found'), { statusCode: 404 });
  }
  job.status = status;
  await write(jobs);
  return job;
}
