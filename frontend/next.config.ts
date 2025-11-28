import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const basePath = process.env.BASE_PATH!;

const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  output: 'standalone',
  basePath,
  assetPrefix: basePath,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },

  async rewrites() {
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL || '';
    return [
      {
        source: '/api/:path*',
        destination: `${backend}/:path*`,
      },
    ];
  },
};

// @ts-expect-error: next-pwa types conflict with Next.js types
export default withPWA(nextConfig);
