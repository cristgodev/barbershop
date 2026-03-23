import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany()
  console.log("USERS:", users.length, users.map((u: any) => u.name))
  const shops = await prisma.barbershop.findMany()
  console.log("SHOPS:", shops.length, shops.map((s: any) => s.name))
}

main().finally(() => prisma.$disconnect())
