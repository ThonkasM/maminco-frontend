import type { QueryClient } from '@tanstack/react-query'

/** Lets non-React code (the upload queue) invalidate queries once the app has a client. */
export const queryClientRef: { current: QueryClient | null } = { current: null }
