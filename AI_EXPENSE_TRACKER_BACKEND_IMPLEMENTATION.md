# AI Expense Tracker — Backend Implementation Guide

## Project Context

Existing project folder:

```text
D:\my projects\gihub projects\python\task-manager-with-expense\
```

The existing project already contains:

```text
frontend/
backend/
```

The current task manager is already implemented using React.js and Python.

The existing task-manager backend must **not** be removed, rewritten, or broken.

The new Expense Tracker backend must be added as a separate module inside the existing Python backend.

This document covers **BACKEND ONLY**.

The frontend is React.js and communicates with the backend through REST API endpoints.

---

# 1. Backend Technology Stack

Use the following technologies:

| Area | Technology | Purpose |
|---|---|---|
| Programming | Python | Main backend development language |
| Frontend | React.js | Existing frontend application |
| API Layer | Flask | Lightweight REST API for React |
| Database | SQLite | Store expenses, budgets, users, and related data |
| Data Processing | Pandas | Filtering, calculations, summaries, and analytics |
| Visualisation | Matplotlib | Generate dashboard charts |
| Machine Learning | Scikit-learn | Expense classification and anomaly detection |
| Model Storage | Joblib | Save and load trained ML models |
| Version Control | Git and GitHub | Source-code management |
| Testing | Pytest | Basic backend and business-rule tests |

---

# 2. Why Flask

Use Flask as the Python API layer because it is:

- Free
- Lightweight
- Easy to understand
- Suitable for a low-spec laptop
- Fast to implement
- Easy to connect with React
- Easy to explain during an interview

Do not introduce Django unless the existing backend already depends on Django.

If the existing task manager backend already uses Flask, add the Expense Tracker as a Flask Blueprint.

If the existing backend uses another Python framework, preserve that framework and apply the same modular structure described here.

---

# 3. Main Backend Goal

The backend must support:

1. Expense CRUD
2. Expense search and filtering
3. CSV export
4. Dashboard analytics
5. Matplotlib charts
6. Monthly budgets
7. Category budgets
8. Rule-based Smart Insights
9. ML expense category prediction
10. ML anomaly detection
11. Model storage
12. Authenticated user-specific expense data
13. Basic automated tests

---

# 4. Important Rule — Do Not Break Existing Task Manager

The existing task-manager backend must continue working.

Do not:

- Delete current files
- Rename current API routes unnecessarily
- Change current task-manager database logic
- Change current authentication behaviour
- Mix expense-tracker code directly into unrelated task-manager files

Create a separate Expense Tracker module.

---

# 5. Recommended Backend Folder Structure

Recommended structure:

```text
backend/
├── existing-task-manager-files/
│
├── expense_tracker/
│   ├── __init__.py
│   │
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── expense_routes.py
│   │   ├── dashboard_routes.py
│   │   ├── budget_routes.py
│   │   ├── insight_routes.py
│   │   ├── ml_routes.py
│   │   └── chart_routes.py
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── expense_service.py
│   │   ├── dashboard_service.py
│   │   ├── budget_service.py
│   │   ├── insight_service.py
│   │   ├── chart_service.py
│   │   └── export_service.py
│   │
│   ├── ml/
│   │   ├── __init__.py
│   │   ├── category_predictor.py
│   │   ├── anomaly_detector.py
│   │   ├── train_category_model.py
│   │   ├── train_anomaly_model.py
│   │   └── training_data.py
│   │
│   ├── models/
│   │   ├── expense_category_model.joblib
│   │   └── anomaly_model.joblib
│   │
│   ├── database/
│   │   ├── __init__.py
│   │   ├── db.py
│   │   ├── schema.sql
│   │   └── repositories.py
│   │
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── validators.py
│   │   ├── date_utils.py
│   │   ├── response_utils.py
│   │   └── constants.py
│   │
│   ├── charts/
│   │   └── generated/
│   │
│   └── data/
│       └── expense_training_data.csv
│
├── tests/
│   ├── test_expenses.py
│   ├── test_budgets.py
│   ├── test_dashboard.py
│   ├── test_insights.py
│   ├── test_category_prediction.py
│   └── test_anomaly_detection.py
│
├── requirements.txt
└── app.py
```

If the existing backend already uses a different structure, follow its conventions while keeping all Expense Tracker functionality logically separated.

---

# 6. Flask Blueprint

Create a Blueprint for the expense tracker.

Example:

```python
from flask import Blueprint

expense_tracker_bp = Blueprint(
    "expense_tracker",
    __name__,
    url_prefix="/api/expense-tracker"
)
```

Register it in the existing Flask application.

Example:

```python
from expense_tracker import expense_tracker_bp

app.register_blueprint(expense_tracker_bp)
```

Do not create a second Flask server if the current task manager already has one.

---

# 7. API Base URL

Use:

```text
/api/expense-tracker
```

Frontend development URL may therefore be:

```text
http://localhost:5000/api/expense-tracker
```

React frontend:

```text
http://localhost:5173
```

Python backend:

```text
http://localhost:5000
```

---

# 8. CORS

Because React and Flask run on different local ports during development, configure CORS.

Recommended package:

```text
flask-cors
```

Example:

```python
from flask_cors import CORS

CORS(app, origins=["http://localhost:5173"])
```

