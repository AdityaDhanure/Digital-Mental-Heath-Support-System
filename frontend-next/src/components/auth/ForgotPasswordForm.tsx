'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { authAPI } from '@/lib/api/auth';
import { CrisisBanner } from '@/components/auth/shared';
import toast from 'react-hot-toast';
import { EnvelopeIcon, ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = () => {
    const newErrors: Record<string, string> = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail()) return;
    
    setIsLoading(true);

    try {
      await authAPI.forgotPassword(email);
      setEmailSent(true);
      toast.success('Password reset link sent to your email');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors({});
    }
  };

  if (emailSent) {
    return (
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center"
          >
            <CheckCircleIcon className="h-12 w-12 text-green-600" />
          </motion.div>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            Check Your Email
          </h1>
          <p className="text-gray-600 mb-2">
            We've sent a password reset link to
          </p>
          <p className="text-purple-600 font-semibold mb-8">{email}</p>
          <p className="text-sm text-gray-500 mb-8">
            Didn't receive the email? Check your spam folder or{' '}
            <button 
              onClick={() => setEmailSent(false)}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              try again
            </button>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
        >
          <Link href="/login">
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Back to Login
            </Button>
          </Link>
        </motion.div>

        <CrisisBanner />
      </div>
    );
  }

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
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center"
        >
          <EnvelopeIcon className="h-10 w-10 text-purple-600" />
        </motion.div>
        
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Forgot Password?
        </h1>
        <p className="text-gray-600 mt-2">
          Enter your email and we'll send you a reset link
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            name="email"
            value={email}
            onChange={handleChange}
            placeholder="your.email@college.edu"
            icon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />}
            error={errors.email}
            required
          />

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-200"
            isLoading={isLoading}
            size="lg"
          >
            Send Reset Link
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Remember your password?{' '}
            <Link
              href="/login"
              className="font-semibold text-purple-600 hover:text-purple-700 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <p className="text-sm text-gray-500">
          Need help?{' '}
          <Link href="/contact" className="text-purple-600 hover:text-purple-700 font-medium hover:underline">
            Contact Support
          </Link>
        </p>
      </motion.div>

      <CrisisBanner />
    </div>
  );
}
