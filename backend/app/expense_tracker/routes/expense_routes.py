from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ...database import get_db
from ...models import User
from ..dependencies import get_current_user
from ..schemas import ExpenseCreate, ExpenseFilters, ExpenseListResponse, ExpenseResponse, ExpenseUpdate
from ..services import expense_service
from ..utils.response_utils import success_response

router = APIRouter(prefix="/expense-tracker", tags=["Expense Tracker"])


@router.get("/health")
def health():
    return {"status": "ok"}


@router.get("/expenses", response_model=ExpenseListResponse)
def get_expenses(
    search: str | None = None,
    category: str | None = None,
    payment_method: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    min_amount: float | None = None,
    max_amount: float | None = None,
    anomaly_status: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    filters = ExpenseFilters(
        search=search,
        category=category,
        payment_method=payment_method,
        date_from=date_from,
        date_to=date_to,
        min_amount=min_amount,
        max_amount=max_amount,
        anomaly_status=anomaly_status,
    )
    return success_response(expenses=expense_service.list_expenses(db, user.id, filters))


@router.post("/expenses", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(payload: ExpenseCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    expense = expense_service.create_expense(db, user.id, payload)
    return success_response(message="Expense created successfully.", expense=expense)


@router.get("/expenses/{expense_id}", response_model=ExpenseResponse)
def get_expense(expense_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    expense = expense_service.get_expense(db, user.id, expense_id)
    return success_response(message="Expense loaded successfully.", expense=expense)


@router.put("/expenses/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: int,
    payload: ExpenseUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    expense = expense_service.update_expense(db, user.id, expense_id, payload)
    return success_response(message="Expense updated successfully.", expense=expense)


@router.delete("/expenses/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    expense_service.delete_expense(db, user.id, expense_id)
    return success_response(message="Expense deleted successfully.")


@router.get("/unusual-expenses", response_model=ExpenseListResponse)
def get_unusual_expenses(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return success_response(expenses=expense_service.list_unusual_expenses(db, user.id))
