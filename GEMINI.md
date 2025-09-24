# LinguaLeveL

This is a language learning assessment platform that uses AI to evaluate users' spoken language skills.

## Project Overview

The project is a monorepo with a React frontend and a Python backend.

*   **Frontend:** A Vite-based React application written in TypeScript and styled with Tailwind CSS. It provides the user interface for selecting language concepts, recording audio responses, and viewing detailed assessment results.
*   **Backend:** A FastAPI application that handles the core logic. It uses the OpenAI API (including Whisper) to transcribe user audio, translate it if necessary, and provide a comprehensive evaluation of pronunciation, grammar, vocabulary, and fluency.

## Building and Running

### Frontend

To run the frontend development server:

```bash
npm install
npm run dev
```

To build the frontend for production:

```bash
npm run build
```

### Backend

To run the backend server:

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your OpenAI API key
uvicorn main:app --reload
```

## Development Conventions

*   The frontend uses an `ApiService` class to interact with the backend API.
*   The backend uses Pydantic models for data validation.
*   The project uses `eslint` for linting the frontend code.
