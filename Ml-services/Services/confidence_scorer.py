"""
Confidence Scorer
Converts RMSE into a human-readable confidence percentage.

Formula:
  raw        = 100 - (rmse / current_price * 100 * 10)
  confidence = clamp(raw, 40, 95)

Why clamp to 40–95?
  - Never show 0% (scary UX, ML always has some signal)
  - Never show 100% (dishonest — no model is perfect)
"""


class ConfidenceScorer:

    MIN_CONFIDENCE = 40.0
    MAX_CONFIDENCE = 95.0

    def score(self, rmse: float, current_price: float) -> float:
        """
        Returns confidence as a float between 40.0 and 95.0
        """
        if current_price <= 0 or rmse < 0:
            return self.MIN_CONFIDENCE

        # Normalise error as percentage of current price
        error_pct = (rmse / current_price) * 100

        # Scale: 1% error → 90 confidence, 5% error → 50 confidence
        raw = 100 - (error_pct * 10)

        confidence = max(self.MIN_CONFIDENCE, min(self.MAX_CONFIDENCE, raw))
        return round(confidence, 1)