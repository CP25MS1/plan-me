import { ReactNode } from 'react';
import Script from 'next/script';
import { Sarabun } from 'next/font/google';
import type { Metadata } from 'next';

import './globals.css';
import AppProvider from '../providers';
import Navbar from '@/components/navbar';

const sarabun = Sarabun({
  weight: ['300', '400', '700'],
  variable: '--font-sarabun',
  subsets: ['latin', 'latin-ext', 'thai'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CP25MS1 Team - Under Construction',
  description:
    'Our website is currently under construction. We are working diligently to bring you an amazing experience. Stay tuned for updates!',
};

const RootLayout = async ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  return (
    <html lang="th">
      <head>
        <meta name="theme-color" content="#25cf7a" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@flaticon/flaticon-uicons@3.3.1/css/all/all.min.css"
        />
        <link rel="manifest" href="/capstone25/cp25ms1/manifest.webmanifest" />
      </head>
      <body className={`${sarabun.variable} antialiased`}>
        <AppProvider>
          <div className="flex flex-col min-h-screen">
            <div className="grow">{children}</div>
            <Navbar />
          </div>
        </AppProvider>
        <Script
          src="https://cdn.jsdelivr.net/npm/@flaticon/flaticon-uicons@3.3.1/license.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
};

export default RootLayout;
