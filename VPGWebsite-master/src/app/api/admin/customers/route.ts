import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// No cache - realtime data for admin
export const revalidate = 0

export async function GET() {
    try {
        const customers = await prisma.customer.findMany({
            orderBy: {
                order: 'asc'
            }
        })
        return NextResponse.json(customers)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, imageUrl, order } = body

        const customer = await prisma.customer.create({
            data: {
                name,
                imageUrl,
                order: order || 0
            }
        })

        return NextResponse.json(customer)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
    }
}
