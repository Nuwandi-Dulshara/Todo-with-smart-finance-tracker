from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ...database import get_db
from ...models import User
from ..dependencies import get_current_user
from ..schemas import InsightResponse
from ..services import budget_service, expense_service, insight_service
from ..utils.response_utils import success_response

router = APIRouter(prefix="/expense-tracker", tags=["Expense Tracker Insights"])


@router.get("/insights", response_model=InsightResponse)
def get_insights(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    expenses = expense_service.list_expenses(db, user.id)
    budgets = budget_service.list_budgets(db, user.id)
    return success_response(insights=insight_service.generate_insights(expenses, budgets))
