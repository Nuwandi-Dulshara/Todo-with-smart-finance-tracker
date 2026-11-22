# Dashboard backend integration

Approved by the user on 2026-11-22. Implement in the existing working directory to preserve the user's untracked Dashboard.tsx and Dashboard.css and existing auth changes.

Keep the dashboard's layout, styling, controls, charts, and calculations. Replace demo data with authenticated PostgreSQL records: tasks, transactions, monthly budgets, and widget preferences. Display the signed-in user's name and email. New accounts have no tasks or transactions, a zero/unset budget, and all widgets visible. Theme remains a browser preference.

Use the existing FastAPI, SQLAlchemy, Alembic and HttpOnly cookie authentication. Every query and mutation uses the authenticated user ID, never a client-supplied owner. Transactions may link only to that user's tasks. Budget is keyed by user and calendar month. Monetary values use fixed-precision database columns and server validation. Persist widget visibility per user.

Approach: extend the existing API with relational tables and narrowly scoped endpoints. A single JSON workspace blob would simplify initial wiring but weakens validation and concurrent updates; a separate backend would duplicate the existing authentication. The existing backend is the chosen foundation, with technical decisions delegated by the user.

Use a same-origin Vite API proxy in development to avoid localhost/127.0.0.1 cookie mismatches. Auth pages change only their API base. Handle loading, session expiry, server errors and retry without showing fake data or discarding unsaved form values. Prevent duplicate submissions while saving. No new unrelated features or visual redesign.
