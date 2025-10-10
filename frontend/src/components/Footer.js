import React from 'react';
import { Heart, Coffee } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-slate-900 via-gray-900 to-slate-900 text-white py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main message */}
          <div className="mb-8">
            <p className="text-lg font-medium text-gray-300 mb-4">
              Crafted with <Heart className="inline h-5 w-5 text-red-400 mx-1 animate-pulse" /> and lots of{' '}
              <Coffee className="inline h-5 w-5 text-amber-400 mx-1" />
            </p>
            <p className="text-gray-400">
              by{' '}
              <a 
                href="https://www.linkedin.com/in/harshil-lotwala/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-400 font-semibold hover:text-blue-300 transition-colors cursor-pointer"
              >
                Harshil
              </a>
              {' & '}
              <a 
                href="https://www.linkedin.com/in/yaksh-thakar-299ba1236/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-purple-400 font-semibold hover:text-purple-300 transition-colors cursor-pointer"
              >
                Yaksh
              </a>
            </p>
          </div>

          {/* Bottom section */}
          <div className="border-t border-gray-700 pt-8">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">
                © 2025 SnapStudy. All rights reserved.
              </p>
              <p className="text-xs text-gray-500">
                Making studying less painful, one flashcard at a time ✨
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;