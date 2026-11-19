# Architecture

## Data flow

1. `POST /api/sync` asks Gmail for recent mail from job-board senders.
2. `parsers/` turn each email's HTML into job objects (one email can hold many jobs).
3. `jobStore` merges them into `server/data/jobs.json`, de-duplicating by a stable id
   and keeping any status you already set (`new`, `applied`, `dismissed`).
4. `GET /api/jobs` applies filters (`filters.js`) and returns the list.
5. The client renders cards. **Open** goes to the original job link.

## Job object

```json
{
  "id": "a1b2c3d4e5f60718",
  "source": "indeed",
  "title": "React Developer",
  "company": "Acme",
  "location": "Remote",
  "remote": true,
  "salaryText": "₹6,00,000 - ₹9,00,000 a year",
  "salaryMinLpa": 6,
  "salaryMaxLpa": 9,
  "workDays": "5 days a week",
  "link": "https://in.indeed.com/viewjob?jk=...",
  "receivedAt": "2026-11-18T09:30:00.000Z",
  "status": "new"
}
```

## API

| Method | Path | Notes |
|---|---|---|
| GET | `/api/health` | mode and auth state |
| GET | `/api/jobs` | query: `q`, `location` (comma list), `remote`, `minSalary` (LPA), `includeUnlisted`, `source`, `status`, `sort` (`newest`/`salary`) |
| PATCH | `/api/jobs/:id` | body `{ "status": "applied" }` |
| POST | `/api/sync` | fetch + parse + store |
| GET | `/api/auth/status` | `{ authorized }` |
| GET | `/api/auth/google` | starts Google login |

## Planned: ml-service (Python)

A small FastAPI app the Node server will call before returning the list.

```
POST /rank
{ "profile": { "skills": [...], "resume_text": "..." }, "jobs": [ {id, title, company, ...} ] }
->
{ "scores": { "<job id>": 0.0-1.0 } }
```

Ideas in order of effort:

1. Embedding similarity between your resume and each job title/description.
2. Email classifier: invitation vs digest vs rejection.
3. Learn from your clicks: jobs you mark `applied` vs `dismissed` become labels.

The server will gain `sort=relevance`, which calls `ML_SERVICE_URL` when set and
falls back to `newest` when the service is down.
