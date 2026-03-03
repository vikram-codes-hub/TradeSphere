"""
Logger
Centralised logging setup for TradeSphere ML service.
"""

import logging
import os
import sys


def get_logger(name: str) -> logging.Logger:
    logger  = logging.getLogger(name)

    if logger.handlers:
        return logger  # already configured

    level = logging.DEBUG if os.getenv("FLASK_DEBUG", "false").lower() == "true" else logging.INFO
    logger.setLevel(level)

    handler   = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter(
        fmt="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)

    return logger