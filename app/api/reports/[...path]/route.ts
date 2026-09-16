import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'http://localhost:3000'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const pathParams = await params
        const pathSegments = pathParams.path || []
        const path = pathSegments.join('/')

        // Obtener query params
        const searchParams = request.nextUrl.searchParams
        const queryString = searchParams.toString()

        // Construir URL al backend
        const backendUrl = `${BACKEND_URL}/api/reports/${path}${queryString ? `?${queryString}` : ''}`

        // Obtener el token del header de autorización
        const authHeader = request.headers.get('authorization')

        // Hacer la petición al backend
        const backendResponse = await fetch(backendUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(authHeader && { Authorization: authHeader }),
            },
        })

        // Si el backend devuelve un error, pasarlo tal cual
        if (!backendResponse.ok) {
            return NextResponse.json(
                { error: `Backend returned ${backendResponse.status}` },
                { status: backendResponse.status }
            )
        }

        const data = await backendResponse.json()

        // Devolver la respuesta del backend
        return NextResponse.json(data)
    } catch (error) {
        console.error('Proxy error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch from backend' },
            { status: 500 }
        )
    }
}
