# Dashboard Backend Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Persist existing dashboard features in PostgreSQL with account isolation and authenticated UI.

**Architecture:** Extend the FastAPI API and SQLAlchemy models with owned task/transaction records, monthly budgets, and widget settings. The React dashboard loads one authenticated snapshot and applies server-confirmed mutations. Use the Vite same-origin proxy for local cookies.

**Tech Stack:** React, TypeScript, Vite, FastAPI, SQLAlchemy, Alembic, PostgreSQL, pytest.

**Spec:** docs/superpowers/specs/2026-11-22-dashboard-backend-design.md

## Global Constraints
- Do not change the existing frontend design or layout.
- New accounts must start with empty data.
- Ensure every user can access only their own information.
- Preserve all existing working features and avoid unrelated changes.

## Review Focus
- Forged owner IDs and linked task IDs must never cross account boundaries.
- Expired cookies must redirect to login; unavailable database must return a useful error.
- Failed writes must preserve form values and must not update displayed data as if saved.
- Rapid/repeated clicks must not issue concurrent writes or stale widget updates.
- Dates, money precision, month boundaries and empty accounts must behave predictably.

### Task 1: Authenticated persistent API
Files: backend/app/models/__init__.py, backend/app/schemas/dashboard.py, backend/app/api/dashboard.py, backend/app/main.py, backend/app/db/database.py, backend/migrations/versions/0002_dashboard.py, backend/tests/conftest.py, backend/tests/test_dashboard.py.
Interfaces: GET /api/v1/dashboard?month=YYYY-MM returns user, tasks, transactions, monthlyBudget, widgets; POST /dashboard/tasks; PATCH /dashboard/tasks/{id} with completed; POST /dashboard/transactions; PUT /dashboard/budget with month and amount; PATCH /dashboard/widgets with visibility map.
- [x] Add failing API tests for empty state, CRUD persistence, account isolation, auth, validation, linked ownership and month separation; run pytest to confirm missing routes fail.
- [x] Add models, typed schemas, ownership-filtered routes, and migration. Sanitize database errors and bound PostgreSQL connection time.
- [x] Run the full backend pytest suite; expect all tests to pass.

### Task 2: Dashboard integration
Files: frontend/src/pages/Dashboard.tsx, frontend/src/lib/dashboardApi.ts, frontend/vite.config.ts, frontend/src/pages/AuthPages.tsx, frontend/.env.example, frontend/.env.
Interfaces: same-origin API client sends credentials with 15-second deadline; dashboard reads camelCase response data matching existing display types.
- [x] Replace demo initializers and generated records with authenticated load and save handlers; preserve markup and CSS.
- [x] Persist widgets and month budget; add loading/retry/error state, session redirect and save guards; use real profile.
- [x] Run npm.cmd run build and npm.cmd run lint; expect success.

### Task 3: Integration verification
Files: backend/README.md, frontend/README.md, plan progress notes.
- [x] Apply Alembic migration and verify PostgreSQL persistence and two-account isolation through running API; remove only generated verification users/data.
- [x] Verify browser flow, refresh persistence, failures and redirect where tools permit.
- [x] Request independent code review, fix important findings, rerun relevant checks, and document setup.

## Progress
User authorized implementation and technical decisions; executing inline without another approval gate. Working in place because the supplied dashboard is untracked and must remain part of the running app. No commits requested; preserve existing work.


## Verification results
- Task 1 complete: 26 backend tests passed (including empty accounts, isolation, validation, replayed writes, and safe database errors).
- Task 2 complete: 9 frontend tests passed; TypeScript/Vite production build and ESLint passed. Dashboard.css unchanged; stylesheet build hash remained unchanged.
- Task 3 complete: migrations 0002 and 0003 applied; `alembic check` reports no new upgrade operations. Live HTTP checks through the Vite proxy confirmed PostgreSQL persistence, per-user data, session cookies, month separation, widget saves and concurrent idempotent creation. Only generated verification records were removed.
- Independent review completed. Fixed all three findings: lost-response duplicates (per-user unique request keys), decimal arithmetic (integer cents), month rollover (local-date subscription plus loaded-month gate). Regression tests passed.
- Browser visual/interaction verification could not run: browser access host and native computer-use pipe are unavailable. API and client automated checks ran instead; no visual verification claim.
- Existing unrelated main.tsx trailing blank-line warning was left untouched. No code committed and no user changes removed.
- Technical decisions: per-calendar-month budgets default to zero; all widgets visible for new accounts; same-origin local proxy; theme remains browser-local; financial values use two decimal places. No deferred review findings.
