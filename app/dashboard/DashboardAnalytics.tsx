'use client'

import { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

import Link from 'next/link'

type TimePeriod = 'today' | 'week' | 'month'

type StatsData = {
    count: number;
    revenue: number;
    pending: number;
}

type ChartDataPoint = {
    name: string;
    revenue: number;
    appointments: number;
}

type DashboardAnalyticsProps = {
    stats: {
        today: StatsData;
        week: StatsData;
        month: StatsData;
    };
    charts: {
        today: ChartDataPoint[];
        week: ChartDataPoint[];
        month: ChartDataPoint[];
    }
}

export default function DashboardAnalytics({ stats, charts }: DashboardAnalyticsProps) {
    const [period, setPeriod] = useState<TimePeriod>('week')

    const currentStats = stats[period]

    return (
        <div className="space-y-6">
            {/* KPI Controls */}
            <div className="flex bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-xl w-fit">
                {(['today', 'week', 'month'] as TimePeriod[]).map(p => (
                    <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                            period === p 
                                ? 'bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm' 
                                : 'text-zinc-500 hover:text-black dark:hover:text-white'
                        }`}
                    >
                        {p === 'today' ? 'Today' : `This ${p}`}
                    </button>
                ))}
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/dashboard/accounting" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group block">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </div>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold tracking-wide uppercase mb-2">Bookings</p>
                    <p className="text-4xl font-extrabold text-black dark:text-white animate-fade-in">{currentStats.count}</p>
                </Link>
                
                <Link href="/dashboard/accounting" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group block">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity text-green-500">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    </div>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold tracking-wide uppercase mb-2">Revenue</p>
                    <p className="text-4xl font-extrabold text-black dark:text-white animate-fade-in">${currentStats.revenue.toFixed(2)}</p>
                </Link>

                <Link href="/dashboard/accounting" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group block">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity text-amber-500">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </div>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold tracking-wide uppercase mb-2">Pending</p>
                    <p className="text-4xl font-extrabold text-black dark:text-white animate-fade-in">{currentStats.pending}</p>
                </Link>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                 <h3 className="text-lg font-bold mb-6">
                    {period === 'today' ? 'Hourly Revenue (Today)' : period === 'week' ? 'Revenue over Last 7 Days' : 'Daily Revenue (This Month)'}
                 </h3>
                 <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={charts[period]} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#52525b" opacity={0.2} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: 12}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: 12}} tickFormatter={(value) => `$${value}`} />
                            <Tooltip 
                                cursor={{fill: '#f4f4f5'}}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#18181b', color: '#fff'}}
                                itemStyle={{ color: '#fff' }}
                                formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Revenue']}
                            />
                            <Bar dataKey="revenue" fill="#000" radius={[4, 4, 0, 0]} className="dark:fill-white" />
                        </BarChart>
                    </ResponsiveContainer>
                 </div>
            </div>
        </div>
    )
}
