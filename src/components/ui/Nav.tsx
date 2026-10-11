'use client';

import { useState, useEffect } from 'react';
import { useLang } from '@/hooks/useLang';
import { COPY } from '@/lib/constants';
import Toggle, { ToggleOption } from '@/components/ui/Toggle';

interface NavProps {
  // Background music state, owned by the page; the toggle lives here so it's easy to spot
  isPlaying: boolean;
  onToggleAudio: () => void;
}

export default function Nav({ isPlaying, onToggleAudio }: NavProps) {
  const { lang, setLang } = useLang();
  const nav = COPY[lang].nav;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Section anchors, in page order
  const links = [
    { href: '#story', label: nav.story },
    { href: '#details', label: nav.details },
    { href: '#rsvp', label: nav.rsvp },
    { href: '#travel', label: nav.travel },
  ];

  const langOptions: ToggleOption<'en' | 'vi'>[] = [
    { label: 'EN', value: 'en' },
    { label: 'VI', value: 'vi' },
  ];

  return (
    // Lifted above the page content while the mobile menu is open
    <nav className={`fixed top-0 inset-x-0 pointer-events-none ${mobileMenuOpen ? 'z-[60]' : 'z-30'}`}>
      {/* One frosted, see-through bar floating at the top, the same before and after scrolling */}
      <div className="px-3 md:px-6 pt-3 md:pt-4">
        <div className="pointer-events-auto mx-auto max-w-5xl flex items-center justify-between gap-3 rounded-full border border-white/50 bg-white/55 backdrop-blur-md shadow-[0_8px_30px_rgba(31,27,23,0.08)] pl-2 pr-2 md:pl-3 md:pr-3 py-1.5">
          {/* Monogram + music toggle */}
          <div className="flex items-center gap-1.5 md:gap-2">
            <a href="#hero" className="inline-block w-9 h-9 md:w-10 md:h-10 shrink-0">
              <img src="/images/logo.png" alt="T & T Logo" className="w-full h-full object-contain mix-blend-multiply" draggable={false} />
            </a>

            <button
              type="button"
              onClick={onToggleAudio}
              aria-label={isPlaying ? 'Pause music' : 'Play music'}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-ink/10 bg-white/70 text-ink hover:bg-white transition-colors"
            >
              {isPlaying ? (
                // Little equalizer: reads as "music is playing" at a glance
                <span className="flex items-end gap-[2px] h-3" aria-hidden>
                  {[0, 0.25, 0.5].map((delay) => (
                    <span
                      key={delay}
                      className="w-[2px] h-full bg-current rounded-full origin-bottom"
                      style={{ animation: `eqBar 900ms ease-in-out ${delay}s infinite` }}
                    />
                  ))}
                </span>
              ) : (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="ml-0.5">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
            </button>
          </div>

          {/* Section links - desktop only */}
          <ul className="hidden md:flex items-center gap-4 lg:gap-7 whitespace-nowrap font-body text-[10px] tracking-[0.2em] lg:tracking-[0.25em] uppercase text-ink-soft">
            {links.map((link) => (
              <li key={link.href}><a href={link.href} className="hover:text-ink transition-colors">{link.label}</a></li>
            ))}
          </ul>

          {/* Lang toggle & mobile menu button */}
          <div className="flex items-center gap-1">
            <div className="px-2.5 py-1">
              <Toggle
                options={langOptions}
                value={lang}
                onChange={setLang}
                variant="plain"
              />
            </div>

            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-full text-ink hover:text-ink-soft transition-colors"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="4" y1="9" x2="20" y2="9" />
                <line x1="4" y1="15" x2="20" y2="15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay. Overhangs the viewport by 6rem top and bottom (padded back in) so it
          also covers the strips behind mobile browser toolbars as they grow and shrink. */}
      <div 
        className={`fixed inset-x-0 -top-24 -bottom-24 py-24 bg-[#F5F2EA]/95 backdrop-blur-xl z-50 flex flex-col items-center justify-center transition-all duration-500 md:hidden pointer-events-auto ${
          mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <button 
          onClick={() => setMobileMenuOpen(false)}
          className="absolute top-[7.5rem] right-6 p-4 text-ink-soft hover:text-ink transition-colors"
          aria-label="Close menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="6" y1="18" x2="18" y2="6" />
          </svg>
        </button>

        <ul className="flex flex-col items-center gap-10 font-display text-2xl md:text-3xl tracking-widest uppercase text-ink-soft">
          {links.map((link) => (
            <li key={link.href}><a href={link.href} onClick={() => setMobileMenuOpen(false)} className="hover:text-ink transition-colors">{link.label}</a></li>
          ))}
        </ul>
        
        {/* Subtle decorative line */}
        <div className="absolute bottom-40 w-px h-16 bg-ink/20"></div>
      </div>
    </nav>
  );
}
