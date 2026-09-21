'use client';

import React, { useLayoutEffect, useRef, useState } from 'react';
import { useLang } from '@/hooks/useLang';
import { COPY, type AgendaMoment } from '@/lib/constants';
import { Heading, Subtitle, Body } from '@/components/ui/Typography';

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

// Schedule & dresscode, revealed to attending guests once their RSVP is in
export default function EventDetails() {
  const { lang } = useLang();
  const copy = COPY[lang].eventDetails;

  // Measure the knots so the string can be drawn through them at any screen size
  const timelineRef = useRef<HTMLDivElement>(null);
  const knotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [string, setString] = useState({ width: 0, height: 0, path: '' });

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
  }, [lang]);

  let itemIndex = 0;

  return (
    <div className="w-full mt-16 pt-16 border-t border-ink/10 flex flex-col items-center gap-24 animate-fade-in" style={{ animationDelay: '0.2s' }}>
      {/* Schedule */}
      <div className="w-full flex flex-col items-center">
        <div className="flex items-end justify-center gap-3 md:gap-5 mb-4">
          <img src="/component/left.webp" alt="" loading="lazy" draggable={false} className="w-10 md:w-12 h-auto mix-blend-multiply -rotate-6" />
          <Heading variant="h2" className="text-center">{copy.schedule}</Heading>
          <img src="/component/right.webp" alt="" loading="lazy" draggable={false} className="w-10 md:w-12 h-auto mix-blend-multiply rotate-6" />
        </div>
        <Divider className="mb-10" />

        <div ref={timelineRef} className="relative w-full">
          {/* The string */}
          <svg
            className="absolute inset-0 pointer-events-none text-ink/25"
            width={string.width}
            height={string.height}
            aria-hidden
          >
            <path d={string.path} fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>

          {copy.agenda.map((group) => (
            <div key={group.title} className="relative">
              {/* Group label sits on the string, its background hiding the line behind it */}
              <div className="relative z-10 flex justify-center py-6">
                <div className="bg-cream px-4 py-1 flex flex-col items-center gap-1">
                  <Heading variant="h3" as="h3" className="italic">{group.title}</Heading>
                  {group.venue && <Subtitle as="span" className="!tracking-[0.2em]">{group.venue}</Subtitle>}
                </div>
              </div>

              <ol>
                {group.items.map((item) => {
                  const idx = itemIndex++;
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
                        className="relative z-10 mx-auto w-9 h-9 md:w-11 md:h-11 rounded-full border border-ink/20 bg-cream-light flex items-center justify-center text-ink-muted text-[10px]"
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
          ))}
        </div>
      </div>

      {/* Dresscode */}
      <div className="w-full flex flex-col items-center">
        <Heading variant="h2" className="mb-4 text-center">
          {copy.dresscode}
        </Heading>
        <Divider className="mb-8" />

        <img src="/component/13.webp" alt="" loading="lazy" draggable={false} className="w-20 h-auto mix-blend-multiply mb-4" />

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
  );
}
