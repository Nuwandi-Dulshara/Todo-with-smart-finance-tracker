from datetime import date

import pandas as pd

from ..database.repositories import expense_to_dict


def _month_bounds(today: date) -> tuple[pd.Period, pd.Period]:
    current = pd.Period(today, freq="M")
    return current, current - 1


def summarize_expenses(expenses) -> dict:
    rows = [expense_to_dict(expense) for expense in expenses]
    if not rows:
        return {
            "total_expenses": 0,
            "transaction_count": 0,
            "average_transaction": 0,
            "highest_expense": 0,
            "most_used_category": None,
            "current_month_spending": 0,
            "previous_month_spending": 0,
            "percentage_change": None,
            "unusual_expense_count": 0,
        }

    frame = pd.DataFrame(rows)
    frame["date"] = pd.to_datetime(frame["date"])
    frame["month"] = frame["date"].dt.to_period("M")
    current_month, previous_month = _month_bounds(date.today())
    current_spending = float(frame.loc[frame["month"] == current_month, "amount"].sum())
    previous_spending = float(frame.loc[frame["month"] == previous_month, "amount"].sum())
    percentage_change = None
    if previous_spending:
        percentage_change = round(((current_spending - previous_spending) / previous_spending) * 100, 2)

    return {
        "total_expenses": float(frame["amount"].sum()),
        "transaction_count": int(len(frame)),
        "average_transaction": float(frame["amount"].mean()),
        "highest_expense": float(frame["amount"].max()),
        "most_used_category": str(frame["category"].mode().iloc[0]),
        "current_month_spending": current_spending,
        "previous_month_spending": previous_spending,
        "percentage_change": percentage_change,
        "unusual_expense_count": int((frame["anomaly_status"] == "unusual").sum()),
    }


def build_dashboard(expenses, budgets) -> dict:
    summary = summarize_expenses(expenses)
    recent_expenses = [expense_to_dict(expense) for expense in expenses[:5]]
    budget_alerts = []
    for budget in budgets:
        spent = sum(expense.amount for expense in expenses if budget.category is None or expense.category == budget.category)
        used = (spent / budget.budget_amount * 100) if budget.budget_amount else 0
        if used >= 90:
            name = budget.category or "Overall"
            budget_alerts.append(f"{name} budget has reached {round(used)}%.")
    if summary["unusual_expense_count"]:
        budget_alerts.append(f"{summary['unusual_expense_count']} unusual expense(s) detected.")
    if summary["percentage_change"] and summary["percentage_change"] > 0:
        budget_alerts.append(f"Spending is {summary['percentage_change']}% higher than last month.")

    return {"summary": summary, "recent_expenses": recent_expenses, "budget_alerts": budget_alerts}
