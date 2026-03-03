"""
Evaluate
Standalone evaluation script — run manually to check model performance.

Usage:
  python -m training.evaluate --symbol AAPL
"""

import argparse
import numpy as np
from sklearn.model_selection import KFold
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from training.train import ModelTrainer
from preprocessing.feature_engineer import FeatureEngineer
from preprocessing.scaler import FeatureScaler
from models.linear_model import LinearModel
from models.random_forest_model import RandomForestModel
from utils.logger import get_logger

logger = get_logger(__name__)


def evaluate_symbol(symbol: str):
    trainer  = ModelTrainer()
    engineer = FeatureEngineer()

    df = trainer._load_or_fetch(symbol)
    df = engineer.build_features(df)

    feature_cols = engineer.get_feature_columns()
    X = df[feature_cols].values
    y = df["target"].values

    scaler = FeatureScaler(symbol)
    X_sc   = scaler.fit_transform(X)

    results = {}
    for ModelClass in [LinearModel, RandomForestModel]:
        model    = ModelClass(symbol)
        kf       = KFold(n_splits=5, shuffle=True, random_state=42)
        rmses, maes, r2s = [], [], []

        for train_idx, test_idx in kf.split(X_sc):
            model.train(X_sc[train_idx], y[train_idx])
            preds = model.predict(X_sc[test_idx])

            rmses.append(np.sqrt(mean_squared_error(y[test_idx], preds)))
            maes.append(mean_absolute_error(y[test_idx], preds))
            r2s.append(r2_score(y[test_idx], preds))

        results[model.MODEL_NAME] = {
            "mean_rmse": round(float(np.mean(rmses)), 4),
            "mean_mae":  round(float(np.mean(maes)),  4),
            "mean_r2":   round(float(np.mean(r2s)),   4),
        }
        logger.info(f"[{symbol}] {model.MODEL_NAME}: {results[model.MODEL_NAME]}")

    return results


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--symbol", required=True)
    args = parser.parse_args()
    evaluate_symbol(args.symbol.upper())