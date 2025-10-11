import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import OTPVerification from './OTPVerification';

function Register({ onLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      if (response.data.success && response.data.data.otpSent) {
        // OTP sent, show verification screen
        setUserEmail(formData.email);
        setShowOTP(true);
        toast.success(response.data.message);
      } else if (response.data.success) {
        // Direct registration (fallback)
        const { token, user } = response.data.data;
        onLogin(token, user);
        toast.success('Account created successfully!');
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response?.data?.errors) {
        // Display validation errors
        error.response.data.errors.forEach(err => {
          toast.error(err.msg);
        });
      } else {
        toast.error(error.response?.data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSuccess = (data) => {
    const { token, user } = data;
    onLogin(token, user);
  };

  const handleBackToRegister = () => {
    setShowOTP(false);
    setUserEmail('');
  };

  // Show OTP verification screen if needed
  if (showOTP) {
    return (
      <OTPVerification
        email={userEmail}
        isLogin={false}
        onSuccess={handleOTPSuccess}
        onBack={handleBackToRegister}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6">
              <span className="text-white font-bold text-2xl">S</span>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
              Join SnapStudy
            </h2>
            <p className="text-gray-600">
              Create your account and start generating AI-powered flashcards
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-blue-600 hover:text-purple-600 transition-colors duration-200"
              >
                Sign in here
              </Link>
            </p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-900"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-900"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-900"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-900"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-blue-800 mb-2">Password Requirements:</p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li className="flex items-center"><span className="w-1 h-1 bg-blue-500 rounded-full mr-2"></span>At least 6 characters</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:hover:scale-100 disabled:hover:shadow-lg flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                  <span className="text-lg">Creating Account...</span>
                </>
              ) : (
                <span className="text-lg">Create Account →</span>
              )}
            </button>
          </form>
          
          <div className="text-center mt-6">
            <div className="inline-flex items-center px-4 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
              <span className="text-green-700">Get 5 free flashcard credits upon registration!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;