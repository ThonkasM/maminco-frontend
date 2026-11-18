import { describe, expect, it } from 'vitest'
import { changesLabel, groupHistoryByUser, groupOfAction } from '@/features/audit/lib'

const user = (id: string, name: string) => ({ id, name, email: `${id}@x.test` })

describe('audit helpers', () => {
    it('groups history by person with counts per action', () => {
        const result = groupHistoryByUser([
            { action: 'ITEM_ADDED', createdAt: '2026-11-17T10:00:00Z', user: user('a', 'Ana') },
            { action: 'ITEM_ADDED', createdAt: '2026-11-17T10:02:00Z', user: user('a', 'Ana') },
            { action: 'ITEM_REMOVED', createdAt: '2026-11-17T10:05:00Z', user: user('b', 'Beto') },
            { action: 'DISCOUNT_APPLIED', createdAt: '2026-11-17T10:09:00Z', user: user('a', 'Ana') },
        ])
        expect(result[0]).toMatchObject({ name: 'Ana', total: 3, firstAt: '2026-11-17T10:00:00Z', lastAt: '2026-11-17T10:09:00Z' })
        expect(result[0].byAction[0]).toMatchObject({ action: 'ITEM_ADDED', count: 2, label: 'Agregó productos' })
        expect(result[1]).toMatchObject({ name: 'Beto', total: 1 })
    })

    it('maps actions to filter groups', () => {
        expect(groupOfAction('PAYMENT')).toBe('payments')
        expect(groupOfAction('TIP_ADDED')).toBe('money')
        expect(groupOfAction('X')).toBeNull()
    })

    it('pluralizes the change count', () => {
        expect(changesLabel(1)).toBe('1 cambio')
        expect(changesLabel(5)).toBe('5 cambios')
    })
})
