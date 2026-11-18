const MINUTE = 60_000

export const STALE_TIME = {
    live: 5_000,
    list: 30_000,
    catalog: 5 * MINUTE,
    reference: 10 * MINUTE,
} as const