Do not allow every origin in production unnecessarily.

---

# 9. Database

Use SQLite.

Recommended database file:

```text
backend/database/app.db
```

or use the existing SQLite database if the task-manager backend already has one.

Expense Tracker tables can live in the same database as long as the table names are clearly separated.

---

# 10. Database Tables

Create at minimum:

```text
expenses
budgets
```

If authentication already has a users table, reuse it.

Do not create another duplicate users table unless necessary.

---

# 11. Expenses Table

Recommended SQL:

```sql
CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    notes TEXT,
    predicted_category TEXT,
    prediction_confidence REAL,
    anomaly_status TEXT DEFAULT 'normal',
    anomaly_score REAL,
    anomaly_explanation TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

Important:

Every expense must belong to the authenticated user through:

```text
user_id
```

A user must never see another user's expenses.

---

# 12. Budgets Table

Recommended SQL:

```sql
CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category TEXT,
    month TEXT NOT NULL,
    budget_amount REAL NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

Use:

```text
category = NULL
```

for the overall monthly budget.

Use category values such as:

```text
Food
Transport
Housing
Utilities
Education
Healthcare
Entertainment
Shopping
Other
```

for category-specific budgets.

---

# 13. Recommended Budget Uniqueness Rule

Prevent duplicate budgets for the same:

```text
user
month
category
```

Example:

```text
User 1
2026-09
Food
```

should only have one active Food budget.

Similarly, one overall monthly budget should exist per user/month.

---

# 14. SQLite Connection

Create:

```text
expense_tracker/database/db.py
```

Responsibilities:

- Create SQLite connection
- Return rows as dictionaries
- Initialize schema
- Close connections safely

Example:

```python
import sqlite3

DATABASE_PATH = "database/app.db"

def get_db_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection
```

Prefer parameterized SQL queries.

Never create SQL queries using untrusted string concatenation.

---

# 15. Expense Categories

Store categories in one central constants file.

Create:

```text
expense_tracker/utils/constants.py
```

Example:

```python
EXPENSE_CATEGORIES = [
    "Food",
    "Transport",
    "Housing",
    "Utilities",
    "Education",
    "Healthcare",
    "Entertainment",
    "Shopping",
    "Other",
]
```

---

# 16. Payment Methods

Use:

```python
PAYMENT_METHODS = [
    "Cash",
    "Debit Card",
    "Credit Card",
    "Bank Transfer",
    "Digital Wallet",
    "Other",
]
```

---

# 17. Expense CRUD API

Create endpoints:

```text
GET    /api/expense-tracker/expenses
GET    /api/expense-tracker/expenses/<id>
POST   /api/expense-tracker/expenses
PUT    /api/expense-tracker/expenses/<id>
DELETE /api/expense-tracker/expenses/<id>
```

---

# 18. Create Expense

Endpoint:

```text
POST /api/expense-tracker/expenses
```

Example request:

```json
{
  "date": "2026-09-01",
  "description": "Uber to office",
  "amount": 850,
  "category": "Transport",
  "payment_method": "Cash",
  "notes": "Morning trip"
}
```

Backend responsibilities:

1. Authenticate user
2. Validate input
3. Optionally run category prediction
4. Store selected category
5. Run anomaly detection
6. Store anomaly result
7. Insert expense
8. Return created record

---

# 19. Create Expense Response

Example:

```json
{
  "success": true,
  "message": "Expense created successfully.",
  "expense": {
    "id": 21,
    "date": "2026-09-01",
    "description": "Uber to office",
    "amount": 850,
    "category": "Transport",
    "payment_method": "Cash",
    "notes": "Morning trip",
    "predicted_category": "Transport",
    "prediction_confidence": 0.91,
    "anomaly_status": "normal",
    "anomaly_score": 0.16
  }
}
```

---

# 20. Get All Expenses

Endpoint:

```text
GET /api/expense-tracker/expenses
```

Only return expenses belonging to the logged-in user.

Recommended default ordering:

```text
date DESC
created_at DESC
```

---

# 21. Expense Filtering

Support query parameters:

```text
search
category
payment_method
date_from
date_to
min_amount
max_amount
anomaly_status
```

Example:

```text
GET /api/expense-tracker/expenses?category=Food&date_from=2026-09-01&date_to=2026-09-30
```

---

# 22. Search Behaviour

Search:

```text
description
notes
```

Example:

```text
GET /api/expense-tracker/expenses?search=uber
```

Use parameterized SQL.

---

# 23. Get Single Expense

Endpoint:

```text
GET /api/expense-tracker/expenses/<id>
```

Check:

```text
expense.user_id == authenticated_user.id
```

If not, return:

```text
404
```

or:

```text
403
```

Prefer avoiding information leakage.

---

# 24. Update Expense

Endpoint:

```text
PUT /api/expense-tracker/expenses/<id>
```

Allow editing:

```text
date
description
amount
category
payment_method
notes
```

After modifying amount/category/date, rerun anomaly detection.

If description changes, category prediction may also be recalculated.

Do not automatically override the category selected by the user.

---

# 25. Delete Expense

Endpoint:

```text
DELETE /api/expense-tracker/expenses/<id>
```

Check ownership before deletion.

Response:

```json
{
  "success": true,
  "message": "Expense deleted successfully."
}
```

---

