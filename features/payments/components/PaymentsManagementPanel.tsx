'use client'
import React, { useState } from 'react'
import { CreditCard, Banknote } from 'lucide-react'
import { usePaymentMethods } from '../hooks/usePaymentMethods'
import { useCashDenominations } from '../hooks/useCashDenominations'
import PaymentMethodsTable from './PaymentMethodsTable'
import CashDenominationsTable from './CashDenominationsTable'
import NewDenominationModal from './NewDenominationModal'

type TabType = 'methods' | 'cash'

export default function PaymentsManagementPanel() {
    const [activeTab, setActiveTab] = useState<TabType>('methods')
    const [showNewDenomModal, setShowNewDenomModal] = useState(false)
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

    const { methods, loading: methodsLoading, error: methodsError, handleToggle } = usePaymentMethods()
    const { denominations, loading: denomLoading, error: denomError, createDenomination, deleteDenomination } =
        useCashDenominations()

    const tabs = [
        {
            id: 'methods' as TabType,
            label: 'Métodos de Pago',
            icon: CreditCard,
            description: 'Gestionar métodos de pago disponibles',
        },
        {
            id: 'cash' as TabType,
            label: 'Denominaciones de Efectivo',
            icon: Banknote,
            description: 'Gestionar dinero en caja',
        },
    ]

    const handleAddDenomination = async (value: string, type: 'COIN' | 'BILL') => {
        const success = await createDenomination(value, type)
        if (success) {
            setShowNewDenomModal(false)
        }
    }

    const handleDeleteDenomination = async (id: string) => {
        const success = await deleteDenomination(id)
        if (success) {
            setDeleteConfirmId(null)
        }
    }

    return (
        <div className="space-y-6">
            {/* Encabezado */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Payments</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Administra los métodos de payment y el cash en caja</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200 dark:border-slate-700">
                {tabs.map((tab) => {
                    const IconComponent = tab.icon
                    const isActive = activeTab === tab.id

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
                                isActive
                                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            <IconComponent size={20} />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-slate-800 rounded-lg">
                {activeTab === 'methods' && (
                    <div className="p-6">
                        <PaymentMethodsTable
                            methods={methods}
                            loading={methodsLoading}
                            error={methodsError}
                            onToggle={handleToggle}
                        />
                    </div>
                )}

                {activeTab === 'cash' && (
                    <div className="p-6">
                        {/* Botón para agregar */}
                        <div className="mb-6">
                            <button
                                onClick={() => setShowNewDenomModal(true)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                            >
                                <span>+</span> Nueva Denominación
                            </button>
                        </div>

                        <CashDenominationsTable
                            denominations={denominations}
                            loading={denomLoading}
                            error={denomError}
                            onDelete={handleDeleteDenomination}
                            onDeleteConfirmChange={setDeleteConfirmId}
                            deleteConfirmId={deleteConfirmId}
                        />
                    </div>
                )}
            </div>

            {/* New Denomination Modal */}
            <NewDenominationModal
                isOpen={showNewDenomModal}
                onSubmit={handleAddDenomination}
                onClose={() => setShowNewDenomModal(false)}
            />
        </div>
    )
}
