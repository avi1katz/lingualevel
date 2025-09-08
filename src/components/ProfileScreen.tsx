import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Globe, 
  Calendar, 
  Award, 
  TrendingUp, 
  Settings,
  Download,
  Share2,
  Target
} from 'lucide-react';

interface ProfileScreenProps {
  onBack: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack }) => {
  const { user, logout } = useAuth();
  const { userProgress, challengeHistory } = useData();

  if (!user) return null;

  const downloadReport = () => {
    // Mock download functionality
    const reportData = {
      user: user.name,
      level: userProgress.level,
      totalXP: userProgress.totalXP,
      streak: userProgress.streak,
      completedChallenges: userProgress.completedChallenges,
      averageScore: Math.round(userProgress.recentScores.reduce((a, b) => a + b, 0) / userProgress.recentScores.length),
      badges: userProgress.badges,
      categoryProgress: userProgress.categoryProgress
    };
    
    console.log('Downloading report:', reportData);
    alert('Report downloaded! (Mock functionality)');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={downloadReport}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
            
            <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Share2 className="w-4 h-4" />
              <span>Share Progress</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="text-center mb-6">
                <img 
                  src={user.avatar} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-blue-100"
                />
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-600">{user.level} Learner</p>
                <div className="mt-2 inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Level {userProgress.level}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{user.email}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">
                    {user.nativeLanguage} → {user.targetLanguage}
                  </span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">
                    Joined {new Date(user.joinDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <button
                onClick={logout}
                className="w-full mt-6 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total XP</span>
                  <span className="font-bold text-gray-900">{userProgress.totalXP}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Current Streak</span>
                  <span className="font-bold text-gray-900">{userProgress.streak} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Challenges Done</span>
                  <span className="font-bold text-gray-900">{userProgress.completedChallenges}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Average Score</span>
                  <span className="font-bold text-gray-900">
                    {Math.round(userProgress.recentScores.reduce((a, b) => a + b, 0) / userProgress.recentScores.length)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Learning Progress</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Overall Progress</h3>
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{userProgress.level}</div>
                  <div className="text-sm text-gray-600 mb-3">Current Level</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full"
                      style={{ width: `${((userProgress.totalXP % 300) / 300) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {userProgress.totalXP % 300} / 300 XP to next level
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Daily Streak</h3>
                    <Target className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{userProgress.streak}</div>
                  <div className="text-sm text-gray-600 mb-3">Days in a row</div>
                  <div className="flex space-x-1">
                    {[...Array(7)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-4 h-4 rounded-full ${
                          i < userProgress.streak ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Keep it up! 🔥
                  </div>
                </div>
              </div>

              {/* Category Progress */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Category Progress</h3>
                {Object.entries(userProgress.categoryProgress).map(([category, progress]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-gray-700 capitalize">{category}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-10">{progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Achievements</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userProgress.badges.map((badge, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border">
                    <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{badge}</h3>
                      <p className="text-sm text-gray-600">Earned recently</p>
                    </div>
                  </div>
                ))}
                
                {/* Locked achievements */}
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <div className="p-3 bg-gray-300 rounded-xl">
                    <Award className="w-6 h-6 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-500">Perfect Week</h3>
                    <p className="text-sm text-gray-400">Complete 7 days in a row</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Scores</h2>
              <div className="space-y-3">
                {userProgress.recentScores.map((score, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Challenge {index + 1}</p>
                        <p className="text-sm text-gray-600">{index + 1} day{index !== 0 ? 's' : ''} ago</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{score}%</p>
                      <p className={`text-xs font-medium ${
                        score >= 90 ? 'text-green-600' :
                        score >= 80 ? 'text-blue-600' :
                        score >= 70 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {score >= 90 ? 'Excellent' :
                         score >= 80 ? 'Good' :
                         score >= 70 ? 'Fair' : 'Needs Work'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;