# 26. Input Validation

Create:

```text
expense_tracker/utils/validators.py
```

Expense validation rules:

```text
date
required
valid YYYY-MM-DD date

description
required
minimum 2 characters

amount
required
numeric
greater than 0

category
required
must be allowed category

payment_method
required
must be allowed payment method

notes
optional
```

---

# 27. API Error Responses

Use consistent response structure.

Example validation error:

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "amount": "Amount must be greater than zero."
  }
}
```

Suggested status codes:

```text
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
500 Internal Server Error
```

Do not expose raw Python stack traces to frontend users.

---

# 28. Authentication Integration

The Expense Tracker is authenticated.

The existing Task Manager remains public.

Reuse the existing authentication system.

Every protected Expense Tracker API endpoint must determine the current logged-in user.

Example concept:

```python
user_id = get_current_user_id()
```

Every SQL query for user data must contain:

```text
WHERE user_id = ?
```

This is a mandatory security requirement.

---

# 29. Dashboard API

Create:

```text
GET /api/expense-tracker/dashboard
```

Return:

```text
total expenses
transaction count
average transaction
highest expense
most-used category
current month spending
previous month spending
percentage change
recent expenses
budget alerts
unusual expense count
```

---

# 30. Dashboard Response

Example:

```json
{
  "success": true,
  "summary": {
    "total_expenses": 128450,
    "transaction_count": 47,
    "average_transaction": 2733,
    "highest_expense": 28000,
    "most_used_category": "Food",
    "current_month_spending": 52300,
    "previous_month_spending": 44300,
    "percentage_change": 18.1,
    "unusual_expense_count": 2
  },
  "recent_expenses": []
}
```

---

# 31. Dashboard Analytics with Pandas

Create:

```text
expense_tracker/services/dashboard_service.py
```

Process the logged-in user's expenses using Pandas.

Example:

```python
import pandas as pd

df = pd.DataFrame(expenses)
```

Use Pandas to calculate:

```text
sum
count
mean
max
groupby
monthly aggregation
daily aggregation
category totals
payment-method totals
```

---

# 32. Total Expenses

Calculate:

```python
total_expenses = df["amount"].sum()
```

---

# 33. Transaction Count

Calculate:

```python
transaction_count = len(df)
```

---

# 34. Average Transaction

Calculate:

```python
average_transaction = df["amount"].mean()
```

Handle empty datasets safely.

---

# 35. Highest Expense

Calculate:

```python
highest_expense = df["amount"].max()
```

---

# 36. Most-Used Category

This means the category appearing most frequently.

Example:

```python
most_used_category = df["category"].mode().iloc[0]
```

Do not confuse this with highest-spending category.

Smart Insights can separately calculate highest-spending category.

---

# 37. Current Month Spending

Convert dates:

```python
df["date"] = pd.to_datetime(df["date"])
```

Filter:

```text
current year
current month
```

Then calculate:

```text
sum(amount)
```

---

# 38. Previous Month Spending

Calculate previous calendar month correctly.

Do not simply subtract 30 days.

Use actual calendar month boundaries.

---

# 39. Percentage Change

Formula:

```text
((current month - previous month) / previous month) × 100
```

If previous month spending equals:

```text
0
```

avoid division by zero.

Return either:

```text
null
```

or a clear value according to business rule.

Recommended:

```json
"percentage_change": null
```

when no valid previous-month comparison exists.

---

# 40. Recent Expenses

Dashboard should return the latest:

```text
5
```

or:

```text
10
```

expenses.

Recommended:

```text
5
```

for a clean dashboard.

---

# 41. CSV Export

Create endpoint:

```text
GET /api/expense-tracker/export/csv
```

Support the same filters as the Expenses page.

Example:

```text
/api/expense-tracker/export/csv?category=Food
```

Use Pandas:

```python
df.to_csv(...)
```

Return downloadable CSV response.

---

# 42. CSV Columns

Recommended columns:

```text
Date
Description
Amount
Category
Payment Method
Notes
Predicted Category
Prediction Confidence
Anomaly Status
Anomaly Score
```

Do not include internal:

```text
user_id
```

unless explicitly required.

---

# 43. CSV Filename

Example:

```text
expenses_2026-09-01.csv
```

Filtered files can also use:

```text
expenses_filtered_2026-09-01.csv
```

---

# 44. Matplotlib Charts

Create:

```text
expense_tracker/services/chart_service.py
```

Use:

```python
import matplotlib.pyplot as plt
```

Create six dashboard charts:

1. Category-wise spending bar chart
2. Expense category pie chart
3. Daily spending line chart
4. Monthly spending trend
5. Payment-method distribution
6. Top five largest expenses

---

# 45. Chart API Routes

Recommended:

```text
GET /api/expense-tracker/charts/category-bar
GET /api/expense-tracker/charts/category-pie
GET /api/expense-tracker/charts/daily-line
GET /api/expense-tracker/charts/monthly-trend
GET /api/expense-tracker/charts/payment-method
GET /api/expense-tracker/charts/top-expenses
```

Each route must only process the current user's expenses.

---

# 46. Chart Generation Strategy

Recommended architecture:

```text
SQLite
  ↓
Pandas
  ↓
Matplotlib
  ↓
PNG image in memory
  ↓
Flask response
  ↓
