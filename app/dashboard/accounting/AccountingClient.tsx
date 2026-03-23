'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '../../contexts/LanguageContext'
import { formatCurrency } from '../../lib/currency'

type BarberStat = { id: string, name: string, revenue: number, cuts: number };

type PeriodStats = {
    totalRevenue: number;
    totalCuts: number;
    barbers: BarberStat[];
}

type AccountingClientProps = {
    stats: {
        currency: string
        today: PeriodStats;
        week: PeriodStats;
        month: PeriodStats;
        all: PeriodStats;
    }
}

type TimePeriod = 'today' | 'week' | 'month' | 'all'

export default function AccountingClient({ stats }: AccountingClientProps) {
    const { t } = useTranslation()
    const [period, setPeriod] = useState<TimePeriod>('month') // Defaulted to month due to goals
    
    type Goal = { barberId: string, targetAmount: number }
    const [goals, setGoals] = useState<Goal[]>([])
    const [editingGoalBarber, setEditingGoalBarber] = useState<string | null>(null)
    const [goalInput, setGoalInput] = useState('')

    useEffect(() => {
        fetchGoals()
    }, [])

    const fetchGoals = async () => {
        const now = new Date()
        try {
            const res = await fetch(`/api/staff/goals?month=${now.getMonth() + 1}&year=${now.getFullYear()}`)
            const data = await res.json()
            if (data.success) {
                setGoals(data.goals)
            }
        } catch (error) {
            console.error('Failed to fetch goals', error)
        }
    }

    const handleSetGoal = async (barberId: string) => {
        if (!goalInput || isNaN(Number(goalInput))) return
        const amount = Number(goalInput)
        
        const now = new Date()
        try {
            const res = await fetch('/api/staff/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    barberId,
                    month: now.getMonth() + 1,
                    year: now.getFullYear(),
                    targetAmount: amount
                })
            })
            const data = await res.json()
            if (data.success) {
                // Update local state
                setGoals(prev => {
                    const existing = prev.find(g => g.barberId === barberId)
                    if (existing) {
                        return prev.map(g => g.barberId === barberId ? { ...g, targetAmount: amount } : g)
                    }
                    return [...prev, { barberId, targetAmount: amount }]
                })
                setEditingGoalBarber(null)
                setGoalInput('')
            }
        } catch (error) {
            console.error('Failed to set goal', error)
        }
    }

    const currentStats = stats[period]

    return (
        <div className="flex flex-col gap-8 pb-12 w-full max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <a href="/dashboard" className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </a>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">{t('accounting.title')}</h1>
                        <p className="text-zinc-500 mt-1">{t('accounting.subtitle')}</p>
                    </div>
                </div>

                {/* Period Selector */}
                <div className="flex bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-xl w-fit">
                    {(['today', 'week', 'month', 'all'] as TimePeriod[]).map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                                period === p 
                                    ? 'bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm' 
                                    : 'text-zinc-500 hover:text-black dark:hover:text-white'
                            }`}
                        >
                            {p === 'today' ? t('accounting.period_today') : p === 'all' ? t('accounting.period_all') : p === 'week' ? t('accounting.period_week') : t('accounting.period_month')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Global Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-black text-white dark:bg-white dark:text-black rounded-2xl p-8 shadow-lg flex flex-col justify-center items-center">
                    <p className="text-sm font-bold tracking-widest uppercase opacity-70 mb-2">{t('accounting.net_revenue')} ({period === 'all' ? t('accounting.period_all') : period === 'today' ? t('accounting.period_today') : period === 'week' ? t('accounting.period_week') : t('accounting.period_month')})</p>
                    <p className="text-6xl font-black">{formatCurrency(currentStats.totalRevenue, stats.currency)}</p>
                </div>
                <div className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl p-8 shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col justify-center items-center">
                    <p className="text-sm font-bold tracking-widest uppercase text-zinc-500 mb-2">{t('accounting.completed_services')} ({period === 'all' ? t('accounting.period_all') : period === 'today' ? t('accounting.period_today') : period === 'week' ? t('accounting.period_week') : t('accounting.period_month')})</p>
                    <p className="text-6xl font-black">{currentStats.totalCuts}</p>
                </div>
            </div>

            {/* Per Barber Breakdown */}
            <h2 className="text-2xl font-bold tracking-tight mt-8 border-b border-zinc-200 dark:border-zinc-800 pb-4">{t('accounting.revenue_breakdown')}</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentStats.barbers.map((barber, idx) => {
                    const barberGoal = goals.find(g => g.barberId === barber.id)
                    const target = barberGoal ? barberGoal.targetAmount : 0
                    const progress = target > 0 ? Math.min((barber.revenue / target) * 100, 100) : 0
                    
                    return (
                        <div key={idx} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm relative overflow-hidden group flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-lg">{barber.name}</h3>
                                <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs px-2.5 py-1 rounded-full font-semibold">
                                    {barber.cuts} {t('accounting.cuts')}
                                </span>
                            </div>
                            <p className="text-sm text-zinc-500 mb-1">{t('accounting.generated_revenue')}</p>
                            <p className="text-3xl font-extrabold text-green-600 dark:text-green-500">{formatCurrency(barber.revenue, stats.currency)}</p>
                            
                            {/* Monthly Goal Section */}
                            <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex-1 flex flex-col justify-end">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Meta Mensual</h4>
                                
                                {editingGoalBarber === barber.id ? (
                                    <div className="flex gap-2">
                                        <input 
                                            type="number" 
                                            value={goalInput}
                                            onChange={e => setGoalInput(e.target.value)}
                                            placeholder="$$$"
                                            className="w-full bg-zinc-100 dark:bg-zinc-950 border-transparent rounded-lg px-3 py-1.5 text-sm focus:ring-0 focus:border-yellow-600 font-bold"
                                            autoFocus
                                        />
                                        <button 
                                            onClick={() => handleSetGoal(barber.id)} 
                                            className="bg-black text-white dark:bg-white dark:text-black px-3 py-1.5 rounded-lg text-xs font-bold shrink-0"
                                        >
                                            OK
                                        </button>
                                        <button 
                                            onClick={() => setEditingGoalBarber(null)} 
                                            className="bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0"
                                        >
                                            X
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {target > 0 ? (
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-bold">
                                                    <span className="text-zinc-500">{formatCurrency(barber.revenue, stats.currency)}</span> / 
                                                    <span className="text-zinc-900 dark:text-white">Meta: {formatCurrency(target, stats.currency)}</span>
                                                </div>
                                                <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                                                    <div 
                                                        className={`h-2.5 rounded-full transition-all duration-1000 ${progress >= 100 ? 'bg-green-500' : 'bg-yellow-600'}`} 
                                                        style={{ width: `${progress}%` }}
                                                    ></div>
                                                </div>
                                                <div className="flex justify-between items-center mt-2">
                                                    <span className={`text-[10px] font-bold ${progress >= 100 ? 'text-green-600 dark:text-green-500' : 'text-zinc-400'}`}>
                                                        {progress >= 100 ? '¡Meta Lograda!' : `${progress.toFixed(1)}%`}
                                                    </span>
                                                    <button onClick={() => { setEditingGoalBarber(barber.id); setGoalInput(String(target)); }} className="text-[10px] font-bold text-yellow-600 hover:underline">
                                                        Editar Meta
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => { setEditingGoalBarber(barber.id); setGoalInput(''); }}
                                                className="w-full text-center py-2 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-500 hover:text-black dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                                            >
                                                + Definir Meta Mensual
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                            
                            <div className="absolute -bottom-4 -right-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                                <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                            </div>
                        </div>
                    )
                })}

                {currentStats.barbers.every(b => b.cuts === 0) && (
                    <div className="col-span-full py-12 text-center text-zinc-500 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                        <p>{t('accounting.no_appointments')}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
