import React from 'react';
import { Languages, BookOpen, Clock, Users, GraduationCap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { LanguageConcept } from '../App';
import { apiService } from '../services/api';

const categoryIcons = {
  Grammar: GraduationCap,
  Vocabulary: BookOpen,
  Communication: Users
};

const difficultyColors = {
  beginner: 'from-green-500 to-emerald-500',
  intermediate: 'from-yellow-500 to-orange-500',
  advanced: 'from-red-500 to-pink-500'
};

const ConceptSelector: React.FC = () => {
  const navigate = useNavigate();
  const { data: concepts, isLoading, error } = useQuery<LanguageConcept[], Error>({
    queryKey: ['concepts'],
    queryFn: async () => {
      const response = await apiService.getConcepts();
      return response.concepts || [];
    }
  });

  const handleConceptSelect = (concept: LanguageConcept) => {
    navigate(`/assessment/${concept.id}`, { state: { concept } });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 bg-red-50 rounded-lg">
          <p className="text-red-600">{error.message}</p>
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
              <Languages className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold ml-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LinguaLeveL
            </h1>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Language Concept Assessment
          </h2>
          
          {/* Info Section */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">How It Works</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="p-4 bg-blue-100 rounded-xl w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Choose a Concept</h4>
                <p className="text-gray-600">Select the language concept you want to assess from our comprehensive list.</p>
              </div>
              
              <div className="text-center">
                <div className="p-4 bg-purple-100 rounded-xl w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">2</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Complete Exercises</h4>
                <p className="text-gray-600">Answer translation questions and record spoken responses to demonstrate your skills.</p>
              </div>
              
              <div className="text-center">
                <div className="p-4 bg-green-100 rounded-xl w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">3</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Get Results</h4>
                <p className="text-gray-600">Receive detailed feedback on your mastery level and areas for improvement.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Concept Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {concepts?.map((concept) => {
            const IconComponent = categoryIcons[concept.category as keyof typeof categoryIcons];
            
            return (
              <button
                key={concept.id}
                onClick={() => handleConceptSelect(concept)}
                className="group cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105 overflow-hidden text-left"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gray-100 rounded-xl group-hover:bg-blue-100 transition-colors">
                      <IconComponent className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${difficultyColors[concept.difficulty]}`}>
                      {concept.difficulty.charAt(0).toUpperCase() + concept.difficulty.slice(1)}
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {concept.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {concept.description}
                  </p>

                  {/* Category */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {concept.category}
                    </span>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>5-10 min</span>
                    </div>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ConceptSelector;
