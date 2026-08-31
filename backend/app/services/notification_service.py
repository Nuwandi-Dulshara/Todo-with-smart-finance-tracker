from datetime import date, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import Task


def generate_notifications(db: Session) -> dict:
    today = date.today()
    now_time = datetime.now().time()
    tasks = list(db.scalars(select(Task).where(Task.is_completed == False)))
    notifications = []

    for task in tasks:
        if task.due_date < today:
            notifications.append(
                {
                    "type": "overdue",
                    "task_id": task.id,
                    "title": task.title,
                    "message": "This task is overdue.",
                    "due_date": task.due_date,
                    "due_time": task.due_time,
                }
            )
        elif task.due_date == today and task.due_time and now_time > task.due_time:
            notifications.append(
                {
                    "type": "missed_today",
                    "task_id": task.id,
                    "title": task.title,
                    "message": "Today's task has not been completed.",
                    "due_date": task.due_date,
                    "due_time": task.due_time,
                }
            )

    return {"count": len(notifications), "notifications": notifications}
