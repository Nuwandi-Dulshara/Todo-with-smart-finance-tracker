"""Add user-owned dashboard records, monthly budgets and widget preferences."""

import sqlalchemy as sa
from alembic import op

revision = "0002_dashboard"
down_revision = "0001_create_users"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "dashboard_tasks",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "user_id",
            sa.Uuid(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("title", sa.String(120), nullable=False),
        sa.Column("category", sa.String(60), nullable=False),
        sa.Column("priority", sa.String(6), nullable=False),
        sa.Column("due_date", sa.Date(), nullable=False),
        sa.Column("completed", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("id", "user_id", name="uq_dashboard_tasks_id_user"),
        sa.CheckConstraint(
            "priority IN ('High', 'Medium', 'Low')", name="ck_task_priority"
        ),
    )
    op.create_index("ix_dashboard_tasks_user_id", "dashboard_tasks", ["user_id"])
    op.create_table(
        "dashboard_transactions",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "user_id",
            sa.Uuid(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("title", sa.String(120), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("type", sa.String(7), nullable=False),
        sa.Column("category", sa.String(60), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("task_id", sa.Uuid(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["task_id", "user_id"],
            ["dashboard_tasks.id", "dashboard_tasks.user_id"],
            name="fk_transaction_owned_task",
        ),
        sa.CheckConstraint("amount > 0", name="ck_transaction_amount"),
        sa.CheckConstraint("type IN ('income', 'expense')", name="ck_transaction_type"),
    )
    op.create_index(
        "ix_dashboard_transactions_user_id", "dashboard_transactions", ["user_id"]
    )
    op.create_table(
        "monthly_budgets",
        sa.Column(
            "user_id",
            sa.Uuid(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column("month", sa.String(7), primary_key=True),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.CheckConstraint("amount >= 0", name="ck_budget_amount"),
    )
    op.create_table(
        "dashboard_widgets",
        sa.Column(
            "user_id",
            sa.Uuid(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column("key", sa.String(20), primary_key=True),
        sa.Column("visible", sa.Boolean(), nullable=False),
    )


def downgrade():
    op.drop_table("dashboard_widgets")
    op.drop_table("monthly_budgets")
    op.drop_table("dashboard_transactions")
    op.drop_table("dashboard_tasks")
