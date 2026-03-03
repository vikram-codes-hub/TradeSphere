"""
Request Validators
Returns error string if invalid, None if valid.
"""


def validate_predict_payload(body: dict | None) -> str | None:
    if not body:
        return "Request body is required"

    if "symbol" not in body:
        return "Field 'symbol' is required"

    if not isinstance(body["symbol"], str) or not body["symbol"].strip():
        return "Field 'symbol' must be a non-empty string"

    if "priceHistory" not in body:
        return "Field 'priceHistory' is required"

    if not isinstance(body["priceHistory"], list):
        return "Field 'priceHistory' must be an array"

    if len(body["priceHistory"]) < 30:
        return f"priceHistory must have at least 30 entries, got {len(body['priceHistory'])}"

    # Spot-check first entry
    sample = body["priceHistory"][0]
    if not isinstance(sample, dict):
        return "Each priceHistory entry must be an object"

    if "price" not in sample and "close" not in sample:
        return "Each priceHistory entry must have a 'price' or 'close' field"

    if "timestamp" not in sample:
        return "Each priceHistory entry must have a 'timestamp' field"

    return None  # valid