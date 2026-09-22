'use client';

import React from 'react';

export interface ToggleOption<T> {
  label: string;
  value: T;
}

interface ToggleProps<T> {
  options: ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  variant?: 'plain' | 'pill' | 'segmented';
  className?: string;
}

export default function Toggle<T>({
  options,
  value,
  onChange,
  variant = 'plain',
  className = '',
}: ToggleProps<T>) {
  const baseOverlay = "transition-all duration-500 pointer-events-auto";
  const pillStyle = `${baseOverlay} border bg-white/60 border-white/40 backdrop-blur-md shadow-[0_2px_10px_rgba(0,0,0,0.03)] rounded-full px-3.5 py-1.5`;

  // Tab-style switch in the Button design: outlined pill, active option filled like the primary button
  if (variant === 'segmented') {
    return (
      <div className={`inline-flex items-center gap-1 p-1 border border-ink/30 rounded-full ${className}`}>
        {options.map((opt) => (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-5 py-2 rounded-full font-body text-[10px] tracking-[0.2em] uppercase transition-all duration-300 select-none outline-none ${
              value === opt.value
                ? 'bg-ink text-cream'
                : 'text-ink-soft hover:text-ink hover:bg-ink/5'
            }`}
            aria-pressed={value === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'pill') {
    return (
      <div className={`${pillStyle} ${className}`}>
        <div className="flex items-center gap-1.5 font-body text-[10px] tracking-[0.2em] uppercase">
          {options.map((opt, idx) => (
            <React.Fragment key={String(opt.value)}>
              {idx > 0 && <span className="text-ink-muted">/</span>}
              <button
                type="button"
                onClick={() => onChange(opt.value)}
                className={
                  value === opt.value
                    ? 'text-ink font-medium transition-colors'
                    : 'text-ink-muted hover:text-ink-soft transition-colors'
                }
                aria-pressed={value === opt.value}
              >
                {opt.label}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 font-body text-[10px] tracking-[0.2em] uppercase ${className}`}>
      {options.map((opt, idx) => (
        <React.Fragment key={String(opt.value)}>
          {idx > 0 && <span className="text-ink-muted">/</span>}
          <button
            type="button"
            onClick={() => onChange(opt.value)}
            className={
              value === opt.value
                ? 'text-ink font-medium transition-colors'
                : 'text-ink-muted hover:text-ink-soft transition-colors'
            }
            aria-pressed={value === opt.value}
          >
            {opt.label}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}
