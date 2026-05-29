'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Suspense } from 'react';

function ClientRegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnUrl = searchParams?.get('returnUrl') || '/';
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
    });
    
    // OTP-specific states
    const [step, setStep] = useState<'signup' | 'verify'>('signup');
    const [verificationToken, setVerificationToken] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [mockReceivedCode, setMockReceivedCode] = useState('');
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Timer countdown for resending code
    useEffect(() => {
        let interval: any;
        if (step === 'verify' && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    const handleSignupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/register-customer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // Move to verification step
            setVerificationToken(data.token);
            setMockReceivedCode(data.code || '');
            setStep('verify');
            setTimer(60);
            setCanResend(false);
            setVerificationCode('');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (verificationCode.length !== 6) {
            setError('Please enter the 6-digit code');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/register-customer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: verificationToken,
                    code: verificationCode,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Verification failed');
            }

            // Auto login after successful registration
            const loginRes = await signIn('credentials', {
                redirect: false,
                email: formData.email,
                password: formData.password,
            });

            if (!loginRes?.ok) {
                throw new Error('Could not sign in automatically. Please sign in manually.');
            }

            router.push(returnUrl);
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (!canResend) return;
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/register-customer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to resend code');
            }

            setVerificationToken(data.token);
            setMockReceivedCode(data.code || '');
            setTimer(60);
            setCanResend(false);
            setVerificationCode('');
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
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <svg className="mx-auto h-12 w-12 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                <h2 className="mt-4 text-3xl font-extrabold text-black dark:text-white tracking-tight">
                    {step === 'signup' ? 'Create an Account' : 'Verify Your Account'}
                </h2>
                {step === 'signup' && (
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                        Already have an account?{' '}
                        <Link
                            href={`/client/login?returnUrl=${encodeURIComponent(returnUrl)}`}
                            className="font-medium text-black dark:text-white hover:underline transition-all"
                        >
                            Sign in here
                        </Link>
                    </p>
                )}
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-zinc-900 py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-zinc-200 dark:border-zinc-800">
                    
                    {error && (
                        <div className="mb-5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm border border-red-200 dark:border-red-800 font-medium text-center flex items-center justify-center gap-2">
                            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span>{error}</span>
                        </div>
                    )}

                    {step === 'signup' ? (
                        <form className="space-y-5" onSubmit={handleSignupSubmit}>
                            <div>
                                <label htmlFor="name" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                    Full Name
                                </label>
                                <div className="mt-1.5">
                                    <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange}
                                        className="appearance-none block w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-xl shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black dark:focus:ring-white dark:focus:border-white sm:text-sm bg-zinc-50 dark:bg-zinc-950 text-black dark:text-white transition-shadow"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                    Email Address
                                </label>
                                <div className="mt-1.5">
                                    <input id="email" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange}
                                        className="appearance-none block w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-xl shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black dark:focus:ring-white dark:focus:border-white sm:text-sm bg-zinc-50 dark:bg-zinc-950 text-black dark:text-white transition-shadow"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                    WhatsApp Number
                                </label>
                                <p className="text-xs text-zinc-500 mb-1">Used to send you booking tickets and reminders.</p>
                                <div className="mt-1.5 relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <input id="phone" name="phone" type="tel" required value={formData.phone} onChange={handleChange}
                                        className="appearance-none block w-full pl-11 px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-xl shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black dark:focus:ring-white dark:focus:border-white sm:text-sm bg-zinc-50 dark:bg-zinc-950 text-black dark:text-white transition-shadow"
                                        placeholder="+1 234 567 890"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                    Password
                                </label>
                                <div className="mt-1.5">
                                    <input id="password" name="password" type="password" autoComplete="new-password" required value={formData.password} onChange={handleChange}
                                        className="appearance-none block w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-xl shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black dark:focus:ring-white dark:focus:border-white sm:text-sm bg-zinc-50 dark:bg-zinc-950 text-black dark:text-white transition-shadow"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button type="submit" disabled={isLoading}
                                    className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-black hover:bg-zinc-800 dark:text-black dark:bg-white dark:hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] cursor-pointer"
                                >
                                    {isLoading ? 'Creating account...' : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form className="space-y-6" onSubmit={handleVerifySubmit}>
                            <div className="text-center">
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                    A 6-digit security code has been sent to your contact details (<strong>{formData.email}</strong>).
                                </p>
                                <p className="text-sm text-zinc-500 mt-1.5">
                                    Please enter it below to confirm your registration.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 text-center mb-2">
                                    Verification Code
                                </label>
                                <input
                                    type="text"
                                    maxLength={6}
                                    required
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                                    placeholder="000000"
                                    className="w-full text-center tracking-[0.5em] pl-[0.5em] py-3.5 border border-zinc-300 dark:border-zinc-700 rounded-xl font-mono text-3xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-zinc-50 dark:bg-zinc-950 text-black dark:text-white transition-shadow"
                                />
                            </div>

                            {mockReceivedCode && (
                                <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 text-yellow-800 dark:text-yellow-200 text-xs leading-relaxed flex flex-col gap-1.5 shadow-sm">
                                    <div className="font-extrabold flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                                        <svg className="h-4.5 w-4.5 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        [Simulador de WhatsApp / Email]
                                    </div>
                                    <span>Código de verificación recibido: <strong className="font-mono text-sm select-all bg-yellow-500/10 px-2 py-0.5 rounded text-yellow-950 dark:text-yellow-100">{mockReceivedCode}</strong></span>
                                </div>
                            )}

                            <div className="flex flex-col gap-3">
                                <button type="submit" disabled={isLoading || verificationCode.length !== 6}
                                    className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-black hover:bg-zinc-800 dark:text-black dark:bg-white dark:hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] cursor-pointer"
                                >
                                    {isLoading ? 'Verifying...' : 'Verify & Register'}
                                </button>
                                
                                <div className="text-center text-xs mt-2 text-zinc-500 flex flex-col gap-1.5">
                                    {timer > 0 ? (
                                        <span>Resend code in {timer}s</span>
                                    ) : (
                                        <button type="button" onClick={handleResendCode} disabled={isLoading}
                                            className="font-semibold text-black dark:text-white hover:underline focus:outline-none transition-all disabled:opacity-50"
                                        >
                                            Resend Verification Code
                                        </button>
                                    )}
                                    
                                    <button type="button" onClick={() => { setStep('signup'); setError(''); }} disabled={isLoading}
                                        className="text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white font-medium hover:underline transition-all mt-2 focus:outline-none"
                                    >
                                        ← Edit signup details
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {step === 'signup' && (
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
                                <button type="button" onClick={() => alert('Google Auth to be configured in Cloud Console')}
                                    className="w-full flex items-center justify-center gap-3 py-3.5 px-4 border border-zinc-300 dark:border-zinc-700 rounded-xl shadow-sm text-sm font-bold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all active:scale-[0.98] cursor-pointer"
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
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ClientRegisterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8"><div className="text-center">Loading...</div></div>}>
            <ClientRegisterForm />
        </Suspense>
    );
}
