'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Lang } from '@/lib/constants';

type LangContextValue = { lang: Lang; setLang: (l: Lang) => void };

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children, initialLang = 'en' }: { children: ReactNode; initialLang?: Lang }) {
  const [lang, setLang] = useState<Lang>(initialLang);

  // Keep <html lang> in sync for screen readers and fonts
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside LangProvider');
  return ctx;
}
