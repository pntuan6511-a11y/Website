import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Cache for 1 hour for public API
export const revalidate = 3600

export async function GET() {
    try {
        const interestRates = await prisma.interestRate.findMany({
            where: {
                isActive: true
            },
            orderBy: {
                order: 'asc'
            }
        })
        return NextResponse.json(interestRates)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch interest rates' }, { status: 500 })
    }
}
