import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#EDE7DA',
          deep: '#E4DCC9',
          light: '#F4F0E7',
        },
        ink: {
          DEFAULT: '#1F1B17',
          soft: '#3A332C',
          muted: '#807464',
        },
        tan: '#B8A584',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      letterSpacing: {
        widest: '0.25em',
        ultra: '0.4em',
      },
    },
  },
  plugins: [],
};
export default config;
