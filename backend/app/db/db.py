import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")


def get_db_connection():
    """
    Returns a connection object to the PostgreSQL database.

    Returns:
        psycopg2.Connection: A connection to the database.
    """
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    return conn


def initialize_database():
    """
    Creates the necessary tables for the application if they do not exist.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # Execute CREATE TABLE statements (PostgreSQL syntax)
    cursor.execute(
        """
    CREATE TABLE IF NOT EXISTS users (
        email TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        height REAL,
        weight REAL,
        goal TEXT,
        age INTEGER,
        allergies TEXT,
        notifications_on BOOLEAN DEFAULT true
    );
    """
    )

    cursor.execute(
        """
    CREATE TABLE IF NOT EXISTS meals (
        meal_id SERIAL PRIMARY KEY,
        user_email TEXT NOT NULL,
        meal_date DATE NOT NULL,
        meal_time TIME NOT NULL,
        image_url TEXT,
        FOREIGN KEY (user_email) REFERENCES users(email)
            ON DELETE CASCADE
    );
    """
    )

    # Add image_url column if it doesn't exist (for existing databases)
    cursor.execute(
        """
    DO $$ 
    BEGIN 
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name='meals' AND column_name='image_url'
        ) THEN
            ALTER TABLE meals ADD COLUMN image_url TEXT;
        END IF;
    END $$;
    """
    )

    cursor.execute(
        """
    CREATE TABLE IF NOT EXISTS ingredient_items (
        ingredient_id SERIAL PRIMARY KEY,
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
    """
    )

    conn.commit()
    conn.close()


# Initialize database (skip if connection fails for local development)
try:
    initialize_database()
except Exception as e:
    print(f"⚠️  Database initialization skipped: {e}")
    print("⚠️  Server will start but database operations may fail")
