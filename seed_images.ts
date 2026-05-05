import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  // Define paths
  const brainDir = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\53ce6faf-5033-4553-ae1b-5199921d29c8'
  const sourceHero = path.join(brainDir, 'hero_barbershop_1774306378040.png')
  const sourceFade = path.join(brainDir, 'portfolio_fade_1774306391280.png')
  const sourceBeard = path.join(brainDir, 'portfolio_beard_1774306404211.png')
  const sourcePomp = path.join(brainDir, 'portfolio_pompadour_1774306416955.png')

  // Copy files
  fs.copyFileSync(sourceHero, path.join(uploadDir, 'hero.png'))
  fs.copyFileSync(sourceFade, path.join(uploadDir, 'fade.png'))
  fs.copyFileSync(sourceBeard, path.join(uploadDir, 'beard.png'))
  fs.copyFileSync(sourcePomp, path.join(uploadDir, 'pomp.png'))

  // Update DB
  const shop = await prisma.barbershop.findFirst()
  if (shop) {
    await prisma.barbershop.update({
      where: { id: shop.id },
      data: { heroImageUrl: '/uploads/hero.png' }
    })
    console.log('Hero image updated.')
  }

  const user = await prisma.user.findUnique({ where: { email: 'chucho@chucho.com' } })
  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        instagramUrl: 'https://instagram.com/chuchobarber',
        tiktokUrl: 'https://tiktok.com/@chuchobarber',
        portfolioUrls: '/uploads/fade.png,/uploads/beard.png,/uploads/pomp.png'
      }
    })
    console.log('Chucho portfolio updated.')
  } else {
    console.log('Could not find user chucho@chucho.com')
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
