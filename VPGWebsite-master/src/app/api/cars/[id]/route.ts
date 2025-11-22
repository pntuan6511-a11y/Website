import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const car = await prisma.car.findUnique({
      where: {
        id: params.id
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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, slug, description, article, mainImage, tag } = body

    const updateData: any = { name, slug, description, article, mainImage }
    if (typeof tag !== 'undefined') updateData.tag = tag

    const car = await prisma.car.update({
      where: { id: params.id },
      data: updateData,
      include: { versions: true, images: true }
    })

    return NextResponse.json(car)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update car' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.car.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete car' }, { status: 500 })
  }
}
