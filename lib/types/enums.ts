export const USER_ROLES = ['ADMINISTRATOR', 'MANAGER', 'CASHIER', 'WAITER', 'COOK'] as const
export type UserRole = (typeof USER_ROLES)[number]

export const ORDER_STATUSES = ['DRAFT', 'CLOSED', 'CANCELLED'] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const TABLE_STATUSES = ['AVAILABLE', 'OCCUPIED', 'RESERVED'] as const
export type TableStatus = (typeof TABLE_STATUSES)[number]

export const KITCHEN_STATUSES = ['PENDING', 'PREPARING', 'READY'] as const
export type OrderKitchenStatus = (typeof KITCHEN_STATUSES)[number]

export const PAYMENT_METHOD_CODES = ['CASH', 'TRANSFER', 'CARD'] as const
export type PaymentMethodCode = (typeof PAYMENT_METHOD_CODES)[number]

export const ADMIN_ROLES: readonly UserRole[] = ['ADMINISTRATOR', 'MANAGER', 'CASHIER', 'WAITER']
export const POS_ROLES: readonly UserRole[] = ['ADMINISTRATOR', 'MANAGER', 'CASHIER', 'WAITER']
export const KITCHEN_ROLES: readonly UserRole[] = ['COOK', 'MANAGER', 'ADMINISTRATOR']

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && (USER_ROLES as readonly string[]).includes(value)
}
