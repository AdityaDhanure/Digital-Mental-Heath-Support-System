// ============================================
// SOLUTION 7: Update next.config.js
// FILE: next.config.js (UPDATED)
// ============================================
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_AI_SERVICE_URL: process.env.NEXT_PUBLIC_AI_SERVICE_URL,
  },
  // Fix for hydration issues
  experimental: {
    optimizeCss: true,
  },
}

module.exports = nextConfig
