from fastapi import APIRouter, Depends

from ...models import User
from ..dependencies import get_current_user
from ..ml.category_predictor import predict_category
from ..schemas import PredictionRequest, PredictionResponse
from ..utils.response_utils import success_response

router = APIRouter(prefix="/expense-tracker", tags=["Expense Tracker ML"])


@router.post("/predict-category", response_model=PredictionResponse)
def predict_expense_category(payload: PredictionRequest, user: User = Depends(get_current_user)):
    predicted_category, confidence = predict_category(payload.description)
    return success_response(predicted_category=predicted_category, confidence=confidence)
