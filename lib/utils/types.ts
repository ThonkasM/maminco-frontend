export type UserRole = 'ADMINISTRATOR' | 'MANAGER' | 'CASHIER' | 'WAITER'

export interface User {
    id: string
    email: string
    name: string
    role: UserRole
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export interface LoginResponse {
    accessToken: string
    user: User
}
