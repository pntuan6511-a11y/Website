import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// No cache - realtime data for admin
export const revalidate = 0

export async function GET() {
    try {
        const interestRates = await prisma.interestRate.findMany({
            orderBy: {
                order: 'asc'
            }
        })
        return NextResponse.json(interestRates)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch interest rates' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { rate, label, isActive, order } = body

        const interestRate = await prisma.interestRate.create({
            data: {
                rate,
                label,
                isActive: isActive ?? true,
                order: order ?? 0
            }
        })

        return NextResponse.json(interestRate)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to create interest rate' }, { status: 500 })
    }
}
