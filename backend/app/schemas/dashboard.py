from datetime import UTC, date, datetime
from decimal import Decimal
from typing import Annotated, Literal
from uuid import UUID

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    StrictBool,
    field_serializer,
    model_validator,
)
from pydantic.alias_generators import to_camel

from app.schemas import UserResponse

Month = Annotated[str, Field(pattern=r"^[1-9][0-9]{3}-(0[1-9]|1[0-2])$")]
Money = Annotated[
    Decimal, Field(ge=0, max_digits=12, decimal_places=2, allow_inf_nan=False)
]
WidgetKey = Literal[
    "tasks",
    "finances",
    "priorities",
    "transactions",
    "deadlines",
    "activity",
    "insights",
    "weekly",
    "linked",
]
WIDGET_KEYS = (
    "tasks",
    "finances",
    "priorities",
    "transactions",
    "deadlines",
    "activity",
    "insights",
    "weekly",
    "linked",
)


class DashboardModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
        extra="forbid",
        str_strip_whitespace=True,
    )


class TaskCreate(DashboardModel):
    title: str = Field(min_length=1, max_length=120)
    category: str = Field(min_length=1, max_length=60)
    priority: Literal["High", "Medium", "Low"]
    due_date: date


class TaskUpdate(DashboardModel):
    completed: StrictBool


class Timestamped(DashboardModel):
    id: UUID
    created_at: datetime

    @field_serializer("created_at")
    def serialize_timestamp(self, value: datetime) -> str:
        # SQLite tests return naive timestamps; PostgreSQL returns aware timestamps.
        return (
            value.replace(tzinfo=UTC).isoformat()
            if value.tzinfo is None
            else value.astimezone(UTC).isoformat()
        )


class TaskResponse(TaskCreate, Timestamped):
    completed: bool


class TransactionCreate(DashboardModel):
    title: str = Field(min_length=1, max_length=120)
    amount: Money = Field(gt=0)
    type: Literal["income", "expense"]
    category: str = Field(min_length=1, max_length=60)
    date: date
    task_id: UUID | None = None

    @model_validator(mode="after")
    def validate_task_link(self):
        if self.type == "income" and self.task_id is not None:
            raise ValueError("Only expenses can be linked to a task.")
        return self


class TransactionResponse(TransactionCreate, Timestamped):
    @field_serializer("amount")
    def serialize_amount(self, value: Decimal) -> float:
        return float(value)


class BudgetUpdate(DashboardModel):
    month: Month
    amount: Money


class BudgetResponse(BudgetUpdate):
    @field_serializer("amount")
    def serialize_amount(self, value: Decimal) -> float:
        return float(value)


class DashboardResponse(DashboardModel):
    user: UserResponse
    tasks: list[TaskResponse]
    transactions: list[TransactionResponse]
    monthly_budget: Money
    widgets: dict[WidgetKey, bool]

    @field_serializer("monthly_budget")
    def serialize_budget(self, value: Decimal) -> float:
        return float(value)
