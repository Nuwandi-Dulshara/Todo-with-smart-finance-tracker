from io import BytesIO

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import pandas as pd


def _frame(expenses: list[dict]) -> pd.DataFrame:
    frame = pd.DataFrame(expenses)
    if not frame.empty:
        frame["date"] = pd.to_datetime(frame["date"])
    return frame


def _empty_chart(title: str) -> BytesIO:
    fig, ax = plt.subplots(figsize=(7, 4))
    ax.text(0.5, 0.5, "No expense data yet", ha="center", va="center", fontsize=13)
    ax.set_title(title)
    ax.axis("off")
    return _save(fig)


def _save(fig) -> BytesIO:
    buffer = BytesIO()
    fig.tight_layout()
    fig.savefig(buffer, format="png", bbox_inches="tight", dpi=130)
    plt.close(fig)
    buffer.seek(0)
    return buffer


def category_bar(expenses: list[dict]) -> BytesIO:
    frame = _frame(expenses)
    if frame.empty:
        return _empty_chart("Category-wise Spending")
    totals = frame.groupby("category")["amount"].sum().sort_values()
    fig, ax = plt.subplots(figsize=(7, 4))
    totals.plot(kind="barh", ax=ax, color="#16a34a")
    ax.set_title("Category-wise Spending")
    ax.set_xlabel("Amount")
    return _save(fig)


def category_pie(expenses: list[dict]) -> BytesIO:
    frame = _frame(expenses)
    if frame.empty:
        return _empty_chart("Expense Category Mix")
    totals = frame.groupby("category")["amount"].sum()
    fig, ax = plt.subplots(figsize=(6, 5))
    ax.pie(totals.values, labels=totals.index, autopct="%1.1f%%")
    ax.set_title("Expense Category Mix")
    return _save(fig)


def daily_line(expenses: list[dict]) -> BytesIO:
    frame = _frame(expenses)
    if frame.empty:
        return _empty_chart("Daily Spending")
    daily = frame.groupby("date")["amount"].sum()
    fig, ax = plt.subplots(figsize=(7, 4))
    daily.plot(kind="line", marker="o", ax=ax, color="#16a34a")
    ax.set_title("Daily Spending")
    ax.set_ylabel("Amount")
    return _save(fig)


def monthly_trend(expenses: list[dict]) -> BytesIO:
    frame = _frame(expenses)
    if frame.empty:
        return _empty_chart("Monthly Spending Trend")
    frame["month"] = frame["date"].dt.to_period("M").astype(str)
    monthly = frame.groupby("month")["amount"].sum()
    fig, ax = plt.subplots(figsize=(7, 4))
    monthly.plot(kind="bar", ax=ax, color="#15803d")
    ax.set_title("Monthly Spending Trend")
    ax.set_ylabel("Amount")
    return _save(fig)


def payment_method(expenses: list[dict]) -> BytesIO:
    frame = _frame(expenses)
    if frame.empty:
        return _empty_chart("Payment Method Distribution")
    totals = frame.groupby("payment_method")["amount"].sum()
    fig, ax = plt.subplots(figsize=(7, 4))
    totals.plot(kind="bar", ax=ax, color="#14532d")
    ax.set_title("Payment Method Distribution")
    ax.set_ylabel("Amount")
    return _save(fig)


def top_expenses(expenses: list[dict]) -> BytesIO:
    frame = _frame(expenses)
    if frame.empty:
        return _empty_chart("Top Five Largest Expenses")
    top = frame.sort_values("amount", ascending=False).head(5)
    fig, ax = plt.subplots(figsize=(7, 4))
    ax.barh(top["description"], top["amount"], color="#16a34a")
    ax.invert_yaxis()
    ax.set_title("Top Five Largest Expenses")
    ax.set_xlabel("Amount")
    return _save(fig)
