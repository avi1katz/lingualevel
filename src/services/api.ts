const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface AssessmentRequest {
  challengeId: string;
  challengeType: 'translation' | 'open-ended';
  prompt: string;
  targetLanguage: string;
  conceptId: string;
  conceptName: string;
  expectedAnswer?: string;
}

export interface AssessmentResponse {
  challenge_id: string;
  transcription: string;
  translation?: string;
  score: number;
  feedback: {
    pronunciation: number;
    grammar: number;
    vocabulary: number;
    fluency: number;
    concept_mastery: number;
    overall_score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
  };
  timestamp: string;
}

export class ApiService {
  private static instance: ApiService;

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  async assessResponse(
    audioBlob: Blob,
    request: AssessmentRequest
  ): Promise<AssessmentResponse> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('challenge_id', request.challengeId);
    formData.append('challenge_type', request.challengeType);
    formData.append('prompt', request.prompt);
    formData.append('target_language', request.targetLanguage);
    formData.append('concept_id', request.conceptId);
    formData.append('concept_name', request.conceptName);
    
    if (request.expectedAnswer) {
      formData.append('expected_answer', request.expectedAnswer);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/assess`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Assessment API error:', error);
      throw error;
    }
  }

  async getConcepts() {
    try {
      const response = await fetch(`${API_BASE_URL}/concepts`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get concepts API error:', error);
      throw error;
    }
  }

  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
}

export const apiService = ApiService.getInstance();