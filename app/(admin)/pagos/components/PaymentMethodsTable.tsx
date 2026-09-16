'use client'
import React from 'react'
import { AlertCircle, Banknote } from 'lucide-react'
import { PaymentMethodDto } from '@/lib/api/admin/payments'

interface PaymentMethodsTableProps {
    methods: PaymentMethodDto[]
    loading: boolean
    error: string | null
    onToggle: (id: string, currentStatus: boolean) => Promise<void>
}

export default function PaymentMethodsTable({ methods, loading, error, onToggle }: PaymentMethodsTableProps) {
    return (
        <div className="space-y-6">
            {/* Encabezado */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Métodos de Pago</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Gestionar métodos de pago disponibles. Estos fueron creados en el seed inicial.
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

            {/* Lista de métodos */}
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <div className="inline-block">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                        <p className="mt-2">Cargando métodos de pago...</p>
                    </div>
                ) : methods.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <p>No hay métodos de pago disponibles. Ejecuta el seed para crearlos.</p>
                    </div>
                ) : (
                    <div className="space-y-0">
                        {methods.map((method, index) => {
                            const isEffectivo = method.code === 'CASH'

                            return (
                                <div
                                    key={method.id}
                                    className={`p-6 flex items-center justify-between ${
                                        index !== methods.length - 1 ? 'border-b border-gray-200 dark:border-slate-700' : ''
                                    }`}
                                >
                                    {/* Información del método */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            {isEffectivo && (
                                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                                    <Banknote className="text-green-600 dark:text-green-400" size={24} />
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {method.name}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <code className="text-sm bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded text-gray-900 dark:text-white">
                                                        {method.code}
                                                    </code>
                                                    {method.description && (
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">{method.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Estado y acciones */}
                                    <div className="flex items-center gap-4 ml-4">
                                        <button
                                            onClick={() => onToggle(method.id, method.isActive)}
                                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                                method.isActive
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                                                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50'
                                            }`}
                                        >
                                            {method.isActive ? '✓ Activo' : '✗ Inactivo'}
                                        </button>

                                        {/* Badge adicional para efectivo */}
                                        {isEffectivo && (
                                            <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm font-medium">
                                                💰 Configurable
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Info box */}
            {methods.length > 0 && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>💡 Nota:</strong> Los métodos de pago se crean en el seed inicial. Aquí solo puedes
                        activarlos o desactivarlos. Para EFECTIVO, ve a la sección de "Denominaciones de Efectivo"
                        para configurar monedas y billetes.
                    </p>
                </div>
            )}
        </div>
    )
}
