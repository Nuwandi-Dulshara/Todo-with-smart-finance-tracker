from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import CalendarResponse, TaskRead
from ..services import task_service

router = APIRouter(prefix="/calendar", tags=["Calendar"])


@router.get("", response_model=CalendarResponse)
def get_calendar_tasks(
    month: int = Query(default_factory=lambda: date.today().month, ge=1, le=12),
    year: int = Query(default_factory=lambda: date.today().year, ge=1900, le=3000),
    db: Session = Depends(get_db),
):
    return {"month": month, "year": year, "tasks": task_service.calendar_tasks(db, month, year)}


@router.get("/{selected_date}", response_model=list[TaskRead])
def get_calendar_date_tasks(selected_date: date, db: Session = Depends(get_db)):
    return task_service.list_tasks(db, due_date=selected_date, sort="due_date")
