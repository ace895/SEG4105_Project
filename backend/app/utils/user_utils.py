"""
Handle user functionality
"""

def login(email, password): return True

def authenticate(email, code): return True

def signup(email, password): return True

def get_profile(email): 
    return {"name": "John", "height": 170, "weight": 70, "goal": "Muscle gain", 
            "age": 25, "allergies": "None", "notifications_on": False}

def toggle_notifications(): return True

def edit_dietary_info(data): return True

def edit_goal(data): return True