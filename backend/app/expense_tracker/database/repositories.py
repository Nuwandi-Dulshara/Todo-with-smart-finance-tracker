from sqlalchemy import and_, or_, select
from sqlalchemy.orm import Session

from ...models import Budget, Expense
from ..schemas import BudgetCreate, BudgetUpdate, ExpenseCreate, ExpenseFilters, ExpenseUpdate


def expense_to_dict(expense: Expense) -> dict:
    return {
        "id": expense.id,
        "date": expense.date,
        "description": expense.description,
        "amount": expense.amount,
        "category": expense.category,
        "payment_method": expense.payment_method,
        "notes": expense.notes,
        "predicted_category": expense.predicted_category,
        "prediction_confidence": expense.prediction_confidence,
        "anomaly_status": expense.anomaly_status,
        "anomaly_score": expense.anomaly_score,
        "anomaly_explanation": expense.anomaly_explanation,
        "created_at": expense.created_at,
        "updated_at": expense.updated_at,
    }


def budget_to_dict(budget: Budget, spent: float = 0) -> dict:
    used_percentage = (spent / budget.budget_amount * 100) if budget.budget_amount else 0
    remaining = budget.budget_amount - spent
    return {
        "id": budget.id,
        "category": budget.category,
        "month": budget.month,
        "budget_amount": budget.budget_amount,
        "spent": spent,
        "remaining": remaining,
        "used_percentage": round(used_percentage, 2),
        "status": get_budget_status(used_percentage),
        "created_at": budget.created_at,
        "updated_at": budget.updated_at,
    }


def get_budget_status(used_percentage: float) -> str:
    if used_percentage > 100:
        return "Exceeded"
    if used_percentage >= 90:
        return "Critical"
    if used_percentage >= 70:
        return "Warning"
    return "Safe"


def _expense_filter_conditions(user_id: int, filters: ExpenseFilters | None = None):
    conditions = [Expense.user_id == user_id]
    if not filters:
        return conditions
    if filters.search:
        search = f"%{filters.search.lower()}%"
        conditions.append(or_(Expense.description.ilike(search), Expense.notes.ilike(search)))
    if filters.category:
        conditions.append(Expense.category == filters.category)
    if filters.payment_method:
        conditions.append(Expense.payment_method == filters.payment_method)
    if filters.date_from:
        conditions.append(Expense.date >= filters.date_from)
    if filters.date_to:
        conditions.append(Expense.date <= filters.date_to)
    if filters.min_amount is not None:
        conditions.append(Expense.amount >= filters.min_amount)
    if filters.max_amount is not None:
        conditions.append(Expense.amount <= filters.max_amount)
    if filters.anomaly_status:
        conditions.append(Expense.anomaly_status == filters.anomaly_status)
    return conditions


def list_expenses(db: Session, user_id: int, filters: ExpenseFilters | None = None) -> list[Expense]:
    statement = (
        select(Expense)
        .where(and_(*_expense_filter_conditions(user_id, filters)))
        .order_by(Expense.date.desc(), Expense.created_at.desc())
    )
    return list(db.scalars(statement))


def get_expense(db: Session, user_id: int, expense_id: int) -> Expense | None:
    return db.scalar(select(Expense).where(Expense.id == expense_id, Expense.user_id == user_id))


def create_expense(
    db: Session,
    user_id: int,
    payload: ExpenseCreate,
    predicted_category: str | None,
    prediction_confidence: float | None,
    anomaly_status: str,
    anomaly_score: float | None,
    anomaly_explanation: str | None,
) -> Expense:
    expense = Expense(
        user_id=user_id,
        date=payload.date,
        description=payload.description,
        amount=payload.amount,
        category=payload.category,
        payment_method=payload.payment_method,
        notes=payload.notes,
        predicted_category=predicted_category,
        prediction_confidence=prediction_confidence,
        anomaly_status=anomaly_status,
        anomaly_score=anomaly_score,
        anomaly_explanation=anomaly_explanation,
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


def update_expense(
    db: Session,
    expense: Expense,
    payload: ExpenseUpdate,
    predicted_category: str | None,
    prediction_confidence: float | None,
    anomaly_status: str,
    anomaly_score: float | None,
    anomaly_explanation: str | None,
) -> Expense:
    expense.date = payload.date
    expense.description = payload.description
    expense.amount = payload.amount
    expense.category = payload.category
    expense.payment_method = payload.payment_method
    expense.notes = payload.notes
    expense.predicted_category = predicted_category
    expense.prediction_confidence = prediction_confidence
    expense.anomaly_status = anomaly_status
    expense.anomaly_score = anomaly_score
    expense.anomaly_explanation = anomaly_explanation
    db.commit()
    db.refresh(expense)
    return expense


def delete_expense(db: Session, expense: Expense) -> None:
    db.delete(expense)
    db.commit()


def list_unusual_expenses(db: Session, user_id: int) -> list[Expense]:
    return list(
        db.scalars(
            select(Expense)
            .where(Expense.user_id == user_id, Expense.anomaly_status == "unusual")
            .order_by(Expense.date.desc(), Expense.created_at.desc())
        )
    )


def list_budgets(db: Session, user_id: int, month: str | None = None) -> list[Budget]:
    statement = select(Budget).where(Budget.user_id == user_id)
    if month:
        statement = statement.where(Budget.month == month)
    return list(db.scalars(statement.order_by(Budget.category.asc().nullsfirst())))


def get_budget(db: Session, user_id: int, budget_id: int) -> Budget | None:
    return db.scalar(select(Budget).where(Budget.id == budget_id, Budget.user_id == user_id))


def get_budget_by_key(db: Session, user_id: int, month: str, category: str | None) -> Budget | None:
    return db.scalar(select(Budget).where(Budget.user_id == user_id, Budget.month == month, Budget.category == category))


def create_budget(db: Session, user_id: int, payload: BudgetCreate) -> Budget:
    budget = Budget(
        user_id=user_id,
        category=payload.category,
        month=payload.month,
        budget_amount=payload.budget_amount,
    )
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget


def update_budget(db: Session, budget: Budget, payload: BudgetUpdate) -> Budget:
    budget.category = payload.category
    budget.month = payload.month
    budget.budget_amount = payload.budget_amount
    db.commit()
    db.refresh(budget)
    return budget


def delete_budget(db: Session, budget: Budget) -> None:
    db.delete(budget)
    db.commit()
