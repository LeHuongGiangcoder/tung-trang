'use client';

import React from 'react';
import { useLang } from '@/hooks/useLang';
import { COPY, type AgendaIcon } from '@/lib/constants';
import { Heading, Subtitle, Body } from '@/components/ui/Typography';

// Dresscode palette, rows run blush → neutrals → greens
const PALETTE = [
  '#F6D8DD', '#DBAAB5', '#C98795',
  '#F3EDE7', '#E5DFCC', '#B29475',
  '#9BA271', '#717232', '#1F1B17',
];

// A slight, uneven tilt per swatch so the grid feels hand-placed
const TILTS = [-3, 1.5, -1, 2, -2, 1, -1.5, 2.5, -2];

// Hand-drawn style line icons, 24×24, stroked with currentColor
const ICON_PATHS: Record<AgendaIcon | 'glasses' | 'bow', React.ReactNode> = {
  heart: <path d="M12 20s-7-4.35-7-9.5A4 4 0 0 1 12 8a4 4 0 0 1 7 2.5C19 15.65 12 20 12 20z" />,
  rings: (
    <>
      <circle cx="9" cy="14.5" r="5" />
      <circle cx="15" cy="14.5" r="5" />
      <path d="M15 9.5 13.5 7.5 15 5.5l1.5 2z" />
    </>
  ),
  camera: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2.5" />
      <path d="M8.5 7 10 4.5h4L15.5 7" />
      <circle cx="12" cy="13.5" r="3.5" />
    </>
  ),
  sparkle: <path d="M12 3.5c.6 5.2 2.3 6.9 7.5 7.5-5.2.6-6.9 2.3-7.5 7.5-.6-5.2-2.3-6.9-7.5-7.5 5.2-.6 6.9-2.3 7.5-7.5z" />,
  cake: (
    <>
      <rect x="4" y="12" width="16" height="8" rx="1.5" />
      <path d="M4 15.5c1.3 1 2.7 1 4 0s2.7-1 4 0 2.7 1 4 0 2.7-1 4 0" />
      <path d="M12 12V8.5" />
      <path d="M12 4.5c.9.9.9 1.9 0 2.8-.9-.9-.9-1.9 0-2.8z" />
    </>
  ),
  dinner: (
    <>
      <path d="M6.5 3v5a2.5 2.5 0 0 0 5 0V3" />
      <path d="M9 3v18" />
      <path d="M17.5 3c-1.7 1.7-2.5 4.3-2.5 7.5h2.5V21" />
    </>
  ),
  music: (
    <>
      <path d="M9 18V5.5l10-2V16" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="16.5" cy="16" r="2.5" />
    </>
  ),
  glasses: (
    <>
      <g transform="rotate(-12 8 12)">
        <path d="M6 3h4l-.4 6.5a1.6 1.6 0 0 1-3.2 0z" />
        <path d="M8 11v8M6 19h4" />
      </g>
      <g transform="rotate(12 16 12)">
        <path d="M14 3h4l-.4 6.5a1.6 1.6 0 0 1-3.2 0z" />
        <path d="M16 11v8M14 19h4" />
      </g>
    </>
  ),
  bow: (
    <>
      <path d="M12 11c-2.2-3-6.3-4.8-7.3-2.8S7 13 12 11z" />
      <path d="M12 11c2.2-3 6.3-4.8 7.3-2.8S17 13 12 11z" />
      <path d="M11.2 11.8 8.5 19M12.8 11.8l2.7 7.2" />
      <circle cx="12" cy="11" r="1.2" />
    </>
  ),
};

const GROUP_ICONS: (keyof typeof ICON_PATHS)[] = ['rings', 'glasses'];

