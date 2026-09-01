from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from ...database import get_db
from ...models import User
from ..dependencies import get_current_user
from ..database import repositories
from ..services import chart_service

router = APIRouter(prefix="/expense-tracker/charts", tags=["Expense Tracker Charts"])


def _expense_rows(db: Session, user_id: int) -> list[dict]:
    return [repositories.expense_to_dict(expense) for expense in repositories.list_expenses(db, user_id)]


def _png(buffer):
    return StreamingResponse(buffer, media_type="image/png")


@router.get("/category-bar")
def category_bar(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return _png(chart_service.category_bar(_expense_rows(db, user.id)))


@router.get("/category-pie")
def category_pie(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return _png(chart_service.category_pie(_expense_rows(db, user.id)))


@router.get("/daily-line")
def daily_line(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return _png(chart_service.daily_line(_expense_rows(db, user.id)))


@router.get("/monthly-trend")
def monthly_trend(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return _png(chart_service.monthly_trend(_expense_rows(db, user.id)))


@router.get("/payment-method")
def payment_method(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return _png(chart_service.payment_method(_expense_rows(db, user.id)))


@router.get("/top-expenses")
def top_expenses(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return _png(chart_service.top_expenses(_expense_rows(db, user.id)))
