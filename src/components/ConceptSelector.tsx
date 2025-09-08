import React from 'react';
import { Languages, BookOpen, Clock, Users, Briefcase, MapPin, Heart, GraduationCap } from 'lucide-react';
import { LanguageConcept } from '../App';

interface ConceptSelectorProps {
  onConceptSelect: (concept: LanguageConcept) => void;
}

const concepts: LanguageConcept[] = [
  {
    id: 'past-tense',
    name: 'Past Tense',
    description: 'Master the use of past tense in various contexts',
    difficulty: 'intermediate',
    category: 'Grammar'
  },
  {
    id: 'subjunctive-mood',
    name: 'Subjunctive Mood',
    description: 'Express doubt, emotion, and hypothetical situations',
    difficulty: 'advanced',
    category: 'Grammar'
  },
  {
    id: 'travel-vocabulary',
    name: 'Travel Vocabulary',
    description: 'Essential words and phrases for traveling',
    difficulty: 'beginner',
    category: 'Vocabulary'
  },
  {
    id: 'business-communication',
    name: 'Business Communication',
    description: 'Professional language for workplace interactions',
    difficulty: 'advanced',
    category: 'Communication'
  },
  {
    id: 'conditional-sentences',
    name: 'Conditional Sentences',
    description: 'If-then statements and hypothetical scenarios',
    difficulty: 'intermediate',
    category: 'Grammar'
  },
  {
    id: 'food-dining',
    name: 'Food & Dining',
    description: 'Restaurant vocabulary and food-related expressions',
    difficulty: 'beginner',
    category: 'Vocabulary'
  },
  {
    id: 'expressing-emotions',
    name: 'Expressing Emotions',
    description: 'Vocabulary and structures for describing feelings',
    difficulty: 'intermediate',
    category: 'Communication'
  },
  {
    id: 'formal-informal',
    name: 'Formal vs Informal Speech',
    description: 'Appropriate register for different social contexts',
    difficulty: 'advanced',
    category: 'Communication'
  }
];

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

const ConceptSelector: React.FC<ConceptSelectorProps> = ({ onConceptSelect }) => {
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
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Language Concept Assessment
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose a language concept to assess your mastery. You'll complete a series of translation 
            and speaking exercises to evaluate your understanding and proficiency.
          </p>
        </div>

        {/* Concept Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {concepts.map((concept) => {
            const IconComponent = categoryIcons[concept.category as keyof typeof categoryIcons];
            
            return (
              <div
                key={concept.id}
                onClick={() => onConceptSelect(concept)}
                className="group cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105 overflow-hidden"
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
              </div>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-sm p-8">
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
    </div>
  );
};

export default ConceptSelector;