# Personal Food Logging App

## Backend Setup

1. Add .env variables:
    - USDA_API_KEY: API key to access the USDA database
    - EMAIL: Email address to send 2FA emails
    - EMAIL_PASSWORD: The app-specific password for the above email (generated from Google Account’s App Passwords page)

2. Install all dependencies: `pip install -r requirements.txt`

3. Navigate to the backend folder: `cd backend`

4. Run the server: `python -m app.server`
