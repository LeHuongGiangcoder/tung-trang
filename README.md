# Trang & Tung Wedding Website

Editorial, timeless wedding invitation built with Next.js 15, Tailwind, and a sketch-to-reveal entrance.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## What's built

- **Entrance** (`src/components/interactive/Entrance.tsx`)
  - White cream canvas covers a hidden sketch portrait (image 1)
  - User drags pointer/finger to "erase" — sketch reveals progressively underneath
  - At 55% of the screen touched, remaining mask auto-fades
  - Sketch crossfades into the real bench photo (image 9)
  - Rapid flashback through 6 couple moments (images 2–7, ~220ms each)
  - Whole entrance fades out into the hero
  - Body scroll locked until entrance completes
  - Press `Esc` during development to skip entrance
- **Hero** (`src/components/sections/Hero.tsx`)
  - Centered editorial column inspired by image 10
  - Ornament hairline, big serif name stack, italic ampersand
  - Hero map illustration (image 8) below names with `mix-blend-multiply` to sit on cream
  - Date, location, animated scroll hint
- **Nav** (`src/components/ui/Nav.tsx`)
  - Fixed top, EN/VI toggle on right, monogram left, anchors center (desktop)
- **i18n** via `useLang` context — English default, Vietnamese full translation in `src/lib/constants.ts`

## Design tokens

Defined in `src/app/globals.css` and `tailwind.config.ts`:

- Cream `#EDE7DA`, deeper cream `#E4DCC9`, light `#F4F0E7`
- Ink `#1F1B17`, soft `#3A332C`, muted `#807464`
- Display: Cormorant Garamond (latin + vietnamese subset)
- Body: Inter (latin + vietnamese subset)

## Next sections to add

Countdown, E-visa guide, Travel guide, Timeline, Dresscode, RSVP, Thank you.

## Notes

- Entrance is mobile-first: pointer events handle mouse + touch + pen, brush radius adapts to input type, `touch-action: none` prevents page scroll while sketching.
- Canvas uses DPR-aware scaling for crisp drawing.
- Hero map uses `mix-blend-multiply` so the line art sits naturally on cream without a hard white box.
- All copy lives in `src/lib/constants.ts` under `COPY.en` and `COPY.vi` for easy editing.
