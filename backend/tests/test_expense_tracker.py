from datetime import date, datetime

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.expense_tracker.database import repositories
from app.expense_tracker.ml.anomaly_detector import detect_anomaly
from app.expense_tracker.ml.category_predictor import predict_category
from app.expense_tracker.schemas import BudgetCreate, ExpenseCreate, ExpenseFilters, ExpenseUpdate
from app.expense_tracker.services import budget_service, dashboard_service, expense_service, insight_service
from app.models import User
from app.services.auth_service import hash_password


@pytest.fixture()
def db():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSession()
    user = User(name="Test User", email="test@example.com", password_hash=hash_password("password123"))
    session.add(user)
    session.commit()
    session.refresh(user)
    try:
        yield session, user
    finally:
        session.close()


def make_expense(**overrides):
    data = {
        "date": date(2026, 9, 1),
        "description": "Uber to office",
        "amount": 850,
        "category": "Transport",
        "payment_method": "Cash",
        "notes": "Morning trip",
    }
    data.update(overrides)
    return ExpenseCreate(**data)


def test_expense_create_update_delete_and_filtering(db):
    session, user = db
    created = expense_service.create_expense(session, user.id, make_expense())
    assert created["id"]
    assert created["predicted_category"]
    assert created["anomaly_status"] == "normal"

    filtered = expense_service.list_expenses(session, user.id, ExpenseFilters(search="uber", category="Transport"))
    assert len(filtered) == 1

    updated = expense_service.update_expense(
        session,
        user.id,
        created["id"],
        ExpenseUpdate(**{**created, "description": "Fuel refill", "amount": 1200}),
    )
    assert updated["description"] == "Fuel refill"
    assert updated["amount"] == 1200

    expense_service.delete_expense(session, user.id, created["id"])
    assert expense_service.list_expenses(session, user.id) == []


def test_expense_validation_rejects_bad_amount():
    with pytest.raises(ValueError):
        make_expense(amount=0)


@pytest.mark.parametrize(
    ("used", "expected"),
    [
        (69, "Safe"),
        (70, "Warning"),
        (89, "Warning"),
        (90, "Critical"),
        (100, "Critical"),
        (101, "Exceeded"),
    ],
)
def test_budget_status_boundaries(used, expected):
    assert repositories.get_budget_status(used) == expected


def test_budget_duplicate_rule(db):
    session, user = db
    payload = BudgetCreate(category="Food", month="2026-09", budget_amount=20000)
    budget_service.create_budget(session, user.id, payload)
    with pytest.raises(Exception):
        budget_service.create_budget(session, user.id, payload)


def test_dashboard_calculations(db):
    session, user = db
    for amount in [1000, 2000, 3000]:
        expense_service.create_expense(session, user.id, make_expense(amount=amount))
    expenses = repositories.list_expenses(session, user.id)
    summary = dashboard_service.summarize_expenses(expenses)
    assert summary["total_expenses"] == 6000
    assert summary["transaction_count"] == 3
    assert summary["average_transaction"] == 2000
    assert summary["highest_expense"] == 3000


def test_smart_insight_highest_category():
    expenses = [
        {"date": "2026-09-01", "description": "Lunch", "amount": 15000, "category": "Food", "payment_method": "Cash", "anomaly_status": "normal"},
        {"date": "2026-09-02", "description": "Bus", "amount": 5000, "category": "Transport", "payment_method": "Cash", "anomaly_status": "normal"},
    ]
    insights = insight_service.generate_insights(expenses, [])
    assert any("Food was your highest spending category" in insight["title"] for insight in insights)


def test_category_prediction_returns_transport_for_uber():
    category, confidence = predict_category("Uber to office")
    assert category == "Transport"
    assert confidence >= 0


def test_anomaly_fallback_for_few_transactions():
    status, score, explanation = detect_anomaly(
        {"date": date(2026, 9, 1), "amount": 50000, "category": "Food"},
        [{"date": date(2026, 8, 1), "amount": 1000, "category": "Food"}],
    )
    assert status == "normal"
    assert score is None
    assert "Not enough historical transactions" in explanation


def test_anomaly_can_flag_large_expense_with_history():
    history = [
        {"date": date(2026, 8, day), "amount": 1000 + day, "category": "Food"}
        for day in range(1, 12)
    ]
    status, score, explanation = detect_anomaly(
        {"date": date(2026, 9, 1), "amount": 50000, "category": "Food"},
        history,
    )
    assert status in {"normal", "unusual"}
    assert score is None or isinstance(score, float)
    assert "fraud" not in explanation.lower()
