'use client';

import React from 'react';
import { useLang } from '@/hooks/useLang';
import { COPY } from '@/lib/constants';
import { Heading, Subtitle, Body } from '@/components/ui/Typography';

export default function EventDetails() {
  const { lang } = useLang();
  const copy = COPY[lang].eventDetails;

  return (
    <section 
      id="event-details" 
      className="w-full max-w-7xl mx-auto px-5 md:px-10 py-24 md:py-32 flex flex-col items-center justify-center border-t border-ink/10"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 w-full max-w-4xl text-center">
        {/* Schedule */}
        <div className="flex flex-col items-center">
          <Heading variant="h2" className="mb-4 text-ink-soft opacity-40">
            {copy.schedule}
          </Heading>
          <div className="w-8 h-[1px] bg-ink/10 mb-6"></div>
          <Subtitle className="tracking-[0.3em] opacity-60">
            {copy.comingSoon}
          </Subtitle>
        </div>

        {/* Dresscode */}
        <div className="flex flex-col items-center">
          <Heading variant="h2" className="mb-4 text-ink-soft opacity-40">
            {copy.dresscode}
          </Heading>
          <div className="w-8 h-[1px] bg-ink/10 mb-6"></div>
          <Subtitle className="tracking-[0.3em] opacity-60">
            {copy.comingSoon}
          </Subtitle>
        </div>
      </div>
    </section>
  );
}
