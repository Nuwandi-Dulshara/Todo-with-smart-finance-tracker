import uuid
from datetime import UTC, date, datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    ForeignKeyConstraint,
    Numeric,
    String,
    UniqueConstraint,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class User(Base):
    __tablename__ = "users"
    __table_args__ = (UniqueConstraint("email", name="uq_users_email"),)

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(320), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )


class DashboardTask(Base):
    __tablename__ = "dashboard_tasks"
    __table_args__ = (
        UniqueConstraint("id", "user_id", name="uq_dashboard_tasks_id_user"),
        UniqueConstraint("user_id", "request_id", name="uq_dashboard_tasks_request"),
        CheckConstraint(
            "priority IN ('High', 'Medium', 'Low')", name="ck_task_priority"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    request_id: Mapped[uuid.UUID] = mapped_column(Uuid, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    title: Mapped[str] = mapped_column(String(120))
    category: Mapped[str] = mapped_column(String(60))
    priority: Mapped[str] = mapped_column(String(6))
    due_date: Mapped[date] = mapped_column(Date)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC)
    )


class DashboardTransaction(Base):
    __tablename__ = "dashboard_transactions"
    __table_args__ = (
        UniqueConstraint(
            "user_id", "request_id", name="uq_dashboard_transactions_request"
        ),
        ForeignKeyConstraint(
            ["task_id", "user_id"],
            ["dashboard_tasks.id", "dashboard_tasks.user_id"],
            name="fk_transaction_owned_task",
        ),
        CheckConstraint("amount > 0", name="ck_transaction_amount"),
        CheckConstraint("type IN ('income', 'expense')", name="ck_transaction_type"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    request_id: Mapped[uuid.UUID] = mapped_column(Uuid, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    title: Mapped[str] = mapped_column(String(120))
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    type: Mapped[str] = mapped_column(String(7))
    category: Mapped[str] = mapped_column(String(60))
    date: Mapped[date] = mapped_column(Date)
    task_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC)
    )


class MonthlyBudget(Base):
    __tablename__ = "monthly_budgets"
    __table_args__ = (CheckConstraint("amount >= 0", name="ck_budget_amount"),)

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    month: Mapped[str] = mapped_column(String(7), primary_key=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))


class DashboardWidget(Base):
    __tablename__ = "dashboard_widgets"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    key: Mapped[str] = mapped_column(String(20), primary_key=True)
    visible: Mapped[bool] = mapped_column(Boolean)
