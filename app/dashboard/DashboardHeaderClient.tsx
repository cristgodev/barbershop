'use client';

import { useTranslation } from '../contexts/LanguageContext';

export default function DashboardHeaderClient({ currentUser }: { currentUser: any }) {
    const { t } = useTranslation();

    return (
        <header className="h-16 bg-white dark:bg-zinc-900/50 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-8 sticky top-0 z-30">
            <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-serif text-zinc-900 dark:text-white" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                    {t('dashboard.center')}
                </h2>
            </div>
            
            <div className="flex items-center gap-4">
                <a href="/" target="_blank" className="text-sm font-medium hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors">
                    {t('dashboard.view_live')} ↗
                </a>
                <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800"></div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <div className="font-bold text-sm leading-none">{currentUser.name}</div>
                        <div className="text-xs text-zinc-500 capitalize mt-1">{currentUser.role.toLowerCase()}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-bold text-lg shadow-sm">
                        {currentUser.name?.charAt(0) || 'U'}
                    </div>
                </div>
            </div>
        </header>
    );
}
