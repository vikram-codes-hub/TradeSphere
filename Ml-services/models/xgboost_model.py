"""
XGBoost Model
Best model for financial time series — handles non-linear patterns,
outliers, and feature interactions better than Random Forest.
"""

import os
import joblib
import numpy as np
from xgboost import XGBRegressor
from sklearn.metrics import mean_squared_error, r2_score
from utils.logger import get_logger

logger     = get_logger(__name__)
MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "saved_models")


class XGBoostModel:

    MODEL_NAME = "XGBoost"

    def __init__(self, symbol: str):
        self.symbol = symbol.upper()
        self.model  = XGBRegressor(
            n_estimators=300,
            max_depth=5,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            min_child_weight=5,
            reg_alpha=0.1,
            reg_lambda=1.0,
            random_state=42,
            n_jobs=-1,
            verbosity=0,
        )
        self._path = os.path.join(MODELS_DIR, f"{self.symbol}_xgb.pkl")

    def train(self, X_train: np.ndarray, y_train: np.ndarray):
        self.model.fit(X_train, y_train)
        self._save()
        logger.info(f"[{self.symbol}] XGBoost trained on {len(X_train)} samples")

    def predict(self, X: np.ndarray) -> np.ndarray:
        return self.model.predict(X)

    def evaluate(self, X_test: np.ndarray, y_test: np.ndarray) -> dict:
        preds = self.predict(X_test)
        rmse  = float(np.sqrt(mean_squared_error(y_test, preds)))
        r2    = float(r2_score(y_test, preds))
        logger.info(f"[{self.symbol}] XGB RMSE={rmse:.4f}  R²={r2:.4f}")
        return {"rmse": rmse, "r2": r2, "model": self.MODEL_NAME}

    def feature_importances(self) -> list:
        return self.model.feature_importances_.tolist()

    def _save(self):
        os.makedirs(MODELS_DIR, exist_ok=True)
        joblib.dump(self.model, self._path)
        logger.debug(f"XGB model saved: {self._path}")

    def load(self) -> bool:
        if os.path.exists(self._path):
            self.model = joblib.load(self._path)
            logger.debug(f"XGB model loaded: {self._path}")
            return True
        return False

    def exists(self) -> bool:
        return os.path.exists(self._path)