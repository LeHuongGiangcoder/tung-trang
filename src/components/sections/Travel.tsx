'use client';

import { useEffect, useState, useRef } from 'react';
import { useLang } from '@/hooks/useLang';
import { COPY } from '@/lib/constants';
import { Heading, Subtitle, Body } from '@/components/ui/Typography';

export default function Travel() {
  const { lang } = useLang();
  const copy = COPY[lang].travel;
  const [isVisible, setIsVisible] = useState(false);
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

        {/* Right Column: Image */}
        <div 
          style={revealStyle(200)} 
          className="md:col-span-6 flex justify-center"
        >
          <div className="relative w-full max-w-md md:max-w-lg mix-blend-multiply">
            <img
              src="/images/vietnam.png"
              alt="Illustration of Vietnam"
              className="w-full h-auto object-contain select-none block"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
