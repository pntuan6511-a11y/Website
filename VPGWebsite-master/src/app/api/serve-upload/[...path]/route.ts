import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join, isAbsolute, extname, parse } from 'path'
import { existsSync } from 'fs'

// Image extensions that might have WebP versions
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff']

export async function GET(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    try {
        // Get the file path from params
        const filePath = params.path.join('/')

        // Determine uploads directory
        const configured = process.env.UPLOADS_DIR || join('public', 'uploads')
        const uploadsDir = isAbsolute(configured) ? configured : join(process.cwd(), configured)

        // Construct full file path
        let fullPath = join(uploadsDir, filePath)
        let actualPath = fullPath
        let isWebPFallback = false

        // Check if file exists
        if (!existsSync(fullPath)) {
            // Try to find WebP version if original is an image
            const ext = extname(filePath).toLowerCase()
            if (IMAGE_EXTENSIONS.includes(ext)) {
                const pathInfo = parse(filePath)
                const webpPath = join(pathInfo.dir, `${pathInfo.name}.webp`)
                const webpFullPath = join(uploadsDir, webpPath)

                if (existsSync(webpFullPath)) {
                    // WebP version exists, use it instead
                    actualPath = webpFullPath
                    isWebPFallback = true
                    console.log(`✅ Auto-fallback: ${filePath} → ${webpPath}`)
                } else {
                    return new NextResponse('File not found', { status: 404 })
                }
            } else {
                return new NextResponse('File not found', { status: 404 })
            }
        } else {
            // Original file exists, but check if WebP version is available
            const ext = extname(filePath).toLowerCase()
            if (IMAGE_EXTENSIONS.includes(ext)) {
                const pathInfo = parse(filePath)
                const webpPath = join(pathInfo.dir, `${pathInfo.name}.webp`)
                const webpFullPath = join(uploadsDir, webpPath)

                if (existsSync(webpFullPath)) {
                    // Prefer WebP version if available
                    actualPath = webpFullPath
                    isWebPFallback = true
                    console.log(`✅ Prefer WebP: ${filePath} → ${webpPath}`)
                }
            }
        }

        // Read file
        const fileBuffer = await readFile(actualPath)

        // Determine content type based on actual file extension
        const actualExt = extname(actualPath).split('.').pop()?.toLowerCase()
        const contentTypes: Record<string, string> = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'svg': 'image/svg+xml',
            'pdf': 'application/pdf',
            'mp4': 'video/mp4',
        }

        const contentType = contentTypes[actualExt || ''] || 'application/octet-stream'

        // Return file with appropriate headers
        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
                'X-WebP-Fallback': isWebPFallback ? 'true' : 'false',
            },
        })
    } catch (error) {
        console.error('Error serving file:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
