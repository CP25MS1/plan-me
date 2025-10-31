import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Sarabun } from "next/font/google";

const sarabun = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CP25MS1 Team - Under Construction",
  description:
    "Our website is currently under construction. We are working diligently to bring you an amazing experience. Stay tuned for updates!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#25cf7a" />
        <script src="https://cdn.jsdelivr.net/npm/@flaticon/flaticon-uicons@3.3.1/license.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@flaticon/flaticon-uicons@3.3.1/css/all/all.min.css"></link>
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className={`${sarabun.variable} antialiased`}>{children}</body>
    </html>
  );
}
