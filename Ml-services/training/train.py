"""
POST /train/<symbol>  — manually retrain model for a stock
Uses Alpha Vantage to fetch real OHLCV data, then retrains
"""

from flask import Blueprint, jsonify
from training.train import ModelTrainer
from utils.logger import get_logger

train_bp = Blueprint("train", __name__)
logger   = get_logger(__name__)
trainer  = ModelTrainer()


@train_bp.post("/train/<symbol>")
def train(symbol: str):
    symbol = symbol.upper()
    logger.info(f"Manual retrain requested for {symbol}")

    try:
        result = trainer.train_from_alpha_vantage(symbol)
        return jsonify({"success": True, "data": result}), 200

    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 422

    except Exception as e:
        logger.error(f"Training failed for {symbol}: {e}")
        return jsonify({"success": False, "error": "Training failed"}), 500