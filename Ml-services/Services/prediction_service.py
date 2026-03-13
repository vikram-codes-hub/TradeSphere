"""
Prediction Service  ← THE CORE ORCHESTRATOR
Full pipeline:
  raw history → clean → features → scale → predict → classify → score → return
"""

import os
import numpy as np
from preprocessing.data_cleaner   import DataCleaner
from preprocessing.feature_engineer import FeatureEngineer
from preprocessing.scaler          import FeatureScaler
from models.model_selector          import ModelSelector
from Services.trend_classifier      import TrendClassifier
from Services.confidence_scorer     import ConfidenceScorer
from utils.logger                   import get_logger

logger   = get_logger(__name__)
MIN_PTS  = int(os.getenv("MIN_TRAINING_POINTS", 50))


class PredictionService:

    def __init__(self):
        self.cleaner    = DataCleaner()
        self.engineer   = FeatureEngineer()
        self.selector   = ModelSelector()
        self.trend_clf  = TrendClassifier()
        self.conf_scorer = ConfidenceScorer()

    # ─────────────────────────────────────────────────────
    def predict(self, symbol: str, raw_history: list) -> dict:
        """
        Full prediction pipeline.

        Returns:
        {
          "predictedPrice":  1432.50,
          "currentPrice":    1398.00,
          "trend":           "bullish",
          "pctChange":       2.47,
          "confidence":      78.4,
          "modelUsed":       "RandomForest",
          "rmse":            12.3,
          "r2":              0.91,
        }
        """
        # ── 1. Clean raw data ─────────────────────────────
        df = self.cleaner.clean(raw_history)

        if len(df) < MIN_PTS:
            raise ValueError(
                f"Not enough data to predict. Need {MIN_PTS} points, got {len(df)}."
            )

        # ── 2. Engineer features ──────────────────────────
        df = self.engineer.build_features(df)
        feature_cols = self.engineer.get_feature_columns()

        X = df[feature_cols].values
        y = df["target"].values

        # ── 3. Scale ──────────────────────────────────────
        scaler = FeatureScaler(symbol)

        # Use last 20% as test set
        split     = max(1, int(len(X) * 0.8))
        X_train   = X[:split]
        X_test    = X[split:]
        y_train   = y[:split]
        y_test    = y[split:] if len(y[split:]) > 0 else y[-1:]

        X_train_sc = scaler.fit_transform(X_train)
        X_test_sc  = scaler.transform(X_test)

        # ── 4. Train / load models ────────────────────────
        # Always retrain on latest data (models are cheap to train)
        metrics = self.selector.select_and_train(
            symbol, X_train_sc, X_test_sc, y_train, y_test
        )

        # ── 5. Predict next day ───────────────────────────
        # Use last row (most recent data point) as input
        latest_features = X[-1].reshape(1, -1)
        latest_scaled   = scaler.transform(latest_features)

        model, model_name = self.selector.load_best(symbol)
        raw_pred = float(model.predict(latest_scaled)[0])

        # ── 6. Current price ──────────────────────────────
        current_price = float(df["price"].iloc[-1])

        # ── 7. Classify trend ─────────────────────────────
        trend      = self.trend_clf.classify(current_price, raw_pred)
        pct_change = self.trend_clf.pct_change(current_price, raw_pred)

        # ── 8. Confidence score ───────────────────────────
        confidence = self.conf_scorer.score(metrics["best_rmse"], current_price)

        result = {
            "predictedPrice": round(raw_pred, 2),
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
            f"[{symbol}] Prediction complete: "
            f"₹{current_price} → ₹{raw_pred} ({trend}, {confidence}% confidence)"
        )
        return result