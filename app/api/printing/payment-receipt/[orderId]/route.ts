import { cookies } from 'next/headers'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
    try {
        const { orderId } = await params
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return Response.json(
                { error: 'No token found' },
                { status: 401 }
            )
        }

        // Obtener lista de impresoras disponibles
        const printersResponse = await fetch(`${API_BASE_URL}/api/printing/printers`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        })

        let printerName: string | undefined = undefined

        if (printersResponse.ok) {
            const printersData = await printersResponse.json()
            // Usar la impresora por defecto, o la primera disponible
            printerName = printersData.defaultPrinter || printersData.printers?.[0]
        }

        // Construir URL con parámetro de impresora si está disponible
        let url = `${API_BASE_URL}/api/printing/orders/${orderId}/payment-receipt`
        if (printerName) {
            url += `?printer=${encodeURIComponent(printerName)}`
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            return Response.json(
                { error: errorData.message || 'Error al imprimir recibo' },
                { status: response.status }
            )
        }

        const data = await response.json()
        return Response.json(data)
    } catch (error) {
        console.error('Error en POST /api/printing/payment-receipt/[orderId]:', error)
        return Response.json(
            { error: 'Error al conectar con el servidor' },
            { status: 500 }
        )
    }
}
