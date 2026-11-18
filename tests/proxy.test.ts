import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'
import { proxy } from '@/proxy'
import { makeToken } from './helpers'

const future = () => Math.floor(Date.now() / 1000) + 3600

function run(path: string, token?: string) {
    const headers = token ? { cookie: `token=${token}` } : undefined
    return proxy(new NextRequest(`http://localhost:3001${path}`, { headers }))
}

function location(res: Response): URL | null {
    const loc = res.headers.get('location')
    return loc ? new URL(loc) : null
}

describe('proxy', () => {
    it('lets public routes through', () => {
        expect(location(run('/'))).toBeNull()
        expect(location(run('/auth/login'))).toBeNull()
    })

    it('redirects to login without a token', () => {
        const loc = location(run('/dashboard'))!
        expect(loc.pathname).toBe('/auth/login')
        expect(loc.searchParams.get('from')).toBe('/dashboard')
        expect(loc.searchParams.has('expired')).toBe(false)
    })

    it('redirects expired or malformed tokens with expired=1', () => {
        const expired = makeToken({ role: 'MANAGER', exp: 1 })
        expect(location(run('/products', expired))!.searchParams.get('expired')).toBe('1')
        expect(location(run('/products', 'junk'))!.searchParams.get('expired')).toBe('1')
    })

    it('allows managers into admin and POS', () => {
        const token = makeToken({ role: 'MANAGER', exp: future() })
        expect(location(run('/orders/12', token))).toBeNull()
        expect(location(run('/pos/tables', token))).toBeNull()
    })

    it('keeps the audit page for managers and administrators', () => {
        const manager = makeToken({ role: 'MANAGER', exp: future() })
        const waiter = makeToken({ role: 'WAITER', exp: future() })
        expect(location(run('/audit', manager))).toBeNull()
        expect(location(run('/audit', waiter))!.pathname).not.toBe('/audit')
    })

    it('sends cooks to the kitchen and allows them there', () => {
        const token = makeToken({ role: 'COOK', exp: future() })
        expect(location(run('/dashboard', token))!.pathname).toBe('/kitchen')
        expect(location(run('/kitchen', token))).toBeNull()
    })

    it('blocks waiters from the kitchen', () => {
        const token = makeToken({ role: 'WAITER', exp: future() })
        expect(location(run('/kitchen', token))!.pathname).toBe('/unauthorized')
    })

    it('sends unknown roles to /unauthorized', () => {
        const token = makeToken({ role: 'ROOT', exp: future() })
        expect(location(run('/users', token))!.pathname).toBe('/unauthorized')
    })

    it('does not match prefix lookalikes', () => {
        expect(location(run('/dashboardx'))).toBeNull()
    })
})
