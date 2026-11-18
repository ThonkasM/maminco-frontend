// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { API_BASE, ApiError, apiFetch, getAuthToken } from '@/lib/http/client'

function mockResponse(body: unknown, init: { status?: number; statusText?: string } = {}) {
    const status = init.status ?? 200
    const text = body === undefined ? '' : typeof body === 'string' ? body : JSON.stringify(body)
    return {
        status,
        ok: status >= 200 && status < 300,
        statusText: init.statusText ?? '',
        text: () => Promise.resolve(text),
    } as Response
}

const fetchMock = vi.fn()

beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
    window.localStorage.clear()
})

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('apiFetch', () => {
    it('prefixes the API base and parses JSON', async () => {
        fetchMock.mockResolvedValue(mockResponse({ ok: true }))
        const data = await apiFetch<{ ok: boolean }>('/products')
        expect(data).toEqual({ ok: true })
        const [url] = fetchMock.mock.calls[0]
        expect(url).toBe(new URL('/products', API_BASE).toString())
    })

    it('builds the query string and omits empty values', async () => {
        fetchMock.mockResolvedValue(mockResponse([]))
        await apiFetch('/orders', {
            query: { page: 2, active: false, q: '', a: undefined, b: null },
        })
        const url = new URL(fetchMock.mock.calls[0][0])
        expect(url.searchParams.get('page')).toBe('2')
        expect(url.searchParams.get('active')).toBe('false')
        expect(url.searchParams.has('q')).toBe(false)
        expect(url.searchParams.has('a')).toBe(false)
        expect(url.searchParams.has('b')).toBe(false)
    })

    it('serializes the JSON body', async () => {
        fetchMock.mockResolvedValue(mockResponse({}))
        await apiFetch('/tables', { method: 'POST', body: { name: 'T1' } })
        const init = fetchMock.mock.calls[0][1]
        expect(init.method).toBe('POST')
        expect(init.body).toBe('{"name":"T1"}')
    })

    it('sends the bearer token from localStorage', async () => {
        window.localStorage.setItem('maminco-auth', JSON.stringify({ state: { token: 'abc' } }))
        fetchMock.mockResolvedValue(mockResponse({}))
        await apiFetch('/me')
        expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer abc')
    })

    it('omits the token when auth is false or missing', async () => {
        window.localStorage.setItem('maminco-auth', JSON.stringify({ state: { token: 'abc' } }))
        fetchMock.mockResolvedValue(mockResponse({}))
        await apiFetch('/auth/login', { auth: false })
        expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined()
    })

    it('maps error responses to ApiError with the backend message', async () => {
        fetchMock.mockResolvedValue(mockResponse({ message: 'Mesa ocupada' }, { status: 409 }))
        const err = (await apiFetch('/x').catch((e) => e)) as ApiError
        expect(err).toBeInstanceOf(ApiError)
        expect(err.status).toBe(409)
        expect(err.message).toBe('Mesa ocupada')
        expect(err.body).toEqual({ message: 'Mesa ocupada' })
    })

    it('falls back to statusText then a default message', async () => {
        fetchMock.mockResolvedValueOnce(mockResponse('', { status: 500, statusText: 'Server Error' }))
        await expect(apiFetch('/x')).rejects.toMatchObject({ message: 'Server Error', status: 500 })
        fetchMock.mockResolvedValueOnce(mockResponse(undefined, { status: 500 }))
        await expect(apiFetch('/x')).rejects.toMatchObject({ message: 'Error de red' })
    })

    it('returns raw text when the body is not JSON', async () => {
        fetchMock.mockResolvedValue(mockResponse('plain'))
        expect(await apiFetch('/x')).toBe('plain')
    })

    it('clears the session on 401 and throws', async () => {
        window.localStorage.setItem('maminco-auth', JSON.stringify({ state: { token: 'abc' } }))
        fetchMock.mockResolvedValue(mockResponse({}, { status: 401 }))
        await expect(apiFetch('/x')).rejects.toMatchObject({ status: 401, message: 'Sesión expirada' })
        expect(window.localStorage.getItem('maminco-auth')).toBeNull()
    })
})

describe('getAuthToken', () => {
    it('returns null for missing or corrupt storage', () => {
        expect(getAuthToken()).toBeNull()
        window.localStorage.setItem('maminco-auth', '{not json')
        expect(getAuthToken()).toBeNull()
    })
})

describe('ApiError', () => {
    it('carries name, status and body', () => {
        const err = new ApiError('m', 400, { a: 1 })
        expect(err).toBeInstanceOf(Error)
        expect(err.name).toBe('ApiError')
        expect(err.status).toBe(400)
        expect(err.body).toEqual({ a: 1 })
    })
})
