"""
Trend Classifier
Classifies prediction as bullish / bearish / neutral
"""

class TrendClassifier:

    def classify(self, current_price: float, predicted_price: float) -> str:
        pct = self.pct_change(current_price, predicted_price)
        if pct > 1.0:
            return "bullish"
        elif pct < -1.0:
            return "bearish"
        else:
            return "neutral"

    def pct_change(self, current_price: float, predicted_price: float) -> float:
        if current_price <= 0:
            return 0.0
        return round(((predicted_price - current_price) / current_price) * 100, 2)
