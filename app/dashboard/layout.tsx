import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "../lib/auth"
import { prisma } from "../lib/prisma"
import DashboardNavigation from "./DashboardNavigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || !session.user.barbershopId) {
    redirect('/login')
  }

  const shop = await prisma.barbershop.findUnique({
    where: { id: session.user.barbershopId }
  })

  if (!shop) {
    redirect('/login')
  }

  const currentUser = session.user

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950">
      
      {/* Sidebar Navigation */}
      <DashboardNavigation shopName={shop.name} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        
        {/* TopBar */}
        <header className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-8 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500 font-medium">Dashboard</span>
          </div>
          
          <div className="flex items-center gap-4">
            <a href="/" target="_blank" className="text-sm font-medium hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors">
              View Live Site ↗
            </a>
            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800"></div>
            <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                    <div className="font-bold text-sm leading-none">{currentUser.name}</div>
                    <div className="text-xs text-zinc-500 capitalize mt-1">{currentUser.role.toLowerCase()}</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-bold text-lg shadow-sm">
                    {currentUser.name?.charAt(0) || 'U'}
                </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
        
      </div>
    </div>
  )
}
