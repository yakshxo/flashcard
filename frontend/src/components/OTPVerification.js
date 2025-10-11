import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Mail, RefreshCcw, Check, Shield } from 'lucide-react';

const OTPVerification = ({ email, isLogin = false, onSuccess, onBack }) => {
    const [otp, setOtp] = useState(['', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
    const inputRefs = [useRef(), useRef(), useRef(), useRef()];

    // Timer effect
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft]);

    // Format time display
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Handle OTP input change
    const handleChange = (index, value) => {
        // Only allow single digit
        if (value.length > 1) return;
        
        // Only allow numbers
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 3) {
            inputRefs[index + 1].current?.focus();
        }
    };

    // Handle backspace
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs[index - 1].current?.focus();
        }
    };

    // Handle paste
    const handlePaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text');
        const digits = pasteData.replace(/\D/g, '').slice(0, 4);
        
        const newOtp = ['', '', '', ''];
        for (let i = 0; i < digits.length; i++) {
            newOtp[i] = digits[i];
        }
        setOtp(newOtp);
        
        // Focus the next empty input or the last one
        const nextIndex = Math.min(digits.length, 3);
        inputRefs[nextIndex].current?.focus();
    };

    // Verify OTP
    const handleVerify = async (e) => {
        e.preventDefault();
        
        const otpValue = otp.join('');
        if (otpValue.length !== 4) {
            toast.error('Please enter the complete 4-digit code');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('/api/auth/verify-otp', {
                email,
                otp: otpValue,
                isLogin
            });

            if (response.data.success) {
                toast.success(response.data.message);
                onSuccess(response.data.data);
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            const message = error.response?.data?.message || 'Verification failed. Please try again.';
            toast.error(message);
            
            // Clear OTP on error
            setOtp(['', '', '', '']);
            inputRefs[0].current?.focus();
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP
    const handleResend = async () => {
        setResending(true);
        try {
            const response = await axios.post('/api/auth/resend-otp', {
                email,
                isLogin
            });

            if (response.data.success) {
                toast.success('New verification code sent to your email');
                setTimeLeft(600); // Reset timer
                setOtp(['', '', '', '']);
                inputRefs[0].current?.focus();
            }
        } catch (error) {
            console.error('Resend OTP error:', error);
            const message = error.response?.data?.message || 'Failed to resend code. Please try again.';
            toast.error(message);
        } finally {
            setResending(false);
        }
    };

    const isOtpComplete = otp.every(digit => digit !== '');

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                {/* Header */}
                <div className="flex items-center mb-8">
                    <button 
                        onClick={onBack}
                        className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-105"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <div className="flex-1 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4">
                            <Shield className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            {isLogin ? 'Login Verification' : 'Email Verification'}
                        </h2>
                    </div>
                </div>

                {/* Email info */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center bg-blue-50 rounded-xl px-4 py-3 mb-4">
                        <Mail className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="text-blue-700 font-medium text-sm">{email}</span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        We've sent a 4-digit verification code to your email address. 
                        Please enter the code below to {isLogin ? 'complete your login' : 'verify your account'}.
                    </p>
                </div>

                {/* OTP Input */}
                <form onSubmit={handleVerify}>
                    <div className="flex justify-center gap-4 mb-6">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={inputRefs[index]}
                                type="text"
                                inputMode="numeric"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 hover:border-gray-300"
                                disabled={loading}
                            />
                        ))}
                    </div>

                    {/* Timer */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center bg-yellow-50 rounded-lg px-3 py-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
                            <span className="text-yellow-700 text-sm font-medium">
                                Code expires in {formatTime(timeLeft)}
                            </span>
                        </div>
                    </div>

                    {/* Verify Button */}
                    <button
                        type="submit"
                        disabled={!isOtpComplete || loading || timeLeft === 0}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:hover:scale-100 disabled:hover:shadow-lg"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                                <span className="text-lg">Verifying...</span>
                            </>
                        ) : (
                            <>
                                <Check className="h-6 w-6 mr-3" />
                                <span className="text-lg">Verify Code</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Resend Code */}
                <div className="mt-6 text-center">
                    <p className="text-gray-600 text-sm mb-3">Didn't receive the code?</p>
                    <button
                        onClick={handleResend}
                        disabled={resending || timeLeft > 540} // Allow resend after 1 minute
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                        <RefreshCcw className={`h-4 w-4 mr-2 ${resending ? 'animate-spin' : ''}`} />
                        {resending ? 'Sending...' : 'Resend Code'}
                    </button>
                    {timeLeft > 540 && (
                        <p className="text-xs text-gray-500 mt-2">
                            You can request a new code in {formatTime(600 - timeLeft)}
                        </p>
                    )}
                </div>

                {/* Security Note */}
                <div className="mt-8 bg-gray-50 rounded-xl p-4">
                    <div className="flex items-start">
                        <Shield className="h-5 w-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm text-gray-700 font-medium mb-1">Security Note</p>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Never share your verification code with anyone. SnapStudy will never ask for your code via phone or email.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OTPVerification;