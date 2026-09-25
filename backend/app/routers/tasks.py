from datetime import date

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import (
    SuccessResponse,
    TaskCompleteUpdate,
    TaskCreate,
    TaskListToday,
    TaskRead,
    TaskStatusUpdate,
    TaskTimeUpdate,
    TaskUpdate,
)
from ..services import task_service

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("", response_model=list[TaskRead])
def get_tasks(
    status_filter: str | None = Query(default=None, alias="status"),
    priority: str | None = None,
    category: str | None = None,
    due_date: date | None = None,
    completed: bool | None = None,
    search: str | None = None,
    sort: str | None = None,
    db: Session = Depends(get_db),
):
    return task_service.list_tasks(
        db,
        status_filter=status_filter,
        priority=priority,
        category=category,
        due_date=due_date,
        completed=completed,
        search=search,
        sort=sort,
    )


@router.post("", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    return task_service.create_task(db, task)


@router.get("/today", response_model=TaskListToday)
def get_today_tasks(db: Session = Depends(get_db)):
    return task_service.today_summary(db)


@router.get("/{task_id}", response_model=TaskRead)
def get_task(task_id: int, db: Session = Depends(get_db)):
    return task_service.get_task_or_404(db, task_id)


@router.put("/{task_id}", response_model=TaskRead)
def update_task(task_id: int, task: TaskUpdate, db: Session = Depends(get_db)):
    return task_service.update_task(db, task_id, task)


@router.delete("/{task_id}", response_model=SuccessResponse)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task_service.delete_task(db, task_id)
    return {"success": True, "message": "Task deleted successfully"}


@router.patch("/{task_id}/complete", response_model=TaskRead)
def complete_task(task_id: int, payload: TaskCompleteUpdate, db: Session = Depends(get_db)):
    return task_service.update_task_completion(db, task_id, payload)


@router.patch("/{task_id}/status", response_model=TaskRead)
def change_task_status(task_id: int, payload: TaskStatusUpdate, db: Session = Depends(get_db)):
    return task_service.update_task_status(db, task_id, payload)


@router.patch("/{task_id}/time", response_model=TaskRead)
def update_task_time(task_id: int, payload: TaskTimeUpdate, db: Session = Depends(get_db)):
    return task_service.update_task_time(db, task_id, payload)
