"""
Linear Regression Model
Clean, explainable baseline model.
Good for interviews: easy to explain, fast to train.
"""

import os
import joblib
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
from utils.logger import get_logger

logger     = get_logger(__name__)
MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "saved_models")


class LinearModel:

    MODEL_NAME = "LinearRegression"

    def __init__(self, symbol: str):
        self.symbol = symbol.upper()
        self.model  = LinearRegression()
        self._path  = os.path.join(MODELS_DIR, f"{self.symbol}_lr.pkl")

    # ─────────────────────────────────────────────────────
    def train(self, X_train: np.ndarray, y_train: np.ndarray):
        self.model.fit(X_train, y_train)
        self._save()
        logger.info(f"[{self.symbol}] LinearRegression trained on {len(X_train)} samples")

    def predict(self, X: np.ndarray) -> np.ndarray:
        return self.model.predict(X)

    def evaluate(self, X_test: np.ndarray, y_test: np.ndarray) -> dict:
        preds = self.predict(X_test)
        rmse  = float(np.sqrt(mean_squared_error(y_test, preds)))
        r2    = float(r2_score(y_test, preds))
        logger.info(f"[{self.symbol}] LR RMSE={rmse:.4f}  R²={r2:.4f}")
        return {"rmse": rmse, "r2": r2, "model": self.MODEL_NAME}

    # ─────────────────────────────────────────────────────
    def save(self):
        self._save()

    def _save(self):
        os.makedirs(MODELS_DIR, exist_ok=True)
        joblib.dump(self.model, self._path)
        logger.debug(f"LR model saved: {self._path}")

    def load(self) -> bool:
        if os.path.exists(self._path):
            self.model = joblib.load(self._path)
            logger.debug(f"LR model loaded: {self._path}")
            return True
        return False

    def exists(self) -> bool:
        return os.path.exists(self._path)