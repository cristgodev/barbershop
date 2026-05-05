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

    const session = await getServerSession(authOptions)
    const isLoggedIn = !!session?.user

    return (
        <ShopClient shop={shop} slug={slug} isLoggedIn={isLoggedIn} />
    )
}
