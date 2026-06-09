'use client';

import { useState, useRef, useEffect } from 'react';
import Entrance from '@/components/interactive/Entrance';
import Nav from '@/components/ui/Nav';
import Hero from '@/components/sections/Hero';
import Visa from '@/components/sections/Visa';
import Travel from '@/components/sections/Travel';
import RSVP from '@/components/sections/RSVP';
import Button from '@/components/ui/Button';

export default function Home() {
  const [entranceDone, setEntranceDone] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioStarted, setAudioStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

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
      {!entranceDone && <Entrance onDone={() => setEntranceDone(true)} onSketchStart={handleSketchStart} />}
      <Nav />
      <Hero startAnimation={entranceDone} />
      <Visa />
      <Travel />
      <RSVP />

      {/* Audio Toggle */}
      <div className={`fixed bottom-6 right-6 z-40 ${entranceDone ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-1000`}>
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

      {/* Placeholder for next sections - so scroll has somewhere to land */}
      <section id="story" className="min-h-[60vh] flex items-center justify-center border-t border-ink/10">
        <p className="font-display italic text-ink-muted text-xl">
          More to come — story, countdown, travel, timeline, dresscode, RSVP, thank you.
        </p>
      </section>
    </main>
  );
}
