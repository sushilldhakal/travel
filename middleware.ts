import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware for Route Protection
 * Handles authentication and authorization for dashboard routes
 * Note: Using simple token validation without jwt-decode to work in Edge runtime
 */

/**
 * Simple JWT validation without external dependencies
 * Checks if token exists and has valid structure
 */
function isValidToken(token: string): boolean {
    if (!token) return false;

    // Basic JWT structure check (header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    try {
        // Decode payload to check expiration
        const payload = JSON.parse(atob(parts[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
            return false;
        }
        return true;
    } catch {
        return false;
    }
}

/**
 * Check if user has dashboard access based on role
 * Allowed roles: admin, seller, guide, agency, transport, hotel
 */
function hasDashboardAccess(token: string): boolean {
    try {
        const parts = token.split('.');
        const payload = JSON.parse(atob(parts[1]));
        const role = payload.role || payload.roles || '';

        // Handle comma-separated roles
        const roles = role.includes(',')
            ? role.split(',').map((r: string) => r.trim().toLowerCase())
            : [role.toLowerCase()];

        const allowedRoles = ['admin', 'seller', 'guide', 'agency', 'transport', 'hotel'];
        return roles.some((r: string) => allowedRoles.includes(r));
    } catch {
        return false;
    }
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('token')?.value;

    // Check if accessing dashboard routes
    const isDashboard = pathname.startsWith('/dashboard');

    // Check if accessing auth routes
    const isAuthPage =
        pathname.startsWith('/auth/login') ||
        pathname.startsWith('/auth/signup') ||
        pathname.startsWith('/auth/register');

    // Protect dashboard routes
    if (isDashboard) {
        // No token - redirect to login
        if (!token) {
            const loginUrl = new URL('/auth/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Invalid token - clear and redirect to login
        if (!isValidToken(token)) {
            const response = NextResponse.redirect(new URL('/auth/login', request.url));
            response.cookies.delete('token');
            response.cookies.delete('refreshToken');
            return response;
        }

        // Check if user has dashboard access (admin, seller, guide, agency, transport, hotel)
        if (!hasDashboardAccess(token)) {
            // User doesn't have permission - redirect to home with error
            const homeUrl = new URL('/', request.url);
            homeUrl.searchParams.set('error', 'unauthorized');
            return NextResponse.redirect(homeUrl);
        }

        // Token is valid and user has access - allow
        return NextResponse.next();
    }

    // Redirect authenticated users away from auth pages
    if (isAuthPage && token && isValidToken(token)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Allow all other routes
    return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
    matcher: ['/dashboard/:path*', '/auth/login', '/auth/signup', '/auth/register'],
};
