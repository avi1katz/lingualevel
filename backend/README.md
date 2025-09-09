# LinguaCoach Backend API

A Python FastAPI backend for the LinguaCoach language learning assessment platform.

## Features

- **Audio Transcription**: Uses OpenAI Whisper API to convert speech to text
- **Translation**: Translates responses using GPT-4 for open-ended questions
- **AI Evaluation**: Comprehensive language assessment using GPT-4
- **RESTful API**: Clean endpoints for frontend integration
- **CORS Support**: Configured for frontend development

## Setup

1. **Install Dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenAI API key
   ```

3. **Run the Server**
   ```bash
   python main.py
   # Or with uvicorn directly:
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## API Endpoints

### `POST /assess`
Main assessment endpoint that processes audio and returns detailed evaluation.

**Parameters:**
- `audio`: Audio file (multipart/form-data)
- `challenge_id`: Unique challenge identifier
- `challenge_type`: "translation" or "open-ended"
- `prompt`: Original challenge prompt
- `target_language`: Target language for response
- `concept_id`: Language concept being tested
- `concept_name`: Human-readable concept name
- `expected_answer`: Expected answer (for translation challenges)

**Response:**
```json
{
  "challenge_id": "string",
  "transcription": "string",
  "translation": "string",
  "score": 85,
  "feedback": {
    "pronunciation": 80,
    "grammar": 90,
    "vocabulary": 85,
    "fluency": 80,
    "concept_mastery": 88,
    "overall_score": 85,
    "feedback": "Detailed feedback text",
    "strengths": ["Good grammar", "Clear pronunciation"],
    "improvements": ["Expand vocabulary", "Practice fluency"]
  },
  "timestamp": "2024-01-01T12:00:00"
}
```

### `POST /batch-assess`
Assess multiple challenges at once.

### `GET /concepts`
Get list of available language concepts.

### `GET /health`
Health check endpoint.

## Assessment Process

1. **Audio Upload**: Client uploads audio file with challenge metadata
2. **Transcription**: Whisper API converts speech to text
3. **Translation**: GPT-4 translates response (for open-ended questions)
4. **Evaluation**: GPT-4 analyzes response across multiple criteria:
   - Pronunciation accuracy
   - Grammar correctness
   - Vocabulary richness
   - Fluency and naturalness
   - Concept mastery
5. **Scoring**: Returns detailed scores and constructive feedback

## Error Handling

The API includes comprehensive error handling for:
- Invalid audio formats
- OpenAI API failures
- Transcription errors
- Evaluation failures
- File processing issues

## Development

- **Logging**: Comprehensive logging for debugging
- **CORS**: Configured for local development
- **Validation**: Pydantic models for request/response validation
- **Async**: Fully async implementation for better performance

## Deployment

The backend can be deployed to:
- **Railway**: `railway up`
- **Render**: Connect GitHub repo
- **Heroku**: Standard Python deployment
- **Docker**: Containerized deployment

## Environment Variables

- `OPENAI_API_KEY`: Required for AI functionality
- `PORT`: Server port (default: 8000)
- `HOST`: Server host (default: 0.0.0.0)
- `CORS_ORIGINS`: Allowed CORS origins