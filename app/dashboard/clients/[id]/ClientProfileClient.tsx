'use client'

import { UserIcon, PhoneIcon, EnvelopeIcon, CalendarIcon, StarIcon, CheckCircleIcon, XCircleIcon, StopIcon, FlagIcon, ClockIcon } from '@heroicons/react/24/outline'
import { formatCurrency } from '../../../lib/currency'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type ClientData = {
    id: string
    name: string | null
    email: string
    phone: string | null
    image: string | null
    createdAt: string
}

type AppointmentData = {
    id: string
    date: string
    startTime: string
    status: string
    service: { name: string, price: number }
    barber: { name: string }
}

type NoteData = {
    id: string
    content: string
    createdAt: string
    author: { name: string, role: string } | null
}

export default function ClientProfileClient({ clientId, shopCurrency }: { clientId: string, shopCurrency: string }) {
    const router = useRouter()
    const [client, setClient] = useState<ClientData | null>(null)
    const [appointments, setAppointments] = useState<AppointmentData[]>([])
    const [notes, setNotes] = useState<NoteData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [newNote, setNewNote] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        fetchClientData()
    }, [clientId])

    const fetchClientData = async () => {
        try {
            const res = await fetch(`/api/clients/${clientId}/notes`)
            const data = await res.json()
            if (data.success) {
                setClient(data.client)
                setAppointments(data.appointments)
                setNotes(data.notes)
            } else {
                router.push('/dashboard/clients')
            }
        } catch (error) {
            console.error('Failed to fetch client details', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newNote.trim()) return

        setIsSubmitting(true)
        try {
            const res = await fetch(`/api/clients/${clientId}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newNote })
            })
            const data = await res.json()
            if (data.success) {
                setNotes([data.note, ...notes])
                setNewNote('')
            }
        } catch (error) {
            console.error('Failed to add note', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading || !client) {
        return (
            <div className="w-full max-w-6xl mx-auto flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
            </div>
        )
    }

    const totalSpent = appointments
        .filter(a => a.status === 'COMPLETED')
        .reduce((sum, a) => sum + (a.service?.price || 0), 0)

    const noShows = appointments.filter(a => a.status === 'CANCELLED' || a.status === 'NO_SHOW').length

    return (
        <div className="w-full max-w-6xl mx-auto pb-12">
            {/* Header / Breadcrumb */}
            <div className="mb-8 flex items-center gap-4">
                <Link href="/dashboard/clients" className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-zinc-600 dark:text-zinc-400">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold font-serif tracking-tight text-zinc-900 dark:text-white" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                        Perfil del Cliente
                    </h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile Card & Stats */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-yellow-600/20 to-transparent"></div>
                        <div className="w-28 h-28 rounded-full bg-zinc-100 dark:bg-zinc-800 border-4 border-white dark:border-zinc-900 overflow-hidden flex items-center justify-center text-4xl font-serif text-zinc-500 z-10 shadow-lg mb-4">
                            {client.image ? (
                                <img src={client.image} alt={client.name || ''} className="w-full h-full object-cover" />
                            ) : (
                                (client.name || 'C').charAt(0).toUpperCase()
                            )}
                        </div>
                        <h2 className="text-2xl font-bold font-serif z-10" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{client.name || 'Sin Nombre'}</h2>
                        <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider mt-2 z-10">VIP Client</span>
                        
                        <div className="w-full space-y-3 mt-8 text-sm z-10 text-left">
                            <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                <span className="truncate">{client.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                <span>{client.phone || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <span>Cliente desde {new Date(client.createdAt).getFullYear()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">LTV & Lifetime Metrics</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-800">
                                <span className="text-zinc-600 dark:text-zinc-400">Ingresos Totales</span>
                                <span className="text-xl font-bold font-serif text-yellow-600">{formatCurrency(totalSpent, shopCurrency)}</span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-800">
                                <span className="text-zinc-600 dark:text-zinc-400">Citas Completadas</span>
                                <span className="text-lg font-bold">{appointments.filter(a => a.status === 'COMPLETED').length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-zinc-600 dark:text-zinc-400">Canceladas / No-Shows</span>
                                <span className="text-lg font-bold text-red-500">{noShows}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Appointments & Notes Tabs */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Notes Section (CRM Core) */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[500px]">
                        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
                            <h3 className="text-lg font-bold font-serif" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Notas Privadas del Barbero</h3>
                            <p className="text-xs text-zinc-500 mt-1">El cliente no puede ver estas notas. Úsalas para fórmulas, preferencias o detalles personales.</p>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-50/50 dark:bg-zinc-900/50">
                            {notes.length > 0 ? (
                                notes.map(note => (
                                    <div key={note.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                                                    {(note.author?.name || 'A').charAt(0)}
                                                </div>
                                                <span className="text-sm font-bold">{note.author?.name || 'Sistema'}</span>
                                            </div>
                                            <span className="text-xs text-zinc-400">
                                                {new Date(note.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-zinc-600 dark:text-zinc-300 text-sm whitespace-pre-wrap">{note.content}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-2">
                                    <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    <p className="font-serif italic">No hay notas registradas para este cliente.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                            <form onSubmit={handleAddNote} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    placeholder="Escribe una nota interna sobre este cliente..."
                                    className="flex-1 bg-zinc-100 dark:bg-zinc-900 border-transparent focus:bg-white dark:focus:bg-zinc-800 focus:border-yellow-600 focus:ring-0 rounded-xl px-4 py-3 text-sm transition-colors"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !newNote.trim()}
                                    className="bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                    Guardar
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Service History */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm p-8">
                        <h3 className="text-lg font-bold font-serif mb-6" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Historial de Servicios</h3>
                        <div className="space-y-4">
                            {appointments.length > 0 ? (
                                appointments.map(app => (
                                    <div key={app.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-zinc-100 dark:border-zinc-800 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors gap-4">
                                        <div>
                                            <h4 className="font-bold text-zinc-900 dark:text-white">{app.service?.name}</h4>
                                            <p className="text-sm text-zinc-500 flex items-center gap-2 mt-1">
                                                <span>{new Date(app.date).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span>Con {app.barber?.name}</span>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                            <span className="font-bold font-serif text-lg">{formatCurrency(app.service?.price || 0, shopCurrency)}</span>
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full lowercase tracking-wide
                                                ${app.status === 'COMPLETED' ? 'bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900' : 
                                                  app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 
                                                  'bg-red-100 text-red-700'}`}>
                                                {app.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-zinc-500 py-8">No hay reservas registradas.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
