import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { prisma } from '@/lib/prisma'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

export async function GET() {
  try {
    if (!fs.existsSync(UPLOAD_DIR)) {
      return NextResponse.json([])
    }

    const files = fs.readdirSync(UPLOAD_DIR).filter(f => !f.startsWith('.'))

    // find which files are referenced in various DB fields
    const carImages = await prisma.carImage.findMany({ select: { imageUrl: true } })
    const carMainOg = await prisma.car.findMany({ select: { mainImage: true, ogImage: true } })
    const customers = await prisma.customer.findMany({ select: { imageUrl: true } })

    const list = files.map(f => {
      const rel = `/uploads/${f}`
      // consider a file used if any DB field equals the rel or endsWith the rel (handles absolute URLs)
      const usedInCarImage = carImages.some(i => i.imageUrl === rel || (i.imageUrl && i.imageUrl.endsWith && i.imageUrl.endsWith(rel)))
      const usedInCar = carMainOg.some(c => (c.mainImage === rel) || (c.mainImage && c.mainImage.endsWith && c.mainImage.endsWith(rel)) || (c.ogImage === rel) || (c.ogImage && c.ogImage.endsWith && c.ogImage.endsWith(rel)))
      const usedInCustomer = customers.some(c => c.imageUrl === rel || (c.imageUrl && c.imageUrl.endsWith && c.imageUrl.endsWith(rel)))
      const used = usedInCarImage || usedInCar || usedInCustomer
      return { name: f, url: rel, used, size: fs.statSync(path.join(UPLOAD_DIR, f)).size }
    })

    return NextResponse.json(list)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read uploads' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { name } = await request.json()
    if (!name) return NextResponse.json({ error: 'Missing name' }, { status: 400 })

    const filePath = path.join(UPLOAD_DIR, name)
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Always remove the file from the uploads directory when requested

    fs.unlinkSync(filePath)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
  }
}
