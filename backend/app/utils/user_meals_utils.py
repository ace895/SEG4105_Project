"""
Handle user meal functionality
"""

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
            "name": "Greek Yogurt with Berries",
            "description": "High-protein, antioxidant-rich snack.",
            "calorie": 180,
            "protein": 15,
            "fat": 4,
            "carb": 22,
            "type": "Snack",
            "image": "https://example.com/images/yogurt.jpg"
        },
        {
            "name": "Grilled Salmon with Quinoa",
            "description": "Balanced meal for muscle recovery.",
            "calorie": 450,
            "protein": 40,
            "fat": 15,
            "carb": 35,
            "type": "Dinner",
            "image": "https://example.com/images/salmon.jpg"
        },
        {
            "name": "Veggie Omelette",
            "description": "Low-carb, protein-rich breakfast option.",
            "calorie": 220,
            "protein": 20,
            "fat": 10,
            "carb": 6,
            "type": "Breakfast",
            "image": "https://example.com/images/omelette.jpg"
        }
    ]

def get_status(email): return 0
