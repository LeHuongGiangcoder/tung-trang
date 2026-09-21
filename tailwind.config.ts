import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#F5F2EA',
          deep: '#EBE6D8',
          light: '#FCFBF8',
        },
        ink: {
          DEFAULT: '#1F1B17',
          soft: '#3A332C',
          muted: '#807464',
        },
        tan: '#B8A584',
        // Blush from the dresscode palette, used for small decorative accents
        blush: {
          DEFAULT: '#C98795',
          soft: '#DBAAB5',
          light: '#F6D8DD',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '0.35', transform: 'scale(0.85) rotate(0deg)' },
          '50%': { opacity: '1', transform: 'scale(1.1) rotate(15deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        twinkle: 'twinkle 2.8s ease-in-out infinite',
        float: 'float 3.5s ease-in-out infinite',
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
