'use client'

import React, { useState, useCallback } from 'react'
import { createPortal } from 'react-dom'

interface ConfirmDialogProps {
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    confirmButtonClass?: string
    onConfirm: () => void | Promise<void>
    onCancel?: () => void
}

export function useConfirmDialog() {
    const [isOpen, setIsOpen] = useState(false)
    const [config, setConfig] = useState<ConfirmDialogProps | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const showConfirmation = useCallback(
        (dialogConfig: Omit<ConfirmDialogProps, 'onConfirm'> & { onConfirm?: () => void | Promise<void> }) => {
            return new Promise<boolean>((resolve) => {
                setConfig({
                    ...dialogConfig,
                    onConfirm: async () => {
                        setIsLoading(true)
                        try {
                            if (dialogConfig.onConfirm) {
                                await dialogConfig.onConfirm()
                            }
                        } finally {
                            setIsLoading(false)
                        }
                        setIsOpen(false)
                        resolve(true)
                    },
                    onCancel: () => {
                        dialogConfig.onCancel?.()
                        setIsOpen(false)
                        resolve(false)
                    },
                } as ConfirmDialogProps)
                setIsOpen(true)
            })
        },
        []
    )

    const ConfirmDialogComponent = isOpen && config ? (
        <ConfirmDialogContent
            {...config}
            isLoading={isLoading}
            onConfirm={config.onConfirm}
            onCancel={config.onCancel}
        />
    ) : null

    return { showConfirmation, ConfirmDialogComponent }
}

function ConfirmDialogContent({
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    confirmButtonClass = 'bg-red-600 hover:bg-red-700',
    onConfirm,
    onCancel,
    isLoading,
}: ConfirmDialogProps & { isLoading: boolean }) {
    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-all duration-300">
            {/* Modal */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-sm w-full mx-4 overflow-hidden transform transition-all duration-300 scale-100 animate-fadeIn">
                {/* Header con icono y título */}
                <div className="bg-linear-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 px-6 py-4 flex items-center gap-3">
                    <div className="text-2xl">⚠️</div>
                    <h2 className="text-lg font-bold text-white">{title}</h2>
                </div>

                {/* Contenido del mensaje */}
                <div className="px-6 py-4">
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Botones de acciones */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700 border-t border-slate-200 dark:border-slate-600 flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-900 dark:text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 px-4 py-2 ${confirmButtonClass} text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                    >
                        {isLoading && (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        )}
                        {confirmText}
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>,
        document.body
    )
}
