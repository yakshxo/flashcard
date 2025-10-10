import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar({ user, logout }) {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between h-18">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex-shrink-0 flex items-center group">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-10 h-10 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">SnapStudy</h1>
            </Link>
            <div className="ml-12 flex items-center space-x-8">
              <Link
                to="/dashboard"
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                  isActive('/dashboard')
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/generate"
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                  isActive('/generate')
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Generate
              </Link>
              <Link
                to="/buy-credits"
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                  isActive('/buy-credits')
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Buy Credits
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/buy-credits" className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 px-4 py-2 rounded-2xl transition-all duration-200 border border-blue-200 hover:border-blue-300 group">
              <span className="text-sm font-medium text-gray-700">Credits:</span>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-bold rounded-full">
                  {user.hasUnlimitedCredits ? '∞' : user.flashcardCredits}
                </span>
                <span className="text-blue-500 group-hover:scale-110 transition-transform duration-200">+</span>
              </div>
            </Link>
            
            <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-2xl">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">{user.name.charAt(0).toUpperCase()}</span>
              </div>
              <span className="font-medium text-gray-700">Hey, {user.name}!</span>
            </div>
            
            <button
              onClick={logout}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2 rounded-2xl font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;