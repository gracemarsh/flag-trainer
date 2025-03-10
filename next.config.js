/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force Next.js to use SWC for transforms even with custom Babel config
  experimental: {
    forceSwcTransforms: true,
  },
  // Disable static generation of pages that fetch data
  output: 'standalone',
};

module.exports = nextConfig; 
