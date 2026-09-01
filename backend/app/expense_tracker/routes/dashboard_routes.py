from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ...database import get_db
from ...models import User
from ..database import repositories
from ..dependencies import get_current_user
from ..schemas import DashboardResponse
from ..services.dashboard_service import build_dashboard
from ..utils.response_utils import success_response

router = APIRouter(prefix="/expense-tracker", tags=["Expense Tracker Dashboard"])


@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    expenses = repositories.list_expenses(db, user.id)
    budgets = repositories.list_budgets(db, user.id)
    dashboard = build_dashboard(expenses, budgets)
    return success_response(**dashboard)
