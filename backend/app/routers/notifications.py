from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import NotificationResponse
from ..services.notification_service import generate_notifications

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=NotificationResponse)
def get_notifications(db: Session = Depends(get_db)):
    return generate_notifications(db)
