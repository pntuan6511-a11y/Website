import { NextResponse } from 'next/server'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join, isAbsolute, extname } from 'path'
import { existsSync } from 'fs'
import { prisma } from '@/lib/prisma'
import sharp from 'sharp'

// Image extensions that should be converted to WebP
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff']

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Determine uploads directory from env or default to ./public/uploads
    // If UPLOADS_DIR is absolute (starts with '/'), use it as absolute path.
    // Otherwise treat it relative to process.cwd().
    const configured = process.env.UPLOADS_DIR || join('public', 'uploads')
    const uploadsDir = isAbsolute(configured) ? configured : join(process.cwd(), configured)

    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = file.name.replace(/\s/g, '-')
    const ext = extname(originalName).toLowerCase()
    const nameWithoutExt = originalName.replace(ext, '')

    // Check if image should be converted to WebP
    const shouldConvertToWebP = IMAGE_EXTENSIONS.includes(ext)

    let filename: string
    let filepath: string
    let finalBuffer: Buffer = buffer

    if (shouldConvertToWebP) {
      // Convert to WebP
      filename = `${timestamp}-${nameWithoutExt}.webp`
      filepath = join(uploadsDir, filename)

      try {
        // Convert image to WebP with optimization
        finalBuffer = await sharp(buffer)
          .webp({
            quality: 85, // Good balance between quality and size
            effort: 4 // Compression effort (0-6, higher = smaller but slower)
          })
          .toBuffer()

        console.log(`✅ Converted ${originalName} to WebP (${buffer.length} → ${finalBuffer.length} bytes, ${Math.round((1 - finalBuffer.length / buffer.length) * 100)}% smaller)`)
      } catch (conversionError) {
        console.error('WebP conversion failed, saving original:', conversionError)
        // Fallback to original if conversion fails
        filename = `${timestamp}-${originalName}`
        filepath = join(uploadsDir, filename)
        finalBuffer = buffer
      }
    } else {
      // Keep original format for non-image files
      filename = `${timestamp}-${originalName}`
      filepath = join(uploadsDir, filename)
    }

    // Write file to disk
    await writeFile(filepath, finalBuffer)

    // Compute public-facing URL. If configured path is inside public folder,
    // return path relative to public (starts with '/'). If uploadsDir is an
    // absolute non-public path (e.g. '/uploads'), return path based on the
    // configured mount point's public URL (we assume same format).
    let publicUrl: string
    const normalizedConfigured = configured.replace(/\\/g, '/')
    if (normalizedConfigured.startsWith('public/')) {
      publicUrl = '/' + normalizedConfigured.replace(/^public\//, '') + `/${filename}`
    } else if (isAbsolute(configured)) {
      // If absolute path like '/uploads', use that as public URL root
      publicUrl = (configured.endsWith('/') ? configured.slice(0, -1) : configured) + `/${filename}`
    } else {
      // relative but not under public, assume it's mounted at root (e.g. 'uploads')
      publicUrl = '/' + normalizedConfigured.replace(/^\.\//, '') + `/${filename}`
    }

    // If admin requested, also create a CarImage record in DB
    // form field 'createDb' can be 'true', and optional 'imageType' and 'carId' can be provided
    try {
      const createDb = formData.get('createDb') as string | null
      if (createDb === 'true') {
        const imageType = (formData.get('imageType') as string) || 'banner'
        const carId = formData.get('carId') as string | null
        const data: any = {
          imageUrl: publicUrl,
          imageType,
          order: 0
        }
        if (carId && carId.length > 0) data.carId = carId
        try {
          await prisma.carImage.create({ data })
        } catch (dbErr) {
          console.error('Failed to create CarImage record:', dbErr)
          return NextResponse.json({ error: 'Failed to create CarImage record', details: String(dbErr) }, { status: 500 })
        }
      }
    } catch (e) {
      console.error('Upload handler error while processing createDb:', e)
      return NextResponse.json({ error: 'Upload handler error', details: String(e) }, { status: 500 })
    }

    return NextResponse.json({
      url: publicUrl,
      filename,
      originalSize: buffer.length,
      finalSize: finalBuffer.length,
      savings: buffer.length > finalBuffer.length ? Math.round((1 - finalBuffer.length / buffer.length) * 100) : 0,
      converted: shouldConvertToWebP
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
