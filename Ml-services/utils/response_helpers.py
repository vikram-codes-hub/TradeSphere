"""
Response Helpers
Consistent JSON response shapes across all routes.
"""

from flask import jsonify


def success(data: dict | list, status: int = 200):
    return jsonify({"success": True, "data": data}), status


def error(message: str, status: int = 400):
    return jsonify({"success": False, "error": message}), status