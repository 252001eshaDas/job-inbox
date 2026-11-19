export default function Pagination({ page, pageCount, onPageChange, totalCount }) {
  if (pageCount <= 1) return null;

  return (
    <nav className="pagination" aria-label="Job results pages">
      <button
        type="button"
        className="btn"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </button>
      <span className="muted small">
        Page {page} of {pageCount} · {totalCount} jobs
      </span>
      <button
        type="button"
        className="btn"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </nav>
  );
}
