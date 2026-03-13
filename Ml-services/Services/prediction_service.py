"""
Prediction Service  ← THE CORE ORCHESTRATOR
Full pipeline:
  raw history → clean → features → scale → predict → classify → score → return

KEY FIX: y (target prices) are NOT scaled — models train and predict real prices directly.
Only X (features) are scaled. This prevents the predicted price being a tiny scaled value.
"""

import os
import numpy as np
from preprocessing.data_cleaner     import DataCleaner
from preprocessing.feature_engineer import FeatureEngineer
from preprocessing.scaler           import FeatureScaler
from models.model_selector          import ModelSelector
from Services.trend_classifier      import TrendClassifier
from Services.confidence_scorer     import ConfidenceScorer
from utils.logger                   import get_logger

logger  = get_logger(__name__)
MIN_PTS = int(os.getenv("MIN_TRAINING_POINTS", 30))


class PredictionService:

    def __init__(self):
        self.cleaner     = DataCleaner()
        self.engineer    = FeatureEngineer()
        self.selector    = ModelSelector()
        self.trend_clf   = TrendClassifier()
        self.conf_scorer = ConfidenceScorer()

    def predict(self, symbol: str, raw_history: list) -> dict:

        # ── 1. Clean ──────────────────────────────────────
        df = self.cleaner.clean(raw_history)
        logger.info(f"[{symbol}] Clean data: {len(df)} rows")

        if len(df) < MIN_PTS:
            raise ValueError(
                f"Not enough data. Need {MIN_PTS} points, got {len(df)}."
            )

        # ── 2. Features ───────────────────────────────────
        df           = self.engineer.build_features(df)
        feature_cols = self.engineer.get_feature_columns()
        logger.info(f"[{symbol}] Features: {len(df)} rows")

        X = df[feature_cols].values   # shape (n, 9)
        y = df["target"].values       # real prices — NOT scaled

        # ── 3. Train/test split ───────────────────────────
        split   = max(1, int(len(X) * 0.8))
        X_train = X[:split];  X_test = X[split:]
        y_train = y[:split];  y_test = y[split:] if len(y[split:]) > 0 else y[-1:]

        # ── 4. Scale FEATURES only (not y) ───────────────
        scaler     = FeatureScaler(symbol)
        X_train_sc = scaler.fit_transform(X_train)
        X_test_sc  = scaler.transform(X_test)

        # ── 5. Train both models, pick best ───────────────
        metrics = self.selector.select_and_train(
            symbol, X_train_sc, X_test_sc, y_train, y_test
        )
        logger.info(f"[{symbol}] Best model: {metrics['best_model']} RMSE={metrics['best_rmse']:.2f}")

        # ── 6. Predict next-day price ─────────────────────
        latest_sc = scaler.transform(X[-1].reshape(1, -1))
        model, _  = self.selector.load_best(symbol)

        if model is None:
            raise ValueError(f"No trained model available for {symbol}")

        predicted_price = float(model.predict(latest_sc)[0])
        current_price   = float(df["price"].iloc[-1])

        logger.info(f"[{symbol}] predicted={predicted_price:.2f}, current={current_price:.2f}")

        # ── 7. Sanity check ───────────────────────────────
        # If predicted price is < 1% of current, it's a scaled artifact — reject it
        if predicted_price < current_price * 0.01 or predicted_price > current_price * 10:
            raise ValueError(
                f"Prediction out of range: predicted={predicted_price:.2f}, current={current_price:.2f}. "
                f"Check that y_train contains real prices (not scaled values)."
            )

        # ── 8. Classify + score ───────────────────────────
        trend      = self.trend_clf.classify(current_price, predicted_price)
        pct_change = self.trend_clf.pct_change(current_price, predicted_price)
        confidence = self.conf_scorer.score(metrics["best_rmse"], current_price)

        result = {
            "predictedPrice": round(predicted_price, 2),
            "currentPrice":   round(current_price, 2),
            "trend":          trend,
            "pctChange":      pct_change,
            "confidence":     confidence,
            "modelUsed":      metrics["best_model"],
            "rmse":           metrics["best_rmse"],
            "r2":             metrics["best_r2"],
            "lrRmse":         metrics["lr_rmse"],
            "rfRmse":         metrics["rf_rmse"],
            "dataPoints":     len(df),
        }

        logger.info(
            f"[{symbol}] ✅ ₹{current_price} → ₹{predicted_price} "
            f"({trend}, {confidence}% conf)"
        )
        return result