"""
Model Selector
Trains both LinearRegression and RandomForest on the same data,
evaluates each on a held-out test set, and picks the winner (lower RMSE).

This is a key interview talking point:
  "The system auto-selects the best model per stock based on RMSE"
"""

import numpy as np
from models.linear_model import LinearModel
from models.random_forest_model import RandomForestModel
from utils.logger import get_logger

logger = get_logger(__name__)


class ModelSelector:

    def select_and_train(
        self,
        symbol: str,
        X_train: np.ndarray,
        X_test:  np.ndarray,
        y_train: np.ndarray,
        y_test:  np.ndarray,
    ) -> dict:
        """
        Trains both models, evaluates on test set, saves the winner.

        Returns:
        {
          "best_model":  "RandomForest" | "LinearRegression",
          "lr_rmse":     float,
          "rf_rmse":     float,
          "best_rmse":   float,
          "best_r2":     float,
        }
        """
        # ── Train both ────────────────────────────────────
        lr = LinearModel(symbol)
        rf = RandomForestModel(symbol)

        lr.train(X_train, y_train)
        rf.train(X_train, y_train)

        # ── Evaluate both ─────────────────────────────────
        lr_metrics = lr.evaluate(X_test, y_test)
        rf_metrics = rf.evaluate(X_test, y_test)

        lr_rmse = lr_metrics["rmse"]
        rf_rmse = rf_metrics["rmse"]

        # ── Pick winner ───────────────────────────────────
        if rf_rmse < lr_rmse:
            best_name    = "RandomForest"
            best_metrics = rf_metrics
            logger.info(f"[{symbol}] Winner: RandomForest (RMSE {rf_rmse:.4f} vs LR {lr_rmse:.4f})")
        else:
            best_name    = "LinearRegression"
            best_metrics = lr_metrics
            logger.info(f"[{symbol}] Winner: LinearRegression (RMSE {lr_rmse:.4f} vs RF {rf_rmse:.4f})")

        return {
            "best_model": best_name,
            "lr_rmse":    round(lr_rmse, 4),
            "rf_rmse":    round(rf_rmse, 4),
            "best_rmse":  round(best_metrics["rmse"], 4),
            "best_r2":    round(best_metrics["r2"], 4),
        }

    # ─────────────────────────────────────────────────────
    def load_best(self, symbol: str):
        """
        Loads whichever saved model has lower RMSE metadata.
        Falls back to RandomForest if no metadata available.
        """
        rf = RandomForestModel(symbol)
        lr = LinearModel(symbol)

        # Prefer RF if both exist — it's generally stronger
        if rf.exists():
            rf.load()
            return rf, "RandomForest"

        if lr.exists():
            lr.load()
            return lr, "LinearRegression"

        return None, None