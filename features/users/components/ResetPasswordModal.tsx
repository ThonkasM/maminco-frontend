'use client'
import { useEffect, useState } from 'react'
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    FormField,
    Input,
} from '@/components/ui'

interface ResetPasswordModalProps {
    isOpen: boolean
    userName: string
    onSubmit: (newPassword: string) => Promise<void>
    onCancel: () => void
    isLoading?: boolean
}

export function ResetPasswordModal({
    isOpen,
    userName,
    onSubmit,
    onCancel,
    isLoading,
}: ResetPasswordModalProps) {
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!isOpen) return
        setPassword('')
        setError('')
    }, [isOpen])

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setError('')

        if (!password || password.length < 8) {
            setError('Mínimo 8 caracteres')
            return
        }

        setSubmitting(true)
        try {
            await onSubmit(password)
            onCancel()
        } finally {
            setSubmitting(false)
        }
    }

    const loading = submitting || isLoading

    return (
        <Dialog open={isOpen} onOpenChange={(next) => !next && onCancel()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Restablecer contraseña</DialogTitle>
                    <DialogDescription>{userName}</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormField
                        label="Nueva contraseña"
                        required
                        error={error}
                    >
                        <Input
                            type="password"
                            value={password}
                            placeholder="Mínimo 8 caracteres"
                            autoFocus
                            onChange={(e) => {
                                setPassword(e.target.value)
                                if (error) setError('')
                            }}
                        />
                    </FormField>

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            className="flex-1"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={loading}
                        >
                            {submitting ? 'Restableciendo...' : 'Restablecer'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
