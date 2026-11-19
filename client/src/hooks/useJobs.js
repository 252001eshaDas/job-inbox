import { useCallback, useEffect, useState } from 'react';
import { fetchAuthStatus, fetchJobs, syncJobs, updateStatus } from '../api/jobs.js';

export const DEFAULT_FILTERS = {
  q: '',
  location: '',
  remote: false,
  minSalary: '',
  includeUnlisted: true,
  source: '',
  status: '',
  sort: 'newest',
};

export function useJobs() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [gmailPageToken, setGmailPageToken] = useState(null);

  const load = useCallback(async (current) => {
    setLoading(true);
    try {
      const data = await fetchJobs({
        ...current,
        includeUnlisted: current.includeUnlisted ? '' : 'false',
      }, page);
      setJobs(data.jobs);
      setTotal(data.total);
      setCount(data.count);
      setPage(data.page);
      setPageCount(data.pageCount);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchAuthStatus().then(setAuth).catch(() => setAuth(null));
    const flag = new URLSearchParams(window.location.search).get('auth');
    if (flag === 'ok') setMessage('Gmail connected. Click Sync to fetch jobs.');
    if (flag === 'failed') setError('Gmail connection failed. Try again.');
    if (flag) window.history.replaceState({}, '', window.location.pathname);
  }, []);

  const sync = async () => {
    setSyncing(true);
    setError('');
    try {
      const result = await syncJobs();
      setGmailPageToken(result.nextPageToken || null);
      setMessage(
        result.mock
          ? result.message
          : `Read ${result.emails} emails, found ${result.parsed} jobs, ${result.added} new.`,
      );
      await load(filters);
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  const syncNextEmails = async () => {
    if (!gmailPageToken) return;
    setSyncing(true);
    setError('');
    try {
      const result = await syncJobs(gmailPageToken);
      setGmailPageToken(result.nextPageToken || null);
      setMessage(`Read ${result.emails} more emails, found ${result.parsed} jobs, ${result.added} new.`);
      await load(filters);
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  const setStatus = async (id, status) => {
    try {
      await updateStatus(id, status);
      await load(filters);
    } catch (err) {
      setError(err.message);
    }
  };

  const changeFilters = (next) => {
    setPage(1);
    setFilters(next);
  };

  const goToPage = (nextPage) => {
    setPage(Math.max(1, Math.min(nextPage, pageCount || 1)));
  };

  // reload when filters or page change (small delay so typing doesn't spam the API)
  useEffect(() => {
    const t = setTimeout(() => load(filters), 250);
    return () => clearTimeout(t);
  }, [filters, load]);

  return {
    filters,
    setFilters: changeFilters,
    goToPage,
    jobs,
    total,
    count,
    page,
    pageCount,
    auth,
    loading,
    syncing,
    message,
    error,
    sync,
    syncNextEmails,
    gmailPageToken,
  };
}
