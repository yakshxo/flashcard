import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, User, Settings, LogOut, Menu, X } from 'lucide-react';

function Navbar({ user, logout }) {
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef();

  const isActive = (path) => {
    return location.pathname === path;
  };

  useEffect(() => {
    setShowDropdown(false);
    setShowMobileMenu(false);
  }, [location.pathname]);

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

  const desktopLinkClass = (path) =>
    `px-3 py-2 rounded-xl font-semibold transition-all duration-200 ${
      isActive(path)
        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`;

  const mobileLinkClass = (path) =>
    `block w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
      isActive(path)
        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
    }`;

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center">
            <Link to="/dashboard" className="flex min-w-0 flex-shrink-0 items-center group">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mr-2 sm:mr-3 group-hover:scale-110 transition-transform duration-200">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <h1 className="truncate text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SnapStudy
              </h1>
            </Link>

            <div className="ml-8 hidden lg:flex items-center space-x-2">
              <Link to="/dashboard" className={desktopLinkClass('/dashboard')}>
                Dashboard
              </Link>
              <Link to="/generate" className={desktopLinkClass('/generate')}>
                Generate
              </Link>
              <Link to="/buy-credits" className={desktopLinkClass('/buy-credits')}>
                Buy Credits
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/buy-credits" className="hidden md:flex items-center gap-3 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 px-4 py-2 rounded-2xl transition-all duration-200 border border-blue-200 hover:border-blue-300 group">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Credits:</span>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-bold rounded-full whitespace-nowrap">
                  {user.hasUnlimitedCredits ? '∞' : user.flashcardCredits}
                </span>
                <span className="text-blue-500 group-hover:scale-110 transition-transform duration-200">+</span>
              </div>
            </Link>
            
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex max-w-[220px] items-center gap-2 sm:gap-3 bg-gray-50 hover:bg-gray-100 px-2.5 sm:px-4 py-2 rounded-2xl transition-all duration-200 group"
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
                <span className="hidden md:inline truncate font-medium text-gray-700">
                  Hey, {user.name?.split(' ')[0] || 'User'}!
                </span>
                <ChevronDown className={`hidden sm:block h-4 w-4 text-gray-500 transition-transform duration-200 ${
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
                        setShowMobileMenu(false);
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

            <button
              type="button"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              aria-label="Toggle navigation menu"
            >
              {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {showMobileMenu && (
          <div className="lg:hidden border-t border-gray-100 py-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <Link
                to="/dashboard"
                onClick={() => setShowMobileMenu(false)}
                className={mobileLinkClass('/dashboard')}
              >
                Dashboard
              </Link>
              <Link
                to="/generate"
                onClick={() => setShowMobileMenu(false)}
                className={mobileLinkClass('/generate')}
              >
                Generate
              </Link>
              <Link
                to="/buy-credits"
                onClick={() => setShowMobileMenu(false)}
                className={mobileLinkClass('/buy-credits')}
              >
                Buy Credits
              </Link>
              <Link
                to="/profile"
                onClick={() => setShowMobileMenu(false)}
                className={mobileLinkClass('/profile')}
              >
                Manage Profile
              </Link>
            </div>

            <div className="mt-4 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-4 md:hidden">
              <p className="text-sm font-medium text-gray-700 mb-2">Current credits</p>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Available balance</span>
                <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-bold rounded-full">
                  {user.hasUnlimitedCredits ? '∞' : user.flashcardCredits}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowMobileMenu(false);
                logout();
              }}
              className="mt-4 w-full rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;