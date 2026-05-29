'use client'

import { useState, useEffect } from 'react'

type Client = {
    id: string
    name: string | null
    email: string | null
    phone: string | null
    noShowCount: number
}

export default function MarketingClient({ clients }: { clients: Client[] }) {
    const [blastMessage, setBlastMessage] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [successMsg, setSuccessMsg] = useState('')
    
    // Image Upload State
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState('')
    
    // Campaign History State
    const [campaigns, setCampaigns] = useState<any[]>([])
    const [isLoadingHistory, setIsLoadingHistory] = useState(true)

    useEffect(() => {
        fetchCampaigns()
    }, [])

    const fetchCampaigns = async () => {
        setIsLoadingHistory(true)
        try {
            const res = await fetch('/api/marketing')
            const data = await res.json()
            if (data.success) {
                setCampaigns(data.campaigns)
            }
        } catch (error) {
            console.error('Error fetching campaign history:', error)
        } finally {
            setIsLoadingHistory(false)
        }
    }

    const uploadFile = async (file: File) => {
        const formData = new FormData()
        formData.append('file', file)
        
        const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        })
        
        if (!res.ok) throw new Error('Failed to upload file')
        const data = await res.json()
        return data.files[0].url as string
    }

    const handleSendBlast = async () => {
        if (!blastMessage.trim()) return alert('El mensaje está vacío')
        setIsSending(true)
        try {
            let uploadedImageUrl = ''
            if (imageFile) {
                uploadedImageUrl = await uploadFile(imageFile)
            }

            const res = await fetch('/api/marketing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: blastMessage,
                    imageUrl: uploadedImageUrl || null
                })
            })

            const data = await res.json()
            if (data.success) {
                setSuccessMsg(`¡Campaña enviada exitosamente a ${clients.length} clientes!`)
                setBlastMessage('')
                setImageFile(null)
                setPreviewUrl('')
                // Refresh history
                fetchCampaigns()
                setTimeout(() => setSuccessMsg(''), 4000)
            } else {
                alert(data.error || 'Error al enviar campaña')
            }
        } catch (error) {
            console.error(error)
            alert('Error al conectar con el servidor')
        } finally {
            setIsSending(false)
        }
    }

    const noShowClients = clients.filter(c => c.noShowCount > 0)
    const activeClients = clients.filter(c => c.noShowCount === 0)

    return (
        <div className="w-full max-w-6xl mx-auto pb-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-serif tracking-tight" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                    Marketing & Retención
                </h1>
                <p className="text-zinc-500 mt-2">Envía campañas masivas (Blasts) y monitorea el riesgo de "No-Shows" (Ausentismo).</p>
            </div>

            {successMsg && (
                <div className="mb-8 p-4 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 font-bold rounded-xl border border-green-200 dark:border-green-800">
                    {successMsg}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Blast Compose Section */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <h2 className="text-xl font-bold font-serif mb-4">Nueva Campaña (Email/SMS Blast)</h2>
                        <p className="text-sm text-zinc-500 mb-6">Redacta una promoción para todos tus clientes. Ejemplo: "¡Regresa este martes y obtén 20% OFF en ceras!"</p>
                        
                        <textarea 
                            value={blastMessage}
                            onChange={e => setBlastMessage(e.target.value)}
                            placeholder="Escribe tu mensaje o promoción aquí..."
                            rows={5}
                            className="w-full mb-6 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-sm focus:ring-0 focus:border-black dark:focus:border-white resize-none"
                        />

                        {/* Image Upload Input */}
                        <div className="space-y-2 mb-6">
                            <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">Imagen Promocional (Opcional)</label>
                            <div className="flex items-center gap-4">
                                <label className="flex flex-col items-center justify-center w-32 h-20 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl cursor-pointer hover:border-black dark:hover:border-white transition-colors relative overflow-hidden">
                                    {previewUrl ? (
                                        <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                                    ) : (
                                        <div className="flex flex-col items-center text-zinc-400">
                                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            <span className="text-[10px] font-bold mt-1">Añadir Imagen</span>
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={e => {
                                            if (e.target.files && e.target.files[0]) {
                                                const file = e.target.files[0]
                                                setImageFile(file)
                                                setPreviewUrl(URL.createObjectURL(file))
                                            }
                                        }} 
                                        className="hidden" 
                                    />
                                </label>
                                {previewUrl && (
                                    <button 
                                        onClick={() => {
                                            setImageFile(null)
                                            setPreviewUrl('')
                                        }} 
                                        className="text-red-500 text-xs font-semibold hover:underline"
                                    >
                                        Quitar Imagen
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleSendBlast}
                        disabled={isSending || !blastMessage.trim()}
                        className="w-full bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-bold py-4 rounded-xl transition-transform active:scale-95 disabled:opacity-50"
                    >
                        {isSending ? 'Enviando Campaña...' : 'Disparar SMS/Email a Todos'}
                    </button>
                </div>

                {/* No Show Risk Table */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col">
                    <h2 className="text-xl font-bold font-serif mb-4 flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                        Clientes en Riesgo (No-Shows)
                    </h2>
                    <p className="text-sm text-zinc-500 mb-4">Clientes que han faltado a sus citas sin cancelar. Si llegan a 4 inasistencias, el sistema mitigará sus reservas futuras.</p>

                    <div className="flex-1 overflow-y-auto min-h-[250px] border border-zinc-100 dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-zinc-950 p-2">
                        {noShowClients.length > 0 ? (
                            <ul className="space-y-2">
                                {noShowClients.map(c => (
                                    <li key={c.id} className="flex justify-between items-center bg-white dark:bg-zinc-900 p-3 rounded-xl border border-red-100 dark:border-red-900/30">
                                        <div>
                                            <p className="font-bold text-sm">{c.name || 'Sin Nombre'}</p>
                                            <p className="text-xs text-zinc-500">{c.phone || c.email}</p>
                                        </div>
                                        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/30 px-3 py-1 rounded-full text-red-600 dark:text-red-400">
                                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                            <span className="font-bold text-xs">{c.noShowCount} faltas</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-60">
                                <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} className="mb-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <p className="text-sm font-bold text-zinc-500">Excelente Retención</p>
                                <p className="text-xs text-zinc-400 mt-1">Ninguno de tus clientes recientes registra inasistencias.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm mb-8">
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                    <h2 className="font-bold text-lg">Audiencia Activa ({activeClients.length})</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-zinc-100 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4 text-center">Inasistencias</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-zinc-900 dark:text-zinc-100 divide-zinc-200 dark:border-zinc-800">
                            {activeClients.length > 0 ? (
                                activeClients.map(c => (
                                    <tr key={c.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4 font-bold">
                                            {c.name || 'Sin Nombre'}
                                            {(c.email || c.phone) && <p className="text-xs text-zinc-500 font-normal">{c.email || c.phone}</p>}
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-green-600">0</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={2} className="px-6 py-12 text-center text-zinc-500">No hay clientes inscritos.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Campaign History Blast Log */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-yellow-500/5 blur-3xl pointer-events-none"></div>
                
                <h2 className="text-xl font-bold font-serif mb-2" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Historial de Campañas Enviadas</h2>
                <p className="text-zinc-500 text-sm mb-6">Un registro de todas las campañas promocionales enviadas a tus clientes.</p>

                {isLoadingHistory ? (
                    <div className="py-12 text-center text-zinc-500">Cargando historial...</div>
                ) : campaigns.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {campaigns.map((camp: any) => (
                            <div key={camp.id} className="flex gap-4 p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl relative overflow-hidden">
                                {camp.imageUrl && (
                                    <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                                        <img src={camp.imageUrl} className="w-full h-full object-cover" alt="Camp" />
                                    </div>
                                )}
                                <div className="flex flex-col flex-1 min-w-0">
                                    <p className="text-zinc-500 text-xs font-semibold mb-1">
                                        {new Date(camp.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <p className="text-sm text-zinc-800 dark:text-zinc-200 font-medium flex-1 line-clamp-3 leading-snug">
                                        {camp.message}
                                    </p>
                                    <div className="mt-3 flex items-center justify-between text-xs font-semibold text-zinc-400">
                                        <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                            Enviado
                                        </span>
                                        <span>Receptores: {camp.sentToCount}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center text-zinc-400 font-semibold border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                        Aún no has enviado ninguna campaña de marketing.
                    </div>
                )}
            </div>
        </div>
    )
}
