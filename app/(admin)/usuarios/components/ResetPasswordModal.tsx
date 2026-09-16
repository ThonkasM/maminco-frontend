'use client'
import React, { useState } from 'react'

interface ResetPasswordModalProps {
    isOpen: boolean
    userName: string
    onSubmit: (newPassword: string) => Promise<void>
    onCancel: () => void
}

export default function ResetPasswordModal({
    isOpen,
    userName,
    onSubmit,
    onCancel,
}: ResetPasswordModalProps) {
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!password || password.length < 8) {
            setError('Mínimo 8 caracteres')
            return
        }

        setSubmitting(true)
        try {
            await onSubmit(password)
            setPassword('')
            onCancel()
        } finally {
            setSubmitting(false)
        }
    }

    const handleCancel = () => {
        setPassword('')
        setError('')
        onCancel()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Resetear contraseña</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">{userName}</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Nueva contraseña
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value)
                                if (error) setError('')
                            }}
                            className={`w-full px-4 py-2 rounded-lg border ${
                                error ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                            } dark:bg-slate-700 dark:text-white focus:outline-none focus:border-blue-500`}
                            placeholder="Mínimo 8 caracteres"
                            autoFocus
                        />
                        {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={submitting}
                            className="flex-1 px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-all disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 disabled:bg-slate-400 transition-all"
                        >
                            {submitting ? 'Reseteando...' : 'Resetear'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
