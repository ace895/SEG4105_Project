"""
Handle user meal functionality
"""

from pathlib import Path

from server import SERVER_URL

def add_meal(data): return True

def edit_meal(data): return True

def get_meal_history(email, start, end):
    return {
        "2025-11-05": {
            "08:30": {
                "Oatmeal": {"calorie": 150, "protein": 5, "fat": 3, "carb": 27},
                "Banana": {"calorie": 90, "protein": 1, "fat": 0.3, "carb": 23}
            },
            "13:00": {
                "Chicken Salad": {"calorie": 320, "protein": 30, "fat": 10, "carb": 20},
                "Apple": {"calorie": 95, "protein": 0.3, "fat": 0.2, "carb": 25}
            }
        },
        "2025-11-06": {
            "09:00": {
                "Toast": {"calorie": 120, "protein": 4, "fat": 1.5, "carb": 22},
                "Egg": {"calorie": 70, "protein": 6, "fat": 5, "carb": 0.5}
            },
            "19:30": {
                "Salmon": {"calorie": 250, "protein": 22, "fat": 14, "carb": 0},
                "Rice": {"calorie": 200, "protein": 4, "fat": 0.5, "carb": 45}
            }
        }
    }

def get_meals(email, date):
    return {
        "08:30": {
            "Oatmeal": {"calorie": 150, "protein": 5, "fat": 3, "carb": 27},
            "Banana": {"calorie": 90, "protein": 1, "fat": 0.3, "carb": 23}
        },
        "13:00": {
            "Grilled Chicken": {"calorie": 280, "protein": 35, "fat": 8, "carb": 0},
            "Rice": {"calorie": 200, "protein": 4, "fat": 0.5, "carb": 45}
        },
        "19:00": {
            "Salmon": {"calorie": 250, "protein": 22, "fat": 14, "carb": 0},
            "Broccoli": {"calorie": 55, "protein": 4, "fat": 0.5, "carb": 11}
        }
    }

def get_recommendations(email):
    """
    Example food recommendations tailored to user's goal and nutrition balance.
    """
    return [
        {
            "name": "Berry & Chicken Salad",
            "description": "Assortment of berries and cooked chicken mixed with a choice of greens",
            "calorie": 260,
            "protein": 34,
            "fat": 5,
            "carb": 22,
            "type": "Salad",
            "image_url": f"{SERVER_URL}/get-image/berry_chicken_salad.jpg"
        },
        {
            "name": "Chicken and Vegetables",
            "description": "Two slices of grilled chicken with choice of vegetables and greens",
            "calorie": 320,
            "protein": 51,
            "fat": 5,
            "carb": 21,
            "type": "Protein",
            "image_url": f"{SERVER_URL}/get-image/chicken_vegetables.jpg"
        }
    ]

def get_status(email): return 0
