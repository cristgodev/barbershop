import { PrismaClient } from '../app/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting product seed...')

  // Find shop
  const shop = await prisma.barbershop.findFirst({
    where: {
      name: { contains: 'chucho', mode: 'insensitive' }
    }
  })

  if (!shop) {
    console.error('Barbershop "chucho barber" not found!')
    process.exit(1)
  }

  console.log(`Found shop: ${shop.name}`)

  // Clear existing products to prevent duplicates for this seed run
  await prisma.product.deleteMany({
      where: { barbershopId: shop.id }
  });

  const products = [
    {
      barbershopId: shop.id,
      name: "Pomada Matte Premium",
      description: "Fijación fuerte y acabado mate natural. Perfecta para dar textura y volumen sin dejar residuos. 100g.",
      price: 25.00,
      stock: 45,
      sku: "POM-MAT-100",
      imageUrl: "/products/pomade.png"
    },
    {
      barbershopId: shop.id,
      name: "Aceite para Barba 'Sándalo'",
      description: "Hidratación profunda con aroma a madera de sándalo y notas cítricas. Suaviza y fortalece el vello facial. 30ml.",
      price: 18.50,
      stock: 30,
      sku: "BEA-OIL-30",
      imageUrl: "/products/beard_oil.png"
    },
    {
      barbershopId: shop.id,
      name: "Crema de Afeitar Clásica",
      description: "Fórmula enriquecida para un deslizamiento perfecto. Previene la irritación y deja la piel suave y fresca. 150g.",
      price: 22.00,
      stock: 15,
      sku: "SHV-CRM-150",
      imageUrl: "/products/shaving_cream.png"
    },
    {
      barbershopId: shop.id,
      name: "Sea Salt Texture Spray",
      description: "Spray texturizador con sal marina. Da volumen instantáneo y un look natural y relajado. 200ml.",
      price: 19.99,
      stock: 0, // One out of stock to test UI
      sku: "TEX-SPR-200",
      imageUrl: "/products/texture_spray.png"
    }
  ]

  for (const p of products) {
      await prisma.product.create({
          data: p
      })
      console.log(`Created product: ${p.name}`)
  }

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
