import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "../lib/auth"
import { prisma } from "../lib/prisma"
import DashboardNavigation from "./DashboardNavigation"
import DashboardHeaderClient from "./DashboardHeaderClient"
import { MobileNavProvider } from "./MobileNavContext"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect('/login')
  }

  if (session.user.role === 'SUPERADMIN') {
    redirect('/superadmin')
  }

  if (!session.user.barbershopId) {
    redirect('/onboarding')
  }

  const shop = await prisma.barbershop.findUnique({
    where: { id: session.user.barbershopId }
  })

  if (!shop) {
    redirect('/login')
  }

  if (shop.isActive === false) {
    redirect('/suspended')
  }

  const currentUser = session.user

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950">
      <MobileNavProvider>
        {/* Sidebar Navigation */}
        <DashboardNavigation shop={shop} userRole={currentUser.role} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen relative w-full">
          
          {/* TopBar */}
          <DashboardHeaderClient currentUser={currentUser} shopSlug={shop.slug} />
          

          {/* Page Content */}
          <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
            {children}
          </main>
          
        </div>
      </MobileNavProvider>
    </div>
  )
}
