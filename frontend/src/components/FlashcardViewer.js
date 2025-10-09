import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

function FlashcardViewer() {
  const { id } = useParams();
  const [flashcardSet, setFlashcardSet] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlashcardSet();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchFlashcardSet = async () => {
    try {
      const response = await axios.get(`/api/flashcards/${id}`);
      if (response.data.success) {
        setFlashcardSet(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching flashcard set:', error);
      toast.error('Failed to load flashcard set');
    } finally {
      setLoading(false);
    }
  };

  const nextCard = () => {
    if (currentCardIndex < flashcardSet.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
    }
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!flashcardSet) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Flashcard set not found</h2>
            <Link to="/dashboard" className="text-blue-600 hover:text-blue-500">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = flashcardSet.cards[currentCardIndex];

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link to="/dashboard" className="text-blue-600 hover:text-blue-500 text-sm">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">{flashcardSet.title}</h1>
          {flashcardSet.description && (
            <p className="text-gray-600 mt-1">{flashcardSet.description}</p>
          )}
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              Card {currentCardIndex + 1} of {flashcardSet.cards.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(((currentCardIndex + 1) / flashcardSet.cards.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentCardIndex + 1) / flashcardSet.cards.length) * 100}%`
              }}
            ></div>
          </div>
        </div>

        {/* Flashcard */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6 min-h-96">
          <div className="text-center">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {showAnswer ? 'Answer' : 'Question'}
              </h2>
              <div className="text-xl text-gray-800 leading-relaxed">
                {showAnswer ? currentCard.answer : currentCard.question}
              </div>
            </div>

            <button
              onClick={toggleAnswer}
              className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              {showAnswer ? 'Show Question' : 'Show Answer'}
            </button>

            {currentCard.tags && currentCard.tags.length > 0 && (
              <div className="mt-6">
                <div className="flex flex-wrap justify-center gap-2">
                  {currentCard.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevCard}
            disabled={currentCardIndex === 0}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>

          <div className="flex space-x-2">
            {flashcardSet.cards.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentCardIndex(index);
                  setShowAnswer(false);
                }}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentCardIndex
                    ? 'bg-blue-600'
                    : index < currentCardIndex
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextCard}
            disabled={currentCardIndex === flashcardSet.cards.length - 1}
            className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>

        {/* Completion */}
        {currentCardIndex === flashcardSet.cards.length - 1 && (
          <div className="mt-8 text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-green-800 mb-2">
                🎉 Great job! You've studied all the cards!
              </h3>
              <p className="text-green-700 mb-4">
                You completed {flashcardSet.cards.length} flashcards from "{flashcardSet.title}"
              </p>
              <Link
                to="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FlashcardViewer;