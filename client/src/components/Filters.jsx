import { DEFAULT_FILTERS } from '../hooks/useJobs.js';

export default function Filters({ filters, onChange }) {
  const set = (patch) => onChange({ ...filters, ...patch });

  return (
    <section className="filters" aria-label="Filters">
      <label className="field field-wide">
        <span>Search</span>
        <input
          type="search"
          placeholder="Title or company"
          value={filters.q}
          onChange={(e) => set({ q: e.target.value })}
        />
      </label>

      <label className="field">
        <span>Location</span>
        <input
          type="text"
          placeholder="kolkata, remote"
          value={filters.location}
          onChange={(e) => set({ location: e.target.value })}
        />
      </label>

      <label className="field field-small">
        <span>Min pay (LPA)</span>
        <input
          type="number"
          min="0"
          step="0.5"
          placeholder="e.g. 5"
          value={filters.minSalary}
          onChange={(e) => set({ minSalary: e.target.value })}
        />
      </label>

      <label className="field">
        <span>Source</span>
        <select value={filters.source} onChange={(e) => set({ source: e.target.value })}>
          <option value="">All</option>
          <option value="indeed">Indeed</option>
          <option value="naukri">Naukri</option>
        </select>
      </label>

      <label className="field">
        <span>Show</span>
        <select value={filters.status} onChange={(e) => set({ status: e.target.value })}>
          <option value="">Active</option>
          <option value="new">New</option>
          <option value="applied">Applied</option>
          <option value="dismissed">Dismissed</option>
        </select>
      </label>

      <label className="field">
        <span>Sort</span>
        <select value={filters.sort} onChange={(e) => set({ sort: e.target.value })}>
          <option value="newest">Newest</option>
          <option value="salary">Highest pay</option>
        </select>
      </label>

      <div className="checks">
        <label className="check">
          <input
            type="checkbox"
            checked={filters.remote}
            onChange={(e) => set({ remote: e.target.checked })}
          />
          Remote only
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={filters.includeUnlisted}
            onChange={(e) => set({ includeUnlisted: e.target.checked })}
          />
          Include jobs with no pay listed
        </label>
        <button className="link" onClick={() => onChange(DEFAULT_FILTERS)}>
          Reset
        </button>
      </div>
    </section>
  );
}
