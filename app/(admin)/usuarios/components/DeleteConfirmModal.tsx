'use client'
import React from 'react'

interface DeleteConfirmModalProps {
    isOpen: boolean
    userName: string
    onConfirm: () => Promise<void>
    onCancel: () => void
}

export default function DeleteConfirmModal({
    isOpen,
    userName,
    onConfirm,
    onCancel,
}: DeleteConfirmModalProps) {
    const [confirming, setConfirming] = React.useState(false)

    const handleConfirm = async () => {
        setConfirming(true)
        try {
            await onConfirm()
            onCancel()
        } finally {
            setConfirming(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg max-w-sm w-full p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Confirmar desactivación</h3>
                <p className="text-slate-700 dark:text-slate-300 mb-6">
                    ¿Está seguro de que desea desactivar a <span className="font-semibold">{userName}</span>? Esta acción puede
                    revertirse.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={confirming}
                        className="flex-1 px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-all disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={confirming}
                        className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:bg-slate-400 transition-all"
                    >
                        {confirming ? 'Eliminando...' : 'Desactivar'}
                    </button>
                </div>
            </div>
        </div>
    )
}
