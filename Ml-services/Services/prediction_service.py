"""
Prediction Service — orchestrates full pipeline
raw history → clean → features → scale → train → predict → classify → score
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
MIN_PTS = int(os.getenv("MIN_TRAINING_POINTS", 60))


class PredictionService:

    def __init__(self):
        self.cleaner     = DataCleaner()
        self.engineer    = FeatureEngineer()
        self.selector    = ModelSelector()
        self.trend_clf   = TrendClassifier()
        self.conf_scorer = ConfidenceScorer()

    def predict(self, symbol: str, raw_history: list) -> dict:

        # 1. Clean
        df = self.cleaner.clean(raw_history)
        logger.info(f"[{symbol}] Clean data: {len(df)} rows")

        if len(df) < MIN_PTS:
            raise ValueError(f"Not enough data. Need {MIN_PTS} points, got {len(df)}.")

        # 2. Features
        df           = self.engineer.build_features(df)
        feature_cols = self.engineer.get_feature_columns()
        logger.info(f"[{symbol}] Features: {len(df)} rows, {len(feature_cols)} features")

        X = df[feature_cols].values
        y = df["target"].values  # real prices — NOT scaled

        # 3. Train/test split (80/20)
        split   = max(10, int(len(X) * 0.8))
        X_train = X[:split];  X_test = X[split:]
        y_train = y[:split];  y_test = y[split:] if len(y[split:]) > 0 else y[-5:]

        # 4. Scale features only
        scaler     = FeatureScaler(symbol)
        X_train_sc = scaler.fit_transform(X_train)
        X_test_sc  = scaler.transform(X_test)

        # 5. Train all 3 models, pick best
        metrics = self.selector.select_and_train(
            symbol, X_train_sc, X_test_sc, y_train, y_test
        )
        logger.info(f"[{symbol}] Best: {metrics['best_model']} RMSE={metrics['best_rmse']:.2f} R²={metrics['best_r2']:.3f}")

        # 6. Predict next-day price
        latest_sc = scaler.transform(X[-1].reshape(1, -1))
        model, _  = self.selector.load_best(symbol)

        if model is None:
            raise ValueError(f"No trained model for {symbol}")

        predicted_price = float(model.predict(latest_sc)[0])
        current_price   = float(df["price"].iloc[-1])

        logger.info(f"[{symbol}] current={current_price:.2f} predicted={predicted_price:.2f}")

        # 7. Sanity check
        if predicted_price < current_price * 0.01 or predicted_price > current_price * 10:
            raise ValueError(
                f"Prediction out of range: {predicted_price:.2f} vs current {current_price:.2f}"
            )

        # 8. Classify + confidence
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
            "xgbRmse":        metrics.get("xgb_rmse", 0),
            "dataPoints":     len(df),
            "featuresUsed":   len(feature_cols),
        }

        logger.info(
            f"[{symbol}] ✅ ₹{current_price:.2f} → ₹{predicted_price:.2f} "
            f"({trend}, {confidence}% conf, {metrics['best_model']})"
        )
        return result