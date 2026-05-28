import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CreditCard, Check, Sparkles, Zap, Crown, Star } from 'lucide-react';

const BuyCredits = ({ user, onCreditsUpdated }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPackages = async () => {
    try {
      const response = await axios.get('/api/payments/packages');
      setPackages(response.data.data);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast.error('Failed to load credit packages');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentReturn = useCallback(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const sessionId = urlParams.get('session_id');

    if (paymentStatus === 'success' && sessionId) {
      try {
        const response = await axios.post('/api/payments/checkout-success', {
          sessionId
        });

        if (response.data.success) {
          toast.success(response.data.message);
          if (onCreditsUpdated) {
            onCreditsUpdated(response.data.data.newBalance);
          }
        }
      } catch (error) {
        console.error('Error confirming payment:', error);
        toast.error('Payment succeeded but there was an issue updating your credits. Please contact support.');
      }

      // Clean up URL
      window.history.replaceState({}, document.title, '/dashboard');
    } else if (paymentStatus === 'cancelled') {
      toast.error('Payment was cancelled');
      // Clean up URL
      window.history.replaceState({}, document.title, '/buy-credits');
    }
  }, [onCreditsUpdated]);

  useEffect(() => {
    fetchPackages();
    handlePaymentReturn();
  }, [handlePaymentReturn]);

  const handlePackageSelect = async (pkg) => {
    try {
      const response = await axios.post('/api/payments/create-checkout-session', {
        credits: pkg.credits
      });

      if (response.data.success) {
        // Redirect to Stripe Checkout
        window.location.href = response.data.data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to start payment process. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
      </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 sm:mb-6">
              <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4 sm:mb-6">
              Buy Credits
            </h1>
            <p className="text-base sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-2 sm:px-0">
              Unlock unlimited flashcard generation with our flexible credit packages
            </p>
            <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-0 bg-white rounded-2xl px-5 sm:px-8 py-3 sm:py-4 shadow-lg border border-blue-100">
              <div className="flex flex-wrap items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                <span className="text-gray-600 font-medium">Current Balance:</span>
                <span className="font-bold text-xl sm:text-2xl text-blue-600 ml-2">{user?.flashcardCredits || 0}</span>
                <span className="text-gray-500 ml-1">credits</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8">
            {packages.map((pkg, index) => {
              const gradients = [
                'from-green-400 to-blue-500',
                'from-purple-500 to-pink-500', 
                'from-yellow-400 to-orange-500',
                'from-indigo-500 to-purple-600'
              ];
              const icons = [<Zap key="zap" />, <Star key="star" />, <Crown key="crown" />, <Sparkles key="sparkles" />];
              
              return (
                <div 
                  key={pkg.id}
                  className={`relative bg-white rounded-3xl shadow-xl border transition-all duration-300 hover:shadow-2xl transform hover:scale-105 group ${
                    pkg.popular 
                      ? 'border-2 border-purple-400 ring-4 ring-purple-100' 
                      : 'border border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center">
                        <Star className="h-4 w-4 mr-1" />
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className="p-6 sm:p-8 pt-10 sm:pt-12">
                    {/* Icon Header */}
                    <div className={`inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r ${gradients[index]} rounded-2xl mb-5 sm:mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
                      <div className="text-white text-xl sm:text-2xl">
                        {icons[index]}
                      </div>
                    </div>
                    
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">{pkg.name}</h3>
                    <div className="mb-5 sm:mb-6">
                      <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">${pkg.price}</span>
                      <span className="text-gray-500 ml-1 text-base sm:text-lg">{pkg.currency || 'CAD'}</span>
                    </div>
                    
                    <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-gray-700 font-medium">
                          {pkg.baseCredits || pkg.credits} credits
                          {pkg.bonusCredits > 0 && (
                            <span className="text-green-600 font-bold"> + {pkg.bonusCredits} bonus!</span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-gray-700 font-medium">${pkg.pricePerCredit.toFixed(2)} {pkg.currency || 'CAD'} per credit</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-gray-700 font-medium">Never expires</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-gray-700 font-medium">Instant delivery</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handlePackageSelect(pkg)}
                      className={`w-full py-3.5 sm:py-4 px-6 rounded-2xl font-bold text-base sm:text-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl ${
                        pkg.popular
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                          : `bg-gradient-to-r ${gradients[index]} hover:shadow-2xl text-white`
                      }`}
                    >
                      Choose {pkg.name}
                    </button>
                  </div>
                </div>
              );
            })}
        </div>

          <div className="mt-16 sm:mt-20">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-6 sm:p-12 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -translate-y-12 sm:-translate-y-16 translate-x-12 sm:translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-white/10 rounded-full translate-y-8 sm:translate-y-12 -translate-x-8 sm:-translate-x-12"></div>
              
              <div className="relative z-10">
                <div className="text-center mb-8 sm:mb-12">
                  <h3 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">How Credits Work</h3>
                  <p className="text-base sm:text-xl text-blue-100 max-w-2xl mx-auto">
                    Simple, transparent, and powerful - get the most out of your flashcard credits
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  <div className="text-center group">
                    <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-2xl mb-5 sm:mb-6 group-hover:bg-white/30 transition-colors duration-200">
                      <CreditCard className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                    </div>
                    <h4 className="text-xl sm:text-2xl font-bold mb-3">1 Credit = 1 Set</h4>
                    <p className="text-blue-100 text-base sm:text-lg leading-relaxed">
                      Each credit generates one complete set of flashcards from your content - no hidden limits!
                    </p>
                  </div>
                  
                  <div className="text-center group">
                    <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-2xl mb-5 sm:mb-6 group-hover:bg-white/30 transition-colors duration-200">
                      <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                    </div>
                    <h4 className="text-xl sm:text-2xl font-bold mb-3">Never Expires</h4>
                    <p className="text-blue-100 text-base sm:text-lg leading-relaxed">
                      Your credits never expire and can be used whenever inspiration strikes
                    </p>
                  </div>
                  
                  <div className="text-center group">
                    <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-2xl mb-5 sm:mb-6 group-hover:bg-white/30 transition-colors duration-200">
                      <Zap className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                    </div>
                    <h4 className="text-xl sm:text-2xl font-bold mb-3">Instant Access</h4>
                    <p className="text-blue-100 text-base sm:text-lg leading-relaxed">
                      Credits are added to your account immediately after payment - start creating right away
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyCredits;