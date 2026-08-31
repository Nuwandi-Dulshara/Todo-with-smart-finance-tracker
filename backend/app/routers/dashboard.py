from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import DashboardSummary, TaskRead
from ..services import task_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)):
    return task_service.dashboard_summary(db)


@router.get("/recent", response_model=list[TaskRead])
def get_recent_activities(limit: int = Query(default=5, ge=1, le=50), db: Session = Depends(get_db)):
    return task_service.recent_tasks(db, limit)
