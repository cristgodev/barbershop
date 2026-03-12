'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Service = {
    id: string
    name: string
    price: number
    durationMins: number
    description: string | null
}

export default function ServicesList({ initialServices }: { initialServices: Service[] }) {
    const router = useRouter()
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this service?')) return

        setDeletingId(id)
        try {
            const res = await fetch(`/api/services?id=${id}`, {
                method: 'DELETE'
            })

            if (!res.ok) {
                const data = await res.json()
                alert(data.error || 'Failed to delete service')
            } else {
                router.refresh()
            }
        } catch (error) {
            alert('An unexpected error occurred')
        } finally {
            setDeletingId(null)
        }
    }

    if (initialServices.length === 0) {
        return (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 text-center text-zinc-500 flex flex-col items-center shadow-sm">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                <p className="font-semibold text-lg text-zinc-900 dark:text-zinc-100 mb-1">No services yet</p>
                <p>Use the form on the right to add your first service.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            {initialServices.map((service) => (
                <div key={service.id} className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-2xl p-6 transition-all duration-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-50 truncate">{service.name}</h4>
                            <span className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 text-xs px-2.5 py-1 rounded-full font-bold tracking-wider">
                                {service.durationMins} MINS
                            </span>
                        </div>
                        {service.description && (
                            <p className="text-sm text-zinc-500 line-clamp-2 mt-1">{service.description}</p>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-6 shrink-0 w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800 justify-between sm:justify-end">
                        <div className="text-xl font-extrabold text-black dark:text-white">
                            ${Number(service.price).toFixed(2)}
                        </div>
                        <button
                            onClick={() => handleDelete(service.id)}
                            disabled={deletingId === service.id}
                            className="text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 px-3 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {deletingId === service.id ? 'Deleting...' : (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                    Delete
                                </>
                            )}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}
