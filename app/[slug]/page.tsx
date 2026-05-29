import { prisma } from "../lib/prisma"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "../lib/auth"
import ShopClient from "./ShopClient"

export default async function BarbershopLandingPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params
    const slug = resolvedParams.slug

    if (['api', 'login', 'register', 'dashboard', 'book', 'favicon.ico'].includes(slug.toLowerCase())) {
        return notFound()
    }

    const shop = await prisma.barbershop.findUnique({
        where: { slug: slug },
        include: {
            services: true,
            products: true,
            staff: {
                where: {
                    role: {
                        in: ['OWNER', 'BARBER', 'MANAGER', 'ADMIN']
                    },
                    showOnLanding: true
                }
            }
        }
    })

    if (!shop) {
        return notFound()
    }

    if (shop.isActive === false) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center">
                <div className="max-w-md w-full p-8 border border-white/10 rounded-3xl bg-zinc-950">
                    <h1 className="text-3xl font-serif text-white mb-4">Barbería no disponible</h1>
                    <p className="text-zinc-500">
                        Esta barbería se encuentra temporalmente fuera de servicio. Por favor, intenta más tarde o contacta directamente al establecimiento.
                    </p>
                </div>
            </div>
        )
    }

    const session = await getServerSession(authOptions)
    const isLoggedIn = !!session?.user

    return (
        <ShopClient shop={shop} slug={slug} isLoggedIn={isLoggedIn} />
    )
}
