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
  const [mealPreferences, setMealPreferences] = useState<string>('');
  const [wishes, setWishes] = useState<string>('');

  const [partnerAttending, setPartnerAttending] = useState<'Yes' | 'No' | ''>('');
  const [partnerMealPreferences, setPartnerMealPreferences] = useState<string>('');
  const [partnerWishes, setPartnerWishes] = useState<string>('');
  
  const [activeTab, setActiveTab] = useState<'guest' | 'partner'>('guest');

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
          if (n8nObj.displayName) {
            guest.displayName = n8nObj.displayName;
          }
          setGuestData(guest);
          
          // Pre-fill states from n8n guest object if they already exist
          const existingAttending = guest["Join? from Guest"] === 'Yes' || guest["Join? from Guest"] === 'No' ? guest["Join? from Guest"] : '';
          setAttending(existingAttending);
          setMealPreferences(guest["Meal preferences from Guest"] || '');
          setWishes(guest["Wish to couples from Guest"] || '');

          const existingPartnerAttending = guest["Join? from Partner"] === 'Yes' || guest["Join? from Partner"] === 'No' ? guest["Join? from Partner"] : '';
          setPartnerAttending(existingPartnerAttending);
          setPartnerMealPreferences(guest["Meal preferences from Partner"] || '');
          setPartnerWishes(guest["Wish to couples from Partner"] || '');

          setActiveTab('guest');
          
          setFormStep('details');
          setStatus('idle');
        } else {
          // If name is not matched, display an error message
          setSubmitError(copy.errorNotFound);
          setStatus('error');
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

    const hasPartner = !!guestData?.["Name of other guest"];

    if (!attending) {
      setValidationError(lang === 'en' ? `Please select if ${guestData?.["Guest name"] || fullName} will be attending.` : `Vui lòng xác nhận ${guestData?.["Guest name"] || fullName} có tham dự hay không.`);
      setActiveTab('guest');
      return;
    }

    if (hasPartner && !partnerAttending) {
      setValidationError(lang === 'en' ? `Please select if ${guestData?.["Name of other guest"]} will be attending.` : `Vui lòng xác nhận ${guestData?.["Name of other guest"]} có tham dự hay không.`);
      setActiveTab('partner');
      return;
    }

    setValidationError('');
    setSubmitError('');
    
    // Optimistic UI update: transition to success immediately
    setFormStep('success');
    setStatus('idle');

    try {
      const payload = {
        row_number: guestData.row_number,
        "Guest name": guestData["Guest name"] || fullName,
        "Name of other guest": guestData["Name of other guest"] || '',
        
        "Join? from Guest": attending,
        "Join? from Partner": hasPartner ? partnerAttending : '',

        "Meal preferences from Guest": attending === 'Yes' ? mealPreferences : '',
        "Meal preferences from Partner": partnerAttending === 'Yes' ? partnerMealPreferences : '',
        
        "Wish to couples from Guest": wishes,
        "Wish to couples from Partner": hasPartner ? partnerWishes : '',
        
        action: 'update'
      };

      // Fire and forget fetch request
      fetch(
        '/api/rsvp',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      ).catch((error) => console.error('Background RSVP fetch error:', error));

    } catch (error) {
      console.error('Error submitting RSVP details:', error);
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
          <div className="w-full flex flex-col items-center">
            <div className="mt-8 w-full flex flex-col items-center gap-4 animate-fade-in">
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

            {guestData && (
              <div className="w-full mt-16 pt-16 border-t border-ink/10 flex flex-col items-center gap-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <Heading variant="h2" className="text-ink-soft opacity-80 text-center">
                  {COPY[lang].eventDetails.schedule} & {COPY[lang].eventDetails.dresscode}
                </Heading>
                <div className="w-8 h-[1px] bg-ink/10"></div>
                <span className="font-body text-[10px] md:text-xs tracking-[0.4em] uppercase text-ink-muted">
                  {COPY[lang].eventDetails.comingSoon}
                </span>
              </div>
            )}
          </div>
        ) : formStep === 'details' ? (
          <div className="w-full mt-6">
            <Body variant="regular" className="mb-6 text-ink-muted leading-relaxed">
              {lang === 'en' 
                ? `Hi ${guestData?.displayName || guestData?.["Guest name"] || fullName}, please complete your RSVP details below:` 
                : `Chào ${guestData?.displayName || guestData?.["Guest name"] || fullName}, vui lòng hoàn thành thông tin xác nhận bên dưới:`}
            </Body>
            
            {guestData?.["Name of other guest"] && (
              <div className="flex w-full mb-8 border-b border-ink/10">
                <button
                  type="button"
                  onClick={() => setActiveTab('guest')}
                  className={`flex-1 pb-3 text-xs tracking-widest uppercase transition-all duration-300 font-body font-light relative ${
                    activeTab === 'guest' ? 'text-ink' : 'text-ink-muted/50 hover:text-ink-muted'
                  }`}
                >
                  {guestData["Guest name"] || fullName}
                  {activeTab === 'guest' && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-ink animate-fade-in" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('partner')}
                  className={`flex-1 pb-3 text-xs tracking-widest uppercase transition-all duration-300 font-body font-light relative ${
                    activeTab === 'partner' ? 'text-ink' : 'text-ink-muted/50 hover:text-ink-muted'
                  }`}
                >
                  {guestData["Name of other guest"]}
                  {activeTab === 'partner' && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-ink animate-fade-in" />
                  )}
                </button>
              </div>
            )}

            <form onSubmit={handleDetailsSubmit} className="w-full flex flex-col items-start gap-8 text-left">
              
              {/* --- GUEST TAB CONTENT --- */}
              <div className={`w-full flex flex-col gap-8 transition-opacity duration-300 ${activeTab === 'guest' ? 'block animate-fade-in' : 'hidden'}`}>
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

                {/* Wishes / Message */}
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
              </div>

              {/* --- PARTNER TAB CONTENT --- */}
              {guestData?.["Name of other guest"] && (
                <div className={`w-full flex flex-col gap-8 transition-opacity duration-300 ${activeTab === 'partner' ? 'block animate-fade-in' : 'hidden'}`}>
                  {/* Yes/No Attendance */}
                  <div className="w-full flex flex-col gap-2.5">
                    <label className="font-body text-[10px] md:text-xs tracking-[0.4em] uppercase text-ink-muted font-normal">
                      {copy.attendingLabel} <span className="text-tan font-normal">*</span>
                    </label>
                    <div className="flex gap-4 w-full mt-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setPartnerAttending('Yes');
                          setValidationError('');
                          if (submitError) setSubmitError('');
                        }}
                        className={`flex-1 py-4 px-4 text-[10px] tracking-[0.25em] uppercase transition-all duration-300 font-body font-light border ${
                          partnerAttending === 'Yes' 
                            ? 'border-ink bg-ink text-cream' 
                            : 'border-ink/10 text-ink-soft hover:border-ink/30 bg-transparent'
                        }`}
                      >
                        {copy.attendingYes}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPartnerAttending('No');
                          setValidationError('');
                          if (submitError) setSubmitError('');
                        }}
                        className={`flex-1 py-4 px-4 text-[10px] tracking-[0.25em] uppercase transition-all duration-300 font-body font-light border ${
                          partnerAttending === 'No' 
                            ? 'border-ink bg-ink text-cream' 
                            : 'border-ink/10 text-ink-soft hover:border-ink/30 bg-transparent'
                        }`}
                      >
                        {copy.attendingNo}
                      </button>
                    </div>
                  </div>

                  {partnerAttending === 'Yes' && (
                    <div className="w-full flex flex-col gap-8 animate-fade-in">
                      {/* Meal Preferences */}
                      <div className="w-full flex flex-col gap-2.5">
                        <label htmlFor="partnerMealPreferences" className="font-body text-[10px] md:text-xs tracking-[0.4em] uppercase text-ink-muted font-normal">
                          {copy.mealLabel}
                        </label>
                        <input
                          type="text"
                          id="partnerMealPreferences"
                          value={partnerMealPreferences}
                          onChange={(e) => setPartnerMealPreferences(e.target.value)}
                          placeholder={copy.mealPlaceholder}
                          className="w-full bg-transparent border-b border-ink/20 focus:border-ink py-3 text-ink-soft placeholder-ink-muted/30 focus:outline-none transition-colors font-body text-base font-light"
                          autoComplete="off"
                        />
                      </div>
                    </div>
                  )}

                  {/* Wishes / Message */}
                  {partnerAttending !== '' && (
                    <div className="w-full flex flex-col gap-2.5 animate-fade-in">
                      <label htmlFor="partnerWishes" className="font-body text-[10px] md:text-xs tracking-[0.4em] uppercase text-ink-muted font-normal">
                        {copy.wishesLabel}
                      </label>
                      <textarea
                        id="partnerWishes"
                        value={partnerWishes}
                        onChange={(e) => setPartnerWishes(e.target.value)}
                        placeholder={copy.wishesPlaceholder}
                        rows={3}
                        className="w-full bg-transparent border-b border-ink/20 focus:border-ink py-3 text-ink-soft placeholder-ink-muted/30 focus:outline-none transition-colors font-body text-base font-light resize-none rounded-none"
                      />
                    </div>
                  )}
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
                  disabled={status === 'loading' || attending === '' || (!!guestData?.["Name of other guest"] && partnerAttending === '')}
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

                {!validationError && (
                  <span className="text-xs text-ink-muted font-light leading-relaxed mt-1">
                    {copy.nameHelper}
                  </span>
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
