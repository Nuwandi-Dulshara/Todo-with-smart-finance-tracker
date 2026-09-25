from datetime import date, datetime, time
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

Priority = Literal["low", "medium", "high"]
Status = Literal["pending", "in_progress", "completed"]


class TaskBase(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=180)
    description: str | None = None
    category: str | None = Field(default=None, max_length=80)
    priority: Priority = "medium"
    status: Status = "pending"
    due_date: date | None = None
    due_time: time | None = None
    estimated_minutes: int | None = Field(default=None, ge=0)

    @field_validator("title")
    @classmethod
    def title_must_not_be_empty(cls, value):
        if value is not None and not value.strip():
            raise ValueError("Task title must not be empty")
        return value.strip() if value is not None else value


class TaskCreate(TaskBase):
    title: str = Field(min_length=1, max_length=180)
    due_date: date


class TaskUpdate(TaskBase):
    spent_minutes: int | None = Field(default=None, ge=0)


class TaskCompleteUpdate(BaseModel):
    is_completed: bool


class TaskStatusUpdate(BaseModel):
    status: Status


class TaskTimeUpdate(BaseModel):
    spent_minutes: int = Field(ge=0)


class TaskRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None
    category: str | None
    priority: str
    status: str
    due_date: date
    due_time: time | None
    estimated_minutes: int | None
    spent_minutes: int
    is_completed: bool
    created_at: datetime
    updated_at: datetime
    completed_at: datetime | None


class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("name")
    @classmethod
    def name_must_not_be_empty(cls, value):
        if not value.strip():
            raise ValueError("Name must not be empty")
        return value.strip()

    @field_validator("email")
    @classmethod
    def email_must_be_valid(cls, value):
        normalized = value.strip().lower()
        if "@" not in normalized or "." not in normalized.rsplit("@", 1)[-1]:
            raise ValueError("Enter a valid email address")
        return normalized


class UserLogin(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def login_email_must_be_normalized(cls, value):
        return value.strip().lower()


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    created_at: datetime


class AuthResponse(BaseModel):
    user: UserRead
    access_token: str
    token_type: str = "bearer"


class TaskListToday(BaseModel):
    all_today_tasks: list[TaskRead]
    completed_today: int
    pending_today: int
    in_progress_today: int


class DashboardSummary(BaseModel):
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    in_progress_tasks: int
    today_tasks: int
    today_completed: int
    today_pending: int
    overdue_tasks: int
    completion_percentage: float


class CalendarResponse(BaseModel):
    month: int
    year: int
    tasks: list[TaskRead]


class TimeManagementSummary(BaseModel):
    total_estimated_minutes: int
    total_spent_minutes: int
    remaining_minutes: int
    completed_task_minutes: int
    active_task_minutes: int


class NotificationRead(BaseModel):
    type: str
    task_id: int
    title: str
    message: str
    due_date: date
    due_time: time | None


class NotificationResponse(BaseModel):
    count: int
    notifications: list[NotificationRead]


class SuccessResponse(BaseModel):
    success: bool
    message: str


class HealthResponse(BaseModel):
    status: str
    app: str
