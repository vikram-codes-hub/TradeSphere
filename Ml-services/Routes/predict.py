"""
POST /predict  — main prediction endpoint
Called by Node.js backend via mlBridge.service.js
"""

from flask import Blueprint, request, jsonify
from Services.prediction_service import PredictionService
from utils.validators import validate_predict_payload
from utils.logger import get_logger

predict_bp = Blueprint("predict", __name__)
logger     = get_logger(__name__)
svc        = PredictionService()


@predict_bp.post("/predict")
def predict():
    """
    Expected body:
    {
      "symbol": "TECHX",
      "priceHistory": [
        { "price": 1200.0, "volume": 50000, "timestamp": "2024-01-01T00:00:00Z" },
        ...
      ]
    }
    """
    body = request.get_json(silent=True)

    # ── Validate ──────────────────────────────────────────
    error = validate_predict_payload(body)
    if error:
        return jsonify({"success": False, "error": error}), 400

    symbol       = body["symbol"].upper()
    price_history = body["priceHistory"]

    logger.info(f"Prediction request for {symbol} with {len(price_history)} data points")

    try:
        result = svc.predict(symbol, price_history)
        return jsonify({"success": True, "data": result}), 200

    except ValueError as e:
        logger.warning(f"Prediction failed for {symbol}: {e}")
        return jsonify({"success": False, "error": str(e)}), 422

    except Exception as e:
        logger.error(f"Unexpected error predicting {symbol}: {e}")
        return jsonify({"success": False, "error": "Internal prediction error"}), 500