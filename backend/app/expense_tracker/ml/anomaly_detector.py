import logging
from datetime import date

import pandas as pd
from sklearn.ensemble import IsolationForest

from ..utils.constants import EXPENSE_CATEGORIES

logger = logging.getLogger(__name__)

MIN_ANOMALY_HISTORY = 10


def _features(expenses: list[dict]) -> pd.DataFrame:
    frame = pd.DataFrame(expenses)
    if frame.empty:
        return pd.DataFrame(columns=["amount", "category_code", "day"])
    frame["date"] = pd.to_datetime(frame["date"])
    frame["category_code"] = frame["category"].apply(lambda value: EXPENSE_CATEGORIES.index(value) if value in EXPENSE_CATEGORIES else -1)
    frame["day"] = frame["date"].dt.day
    return frame[["amount", "category_code", "day"]]


def explain_anomaly(expense: dict, history: list[dict], status: str) -> str:
    if len(history) < MIN_ANOMALY_HISTORY:
        return "Not enough historical transactions for reliable anomaly detection."
    if status == "normal":
        return f"This expense is within your usual {expense['category']} spending range."

    same_category = [item["amount"] for item in history if item["category"] == expense["category"]]
    if same_category:
        average = sum(same_category) / len(same_category)
        if expense["amount"] > average * 1.8:
            return f"This expense is much higher than your usual {expense['category']} transactions."
    return "This expense differs from your normal spending pattern."


def detect_anomaly(expense: dict, history: list[dict]) -> tuple[str, float | None, str]:
    if len(history) < MIN_ANOMALY_HISTORY:
        return "normal", None, explain_anomaly(expense, history, "normal")

    try:
        training_rows = history + [expense]
        features = _features(training_rows)
        model = IsolationForest(contamination=0.12, random_state=42)
        model.fit(features.iloc[:-1])
        prediction = int(model.predict(features.iloc[[-1]])[0])
        score = float(model.decision_function(features.iloc[[-1]])[0])
        status = "unusual" if prediction == -1 else "normal"
        return status, round(score, 4), explain_anomaly(expense, history, status)
    except Exception:
        logger.exception("Anomaly detection failed.")
        return "normal", None, "Anomaly detection is temporarily unavailable."
