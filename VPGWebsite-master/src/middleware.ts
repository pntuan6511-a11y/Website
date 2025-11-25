import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { validateAdminOrigin, addSecurityHeaders, createForbiddenResponse } from '@/lib/adminAuth'

// Middleware function that runs before route handlers
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // List of public API routes that need domain validation
  const publicApiRoutes = [
    '/api/auth',           // NextAuth login/logout
    '/api/cars',           // Public cars API (cached)
    '/api/customers',      // Public customers API (cached)
    '/api/car-images',     // Public car images API (cached)
    '/api/price-quotes',   // Price quote submissions
    '/api/test-drives',    // Test drive submissions
    '/api/upload',         // File uploads
  ]

  // Check if this is a public API request that needs validation
  const isPublicApi = publicApiRoutes.some(route => pathname.startsWith(route))

  if (isPublicApi) {
    // Validate origin for public API requests
    if (!validateAdminOrigin(request)) {
      console.warn(`Blocked public API request from invalid origin: ${request.headers.get('origin') || request.headers.get('referer') || 'unknown'} to ${pathname}`)
      return createForbiddenResponse()
    }

    // Add security headers to public API responses
    const response = NextResponse.next()
    return addSecurityHeaders(response)
  }

  // For admin pages (not API), use NextAuth middleware
  if (pathname.startsWith('/admin/') && !pathname.startsWith('/admin/signin')) {
    return withAuth(request as any, {
      pages: {
        signIn: '/admin/signin',
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*'  // Match all API routes
  ]
}

