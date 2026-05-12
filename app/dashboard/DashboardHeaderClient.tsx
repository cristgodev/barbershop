'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import AppTourModal from './AppTourModal';
import { useMobileNav } from './MobileNavContext';

export default function DashboardHeaderClient({ currentUser, shopSlug }: { currentUser: any, shopSlug: string | null }) {
    const { t } = useTranslation();
    const { toggle } = useMobileNav();
    const [showTour, setShowTour] = useState(false);

    useEffect(() => {
        const hasSeenTour = localStorage.getItem('barbershop_tour_seen');
        if (!hasSeenTour) {
            setShowTour(true);
            localStorage.setItem('barbershop_tour_seen', 'true');
        }
    }, []);

    return (
        <header className="h-16 bg-white dark:bg-zinc-900/50 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
            <div className="flex items-center gap-3">
                <button 
                    onClick={toggle}
                    className="md:hidden p-2 -ml-2 rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
                    aria-label="Toggle menu"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
                <h2 className="text-xl font-bold font-serif text-zinc-900 dark:text-white" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                    {t('dashboard.center')}
                </h2>
            </div>
            
            <div className="flex items-center gap-4">
                {/* Manual Trigger for App Tour */}
                <button 
                    onClick={() => setShowTour(true)}
                    className="w-10 h-10 rounded-full bg-yellow-600/10 hover:bg-yellow-600/20 text-yellow-600 dark:bg-yellow-500/10 dark:hover:bg-yellow-500/20 dark:text-yellow-500 flex flex-shrink-0 items-center justify-center transition-colors shadow-inner"
                    title="Ver Tutorial de Funciones"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                </button>

                <a href={shopSlug ? `/${shopSlug}` : '/'} target="_blank" className="text-sm font-medium hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors whitespace-nowrap hidden sm:block">
                    {t('dashboard.view_live')} ↗
                </a>
                <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block"></div>
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

            {/* App Tour Modal */}
            <AppTourModal isOpen={showTour} onClose={() => setShowTour(false)} />
        </header>
    );
}
