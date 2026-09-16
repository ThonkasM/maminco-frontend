/**
 * Configuración global de moneda para Bolivia
 * Utilizando Bolivianos (Bs.) como moneda oficial
 */

export const CURRENCY_CONFIG = {
    // Símbolo de la moneda
    symbol: 'Bs. ',
    // Código ISO de la moneda
    code: 'BOB',
    // Locale para formato de números
    locale: 'es-BO',
    // Número de decimales a mostrar
    decimals: 2,
} as const

/**
 * Formatea un número como moneda en Bolivianos
 * @param amount - Cantidad a formatear
 * @param showDecimals - Si mostrar decimales (default: true)
 * @returns String formateado con símbolo Bs.
 * @example
 * formatCurrency(1000) // "Bs. 1.000,00"
 * formatCurrency(500.5) // "Bs. 500,50"
 */
export const formatCurrency = (amount: number, showDecimals: boolean = true): string => {
    const formatter = new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
        style: 'decimal',
        minimumFractionDigits: showDecimals ? CURRENCY_CONFIG.decimals : 0,
        maximumFractionDigits: CURRENCY_CONFIG.decimals,
    })

    const formatted = formatter.format(Math.max(0, amount))
    return `${CURRENCY_CONFIG.symbol}${formatted}`
}

/**
 * Alias corto para formatCurrency
 */
export const fmt = formatCurrency
