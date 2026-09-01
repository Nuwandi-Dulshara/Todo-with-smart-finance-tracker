from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ...database import get_db
from ...models import User
from ..dependencies import get_current_user
from ..schemas import BudgetCreate, BudgetListResponse, BudgetResponse, BudgetUpdate
from ..services import budget_service
from ..utils.response_utils import success_response

router = APIRouter(prefix="/expense-tracker", tags=["Expense Tracker Budgets"])


@router.get("/budgets", response_model=BudgetListResponse)
def get_budgets(month: str | None = None, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return success_response(budgets=budget_service.list_budgets(db, user.id, month))


@router.post("/budgets", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
def create_budget(payload: BudgetCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    budget = budget_service.create_budget(db, user.id, payload)
    return success_response(message="Budget created successfully.", budget=budget)


@router.put("/budgets/{budget_id}", response_model=BudgetResponse)
def update_budget(
    budget_id: int,
    payload: BudgetUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    budget = budget_service.update_budget(db, user.id, budget_id, payload)
    return success_response(message="Budget updated successfully.", budget=budget)


@router.delete("/budgets/{budget_id}")
def delete_budget(budget_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    budget_service.delete_budget(db, user.id, budget_id)
    return success_response(message="Budget deleted successfully.")
