import React from 'react'
import PaymentsManagementPanel from './components/PaymentsManagementPanel'

export const metadata = {
    title: 'Gestión de Pagos | POS Maminco',
    description: 'Administra los métodos de pago y el efectivo en caja',
}

export default function PayosPage() {
    return (
        <div className="space-y-6 p-8">
            <PaymentsManagementPanel />
        </div>
    )
}
