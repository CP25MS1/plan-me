//! PRODUCTION CRITICAL FILE
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Plan Me',
    short_name: 'Plan Me',
    description: 'A trip planning app that helps you organize your travels.',
    start_url: '/capstone25/cp25ms1/home',
    scope: '/capstone25/cp25ms1/',
    // start_url: '/',
    // scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#25cf7a',
    icons: [
      {
        src: '/capstone25/cp25ms1/images/icon-192x192.png',
        // src: '/images/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/capstone25/cp25ms1/images/icon-512x512.png',
        // src: '/images/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
