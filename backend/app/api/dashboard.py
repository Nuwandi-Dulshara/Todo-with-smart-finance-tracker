from datetime import date
from typing import Annotated
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from pydantic import StrictBool
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.db.database import get_db
from app.models import (
    DashboardTask,
    DashboardTransaction,
    DashboardWidget,
    MonthlyBudget,
    User,
)
from app.schemas.dashboard import (
    WIDGET_KEYS,
    BudgetResponse,
    BudgetUpdate,
    DashboardResponse,
    Month,
    TaskCreate,
    TaskResponse,
    TaskUpdate,
    TransactionCreate,
    TransactionResponse,
    WidgetKey,
)

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])
CurrentUser = Annotated[User, Depends(get_current_user)]
Database = Annotated[Session, Depends(get_db)]
RequestKey = Annotated[UUID | None, Header(alias="Idempotency-Key")]


def create_once(
    db: Session, model, user_id: UUID, values: dict, request_key: UUID | None
):
    """Replay a committed submission when a response was lost, scoped to its owner."""
    key = request_key or uuid4()
    query = select(model).where(model.user_id == user_id, model.request_id == key)
    existing = db.scalar(query)
    if existing is None:
        record = model(user_id=user_id, request_id=key, **values)
        db.add(record)
        try:
            db.commit()
            db.refresh(record)
            return record
        except IntegrityError:
            db.rollback()
            # A concurrent request may have inserted this same key first.
            existing = db.scalar(query)
            if existing is None:
                raise
    if any(getattr(existing, field) != value for field, value in values.items()):
        raise HTTPException(
            409,
            "This submission was already saved with different values. Reload your workspace before submitting again.",
        )
    return existing


def widget_settings(db: Session, user_id: UUID) -> dict[str, bool]:
    result = dict.fromkeys(WIDGET_KEYS, True)
    rows = db.scalars(select(DashboardWidget).where(DashboardWidget.user_id == user_id))
    result.update({row.key: row.visible for row in rows})
    return result


@router.get("", response_model=DashboardResponse)
def read_dashboard(
    user: CurrentUser, db: Database, month: Annotated[Month | None, Query()] = None
):
    month = month or date.today().strftime("%Y-%m")
    budget = db.get(MonthlyBudget, (user.id, month))
    return {
        "user": user,
        "tasks": db.scalars(
            select(DashboardTask)
            .where(DashboardTask.user_id == user.id)
            .order_by(DashboardTask.created_at.desc())
        ).all(),
        "transactions": db.scalars(
            select(DashboardTransaction)
            .where(DashboardTransaction.user_id == user.id)
            .order_by(DashboardTransaction.created_at.desc())
        ).all(),
        "monthly_budget": budget.amount if budget else 0,
        "widgets": widget_settings(db, user.id),
    }


@router.post("/tasks", response_model=TaskResponse, status_code=201)
def create_task(
    payload: TaskCreate, user: CurrentUser, db: Database, request_key: RequestKey = None
):
    return create_once(db, DashboardTask, user.id, payload.model_dump(), request_key)


@router.patch("/tasks/{task_id}", response_model=TaskResponse)
def update_task(task_id: UUID, payload: TaskUpdate, user: CurrentUser, db: Database):
    task = db.scalar(
        select(DashboardTask).where(
            DashboardTask.id == task_id, DashboardTask.user_id == user.id
        )
    )
    if task is None:
        raise HTTPException(404, "Task not found.")
    task.completed = payload.completed
    db.commit()
    db.refresh(task)
    return task


@router.post("/transactions", response_model=TransactionResponse, status_code=201)
def create_transaction(
    payload: TransactionCreate,
    user: CurrentUser,
    db: Database,
    request_key: RequestKey = None,
):
    if payload.task_id is not None:
        owned_task = db.scalar(
            select(DashboardTask.id).where(
                DashboardTask.id == payload.task_id,
                DashboardTask.user_id == user.id,
            )
        )
        if owned_task is None:
            raise HTTPException(404, "Task not found.")
    return create_once(
        db, DashboardTransaction, user.id, payload.model_dump(), request_key
    )


@router.put("/budget", response_model=BudgetResponse)
def update_budget(payload: BudgetUpdate, user: CurrentUser, db: Database):
    # Serialize per-user setting writes, including the first insert.
    db.scalar(select(User.id).where(User.id == user.id).with_for_update())
    budget = db.get(MonthlyBudget, (user.id, payload.month))
    if budget is None:
        budget = MonthlyBudget(
            user_id=user.id, month=payload.month, amount=payload.amount
        )
        db.add(budget)
    else:
        budget.amount = payload.amount
    db.commit()
    return payload.model_dump()


@router.patch("/widgets", response_model=dict[WidgetKey, bool])
def update_widgets(
    payload: dict[WidgetKey, StrictBool], user: CurrentUser, db: Database
):
    db.scalar(select(User.id).where(User.id == user.id).with_for_update())
    for key, visible in payload.items():
        row = db.get(DashboardWidget, (user.id, key))
        if row is None:
            db.add(DashboardWidget(user_id=user.id, key=key, visible=visible))
        else:
            row.visible = visible
    db.commit()
    return widget_settings(db, user.id)
