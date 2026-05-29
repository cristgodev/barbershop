import { PrismaClient } from '../generated/prisma'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let dbUrl = process.env.DATABASE_URL || "postgresql://postgres.ifxqbfumzudzoqvzubif:C19052006L0601@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

// Dynamic defensive rewrite to correct 5432 to 6543 for Vercel serverless functions
if (dbUrl.includes("pooler.supabase.com:5432")) {
  dbUrl = dbUrl.replace("pooler.supabase.com:5432", "pooler.supabase.com:6543")
  if (!dbUrl.includes("pgbouncer")) {
    const sep = dbUrl.includes("?") ? "&" : "?"
    dbUrl = `${dbUrl}${sep}pgbouncer=true&connection_limit=1`
  }
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: dbUrl
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
