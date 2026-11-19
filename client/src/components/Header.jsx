export default function Header({ auth, syncing, onSync }) {
  const needsConnect = auth && !auth.mock && !auth.authorized;

  return (
    <header className="header">
      <div>
        <h1>Job Inbox</h1>
        <p className="muted">
          Job alerts from your Gmail in one list.
          {auth?.mock && <span className="badge badge-mock">sample data</span>}
        </p>
      </div>
      <div className="header-actions">
        {needsConnect ? (
          <a className="btn btn-primary" href="/api/auth/google">
            Connect Gmail
          </a>
        ) : (
          <button className="btn btn-primary" onClick={onSync} disabled={syncing}>
            {syncing ? 'Syncing…' : 'Sync'}
          </button>
        )}
      </div>
    </header>
  );
}
