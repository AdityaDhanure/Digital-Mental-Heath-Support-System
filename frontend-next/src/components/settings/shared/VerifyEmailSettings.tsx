'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/common/Button';
import { authAPI } from '@/lib/api/auth';
import toast from 'react-hot-toast';
import { EnvelopeIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface VerifyEmailSettingsProps {
  user: any;
  onVerified: () => void;
}

export default function VerifyEmailSettings({ user, onVerified }: VerifyEmailSettingsProps) {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOTP = async () => {
    setIsLoading(true);
    try {
      await authAPI.sendVerificationOTP();
      toast.success('OTP sent to your email');
      setShowModal(true);
      setTimer(60);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.verifyEmailOTP(otp);
      toast.success('Email verified successfully!');
      setShowModal(false);
      onVerified();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {user?.isEmailVerified ? (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <ShieldCheckIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-green-900">Email Verified</h3>
              <p className="text-sm text-green-700">Your email has been successfully verified</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <EnvelopeIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-orange-900">Verify Your Email</h3>
                <p className="text-sm text-orange-700">Get access to all features by verifying your email</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="text-orange-600 border-orange-200 bg-orange-50 hover:bg-orange-100"
              onClick={handleSendOTP}
              isLoading={isLoading}
            >
              Verify Now
            </Button>
          </div>
        </div>
      )}

      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <EnvelopeIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Verify Your Email</h2>
              <p className="text-gray-600 mt-2">Enter the 6-digit code sent to your email</p>
            </div>

            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 text-center mb-4">Enter 6-digit OTP</label>
                <div className="flex justify-center">
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-48 text-center text-3xl font-bold tracking-[0.5em] py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none transition-all"
                    placeholder="000000"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Button type="submit" className="w-full py-4 text-lg" isLoading={isLoading}>
                  Verify & Continue
                </Button>
                <div className="text-center">
                  {timer > 0 ? (
                    <p className="text-sm text-gray-500">Resend available in <span className="font-bold">{timer}s</span></p>
                  ) : (
                    <button type="button" onClick={handleSendOTP} className="text-sm font-medium text-purple-600 hover:text-purple-700 underline">
                      Didn't receive code? Resend
                    </button>
                  )}
                </div>
                <button type="button" onClick={() => setShowModal(false)} className="text-sm text-gray-400 hover:text-gray-600">
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
