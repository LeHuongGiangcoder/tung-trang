'use client';

import React from 'react';
import { useLang } from '@/hooks/useLang';
import { COPY } from '@/lib/constants';
import { Heading, Subtitle, Body } from '@/components/ui/Typography';

// Dresscode palette, rows run blush → neutrals → greens
const PALETTE = [
  '#F6D8DD', '#DBAAB5', '#C98795',
  '#F3EDE7', '#E5DFCC', '#B29475',
  '#9BA271', '#717232', '#1F1B17',
];

// Schedule & dresscode, revealed to attending guests once their RSVP is in
export default function EventDetails() {
  const { lang } = useLang();
  const copy = COPY[lang].eventDetails;

  return (
    <div className="w-full mt-16 pt-16 border-t border-ink/10 flex flex-col items-center gap-20 animate-fade-in" style={{ animationDelay: '0.2s' }}>
      {/* Schedule */}
      <div className="w-full flex flex-col items-center">
        <Heading variant="h2" className="mb-4 text-center">
          {copy.schedule}
        </Heading>
        <div className="w-8 h-[1px] bg-ink/20 mb-12"></div>

        <div className="w-full flex flex-col gap-14 text-left">
          {copy.agenda.map((group) => (
            <div key={group.title} className="w-full flex flex-col">
              <div className="flex items-baseline justify-between gap-4 pb-4 mb-8 border-b border-ink/10">
                <Heading variant="h3" as="h3" className="italic">{group.title}</Heading>
                {group.venue && <Subtitle as="span" className="!tracking-[0.2em]">{group.venue}</Subtitle>}
              </div>

              <ol className="flex flex-col gap-8">
                {group.items.map((item) => (
                  <li key={item.time} className="flex items-center gap-5 md:gap-8">
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
                    <div className="w-[1px] h-10 bg-ink/20 shrink-0"></div>
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
        <Heading variant="h2" className="mb-4 text-center">
          {copy.dresscode}
        </Heading>
        <div className="w-8 h-[1px] bg-ink/20 mb-10"></div>

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
