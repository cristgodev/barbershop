'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddServiceForm() {
    const router = useRouter()
    
    const [name, setName] = useState('')
    const [price, setPrice] = useState('')
    const [durationMins, setDurationMins] = useState('30')
    const [description, setDescription] = useState('')
    
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const res = await fetch('/api/services', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    price,
                    durationMins,
                    description
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to add service')
            }

            // Reset form
            setName('')
            setPrice('')
            setDurationMins('30')
            setDescription('')
            
            router.refresh()
            
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-3 text-sm bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800">
                    {error}
                </div>
            )}

            <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Service Name *</label>
                <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Premium Haircut"
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow"
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Price ($) *</label>
                    <input
                        type="number"
                        step="0.01"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="25.00"
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow"
                    />
                </div>
                
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Duration (Mins) *</label>
                    <select
                        required
                        value={durationMins}
                        onChange={(e) => setDurationMins(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow"
                    >
                        <option value="15">15 mins</option>
                        <option value="30">30 mins</option>
                        <option value="45">45 mins</option>
                        <option value="60">1 hour</option>
                        <option value="90">1.5 hours</option>
                        <option value="120">2 hours</option>
                    </select>
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Description (Optional)</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly describe what this service includes."
                    rows={2}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow resize-none"
                />
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-semibold py-3 rounded-xl transition-all active:scale-95 disabled:opacity-50 mt-2 shadow-sm"
            >
                {isLoading ? 'Adding...' : 'Add Service'}
            </button>
        </form>
    )
}
