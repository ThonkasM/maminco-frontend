import { PaymentsPage } from '@/features/payments/components/PaymentsPage'

export const metadata = {
    title: 'Gestión de pagos | POS Maminco',
    description: 'Administra los métodos de pago y el efectivo en caja',
}

export default function PaymentsRoute() {
    return <PaymentsPage />
}
