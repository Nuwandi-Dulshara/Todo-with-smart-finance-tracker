from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator

from .utils.constants import EXPENSE_CATEGORIES, PAYMENT_METHODS

AnomalyStatus = Literal["normal", "unusual"]


class ExpenseBase(BaseModel):
    date: date
    description: str = Field(min_length=2, max_length=500)
    amount: float = Field(gt=0)
    category: str
    payment_method: str
    notes: str | None = None

    @field_validator("description")
    @classmethod
    def description_must_be_clean(cls, value):
        return value.strip()

    @field_validator("category")
    @classmethod
    def category_must_be_allowed(cls, value):
        if value not in EXPENSE_CATEGORIES:
            raise ValueError("Category is not supported")
        return value

    @field_validator("payment_method")
    @classmethod
    def payment_method_must_be_allowed(cls, value):
        if value not in PAYMENT_METHODS:
            raise ValueError("Payment method is not supported")
        return value


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseUpdate(ExpenseBase):
    pass


class ExpenseRead(ExpenseBase):
    id: int
    predicted_category: str | None = None
    prediction_confidence: float | None = None
    anomaly_status: str = "normal"
    anomaly_score: float | None = None
    anomaly_explanation: str | None = None
    created_at: datetime
    updated_at: datetime


class ExpenseResponse(BaseModel):
    success: bool
    message: str
    expense: ExpenseRead


class ExpenseListResponse(BaseModel):
    success: bool
    expenses: list[ExpenseRead]


class ExpenseFilters(BaseModel):
    search: str | None = None
    category: str | None = None
    payment_method: str | None = None
    date_from: date | None = None
    date_to: date | None = None
    min_amount: float | None = Field(default=None, ge=0)
    max_amount: float | None = Field(default=None, ge=0)
    anomaly_status: AnomalyStatus | None = None


class PredictionRequest(BaseModel):
    description: str = Field(min_length=2, max_length=500)


class PredictionResponse(BaseModel):
    success: bool
    predicted_category: str
    confidence: float


class DashboardSummary(BaseModel):
    total_expenses: float
    transaction_count: int
    average_transaction: float
    highest_expense: float
    most_used_category: str | None
    current_month_spending: float
    previous_month_spending: float
    percentage_change: float | None
    unusual_expense_count: int


class DashboardResponse(BaseModel):
    success: bool
    summary: DashboardSummary
    recent_expenses: list[ExpenseRead]
    budget_alerts: list[str]


class BudgetBase(BaseModel):
    category: str | None = None
    month: str = Field(min_length=7, max_length=7)
    budget_amount: float = Field(gt=0)

    @field_validator("category")
    @classmethod
    def budget_category_must_be_allowed(cls, value):
        if value is not None and value not in EXPENSE_CATEGORIES:
            raise ValueError("Category is not supported")
        return value


class BudgetCreate(BudgetBase):
    pass


class BudgetUpdate(BudgetBase):
    pass


class BudgetRead(BudgetBase):
    id: int
    spent: float
    remaining: float
    used_percentage: float
    status: str
    created_at: datetime
    updated_at: datetime


class BudgetResponse(BaseModel):
    success: bool
    message: str
    budget: BudgetRead


class BudgetListResponse(BaseModel):
    success: bool
    budgets: list[BudgetRead]


class Insight(BaseModel):
    type: str
    title: str
    message: str
    period: str
    category: str | None = None
    metric: str | None = None


class InsightResponse(BaseModel):
    success: bool
    insights: list[Insight]
