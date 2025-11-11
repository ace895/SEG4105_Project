from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

from backend.app.db.meal_db import add_meal, edit_meal, get_meal_history, get_meals
from backend.app.db.user_db import edit_dietary_info, edit_goal, get_profile, signup, toggle_notifications

from .utils.process_meal import process_image
from .utils.utils import login, authenticate, get_recommendations, get_status

app = Flask(__name__)
CORS(app)

@app.route("/", methods=["GET"])
def test():
    """
    Tests server connectivity.

    Returns:
        JSON response confirming connection.
    """
    return jsonify({"message": "Connected"}), 200

@app.route("/login", methods=["POST"])
def login_user():
    """
    Logs in a user using email and password, or via third-party sign-in.

    Request JSON:
        {
            "email": "user@example.com",
            "password": "secret123"
        }

    Returns:
        200 OK: If login and 2FA initiation are successful.
        401 Unauthorized: If credentials are invalid.
    """
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    success = login(email, password)

    if success:
        return jsonify({"success": True, "message": "2FA initiated"}), 200
    else:
        return jsonify({"success": False, "message": "Invalid credentials"}), 401

@app.route("/authenticate", methods=["POST"])
def user_authenticate():
    """
    Verifies a user's 2FA authentication code.

    Request JSON:
        {
            "email": "user@example.com",
            "verification_code": 123456
        }

    Returns:
        200 OK: If authentication is successful.
        401 Unauthorized: If verification fails.
    """
    data = request.get_json()
    email = data.get("email")
    code = data.get("verification_code")

    success = authenticate(email, code)

    if success:
        return jsonify({"success": True}), 200
    else:
        return jsonify({"success": False, "message": "Invalid verification code"}), 401

@app.route("/signup", methods=["POST"])
def user_signup():
    """
    Registers a new user or handles third-party sign-up.

    Request JSON:
        {
            "email": "user@example.com",
            "password": "secret123"
        }

    Returns:
        201 Created: If user is successfully created.
        400 Bad Request: If user already exists or input invalid.
    """
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    success = signup(email, password)

    if success:
        return jsonify({"success": True}), 201
    else:
        return jsonify({"success": False, "message": "User already exists"}), 400


@app.route("/get-profile", methods=["GET"])
def get_user_profile():
    """
    Retrieves a user's profile information.

    Query Parameters:
        email (str): User's email address.

    Returns:
        200 OK with user profile:
            {
                "name": "John", 
                "height": 170, 
                "weight": 70, 
                "goal": "Muscle gain", 
                "age": 25, 
                "allergies": "None", 
                "notifications_on": False
            }
    """
    email = request.args.get("email")

    profile = get_profile(email)
    if not profile:
        return jsonify({"error": "User not found"}), 404

    return jsonify(profile), 200

@app.route("/get-status", methods=["GET"])
def get_user_status():
    """
    Determines whether a user is on track toward their goal.

    Query Parameters:
        email (str): User's email address.

    Returns:
        JSON object with "status":
            -1 = not on track, 0 = on track, 1 = ahead.
    """
    email = request.args.get("email")

    status = get_status(email)
    return jsonify({"status": status}), 200

@app.route("/get-meal-history", methods=["GET"])
def get_user_meal_history():
    """
    Retrieves a user's meal history within an optional time frame.

    Query Parameters:
        email (str): User's email address.
        start_date (str, optional): ISO 8601 format date (YYYY-MM-DD).
        end_date (str, optional): ISO 8601 format date (YYYY-MM-DD).

    Returns:
        200 OK with dictionary mapping dates to meals:
            {
                "2025-11-05": {
                    "08:30": {
                        "Oatmeal": {"calorie": 150, "protein": 5, "fat": 3, "carb": 27, "weight": 60},
                        "Banana": {"calorie": 90, "protein": 1, "fat": 0.3, "carb": 23, "weight": 40}
                    }
                },
                "2025-11-06": {
                    "19:30": {
                        "Salmon": {"calorie": 250, "protein": 22, "fat": 14, "carb": 0, "weight": 80},
                    }
                }
            }
    """
    email = request.args.get("email")
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")

    history = get_meal_history(email, start_date, end_date)
    return jsonify(history), 200

@app.route("/get-meals", methods=["GET"])
def get_user_meal():
    """
    Retrieves a user's meal information for a specific date.

    Query Parameters:
        email (str): User's email address.
        date (str): ISO 8601 format date (YYYY-MM-DD).

    Returns:
        200 OK with meal data:
            {
                "08:30": {
                    "Oatmeal": {"calorie": 150, "protein": 5, "fat": 3, "carb": 27, "weight": 60},
                    "Banana": {"calorie": 90, "protein": 1, "fat": 0.3, "carb": 23, "weight": 40}
                },
                "13:00": {
                    "Grilled Chicken": {"calorie": 280, "protein": 35, "fat": 8, "carb": 0, "weight": 80},
                    "Rice": {"calorie": 200, "protein": 4, "fat": 0.5, "carb": 45, "weight": 70}
                }
            }
    """
    email = request.args.get("email")
    date = request.args.get("date")

    meals = get_meals(email, date)
    return jsonify(meals), 200

