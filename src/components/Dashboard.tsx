import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { 
  User, 
  Trophy, 
  Target, 
  Flame, 
  BookOpen, 
  Mic, 
  MapPin, 
  Utensils, 
  Briefcase, 
  Heart,
  TrendingUp,
  Award,
  Calendar,
  Settings
} from 'lucide-react';

interface DashboardProps {
  onStartChallenge: (challenge: any) => void;
  onGoToProfile: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onStartChallenge, onGoToProfile }) => {
  const { user, logout } = useAuth();
  const { userProgress, getRandomChallenge } = useData();

  const categories = [
    { id: 'travel', name: 'Travel', icon: MapPin, color: 'from-blue-500 to-cyan-500', progress: userProgress.categoryProgress.travel || 0 },
    { id: 'food', name: 'Food & Dining', icon: Utensils, color: 'from-orange-500 to-red-500', progress: userProgress.categoryProgress.food || 0 },
    { id: 'business', name: 'Business', icon: Briefcase, color: 'from-gray-600 to-gray-800', progress: userProgress.categoryProgress.business || 0 },
    { id: 'personal', name: 'Personal', icon: Heart, color: 'from-pink-500 to-rose-500', progress: userProgress.categoryProgress.personal || 0 }
  ];

  const handleStartChallenge = (categoryId?: string) => {
    const challenge = getRandomChallenge(categoryId);
    onStartChallenge(challenge);
  };

  const levelProgress = ((userProgress.totalXP % 300) / 300) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">LinguaLeveL</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.name}!</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={onGoToProfile}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <img 
                  src={user?.avatar} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover"
                />
                <User className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Trophy className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">Level {userProgress.level}</span>
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Progress</span>
                <span>{Math.round(levelProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${levelProgress}%` }}
                ></div>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{userProgress.totalXP} XP</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Flame className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-sm text-gray-500">Days</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{userProgress.streak}</p>
            <p className="text-sm text-gray-600">Current streak</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm text-gray-500">Completed</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{userProgress.completedChallenges}</p>
            <p className="text-sm text-gray-600">Challenges</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm text-gray-500">Average</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {Math.round(userProgress.recentScores.reduce((a, b) => a + b, 0) / userProgress.recentScores.length)}%
            </p>
            <p className="text-sm text-gray-600">Recent score</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Practice Categories */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Practice Categories</h2>
                <button
                  onClick={() => handleStartChallenge()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  Quick Practice
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <div
                      key={category.id}
                      className="group cursor-pointer bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 hover:shadow-md transition-all duration-200"
                      onClick={() => handleStartChallenge(category.id)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 bg-gradient-to-r ${category.color} rounded-xl`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-gray-500">Progress</span>
                          <p className="text-lg font-bold text-gray-900">{category.progress}%</p>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div 
                          className={`bg-gradient-to-r ${category.color} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${category.progress}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Mic className="w-4 h-4 mr-1" />
                        <span>Voice practice available</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Scores</h2>
              <div className="space-y-4">
                {userProgress.recentScores.map((score, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Calendar className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Practice Session {index + 1}</p>
                        <p className="text-sm text-gray-600">{index + 1} day{index !== 0 ? 's' : ''} ago</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{score}%</p>
                      <p className="text-sm text-gray-500">Score</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Achievements */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Achievements</h2>
              <div className="space-y-3">
                {userProgress.badges.map((badge, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                    <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{badge}</p>
                      <p className="text-sm text-gray-600">Earned recently</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Language Progress */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Language Progress</h2>
              <div className="space-y-4">
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Learning</p>
                  <p className="text-lg font-bold text-gray-900">{user?.targetLanguage}</p>
                  <div className="mt-3">
                    <div className="text-sm text-gray-600 mb-1">Fluency Level</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full w-3/5"></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Intermediate</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Goal */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Daily Goal</h2>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">3 Challenges</p>
                  <p className="text-sm text-gray-600">2 of 3 completed</p>
                </div>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2 mb-3">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full w-2/3"></div>
              </div>
              <button
                onClick={() => handleStartChallenge()}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
              >
                Complete Goal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;