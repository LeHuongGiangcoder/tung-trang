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
  
  const [formStep, setFormStep] = useState<'name' | 'details' | 'success'>('name');
  const [guestData, setGuestData] = useState<any>(null);

  // RSVP Form fields state
  const [attending, setAttending] = useState<'Yes' | 'No' | ''>('');
  const [guestsCount, setGuestsCount] = useState<number | ''>(1);
  const [otherGuests, setOtherGuests] = useState<string>('');
  const [mealPreferences, setMealPreferences] = useState<string>('');
  const [wishes, setWishes] = useState<string>('');

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

  const handleLookupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = fullName.trim();
    if (!trimmed) {
      setValidationError(copy.errorRequired);
      return;
    }

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
        let n8nObj = null;
        if (Array.isArray(n8nData)) {
          n8nObj = n8nData[0];
        } else if (n8nData && typeof n8nData === 'object') {
          n8nObj = n8nData;
        }

        if (n8nObj && n8nObj.found === true && n8nObj.guest) {
          const guest = n8nObj.guest;
          setGuestData(guest);
          
          // Pre-fill states from n8n guest object if they already exist
          const existingAttending = guest.No === 'Yes' || guest.No === 'No' ? guest.No : '';
          setAttending(existingAttending);
          
          const existingNumber = Number(guest.Number);
          setGuestsCount(isNaN(existingNumber) || existingNumber <= 0 ? 1 : existingNumber);
          
          setOtherGuests(guest.Note || '');
          setMealPreferences(guest["Meal preferences"] || '');
          setWishes(guest["Your wish to couples"] || '');
          
          setFormStep('details');
          setStatus('idle');
        } else {
          // If name is not matched, transition directly to the success (thank you) screen
          setFormStep('success');
          setStatus('idle');
        }
      } else {
        setSubmitError(result?.error || copy.errorWebhook);
        setStatus('error');
      }
    } catch (error) {
      console.error('Error looking up RSVP:', error);
      setSubmitError(copy.errorWebhook);
      setStatus('error');
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!attending) {
      setValidationError(lang === 'en' ? 'Please select if you will be attending.' : 'Vui lòng xác nhận bạn có tham dự hay không.');
      return;
    }

    const finalGuestsCount = Number(guestsCount) || 1;

    if (attending === 'Yes' && finalGuestsCount > 1 && !otherGuests.trim()) {
      setValidationError(lang === 'en' ? 'Please enter the names of other guests.' : 'Vui lòng nhập tên những người đi cùng.');
      return;
    }

    setValidationError('');
    setSubmitError('');
    setStatus('loading');

    try {
      const payload = {
        row_number: guestData.row_number,
        "Guest name": guestData["Guest name"] || fullName,
        "No": attending,
        "Number": attending === 'Yes' ? finalGuestsCount : '',
        "Note": attending === 'Yes' ? otherGuests : '',
        "Meal preferences": attending === 'Yes' ? mealPreferences : '',
        "Your wish to couples": wishes,
        action: 'update'
      };

      const response = await fetch(
        '/api/rsvp',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json().catch(() => null);

      if (response.ok && result?.success) {
        setFormStep('success');
        setStatus('idle');
      } else {
        setSubmitError(result?.error || copy.errorWebhook);
        setStatus('error');
      }
    } catch (error) {
      console.error('Error submitting RSVP details:', error);
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
        
        {formStep === 'success' ? (
          <div className="mt-8 p-8 rounded-none bg-white/20 backdrop-blur-sm w-full flex flex-col items-center gap-4 animate-fade-in">
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
        ) : formStep === 'details' ? (
          <div className="w-full mt-6">
            <Body variant="regular" className="mb-10 text-ink-muted leading-relaxed">
              {lang === 'en' 
                ? `Hi ${guestData?.["Guest name"] || fullName}, please complete your RSVP details below:` 
                : `Chào ${guestData?.["Guest name"] || fullName}, vui lòng hoàn thành thông tin xác nhận bên dưới:`}
            </Body>
            
            <form onSubmit={handleDetailsSubmit} className="w-full flex flex-col items-start gap-8 text-left">
              {/* Yes/No Attendance */}
              <div className="w-full flex flex-col gap-2.5">
                <label className="font-body text-[10px] md:text-xs tracking-[0.4em] uppercase text-ink-muted font-normal">
                  {copy.attendingLabel} <span className="text-tan font-normal">*</span>
                </label>
                <div className="flex gap-4 w-full mt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setAttending('Yes');
                      setValidationError('');
                      if (submitError) setSubmitError('');
                    }}
                    className={`flex-1 py-4 px-4 text-[10px] tracking-[0.25em] uppercase transition-all duration-300 font-body font-light border ${
                      attending === 'Yes' 
                        ? 'border-ink bg-ink text-cream' 
                        : 'border-ink/10 text-ink-soft hover:border-ink/30 bg-transparent'
                    }`}
                  >
                    {copy.attendingYes}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAttending('No');
                      setValidationError('');
                      if (submitError) setSubmitError('');
                    }}
                    className={`flex-1 py-4 px-4 text-[10px] tracking-[0.25em] uppercase transition-all duration-300 font-body font-light border ${
                      attending === 'No' 
                        ? 'border-ink bg-ink text-cream' 
                        : 'border-ink/10 text-ink-soft hover:border-ink/30 bg-transparent'
                    }`}
                  >
                    {copy.attendingNo}
                  </button>
                </div>
              </div>

              {attending === 'Yes' && (
                <div className="w-full flex flex-col gap-8 animate-fade-in">
                  {/* Number of Guests */}
                  <div className="w-full flex flex-col gap-2.5">
                    <label htmlFor="guestsCount" className="font-body text-[10px] md:text-xs tracking-[0.4em] uppercase text-ink-muted font-normal">
                      {copy.guestsLabel} <span className="text-tan font-normal">*</span>
                    </label>
                    <input
                      type="number"
                      id="guestsCount"
                      min="1"
                      value={guestsCount}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setGuestsCount('');
                        } else {
                          const num = Number(val);
                          setGuestsCount(isNaN(num) || num <= 0 ? 1 : num);
                        }
                      }}
                      className="w-full bg-transparent border-b border-ink/20 focus:border-ink py-3 text-ink-soft focus:outline-none transition-colors duration-300 font-body text-base font-light rounded-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>

                  {/* Names of Other Guests */}
                  {Number(guestsCount) > 1 && (
                    <div className="w-full flex flex-col gap-2.5 animate-fade-in">
                      <label htmlFor="otherGuests" className="font-body text-[10px] md:text-xs tracking-[0.4em] uppercase text-ink-muted font-normal">
                        {copy.otherGuestsLabel} <span className="text-tan font-normal">*</span>
                      </label>
                      <input
                        type="text"
                        id="otherGuests"
                        value={otherGuests}
                        onChange={(e) => {
                          setOtherGuests(e.target.value);
                          if (validationError) setValidationError('');
                        }}
                        placeholder={copy.otherGuestsPlaceholder}
                        className="w-full bg-transparent border-b border-ink/20 focus:border-ink py-3 text-ink-soft placeholder-ink-muted/30 focus:outline-none transition-colors font-body text-base font-light"
                        autoComplete="off"
                      />
                    </div>
                  )}

                  {/* Meal Preferences */}
                  <div className="w-full flex flex-col gap-2.5">
                    <label htmlFor="mealPreferences" className="font-body text-[10px] md:text-xs tracking-[0.4em] uppercase text-ink-muted font-normal">
                      {copy.mealLabel}
                    </label>
                    <input
                      type="text"
                      id="mealPreferences"
                      value={mealPreferences}
                      onChange={(e) => setMealPreferences(e.target.value)}
                      placeholder={copy.mealPlaceholder}
                      className="w-full bg-transparent border-b border-ink/20 focus:border-ink py-3 text-ink-soft placeholder-ink-muted/30 focus:outline-none transition-colors font-body text-base font-light"
                      autoComplete="off"
                    />
                  </div>
                </div>
              )}

              {/* Wishes / Message - Always visible if attending is selected */}
              {attending !== '' && (
                <div className="w-full flex flex-col gap-2.5 animate-fade-in">
                  <label htmlFor="wishes" className="font-body text-[10px] md:text-xs tracking-[0.4em] uppercase text-ink-muted font-normal">
                    {copy.wishesLabel}
                  </label>
                  <textarea
                    id="wishes"
                    value={wishes}
                    onChange={(e) => setWishes(e.target.value)}
                    placeholder={copy.wishesPlaceholder}
                    rows={3}
                    className="w-full bg-transparent border-b border-ink/20 focus:border-ink py-3 text-ink-soft placeholder-ink-muted/30 focus:outline-none transition-colors font-body text-base font-light resize-none rounded-none"
                  />
                </div>
              )}

              {validationError && (
                <span className="text-xs text-red-500/80 font-light flex items-center gap-1.5 mt-1 animate-fade-in">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  {validationError}
                </span>
              )}

              {status === 'error' && (
                <div className="w-full p-4 rounded-none bg-red-50/10 flex items-start gap-3 text-red-600/90 animate-fade-in">
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

              <div className="w-full flex justify-center mt-6">
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="flex items-center justify-center gap-2 px-8" 
                  disabled={status === 'loading' || attending === ''}
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
                    copy.submitDetailsBtn
                  )}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="w-full mt-6">
            <Body variant="regular" className="mb-10 text-ink-muted leading-relaxed">
              {copy.description}
            </Body>
            
            <form onSubmit={handleLookupSubmit} className="w-full flex flex-col items-start gap-8 text-left">
              <div className="w-full flex flex-col gap-2.5">
                <label 
                  htmlFor="fullName" 
                  className="font-body text-[10px] md:text-xs tracking-[0.4em] uppercase text-ink-muted font-normal"
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
                <div className="w-full p-4 rounded-none bg-red-50/10 flex items-start gap-3 text-red-600/90 animate-fade-in">
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
