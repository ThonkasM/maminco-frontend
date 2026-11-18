export function formatBs(value: number) {
  const [int, dec] = value.toFixed(2).split('.')
  return `Bs. ${int.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${dec}`
}
