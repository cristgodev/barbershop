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
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Select a Barbershop</h2>
                <p className="text-zinc-500 mt-2">Choose your preferred location to book an appointment.</p>
            </div>

            <div className="relative">
                <input
                    type="text"
                    placeholder="Search barbershops by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-black dark:text-white"
                />
            </div>

            {filteredShops.length === 0 ? (
                <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-8 text-center border border-zinc-200 dark:border-zinc-800">
                    <p className="text-zinc-500">
                        {initialShops.length === 0
                            ? "No barbershops available at the moment."
                            : "No barbershops found matching your search."
                        }
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredShops.map((shop) => (
                        <a
                            key={shop.id}
                            href={shop.slug ? `/${shop.slug}` : `/book/${shop.id}`}
                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-black dark:hover:border-white transition-all group block"
                        >
                            <h3 className="text-xl font-bold mb-2 group-hover:text-black dark:group-hover:text-white transition-colors">
                                {shop.name}
                            </h3>
                            <p className="text-zinc-500 text-sm mb-4">
                                {shop.address || "No address provided"}
                            </p>
                            <div className="text-black dark:text-white font-medium text-sm flex items-center gap-2">
                                Book Here &rarr;
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
