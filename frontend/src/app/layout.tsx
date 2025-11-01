import Script from 'next/script';
import { Sarabun } from 'next/font/google';
import type { Metadata } from 'next';

import './globals.css';
import { Providers } from './providers';
import Navbar from '@/components/navbar';

const sarabun = Sarabun({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-sarabun',
  subsets: ['latin', 'latin-ext', 'thai'],
});

export const metadata: Metadata = {
  title: 'CP25MS1 Team - Under Construction',
  description:
    'Our website is currently under construction. We are working diligently to bring you an amazing experience. Stay tuned for updates!',
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="th">
      <head>
        <meta name="theme-color" content="#25cf7a" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@flaticon/flaticon-uicons@3.3.1/css/all/all.min.css"
        />
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className={`${sarabun.variable} antialiased`}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <main className="grow">{children}</main>
            <Navbar />
          </div>
        </Providers>
        <Script
          src="https://cdn.jsdelivr.net/npm/@flaticon/flaticon-uicons@3.3.1/license.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
};

export default RootLayout;
