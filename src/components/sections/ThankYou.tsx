'use client';

import React from 'react';
import { useLang } from '@/hooks/useLang';
import { COPY } from '@/lib/constants';
import { Heading, Body } from '@/components/ui/Typography';

export default function ThankYou() {
  const { lang } = useLang();
  const copy = COPY[lang].thankYou;

  return (
    <section 
      id="thank-you" 
      className="w-full max-w-7xl mx-auto px-5 md:px-10 py-24 md:py-32 flex flex-col items-center justify-center text-center border-t border-ink/10"
    >
      <style>{`
        @keyframes floatCupid {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(1.5deg); }
        }
        .animate-float-cupid {
          animation: floatCupid 5s ease-in-out infinite;
        }
      `}</style>

      {/* Floating Cupid Illustration */}
      <div className="animate-float-cupid w-44 h-44 md:w-52 md:h-52 mb-6 select-none pointer-events-none">
        <img 
          src="/component/3.png" 
          alt="Cupid illustration" 
          className="w-full h-full object-contain mix-blend-multiply"
          draggable={false}
        />
      </div>

      {/* Heading */}
      <Heading variant="h2" className="mb-6">
        {copy.title}
      </Heading>

      {/* Body Text */}
      <div className="max-w-md mx-auto">
        <Body variant="regular" className="text-ink-soft leading-relaxed">
          {copy.body}
        </Body>
      </div>
    </section>
  );
}
