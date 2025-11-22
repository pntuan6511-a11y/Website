import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.testDrive.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete test drive' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status } = body as { status?: number }
    if (typeof status === 'undefined') {
      return NextResponse.json({ error: 'Missing status' }, { status: 400 })
    }

    const updated = await prisma.testDrive.update({
      where: { id: params.id },
      data: { status }
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update test drive' }, { status: 500 })
  }
}
