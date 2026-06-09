'use client';

import { useEffect, useState, useRef } from 'react';
import { useLang } from '@/hooks/useLang';
import { COPY } from '@/lib/constants';
import { Heading, Subtitle, Body } from '@/components/ui/Typography';

export default function Travel() {
  const { lang } = useLang();
  const copy = COPY[lang].travel;
  const [isVisible, setIsVisible] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showHanoiDetails, setShowHanoiDetails] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Show Hanoi details card automatically after zoom animation finishes
  useEffect(() => {
    if (isZoomed) {
      const timer = setTimeout(() => setShowHanoiDetails(true), 800);
      return () => clearTimeout(timer);
    } else {
      setShowHanoiDetails(false);
    }
  }, [isZoomed]);

  const revealStyle = (delay: number): React.CSSProperties => ({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.99)',
    transition: 'opacity 1200ms var(--ease-out-quart), transform 1200ms var(--ease-out-quart)',
    transitionDelay: `${delay}ms`,
  });

  return (
    <section 
      id="travel" 
      ref={sectionRef} 
      className="w-full max-w-7xl mx-auto px-5 md:px-10 py-24 md:py-32 overflow-hidden border-t border-ink/10"
    >
      <style>{`
        @keyframes finger-tap {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.95;
          }
          50% {
            transform: translate(-3px, -3px) scale(0.85);
            opacity: 1;
          }
        }
        @keyframes pulse-ring {
          0% {
            transform: scale(0.4);
            opacity: 0;
          }
          50% {
            opacity: 0.45;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }
        .animate-tap {
          animation: finger-tap 1.6s ease-in-out infinite;
        }
        .animate-pulse-ring {
          animation: pulse-ring 1.6s cubic-bezier(0.215, 0.610, 0.355, 1) infinite;
        }
      `}</style>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-center px-4 md:px-0">
        {/* Left Column: Text */}
        <div 
          style={revealStyle(0)} 
          className="md:col-span-6 flex flex-col items-center md:items-start text-center md:text-left"
        >
          <Subtitle as="div" className="mb-4">
            {copy.subtitle}
          </Subtitle>
          <Heading variant="h2" className="mb-6">
            {copy.title}
          </Heading>
          <div className="w-12 h-[1px] bg-ink/20 mb-8 hidden md:block"></div>
          <div className="max-w-md">
            <Body variant="large" className="text-ink-soft leading-relaxed" dangerouslySetInnerHTML={{ __html: copy.body }} />
          </div>
        </div>

        {/* Right Column: Image Frame */}
        <div 
          style={revealStyle(200)} 
          className="md:col-span-6 flex justify-center w-full"
        >
          <div 
            onClick={() => {
              setIsZoomed(!isZoomed);
              setHasInteracted(true);
            }}
            className={`relative w-full max-w-md overflow-hidden rounded-2xl p-6 bg-white/20 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.02)] select-none transition-all duration-500 hover:shadow-[0_6px_30px_rgba(0,0,0,0.04)] ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
          >
            <div className="relative overflow-hidden aspect-[3/4] w-full flex items-center justify-center">
              {/* Zoomable Wrapper Container */}
              <div 
                className="relative w-full h-full"
                style={{
                  transform: isZoomed ? 'scale(1.85) translateY(-10%)' : 'scale(1) translateY(0)',
                  transformOrigin: '50% 15%',
                  transition: 'transform 1000ms var(--ease-out-quart)',
                }}
              >
                <img
                  src="/images/vietnam.png"
                  alt="Illustration of Vietnam"
                  className="w-full h-full object-contain select-none block mix-blend-multiply"
                  draggable={false}
                />
                
                {/* Hanoi Location Pin */}
                {isZoomed && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowHanoiDetails(true);
                    }}
                    className="absolute z-20 flex items-center justify-center cursor-pointer transition-opacity duration-500"
                    style={{ 
                      top: '20%', 
                      left: '43%',
                      transform: 'translate(-50%, -85%) scale(0.54)', // Counteract scale(1.85) so pin size remains 1:1 on screen
                      transformOrigin: 'bottom center',
                    }}
                  >
                    {/* Pulsing ring underneath */}
                    <span className="absolute bottom-0 inline-flex h-8 w-8 rounded-full bg-tan/40 animate-ping -translate-y-2"></span>
                    
                    {/* Map Pin SVG */}
                    <svg 
                      width="28" 
                      height="28" 
                      viewBox="0 0 24 24" 
                      fill="currentColor" 
                      className="text-tan drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] stroke-white stroke-[1.5]"
                    >
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>
            
            {/* Hand Tap Hint */}
            {!hasInteracted && isVisible && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="relative flex items-center justify-center w-16 h-16">
                  {/* Pulse Rings */}
                  <div className="absolute w-12 h-12 rounded-full border border-ink/30 bg-ink/5 animate-pulse-ring"></div>
                  <div className="absolute w-12 h-12 rounded-full border border-ink/10 bg-ink/5 animate-pulse-ring" style={{ animationDelay: '0.8s' }}></div>
                  
                  {/* Hand Pointer */}
                  <div className="relative text-ink animate-tap translate-x-3 translate-y-3">
                    <svg 
                      width="28" 
                      height="28" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M12 11V6a1.5 1.5 0 0 1 3 0v5" />
                      <path d="M8 11v-2a1.5 1.5 0 0 1 3 0v2" />
                      <path d="M15 11V9.5a1.5 1.5 0 0 1 3 0v1.5" />
                      <path d="M5 14a5 5 0 0 1 5-5h1a1 1 0 0 1 1 1v4" />
                      <path d="M18 11a1.5 1.5 0 0 1 1.5 1.5v3a5.5 5.5 0 0 1-11 0V14" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Status indicator badge */}
            <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm border border-ink/10 w-8 h-8 rounded-full flex items-center justify-center text-ink-soft opacity-60 hover:opacity-100 transition-opacity duration-300">
              {isZoomed ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  <line x1="11" y1="8" x2="11" y2="14"></line>
                  <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
              )}
            </div>

            {/* Hanoi Detail Card Overlay */}
            <div 
              onClick={(e) => e.stopPropagation()} // Prevent clicking card from zooming out
              className={`absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-ink/10 p-4 transition-transform duration-500 ease-out z-30 flex flex-col gap-3 ${showHanoiDetails ? 'translate-y-0' : 'translate-y-full'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="font-display italic text-lg text-ink font-light leading-tight">
                    {lang === 'en' ? 'Hanoi Capital' : 'Thủ đô Hà Nội'}
                  </span>
                  <span className="text-[10px] text-ink-muted uppercase tracking-wider font-light mt-0.5">
                    {lang === 'en' ? 'Where the wedding takes place' : 'Nơi tổ chức đám cưới của chúng mình'}
                  </span>
                </div>
                <button 
                  onClick={() => setShowHanoiDetails(false)}
                  className="w-6 h-6 rounded-full hover:bg-ink/5 flex items-center justify-center text-ink-soft/60 hover:text-ink transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              {/* YouTube Video Embed Link with Custom Preview Image */}
              <a 
                href="https://www.youtube.com/watch?v=u9VswvjJtfI" 
                target="_blank" 
                rel="noopener noreferrer"
                className="relative group w-full aspect-video rounded-lg overflow-hidden border border-ink/10 block shadow-sm hover:shadow transition-shadow duration-300"
              >
                {/* YouTube Thumbnail Preview */}
                <img 
                  src="https://img.youtube.com/vi/u9VswvjJtfI/hqdefault.jpg" 
                  alt="Explore Hanoi YouTube Video" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                />
                
                {/* Black Overlay on Hover */}
                <div className="absolute inset-0 bg-ink/20 opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>

                {/* Pulsing Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/95 shadow-md flex items-center justify-center text-ink-soft transition-transform duration-300 group-hover:scale-110">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                </div>

                {/* Subtitle overlay */}
                <div className="absolute bottom-2 left-3 text-[10px] text-white/90 uppercase tracking-widest bg-ink/40 px-2 py-0.5 rounded backdrop-blur-[2px]">
                  {lang === 'en' ? 'Click to explore' : 'Nhấp để khám phá'}
                </div>
              </a>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
