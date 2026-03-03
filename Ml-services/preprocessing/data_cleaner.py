"""
Data Cleaner
Normalizes and validates raw price history received from Node backend.
"""

import pandas as pd
import numpy as np
from utils.logger import get_logger

logger = get_logger(__name__)


class DataCleaner:

    def clean(self, raw_history: list) -> pd.DataFrame:
        """
        Input: list of dicts from Node backend
          [{ "price": 1200.0, "volume": 50000, "timestamp": "2024-01-01T..." }, ...]

        Returns: clean pd.DataFrame with columns [timestamp, price, volume]
        """
        if not raw_history:
            raise ValueError("Price history is empty")

        df = pd.DataFrame(raw_history)

        # ── Rename flexible keys ──────────────────────────
        df.columns = [c.lower().strip() for c in df.columns]
        if "close" in df.columns and "price" not in df.columns:
            df.rename(columns={"close": "price"}, inplace=True)

        # ── Required columns ──────────────────────────────
        required = {"price", "timestamp"}
        missing  = required - set(df.columns)
        if missing:
            raise ValueError(f"Missing columns: {missing}")

        # ── Fill missing volume ───────────────────────────
        if "volume" not in df.columns:
            logger.warning("Volume column missing — filling with 0")
            df["volume"] = 0

        # ── Types ─────────────────────────────────────────
        df["price"]     = pd.to_numeric(df["price"],  errors="coerce")
        df["volume"]    = pd.to_numeric(df["volume"], errors="coerce").fillna(0)
        df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce", utc=True)

        # ── Drop bad rows ─────────────────────────────────
        before = len(df)
        df = df.dropna(subset=["price", "timestamp"])
        dropped = before - len(df)
        if dropped:
            logger.warning(f"Dropped {dropped} rows with NaN price/timestamp")

        # ── Remove negative or zero prices ───────────────
        df = df[df["price"] > 0]

        # ── Remove duplicate timestamps ───────────────────
        df = df.drop_duplicates(subset=["timestamp"])

        # ── Sort ascending ────────────────────────────────
        df = df.sort_values("timestamp").reset_index(drop=True)

        # ── Clip extreme outliers (5× median) ─────────────
        median_price = df["price"].median()
        df = df[df["price"] <= median_price * 5]
        df = df[df["price"] >= median_price * 0.2]

        logger.debug(f"Clean data: {len(df)} rows")
        return df[["timestamp", "price", "volume"]]