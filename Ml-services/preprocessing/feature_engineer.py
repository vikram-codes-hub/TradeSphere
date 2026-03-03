"""
Feature Engineering
Converts raw price/volume history into ML-ready features.

Features computed:
  - sma_7        : 7-day Simple Moving Average
  - sma_21       : 21-day Simple Moving Average
  - rsi_14       : 14-day Relative Strength Index
  - volume_change: % change in volume vs previous day
  - momentum_5   : price today - price 5 days ago
  - daily_return : % daily price change
  - bb_position  : Bollinger Band position (0=lower band, 1=upper band)
  - price_std_10 : 10-day rolling standard deviation (volatility proxy)
"""

import pandas as pd
import numpy as np
from utils.logger import get_logger

logger = get_logger(__name__)


class FeatureEngineer:

    def build_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Input df must have columns: price, volume, timestamp
        Returns df with all feature columns added, NaN rows dropped.
        """
        df = df.copy()
        df = df.sort_values("timestamp").reset_index(drop=True)

        # ── Basic returns ─────────────────────────────────
        df["daily_return"]  = df["price"].pct_change() * 100
        df["momentum_5"]    = df["price"] - df["price"].shift(5)

        # ── Moving averages ───────────────────────────────
        df["sma_7"]  = df["price"].rolling(window=7).mean()
        df["sma_21"] = df["price"].rolling(window=21).mean()

        # ── Volatility ────────────────────────────────────
        df["price_std_10"] = df["price"].rolling(window=10).std()

        # ── RSI 14 ────────────────────────────────────────
        df["rsi_14"] = self._compute_rsi(df["price"], period=14)

        # ── Volume change % ───────────────────────────────
        df["volume_change"] = df["volume"].pct_change() * 100

        # ── Bollinger Bands ───────────────────────────────
        bb_mid              = df["price"].rolling(window=20).mean()
        bb_std              = df["price"].rolling(window=20).std()
        bb_upper            = bb_mid + 2 * bb_std
        bb_lower            = bb_mid - 2 * bb_std
        band_width          = bb_upper - bb_lower
        # position: 0 = at lower band, 1 = at upper band
        df["bb_position"]   = (df["price"] - bb_lower) / band_width.replace(0, np.nan)

        # ── Target: next day's price ──────────────────────
        df["target"] = df["price"].shift(-1)

        # ── Drop rows with NaN (from rolling windows) ─────
        df = df.dropna().reset_index(drop=True)

        logger.debug(f"Features built: {len(df)} rows, {len(df.columns)} columns")
        return df

    # ─────────────────────────────────────────────────────
    def get_feature_columns(self):
        return [
            "price",
            "daily_return",
            "momentum_5",
            "sma_7",
            "sma_21",
            "price_std_10",
            "rsi_14",
            "volume_change",
            "bb_position",
        ]

    # ─────────────────────────────────────────────────────
    @staticmethod
    def _compute_rsi(series: pd.Series, period: int = 14) -> pd.Series:
        delta = series.diff()
        gain  = delta.clip(lower=0)
        loss  = -delta.clip(upper=0)

        avg_gain = gain.rolling(window=period, min_periods=period).mean()
        avg_loss = loss.rolling(window=period, min_periods=period).mean()

        rs  = avg_gain / avg_loss.replace(0, np.nan)
        rsi = 100 - (100 / (1 + rs))
        return rsi