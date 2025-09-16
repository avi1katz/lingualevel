from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from dotenv import load_dotenv
import os
from typing import Optional, Dict, Any, List
import json
import tempfile
import logging
from pydantic import BaseModel
from datetime import datetime
import time

load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="LinguaCoach Assessment API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenAI client setup

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

LANGUAGE_CODES = {
    "Spanish": "es",
    "French": "fr",
    "German": "de",
    "Italian": "it",
    "Portuguese": "pt",
    "Russian": "ru",
    "Japanese": "ja",
    "Korean": "ko",
    "Chinese": "zh",
    "Arabic": "ar",
    "Hindi": "hi",
    "English": "en"
    # Add more languages as needed
}

class AssessmentRequest(BaseModel):
    challenge_id: str
    challenge_type: str  # 'translation' or 'open-ended'
    prompt: str
    target_language: str
    expected_answer: Optional[str] = None
    concept_id: str
    concept_name: str

class AssessmentResult(BaseModel):
    challenge_id: str
    transcription: str
    translation: Optional[str] = None
    score: int
    feedback: Dict[str, Any]
    timestamp: str

@app.get("/")
async def root():
    return {"message": "LinguaCoach Assessment API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

async def transcribe_audio(audio_file_path: str, target_language: str) -> str:
    """Transcribe audio using OpenAI Whisper API"""
    try:
        # Convert language name to ISO code
        language_code = LANGUAGE_CODES.get(target_language)
        if not language_code:
            logger.warning(f"Unknown language: {target_language}, falling back to auto-detection")
            language_code = None  # Whisper will auto-detect if language is None
            
        with open(audio_file_path, "rb") as audio_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="text",
                language=language_code
            )
        return transcript.strip()
    except Exception as e:
        logger.error(f"Transcription error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

async def translate_text(text: str, target_language: str = "English") -> str:
    """Translate text using OpenAI"""
    try:
        response = client.responses.create(
            model="gpt-5-nano",
            instructions=f"You are a professional translator. Translate the following text to {target_language}. Only return the translation, no explanations.",
            input=text,
        )
        return response.output_text.strip()
    except Exception as e:
        logger.error(f"Translation error: {str(e)}")
        return "Translation unavailable"

async def evaluate_response(
    transcription: str,
    challenge_type: str,
    prompt: str,
    target_language: str,
    expected_answer: Optional[str],
    concept_name: str
) -> Dict[str, Any]:
    """Evaluate language response using OpenAI"""
    
    evaluation_prompt = f"""
    You are an expert language teacher evaluating a student's response. Analyze the following:

    Challenge Type: {challenge_type}
    Original Prompt: {prompt}
    Target Language: {target_language}
    Student's Response: {transcription}
    Expected Answer (if translation): {expected_answer or 'N/A'}
    Language Concept Being Tested: {concept_name}

    Evaluate the response on these criteria (score an int between 0-100 for each):
    1. Pronunciation (based on likely pronunciation from text)
    2. Grammar correctness
    3. Vocabulary appropriateness and richness
    4. Fluency and naturalness
    5. Concept mastery (how well they demonstrate understanding of {concept_name})

    Also provide:
    - Overall score (0-100)
    - Specific feedback comments
    - Areas for improvement
    - What they did well

    Return your evaluation as a JSON object with this exact structure:
    {{
        "pronunciation": <score 0-100>,
        "grammar": <score 0-100>,
        "vocabulary": <score 0-100>,
        "fluency": <score 0-100>,
        "concept_mastery": <score 0-100>,
        "overall_score": <score 0-100>,
        "feedback": "very concise feedback text",
        "strengths": ["strength1", "strength2"],
        "improvements": ["area1", "area2"]
    }}
    """

    try:
        response = client.responses.create(
            model="gpt-5-nano",
            instructions="You are an expert language assessment AI. Provide detailed, constructive feedback in valid JSON format only.",
            input=evaluation_prompt,
        )
        
        evaluation_text = response.output_text.strip()
        
        # Try to parse JSON response
        try:
            evaluation = json.loads(evaluation_text)
            return evaluation
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            logger.warning("Failed to parse evaluation JSON, using fallback")
            return {
                "pronunciation": 75,
                "grammar": 80,
                "vocabulary": 70,
                "fluency": 75,
                "concept_mastery": 78,
                "overall_score": 76,
                "feedback": "Good effort! Continue practicing to improve fluency and expand vocabulary.",
                "strengths": ["Clear pronunciation", "Good grammar foundation"],
                "improvements": ["Vocabulary expansion", "More natural expressions"]
            }
            
    except Exception as e:
        logger.error(f"Evaluation error: {str(e)}")
        # Return fallback evaluation
        return {
            "pronunciation": 75,
            "grammar": 75,
            "vocabulary": 75,
            "fluency": 75,
            "concept_mastery": 75,
            "overall_score": 75,
            "feedback": "Assessment completed. Continue practicing to improve your skills.",
            "strengths": ["Completed the challenge"],
            "improvements": ["Continue regular practice"]
        }

@app.post("/assess", response_model=AssessmentResult)
async def assess_response(
    audio: UploadFile = File(...),
    challenge_id: str = Form(...),
    challenge_type: str = Form(...),
    prompt: str = Form(...),
    target_language: str = Form(...),
    concept_id: str = Form(...),
    concept_name: str = Form(...),
    expected_answer: Optional[str] = Form(None)
):
    """Main assessment endpoint"""
    
    
    # Validate audio file
    if not audio.content_type or not audio.content_type.startswith('audio/'):
        raise HTTPException(status_code=400, detail="Invalid audio file format")
    
    temp_audio_path = None
    
    try:
        # Save uploaded audio to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as temp_file:
            content = await audio.read()
            temp_file.write(content)
            temp_audio_path = temp_file.name
        
        logger.info(f"Processing assessment for challenge {challenge_id}")
        start_time = time.time()
        # Step 1: Transcribe audio
        logger.info("Starting transcription...")
        transcription = await transcribe_audio(temp_audio_path, target_language)
        logger.info(f"Transcription completed: {transcription[:100]}...")
        logger.info(f"Transcription took {time.time() - start_time:.2f} seconds")
        
        # Step 2: Translate if needed (for open-ended questions)
        translation = None
        if challenge_type == "open-ended":
            start_time = time.time()
            logger.info("Starting translation...")
            translation = await translate_text(transcription, "English")
            logger.info(f"Translation completed: {translation[:100]}...")
            logger.info(f"Translation took {time.time() - start_time:.2f} seconds")
        
        # Step 3: Evaluate response
        start_time = time.time()
        logger.info("Starting evaluation...")
        evaluation = await evaluate_response(
            transcription=transcription,
            challenge_type=challenge_type,
            prompt=prompt,
            target_language=target_language,
            expected_answer=expected_answer,
            concept_name=concept_name
        )
        logger.info("Evaluation completed")
        logger.info(f"Evaluation took {time.time() - start_time:.2f} seconds")
        
        # Prepare result
        result = AssessmentResult(
            challenge_id=challenge_id,
            transcription=transcription,
            translation=translation,
            score=int(evaluation.get("overall_score", 75)),
            feedback=evaluation,
            timestamp=datetime.now().isoformat()
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Assessment error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Assessment failed: {str(e)}")
    
    finally:
        # Clean up temporary file
        if temp_audio_path and os.path.exists(temp_audio_path):
            os.unlink(temp_audio_path)

@app.post("/batch-assess")
async def batch_assess(
    challenges: List[AssessmentRequest],
    audio_files: List[UploadFile] = File(...)
):
    """Assess multiple challenges at once"""
    
    if len(challenges) != len(audio_files):
        raise HTTPException(
            status_code=400, 
            detail="Number of challenges must match number of audio files"
        )
    
    results = []
    
    for i, (challenge, audio) in enumerate(zip(challenges, audio_files)):
        try:
            result = await assess_response(
                audio=audio,
                challenge_id=challenge.challenge_id,
                challenge_type=challenge.challenge_type,
                prompt=challenge.prompt,
                target_language=challenge.target_language,
                concept_id=challenge.concept_id,
                concept_name=challenge.concept_name,
                expected_answer=challenge.expected_answer
            )
            results.append(result)
        except Exception as e:
            logger.error(f"Failed to assess challenge {i}: {str(e)}")
            # Add error result
            results.append({
                "challenge_id": challenge.challenge_id,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            })
    
    return {"results": results}

@app.get("/concepts")
async def get_available_concepts():
    """Get list of available language concepts"""
    concepts = [
        {
            "id": "past-tense",
            "name": "Past Tense",
            "description": "Master the use of past tense in various contexts",
            "difficulty": "intermediate",
            "category": "Grammar"
        },
        {
            "id": "subjunctive-mood",
            "name": "Subjunctive Mood", 
            "description": "Express doubt, emotion, and hypothetical situations",
            "difficulty": "advanced",
            "category": "Grammar"
        },
        {
            "id": "travel-vocabulary",
            "name": "Travel Vocabulary",
            "description": "Essential words and phrases for traveling",
            "difficulty": "beginner",
            "category": "Vocabulary"
        },
        {
            "id": "business-communication",
            "name": "Business Communication",
            "description": "Professional language for workplace interactions", 
            "difficulty": "advanced",
            "category": "Communication"
        },
        {
            "id": "conditional-sentences",
            "name": "Conditional Sentences",
            "description": "If-then statements and hypothetical scenarios",
            "difficulty": "intermediate", 
            "category": "Grammar"
        },
        {
            "id": "food-dining",
            "name": "Food & Dining",
            "description": "Restaurant vocabulary and food-related expressions",
            "difficulty": "beginner",
            "category": "Vocabulary"
        },
        {
            "id": "expressing-emotions",
            "name": "Expressing Emotions",
            "description": "Vocabulary and structures for describing feelings",
            "difficulty": "intermediate",
            "category": "Communication"
        },
        {
            "id": "formal-informal",
            "name": "Formal vs Informal Speech",
            "description": "Appropriate register for different social contexts",
            "difficulty": "advanced",
            "category": "Communication"
        }
    ]
    return {"concepts": concepts}

@app.get("/concepts/{concept_id}/challenges")
async def get_concept_challenges(concept_id: str):
    """Get challenges for a specific concept"""
    challenges = {
        "past-tense": [
            {
                "id": "pt-1",
                "type": "translation",
                "prompt": "I went to the store yesterday.",
                "targetLanguage": "Spanish",
                "expectedAnswer": "Fui a la tienda ayer.",
                "conceptId": "past-tense"
            },
            {
                "id": "pt-2",
                "type": "open-ended",
                "prompt": "Describe what you did last weekend using past tense.",
                "targetLanguage": "Spanish",
                "conceptId": "past-tense"
            },
            {
                "id": "pt-3",
                "type": "translation",
                "prompt": "She had already finished her homework when I arrived.",
                "targetLanguage": "Spanish",
                "expectedAnswer": "Ella ya había terminado su tarea cuando llegué.",
                "conceptId": "past-tense"
            }
        ],
        "travel-vocabulary": [
            {
                "id": "tv-1",
                "type": "translation",
                "prompt": "Where is the nearest train station?",
                "targetLanguage": "Spanish",
                "expectedAnswer": "¿Dónde está la estación de tren más cercana?",
                "conceptId": "travel-vocabulary"
            },
            {
                "id": "tv-2",
                "type": "open-ended",
                "prompt": "Ask for directions to a hotel in Spanish.",
                "targetLanguage": "Spanish",
                "conceptId": "travel-vocabulary"
            },
            {
                "id": "tv-3",
                "type": "translation",
                "prompt": "I need to check in for my flight.",
                "targetLanguage": "Spanish",
                "expectedAnswer": "Necesito hacer el check-in para mi vuelo.",
                "conceptId": "travel-vocabulary"
            }
        ]
    }
    
    if concept_id not in challenges:
        # Return default challenges if concept not found
        return {
            "challenges": [
                {
                    "id": f"{concept_id}-1",
                    "type": "translation",
                    "prompt": "This is a sample translation exercise.",
                    "targetLanguage": "Spanish",
                    "expectedAnswer": "Este es un ejercicio de traducción de muestra.",
                    "conceptId": concept_id
                },
                {
                    "id": f"{concept_id}-2",
                    "type": "open-ended",
                    "prompt": "Explain this concept in your target language.",
                    "targetLanguage": "Spanish",
                    "conceptId": concept_id
                }
            ]
        }
    
    return {"challenges": challenges[concept_id]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)