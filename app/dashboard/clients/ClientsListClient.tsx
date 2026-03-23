'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MagnifyingGlassIcon, PhoneIcon, EnvelopeIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import { formatCurrency } from '../../lib/currency'
import { useTranslation } from '../../contexts/LanguageContext'

type ClientData = {
    id: string
    name: string | null
    email: string
    phone: string | null
    image: string | null
    totalAppointments: number
    lastVisit: string
    totalSpent: number
    status: string
}

export default function ClientsListClient({ shopCurrency }: { shopCurrency: string }) {
    const { t } = useTranslation()
    const [clients, setClients] = useState<ClientData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchClients()
    }, [])

    const fetchClients = async () => {
        try {
            const res = await fetch('/api/clients')
            const data = await res.json()
            if (data.success) {
                setClients(data.clients)
            }
        } catch (error) {
            console.error('Failed to fetch clients', error)
        } finally {
            setIsLoading(false)
        }
    }

    const filteredClients = clients.filter(c => 
        (c.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (c.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (c.phone || '').includes(searchTerm)
    )

    if (isLoading) {
        return (
            <div className="w-full max-w-6xl mx-auto flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-6xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-serif tracking-tight" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                        Directorio de Clientes
                    </h1>
                    <p className="text-zinc-500 mt-2">Gestiona el historial de servicios, notas y métricas de tus clientes.</p>
                </div>
                
                <div className="relative w-full md:w-72">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Buscar cliente (nombre, email, teléfono)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-600 transition-all font-medium"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Contacto</th>
                                <th className="px-6 py-4 text-center">Visitas</th>
                                <th className="px-6 py-4">Última Visita</th>
                                <th className="px-6 py-4">LTV (Ingresos)</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-zinc-900 dark:text-zinc-100 divide-zinc-200 dark:divide-zinc-800">
                            {filteredClients.length > 0 ? (
                                filteredClients.map((client) => (
                                    <tr key={client.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden shrink-0 flex items-center justify-center font-bold text-zinc-500">
                                                {client.image ? (
                                                    <img src={client.image} alt={client.name || 'C'} className="w-full h-full object-cover" />
                                                ) : (
                                                    (client.name || 'C').charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <span className="font-bold">{client.name || 'Sin Nombre'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span>{client.email}</span>
                                                <span className="text-xs text-zinc-500">{client.phone || 'Sin teléfono'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-yellow-600 dark:text-yellow-500">
                                            {client.totalAppointments}
                                        </td>
                                        <td className="px-6 py-4">
                                            {new Date(client.lastVisit).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-bold">
                                            {formatCurrency(client.totalSpent, shopCurrency)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link 
                                                href={`/dashboard/clients/${client.id}`}
                                                className="inline-flex items-center gap-2 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-4 py-2 rounded-lg font-bold transition-all text-xs"
                                            >
                                                Ver Perfil
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                                        No se encontraron clientes que coincidan con la búsqueda.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
