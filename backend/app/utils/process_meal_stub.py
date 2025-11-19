"""
Stub ML implementation for AWS deployment
Returns mock ingredient data since ML models are too large for t3.small
"""


def process_image(image_bytes):
    """
    Stub function that returns mock ingredient data

    Args:
        image_bytes: Raw image bytes (not used)

    Returns:
        dict: Mock ingredient data
    """
    print("⚠️  Using stub ML (AWS deployment - ML models not available)")

    return {
        "chicken": {
            "calorie": 165,
            "protein": 31,
            "carb": 0,
            "fat": 3.6,
            "weight": 100.0,
        },
        "rice": {
            "calorie": 130,
            "protein": 2.7,
            "carb": 28,
            "fat": 0.3,
            "weight": 100.0,
        },
        "broccoli": {
            "calorie": 34,
            "protein": 2.8,
            "carb": 7,
            "fat": 0.4,
            "weight": 100.0,
        },
    }
