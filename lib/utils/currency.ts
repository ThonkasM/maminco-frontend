import { parseMoney, type Money } from './money'


export const CURRENCY_CONFIG = {
    symbol: 'Bs. ',
    code: 'BOB',
    locale: 'es-BO',
    decimals: 2,
} as const

export const formatCurrency = (
    amount: Money,
    showDecimals: boolean = true,
): string => {
    const value = parseMoney(amount)
    const formatter = new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
        style: 'decimal',
        minimumFractionDigits: showDecimals ? CURRENCY_CONFIG.decimals : 0,
        maximumFractionDigits: CURRENCY_CONFIG.decimals,
    })

    const formatted = formatter.format(Math.max(0, value))
    return `${CURRENCY_CONFIG.symbol}${formatted}`
}

export const fmt = formatCurrency
