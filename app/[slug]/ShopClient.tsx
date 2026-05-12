'use client';

import { useState } from 'react';

import { formatCurrency } from '../lib/currency'
import { useTranslation } from "../contexts/LanguageContext";
import Link from 'next/link';
import TopNavLinks from '../components/TopNavLinks';

export default function ShopClient({ shop, slug, isLoggedIn }: { shop: any, slug: string, isLoggedIn: boolean }) {
    const { t } = useTranslation();
    const [cart, setCart] = useState<{product: any, quantity: number}[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const addToCart = (product: any) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.product.id === productId) {
                const newQuantity = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

    const handleWhatsAppOrder = () => {
        if (cart.length === 0) return;
        
        let message = `Hola, me gustaría hacer un pedido:\n\n`;
        cart.forEach(item => {
            message += `- ${item.quantity}x ${item.product.name} (${formatCurrency(item.product.price * item.quantity, shop.currency)})\n`;
        });
        message += `\n*Total: ${formatCurrency(cartTotal, shop.currency)}*`;

        const whatsappUrl = `https://wa.me/${shop.phone?.replace(/\D/g, '') || ''}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        // Force dark mode styles on this container globally
        <div className="flex flex-col gap-24 pb-20 w-full min-h-screen relative bg-black text-zinc-100 selection:bg-yellow-500/30 font-sans">
            {/* Ambient Dark Mode Background (Permanent) */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black pointer-events-none z-0"></div>
            
            {/* Dedicated Shop Navigation Bar */}
            <header className="fixed top-0 left-0 right-0 z-[100] bg-black/80 backdrop-blur-xl border-b border-white/5 p-4 sm:px-8 sm:py-5 flex items-center justify-between transition-all duration-300">
                <a href={`/${slug}`} className="text-2xl md:text-3xl font-black tracking-tight font-serif text-white italic" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                   {shop.name}
                </a>
                
                <div className="hidden md:block">
                    <TopNavLinks />
                </div>

                <div className="flex items-center gap-4">
                    {isLoggedIn ? (
                        <Link href="/client/dashboard" className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-black px-5 sm:px-6 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm tracking-wide hover:scale-105 transition-all shadow-[0_4px_15px_rgba(234,179,8,0.2)]">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            <span className="hidden sm:inline">Mis Reservas</span>
                        </Link>
                    ) : (
                        <Link href={`/client/login?returnUrl=/${slug}`} className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-black px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm tracking-wide hover:scale-105 transition-all shadow-[0_4px_15px_rgba(234,179,8,0.2)]">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
                            <span className="hidden sm:inline">Iniciar Sesión</span>
                            <span className="inline sm:hidden">Entrar</span>
                        </Link>
                    )}

                    {/* Non-intrusive Header Cart Button */}
                    {cart.length > 0 && (
                        <button 
                            onClick={() => setIsCartOpen(true)}
                            className="relative flex items-center justify-center p-2 rounded-full hover:bg-white/10 transition-colors ml-1 sm:ml-2"
                            aria-label="Ver Carrito"
                        >
                            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-200">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path>
                            </svg>
                            <div className="absolute top-0 right-0 bg-yellow-600 text-black text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-black transform translate-x-1/4 -translate-y-1/4">
                                {cartItemCount}
                            </div>
                        </button>
                    )}
                </div>
            </header>

            <main className="w-full relative z-10 flex flex-col pt-20">
                {/* Hero Section */}
                <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden w-full">
                    <div className="absolute inset-0 bg-black overflow-hidden z-0">
                        {shop.heroImageUrl ? (
                            <img src={shop.heroImageUrl} alt={shop.name} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                        ) : (
                            <div className="absolute inset-0 w-full h-full bg-zinc-900"></div>
                        )}
                        <div className="absolute inset-0 bg-black/40 z-10"></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black z-10"></div>
                    </div>

                    <div className="relative z-20 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
                        <div className="space-y-6 max-w-4xl mx-auto">
                            <div className="inline-block px-4 py-1.5 border border-white/20 rounded-full bg-white/5 backdrop-blur-md mb-4 animate-in fade-in slide-in-from-top-8 duration-1000">
                                <span className="text-zinc-200 text-xs sm:text-sm tracking-[0.2em] font-medium uppercase">{t('landing.experience_excellence')}</span>
                            </div>
                            
                            <h1 className="text-5xl sm:text-6xl md:text-8xl font-serif font-bold text-white tracking-tight leading-[1.1] sm:leading-none animate-in fade-in scale-95 duration-1000 delay-200" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                                <span className="block text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-zinc-400">
                                    {t('landing.grooming')}
                                </span>
                                <span className="block text-yellow-600 italic font-light mt-1 sm:mt-2">
                                    {t('landing.profesional')}
                                </span>
                            </h1>

                            <p className="text-base sm:text-lg md:text-2xl text-zinc-300 max-w-2xl mx-auto font-light leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                                {t('landing.welcome')} <span className="font-semibold text-yellow-500">{shop.name}</span>. {shop.description || t('landing.default_desc')}
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 pt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-700 w-full max-w-xs sm:max-w-none mx-auto">
                                <a href="#staff" className="inline-flex items-center justify-center rounded-full transition-all duration-300 hover:brightness-110 active:scale-95 px-8 py-4 w-full sm:min-w-[220px] h-14 text-lg bg-yellow-600 text-black font-bold tracking-wide shadow-[0_0_30px_rgba(217,119,6,0.2)]">
                                    {t('landing.book_appointment')}
                                </a>
                                <span className="text-zinc-500 text-sm hidden sm:block">o</span>
                                <a href="#services" className="inline-flex items-center justify-center rounded-full transition-all duration-300 font-medium hover:bg-white/10 active:scale-95 px-8 py-4 w-full sm:min-w-[220px] h-14 text-lg text-white/70 hover:text-white border border-transparent hover:border-white/10">
                                    {t('landing.view_services')}
                                </a>
                            </div>
                        </div>

                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce duration-[2000ms] text-zinc-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 opacity-50"><path d="M12 5v14"></path><path d="m19 12-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </section>

                <div className="w-full max-w-[1600px] mx-auto px-4 space-y-32 py-24">
                    
                    {/* Shop Gallery */}
                    {shop.galleryUrls && (
                        <section className="space-y-12">
                            <div className="text-center mb-16 max-w-3xl mx-auto">
                                <span className="text-yellow-600 text-xs font-bold tracking-[0.3em] uppercase mb-4 block">Experiencias Reales</span>
                                <h2 className="text-4xl md:text-5xl font-serif text-white mb-6" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Nuestra Galería</h2>
                                <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">Un vistazo a nuestras instalaciones y el alto nivel de nuestros barberos.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {shop.galleryUrls.split(',').map((url: string, i: number) => {
                                    const trimmedUrl = url.trim()
                                    if (!trimmedUrl) return null
                                    return (
                                        <div key={trimmedUrl + i} className="aspect-[16/9] bg-zinc-900/40 rounded-2xl overflow-hidden shadow-2xl border border-white/5 relative group transition-all duration-500">
                                            <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors z-10"></div>
                                            <img src={trimmedUrl} alt="Shop Gallery" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                                        </div>
                                    )
                                })}
                            </div>
                        </section>
                    )}

                    {/* Services Section */}
                    <section id="services" className="space-y-12 scroll-mt-32">
                        <div className="text-center mb-16 max-w-3xl mx-auto">
                            <span className="text-yellow-600 text-xs font-bold tracking-[0.3em] uppercase mb-4 block">Servicios Exclusivos</span>
                            <h2 className="text-4xl md:text-5xl font-serif text-white mb-6" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{t('landing.unforgettable_services')}</h2>
                            <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">{t('landing.services_subtitle')}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {shop.services && shop.services.length > 0 ? (
                                [...shop.services].sort((a: any, b: any) => a.price - b.price).map((service: any) => (
                                    <div key={service.id} className="group relative bg-zinc-900/40 hover:bg-zinc-900/80 backdrop-blur-md border border-white/5 hover:border-yellow-600/30 rounded-3xl p-8 flex flex-col justify-between transition-all duration-500 shadow-xl hover:shadow-[0_0_30px_rgba(217,119,6,0.1)] overflow-hidden cursor-pointer">
                                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-600/5 rounded-full blur-3xl group-hover:bg-yellow-600/15 transition-colors duration-500"></div>
                                        <div className="relative z-10 flex flex-col h-full">
                                            <div className="flex justify-between items-start mb-6 gap-4">
                                                <h4 className="text-2xl font-bold leading-tight font-serif text-zinc-100" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{service.name}</h4>
                                                <span className="text-lg font-bold text-yellow-600 shrink-0">
                                                    {formatCurrency(service.price, shop.currency)}
                                                </span>
                                            </div>
                                            <p className="text-zinc-400 mb-8 flex-1 leading-relaxed font-light">
                                                {service.description || t('landing.default_service_desc')}
                                            </p>
                                            <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/10">
                                                <span className="text-sm font-medium text-zinc-500 flex items-center gap-2">
                                                    <svg width="16" height="16" viewBox="0 0 15 15" fill="none" className="opacity-70 text-zinc-500"><path d="M7.5 0.875C3.84112 0.875 0.875 3.84112 0.875 7.5C0.875 11.1589 3.84112 14.125 7.5 14.125C11.1589 14.125 14.125 11.1589 14.125 7.5C14.125 3.84112 11.1589 0.875 7.5 0.875ZM1.825 7.5C1.825 4.36538 4.36538 1.825 7.5 1.825C10.6346 1.825 13.175 4.36538 13.175 7.5C13.175 10.6346 10.6346 13.175 7.5 13.175C4.36538 13.175 1.825 10.6346 1.825 7.5ZM8 4.5C8 4.22386 7.77614 4 7.5 4C7.22386 4 7 4.22386 7 4.5V7.5C7 7.63261 7.05268 7.75979 7.14645 7.85355L9.14645 9.85355C9.34171 10.0488 9.65829 10.0488 9.85355 9.85355C10.0488 9.65829 10.0488 9.34171 9.85355 9.14645L8 7.29289V4.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                                    {service.durationMins} min
                                                </span>
                                                <a href="#staff" className="text-xs font-black uppercase tracking-[0.2em] text-yellow-600 hover:text-yellow-500 flex items-center gap-1 group-hover:gap-2 transition-all">
                                                    Reservar <span aria-hidden="true">&rarr;</span>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center text-zinc-500 py-16 bg-zinc-900/20 rounded-3xl border border-white/5">
                                    <p className="font-serif italic text-xl">{t('services.no_services_yet')}</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Products Section */}
                    {shop.products && shop.products.length > 0 && (
                        <section id="products" className="space-y-12 scroll-mt-32">
                            <div className="text-center mb-16 max-w-3xl mx-auto">
                                <span className="text-yellow-600 text-xs font-bold tracking-[0.3em] uppercase mb-4 block">Catálogo Premium</span>
                                <h2 className="text-4xl md:text-5xl font-serif text-white mb-6" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Nuestros Productos</h2>
                                <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">Lleva el estilo a casa con nuestros productos de alta calidad.</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[...shop.products].map((product: any) => (
                                    <div key={product.id} className="group relative bg-zinc-900/40 hover:bg-zinc-900/80 backdrop-blur-md border border-white/5 hover:border-yellow-600/30 rounded-3xl p-6 flex flex-col justify-between transition-all duration-500 shadow-xl hover:shadow-[0_0_30px_rgba(217,119,6,0.1)] overflow-hidden">
                                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-600/5 rounded-full blur-3xl group-hover:bg-yellow-600/15 transition-colors duration-500"></div>
                                        
                                        <div className="aspect-[4/5] bg-zinc-950 rounded-2xl mb-6 relative overflow-hidden border border-white/5 group-hover:border-yellow-600/20 transition-colors z-10">
                                            {product.imageUrl ? (
                                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                                                </div>
                                            )}
                                            {product.stock > 0 ? (
                                                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                                                    En Stock
                                                </div>
                                            ) : (
                                                <div className="absolute top-4 right-4 bg-red-900/60 backdrop-blur-md border border-red-500/50 text-red-200 text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                                                    Agotado
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 flex flex-col relative z-10">
                                            <h4 className="text-xl font-bold leading-tight font-serif text-white mb-2" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{product.name}</h4>
                                            <p className="text-sm text-zinc-400 mb-6 flex-1 font-light line-clamp-2">
                                                {product.description || "Producto para el cuidado personal."}
                                            </p>
                                            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                                <span className="text-xl font-bold text-yellow-600">
                                                    {formatCurrency(product.price, shop.currency)}
                                                </span>
                                                <button 
                                                    onClick={(e) => { e.preventDefault(); addToCart(product); setIsCartOpen(true); }}
                                                    className="text-[10px] font-black uppercase tracking-widest bg-white text-black px-4 py-2 rounded-full hover:bg-yellow-600 hover:text-white transition-colors"
                                                >
                                                    Agregar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Staff Section */}
                    <section id="staff" className="space-y-12 scroll-mt-32">
                        <div className="text-center mb-16 max-w-3xl mx-auto">
                            <span className="text-yellow-600 text-xs font-bold tracking-[0.3em] uppercase mb-4 block">Maestros del Estilo</span>
                            <h2 className="text-4xl md:text-5xl font-serif text-white mb-6" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{t('landing.staff_title')}</h2>
                            <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">{t('landing.select_expert')}</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {shop.staff.filter((s: any) => s.role === 'BARBER' || s.role === 'MANAGER' || s.role === 'ADMIN' || s.role === 'OWNER').map((member: any) => (
                                <a href={`/${slug}/barber/${member.id}`} key={member.id} className="group flex flex-col items-center text-center p-8 bg-zinc-900/40 hover:bg-zinc-900/80 backdrop-blur-md rounded-[2.5rem] transition-all duration-500 border border-white/5 hover:border-yellow-600/30 shadow-xl hover:shadow-[0_0_30px_rgba(217,119,6,0.1)] relative overflow-hidden">
                                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-600/5 rounded-full blur-3xl group-hover:bg-yellow-600/15 transition-colors duration-500"></div>
                                    
                                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-zinc-950 border border-white/10 flex items-center justify-center font-serif text-4xl overflow-hidden shrink-0 group-hover:ring-[2px] group-hover:ring-yellow-600/50 group-hover:ring-offset-4 group-hover:ring-offset-zinc-900 transition-all duration-500 shadow-2xl relative z-10 mb-6">
                                        <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors z-10"></div>
                                        {member.avatarUrl ? (
                                            <img src={member.avatarUrl} alt={member.name || 'Barber'} className="w-full h-full object-cover filter grayscale-[40%] group-hover:grayscale-0 transition-all duration-700 ease-out" />
                                        ) : (
                                            <span className="text-zinc-600" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{member.name?.charAt(0) || 'B'}</span>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-1.5 z-10">
                                        <h4 className="font-bold text-2xl font-serif text-zinc-100" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{member.name}</h4>
                                        <p className="text-[10px] font-black text-yellow-600 uppercase tracking-[0.2em]">{member.role === 'OWNER' ? 'BARBER / OWNER' : member.role}</p>
                                    </div>
                                    
                                    <div className="mt-6 text-xs font-black text-white flex items-center gap-2 group-hover:text-yellow-500 transition-colors z-10 uppercase tracking-[0.1em]">
                                        {t('landing.select')} <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform">&rarr;</span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </section>

                    {/* Contact Section */}
                    <section id="contacto" className="mt-12 py-24 bg-gradient-to-br from-zinc-900 via-black to-zinc-950 text-white rounded-[3rem] px-8 md:px-16 flex flex-col items-center text-center relative overflow-hidden border border-white/5 shadow-2xl">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-600/10 blur-[120px] pointer-events-none rounded-full"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 blur-[120px] pointer-events-none rounded-full"></div>
                        
                        <div className="z-10 space-y-6 max-w-2xl mx-auto w-full">
                            <span className="text-yellow-600 text-xs font-bold tracking-[0.3em] uppercase block">Conéctate</span>
                            <h3 className="text-4xl md:text-5xl font-bold font-serif text-white" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Mantente Conectado</h3>
                            <p className="text-zinc-400 text-lg font-light leading-relaxed">
                                Síguenos en nuestras redes o comunícate directamente con la barbería para asegurar el mejor servicio para tu estilo.
                            </p>
                            
                            <div className="flex flex-wrap items-center justify-center gap-6 pt-10">
                                {shop.phone && (
                                    <a 
                                        href={`https://wa.me/${shop.phone.replace(/\D/g, '')}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:-translate-y-1 transition-all duration-300"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.662-2.062-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                                        </svg>
                                        WhatsApp
                                    </a>
                                )}
                                {shop.instagramUrl && (
                                    <a 
                                        href={shop.instagramUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 bg-zinc-900 border border-white/10 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:border-pink-500/50 hover:bg-zinc-800 hover:-translate-y-1 transition-all duration-300"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                                        Instagram
                                    </a>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {/* Floating WhatsApp Contact Button */}
            <a 
                href={`https://wa.me/${shop.staff.find((s: any) => s.role === 'OWNER')?.phone?.replace(/\D/g, '') || ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 z-[110] group"
                aria-label="Contact via WhatsApp"
            >
                <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-75 group-hover:opacity-100 duration-1000"></div>
                <div className="relative flex items-center justify-center w-14 h-14 bg-[#25D366] rounded-full shadow-lg ring-1 ring-white/20 hover:bg-green-600 transition-colors">
                    <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="white" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                </div>
            </a>

            {/* Removed Floating Cart Button */}

            {/* Shopping Cart UI */}
            {isCartOpen && (
                <div className="fixed inset-0 z-[150] flex justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
                    <div className="relative w-full max-w-md bg-zinc-950 border-l border-white/10 h-full flex flex-col shadow-2xl animate-in slide-in-from-right-full duration-300">
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <h2 className="text-2xl font-serif text-white flex items-center gap-2">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                                Carrito
                            </h2>
                            <button onClick={() => setIsCartOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4">
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="opacity-50"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                                    <p>Tu carrito está vacío</p>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.product.id} className="flex gap-4 items-center bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
                                        <div className="w-16 h-16 bg-black rounded-xl overflow-hidden border border-white/5 shrink-0">
                                            {item.product.imageUrl ? (
                                                <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-zinc-700">
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path></svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-white font-bold truncate">{item.product.name}</h4>
                                            <p className="text-yellow-600 font-medium text-sm">{formatCurrency(item.product.price, shop.currency)}</p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <button onClick={() => updateQuantity(item.product.id, -1)} className="w-6 h-6 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-white">-</button>
                                                <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.product.id, 1)} className="w-6 h-6 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-white">+</button>
                                            </div>
                                        </div>
                                        <button onClick={() => removeFromCart(item.product.id)} className="text-zinc-600 hover:text-red-500 p-2 transition-colors">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-6 border-t border-white/10 bg-black/40">
                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-zinc-400">Total</span>
                                    <span className="text-2xl font-bold text-white">{formatCurrency(cartTotal, shop.currency)}</span>
                                </div>
                                <button 
                                    onClick={handleWhatsAppOrder}
                                    className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-4 rounded-xl font-bold hover:bg-[#1DA851] transition-colors shadow-md"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.662-2.062-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                                    </svg>
                                    Completar por WhatsApp
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    )
}
