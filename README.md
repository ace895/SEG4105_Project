# Personal Food Logging App

## Backend Setup

1. Add .env variables:
    - USDA_API_KEY: API key to access the USDA database
    - EMAIL: Email address to send 2FA emails
    - EMAIL_PASSWORD: The app-specific password for the above email (generated from Google Account’s App Passwords page)
    - GOOGLE_CLIENT_ID: Client ID from Google OAuth credentials (used for Google login)
    - GOOGLE_CLIENT_SECRET: Client secret from Google OAuth credentials
    - SECRET_KEY: (optional) Flask secret key for sessions and cookies

2. Install all dependencies: `pip install -r requirements.txt`

3. Navigate to the backend folder: `cd backend`

4. Run the server: `python -m app.server`

## Frontend Setup

1. Navigate to the frontend folder: `cd frontend`

2. Install all packages: `npm install`

3. Run the application: `npx expo start`

    i. To open on web, press w

    ii. To open on a phone, scan the QR code with Expo Go (Android) or the Camera app (iOS)