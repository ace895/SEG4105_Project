import sqlite3

DB_NAME = "food_logger.db"

def get_db_connection():
    """
    Returns a connection object to the SQLite database.

    Returns:
        sqlite3.Connection: A connection to the database.
    """
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def initialize_database():
    """
    Creates the necessary tables for the application if they do not exist.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    #Execute CREATE TABLE statements
    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        email TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        height REAL,
        weight REAL,
        goal TEXT,
        age INTEGER,
        allergies TEXT,
        notifications_on BOOLEAN DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS meals (
        meal_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_email TEXT NOT NULL,
        meal_date DATE NOT NULL,
        meal_time TIME NOT NULL,
        FOREIGN KEY (user_email) REFERENCES users(email)
            ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ingredient_items (
        ingredient_id INTEGER PRIMARY KEY AUTOINCREMENT,
        meal_id INTEGER NOT NULL,
        ingredient_name TEXT NOT NULL,
        calorie REAL,
        protein REAL,
        fat REAL,
        carb REAL,
        weight REAL,
        FOREIGN KEY (meal_id) REFERENCES meals(meal_id)
            ON DELETE CASCADE
    );
    """)

    conn.commit()
    conn.close()

initialize_database()
