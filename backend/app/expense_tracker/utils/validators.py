from datetime import date, datetime

from fastapi import HTTPException, status

from .constants import EXPENSE_CATEGORIES, PAYMENT_METHODS


def validation_error(errors: dict[str, str]) -> None:
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail={"success": False, "message": "Validation failed.", "errors": errors},
    )


def validate_date(value: date | str | None, field: str = "date") -> date:
    if value is None:
        validation_error({field: f"{field.replace('_', ' ').title()} is required."})
    if isinstance(value, date):
        return value
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError:
        validation_error({field: "Date must use YYYY-MM-DD format."})


def validate_month(value: str | None) -> str:
    if not value:
        validation_error({"month": "Month is required."})
    try:
        datetime.strptime(value, "%Y-%m")
    except ValueError:
        validation_error({"month": "Month must use YYYY-MM format."})
    return value


def validate_expense_payload(payload) -> None:
    errors = {}
    if not payload.date:
        errors["date"] = "Date is required."
    if not payload.description or len(payload.description.strip()) < 2:
        errors["description"] = "Description must be at least 2 characters."
    if payload.amount is None or payload.amount <= 0:
        errors["amount"] = "Amount must be greater than zero."
    if payload.category not in EXPENSE_CATEGORIES:
        errors["category"] = "Category is not supported."
    if payload.payment_method not in PAYMENT_METHODS:
        errors["payment_method"] = "Payment method is not supported."
    if errors:
        validation_error(errors)


def validate_budget_payload(payload) -> None:
    errors = {}
    if payload.month:
        try:
            datetime.strptime(payload.month, "%Y-%m")
        except ValueError:
            errors["month"] = "Month must use YYYY-MM format."
    else:
        errors["month"] = "Month is required."
    if payload.category is not None and payload.category not in EXPENSE_CATEGORIES:
        errors["category"] = "Category is not supported."
    if payload.budget_amount is None or payload.budget_amount <= 0:
        errors["budget_amount"] = "Budget amount must be greater than zero."
    if errors:
        validation_error(errors)