React <img>
```

Prefer in-memory generation rather than permanently storing many chart files.

Use:

```python
from io import BytesIO
```

---

# 47. Example Matplotlib Response

Concept:

```python
buffer = BytesIO()

plt.savefig(
    buffer,
    format="png",
    bbox_inches="tight"
)

buffer.seek(0)

return send_file(
    buffer,
    mimetype="image/png"
)
```

Always close figures:

```python
plt.close()
```

This prevents memory leaks.

---

# 48. Category Bar Chart

Group:

```text
category
```

by:

```text
sum(amount)
```

Use Pandas:

```python
category_totals = df.groupby("category")["amount"].sum()
```

Generate Matplotlib bar chart.

---

# 49. Category Pie Chart

Use category totals.

If there is no data, return a controlled empty-state response instead of generating a broken chart.

---

# 50. Daily Spending Line Chart

Group by date:

```text
date
```

Calculate:

```text
sum(amount)
```

Sort chronologically.

---

# 51. Monthly Spending Trend

Create:

```text
YYYY-MM
```

period from transaction date.

Group expenses by month.

---

# 52. Payment Method Distribution

Group by:

```text
payment_method
```

Use transaction count or spending total.

Recommended:

```text
transaction count
```

because the feature is called distribution.

---

# 53. Top Five Largest Expenses

Sort by:

```text
amount DESC
```

Return top:

```text
5
```

Use descriptions as labels.

---

# 54. Budget Management API

Create:

```text
GET    /api/expense-tracker/budgets
POST   /api/expense-tracker/budgets
PUT    /api/expense-tracker/budgets/<id>
DELETE /api/expense-tracker/budgets/<id>
```

---

# 55. Create Budget

Request:

```json
{
  "month": "2026-09",
  "category": "Food",
  "budget_amount": 20000
}
```

Overall budget:

```json
{
  "month": "2026-09",
  "category": null,
  "budget_amount": 100000
}
```

---

# 56. Budget Response

Return calculated:

```text
budget
spent
remaining
percentage_used
status
```

Example:

```json
{
  "category": "Food",
  "budget": 20000,
  "spent": 16500,
  "remaining": 3500,
  "percentage_used": 82.5,
  "status": "warning"
}
```

---

# 57. Budget Business Rules

Use:

```text
Below 70%    = Safe
70–89%       = Warning
90–100%      = Critical
Above 100%   = Exceeded
```

Recommended implementation:

```python
def get_budget_status(percentage):
    if percentage < 70:
        return "safe"

    if percentage < 90:
        return "warning"

    if percentage <= 100:
        return "critical"

    return "exceeded"
```

---

# 58. Budget Remaining

Calculate:

```text
remaining = budget - spent
```

A negative value indicates exceeded budget.

Example:

```text
budget = 5000
spent = 5700
remaining = -700
```

---

# 59. Smart Insights

Create:

```text
expense_tracker/services/insight_service.py
```

This is a local rule-based financial insight engine.

Do not use:

```text
ChatGPT API
Gemini API
OpenAI API
paid AI API
```

The Smart Insights feature must work offline.

---

# 60. Smart Insights API

Endpoint:

```text
GET /api/expense-tracker/insights
```

Return generated observations.

---

# 61. Smart Insight Examples

Backend can generate:

```text
Food was your highest spending category this month.

Your spending increased by 18% compared with last month.

Transport expenses were unusually high this week.

You spent most frequently using cash.

Your largest expense was Rs. 8,500 on accommodation.

You have already used 82% of your monthly budget.
```

---

# 62. Smart Insight Response

Example:

```json
{
  "success": true,
  "insights": [
    {
      "type": "information",
      "title": "Top Spending Category",
      "message": "Food was your highest spending category this month."
    },
    {
      "type": "warning",
      "title": "Budget Usage",
      "message": "You have already used 82% of your monthly budget."
    }
  ]
}
```

---

# 63. Recommended Insight Types

Use:

```text
information
positive
warning
critical
```

---

# 64. Highest Spending Category Rule

For current month:

```python
monthly_df.groupby("category")["amount"].sum()
```

Find maximum.

Generate:

```text
Food was your highest spending category this month.
```

---

# 65. Month-over-Month Rule

If percentage increase is positive:

```text
Your spending increased by 18% compared with last month.
```

If negative:

```text
Your spending decreased by 12% compared with last month.
```

If comparison is unavailable, do not generate this insight.

---

# 66. Most Frequent Payment Method Rule

Use:

```python
df["payment_method"].mode()
```

Generate:

```text
You spent most frequently using cash.
```

---

# 67. Largest Expense Rule

Find maximum transaction.

Generate:

```text
Your largest expense was Rs. 8,500 on accommodation.
```

Use the actual description or category.

---

# 68. Budget Insight Rule

If budget usage:

```text
>= 70%
```

generate a budget warning.

Examples:

```text
You have used 82% of your monthly budget.
```

At:

```text
>= 90%
```

use a stronger warning.

Above:

```text
100%
```

generate:

```text
You have exceeded your monthly budget.
```

---

# 69. Machine Learning Feature 1

## Automatic Expense Category Prediction

Use:

```text
TfidfVectorizer
LogisticRegression
```

from:

```text
scikit-learn
```

---

# 70. Category Prediction Inputs

Input:

```text
expense description
```

Example:

```text
Uber to office
```

Output:

```text
Transport
```

---

# 71. ML Categories

Use:

```text
Food
Transport
Housing
Utilities
Education
Healthcare
Entertainment
Shopping
Other
```

---

# 72. Training Dataset

Create:

```text
expense_tracker/data/expense_training_data.csv
```

Columns:

```text
description
category
```

Create approximately:

```text
60–100
```

training examples.

For better demo quality, aim for:

```text
90–150
```

if time permits.

---

# 73. Training Data Examples

Example:

```csv
description,category
Bus ticket to Colombo,Transport
Uber to office,Transport
Train ticket,Transport
Lunch from restaurant,Food
Pizza for dinner,Food
Coffee and sandwich,Food
Electricity bill,Utilities
Water bill,Utilities
Monthly room rent,Housing
Apartment rent,Housing
Purchase Python course,Education
Online class fee,Education
Medicine from pharmacy,Healthcare
Doctor consultation,Healthcare
Movie ticket,Entertainment
Netflix subscription,Entertainment
Bought new shoes,Shopping
Purchased laptop bag,Shopping
```

---

# 74. Category Model Pipeline

Recommended:

```python
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

