import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const basePath = process.env.BASE_PATH || '';

const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  output: 'standalone',
  basePath,
  assetPrefix: basePath,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};

// @ts-expect-error: next-pwa types conflict with Next.js types
export default wit;
