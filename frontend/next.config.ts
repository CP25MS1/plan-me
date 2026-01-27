//! PRODUCTION CRITICAL FILE
import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  basePath: '/capstone25/cp25ms1',
  assetPrefix: '/capstone25/cp25ms1',
  reactStrictMode: true,
  typedRoutes: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'ssl.gstatic.com',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

// @ts-expect-error: next-pwa types conflict with Next.js types
export default withPWA(nextConfig);
