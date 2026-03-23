'use client';

import { useTranslation } from '../contexts/LanguageContext';

export default function OverviewHeaderClient() {
    const { t } = useTranslation();

    return (
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-extrabold tracking-tight">{t('dashboard.menu_overview')}</h1>
            <a href="/book" className="bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-6 py-2.5 rounded-xl font-semibold text-sm transition-transform hover:scale-105 active:scale-95 shadow-md flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                {t('dashboard.new_booking')}
            </a>
        </div>
    );
}
