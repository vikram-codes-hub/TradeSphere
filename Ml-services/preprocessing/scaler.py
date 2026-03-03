"""
Scaler
Wraps sklearn MinMaxScaler with save/load to disk.
One scaler is saved per stock symbol alongside the model.
"""

import os
import joblib
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from utils.logger import get_logger

logger       = get_logger(__name__)
MODELS_DIR   = os.path.join(os.path.dirname(__file__), "..", "saved_models")


class FeatureScaler:

    def __init__(self, symbol: str):
        self.symbol  = symbol.upper()
        self.scaler  = MinMaxScaler(feature_range=(0, 1))
        self._path   = os.path.join(MODELS_DIR, f"{self.symbol}_scaler.pkl")

    # ─────────────────────────────────────────────────────
    def fit_transform(self, X: np.ndarray) -> np.ndarray:
        scaled = self.scaler.fit_transform(X)
        self._save()
        return scaled

    def transform(self, X: np.ndarray) -> np.ndarray:
        return self.scaler.transform(X)

    def inverse_transform_price(self, value: float, price_col_index: int = 0) -> float:
        """Inverse-scale a single predicted price value."""
        dummy = np.zeros((1, self.scaler.n_features_in_))
        dummy[0, price_col_index] = value
        return float(self.scaler.inverse_transform(dummy)[0, price_col_index])

    # ─────────────────────────────────────────────────────
    def _save(self):
        os.makedirs(MODELS_DIR, exist_ok=True)
        joblib.dump(self.scaler, self._path)
        logger.debug(f"Scaler saved: {self._path}")

    def load(self) -> bool:
        if os.path.exists(self._path):
            self.scaler = joblib.load(self._path)
            logger.debug(f"Scaler loaded: {self._path}")
            return True
        return False

    def exists(self) -> bool:
        return os.path.exists(self._path)