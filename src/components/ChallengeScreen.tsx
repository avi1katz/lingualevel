import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { 
  ArrowLeft, 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  RotateCcw, 
  Send,
  Volume2,
  Star,
  Trophy,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ChallengeScreenProps {
  challenge: any;
  onBack: () => void;
}

const ChallengeScreen: React.FC<ChallengeScreenProps> = ({ challenge, onBack }) => {
  const { submitChallengeResult } = useData();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const playAudio = () => {
    if (audioRef.current && audioURL) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
        audioRef.current.onended = () => setIsPlaying(false);
      }
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    setAudioURL('');
    setRecordingTime(0);
    setIsPlaying(false);
  };

  const submitResponse = async () => {
    if (!audioBlob) return;

    // Mock AI evaluation - in production, this would call your APIs
    const mockResult = {
      id: Date.now().toString(),
      challengeId: challenge.id,
      userResponse: 'User audio response',
      transcription: challenge.type === 'translation' 
        ? '¿Dónde está la estación de tren más cercana?'
        : 'El fin de semana pasado fui al parque con mis amigos y jugamos fútbol.',
      translation: challenge.type === 'translation' 
        ? challenge.expectedAnswer
        : 'Last weekend I went to the park with my friends and we played soccer.',
      score: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
      feedback: {
        pronunciation: Math.floor(Math.random() * 20) + 80,
        grammar: Math.floor(Math.random() * 25) + 75,
        vocabulary: Math.floor(Math.random() * 30) + 70,
        fluency: Math.floor(Math.random() * 25) + 75,
        comments: 'Great pronunciation! Your grammar is solid. Try to use more varied vocabulary to improve your score.'
      },
      timestamp: new Date().toISOString()
    };

    submitChallengeResult(mockResult);
    setResult(mockResult);
    setIsSubmitted(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const speakPrompt = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(challenge.prompt);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  if (isSubmitted && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
              <div className="flex items-center space-x-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <span className="text-lg font-bold text-gray-900">Challenge Complete!</span>
              </div>
            </div>

            {/* Score Overview */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
                <span className="text-3xl font-bold text-white">{result.score}</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Great Job!</h2>
              <p className="text-gray-600">You earned {result.score} points for this challenge.</p>
            </div>

            {/* Detailed Feedback */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Breakdown</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Pronunciation', score: result.feedback.pronunciation },
                    { label: 'Grammar', score: result.feedback.grammar },
                    { label: 'Vocabulary', score: result.feedback.vocabulary },
                    { label: 'Fluency', score: result.feedback.fluency }
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-gray-700">{item.label}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                            style={{ width: `${item.score}%` }}
                          ></div>
                        </div>
                        <span className={`px-2 py-1 rounded text-sm font-medium ${getScoreColor(item.score)}`}>
                          {item.score}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Response</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Transcription</h4>
                    <p className="text-gray-900 bg-white p-3 rounded-lg border">
                      {result.transcription}
                    </p>
                  </div>
                  {challenge.type === 'open-ended' && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Translation</h4>
                      <p className="text-gray-600 bg-white p-3 rounded-lg border">
                        {result.translation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Feedback Comments */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Star className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Feedback</h3>
                  <p className="text-gray-700">{result.feedback.comments}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setResult(null);
                  resetRecording();
                }}
                className="flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Try Again</span>
              </button>
              <button
                onClick={onBack}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Continue Learning
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-blue-100 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <div className="flex items-center space-x-2">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  challenge.difficulty === 'beginner' ? 'bg-green-500' :
                  challenge.difficulty === 'intermediate' ? 'bg-yellow-500' : 'bg-red-500'
                }`}>
                  {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                </div>
                <div className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                  {challenge.points} pts
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">
                {challenge.type === 'translation' ? 'Translation Challenge' : 'Speaking Practice'}
              </h1>
              <p className="text-blue-100 capitalize">{challenge.category} • {challenge.targetLanguage}</p>
            </div>
          </div>

          {/* Challenge Content */}
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8 mb-6">
                <h2 className="text-lg font-medium text-gray-700 mb-4">
                  {challenge.type === 'translation' ? 'Translate this sentence:' : 'Respond to this prompt:'}
                </h2>
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <p className="text-xl font-semibold text-gray-900 text-center max-w-2xl">
                    {challenge.prompt}
                  </p>
                  <button
                    onClick={speakPrompt}
                    className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                    title="Listen to prompt"
                  >
                    <Volume2 className="w-5 h-5 text-blue-600" />
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  Record your response in {challenge.targetLanguage}
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
                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-200 ${
                      isRecording
                        ? 'bg-red-500 hover:bg-red-600 scale-110 animate-pulse'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105'
                    }`}
                  >
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
                {audioURL && !isSubmitted && (
                  <button
                    onClick={submitResponse}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center space-x-2 mx-auto"
                  >
                    <Send className="w-5 h-5" />
                    <span>Submit Response</span>
                  </button>
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="mt-8 bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Tips for better results</h3>
              <ul className="text-blue-800 space-y-2 text-sm">
                <li>• Speak clearly and at a moderate pace</li>
                <li>• Use proper grammar and complete sentences</li>
                <li>• Try to use varied vocabulary</li>
                <li>• Practice pronunciation of difficult words</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeScreen;