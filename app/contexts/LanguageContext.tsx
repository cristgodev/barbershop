'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Dictionaries
import en from '../locales/en.json';
import es from '../locales/es.json';

const dictionaries = {
  en,
  es,
};

type Locale = keyof typeof dictionaries;

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  // The universal translation function `t('section.key')`
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default to English initially
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    // Read preference from localStorage on client-side mount
    const savedLocale = localStorage.getItem('NEXT_LOCALE') as Locale;
    if (savedLocale && dictionaries[savedLocale]) {
      setLocaleState(savedLocale);
    } else {
      // Check browser language
      const browserLang = navigator.language.split('-')[0];
      if (browserLang === 'es') {
        setLocaleState('es');
      }
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('NEXT_LOCALE', newLocale);
    
    // Also save as a cookie so Server Components could potentially read it in the future
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`; // 1 year
  };

  const t = (keyStr: string): string => {
    const keys = keyStr.split('.');
    let value: any = dictionaries[locale];

    for (const key of keys) {
      if (value === undefined) break;
      value = value[key];
    }

    // Fallback to English if key is missing in Spanish, or return the key string itself if totally missing
    if (value === undefined && locale !== 'en') {
       let fallbackValue: any = dictionaries['en'];
       for (const key of keys) {
        if (fallbackValue === undefined) break;
        fallbackValue = fallbackValue[key];
       }
       return typeof fallbackValue === 'string' ? fallbackValue : keyStr;
    }

    return typeof value === 'string' ? value : keyStr;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
