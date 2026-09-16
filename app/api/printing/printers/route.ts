import { cookies } from 'next/headers'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return Response.json(
                { error: 'No token found' },
                { status: 401 }
            )
        }

        const response = await fetch(`${API_BASE_URL}/api/printing/printers`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            return Response.json(
                { error: errorData.message || 'Error al obtener impresoras' },
                { status: response.status }
            )
        }

        const data = await response.json()
        return Response.json(data)
    } catch (error) {
        console.error('Error en GET /api/printing/printers:', error)
        return Response.json(
            { error: 'Error al conectar con el servidor' },
            { status: 500 }
        )
    }
}
