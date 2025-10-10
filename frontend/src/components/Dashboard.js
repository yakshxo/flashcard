import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, BookOpen, Target, Coins, Calendar, Trash2, Eye, Sparkles } from 'lucide-react';

function Dashboard({ user }) {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlashcards();
  }, []);

  const fetchFlashcards = async () => {
    try {
      const response = await axios.get('/api/flashcards');
      if (response.data.success) {
        setFlashcards(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      toast.error('Failed to load flashcards');
    } finally {
      setLoading(false);
    }
  };

  const deleteFlashcardSet = async (id) => {
    if (window.confirm('Are you sure you want to delete this flashcard set?')) {
      try {
        await axios.delete(`/api/flashcards/${id}`);
        toast.success('Flashcard set deleted successfully');
        fetchFlashcards(); // Refresh the list
      } catch (error) {
        console.error('Error deleting flashcard set:', error);
        toast.error('Failed to delete flashcard set');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-center items-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
              Welcome back, {user.name}!
            </h1>
            <p className="text-xl text-gray-600 mb-8">Ready to create some amazing flashcards?</p>
            
            <Link
              to="/generate"
              className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl"
            >
              <Plus className="h-6 w-6 mr-3" />
              <span className="text-lg">Create New Flashcards</span>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-12">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group">
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-800">{flashcards.length}</p>
                  <p className="text-sm font-medium text-gray-500">Total Sets</p>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Flashcard Sets</h3>
              <p className="text-gray-600 text-sm">Complete collections ready to study</p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group">
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-800">{user.totalFlashcardsGenerated || 0}</p>
                  <p className="text-sm font-medium text-gray-500">Total Cards</p>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Cards Generated</h3>
              <p className="text-gray-600 text-sm">Individual flashcards created</p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group">
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Coins className="h-8 w-8 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-800">{user.hasUnlimitedCredits ? '∞' : user.flashcardCredits}</p>
                  <p className="text-sm font-medium text-gray-500">{user.hasUnlimitedCredits ? 'Unlimited' : 'Available'}</p>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Credits Remaining</h3>
              {!user.hasUnlimitedCredits && (
                <Link to="/buy-credits" className="text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors">
                  Buy more credits →
                </Link>
              )}
              {user.hasUnlimitedCredits && (
                <span className="text-green-600 text-sm font-medium">
                  Developer Account ✨
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Flashcard Sets */}
        <div>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Your Flashcard Sets</h2>
            <p className="text-gray-600">Manage and study your personalized flashcard collections</p>
          </div>
          
          {flashcards.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-3xl mb-8">
                <BookOpen className="h-16 w-16 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No flashcards yet</h3>
              <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">Ready to supercharge your learning? Create your first flashcard set and start studying smarter!</p>
              <Link
                to="/generate"
                className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl"
              >
                <Plus className="h-6 w-6 mr-3" />
                <span className="text-lg">Create Your First Set</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {flashcards.map((flashcardSet) => (
                <div key={flashcardSet._id} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group">
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">{flashcardSet.title}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center">
                            <BookOpen className="h-4 w-4 mr-1" />
                            {flashcardSet.cards?.length || 0} cards
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(flashcardSet.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ml-2 ${
                        flashcardSet.status === 'completed' ? 'bg-green-100 text-green-700 border border-green-200' :
                        flashcardSet.status === 'generating' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                        'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                        {flashcardSet.status === 'completed' ? 'Ready' :
                         flashcardSet.status === 'generating' ? 'Creating' : 'Failed'}
                      </span>
                    </div>
                    
                    {flashcardSet.description && (
                      <p className="text-gray-600 mb-6 text-sm leading-relaxed line-clamp-2">{flashcardSet.description}</p>
                    )}
                    
                    <div className="flex space-x-3">
                      {flashcardSet.status === 'completed' ? (
                        <Link
                          to={`/flashcards/${flashcardSet._id}`}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 text-center transform hover:scale-105 active:scale-95 flex items-center justify-center"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Study Now
                        </Link>
                      ) : (
                        <div className="flex-1 bg-gray-100 text-gray-400 font-semibold py-3 px-4 rounded-xl text-center">
                          {flashcardSet.status === 'generating' ? 'Processing...' : 'Unavailable'}
                        </div>
                      )}
                      
                      <button
                        onClick={() => deleteFlashcardSet(flashcardSet._id)}
                        className="bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
                        title="Delete flashcard set"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;