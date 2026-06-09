'use client';

import React, { useState } from 'react';
import { useLang } from '@/hooks/useLang';
import { COPY } from '@/lib/constants';
import { Heading, Subtitle, Body } from '@/components/ui/Typography';
import Button from '@/components/ui/Button';

export default function RSVP() {
  const { lang } = useLang();
  const copy = COPY[lang].rsvp;

  const [fullName, setFullName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [validationError, setValidationError] = useState('');
  const [submitError, setSubmitError] = useState('');

  const handleBlur = () => {
    if (!fullName) return;
    // Capitalize first letters of each word
    const formatted = fullName
      .trim()
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    setFullName(formatted);
    setValidationError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Re-verify and format on submit
    const trimmed = fullName.trim();
    if (!trimmed) {
      setValidationError(copy.errorRequired);
      return;
    }

    // Capitalize again just in case
    const formatted = trimmed
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    setFullName(formatted);
    setValidationError('');
    setSubmitError('');
    setStatus('loading');

    try {
      const response = await fetch(
        '/api/rsvp',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fullName: formatted }),
        }
      );

      const result = await response.json().catch(() => null);

      if (response.ok && result?.success) {
        const n8nData = result.data;
        
        // n8n returns empty array [] or empty object {} or null if matching name node had 0 items
        let isMatched = false;
        if (n8nData) {
          if (Array.isArray(n8nData)) {
            // It could be an array of matching rows, must have at least 1 item and it shouldn't be empty
            isMatched = n8nData.length > 0 && Object.keys(n8nData[0] || {}).length > 0;
          } else if (typeof n8nData === 'object') {
            isMatched = Object.keys(n8nData).length > 0;
          } else if (typeof n8nData === 'string') {
            isMatched = n8nData.trim().length > 0 && !n8nData.toLowerCase().includes('not found') && !n8nData.toLowerCase().includes('error');
          }
        }

        if (isMatched) {
          setStatus('success');
        } else {
          setSubmitError(copy.errorNotFound);
          setStatus('error');
        }
      } else {
        setSubmitError(result?.error || copy.errorWebhook);
        setStatus('error');
      }
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      setSubmitError(copy.errorWebhook);
      setStatus('error');
    }
  };

  return (
    <section 
      id="rsvp" 
      className="w-full max-w-7xl mx-auto px-5 md:px-10 py-24 md:py-32 border-t border-ink/10"
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>

      <div className="max-w-xl mx-auto px-4 md:px-0 flex flex-col items-center text-center">
        <Subtitle as="div" className="mb-6">
          {copy.subtitle}
        </Subtitle>
        <Heading variant="h2" className="mb-6">
          {copy.title}
        </Heading>
        
        {status === 'success' ? (
          <div className="mt-8 p-8 border border-ink/10 rounded-2xl bg-white/20 backdrop-blur-sm shadow-sm w-full flex flex-col items-center gap-4 animate-fade-in">
            <svg 
              width="40" 
              height="40" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-tan animate-fade-in"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <Body variant="large" className="text-ink-soft">
              {copy.successMsg}
            </Body>
          </div>
        ) : (
          <div className="w-full mt-6">
            <Body variant="regular" className="mb-10 text-ink-muted leading-relaxed">
              {copy.description}
            </Body>
            
            <form onSubmit={handleSubmit} className="w-full flex flex-col items-start gap-8 text-left">
              <div className="w-full flex flex-col gap-2.5">
                <label 
                  htmlFor="fullName" 
                  className="font-body text-[10px] tracking-[0.25em] uppercase text-ink-soft font-medium"
                >
                  {copy.nameLabel} <span className="text-tan font-normal">*</span>
                </label>
                
                 <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (validationError) setValidationError('');
                    if (submitError) setSubmitError('');
                    if (status === 'error') setStatus('idle');
                  }}
                  onBlur={handleBlur}
                  placeholder={copy.namePlaceholder}
                  className={`w-full bg-transparent border-b ${
                    validationError ? 'border-red-500/70 focus:border-red-500' : 'border-ink/20 focus:border-ink'
                  } py-3 text-ink-soft placeholder-ink-muted/30 focus:outline-none transition-colors duration-300 font-body text-base font-light`}
                  disabled={status === 'loading'}
                  autoComplete="off"
                />
                
                {validationError ? (
                  <span className="text-xs text-red-500/80 font-light flex items-center gap-1.5 mt-1 animate-fade-in">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {validationError}
                  </span>
                ) : (
                  <span className="text-[11px] text-ink-muted/60 font-light leading-relaxed mt-1">
                    {copy.nameHelper}
                  </span>
                )}
              </div>
              
              {status === 'error' && (
                <div className="w-full p-4 border border-red-200 bg-red-50/30 rounded-xl flex items-start gap-3 text-red-600 animate-fade-in">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span className="text-xs font-light leading-relaxed">
                    {submitError || copy.errorWebhook}
                  </span>
                </div>
              )}
              
              <div className="w-full flex justify-center mt-4">
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="flex items-center justify-center gap-2 px-8" 
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-cream" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {copy.submitBtnLoading}
                    </>
                  ) : (
                    copy.submitBtn
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
