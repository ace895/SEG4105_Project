# Personal Food Logging App

This repository contains a Flask backend and an Expo/React Native frontend for a personal food logging app.

This README explains how to run the app locally, how the backend is hosted in production, and options for running the ML model (locally or via SageMaker).

## Overview

- Backend: Flask app in `backend/` that provides API endpoints for authentication, meal processing, image uploads (S3), and user data.
- Frontend: Expo-managed React Native app in `frontend/`.
- Production hosting: Backend is deployed to AWS Elastic Beanstalk; ML models can be hosted on SageMaker endpoints (configured via `.env`).


## Requirements
- Request the team for Access to AWS SES Sandbox so your email can receive the 2FA.
Otherwise your email will not get the 2FA email. Make sure to check spam folder for 2FA email.

## Backend — Local development

1. Open a terminal and go to the backend folder:

```bash
cd backend
```

2. Create and activate a virtual environment (recommended):

```bash
python3 -m venv .venv
source .venv/bin/activate    # zsh / bash on macOS
```

3. Install Python dependencies:
ted
```bash
pip install -r requirements.txt
```


4. Start the backend server (development):

```bash
# from backend/
python -m application.py
```

The Flask app will listen on port 8080 by default (see `backend/app/server.py`).

### Running the ML model locally vs. using a stub

- The backend will try to import `app.utils.process_meal` (the real ML processor). If that import fails (missing heavy ML dependencies, model files, etc.), the server will automatically fall back to a lightweight stub implementation `app.utils.process_meal_stub` which returns mock ingredient data. This makes local development easy without needing to install large ML packages.

- To run the real ML model locally:
    1. Ensure the ML model code and dependencies are available (the repo includes `backend/app/utils/process_meal.py` if present). Install any extra ML dependencies (torch, transformers, etc.) on top of `requirements.txt` if necessary.
    2. Make sure models are downloaded or accessible by `process_meal.py` (follow any instructions inside that file for model download).
    3. Start the backend (same command as above). When `process_meal` is importable the server will print "Using local ML (CLIP + DINO models)" and will use the local model for `/process-meal-image`.

- If you don't want to run heavy models locally, you can rely on the stub (no extra work). In production, you may host ML on SageMaker and configure `SAGEMAKER_ENDPOINT_NAME` in `.env`.


## Frontend — Local development (Expo)

1. Open a terminal and go to the frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
# From frontend/
npm install
# or
npm ci
```

3. Start the Expo dev server:

```bash
npx expo start
```

4. Running the app and connecting to local backend/ML server:

- The frontend expects the ML server to be available at port 8080 (local backend). The helper `getMLServerUrl()` in `frontend/src/utils/api.ts` uses the Expo host information to make `http://<host>:8080` the ML server URL. So if you run the backend locally (on port 8080) the frontend will automatically route ML requests there.

- If the backend returns an S3 filename instead of a URL, the frontend will request images via the backend's `/get-meal-image/<filename>` endpoint (the backend proxies S3).

## Quick dev workflow (summary)

1. Start backend (with local ML or stub):

```bash
cd backend
source .venv/bin/activate
python application.py
```

2. Start frontend:

```bash
cd frontend
npm install
npx expo start
```

3. Use the app in Expo, add a meal — the frontend will POST images to the backend `/process-meal-image` route, backend returns ingredients and stores the image to S3.

## Troubleshooting

- "ML models not available" printed on server start: the backend did not find the local ML implementation. That's okay — it will use the stub. To run the real model, ensure `app/utils/process_meal.py` is present and its dependencies are installed.
- CORS issues: the backend enables CORS for all origins for development. In production lock down `ALLOWED_ORIGINS` in environment variables.
- S3 permissions errors: ensure the AWS credentials used locally have PutObject/GetObject permissions for the configured S3 bucket.

## Tests

- Frontend unit/integration tests are configured with Vitest. From the `frontend/` folder run:

```bash
npm run test
```