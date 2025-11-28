import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PresetPhoto - Free Exam Photo Processor',
  description: 'Process photos for SSC, UPSC, IBPS, RRB, GATE, NEET and other government exams. 100% free, works offline, zero data exposure.',
  keywords: 'exam photo, passport photo, SSC photo, UPSC photo, IBPS photo, photo resizer, photo compressor, government exam photo',
  authors: [{ name: 'PresetPhoto' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PresetPhoto',
  },
  openGraph: {
    title: 'PresetPhoto - Free Exam Photo Processor',
    description: 'Process photos for government exams. 100% free, works offline.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#3B82F6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
