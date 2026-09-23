'use client'
import { useState } from 'react'
import { Banknote, CreditCard, Plus } from 'lucide-react'
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui'
import type { CashDenominationDto } from '../api'
import { usePaymentMethods } from '../hooks/usePaymentMethods'
import { useCashDenominations } from '../hooks/useCashDenominations'
import { PaymentMethodsTable } from './PaymentMethodsTable'
import { CashDenominationsTable } from './CashDenominationsTable'
import { NewDenominationModal } from './NewDenominationModal'

type TabType = 'methods' | 'cash'

const TABS = [
    {
        id: 'methods' as TabType,
        label: 'Métodos de pago',
        icon: CreditCard,
    },
    {
        id: 'cash' as TabType,
        label: 'Denominaciones de efectivo',
        icon: Banknote,
    },
]

export function PaymentsPage() {
    const [activeTab, setActiveTab] = useState<TabType>('methods')
    const [showNewDenominationModal, setShowNewDenominationModal] =
        useState(false)
    const [deleteTarget, setDeleteTarget] =
        useState<CashDenominationDto | null>(null)
    const [deleting, setDeleting] = useState(false)

    const {
        methods,
        loading: methodsLoading,
        error: methodsError,
        handleToggle,
    } = usePaymentMethods()

    const {
        denominations,
        loading: denominationsLoading,
        error: denominationsError,
        createDenomination,
        deleteDenomination,
    } = useCashDenominations()

    const handleAddDenomination = async (
        value: string,
        type: 'COIN' | 'BILL',
    ) => {
        await createDenomination(value, type)
    }

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return
        setDeleting(true)
        try {
            await deleteDenomination(deleteTarget.id)
            setDeleteTarget(null)
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                    Gestión de pagos
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Administra los métodos de pago y el efectivo en caja
                </p>
            </div>

            <div className="flex gap-4 border-b border-border">
                {TABS.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                                isActive
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Icon className="size-4" />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {activeTab === 'methods' && (
                <PaymentMethodsTable
                    methods={methods}
                    loading={methodsLoading}
                    error={methodsError}
                    onToggle={handleToggle}
                />
            )}

            {activeTab === 'cash' && (
                <div className="space-y-6">
                    <Button onClick={() => setShowNewDenominationModal(true)}>
                        <Plus />
                        Nueva denominación
                    </Button>

                    <CashDenominationsTable
                        denominations={denominations}
                        loading={denominationsLoading}
                        error={denominationsError}
                        onDelete={setDeleteTarget}
                    />
                </div>
            )}

            <NewDenominationModal
                isOpen={showNewDenominationModal}
                onSubmit={handleAddDenomination}
                onClose={() => setShowNewDenominationModal(false)}
            />

            <Dialog
                open={Boolean(deleteTarget)}
                onOpenChange={(next) => !next && setDeleteTarget(null)}
            >
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Eliminar denominación</DialogTitle>
                        <DialogDescription>
                            ¿Seguro que deseas eliminar la denominación de{' '}
                            <strong className="text-foreground">
                                Bs. {deleteTarget?.value}
                            </strong>
                            ? Esta acción no puede revertirse.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="secondary"
                            onClick={() => setDeleteTarget(null)}
                            disabled={deleting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleConfirmDelete}
                            disabled={deleting}
                        >
                            {deleting ? 'Eliminando...' : 'Eliminar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
