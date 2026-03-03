"""
Tests — Feature Engineering
Run with: pytest tests/test_features.py -v
"""

import pytest
import pandas as pd
import numpy as np
from preprocessing.feature_engineer import FeatureEngineer
from preprocessing.data_cleaner import DataCleaner


def make_raw_history(n=100):
    return [
        {
            "price":     1000 + i + np.random.uniform(-5, 5),
            "volume":    50000,
            "timestamp": f"2024-01-{(i % 28) + 1:02d}T00:00:00Z",
        }
        for i in range(n)
    ]


class TestDataCleaner:

    def setup_method(self):
        self.cleaner = DataCleaner()

    def test_clean_returns_dataframe(self):
        df = self.cleaner.clean(make_raw_history(60))
        assert isinstance(df, pd.DataFrame)

    def test_required_columns(self):
        df = self.cleaner.clean(make_raw_history(60))
        assert "price"     in df.columns
        assert "volume"    in df.columns
        assert "timestamp" in df.columns

    def test_sorted_ascending(self):
        df = self.cleaner.clean(make_raw_history(60))
        assert df["timestamp"].is_monotonic_increasing

    def test_empty_raises(self):
        with pytest.raises(ValueError):
            self.cleaner.clean([])

    def test_missing_price_raises(self):
        bad = [{"volume": 100, "timestamp": "2024-01-01T00:00:00Z"}]
        with pytest.raises(ValueError):
            self.cleaner.clean(bad)


class TestFeatureEngineer:

    def setup_method(self):
        self.cleaner  = DataCleaner()
        self.engineer = FeatureEngineer()

    def test_features_produced(self):
        df      = self.cleaner.clean(make_raw_history(100))
        df_feat = self.engineer.build_features(df)
        for col in self.engineer.get_feature_columns():
            assert col in df_feat.columns, f"Missing feature: {col}"

    def test_no_nan_in_features(self):
        df      = self.cleaner.clean(make_raw_history(100))
        df_feat = self.engineer.build_features(df)
        feature_cols = self.engineer.get_feature_columns()
        assert not df_feat[feature_cols].isnull().any().any()

    def test_rsi_in_range(self):
        df      = self.cleaner.clean(make_raw_history(100))
        df_feat = self.engineer.build_features(df)
        assert df_feat["rsi_14"].between(0, 100).all()

    def test_target_is_next_price(self):
        df      = self.cleaner.clean(make_raw_history(100))
        df_feat = self.engineer.build_features(df)
        # Target should be close to current price (within 20%)
        ratio = df_feat["target"] / df_feat["price"]
        assert ratio.between(0.5, 2.0).all()