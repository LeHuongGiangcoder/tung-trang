import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { display, body } from '@/lib/fonts';
import { LangProvider } from '@/hooks/useLang';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://trangtung.gloweb.site'),
  title: 'Trang & Tung — 01.03.2027',
  description: 'We are getting married in Hanoi, Vietnam.',
  openGraph: {
    title: 'Trang & Tung',
    description: 'Save the date — 03 January 2027, Hanoi.',
    type: 'website',
    images: [
      {
        url: '/images/moment-06-street.webp',
        width: 1200,
        height: 800,
        alt: 'Trang & Tung',
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
        <Analytics />
      </body>
    </html>
  );
}
