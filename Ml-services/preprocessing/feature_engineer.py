"""
Feature Engineering — Enhanced (23 features)
  price, returns, momentum, SMAs, EMAs, MACD,
  volatility, RSI, volume, Bollinger Bands,
  52-week levels, lagged prices
"""

import pandas as pd
import numpy as np
from utils.logger import get_logger

logger = get_logger(__name__)


class FeatureEngineer:

    def build_features(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        df = df.sort_values("timestamp").reset_index(drop=True)

        # Returns & momentum
        df["daily_return"] = df["price"].pct_change() * 100
        df["momentum_5"]   = df["price"] - df["price"].shift(5)
        df["momentum_10"]  = df["price"] - df["price"].shift(10)

        # Simple moving averages
        df["sma_7"]  = df["price"].rolling(7).mean()
        df["sma_21"] = df["price"].rolling(21).mean()
        df["sma_50"] = df["price"].rolling(50).mean()

        # EMA + MACD
        df["ema_12"]      = df["price"].ewm(span=12, adjust=False).mean()
        df["ema_26"]      = df["price"].ewm(span=26, adjust=False).mean()
        df["macd"]        = df["ema_12"] - df["ema_26"]
        df["macd_signal"] = df["macd"].ewm(span=9, adjust=False).mean()

        # Volatility
        df["price_std_10"] = df["price"].rolling(10).std()
        df["price_std_20"] = df["price"].rolling(20).std()

        # RSI 14
        df["rsi_14"] = self._compute_rsi(df["price"], 14)

        # Volume
        df["volume_change"] = df["volume"].replace(0, np.nan).pct_change(fill_method=None) * 100
        df["volume_change"] = df["volume_change"].fillna(0)
        df["volume_sma_10"] = df["volume"].rolling(10).mean()
        df["volume_ratio"]  = (df["volume"] / df["volume_sma_10"].replace(0, np.nan)).fillna(1)

        # Bollinger Bands
        bb_mid   = df["price"].rolling(20).mean()
        bb_std   = df["price"].rolling(20).std()
        bb_upper = bb_mid + 2 * bb_std
        bb_lower = bb_mid - 2 * bb_std
        bw       = bb_upper - bb_lower
        df["bb_position"] = np.where(bw > 0, (df["price"] - bb_lower) / bw, 0.5)
        df["bb_width"]    = np.where(bb_mid > 0, bw / bb_mid, 0)

        # 52-week distance
        w = min(252, len(df))
        df["high_252"]      = df["price"].rolling(w, min_periods=30).max()
        df["low_252"]       = df["price"].rolling(w, min_periods=30).min()
        df["dist_52w_high"] = df["price"] / df["high_252"].replace(0, np.nan)
        df["dist_52w_low"]  = df["price"] / df["low_252"].replace(0, np.nan)

        # Lagged prices
        df["lag_1"] = df["price"].shift(1)
        df["lag_2"] = df["price"].shift(2)
        df["lag_3"] = df["price"].shift(3)

        # Target
        df["target"] = df["price"].shift(-1)

        # Clean
        df.replace([np.inf, -np.inf], np.nan, inplace=True)
        df = df.dropna().reset_index(drop=True)

        # Clip outliers
        for col in self.get_feature_columns():
            if col in df.columns and df[col].std() > 0:
                df[col] = df[col].clip(df[col].quantile(0.01), df[col].quantile(0.99))

        logger.debug(f"Features built: {len(df)} rows, {len(self.get_feature_columns())} features")
        return df

    def get_feature_columns(self):
        return [
            "price", "daily_return", "momentum_5", "momentum_10",
            "sma_7", "sma_21", "sma_50",
            "ema_12", "ema_26", "macd", "macd_signal",
            "price_std_10", "price_std_20",
            "rsi_14",
            "volume_change", "volume_ratio",
            "bb_position", "bb_width",
            "dist_52w_high", "dist_52w_low",
            "lag_1", "lag_2", "lag_3",
        ]

    @staticmethod
    def _compute_rsi(series: pd.Series, period: int = 14) -> pd.Series:
        delta    = series.diff()
        gain     = delta.clip(lower=0)
        loss     = -delta.clip(upper=0)
        avg_gain = gain.rolling(period, min_periods=period).mean()
        avg_loss = loss.rolling(period, min_periods=period).mean()
        rs       = avg_gain / avg_loss.replace(0, np.nan)
        rsi      = 100 - (100 / (1 + rs))
        return rsi.fillna(100)