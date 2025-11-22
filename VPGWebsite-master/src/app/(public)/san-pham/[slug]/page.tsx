import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { generateSEO, generateCarStructuredData, generateBreadcrumbStructuredData } from '@/lib/seo'
import CarDetailClient from './CarDetailClient'
import { notFound } from 'next/navigation'

interface PageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const car = await prisma.car.findUnique({
    where: { slug: params.slug },
    include: {
      versions: { orderBy: { price: 'asc' } },
      images: { orderBy: { order: 'asc' } },
    },
  })

  if (!car) {
    return generateSEO({ title: 'Không tìm thấy xe' })
  }

  const mainImage = car.images?.find(img => img.imageType === 'main')?.imageUrl 
    || car.ogImage 
    || car.mainImage

  const lowestPrice = car.versions.length > 0 
    ? Number(car.versions[0].price).toLocaleString('vi-VN')
    : ''

  return generateSEO({
    title: car.metaTitle || car.name,
    description: car.metaDescription || car.description || `${car.name} - Giá từ ${lowestPrice} VNĐ. Đại lý chính thức VinFast. Tư vấn miễn phí, lái thử tận nhà.`,
    keywords: car.metaKeywords || `${car.name}, xe VinFast, giá ${car.name}, mua ${car.name}, lái thử ${car.name}`,
    image: mainImage ?? undefined,
    url: `/cars/${car.slug}`,
    type: 'product',
  })
}

export default async function CarDetailPage({ params }: PageProps) {
  const car = await prisma.car.findUnique({
    where: { slug: params.slug },
    include: {
      versions: { orderBy: { price: 'asc' } },
      images: { orderBy: { order: 'asc' } },
    },
  })

  if (!car) {
    notFound()
  }

  // Convert Decimal to string for JSON serialization
  const carData = {
    ...car,
    versions: car.versions.map(v => ({
      ...v,
      price: v.price.toString(),
    })),
  }

  const carSchema = generateCarStructuredData(carData)
  const breadcrumbSchema = generateBreadcrumbStructuredData([
    { name: 'Trang chủ', url: '/' },
    { name: 'Dòng xe', url: '/cars' },
    { name: car.name, url: `/cars/${car.slug}` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(carSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <CarDetailClient car={carData} />
    </>
  )
}

export async function generateStaticParams() {
  const cars = await prisma.car.findMany({
    select: { slug: true },
  })

  return cars.map((car) => ({
    slug: car.slug,
  }))
}
