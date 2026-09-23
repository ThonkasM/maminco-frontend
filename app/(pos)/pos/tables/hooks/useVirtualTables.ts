import { getTables } from '@/lib/api/admin/tables'

const VIRTUAL_TABLE_IDS = {
    DELIVERY: 'virtual-delivery',
    RECOGER: 'virtual-recoger',
}

/**
 * Obtiene o usa el ID virtual de la "mesa" para Delivery/Recoger
 * Para Delivery y Recoger, el backend requiere un tableId válido
 * Usamos IDs virtuales que funcionan como contenedores de órdenes
 */
export async function getOrCreateVirtualTableId(serviceType: 'DELIVERY' | 'RECOGER'): Promise<string> {
    try {
        const virtualTableId = VIRTUAL_TABLE_IDS[serviceType]

        // Intentar obtener todas las mesas
        const tablesResponse = await getTables(1, 1000)
        const existingTable = tablesResponse.data.find(t => t.id === virtualTableId)

        if (existingTable) {
            return virtualTableId
        }

        // Si no existe, retornar el ID virtual de todas formas
        // El backend debería crearlo automáticamente o manejarlo
        console.warn(`⚠️ Mesa virtual ${serviceType} no encontrada. Usando ID virtual.`)
        return virtualTableId
    } catch (err) {
        console.error(`Error obteniendo mesa virtual para ${serviceType}:`, err)
        // Fallback: usar el ID virtual de todas formas
        return VIRTUAL_TABLE_IDS[serviceType]
    }
}

export { VIRTUAL_TABLE_IDS }
