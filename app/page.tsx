import { prisma } from "./lib/prisma"
import HomeClient from "./HomeClient"

export const dynamic = 'force-dynamic'

export default async function Home() {
  const shops = await prisma.barbershop.findMany({
    orderBy: { createdAt: 'desc' }
  })

  // We serialize the dates
  const serializedShops = shops.map(shop => ({
    ...shop,
    createdAt: shop.createdAt.toISOString(),
    updatedAt: shop.updatedAt.toISOString(),
  }))

  return <HomeClient shops={serializedShops} />
}