pipeline = Pipeline([
    (
        "tfidf",
        TfidfVectorizer(
            lowercase=True,
            ngram_range=(1, 2)
        )
    ),
    (
        "classifier",
        LogisticRegression(
            max_iter=1000
        )
    )
])
```

---

# 75. Train Category Model

Create:

```text
expense_tracker/ml/train_category_model.py
```

Responsibilities:

1. Load training CSV
2. Validate columns
3. Split data if appropriate
4. Train model
5. Evaluate basic accuracy
6. Save model using Joblib

---

# 76. Save Category Model

Use:

```python
import joblib

joblib.dump(
    pipeline,
    "expense_tracker/models/expense_category_model.joblib"
)
```

---

# 77. Load Category Model

Create:

```text
expense_tracker/ml/category_predictor.py
```

Load model once when possible.

Avoid loading the Joblib file for every request if unnecessary.

---

# 78. Category Prediction API

Endpoint:

```text
POST /api/expense-tracker/predict-category
```

Request:

```json
{
  "description": "Uber to office"
}
```

Response:

```json
{
  "predicted_category": "Transport",
  "confidence": 0.91
}
```

---

# 79. Prediction Confidence

Use Logistic Regression:

```python
predict_proba()
```

Find the probability associated with the predicted category.

Do not claim confidence means real-world certainty.

It is model probability based on the small training dataset.

---

# 80. Human-in-the-Loop Requirement

The backend prediction is only a suggestion.

Do not automatically force:

```text
predicted_category
```

into:

```text
category
```

unless the user accepts it.

Store both:

```text
predicted_category
actual category selected by user
```

This allows future model evaluation.

---

# 81. Future ML Improvement

Because both values are stored:

```text
predicted_category
category
```

you can later calculate:

```text
prediction accepted
prediction changed
```

This is useful for interview discussion.

It demonstrates:

```text
human feedback
model monitoring
future retraining
```

---

# 82. Machine Learning Feature 2

## Unusual Expense Detection

Use:

```text
IsolationForest
```

from:

```text
scikit-learn
```

---

# 83. Anomaly Detection Features

For the lightweight version use:

```text
amount
category_encoded
day_of_month
```

Do not overcomplicate this model.

---

# 84. Feature Example

Expense:

```text
Date: 2026-09-18
Amount: 28000
Category: Food
```

ML features:

```text
amount = 28000
category_encoded = 0
day_of_month = 18
```

---

# 85. Category Encoding

Use a stable mapping.

Example:

```python
CATEGORY_MAPPING = {
    "Food": 0,
    "Transport": 1,
    "Housing": 2,
    "Utilities": 3,
    "Education": 4,
    "Healthcare": 5,
    "Entertainment": 6,
    "Shopping": 7,
    "Other": 8,
}
```

Keep the mapping in one constants file.

---

# 86. Isolation Forest

Example:

```python
from sklearn.ensemble import IsolationForest

model = IsolationForest(
    contamination=0.05,
    random_state=42
)
```

For small datasets, anomaly predictions can be unstable.

Treat results as:

```text
unusual spending indicator
```

not fraud detection.

---

# 87. Anomaly Output

Isolation Forest returns:

```text
1 = normal
-1 = anomaly
```

Map to:

```text
normal
unusual
```

---

# 88. Anomaly Score

Use:

```python
decision_function()
```

Store the resulting numeric score.

Frontend can show:

```text
Anomaly score
```

---

# 89. Anomaly Explanation

Because Isolation Forest does not naturally generate explanations, create a simple rule-based explanation.

Examples:

```text
This expense is much higher than your usual Food transactions.

This transaction amount is significantly above your recent average.

