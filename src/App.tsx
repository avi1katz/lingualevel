import React, { useState } from 'react';
import ConceptSelector from './components/ConceptSelector';
import AssessmentScreen from './components/AssessmentScreen';
import ResultsScreen from './components/ResultsScreen';
import './index.css';

export type LanguageConcept = {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
};

export type Challenge = {
  id: string;
  type: 'translation' | 'open-ended';
  prompt: string;
  targetLanguage: string;
  expectedAnswer?: string;
  conceptId: string;
};

export type AssessmentResult = {
  conceptMastery: number;
  overallScores: {
    grammar: number;
    pronunciation: number;
    vocabulary: number;
    fluency: number;
  };
  feedback: string;
  challengeResults: Array<{
    challengeId: string;
    userResponse: string;
    transcription: string;
    score: number;
    feedback: string;
  }>;
};

type Screen = 'concept-selection' | 'assessment' | 'results';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('concept-selection');
  const [selectedConcept, setSelectedConcept] = useState<LanguageConcept | null>(null);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);

  const handleConceptSelect = (concept: LanguageConcept) => {
    setSelectedConcept(concept);
    setCurrentScreen('assessment');
  };

  const handleAssessmentComplete = (result: AssessmentResult) => {
    setAssessmentResult(result);
    setCurrentScreen('results');
  };

  const handleStartOver = () => {
    setSelectedConcept(null);
    setAssessmentResult(null);
    setCurrentScreen('concept-selection');
  };

  const handleRetryAssessment = () => {
    setAssessmentResult(null);
    setCurrentScreen('assessment');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {currentScreen === 'concept-selection' && (
        <ConceptSelector onConceptSelect={handleConceptSelect} />
      )}
      
      {currentScreen === 'assessment' && selectedConcept && (
        <AssessmentScreen 
          concept={selectedConcept}
          onComplete={handleAssessmentComplete}
          onBack={() => setCurrentScreen('concept-selection')}
        />
      )}
      
      {currentScreen === 'results' && assessmentResult && selectedConcept && (
        <ResultsScreen 
          concept={selectedConcept}
          result={assessmentResult}
          onStartOver={handleStartOver}
          onRetryAssessment={handleRetryAssessment}
        />
      )}
    </div>
  );
}

export default App;