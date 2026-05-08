'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { HeartIcon, SparklesIcon, CalendarIcon, BookOpenIcon, ChatBubbleLeftRightIcon, ShieldCheckIcon, GlobeAltIcon, UserGroupIcon, ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isHydrated && isAuthenticated) {
      router.push(user?.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    }
  }, [isAuthenticated, isHydrated, router]);

  if (!mounted || (isHydrated && isAuthenticated)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <HeartSolidIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                MindSage AI
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <button className="px-4 py-2 text-gray-700 font-medium hover:text-purple-600 transition-colors">
                  Sign In
                </button>
              </Link>
              <Link href="/register">
                <button className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-200 transition-all">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-200 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full blur-3xl opacity-40"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full border border-purple-100 mb-6">
                <SparklesIcon className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Your mental wellness matters</span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                <span className="bg-gradient-to-r from-gray-900 via-purple-800 to-pink-700 bg-clip-text text-transparent">
                  Your Journey to
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                  Mental Wellness
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-lg">
                A safe, confidential space for students to access mental health support, connect with professional counselors, and find the resources you need.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white font-bold rounded-2xl hover:shadow-xl hover:shadow-purple-200 transition-all">
                  Start Your Journey
                  <ArrowRightIcon className="h-5 w-5" />
                </Link>
                <Link href="/login" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 font-semibold rounded-2xl border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all">
                  Sign In
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-6 mt-10">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-600">100% Confidential</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserGroupIcon className="h-5 w-5 text-purple-500" />
                  <span className="text-sm text-gray-600">500+ Students Helped</span>
                </div>
                <div className="flex items-center gap-2">
                  <GlobeAltIcon className="h-5 w-5 text-pink-500" />
                  <span className="text-sm text-gray-600">3 Languages</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                {/* Main card */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-3xl transform rotate-6 shadow-2xl"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-orange-300 rounded-3xl transform -rotate-3 shadow-xl"></div>
                <div className="relative bg-white rounded-3xl p-8 shadow-2xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                      💜
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">MindSage AI Support</h3>
                      <p className="text-sm text-gray-500">Always here for you</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-2xl">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ChatBubbleLeftRightIcon className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">AI Assistant</p>
                        <p className="text-xs text-gray-500">24/7 support available</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-pink-50 rounded-2xl">
                      <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CalendarIcon className="h-4 w-4 text-pink-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Book Sessions</p>
                        <p className="text-xs text-gray-500">Licensed counselors</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-2xl">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpenIcon className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Resources</p>
                        <p className="text-xs text-gray-500">Videos & articles</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 bg-purple-50 text-purple-700 font-medium text-sm rounded-full mb-4">
              What We Offer
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Comprehensive Mental Health Support
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for your mental wellness journey, all in one place
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-8 bg-gradient-to-br from-gray-50 to-white rounded-3xl border border-gray-100 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-100 transition-all"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-white/80 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 bg-pink-50 text-pink-700 font-medium text-sm rounded-full mb-4">
              Simple Process
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in minutes with our simple three-step process
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-6">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRightIcon className="h-8 w-8 text-purple-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 bg-green-50 text-green-700 font-medium text-sm rounded-full mb-4">
              Success Stories
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Students Say
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-3xl border border-gray-100"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full mb-6">
              <HeartIcon className="h-5 w-5 text-white" />
              <span className="text-white font-medium">You deserve support</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Take the First Step Today
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Your mental health is just as important as your physical health. Start your journey to wellness with our supportive community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-purple-600 font-bold rounded-2xl hover:shadow-xl transition-all">
                Create Free Account
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <a href="tel:18005990019" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/20 text-white font-semibold rounded-2xl border-2 border-white/30 hover:bg-white/30 transition-all">
                Crisis Helpline: 1800 599 0019
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <HeartSolidIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">MindSage AI</span>
              </div>
              <p className="text-gray-400 max-w-md mb-6">
                A safe, confidential platform for students to access mental health support, connect with counselors, and find resources for their wellness journey.
              </p>
              <div className="flex items-center gap-2 text-green-400">
                <ShieldCheckIcon className="h-5 w-5" />
                <span>Your privacy is our priority</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/resources" className="hover:text-white transition-colors">Resources</Link></li>
                <li><Link href="/community" className="hover:text-white transition-colors">Community</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><a href="tel:18005990019" className="hover:text-white transition-colors">Crisis Helpline</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>© 2025 MindSage AI. All rights reserved. Made with 💜 for students</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'AI Mental Health Assistant',
    description: '24/7 compassionate support with our AI chatbot trained to help with stress, anxiety, and emotional challenges.',
    gradient: 'from-purple-500 to-violet-500'
  },
  {
    icon: CalendarIcon,
    title: 'Professional Counseling',
    description: 'Book confidential sessions with licensed counselors who understand student life and academic pressures.',
    gradient: 'from-pink-500 to-rose-500'
  },
  {
    icon: BookOpenIcon,
    title: 'Resource Hub',
    description: 'Access videos, articles, and exercises in multiple languages to support your mental wellness journey.',
    gradient: 'from-orange-500 to-amber-500'
  },
  {
    icon: UserGroupIcon,
    title: 'Peer Community',
    description: 'Connect with fellow students in a safe, moderated space to share experiences and support each other.',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Complete Privacy',
    description: 'Your conversations are confidential. We prioritize your privacy and security at every step.',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: GlobeAltIcon,
    title: 'Multilingual Support',
    description: 'Get help in English, Hindi, or Marathi—whichever language you\'re most comfortable with.',
    gradient: 'from-indigo-500 to-purple-500'
  }
];

const stats = [
  { value: '500+', label: 'Students Supported' },
  { value: '50+', label: 'Expert Counselors' },
  { value: '24/7', label: 'AI Assistant Available' },
  { value: '98%', label: 'Satisfaction Rate' }
];

const steps = [
  {
    number: '1',
    title: 'Create Your Account',
    description: 'Sign up in minutes with your email. No complicated forms, just quick and easy registration.'
  },
  {
    number: '2',
    title: 'Explore Resources',
    description: 'Browse our library of articles, videos, and self-help tools tailored to your needs.'
  },
  {
    number: '3',
    title: 'Connect & Grow',
    description: 'Book counseling sessions or chat with our AI assistant whenever you need support.'
  }
];

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Engineering Student',
    text: 'MindSage AI helped me deal with exam anxiety. The AI assistant is incredibly supportive, and booking sessions with counselors is so easy!'
  },
  {
    name: 'Rahul Verma',
    role: 'Medical Student',
    text: 'I was skeptical at first, but the counselors really understand the pressures we face. It\'s like having a safe space to talk about anything.'
  },
  {
    name: 'Anita Desai',
    role: 'Arts Student',
    text: 'The multilingual support in Hindi made such a difference. I could express myself better in my native language. Highly recommend!'
  }
];
