import withPWAInit from 'next-pwa';
import i18n from './next-i18next.config';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  output: 'standalone',
  basePath: process.env.BASE_PATH || '',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  i18n,
};

// @ts-expect-error: next-pwa types conflict with Next.js types
export default withPWA(nextConfig);
