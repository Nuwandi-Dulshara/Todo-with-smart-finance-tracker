from datetime import date
from io import StringIO

import pandas as pd

CSV_COLUMNS = [
    "Date",
    "Description",
    "Amount",
    "Category",
    "Payment Method",
    "Notes",
    "Predicted Category",
    "Prediction Confidence",
    "Anomaly Status",
    "Anomaly Score",
]


def expenses_to_csv(expenses: list[dict]) -> tuple[str, str]:
    rows = [
        {
            "Date": expense["date"],
            "Description": expense["description"],
            "Amount": expense["amount"],
            "Category": expense["category"],
            "Payment Method": expense["payment_method"],
            "Notes": expense["notes"],
            "Predicted Category": expense["predicted_category"],
            "Prediction Confidence": expense["prediction_confidence"],
            "Anomaly Status": expense["anomaly_status"],
            "Anomaly Score": expense["anomaly_score"],
        }
        for expense in expenses
    ]
    frame = pd.DataFrame(rows, columns=CSV_COLUMNS)
    buffer = StringIO()
    frame.to_csv(buffer, index=False)
    filename = f"expenses_{date.today().isoformat()}.csv"
    return buffer.getvalue(), filename
