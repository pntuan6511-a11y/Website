import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword
    }
  })
  console.log('✅ Admin user created:', admin.username)

  // Create sample cars
  const vf6 = await prisma.car.create({
    data: {
      name: 'VinFast VF 6',
      slug: 'vf6',
      description: 'SUV điện thông minh, phù hợp cho gia đình',
      article: '<p>VinFast VF 6 là mẫu xe SUV điện thông minh với thiết kế hiện đại, công nghệ tiên tiến.</p>',
      mainImage: '/uploads/vf6.jpg',
      versions: {
        create: [
          {
            name: 'VF6 ECO (Tiêu chuẩn)',
            price: 689000000
          },
          {
            name: 'VF6 ECO (Nâng cao)',
            price: 694000000
          },
          {
            name: 'VF6 PLUS (Tiêu chuẩn)',
            price: 754000000
          },
          {
            name: 'VF6 PLUS (Nâng cao)',
            price: 759000000
          }
        ]
      }
    }
  })
  console.log('✅ Created car:', vf6.name)

  const vf7 = await prisma.car.create({
    data: {
      name: 'VinFast VF 7',
      slug: 'vf7',
      description: 'SUV điện cao cấp với không gian rộng rãi',
      article: '<p>VinFast VF 7 là mẫu xe SUV điện cao cấp với thiết kế sang trọng.</p>',
      mainImage: '/uploads/vf7.jpg',
      versions: {
        create: [
          {
            name: 'VF7 BASE',
            price: 850000000
          },
          {
            name: 'VF7 PLUS',
            price: 950000000
          }
        ]
      }
    }
  })
  console.log('✅ Created car:', vf7.name)

  const vf8 = await prisma.car.create({
    data: {
      name: 'VinFast VF 8',
      slug: 'vf8',
      description: 'SUV điện cao cấp hạng D',
      article: '<p>VinFast VF 8 là mẫu xe SUV điện cao cấp hạng D với thiết kế thể thao.</p>',
      mainImage: '/uploads/vf8.jpg',
      versions: {
        create: [
          {
            name: 'VF8 ECO',
            price: 1050000000
          },
          {
            name: 'VF8 PLUS',
            price: 1150000000
          }
        ]
      }
    }
  })
  console.log('✅ Created car:', vf8.name)

  // Create sample customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'Nguyễn Văn A',
      imageUrl: '/uploads/customer1.jpg',
      order: 1
    }
  })
  console.log('✅ Created customer:', customer1.name)

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Trần Thị B',
      imageUrl: '/uploads/customer2.jpg',
      order: 2
    }
  })
  console.log('✅ Created customer:', customer2.name)

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
