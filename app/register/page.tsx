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
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-black dark:text-white">
                    Create your Barbershop Account
                </h2>
                <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
                    Get started with your new SaaS dashboard.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-zinc-900 py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-zinc-200 dark:border-zinc-800">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm border border-red-200 dark:border-red-800">
                                {error}
                            </div>
                        )}

                        <div>
                            <label
                                htmlFor="barbershopName"
                                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                            >
                                Barbershop Name
                            </label>
                            <div className="mt-1">
                                <input
                                    id="barbershopName"
                                    name="barbershopName"
                                    type="text"
                                    required
                                    value={formData.barbershopName}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-black focus:border-black dark:focus:ring-white dark:focus:border-white sm:text-sm bg-white dark:bg-zinc-950 text-black dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="ownerName"
                                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                            >
                                Owner Name
                            </label>
                            <div className="mt-1">
                                <input
                                    id="ownerName"
                                    name="ownerName"
                                    type="text"
                                    required
                                    value={formData.ownerName}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-black focus:border-black dark:focus:ring-white dark:focus:border-white sm:text-sm bg-white dark:bg-zinc-950 text-black dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                            >
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-black focus:border-black dark:focus:ring-white dark:focus:border-white sm:text-sm bg-white dark:bg-zinc-950 text-black dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                            >
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-black focus:border-black dark:focus:ring-white dark:focus:border-white sm:text-sm bg-white dark:bg-zinc-950 text-black dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-zinc-800 dark:text-black dark:bg-white dark:hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Registering...' : 'Register'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-zinc-300 dark:border-zinc-700" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-zinc-900 text-zinc-500">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button type="button" onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 border border-zinc-300 dark:border-zinc-700 rounded-xl shadow-sm text-sm font-bold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all active:scale-[0.98]"
                            >
                                <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                                    <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
                                    <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
                                    <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
                                    <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853" />
                                </svg>
                                Continue with Google
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
