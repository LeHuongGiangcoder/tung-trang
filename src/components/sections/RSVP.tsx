'use client';

import React, { useState } from 'react';
import { useLang } from '@/hooks/useLang';
import { COPY } from '@/lib/constants';
import { Heading, Subtitle, Body } from '@/components/ui/Typography';
import Button from '@/components/ui/Button';

// Given a full name (given-name-first), return just the first name for friendly references.
// Names are given-name-first with the surname last, so the first name is everything but the
// last word (e.g. "Hien Anh Nguyen" → "Hien Anh"). Single-word names are returned as-is.
const firstName = (full?: string) => {
  const parts = (full || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return parts[0] || '';
  return parts.slice(0, -1).join(' ');
};

// Normalize a name to single-spaced, Title Case
const formatName = (str: string) =>
  str
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

// Coerce a sheet value to a known Yes/No answer (or empty)
const asYesNo = (v: unknown): 'Yes' | 'No' | '' => (v === 'Yes' || v === 'No' ? v : '');

export default function RSVP() {
  const { lang } = useLang();
  const copy = COPY[lang].rsvp;

  const [fullName, setFullName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [nameError, setNameError] = useState(false);
  // For a server-provided message; known errors use errorKey so they re-translate on language switch
  const [submitError, setSubmitError] = useState('');
  const [errorKey, setErrorKey] = useState<'' | 'notFound' | 'webhook'>('');

  const [formStep, setFormStep] = useState<'name' | 'disambiguate' | 'details' | 'success'>('name');
  const [guestData, setGuestData] = useState<any>(null);
  const [matchedGuests, setMatchedGuests] = useState<any[]>([]);
  // True when the matched guest already has a recorded answer from a previous submission
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  // RSVP Form fields state
  const [attending, setAttending] = useState<'Yes' | 'No' | ''>('');
  const [mealPreferences, setMealPreferences] = useState<string>('');
  const [wishes, setWishes] = useState<string>('');

  const [partnerAttending, setPartnerAttending] = useState<'Yes' | 'No' | ''>('');
  const [partnerMealPreferences, setPartnerMealPreferences] = useState<string>('');
  const [partnerWishes, setPartnerWishes] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'guest' | 'partner'>('guest');

  // Highlight flags for missing attendance selections
  const [attendingError, setAttendingError] = useState(false);
  const [partnerAttendingError, setPartnerAttendingError] = useState(false);

  const handleBlur = () => {
    if (!fullName) return;
    setFullName(formatName(fullName));
    setNameError(false);
  };

  // Load a matched guest into the form and move to the details step
  const loadGuest = (matchObj: any) => {
    const guest = matchObj.guest;
    if (matchObj.displayName) {
      guest.displayName = matchObj.displayName;
    }
    setGuestData(guest);

    // A guest who already has a recorded Yes/No from a previous submission has RSVP'd before
    setAlreadySubmitted(!!asYesNo(guest["Join? from Guest"]) || !!asYesNo(guest["Join? from Partner"]));

    // Pre-fill states from the guest object where they already exist
    setAttending(asYesNo(guest["Join? from Guest"]));
    setMealPreferences(guest["Meal preferences from Guest"] || '');
    setWishes(guest["Wish to couples from Guest"] || '');

    setPartnerAttending(asYesNo(guest["Join? from Partner"]));
    setPartnerMealPreferences(guest["Meal preferences from Partner"] || '');
    setPartnerWishes(guest["Wish to couples from Partner"] || '');

    setActiveTab('guest');
    setFormStep('details');
  };

  const handleLookupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = fullName.trim();
    if (!trimmed) {
      setNameError(true);
      return;
    }

    const formatted = formatName(trimmed);

    setFullName(formatted);
    setNameError(false);
    setSubmitError('');
    setErrorKey('');
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

        const matches = n8nObj?.matches || [];

        if (matches.length === 1) {
          const matchObj = matches[0];
          if (matchObj.found && matchObj.guest) {
            loadGuest(matchObj);
            setStatus('idle');
          } else {
            setErrorKey('notFound');
            setStatus('error');
          }
        } else if (matches.length > 1) {
          setMatchedGuests(matches);
          setFormStep('disambiguate');
          setStatus('idle');
        } else {
          // If name is not matched
          setErrorKey('notFound');
          setStatus('error');
        }
      } else {
        if (result?.error) {
          setSubmitError(result.error);
        } else {
          setErrorKey('webhook');
        }
        setStatus('error');
      }
    } catch (error) {
      console.error('Error looking up RSVP:', error);
      setErrorKey('webhook');
      setStatus('error');
    }
  };

  const handleSelectDisambiguatedGuest = (matchObj: any) => {
    if (matchObj.found && matchObj.guest) {
      loadGuest(matchObj);
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hasPartner = !!guestData?.["Name of other guest"];

    const guestMissing = !attending;
    const partnerMissing = hasPartner && !partnerAttending;

    if (guestMissing || partnerMissing) {
      setAttendingError(guestMissing);
      setPartnerAttendingError(partnerMissing);

      // Jump to the first tab that needs attention
      setActiveTab(guestMissing ? 'guest' : 'partner');
      return;
    }

    setAttendingError(false);
    setPartnerAttendingError(false);
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

  // Attendance validation message, derived from the missing flags so it re-translates on language switch
  const attendanceError = (() => {
    if (!attendingError && !partnerAttendingError) return '';
    const names: string[] = [];
    if (attendingError) names.push(firstName(guestData?.["Guest name"] || fullName));
    if (partnerAttendingError) names.push(firstName(guestData?.["Name of other guest"]));
    const joined = names.join(lang === 'en' ? ' and ' : ' và ');
    return lang === 'en'
      ? `We still need to know if ${joined} can make it.`
      : `Chúng mình vẫn chưa biết ${joined} có tới được không nè.`;
  })();

  // Resolve known error keys through copy so they re-translate on language switch
  const displayError = errorKey === 'notFound'
    ? copy.errorNotFound
    : errorKey === 'webhook'
      ? copy.errorWebhook
      : (submitError || copy.errorWebhook);

  // Greeting names everyone in the party (guest, plus partner if there is one)
  const greetingNames = (() => {
    const guest = firstName(guestData?.["Guest name"] || fullName);
    const partner = guestData?.["Name of other guest"] ? firstName(guestData["Name of other guest"]) : '';
    return partner ? `${guest} & ${partner}` : guest;
  })();

  // Success message adapts to who's actually coming
  const getSuccessMessage = () => {
    const hasPartner = !!guestData?.["Name of other guest"];
    const guestName = firstName(guestData?.["Guest name"] || fullName);
    const partnerName = firstName(guestData?.["Name of other guest"]);

    if (!hasPartner) {
      return attending === 'No' ? copy.successMsgNo : copy.successMsg;
    }

    const bothComing = attending === 'Yes' && partnerAttending === 'Yes';
    const noneComing = attending === 'No' && partnerAttending === 'No';

    if (bothComing) return copy.successMsg;
    if (noneComing) return copy.successMsgNo;

    // Mixed: one coming, one not
    const comingName = attending === 'Yes' ? guestName : partnerName;
    const missingName = attending === 'Yes' ? partnerName : guestName;
    return lang === 'en'
      ? `So glad ${comingName} can join us! We'll miss ${missingName}, but thank you for letting us know 💛`
      : `Càm ơn vì ${comingName} sẽ tới chung vui! Chúng mình sẽ nhớ ${missingName} lắm, cảm ơn bạn đã cho tụi mình biết nhé 💛`;
  };

  // Schedule & dresscode reveal, shown to attending guests once their RSVP is in
  const scheduleDresscode = (
    <div className="w-full mt-16 pt-16 border-t border-ink/10 flex flex-col items-center gap-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <Heading variant="h2" className="text-ink-soft opacity-80 text-center">
        {COPY[lang].eventDetails.schedule} & {COPY[lang].eventDetails.dresscode}
      </Heading>
      <div className="w-8 h-[1px] bg-ink/10"></div>
      <span className="font-body text-[10px] md:text-xs tracking-[0.4em] uppercase text-ink-muted">
        {COPY[lang].eventDetails.comingSoon}
      </span>
    </div>
  );

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
                {getSuccessMessage()}
              </Body>
            </div>

            {guestData && (attending === 'Yes' || partnerAttending === 'Yes') && scheduleDresscode}
          </div>
                ) : formStep === 'disambiguate' ? (
          <div className="w-full mt-6 animate-fade-in flex flex-col items-center">
            <Body variant="regular" className="mb-8 text-ink-muted leading-relaxed">
              {lang === 'en'
                ? "We found a few of you — which one's you?"
                : "Chúng mình thấy vài bạn trùng tên — bạn là ai trong số này nhỉ?"}
            </Body>
            <div className="w-full flex flex-col gap-4">
              {matchedGuests.map((match, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDisambiguatedGuest(match)}
                  className="w-full py-5 px-6 border border-ink/20 hover:border-ink hover:bg-ink/5 transition-all duration-300 flex items-center justify-center text-sm tracking-widest font-body uppercase text-ink-soft group"
                >
                  <span className="group-hover:scale-105 transition-transform duration-300">
                    {match.displayName || match.guest["Guest name"]}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setFormStep('name');
                setSubmitError('');
              }}
              className="mt-8 text-xs tracking-widest uppercase text-ink-muted hover:text-ink transition-colors underline underline-offset-4"
            >
              {lang === 'en' ? 'Go Back' : 'Quay lại'}
            </button>
          </div>
        ) : formStep === 'details' ? (
          <div className="w-full mt-6">
            <Body variant="regular" className="mb-6 text-ink-muted leading-relaxed">
              {lang === 'en'
                ? `Hi ${greetingNames}! Just a couple of details and you're all set:`
                : `Chào ${greetingNames}! Thêm vài thông tin nữa là xong nhé:`}
            </Body>
            
            {guestData?.["Name of other guest"] && (
              <div className="flex w-full mb-8 border-b border-ink/10">
                <button
                  type="button"
                  onClick={() => setActiveTab('guest')}
                  className={`flex-1 pb-3 text-xs tracking-widest uppercase transition-all duration-300 font-body font-light relative ${
                    activeTab === 'guest' ? 'text-ink' : attendingError ? 'text-red-500' : 'text-ink-muted/50 hover:text-ink-muted'
                  }`}
                >
                  {guestData["Guest name"] || fullName}
                  {attendingError && (
                    <span className="absolute top-0 right-1 w-1.5 h-1.5 rounded-full bg-red-500 animate-fade-in" />
                  )}
                  {activeTab === 'guest' && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-ink animate-fade-in" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('partner')}
                  className={`flex-1 pb-3 text-xs tracking-widest uppercase transition-all duration-300 font-body font-light relative ${
                    activeTab === 'partner' ? 'text-ink' : partnerAttendingError ? 'text-red-500' : 'text-ink-muted/50 hover:text-ink-muted'
                  }`}
                >
                  {guestData["Name of other guest"]}
                  {partnerAttendingError && (
                    <span className="absolute top-0 right-1 w-1.5 h-1.5 rounded-full bg-red-500 animate-fade-in" />
                  )}
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
                  <label className={`font-body text-[10px] md:text-xs tracking-[0.4em] uppercase font-normal ${attendingError ? 'text-red-500' : 'text-ink-muted'}`}>
                    {copy.attendingLabel} <span className={attendingError ? 'text-red-500 font-normal' : 'text-tan font-normal'}>*</span>
                  </label>
                  <div className="flex gap-4 w-full mt-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setAttending('Yes');
                        setAttendingError(false);
                        if (submitError) setSubmitError('');
                      }}
                      className={`flex-1 py-4 px-4 text-[10px] tracking-[0.25em] uppercase transition-all duration-300 font-body font-light border ${
                        attending === 'Yes'
                          ? 'border-ink bg-ink text-cream'
                          : attendingError
                            ? 'border-red-400 text-red-500 hover:border-red-500 bg-transparent'
                            : 'border-ink/10 text-ink-soft hover:border-ink/30 bg-transparent'
                      }`}
                    >
                      {copy.attendingYes}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAttending('No');
                        setAttendingError(false);
                        if (submitError) setSubmitError('');
                      }}
                      className={`flex-1 py-4 px-4 text-[10px] tracking-[0.25em] uppercase transition-all duration-300 font-body font-light border ${
                        attending === 'No'
                          ? 'border-ink bg-ink text-cream'
                          : attendingError
                            ? 'border-red-400 text-red-500 hover:border-red-500 bg-transparent'
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
                    <label className={`font-body text-[10px] md:text-xs tracking-[0.4em] uppercase font-normal ${partnerAttendingError ? 'text-red-500' : 'text-ink-muted'}`}>
                      {copy.attendingLabel} <span className={partnerAttendingError ? 'text-red-500 font-normal' : 'text-tan font-normal'}>*</span>
                    </label>
                    <div className="flex gap-4 w-full mt-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setPartnerAttending('Yes');
                          setPartnerAttendingError(false);
                          if (submitError) setSubmitError('');
                        }}
                        className={`flex-1 py-4 px-4 text-[10px] tracking-[0.25em] uppercase transition-all duration-300 font-body font-light border ${
                          partnerAttending === 'Yes'
                            ? 'border-ink bg-ink text-cream'
                            : partnerAttendingError
                              ? 'border-red-400 text-red-500 hover:border-red-500 bg-transparent'
                              : 'border-ink/10 text-ink-soft hover:border-ink/30 bg-transparent'
                        }`}
                      >
                        {copy.attendingYes}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPartnerAttending('No');
                          setPartnerAttendingError(false);
                          if (submitError) setSubmitError('');
                        }}
                        className={`flex-1 py-4 px-4 text-[10px] tracking-[0.25em] uppercase transition-all duration-300 font-body font-light border ${
                          partnerAttending === 'No'
                            ? 'border-ink bg-ink text-cream'
                            : partnerAttendingError
                              ? 'border-red-400 text-red-500 hover:border-red-500 bg-transparent'
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

              {attendanceError && (
                <span className="text-xs text-red-500/80 font-light flex items-center gap-1.5 mt-1 animate-fade-in">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  {attendanceError}
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
                    {displayError}
                  </span>
                </div>
              )}

              <div className="w-full flex justify-center mt-6">
                {/* Submit is optimistic (fires and goes straight to success), so no loading state here */}
                <Button
                  type="submit"
                  variant="primary"
                  className="flex items-center justify-center gap-2 px-8"
                >
                  {copy.submitDetailsBtn}
                </Button>
              </div>
            </form>

            {/* Returning guests who already RSVP'd (and are attending) get the schedule & dresscode reveal too */}
            {alreadySubmitted && (attending === 'Yes' || partnerAttending === 'Yes') && (
              <div className="flex flex-col items-center text-center">
                {scheduleDresscode}
              </div>
            )}
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
                    if (nameError) setNameError(false);
                    if (submitError) setSubmitError('');
                    if (errorKey) setErrorKey('');
                    if (status === 'error') setStatus('idle');
                  }}
                  onBlur={handleBlur}
                  placeholder={copy.namePlaceholder}
                  className={`w-full bg-transparent border-b ${
                    nameError ? 'border-red-500/70 focus:border-red-500' : 'border-ink/20 focus:border-ink'
                  } py-3 text-ink-soft placeholder-ink-muted/30 focus:outline-none transition-colors duration-300 font-body text-base font-light`}
                  disabled={status === 'loading'}
                  autoComplete="off"
                />

                {!nameError && (
                  <span className="text-xs text-ink-muted font-light leading-relaxed mt-1">
                    {copy.nameHelper}
                  </span>
                )}

                {nameError && (
                  <span className="text-xs text-red-500/80 font-light flex items-center gap-1.5 mt-1 animate-fade-in">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {copy.errorRequired}
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
                    {displayError}
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
