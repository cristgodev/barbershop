'use client';

import { useTranslation } from "../../../contexts/LanguageContext";
import BookingForm from "../../../book/[shopId]/BookingForm";

export default function BarberClient({
    shop,
    barber,
    slug,
    schedules,
    timeOffs,
    shopTimeOffs,
    appointments,
    customerId
}: {
    shop: any, barber: any, slug: string, schedules: any[], timeOffs: any[], shopTimeOffs: any[], appointments: any[], customerId: string | null
}) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col pb-12 w-full min-h-screen relative text-zinc-900 dark:text-zinc-100 px-4 pt-8">
            {/* Ambient Dark Mode Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black pointer-events-none -z-10 hidden dark:block"></div>
            
            <div className="w-full max-w-4xl mx-auto space-y-16 relative z-10">
                <a href={`/${slug}`} className="text-sm font-bold text-yellow-600 dark:text-yellow-500 hover:text-yellow-500 inline-flex items-center gap-2 transition-all hover:-translate-x-1">&larr; Volver a {shop.name}</a>

                {/* Barber Profile Header */}
                <section className="rounded-[2.5rem] p-8 md:p-12 flex flex-col items-center text-center gap-6 relative bg-white/40 dark:bg-white/5 dark:backdrop-blur-xl border border-zinc-200/50 dark:border-white/10 shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/10 blur-[100px] pointer-events-none rounded-full"></div>
                    <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-zinc-100 dark:bg-zinc-900/50 flex items-center justify-center font-serif text-5xl md:text-6xl overflow-hidden shrink-0 border-4 border-white/80 dark:border-white/10 relative z-10 shadow-xl">
                    {barber.avatarUrl ? (
                        <img src={barber.avatarUrl} alt={barber.name || 'Barber'} className="w-full h-full object-cover filter grayscale-[10%]" />
                    ) : (
                        <span className="text-zinc-400 dark:text-zinc-600" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{barber.name?.charAt(0) || 'B'}</span>
                    )}
                </div>
                <div className="space-y-3 z-10 text-zinc-900 dark:text-white">
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight font-serif" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                        {barber.name}
                    </h1>
                    <p className="text-sm font-bold text-yellow-600 dark:text-yellow-500 uppercase tracking-[0.2em] relative">
                        {barber.role === 'OWNER' ? 'BARBER (OWNER)' : barber.role}
                    </p>
                    
                    {barber.bio ? (
                        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto pt-6 text-lg leading-relaxed font-medium relative">
                            "{barber.bio}"
                        </p>
                    ) : (
                        <p className="text-zinc-500 max-w-xl mx-auto pt-6 font-medium relative italic font-serif text-lg">
                            Reserva tu experiencia de grooming premium con {barber.name} en {shop.name}. Selecciona un servicio y fecha a continuación.
                        </p>
                    )}

                    {/* Social Media & Contact Links */}
                    <div className="flex flex-wrap items-center justify-center gap-4 pt-8 z-10 w-full relative">
                        {barber.phone && (
                            <a 
                                href={`https://wa.me/${barber.phone.replace(/\D/g, '')}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-[#25D366]/40 hover:-translate-y-1 transition-all duration-300"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.662-2.062-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                                </svg>
                                WhatsApp
                            </a>
                        )}
                        {barber.instagramUrl && (
                            <a 
                                href={barber.instagramUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-pink-500/30 hover:-translate-y-1 transition-all duration-300"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                                Instagram
                            </a>
                        )}
                        {barber.tiktokUrl && (
                            <a 
                                href={barber.tiktokUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-black/50 dark:border dark:border-zinc-800 hover:-translate-y-1 transition-all duration-300"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
                                TikTok
                            </a>
                        )}
                    </div>
                </div>
            </section>

            {/* Profile Gallery (if any) */}
            {barber.portfolioUrls && (
                <section className="space-y-8">
                    <h3 className="text-4xl font-bold tracking-tight px-2 font-serif text-zinc-900 dark:text-white text-center" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Portafolio</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                        {barber.portfolioUrls.split(',').map((url: string, i: number) => {
                            const trimmedUrl = url.trim()
                            if (!trimmedUrl) return null
                            return (
                                <div key={trimmedUrl + i} className="aspect-square bg-zinc-100/50 dark:bg-white/5 dark:backdrop-blur-sm rounded-[2rem] overflow-hidden border border-zinc-200/50 dark:border-white/10 relative group shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:dark:shadow-[0_8px_32px_rgba(217,119,6,0.2)] transition-all duration-500">
                                     <div className="absolute inset-0 bg-black/10 dark:bg-black/40 group-hover:bg-transparent transition-colors z-10"></div>
                                    <img src={trimmedUrl} alt="Portfolio Work" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                                </div>
                            )
                        })}
                    </div>
                </section>
            )}

            {/* Smart Booking Form Section */}
            <section className="space-y-8">
                <div className="bg-white/80 dark:bg-white/5 dark:backdrop-blur-xl border border-zinc-200/60 dark:border-white/10 rounded-[2.5rem] p-6 sm:p-10 w-full relative overflow-hidden shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                    <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-600/50 to-transparent"></div>
                    <BookingForm 
                        shopId={shop.id}
                        services={shop.services}
                        staff={[barber]}
                        schedules={schedules}
                        timeOffs={timeOffs}
                        shopTimeOffs={shopTimeOffs}
                        appointments={appointments}
                        customerId={customerId}
                        returnUrl={`/${slug}/barber/${barber.id}`}
                    />
                </div>
            </section>

            </div>
        </div>
    )
}
