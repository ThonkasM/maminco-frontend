const LABELS: Record<string, string> = {
    CASH: 'Efectivo',
    TRANSFER: 'Transferencia',
    CARD: 'Tarjeta',
}

/** Spanish label for a payment method; custom methods keep the name they were created with. */
export function paymentMethodLabel(code: string, name: string): string {
    return LABELS[code] ?? name
}
