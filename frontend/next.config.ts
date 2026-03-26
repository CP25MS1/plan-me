//! PRODUCTION CRITICAL FILE
import withPWAInit from 'next-pwa';
import defaultRuntimeCaching from 'next-pwa/cache';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    // SSE streams must never be cached/intercepted by Workbox (breaks streaming + EventSource).
    { urlPattern: /\/api\/realtime\//, handler: 'NetworkOnly', options: { cacheName: 'realtime-sse' } },
    ...defaultRuntimeCaching,
  ],
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

export default withPWA(nextConfig);
