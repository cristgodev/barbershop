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

type RewardData = {
    id: string;
    name: string;
    pointsCost: number;
    description: string | null;
};

export default function ClientDashboardClient({
    userName,
    upcomingAppointments,
    pastAppointments,
    loyaltyPoints = 0,
    shopSlug = "",
    shopName = "",
    rewards = []
}: {
    userName: string;
    upcomingAppointments: AppointmentData[];
    pastAppointments: AppointmentData[];
    loyaltyPoints: number;
    shopSlug?: string;
    shopName?: string;
    rewards: RewardData[];
}) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

    const displayedAppointments = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments;

    // Standard fallback rewards if none exist yet for the shop
    const fallbackRewards = [
        { id: 'f-1', name: 'Bebida Premium o Descuento de $5', pointsCost: 100, description: 'Refresco importado, cerveza artesanal o descuento directo.' },
        { id: 'f-2', name: 'Cera para el Cabello Gratis', pointsCost: 250, description: 'Cera de fijación fuerte o mate de nuestra línea retail.' },
        { id: 'f-3', name: 'Corte & Barba VIP 100% Gratis', pointsCost: 500, description: 'Servicio completo VIP con afeitado a navaja y toalla caliente.' }
    ]

    const displayRewards = rewards.length > 0 ? rewards : fallbackRewards

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
            {/* Minimal Header */}
            <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/client/dashboard" className="font-extrabold text-xl tracking-tight hover:opacity-70 transition-opacity uppercase font-serif" style={{ fontFamily: 'var(--font-cormorant), serif' }} suppressHydrationWarning>
                            {shopName || "BARBERSHOP"}
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
                {/* Loyalty Balance Card */}
                <div className="mb-10 p-6 sm:p-8 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black dark:from-zinc-900 dark:via-zinc-950 dark:to-black border border-zinc-850 rounded-3xl relative overflow-hidden shadow-lg text-white">
                    {/* Glowing background effects */}
                    <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-yellow-500/10 blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-yellow-600/5 blur-3xl pointer-events-none"></div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                        <div className="space-y-2">
                            <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                                Club de Lealtad VIP
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight pt-1">
                                ¡Hola, {userName.split(' ')[0]}!
                            </h2>
                            <p className="text-sm text-zinc-400 max-w-md">
                                Acumula puntos con cada cita completada y compras en el POS. ¡Canjéalos por excelentes premios en tu próxima visita!
                            </p>
                        </div>
                        <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl shrink-0 backdrop-blur-md">
                            <div className="w-12 h-12 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center font-bold">
                                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider">Tu Balance Activo</span>
                                <span className="text-3xl font-black text-yellow-500 font-serif leading-none">{loyaltyPoints} Pts</span>
                            </div>
                        </div>
                    </div>

                    {/* Unlocked Rewards List */}
                    <div className="mt-8 pt-8 border-t border-white/5">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Premios y Recompensas Disponibles</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {displayRewards.map(reward => {
                                const isUnlocked = loyaltyPoints >= reward.pointsCost;
                                const percent = Math.min((loyaltyPoints / reward.pointsCost) * 100, 100);
                                
                                return (
                                    <div 
                                        key={reward.id} 
                                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between h-36 ${isUnlocked ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-white/5 bg-white/[0.02] opacity-60'}`}
                                    >
                                        <div>
                                            <div className="flex justify-between items-start gap-2 mb-1.5">
                                                <h4 className="font-bold text-xs text-zinc-200 line-clamp-1">{reward.name}</h4>
                                                {isUnlocked && (
                                                    <span className="text-[8px] font-extrabold text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded shrink-0 uppercase tracking-widest border border-green-500/20">
                                                        Listo
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed mb-3">
                                                {reward.description || 'Canjeable directamente en tu próxima compra o cita.'}
                                            </p>
                                        </div>
                                        <div className="space-y-1.5 mt-auto">
                                            <div className="flex justify-between text-[9px] font-bold">
                                                <span className="text-zinc-500">{reward.pointsCost} pts</span>
                                                {!isUnlocked && (
                                                    <span className="text-yellow-600">{loyaltyPoints} / {reward.pointsCost} pts</span>
                                                )}
                                            </div>
                                            <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-1000 ${isUnlocked ? 'bg-yellow-500' : 'bg-zinc-600'}`} 
                                                    style={{ width: `${percent}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Appointments Heading */}
                <div className="mb-6">
                    <h2 className="text-2xl font-black tracking-tight">{t('client_dashboard.my_appointments')}</h2>
                    <p className="text-zinc-500 text-sm">{t('client_dashboard.subtitle')}</p>
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
                                    href={shopSlug ? `/${shopSlug}` : "/"}
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
                            );
                        })
                    )}
                </div>
            </main>
        </div>
    );
}
