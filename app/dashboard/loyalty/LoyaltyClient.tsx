'use client'

import { useState } from 'react'

type Client = {
    id: string
    name: string | null
    email: string | null
    phone: string | null
    loyaltyPoints: number
}

type Reward = {
    id: string
    name: string
    pointsCost: number
    description: string | null
}

export default function LoyaltyClient({ clients, initialRewards = [] }: { clients: Client[], initialRewards: Reward[] }) {
    const [rewards, setRewards] = useState<Reward[]>(initialRewards)
    
    // Reward Form State
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [rewardName, setRewardName] = useState('')
    const [rewardCost, setRewardCost] = useState('')
    const [rewardDesc, setRewardDesc] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    const handleCreateReward = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!rewardName.trim() || !rewardCost) return
        
        setIsSaving(true)
        try {
            const res = await fetch('/api/loyalty/rewards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: rewardName,
                    pointsCost: Number(rewardCost),
                    description: rewardDesc || null
                })
            })
            const data = await res.json()
            if (data.success) {
                setRewards(prev => [...prev, data.reward].sort((a, b) => a.pointsCost - b.pointsCost))
                setRewardName('')
                setRewardCost('')
                setRewardDesc('')
                setIsFormOpen(false)
            } else {
                alert(data.error || 'Error al guardar premio')
            }
        } catch (error) {
            console.error('Error creating reward:', error)
            alert('Error al conectar con el servidor')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteReward = async (id: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este premio de lealtad?')) return
        
        try {
            const res = await fetch(`/api/loyalty/rewards?id=${id}`, {
                method: 'DELETE'
            })
            const data = await res.json()
            if (data.success) {
                setRewards(prev => prev.filter(r => r.id !== id))
            } else {
                alert(data.error || 'Error al eliminar premio')
            }
        } catch (error) {
            console.error('Error deleting reward:', error)
            alert('Error al conectar con el servidor')
        }
    }

    // Standard fallback rewards if none exist yet
    const fallbackRewards = [
        { name: 'Bebida Premium o Descuento de $5', pointsCost: 100, description: 'Refresco importado, cerveza artesanal o descuento directo.' },
        { name: 'Cera para el Cabello Gratis', pointsCost: 250, description: 'Cera de fijación fuerte o mate de nuestra línea retail.' },
        { name: 'Corte & Barba VIP 100% Gratis', pointsCost: 500, description: 'Servicio completo VIP con afeitado a navaja y toalla caliente.' }
    ]

    const displayRewards = rewards.length > 0 ? rewards : fallbackRewards.map((r, i) => ({ id: `fallback-${i}`, ...r } as Reward))

    return (
        <div className="w-full max-w-6xl mx-auto pb-12 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-serif tracking-tight" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                        Programa de Lealtad (Rewards)
                    </h1>
                    <p className="text-zinc-500 mt-2">Los clientes ganan puntos por cada cita o producto. Configura recompensas para incentivar su regreso.</p>
                </div>
                <button
                    onClick={() => setIsFormOpen(!isFormOpen)}
                    className="bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-bold px-5 py-3 rounded-xl transition-all shadow-md text-sm shrink-0 flex items-center gap-2"
                >
                    {isFormOpen ? 'Cerrar Panel' : '＋ Configurar Nuevo Premio'}
                </button>
            </div>

            {/* Create Reward Form Panel */}
            {isFormOpen && (
                <div className="mb-8 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-inner animate-fade-in">
                    <h2 className="text-xl font-bold font-serif mb-4">Configurar Premio de Fidelidad</h2>
                    <form onSubmit={handleCreateReward} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Nombre del Premio</label>
                                <input 
                                    type="text" 
                                    required
                                    value={rewardName}
                                    onChange={e => setRewardName(e.target.value)}
                                    placeholder="e.g. Cera Mate Premium o Afeitado Gratis"
                                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-0 focus:border-yellow-600 font-medium"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Costo en Puntos</label>
                                <input 
                                    type="number" 
                                    min={1}
                                    required
                                    value={rewardCost}
                                    onChange={e => setRewardCost(e.target.value)}
                                    placeholder="e.g. 150"
                                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-0 focus:border-yellow-600 font-bold"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Descripción (Opcional)</label>
                                <input 
                                    type="text" 
                                    value={rewardDesc}
                                    onChange={e => setRewardDesc(e.target.value)}
                                    placeholder="Detalles sobre lo que incluye el premio"
                                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-0 focus:border-yellow-600 font-medium"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md text-sm"
                            >
                                {isSaving ? 'Guardando...' : 'Guardar Premio'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Rewards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {displayRewards.map(reward => {
                    const isFallback = reward.id.startsWith('fallback-')
                    return (
                        <div 
                            key={reward.id} 
                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between items-center text-center relative overflow-hidden group"
                        >
                            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-full flex items-center justify-center mb-4">
                                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                            </div>
                            <h3 className="font-bold text-lg mb-1">{reward.name}</h3>
                            <span className="text-yellow-600 font-serif font-bold text-xl block mb-2">{reward.pointsCost} Puntos</span>
                            <p className="text-xs text-zinc-500 mb-4 max-w-[200px]">{reward.description || 'Sin descripción adicional.'}</p>
                            
                            {!isFallback && (
                                <button
                                    onClick={() => handleDeleteReward(reward.id)}
                                    className="text-red-500 hover:text-red-700 text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity mt-2"
                                >
                                    Eliminar Premio
                                </button>
                            )}
                            {isFallback && (
                                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-2">Premio de Ejemplo</span>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Top Leaderboard */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex justify-between items-center">
                    <h2 className="font-bold text-lg">Tabla de Clasificación (Top Clientes)</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-zinc-100 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-medium">
                            <tr>
                                <th className="px-6 py-4"># Rank</th>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Contacto</th>
                                <th className="px-6 py-4 text-right">Puntos (Pts)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-zinc-900 dark:text-zinc-100 divide-zinc-200 dark:border-zinc-800">
                            {clients.length > 0 ? (
                                clients.map((client, index) => (
                                    <tr key={client.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-zinc-400">
                                            {index === 0 ? '🥇 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : (index + 1)}
                                        </td>
                                        <td className="px-6 py-4 font-bold">{client.name || 'Sin Nombre'}</td>
                                        <td className="px-6 py-4 text-zinc-500">{client.email || client.phone || 'N/A'}</td>
                                        <td className="px-6 py-4 text-right font-bold font-serif text-lg text-yellow-600">{client.loyaltyPoints} pts</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                                        Aún no hay clientes con puntos de lealtad.
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
