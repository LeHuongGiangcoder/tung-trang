'use client';

import { useState, useRef, useEffect } from 'react';
import Entrance from '@/components/interactive/Entrance';
import Nav from '@/components/ui/Nav';
import Hero from '@/components/sections/Hero';
import Visa from '@/components/sections/Visa';
import Travel from '@/components/sections/Travel';
import RSVP from '@/components/sections/RSVP';
import ThankYou from '@/components/sections/ThankYou';
import Button from '@/components/ui/Button';

export default function Home() {
  const [entranceDone, setEntranceDone] = useState(false);
  // Becomes true the moment the entrance starts fading out, so content crossfades in
  const [revealContent, setRevealContent] = useState(false);
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
        <Nav />
        <Hero startAnimation={revealContent} />
        <Visa />
        <Travel />
        <RSVP />

        {/* Audio Toggle */}
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            variant="circle"
            onClick={toggleAudio}
            aria-label={isPlaying ? 'Pause music' : 'Play music'}
          >
            {isPlaying ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="ml-0.5">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </Button>
        </div>

        <ThankYou />
      </div>
    </main>
  );
}
