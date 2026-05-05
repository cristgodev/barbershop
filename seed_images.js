const { PrismaClient } = require('./app/generated/prisma')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function main() {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  const brainDir = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\53ce6faf-5033-4553-ae1b-5199921d29c8'
  const sourceHero = path.join(brainDir, 'hero_barbershop_1774306378040.png')
  const sourceFade = path.join(brainDir, 'portfolio_fade_1774306391280.png')
  const sourceBeard = path.join(brainDir, 'portfolio_beard_1774306404211.png')
  const sourcePomp = path.join(brainDir, 'portfolio_pompadour_1774306416955.png')
  
  const sourceGallery1 = path.join(brainDir, 'shop_gallery_1_1774306978945.png')
  const sourceGallery2 = path.join(brainDir, 'shop_gallery_2_1774306992549.png')
  const sourceGallery3 = path.join(brainDir, 'shop_gallery_3_1774307007808.png')

  fs.copyFileSync(sourceHero, path.join(uploadDir, 'hero.png'))
  fs.copyFileSync(sourceFade, path.join(uploadDir, 'fade.png'))
  fs.copyFileSync(sourceBeard, path.join(uploadDir, 'beard.png'))
  fs.copyFileSync(sourcePomp, path.join(uploadDir, 'pomp.png'))
  
  fs.copyFileSync(sourceGallery1, path.join(uploadDir, 'gallery1.png'))
  fs.copyFileSync(sourceGallery2, path.join(uploadDir, 'gallery2.png'))
  fs.copyFileSync(sourceGallery3, path.join(uploadDir, 'gallery3.png'))

  const shop = await prisma.barbershop.findFirst()
  if (shop) {
    await prisma.barbershop.update({
      where: { id: shop.id },
      data: { 
        heroImageUrl: '/uploads/hero.png',
        galleryUrls: '/uploads/gallery1.png,/uploads/gallery2.png,/uploads/gallery3.png'
      }
    })
    console.log('Hero and Gallery images updated.')
  }

  const user = await prisma.user.findFirst({ where: { role: { in: ['OWNER', 'BARBER'] } } })
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
