import type { Metadata, Viewport } from 'next';
import { display, body } from '@/lib/fonts';
import { LangProvider } from '@/hooks/useLang';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://tungtrang.gloweb.site'),
  title: 'Tung & Trang — 03.01.2027',
  description: 'We are getting married in Hanoi, Vietnam.',
  openGraph: {
    title: 'Tung & Trang',
    description: 'Save the date — 03 January 2027, Hanoi.',
    type: 'website',
    images: [
      {
        url: '/images/moment-06-street.webp',
        width: 1200,
        height: 800,
        alt: 'Tung & Trang',
      },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#EDE7DA',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
