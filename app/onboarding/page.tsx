'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function OnboardingPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [shopName, setShopName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
                <p className="text-zinc-500 font-medium">Cargando...</p>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        router.push('/login');
        return null;
    }

    // If somehow they already have a shop, kick them to dashboard
    if (session?.user?.barbershopId) {
        router.push('/dashboard');
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!shopName.trim()) {
            setError('Por favor, ingresa el nombre de tu tienda.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/shop/onboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: shopName.trim() }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Ocurrió un error al crear la tienda.');
            }

            // Successfully created. Redirect to dashboard, which will trigger token refresh
            router.push('/dashboard');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute inset-0 z-0 bg-yellow-600/5 pointer-events-none"></div>
            
            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="flex justify-center flex-col items-center">
                    <span className="w-16 h-16 bg-yellow-600/20 text-yellow-600 dark:text-yellow-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-yellow-600/10">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                    </span>
                    <h2 className="text-center text-4xl font-extrabold text-zinc-900 dark:text-white font-serif" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                        ¡Bienvenido, Dueño!
                    </h2>
                    <p className="mt-3 text-center text-zinc-600 dark:text-zinc-400 max-w-sm text-lg">
                        Estás a un paso de acceder a tu panel de control. Danos el nombre de tu increíble barbería.
                    </p>
                </div>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-white dark:bg-zinc-900/80 py-10 px-6 sm:px-10 shadow-2xl sm:rounded-[2rem] border border-zinc-200 dark:border-zinc-800 backdrop-blur-md">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm border border-red-200 dark:border-red-800 font-medium">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="shopName" className="block text-sm font-semibold text-zinc-900 dark:text-white mb-2">
                                Nombre de la Barbería
                            </label>
                            <input
                                id="shopName"
                                name="shopName"
                                type="text"
                                required
                                placeholder="Ej: Barbería Vintage, El Patrón..."
                                value={shopName}
                                onChange={(e) => setShopName(e.target.value)}
                                className="appearance-none block w-full px-4 py-3.5 border border-zinc-300 dark:border-zinc-700 rounded-xl shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent dark:focus:ring-yellow-500 sm:text-base bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white transition-all font-medium"
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white bg-black hover:bg-zinc-800 dark:text-black dark:bg-white dark:hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 hover:-translate-y-1"
                            >
                                {isLoading ? 'Creando tienda...' : 'Comenzar Imperio'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
