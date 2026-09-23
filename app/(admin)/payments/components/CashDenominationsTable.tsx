'use client'
import React from 'react'
import { AlertCircle, Trash2 } from 'lucide-react'
import { CashDenominationDto } from '@/lib/api/admin/payments'

interface CashDenominationsTableProps {
    denominations: CashDenominationDto[]
    loading: boolean
    error: string | null
    onDelete: (id: string) => Promise<void>
    onDeleteConfirmChange: (id: string | null) => void
    deleteConfirmId: string | null
}

export default function CashDenominationsTable({
    denominations,
    loading,
    error,
    onDelete,
    onDeleteConfirmChange,
    deleteConfirmId,
}: CashDenominationsTableProps) {
    const coins = denominations.filter((d) => d.type === 'COIN').sort((a, b) => Number(a.value) - Number(b.value))
    const bills = denominations.filter((d) => d.type === 'BILL').sort((a, b) => Number(a.value) - Number(b.value))

    const renderGroup = (title: string, items: CashDenominationDto[]) => (
        <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
            {items.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No hay {title.toLowerCase()}</p>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {items.map((denom) => (
                        <div
                            key={denom.id}
                            className="relative p-4 bg-linear-to-br from-gray-50 to-white dark:from-slate-700 dark:to-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg group"
                        >
                            {/* Contenido */}
                            <div className="flex flex-col items-center justify-center">
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">Bs. {denom.value}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">
                                    {denom.type === 'COIN' ? 'Moneda' : 'Billete'}
                                </p>
                            </div>

                            {/* Botón de eliminar */}
                            <button
                                onClick={() =>
                                    deleteConfirmId === denom.id ? onDelete(denom.id) : onDeleteConfirmChange(denom.id)
                                }
                                className={`absolute top-2 right-2 p-1.5 rounded transition-all ${
                                    deleteConfirmId === denom.id
                                        ? 'bg-red-600 text-white'
                                        : 'bg-transparent text-gray-400 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100'
                                }`}
                                title={deleteConfirmId === denom.id ? 'Confirmar eliminación' : 'Eliminar'}
                            >
                                <Trash2 size={16} />
                            </button>

                            {/* Confirmación */}
                            {deleteConfirmId === denom.id && (
                                <div className="absolute inset-0 bg-red-600/90 rounded-lg flex items-center justify-center p-2">
                                    <div className="text-center">
                                        <p className="text-xs font-bold text-white mb-2">¿Eliminar?</p>
                                        <button
                                            onClick={() => onDeleteConfirmChange(null)}
                                            className="text-xs bg-red-700 hover:bg-red-800 text-white px-2 py-1 rounded"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Encabezado */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Denominaciones de Cash</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Gestiona las monedas y billetes disponibles en caja
                </p>
            </div>

            {/* Mensajes de error */}
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                    <AlertCircle className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" size={20} />
                    <div>
                        <h3 className="font-semibold text-red-900 dark:text-red-200">Error</h3>
                        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    </div>
                </div>
            )}

            {/* Contenido */}
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                {loading ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <div className="inline-block">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                        <p className="mt-2">Cargando denominaciones...</p>
                    </div>
                ) : denominations.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <p>No hay denominaciones. Crea una para comenzar.</p>
                    </div>
                ) : (
                    <>
                        {renderGroup('💰 Monedas', coins)}
                        {renderGroup('💵 Billetes', bills)}
                    </>
                )}
            </div>

            {/* Info box */}
            {denominations.length > 0 && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>💡 Nota:</strong> Las denominaciones que agregues aquí aparecerán en el panel de caja
                        para facilitar el conteo de cash.
                    </p>
                </div>
            )}
        </div>
    )
}
