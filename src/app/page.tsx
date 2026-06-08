'use client';

import { useState } from 'react';
import Entrance from '@/components/interactive/Entrance';
import Nav from '@/components/ui/Nav';
import Hero from '@/components/sections/Hero';

export default function Home() {
  const [entranceDone, setEntranceDone] = useState(false);

  return (
    <main className="relative bg-cream text-ink">
      {!entranceDone && <Entrance onDone={() => setEntranceDone(true)} />}
      <Nav />
      <Hero startAnimation={entranceDone} />

      {/* Placeholder for next sections - so scroll has somewhere to land */}
      <section id="story" className="min-h-[60vh] flex items-center justify-center border-t border-ink/10">
        <p className="font-display italic text-ink-muted text-xl">
          More to come — story, countdown, e-visa, travel, timeline, dresscode, RSVP, thank you.
        </p>
      </section>
    </main>
  );
}
