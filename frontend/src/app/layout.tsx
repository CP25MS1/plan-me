//! PRODUCTION CRITICAL FILE
import { ReactNode } from 'react';
import Script from 'next/script';
import { Sarabun } from 'next/font/google';
import type { Metadata } from 'next';

import './globals.css';
import AppProvider from '../providers';
import Navbar from '@/components/navbar';
import ServiceWorkerRegistration from '@/components/service-worker-registration';
// import PullToRefresh from '@/components/pull-to-refresh';

const sarabun = Sarabun({
  weight: ['300', '400', '700'],
  variable: '--font-sarabun',
  subsets: ['latin', 'latin-ext', 'thai'],
  display: 'swap',
});

const planMeLogoPath = '/capstone25/cp25ms1/images/plan-me-logo.png';
// const planMeLogoPath = '/images/plan-me-logo.png';

export const metadata: Metadata = {
  title: 'PLAN ME',
  description: 'Plan your trip easily and efficiently with PLAN ME.',
};

const manifestPath = '/capstone25/cp25ms1/manifest.webmanifest';
// const manifestPath = '/manifest.webmanifest';

const RootLayout = async ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  return (
    <html lang="th">
      <head>
        <meta name="theme-color" content="#25cf7a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@flaticon/flaticon-uicons@3.3.1/css/all/all.min.css"
        />
        <link rel="manifest" href={manifestPath} />
        <link rel="apple-touch-icon" href={planMeLogoPath} />
      </head>
      <body className={`${sarabun.variable} antialiased`}>
        {/* <PullToRefresh /> */}
        <AppProvider>
          <div className="flex flex-col min-h-screen">
            <div className="grow">{children}</div>
            <Navbar />
          </div>
        </AppProvider>
        <ServiceWorkerRegistration />
        <Script
          src="https://cdn.jsdelivr.net/npm/@flaticon/flaticon-uicons@3.3.1/license.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
};

export default RootLayout;
