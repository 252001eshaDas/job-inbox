import JobCard from './JobCard.jsx';

export default function JobList({ jobs, total, loading, onStatus }) {
  if (loading && jobs.length === 0) return <p className="muted">Loading…</p>;

  if (jobs.length === 0) {
    return (
      <div className="empty">
        <p>No jobs match these filters.</p>
        <p className="muted small">
          {total === 0
            ? 'Nothing synced yet. Click Sync to read your job-alert emails.'
            : `${total} jobs are hidden by your filters.`}
        </p>
      </div>
    );
  }

  return (
    <div className="list">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} onStatus={onStatus} />
      ))}
    </div>
  );
}
