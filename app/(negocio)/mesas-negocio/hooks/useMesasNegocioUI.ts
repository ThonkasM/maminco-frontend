import { useState } from 'react'

interface UseMesasNegocioUIReturn {
    // Estado
    selectedAreaId: string
    isLoading: boolean

    // Handlers
    handleSelectArea: (areaId: string) => void
    setIsLoading: (loading: boolean) => void

    // Setters para comunicación con componente padre
    setSelectedAreaId: (areaId: string) => void
}

/**
 * Hook que gestiona TODO el estado UI de la página de mesas-negocio
 * Responsabilidades:
 * - Selección de área (área actual)
 * - Estado de carga de la página
 * - Handlers de interacción con botones de área
 */
export function useMesasNegocioUI(): UseMesasNegocioUIReturn {
    const [selectedAreaId, setSelectedAreaId] = useState<string>('')
    const [isLoading, setIsLoading] = useState(true)

    const handleSelectArea = (areaId: string) => {
        setSelectedAreaId(areaId)
    }

    return {
        selectedAreaId,
        isLoading,
        handleSelectArea,
        setIsLoading,
        setSelectedAreaId,
    }
}
