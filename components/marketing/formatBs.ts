/**
 * Formato manual (sin Intl) para que el HTML del servidor y el del cliente
 * coincidan y no haya errores de hidratación en la landing.
 */
export function formatBs(value: number) {
  const [int, dec] = value.toFixed(2).split('.')
  return `Bs. ${int.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${dec}`
}
