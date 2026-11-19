async function request(path, options) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
  return body;
}

export function fetchJobs(filters, page = 1) {
  const params = new URLSearchParams({ page: String(page) });
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== false && value != null) params.set(key, value);
  });
  return request(`/jobs?${params.toString()}`);
}

export const updateStatus = (id, status) =>
  request(`/jobs/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });

export const syncJobs = (pageToken) => request('/sync', {
  method: 'POST',
  body: JSON.stringify(pageToken ? { pageToken } : {}),
});

export const fetchAuthStatus = () => request('/auth/status');
