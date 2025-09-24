import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mic, MicOff, Play, Pause, RotateCcw, Send, Volume2, CheckCircle, AlertCircle } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { LanguageConcept, Challenge, AssessmentResult } from '../App';
import { apiService, AssessmentRequest } from '../services/api';
import { useRecorder } from '../hooks/useRecorder';

const AssessmentScreen: React.FC = () => {
  const navigate = useNavigate();
  const { conceptId } = useParams<{ conceptId: string }>();
  const location = useLocation();
  const concept = location.state?.concept as LanguageConcept;

  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [responses, setResponses] = useState<Array<{ challengeId: string; audioBlob: Blob | null; transcription: string, apiResult: any }>>([]);

  const { data: challenges, isLoading: isLoadingChallenges, error: challengesError } = useQuery<Challenge[], Error>({
    queryKey: ['challenges', conceptId],
    queryFn: async () => {
      const response = await apiService.getChallenges(conceptId!);
      return response.challenges || [];
    },
    enabled: !!conceptId,
  });

  const { mutate: submitAssessment, isPending: isSubmitting } = useMutation({
    mutationFn: ({ audioBlob, assessmentRequest }: { audioBlob: Blob, assessmentRequest: AssessmentRequest }) => 
      apiService.assessResponse(audioBlob, assessmentRequest),
    onSuccess: (result) => {
      const newResponse = {
        challengeId: currentChallenge.id,
        audioBlob,
        transcription: result.transcription,
        apiResult: result
      };

      const allResponses = [...responses, newResponse];
      setResponses(allResponses);

      if (isLastChallenge) {
        const avgScore = allResponses.reduce((sum, resp) => 
          sum + (resp.apiResult?.score || 0), 0) / allResponses.length;

        const assessmentResult: AssessmentResult = {
          conceptMastery: Math.round(avgScore),
          overallScores: {
            grammar: result.feedback.grammar,
            pronunciation: result.feedback.pronunciation,
            vocabulary: result.feedback.vocabulary,
            fluency: result.feedback.fluency
          },
          feedback: result.feedback.feedback,
          challengeResults: allResponses.map((response) => ({
            challengeId: response.challengeId,
            userResponse: 'Audio response',
            transcription: response.transcription,
            score: response.apiResult?.score || 0,
            feedback: response.apiResult?.feedback.feedback || 'Assessment completed.'
          }))
        };

        navigate('/results', { state: { result: assessmentResult, concept } });
      } else {
        setCurrentChallengeIndex(prev => prev + 1);
        resetRecording();
      }
    },
    onError: (error) => {
      console.error('Assessment failed:', error);
      // Here you would ideally show a toast notification
      alert('Assessment failed. Please try again.');
    },
  });

  const {
    isRecording,
    audioBlob,
    audioURL,
    recordingTime,
    isPlaying,
    audioRef,
    startRecording,
    stopRecording,
    resetRecording,
    playAudio,
  } = useRecorder(30); // 30 seconds max per recording

  if (!concept) {
    // Handle case where user navigates directly to this page without concept state
    // You might want to redirect them back to the concept selector
    useEffect(() => {
      navigate('/');
    }, [navigate]);
    return null;
  }

  const currentChallenge = challenges?.[currentChallengeIndex];
  const isLastChallenge = currentChallengeIndex === (challenges?.length ?? 0) - 1;

  const handleSubmitResponse = () => {
    if (!audioBlob || !currentChallenge) return;

    const assessmentRequest: AssessmentRequest = {
      challengeId: currentChallenge.id,
      challengeType: currentChallenge.type,
      prompt: currentChallenge.prompt,
      targetLanguage: currentChallenge.targetLanguage,
      conceptId: currentChallenge.conceptId,
      conceptName: concept.name,
      expectedAnswer: currentChallenge.expectedAnswer
    };

    submitAssessment({ audioBlob, assessmentRequest });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const speakPrompt = () => {
    if ('speechSynthesis' in window && currentChallenge) {
      const utterance = new SpeechSynthesisUtterance(currentChallenge.prompt);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  if (isLoadingChallenges) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (challengesError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 bg-red-50 rounded-lg">
          <p className="text-red-600">{challengesError.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-blue-100 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <div className="flex items-center space-x-4">
                <div className="text-sm bg-white/20 px-3 py-1 rounded-full">
                  {currentChallengeIndex + 1} of {challenges?.length}
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${concept.difficulty === 'beginner' ? 'bg-green-500' : concept.difficulty === 'intermediate' ? 'bg-yellow-500' : 'bg-red-500'}`}>
                  {concept.difficulty.charAt(0).toUpperCase() + concept.difficulty.slice(1)}
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">{concept.name} Assessment</h1>
              <p className="text-blue-100">{concept.description}</p>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((currentChallengeIndex + 1) / (challenges?.length ?? 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {currentChallenge && (
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8 mb-6">
                  <h2 className="text-lg font-medium text-gray-700 mb-4">
                    {currentChallenge.type === 'translation' ? 'Translate this sentence:' : 'Respond to this prompt:'}
                  </h2>
                  <div className="flex items-center justify-center space-x-4 mb-4">
                    <p className="text-xl font-semibold text-gray-900 text-center max-w-2xl">
                      {currentChallenge.prompt}
                    </p>
                    <button
                      onClick={speakPrompt}
                      className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                      aria-label="Listen to prompt"
                    >
                      <Volume2 className="w-5 h-5 text-blue-600" />
                    </button>
                  </div>
                  <div className="text-sm text-gray-500">
                    Record your response in {currentChallenge.targetLanguage}
                  </div>
                </div>
              </div>

              {/* Recording Interface */}
              <div className="bg-gray-50 rounded-xl p-8">
                <div className="text-center">
                  {/* Recording Button */}
                  <div className="mb-6">
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                      className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-200 ${isRecording ? 'bg-red-500 hover:bg-red-600 scale-110 animate-pulse' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105'}`}>
                      {isRecording ? (
                        <MicOff className="w-10 h-10 text-white" />
                      ) : (
                        <Mic className="w-10 h-10 text-white" />
                      )}
                    </button>
                  </div>

                  {/* Recording Status */}
                  <div className="mb-6">
                    {isRecording ? (
                      <div className="space-y-2">
                        <p className="text-red-600 font-semibold">Recording...</p>
                        <p className="text-2xl font-mono text-red-600">{formatTime(recordingTime)}</p>
                        <div className="flex justify-center">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    ) : audioURL ? (
                      <div className="space-y-4">
                        <p className="text-green-600 font-semibold flex items-center justify-center space-x-2">
                          <CheckCircle className="w-5 h-5" />
                          <span>Recording Complete</span>
                        </p>
                        
                        {/* Playback Controls */}
                        <div className="flex items-center justify-center space-x-4">
                          <button
                            onClick={playAudio}
                            aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
                            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            {isPlaying ? (
                              <Pause className="w-5 h-5" />
                            ) : (
                              <Play className="w-5 h-5" />
                            )}
                            <span>{isPlaying ? 'Pause' : 'Play'}</span>
                          </button>
                          
                          <button
                            onClick={resetRecording}
                            aria-label="Reset recording"
                            className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            <RotateCcw className="w-5 h-5" />
                            <span>Reset</span>
                          </button>
                        </div>
                        
                        <audio ref={audioRef} src={audioURL} className="hidden" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-gray-600">Press the microphone to start recording</p>
                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                          <AlertCircle className="w-4 h-4" />
                          <span>Make sure your microphone is enabled</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  {audioURL && (
                    <button
                      onClick={handleSubmitResponse}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center space-x-2 mx-auto"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" fill="none" />
                            <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4zm16 0a8 8 0 01-8 8v-4a4 4 0 004-4h4z" />
                          </svg>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>{isLastChallenge ? 'Complete Assessment' : 'Next Challenge'}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Tips */}
              <div className="mt-8 bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Tips for this challenge</h3>
                <ul className="text-blue-800 space-y-2 text-sm">
                  {currentChallenge.type === 'translation' ? (
                    <>
                      <li>• Focus on accurate grammar and word order</li>
                      <li>• Pay attention to verb tenses and conjugations</li>
                      <li>• Use appropriate vocabulary for the context</li>
                    </>                  ) : (
                    <>
                      <li>• Speak naturally and use complete sentences</li>
                      <li>• Demonstrate your knowledge of the concept</li>
                      <li>• Use varied vocabulary and expressions</li>
                    </>
                  )}
                  <li>• Speak clearly for better transcription accuracy</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentScreen;
