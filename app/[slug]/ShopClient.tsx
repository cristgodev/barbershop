'use client';

import { CalendarIcon, MapPinIcon, ClockIcon, StarIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { formatCurrency } from '../lib/currency'
import { useTranslation } from "../contexts/LanguageContext";

export default function ShopClient({ shop, slug }: { shop: any, slug: string }) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-24 pb-20 w-full min-h-screen">
            {/* Dark Mode Reset Container */}
            <div className="w-full max-w-6xl mx-auto px-4 mt-8 space-y-24">
                
                {/* Hero Section */}
                <section className="bg-transparent rounded-3xl py-16 flex flex-col items-center justify-center text-center gap-8 relative">
                    <div className="z-10 max-w-3xl flex flex-col items-center pt-8 pb-4">
                        <div className="px-4 py-1.5 rounded-full bg-yellow-600/10 text-yellow-600 dark:text-yellow-500 text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase mb-6">
                            {t('landing.experience_excellence')}
                        </div>
                        <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] font-serif text-zinc-900 dark:text-white mb-6" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                            <span className="block mb-2">{t('landing.grooming')}</span>
                            <span className="italic block font-light text-yellow-600 dark:text-yellow-500">{t('landing.profesional')}</span>
                        </h2>
                        <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mb-10 font-medium">
                            {t('landing.welcome')} <span className="font-semibold text-yellow-600 dark:text-yellow-500">{shop.name}</span>. {shop.description || t('landing.default_desc')}
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-5">
                            <a href="#staff" className="bg-yellow-600 hover:bg-yellow-500 text-zinc-950 px-10 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(234,179,8,0.25)] hover:shadow-[0_0_25px_rgba(234,179,8,0.4)] w-full sm:w-auto text-center">
                                {t('landing.book_appointment')}
                            </a>
                            <a href="#services" className="bg-zinc-100/50 hover:bg-zinc-200/50 dark:bg-zinc-900/50 dark:hover:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white px-10 py-4 rounded-full font-semibold text-lg transition-colors w-full sm:w-auto text-center">
                                {t('landing.view_services')}
                            </a>
                        </div>
                    </div>
                </section>

            {/* Shop Gallery (if any) */}
            {shop.galleryUrls && (
                <section className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {shop.galleryUrls.split(',').map((url: string, i: number) => {
                            const trimmedUrl = url.trim()
                            if (!trimmedUrl) return null
                            return (
                                <div key={trimmedUrl + i} className="aspect-[16/9] bg-zinc-900 rounded-2xl overflow-hidden shadow-lg border border-zinc-800 relative group">
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                                    <img src={trimmedUrl} alt="Shop Gallery" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                                </div>
                            )
                        })}
                    </div>
                </section>
            )}

            {/* Services Section */}
            <section id="services" className="space-y-12 scroll-mt-24 pt-8">
                <div className="flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto">
                    <h3 className="text-4xl md:text-5xl font-bold font-serif text-zinc-900 dark:text-white" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{t('landing.unforgettable_services')}</h3>
                    <p className="text-zinc-600 dark:text-zinc-400 text-lg">
                        {t('landing.services_subtitle')}
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
                    {shop.services && shop.services.length > 0 ? (
                        [...shop.services].sort((a: any, b: any) => a.price - b.price).map((service: any) => (
                            <div key={service.id} className="bg-zinc-100/50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 p-8 rounded-3xl flex flex-col hover:border-yellow-600 hover:bg-white dark:hover:bg-zinc-900 transition-all duration-300 group shadow-sm hover:shadow-md relative overflow-hidden">
                                <div className="flex justify-between items-start mb-6 gap-4 relative z-10">
                                    <h4 className="text-2xl font-bold leading-tight font-serif text-zinc-900 dark:text-white" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{service.name}</h4>
                                    <span className="text-lg font-bold text-yellow-600 dark:text-yellow-500 shrink-0">
                                        {formatCurrency(service.price, shop.currency)}
                                    </span>
                                </div>
                                <p className="text-zinc-500 dark:text-zinc-400 mb-8 flex-1 leading-relaxed relative z-10 font-medium">
                                    {service.description || t('landing.default_service_desc')}
                                </p>
                                <div className="flex items-center justify-between mt-auto pt-6 border-t border-zinc-200 dark:border-zinc-800/50 relative z-10">
                                    <span className="text-sm font-medium text-zinc-500 flex items-center gap-2">
                                        <svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-70"><path d="M7.5 0.875C3.84112 0.875 0.875 3.84112 0.875 7.5C0.875 11.1589 3.84112 14.125 7.5 14.125C11.1589 14.125 14.125 11.1589 14.125 7.5C14.125 3.84112 11.1589 0.875 7.5 0.875ZM1.825 7.5C1.825 4.36538 4.36538 1.825 7.5 1.825C10.6346 1.825 13.175 4.36538 13.175 7.5C13.175 10.6346 10.6346 13.175 7.5 13.175C4.36538 13.175 1.825 10.6346 1.825 7.5ZM8 4.5C8 4.22386 7.77614 4 7.5 4C7.22386 4 7 4.22386 7 4.5V7.5C7 7.63261 7.05268 7.75979 7.14645 7.85355L9.14645 9.85355C9.34171 10.0488 9.65829 10.0488 9.85355 9.85355C10.0488 9.65829 10.0488 9.34171 9.85355 9.14645L8 7.29289V4.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                        {service.durationMins} min
                                    </span>
                                    <a href="#staff" className="text-sm font-bold text-yellow-600 dark:text-yellow-500 hover:text-yellow-500 dark:hover:text-yellow-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                                        {t('landing.book_appointment')} <span aria-hidden="true">&rarr;</span>
                                    </a>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center text-zinc-500 py-16 bg-zinc-100/50 dark:bg-zinc-900/20 rounded-3xl border border-zinc-200 dark:border-zinc-800/50">
                            <p className="font-serif italic text-xl">{t('services.no_services_yet')}</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Staff Section */}
            <section id="staff" className="space-y-12 py-16 scroll-mt-24">
                <div className="flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto pb-4">
                    <h3 className="text-4xl md:text-5xl font-bold font-serif text-zinc-900 dark:text-white" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{t('landing.staff_title')}</h3>
                    <p className="text-zinc-600 dark:text-zinc-400 text-lg">
                        {t('landing.select_expert')}
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
                    {shop.staff.filter((s: any) => s.role === 'BARBER' || s.role === 'MANAGER' || s.role === 'ADMIN' || s.role === 'OWNER').map((member: any) => (
                        <a href={`/${slug}/barber/${member.id}`} key={member.id} className="flex flex-col items-center text-center space-y-5 p-6 group cursor-pointer hover:bg-white dark:hover:bg-zinc-900/60 rounded-[2rem] transition-all border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800/80 hover:shadow-xl dark:hover:shadow-none">
                            <div className="w-32 h-32 md:w-44 md:h-44 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center font-serif text-4xl overflow-hidden shrink-0 group-hover:ring-4 group-hover:ring-yellow-600/30 transition-all shadow-sm relative">
                                <div className="absolute inset-0 bg-black/5 dark:bg-black/10 group-hover:bg-transparent transition-colors z-10"></div>
                                {member.avatarUrl ? (
                                    <img src={member.avatarUrl} alt={member.name || 'Barber'} className="w-full h-full object-cover filter grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" />
                                ) : (
                                    <span className="text-zinc-400 dark:text-zinc-600" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{member.name?.charAt(0) || 'B'}</span>
                                )}
                            </div>
                            <div className="space-y-1.5 z-10">
                                <h4 className="font-bold text-2xl font-serif text-zinc-900 dark:text-white" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{member.name}</h4>
                                <p className="text-xs font-bold text-yellow-600 uppercase tracking-[0.15em]">{member.role === 'OWNER' ? 'BARBER / OWNER' : member.role}</p>
                            </div>
                            <div className="mt-2 text-sm font-bold text-yellow-600 dark:text-yellow-500 flex items-center gap-1 group-hover:gap-2 transition-all opacity-0 group-hover:opacity-100">
                                {t('landing.select')} <span aria-hidden="true">&rarr;</span>
                            </div>
                        </a>
                    ))}
                </div>
            </section>
            </div>

            {/* Floating WhatsApp Contact Button */}
            <a 
                href={`https://wa.me/${shop.staff.find((s: any) => s.role === 'OWNER')?.phone?.replace(/\D/g, '') || ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:scale-110 hover:shadow-[0_4px_25px_rgba(37,211,102,0.6)] transition-all flex items-center justify-center"
                aria-label="Contact via WhatsApp"
            >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.662-2.062-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
            </a>

        </div>
    )
}
