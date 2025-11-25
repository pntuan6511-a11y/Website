import { NextResponse } from 'next/server'

/**
 * Validates if the request origin matches the allowed site URL
 * @param request - The incoming request
 * @returns true if origin is valid, false otherwise
 */
export function validateAdminOrigin(request: Request): boolean {
    const allowedOrigin = process.env.NEXT_PUBLIC_SITE_URL

    // In development, allow localhost
    if (process.env.NODE_ENV === 'development') {
        return true
    }

    // If no allowed origin is set, deny all requests in production
    if (!allowedOrigin) {
        console.warn('NEXT_PUBLIC_SITE_URL is not set. Admin API access denied.')
        return false
    }

    // Check Origin header first (most reliable for API calls)
    const origin = request.headers.get('origin')
    if (origin) {
        return origin === allowedOrigin || origin === allowedOrigin.replace(/\/$/, '')
    }

    // Fallback to Referer header
    const referer = request.headers.get('referer')
    if (referer) {
        try {
            const refererUrl = new URL(referer)
            const allowedUrl = new URL(allowedOrigin)
            return refererUrl.origin === allowedUrl.origin
        } catch {
            return false
        }
    }

    // If neither Origin nor Referer is present, deny
    return false
}

/**
 * Adds security headers to the response
 * @param response - The response to add headers to
 * @returns Response with security headers
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    return response
}

/**
 * Creates a 403 Forbidden response for unauthorized admin API access
 * @returns NextResponse with 403 status
 */
export function createForbiddenResponse(): NextResponse {
    return NextResponse.json(
        { error: 'Forbidden: Invalid origin' },
        { status: 403 }
    )
}

/**
 * Checks if a domain is allowed to access admin APIs
 * @param domain - The domain to check
 * @returns true if domain is allowed
 */
export function isAllowedDomain(domain: string): boolean {
    const allowedOrigin = process.env.NEXT_PUBLIC_SITE_URL

    if (!allowedOrigin) {
        return false
    }

    try {
        const allowedUrl = new URL(allowedOrigin)
        return domain === allowedUrl.hostname
    } catch {
        return false
    }
}
