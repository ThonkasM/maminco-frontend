'use client'

import React, { useState } from 'react'
import { toast } from '@/components/ToastProvider'

interface PrinterInfo {
    printers: string[]
    defaultPrinter: string | null
    count: number
}

export function PrintingTest() {
    const [loading, setLoading] = useState(false)
    const [printerInfo, setPrinterInfo] = useState<PrinterInfo | null>(null)
    const [selectedPrinter, setSelectedPrinter] = useState<string>('')
    const [showPrinterInfo, setShowPrinterInfo] = useState(false)
    const [error, setError] = useState<string | null>(null)

    /**
     * Obtener lista de impresoras disponibles
     */
    const handleGetPrinters = async () => {
        try {
            setLoading(true)
            setError(null)
            
            const response = await fetch('/api/printing/printers', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
                throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
            }

            const data = await response.json()
            setPrinterInfo(data)
            setShowPrinterInfo(true)

            // Auto-seleccionar impresora por defecto
            if (data.defaultPrinter) {
                setSelectedPrinter(data.defaultPrinter)
            } else if (data.printers.length > 0) {
                setSelectedPrinter(data.printers[0])
            }

            toast.success(`Se encontraron ${data.count} impresora(s)`)
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
            setError(errorMessage)
            toast.error(`Error: ${errorMessage}`)
        } finally {
            setLoading(false)
        }
    }

    /**
     * Enviar prueba de impresión
     */
    const handlePrintTest = async () => {
        try {
            setLoading(true)
            setError(null)

            const body: Record<string, string> = {}
            if (selectedPrinter) {
                body.printerName = selectedPrinter
            }

            const response = await fetch('/api/printing/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
                throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
            }

            const data = await response.json()

            if (data.success) {
                toast.success(data.message)
            } else {
                const errorMsg = data.message || 'Error desconocido en la impresión'
                setError(errorMsg)
                toast.error(errorMsg)
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
            setError(errorMessage)
            toast.error(`Error: ${errorMessage}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">🖨️ Prueba de Impresión</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Verifica que tu impresora térmica esté funcionando correctamente</p>
            </div>

            <div className="space-y-4">
                {/* Mensaje de error */}
                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-800 dark:text-red-200">⚠️ {error}</p>
                    </div>
                )}

                {/* Botón para obtener impresoras */}
                <button
                    onClick={handleGetPrinters}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-all"
                >
                    {loading ? 'Cargando...' : 'Detectar Impresoras'}
                </button>

                {/* Información de impresoras */}
                {showPrinterInfo && printerInfo && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg space-y-3">
                        <div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-1">Impresoras Detectadas: {printerInfo.count}</p>
                            {printerInfo.printers.length > 0 ? (
                                <div className="space-y-2">
                                    {printerInfo.printers.map((printer) => (
                                        <label key={printer} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="printer"
                                                value={printer}
                                                checked={selectedPrinter === printer}
                                                onChange={(e) => setSelectedPrinter(e.target.value)}
                                                className="w-4 h-4"
                                            />
                                            <span className="text-sm text-slate-900 dark:text-white">
                                                {printer}
                                                {printer === printerInfo.defaultPrinter && (
                                                    <span className="text-xs text-green-600 dark:text-green-400 ml-2">(Por defecto)</span>
                                                )}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-red-600 dark:text-red-400">No se encontraron impresoras</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Botón para imprimir prueba */}
                {showPrinterInfo && printerInfo && printerInfo.printers.length > 0 && (
                    <button
                        onClick={handlePrintTest}
                        disabled={loading || !selectedPrinter}
                        className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium transition-all"
                    >
                        {loading ? 'Imprimiendo...' : '✓ Imprimir Prueba'}
                    </button>
                )}

                {/* Información de ayuda */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-600">
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-2">💡 Ayuda:</p>
                    <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                        <li>Asegúrate que tu impresora térmica esté encendida</li>
                        <li>Verifica que el driver esté correctamente instalado</li>
                        <li>Usa papel térmico de 80mm de ancho</li>
                        <li>Si no se detecta, reinicia la impresora</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
