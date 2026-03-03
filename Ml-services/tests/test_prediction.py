"""
Tests — Prediction Service
Run with: pytest tests/test_prediction.py -v
"""

import pytest
from services.prediction_service import PredictionService
from services.trend_classifier import TrendClassifier
from services.confidence_scorer import ConfidenceScorer


# ── Fixtures ──────────────────────────────────────────────────────────
def make_history(n=100, start_price=1000.0):
    """Generate synthetic price history for testing."""
    import random
    history = []
    price   = start_price
    for i in range(n):
        price += random.uniform(-20, 22)  # slight upward drift
        history.append({
            "price":     round(price, 2),
            "volume":    random.randint(10000, 100000),
            "timestamp": f"2024-{(i // 30) + 1:02d}-{(i % 28) + 1:02d}T00:00:00Z",
        })
    return history


# ── Trend Classifier ──────────────────────────────────────────────────
class TestTrendClassifier:

    def setup_method(self):
        self.clf = TrendClassifier()

    def test_bullish(self):
        assert self.clf.classify(1000, 1020) == "bullish"

    def test_bearish(self):
        assert self.clf.classify(1000, 970) == "bearish"

    def test_neutral(self):
        assert self.clf.classify(1000, 1005) == "neutral"

    def test_zero_price(self):
        assert self.clf.classify(0, 100) == "neutral"

    def test_pct_change(self):
        pct = self.clf.pct_change(1000, 1100)
        assert abs(pct - 10.0) < 0.01


# ── Confidence Scorer ─────────────────────────────────────────────────
class TestConfidenceScorer:

    def setup_method(self):
        self.scorer = ConfidenceScorer()

    def test_high_accuracy(self):
        # Very low error → high confidence
        score = self.scorer.score(rmse=5, current_price=1000)
        assert score >= 90

    def test_low_accuracy(self):
        # High error → low confidence
        score = self.scorer.score(rmse=200, current_price=1000)
        assert score == self.scorer.MIN_CONFIDENCE

    def test_clamped_max(self):
        score = self.scorer.score(rmse=0.001, current_price=1000)
        assert score <= self.scorer.MAX_CONFIDENCE

    def test_clamped_min(self):
        score = self.scorer.score(rmse=99999, current_price=1)
        assert score >= self.scorer.MIN_CONFIDENCE


# ── Prediction Service Integration ───────────────────────────────────
class TestPredictionService:

    def setup_method(self):
        self.svc = PredictionService()

    def test_predict_returns_expected_keys(self):
        history = make_history(n=120)
        result  = self.svc.predict("TEST", history)

        assert "predictedPrice" in result
        assert "currentPrice"   in result
        assert "trend"          in result
        assert "confidence"     in result
        assert "modelUsed"      in result
        assert "rmse"           in result

    def test_trend_is_valid(self):
        history = make_history(n=120)
        result  = self.svc.predict("TEST2", history)
        assert result["trend"] in ("bullish", "bearish", "neutral")

    def test_confidence_in_range(self):
        history = make_history(n=120)
        result  = self.svc.predict("TEST3", history)
        assert 40 <= result["confidence"] <= 95

    def test_too_few_points_raises(self):
        with pytest.raises(ValueError, match="Not enough data"):
            self.svc.predict("FAIL", make_history(n=10))