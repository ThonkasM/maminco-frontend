import { NextRequest, NextResponse } from 'next/server'

const ADMIN_PREFIXES = [
    '/dashboard',
    '/areas',
    '/categorias',
    '/productos',
    '/mesas',
    '/ordenes',
    '/pagos',
    '/usuarios',
]

const NEGOCIO_PREFIXES = ['/mesas-negocio', '/ordenes-negocio']

function isProtected(pathname: string): boolean {
    return [...ADMIN_PREFIXES, ...NEGOCIO_PREFIXES].some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
}

export function middleware(request: NextRequest) {
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
        '/categorias/:path*',
        '/productos/:path*',
        '/mesas/:path*',
        '/ordenes/:path*',
        '/pagos/:path*',
        '/usuarios/:path*',
        '/mesas-negocio/:path*',
        '/ordenes-negocio/:path*',
    ],
}
