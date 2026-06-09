'use client';

import { useState } from 'react';
import { useLang } from '@/hooks/useLang';
import { COPY } from '@/lib/constants';
import { Heading, Subtitle, Body } from '@/components/ui/Typography';
import Button from '@/components/ui/Button';

export default function Visa() {
  const { lang } = useLang();
  const copy = COPY[lang].visa;

  return (
    <section id="visa" className="w-full max-w-7xl mx-auto px-5 md:px-10 py-24 md:py-32">
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16 md:mb-24">
        <Subtitle as="div" className="mb-6">
          {copy.subtitle}
        </Subtitle>
        <Heading variant="h2" className="mb-8">
          {copy.title}
        </Heading>
        <div className="flex flex-col gap-4 max-w-xl mx-auto px-4 md:px-0">
          <Body variant="regular" dangerouslySetInnerHTML={{ __html: copy.introParagraph1 }} />
        </div>

        <div className="mt-16 w-full max-w-lg mx-auto flex flex-col items-start text-left px-4 md:px-0">
          <Subtitle as="div" className="mb-8 w-full text-left">
            {copy.keyDetails.title}
          </Subtitle>
          <div className="flex flex-col gap-10 w-full">
            {copy.keyDetails.items.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-6 md:gap-10">
                <div className="w-16 md:w-20 shrink-0 text-center">
                  <span className="font-display italic text-[clamp(2.2rem,5.5vw,3.2rem)] text-ink-soft leading-[0.85] font-light whitespace-pre-line" dangerouslySetInnerHTML={{ __html: item.value.replace('-', '-<br/>') }} />
                </div>
                <div className="w-[1px] h-12 bg-ink/20 shrink-0"></div>
                <div className="flex flex-col gap-1.5">
                  <Subtitle as="span" className="!tracking-[0.2em]">{item.label}</Subtitle>
                  <Body variant="regular" as="span" className="italic">{item.description}</Body>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 flex flex-col md:flex-row items-center justify-center gap-6">
          <Subtitle as="span" className="!tracking-[0.2em]">
            {copy.applyLabel}
          </Subtitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="https://evisa.gov.vn" target="_blank" rel="noopener noreferrer">
              <Button variant="primary" className="w-full sm:w-auto">
                {copy.btnPortal}
              </Button>
            </a>
            <a href="https://vn.usembassy.gov/vietnamese-visas-and-entry-exit/" target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" className="w-full sm:w-auto">
                {copy.btnMoreInfo}
              </Button>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto flex flex-col px-4 md:px-0 divide-y divide-ink/10 border-y border-ink/10">
        <InfoBlock title={copy.whatYouNeed.title} items={copy.whatYouNeed.items} />
        <InfoBlock title={copy.afterApproval.title} items={copy.afterApproval.items} />
        <InfoBlock title={copy.arrivalTips.title} items={copy.arrivalTips.items} />
      </div>
    </section>
  );
}

function InfoBlock({ title, items }: { title: string; items: string[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col py-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left group"
      >
        <Heading variant="h3" className="transition-colors group-hover:text-ink">{title}</Heading>
        <span className="text-ink-soft text-2xl font-light w-8 h-8 flex items-center justify-center transition-transform duration-300" style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}>
          +
        </span>
      </button>
      
      <div 
        className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-6' : 'grid-rows-[0fr] opacity-0 mt-0'}`}
      >
        <div className="overflow-hidden">
          <ul className="flex flex-col gap-4">
            {items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-4">
                <span className="text-ink-muted/40 shrink-0 mt-2 text-[8px]">✦</span>
                <Body variant="regular" as="span">{item}</Body>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

