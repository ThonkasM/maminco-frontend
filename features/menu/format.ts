export function formatMenuPrice(value: number): string {
    return `Bs. ${value.toLocaleString('es-BO', { minimumFractionDigits: Number.isInteger(value) ? 0 : 2, maximumFractionDigits: 2 })}`
}
