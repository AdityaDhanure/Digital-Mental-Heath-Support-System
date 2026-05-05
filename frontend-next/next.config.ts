// ============================================
// SOLUTION 7: Update next.config.js
// FILE: next.config.js (UPDATED)
// ============================================
/** @type {import('next').NextConfig} */
import path from 'path';

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

  // Fix monorepo/workspace warning
  turbopack: {
    root: path.join(__dirname),
  },
};

module.exports = nextConfig;