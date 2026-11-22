# Backend

## Run locally

Configure `backend/.env` with a reachable `DATABASE_URL`, `REDIS_URL`, and a
private `JWT_SECRET_KEY`. The Docker Compose PostgreSQL service is published on
host port `5433` by default. From the repository root, start the services:

```powershell
docker compose --env-file infrastructure/.env -f infrastructure/compose.yaml up -d
```

Then, from `backend`:

```powershell
.\.venv\Scripts\python.exe -m alembic upgrade head
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

The API listens on `http://localhost:8000`. Configure `FRONTEND_URL` if the
frontend runs on a different origin.

## Authentication API

- `POST /api/v1/auth/register` creates an account and starts a session.
- `POST /api/v1/auth/login` verifies credentials. Send `remember_me: true` for
  a 30-day session; otherwise the session expires after the configured access
  token lifetime.
- `GET /api/v1/auth/me` returns the current session's user.

Sessions use an HttpOnly cookie. The frontend's default API base is `/api/v1`,
proxied by Vite to this API in development; override it with `VITE_API_BASE_URL` when needed.
Registration passwords must be 8–128 characters and include an uppercase
letter, a lowercase letter, a number, and a special character.

## Dashboard API

Run `python -m alembic upgrade head` before using the dashboard. The migration
adds tables without modifying existing accounts. Each request requires the
existing session cookie; the server derives ownership from that session.

- `GET /api/v1/dashboard?month=YYYY-MM`: profile, tasks, transactions, the selected
  month's budget, and widget preferences.
- `POST /api/v1/dashboard/tasks`: title, category, priority, and `dueDate`.
- `PATCH /api/v1/dashboard/tasks/{id}`: `completed` boolean.
- `POST /api/v1/dashboard/transactions`: title, amount, type, category, date,
  and optional `taskId` for an expense linked to your own task.
- `PUT /api/v1/dashboard/budget`: month and amount; zero clears the spending limit.
- `PATCH /api/v1/dashboard/widgets`: any subset of widget visibility booleans.

Amounts are stored as `NUMERIC(12,2)` and accept at most two decimal places.
New users have no records, an unset/zero budget, and all widgets visible.
Cross-account task IDs return 404. Invalid input returns 422, missing/expired
sessions return 401, and database failures return a sanitized 503 response.
Task and transaction creation accept a UUID `Idempotency-Key` header. Retrying
the same submission returns its saved record; reusing a key with different
values returns 409. Keys are scoped to the authenticated user and resource.

Keep PostgreSQL running on the configured port (Compose defaults to 5433).
URL-encode special characters in the database password when setting `DATABASE_URL`.
Run tests from `backend` with `.\.venv\Scripts\python.exe -m pytest -q`.
