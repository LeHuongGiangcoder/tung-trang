'use client';

import { useEffect, useState } from 'react';
import { useLang } from '@/hooks/useLang';
import { COPY, WEDDING } from '@/lib/constants';
import { Heading, Subtitle } from '@/components/ui/Typography';

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
      className="relative min-h-[100svh] w-full flex items-center justify-center px-5 md:px-10 pt-24 md:pt-28 pb-12"
    >
      <div className="w-full max-w-3xl flex flex-col items-center text-center">
        <div
          style={revealStyle(0)}
          className="flex items-center justify-center gap-2 md:gap-3 w-full"
        >
          <img src="/component/left.png" alt="" className="w-16 md:w-28 h-auto mix-blend-multiply opacity-85 select-none" draggable={false} />
          <Subtitle as="span" className="shrink-0 tracking-[0.45em]">
            {copy.eyebrow}
          </Subtitle>
          <img src="/component/right.png" alt="" className="w-16 md:w-28 h-auto mix-blend-multiply opacity-85 select-none" draggable={false} />
        </div>

        <div style={revealStyle(1)} className="mt-5 md:mt-5 flex items-center gap-3">
          <span className="block w-10 md:w-16 h-px bg-ink/30" />
          <Ornament />
          <span className="block w-10 md:w-16 h-px bg-ink/30" />
        </div>

        <Heading
          variant="h1"
          style={revealStyle(2)}
          className="mt-8 md:mt-6 text-center"
        >
          <span className="block" style={{ fontSize: 'clamp(3rem, 11vw, 8rem)' }}>
          Trang <span className="italic font-light text-ink-soft">&amp;</span> Tùng
          </span>
        </Heading>

        <div
          style={revealStyle(3)}
          className="relative mt-12 md:mt-12 w-full max-w-2xl md:max-w-4xl mix-blend-multiply"
        >
          {/* Map Background Layer */}
          <img
            src="/images/hero%20map%20back.webp"
            alt="Illustrated map background"
            className="w-full h-auto select-none block"
            draggable={false}
          />
          {/* Couple in Car Layer */}
          <img
            src="/images/hero%20map%20couple.png"
            alt="Illustrated couple in car"
            className="absolute top-[37%] left-[10%] w-[80%] h-auto select-none"
            style={{ animation: 'bounceCar 4.0s ease-in-out infinite' }}
            draggable={false}
          />
        </div>

        <div style={revealStyle(4)} className="mt-16 md:mt-12 flex flex-col items-center gap-4">
          <div className="flex items-center gap-4 text-ink-soft">
            {/* Left Column: Month & Year */}
            <div className="flex flex-col text-right font-display leading-tight">
              <span className="text-[clamp(1.2rem,2.8vw,1.5rem)] italic font-light lowercase">
                {lang === 'en' ? 'january' : 'tháng 01'}
              </span>
              <span className="text-[clamp(0.95rem,2.2vw,1.2rem)] font-light tracking-wider opacity-85">
                2027
              </span>
            </div>

            {/* Divider */}
            <div className="h-10 w-px bg-ink/25" />

            {/* Right Column: Day */}
            <div className="font-display text-[clamp(2.2rem,5.5vw,3.2rem)] leading-none font-light">
              03
            </div>
          </div>

          <Subtitle className="mt-2">
            {copy.location}
          </Subtitle>

          <Countdown />
        </div>

        {/* Scroll cue, kept in the flow so it always sits below the location */}
        <div style={revealStyle(5)} className="mt-10 flex flex-col items-center">
          <span
            className="block w-px h-8 bg-ink/30"
            style={{ animation: 'scrollLine 2.4s ease-in-out infinite' }}
          />
        </div>
      </div>

      <style>{`
        @keyframes scrollLine {
          0%, 100% { transform: scaleY(0.3); transform-origin: top; opacity: 0.3; }
          50% { transform: scaleY(1); opacity: 0.7; }
        }
        @keyframes bounceCar {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(-1deg); }
        }
      `}</style>
    </section>
  );
}

// Today's date on the Hanoi calendar, as YYYY-MM-DD
function hanoiToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
}

const pad = (n: number) => String(n).padStart(2, '0');

// Live countdown to the ceremony (dateISO carries the Hanoi offset, so it's the same moment
// for every guest). Computed in the browser since the page is prerendered, then fades in.
function Countdown() {
  const { lang } = useLang();
  const copy = COPY[lang].hero.countdown;
  const [msLeft, setMsLeft] = useState<number | null>(null);

  useEffect(() => {
    const target = new Date(WEDDING.dateISO).getTime();
    const update = () => setMsLeft(target - Date.now());
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const sparkle = (delay: number) => (
    <span className="animate-twinkle text-tan text-sm md:text-base leading-none" style={{ animationDelay: `${delay}s` }} aria-hidden>
      ✦
    </span>
  );

  let body: React.ReactNode = null;
  if (msLeft !== null && msLeft > 0) {
    const total = Math.floor(msLeft / 1000);
    const units = [
      { value: String(Math.floor(total / 86400)), label: copy.days },
      { value: pad(Math.floor((total % 86400) / 3600)), label: copy.hours },
      { value: pad(Math.floor((total % 3600) / 60)), label: copy.minutes },
      { value: pad(total % 60), label: copy.seconds },
    ];
    body = (
      <div className="flex items-center gap-3 md:gap-5">
        {sparkle(0)}
        <div className="flex items-start">
          {units.map((u, i) => (
            <div key={u.label} className="flex items-start">
              {i > 0 && <span className="w-px h-9 md:h-11 mt-1 mx-3 md:mx-5 bg-ink/15" aria-hidden />}
              <div className="flex flex-col items-center min-w-[2.6rem] md:min-w-[3.4rem]">
                <span className="font-display italic font-light text-ink text-[clamp(2rem,8vw,3.25rem)] leading-none tabular-nums">
                  {u.value}
                </span>
                <span className="mt-2 font-body text-[9px] md:text-[10px] tracking-[0.3em] uppercase text-ink-soft">
                  {u.label}
                </span>
              </div>
            </div>
          ))}
        </div>
        {sparkle(1.3)}
      </div>
    );
  } else if (msLeft !== null) {
    // From the ceremony until midnight in Hanoi it's "today", after that "married"
    const phrase = hanoiToday() === WEDDING.dateISO.slice(0, 10) ? copy.today : copy.married;
    body = (
      <div className="flex items-center gap-4">
        {sparkle(0)}
        <span className="font-display italic font-light text-ink text-[clamp(1.6rem,5vw,2.25rem)] leading-none">{phrase}</span>
        {sparkle(1.3)}
      </div>
    );
  }

  return (
    <div
      className="mt-6 flex flex-col items-center min-h-[4.5rem] transition-opacity duration-700"
      style={{ opacity: msLeft === null ? 0 : 1 }}
    >
      {body}
    </div>
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
