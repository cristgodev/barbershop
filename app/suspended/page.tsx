import Link from 'next/link';
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";

export default async function SuspendedPage() {
    const session = await getServerSession(authOptions);
    const isSuperAdmin = session?.user?.role === "SUPERADMIN";

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/30 rounded-3xl p-8 shadow-xl text-center">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold font-serif mb-4 text-zinc-900 dark:text-white">Cuenta Suspendida</h1>
                <p className="text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
                    El acceso a tu panel de control y a tu sistema de reservas ha sido temporalmente deshabilitado por falta de pago de tu suscripción o por problemas con tu facturación.
                </p>
                <div className="space-y-3">
                    {isSuperAdmin && (
                        <Link href="/superadmin" className="w-full block bg-yellow-600 text-black font-bold py-3 px-4 rounded-xl hover:bg-yellow-500 transition-colors uppercase tracking-widest text-sm">
                            Ir al Panel de Superadmin
                        </Link>
                    )}
                    <a href="mailto:soporte@tusaas.com" className="w-full block bg-black dark:bg-white text-white dark:text-black font-bold py-3 px-4 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
                        Contactar Soporte
                    </a>
                    <Link href="/api/auth/signout" className="w-full block text-zinc-500 font-semibold py-3 px-4 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        Cerrar Sesión
                    </Link>
                </div>
            </div>
        </div>
    );
}