This expense differs from your normal spending pattern.
```

Do not say:

```text
This is fraud.
```

---

# 90. Minimum Data Requirement

Anomaly detection should not train on only one or two expenses.

Recommended:

```text
minimum 10 transactions
```

before ML anomaly detection is enabled.

If fewer than 10 transactions exist, return:

```text
normal
```

with explanation:

```text
Not enough historical transactions for reliable anomaly detection.
```

---

# 91. Anomaly Training Strategy

For a one-day project, use the user's historical transactions.

When a new expense is added:

1. Load previous user expenses
2. Check minimum sample count
3. Create features
4. Train Isolation Forest
5. Score new expense
6. Store anomaly result

This is acceptable for a small interview project.

---

# 92. Alternative Model Storage

Because Isolation Forest may be user-specific, you do not necessarily need to save one global anomaly model.

Recommended:

```text
Category model
save using Joblib

Anomaly model
train dynamically using user history
```

This is simpler and more logical.

If you later have enough shared anonymized data, the anomaly model can be persisted.

---

# 93. Unusual Expenses API

Create:

```text
GET /api/expense-tracker/unusual-expenses
```

Return only current user's expenses where:

```text
anomaly_status = unusual
```

---

# 94. Unusual Expense Response

Example:

```json
{
  "success": true,
  "expenses": [
    {
      "id": 12,
      "date": "2026-09-17",
      "description": "Large restaurant payment",
      "category": "Food",
      "amount": 28000,
      "anomaly_score": -0.72,
      "anomaly_status": "unusual",
      "anomaly_explanation": "This expense is much higher than your usual Food transactions."
    }
  ]
}
```

---

# 95. ML Failure Handling

ML features must never prevent core expense management from working.

If category prediction fails:

```text
expense creation must still work
```

If anomaly detection fails:

```text
expense creation must still work
```

Use fallback values:

```text
predicted_category = null
prediction_confidence = null
anomaly_status = normal
anomaly_score = null
```

Log the technical error on backend.

Return a user-safe response.

---

# 96. Logging

Use Python:

```python
logging
```

Log:

```text
API errors
database failures
model-loading failures
model-training failures
chart-generation failures
```

Do not log:

```text
passwords
tokens
sensitive authentication values
```

---

# 97. Service Layer

Routes should remain thin.

Avoid putting all business logic into route files.

Recommended pattern:

```text
route
 ↓
service
 ↓
repository/database
```

Example:

```text
expense_routes.py
 ↓
expense_service.py
 ↓
repositories.py
 ↓
SQLite
```

---

# 98. Repository Layer

Create:

```text
expense_tracker/database/repositories.py
```

Responsibilities:

```text
insert expense
get user expenses
get expense by id
update expense
delete expense
insert budget
get budgets
update budget
delete budget
```

This separates SQL from business logic.

---

# 99. Response Utility

Create:

```text
expense_tracker/utils/response_utils.py
```

Optional helper:

```python
def success_response(data=None, message=None, status=200):
    ...

def error_response(message, errors=None, status=400):
    ...
```

This keeps API responses consistent.

---

# 100. Requirements File

Add required dependencies to:

```text
backend/requirements.txt
```

Recommended:

```text
Flask
flask-cors
pandas
matplotlib
scikit-learn
joblib
pytest
```

If authentication already uses extra libraries, keep them.

Do not remove existing dependencies.

---

# 101. Suggested requirements.txt

Example:

```txt
Flask
flask-cors
pandas
matplotlib
scikit-learn
joblib
pytest
```

For reproducible deployment, later pin versions:

```text
package==version
```

after verifying the environment.

---

# 102. Testing with Pytest

Create:

```text
backend/tests/
```

Use Pytest.

Test at minimum:

1. Expense creation
2. Expense validation
3. Expense update
4. Expense deletion
5. Expense filtering
6. Budget status rules
7. Dashboard calculations
8. Smart Insight rules
9. Category prediction output
10. Anomaly fallback behaviour

---

# 103. Expense Validation Test

Example scenarios:

```text
amount = 0
should fail

amount = -100
should fail

description empty
should fail

invalid category
should fail
```

---

# 104. Budget Rule Tests

Test:

```text
69% → safe
70% → warning
89% → warning
90% → critical
100% → critical
101% → exceeded
```

These boundary tests are important.

---

# 105. Dashboard Test

Given:

```text
Expense 1 = 1000
Expense 2 = 2000
Expense 3 = 3000
```

Expected:

```text
total = 6000
count = 3
average = 2000
highest = 3000
```

---

# 106. Smart Insight Test

Given:

```text
Food = 15000
Transport = 5000
```

Expected top spending insight:

```text
Food was your highest spending category this month.
```

---

# 107. Category Prediction Test

Test:

```text
Uber to office
```

Expected model result should usually be:

```text
Transport
```

Do not make tests excessively brittle around exact confidence percentages.

---

# 108. Anomaly Detection Test

Test that:

```text
few transactions
```

uses fallback safely.

Also test that:

```text
very large amount
```

can be returned as unusual when enough training history exists.

---

# 109. Security Requirements

Mandatory rules:

- Every user-specific query uses authenticated `user_id`
- Never trust `user_id` from frontend request body
- Validate category
- Validate payment method
- Validate amount
- Use parameterized SQL
- Do not expose stack traces
- Do not expose database paths
- Do not expose model paths
- Never store plain-text passwords

Authentication security should reuse the existing task-manager auth implementation.

---

# 110. Do Not Trust Frontend user_id

Bad:

```json
{
  "user_id": 4,
  "amount": 1000
}
```

The backend must not trust this.

Correct:

```text
Authenticated session/token
       ↓
