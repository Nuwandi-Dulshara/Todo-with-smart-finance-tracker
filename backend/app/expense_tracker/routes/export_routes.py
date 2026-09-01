from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session

from ...database import get_db
from ...models import User
from ..dependencies import get_current_user
from ..schemas import ExpenseFilters
from ..services import expense_service
from ..services.export_service import expenses_to_csv

router = APIRouter(prefix="/expense-tracker", tags=["Expense Tracker Export"])


@router.get("/export/csv")
def export_csv(
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
    csv_body, filename = expenses_to_csv(expense_service.list_expenses(db, user.id, filters))
    return Response(
        content=csv_body,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
