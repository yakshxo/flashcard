import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

function GenerateFlashcards({ user }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('text');
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [textForm, setTextForm] = useState({
    title: '',
    description: '',
    content: '',
    cardCount: 10,
    difficulty: 'medium',
    subject: '',
    customPrompt: ''
  });

  const [fileForm, setFileForm] = useState({
    title: '',
    description: '',
    file: null,
    cardCount: 10,
    difficulty: 'medium',
    subject: '',
    customPrompt: ''
  });

  const handleTextChange = (e) => {
    setTextForm({
      ...textForm,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    if (e.target.name === 'file') {
      setFileForm({
        ...fileForm,
        file: e.target.files[0]
      });
    } else {
      setFileForm({
        ...fileForm,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    
    if (textForm.content.length < 50) {
      toast.error('Content must be at least 50 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/flashcards/generate-text', textForm);
      
      if (response.data.success) {
        toast.success('Flashcards generated successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Generate flashcards error:', error);
      
      if (error.response?.status === 402) {
        toast.error('Insufficient credits. Please purchase more credits.');
      } else if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => {
          toast.error(err.msg);
        });
      } else {
        toast.error(error.response?.data?.message || 'Failed to generate flashcards');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileSubmit = async (e) => {
    e.preventDefault();
    
    if (!fileForm.file) {
      toast.error('Please select a file');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', fileForm.file);
      formData.append('title', fileForm.title);
      formData.append('description', fileForm.description);
      formData.append('cardCount', fileForm.cardCount);
      formData.append('difficulty', fileForm.difficulty);
      formData.append('subject', fileForm.subject);
      formData.append('customPrompt', fileForm.customPrompt);

      const response = await axios.post('/api/flashcards/generate-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        toast.success('Flashcards generated successfully from file!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Generate flashcards from file error:', error);
      
      if (error.response?.status === 402) {
        toast.error('Insufficient credits. Please purchase more credits.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to generate flashcards from file');
      }
    } finally {
      setLoading(false);
    }
  };

  const creditsNeeded = Math.ceil((activeTab === 'text' ? textForm.cardCount : fileForm.cardCount) / 10);

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Generate Flashcards</h2>
            <p className="mt-1 text-sm text-gray-600">
              Create flashcards from text content or upload a file. You have {user.flashcardCredits} credits available.
            </p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('text')}
                className={`py-2 px-4 text-sm font-medium border-b-2 ${
                  activeTab === 'text'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                From Text
              </button>
              <button
                onClick={() => setActiveTab('file')}
                className={`ml-8 py-2 px-4 text-sm font-medium border-b-2 ${
                  activeTab === 'file'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                From File
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Credits Info */}
            <div className="mb-6 p-4 bg-blue-50 rounded-md">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Credits needed:</strong> {creditsNeeded} credits (1 credit per 10 flashcards)
                  </p>
                  <p className="text-sm text-blue-600">
                    Available: {user.flashcardCredits} credits
                  </p>
                </div>
              </div>
            </div>

            {activeTab === 'text' ? (
              <form onSubmit={handleTextSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      name="title"
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={textForm.title}
                      onChange={handleTextChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Number of Cards</label>
                    <input
                      type="number"
                      name="cardCount"
                      min="1"
                      max="100"
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={textForm.cardCount}
                      onChange={handleTextChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                  <input
                    type="text"
                    name="description"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={textForm.description}
                    onChange={handleTextChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Content</label>
                  <textarea
                    name="content"
                    rows={8}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Paste your study material here (minimum 50 characters)..."
                    value={textForm.content}
                    onChange={handleTextChange}
                  />
                  <p className="mt-1 text-sm text-gray-500">{textForm.content.length} characters</p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                    <select
                      name="difficulty"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={textForm.difficulty}
                      onChange={handleTextChange}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject (Optional)</label>
                    <input
                      type="text"
                      name="subject"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={textForm.subject}
                      onChange={handleTextChange}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || user.flashcardCredits < creditsNeeded}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    `Generate Flashcards (${creditsNeeded} credits)`
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleFileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title (Optional)</label>
                    <input
                      type="text"
                      name="title"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Will use filename if empty"
                      value={fileForm.title}
                      onChange={handleFileChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Number of Cards</label>
                    <input
                      type="number"
                      name="cardCount"
                      min="1"
                      max="100"
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={fileForm.cardCount}
                      onChange={handleFileChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Upload File</label>
                  <input
                    type="file"
                    name="file"
                    accept=".pdf,.txt"
                    required
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={handleFileChange}
                  />
                  <p className="mt-1 text-sm text-gray-500">Supports PDF and TXT files (max 10MB)</p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                    <select
                      name="difficulty"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={fileForm.difficulty}
                      onChange={handleFileChange}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject (Optional)</label>
                    <input
                      type="text"
                      name="subject"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={fileForm.subject}
                      onChange={handleFileChange}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || user.flashcardCredits < creditsNeeded}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    `Generate from File (${creditsNeeded} credits)`
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GenerateFlashcards;