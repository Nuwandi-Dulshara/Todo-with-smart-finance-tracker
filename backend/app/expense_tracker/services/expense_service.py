from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..database import repositories
from ..ml.anomaly_detector import detect_anomaly
from ..ml.category_predictor import predict_category
from ..schemas import ExpenseCreate, ExpenseFilters, ExpenseUpdate
from ..utils.validators import validate_expense_payload


def _history_rows(db: Session, user_id: int) -> list[dict]:
    return [repositories.expense_to_dict(expense) for expense in repositories.list_expenses(db, user_id)]


def list_expenses(db: Session, user_id: int, filters: ExpenseFilters | None = None) -> list[dict]:
    return [repositories.expense_to_dict(expense) for expense in repositories.list_expenses(db, user_id, filters)]


def get_expense(db: Session, user_id: int, expense_id: int) -> dict:
    expense = repositories.get_expense(db, user_id, expense_id)
    if expense is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found.")
    return repositories.expense_to_dict(expense)


def create_expense(db: Session, user_id: int, payload: ExpenseCreate) -> dict:
    validate_expense_payload(payload)
    predicted_category, confidence = predict_category(payload.description)
    expense_candidate = {
        "date": payload.date,
        "description": payload.description,
        "amount": payload.amount,
        "category": payload.category,
        "payment_method": payload.payment_method,
    }
    anomaly_status, anomaly_score, anomaly_explanation = detect_anomaly(expense_candidate, _history_rows(db, user_id))
    expense = repositories.create_expense(
        db,
        user_id,
        payload,
        predicted_category,
        confidence,
        anomaly_status,
        anomaly_score,
        anomaly_explanation,
    )
    return repositories.expense_to_dict(expense)


def update_expense(db: Session, user_id: int, expense_id: int, payload: ExpenseUpdate) -> dict:
    validate_expense_payload(payload)
    expense = repositories.get_expense(db, user_id, expense_id)
    if expense is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found.")
    predicted_category, confidence = predict_category(payload.description)
    history = [item for item in _history_rows(db, user_id) if item["id"] != expense_id]
    expense_candidate = {
        "date": payload.date,
        "description": payload.description,
        "amount": payload.amount,
        "category": payload.category,
        "payment_method": payload.payment_method,
    }
    anomaly_status, anomaly_score, anomaly_explanation = detect_anomaly(expense_candidate, history)
    updated = repositories.update_expense(
        db,
        expense,
        payload,
        predicted_category,
        confidence,
        anomaly_status,
        anomaly_score,
        anomaly_explanation,
    )
    return repositories.expense_to_dict(updated)


def delete_expense(db: Session, user_id: int, expense_id: int) -> None:
    expense = repositories.get_expense(db, user_id, expense_id)
    if expense is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found.")
    repositories.delete_expense(db, expense)


def list_unusual_expenses(db: Session, user_id: int) -> list[dict]:
    return [repositories.expense_to_dict(expense) for expense in repositories.list_unusual_expenses(db, user_id)]
