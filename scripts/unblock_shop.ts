import { PrismaClient } from '../app/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  const shopName = "X BARBER"; // The name provided by the user

  try {
    const shops = await prisma.barbershop.findMany({
      where: {
        name: {
          contains: shopName,
          mode: 'insensitive' // case-insensitive search
        }
      }
    });

    if (shops.length === 0) {
      console.log(`❌ No se encontró ninguna barbería con el nombre que contenga "${shopName}".`);
      return;
    }

    // Unblock all shops matching the name (usually just one)
    for (const shop of shops) {
      await prisma.barbershop.update({
        where: { id: shop.id },
        data: { isActive: true }
      });
      console.log(`✅ La barbería "${shop.name}" (ID: ${shop.id}) ha sido DESBLOQUEADA (reactivada) correctamente.`);
    }

  } catch (error) {
    console.error(`❌ Ocurrió un error al intentar desbloquear la barbería:`, error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
