import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
    ADMIN_ROLES,
    KITCHEN_ROLES,
    KITCHEN_STATUSES,
    ORDER_STATUSES,
    POS_ROLES,
    TABLE_STATUSES,
    USER_ROLES,
    isUserRole,
} from '@/lib/types/enums'
import { STALE_TIME } from '@/lib/query/staleTimes'

// contratos.md lives in the workspace folder, outside this repository: the check is skipped where it is absent (e.g. CI).
const contractPath = resolve(__dirname, '../../contratos.md')
const contract = existsSync(contractPath) ? readFileSync(contractPath, 'utf8') : ''

function contractEnum(name: string): string[] {
    const line = contract.split('\n').find((l) => l.trim().startsWith(`${name} `))
    if (!line) throw new Error(`enum ${name} not found in contratos.md`)
    return line.split('=')[1].split('|').map((v) => v.trim())
}

describe.skipIf(contract === '')('enums vs contratos.md', () => {
    it('UserRole matches', () => {
        expect([...USER_ROLES]).toEqual(contractEnum('UserRole'))
    })
    it('OrderStatus matches', () => {
        expect([...ORDER_STATUSES]).toEqual(contractEnum('OrderStatus'))
    })
    it('OrderKitchenStatus matches', () => {
        expect([...KITCHEN_STATUSES]).toEqual(contractEnum('OrderKitchenStatus'))
    })
    it('TableStatus matches', () => {
        expect([...TABLE_STATUSES]).toEqual(contractEnum('TableStatus'))
    })
})

describe('role groups', () => {
    it('only contain valid roles', () => {
        for (const group of [ADMIN_ROLES, POS_ROLES, KITCHEN_ROLES]) {
            for (const role of group) expect(USER_ROLES).toContain(role)
        }
    })
    it('COOK is kitchen-only', () => {
        expect(KITCHEN_ROLES).toContain('COOK')
        expect(ADMIN_ROLES).not.toContain('COOK')
        expect(POS_ROLES).not.toContain('COOK')
    })
})

describe('isUserRole', () => {
    it('accepts known roles and rejects the rest', () => {
        expect(isUserRole('WAITER')).toBe(true)
        expect(isUserRole('waiter')).toBe(false)
        expect(isUserRole(undefined)).toBe(false)
        expect(isUserRole(3)).toBe(false)
    })
})

describe('STALE_TIME', () => {
    it('grows from live to reference', () => {
        expect(STALE_TIME.live).toBeLessThan(STALE_TIME.list)
        expect(STALE_TIME.list).toBeLessThan(STALE_TIME.catalog)
        expect(STALE_TIME.catalog).toBeLessThan(STALE_TIME.reference)
        expect(STALE_TIME.reference).toBe(600_000)
    })
})
