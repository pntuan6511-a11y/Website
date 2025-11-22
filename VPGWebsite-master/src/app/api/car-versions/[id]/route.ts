import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, price } = body

    const version = await prisma.carVersion.update({
      where: {
        id: params.id
      },
      data: {
        name,
        price
      }
    })

    return NextResponse.json(version)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update version' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.carVersion.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete version' }, { status: 500 })
  }
}
