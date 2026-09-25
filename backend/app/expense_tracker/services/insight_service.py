import pandas as pd


def generate_insights(expenses: list[dict], budgets: list[dict]) -> list[dict]:
    if not expenses:
        return []

    frame = pd.DataFrame(expenses)
    insights = []
    category_totals = frame.groupby("category")["amount"].sum().sort_values(ascending=False)
    if not category_totals.empty:
        category = str(category_totals.index[0])
        amount = float(category_totals.iloc[0])
        insights.append(
            {
                "type": "information",
                "title": f"{category} was your highest spending category this month.",
                "message": f"You spent Rs. {amount:,.0f} on {category}.",
                "period": "Current data",
                "category": category,
                "metric": f"Rs. {amount:,.0f}",
            }
        )

    if "payment_method" in frame and not frame["payment_method"].mode().empty:
        method = str(frame["payment_method"].mode().iloc[0])
        insights.append(
            {
                "type": "information",
                "title": f"You spent most frequently using {method}.",
                "message": "Review payment habits when planning cash flow.",
                "period": "Current data",
                "metric": method,
            }
        )

    largest = frame.sort_values("amount", ascending=False).iloc[0]
    insights.append(
        {
            "type": "warning" if float(largest["amount"]) > 10000 else "positive",
            "title": "Largest expense identified.",
            "message": f"Your largest expense was Rs. {float(largest['amount']):,.0f} on {largest['description']}.",
            "period": str(largest["date"]),
            "category": str(largest["category"]),
            "metric": f"Rs. {float(largest['amount']):,.0f}",
        }
    )

    unusual_count = int((frame["anomaly_status"] == "unusual").sum())
    if unusual_count:
        insights.append(
            {
                "type": "critical",
                "title": "Unusual spending detected.",
                "message": f"{unusual_count} expense(s) differ from your normal spending pattern.",
                "period": "Recent activity",
                "metric": str(unusual_count),
            }
        )

    for budget in budgets:
        if budget["used_percentage"] >= 70:
            name = budget["category"] or "Overall"
            insights.append(
                {
                    "type": "critical" if budget["used_percentage"] >= 90 else "warning",
                    "title": f"{name} budget alert.",
                    "message": f"You have used {budget['used_percentage']}% of this budget.",
                    "period": budget["month"],
                    "category": budget["category"],
                    "metric": f"{budget['used_percentage']}%",
                }
            )

    return insights
