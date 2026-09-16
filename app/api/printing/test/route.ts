import { cookies } from 'next/headers'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value
        const body = await request.json()

        if (!token) {
            return Response.json(
                { error: 'No token found' },
                { status: 401 }
            )
        }

        const response = await fetch(`${API_BASE_URL}/api/printing/test`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            return Response.json(
                { error: errorData.message || 'Error al enviar prueba de impresión' },
                { status: response.status }
            )
        }

        const data = await response.json()
        return Response.json(data)
    } catch (error) {
        console.error('Error en POST /api/printing/test:', error)
        return Response.json(
            { error: 'Error al conectar con el servidor' },
            { status: 500 }
        )
    }
}