backend identifies user
       ↓
user_id assigned internally
```

---

# 111. Date Storage

Store expense dates as:

```text
YYYY-MM-DD
```

Example:

```text
2026-09-01
```

Store budget month as:

```text
YYYY-MM
```

Example:

```text
2026-09
```

---

# 112. Amount Storage

Use SQLite:

```text
REAL
```

for this lightweight project.

For a larger financial production system, fixed-precision decimal handling would be preferable.

For this interview project, `REAL` is acceptable if values are handled consistently.

---

# 113. API Endpoint Summary

Final backend endpoints:

```text
GET    /api/expense-tracker/dashboard

GET    /api/expense-tracker/expenses
GET    /api/expense-tracker/expenses/<id>
POST   /api/expense-tracker/expenses
PUT    /api/expense-tracker/expenses/<id>
DELETE /api/expense-tracker/expenses/<id>

POST   /api/expense-tracker/predict-category

GET    /api/expense-tracker/budgets
POST   /api/expense-tracker/budgets
PUT    /api/expense-tracker/budgets/<id>
DELETE /api/expense-tracker/budgets/<id>

GET    /api/expense-tracker/insights

GET    /api/expense-tracker/unusual-expenses

GET    /api/expense-tracker/export/csv

GET    /api/expense-tracker/charts/category-bar
GET    /api/expense-tracker/charts/category-pie
GET    /api/expense-tracker/charts/daily-line
GET    /api/expense-tracker/charts/monthly-trend
GET    /api/expense-tracker/charts/payment-method
GET    /api/expense-tracker/charts/top-expenses
```

---

# 114. Frontend and Backend Data Flow

```text
React Frontend
      ↓
REST API
      ↓
Flask Routes
      ↓
Service Layer
      ↓
SQLite / Pandas / ML
      ↓
JSON / PNG / CSV
      ↓
React Frontend
```

---

# 115. Add Expense Data Flow

```text
React Add Expense Form
        ↓
POST /expenses
        ↓
Validate
        ↓
Category prediction
        ↓
User-selected category preserved
        ↓
Load historical expenses
        ↓
Anomaly detection
        ↓
Insert SQLite record
        ↓
Return JSON
        ↓
React updates UI
```

---

# 116. Dashboard Data Flow

```text
React Dashboard
      ↓
GET /dashboard
      ↓
SQLite expenses
      ↓
Pandas DataFrame
      ↓
KPI calculations
      ↓
JSON response
      ↓
React KPI cards
```

Charts:

```text
React ChartCard
      ↓
GET /charts/...
      ↓
SQLite
      ↓
Pandas
      ↓
Matplotlib
      ↓
PNG
      ↓
React image
```

---

# 117. Smart Insights Data Flow

```text
React Smart Insights
      ↓
GET /insights
      ↓
SQLite expenses + budgets
      ↓
Pandas calculations
      ↓
Business rules
      ↓
Insight messages
      ↓
JSON
      ↓
