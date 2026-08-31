from calendar import monthrange
from datetime import date, datetime

from fastapi import HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from ..models import Task
from ..schemas import TaskCompleteUpdate, TaskCreate, TaskStatusUpdate, TaskTimeUpdate, TaskUpdate


def get_task_or_404(db: Session, task_id: int) -> Task:
    task = db.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


def is_overdue(task: Task, today: date | None = None) -> bool:
    current_day = today or date.today()
    return not task.is_completed and task.due_date < current_day


def apply_completion(task: Task, is_completed: bool) -> Task:
    task.is_completed = is_completed
    if is_completed:
        task.status = "completed"
        task.completed_at = datetime.utcnow()
    else:
        task.status = "pending"
        task.completed_at = None
    return task


def sync_completion_from_status(task: Task) -> Task:
    if task.status == "completed":
        task.is_completed = True
        task.completed_at = task.completed_at or datetime.utcnow()
    elif task.is_completed:
        task.is_completed = False
        task.completed_at = None
    return task


def list_tasks(
    db: Session,
    status_filter: str | None = None,
    priority: str | None = None,
    category: str | None = None,
    due_date: date | None = None,
    completed: bool | None = None,
    search: str | None = None,
    sort: str | None = None,
) -> list[Task]:
    statement = select(Task)

    if status_filter:
        statement = statement.where(Task.status == status_filter)
    if priority:
        statement = statement.where(Task.priority == priority)
    if category:
        statement = statement.where(Task.category == category)
    if due_date:
        statement = statement.where(Task.due_date == due_date)
    if completed is not None:
        statement = statement.where(Task.is_completed == completed)
    if search:
        search_term = f"%{search.lower()}%"
        statement = statement.where(
            or_(
                Task.title.ilike(search_term),
                Task.description.ilike(search_term),
                Task.category.ilike(search_term),
            )
        )

    if sort == "due_date":
        statement = statement.order_by(Task.due_date.asc(), Task.due_time.asc().nullslast())
    elif sort == "priority":
        statement = statement.order_by(Task.priority.asc(), Task.created_at.desc())
    elif sort == "created_at" or sort is None:
        statement = statement.order_by(Task.created_at.desc())
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid sort value")

    return list(db.scalars(statement))


def create_task(db: Session, task_in: TaskCreate) -> Task:
    payload = task_in.model_dump()
    task = Task(**payload)
    sync_completion_from_status(task)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def update_task(db: Session, task_id: int, task_in: TaskUpdate) -> Task:
    task = get_task_or_404(db, task_id)
    updates = task_in.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(task, field, value)
    sync_completion_from_status(task)
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task_id: int) -> None:
    task = get_task_or_404(db, task_id)
    db.delete(task)
    db.commit()


def update_task_completion(db: Session, task_id: int, payload: TaskCompleteUpdate) -> Task:
    task = get_task_or_404(db, task_id)
    apply_completion(task, payload.is_completed)
    db.commit()
    db.refresh(task)
    return task


def update_task_status(db: Session, task_id: int, payload: TaskStatusUpdate) -> Task:
    task = get_task_or_404(db, task_id)
    task.status = payload.status
    sync_completion_from_status(task)
    db.commit()
    db.refresh(task)
    return task


def update_task_time(db: Session, task_id: int, payload: TaskTimeUpdate) -> Task:
    task = get_task_or_404(db, task_id)
    task.spent_minutes = payload.spent_minutes
    db.commit()
    db.refresh(task)
    return task


def today_summary(db: Session) -> dict:
    today = date.today()
    tasks = list_tasks(db, due_date=today, sort="due_date")
    return {
        "all_today_tasks": tasks,
        "completed_today": len([task for task in tasks if task.status == "completed"]),
        "pending_today": len([task for task in tasks if task.status == "pending"]),
        "in_progress_today": len([task for task in tasks if task.status == "in_progress"]),
    }


def dashboard_summary(db: Session) -> dict:
    tasks = list(db.scalars(select(Task)))
    today = date.today()
    today_tasks = [task for task in tasks if task.due_date == today]
    completed_tasks = [task for task in tasks if task.is_completed]
    total = len(tasks)

    return {
        "total_tasks": total,
        "completed_tasks": len(completed_tasks),
        "pending_tasks": len([task for task in tasks if task.status == "pending"]),
        "in_progress_tasks": len([task for task in tasks if task.status == "in_progress"]),
        "today_tasks": len(today_tasks),
        "today_completed": len([task for task in today_tasks if task.is_completed]),
        "today_pending": len([task for task in today_tasks if not task.is_completed]),
        "overdue_tasks": len([task for task in tasks if is_overdue(task, today)]),
        "completion_percentage": round((len(completed_tasks) / total * 100), 2) if total else 0,
    }


def recent_tasks(db: Session, limit: int = 5) -> list[Task]:
    statement = select(Task).order_by(Task.updated_at.desc(), Task.created_at.desc()).limit(limit)
    return list(db.scalars(statement))


def calendar_tasks(db: Session, month: int, year: int) -> list[Task]:
    if month < 1 or month > 12:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Month must be between 1 and 12")
    first_day = date(year, month, 1)
    last_day = date(year, month, monthrange(year, month)[1])
    statement = (
        select(Task)
        .where(Task.due_date >= first_day, Task.due_date <= last_day)
        .order_by(Task.due_date.asc(), Task.due_time.asc().nullslast())
    )
    return list(db.scalars(statement))


def time_management_summary(db: Session) -> dict:
    tasks = list(db.scalars(select(Task)))
    total_estimated = sum(task.estimated_minutes or 0 for task in tasks)
    total_spent = sum(task.spent_minutes for task in tasks)
    completed_minutes = sum(task.spent_minutes for task in tasks if task.is_completed)
    active_minutes = sum(task.spent_minutes for task in tasks if not task.is_completed)

    return {
        "total_estimated_minutes": total_estimated,
        "total_spent_minutes": total_spent,
        "remaining_minutes": max(total_estimated - total_spent, 0),
        "completed_task_minutes": completed_minutes,
        "active_task_minutes": active_minutes,
    }
