'use client'

import { useState } from 'react';
import Link from 'next/link';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { useTranslation } from '../../contexts/LanguageContext';

type AppointmentData = {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    barber: {
        name: string | null;
        avatarUrl: string | null;
    };
    service: {
        name: string;
        price: number;
        durationMins: number;
    };
    barbershop: {
        name: string;
        slug: string | null;
        phone: string | null;
        address: string | null;
    };
};

export default function ClientDashboardClient({
    userName,
    upcomingAppointments,
    pastAppointments
}: {
    userName: string;
    upcomingAppointments: AppointmentData[];
    pastAppointments: AppointmentData[];
}) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

    const displayedAppointments = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
            {/* Minimal Header */}
            <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="font-extrabold text-xl tracking-tight hover:opacity-70 transition-opacity">
                            BARBERSHOP
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <LanguageSwitcher />
                        <div className="text-sm font-medium hidden sm:block">
                            {t('client_dashboard.welcome')} {userName.split(' ')[0]}
                        </div>
                        <Link href="/api/auth/signout" className="text-sm font-semibold text-zinc-500 hover:text-black dark:hover:text-white transition-colors">
                            {t('client_dashboard.sign_out')}
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
                <div className="mb-10">
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">{t('client_dashboard.my_appointments')}</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-lg">{t('client_dashboard.subtitle')}</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-zinc-200 dark:border-zinc-800 mb-8">
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={`pb-4 text-sm sm:text-base font-bold transition-colors relative ${activeTab === 'upcoming' ? 'text-black dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                    >
                        {t('client_dashboard.upcoming')} 
                        <span className="ml-2 inline-flex items-center justify-center bg-black text-white dark:bg-white dark:text-black rounded-full text-[10px] w-5 h-5">{upcomingAppointments.length}</span>
                        {activeTab === 'upcoming' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black dark:bg-white" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('past')}
                        className={`pb-4 text-sm sm:text-base font-bold transition-colors relative ${activeTab === 'past' ? 'text-black dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                    >
                        {t('client_dashboard.history')}
                        {activeTab === 'past' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black dark:bg-white" />
                        )}
                    </button>
                </div>

                {/* Appointments List */}
                <div className="space-y-6">
                    {displayedAppointments.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl">
                            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2">
                                {activeTab === 'upcoming' ? t('client_dashboard.no_upcoming') : t('client_dashboard.no_history')}
                            </h3>
                            <p className="text-zinc-500 mb-6 max-w-sm mx-auto">
                                {activeTab === 'upcoming' 
                                    ? t('client_dashboard.no_upcoming_desc')
                                    : t('client_dashboard.no_past_desc')}
                            </p>
                            {activeTab === 'upcoming' && (
                                <Link 
                                    href="/"
                                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                                >
                                    {t('client_dashboard.find_shop')}
                                </Link>
                            )}
                        </div>
                    ) : (
                        displayedAppointments.map((apt) => {
                            const dateObj = new Date(apt.startTime);
                            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                            const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });
                            const dayNum = dateObj.getDate();
                            const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                            
                            const isPast = activeTab === 'past';
                            
                            // WhatsApp Link for Upcoming
                            const ticketUrl = `http://localhost:3000/book/success/${apt.id}`;
                            const msg = `Hi ${apt.barbershop.name}, I have an appointment on ${dayName}, ${monthName} ${dayNum} at ${timeStr} for ${apt.service.name}. Here is my ticket: ${ticketUrl}`;
                            const encodedMsg = encodeURIComponent(msg);
                            const phoneStr = apt.barbershop.phone?.replace(/\D/g, '') || '';
                            const waUrl = phoneStr ? `https://wa.me/${phoneStr}?text=${encodedMsg}` : '';

                            return (
                                <div 
                                    key={apt.id} 
                                    className={`
                                        flex flex-col sm:flex-row gap-6 p-6 sm:p-8 rounded-3xl border bg-white dark:bg-zinc-900 transition-all shadow-sm hover:shadow-md
                                        ${apt.status === 'CANCELLED' ? 'border-red-200 dark:border-red-900/50 opacity-75' : 'border-zinc-200 dark:border-zinc-800'}
                                    `}
                                >
                                    {/* Date Block */}
                                    <div className="flex sm:flex-col items-center sm:items-start gap-4 sm:gap-1 sm:min-w-[120px]">
                                        <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 min-w-[80px]">
                                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{monthName}</span>
                                            <span className="text-3xl font-black leading-none my-1">{dayNum}</span>
                                            <span className="text-xs font-medium text-zinc-500 uppercase">{dayName}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-lg sm:text-xl font-bold whitespace-nowrap">{timeStr}</span>
                                            <span className="text-sm font-medium text-zinc-500 whitespace-nowrap">{apt.service.durationMins} {t('client_dashboard.min')}</span>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="hidden sm:block w-px bg-zinc-200 dark:bg-zinc-800 self-stretch my-2" />
                                    
                                    {/* Details Block */}
                                    <div className="flex-1 flex flex-col justify-center">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-xl sm:text-2xl font-bold mb-1">{apt.service.name}</h3>
                                                <p className="font-medium text-zinc-500">{apt.barbershop.name}</p>
                                                <p className="text-sm text-zinc-400 mt-0.5">{apt.barbershop.address || t('client_dashboard.address_not_provided')}</p>
                                            </div>
                                            <div className="text-xl sm:text-2xl font-black">${apt.service.price}</div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {apt.barber.avatarUrl ? (
                                                <img src={apt.barber.avatarUrl} alt="Barber" className="w-8 h-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-800" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold border border-zinc-200 dark:border-zinc-800">
                                                    {(apt.barber.name || 'B').charAt(0)}
                                                </div>
                                            )}
                                            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('client_dashboard.with_barber')} {apt.barber.name}</span>
                                        </div>
                                    </div>

                                    {/* Action Block */}
                                    <div className="flex flex-col sm:items-end justify-between pt-4 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800 sm:min-w-[140px]">
                                        {/* Status Badge */}
                                        <div className="self-start sm:self-end mb-4 sm:mb-0">
                                            {apt.status === 'CANCELLED' ? (
                                                <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-bold uppercase tracking-wider">{t('client_dashboard.status_cancelled')}</span>
                                            ) : isPast ? (
                                                <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full text-xs font-bold uppercase tracking-wider">{t('client_dashboard.status_completed')}</span>
                                            ) : (
                                                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider">{t('client_dashboard.status_confirmed')}</span>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        {!isPast && apt.status !== 'CANCELLED' && (
                                            <div className="flex gap-2 w-full sm:w-auto">
                                                {waUrl && (
                                                    <a
                                                        href={waUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer" 
                                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm transition-colors shadow-sm"
                                                    >
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                                        </svg>
                                                        {t('client_dashboard.contact')}
                                                    </a>
                                                )}
                                                <Link
                                                    href={`/book/success/${apt.id}`}
                                                    className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-black dark:text-white rounded-xl font-bold text-sm transition-colors border border-zinc-200 dark:border-zinc-700 shadow-sm"
                                                >
                                                    {t('client_dashboard.view_ticket')}
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </main>
        </div>
    );
}