React Insight Cards
```

---

# 118. Backend Development Order

Build the backend in this order.

## Phase 1 — Module Setup

Create:

```text
expense_tracker/
routes/
services/
database/
utils/
ml/
models/
data/
```

Register Flask Blueprint.

Verify:

```text
GET /api/expense-tracker/health
```

Optional health response:

```json
{
  "status": "ok"
}
```

---

## Phase 2 — SQLite Database

Create:

```text
expenses table
budgets table
```

Implement:

```text
db.py
repositories.py
```

Verify database creation.

---

## Phase 3 — Expense CRUD

Implement:

```text
create
read
update
delete
```

Test with:

```text
Postman
Thunder Client
React frontend
```

---

## Phase 4 — Search and Filters

Implement:

```text
search
category
payment method
date range
amount range
anomaly status
```

---

## Phase 5 — Dashboard Analytics

Implement Pandas calculations:

```text
total
count
average
highest
top category
current month
previous month
percentage change
recent expenses
```

---

## Phase 6 — Budgets

Implement:

```text
overall monthly budget
category budgets
spent
remaining
percentage
status
```

---

## Phase 7 — Category Prediction

Create training dataset.

Train:

```text
TF-IDF + Logistic Regression
```

Save with:

```text
Joblib
```

Create prediction endpoint.

---

## Phase 8 — Anomaly Detection

Implement:

```text
Isolation Forest
```

Features:

```text
amount
category encoded
day of month
```

Add fallback for insufficient history.

---

## Phase 9 — Smart Insights

Implement rule engine.

Generate:

```text
spending
budget
payment
category
largest expense
monthly comparison
unusual expense
```

insights.

---

## Phase 10 — Charts

Generate all six Matplotlib charts.

Expose image endpoints.

---

## Phase 11 — CSV Export

Use Pandas.

Support current filters.

---

## Phase 12 — Testing

Write Pytest tests.

Verify all critical business rules.

---

# 119. Example Backend Completion Checklist

## Existing Project

- [ ] Existing task manager backend still works
- [ ] Existing routes still work
- [ ] Existing task-manager database logic is not broken

## Expense Database

- [ ] Expenses table
- [ ] Budgets table
- [ ] User ownership
- [ ] Schema initialization

## Expense API

- [ ] Add expense
- [ ] View expenses
- [ ] View single expense
- [ ] Edit expense
- [ ] Delete expense
- [ ] Search expenses
- [ ] Filter category
- [ ] Filter date
- [ ] Filter payment method
- [ ] Filter amount
- [ ] Filter anomaly

## Dashboard

- [ ] Total expenses
- [ ] Transaction count
- [ ] Average transaction
- [ ] Highest expense
- [ ] Most-used category
- [ ] Current month spending
- [ ] Previous month spending
- [ ] Percentage change
- [ ] Recent expenses
- [ ] Unusual count

## Budget

- [ ] Overall monthly budget
- [ ] Category budget
- [ ] Spent
- [ ] Remaining
- [ ] Percentage used
- [ ] Safe
- [ ] Warning
- [ ] Critical
- [ ] Exceeded

## Smart Insights

- [ ] Highest spending category
- [ ] Month comparison
- [ ] Payment method
- [ ] Largest expense
- [ ] Budget usage
- [ ] Unusual-spending insight

## Category Prediction

- [ ] Training dataset
- [ ] TF-IDF
- [ ] Logistic Regression
- [ ] Joblib
- [ ] Prediction endpoint
- [ ] Confidence
- [ ] User choice not overwritten

## Anomaly Detection

- [ ] Isolation Forest
- [ ] Amount feature
- [ ] Category encoding
- [ ] Day feature
- [ ] Minimum-data fallback
- [ ] Anomaly score
- [ ] Explanation
- [ ] No fraud claims

## Charts

- [ ] Category bar
- [ ] Category pie
- [ ] Daily line
- [ ] Monthly trend
- [ ] Payment method
- [ ] Top five expenses

## Export

- [ ] CSV download
- [ ] Filtered export
- [ ] Correct filename

## Testing

- [ ] Expense tests
- [ ] Validation tests
- [ ] Budget boundary tests
- [ ] Dashboard tests
- [ ] Insights tests
- [ ] Category model test
- [ ] Anomaly tests

---

# 120. Definition of Backend Done

The backend is complete when:

1. Existing task manager backend continues to function.
2. Expense Tracker exists as a separate backend module.
3. Authenticated users only access their own financial records.
4. Expense CRUD works.
5. Expense search and filtering work.
6. CSV export works.
7. Dashboard KPIs are calculated using Pandas.
8. All six charts are generated using Matplotlib.
9. Overall monthly budget works.
10. Category budgets work.
11. Budget statuses follow the required business rules.
12. Smart Insights work without an external AI API.
13. TF-IDF + Logistic Regression predicts expense categories.
14. Prediction confidence is returned.
15. User-selected category is never forcibly overwritten.
16. Isolation Forest detects unusual expenses.
17. Anomaly explanations are user-safe.
18. Category model is stored using Joblib.
19. Pytest covers critical functionality.
20. React frontend can consume all required APIs.

---

# 121. Final System Architecture

```text
┌───────────────────────────────────┐
│          React.js Frontend        │
│                                   │
│ Task Manager + Expense Tracker    │
└────────────────┬──────────────────┘
                 │
                 │ REST API
                 ▼
┌───────────────────────────────────┐
│           Python / Flask          │
│                                   │
│ Expense Routes                    │
│ Dashboard Routes                  │
│ Budget Routes                     │
│ Insight Routes                    │
│ ML Routes                         │
│ Chart Routes                      │
└───────┬──────────┬────────┬───────┘
        │          │        │
        ▼          ▼        ▼
     SQLite      Pandas   Scikit-learn
        │          │        │
        │          │        ├── TF-IDF
        │          │        ├── Logistic Regression
        │          │        └── Isolation Forest
        │          │
        │          └── Matplotlib
        │
        └── Expenses + Budgets

Scikit-learn Model
        ↓
      Joblib

Backend Tests
        ↓
      Pytest

Source Code
        ↓
 Git + GitHub
```

---

# 122. Key Interview Explanation

A strong short explanation of the backend:

```text
The application uses a modular Python backend with Flask REST APIs and SQLite
for persistent storage. Pandas handles expense filtering, KPI calculations,
monthly comparisons, and financial analysis. Matplotlib generates dashboard
visualisations that are consumed by the React frontend.

For machine learning, TF-IDF and Logistic Regression provide lightweight
expense-category suggestions, while Isolation Forest identifies unusual
spending patterns. The category model is persisted using Joblib.

A local rule-based Smart Insights engine converts analytical results into
financial observations without requiring any external AI API, which keeps the
application free, offline-capable, lightweight, and easy to demonstrate.

Pytest is used to validate CRUD functionality, business rules, analytics, and
ML-related behaviours.
```

---

# 123. Important Final Rules

Do not:

```text
replace the existing task-manager backend
create another unnecessary backend server
use a paid AI API
force ML category predictions
call anomaly detection fraud detection
trust user_id from frontend
store passwords in plain text
put every backend function in one file
generate SQL with unsafe string concatenation
```

Do:

```text
keep the Expense Tracker modular
reuse existing authentication
use SQLite
use Pandas for analytics
use Matplotlib for charts
use scikit-learn for ML
use Joblib for model persistence
use Pytest for tests
keep core CRUD working even if ML fails
make every financial query user-specific
```

This backend architecture is lightweight, free, interview-friendly, and suitable for the existing React + Python Task Manager project.
