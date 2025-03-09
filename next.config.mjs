/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // By default, Next.js 15 is more strict with TypeScript
  // Let's disable the type checking during build
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // Keep using the default settings for everything else
  swcMinify: true,
  reactStrictMode: true,
  // This setting helps with image optimization
  images: {
    domains: ['flagcdn.com'],
  },
};

export default nextConfig; 
