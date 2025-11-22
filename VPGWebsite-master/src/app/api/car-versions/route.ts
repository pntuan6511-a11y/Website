import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { carId, name, price } = body

    const version = await prisma.carVersion.create({
      data: {
        carId,
        name,
        price
      }
    })

    return NextResponse.json(version)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create version' }, { status: 500 })
  }
}
