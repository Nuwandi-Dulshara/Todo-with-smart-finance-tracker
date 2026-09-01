# Organix AI Expense Tracker Frontend

This module contains the authenticated expense tracker UI under `/expense-tracker/*`.

The current implementation is frontend-only and uses `services/expenseApi.js` as a mock-backed API boundary. When the Python expense backend is added, replace the localStorage internals in that service with real HTTP requests while keeping the page/component contracts stable.

Routes:

- `/expense-tracker/dashboard`
- `/expense-tracker/expenses`
- `/expense-tracker/expenses/add`
- `/expense-tracker/expenses/:id/edit`
- `/expense-tracker/budgets`
- `/expense-tracker/insights`
- `/expense-tracker/unusual-expenses`
