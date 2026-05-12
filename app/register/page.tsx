'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        barbershopName: '',
        ownerName: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            // Redirect to dashboard on success
            router.push('/dashboard');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    return (
        <div className="min-h-screen bg-black text-zinc-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-yellow-500/30 font-sans">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black pointer-events-none z-0"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="text-center mb-8 animate-in fade-in slide-in-from-top-8 duration-1000">
                    <span className="text-yellow-600 text-xs font-bold tracking-[0.3em] uppercase block mb-4">Únete a la Élite</span>
                    <h2 className="text-4xl md:text-5xl font-serif text-white tracking-tight" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                        Crea tu Cuenta
                    </h2>
                    <p className="mt-4 text-center text-sm text-zinc-400">
                        O{' '}
                        <a
                            href="/login"
                            className="font-medium text-yellow-600 hover:text-yellow-500 transition-colors hover:underline"
                        >
                            inicia sesión
                        </a>
                    </p>
                </div>
            </div>

            <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                <div className="bg-zinc-900/40 backdrop-blur-md py-8 px-4 shadow-2xl sm:rounded-3xl sm:px-10 border border-white/5 relative overflow-hidden group">
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-600/5 rounded-full blur-3xl group-hover:bg-yellow-600/15 transition-colors duration-500"></div>

                    <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-900/30 text-red-400 p-4 rounded-xl text-sm border border-red-500/50 backdrop-blur-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label
                                htmlFor="barbershopName"
                                className="block text-sm font-medium text-zinc-300"
                            >
                                Nombre de la Barbería
                            </label>
                            <div className="mt-2">
                                <input
                                    id="barbershopName"
                                    name="barbershopName"
                                    type="text"
                                    required
                                    value={formData.barbershopName}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-4 py-3 border border-white/10 rounded-xl shadow-sm placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-yellow-600 focus:border-yellow-600 sm:text-sm bg-black/50 text-white transition-all focus:bg-black/80"
                                    placeholder="Tu Barbería"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="ownerName"
                                className="block text-sm font-medium text-zinc-300"
                            >
                                Tu Nombre
                            </label>
                            <div className="mt-2">
                                <input
                                    id="ownerName"
                                    name="ownerName"
                                    type="text"
                                    required
                                    value={formData.ownerName}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-4 py-3 border border-white/10 rounded-xl shadow-sm placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-yellow-600 focus:border-yellow-600 sm:text-sm bg-black/50 text-white transition-all focus:bg-black/80"
                                    placeholder="Nombre"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-zinc-300"
                            >
                                Correo Electrónico
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-4 py-3 border border-white/10 rounded-xl shadow-sm placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-yellow-600 focus:border-yellow-600 sm:text-sm bg-black/50 text-white transition-all focus:bg-black/80"
                                    placeholder="tu@email.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-zinc-300"
                            >
                                Contraseña
                            </label>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-4 py-3 border border-white/10 rounded-xl shadow-sm placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-yellow-600 focus:border-yellow-600 sm:text-sm bg-black/50 text-white transition-all focus:bg-black/80"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-full shadow-[0_0_30px_rgba(217,119,6,0.15)] text-sm font-bold text-black bg-yellow-600 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-600 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 active:scale-95 uppercase tracking-widest"
                            >
                                {isLoading ? 'Registrando...' : 'Registrar Barbería'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
                        <div className="flex flex-col items-center gap-4">
                            <span className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">O continuar con</span>
                            <button type="button" onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-full border border-transparent hover:border-white/10 text-sm font-bold text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 focus:outline-none transition-all active:scale-[0.98] group"
                            >
                                <svg className="h-5 w-5 group-hover:scale-110 transition-transform" aria-hidden="true" viewBox="0 0 24 24">
                                    <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
                                    <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
                                    <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
                                    <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853" />
                                </svg>
                                Google
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
