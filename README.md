# Personal Food Logging App

## Backend Setup

1. Add .env variables:
    - USDA_API_KEY: API key to access the USDA database
    - EMAIL: Email address to send 2FA emails
    - EMAIL_PASSWORD: The app-specific password for the above email (generated from [Google Account’s App Passwords](https://myaccount.google.com/apppasswords))
    - GOOGLE_CLIENT_ID: Client ID from Google OAuth credentials (used for Google login)
        
        To obtain it:
        1. Go to https://console.cloud.google.com/apis/credentials
        2. Create a project
        3. Navigate to the Clients tab
        4. Create a Web Application Client
        5. Add http://localhost:8080/auth/google/callback to Authorized Redirect URIs
        6. Copy the Client ID and use it for GOOGLE_CLIENT_ID

    - GOOGLE_CLIENT_SECRET: Client secret from Google OAuth credentials
       
        To obtain it:
        1. Open the Client created above. There should be a Client Secrets section
        2. Copy the Client secret and use it for GOOGLE_CLIENT_SECRET
        
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