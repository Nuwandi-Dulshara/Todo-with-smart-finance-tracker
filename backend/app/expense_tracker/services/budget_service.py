from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..database import repositories
from ..schemas import BudgetCreate, BudgetUpdate
from ..utils.validators import validate_budget_payload


def get_budget_status(used_percentage: float) -> str:
    return repositories.get_budget_status(used_percentage)


def _budget_spent(expenses, category: str | None) -> float:
    return float(sum(expense.amount for expense in expenses if category is None or expense.category == category))


def list_budgets(db: Session, user_id: int, month: str | None = None) -> list[dict]:
    budgets = repositories.list_budgets(db, user_id, month)
    expenses = repositories.list_expenses(db, user_id)
    return [repositories.budget_to_dict(budget, _budget_spent(expenses, budget.category)) for budget in budgets]


def create_budget(db: Session, user_id: int, payload: BudgetCreate) -> dict:
    validate_budget_payload(payload)
    if repositories.get_budget_by_key(db, user_id, payload.month, payload.category):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A budget for this category and month already exists.",
        )
    budget = repositories.create_budget(db, user_id, payload)
    spent = _budget_spent(repositories.list_expenses(db, user_id), budget.category)
    return repositories.budget_to_dict(budget, spent)


def update_budget(db: Session, user_id: int, budget_id: int, payload: BudgetUpdate) -> dict:
    validate_budget_payload(payload)
    budget = repositories.get_budget(db, user_id, budget_id)
    if budget is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found.")
    duplicate = repositories.get_budget_by_key(db, user_id, payload.month, payload.category)
    if duplicate and duplicate.id != budget.id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A budget for this category and month already exists.",
        )
    updated = repositories.update_budget(db, budget, payload)
    spent = _budget_spent(repositories.list_expenses(db, user_id), updated.category)
    return repositories.budget_to_dict(updated, spent)


def delete_budget(db: Session, user_id: int, budget_id: int) -> None:
    budget = repositories.get_budget(db, user_id, budget_id)
    if budget is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found.")
    repositories.delete_budget(db, budget)
