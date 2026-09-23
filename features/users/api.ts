import { apiFetch } from '@/lib/http/client'

export type UserRole = 'ADMINISTRATOR' | 'MANAGER' | 'CASHIER' | 'WAITER'

export interface CreateUserPayload {
    email: string
    name: string
    password: string
    role: UserRole
}

export interface UpdateUserPayload {
    email?: string
    name?: string
    role?: UserRole
    isActive?: boolean
}

export interface UserResponse {
    id: string
    email: string
    name: string
    role: string
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export interface PaginatedUsersResponse {
    data: UserResponse[]
    total: number
    page: number
    limit: number
    totalPages: number
}

export function getUsers(
    page = 1,
    limit = 10,
    search?: string,
    signal?: AbortSignal,
): Promise<PaginatedUsersResponse> {
    return apiFetch('/api/users', {
        query: { page, limit, search },
        signal,
    })
}

export function getUserById(
    id: string,
    signal?: AbortSignal,
): Promise<UserResponse> {
    return apiFetch(`/api/users/${id}`, { signal })
}

export function createUser(payload: CreateUserPayload): Promise<UserResponse> {
    return apiFetch('/api/users', { method: 'POST', body: payload })
}

export function updateUser(
    id: string,
    payload: UpdateUserPayload,
): Promise<UserResponse> {
    return apiFetch(`/api/users/${id}`, { method: 'PATCH', body: payload })
}

export function deleteUser(id: string): Promise<UserResponse> {
    return apiFetch(`/api/users/${id}`, { method: 'DELETE' })
}

export function resetUserPassword(
    id: string,
    newPassword: string,
): Promise<{ message: string }> {
    return apiFetch(`/api/users/${id}/reset-password`, {
        method: 'POST',
        body: { newPassword },
    })
}
