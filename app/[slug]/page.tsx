import { prisma } from "../lib/prisma"
import { notFound } from "next/navigation"
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
            staff: {
                where: {
                    role: {
                        in: ['OWNER', 'BARBER', 'MANAGER', 'ADMIN']
                    }
                }
            }
        }
    })

    if (!shop) {
        return notFound()
    }

    return (
        <ShopClient shop={shop} slug={slug} />
    )
}
