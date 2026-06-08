'use client';

import { useEffect, useState } from 'react';
import { useLang } from '@/hooks/useLang';
import { COPY, WEDDING } from '@/lib/constants';

interface HeroProps {
  startAnimation: boolean;
}

export default function Hero({ startAnimation }: HeroProps) {
  const { lang } = useLang();
  const copy = COPY[lang].hero;
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!startAnimation) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setRevealed(true)));
    return () => cancelAnimationFrame(id);
  }, [startAnimation]);

  const revealStyle = (index: number): React.CSSProperties => ({
    opacity: revealed ? 1 : 0,
    transform: revealed ? 'translateY(0)' : 'translateY(14px)',
    transition: 'opacity 1100ms var(--ease-out-quart), transform 1100ms var(--ease-out-quart)',
    transitionDelay: `${index * 140 + 120}ms`,
  });

  return (
    <section
      id="hero"
      className="relative min-h-[100svh] w-full flex items-center justify-center px-5 md:px-10 pt-24 md:pt-28 pb-20"
    >
      <div className="w-full max-w-3xl flex flex-col items-center text-center">
        <div
          style={revealStyle(0)}
          className="flex items-center justify-center gap-2 md:gap-3 w-full"
        >
          <img src="/component/left.png" alt="" className="w-16 md:w-28 h-auto mix-blend-multiply opacity-85 select-none" draggable={false} />
          <span className="font-body text-[10px] md:text-xs tracking-[0.45em] uppercase text-ink-muted shrink-0">
            {copy.eyebrow}
          </span>
          <img src="/component/right.png" alt="" className="w-16 md:w-28 h-auto mix-blend-multiply opacity-85 select-none" draggable={false} />
        </div>

        <div style={revealStyle(1)} className="mt-3 md:mt-5 flex items-center gap-3">
          <span className="block w-10 md:w-16 h-px bg-ink/30" />
          <Ornament />
          <span className="block w-10 md:w-16 h-px bg-ink/30" />
        </div>

        <h1
          style={revealStyle(2)}
          className="mt-4 md:mt-6 font-display font-light leading-[0.95] text-ink text-center"
        >
          <span className="block" style={{ fontSize: 'clamp(3rem, 11vw, 8rem)' }}>
            Tùng <span className="italic font-light text-ink-soft">&amp;</span> Trang
          </span>
        </h1>

        <div
          style={revealStyle(3)}
          className="mt-8 md:mt-12 w-full max-w-2xl md:max-w-4xl mix-blend-multiply"
        >
          <img
            src="/images/hero-map.webp"
            alt="Illustrated map from New York to Vietnam"
            className="w-full h-auto select-none"
            draggable={false}
          />
        </div>

        <div style={revealStyle(4)} className="mt-10 md:mt-12 flex flex-col items-center gap-3">
          <p className="font-display italic text-[clamp(1.05rem,3vw,1.5rem)] text-ink-soft">
            {copy.dateLine}
          </p>
          <span className="block w-16 h-px bg-ink/25" />
          <p className="font-body text-[10px] md:text-xs tracking-[0.4em] uppercase text-ink-muted">
            {copy.location}
          </p>
        </div>
      </div>

      <div
        style={revealStyle(5)}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span
          className="block w-px h-8 bg-ink/30"
          style={{ animation: 'scrollLine 2.4s ease-in-out infinite' }}
        />
      </div>

      <style>{`
        @keyframes scrollLine {
          0%, 100% { transform: scaleY(0.3); transform-origin: top; opacity: 0.3; }
          50% { transform: scaleY(1); opacity: 0.7; }
        }
      `}</style>
    </section>
  );
}

function Ornament() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="1.6" fill="#1F1B17" />
      <path
        d="M11 3 Q12 7 11 11 Q10 7 11 3 Z M11 19 Q10 15 11 11 Q12 15 11 19 Z M3 11 Q7 10 11 11 Q7 12 3 11 Z M19 11 Q15 12 11 11 Q15 10 19 11 Z"
        fill="#1F1B17"
        opacity="0.65"
      />
    </svg>
  );
}
