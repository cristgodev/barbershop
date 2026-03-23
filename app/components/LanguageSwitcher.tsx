'use client';

import { useTranslation } from '../contexts/LanguageContext';

export default function LanguageSwitcher() {
    const { locale, setLocale } = useTranslation();

    const toggleLocale = () => {
        setLocale(locale === 'en' ? 'es' : 'en');
    };

    return (
        <button
            onClick={toggleLocale}
            className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
            title={locale === 'en' ? 'Switch to Spanish' : 'Cambiar a Inglés'}
        >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <span>{locale === 'en' ? 'EN' : 'ES'}</span>
        </button>
    );
}
