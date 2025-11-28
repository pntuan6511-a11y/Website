import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json()
        const { rate, label, isActive, order } = body

        const interestRate = await prisma.interestRate.update({
            where: { id: params.id },
            data: {
                rate,
                label,
                isActive,
                order
            }
        })

        return NextResponse.json(interestRate)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to update interest rate' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.interestRate.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to delete interest rate' }, { status: 500 })
    }
}
