/**
 * Money helpers.
 *
 * Convention (see `docs/MONEY.md`):
 * - The database stores money as `Decimal(10,2)`; the backend computes with
 *   `Prisma.Decimal` and never uses binary floats for persisted totals.
 * - The API transports money as numbers (2 decimals) for products/orders.
 * - The client treats money as an opaque decimal: parse it for display only
 *   and never accumulate floats into values that get persisted.
 */

export type Money = number | string | null | undefined

/** Parses a money value (number, or Decimal serialized as string) safely. */
export function parseMoney(value: Money): number {
    const numeric = typeof value === 'string' ? Number(value) : value
    return typeof numeric === 'number' && Number.isFinite(numeric) ? numeric : 0
}

/** Rounds to 2 decimals (half-up), for ephemeral client-side previews. */
export function roundMoney(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100
}
