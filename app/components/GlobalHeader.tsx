'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import LanguageSwitcher from './LanguageSwitcher';

export default function GlobalHeader() {
    const pathname = usePathname();

    // Hidden on dashboards
    if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/client/dashboard')) {
        return null;
    }

    // Only show B2B Header on global marketing pages
    const isMainLanding = pathname === '/' || pathname === '/register' || pathname === '/login' || pathname?.startsWith('/book');

    if (isMainLanding) {
        return (
            <header className="px-6 py-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 bg-yellow-600 rounded flex items-center justify-center font-bold text-zinc-50 dark:text-zinc-950 group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(234,179,8,0.2)]">B</div>
                    <h1 className="text-xl font-bold tracking-wide font-serif text-zinc-900 dark:text-white uppercase" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Barbershop</h1>
                </Link>
                <div className="flex items-center gap-4">
                    <LanguageSwitcher />
                    <Link href="/login" className="hidden sm:inline-block bg-yellow-600 hover:bg-yellow-500 text-zinc-50 dark:text-zinc-950 px-6 py-2.5 rounded-full text-sm font-bold transition-colors shadow-[0_0_15px_rgba(234,179,8,0.15)] hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                        Acceso Socios
                    </Link>
                </div>
            </header>
        );
    }

    // Hide global header on B2C Shop Landing pages, they provide their own headers.
    return null;
}
