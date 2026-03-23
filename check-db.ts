import { prisma } from './app/lib/prisma';

async function main() {
  const shop = await prisma.barbershop.findFirst({
    where: {
      name: { contains: 'Chucho' }
    },
    include: {
      staff: true
    }
  });

  console.log(JSON.stringify(shop, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
