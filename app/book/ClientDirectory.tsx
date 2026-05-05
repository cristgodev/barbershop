'use client';

import { useState } from 'react';
import { useTranslation } from '../contexts/LanguageContext';

type Shop = {
    id: string;
    slug: string | null;
    name: string;
    address: string | null;
};

export default function ClientDirectory({ initialShops }: { initialShops: Shop[] }) {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredShops = initialShops.filter((shop) =>
        shop.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-8 pb-12 w-full max-w-4xl mx-auto">
            <div className="text-center md:text-left">
                <h2 className="text-4xl md:text-5xl font-bold font-serif text-zinc-900 dark:text-white tracking-tight" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{t('directory.all_shops')}</h2>
                <p className="text-zinc-500 dark:text-zinc-400 mt-3 text-lg font-medium">{t('landing.hero_desc')}</p>
            </div>

            <div className="relative">
                <input
                    type="text"
                    placeholder={t('directory.search_placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-6 py-4 focus:outline-none focus:border-yellow-600 focus:ring-1 focus:ring-yellow-600 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 transition-colors"
                />
            </div>

            {filteredShops.length === 0 ? (
                <div className="bg-zinc-100/30 dark:bg-zinc-900/40 rounded-3xl p-12 text-center border border-zinc-200/50 dark:border-zinc-800/80">
                    <p className="text-zinc-500 dark:text-zinc-400 font-serif italic text-xl">
                        {t('directory.no_results')}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredShops.map((shop) => (
                        <a
                            key={shop.id}
                            href={shop.slug ? `/${shop.slug}` : `/book/${shop.id}`}
                            className="bg-zinc-100/50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/40 rounded-3xl p-8 hover:border-yellow-600/50 dark:hover:border-yellow-500/50 hover:bg-white dark:hover:bg-zinc-900/80 transition-all duration-500 group block relative overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:shadow-yellow-600/5 cursor-pointer"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/0 via-transparent to-yellow-600/0 group-hover:from-yellow-600/5 group-hover:to-transparent transition-colors duration-500"></div>
                            <h3 className="text-2xl font-bold mb-3 text-zinc-900 dark:text-white font-serif relative z-10" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                                {shop.name}
                            </h3>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6 relative z-10 font-medium">
                                {shop.address || "No address provided"}
                            </p>
                            <div className="text-yellow-600 dark:text-yellow-500 font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all relative z-10">
                                {t('directory.book_now')} <span aria-hidden="true">&rarr;</span>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
