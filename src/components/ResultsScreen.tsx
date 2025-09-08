import React from 'react';
import { ArrowLeft, Trophy, Star, TrendingUp, BookOpen, Mic, MessageSquare, RotateCcw, Home, Download } from 'lucide-react';
import { LanguageConcept, AssessmentResult } from '../App';

interface ResultsScreenProps {
  concept: LanguageConcept;
  result: AssessmentResult;
  onStartOver: () => void;
  onRetryAssessment: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ 
  concept, 
  result, 
  onStartOver, 
  onRetryAssessment 
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    return 'Needs Work';
  };

  const getMasteryLevel = (score: number) => {
    if (score >= 85) return { level: 'Advanced', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 70) return { level: 'Intermediate', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 55) return { level: 'Developing', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'Beginner', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const mastery = getMasteryLevel(result.conceptMastery);

  const downloadReport = () => {
    const reportData = {
      concept: concept.name,
      conceptMastery: result.conceptMastery,
      overallScores: result.overallScores,
      feedback: result.feedback,
      challengeResults: result.challengeResults,
      timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `lingualevel-${concept.name.toLowerCase().replace(/\s+/g, '-')}-assessment.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Assessment Results</h1>
            <button
              onClick={downloadReport}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Report</span>
            </button>
          </div>

          {/* Concept Overview */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{concept.name}</h2>
                <p className="text-gray-600">{concept.description}</p>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${mastery.color} ${mastery.bg}`}>
                {mastery.level} Level
              </div>
            </div>
          </div>

          {/* Main Score */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
              <span className="text-4xl font-bold text-white">{result.conceptMastery}</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Concept Mastery Score</h3>
            <p className="text-gray-600">Your overall understanding of {concept.name.toLowerCase()}</p>
          </div>

          {/* Detailed Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Language Skills Breakdown
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Grammar', score: result.overallScores.grammar, icon: BookOpen },
                  { label: 'Pronunciation', score: result.overallScores.pronunciation, icon: Mic },
                  { label: 'Vocabulary', score: result.overallScores.vocabulary, icon: Star },
                  { label: 'Fluency', score: result.overallScores.fluency, icon: MessageSquare }
                ].map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <IconComponent className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700 font-medium">{item.label}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${item.score}%` }}
                          ></div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(item.score)}`}>
                          {item.score}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Trophy className="w-5 h-5 mr-2" />
                Challenge Performance
              </h3>
              <div className="space-y-4">
                {result.challengeResults.map((challenge, index) => (
                  <div key={challenge.challengeId} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Challenge {index + 1}</p>
                      <p className="text-sm text-gray-600 truncate max-w-48">
                        {challenge.transcription}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{challenge.score}%</p>
                      <p className={`text-xs font-medium ${
                        challenge.score >= 90 ? 'text-green-600' :
                        challenge.score >= 80 ? 'text-blue-600' :
                        challenge.score >= 70 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {getScoreLabel(challenge.score)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feedback */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Star className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Personalized Feedback</h3>
                <p className="text-gray-700 leading-relaxed">{result.feedback}</p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-yellow-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations for Improvement</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800">Focus Areas:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  {result.overallScores.grammar < 80 && <li>• Review grammar rules and practice conjugations</li>}
                  {result.overallScores.pronunciation < 80 && <li>• Work on pronunciation with native speakers</li>}
                  {result.overallScores.vocabulary < 80 && <li>• Expand vocabulary in this topic area</li>}
                  {result.overallScores.fluency < 80 && <li>• Practice speaking more regularly</li>}
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800">Next Steps:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Try a more advanced concept assessment</li>
                  <li>• Practice with similar exercises daily</li>
                  <li>• Focus on weaker skill areas</li>
                  <li>• Retake this assessment in a few weeks</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onRetryAssessment}
              className="flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Retry Assessment</span>
            </button>
            
            <button
              onClick={onStartOver}
              className="flex items-center justify-center space-x-2 flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              <Home className="w-5 h-5" />
              <span>Choose Another Concept</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;