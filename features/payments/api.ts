import { apiFetch } from '@/lib/http/client'

const BASE = '/api/admin/payments'

export interface PaymentMethodDto {
    id: string
    name: string
    code: string
    description?: string
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

export interface CreatePaymentMethodDto {
    name: string
    code: string
    description?: string
    isActive?: boolean
}

export interface UpdatePaymentMethodDto {
    name?: string
    code?: string
    description?: string
    isActive?: boolean
}

export interface CashDenominationDto {
    id: string
    value: number
    type: string
    quantity: number
    total: number
    isActive: boolean
}

export interface UpdateCashDenominationDto {
    quantity: number
}

export interface DailySalesStatsDto {
    totalSales: number
    cashPayments: number
    transferPayments: number
    cardPayments: number
    transactionCount: number
}

export function listPaymentMethods(
    includeInactive?: boolean,
    signal?: AbortSignal,
): Promise<PaymentMethodDto[]> {
    return apiFetch(`${BASE}/methods`, {
        query: { includeInactive },
        signal,
    })
}

export function getPaymentMethod(
    id: string,
    signal?: AbortSignal,
): Promise<PaymentMethodDto> {
    return apiFetch(`${BASE}/methods/${id}`, { signal })
}

export function createPaymentMethod(
    dto: CreatePaymentMethodDto,
): Promise<PaymentMethodDto> {
    return apiFetch(`${BASE}/methods`, { method: 'POST', body: dto })
}

export function updatePaymentMethod(
    id: string,
    dto: UpdatePaymentMethodDto,
): Promise<PaymentMethodDto> {
    return apiFetch(`${BASE}/methods/${id}`, { method: 'PATCH', body: dto })
}

export function togglePaymentMethodActive(
    id: string,
    isActive: boolean,
): Promise<PaymentMethodDto> {
    return apiFetch(`${BASE}/methods/${id}/toggle`, {
        method: 'PATCH',
        body: { isActive },
    })
}

export function deletePaymentMethod(id: string): Promise<void> {
    return apiFetch(`${BASE}/methods/${id}`, { method: 'DELETE' })
}

export function listCashDenominations(
    includeInactive?: boolean,
    signal?: AbortSignal,
): Promise<CashDenominationDto[]> {
    return apiFetch(`${BASE}/cash-denominations`, {
        query: { includeInactive },
        signal,
    })
}

export function getCashDenomination(
    id: string,
    signal?: AbortSignal,
): Promise<CashDenominationDto> {
    return apiFetch(`${BASE}/cash-denominations/${id}`, { signal })
}

export function updateCashDenomination(
    id: string,
    dto: UpdateCashDenominationDto,
): Promise<CashDenominationDto> {
    return apiFetch(`${BASE}/cash-denominations/${id}`, {
        method: 'PATCH',
        body: dto,
    })
}

export function incrementCashDenomination(
    id: string,
    amount: number,
): Promise<CashDenominationDto> {
    return apiFetch(`${BASE}/cash-denominations/${id}/increment`, {
        method: 'PATCH',
        body: { amount },
    })
}

export function decrementCashDenomination(
    id: string,
    amount: number,
): Promise<CashDenominationDto> {
    return apiFetch(`${BASE}/cash-denominations/${id}/decrement`, {
        method: 'PATCH',
        body: { amount },
    })
}

export function toggleCashDenominationActive(
    id: string,
    isActive: boolean,
): Promise<CashDenominationDto> {
    return apiFetch(`${BASE}/cash-denominations/${id}/toggle`, {
        method: 'PATCH',
        body: { isActive },
    })
}

export function createCashDenomination(
    value: number,
    type: 'COIN' | 'BILL',
): Promise<CashDenominationDto> {
    return apiFetch(`${BASE}/cash-denominations`, {
        method: 'POST',
        body: { value, type },
    })
}

export function deleteCashDenomination(id: string): Promise<void> {
    return apiFetch(`${BASE}/cash-denominations/${id}`, { method: 'DELETE' })
}

export function getCashSummary(signal?: AbortSignal): Promise<unknown> {
    return apiFetch(`${BASE}/cash-summary`, { signal })
}

export function getCashTotal(signal?: AbortSignal): Promise<{ total: number }> {
    return apiFetch(`${BASE}/cash-total`, { signal })
}

export function resetCashDenominations(): Promise<{ message: string }> {
    return apiFetch(`${BASE}/cash-reset`, { method: 'PATCH' })
}

export function getDailySalesStats(
    signal?: AbortSignal,
): Promise<DailySalesStatsDto> {
    return apiFetch(`${BASE}/daily-sales`, { signal })
}
