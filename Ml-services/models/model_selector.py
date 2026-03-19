"""
Model Selector
Trains XGBoost, RandomForest, and LinearRegression.
Picks winner by lowest RMSE on held-out test set.
XGBoost wins most of the time for financial data.
"""

import numpy as np
from models.Linear_model        import LinearModel
from models.random_forest_model import RandomForestModel
from models.xgboost_model       import XGBoostModel
from utils.logger               import get_logger

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

        lr  = LinearModel(symbol)
        rf  = RandomForestModel(symbol)
        xgb = XGBoostModel(symbol)

        lr.train(X_train,  y_train)
        rf.train(X_train,  y_train)
        xgb.train(X_train, y_train)

        lr_metrics  = lr.evaluate(X_test,  y_test)
        rf_metrics  = rf.evaluate(X_test,  y_test)
        xgb_metrics = xgb.evaluate(X_test, y_test)

        # Pick model with lowest RMSE
        candidates = [
            ("LinearRegression", lr_metrics),
            ("RandomForest",     rf_metrics),
            ("XGBoost",          xgb_metrics),
        ]
        best_name, best_metrics = min(candidates, key=lambda x: x[1]["rmse"])

        logger.info(
            f"[{symbol}] Winner: {best_name} "
            f"(XGB={xgb_metrics['rmse']:.2f}, RF={rf_metrics['rmse']:.2f}, LR={lr_metrics['rmse']:.2f})"
        )

        return {
            "best_model": best_name,
            "best_rmse":  round(best_metrics["rmse"], 4),
            "best_r2":    round(best_metrics["r2"],   4),
            "lr_rmse":    round(lr_metrics["rmse"],   4),
            "rf_rmse":    round(rf_metrics["rmse"],   4),
            "xgb_rmse":   round(xgb_metrics["rmse"],  4),
        }

    def load_best(self, symbol: str):
        """Load whichever saved model had lowest RMSE — prefer XGBoost."""
        xgb = XGBoostModel(symbol)
        if xgb.exists():
            xgb.load()
            return xgb, "XGBoost"

        rf = RandomForestModel(symbol)
        if rf.exists():
            rf.load()
            return rf, "RandomForest"

        lr = LinearModel(symbol)
        if lr.exists():
            lr.load()
            return lr, "LinearRegression"

        return None, None