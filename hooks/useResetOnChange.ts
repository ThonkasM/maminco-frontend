import { useState } from 'react'

/**
 * Runs `reset` during render when `value` changes to a value accepted by
 * `when` (truthy by default). Use it instead of an effect to reset local state
 * when a modal opens or its subject changes.
 */
export function useResetOnChange<T>(
    value: T,
    reset: () => void,
    when: (next: T) => boolean = Boolean,
) {
    const [previous, setPrevious] = useState(value)
    if (value !== previous) {
        setPrevious(value)
        if (when(value)) reset()
    }
}
