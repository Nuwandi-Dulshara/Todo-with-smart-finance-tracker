import logging
from pathlib import Path

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

from .training_data import TRAINING_SAMPLES

logger = logging.getLogger(__name__)

MODEL_DIR = Path(__file__).resolve().parents[1] / "models"
MODEL_PATH = MODEL_DIR / "expense_category_model.joblib"


def train_category_model() -> Pipeline:
    descriptions, categories = zip(*TRAINING_SAMPLES)
    model = Pipeline(
        [
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2), lowercase=True)),
            ("classifier", LogisticRegression(max_iter=1000)),
        ]
    )
    model.fit(descriptions, categories)
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    return model


def load_category_model() -> Pipeline:
    try:
        if MODEL_PATH.exists():
            return joblib.load(MODEL_PATH)
        return train_category_model()
    except Exception:
        logger.exception("Category model loading failed; retraining fallback model.")
        return train_category_model()


def predict_category(description: str) -> tuple[str, float]:
    try:
        model = load_category_model()
        predicted_category = str(model.predict([description])[0])
        confidence = 0.0
        if hasattr(model.named_steps["classifier"], "predict_proba"):
            probabilities = model.predict_proba([description])[0]
            confidence = float(max(probabilities))
        return predicted_category, round(confidence, 4)
    except Exception:
        logger.exception("Category prediction failed.")
        return "Other", 0.0