function Icon({ name, className = '' }: { name: keyof typeof ICON_PATHS; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

function Sparkle({ className = '', delay = 0 }: { className?: string; delay?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`absolute text-blush-soft motion-safe:animate-twinkle ${className}`}
      style={{ animationDelay: `${delay}s` }}
      aria-hidden
    >
      {ICON_PATHS.sparkle}
    </svg>
  );
}

// Hairline – heart – hairline, used under each heading
function HeartDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 text-blush ${className}`} aria-hidden>
      <span className="w-8 h-[1px] bg-ink/15"></span>
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 motion-safe:animate-float">
        {ICON_PATHS.heart}
      </svg>
      <span className="w-8 h-[1px] bg-ink/15"></span>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-col items-center px-8">
      <Sparkle className="w-3.5 h-3.5 -left-1 top-0" />
      <Sparkle className="w-2.5 h-2.5 right-0 top-6" delay={1.2} />
      <Heading variant="h2" className="mb-4 text-center">
        {children}
      </Heading>
      <HeartDivider />
    </div>
  );
}

// Schedule & dresscode, revealed to attending guests once their RSVP is in
export default function EventDetails() {
  const { lang } = useLang();
  const copy = COPY[lang].eventDetails;

  return (
    <div className="w-full mt-16 pt-16 border-t border-ink/10 flex flex-col items-center gap-20 animate-fade-in" style={{ animationDelay: '0.2s' }}>
      {/* Schedule */}
      <div className="w-full flex flex-col items-center">
        <SectionHeading>{copy.schedule}</SectionHeading>

        <div className="w-full flex flex-col gap-14 text-left mt-12">
          {copy.agenda.map((group, groupIdx) => (
            <div key={group.title} className="w-full flex flex-col">
              <div className="flex items-baseline justify-between gap-4 pb-4 mb-8 border-b border-ink/10">
                <div className="flex items-center gap-2.5">
                  <Icon name={GROUP_ICONS[groupIdx] ?? 'heart'} className="w-5 h-5 text-blush self-center" />
                  <Heading variant="h3" as="h3" className="italic">{group.title}</Heading>
                </div>
                {group.venue && <Subtitle as="span" className="!tracking-[0.2em]">{group.venue}</Subtitle>}
              </div>

              <ol className="flex flex-col gap-8">
                {group.items.map((item) => (
                  <li key={item.time} className="group flex items-center gap-4 md:gap-7">
                    <div className="w-16 md:w-20 shrink-0 flex flex-col items-center">
                      <span className="font-display italic text-[clamp(1.6rem,4vw,2.2rem)] text-ink-soft leading-none font-light">
                        {item.time}
                      </span>
                      {item.end && (
                        <span className="font-body text-[10px] tracking-[0.2em] text-ink-muted mt-1.5">
                          – {item.end}
                        </span>
                      )}
                    </div>
                    <div className="w-9 h-9 shrink-0 rounded-full bg-blush-light/60 border border-blush-soft/50 flex items-center justify-center text-blush transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                      <Icon name={item.icon} className="w-[18px] h-[18px]" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Subtitle as="span" className="!tracking-[0.2em]">{item.title}</Subtitle>
                      <Body variant="regular" as="span" className="italic">{item.description}</Body>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>

      {/* Dresscode */}
      <div className="w-full flex flex-col items-center">
        <SectionHeading>{copy.dresscode}</SectionHeading>

        <div className="relative mt-14">
          <Icon name="bow" className="absolute inset-x-0 mx-auto -top-9 w-9 h-9 text-blush motion-safe:animate-float" />
          <Sparkle className="w-4 h-4 -left-6 top-10" delay={0.6} />
          <Sparkle className="w-3 h-3 -right-5 top-1/2" delay={1.8} />
          <Sparkle className="w-2.5 h-2.5 -left-4 bottom-6" delay={2.4} />

          <div className="grid grid-cols-3 gap-3 md:gap-4 w-[260px] md:w-[300px]">
            {PALETTE.map((color, idx) => (
              <div
                key={color}
                className="aspect-[3/4] rounded-2xl border border-ink/10 shadow-[0_2px_8px_rgba(31,27,23,0.06)] rotate-[var(--tilt)] transition-transform duration-300 hover:rotate-0 hover:-translate-y-1 hover:scale-105"
                style={{ backgroundColor: color, '--tilt': `${TILTS[idx]}deg` } as React.CSSProperties}
                aria-hidden
              />
            ))}
          </div>
        </div>

        <Body variant="regular" className="mt-12 max-w-sm text-center italic">
          {copy.dresscodeNote}
        </Body>
        <Icon name="heart" className="mt-4 w-4 h-4 text-blush" />
      </div>
    </div>
  );
}
