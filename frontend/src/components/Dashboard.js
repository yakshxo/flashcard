import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

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
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Dashboard
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back, {user.name}! You have {user.flashcardCredits} credits remaining.
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link
              to="/generate"
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create New Flashcards
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-bold">📚</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Flashcard Sets</dt>
                      <dd className="text-lg font-medium text-gray-900">{flashcards.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-bold">🎯</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Cards Generated</dt>
                      <dd className="text-lg font-medium text-gray-900">{user.totalFlashcardsGenerated}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-bold">💰</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Credits Remaining</dt>
                      <dd className="text-lg font-medium text-gray-900">{user.flashcardCredits}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Flashcard Sets */}
        <div className="mt-8">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Your Flashcard Sets</h3>
          
          {flashcards.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl">📚</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No flashcards yet</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first flashcard set!</p>
              <Link
                to="/generate"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Create Flashcards
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {flashcards.map((flashcardSet) => (
                <div key={flashcardSet._id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-medium text-gray-900 truncate">{flashcardSet.title}</h4>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        flashcardSet.status === 'completed' ? 'bg-green-100 text-green-800' :
                        flashcardSet.status === 'generating' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {flashcardSet.status}
                      </span>
                    </div>
                    {flashcardSet.description && (
                      <p className="text-sm text-gray-600 mb-4">{flashcardSet.description}</p>
                    )}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-500">
                        {flashcardSet.cards?.length || 0} cards
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(flashcardSet.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      {flashcardSet.status === 'completed' && (
                        <Link
                          to={`/flashcards/${flashcardSet._id}`}
                          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-700 text-center"
                        >
                          Study
                        </Link>
                      )}
                      <button
                        onClick={() => deleteFlashcardSet(flashcardSet._id)}
                        className="bg-red-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-red-700"
                      >
                        Delete
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