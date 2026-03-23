'use client';

import ClientDirectory from "./book/ClientDirectory";
import { useTranslation } from "./contexts/LanguageContext";

export default function HomeClient({ shops }: { shops: any[] }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-16 pb-12 w-full max-w-6xl mx-auto px-4 mt-8">
      {/* Hero Section (SaaS Platform) */}
      <section className="bg-transparent rounded-[2.5rem] py-16 flex flex-col md:flex-row items-center gap-12 justify-between relative">
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{ background: 'radial-gradient(circle at right center, rgba(234,179,8,0.1) 0%, transparent 60%)' }} />
        
        <div className="max-w-2xl space-y-8 relative z-10 w-full">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-600/10 text-xs font-bold tracking-[0.2em] text-yellow-600 dark:text-yellow-500 uppercase">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
            {t('landing.hero_tagline')}
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-8xl font-bold tracking-tight leading-[1.05] font-serif" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
            <span className="block mb-2 text-zinc-900 dark:text-white">{t('landing.hero_title_1')}</span>
            <span className="italic block font-light text-yellow-600 dark:text-yellow-500">{t('landing.hero_title_2')}</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl font-medium">
            {t('landing.hero_desc')}
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-4">
            <a href="/register" className="bg-yellow-600 hover:bg-yellow-500 text-zinc-50 dark:text-zinc-950 px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(234,179,8,0.25)] w-full sm:w-auto text-center">
              {t('landing.register_cta')}
            </a>
            <a href="/login" className="bg-zinc-100/50 hover:bg-zinc-200/50 dark:bg-zinc-900/50 dark:hover:bg-zinc-800/50 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 px-8 py-4 rounded-full font-semibold text-lg transition-colors w-full sm:w-auto text-center">
              {t('landing.login_cta')}
            </a>
          </div>
        </div>

        <div className="w-full md:w-5/12 hidden md:flex items-center justify-center relative z-10">
            <div className="w-full aspect-square rounded-full border border-yellow-600/20 flex items-center justify-center relative">
                <div className="w-3/4 aspect-square rounded-full border border-yellow-600/40 animate-[spin_60s_linear_infinite] absolute"></div>
                <svg width="180" height="180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600/40 drop-shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                    <circle cx="6" cy="6" r="3" />
                    <path d="M8.12 8.12 12 12" />
                    <path d="M20 4 8.12 15.88" />
                    <circle cx="6" cy="18" r="3" />
                    <path d="M14.8 14.8 20 20" />
                </svg>
            </div>
        </div>
      </section>

      {/* Directory Section */}
      <section className="space-y-6 pt-8">
        <ClientDirectory initialShops={shops} />
      </section>
      
    </div>
  );
}
