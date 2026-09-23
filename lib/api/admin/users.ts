import { API_BASE, getHeaders } from '../../http/client'

export interface CreateUserPayload {
    email: string
    name: string
    password: string
    role: 'ADMINISTRATOR' | 'MANAGER' | 'CASHIER' | 'WAITER'
}

export interface UpdateUserPayload {
    email?: string
    name?: string
    role?: 'ADMINISTRATOR' | 'MANAGER' | 'CASHIER' | 'WAITER'
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

export async function getUsers(page = 1, limit = 10, search?: string): Promise<PaginatedUsersResponse> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (search) params.append('search', search)

    const res = await fetch(`${API_BASE}/api/users?${params}`, {
        method: 'GET',
        headers: getHeaders(),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(err.message || 'Error fetching users')
    }

    return res.json()
}

export async function getUserById(id: string): Promise<UserResponse> {
    const res = await fetch(`${API_BASE}/api/users/${id}`, {
        method: 'GET',
        headers: getHeaders(),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(err.message || 'Error fetching user')
    }

    return res.json()
}

export async function createUser(payload: CreateUserPayload): Promise<UserResponse> {
    const res = await fetch(`${API_BASE}/api/users`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(err.message || 'Error creating user')
    }

    return res.json()
}

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<UserResponse> {
    const res = await fetch(`${API_BASE}/api/users/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(err.message || 'Error updating user')
    }

    return res.json()
}

export async function deleteUser(id: string): Promise<UserResponse> {
    const res = await fetch(`${API_BASE}/api/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(err.message || 'Error deleting user')
    }

    return res.json()
}

export async function resetUserPassword(id: string, newPassword: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/api/users/${id}/reset-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ newPassword }),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(err.message || 'Error resetting password')
    }

    return res.json()
}