@app.route("/get-recommendations", methods=["GET"])
def get_user_recommendations():
    """
    Provides food recommendations based on a user's goal and current intake. To retrieve the image, 
    call fetch on the image_url

    Query Parameters:
        email (str): User's email address.

    Returns:
        200 OK with list of recommendation dictionaries:
        [
            {
                "name": "Grilled Chicken",
                "description": "High protein, low fat",
                "calorie": 250,
                "protein": 30,
                "fat": 5,
                "carb": 2,
                "type": "Protein",
                "image_url": "[SERVER URL]/get-image/berry_chicken_salad.jpg"
            }
        ]
    """
    email = request.args.get("email")

    recommendations = get_recommendations(email)
    return jsonify(recommendations), 200

@app.route("/process-meal-image", methods=["POST"])
def process_user_meal_image():
    """
    Analyzes an uploaded meal image to identify ingredients and nutrition.

    Request Form Data:
        image (file): Image of the meal.

    Returns:
        200 OK with ingredient nutritional info:
            {
                "Salmon": {"calorie": 250, "protein": 22, "fat": 14, "carb": 0, "weight": 100},
                "Broccoli": {"calorie": 55, "protein": 4, "fat": 0.5, "carb": 11, "weight": 10}
            }
    """
    image = request.files.get("image")
    image_bytes = image.read()

    ingredients = process_image(image_bytes)
    return jsonify(ingredients), 200

@app.route("/add-meal", methods=["POST"])
def add_user_meal():
    """
    Adds a meal entry for the user.

    Request JSON:
        {
            "email": "user@example.com",
            "time": "2025-11-07T08:30:00Z",  # ISO 8601 format
            "ingredients": {
                "bread": {"calorie": 70, "protein": 2, "fat": 1, "carb": 15, "weight": 10}
            },
            "edited": false,
            "before_edit": {},
            "after_edit": {}
        }

    Returns:
        201 Created: If meal successfully added.
        400 Bad Request: If input invalid.
    """
    data = request.get_json()
    success = add_meal(data)
    if success:
        return jsonify({"success": True}), 201
    return jsonify({"success": False}), 400

@app.route("/edit-meal", methods=["PUT"])
def edit_user_meal():
    """
    Updates an existing meal entry for the user.

    Request JSON:
        {
            "email": "user@example.com",
            "date": "2025-11-07",
            "time": "08:30",
            "ingredients": {
                "apple": {"calorie": 95, "protein": 0.3, "fat": 0.2, "carb": 25, "weight": 20}
            }
        }

    Returns:
        200 OK: If successful.
        404 Not Found: If meal not found.
    """
    data = request.get_json()
    success = edit_meal(data)
    if success:
        return jsonify({"success": True}), 200
    return jsonify({"success": False, "message": "Meal not found"}), 404

@app.route("/toggle-notifications", methods=["POST"])
def toggle_notifications_setting():
    """
    Toggles the user's notification preference.

    Request JSON:
        {
            "email": "user@example.com"
        }

    Returns:
        200 OK: If successful.
    """
    data = request.get_json()
    email = data.get("email")
    success = toggle_notifications(email)
    return jsonify({"success": success}), 200

@app.route("/edit-dietary-info", methods=["PUT"])
def edit_user_dietary_info():
    """
    Updates a user's dietary information.

    Request JSON:
        {
            "email": "user@example.com",
            "height": 170,
            "weight": 70.5,
            "age": 25,
            "allergies": "Peanuts"
        }

    Returns:
        200 OK: If successful.
    """
    data = request.get_json()
    success = edit_dietary_info(data)
    return jsonify({"success": success}), 200

@app.route("/edit-goal", methods=["PUT"])
def edit_user_goal():
    """
    Updates the user's fitness or dietary goal.

    Request JSON:
        {
            "email": "user@example.com",
            "goal": "Muscle gain"
        }

    Returns:
        200 OK: If successful.
    """
    data = request.get_json()
    email = data.get("email")
    goal = data.get("goal")
    success = edit_goal(email, goal)
    return jsonify({"success": success}), 200

IMAGE_FOLDER = Path.cwd() / "app" / "static" / "images"
@app.route("/get-image/<filename>")
def get_image(filename):
    """
    Send an image from the image folder
    """
    return send_from_directory(IMAGE_FOLDER, filename)

SERVER_URL = "http://127.0.0.1:8080"
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
