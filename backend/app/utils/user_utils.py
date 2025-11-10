"""
Handle user functionality
"""

from email.mime.text import MIMEText
import os
import random
import smtplib
from dotenv import load_dotenv

#Store 2FA codes
codes = {}
load_dotenv()

def login(email, password): 
    """
    Verifies the user's email and password and initiates 2FA

    Returns:
        (bool): True if successful, False otherwise
    """

    #TODO verify email and password 

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

def signup(email, password): return True

def get_profile(email): 
    return {"name": "John", "height": 170, "weight": 70, "goal": "Muscle gain", 
            "age": 25, "allergies": "None", "notifications_on": False}

def toggle_notifications(): return True

def edit_dietary_info(data): return True

def edit_goal(data): return True