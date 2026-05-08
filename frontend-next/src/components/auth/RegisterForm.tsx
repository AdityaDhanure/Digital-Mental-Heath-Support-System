'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { PasswordInput } from '@/components/auth/shared';
import { CrisisBanner } from '@/components/auth/shared';
import { RoleCard } from '@/components/auth/shared';
import { authAPI } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';
import { UserIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';

const DEPARTMENTS = [
  { value: 'CSE', label: 'Computer Science (CSE)' },
  { value: 'ENTC', label: 'Electronics & Telecom (ENTC)' },
  { value: 'Mechanical', label: 'Mechanical Engineering' },
  { value: 'Civil', label: 'Civil Engineering' },
  { value: 'Electrical', label: 'Electrical Engineering' },
  { value: 'IT', label: 'Information Technology (IT)' },
];

const SPECIALIZATIONS = [
  'Anxiety & Stress Management',
  'Depression & Mood Disorders',
  'Academic Counseling',
  'Career Guidance',
  'Relationship & Family Counseling',
  'Trauma & PTSD',
  'Addiction & Substance Abuse',
  'General Mental Health'
];

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error !== 'object' || error === null || !('response' in error)) {
    return fallback;
  }

  const response = (error as { response?: { data?: { message?: string } } }).response;
  return response?.data?.message || fallback;
};

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  gender: string;
  role: 'student' | 'counselor';
  language: string;
  studentId: string;
  department: string;
  year: string;
  specialization: string[];
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export default function RegisterForm() {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    gender: '',
    role: 'student',
    language: 'english',
    studentId: '',
    department: '',
    year: '',
    specialization: [],
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^(\+91[\s-]?)?[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid Indian mobile number';
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    if (formData.role === 'student') {
      if (!formData.studentId) {
        newErrors.studentId = 'Student ID is required';
      } else if (formData.studentId.trim().length < 5 || formData.studentId.trim().length > 20) {
        newErrors.studentId = 'Student ID must be between 5 and 20 characters';
      }
      if (!formData.department) {
        newErrors.department = 'Department is required';
      }
      if (!formData.year) {
        newErrors.year = 'Year is required';
      }
    }

    if (formData.role === 'counselor') {
      if (formData.specialization.length === 0) {
        newErrors.specialization = 'At least one specialization is required';
      }
      if (!formData.address.street) {
        newErrors['address.street'] = 'Street address is required';
      }
      if (!formData.address.city) {
        newErrors['address.city'] = 'City is required';
      }
      if (!formData.address.state) {
        newErrors['address.state'] = 'State is required';
      }
      if (!formData.address.pincode) {
        newErrors['address.pincode'] = 'Pincode is required';
      } else if (!/^\d{6}$/.test(formData.address.pincode)) {
        newErrors['address.pincode'] = 'Pincode must be 6 digits';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    if (!agreedToTerms) {
      toast.error('Please agree to the Terms of Service');
      return;
    }

    setIsLoading(true);

    try {
      const registerData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        gender: formData.gender,
        role: formData.role,
        language: formData.language,
        ...(formData.role === 'student'
          ? {
              studentId: formData.studentId.trim(),
              department: formData.department,
              year: formData.year,
            }
          : {
              specialization: formData.specialization,
              address: {
                street: formData.address.street.trim(),
                city: formData.address.city.trim(),
                state: formData.address.state.trim(),
                pincode: formData.address.pincode.trim(),
              },
            }),
      };
      const response = await authAPI.register(registerData);

      if (response.status === "success") {
        const { user, tokens } = response.data;
        
        setUser(user);
        setToken(tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        
        toast.success('Registration successful! Check your email for verification');
        router.push(`/verify-email?email=${formData.email}`);
      }
    } catch (error) {
      const errorMsg = getErrorMessage(error, 'Registration failed');
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const toggleSpecialization = (spec: string) => {
    setFormData((prev) => ({
      ...prev,
      specialization: prev.specialization.includes(spec)
        ? prev.specialization.filter(s => s !== spec)
        : [...prev.specialization, spec]
    }));
    if (errors.specialization) {
      setErrors((prev) => ({ ...prev, specialization: '' }));
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Create Your Account
        </h1>
        <p className="text-gray-600 mt-2">
          Start your mental wellness journey today
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">I am a</label>
            <div className="grid grid-cols-2 gap-4">
              <RoleCard
                role="student"
                selected={formData.role === 'student'}
                onSelect={() => setFormData(prev => ({ ...prev, role: 'student', department: '', year: '', studentId: '' }))}
              />
              <RoleCard
                role="counselor"
                selected={formData.role === 'counselor'}
                onSelect={() => setFormData(prev => ({ ...prev, role: 'counselor', specialization: [], address: { street: '', city: '', state: '', pincode: '' } }))}
              />
            </div>
          </div>

          <Input
            label="Full Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            icon={<UserIcon className="h-5 w-5 text-gray-400" />}
            error={errors.name}
            required
          />

          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your.email@college.edu"
            icon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />}
            error={errors.email}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PasswordInput
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
              error={errors.password}
              showStrength
              required
            />
            <PasswordInput
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              error={errors.confirmPassword}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 9876543210"
              icon={<PhoneIcon className="h-5 w-5 text-gray-400" />}
              error={errors.phone}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 ${
                  errors.gender
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-200 focus:border-purple-500 focus:ring-purple-200'
                }`}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
              )}
            </div>
          </div>

          <AnimatePresence>
            {formData.role === 'student' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 p-6 bg-blue-50 rounded-2xl border border-blue-100"
              >
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Academic Information
                </h3>
                <Input
                  label="Student ID"
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  placeholder="e.g. 2024CS001"
                  error={errors.studentId}
                  minLength={5}
                  maxLength={20}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 ${
                        errors.department
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-200 focus:border-purple-500 focus:ring-purple-200'
                      }`}
                    >
                      <option value="">Select Department</option>
                      {DEPARTMENTS.map(dept => (
                        <option key={dept.value} value={dept.value}>{dept.label}</option>
                      ))}
                    </select>
                    {errors.department && (
                      <p className="mt-1 text-sm text-red-600">{errors.department}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 ${
                        errors.year
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-200 focus:border-purple-500 focus:ring-purple-200'
                      }`}
                    >
                      <option value="">Select Year</option>
                      <option value="1">First Year</option>
                      <option value="2">Second Year</option>
                      <option value="3">Third Year</option>
                      <option value="4">Fourth Year</option>
                    </select>
                    {errors.year && (
                      <p className="mt-1 text-sm text-red-600">{errors.year}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {formData.role === 'counselor' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 p-6 bg-green-50 rounded-2xl border border-green-100"
              >
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Professional Information
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Specializations <span className="text-xs text-gray-500">(Select all that apply)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {SPECIALIZATIONS.map(spec => (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => toggleSpecialization(spec)}
                        className={`p-3 rounded-xl border-2 text-left text-sm transition-all ${
                          formData.specialization.includes(spec)
                            ? 'border-green-500 bg-green-100 text-green-700'
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            formData.specialization.includes(spec)
                              ? 'border-green-500 bg-green-500'
                              : 'border-gray-300'
                          }`}>
                            {formData.specialization.includes(spec) && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </span>
                          {spec}
                        </span>
                      </button>
                    ))}
                  </div>
                  {errors.specialization && (
                    <p className="mt-2 text-sm text-red-600">{errors.specialization}</p>
                  )}
                </div>

                <div className="pt-4 border-t border-green-200 space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">Address</h4>
                  <Input
                    label="Street Address"
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    placeholder="123 Main Street"
                    error={errors['address.street']}
                    required
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      label="City"
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      placeholder="Mumbai"
                      error={errors['address.city']}
                      required
                    />
                    <Input
                      label="State"
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleChange}
                      placeholder="Maharashtra"
                      error={errors['address.state']}
                      required
                    />
                    <Input
                      label="Pincode"
                      type="text"
                      name="address.pincode"
                      value={formData.address.pincode}
                      onChange={handleChange}
                      placeholder="400001"
                      error={errors['address.pincode']}
                      maxLength={6}
                      required
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Language</label>
            <select
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
            >
              <option value="english">English</option>
              <option value="hindi">हिन्दी (Hindi)</option>
              <option value="marathi">मराठी (Marathi)</option>
            </select>
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label className="text-sm text-gray-600">
              I agree to the{' '}
              <Link href="/terms" className="text-purple-600 hover:underline font-medium">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-purple-600 hover:underline font-medium">
                Privacy Policy
              </Link>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-200"
            isLoading={isLoading}
            size="lg"
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-purple-600 hover:text-purple-700 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>

      <CrisisBanner />
    </div>
  );
}
