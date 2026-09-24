import { NextRequest, NextResponse } from 'next/server'

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
    '/settings',
]

const POS_PREFIXES = ['/pos/tables', '/pos/orders']

function isProtected(pathname: string): boolean {
    return [...ADMIN_PREFIXES, ...POS_PREFIXES].some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
}

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    if (!isProtected(pathname)) {
        return NextResponse.next()
    }

    const token = request.cookies.get('token')?.value
    if (token) {
        return NextResponse.next()
    }

    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
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
        '/settings/:path*',
        '/pos/tables/:path*',
        '/pos/orders/:path*',
    ],
}
