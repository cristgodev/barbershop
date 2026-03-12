import { prisma } from "./lib/prisma"
import ClientDirectory from "./book/ClientDirectory"

export const dynamic = 'force-dynamic'

export default async function Home() {
  const shops = await prisma.barbershop.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="flex flex-col gap-16 pb-12 w-full max-w-6xl mx-auto px-4 mt-8">
      {/* Hero Section (SaaS Platform) */}
      <section className="bg-zinc-950 text-white dark:bg-zinc-900 rounded-[2.5rem] p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 justify-between overflow-hidden relative shadow-2xl">
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{ background: 'radial-gradient(circle at right center, white 0%, transparent 80%)' }} />
        
        <div className="max-w-2xl space-y-8 relative z-10 w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm font-medium border border-white/20">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            The #1 Barbershop Platform
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
            Find your next great haircut.
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-xl">
            Book appointments instantly with top-rated barbers. Or, register your own barbershop and start managing your business like a pro.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4">
            <a href="/register" className="bg-white hover:bg-zinc-200 text-black px-8 py-4 rounded-xl font-semibold text-lg transition-transform hover:scale-105 active:scale-95 shadow-lg w-full sm:w-auto text-center">
              Register Barbershop
            </a>
            <a href="/login" className="bg-transparent hover:bg-white/10 text-white border border-white/30 px-8 py-4 rounded-xl font-semibold text-lg transition-colors w-full sm:w-auto text-center">
              Login to Dashboard
            </a>
          </div>
        </div>

        <div className="w-full md:w-5/12 hidden md:flex items-center justify-center relative z-10">
            <svg width="240" height="240" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-10 text-white rotate-12 drop-shadow-2xl">
                <circle cx="6" cy="6" r="3" />
                <path d="M8.12 8.12 12 12" />
                <path d="M20 4 8.12 15.88" />
                <circle cx="6" cy="18" r="3" />
                <path d="M14.8 14.8 20 20" />
            </svg>
        </div>
      </section>

      {/* Directory Section */}
      <section className="space-y-6 pt-8">
        <ClientDirectory initialShops={shops} />
      </section>
      
    </div>
  );
}
