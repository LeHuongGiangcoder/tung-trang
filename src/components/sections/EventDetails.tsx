'use client';

import React, { useLayoutEffect, useRef, useState } from 'react';
import { useLang } from '@/hooks/useLang';
import { COPY, WEDDING, type AgendaMoment } from '@/lib/constants';
import { Heading, Subtitle, Body } from '@/components/ui/Typography';
import Toggle from '@/components/ui/Toggle';
import Button from '@/components/ui/Button';

// Dresscode palette, rows run blush → neutrals → greens
const PALETTE = [
  '#F6D8DD', '#DBAAB5', '#C98795',
  '#F3EDE7', '#E5DFCC', '#B29475',
  '#9BA271', '#717232', '#1F1B17',
];

// Ink sketch illustrating each agenda moment (public/component)
const MOMENT_ART: Record<AgendaMoment, string> = {
  checkin: '/component/5.webp',
  vows: '/component/7.webp',
  photos: '/component/8.webp',
  welcome: '/component/14.webp',
  ceremony: '/component/15.webp',
  dinner: '/component/16.webp',
  party: '/component/6.webp',
};

// Sparkles (✦) and dots scattered around the venue cloud, as % of the illustration.
// Kept clear of the cupids: left one sits in x 0–30% / y 35–100%, right one in x 72–98% / y 5–85%.
const FAIRY_DUST: { x: number; y: number; size: number; sparkle?: boolean; red?: boolean; delay: number }[] = [
  { x: 12, y: 14, size: 13, sparkle: true, red: true, delay: 0 },
  { x: 21, y: 27, size: 8, sparkle: true, delay: 1.1 },
  { x: 7, y: 31, size: 4, red: true, delay: 0.5 },
  { x: 26, y: 7, size: 3, delay: 1.8 },
  { x: 38, y: 22, size: 9, sparkle: true, red: true, delay: 0.6 },
  { x: 43, y: 13, size: 3, delay: 2.1 },
  { x: 65, y: 17, size: 7, sparkle: true, delay: 1.4 },
  { x: 34, y: 72, size: 3, red: true, delay: 0.9 },
  { x: 65, y: 78, size: 8, sparkle: true, delay: 2.3 },
  { x: 59, y: 86, size: 4, red: true, delay: 0.2 },
  { x: 86, y: 93, size: 10, sparkle: true, red: true, delay: 1.7 },
  { x: 94, y: 88, size: 3, delay: 1 },
  { x: 90, y: 4, size: 4, red: true, delay: 2.6 },
];

// How far (px) the string swings out between two knots
const STRING_SWAY = 22;

// Builds a path that weaves through each knot, swinging to alternate sides between them.
// Control points sit a third of the way along each gap, so the curve stays smooth through every knot.
function buildStringPath(x: number, knots: number[], height: number) {
  if (knots.length === 0) return '';
  const points = [0, ...knots, height];
  let d = `M ${x} ${points[0]}`;
  for (let i = 1; i < points.length; i++) {
    const from = points[i - 1];
    const to = points[i];
    const gap = to - from;
    const sway = (i % 2 === 0 ? -1 : 1) * STRING_SWAY;
    d += ` C ${x + sway} ${from + gap / 3}, ${x + sway} ${to - gap / 3}, ${x} ${to}`;
  }
  return d;
}

function Divider({ className = '' }: { className?: string }) {
  return <div className={`w-8 h-[1px] bg-ink/10 ${className}`}></div>;
}

