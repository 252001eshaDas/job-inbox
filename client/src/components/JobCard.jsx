function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 36e5);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'yesterday' : `${days} days ago`;
}

export default function JobCard({ job, onStatus }) {
  return (
    <article className={`card ${job.status === 'applied' ? 'card-applied' : ''}`}>
      <div className="card-main">
        <div className="card-top">
          <h2>{job.title}</h2>
          <span className={`badge badge-${job.source}`}>{job.source}</span>
        </div>
        <p className="company">{job.company || 'Company not listed'}</p>

        <div className="chips">
          {job.location && <span className="chip">{job.location}</span>}
          {job.remote && <span className="chip chip-remote">Remote</span>}
          <span className={`chip ${job.salaryText ? 'chip-pay' : 'chip-muted'}`}>
            {job.salaryText || 'Pay not listed'}
          </span>
          {job.workDays && <span className="chip">{job.workDays}</span>}
        </div>

        <p className="muted small">
          {timeAgo(job.receivedAt)}
          {job.status !== 'new' && ` · ${job.status}`}
        </p>
      </div>

      <div className="card-actions">
        <a className="btn btn-primary" href={job.link} target="_blank" rel="noreferrer">
          Open job
        </a>
        {job.status !== 'applied' ? (
          <button className="btn" onClick={() => onStatus(job.id, 'applied')}>
            Mark applied
          </button>
        ) : (
          <button className="btn" onClick={() => onStatus(job.id, 'new')}>
            Undo applied
          </button>
        )}
        {job.status !== 'dismissed' ? (
          <button className="btn btn-quiet" onClick={() => onStatus(job.id, 'dismissed')}>
            Dismiss
          </button>
        ) : (
          <button className="btn btn-quiet" onClick={() => onStatus(job.id, 'new')}>
            Restore
          </button>
        )}
      </div>
    </article>
  );
}
