'use client';

import ClientDirectory from "./book/ClientDirectory";
import { useTranslation } from "./contexts/LanguageContext";

export default function HomeClient({ shops }: { shops: any[] }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col w-full min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black text-zinc-100">
      
      {/* 1. Hero Section (SaaS Platform) */}
      <section className="relative px-4 pt-20 pb-32 overflow-hidden flex flex-col items-center text-center justify-center">
        <div className="absolute inset-0 opacity-50 pointer-events-none" 
             style={{ background: 'radial-gradient(circle at center, rgba(217,119,6,0.15) 0%, transparent 60%)' }} />
        
        <div className="max-w-4xl space-y-8 relative z-10 w-full mx-auto flex flex-col items-center mt-12">
          
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-yellow-600/10 to-yellow-600/5 border border-yellow-600/30 shadow-[0_0_20px_rgba(234,179,8,0.1)] text-xs font-bold tracking-[0.2em] text-yellow-600 dark:text-yellow-500 uppercase backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_10px_rgba(234,179,8,0.8)]"></span>
            El Software N°1 para Barberías
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05] font-serif text-zinc-900 dark:text-white" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
            <span className="block mb-2">Domina tu Tiempo,</span>
            <span className="italic block font-light text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-yellow-400">Escala tu Imperio.</span>
          </h1>
          
          <p className="text-lg md:text-2xl text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl font-medium mx-auto">
            El sistema "Todo-En-Uno" para agendar sin estrés, gestionar a tu equipo como un profesional, y duplicar tus ingresos con analíticas exactas.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-10 w-full sm:w-auto">
            <a href="/register" className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-500 hover:from-amber-500 hover:to-yellow-400 text-zinc-950 px-12 py-5 rounded-full font-black text-xl transition-all duration-500 hover:-translate-y-1 active:scale-95 shadow-[0_0_40px_rgba(217,119,6,0.4)] hover:shadow-[0_0_60px_rgba(245,158,11,0.6)] ring-1 ring-yellow-400/50 w-full sm:w-auto flex items-center justify-center gap-3">
              Crear Tienda Gratis
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </a>
            <a href="#features" className="bg-white/5 hover:bg-white/10 border border-white/10 px-10 py-5 rounded-full font-bold text-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] w-full sm:w-auto text-center backdrop-blur-md">
              Descubrir Funciones
            </a>
          </div>

          {/* Social Proof Mini */}
          <div className="pt-16 flex flex-col items-center gap-3 opacity-80">
            <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-zinc-950 flex items-center justify-center text-xs font-bold font-serif overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Owner" className="w-full h-full object-cover filter grayscale" />
                    </div>
                ))}
            </div>
            <p className="text-sm font-semibold text-zinc-500">Únete a cientos de barberos exitosos.</p>
          </div>
        </div>
      </section>

      {/* 2. Features Grid */}
      <section id="features" className="max-w-6xl mx-auto px-4 py-24 scroll-mt-24 relative z-10 w-full">
        <div className="text-center space-y-4 mb-16 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-600/20 blur-[100px] pointer-events-none rounded-full"></div>
            <h2 className="text-4xl md:text-6xl font-black font-serif text-white relative z-10" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Por qué somos diferentes</h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto relative z-10">Olvídate de las libretas y los WhatsApps perdidos. Diseñado exclusivamente para barberías de élite.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_32px_rgba(217,119,6,0.15)] hover:border-white/20 hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] group-hover:bg-amber-500/20 transition-colors"></div>
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-yellow-600/5 border border-white/5 text-yellow-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:text-yellow-400 transition-all shadow-inner relative z-10">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <h3 className="text-2xl font-bold font-serif mb-4 text-white relative z-10" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Agenda Inteligente 24/7</h3>
                <p className="text-zinc-400 leading-relaxed relative z-10">Tu negocio no duerme. Recibe reservas automáticamente, sin bloqueos manuales ni dobles citas gracias a nuestra sincronización en tiempo real.</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_32px_rgba(217,119,6,0.15)] hover:border-white/20 hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] group-hover:bg-amber-500/20 transition-colors"></div>
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-yellow-600/5 border border-white/5 text-yellow-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:text-yellow-400 transition-all shadow-inner relative z-10">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
                <h3 className="text-2xl font-bold font-serif mb-4 text-white relative z-10" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Revolución en Equipo</h3>
                <p className="text-zinc-400 leading-relaxed relative z-10">Cada barbero tiene su propio perfil, portafolio y enlace de reserva directo. Gestiona comisiones y roles en un clic desde el administrador matriz.</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_32px_rgba(217,119,6,0.15)] hover:border-white/20 hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] group-hover:bg-amber-500/20 transition-colors"></div>
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-yellow-600/5 border border-white/5 text-yellow-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:text-yellow-400 transition-all shadow-inner relative z-10">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                </div>
                <h3 className="text-2xl font-bold font-serif mb-4 text-white relative z-10" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Landing Page Luxury</h3>
                <p className="text-zinc-400 leading-relaxed relative z-10">No inviertas miles en páginas web. Obtienes instantáneamente una tienda online con estética de cristal oscuro y galería propia que impresionará a tus clientes.</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_32px_rgba(217,119,6,0.15)] hover:border-white/20 hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] group-hover:bg-amber-500/20 transition-colors"></div>
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-yellow-600/5 border border-white/5 text-yellow-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:text-yellow-400 transition-all shadow-inner relative z-10">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                </div>
                <h3 className="text-2xl font-bold font-serif mb-4 text-white relative z-10" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Métricas al Instante</h3>
                <p className="text-zinc-400 leading-relaxed relative z-10">Domina tus números y moneda local. Analiza en tiempo real ingresos brutos, rendimiento individual de barberos e historial de citas en un Dashboard inigualable.</p>
            </div>
        </div>
      </section>

      {/* 3. How It Works (Steps) */}
      <section className="bg-zinc-900 text-white py-24 w-full">
        <div className="max-w-6xl mx-auto px-4">
            <div className="text-center space-y-4 mb-20">
                <h2 className="text-4xl md:text-5xl font-black font-serif" style={{ fontFamily: 'var(--font-cormorant), serif' }}>El éxito a 3 clics de distancia</h2>
                <p className="text-zinc-400 text-lg max-w-xl mx-auto">Implementar todo nuestro arsenal tecnológico en tu barbería toma literalmente 2 minutos, sin conocimientos técnicos.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                {/* Connecting Line */}
                <div className="hidden md:block absolute top-[4.5rem] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-yellow-600/50 to-transparent z-0"></div>

                <div className="flex flex-col items-center text-center relative z-10">
                    <div className="w-36 h-36 bg-zinc-950 border border-zinc-800 rounded-full flex items-center justify-center mb-8 shadow-2xl relative">
                        <span className="absolute -top-4 -right-2 w-10 h-10 bg-yellow-600 text-black font-black text-xl rounded-full flex items-center justify-center border-4 border-zinc-900 shadow-xl">1</span>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <h4 className="text-2xl font-bold font-serif mb-3">Registra tu Cuenta</h4>
                    <p className="text-zinc-400">Inicia sesión con Google o Email. Dinos el nombre de tu Barbería e instantáneamente nace tu portal privado.</p>
                </div>

                <div className="flex flex-col items-center text-center relative z-10">
                    <div className="w-36 h-36 bg-zinc-950 border border-zinc-800 rounded-full flex items-center justify-center mb-8 shadow-2xl relative">
                        <span className="absolute -top-4 -right-2 w-10 h-10 bg-yellow-600 text-black font-black text-xl rounded-full flex items-center justify-center border-4 border-zinc-900 shadow-xl">2</span>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    </div>
                    <h4 className="text-2xl font-bold font-serif mb-3">Personaliza Tu Marca</h4>
                    <p className="text-zinc-400">Carga tu logo, define tu moneda local, precios, servicios (Corte, Barba, Tintes) y fotos para tu Landing ultra premium.</p>
                </div>

                <div className="flex flex-col items-center text-center relative z-10">
                    <div className="w-36 h-36 bg-zinc-950 border border-zinc-800 rounded-full flex items-center justify-center mb-8 shadow-2xl relative">
                        <span className="absolute -top-4 -right-2 w-10 h-10 bg-yellow-600 text-black font-black text-xl rounded-full flex items-center justify-center border-4 border-zinc-900 shadow-xl">3</span>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                    </div>
                    <h4 className="text-2xl font-bold font-serif mb-3">Recibe Citas 24/7</h4>
                    <p className="text-zinc-400">Comparte tu enlace único en Instagram y WhatsApp. Deja que el sistema reserve citas en la nube mientras tú haces magia cortando.</p>
                </div>
            </div>
        </div>
      </section>

      {/* 4. Directory Section (Social Proof) */}
      <section className="space-y-6 py-24 max-w-6xl mx-auto w-full px-4 border-t border-white/10 mt-20 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        <div className="text-center space-y-4 mb-16 relative z-10">
            <h2 className="text-4xl md:text-5xl font-black font-serif text-white" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Ellos ya elevaron el estándar</h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">Explora el Directorio de Tiendas que operan bajo nuestro potente ecosistema. Dale un vistazo a sus Páginas B2C y siente la calidad.</p>
        </div>
        <ClientDirectory initialShops={shops} />
      </section>

      {/* 5. Cierre / Bottom CTA */}
      <section className="w-full py-32 px-4 text-center border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-64 bg-yellow-600/10 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto space-y-10 relative z-10">
            <h2 className="text-5xl md:text-7xl font-black font-serif text-white tracking-tight" style={{ fontFamily: 'var(--font-cormorant), serif' }}>El siguiente nivel te espera.</h2>
            <p className="text-xl md:text-2xl text-zinc-400 font-light max-w-3xl mx-auto leading-relaxed">Digitaliza tu negocio y colócate por encima del <strong className="text-yellow-600 font-bold">90%</strong> de tu competencia local desde hoy.</p>
            <div className="pt-8 flex justify-center">
                <a href="/register" className="inline-flex items-center justify-center gap-3 bg-yellow-600 hover:bg-yellow-500 text-black px-12 py-5 rounded-full font-bold text-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(217,119,6,0.3)] active:scale-95 uppercase tracking-widest group">
                    Comenzar Mi Sistema
                    <span aria-hidden="true" className="text-lg group-hover:translate-x-1 transition-transform">&rarr;</span>
                </a>
            </div>
        </div>
      </section>

      {/* 6. Simple SaaS Footer */}
      <footer className="w-full text-zinc-500 py-12 text-center relative z-10 border-t border-white/5 bg-black/20 backdrop-blur-sm">
        <p className="text-xs font-semibold tracking-widest uppercase">&copy; {new Date().getFullYear()} The BarberFlow SaaS. Construido para la Élite.</p>
        <div className="mt-8 flex justify-center gap-8 text-xs font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Términos</a>
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="/login" className="text-yellow-600 hover:text-yellow-500 transition-colors">Portal Propietarios</a>
        </div>
      </footer>
      
    </div>
  );
}
