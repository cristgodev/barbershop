'use client';

import { formatCurrency } from '../lib/currency'
import { useTranslation } from "../contexts/LanguageContext";
import Link from 'next/link';
import TopNavLinks from '../components/TopNavLinks';

export default function ShopClient({ shop, slug, isLoggedIn }: { shop: any, slug: string, isLoggedIn: boolean }) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-24 pb-20 w-full min-h-screen relative text-zinc-900 dark:text-zinc-100">
            {/* Ambient Dark Mode Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black pointer-events-none -z-10 hidden dark:block"></div>
            
            {/* Dedicated Shop Navigation Bar */}
            <header className="w-full sticky top-0 left-0 right-0 z-[100] bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 p-4 sm:px-8 sm:py-5 flex items-center justify-between shadow-sm">
                <a href={`/${slug}`} className="text-2xl md:text-3xl font-black tracking-tight font-serif text-zinc-900 dark:text-white" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                   {shop.name}
                </a>
                
                <TopNavLinks />

                <div className="flex items-center gap-4">
                    {/* The access button drops its shadow to look integrated but flat-premium feeling */}
                    {isLoggedIn ? (
                        <Link href="/client/dashboard" className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm tracking-wide hover:scale-105 transition-all outline outline-2 outline-yellow-600/30 shadow-[0_4px_15px_rgba(234,179,8,0.2)]">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            <span className="hidden sm:inline">Mis Reservas</span>
                        </Link>
                    ) : (
                        <Link href={`/client/login?returnUrl=/${slug}`} className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm tracking-wide hover:scale-105 transition-all outline outline-2 outline-yellow-600/30 shadow-[0_4px_15px_rgba(234,179,8,0.2)]">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
                            <span className="hidden sm:inline">Iniciar Sesión</span>
                            <span className="inline sm:hidden">Entrar</span>
                        </Link>
                    )}
                </div>
            </header>

            {/* Layout Container */}
            <div className="w-full max-w-6xl mx-auto px-4 mt-8 space-y-24 relative z-10">
                
                {/* Hero Section */}
                <section 
                    className={`rounded-[2rem] py-24 px-4 flex flex-col items-center justify-center text-center gap-8 relative overflow-hidden shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] ${shop.heroImageUrl ? '' : 'bg-zinc-100/50 dark:bg-white/5 dark:backdrop-blur-xl border border-transparent dark:border-white/10'}`}
                    style={shop.heroImageUrl ? { backgroundImage: `url(${shop.heroImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                >
                    {shop.heroImageUrl && <div className="absolute inset-0 bg-black/60 z-0"></div>}
                    <div className="z-10 max-w-3xl flex flex-col items-center pt-8 pb-4 relative">
                        <div className={`px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase mb-6 ${shop.heroImageUrl ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-600/10 text-yellow-600 dark:text-yellow-500'}`}>
                            {t('landing.experience_excellence')}
                        </div>
                        <h2 className={`text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] font-serif mb-6 ${shop.heroImageUrl ? 'text-white' : 'text-zinc-900 dark:text-white'}`} style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                            <span className="block mb-2">{t('landing.grooming')}</span>
                            <span className={`italic block font-light ${shop.heroImageUrl ? 'text-yellow-400' : 'text-yellow-600 dark:text-yellow-500'}`}>{t('landing.profesional')}</span>
                        </h2>
                        <p className={`text-lg md:text-xl leading-relaxed max-w-2xl mb-10 font-medium ${shop.heroImageUrl ? 'text-zinc-300' : 'text-zinc-600 dark:text-zinc-400'}`}>
                            {t('landing.welcome')} <span className={`font-semibold ${shop.heroImageUrl ? 'text-yellow-400' : 'text-yellow-600 dark:text-yellow-500'}`}>{shop.name}</span>. {shop.description || t('landing.default_desc')}
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
                <section className="space-y-10 pt-8">
                    <div className="flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto">
                        <h3 className="text-4xl md:text-5xl font-bold font-serif text-zinc-900 dark:text-white" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Nuestra Galería</h3>
                        <p className="text-zinc-600 dark:text-zinc-400 text-lg">
                            Un vistazo a nuestras instalaciones y el alto nivel de nuestros barberos.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {shop.galleryUrls.split(',').map((url: string, i: number) => {
                            const trimmedUrl = url.trim()
                            if (!trimmedUrl) return null
                            return (
                                <div key={trimmedUrl + i} className="aspect-[16/9] bg-zinc-900 rounded-2xl overflow-hidden shadow-lg border border-zinc-200 dark:border-white/10 relative group dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:dark:shadow-[0_8px_32px_rgba(217,119,6,0.2)] transition-all duration-500">
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
                            <div key={service.id} className="bg-zinc-100/50 dark:bg-white/5 dark:backdrop-blur-xl border border-zinc-200/60 dark:border-white/10 p-8 rounded-[2rem] flex flex-col hover:border-yellow-600/50 dark:hover:border-white/20 hover:bg-white dark:hover:bg-white/10 transition-all duration-500 group shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-xl dark:hover:shadow-[0_8px_32px_rgba(217,119,6,0.15)] hover:-translate-y-1 relative overflow-hidden cursor-pointer">
                                <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/0 via-transparent to-yellow-600/0 group-hover:from-yellow-600/5 group-hover:to-amber-500/10 transition-colors duration-500"></div>
                                <div className="flex justify-between items-start mb-6 gap-4 relative z-10">
                                    <h4 className="text-2xl font-bold leading-tight font-serif text-zinc-900 dark:text-white" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{service.name}</h4>
                                    <span className="text-lg font-bold text-yellow-600 dark:text-yellow-500 shrink-0">
                                        {formatCurrency(service.price, shop.currency)}
                                    </span>
                                </div>
                                <p className="text-zinc-500 dark:text-zinc-400 mb-8 flex-1 leading-relaxed relative z-10 font-medium">
                                    {service.description || t('landing.default_service_desc')}
                                </p>
                                <div className="flex items-center justify-between mt-auto pt-6 border-t border-zinc-200 dark:border-white/10 relative z-10">
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

            {/* Products Section */}
            {shop.products && shop.products.length > 0 && (
                <section id="products" className="space-y-12 scroll-mt-24 pt-8">
                    <div className="flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto">
                        <h3 className="text-4xl md:text-5xl font-bold font-serif text-zinc-900 dark:text-white" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Nuestros Productos</h3>
                        <p className="text-zinc-600 dark:text-zinc-400 text-lg">
                            Lleva el estilo a casa con nuestros productos de alta calidad.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
                        {[...shop.products].map((product: any) => (
                            <div key={product.id} className="bg-zinc-100/50 dark:bg-white/5 dark:backdrop-blur-xl border border-zinc-200/60 dark:border-white/10 p-6 rounded-[2rem] flex flex-col hover:border-yellow-600/50 dark:hover:border-white/20 hover:bg-white dark:hover:bg-white/10 transition-all duration-500 group shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-xl dark:hover:shadow-[0_8px_32px_rgba(217,119,6,0.15)] hover:-translate-y-1 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/0 via-transparent to-yellow-600/0 group-hover:from-yellow-600/5 group-hover:to-amber-500/10 transition-colors duration-500"></div>
                                
                                <div className="aspect-square bg-zinc-200 dark:bg-zinc-900 rounded-2xl mb-6 relative overflow-hidden border border-transparent dark:border-white/5 group-hover:border-yellow-600/30 transition-colors">
                                    {product.imageUrl ? (
                                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-400 dark:text-zinc-600">
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                                        </div>
                                    )}
                                    {product.stock > 0 ? (
                                        <div className="absolute top-3 right-3 bg-green-500/90 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-md">
                                            En Stock
                                        </div>
                                    ) : (
                                        <div className="absolute top-3 right-3 bg-red-500/90 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-md">
                                            Agotado
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 flex flex-col relative z-10">
                                    <div className="flex justify-between items-start gap-3 mb-3">
                                        <h4 className="text-xl font-bold leading-tight font-serif text-zinc-900 dark:text-white" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{product.name}</h4>
                                    </div>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 flex-1 font-medium line-clamp-3">
                                        {product.description || "Un producto excelente para el cuidado de tu estilo personal."}
                                    </p>
                                    <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-white/10">
                                        <span className="text-xl font-bold text-yellow-600 dark:text-yellow-500">
                                            {formatCurrency(product.price, shop.currency)}
                                        </span>
                                        <a href={`https://wa.me/${shop.phone?.replace(/\D/g, '') || ''}?text=Hola, estoy interesado en comprar el producto: ${encodeURIComponent(product.name)}`} target="_blank" rel="noopener noreferrer" className="text-sm font-bold bg-zinc-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-full hover:bg-yellow-600 dark:hover:bg-yellow-500 hover:text-white transition-colors">
                                            Comprar
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

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
                        <a href={`/${slug}/barber/${member.id}`} key={member.id} className="flex flex-col items-center text-center space-y-5 p-6 group cursor-pointer hover:bg-white dark:hover:bg-white/5 dark:hover:backdrop-blur-xl rounded-[2.5rem] transition-all duration-500 border border-transparent hover:border-zinc-200/60 dark:hover:border-white/10 shadow-none hover:shadow-xl dark:hover:shadow-[0_8px_32px_rgba(217,119,6,0.1)] hover:-translate-y-2 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-yellow-600/0 group-hover:to-amber-500/10 transition-colors duration-500 rounded-[2.5rem]"></div>
                            <div className="w-32 h-32 md:w-44 md:h-44 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-transparent dark:border-white/5 flex items-center justify-center font-serif text-4xl overflow-hidden shrink-0 group-hover:ring-[4px] group-hover:ring-yellow-600/30 transition-all duration-500 shadow-sm relative z-10">
                                <div className="absolute inset-0 bg-black/5 dark:bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
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
                            
                            {/* Mini Social Icons for Barber */}
                            <div className="flex items-center gap-3 z-10 pt-1">
                                {member.phone && (
                                    <div className="text-zinc-400 hover:text-[#25D366] transition-colors" title="WhatsApp">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.662-2.062-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                                        </svg>
                                    </div>
                                )}
                                {member.instagramUrl && (
                                    <div className="text-zinc-400 hover:text-pink-500 transition-colors" title="Instagram">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                                    </div>
                                )}
                                {member.tiktokUrl && (
                                    <div className="text-zinc-400 hover:text-black dark:hover:text-white transition-colors" title="TikTok">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
                                    </div>
                                )}
                            </div>

                            <div className="mt-2 text-sm font-bold text-yellow-600 dark:text-yellow-500 flex items-center gap-1 group-hover:gap-2 transition-all opacity-0 group-hover:opacity-100">
                                {t('landing.select')} <span aria-hidden="true">&rarr;</span>
                            </div>
                        </a>
                    ))}
                </div>
            </section>
            {/* Contact Section */}
            <section id="contacto" className="space-y-12 py-20 scroll-mt-24 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white rounded-[3rem] px-8 md:px-16 flex flex-col items-center text-center relative overflow-hidden border border-white/5 dark:shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/10 blur-[100px] pointer-events-none rounded-full"></div>
                <div className="z-10 space-y-6 max-w-2xl mx-auto w-full">
                    <h3 className="text-4xl md:text-5xl font-bold font-serif text-white" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Mantente Conectado</h3>
                    <p className="text-zinc-400 text-lg">
                        Síguenos en nuestras redes o comunícate directamente con la tienda. También puedes contactar y ver los trabajos de cada barbero seleccionando su perfil arriba.
                    </p>
                    
                    <div className="flex flex-wrap items-center justify-center gap-6 pt-8">
                        {shop.phone && (
                            <a 
                                href={`https://wa.me/${shop.phone.replace(/\D/g, '')}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-[#25D366]/40 hover:-translate-y-1 transition-all duration-300"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.662-2.062-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                                </svg>
                                Chat Tienda
                            </a>
                        )}
                        {shop.instagramUrl && (
                            <a 
                                href={shop.instagramUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-pink-500/30 hover:-translate-y-1 transition-all duration-300"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                                Instagram
                            </a>
                        )}
                        {shop.tiktokUrl && (
                            <a 
                                href={shop.tiktokUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 bg-zinc-800 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-zinc-700 hover:-translate-y-1 transition-all duration-300"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
                                TikTok
                            </a>
                        )}
                    </div>
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
