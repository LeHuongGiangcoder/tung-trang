'use client';

import { useState } from 'react';
import { useLang } from '@/hooks/useLang';
import { COPY, FLASHBACK_IMAGES, PILE_LAYOUT } from '@/lib/constants';
import { Heading } from '@/components/ui/Typography';

// Same prints as the sketch intro: the bench portrait sits at the bottom of the pile
const PHOTOS = ['/images/bench-portrait.webp', ...FLASHBACK_IMAGES];

// Tap-to-deal photo pile, echoing the intro montage for guests who skip it
export default function PhotoStack() {
  const { lang } = useLang();
  const copy = COPY[lang].photos;
  // Index of the top photo; 0 means only the bench portrait is showing
  const [top, setTop] = useState(0);
  const isLast = top === PHOTOS.length - 1;

  const advance = () => setTop((t) => (t === PHOTOS.length - 1 ? 0 : t + 1));

  return (
    <section id="story" className="scroll-mt-16 w-full max-w-5xl mx-auto px-5 md:px-10 pt-4 pb-16 md:pb-24 overflow-hidden grid grid-cols-1 md:grid-cols-2 items-center gap-12 md:gap-16">
      {/* Story text: above the photos on phones, to their right on desktop */}
      <div className="md:order-2 flex flex-col items-center md:items-start text-center md:text-left">
        <img src="/component/17.webp" alt="" loading="lazy" draggable={false} className="w-28 md:w-32 h-auto mix-blend-multiply mb-5 select-none" />
        <Heading variant="h2" className="mb-4">
          {copy.subtitle}
        </Heading>
        <div className="w-8 h-[1px] bg-ink/10 mb-10" />

        {/* Told like a quote: oversized faint opening mark, signed by the two of us */}
        <figure className="relative max-w-sm">
          <span aria-hidden className="absolute -top-9 left-1/2 -translate-x-1/2 md:left-0 md:-translate-x-5 font-display text-8xl leading-none text-ink/10 select-none">
            &ldquo;
          </span>
          <blockquote className="relative font-display italic font-light text-xl md:text-2xl leading-relaxed text-ink-soft">
            {copy.story}
          </blockquote>
          <figcaption className="mt-6 font-script text-2xl text-ink/70">
            Trang &amp; Tùng
          </figcaption>
        </figure>
      </div>

      <div className="md:order-1 flex flex-col items-center">
        <button
          type="button"
          onClick={advance}
          aria-label={isLast ? copy.restart : copy.hint}
          className="relative w-[58vw] max-w-[280px] md:max-w-[320px] aspect-[2/3] cursor-pointer select-none [-webkit-tap-highlight-color:transparent]"
        >
          {PHOTOS.map((src, i) => {
            const dealt = i <= top;
            // Bench portrait rests almost straight; the rest reuse the intro's tilts
            const t = i === 0 ? { r: -2, x: 0, y: 0 } : PILE_LAYOUT[(i - 1) % PILE_LAYOUT.length];
            return (
              <div
                key={src}
                className="absolute inset-0 bg-cream p-2 md:p-3 border border-ink/10 shadow-[0_10px_30px_-10px_rgba(31,27,23,0.45)]"
                style={{
                  opacity: dealt ? 1 : 0,
                  transform: dealt
                    ? `translate(${t.x * 0.6}px, ${t.y * 0.6}px) rotate(${t.r}deg)`
                    : `translate(${t.x * 0.6}px, ${t.y * 0.6 - 60}px) rotate(${t.r + (t.r >= 0 ? 10 : -10)}deg) scale(1.08)`,
                  transition: 'opacity 450ms var(--ease-smooth), transform 550ms cubic-bezier(0.34, 1.4, 0.5, 1)',
                }}
              >
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="block w-full h-full object-cover border border-ink/15"
                  draggable={false}
                />
              </div>
            );
          })}
        </button>

        <div className="mt-14 md:mt-16 flex flex-col items-center gap-2">
          <span className="font-display italic text-lg text-ink/60 leading-none">
            {top + 1} / {PHOTOS.length}
          </span>
          <span className="font-body text-[10px] tracking-[0.3em] uppercase text-ink-muted">
            {isLast ? copy.restart : copy.hint}
          </span>
        </div>
      </div>
    </section>
  );
}
