import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
  output: 'standalone',
  basePath: process.env.BASE_PATH || '',
};

// @ts-expect-error: next-pwa types conflict with Next.js types
export default withPWA(nextConfig);
