/** @type {import('next').NextConfig} */
const nextConfig = {

  // output: 'export',
  // Enable React strict mode for better development
  reactStrictMode: true,
  // Image optimization settings
  images: {
    // unoptimized: true,
    domains: [
      'lenz-chatbot-assets.s3.us-east-2.amazonaws.com', // S3 bucket for chatbot assets
      'adsgrader-bucket.s3.us-east-2.amazonaws.com', // S3 bucket for attachments
      's3.amazonaws.com', // General S3 domain
      's3.us-east-2.amazonaws.com' // Regional S3 domain
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Experimental features
  experimental: {
    serverActions: {}, // Enable server actions with default options
  },

  // Enable page and layout caching
  generateEtags: true,

  // Configure powered by header
  poweredByHeader: false,
};

export default nextConfig;
