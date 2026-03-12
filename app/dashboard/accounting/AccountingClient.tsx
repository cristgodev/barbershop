'use client'

import { useState } from 'react'

type BarberStat = { name: string, revenue: number, cuts: number };

type PeriodStats = {
    totalRevenue: number;
    totalCuts: number;
    barbers: BarberStat[];
}

type AccountingClientProps = {
    stats: {
        today: PeriodStats;
        week: PeriodStats;
        month: PeriodStats;
        all: PeriodStats;
    }
}

type TimePeriod = 'today' | 'week' | 'month' | 'all'

export default function AccountingClient({ stats }: AccountingClientProps) {
    const [period, setPeriod] = useState<TimePeriod>('all')

    const currentStats = stats[period]

    return (
        <div className="flex flex-col gap-8 pb-12 w-full max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <a href="/dashboard" className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </a>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">Accounting Overview</h1>
                        <p className="text-zinc-500 mt-1">Displaying only COMPLETED and paid appointments.</p>
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
                            {p === 'today' ? 'Today' : p === 'all' ? 'All Time' : `This ${p}`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Global Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-black text-white dark:bg-white dark:text-black rounded-2xl p-8 shadow-lg flex flex-col justify-center items-center">
                    <p className="text-sm font-bold tracking-widest uppercase opacity-70 mb-2">Net Revenue ({period === 'all' ? 'All Time' : period})</p>
                    <p className="text-6xl font-black">${currentStats.totalRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl p-8 shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col justify-center items-center">
                    <p className="text-sm font-bold tracking-widest uppercase text-zinc-500 mb-2">Completed Services ({period === 'all' ? 'All Time' : period})</p>
                    <p className="text-6xl font-black">{currentStats.totalCuts}</p>
                </div>
            </div>

            {/* Per Barber Breakdown */}
            <h2 className="text-2xl font-bold tracking-tight mt-8 border-b border-zinc-200 dark:border-zinc-800 pb-4">Revenue Breakdown by Barber</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentStats.barbers.map((barber, idx) => (
                    <div key={idx} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-lg">{barber.name}</h3>
                            <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs px-2.5 py-1 rounded-full font-semibold">
                                {barber.cuts} cuts
                            </span>
                        </div>
                        <p className="text-sm text-zinc-500 mb-1">Generated Revenue</p>
                        <p className="text-3xl font-extrabold text-green-600 dark:text-green-500">${barber.revenue.toFixed(2)}</p>
                        
                        <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                        </div>
                    </div>
                ))}

                {currentStats.barbers.every(b => b.cuts === 0) && (
                    <div className="col-span-full py-12 text-center text-zinc-500 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                        <p>No completed appointments in this period.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
