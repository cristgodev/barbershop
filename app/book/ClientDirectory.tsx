'use client';

import { useState } from 'react';

type Shop = {
    id: string;
    slug: string | null;
    name: string;
    address: string | null;
};

export default function ClientDirectory({ initialShops }: { initialShops: Shop[] }) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredShops = initialShops.filter((shop) =>
        shop.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-8 pb-12 w-full max-w-4xl mx-auto">
            <div className="text-center md:text-left">
                <h2 className="text-4xl md:text-5xl font-bold font-serif text-zinc-900 dark:text-white tracking-tight" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Directorio Exclusivo</h2>
                <p className="text-zinc-500 dark:text-zinc-400 mt-3 text-lg font-medium">Encuentra tu salón de preferencia para reservar una cita.</p>
            </div>

            <div className="relative">
                <input
                    type="text"
                    placeholder="Buscar barberías premium..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-6 py-4 focus:outline-none focus:border-yellow-600 focus:ring-1 focus:ring-yellow-600 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 transition-colors"
                />
            </div>

            {filteredShops.length === 0 ? (
                <div className="bg-zinc-100/30 dark:bg-zinc-900/40 rounded-3xl p-12 text-center border border-zinc-200/50 dark:border-zinc-800/80">
                    <p className="text-zinc-500 dark:text-zinc-400 font-serif italic text-xl">
                        {initialShops.length === 0
                            ? "No hay salones disponibles en este momento."
                            : "No se encontraron salones que coincidan con tu búsqueda."
                        }
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredShops.map((shop) => (
                        <a
                            key={shop.id}
                            href={shop.slug ? `/${shop.slug}` : `/book/${shop.id}`}
                            className="bg-zinc-100/50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 rounded-3xl p-8 hover:border-yellow-600 hover:bg-white dark:hover:bg-zinc-900 transition-all group block relative overflow-hidden"
                        >
                            <h3 className="text-2xl font-bold mb-3 text-zinc-900 dark:text-white font-serif relative z-10" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                                {shop.name}
                            </h3>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6 relative z-10 font-medium">
                                {shop.address || "No address provided"}
                            </p>
                            <div className="text-yellow-600 dark:text-yellow-500 font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all relative z-10">
                                Reservar Aquí <span aria-hidden="true">&rarr;</span>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
