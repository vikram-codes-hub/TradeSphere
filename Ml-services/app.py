"""
TradeSphere ML Microservice
Entry point — Flask app factory
"""

from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

from routes.predict import predict_bp
from routes.health import health_bp
from routes.train import train_bp
from utils.logger import get_logger

load_dotenv()
logger = get_logger(__name__)


def create_app():
    app = Flask(__name__)

    # ── CORS ──────────────────────────────────────────────
    CORS(app, origins=[
        os.getenv("FRONTEND_URL", "http://localhost:5173"),
        os.getenv("BACKEND_URL",  "http://localhost:3000"),
    ])

    # ── Config ────────────────────────────────────────────
    app.config["DEBUG"]   = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    app.config["TESTING"] = False

    # ── Register Blueprints ───────────────────────────────
    app.register_blueprint(health_bp,  url_prefix="/")
    app.register_blueprint(predict_bp, url_prefix="/")
    app.register_blueprint(train_bp,   url_prefix="/")

    logger.info("TradeSphere ML Service started ✅")
    return app


if __name__ == "__main__":
    app = create_app()
    port = int(os.getenv("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=app.config["DEBUG"])