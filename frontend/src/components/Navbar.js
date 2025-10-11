import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, User, Settings, LogOut } from 'lucide-react';

function Navbar({ user, logout }) {
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
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
            
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-3 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-2xl transition-all duration-200 group"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center overflow-hidden">
                  {user.profileImage ? (
                    <img 
                      src={`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}${user.profileImage}`}
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-sm">{getInitials(user.name)}</span>
                  )}
                </div>
                <span className="font-medium text-gray-700">Hey, {user.name}!</span>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                  showDropdown ? 'rotate-180' : ''
                }`} />
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-xs text-gray-500">Credits:</span>
                      <span className="ml-2 px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold rounded-full">
                        {user.hasUnlimitedCredits ? '∞' : user.flashcardCredits}
                      </span>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <Link
                      to="/profile"
                      onClick={() => setShowDropdown(false)}
                      className="w-full px-4 py-3 text-left flex items-center space-x-3 hover:bg-gray-50 transition-colors duration-200 text-gray-700 hover:text-gray-900"
                    >
                      <User className="h-4 w-4" />
                      <span className="font-medium">Manage Profile</span>
                    </Link>
                    
                    <Link
                      to="/buy-credits"
                      onClick={() => setShowDropdown(false)}
                      className="w-full px-4 py-3 text-left flex items-center space-x-3 hover:bg-gray-50 transition-colors duration-200 text-gray-700 hover:text-gray-900"
                    >
                      <Settings className="h-4 w-4" />
                      <span className="font-medium">Buy Credits</span>
                    </Link>
                    
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        logout();
                      }}
                      className="w-full px-4 py-3 text-left flex items-center space-x-3 hover:bg-red-50 transition-colors duration-200 text-red-600 hover:text-red-700"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;