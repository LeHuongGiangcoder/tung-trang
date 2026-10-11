'use client';

import { useState, useRef, useEffect } from 'react';
import Entrance from '@/components/interactive/Entrance';
import Nav from '@/components/ui/Nav';
import Hero from '@/components/sections/Hero';
import PhotoStack from '@/components/sections/PhotoStack';
import EventDetails from '@/components/sections/EventDetails';
import Visa from '@/components/sections/Visa';
import Travel from '@/components/sections/Travel';
import RSVP from '@/components/sections/RSVP';
import ThankYou from '@/components/sections/ThankYou';

// The whole invitation page. skipIntro opens straight on the hero with no sketch entrance,
// for direct links like /schedule.
export default function HomePage({ skipIntro = false }: { skipIntro?: boolean }) {
  const [entranceDone, setEntranceDone] = useState(skipIntro);
  // Becomes true the moment the entrance starts fading out, so content crossfades in
  const [revealContent, setRevealContent] = useState(skipIntro);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioStarted, setAudioStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Always start at the top on (re)load so the entrance plays from the Hero,
  // instead of the browser restoring the previous scroll position.
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  const handleSketchStart = () => {
    if (!audioStarted && audioRef.current) {
      audioRef.current.currentTime = 10;
      audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
      setAudioStarted(true);
      setIsPlaying(true);
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.error(e));
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    
    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, []);

  const toggleAudio = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  return (
    <main className="relative bg-cream text-ink">
      <audio ref={audioRef} src="/song.mp4" loop preload="auto" />
      {!entranceDone && (
        <Entrance
          onDone={() => setEntranceDone(true)}
          onReveal={() => setRevealContent(true)}
          onSketchStart={handleSketchStart}
        />
      )}

      {/* Everything else stays hidden until the entrance starts fading out, so the
          sketch overlay owns the whole screen (no content peeking on mobile), then
          crossfades in as the overlay fades away. */}
      <div className={`transition-opacity duration-1000 ${revealContent ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <Nav isPlaying={isPlaying} onToggleAudio={toggleAudio} />
        <Hero startAnimation={revealContent} />
        <PhotoStack />
        <EventDetails />
        <RSVP />
        <Visa />
        <Travel />

        <ThankYou />
      </div>
    </main>
  );
}
