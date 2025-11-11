from datetime import date
from email.mime.text import MIMEText
import os
import random
import smtplib
from dotenv import load_dotenv

from backend.app.db.meal_db import get_meals
from backend.app.db.user_db import get_profile, login as login_db
from backend.app.server import SERVER_URL

#Store 2FA codes
codes = {}
load_dotenv()

def login(email, password): 
    """
    Verifies the user's email and password and initiates 2FA

    Returns:
        (bool): True if successful, False otherwise
    """

    #Check user credentials
    if not login_db(email, password):
        return False

    #Generate 2FA code
    code = random.randint(100000, 999999)
    codes[email] = code

    #Send email with code
    sender = os.getenv("EMAIL")
    password = os.getenv("EMAIL_PASSWORD")
    msg = MIMEText(f"Your verification code is: {code}")
    msg["Subject"] = "2FA Verification Code"
    msg["From"] = sender
    msg["To"] = email

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(sender, password)
        server.send_message(msg)

    return True

def authenticate(email, code): 
    """
    Authenticate user's verification code

    Returns:
        (bool): True if code is correct, False otherwise
    """
    if code == codes[email]:
        del codes[email]
        return True
    return False

def calculate_nutrition_targets(weight_kg, height_cm, age, goal="weight loss", activity_level=1.55):
    """
    Calculates recommended daily calories and macronutrients using weight, height, age, and goal.
    Uses the Mifflin-St Jeor equation averaged for male/female to avoid needing sex.
    
    Args:
        weight_kg (float): User weight in kg
        height_cm (float): User height in cm
        age (int): User age in years
        goal (str): "weight loss" or "muscle gain"
        activity_level (float): TDEE multiplier, default 1.55 (moderate activity)
    
    Returns:
        dict: {
            "calorie": int,
            "protein": float (grams),
            "fat": float (grams),
            "carb": float (grams)
        }
    """
    #Calculate BMR using Mifflin-St Jeor, average for male/female
    bmr_male = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    bmr_female = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
    bmr_avg = (bmr_male + bmr_female) / 2

    #Total daily energy expenditure
    tdee = bmr_avg * activity_level

    #Adjust calories based on goal
    if goal.lower() == "weight loss":
        calories = tdee * 0.8
        protein = weight_kg * 1.6
    elif goal.lower() == "muscle gain":
        calories = tdee * 1.15
        protein = weight_kg * 2.0
    else:
        calories = tdee
        protein = weight_kg * 1.5

    #Fat intake: ~27% of calories
    fat = (0.27 * calories) / 9

    #Carbs: remaining calories
    carb = (calories - (protein * 4 + fat * 9)) / 4

    return {
        "calorie": round(calories),
        "protein": round(protein, 1),
        "fat": round(fat, 1),
        "carb": round(carb, 1)
    }


def get_status(email):
    """
    Determines whether the user is on track with their goal for today.

    Args:
        email (str): User's email address

    Returns:
        int: -1 = not on track, 0 = on track, 1 = ahead
    """
    #Get user profile for weight, height, age, and goal
    profile = get_profile(email)
    if not profile:
        return 0  #fallback if no profile

    goal = profile.get("goal", "").lower()
    weight = profile.get("weight")
    height = profile.get("height")
    age = profile.get("age")

    #Today's meals
    today_meals = get_meals(email, date.today().isoformat())

    #Sum totals for today
    total_calorie = total_protein = total_fat = total_carb = 0
    for meal_time, ingredients in today_meals.items():
        for ing_name, info in ingredients.items():
            total_calorie += info.get("calorie", 0)
            total_protein += info.get("protein", 0)
            total_fat += info.get("fat", 0)
            total_carb += info.get("carb", 0)

    #Get recommended targets
    targets = calculate_nutrition_targets(weight, height, age, goal)
    rec_cal = targets["calorie"]
    rec_protein = targets["protein"]
    rec_fat = targets["fat"]
    rec_carb = targets["carb"]

    #Set thresholds
    cal_lower = rec_cal * 0.9
    cal_upper = rec_cal * 1.1
    protein_lower = rec_protein * 0.9
    protein_upper = rec_protein * 1.1
    fat_lower = rec_fat * 0.9
    fat_upper = rec_fat * 1.1
    carb_lower = rec_carb * 0.9
    carb_upper = rec_carb * 1.1

    #Determine status based on goal
    if goal == "weight loss":
        #Eating less than target is ahead, more is behind
        if total_calorie < cal_lower and total_fat < fat_lower:
            return 1
        elif total_calorie > cal_upper or total_fat > fat_upper or total_carb > carb_upper:
            return -1
        else:
            return 0
    elif goal == "muscle gain":
        #Eating more calories & protein is ahead, less is behind
        if total_calorie > cal_upper and total_protein > protein_upper:
            return 1
        elif total_calorie < cal_lower or total_protein < protein_lower:
            return -1
        else:
            return 0
    else:
        return 0  #fallback if other goal or no goal was given

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
            "image_url": f"{SERVER_URL}/get-image/berry_chicken_salad.jpg",
            "recipe_url": "https://ourbestbites.com/grilled-chicken-berry-salad/"
        },
        {
            "name": "Chicken and Vegetables",
            "description": "Two slices of grilled chicken with choice of vegetables and greens",
            "calorie": 320,
            "protein": 51,
            "fat": 5,
            "carb": 21,
            "type": "Protein",
            "image_url": f"{SERVER_URL}/get-image/chicken_vegetables.jpg",
            "recipe_url": "https://simply-delicious-food.com/30-minute-easy-grilled-chicken-and-vegetables/"
        }
    ]