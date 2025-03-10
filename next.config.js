/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force Next.js to use SWC for transforms even with custom Babel config
  experimental: {
    forceSwcTransforms: true,
  },
  // Disable static generation of pages that fetch data
  output: 'standalone',
  // Configure allowed image domains
  images: {
    domains: ['flagcdn.com'],
    // Optional: Add remote patterns for more specificity
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
        pathname: '**',
      },
    ],
  },
};

module.exports = nextConfig; 
