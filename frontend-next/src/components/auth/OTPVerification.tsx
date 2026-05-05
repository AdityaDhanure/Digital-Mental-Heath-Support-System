'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/common/Button';
import { OTPDigitInput } from '@/components/auth/shared';
import { authAPI } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';

export default function OTPVerification() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const { setUser, setToken } = useAuthStore();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(600);
  const [canResend, setCanResend] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  useEffect(() => {
    if (countdown > 0 && otpSent) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, otpSent]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      setFocusedIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    } else if (!value && index > 0) {
      setFocusedIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      setFocusedIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      setFocusedIndex(5);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSendOtp = async () => {
    setIsLoading(true);
    try {
      await authAPI.sendVerificationOTP();
      setOtpSent(true);
      toast.success('Verification code sent to your email');
      setCountdown(600);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      setFocusedIndex(0);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.verifyEmail(email, otpCode);

      if (response.status === "success") {
        const { user } = response.data;

        if (user) {
          setUser(user);
        }
        
        setVerified(true);
        toast.success('Email verified successfully!');

        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid verification code');
      setOtp(['', '', '', '', '', '']);
      setFocusedIndex(0);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    setIsLoading(true);
    try {
      await authAPI.sendVerificationOTP();
      toast.success('New code sent to your email');
      setCountdown(600);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      setFocusedIndex(0);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
            verified
              ? 'bg-green-100'
              : 'bg-purple-100'
          }`}
        >
          {verified ? (
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          )}
        </motion.div>
        
        <h1 className={`text-3xl font-bold ${
          verified
            ? 'bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'
        }`}>
          {verified ? 'Verified!' : 'Verify Your Email'}
        </h1>
        <p className="text-gray-600 mt-2">
          {verified
            ? 'Redirecting you to dashboard...'
            : `Enter the 6-digit code sent to`
          }
        </p>
        {!verified && (
          <p className="text-purple-600 font-semibold mt-1">{email}</p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
      >
        {!otpSent && !verified && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-gray-600">
              Click below to receive your verification code via email
            </p>
            <Button
              onClick={handleSendOtp}
              isLoading={isLoading}
              size="lg"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-200"
            >
              Send Verification Code
            </Button>
          </div>
        )}

        {(otpSent || verified) && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence>
              {!verified && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-6"
                >
                  <div 
                    className="flex justify-center gap-2 lg:gap-3"
                    onPaste={handlePaste}
                  >
                    {otp.map((digit, index) => (
                      <OTPDigitInput
                        key={index}
                        index={index}
                        value={digit}
                        onChange={(value) => handleChange(index, value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        inputRef={(el) => { inputRefs.current[index] = el; }}
                        isFocused={focusedIndex === index}
                      />
                    ))}
                  </div>

                  <div className="text-center">
                    {countdown > 0 ? (
                      <p className="text-sm text-gray-600">
                        Code expires in{' '}
                        <span className="font-bold text-purple-600">
                          {formatTime(countdown)}
                        </span>
                      </p>
                    ) : (
                      <p className="text-sm text-red-600 font-medium">
                        Code expired! Please request a new one.
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-200"
                    isLoading={isLoading}
                    size="lg"
                    disabled={otp.some(d => !d)}
                  >
                    Verify Email
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={!canResend}
                      className={`text-sm font-medium transition-colors ${
                        canResend
                          ? 'text-purple-600 hover:text-purple-700 hover:underline'
                          : 'text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {canResend
                        ? 'Resend Code'
                        : `Resend available in ${formatTime(countdown)}`
                      }
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {verified && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Email Verified!</h3>
                <p className="text-gray-600 mt-2">Your email has been successfully verified.</p>
                <p className="text-sm text-purple-600 mt-1">Redirecting to dashboard...</p>
              </motion.div>
            )}
          </form>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <p className="text-sm text-gray-500">
          Didn't receive the email?{' '}
          <button
            onClick={handleSendOtp}
            disabled={isLoading}
            className="text-purple-600 hover:text-purple-700 font-medium hover:underline disabled:opacity-50"
          >
            Try again
          </button>
        </p>
      </motion.div>
    </div>
  );
}
