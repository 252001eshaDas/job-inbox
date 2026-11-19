import Header from './components/Header.jsx';
import Filters from './components/Filters.jsx';
import JobList from './components/JobList.jsx';
import Pagination from './components/Pagination.jsx';
import { useJobs } from './hooks/useJobs.js';

export default function App() {
  const {
    filters,
    setFilters,
    jobs,
    total,
    auth,
    loading,
    syncing,
    message,
    error,
    count,
    page,
    pageCount,
    goToPage,
    sync,
    setStatus,
    gmailPageToken,
    syncNextEmails,
  } = useJobs();

  return (
    <main className="container">
      <Header auth={auth} syncing={syncing} onSync={sync} />
      {message && <p className="notice">{message}</p>}
      {error && <p className="notice notice-error">{error}</p>}
      <Filters filters={filters} onChange={setFilters} />
      <p className="muted small count">
        {jobs.length > 0
          ? `Showing ${(page - 1) * 10 + 1}–${(page - 1) * 10 + jobs.length} of ${count}`
          : `Showing 0 of ${count}`}
        {count !== total ? ` (${total} total jobs)` : ''}
      </p>
      <JobList jobs={jobs} total={total} loading={loading} onStatus={setStatus} />
      <Pagination
        page={page}
        pageCount={pageCount}
        onPageChange={goToPage}
        totalCount={count}
      />
      {gmailPageToken && (
        <button
          type="button"
          className="btn"
          onClick={syncNextEmails}
          disabled={syncing}
        >
          {syncing ? 'Loading…' : 'Load next 10 emails'}
        </button>
      )}
    </main>
  );
}
