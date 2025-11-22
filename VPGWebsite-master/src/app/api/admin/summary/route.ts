import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [carsCount, testDrivesCount, priceQuotesCount, customersCount] = await Promise.all([
      prisma.car.count(),
      prisma.testDrive.count(),
      prisma.priceQuote.count(),
      prisma.customer.count()
    ])

    return NextResponse.json({
      cars: carsCount,
      testDrives: testDrivesCount,
      priceQuotes: priceQuotesCount,
      customers: customersCount
    })
  } catch (error) {
    console.error('Summary API error', error)
    return NextResponse.json({ error: 'Failed to fetch summary' }, { status: 500 })
  }
}
