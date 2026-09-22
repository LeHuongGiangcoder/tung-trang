import { Cormorant_Garamond, Dancing_Script, Inter } from 'next/font/google';

export const display = Cormorant_Garamond({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-display',
  display: 'swap',
});

export const body = Inter({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  weight: ['300', '400', '500'],
  variable: '--font-body',
  display: 'swap',
});

// Playful script for the venue name in the cupids' cloud
export const script = Dancing_Script({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  weight: ['500', '600'],
  variable: '--font-script',
  display: 'swap',
});
