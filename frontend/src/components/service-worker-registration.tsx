//! PRODUCTION CRITICAL FILE
'use client';

import { useEffect } from 'react';

const SW_PATH = '/capstone25/cp25ms1/sw.js';
const SW_SCOPE = '/capstone25/cp25ms1/';
// const SW_PATH = '/sw.js';
// const SW_SCOPE = '/';

/**
 * Manually registers the service worker for PWA support.
 *
 * next-pwa@5.6.0 generates `sw.js` at build time but its auto-registration
 * script does not work with Next.js 15 App Router, so we register manually.
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      navigator.serviceWorker
        .register(SW_PATH, { scope: SW_SCOPE })
        .then((registration) => {
          console.log('SW registered, scope:', registration.scope);
        })
        .catch((error) => {
          console.error('SW registration failed:', error);
        });
    }
  }, []);

  return null;
}
