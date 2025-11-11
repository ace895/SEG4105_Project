from db import get_db_connection
from datetime import datetime

def add_meal(data):
    """
    Adds a new meal and its ingredients for a user.

    Args:
        data (dict): Expected structure:
            {
                "email": "user@example.com",
                "time": "2025-11-07T08:30:00Z",
                "ingredients": {
                    "bread": {"calorie": 70, "protein": 2, "fat": 1, "carb": 15, "weight": 35}
                },
                "edited": false,
                "before_edit": {},
                "after_edit": {}
            }

    Returns:
        bool: True if successful, False otherwise.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        email = data.get("email")
        iso_time = data.get("time")
        ingredients = data.get("ingredients", {})

        #Parse ISO timestamp
        dt = datetime.fromisoformat(iso_time.replace("Z", "+00:00"))
        meal_date = dt.date().isoformat()
        meal_time = dt.time().strftime("%H:%M")

        #Insert meal entry
        cursor.execute("""
            INSERT INTO meals (user_email, meal_date, meal_time)
            VALUES (?, ?, ?)
        """, (email, meal_date, meal_time))
        meal_id = cursor.lastrowid

        #Insert each ingredient
        for name, info in ingredients.items():
            cursor.execute("""
                INSERT INTO ingredient_items (meal_id, ingredient_name, calorie, protein, fat, carb, weight)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                meal_id,
                name,
                info.get("calorie"),
                info.get("protein"),
                info.get("fat"),
                info.get("carb"),
                info.get("weight")
            ))

        conn.commit()
        conn.close()
        return True

    except Exception as e:
        print(f"[ERROR] add_meal: {e}")
        return False

def edit_meal(data):
    """
    Updates an existing meal entry for a user.

    Args:
        data (dict): Expected structure:
            {
                "email": "user@example.com",
                "date": "2025-11-07",
                "time": "08:30",
                "ingredients": {
                    "apple": {"calorie": 95, "protein": 0.3, "fat": 0.2, "carb": 25, "weight": 50}
                }
            }

    Returns:
        bool: True if successful, False otherwise.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        email = data.get("email")
        date = data.get("date")
        time = data.get("time")
        ingredients = data.get("ingredients", {})

        #Find the meal entry by user, date, and time
        cursor.execute("""
            SELECT meal_id FROM meals
            WHERE user_email = ? AND meal_date = ? AND meal_time = ?
        """, (email, date, time))
        row = cursor.fetchone()
        if not row:
            conn.close()
            return False

        meal_id = row[0]

        #Delete existing ingredients for this meal
        cursor.execute("DELETE FROM ingredient_items WHERE meal_id = ?", (meal_id,))

        #Insert updated ingredients
        for name, info in ingredients.items():
            cursor.execute("""
                INSERT INTO ingredient_items (meal_id, ingredient_name, calorie, protein, fat, carb, weight)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                meal_id,
                name,
                info.get("calorie"),
                info.get("protein"),
                info.get("fat"),
                info.get("carb"),
                info.get("weight")
            ))

        conn.commit()
        conn.close()
        return True

    except Exception as e:
        print(f"[ERROR] edit_meal: {e}")
        return False
    
def get_meals(email, date):
    """
    Retrieves all meals and their ingredients for a given user on a specific date.

    Args:
        email (str): User's email address.
        date (str): ISO format date (YYYY-MM-DD).

    Returns:
        dict: Dictionary mapping meal times to ingredients and their nutrition.
        Example:
        {
            "08:30": {
                "Oatmeal": {"calorie": 150, "protein": 5, "fat": 3, "carb": 27, "weight": 35},
                "Banana": {"calorie": 90, "protein": 1, "fat": 0.3, "carb": 23, "weight": 100}
            },
            "13:00": {
                "Chicken Salad": {"calorie": 320, "protein": 30, "fat": 10, "carb": 20, "weight": 200},
                "Apple": {"calorie": 95, "protein": 0.3, "fat": 0.2, "carb": 25, "weight": 150}
            }
        }
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    #Get all meals for the user on the specified date
    cursor.execute("""
        SELECT meal_id, meal_time
        FROM meals
        WHERE user_email = ? AND meal_date = ?
        ORDER BY meal_time
    """, (email, date))

    meals = cursor.fetchall()
    result = {}

    for meal_id, meal_time in meals:
        #Get ingredients for this meal
        cursor.execute("""
            SELECT ingredient_name, calorie, protein, fat, carb, weight
            FROM ingredient_items
            WHERE meal_id = ?
        """, (meal_id,))

        ingredients = cursor.fetchall()
        result[meal_time] = {
            name: {
                "calorie": calorie,
                "protein": protein,
                "fat": fat,
                "carb": carb,
                "weight": weight
            } for name, calorie, protein, fat, carb, weight in ingredients
        }

    conn.close()
    return result

def get_meal_history(email, start_date=None, end_date=None):
    """
    Retrieves a user's meal history within an optional date range.

    Args:
        email (str): User's email address.
        start_date (str, optional): ISO format date (YYYY-MM-DD) for the start of the range.
        end_date (str, optional): ISO format date (YYYY-MM-DD) for the end of the range.

    Returns:
        dict: Nested dictionary mapping dates → meal times → ingredients.
        Example:
        {
            "2025-11-05": {
                "08:30": { "Oatmeal": {...}, "Banana": {...} },
                "13:00": { "Chicken Salad": {...}, "Apple": {...} }
            },
            "2025-11-06": {
                "09:00": { "Toast": {...}, "Egg": {...} },
                "19:30": { "Salmon": {...}, "Rice": {...} }
            }
        }
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    #Build base query
    query = "SELECT meal_id, meal_date, meal_time FROM meals WHERE user_email = ?"
    params = [email]

    if start_date:
        query += " AND meal_date >= ?"
        params.append(start_date)
    if end_date:
        query += " AND meal_date <= ?"
        params.append(end_date)

    query += " ORDER BY meal_date, meal_time"

    cursor.execute(query, tuple(params))
    meals = cursor.fetchall()

    history = {}

    for meal_id, meal_date, meal_time in meals:
        #Fetch ingredients for this meal
        cursor.execute("""
            SELECT ingredient_name, calorie, protein, fat, carb, weight
            FROM ingredient_items
            WHERE meal_id = ?
        """, (meal_id,))
        ingredients = cursor.fetchall()

        meal_data = {
            name: {
                "calorie": calorie,
                "protein": protein,
                "fat": fat,
                "carb": carb,
                "weight": weight
            } for name, calorie, protein, fat, carb, weight in ingredients
        }

        if meal_date not in history:
            history[meal_date] = {}
        history[meal_date][meal_time] = meal_data

    conn.close()
    return history
