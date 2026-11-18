import { describe, expect, it } from 'vitest'
import { parseMoney, roundMoney } from '@/lib/utils/money'
import { formatCurrency, fmt, CURRENCY_CONFIG } from '@/lib/utils/currency'

describe('parseMoney', () => {
    it('passes finite numbers through', () => {
        expect(parseMoney(12.5)).toBe(12.5)
        expect(parseMoney(0)).toBe(0)
    })

    it('parses Prisma Decimal serialized strings', () => {
        expect(parseMoney('10.50')).toBe(10.5)
        expect(parseMoney('1234.00')).toBe(1234)
    })

    it('returns 0 for invalid input', () => {
        expect(parseMoney(null)).toBe(0)
        expect(parseMoney(undefined)).toBe(0)
        expect(parseMoney('abc')).toBe(0)
        expect(parseMoney(NaN)).toBe(0)
        expect(parseMoney(Infinity)).toBe(0)
    })
})

describe('roundMoney', () => {
    it('rounds half-up to 2 decimals', () => {
        expect(roundMoney(1.005)).toBe(1.01)
        expect(roundMoney(2.675)).toBe(2.68)
        expect(roundMoney(10)).toBe(10)
    })

    it('avoids float drift on sums', () => {
        expect(roundMoney(0.1 + 0.2)).toBe(0.3)
    })
})

describe('formatCurrency', () => {
    it('uses the Bs. prefix with 2 decimals', () => {
        const out = formatCurrency(500.5)
        expect(out.startsWith(CURRENCY_CONFIG.symbol)).toBe(true)
        expect(out).toMatch(/500[.,]50$/)
    })

    it('can hide decimals', () => {
        expect(formatCurrency(500, false)).toBe('Bs. 500')
    })

    it('accepts Decimal strings and nullish values', () => {
        expect(formatCurrency('7.25')).toMatch(/7[.,]25$/)
        expect(formatCurrency(null)).toMatch(/0[.,]00$/)
    })

    it('clamps negatives to zero', () => {
        expect(formatCurrency(-5)).toMatch(/0[.,]00$/)
    })

    it('fmt is an alias', () => {
        expect(fmt).toBe(formatCurrency)
    })
})
