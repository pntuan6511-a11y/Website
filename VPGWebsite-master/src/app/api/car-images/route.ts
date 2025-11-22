import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const images = await prisma.carImage.findMany({ orderBy: { order: 'asc' } })
    return NextResponse.json(images)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { carId, imageUrl, imageType, order } = body

    const image = await prisma.carImage.create({
      data: {
        carId: carId || undefined,
        imageUrl,
        imageType: imageType || 'gallery',
        order: order || 0
      }
    })

    return NextResponse.json(image)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to add image' }, { status: 500 })
  }
}
