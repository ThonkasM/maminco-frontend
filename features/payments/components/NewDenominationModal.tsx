'use client'
import { useEffect, useState } from 'react'
import { Banknote, Coins } from 'lucide-react'
import {
    Button,
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    FormField,
    Input,
} from '@/components/ui'

interface NewDenominationModalProps {
    isOpen: boolean
    onSubmit: (value: string, type: 'COIN' | 'BILL') => Promise<void>
    onClose: () => void
    isLoading?: boolean
}

export function NewDenominationModal({
    isOpen,
    onSubmit,
    onClose,
    isLoading,
}: NewDenominationModalProps) {
    const [value, setValue] = useState('')
    const [type, setType] = useState<'COIN' | 'BILL'>('COIN')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!isOpen) return
        setValue('')
        setType('COIN')
    }, [isOpen])

    const isValid = Boolean(value.trim()) && value !== '0'

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        if (!isValid) return

        setSubmitting(true)
        try {
            await onSubmit(value, type)
            onClose()
        } finally {
            setSubmitting(false)
        }
    }

    const loading = submitting || isLoading

    return (
        <Dialog open={isOpen} onOpenChange={(next) => !next && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Nueva denominación</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <span className="text-sm font-medium text-foreground">
                            Tipo
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                type="button"
                                variant={
                                    type === 'COIN' ? 'primary' : 'secondary'
                                }
                                onClick={() => setType('COIN')}
                                disabled={loading}
                            >
                                <Coins />
                                Moneda
                            </Button>
                            <Button
                                type="button"
                                variant={
                                    type === 'BILL' ? 'primary' : 'secondary'
                                }
                                onClick={() => setType('BILL')}
                                disabled={loading}
                            >
                                <Banknote />
                                Billete
                            </Button>
                        </div>
                    </div>

                    <FormField
                        label="Valor (Bs.)"
                        description='Ingresa solo el número, sin "Bs."'
                    >
                        <Input
                            type="number"
                            min="1"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            disabled={loading}
                            placeholder={
                                type === 'COIN'
                                    ? 'Ej: 1, 5, 10'
                                    : 'Ej: 50, 100, 200'
                            }
                        />
                    </FormField>

                    {isValid && (
                        <div className="rounded-lg bg-surface-muted p-3 text-center">
                            <p className="text-sm text-muted-foreground">
                                Vista previa
                            </p>
                            <p className="text-2xl font-bold text-foreground">
                                Bs. {value}
                            </p>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={!isValid || loading}
                        >
                            {submitting ? 'Creando...' : 'Crear'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
