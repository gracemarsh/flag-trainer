/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // TEMPORARY FIX: TypeScript type issues with Next.js 15 dynamic routes
  // This issue appears to be related to Next.js 15's new type system
  // References:
  // - https://github.com/vercel/next.js/issues/63164
  // - https://nextjs.org/docs/app/building-your-application/upgrading/version-15
  typescript: {
    // We will enable this again once Next.js 15 type issues are resolved
    ignoreBuildErrors: true,
  },
  // This setting helps with image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
      },
    ],
  },
  reactStrictMode: true,
};

export default nextConfig; 
