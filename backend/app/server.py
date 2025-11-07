from flask import Flask, request, jsonify
from flask_cors import CORS

from backend.app.utils.process_meal import process_image
from backend.app.utils.user_meals_utils import edit_dietary_info, edit_goal, get_meal_history, get_meals, get_status, add_meal, edit_meal
from backend.app.utils.user_utils import authenticate, get_profile, get_recommendations, login, signup, toggle_notifications

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
            "verification_code": "123456"
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


@app.route("/get_profile", methods=["GET"])
def get_user_profile():
    """
    Retrieves a user's profile information.

    Query Parameters:
        email (str): User's email address.

    Returns:
        200 OK with user profile.
    """
    email = request.args.get("email")

    profile = get_profile(email)
    if not profile:
        return jsonify({"error": "User not found"}), 404

    return jsonify(profile), 200

@app.route("/get_status", methods=["GET"])
def get_user_status():
    """
    Determines whether a user is on track toward their goal.

    Query Parameters:
        email (str): User's email address.

    Returns:
        JSON object with "status":
            -1 = not on track, 0 = on track, 2 = ahead.
    """
    email = request.args.get("email")

    status = get_status(email)
    return jsonify({"status": status}), 200

@app.route("/get_meal_history", methods=["GET"])
def get_user_meal_history():
    """
    Retrieves a user's meal history within an optional time frame.

    Query Parameters:
        email (str): User's email address.
        start_date (str, optional): ISO 8601 format date (YYYY-MM-DD).
        end_date (str, optional): ISO 8601 format date (YYYY-MM-DD).

    Returns:
        200 OK with dictionary mapping dates to meals.
    """
    email = request.args.get("email")
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")

    history = get_meal_history(email, start_date, end_date)
    return jsonify(history), 200

@app.route("/get_meals", methods=["GET"])
def get_user_meal():
    """
    Retrieves a user's meal information for a specific date.

    Query Parameters:
        email (str): User's email address.
        date (str): ISO 8601 format date (YYYY-MM-DD).

    Returns:
        200 OK with meal data.
    """
    email = request.args.get("email")
    date = request.args.get("date")

    meals = get_meals(email, date)
    return jsonify(meals), 200

@app.route("/get_recommendations", methods=["GET"])
def get_user_recommendations():
    """
    Provides food recommendations based on a user's goal and current intake.

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
                "type": "Lunch",
                "image": "https://example.com/chicken.jpg"
            }
        ]
    """
    email = request.args.get("email")

    recommendations = get_recommendations(email)
    return jsonify(recommendations), 200

@app.route("/process_meal_image", methods=["POST"])
def process_user_meal_image():
    """
    Analyzes an uploaded meal image to identify ingredients and nutrition.

    Request Form Data:
        image (file): Image of the meal.

    Returns:
        200 OK with ingredient nutritional info.
    """
    image = request.files.get("image")

    ingredients = process_image(image)
    return jsonify(ingredients), 200

@app.route("/add_meal", methods=["POST"])
def add_user_meal():
    """
    Adds a meal entry for the user.

    Request JSON:
        {
            "email": "user@example.com",
            "time": "2025-11-07T08:30:00Z",  # ISO 8601 format
            "ingredients": {
                "bread": {"calorie": 70, "protein": 2, "fat": 1, "carb": 15}
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

@app.route("/edit_meal", methods=["PUT"])
def edit_user_meal():
    """
    Updates an existing meal entry for the user.

    Request JSON:
        {
            "email": "user@example.com",
            "date": "2025-11-07",
            "time": "08:30",
            "ingredients": {
                "apple": {"calorie": 95, "protein": 0.3, "fat": 0.2, "carb": 25}
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

@app.route("/toggle_notifications", methods=["POST"])
def toggle_notifications_setting():
    """
    Toggles the user's notification preference.

    Request JSON:
        {
            "email": "user@example.com",
            "notifications_on": true
        }

    Returns:
        200 OK: If successful.
    """
    data = request.get_json()
    success = toggle_notifications(data)
    return jsonify({"success": success}), 200

@app.route("/edit_dietary_info", methods=["PUT"])
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

@app.route("/edit_goal", methods=["PUT"])
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
    success = edit_goal(data)
    return jsonify({"success": success}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
