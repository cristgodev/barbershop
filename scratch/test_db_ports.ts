import { PrismaClient } from '../app/generated/prisma';

async function testConnection(url: string, label: string) {
  console.log(`Testing ${label}...`);
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url
      }
    }
  });

  try {
    const start = Date.now();
    await prisma.$connect();
    console.log(`✅ Success for ${label} in ${Date.now() - start}ms`);
    await prisma.$disconnect();
    return true;
  } catch (error: any) {
    console.log(`❌ Failed for ${label}:`, error.message);
    return false;
  }
}

async function main() {
  const password = "C19052006L0601";
  const project = "ifxqbfumzudzoqvzubif";
  
  // 1. Current URL (pooler on 5432)
  const url1 = `postgresql://postgres.${project}:${password}@aws-0-us-west-2.pooler.supabase.com:5432/postgres`;
  // 2. Pooler on 6543
  const url2 = `postgresql://postgres.${project}:${password}@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`;
  // 3. Direct connection on 5432
  const url3 = `postgresql://postgres:${password}@db.${project}.supabase.co:5432/postgres`;

  await testConnection(url1, "Option 1: pooler on 5432 (Current)");
  await testConnection(url2, "Option 2: pooler on 6543 (Pgbouncer)");
  await testConnection(url3, "Option 3: direct on 5432 (Direct)");
}

main();