// Venue, schedule & dresscode, shown to everyone right after the hero
export default function EventDetails() {
  const { lang } = useLang();
  const copy = COPY[lang].eventDetails;

  // Measure the knots so the string can be drawn through them at any screen size
  const timelineRef = useRef<HTMLDivElement>(null);
  const knotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [string, setString] = useState({ width: 0, height: 0, path: '' });

  // Which part of the day is shown: 0 = vows, 1 = ballroom celebration
  const [activeGroup, setActiveGroup] = useState(0);
  const group = copy.agenda[activeGroup];

  useLayoutEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;

    const measure = () => {
      const box = timeline.getBoundingClientRect();
      const knots = knotRefs.current
        .filter((el): el is HTMLDivElement => !!el)
        .map((el) => {
          const r = el.getBoundingClientRect();
          return r.top - box.top + r.height / 2;
        });
      setString({
        width: box.width,
        height: box.height,
        path: buildStringPath(box.width / 2, knots, box.height),
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(timeline);
    return () => observer.disconnect();
  }, [lang, activeGroup]);

  return (
    <section id="event-details" className="w-full max-w-7xl mx-auto px-5 md:px-10 py-24 md:py-32 border-t border-ink/10">
      <div className="max-w-xl mx-auto px-4 md:px-0 flex flex-col items-center text-center gap-16">
        {/* Venue */}
        <div className="w-full flex flex-col items-center">
          <Subtitle as="div" className="mb-1">{copy.venueLabel}</Subtitle>

          {/* Venue name set inside the cloud held by the two cupids (cloud centre ≈ 51.7% / 50%) */}
          <div className="relative w-full max-w-md">
            <img src="/component/venue.webp" alt="" draggable={false} className="w-full h-auto mix-blend-multiply" />

            {FAIRY_DUST.map((d, i) => (
              <span
                key={i}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{ left: `${d.x}%`, top: `${d.y}%` }}
                aria-hidden
              >
                <span
                  className={`block animate-twinkle leading-none ${d.red ? 'text-[#D81018]' : 'text-ink-muted'}`}
                  style={{ animationDelay: `${d.delay}s` }}
                >
                  {d.sparkle ? (
                    <span style={{ fontSize: d.size }}>✦</span>
                  ) : (
                    <span className="block rounded-full bg-current" style={{ width: d.size, height: d.size }} />
                  )}
                </span>
              </span>
            ))}

            <h3 className="absolute left-[51.7%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] font-script font-semibold text-ink text-[clamp(1.35rem,5.4vw,2.15rem)] leading-[1.02] text-center">
              <span className="sr-only">{copy.venueLines.join(' ')}</span>
              {copy.venueLines.map((line) => (
                <span key={line} className="block" aria-hidden>{line}</span>
              ))}
            </h3>
          </div>

          <a href={WEDDING.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-3">
            <Button variant="secondary">{copy.mapsBtn}</Button>
          </a>
        </div>

        {/* Schedule */}
        <div className="w-full pt-16 border-t border-ink/10 flex flex-col items-center">
          <div className="flex items-end justify-center gap-3 md:gap-5 mb-4">
            <img src="/component/left.webp" alt="" loading="lazy" draggable={false} className="w-10 md:w-12 h-auto mix-blend-multiply -rotate-6" />
            <Heading variant="h2" className="text-center">{copy.schedule}</Heading>
            <img src="/component/right.webp" alt="" loading="lazy" draggable={false} className="w-10 md:w-12 h-auto mix-blend-multiply rotate-6" />
          </div>
          <Divider className="mb-10" />

          <Toggle
            variant="segmented"
            options={copy.agenda.map((g, idx) => ({ label: g.title, value: idx }))}
            value={activeGroup}
            onChange={setActiveGroup}
          />
          <Subtitle as="div" className="!tracking-[0.2em] mt-4 h-4">{group.venue}</Subtitle>

          <div ref={timelineRef} key={activeGroup} className="relative w-full mt-4 animate-fade-in">
            {/* The string */}
            <svg
              className="absolute inset-0 pointer-events-none text-ink/25"
              width={string.width}
              height={string.height}
              aria-hidden
            >
              <path d={string.path} fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>

            <ol>
              {group.items.map((item, idx) => {
                const textLeft = idx % 2 === 0;

                const text = (
                  <div className={`flex flex-col gap-1.5 ${textLeft ? 'items-end text-right' : 'items-start text-left'}`}>
                    <span className="font-display italic text-[clamp(1.6rem,4.5vw,2.2rem)] text-ink-soft leading-none font-light">
                      {item.time}
                      {item.end && <span className="font-body not-italic text-[10px] tracking-[0.2em] text-ink-muted ml-1.5 align-middle">– {item.end}</span>}
                    </span>
                    <Subtitle as="span" className="!tracking-[0.2em] mt-1">{item.title}</Subtitle>
                    <Body variant="small" as="span" className="italic">{item.description}</Body>
                  </div>
                );

                const art = (
                  <div className={`flex ${textLeft ? 'justify-start' : 'justify-end'}`}>
                    <img
                      src={MOMENT_ART[item.moment]}
                      alt=""
                      loading="lazy"
                      draggable={false}
                      className="w-24 md:w-32 aspect-square object-contain mix-blend-multiply"
                    />
                  </div>
                );

                return (
                  <li key={item.time} className="grid grid-cols-[1fr_2.75rem_1fr] md:grid-cols-[1fr_3.5rem_1fr] items-center gap-x-3 md:gap-x-5 py-5">
                    {textLeft ? text : art}
                    <div
                      ref={(el) => { knotRefs.current[idx] = el; }}
                      className="relative z-10 mx-auto px-1 py-0.5 bg-cream text-ink-muted text-xs leading-none"
                      aria-hidden
                    >
                      ✦
                    </div>
                    {textLeft ? art : text}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        {/* Dresscode */}
        <div className="w-full pt-16 border-t border-ink/10 flex flex-col items-center">
          <Heading variant="h2" className="mb-4 text-center">
            {copy.dresscode}
          </Heading>
          <Divider className="mb-6" />

          <img src="/component/13.webp" alt="" loading="lazy" draggable={false} className="w-16 h-auto mix-blend-multiply mb-5" />

          <div className="grid grid-cols-3 gap-3 md:gap-4 w-full max-w-[280px] md:max-w-xs">
            {PALETTE.map((color) => (
              <div
                key={color}
                className="aspect-[3/4] rounded-2xl border border-ink/10"
                style={{ backgroundColor: color }}
                aria-hidden
              />
            ))}
          </div>

          <Body variant="regular" className="mt-10 max-w-sm text-center italic">
            {copy.dresscodeNote}
          </Body>
        </div>
      </div>
    </section>
  );
}
