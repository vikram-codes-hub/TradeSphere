"""
Random Forest Model
Stronger model — captures non-linear relationships between features.
Auto-selected when it outperforms Linear Regression on held-out test data.
"""

import os
import joblib
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
from utils.logger import get_logger

logger     = get_logger(__name__)
MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "saved_models")


class RandomForestModel:

    MODEL_NAME = "RandomForest"

    def __init__(self, symbol: str):
        self.symbol = symbol.upper()
        self.model  = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1,        # use all CPU cores
        )
        self._path = os.path.join(MODELS_DIR, f"{self.symbol}_rf.pkl")

    # ─────────────────────────────────────────────────────
    def train(self, X_train: np.ndarray, y_train: np.ndarray):
        self.model.fit(X_train, y_train)
        self._save()
        logger.info(f"[{self.symbol}] RandomForest trained on {len(X_train)} samples")

    def predict(self, X: np.ndarray) -> np.ndarray:
        return self.model.predict(X)

    def evaluate(self, X_test: np.ndarray, y_test: np.ndarray) -> dict:
        preds = self.predict(X_test)
        rmse  = float(np.sqrt(mean_squared_error(y_test, preds)))
        r2    = float(r2_score(y_test, preds))
        logger.info(f"[{self.symbol}] RF  RMSE={rmse:.4f}  R²={r2:.4f}")
        return {"rmse": rmse, "r2": r2, "model": self.MODEL_NAME}

    def feature_importances(self) -> list:
        """Returns feature importance scores — great to show in interview."""
        return self.model.feature_importances_.tolist()

    # ─────────────────────────────────────────────────────
    def save(self):
        self._save()

    def _save(self):
        os.makedirs(MODELS_DIR, exist_ok=True)
        joblib.dump(self.model, self._path)
        logger.debug(f"RF model saved: {self._path}")

    def load(self) -> bool:
        if os.path.exists(self._path):
            self.model = joblib.load(self._path)
            logger.debug(f"RF model loaded: {self._path}")
            return True
        return False

    def exists(self) -> bool:
        return os.path.exists(self._path)