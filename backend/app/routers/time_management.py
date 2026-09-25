from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import TimeManagementSummary
from ..services import task_service

router = APIRouter(prefix="/time-management", tags=["Time Management"])


@router.get("/summary", response_model=TimeManagementSummary)
def get_time_management_summary(db: Session = Depends(get_db)):
    return task_service.time_management_summary(db)
