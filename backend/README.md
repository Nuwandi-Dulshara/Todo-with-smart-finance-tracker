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

Sessions use an HttpOnly cookie. The frontend's default API base is
`http://localhost:8000/api/v1`; override it with `VITE_API_BASE_URL` when needed.
Registration passwords must be 8–128 characters and include an uppercase
letter, a lowercase letter, a number, and a special character.
