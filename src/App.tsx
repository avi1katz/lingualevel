import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
  id:string;
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

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ConceptSelector />} />
            <Route path="/assessment/:conceptId" element={<AssessmentScreen />} />
            <Route path="/results" element={<ResultsScreen />} />
          </Routes>
        </BrowserRouter>
      </div>
    </QueryClientProvider>
  );
}

export default App;
