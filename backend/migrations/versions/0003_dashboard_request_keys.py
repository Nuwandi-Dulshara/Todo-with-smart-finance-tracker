"""Deduplicate retried task and transaction submissions per user."""

import sqlalchemy as sa
from alembic import op

revision = "0003_dashboard_request_keys"
down_revision = "0002_dashboard"
branch_labels = None
depends_on = None


def upgrade():
    for table in ("dashboard_tasks", "dashboard_transactions"):
        op.add_column(table, sa.Column("request_id", sa.Uuid(), nullable=True))
        # Existing records get a unique key without requiring a UUID extension.
        records = sa.table(
            table, sa.column("id", sa.Uuid()), sa.column("request_id", sa.Uuid())
        )
        op.execute(records.update().values(request_id=records.c.id))
        op.alter_column(table, "request_id", nullable=False)
        op.create_unique_constraint(
            "uq_" + table + "_request", table, ["user_id", "request_id"]
        )


def downgrade():
    for table in ("dashboard_transactions", "dashboard_tasks"):
        op.drop_constraint("uq_" + table + "_request", table, type_="unique")
        op.drop_column(table, "request_id")
