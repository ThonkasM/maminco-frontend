import { NextRequest, NextResponse } from 'next/server'
import { decodeJwt, isTokenExpired, roleFromClaims } from '@/lib/auth/jwt'
import {
    ADMIN_ROLES,
    KITCHEN_ROLES,
    POS_ROLES,
    type UserRole,
} from '@/lib/types/enums'

const ADMIN_PREFIXES = [
    '/dashboard',
    '/areas',
    '/categories',
    '/products',
    '/tables',
    '/orders',
    '/payments',
    '/users',
    '/reports',
    '/ai',
    '/features',
    '/settings',
    '/communication',
    '/repository',
]

const AUDIT_PREFIXES = ['/audit']
const AUDIT_ROLES: readonly UserRole[] = ['ADMINISTRATOR', 'MANAGER']

const POS_PREFIXES = ['/pos/tables', '/pos/orders']

const KITCHEN_PREFIXES = ['/kitchen']

function matches(pathname: string, prefixes: string[]): boolean {
    return prefixes.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
}

function allowedRolesFor(pathname: string): readonly UserRole[] | null {
    if (matches(pathname, AUDIT_PREFIXES)) return AUDIT_ROLES
    if (matches(pathname, ADMIN_PREFIXES)) return ADMIN_ROLES
    if (matches(pathname, POS_PREFIXES)) return POS_ROLES
    if (matches(pathname, KITCHEN_PREFIXES)) return KITCHEN_ROLES
    return null
}

function redirectToLogin(request: NextRequest, pathname: string, expired: boolean) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    if (expired) loginUrl.searchParams.set('expired', '1')
    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete('token')
    return response
}

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl
    const allowed = allowedRolesFor(pathname)

    if (!allowed) {
        return NextResponse.next()
    }

    const token = request.cookies.get('token')?.value
    if (!token) {
        return redirectToLogin(request, pathname, false)
    }

    const claims = decodeJwt(token)
    if (!claims || isTokenExpired(claims)) {
        return redirectToLogin(request, pathname, true)
    }

    const role = roleFromClaims(claims)
    if (!role || !allowed.includes(role)) {
        const fallback = role === 'COOK' ? '/kitchen' : '/unauthorized'
        if (pathname === fallback || pathname.startsWith(`${fallback}/`)) {
            return NextResponse.next()
        }
        return NextResponse.redirect(new URL(fallback, request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/areas/:path*',
        '/categories/:path*',
        '/products/:path*',
        '/tables/:path*',
        '/orders/:path*',
        '/payments/:path*',
        '/users/:path*',
        '/reports/:path*',
        '/ai/:path*',
        '/features/:path*',
        '/settings/:path*',
        '/pos/tables/:path*',
        '/pos/orders/:path*',
        '/kitchen/:path*',
    ],
}
