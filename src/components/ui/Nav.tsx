'use client';

import { useState, useEffect } from 'react';
import { useLang } from '@/hooks/useLang';
import { COPY } from '@/lib/constants';

export default function Nav() {
  const { lang, setLang } = useLang();
  const nav = COPY[lang].nav;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const baseOverlay = "transition-all duration-500 pointer-events-auto";
  const scrolledEffect = "bg-white/60 border border-white/40 backdrop-blur-md shadow-[0_2px_10px_rgba(0,0,0,0.03)] rounded-full";
  
  const pillClass = `${baseOverlay} border ${
    scrolled ? `${scrolledEffect} px-3.5 py-1.5` : 'border-transparent bg-transparent px-3.5 py-1.5'
  }`;
  const logoPillClass = `${baseOverlay} flex items-center justify-center border ${
    scrolled ? `${scrolledEffect} p-2` : 'border-transparent bg-transparent p-2'
  }`;

  return (
    <nav className="fixed top-0 inset-x-0 z-30 pointer-events-none">
      <div className="mx-auto max-w-7xl px-3 md:px-6 py-4 md:py-6 flex items-center justify-between">
        {/* Monogram */}
        <div className={logoPillClass}>
          <a href="#hero" className="inline-block w-8 h-8 md:w-12 md:h-12 shrink-0">
            <img src="/images/logo.png" alt="T & T Logo" className="w-full h-full object-contain mix-blend-multiply" draggable={false} />
          </a>
        </div>

        {/* Center links - desktop only */}
        <div className={`hidden md:block ${pillClass}`}>
          <ul className="flex items-center gap-8 font-body text-[10px] tracking-[0.3em] uppercase text-ink-soft">
            <li><a href="#story" className="hover:text-ink transition-colors">{nav.story}</a></li>
            <li><a href="#details" className="hover:text-ink transition-colors">{nav.details}</a></li>
            <li><a href="#rsvp" className="hover:text-ink transition-colors">{nav.rsvp}</a></li>
          </ul>
        </div>

        {/* Lang toggle */}
        <div className={pillClass}>
          <div className="flex items-center gap-1.5 font-body text-[10px] tracking-[0.2em] uppercase">
            <button
              onClick={() => setLang('en')}
              className={lang === 'en' ? 'text-ink' : 'text-ink-muted hover:text-ink-soft transition-colors'}
              aria-pressed={lang === 'en'}
            >
              EN
            </button>
            <span className="text-ink-muted">/</span>
            <button
              onClick={() => setLang('vi')}
              className={lang === 'vi' ? 'text-ink' : 'text-ink-muted hover:text-ink-soft transition-colors'}
              aria-pressed={lang === 'vi'}
            >
              VI
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
