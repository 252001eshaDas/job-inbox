const norm = (s) => String(s || '').toLowerCase();

/**
 * @param {Array} jobs
 * @param {{ q?: string, location?: string, remote?: string, minSalary?: string,
 *           includeUnlisted?: string, source?: string, status?: string,
 *           sort?: string }} query
 */
export function applyFilters(jobs, query = {}) {
  const { q, location, remote, minSalary, includeUnlisted, source, status, sort } =
    query;

  let out = jobs;

  // hide dismissed jobs unless the caller asks for a specific status
  out = out.filter((j) => (status ? j.status === status : j.status !== 'dismissed'));

  if (source) out = out.filter((j) => j.source === source);

  if (q) {
    const needle = norm(q);
    out = out.filter((j) => norm(`${j.title} ${j.company}`).includes(needle));
  }

  // location: comma list, a job matches if it matches any term
  if (location) {
    const terms = location.split(',').map(norm).map((t) => t.trim()).filter(Boolean);
    out = out.filter((j) => {
      const hay = norm(`${j.location} ${j.title}`);
      return terms.some((t) => hay.includes(t) || (t === 'remote' && j.remote));
    });
  }

  if (remote === 'true') out = out.filter((j) => j.remote);

  if (minSalary !== undefined && minSalary !== '' && !Number.isNaN(Number(minSalary))) {
    const min = Number(minSalary);
    const keepUnlisted = includeUnlisted !== 'false';
    out = out.filter((j) =>
      j.salaryMaxLpa == null ? keepUnlisted : j.salaryMaxLpa >= min,
    );
  }

  const sorted = [...out];
  if (sort === 'salary') {
    sorted.sort((a, b) => (b.salaryMaxLpa ?? -1) - (a.salaryMaxLpa ?? -1));
  } else {
    sorted.sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt));
  }
  return sorted;
}
