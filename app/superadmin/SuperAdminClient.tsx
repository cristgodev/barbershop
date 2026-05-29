'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type ShopData = {
    id: string;
    name: string;
    slug: string | null;
    isActive: boolean;
    createdAt: Date;
    _count: {
        appointments: number;
        staff: number;
    }
};

export default function SuperAdminClient({ shops: initialShops }: { shops: ShopData[] }) {
    const [shops, setShops] = useState(initialShops);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const router = useRouter();

    const toggleStatus = async (shopId: string, currentStatus: boolean) => {
        setIsUpdating(shopId);
        try {
            const res = await fetch(`/api/superadmin/shops/${shopId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus })
            });
            const data = await res.json();
            if (data.success) {
                setShops(shops.map(s => s.id === shopId ? { ...s, isActive: !currentStatus } : s));
                router.refresh();
            } else {
                alert('Error al actualizar estado');
            }
        } catch (error) {
            console.error(error);
            alert('Error de conexión');
        } finally {
            setIsUpdating(null);
        }
    };

    const deleteShop = async (shopId: string, shopName: string) => {
        if (!confirm(`¿Estás completamente seguro de que deseas eliminar permanentemente la barbería "${shopName}"? Esta acción borrará todas sus citas, productos, servicios y registros relacionados, y NO se puede deshacer.`)) {
            return;
        }

        setIsUpdating(shopId);
        try {
            const res = await fetch(`/api/superadmin/shops/${shopId}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.success) {
                setShops(shops.filter(s => s.id !== shopId));
                router.refresh();
            } else {
                alert(data.error || 'Error al eliminar la barbería');
            }
        } catch (error) {
            console.error(error);
            alert('Error de conexión');
        } finally {
            setIsUpdating(null);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
                            <span className="bg-red-600 text-white px-2 py-1 rounded text-sm font-black tracking-widest uppercase">SuperAdmin</span>
                            Gestión de Barberías (SaaS)
                        </h1>
                        <p className="text-zinc-500 mt-2">Control total sobre los inquilinos (tenants) registrados en la plataforma.</p>
                    </div>
                    <Link href="/api/auth/signout" className="text-sm font-bold text-zinc-500 hover:text-black dark:hover:text-white transition-colors">
                        Cerrar Sesión
                    </Link>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-zinc-100 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Barbería</th>
                                    <th className="px-6 py-4">Métricas</th>
                                    <th className="px-6 py-4">Fecha de Registro</th>
                                    <th className="px-6 py-4 text-center">Estado</th>
                                    <th className="px-6 py-4 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-zinc-900 dark:text-zinc-100 divide-zinc-200 dark:divide-zinc-800">
                                {shops.map(shop => (
                                    <tr key={shop.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-base">{shop.name}</div>
                                            <a href={`/${shop.slug}`} target="_blank" className="text-xs text-yellow-600 hover:underline flex items-center gap-1 mt-1">
                                                /{shop.slug}
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                            </a>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col text-xs text-zinc-500">
                                                <span><strong className="text-zinc-900 dark:text-zinc-300">{shop._count.staff}</strong> Staff</span>
                                                <span><strong className="text-zinc-900 dark:text-zinc-300">{shop._count.appointments}</strong> Citas</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-500">
                                            {new Date(shop.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {shop.isActive ? (
                                                <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1 rounded-full font-bold text-xs">
                                                    Activa
                                                </span>
                                            ) : (
                                                <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-3 py-1 rounded-full font-bold text-xs">
                                                    Suspendida
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2.5">
                                            <button 
                                                onClick={() => toggleStatus(shop.id, shop.isActive)}
                                                disabled={isUpdating === shop.id}
                                                className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors ${
                                                    shop.isActive 
                                                        ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-900/50' 
                                                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/50'
                                                }`}
                                            >
                                                {isUpdating === shop.id 
                                                    ? 'Cambiando...' 
                                                    : shop.isActive ? 'Suspender' : 'Reactivar'
                                                }
                                            </button>
                                            <button 
                                                onClick={() => deleteShop(shop.id, shop.name)}
                                                disabled={isUpdating === shop.id}
                                                className="px-4 py-2 rounded-xl font-bold text-xs bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/50 transition-colors shadow-sm"
                                            >
                                                {isUpdating === shop.id ? 'Eliminando...' : 'Eliminar'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
