import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export const revalidate = 60


export async function GET() {
  try {
    const cars = await prisma.car.findMany({
      include: {
        versions: true,
        images: {
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(cars)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cars' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, slug, description, article, mainImage, versions, tag } = body

    const createData: any = {
      name,
      description,
      article,
      mainImage,
    }

    // Basic slugify helper
    const slugify = (input: string) =>
      input
        .toString()
        .normalize('NFKD')
        .replace(/[^\w\s-]/g, '')
        .trim()
        .toLowerCase()
        .replace(/[-\s]+/g, '-')

    // Ensure slug is unique by appending a numeric suffix when collisions happen
    const ensureUniqueSlug = async (base: string) => {
      const baseSlug = slugify(base)
      let candidate = baseSlug
      let i = 0
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const existing = await prisma.car.findUnique({ where: { slug: candidate } })
        if (!existing) return candidate
        i += 1
        candidate = `${baseSlug}-${i}`
      }
    }

    // Determine final slug (generate from name if not provided)
    const finalSlug = slug ? await ensureUniqueSlug(slug) : await ensureUniqueSlug(name)
    createData.slug = finalSlug

    if (typeof tag !== 'undefined') createData.tag = tag

    if (versions) {
      createData.versions = {
        create: versions.map((v: any) => ({ name: v.name, price: v.price }))
      }
    }

    const car = await prisma.car.create({
      data: createData,
      include: { versions: true, images: true }
    })

    return NextResponse.json(car)
  } catch (error) {
    console.error(error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Unique constraint failed', fields: error.meta?.target || [] }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create car' }, { status: 500 })
  }
}
