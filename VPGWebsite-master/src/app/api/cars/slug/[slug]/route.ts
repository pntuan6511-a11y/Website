import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const car = await prisma.car.findUnique({
      where: {
        slug: params.slug
      },
      include: {
        versions: true,
        images: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 })
    }

    return NextResponse.json(car)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch car' }, { status: 500 })
  }
}
