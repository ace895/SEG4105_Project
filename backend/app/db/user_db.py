import hashlib

from app.db.db import get_db_connection


def signup(email, password):
    """
    Registers a new user if they do not already exist.

    Args:
        email (str): User's email.
        password (str): Plaintext password (will be hashed).

    Returns:
        bool: True if user created successfully, False if already exists.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if user already exists
    cursor.execute("SELECT 1 FROM users WHERE email = %s", (email,))
    if cursor.fetchone():
        conn.close()
        return False

    # Hash password before saving
    hashed_pw = hashlib.sha256(password.encode()).hexdigest()

    # Insert new user
    cursor.execute(
        """
        INSERT INTO users (email, password, name, height, weight, goal, age, allergies, notifications_on)
        VALUES (%s, %s, '', NULL, NULL, NULL, NULL, NULL, TRUE)
        """,
        (email, hashed_pw),
    )

    conn.commit()
    conn.close()
    return True


def login(email, password):
    """
    Authenticates a user by verifying their email and password.

    Args:
        email (str): User's email address.
        password (str): Plaintext password to verify.

    Returns:
        bool: True if credentials are valid, False otherwise.
    """
    if not email or not password:
        return False

    conn = get_db_connection()
    cursor = conn.cursor()

    hashed_pw = hashlib.sha256(password.encode()).hexdigest()

    cursor.execute("SELECT password FROM users WHERE email = %s", (email,))
    row = cursor.fetchone()

    conn.close()

    if row and row["password"] == hashed_pw:
        return True
    return False


def get_profile(email):
    """
    Retrieves a user's profile information.

    Args:
        email (str): User's email address.

    Returns:
        dict | None: Dictionary containing user profile info if found,
                     or None if user does not exist.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT name, height, weight, goal, age, allergies, notifications_on
        FROM users
        WHERE email = %s
    """,
        (email,),
    )

    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    # Convert to dictionary for JSON response (row is already a dict with RealDictCursor)
    return {
        "name": row["name"],
        "height": row["height"],
        "weight": row["weight"],
        "goal": row["goal"],
        "age": row["age"],
        "allergies": row["allergies"],
        "notifications_on": bool(row["notifications_on"]),
    }


def toggle_notifications(email):
    """
    Toggles a user's notification preference.

    Args:
        email (str): User's email address.

    Returns:
        bool: True if the operation was successful, False otherwise.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Get current value
        cursor.execute("SELECT notifications_on FROM users WHERE email = %s", (email,))
        row = cursor.fetchone()
        if not row:
            conn.close()
            return False

        current = row["notifications_on"]
        # Toggle the boolean value
        new_value = not current

        cursor.execute(
            "UPDATE users SET notifications_on = %s WHERE email = %s",
            (new_value, email),
        )
        conn.commit()
        conn.close()
        return True

    except Exception as e:
        print(f"[ERROR] toggle_notifications: {e}")
        return False


def edit_dietary_info(data):
    """
    Updates a user's dietary information.

    Args:
        data (dict): Expected structure:
            {
                "email": "user@example.com",
                "height": 170,
                "weight": 70.5,
                "age": 25,
                "allergies": "Peanuts"
            }

    Returns:
        bool: True if update was successful, False otherwise.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        email = data.get("email")
        if not email:
            return False

        updates = []
        values = []

        for field in ["height", "weight", "age", "allergies"]:
            if field in data:
                updates.append(f"{field} = %s")
                values.append(data[field])

        if not updates:
            conn.close()
            return False  # Nothing to update

        values.append(email)
        cursor.execute(
            f"UPDATE users SET {', '.join(updates)} WHERE email = %s", tuple(values)
        )
        conn.commit()
        conn.close()
        return True

    except Exception as e:
        print(f"[ERROR] edit_dietary_info: {e}")
        return False


def edit_goal(email, goal):
    """
    Updates the user's fitness or dietary goal.

    Args:
        email (str): User's email address.
        goal (str): The new goal (e.g., 'Muscle gain').

    Returns:
        bool: True if update was successful, False otherwise.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("UPDATE users SET goal = %s WHERE email = %s", (goal, email))
        conn.commit()
        conn.close()
        return True

    except Exception as e:
        print(f"[ERROR] edit_goal: {e}")
        return False


def get_goal(email):
    """
    Retrieves the user's goal from the database.

    Args:
        email (str): User email

    Returns:
        str: Goal string (e.g., "Weight loss", "Muscle gain") or None
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT goal FROM users WHERE email = %s", (email,))
        row = cursor.fetchone()
        conn.close()
        if row:
            return row["goal"]
        return None
    except Exception as e:
        print(f"[ERROR] get_goal: {e}")
        return None
