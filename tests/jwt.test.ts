import { describe, expect, it } from 'vitest'
import { makeToken } from './helpers'
import { decodeJwt, isTokenExpired, roleFromClaims } from '@/lib/auth/jwt'

describe('decodeJwt', () => {
    it('decodes the payload', () => {
        expect(decodeJwt(makeToken({ sub: '1', role: 'MANAGER' }))).toMatchObject({
            sub: '1',
            role: 'MANAGER',
        })
    })

    it('handles unicode claims', () => {
        expect(decodeJwt(makeToken({ name: 'José Ñandú' }))?.name).toBe('José Ñandú')
    })

    it('returns null for malformed tokens', () => {
        expect(decodeJwt('garbage')).toBeNull()
        expect(decodeJwt('a.%%%.c')).toBeNull()
        expect(decodeJwt('')).toBeNull()
    })
})

describe('isTokenExpired', () => {
    it('detects expiry against a given clock', () => {
        expect(isTokenExpired({ exp: 100 }, 101_000)).toBe(true)
        expect(isTokenExpired({ exp: 100 }, 99_000)).toBe(false)
    })
    it('treats null as expired and missing exp as valid', () => {
        expect(isTokenExpired(null)).toBe(true)
        expect(isTokenExpired({})).toBe(false)
    })
})

describe('roleFromClaims', () => {
    it('returns only valid roles', () => {
        expect(roleFromClaims({ role: 'COOK' })).toBe('COOK')
        expect(roleFromClaims({ role: 'HACKER' })).toBeNull()
        expect(roleFromClaims(null)).toBeNull()
    })
})
