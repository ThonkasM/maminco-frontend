import {
    base64ToBytes,
    describeUsbError,
    getAuthorizedPrinter,
    printerLabel,
    sendToPrinter,
} from '@/lib/printing/webusb'
import {
    fetchOrderTicket,
    fetchPaymentReceiptTicket,
    fetchTestTicket,
    printOrder,
    printPaymentReceipt,
    type PrintResult,
} from './api'

type TicketFetcher = () => Promise<PrintResult & { data?: string }>

async function printWithBrowser(fetchTicket: TicketFetcher): Promise<PrintResult | null> {
    let device
    try {
        device = await getAuthorizedPrinter()
    } catch {
        return null
    }
    if (!device) return null

    const ticket = await fetchTicket()
    if (!ticket.success || !ticket.data) {
        return { success: false, message: ticket.message || 'No se pudo generar el ticket' }
    }

    try {
        await sendToPrinter(device, base64ToBytes(ticket.data))
    } catch (error) {
        return { success: false, message: `No se pudo imprimir: ${describeUsbError(error)}` }
    }
    return { success: true, message: `${ticket.message} · ${printerLabel(device)}` }
}

export async function printOrderTicket(orderId: string): Promise<PrintResult> {
    return (await printWithBrowser(() => fetchOrderTicket(orderId))) ?? printOrder(orderId)
}

export async function printReceiptTicket(orderId: string): Promise<PrintResult> {
    return (await printWithBrowser(() => fetchPaymentReceiptTicket(orderId))) ?? printPaymentReceipt(orderId)
}

export async function printTestTicket(): Promise<PrintResult> {
    const result = await printWithBrowser(fetchTestTicket)
    if (result) return result
    return {
        success: false,
        message: 'No hay una impresora conectada en este navegador. Pulsa "Conectar impresora".',
    }
}
